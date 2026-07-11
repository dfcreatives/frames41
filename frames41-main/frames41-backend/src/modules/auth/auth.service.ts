import { hash, verify } from 'argon2';
import { randomBytes, createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { JWT_CONFIG, EMAIL_VERIFICATION_CONFIG } from '../../config/constants.js';
import {
  BadRequestError,
  UnauthorizedError,
  RateLimitError,
  ConflictError,
} from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import {
  sendEmail,
  renderVerificationEmailHtml,
} from '../../infrastructure/external/resend.client.js';
import type { IAuthRepository, IAuthService } from './auth.types.js';
import type { TokenPair } from '../../shared/types/index.js';

/**
 * Generate a cryptographically-secure 6-digit code
 */
function generateCode(): string {
  const buffer = randomBytes(4);
  const num = buffer.readUInt32BE(0);
  return String(num % 1000000).padStart(6, '0');
}

/**
 * Hash a verification code with argon2id
 */
async function hashCode(code: string): Promise<string> {
  return hash(code, {
    type: 2,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Hash a refresh token for storage (sha256 — short, fast, deterministic)
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a token family id for rotation
 */
function generateTokenFamily(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Auth service implementation — email + password with email-code verification
 */
export class AuthService implements IAuthService {
  private readonly repository: IAuthRepository;

  constructor(repository: IAuthRepository) {
    this.repository = repository;
  }

  /**
   * Signup: create an unverified user and email a 6-digit verification code.
   * Rate-limits per IP and per email.
   */
  async signup(
    email: string,
    password: string,
    name: string | undefined,
    ipAddress: string,
  ): Promise<{ expiresIn: number }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Refuse if a VERIFIED user already exists — that's a real account
    const existing = await this.repository.findUserByEmail(normalizedEmail);
    if (existing && existing.isVerified) {
      throw new ConflictError('An account with this email already exists');
    }

    await this.checkRateLimits(normalizedEmail, ipAddress);

    const passwordHash = await hash(password, {
      type: 2,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    if (!existing) {
      // Fresh signup — create the unverified user
      await this.repository.createUser(normalizedEmail, passwordHash, name);
      logger.info({ email: normalizedEmail }, 'New unverified user created');
    } else {
      // Re-signup of an UNVERIFIED user — update their password + re-issue code
      // (covers aborted signups and lost-code scenarios without UX breakage)
      await this.repository.updateUserPassword(existing.id, passwordHash);
      if (name) await this.repository.updateUserName(existing.id, name);
      logger.info({ email: normalizedEmail }, 'Unverified user re-signed up');
    }

    await this.issueVerificationCode(normalizedEmail, ipAddress);

    return { expiresIn: EMAIL_VERIFICATION_CONFIG.EXPIRY_MINUTES * 60 };
  }

  /**
   * Resend the 6-digit verification code for an unverified user.
   */
  async resendVerification(
    email: string,
    ipAddress: string,
  ): Promise<{ expiresIn: number }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.repository.findUserByEmail(normalizedEmail);
    if (!user) {
      // Don't reveal whether the email exists — return success regardless
      return { expiresIn: EMAIL_VERIFICATION_CONFIG.EXPIRY_MINUTES * 60 };
    }
    if (user.isVerified) {
      throw new BadRequestError('Email is already verified — please log in');
    }

    await this.checkRateLimits(normalizedEmail, ipAddress);
    await this.issueVerificationCode(normalizedEmail, ipAddress);

    return { expiresIn: EMAIL_VERIFICATION_CONFIG.EXPIRY_MINUTES * 60 };
  }

  /**
   * Verify the emailed code; marks user verified and returns a token pair.
   */
  async verifyEmail(
    email: string,
    code: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair & { isNewUser: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.repository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestError('Invalid or expired verification code');
    }
    if (user.isVerified) {
      throw new BadRequestError('Email is already verified — please log in');
    }

    const attempt = await this.repository.findValidVerificationToken(normalizedEmail);

    if (!attempt) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    if (attempt.verifyAttempts >= EMAIL_VERIFICATION_CONFIG.MAX_VERIFY_ATTEMPTS) {
      await this.repository.markVerificationConsumed(attempt.id);
      throw new BadRequestError('Too many verification attempts, request a new code');
    }

    await this.repository.incrementVerifyAttempts(attempt.id);

    const isValid = await verify(attempt.codeHash, code);
    if (!isValid) {
      throw new BadRequestError('Invalid verification code');
    }

    await this.repository.markVerificationConsumed(attempt.id);
    await this.repository.setUserVerified(user.id);
    await this.repository.updateLastLogin(user.id);

    const tokens = await this.generateTokenPair(
      user.id,
      user.role,
      deviceInfo,
      ipAddress,
    );

    logger.info({ userId: user.id }, 'User verified and authenticated');
    return { ...tokens, isNewUser: true };
  }

  /**
   * Login with email + password.
   */
  async login(
    email: string,
    password: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.repository.findUserByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    await this.repository.updateLastLogin(user.id);

    const tokens = await this.generateTokenPair(
      user.id,
      user.role,
      deviceInfo,
      ipAddress,
    );

    logger.info({ userId: user.id }, 'User logged in');
    return tokens;
  }

  /**
   * Refresh access token using refresh token with rotation + reuse detection.
   */
  async refreshToken(
    refreshToken: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair> {
    const tokenHash = hashToken(refreshToken);

    const storedToken = await this.repository.findRefreshToken(tokenHash);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      await this.repository.revokeTokenFamily(storedToken.family);
      logger.warn(
        { userId: storedToken.userId, family: storedToken.family },
        'Token reuse detected, revoked entire family',
      );
      throw new UnauthorizedError('Token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.repository.revokeRefreshToken(tokenHash);
      throw new UnauthorizedError('Refresh token expired');
    }

    await this.repository.revokeRefreshToken(tokenHash);

    const tokens = await this.generateTokenPair(
      storedToken.userId,
      'USER',
      deviceInfo,
      ipAddress,
      storedToken.family,
    );

    logger.info({ userId: storedToken.userId }, 'Token refreshed');
    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.repository.revokeRefreshToken(tokenHash);
    logger.info('User logged out');
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repository.revokeAllUserTokens(userId);
    logger.info({ userId }, 'User logged out from all devices');
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('User not found');
    }

    const valid = await verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await hash(newPassword, {
      type: 2,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.repository.updateUserPassword(userId, passwordHash);
    logger.info({ userId }, 'Password changed successfully');
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Enforce IP + email rate limits for verification-code issuance.
   */
  private async checkRateLimits(email: string, ipAddress: string): Promise<void> {
    const ipWindowStart = new Date(
      Date.now() - EMAIL_VERIFICATION_CONFIG.IP_WINDOW_MINUTES * 60 * 1000,
    );
    const ipAttempts = await this.repository.countVerificationTokensByIp(
      ipAddress,
      ipWindowStart,
    );

    if (ipAttempts >= EMAIL_VERIFICATION_CONFIG.MAX_ATTEMPTS_PER_IP_PER_WINDOW) {
      logger.warn({ email, ipAddress }, 'Verification rate limit exceeded for IP');
      throw new RateLimitError(
        Math.ceil(EMAIL_VERIFICATION_CONFIG.IP_WINDOW_MINUTES * 60),
      );
    }

    const emailWindowStart = new Date(
      Date.now() - EMAIL_VERIFICATION_CONFIG.EMAIL_WINDOW_HOURS * 60 * 60 * 1000,
    );
    const emailAttempts = await this.repository.countVerificationTokensByEmail(
      email,
      emailWindowStart,
    );

    if (emailAttempts >= EMAIL_VERIFICATION_CONFIG.MAX_ATTEMPTS_PER_EMAIL_PER_DAY) {
      logger.warn({ email }, 'Verification rate limit exceeded for email');
      throw new RateLimitError(
        Math.ceil(EMAIL_VERIFICATION_CONFIG.EMAIL_WINDOW_HOURS * 60 * 60),
      );
    }
  }

  /**
   * Generate, store and email a 6-digit verification code.
   */
  private async issueVerificationCode(
    email: string,
    ipAddress: string,
  ): Promise<void> {
    const code = generateCode();
    const codeHash = await hashCode(code);

    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + EMAIL_VERIFICATION_CONFIG.EXPIRY_MINUTES,
    );

    await this.repository.createVerificationToken(email, codeHash, ipAddress, expiresAt);

    if (env.NODE_ENV === 'development') {
      logger.info({ email, code }, 'Verification code generated (dev mode)');
    }

    // Attempt to send via Resend; in dev without API key, sendEmail logs instead.
    try {
      await sendEmail({
        to: email,
        subject: `Your Frames41 verification code: ${code}`,
        html: renderVerificationEmailHtml(
          code,
          EMAIL_VERIFICATION_CONFIG.EXPIRY_MINUTES,
        ),
        text: `Your Frames41 verification code is ${code}. It expires in ${EMAIL_VERIFICATION_CONFIG.EXPIRY_MINUTES} minutes.`,
      });
    } catch (err) {
      logger.error({ err, email }, 'Failed to send verification email');
      // Non-fatal — user can request a resend; code still stored.
    }

    logger.info({ email }, 'Verification code issued');
  }

  /**
   * Generate access and refresh token pair
   */
  private async generateTokenPair(
    userId: string,
    role: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
    existingFamily?: string,
  ): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { userId, role, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'] },
    );

    const refreshToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + JWT_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS);

    const family = existingFamily || generateTokenFamily();

    await this.repository.createRefreshToken(
      userId,
      tokenHash,
      family,
      expiresAt,
      deviceInfo,
      ipAddress,
    );

    const expiresIn = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    return { accessToken, refreshToken, expiresIn };
  }
}

import type { User, RefreshToken, EmailVerificationToken } from '@prisma/client';
import type { TokenPair } from '../../shared/types/index.js';

/**
 * Token payload for JWT
 */
export interface TokenPayload {
  userId: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Auth service interface
 */
export interface IAuthService {
  /**
   * Signup: create an unverified user and email a 6-digit verification code
   */
  signup(
    email: string,
    password: string,
    name: string | undefined,
    ipAddress: string,
  ): Promise<{ expiresIn: number }>;

  /**
   * Resend the signup verification code
   */
  resendVerification(
    email: string,
    ipAddress: string,
  ): Promise<{ expiresIn: number }>;

  /**
   * Verify the emailed code; marks the user verified and returns tokens
   */
  verifyEmail(
    email: string,
    code: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair & { isNewUser: boolean }>;

  /**
   * Login with email + password
   */
  login(
    email: string,
    password: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(
    refreshToken: string,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<TokenPair>;

  /**
   * Logout user and revoke refresh token
   */
  logout(refreshToken: string): Promise<void>;

  /**
   * Logout from all devices
   */
  logoutAll(userId: string): Promise<void>;

  /**
   * Change password for authenticated user
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
}

/**
 * Auth repository interface
 */
export interface IAuthRepository {
  // Email verification tokens
  createVerificationToken(
    email: string,
    codeHash: string,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<EmailVerificationToken>;

  findValidVerificationToken(email: string): Promise<EmailVerificationToken | null>;

  incrementVerifyAttempts(id: string): Promise<void>;

  markVerificationConsumed(id: string): Promise<void>;

  countVerificationTokensByEmail(email: string, since: Date): Promise<number>;

  countVerificationTokensByIp(ipAddress: string, since: Date): Promise<number>;

  // Users
  findUserByEmail(email: string): Promise<User | null>;

  findUserById(userId: string): Promise<User | null>;

  createUser(
    email: string,
    passwordHash: string,
    name: string | undefined,
  ): Promise<User>;

  setUserVerified(userId: string): Promise<void>;

  updateUserPassword(userId: string, passwordHash: string): Promise<void>;

  updateUserName(userId: string, name: string): Promise<void>;

  updateLastLogin(userId: string): Promise<void>;

  // Refresh tokens
  createRefreshToken(
    userId: string,
    tokenHash: string,
    family: string,
    expiresAt: Date,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<RefreshToken>;

  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;

  revokeRefreshToken(tokenHash: string): Promise<void>;

  revokeAllUserTokens(userId: string): Promise<void>;

  revokeTokenFamily(family: string): Promise<void>;
}
import type {
  User,
  RefreshToken,
  EmailVerificationToken,
  PrismaClient,
} from '@prisma/client';
import type { IAuthRepository } from './auth.types.js';

/**
 * Auth repository implementation
 * Handles all database operations for authentication
 */
export class AuthRepository implements IAuthRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ─── Email verification tokens ──────────────────────────────────────────────

  async createVerificationToken(
    email: string,
    codeHash: string,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<EmailVerificationToken> {
    return this.prisma.emailVerificationToken.create({
      data: { email, codeHash, ipAddress, expiresAt },
    });
  }

  async findValidVerificationToken(email: string): Promise<EmailVerificationToken | null> {
    return this.prisma.emailVerificationToken.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementVerifyAttempts(id: string): Promise<void> {
    await this.prisma.emailVerificationToken.update({
      where: { id },
      data: { verifyAttempts: { increment: 1 } },
    });
  }

  async markVerificationConsumed(id: string): Promise<void> {
    await this.prisma.emailVerificationToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async countVerificationTokensByEmail(email: string, since: Date): Promise<number> {
    return this.prisma.emailVerificationToken.count({
      where: { email, createdAt: { gte: since } },
    });
  }

  async countVerificationTokensByIp(ipAddress: string, since: Date): Promise<number> {
    return this.prisma.emailVerificationToken.count({
      where: { ipAddress, createdAt: { gte: since } },
    });
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async createUser(
    email: string,
    passwordHash: string,
    name: string | undefined,
  ): Promise<User> {
    const data: { email: string; passwordHash: string; name?: string } = {
      email,
      passwordHash,
    };
    if (name) data.name = name;
    return this.prisma.user.create({ data });
  }

  async setUserVerified(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateUserName(userId: string, name: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // ─── Refresh tokens ──────────────────────────────────────────────────────────

  async createRefreshToken(
    userId: string,
    tokenHash: string,
    family: string,
    expiresAt: Date,
    deviceInfo: string | undefined,
    ipAddress: string | undefined,
  ): Promise<RefreshToken> {
    const data: {
      userId: string;
      tokenHash: string;
      family: string;
      expiresAt: Date;
      deviceInfo?: string;
      ipAddress?: string;
    } = { userId, tokenHash, family, expiresAt };
    if (deviceInfo) data.deviceInfo = deviceInfo;
    if (ipAddress) data.ipAddress = ipAddress;
    return this.prisma.refreshToken.create({ data });
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeTokenFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        family,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}
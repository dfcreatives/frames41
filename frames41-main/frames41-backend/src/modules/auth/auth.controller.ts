import type { Request, Response, NextFunction } from 'express';
import type { IAuthService } from './auth.types.js';
import {
  signupSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
} from './auth.schema.js';

/**
 * Auth controller
 * Thin HTTP layer — all business logic lives in the service
 */
export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  private meta(req: Request) {
    return {
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /auth/signup
   */
  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = signupSchema.parse(req.body);
      const ipAddress = req.ip || 'unknown';

      const result = await this.authService.signup(email, password, name, ipAddress);

      res.status(201).json({
        success: true,
        data: {
          message: 'Verification code sent to your email',
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/resend-verification
   */
  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = resendVerificationSchema.parse(req.body);
      const ipAddress = req.ip || 'unknown';

      const result = await this.authService.resendVerification(email, ipAddress);

      res.status(200).json({
        success: true,
        data: {
          message: 'If an unverified account exists, a new code was sent',
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/verify-email
   */
  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, code } = verifyEmailSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.verifyEmail(
        email,
        code,
        deviceInfo,
        ipAddress,
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
          isNewUser: result.isNewUser,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.login(
        email,
        password,
        deviceInfo,
        ipAddress,
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/refresh
   */
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const deviceInfo = req.headers['user-agent'];
      const ipAddress = req.ip;

      const result = await this.authService.refreshToken(
        refreshToken,
        deviceInfo,
        ipAddress,
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = logoutSchema.parse(req.body);

      await this.authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout-all
   */
  logoutAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: this.meta(req),
        });
        return;
      }

      await this.authService.logoutAll(req.user.userId);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out from all devices' },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/change-password
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          meta: this.meta(req),
        });
        return;
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await this.authService.changePassword(req.user.userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        data: { message: 'Password changed successfully' },
        meta: this.meta(req),
      });
    } catch (error) {
      next(error);
    }
  };
}
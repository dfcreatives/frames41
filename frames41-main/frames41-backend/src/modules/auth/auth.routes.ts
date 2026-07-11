import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

/**
 * Create auth routes
 */
export function createAuthRoutes(): Router {
  const router = Router();

  // Dependency injection
  const repository = new AuthRepository(prisma);
  const service = new AuthService(repository);
  const controller = new AuthController(service);

  // Signup + email verification endpoints
  router.post('/signup', authRateLimiter, controller.signup);
  router.post('/resend-verification', authRateLimiter, controller.resendVerification);
  router.post('/verify-email', authRateLimiter, controller.verifyEmail);

  // Login + token endpoints
  router.post('/login', authRateLimiter, controller.login);
  router.post('/refresh', authRateLimiter, controller.refreshToken);
  router.post('/logout', authRateLimiter, controller.logout);
  router.post('/logout-all', authenticate, controller.logoutAll);
  router.post('/change-password', authenticate, authRateLimiter, controller.changePassword);

  return router;
}

export default createAuthRoutes;
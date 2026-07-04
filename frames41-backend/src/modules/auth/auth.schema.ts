import { z } from 'zod';

/**
 * Email validation
 */
const emailSchema = z.string().email('Invalid email address').max(254);

/**
 * Password validation — at least 8 chars, one letter and one number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Signup schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().max(100).optional(),
});

/**
 * Verify email schema
 */
export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

/**
 * Resend verification schema
 */
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

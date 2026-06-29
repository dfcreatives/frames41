import { z } from 'zod';

/**
 * Coupon type enum
 */
export const couponTypeSchema = z.enum(['PERCENT', 'FLAT', 'FIRST_ORDER']);

/**
 * Create coupon schema
 */
export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: couponTypeSchema,
  value: z.number().min(0),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  isActive: z.boolean().default(true),
});

/**
 * Update coupon schema
 */
export const updateCouponSchema = createCouponSchema.partial();

/**
 * Validate coupon schema
 */
export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderValue: z.number().min(0).optional(),
});

/**
 * Coupon code param schema
 */
export const couponCodeParamSchema = z.object({
  code: z.string().min(1),
});

/**
 * Type exports
 */
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type CouponCodeParam = z.infer<typeof couponCodeParamSchema>;
export type CouponType = z.infer<typeof couponTypeSchema>;

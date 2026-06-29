import { z } from 'zod';

/**
 * Banner type enum
 */
export const bannerTypeSchema = z.enum(['TOP_STRIP', 'HEADER_SLIDER', 'UNDER_999', 'CATEGORY_BANNER', 'PROMOTIONAL']);

/**
 * Create banner schema
 */
export const createBannerSchema = z.object({
  image: z.string().url('Image must be a valid URL'),
  mobileImage: z.string().url().optional(),
  link: z.string().url().optional(),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  type: bannerTypeSchema.default('HEADER_SLIDER'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Update banner schema
 */
export const updateBannerSchema = createBannerSchema.partial();

/**
 * Banner ID param schema
 */
export const bannerIdParamSchema = z.object({
  id: z.string().uuid('Invalid banner ID'),
});

/**
 * Banner type query schema
 */
export const bannerTypeQuerySchema = z.object({
  type: bannerTypeSchema.optional(),
  includeInactive: z.enum(['true', 'false']).optional().default('false'),
}).optional();

/**
 * Type exports
 */
export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type BannerIdParam = z.infer<typeof bannerIdParamSchema>;
export type BannerTypeQuery = z.infer<typeof bannerTypeQuerySchema>;
export type BannerType = z.infer<typeof bannerTypeSchema>;

import type { Request, Response, NextFunction } from 'express';
import type { IBannerService } from './banner.types.js';
import {
  createBannerSchema,
  updateBannerSchema,
  bannerIdParamSchema,
  bannerTypeQuerySchema,
} from './banner.schema.js';
import type { BannerType } from './banner.schema.js';

/**
 * Banner controller
 */
export class BannerController {
  private readonly bannerService: IBannerService;

  constructor(bannerService: IBannerService) {
    this.bannerService = bannerService;
  }

  /**
   * GET /banners
   * Get all banners
   */
  getBanners = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = bannerTypeQuerySchema.parse(req.query);
      const includeInactive = query?.includeInactive === 'true' && req.user?.role === 'ADMIN';
      
      const banners = await this.bannerService.getBanners(
        query?.type as BannerType,
        includeInactive,
      );

      res.status(200).json({
        success: true,
        data: banners,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /banners/by-type/:type
   * Get active banners by type
   */
  getBannersByType = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { type } = req.params;
      const banners = await this.bannerService.getActiveBannersByType(type as BannerType);

      res.status(200).json({
        success: true,
        data: banners,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /banners/:id
   * Get banner by ID
   */
  getBannerById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = bannerIdParamSchema.parse(req.params);
      const banner = await this.bannerService.getBannerById(id);

      res.status(200).json({
        success: true,
        data: banner,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /banners
   * Create banner (Admin only)
   */
  createBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = createBannerSchema.parse(req.body);
      const banner = await this.bannerService.createBanner(data);

      res.status(201).json({
        success: true,
        data: banner,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /banners/:id
   * Update banner (Admin only)
   */
  updateBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = bannerIdParamSchema.parse(req.params);
      const data = updateBannerSchema.parse(req.body);
      const banner = await this.bannerService.updateBanner(id, data);

      res.status(200).json({
        success: true,
        data: banner,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /banners/:id
   * Delete banner (Admin only)
   */
  deleteBanner = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = bannerIdParamSchema.parse(req.params);
      await this.bannerService.deleteBanner(id);

      res.status(200).json({
        success: true,
        data: { message: 'Banner deleted successfully' },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

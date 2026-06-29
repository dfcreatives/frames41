import type { Request, Response, NextFunction } from 'express';
import type { ICategoryService } from './category.types.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
  categoryQuerySchema,
} from './category.schema.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

/**
 * Category controller
 */
export class CategoryController {
  private readonly categoryService: ICategoryService;

  constructor(categoryService: ICategoryService) {
    this.categoryService = categoryService;
  }

  /**
   * GET /categories/tree
   * Get category tree
   */
  getCategoryTree = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = categoryQuerySchema.parse(req.query);
      const includeInactive = query?.includeInactive === 'true' && req.user?.role === 'ADMIN';
      const onlyWithProducts = query?.onlyWithProducts === 'true';

      const tree = await this.categoryService.getCategoryTree(includeInactive, onlyWithProducts);

      res.status(200).json({
        success: true,
        data: tree,
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
   * GET /categories/:id
   * Get category by ID
   */
  getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = categoryIdParamSchema.parse(req.params);
      const category = await this.categoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: category,
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
   * GET /categories/by-slug/:slug
   * Get category by slug
   */
  getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = categorySlugParamSchema.parse(req.params);
      const category = await this.categoryService.getCategoryBySlug(slug);

      res.status(200).json({
        success: true,
        data: category,
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
   * POST /categories
   * Create category (Admin only)
   */
  createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await this.categoryService.createCategory(data);

      res.status(201).json({
        success: true,
        data: category,
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
   * PATCH /categories/:id
   * Update category (Admin only)
   */
  updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = categoryIdParamSchema.parse(req.params);
      const data = updateCategorySchema.parse(req.body);
      const category = await this.categoryService.updateCategory(id, data);

      res.status(200).json({
        success: true,
        data: category,
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
   * DELETE /categories/:id
   * Delete category (Admin only)
   */
  deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = categoryIdParamSchema.parse(req.params);
      await this.categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        data: { message: 'Category deleted successfully' },
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

import type { Request, Response, NextFunction } from 'express';
import type { IProductService } from './product.types.js';
import { BadRequestError } from '../../shared/errors/AppError.js';
import { isDbConnected } from '../../infrastructure/database/prisma.client.js';
import { MOCK_PRODUCTS, saveMockOverrides } from '../../infrastructure/database/mockCatalog.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productSlugParamSchema,
  productQuerySchema,
  searchQuerySchema,
  underPriceParamSchema,
} from './product.schema.js';
import type { ProductFilters, ProductSortOption } from './product.types.js';

/**
 * Product controller
 */
export class ProductController {
  private readonly productService: IProductService;

  constructor(productService: IProductService) {
    this.productService = productService;
  }

  /**
   * GET /products
   * Get products with filtering
   */
  getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!isDbConnected) {
        const includeInactive = req.query.includeInactive === 'true';
        const list = includeInactive ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter((p) => p.isActive !== false);
        return res.status(200).json({
          success: true,
          data: list,
          meta: {
            requestId: req.headers['x-request-id'] as string,
            timestamp: new Date().toISOString(),
            pagination: { cursor: null, nextCursor: null, hasMore: false, limit: 20 },
          },
        });
      }

      const query = productQuerySchema.parse(req.query);
      
      const filters: ProductFilters = {
        categoryId: query.categoryId,
        categoryIds: query.categoryIds,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        inStock: query.inStock === 'true' ? true : undefined,
        query: query.q,
        isActive: query.includeInactive === 'true' ? undefined : true,
      };

      const result = await this.productService.getProducts(
        filters,
        query.sort as ProductSortOption,
        query.cursor,
        query.limit,
      );

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
          pagination: {
            cursor: query.cursor || null,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            limit: query.limit,
          },
        },
      });
    } catch (error) {
      const includeInactive = req.query.includeInactive === 'true';
      const list = includeInactive ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter((p) => p.isActive !== false);
      res.status(200).json({
        success: true,
        data: list,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
          pagination: { cursor: null, nextCursor: null, hasMore: false, limit: 20 },
        },
      });
    }
  };

  /**
   * GET /products/:id
   * Get product by ID
   */
  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = productIdParamSchema.parse(req.params);
      if (!isDbConnected) {
        const found = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
        return res.status(200).json({
          success: true,
          data: found,
          meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
        });
      }

      const product = await this.productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: product,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      const { id } = req.params;
      const found = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
      res.status(200).json({
        success: true,
        data: found,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      });
    }
  };

  /**
   * GET /products/by-slug/:slug
   * Get product by slug
   */
  getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = productSlugParamSchema.parse(req.params);
      if (!isDbConnected) {
        const found = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
        return res.status(200).json({
          success: true,
          data: found,
          meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
        });
      }

      const product = await this.productService.getProductBySlug(slug);

      res.status(200).json({
        success: true,
        data: product,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      const { slug } = req.params;
      const found = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];
      res.status(200).json({
        success: true,
        data: found,
        meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() },
      });
    }
  };

  /**
   * GET /products/search?q=
   * Search products
   */
  searchProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = searchQuerySchema.parse(req.query);
      
      const result = await this.productService.searchProducts(
        query.q,
        query.cursor,
        query.limit,
      );

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
          pagination: {
            cursor: query.cursor || null,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            limit: query.limit,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/under-price/:amount
   * Get products under specific price
   */
  getProductsUnderPrice = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parseResult = underPriceParamSchema.safeParse(req.params);
      if (!parseResult.success) {
        throw new BadRequestError('Invalid price amount — must be a positive integer');
      }
      const { amount } = parseResult.data;
      const { cursor, limit } = productQuerySchema.parse(req.query);

      const result = await this.productService.getProductsUnderPrice(
        amount,
        cursor,
        limit,
      );

      res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
          pagination: {
            cursor: cursor || null,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            limit: limit || 20,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /products
   * Create product (Admin only)
   */
  createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await this.productService.createProduct(data);

      res.status(201).json({
        success: true,
        data: product,
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
   * PATCH /products/:id
   * Update product (Admin only)
   */
  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = productIdParamSchema.parse(req.params);
      const data = updateProductSchema.parse(req.body);

      if (!isDbConnected) {
        const mockIdx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
        if (mockIdx !== -1) {
          const mock = MOCK_PRODUCTS[mockIdx];
          if (data.isActive !== undefined) mock.isActive = data.isActive;
          if (data.isTrending !== undefined) mock.isTrending = data.isTrending;
          if (data.isBestSeller !== undefined) mock.isBestSeller = data.isBestSeller;
          if (data.isFeatured !== undefined) mock.isFeatured = data.isFeatured;
          if (data.trendingBannerUrl !== undefined) mock.trendingBannerUrl = data.trendingBannerUrl;
          saveMockOverrides();
          return res.status(200).json({
            success: true,
            data: mock,
            meta: {
              requestId: req.headers['x-request-id'] as string,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }

      const product = await this.productService.updateProduct(id, data);

      res.status(200).json({
        success: true,
        data: {
          ...product,
          basePrice: Number(product.basePrice),
          discountedPrice: product.discountedPrice != null ? Number(product.discountedPrice) : null,
          weight: product.weight != null ? Number(product.weight) : null,
        },
        meta: {
          requestId: req.headers['x-request-id'] as string,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (!isDbConnected) {
        const { id } = req.params;
        const data = req.body;
        const mockIdx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
        if (mockIdx !== -1) {
          const mock = MOCK_PRODUCTS[mockIdx];
          if (data.isActive !== undefined) mock.isActive = Boolean(data.isActive);
          if (data.isTrending !== undefined) mock.isTrending = Boolean(data.isTrending);
          if (data.isBestSeller !== undefined) mock.isBestSeller = Boolean(data.isBestSeller);
          if (data.isFeatured !== undefined) mock.isFeatured = Boolean(data.isFeatured);
          if (data.trendingBannerUrl !== undefined) mock.trendingBannerUrl = data.trendingBannerUrl;
          return res.status(200).json({
            success: true,
            data: mock,
            meta: {
              requestId: req.headers['x-request-id'] as string,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
      next(error);
    }
  };

  /**
   * DELETE /products/:id
   * Delete product (Admin only)
   */
  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = productIdParamSchema.parse(req.params);
      await this.productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        data: { message: 'Product deleted successfully' },
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

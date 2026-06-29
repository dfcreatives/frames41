import type { Product, PrismaClient } from '@prisma/client';
import { PAGINATION } from '../../config/constants.js';
import type {
  IProductRepository,
  ProductWithRelations,
  ProductFilters,
  ProductSortOption,
  CreateProductData,
  UpdateProductData,
} from './product.types.js';
import type { PaginationParams, PaginatedResult } from '../../shared/types/index.js';

/**
 * Product repository implementation
 */
export class ProductRepository implements IProductRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private get includeRelations() {
    return {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      priceTiers: {
        orderBy: { minQty: 'asc' },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };
  }

  async findAll(
    filters: ProductFilters,
    sort: ProductSortOption,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isBestSeller !== undefined) {
      where.isBestSeller = filters.isBestSeller;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.basePrice = {};
      if (filters.minPrice !== undefined) {
        (where.basePrice as Record<string, unknown>).gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (where.basePrice as Record<string, unknown>).lte = filters.maxPrice;
      }
    }

    // Build order by
    let orderBy: Record<string, string | Record<string, string>>[] | Record<string, string> = {};
    switch (sort) {
      case 'price-asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price-desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'popularity':
        orderBy = { isBestSeller: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'rating-desc':
        // TODO: sort by average review rating once a computed field or raw query is added
        orderBy = { createdAt: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Cursor-based pagination
    const cursorCondition = pagination.cursor
      ? { id: { gt: pagination.cursor } }
      : {};

    const products = await this.prisma.product.findMany({
      where: {
        ...where,
        ...cursorCondition,
      },
      take: limit + 1, // Take one extra to check if there's more
      orderBy,
      include: this.includeRelations,
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      data: data as ProductWithRelations[],
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: this.includeRelations,
    }) as Promise<ProductWithRelations | null>;
  }

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: this.includeRelations,
    }) as Promise<ProductWithRelations | null>;
  }

  async search(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    // Split query into words for broader matching
    const words = query.trim().split(/\s+/).filter((w) => w.length > 0);

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          // Match any word in the name
          ...words.map((word) => ({
            name: { contains: word, mode: 'insensitive' as const },
          })),
          // Match any word in the description
          ...words.map((word) => ({
            description: { contains: word, mode: 'insensitive' as const },
          })),
          // Match any word in the short description
          ...words.map((word) => ({
            shortDescription: { contains: word, mode: 'insensitive' as const },
          })),
        ],
      },
      take: limit + 1,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: this.includeRelations,
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      data: data as ProductWithRelations[],
      nextCursor,
      hasMore,
    };
  }

  async findUnderPrice(
    amount: number,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const limit = Math.min(pagination.limit, PAGINATION.MAX_PAGE_SIZE);

    const cursorCondition = pagination.cursor
      ? { id: { gt: pagination.cursor } }
      : {};

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        basePrice: { lte: amount },
        ...cursorCondition,
      },
      take: limit + 1,
      orderBy: { basePrice: 'asc' },
      include: this.includeRelations,
    });

    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    return {
      data: data as ProductWithRelations[],
      nextCursor,
      hasMore,
    };
  }

  async create(data: CreateProductData): Promise<ProductWithRelations> {
    const product = await this.prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        basePrice: data.basePrice,
        discountedPrice: data.discountedPrice,
        sku: data.sku,
        stock: data.stock,
        isActive: data.isActive,
        isBestSeller: data.isBestSeller,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
        fontOptions: data.fontOptions,
        specifications: data.specifications,
        weight: data.weight,
        dimensions: data.dimensions,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        images: {
          create: data.images,
        },
        variants: data.variants?.length
          ? { create: data.variants }
          : undefined,
        priceTiers: data.priceTiers?.length
          ? { create: data.priceTiers }
          : undefined,
      },
      include: this.includeRelations,
    });

    return product as ProductWithRelations;
  }

  async update(id: string, data: UpdateProductData): Promise<ProductWithRelations> {
    const updateData: Record<string, unknown> = {};

    // Simple fields
    const simpleFields = [
      'slug', 'name', 'description', 'shortDescription', 'basePrice',
      'discountedPrice', 'sku', 'stock', 'isActive', 'isBestSeller',
      'isFeatured', 'categoryId', 'fontOptions', 'specifications',
      'weight', 'dimensions', 'metaTitle', 'metaDescription',
    ];

    for (const field of simpleFields) {
      if (field in data) {
        updateData[field] = data[field as keyof UpdateProductData];
      }
    }

    // Handle images update (delete and recreate)
    if (data.images) {
      await this.prisma.productImage.deleteMany({
        where: { productId: id },
      });
      updateData.images = {
        create: data.images,
      };
    }

    // Handle variants update
    if (data.variants) {
      await this.prisma.productVariant.deleteMany({
        where: { productId: id },
      });
      updateData.variants = {
        create: data.variants,
      };
    }

    // Handle price tiers update
    if (data.priceTiers) {
      await this.prisma.productPriceTier.deleteMany({
        where: { productId: id },
      });
      updateData.priceTiers = {
        create: data.priceTiers,
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: this.includeRelations,
    });

    return product as ProductWithRelations;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        sku,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }
}

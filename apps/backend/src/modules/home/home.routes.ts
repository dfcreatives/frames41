import { Router } from 'express';
import { prisma, isDbConnected } from '../../infrastructure/database/prisma.client.js';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_BANNERS } from '../../infrastructure/database/mockCatalog.js';
import { createLRUCache } from '../../infrastructure/cache/lru.cache.js';

const homeCache = createLRUCache<string, {}>({ max: 1, ttl: 30_000 });

const productListInclude = {
  images: {
    take: 1,
    orderBy: { sortOrder: 'asc' as const },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
} as const;

const categoryProductInclude = {
  images: {
    take: 1,
    orderBy: { sortOrder: 'asc' as const },
  },
  variants: {
    where: { isActive: true },
    take: 1,
    select: { id: true },
  },
} as const;

export default function createHomeRoutes(): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      if (!isDbConnected) {
        const mockCategories = MOCK_CATEGORIES.map((cat) => ({
          ...cat,
          products: MOCK_PRODUCTS.filter((p) => p.categoryId === cat.id),
        }));
        const mockData = {
          categories: mockCategories,
          budgetProducts: MOCK_PRODUCTS.filter((p) => p.basePrice <= 999),
          bestsellers: MOCK_PRODUCTS.filter((p) => p.isBestSeller),
          newCollections: MOCK_PRODUCTS,
          heroBanners: MOCK_BANNERS,
        };
        res.setHeader('X-Cache', 'MOCK');
        return res.status(200).json({ success: true, data: mockData });
      }

      const now = new Date();
      const [categories, budgetProducts, bestsellers, newCollections, banners] =
        await Promise.all([
          prisma.category.findMany({
            where: {
              products: {
                some: { isActive: true },
              },
            },
            orderBy: { sortOrder: 'asc' },
            include: {
              products: {
                where: { isActive: true },
                take: 4,
                orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
                include: categoryProductInclude,
              },
            },
          }),
          prisma.product.findMany({
            where: { isActive: true, basePrice: { lte: 999 } },
            take: 8,
            orderBy: { basePrice: 'asc' },
            include: productListInclude,
          }),
          prisma.product.findMany({
            where: { isActive: true },
            take: 6,
            orderBy: [{ isBestSeller: 'desc' }, { createdAt: 'desc' }],
            include: productListInclude,
          }),
          prisma.product.findMany({
            where: { isActive: true },
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: productListInclude,
          }),
          prisma.banner.findMany({
            where: {
              isActive: true,
              AND: [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] },
              ],
            },
            orderBy: { sortOrder: 'asc' },
          }),
        ]);

      const data = {
        categories,
        budgetProducts,
        bestsellers,
        newCollections,
        heroBanners: banners.map((banner: {
          image: string;
          mobileImage: string | null;
          [key: string]: unknown;
        }) => ({
          ...banner,
          imageUrl: banner.image,
          mobileImageUrl: banner.mobileImage ?? undefined,
        })),
      };
      homeCache.set('home', data);
      res.setHeader('X-Cache', 'MISS');
      res.status(200).json({ success: true, data });
    } catch (error) {
      // Fallback to mock data if database fails
      const mockCategories = MOCK_CATEGORIES.map((cat) => ({
        ...cat,
        products: MOCK_PRODUCTS.filter((p) => p.categoryId === cat.id),
      }));
      const mockData = {
        categories: mockCategories,
        budgetProducts: MOCK_PRODUCTS.filter((p) => p.basePrice <= 999),
        bestsellers: MOCK_PRODUCTS.filter((p) => p.isBestSeller),
        newCollections: MOCK_PRODUCTS,
        heroBanners: MOCK_BANNERS,
      };
      res.setHeader('X-Cache', 'MOCK_FALLBACK');
      res.status(200).json({ success: true, data: mockData });
    }
  });

  return router;
}

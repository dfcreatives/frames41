export interface MockCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  discountedPrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isTrending?: boolean;
  trendingBannerUrl?: string;
  categoryId: string;
  specifications: Record<string, string>;
  careInstructions?: string;
  images: MockProductImage[];
  category?: Partial<MockCategory>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockBanner {
  id: string;
  image: string;
  imageUrl: string;
  mobileImage?: string;
  mobileImageUrl?: string;
  link?: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
  type: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: 'cat-photo-frames',
    slug: 'photo-frames',
    name: 'Photo Frames',
    description: 'Handcrafted wooden and acrylic photo frames for every memory',
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-collage-frames',
    slug: 'collage-frames',
    name: 'Collage Frames',
    description: 'Multi-photo frames to tell your story',
    sortOrder: 2,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-custom-name-frames',
    slug: 'custom-name-frames',
    name: 'Custom Name Frames',
    description: 'Personalised frames with names, dates and messages',
    sortOrder: 3,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-led-frames',
    slug: 'led-frames',
    name: 'LED Frames',
    description: 'Illuminated frames that glow in the dark',
    sortOrder: 4,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-wall-art',
    slug: 'wall-art',
    name: 'Wall Art',
    description: 'Canvas prints and wooden art to transform your walls',
    sortOrder: 5,
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-classic-oak-4x6',
    slug: 'classic-oak-frame-4x6',
    name: 'Classic Oak Frame 4×6',
    description: 'A timeless solid oak photo frame with a natural finish. Fits standard 4×6 inch prints. Hand-sanded and finished with food-safe oil.',
    shortDescription: 'Timeless solid oak frame with natural finish',
    basePrice: 699,
    discountedPrice: 549,
    sku: 'PF-OAK-4X6-001',
    stock: 85,
    isActive: true,
    isBestSeller: true,
    isFeatured: true,
    isTrending: true,
    trendingBannerUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=85',
    categoryId: 'cat-photo-frames',
    category: { id: 'cat-photo-frames', name: 'Photo Frames', slug: 'photo-frames' },
    specifications: { material: 'Solid Oak', size: '4×6 inch', finish: 'Natural Oil' },
    images: [
      { id: 'img-1', productId: 'prod-classic-oak-4x6', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80', alt: 'Classic Oak Frame', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-walnut-5x7',
    slug: 'walnut-frame-5x7',
    name: 'Walnut Frame 5×7',
    description: 'Rich dark walnut frame with a sleek profile. Hand-crafted from sustainably sourced walnut wood with a smooth wax finish.',
    shortDescription: 'Rich dark walnut with sleek profile',
    basePrice: 899,
    discountedPrice: 749,
    sku: 'PF-WAL-5X7-001',
    stock: 60,
    isActive: true,
    isBestSeller: true,
    isFeatured: false,
    categoryId: 'cat-photo-frames',
    category: { id: 'cat-photo-frames', name: 'Photo Frames', slug: 'photo-frames' },
    specifications: { material: 'Solid Walnut', size: '5×7 inch', finish: 'Wax Polish' },
    images: [
      { id: 'img-2', productId: 'prod-walnut-5x7', url: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&q=80', alt: 'Walnut Frame', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-minimalist-white-8x10',
    slug: 'minimalist-white-frame-8x10',
    name: 'Minimalist White Frame 8×10',
    description: 'Clean, modern white frame crafted from premium MDF with a lacquered finish. Perfect for gallery presentation.',
    shortDescription: 'Clean modern white with gallery mat',
    basePrice: 1199,
    discountedPrice: 899,
    sku: 'PF-WHT-8X10-001',
    stock: 40,
    isActive: true,
    isBestSeller: false,
    isFeatured: true,
    categoryId: 'cat-photo-frames',
    category: { id: 'cat-photo-frames', name: 'Photo Frames', slug: 'photo-frames' },
    specifications: { material: 'Premium MDF', size: '8×10 inch', finish: 'Lacquer White' },
    images: [
      { id: 'img-3', productId: 'prod-minimalist-white-8x10', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', alt: 'White Frame', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-trio-collage-4x6',
    slug: 'trio-collage-frame-4x6',
    name: 'Trio Collage Frame 3×(4×6)',
    description: 'Display three of your favourite memories side by side. Crafted from solid pine with a natural stain.',
    shortDescription: 'Three 4×6 photos in one elegant frame',
    basePrice: 1499,
    discountedPrice: 1199,
    sku: 'CF-TRIO-4X6-001',
    stock: 35,
    isActive: true,
    isBestSeller: true,
    isFeatured: true,
    categoryId: 'cat-collage-frames',
    category: { id: 'cat-collage-frames', name: 'Collage Frames', slug: 'collage-frames' },
    specifications: { material: 'Pine Wood', holds: '3 photos' },
    images: [
      { id: 'img-4', productId: 'prod-trio-collage-4x6', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Trio Collage Frame', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-family-grid-9-photos',
    slug: 'family-grid-collage-9-photos',
    name: 'Family Grid Collage — 9 Photos',
    description: 'A bold 3×3 grid of your most precious moments. Each slot holds a 4×4 inch print.',
    shortDescription: '9-photo grid in black mango wood',
    basePrice: 2499,
    discountedPrice: 1999,
    sku: 'CF-GRID-9P-001',
    stock: 25,
    isActive: true,
    isBestSeller: false,
    isFeatured: true,
    categoryId: 'cat-collage-frames',
    category: { id: 'cat-collage-frames', name: 'Collage Frames', slug: 'collage-frames' },
    specifications: { material: 'Mango Wood', holds: '9 photos' },
    images: [
      { id: 'img-5', productId: 'prod-family-grid-9-photos', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', alt: 'Family Grid Collage', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-custom-couple-name',
    slug: 'personalized-couple-name-frame',
    name: 'Personalised Couple Name Frame',
    description: 'Custom laser-cut wooden frame featuring two names intertwined with a heart and your special anniversary date.',
    shortDescription: 'Laser-cut names & anniversary date in birch plywood',
    basePrice: 1299,
    discountedPrice: 999,
    sku: 'NF-COUPLE-001',
    stock: 50,
    isActive: true,
    isBestSeller: true,
    isFeatured: true,
    categoryId: 'cat-custom-name-frames',
    category: { id: 'cat-custom-name-frames', name: 'Custom Name Frames', slug: 'custom-name-frames' },
    specifications: { material: 'Birch Plywood', customization: 'Names + Date' },
    customizationConfig: {
      numberOfNames: { enabled: true, count: 2 },
      date: { enabled: true },
      numberOfImages: { enabled: false, count: 1 },
      songName: { enabled: false },
      qrCodeImages: { enabled: false, count: 1 },
      contactShop: { enabled: false },
      startingFrom: { enabled: false },
    },
    images: [
      { id: 'img-6', productId: 'prod-custom-couple-name', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', alt: 'Couple Name Frame', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-acrylic-song-keychain',
    slug: 'premium-personalized-acrylic-song-keychain',
    name: 'Premium Personalized Acrylic Song Keychain',
    description: 'Make every key special with a custom acrylic engraved song keychain. Manufactured using premium acrylic and advanced laser engraving technology.',
    shortDescription: 'Custom acrylic engraved song keychain',
    basePrice: 249,
    discountedPrice: 179,
    sku: 'AK-SONG-001',
    stock: 100,
    isActive: true,
    isBestSeller: true,
    isFeatured: true,
    categoryId: 'cat-custom-name-frames',
    category: { id: 'cat-custom-name-frames', name: 'Custom Name Frames', slug: 'custom-name-frames' },
    specifications: { material: 'Premium Acrylic', engraving: 'Laser Engraved' },
    customizationConfig: {
      songName: { enabled: true },
      numberOfNames: { enabled: false, count: 1 },
      date: { enabled: false },
      numberOfImages: { enabled: false, count: 1 },
      qrCodeImages: { enabled: false, count: 1 },
      contactShop: { enabled: false },
      startingFrom: { enabled: false },
    },
    images: [
      { id: 'img-song-1', productId: 'prod-acrylic-song-keychain', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', alt: 'Acrylic Song Keychain Front', sortOrder: 0, isPrimary: true },
      { id: 'img-song-2', productId: 'prod-acrylic-song-keychain', url: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&q=80', alt: 'Acrylic Song Keychain Side View', sortOrder: 1, isPrimary: false },
      { id: 'img-song-3', productId: 'prod-acrylic-song-keychain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', alt: 'Laser Engraved Details View', sortOrder: 2, isPrimary: false },
      { id: 'img-song-4', productId: 'prod-acrylic-song-keychain', url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', alt: 'Keychain Gift Packaging View', sortOrder: 3, isPrimary: false },
      { id: 'img-song-5', productId: 'prod-acrylic-song-keychain', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Acrylic Transparency View', sortOrder: 4, isPrimary: false },
      { id: 'img-song-6', productId: 'prod-acrylic-song-keychain', url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80', alt: 'Keychain Dimensions View', sortOrder: 5, isPrimary: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-infinity-led-frame',
    slug: 'warm-infinity-led-glow-frame',
    name: 'Warm Infinity LED Glow Frame',
    description: 'Warm ambient LED light strip embedded inside a dark walnut frame. Creates a soft halo glow around your photograph.',
    shortDescription: 'Warm ambient LED halo in dark walnut frame',
    basePrice: 1899,
    discountedPrice: 1499,
    sku: 'LED-INF-001',
    stock: 30,
    isActive: true,
    isBestSeller: true,
    isFeatured: true,
    categoryId: 'cat-led-frames',
    category: { id: 'cat-led-frames', name: 'LED Frames', slug: 'led-frames' },
    specifications: { material: 'Dark Walnut', lighting: 'Warm White LED 3000K' },
    images: [
      { id: 'img-7', productId: 'prod-infinity-led-frame', url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80', alt: 'LED Glow Frame', sortOrder: 0, isPrimary: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_BANNERS: MockBanner[] = [
  {
    id: 'banner-hero-1',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=80',
    title: 'Crafting Stories in Wood',
    subtitle: 'Handcrafted photo frames, DIY craft kits, and customized gifts.',
    sortOrder: 1,
    isActive: true,
    type: 'HEADER_SLIDER',
  },
];

import fs from 'fs';
import path from 'path';

const OVERRIDE_FILE = path.join(process.cwd(), 'mock_products_overrides.json');

export function saveMockOverrides() {
  try {
    const overrides = MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      isActive: p.isActive,
      isTrending: p.isTrending,
      trendingBannerUrl: p.trendingBannerUrl,
    }));
    fs.writeFileSync(OVERRIDE_FILE, JSON.stringify(overrides, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save mock overrides to file:', e);
  }
}

export function loadMockOverrides() {
  try {
    if (!fs.existsSync(OVERRIDE_FILE)) return;
    const raw = fs.readFileSync(OVERRIDE_FILE, 'utf-8');
    const overrides: Array<{ id: string; isActive?: boolean; isTrending?: boolean; trendingBannerUrl?: string }> = JSON.parse(raw);
    const map = new Map(overrides.map((o) => [o.id, o]));
    for (const p of MOCK_PRODUCTS) {
      const ov = map.get(p.id);
      if (ov) {
        if (ov.isActive !== undefined) p.isActive = ov.isActive;
        if (ov.isTrending !== undefined) p.isTrending = ov.isTrending;
        if (ov.trendingBannerUrl !== undefined) p.trendingBannerUrl = ov.trendingBannerUrl;
      }
    }
  } catch (e) {
    console.error('Failed to load mock overrides from file:', e);
  }
}

loadMockOverrides();

import type { CartData, CartCalculation, ICartRepository, ICartService } from './cart.types.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { PricingEngine } from './pricing.engine.js';
import type { CouponService } from '../coupon/coupon.service.js';
import type { ShippingService } from '../shipping/shipping.service.js';

/**
 * Cart service implementation
 */
export class CartService implements ICartService {
  private readonly repository: ICartRepository;
  private readonly couponService?: CouponService;
  private readonly shippingService?: ShippingService;

  constructor(
    repository: ICartRepository,
    couponService?: CouponService,
    shippingService?: ShippingService,
  ) {
    this.repository = repository;
    this.couponService = couponService;
    this.shippingService = shippingService;
  }

  async getCart(userId: string): Promise<CartData> {
    const cart = await this.repository.findOrCreateCart(userId);
    return this.mapCartToData(cart);
  }

  async addToCart(
    userId: string,
    data: {
      productId: string;
      variantId?: string;
      quantity: number;
      customization?: Record<string, unknown>;
      customImageUrl?: string;
    },
  ): Promise<CartData> {
    // Get or create cart
    const cart = await this.repository.findOrCreateCart(userId);

    // Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        priceTiers: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    if (!product.isActive) {
      throw new BadRequestError('Product is not available');
    }

    // Check stock
    if (product.stock < data.quantity) {
      throw new BadRequestError(`Only ${product.stock} items available`);
    }

    // Calculate price
    let unitPrice = Number(product.basePrice);
    let variantName: string | undefined;

    // Handle variant
    if (data.variantId) {
      const variant = product.variants.find((v) => v.id === data.variantId);
      if (!variant || !variant.isActive) {
        throw new NotFoundError('Product variant');
      }
      if (variant.stock < data.quantity) {
        throw new BadRequestError(`Only ${variant.stock} items available for this variant`);
      }
      unitPrice += Number(variant.priceModifier);
      variantName = variant.name;
    }

    // Apply price tier
    const tierResult = PricingEngine.calculateUnitPrice(
      unitPrice,
      data.quantity,
      product.priceTiers,
    );
    unitPrice = tierResult.unitPrice;

    // Check if item already exists in cart
    const existingItem = await this.repository.findCartItem(
      cart.id,
      data.productId,
      data.variantId,
    );

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + data.quantity;

      // Recalculate price with new quantity
      const newTierResult = PricingEngine.calculateUnitPrice(
        Number(product.basePrice) + (data.variantId
          ? Number(product.variants.find((v) => v.id === data.variantId)?.priceModifier || 0)
          : 0),
        newQuantity,
        product.priceTiers,
      );

      await this.repository.updateItem(existingItem.id, {
        quantity: newQuantity,
        customization: data.customization,
        unitPrice: newTierResult.unitPrice,
        totalPrice: newTierResult.unitPrice * newQuantity,
      });
    } else {
      // Add new item
      await this.repository.addItem(cart.id, {
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        customization: data.customization,
        customImageUrl: data.customImageUrl,
        unitPrice,
        totalPrice: unitPrice * data.quantity,
      });
    }

    await this.repository.updateTimestamp(cart.id);

    logger.info({ userId, productId: data.productId }, 'Item added to cart');

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    data: {
      quantity: number;
      customization?: Record<string, unknown>;
    },
  ): Promise<CartData> {
    // Verify cart ownership
    const cart = await this.repository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundError('Cart');
    }

    // Find cart item
    const item = await this.repository.findCartItemById(itemId);
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundError('Cart item');
    }

    if (data.quantity === 0) {
      // Remove item
      await this.repository.removeItem(itemId);
    } else {
      // Check stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          priceTiers: true,
          variants: true,
        },
      });

      if (!product) {
        throw new NotFoundError('Product');
      }

      const stock = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)?.stock ?? product.stock
        : product.stock;

      if (stock < data.quantity) {
        throw new BadRequestError(`Only ${stock} items available`);
      }

      // Recalculate price
      let basePrice = Number(product.basePrice);
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          basePrice += Number(variant.priceModifier);
        }
      }

      const tierResult = PricingEngine.calculateUnitPrice(
        basePrice,
        data.quantity,
        product.priceTiers,
      );

      await this.repository.updateItem(itemId, {
        quantity: data.quantity,
        customization: data.customization,
        unitPrice: tierResult.unitPrice,
        totalPrice: tierResult.unitPrice * data.quantity,
      });
    }

    await this.repository.updateTimestamp(cart.id);

    logger.info({ userId, itemId }, 'Cart item updated');

    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string): Promise<CartData> {
    // Verify cart ownership
    const cart = await this.repository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundError('Cart');
    }

    // Find cart item
    const item = await this.repository.findCartItemById(itemId);
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundError('Cart item');
    }

    await this.repository.removeItem(itemId);
    await this.repository.updateTimestamp(cart.id);

    logger.info({ userId, itemId }, 'Item removed from cart');

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.repository.findByUserId(userId);
    if (cart) {
      await this.repository.clearCart(cart.id);
      logger.info({ userId }, 'Cart cleared');
    }
  }

  async calculateCart(
    userId: string,
    couponCode?: string,
    pincode?: string,
  ): Promise<CartCalculation> {
    const cart = await this.repository.findOrCreateCart(userId);

    // Prepare items for pricing engine
    const pricingItems = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      basePrice: Number(item.unitPrice),
      priceTiers: item.product.priceTiers,
    }));

    // Get coupon if provided
    let coupon = null;
    if (couponCode && this.couponService) {
      try {
        const couponData = await this.couponService.validateCoupon(
          couponCode,
          userId,
          pricingItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0),
        );
        if (couponData.valid) {
          coupon = {
            code: couponCode,
            type: couponData.type,
            value: couponData.value,
            minOrderValue: couponData.minOrderValue,
            maxDiscount: couponData.maxDiscount,
          };
        }
      } catch {
        // Invalid coupon, continue without it
      }
    }

    // Get shipping info if pincode provided
    let state: string | undefined;
    let pincodeServiceable = true;
    if (pincode && this.shippingService) {
      const pincodeData = await this.shippingService.checkServiceability(pincode);
      pincodeServiceable = pincodeData.serviceable;
      state = pincodeData.state;
    }

    // Calculate using pricing engine
    const result = PricingEngine.calculateCart(
      pricingItems,
      coupon,
      state,
      pincodeServiceable,
    );

    return result;
  }

  private mapCartToData(cart: { id: string; userId: string; items: Array<{
    id: string;
    productId: string;
    product: {
      name: string;
      slug: string;
      images: Array<{ url: string }>;
    };
    variantId?: string | null;
    variant?: { name: string } | null;
    quantity: number;
    unitPrice: { toString(): string } | number;
    totalPrice: { toString(): string } | number;
    customization?: Record<string, unknown> | null;
    customImageUrl?: string | null;
  }>; updatedAt: Date }): CartData {
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: item.product.images[0]?.url,
      variantId: item.variantId ?? undefined,
      variantName: item.variant?.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      customization: item.customization ?? undefined,
      customImageUrl: item.customImageUrl ?? undefined,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal,
      itemCount,
      updatedAt: cart.updatedAt.toISOString(),
    };
  }
}

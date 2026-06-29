import { customAlphabet } from 'nanoid';
import type { OrderData, IOrderRepository, IOrderService } from './order.types.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import type { PricingEngine } from '../cart/pricing.engine.js';
import type { PaginatedResult } from '../../shared/types/index.js';

// Generate order number: F41-XXXXXX (alphanumeric)
const generateOrderNumber = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

/**
 * Order service implementation
 */
export class OrderService implements IOrderService {
  private readonly repository: IOrderRepository;
  private readonly pricingEngine: typeof PricingEngine;

  constructor(repository: IOrderRepository, pricingEngine: typeof PricingEngine) {
    this.repository = repository;
    this.pricingEngine = pricingEngine;
  }

  async createOrder(
    userId: string,
    data: { addressId: string; couponCode?: string },
  ): Promise<OrderData> {
    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
                priceTiers: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Get address
    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId },
    });

    if (!address) {
      throw new NotFoundError('Address');
    }

    // Calculate pricing
    const pricingItems = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      basePrice: Number(item.unitPrice),
      priceTiers: item.product.priceTiers,
    }));

    // Get coupon if provided
    let coupon = null;
    if (data.couponCode) {
      const couponData = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      if (couponData) {
        coupon = {
          code: couponData.code,
          type: couponData.type,
          value: Number(couponData.value),
          minOrderValue: couponData.minOrderValue ? Number(couponData.minOrderValue) : null,
          maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : null,
        };
      }
    }

    // Calculate totals
    const calculation = this.pricingEngine.calculateCart(
      pricingItems,
      coupon,
      address.state,
      true, // Assume serviceable
    );

    // Reserve stock for each item
    for (const item of cart.items) {
      // Check stock availability
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      });

      if (!product || product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${product?.name || 'product'}`);
      }

      // Reserve stock
      await this.repository.reserveStock(item.productId, item.quantity);
    }

    try {
      // Create order
      const orderNumber = `F41-${generateOrderNumber()}`;
      const order = await this.repository.create({
        orderNumber,
        userId,
        subtotal: calculation.subtotal,
        discount: calculation.couponDiscount,
        shippingCharge: calculation.shippingCharge,
        total: calculation.total,
        addressSnapshot: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        couponCode: calculation.couponCode,
        items: cart.items.map((item) => ({
          productId: item.productId,
          productSnapshot: {
            name: item.product.name,
            slug: item.product.slug,
            image: item.product.images[0]?.url,
            sku: item.product.sku,
          },
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          customization: item.customization ?? undefined,
        })),
      });

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      logger.info({ orderId: order.id, orderNumber }, 'Order created');

      return this.mapOrderToData(order);
    } catch (error) {
      // Release reserved stock on failure
      for (const item of cart.items) {
        await this.repository.releaseStock(item.productId, item.quantity);
      }
      throw error;
    }
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<OrderData> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check authorization
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return this.mapOrderToData(order);
  }

  async getOrderByNumber(
    orderNumber: string,
    userId: string,
    userRole: string,
  ): Promise<OrderData> {
    const order = await this.repository.findByOrderNumber(orderNumber);

    if (!order) {
      throw new NotFoundError('Order');
    }

    // Check authorization
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return this.mapOrderToData(order);
  }

  async getUserOrders(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResult<OrderData>> {
    const result = await this.repository.findByUserId(userId, { cursor, limit });

    return {
      data: result.data.map((order) => this.mapOrderToData(order)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async updateOrderStatus(
    orderId: string,
    data: { status: string; note?: string },
    adminId: string,
  ): Promise<OrderData> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    const updatedOrder = await this.repository.updateStatus(
      orderId,
      data.status,
      data.note,
      adminId,
    );

    logger.info({ orderId, status: data.status }, 'Order status updated');

    // Fetch updated order with relations
    const fullOrder = await this.repository.findById(orderId);
    return this.mapOrderToData(fullOrder!);
  }

  async requestRefund(
    userId: string,
    orderId: string,
    data: { reason: string; videoUrl?: string },
  ): Promise<void> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to request refund for this order');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestError('Refund can only be requested for delivered orders');
    }

    if (order.refundRequest) {
      throw new BadRequestError('Refund request already exists for this order');
    }

    await prisma.refundRequest.create({
      data: {
        orderId,
        userId,
        reason: data.reason,
        videoUrl: data.videoUrl,
        status: 'PENDING',
      },
    });

    logger.info({ orderId, userId }, 'Refund request created');
  }

  async cancelOrder(userId: string, orderId: string): Promise<void> {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to cancel this order');
    }

    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }

    // Release stock for all items
    for (const item of order.items) {
      await this.repository.releaseStock(item.productId, item.quantity);
    }

    await this.repository.updateStatus(orderId, 'CANCELLED', 'Order cancelled by user');

    logger.info({ orderId }, 'Order cancelled');
  }

  private mapOrderToData(order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: { toString(): string } | number;
    discount: { toString(): string } | number;
    shippingCharge: { toString(): string } | number;
    total: { toString(): string } | number;
    addressSnapshot: Record<string, string>;
    couponCode?: string | null;
    items: Array<{
      id: string;
      productId: string;
      productSnapshot: Record<string, unknown>;
      quantity: number;
      unitPrice: { toString(): string } | number;
      totalPrice: { toString(): string } | number;
      customization?: Record<string, unknown> | null;
    }>;
    payment?: {
      status: string;
      method?: string | null;
      razorpayOrderId: string;
    } | null;
    placedAt: Date;
    paidAt?: Date | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
  }): OrderData {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      total: Number(order.total),
      addressSnapshot: {
        line1: order.addressSnapshot.line1,
        line2: order.addressSnapshot.line2,
        city: order.addressSnapshot.city,
        state: order.addressSnapshot.state,
        pincode: order.addressSnapshot.pincode,
      },
      couponCode: order.couponCode ?? undefined,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: String(item.productSnapshot.name || ''),
        productImage: String(item.productSnapshot.image || ''),
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        customization: item.customization ?? undefined,
      })),
      payment: order.payment
        ? {
            status: order.payment.status,
            method: order.payment.method ?? undefined,
            razorpayOrderId: order.payment.razorpayOrderId,
          }
        : undefined,
      placedAt: order.placedAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
    };
  }
}

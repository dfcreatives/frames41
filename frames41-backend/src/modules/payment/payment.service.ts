import type { Payment } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { razorpayClient } from '../../infrastructure/external/razorpay.client.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';

/**
 * Payment service
 */
export class PaymentService {
  /**
   * Create Razorpay order for our order
   */
  async createRazorpayOrder(orderId: string, userId: string): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.userId !== userId) {
      throw new UnauthorizedError('You do not have permission to pay for this order');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestError('Order is not in pending status');
    }

    // If payment already exists and is pending, return existing
    if (order.payment && order.payment.status === 'PENDING') {
      return {
        razorpayOrderId: order.payment.razorpayOrderId,
        amount: Number(order.total),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || '',
      };
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayClient.createOrder(
      Number(order.total),
      order.orderNumber,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    );

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        status: 'PENDING',
      },
    });

    logger.info({ orderId, razorpayOrderId: razorpayOrder.id }, 'Razorpay order created');

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: Number(order.total),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || '',
    };
  }

  /**
   * Verify and capture payment
   */
  async verifyPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<void> {
    // Verify signature
    const isValid = razorpayClient.verifySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );

    if (!isValid) {
      throw new UnauthorizedError('Invalid payment signature');
    }

    // Get payment record
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: data.orderId,
        razorpayOrderId: data.razorpayOrderId,
      },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestError('Payment already processed');
    }

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpayClient.fetchPayment(data.razorpayPaymentId);

    if (razorpayPayment.status !== 'captured') {
      throw new BadRequestError('Payment not captured');
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        status: 'CAPTURED',
        method: razorpayPayment.method,
        capturedAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Confirm stock deduction (already reserved)
    for (const item of payment.order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    logger.info({ orderId: data.orderId, paymentId: data.razorpayPaymentId }, 'Payment verified and captured');
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string, userId: string): Promise<Payment | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (order.userId !== userId) {
      throw new UnauthorizedError('You do not have permission to view this payment');
    }

    return prisma.payment.findUnique({
      where: { orderId },
    });
  }
}

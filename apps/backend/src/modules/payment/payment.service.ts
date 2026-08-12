import type { Payment } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { razorpayClient } from '../../infrastructure/external/razorpay.client.js';
import { env } from '../../config/env.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../../shared/errors/AppError.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';

const RAZORPAY_MINIMUM_AMOUNT_IN_PAISE = 100;
const RAZORPAY_MINIMUM_AMOUNT_IN_INR = RAZORPAY_MINIMUM_AMOUNT_IN_PAISE / 100;
const PARTIAL_COD_ADVANCE_RATIO = 0.5;

/**
 * Payment service
 */
export class PaymentService {
  async placeCashOnDelivery(orderId: string, userId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) throw new NotFoundError('Order');
    if (order.userId !== userId) {
      throw new UnauthorizedError('You do not have permission to place this order');
    }
    if (order.status === 'PROCESSING' && order.payment?.method === 'cod') return;
    if (order.status !== 'PENDING') {
      throw new BadRequestError('Order is not in pending status');
    }

    await prisma.$transaction([
      prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          razorpayOrderId: `cod-${orderId}`,
          amount: order.total,
          status: 'PENDING',
          method: 'cod',
        },
        update: {
          status: 'PENDING',
          method: 'cod',
          razorpayPaymentId: null,
          razorpaySignature: null,
          capturedAt: null,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'PROCESSING',
          note: 'Cash on delivery order confirmed',
        },
      }),
    ]);

    logger.info({ orderId }, 'Cash on delivery order placed');
  }

  /**
   * Create Razorpay order for our order
   */
  async createRazorpayOrder(orderId: string, userId: string, partial = false): Promise<{
    razorpayOrderId: string;
    amount: number;
    amountInPaise: number;
    currency: string;
    keyId: string;
    orderNumber: string;
    isPartial: boolean;
    codDueAmount: number;
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

    const keyId = env.RAZORPAY_KEY_ID?.trim();
    const keySecret = env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      throw new BadRequestError('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend .env file.');
    }

    const orderTotal = Number(order.total);
    const amount = partial ? Math.round(orderTotal * PARTIAL_COD_ADVANCE_RATIO * 100) / 100 : orderTotal;
    const amountInPaise = Math.round(amount * 100);
    const codDueAmount = Math.round((orderTotal - amount) * 100) / 100;
    if (!Number.isFinite(amount) || amountInPaise < RAZORPAY_MINIMUM_AMOUNT_IN_PAISE) {
      throw new BadRequestError(
        `Razorpay payments require an order total of at least INR ${RAZORPAY_MINIMUM_AMOUNT_IN_INR.toFixed(2)}`,
        'PAYMENT_AMOUNT_TOO_LOW',
      );
    }

    // If a Razorpay payment already exists, is pending, and matches the requested payment mode, return it.
    if (
      order.payment &&
      order.payment.status === 'PENDING' &&
      order.payment.isPartial === partial &&
      !order.payment.razorpayOrderId.startsWith('cod-')
    ) {
      return {
        razorpayOrderId: order.payment.razorpayOrderId,
        amount: Number(order.payment.amount),
        amountInPaise: Math.round(Number(order.payment.amount) * 100),
        currency: 'INR',
        keyId,
        orderNumber: order.orderNumber,
        isPartial: order.payment.isPartial,
        codDueAmount,
      };
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayClient.createOrder(
      amount,
      order.orderNumber,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    );

    // Create payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount,
        isPartial: partial,
        status: 'PENDING',
      },
      update: {
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: null,
        razorpaySignature: null,
        amount,
        isPartial: partial,
        status: 'PENDING',
        method: null,
        capturedAt: null,
      },
    });

    logger.info({ orderId, razorpayOrderId: razorpayOrder.id, partial }, 'Razorpay order created');

    return {
      razorpayOrderId: razorpayOrder.id,
      amount,
      amountInPaise,
      currency: 'INR',
      keyId,
      orderNumber: order.orderNumber,
      isPartial: partial,
      codDueAmount,
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
    userId: string;
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

    if (payment.order.userId !== data.userId) {
      throw new UnauthorizedError('You do not have permission to verify this payment');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestError('Payment already processed');
    }

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpayClient.fetchPayment(data.razorpayPaymentId);

    if (razorpayPayment.order_id !== data.razorpayOrderId) {
      throw new BadRequestError('Payment does not belong to this Razorpay order');
    }

    if (razorpayPayment.status !== 'captured') {
      throw new BadRequestError('Payment not captured');
    }

    const expectedAmountInPaise = Math.round(Number(payment.amount) * 100);
    if (razorpayPayment.amount !== expectedAmountInPaise) {
      throw new BadRequestError('Payment amount does not match order total');
    }

    const codDueAmount = payment.isPartial
      ? Math.max(0, Math.round((Number(payment.order.total) - Number(payment.amount)) * 100) / 100)
      : 0;
    const orderStatus = payment.isPartial ? 'PROCESSING' : 'PAID';
    const statusNote = payment.isPartial
      ? `Advance payment (50%) verified; balance of INR ${codDueAmount.toFixed(2)} due on delivery`
      : 'Payment verified successfully';

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          status: 'CAPTURED',
          method: razorpayPayment.method,
          capturedAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: data.orderId },
        data: {
          status: orderStatus,
          paidAt: new Date(),
          codDueAmount,
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: data.orderId,
          status: orderStatus,
          note: statusNote,
        },
      }),
    ]);

    logger.info(
      { orderId: data.orderId, paymentId: data.razorpayPaymentId, isPartial: payment.isPartial, codDueAmount },
      'Payment verified and captured',
    );
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


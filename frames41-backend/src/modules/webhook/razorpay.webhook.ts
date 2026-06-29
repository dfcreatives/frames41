import type { Request, Response } from 'express';
import { razorpayClient } from '../../infrastructure/external/razorpay.client.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { logger } from '../../infrastructure/logger/pino.logger.js';
import { env } from '../../config/env.js';

/**
 * Razorpay webhook handler
 */
export async function handleRazorpayWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
      res.status(400).json({ error: 'Missing signature or webhook secret' });
      return;
    }

    const isValid = razorpayClient.verifyWebhookSignature(
      body,
      signature,
      env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const event = req.body;

    // Check for duplicate webhook
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: 'RAZORPAY',
          eventId: event.id,
        },
      },
    });

    if (existingEvent) {
      res.status(200).json({ message: 'Event already processed' });
      return;
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'RAZORPAY',
        eventId: event.id,
        payload: event,
        processedAt: new Date(),
      },
    });

    // Handle event
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      default:
        logger.info({ event: event.event }, 'Unhandled Razorpay webhook event');
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Razorpay webhook error');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(payment: {
  id: string;
  order_id: string;
  status: string;
  method: string;
}): Promise<void> {
  logger.info({ paymentId: payment.id }, 'Payment captured webhook received');

  // Find payment record
  const paymentRecord = await prisma.payment.findFirst({
    where: { razorpayOrderId: payment.order_id },
    include: { order: true },
  });

  if (!paymentRecord || paymentRecord.status !== 'PENDING') {
    return;
  }

  // Update payment
  await prisma.payment.update({
    where: { id: paymentRecord.id },
    data: {
      razorpayPaymentId: payment.id,
      status: 'CAPTURED',
      method: payment.method,
      capturedAt: new Date(),
    },
  });

  // Update order
  await prisma.order.update({
    where: { id: paymentRecord.orderId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  // Add status history
  await prisma.orderStatusHistory.create({
    data: {
      orderId: paymentRecord.orderId,
      status: 'PAID',
      note: 'Payment confirmed via webhook',
    },
  });
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payment: {
  id: string;
  order_id: string;
  error_code?: string;
  error_description?: string;
}): Promise<void> {
  logger.info({ paymentId: payment.id }, 'Payment failed webhook received');

  // Find payment record
  const paymentRecord = await prisma.payment.findFirst({
    where: { razorpayOrderId: payment.order_id },
    include: { order: { include: { items: true } } },
  });

  if (!paymentRecord || paymentRecord.status !== 'PENDING') {
    return;
  }

  // Update payment
  await prisma.payment.update({
    where: { id: paymentRecord.id },
    data: {
      status: 'FAILED',
    },
  });

  // Release stock
  for (const item of paymentRecord.order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.quantity },
      },
    });
  }

  // Add status history
  await prisma.orderStatusHistory.create({
    data: {
      orderId: paymentRecord.orderId,
      status: 'PENDING',
      note: `Payment failed: ${payment.error_description || 'Unknown error'}`,
    },
  });
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(order: { id: string; status: string }): Promise<void> {
  logger.info({ razorpayOrderId: order.id }, 'Order paid webhook received');
  // Already handled by payment.captured event
}

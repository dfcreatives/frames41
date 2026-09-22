import { createHmac } from 'crypto';

import { env } from '../../config/env.js';
import { prisma } from '../database/prisma.client.js';
import { logger } from '../logger/pino.logger.js';

const CLIENT_ID = 'frames41';
const EVENT_TYPE = 'commerce.order.paid.v1';
const REQUEST_TIMEOUT_MS = 10_000;

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonObject
    : {};
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function toPaise(value: { toString(): string } | number): number {
  return Math.round(Number(value) * 100);
}

/**
 * Send a captured Frames41 order to DFDesk's idempotent integration endpoint.
 * The Frames41 order UUID is also the event ID, so retries cannot create
 * duplicate Desk orders.
 */
export async function syncPaidOrderToDesk(orderId: string): Promise<boolean> {
  const secret = env.DF_INTEGRATION_SECRET?.trim();
  const baseUrl = env.DF_DESK_API_URL?.trim().replace(/\/$/, '');
  if (!secret || !baseUrl) {
    logger.debug({ orderId }, 'DFDesk integration is not configured; skipping order sync');
    return false;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      payment: true,
    },
  });

  if (!order) throw new Error('Cannot sync a missing order to DFDesk');
  if (
    !order.payment ||
    order.payment.status !== 'CAPTURED' ||
    !order.payment.razorpayPaymentId ||
    !order.payment.capturedAt
  ) {
    throw new Error('Only captured Razorpay orders can be synced to DFDesk');
  }

  const address = asObject(order.addressSnapshot);
  const lineItems = order.items.map((item) => {
    const snapshot = asObject(item.productSnapshot);
    const unitPricePaise = toPaise(item.unitPrice);
    const customization = asObject(item.customization);
    const imageUrl = optionalText(snapshot.image) ?? optionalText(customization.customImageUrl);
    const variant = optionalText(snapshot.variant) ?? optionalText(customization.variant);

    return {
      id: item.id,
      productId: item.productId,
      sku: optionalText(snapshot.sku) ?? item.productId,
      name: optionalText(snapshot.name) ?? 'Frames41 product',
      ...(imageUrl ? { imageUrl } : {}),
      quantity: item.quantity,
      unitPricePaise,
      totalPricePaise: unitPricePaise * item.quantity,
      ...(variant ? { variant } : {}),
      ...(Object.keys(customization).length > 0 ? { customization } : {}),
    };
  });

  const subtotalPaise = lineItems.reduce((sum, item) => sum + item.totalPricePaise, 0);
  const totalPaise = toPaise(order.total);
  const paidPaise = toPaise(order.payment.amount);
  const shippingPaise = toPaise(order.shippingCharge) + toPaise(order.giftWrapCharge);
  const promisedDeliveryAt = new Date(
    order.placedAt.getTime() + env.DF_DESK_DELIVERY_DAYS * 24 * 60 * 60 * 1000,
  );

  const event = {
    eventId: order.id,
    eventType: EVENT_TYPE,
    eventVersion: 1,
    occurredAt: order.payment.capturedAt.toISOString(),
    source: CLIENT_ID,
    clientId: CLIENT_ID,
    correlationId: order.id,
    aggregateId: order.id,
    payload: {
      externalOrderId: order.id,
      externalOrderNumber: order.orderNumber,
      customer: {
        name: optionalText(order.user.name) ?? 'Frames41 customer',
        email: order.user.email,
        phone: optionalText(order.user.phone) ?? 'Not provided',
      },
      shippingAddress: {
        line1: optionalText(address.line1) ?? 'Not provided',
        ...(optionalText(address.line2) ? { line2: optionalText(address.line2) } : {}),
        city: optionalText(address.city) ?? 'Not provided',
        state: optionalText(address.state) ?? 'Not provided',
        pincode: optionalText(address.pincode) ?? 'Not provided',
      },
      items: lineItems,
      amounts: {
        subtotalPaise,
        discountPaise: toPaise(order.discount),
        shippingPaise,
        totalPaise,
        paidPaise,
        balanceDuePaise: Math.max(0, totalPaise - paidPaise),
        currency: 'INR',
      },
      payment: {
        provider: 'Razorpay',
        paymentId: order.payment.razorpayPaymentId,
        method: optionalText(order.payment.method) ?? 'unknown',
        isPartial: order.payment.isPartial,
        capturedAt: order.payment.capturedAt.toISOString(),
      },
      placedAt: order.placedAt.toISOString(),
      paidAt: (order.paidAt ?? order.payment.capturedAt).toISOString(),
      promisedDeliveryAt: promisedDeliveryAt.toISOString(),
      commerceStatus: order.payment.isPartial ? 'PROCESSING' : 'PAID',
    },
  };

  const body = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  const response = await fetch(`${baseUrl}/api/v1/integrations/orders/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-df-client': CLIENT_ID,
      'x-df-timestamp': timestamp,
      'x-df-signature': `sha256=${signature}`,
      'x-df-event-id': order.id,
      'x-correlation-id': order.id,
      'Idempotency-Key': order.id,
    },
    body,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const responseBody = (await response.text()).slice(0, 500);
    throw new Error(`DFDesk rejected order sync (${response.status}): ${responseBody}`);
  }

  logger.info({ orderId, orderNumber: order.orderNumber }, 'Order synced to DFDesk');
  return true;
}

/** Try immediately, then queue a retry without affecting the paid checkout. */
export async function syncPaidOrderToDeskOrQueue(orderId: string): Promise<void> {
  try {
    await syncPaidOrderToDesk(orderId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DFDesk sync error';
    logger.error({ orderId, error: message }, 'DFDesk order sync failed; queuing retry');
    try {
      await prisma.job.create({
        data: {
          type: 'desk-order-sync',
          payload: { orderId },
          status: 'PENDING',
          runAt: new Date(),
          maxAttempts: 5,
        },
      });
    } catch (queueError) {
      logger.error(
        {
          orderId,
          error: queueError instanceof Error ? queueError.message : 'Unknown queue error',
        },
        'Failed to queue DFDesk order sync retry',
      );
    }
  }
}

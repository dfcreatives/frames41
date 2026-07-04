import type { Coupon, CouponType } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

/**
 * Coupon validation result
 */
export interface CouponValidationResult {
  valid: boolean;
  code: string;
  type: string;
  value: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  message?: string;
}

/**
 * Coupon service
 */
export class CouponService {
  /**
   * Validate coupon for user
   */
  async validateCoupon(
    code: string,
    userId: string,
    orderValue: number,
  ): Promise<CouponValidationResult> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        redemptions: {
          where: { userId },
        },
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!coupon) {
      return {
        valid: false,
        code,
        type: '',
        value: 0,
        message: 'Invalid coupon code',
      };
    }

    // Check if active
    if (!coupon.isActive) {
      return {
        valid: false,
        code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Coupon is not active',
      };
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom) {
      return {
        valid: false,
        code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Coupon is not yet valid',
      };
    }
    if (now > coupon.validTo) {
      return {
        valid: false,
        code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Coupon has expired',
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon._count.redemptions >= coupon.usageLimit) {
      return {
        valid: false,
        code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'Coupon usage limit exceeded',
      };
    }

    // Check per-user limit
    if (coupon.perUserLimit && coupon.redemptions.length >= coupon.perUserLimit) {
      return {
        valid: false,
        code,
        type: coupon.type,
        value: Number(coupon.value),
        message: 'You have already used this coupon',
      };
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
      return {
        valid: false,
        code,
        type: coupon.type,
        value: Number(coupon.value),
        minOrderValue: Number(coupon.minOrderValue),
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      };
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    };
  }

  /**
   * Create coupon
   */
  async createCoupon(data: {
    code: string;
    type: string;
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom: string;
    validTo: string;
    isActive?: boolean;
  }): Promise<Coupon> {
    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type as CouponType,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Get all coupons
   */
  async getCoupons(): Promise<Coupon[]> {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

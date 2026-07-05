import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptAddress, adaptCheckoutLineItem, adaptCheckoutTotals } from '@/lib/adapters'
import type { CheckoutData } from '@/types/checkout'

const DELIVERY_METHODS = [
  { id: 'standard', name: 'Standard Delivery', duration: '5–7 business days', priceInr: null },
] as const

interface CartCalculation {
  subtotal: number
  couponDiscount: number
  couponCode?: string
  shippingCharge: number
  total: number
}

export function useCheckout() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [addresses, cart, calculation] = await Promise.all([
        api.users.getAddresses(),
        api.cart.getCart(),
        api.cart.calculate({}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any[]
      setCheckoutData({
        addresses: (addresses ?? []).map(adaptAddress),
        deliveryMethods: [...DELIVERY_METHODS],
        lineItems: (cart?.items ?? []).map(adaptCheckoutLineItem),
        totals: adaptCheckoutTotals(calculation ?? cart),
      })
      setCouponCode(null)
    } catch {
      setError('Failed to load checkout data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial data synchronization is intentionally owned by this checkout hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const createOrder = useCallback(async (addressId: string, code?: string) => {
    setOrdering(true)
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const order = await api.orders.create({ addressId, couponCode: code }) as any
      return order.id as string
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
      return null
    } finally {
      setOrdering(false)
    }
  }, [])

  const applyCoupon = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter a promo code')
    setApplyingCoupon(true)
    try {
      const calculation = await api.cart.calculate({
        couponCode: normalized,
      }) as CartCalculation
      setCheckoutData((current) => current ? {
        ...current,
        totals: adaptCheckoutTotals(calculation),
      } : current)
      setCouponCode(calculation.couponCode ?? normalized)
      return calculation.couponDiscount
    } finally {
      setApplyingCoupon(false)
    }
  }, [])

  const removeCoupon = useCallback(async () => {
    setApplyingCoupon(true)
    try {
      const calculation = await api.cart.calculate({}) as CartCalculation
      setCheckoutData((current) => current ? {
        ...current,
        totals: adaptCheckoutTotals(calculation),
      } : current)
      setCouponCode(null)
    } finally {
      setApplyingCoupon(false)
    }
  }, [])

  return {
    checkoutData,
    loading,
    ordering,
    applyingCoupon,
    couponCode,
    error,
    createOrder,
    applyCoupon,
    removeCoupon,
    refresh: load,
  }
}

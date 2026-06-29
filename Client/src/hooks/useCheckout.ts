import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptAddress, adaptCheckoutLineItem, adaptCheckoutTotals } from '@/lib/adapters'
import type { CheckoutData } from '@/types/checkout'

const DELIVERY_METHODS = [
  { id: 'standard', name: 'Standard Delivery', duration: '5–7 business days', priceInr: 0 },
  { id: 'express', name: 'Express Delivery', duration: '2–3 business days', priceInr: 99 },
] as const

export function useCheckout() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [addresses, cart] = await Promise.all([
        api.users.getAddresses(),
        api.cart.getCart(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any[]
      const data: CheckoutData = {
        addresses: (addresses ?? []).map(adaptAddress),
        deliveryMethods: [...DELIVERY_METHODS],
        lineItems: (cart?.items ?? []).map(adaptCheckoutLineItem),
        totals: adaptCheckoutTotals(cart),
      }
      setCheckoutData(data)
    } catch {
      setError('Failed to load checkout data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createOrder = useCallback(async (addressId: string, couponCode?: string) => {
    setOrdering(true)
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const order = await api.orders.create({ addressId, couponCode }) as any
      return order.id as string
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
      return null
    } finally {
      setOrdering(false)
    }
  }, [])

  return { checkoutData, loading, ordering, error, createOrder, refresh: load }
}
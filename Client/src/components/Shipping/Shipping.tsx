import { useCallback, useMemo, useReducer, useState } from 'react'
import type { CartData, CartLineItem } from '../../types/shipping'
import CartItemList from './CartItemList'
import OrderSummaryPanel from './OrderSummaryPanel'

// ─── Reducer ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'INCREMENT'; id: string }
  | { type: 'DECREMENT'; id: string }
  | { type: 'REMOVE'; id: string }

interface CartState {
  readonly quantities: Readonly<Record<string, number>>
  readonly removedIds: ReadonlySet<string>
}

function buildInitialState(items: ReadonlyArray<CartLineItem>): CartState {
  return {
    quantities: Object.fromEntries(items.map((item) => [item.id, item.quantity])),
    removedIds: new Set(),
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        quantities: {
          ...state.quantities,
          [action.id]: (state.quantities[action.id] ?? 1) + 1,
        },
      }
    case 'DECREMENT': {
      const current = state.quantities[action.id] ?? 1
      if (current <= 1) return state
      return {
        ...state,
        quantities: { ...state.quantities, [action.id]: current - 1 },
      }
    }
    case 'REMOVE':
      return { ...state, removedIds: new Set([...state.removedIds, action.id]) }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface CartCheckoutPayload {
  readonly items: ReadonlyArray<{ id: string; quantity: number }>
  readonly promoCode: string
}

interface ShippingProps {
  data: CartData
  onCheckout?: (payload: CartCheckoutPayload) => void
  onApplyPromo?: (code: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Shipping({ data, onCheckout, onApplyPromo }: ShippingProps) {
  const [cart, dispatch] = useReducer(cartReducer, data.items, buildInitialState)
  const [promoCode, setPromoCode] = useState('')

  const visibleItems = useMemo(
    () => data.items.filter((item) => !cart.removedIds.has(item.id)),
    [data.items, cart.removedIds],
  )

  const subtotalInr = useMemo(
    () =>
      visibleItems.reduce(
        (sum, item) => sum + item.priceInr * (cart.quantities[item.id] ?? item.quantity),
        0,
      ),
    [visibleItems, cart.quantities],
  )

  const handleIncrement = useCallback((id: string) => dispatch({ type: 'INCREMENT', id }), [])
  const handleDecrement = useCallback((id: string) => dispatch({ type: 'DECREMENT', id }), [])
  const handleRemove = useCallback((id: string) => dispatch({ type: 'REMOVE', id }), [])

  const handleApplyPromo = useCallback(() => {
    onApplyPromo?.(promoCode.trim())
  }, [onApplyPromo, promoCode])

  const handleCheckout = useCallback(() => {
    onCheckout?.({
      items: visibleItems.map((item) => ({
        id: item.id,
        quantity: cart.quantities[item.id] ?? item.quantity,
      })),
      promoCode: promoCode.trim(),
    })
  }, [onCheckout, visibleItems, cart.quantities, promoCode])

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-xl">
      <header className="mb-xl">
        <h1 className="font-headline text-h1 text-on-background mb-sm">Your Creative Workshop</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Review your selection of handcrafted materials and kits before starting your next project.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="lg:col-span-8">
          <CartItemList
            items={visibleItems}
            quantities={cart.quantities}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
          />
        </div>

        <OrderSummaryPanel
          charges={data.charges}
          subtotalInr={subtotalInr}
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          onApplyPromo={handleApplyPromo}
          onCheckout={handleCheckout}
        />
      </div>
    </main>
  )
}

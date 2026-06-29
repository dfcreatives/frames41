import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

interface CartContextValue {
  itemCount: number
  isLoading: boolean
  refresh: () => Promise<void>
  addItem: (productId: string, quantity: number, variantId?: string) => Promise<void>
  updateItem: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [itemCount, setItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setItemCount(0); return }
    setIsLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cart = await api.cart.getCart() as any
      setItemCount(cart.itemCount ?? 0)
    } catch {
      setItemCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { refresh() }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    await api.cart.addItem({ productId, quantity, variantId })
    await refresh()
  }, [refresh])

  const updateItem = useCallback(async (cartItemId: string, quantity: number) => {
    await api.cart.updateItem(cartItemId, { quantity })
    await refresh()
  }, [refresh])

  const removeItem = useCallback(async (cartItemId: string) => {
    await api.cart.removeItem(cartItemId)
    await refresh()
  }, [refresh])

  const clearCart = useCallback(async () => {
    await api.cart.clearCart()
    setItemCount(0)
  }, [])

  return (
    <CartContext.Provider value={{ itemCount, isLoading, refresh, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

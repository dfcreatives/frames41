import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { adaptCart } from '@/lib/adapters'
import { useAuth } from './AuthContext'
import type { CartData } from '@/types/shipping'

interface CartContextValue {
  itemCount: number
  cartData: CartData | null
  isLoading: boolean
  refresh: () => Promise<void>
  addItem: (productId: string, quantity: number, variantId?: string, customization?: Record<string, unknown>, customImageUrl?: string) => Promise<void>
  updateItem: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [itemCount, setItemCount] = useState(0)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestVersion = useRef(0)

  const setCart = useCallback((cart: unknown) => {
    const data = adaptCart(cart)
    setItemCount(data.items.length)
    setCartData(data)
  }, [])

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current
    if (!isAuthenticated) {
      setItemCount(0)
      setCartData(null)
      return
    }
    setIsLoading(true)
    try {
      const cart = await api.cart.getCart()
      if (version === requestVersion.current) setCart(cart)
    } catch {
      if (version === requestVersion.current) {
        setItemCount(0)
        setCartData(null)
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false)
    }
  }, [isAuthenticated, setCart])

  useEffect(() => { refresh() }, [refresh])

  const addItem = useCallback(async (productId: string, quantity: number, variantId?: string, customization?: Record<string, unknown>, customImageUrl?: string) => {
    const cart = await api.cart.addItem({ productId, quantity, variantId, customization, customImageUrl })
    ++requestVersion.current
    setCart(cart)
    setIsLoading(false)
  }, [setCart])

  const updateItem = useCallback(async (cartItemId: string, quantity: number) => {
    const cart = await api.cart.updateItem(cartItemId, { quantity })
    ++requestVersion.current
    setCart(cart)
    setIsLoading(false)
  }, [setCart])

  const removeItem = useCallback(async (cartItemId: string) => {
    const cart = await api.cart.removeItem(cartItemId)
    ++requestVersion.current
    setCart(cart)
    setIsLoading(false)
  }, [setCart])

  const clearCart = useCallback(async () => {
    await api.cart.clearCart()
    ++requestVersion.current
    setItemCount(0)
    setCartData({ items: [], charges: { shippingInr: 0, taxInr: 0, discountInr: 0 } })
    setIsLoading(false)
  }, [])

  const value = useMemo<CartContextValue>(() => ({
    itemCount,
    cartData,
    isLoading,
    refresh,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  }), [itemCount, cartData, isLoading, refresh, addItem, updateItem, removeItem, clearCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

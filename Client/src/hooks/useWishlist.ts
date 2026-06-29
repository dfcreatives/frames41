import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptWishlistItem } from '@/lib/adapters'
import type { WishlistItem } from '@/types/wishlist'

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set())

  const fetchWishlist = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await api.wishlist.get() as any[]
      const adapted = raw.map(adaptWishlistItem)
      setItems(adapted)
      setWishlistedIds(new Set(adapted.map((i) => i.id)))
    } catch {
      // keep state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const toggle = useCallback(async (productId: string) => {
    await api.wishlist.toggle(productId)
    await fetchWishlist()
  }, [fetchWishlist])

  const remove = useCallback(async (productId: string) => {
    await api.wishlist.remove(productId)
    setItems((prev) => prev.filter((i) => i.id !== productId))
    setWishlistedIds((prev) => { const s = new Set(prev); s.delete(productId); return s })
  }, [])

  const isWishlisted = useCallback((productId: string) => wishlistedIds.has(productId), [wishlistedIds])

  return { items, loading, toggle, remove, isWishlisted }
}

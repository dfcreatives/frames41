import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminProductListItem, AdminProductDetail, ProductFormData, PaginatedMeta } from '@/types/admin'

interface ProductFilters {
  page: number
  limit: number
  search?: string
  categoryId?: string
  isActive?: boolean
  lowStock?: boolean
}

export function useAdminProducts(filters: ProductFilters) {
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.admin.getProducts(filters)
      setProducts(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters.page, filters.limit, filters.search, filters.categoryId, filters.isActive, filters.lowStock]) // eslint-disable-line

  useEffect(() => { fetch() }, [fetch])

  const deleteProduct = useCallback(async (id: string) => {
    await api.admin.deleteProduct(id)
    await fetch()
  }, [fetch])

  const toggleActive = useCallback(async (id: string, current: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !current } : p)))
    try {
      await api.admin.updateProduct(id, { isActive: !current })
    } catch (err) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: current } : p)))
      console.error('[toggleActive] Failed to toggle active status:', err)
    }
  }, [])

  const toggleTrending = useCallback(async (id: string, nextTrending: boolean) => {
    if (nextTrending) {
      const currentTrendingCount = products.filter((p) => p.isTrending).length
      if (currentTrendingCount >= 10) {
        alert('Maximum 10 products can be marked as Trending at a time. Please untoggle another item first.')
        return
      }
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isTrending: nextTrending } : p)))
    try {
      await api.admin.updateProduct(id, { isTrending: nextTrending })
    } catch (err) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isTrending: !nextTrending } : p)))
      console.error('[toggleTrending] Failed to toggle trending status:', err)
    }
  }, [products])

  return { products, meta, loading, error, deleteProduct, toggleActive, toggleTrending, refresh: fetch }
}

export function useAdminProductDetail(id?: string) {
  const [product, setProduct] = useState<AdminProductDetail | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    api.admin.getProductById(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [id])

  const save = useCallback(async (data: ProductFormData): Promise<AdminProductDetail> => {
    if (id) {
      const updated = await api.admin.updateProduct(id, data)
      setProduct(updated)
      return updated
    }
    return api.admin.createProduct(data)
  }, [id])

  return { product, loading, error, save }
}

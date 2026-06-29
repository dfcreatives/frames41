import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { adaptProduct, adaptCategory } from '@/lib/adapters'
import type { Product, Category } from '@/types/home'

export function useHomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgetProducts, setBudgetProducts] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.categories.getTree({ onlyWithProducts: true }),
      api.products.getUnderPrice(999, { limit: 8 }),
      api.products.getProducts({ sort: 'popularity', limit: 6 }),
    ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(([cats, budget, best]: any[]) => {
        setCategories((cats ?? []).map((c: unknown, i: number) => adaptCategory(c, i)).slice(0, 6))
        setBudgetProducts((budget?.products ?? budget?.data ?? budget ?? []).map(adaptProduct))
        setBestsellers((best?.products ?? best?.data ?? best ?? []).map(adaptProduct))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { categories, budgetProducts, bestsellers, loading }
}

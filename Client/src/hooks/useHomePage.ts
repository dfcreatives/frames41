import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { adaptProduct, adaptCategory } from '@/lib/adapters'
import type { Product, Category, Banner } from '@/types/home'

export function useHomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgetProducts, setBudgetProducts] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [newCollections, setNewCollections] = useState<Product[]>([])
  const [heroBanner, setHeroBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.home.get()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((home: any) => {
        const cats = home.categories ?? []
        const budget = home.budgetProducts ?? []
        const best = home.bestsellers ?? []
        const recent = home.newCollections ?? []
        setCategories((cats ?? []).map((c: unknown, i: number) => adaptCategory(c, i)))
        setBudgetProducts((budget?.products ?? budget?.data ?? budget ?? []).map(adaptProduct))
        setBestsellers((best?.products ?? best?.data ?? best ?? []).map(adaptProduct))
        setNewCollections((recent?.products ?? recent?.data ?? recent ?? []).map(adaptProduct).slice(0, 8))
        setHeroBanner(home.heroBanner ?? null)
      })
      .catch((err) => {
        console.error('[useHomePage] Home page data fetch failed:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  return { categories, budgetProducts, bestsellers, newCollections, heroBanner, loading }
}

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { adaptProduct } from '@/lib/adapters'
import type { Product, CategoryProductSection, Banner } from '@/types/home'

type BannerResponse = Partial<Banner> & {
  image?: string
  mobileImage?: string
}

function normalizeBanner(banner: BannerResponse): Banner | null {
  const imageUrl = banner.imageUrl ?? banner.image
  if (!banner.id || !imageUrl) return null

  return {
    id: banner.id,
    type: banner.type ?? 'HEADER_SLIDER',
    title: banner.title,
    subtitle: banner.subtitle,
    imageUrl,
    mobileImageUrl: banner.mobileImageUrl ?? banner.mobileImage,
    link: banner.link,
    sortOrder: banner.sortOrder ?? 0,
    isActive: banner.isActive ?? true,
    startDate: banner.startDate,
    endDate: banner.endDate,
  }
}

function asProductList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const obj = value as { products?: unknown[]; data?: unknown[] }
    return obj.products ?? obj.data ?? []
  }
  return []
}

export function useHomePage() {
  const [categorySections, setCategorySections] = useState<CategoryProductSection[]>([])
  const [budgetProducts, setBudgetProducts] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [newCollections, setNewCollections] = useState<Product[]>([])
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [trendingBanners, setTrendingBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.home.get().catch(() => ({})),
      api.banners.getByType('TRENDING').catch(() => []),
    ])
      .then(([homeRes, rawTrending]) => {
        if (cancelled) return
        const home = (homeRes || {}) as any

        const rawCategories = (Array.isArray(home.categories) ? home.categories : []) as any[]
        const bestList = asProductList(home.bestsellers)
        const newList = asProductList(home.newCollections)
        const budgetList = asProductList(home.budgetProducts)
        const allRawProducts = [...bestList, ...newList, ...budgetList]

        let mergedProducts = allRawProducts
        try {
          const rawOver = localStorage.getItem('admin_product_overrides')
          if (rawOver) {
            const overrides: Record<string, { isActive?: boolean; isTrending?: boolean; trendingBannerUrl?: string }> = JSON.parse(rawOver)
            mergedProducts = allRawProducts.map((p: any) => {
              const ov = overrides[p.id]
              if (!ov) return p
              return {
                ...p,
                ...(ov.isActive !== undefined ? { isActive: ov.isActive } : {}),
                ...(ov.isTrending !== undefined ? { isTrending: ov.isTrending } : {}),
                ...(ov.trendingBannerUrl !== undefined ? { trendingBannerUrl: ov.trendingBannerUrl } : {}),
              }
            })
          }
        } catch {
          // ignore
        }

        const activeMap = new Map(mergedProducts.map((p: any) => [p.id, p]))

        const filterActive = (list: any[]) =>
          list
            .map((p: any) => activeMap.get(p.id) || p)
            .filter((p: any) => p.isActive !== false)

        const activeBestList = filterActive(bestList)
        const activeNewList = filterActive(newList)
        const activeBudgetList = filterActive(budgetList)

        const sections = rawCategories
          .map((cat: any) => {
            const explicit = Array.isArray(cat.products) ? cat.products : []
            const matched = mergedProducts.filter((p: any) => p.categoryId === cat.id)
            const items = filterActive(explicit.length > 0 ? explicit : matched)
            return {
              id: cat.id,
              slug: cat.slug ?? cat.id,
              title: cat.name,
              products: items.map(adaptProduct),
            }
          })
          .filter((section: CategoryProductSection) => section.products.length > 0)

        setCategorySections(sections)
        setBudgetProducts(activeBudgetList.map(adaptProduct))
        setBestsellers(activeBestList.map(adaptProduct))
        setNewCollections(activeNewList.map(adaptProduct).slice(0, 8))

        const homeBanners = home.heroBanners ?? (home.heroBanner ? [home.heroBanner] : [])
        setHeroBanners(
          (homeBanners as BannerResponse[])
            .map(normalizeBanner)
            .filter((banner): banner is Banner => banner !== null)
            .sort((a, b) => a.sortOrder - b.sortOrder),
        )

        // Filter up to 10 products explicitly marked as Trending AND Active
        const trendingProds: any[] = mergedProducts.filter((p: any) => (p.isTrending || p.trendingBannerUrl) && p.isActive !== false).slice(0, 10)
        if (trendingProds.length > 0) {
          const productBanners: Banner[] = trendingProds.map((prod, idx) => ({
            id: `trending-prod-${prod.id || idx}`,
            type: 'TRENDING',
            title: prod.name,
            subtitle: prod.shortDescription || prod.name,
            imageUrl: prod.trendingBannerUrl || (Array.isArray(prod.imageUrls) ? prod.imageUrls[0] : undefined) || (prod.images && prod.images[0]?.url) || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=85',
            mobileImageUrl: prod.trendingBannerUrl || (Array.isArray(prod.imageUrls) ? prod.imageUrls[0] : undefined) || (prod.images && prod.images[0]?.url),
            link: `/product/${prod.slug}`,
            sortOrder: idx,
            isActive: true,
          }))
          setTrendingBanners(productBanners)
        } else if (Array.isArray(rawTrending) && rawTrending.length > 0) {
          setTrendingBanners(
            (rawTrending as BannerResponse[])
              .map(normalizeBanner)
              .filter((banner): banner is Banner => banner !== null && banner.isActive)
              .slice(0, 10)
              .sort((a, b) => a.sortOrder - b.sortOrder),
          )
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('[useHomePage] Home page data fetch failed:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const allProducts = [...bestsellers, ...newCollections, ...budgetProducts]
  return { categorySections, budgetProducts, bestsellers, newCollections, heroBanners, trendingBanners, allProducts, loading }
}

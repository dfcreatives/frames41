import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { adaptProduct, adaptCategory } from '@/lib/adapters'
import type { Product, Category, Banner } from '@/types/home'

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

export function useHomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgetProducts, setBudgetProducts] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [newCollections, setNewCollections] = useState<Product[]>([])
  const [heroBanners, setHeroBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.home.get(),
      api.banners.getByType('HEADER_SLIDER'),
    ])
      .then(([homeResult, bannersResult]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const home: any = homeResult.status === 'fulfilled' ? homeResult.value : {}
        const cats = home.categories ?? []
        const budget = home.budgetProducts ?? []
        const best = home.bestsellers ?? []
        const recent = home.newCollections ?? []
        setCategories((cats ?? []).map((c: unknown, i: number) => adaptCategory(c, i)))
        setBudgetProducts((budget?.products ?? budget?.data ?? budget ?? []).map(adaptProduct))
        setBestsellers((best?.products ?? best?.data ?? best ?? []).map(adaptProduct))
        setNewCollections((recent?.products ?? recent?.data ?? recent ?? []).map(adaptProduct).slice(0, 8))

        const homeBanners = home.heroBanners ?? (home.heroBanner ? [home.heroBanner] : [])
        const rawBanners = bannersResult.status === 'fulfilled'
          ? bannersResult.value
          : homeBanners
        const normalizedBanners = (rawBanners as BannerResponse[])
          .map(normalizeBanner)
          .filter((banner): banner is Banner => banner?.type === 'HEADER_SLIDER')
          .sort((a, b) => a.sortOrder - b.sortOrder)
        setHeroBanners(normalizedBanners)

        if (homeResult.status === 'rejected') {
          console.error('[useHomePage] Home page data fetch failed:', homeResult.reason)
        }
        if (bannersResult.status === 'rejected') {
          console.error('[useHomePage] Header banners fetch failed:', bannersResult.reason)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return { categories, budgetProducts, bestsellers, newCollections, heroBanners, loading }
}

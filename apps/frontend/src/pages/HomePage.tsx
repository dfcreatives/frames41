import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import CategoryProductsSection from '../components/home/CategoryProductsSection'
import BudgetSection from '../components/home/BudgetSection'
import NewCollectionsSection from '../components/home/NewCollectionsSection'
import BestsellersSection from '../components/home/BestsellersSection'
import CustomerReviewsSection from '../components/home/CustomerReviewsSection'
import NewsletterStrip from '../components/home/NewsletterStrip'
import Footer from '@/components/layout/Footer'
import WelcomeOfferModal from '@/components/ui/WelcomeOfferModal'
import ProductSectionShimmer from '../components/ui/ProductSectionShimmer'
import { useHomePage } from '../hooks/useHomePage'
import {
  NAV_LINKS,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
} from '../constants/home'

import TrendingBannerSection from '../components/home/TrendingBannerSection'

export default function HomePage() {
  const { categorySections, budgetProducts, bestsellers, newCollections, trendingBanners, loading } = useHomePage()

  return (
    <>
      <AnnouncementBar />
      <Navbar links={NAV_LINKS} />
      <main id="main-content">
        {/* Top 519px Full-Length Trending Banner Section */}
        <TrendingBannerSection banners={trendingBanners} />

        {loading && !newCollections.length ? (
          <ProductSectionShimmer
            title="New Collections"
            eyebrow="Just In"
            count={4}
            layout="carousel"
          />
        ) : (
          <NewCollectionsSection products={newCollections} />
        )}

        {loading && !categorySections.length ? (
          <ProductSectionShimmer title="Categories" count={4} />
        ) : (
          <CategoryProductsSection sections={categorySections} />
        )}
        {loading && !budgetProducts.length ? (
          <ProductSectionShimmer title="Under ₹999" count={4} />
        ) : (
          <BudgetSection products={budgetProducts} priceLimit={999} />
        )}
        {loading && !bestsellers.length ? (
          <ProductSectionShimmer title="Bestsellers" count={3} layout="wide" />
        ) : (
          <BestsellersSection products={bestsellers} />
        )}
        <CustomerReviewsSection />
        <NewsletterStrip />
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
      <WelcomeOfferModal />
    </>
  )
}

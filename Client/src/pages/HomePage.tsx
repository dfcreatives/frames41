import { useNavigate } from 'react-router-dom'
import AnnouncementBar from '../components/home/AnnouncementBar'
import Navbar from '../components/home/Navbar'
import HeroSection from '../components/home/HeroSection'
import CategoryGrid from '../components/home/CategoryGrid'
import BudgetSection from '../components/home/BudgetSection'
import BestsellersSection from '../components/home/BestsellersSection'
import NewsletterStrip from '../components/home/NewsletterStrip'
import Footer from '../components/home/Footer'
import ChatFab from '../components/home/ChatFab'
import { useHomePage } from '../hooks/useHomePage'
import { useCart } from '../contexts/CartContext'
import {
  NAV_LINKS,
  HERO,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
} from '../constants/home'

export default function HomePage() {
  const navigate = useNavigate()
  const { categories, budgetProducts, bestsellers } = useHomePage()
  const { addItem } = useCart()

  return (
    <>
      <AnnouncementBar />
      <Navbar links={NAV_LINKS} />
      <main id="main-content">
        <HeroSection data={HERO} />
        <CategoryGrid categories={categories} />
        <BudgetSection products={budgetProducts} priceLimit={999} />
        <BestsellersSection
          products={bestsellers}
          onAddToCart={(productId) => addItem(productId, 1)}
        />
        <NewsletterStrip />
      </main>
      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
      <ChatFab onClick={() => {}} />
    </>
  )
}


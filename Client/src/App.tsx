import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import ProtectedRoute from '@/components/ui/ProtectedRoute'

// Public pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import ProductListingPage from '@/pages/ProductListingPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import SearchPage from '@/pages/SearchPage'
import BlogPage from '@/pages/BlogPage'
import FAQPage from '@/pages/FAQPage'
import GiftCardsPage from '@/pages/GiftCardsPage'
import ShippingInfoPage from '@/pages/ShippingInfoPage'
import BulkOrdersPage from '@/pages/BulkOrdersPage'

// Protected pages
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import PaymentPage from '@/pages/PaymentPage'
import OrderConfirmPage from '@/pages/OrderConfirmPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderTrackingPage from '@/pages/OrderTrackingPage'
import ProfilePage from '@/pages/ProfilePage'
import WishlistPage from '@/pages/WishlistPage'
import ReviewPage from '@/pages/ReviewPage'
import ReferPage from '@/pages/ReferPage'

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shop" element={<ProductListingPage />} />
            <Route path="/shop/:slug" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/gift-cards" element={<GiftCardsPage />} />
            <Route path="/shipping" element={<ShippingInfoPage />} />
            <Route path="/contact/bulk" element={<BulkOrdersPage />} />
            <Route path="/shop/bestsellers" element={<ProductListingPage />} />

            <Route path="/cart" element={<P><CartPage /></P>} />
            <Route path="/checkout" element={<P><CheckoutPage /></P>} />
            <Route path="/payment/:orderId" element={<P><PaymentPage /></P>} />
            <Route path="/order-confirm/:orderId" element={<P><OrderConfirmPage /></P>} />
            <Route path="/orders" element={<P><OrdersPage /></P>} />
            <Route path="/orders/:orderNumber" element={<P><OrderTrackingPage /></P>} />
            <Route path="/profile" element={<P><ProfilePage /></P>} />
            <Route path="/wishlist" element={<P><WishlistPage /></P>} />
            <Route path="/reviews" element={<P><ReviewPage /></P>} />
            <Route path="/refer" element={<P><ReferPage /></P>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

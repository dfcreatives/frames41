import { useNavigate } from 'react-router-dom'
import { useCartData } from '@/hooks/useCartData'
import { useCart } from '@/contexts/CartContext'
import Shipping from '@/components/Shipping/Shipping'
import { NAV_LINKS } from '@/constants/home'
import Navbar from '@/components/home/Navbar'

export default function CartPage() {
  const navigate = useNavigate()
  const { cartData, loading, applyPromo } = useCartData()
  const { updateItem, removeItem } = useCart()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <>
        <Navbar links={NAV_LINKS} />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
          <p className="text-[#6B6B6B]">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="text-sm text-[#800020] underline">
            Continue shopping
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <Shipping
        data={cartData}
        onCheckout={() => navigate('/checkout')}
        onApplyPromo={applyPromo}
      />
    </>
  )
}


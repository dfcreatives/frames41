import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCheckout } from '@/hooks/useCheckout'
import Checkout from '@/components/checkout/checkout'
import type { AddressFormData } from '@/components/checkout/AddressFormInline'
import { api } from '@/lib/api'
import { NAV_LINKS } from '@/constants/home'
import Navbar from '@/components/home/Navbar'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    checkoutData, loading, ordering, applyingCoupon, couponCode, error,
    createOrder, applyCoupon, removeCoupon, refresh,
  } = useCheckout()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
        <p className="text-red-600 text-sm">{error ?? 'Failed to load checkout'}</p>
        <button onClick={() => navigate('/cart')} className="text-sm text-[#800020] underline">
          Back to cart
        </button>
      </div>
    )
  }

  const defaultAddress = checkoutData.addresses[0]?.id ?? ''

  async function handleSaveAddress(data: AddressFormData) {
    await api.users.createAddress({
      line1: data.line1,
      line2: data.line2 || undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: data.isDefault,
    })
    toast.success('Address saved')
    await refresh()
  }

  return (
    <>
      <Navbar links={NAV_LINKS} />
      <Checkout
        data={checkoutData}
        defaultAddressId={defaultAddress}
        defaultDeliveryId="standard"
        isProceeding={ordering}
        onProceedToPayment={async ({ addressId }) => {
          const orderId = await createOrder(addressId, couponCode ?? undefined)
          if (orderId) navigate(`/payment/${orderId}`)
        }}
        onEditAddress={() => navigate('/profile')}
        onSaveAddress={handleSaveAddress}
        couponCode={couponCode}
        applyingCoupon={applyingCoupon}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={removeCoupon}
      />
      {ordering && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-8 py-6 text-sm">Placing your order…</div>
        </div>
      )}
      {error && <p className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 text-xs px-4 py-2 rounded-lg">{error}</p>}
    </>
  )
}

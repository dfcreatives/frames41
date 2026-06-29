import { useParams, useNavigate } from 'react-router-dom'
import { useProductDetailData } from '@/hooks/useProductDetail'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/hooks/useWishlist'
import ProductDetail from '@/components/ProductDetail/ProductDetail'

export default function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { product, loading, error } = useProductDetailData(slug)
  const { addItem } = useCart()
  const { toggle } = useWishlist()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#6B6B6B]">{error ?? 'Product not found'}</p>
        <button onClick={() => navigate('/shop')} className="text-sm text-[#800020] underline">
          Back to shop
        </button>
      </div>
    )
  }

  return (
    <ProductDetail
      data={{ ...product, reviews: { ...product.reviews, breakdown: product.reviews.breakdown.map(b => ({ ...b, percentage: b.percentage ?? 0 })) } }}
      onAddToCart={({ productId, quantity }) => addItem(productId, quantity)}
      onWishlistToggle={(productId) => toggle(productId)}
      onRelatedProductClick={(id) => navigate(`/shop/${id}`)}
      onViewAllRelated={() => navigate('/shop')}
      onWriteReview={() => navigate(`/reviews?product=${product.id}`)}
    />
  )
}

import { useState, useCallback, useEffect } from 'react'
import type { ProductData } from '../../types/productDetail'
import { useProductDetail } from './hooks/useProductDetail'
import ProductActions from './ProductActions'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import ProductTabs from './ProductTabs'
import RelatedProducts from './RelatedProducts'
import ReviewSummary from './ReviewSummary'

export interface AddToCartPayload {
  readonly productId: string
  readonly quantity: number
  readonly customization?: { wishes?: string }
  readonly customImageUrl?: string
}

interface ProductDetailProps {
  readonly data: ProductData
  onAddToCart?: (payload: AddToCartPayload) => Promise<unknown>
  onWishlistToggle?: (productId: string, wishlisted: boolean) => void
  onRelatedProductClick?: (productId: string) => void
  onViewAllRelated?: () => void
  onWriteReview?: () => void
}

export default function ProductDetail({
  data,
  onAddToCart,
  onWishlistToggle,
  onRelatedProductClick,
  onViewAllRelated,
  onWriteReview,
}: ProductDetailProps) {
  const {
    quantity,
    activeTab,
    isWishlisted,
    increment,
    decrement,
    setActiveTab,
    toggleWishlist,
  } = useProductDetail(data.id)

  const [cartStatus, setCartStatus] = useState<'idle' | 'adding' | 'added'>('idle')
  const [photo, setPhoto] = useState<File | null>(null)
  const [wishes, setWishes] = useState('')
  const [customizationError, setCustomizationError] = useState('')
  const isPhotoFrame = data.categorySlug === 'photo-frames'
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const handleAddToCart = useCallback(async () => {
    if (!onAddToCart || cartStatus !== 'idle') return
    if (isPhotoFrame && !photo) {
      setCustomizationError('Please upload the photo you want framed.')
      return
    }
    setCartStatus('adding')
    try {
      let customImageUrl: string | undefined
      if (photo) {
        const { api } = await import('../../lib/api')
        customImageUrl = (await api.cart.uploadPhoto(photo)).url
      }
      await onAddToCart({
        productId: data.id,
        quantity,
        customImageUrl,
        customization: wishes.trim() ? { wishes: wishes.trim() } : undefined,
      })
      setCartStatus('added')
      setTimeout(() => setCartStatus('idle'), 2000)
    } catch {
      if (isPhotoFrame) setCustomizationError('We could not upload this photo. Please try again.')
      setCartStatus('idle')
    }
  }, [onAddToCart, data.id, quantity, cartStatus, isPhotoFrame, photo, wishes])

  const handleWishlistToggle = useCallback(() => {
    const next = !isWishlisted
    toggleWishlist()
    onWishlistToggle?.(data.id, next)
  }, [isWishlisted, toggleWishlist, onWishlistToggle, data.id])

  return (
    <main id="main-content" className="max-w-container mx-auto px-4 pb-16 pt-6 sm:px-6 sm:pb-xl sm:pt-8">
      {/* Gallery + product info */}
      <div className="grid grid-cols-1 items-start gap-8 rounded-2xl border border-outline-variant/40 bg-background p-4 shadow-sm sm:gap-xl sm:p-6 lg:grid-cols-12 lg:p-8">
        <ProductGallery images={data.images} />

        <section aria-label="Product information" className="lg:col-span-5 flex flex-col gap-8">
          <ProductInfo
            name={data.name}
            priceInr={data.priceInr}
            inStock={data.inStock}
            reviewAverage={data.reviews.average}
            reviewCount={data.reviews.count}
            description={data.description}
            features={data.features}
          />
          <ProductActions
            showPhotoCustomization={isPhotoFrame}
            photo={photo}
            photoPreview={photoPreview}
            wishes={wishes}
            customizationError={customizationError}
            onPhotoChange={(file) => {
              if (file && file.size > 200 * 1024 * 1024) {
                setPhoto(null)
                setCustomizationError('Photo must be 200 MB or smaller.')
                return
              }
              setPhoto(file)
              setCustomizationError('')
            }}
            onWishesChange={setWishes}
            quantity={quantity}
            isWishlisted={isWishlisted}
            shippingNote={data.shippingNote}
            shippingDuration={data.shippingDuration}
            cartStatus={cartStatus}
            onIncrement={increment}
            onDecrement={decrement}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        </section>
      </div>

      {/* Tabs + review summary */}
      <section
        aria-labelledby="details-heading"
        className="mt-12 sm:mt-xl grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-xl border-t border-outline-variant pt-12 sm:pt-xl"
      >
        <h2 id="details-heading" className="sr-only">
          Product details and reviews
        </h2>
        <div className="lg:col-span-8">
          <ProductTabs tabs={data.tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="lg:col-span-4">
          <ReviewSummary reviews={data.reviews} onWriteReview={onWriteReview} />
        </div>
      </section>

      <RelatedProducts
        products={data.relatedProducts}
        onProductClick={onRelatedProductClick}
        onViewAll={onViewAllRelated}
      />
    </main>
  )
}

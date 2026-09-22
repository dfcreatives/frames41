import { useRef, useState } from 'react'
import type { ProductImage } from '../../types/productDetail'
import { getOptimizedImageUrl } from '@/utils/image'
import Icon from '../ui/Icon'
import OptimizedImage from '../ui/OptimizedImage'

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>
}

const ZOOM_LEVEL = 2.8
const LENS_SIZE_PERCENT = 100 / ZOOM_LEVEL

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const thumbnailScrollRef = useRef<HTMLDivElement>(null)

  const selectedImage = images[selectedIndex] || images[0]
  const canZoom = !selectedImage?.isVideo
  const zoomImageUrl = selectedImage ? getOptimizedImageUrl(selectedImage.url, { width: 1600, quality: 90 }) : ''

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      thumbnailScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageContainerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    })
  }

  const lensLeft = Math.min(100 - LENS_SIZE_PERCENT, Math.max(0, zoomPosition.x - LENS_SIZE_PERCENT / 2))
  const lensTop = Math.min(100 - LENS_SIZE_PERCENT, Math.max(0, zoomPosition.y - LENS_SIZE_PERCENT / 2))

  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      {/* Main Image Viewport with Hover Lens & Zoom Window */}
      <div className="relative">
        <div
          ref={imageContainerRef}
          className="relative aspect-square rounded-2xl overflow-hidden border border-[#800020]/20 flex items-center justify-center shadow-sm lg:cursor-crosshair select-none"
          onMouseEnter={() => canZoom && setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={canZoom ? handleMouseMove : undefined}
          onClick={() => canZoom && setIsLightboxOpen(true)}
        >
          {selectedImage?.isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-surface-container">
              <Icon name="play_circle" className="text-outline text-4xl sm:text-6xl" />
            </div>
          ) : (
            <OptimizedImage
              src={selectedImage?.url}
              alt={selectedImage?.alt || 'Product image'}
              widthPreset="full"
              objectFit="cover"
              className="w-full h-full"
              loading="eager"
            />
          )}

          {/* Top-Right Badge Indicator */}
          {canZoom && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#800020] shadow-sm border border-[#800020]/20 pointer-events-none">
              <Icon name="zoom_in" className="text-sm" />
              <span>Zoom Preview</span>
            </div>
          )}

          {/* Interactive Magnifier Lens Grid */}
          {canZoom && isZooming && (
            <div
              className="hidden lg:block absolute border-2 border-primary/70 bg-primary/10 shadow-lg pointer-events-none rounded-lg"
              style={{
                left: `${lensLeft}%`,
                top: `${lensTop}%`,
                width: `${LENS_SIZE_PERCENT}%`,
                height: `${LENS_SIZE_PERCENT}%`,
                backgroundImage:
                  'linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />
          )}
        </div>

        {/* Floating Zoom Preview Box (Matches user screenshot) */}
        {canZoom && isZooming && (
          <div
            className="hidden lg:block absolute top-0 left-[103%] z-50 aspect-square w-full max-w-[540px] overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-2xl transition-opacity duration-200"
            style={{
              backgroundImage: `url(${zoomImageUrl})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: `${ZOOM_LEVEL * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
            aria-hidden="true"
          >
            {/* Header Badge on Floating Zoom Panel */}
            <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#800020] shadow border border-[#800020]/20">
              Zoom Preview
            </div>
          </div>
        )}
      </div>

      {/* Multiple Thumbnail Gallery Carousel Strip (Circled in black) */}
      {images.length > 1 && (
        <div className="relative flex items-center group">
          {/* Scroll Left Button */}
          {images.length > 5 && (
            <button
              type="button"
              onClick={() => scrollThumbnails('left')}
              aria-label="Scroll thumbnails left"
              className="absolute left-0 z-10 flex h-8 w-8 -translate-x-3 items-center justify-center rounded-full bg-white/90 text-[#800020] shadow-md border border-[#800020]/20 transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <Icon name="chevron_left" className="text-base" />
            </button>
          )}

          {/* Thumbnail Track */}
          <div
            ref={thumbnailScrollRef}
            role="tablist"
            aria-label="Product image thumbnails"
            className="flex w-full items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
          >
            {images.map((image, index) => {
              const isActive = selectedIndex === index

              return (
                <button
                  key={image.id || index}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-label={`View photo ${index + 1}`}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative aspect-square h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-[#faf8f0] p-1 border transition-all duration-200 focus:outline-none ${
                    isActive
                      ? 'border-[#800020] ring-2 ring-[#800020] scale-[1.03] shadow-sm'
                      : 'border-[#800020]/20 opacity-75 hover:opacity-100 hover:border-[#800020]/60'
                  } ${image.isVideo ? 'flex items-center justify-center bg-surface-container-high' : ''}`}
                >
                  {image.isVideo ? (
                    <Icon name="play_circle" className="text-outline text-lg" />
                  ) : (
                    <OptimizedImage
                      src={image.url}
                      alt={image.alt || `Thumbnail ${index + 1}`}
                      widthPreset="thumbnail"
                      objectFit="contain"
                      className="h-full w-full rounded-lg"
                      loading="lazy"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Scroll Right Button */}
          {images.length > 5 && (
            <button
              type="button"
              onClick={() => scrollThumbnails('right')}
              aria-label="Scroll thumbnails right"
              className="absolute right-0 z-10 flex h-8 w-8 translate-x-3 items-center justify-center rounded-full bg-white/90 text-[#800020] shadow-md border border-[#800020]/20 transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <Icon name="chevron_right" className="text-base" />
            </button>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox View */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product view"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            onClick={() => setIsLightboxOpen(false)}
          >
            <Icon name="close" className="text-2xl" />
          </button>
          <img
            src={zoomImageUrl}
            alt={selectedImage?.alt || 'Zoomed view'}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}

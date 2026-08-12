import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Banner } from '../../types/home'
import Icon from '../ui/Icon'

interface TrendingBannerSectionProps {
  banners?: Banner[]
}

const DEFAULT_TRENDING_BANNER: Banner = {
  id: 'trending-default-001',
  type: 'TRENDING',
  title: 'Personalized Acrylic Couple Photo Frame',
  subtitle: 'Handcrafted premium acrylic cutout with custom names & LED illumination.',
  imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1600&q=85',
  mobileImageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=85',
  link: '/product/custom-couple-photo-desk-calendar',
  sortOrder: 0,
  isActive: true,
}

const AUTO_INTERVAL_MS = 10000 // Rotate every 10 seconds

export default function TrendingBannerSection({ banners = [] }: TrendingBannerSectionProps) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeBanners = banners.length > 0 ? banners.slice(0, 10) : [DEFAULT_TRENDING_BANNER]
  const count = activeBanners.length

  const nextSlide = useCallback(() => {
    if (count <= 1) return
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])

  const prevSlide = useCallback(() => {
    if (count <= 1) return
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (count <= 1) return
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count)
    }, AUTO_INTERVAL_MS)
  }, [count])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    startTimer()
    return () => stopTimer()
  }, [startTimer, stopTimer])

  const activeBanner = activeBanners[currentIndex] || activeBanners[0]

  const handleClick = () => {
    if (!activeBanner.link) return
    if (activeBanner.link.startsWith('http://') || activeBanner.link.startsWith('https://')) {
      window.location.href = activeBanner.link
    } else {
      navigate(activeBanner.link)
    }
  }

  return (
    <section
      className="w-full py-6 md:py-10 bg-white"
      id="trending-section"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">
              <span>🔥 Trending Now</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Featured Trending Spotlight
            </h2>
          </div>

          {count > 1 && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-bold text-gray-500">
                {currentIndex + 1} of {count}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous trending banner"
                  className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all shadow-sm active:scale-90"
                >
                  <Icon name="chevron_left" className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next trending banner"
                  className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all shadow-sm active:scale-90"
                >
                  <Icon name="chevron_right" className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 519px Height Full-Length Clickable Banner Image */}
        <div
          onClick={handleClick}
          title={activeBanner.title ? `View ${activeBanner.title}` : 'Click to view product'}
          className="group relative w-full h-[519px] overflow-hidden rounded-2xl md:rounded-3xl shadow-xl cursor-pointer transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border border-amber-500/20"
        >
          {/* Desktop Banner Image (Height: 519px) */}
          <img
            key={activeBanner.id + '-desktop'}
            src={activeBanner.imageUrl}
            alt={activeBanner.title || 'Trending Banner'}
            className="hidden sm:block w-full h-[519px] object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />

          {/* Mobile Banner Image (Height: 519px) */}
          <img
            key={activeBanner.id + '-mobile'}
            src={activeBanner.mobileImageUrl || activeBanner.imageUrl}
            alt={activeBanner.title || 'Trending Banner'}
            className="block sm:hidden w-full h-[519px] object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />

          {/* Minimal Hover Overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Pagination Dots */}
        {count > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to trending banner ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === currentIndex
                    ? 'w-8 bg-rose-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

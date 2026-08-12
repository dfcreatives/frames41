import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Banner } from '../../types/home'

interface TrendingBannerSectionProps {
  banners?: Banner[]
}

const AUTO_INTERVAL_MS = 10000 // Rotate every 10 seconds

export default function TrendingBannerSection({ banners = [] }: TrendingBannerSectionProps) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeBanners = banners.slice(0, 10)
  const count = activeBanners.length

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

  if (!activeBanner) return null

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
      className="w-full bg-white"
      id="trending-section"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      {/* Full-Bleed Clickable Banner Image — edge to edge, same aspect ratio at every breakpoint */}
      <div
        onClick={handleClick}
        title={activeBanner.title ? `View ${activeBanner.title}` : 'Click to view product'}
        className="group relative w-full aspect-[1600/519] overflow-hidden cursor-pointer"
      >
        {/* Desktop Banner Image */}
        <img
          key={activeBanner.id + '-desktop'}
          src={activeBanner.imageUrl}
          alt={activeBanner.title || 'Trending Banner'}
          className="hidden sm:block w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Mobile Banner Image */}
        <img
          key={activeBanner.id + '-mobile'}
          src={activeBanner.mobileImageUrl || activeBanner.imageUrl}
          alt={activeBanner.title || 'Trending Banner'}
          className="block sm:hidden w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Minimal Hover Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </section>
  )
}

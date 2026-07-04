import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import type { HERO } from '../../constants/home'
import type { Banner } from '../../types/home'
import Icon from '../ui/Icon'

type HeroData = typeof HERO

interface HeroSectionProps {
  data: HeroData
  banner?: Banner | null
  onExploreCta?: () => void
}

/* ─── Slide data ─── */
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=1600&q=85',
    alt: 'Handcrafted wooden photo frame on shelf',
    headline: 'Handcrafted Soul\nfor Modern Spaces',
    sub: 'Artisanal wooden frames and DIY kits, carved with precision and finished with love.',
  },
  {
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=85',
    alt: 'Artisan workshop with wood shavings',
    headline: 'Made by Hand,\nMade for You',
    sub: 'Every piece tells a story. Personalised, premium, and built to last a lifetime.',
  },
  {
    img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1600&q=85',
    alt: 'Family photo in a beautiful wooden frame',
    headline: 'Preserve Memories\nin Solid Wood',
    sub: 'Premium teak frames that turn your moments into timeless heirlooms.',
  },
] as const

const AUTO_INTERVAL_MS = 5000

export default function HeroSection({ data, banner, onExploreCta }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const hero = useMemo(() => {
    if (!banner) return data
    return {
      badge: data.badge,
      headline: banner.title || data.headline,
      subheadline: banner.subtitle || data.subheadline,
      primaryCta: data.primaryCta,
      secondaryCta: data.secondaryCta,
      imageUrl: banner.imageUrl || data.imageUrl,
      imageAlt: banner.title || data.imageAlt,
      link: banner.link,
    }
  }, [banner, data])

  /* override first slide with DB banner if available */
  const slides = useMemo(() => {
    const copy = [...SLIDES] as Array<{
      img: string
      alt: string
      headline: string
      sub: string
    }>
    if (hero.imageUrl) {
      copy[0] = { ...copy[0], img: hero.imageUrl, alt: hero.imageAlt }
    }
    return copy
  }, [hero.imageUrl, hero.imageAlt])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrent((i) => {
      if (index === i) return i
      return (index + slides.length) % slides.length
    })
  }, [slides.length])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  /* auto-advance with timer reset on manual interaction */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length)
    }, AUTO_INTERVAL_MS)
  }, [slides.length])

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

  /* touch / swipe */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const diff = touchStartX.current - e.changedTouches[0].screenX
    const threshold = 50
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrent((i) => (i + 1) % slides.length)
      } else {
        setCurrent((i) => (i - 1 + slides.length) % slides.length)
      }
      startTimer()
    }
    touchStartX.current = null
  }, [slides.length, startTimer])

  const handleManual = useCallback((action: () => void) => {
    stopTimer()
    action()
    startTimer()
  }, [startTimer, stopTimer])

  const handlePrev = useCallback(() => handleManual(prev), [handleManual, prev])
  const handleNext = useCallback(() => handleManual(next), [handleManual, next])
  const handleDot = useCallback((i: number) => handleManual(() => goTo(i)), [handleManual, goTo])

  const slide = slides[current]

  return (
    <section
      aria-labelledby="hero-heading"
      className="group relative w-full overflow-hidden aspect-[17/6] md:aspect-[16/9] md:min-h-[420px] max-h-[600px]"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 ${mounted ? 'transition-opacity duration-700 ease-in-out' : ''} ${
            i === current ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 10 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <img
            src={s.img}
            alt={s.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover"
          />
          {/* overlay: light on mobile (no text), darker on desktop */}
          <div className="absolute inset-0 bg-black/10 md:bg-black/40" />
        </div>
      ))}

      {/* Text content — hidden on mobile */}
      <div className="hidden sm:flex absolute inset-0 z-20 items-center justify-center text-center">
        <div className="max-w-3xl px-4 sm:px-6">
          <span className="mb-0.5 sm:mb-2 md:mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm sm:text-[10px] md:text-[11px]">
            {hero.badge}
          </span>

          <h1
            id="hero-heading"
            className="mb-0.5 sm:mb-2 md:mb-4 font-headline text-[14px] font-normal leading-[1.1] tracking-[-0.02em] text-white sm:text-[32px] md:text-[48px] lg:text-[64px]"
          >
            {slide.headline.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < slide.headline.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="hidden sm:block mx-auto mb-2 sm:mb-4 md:mb-6 max-w-lg text-xs leading-snug text-white/80 sm:text-sm md:text-base">
            {slide.sub}
          </p>

          <a
            href={hero.link || '#shop'}
            onClick={(e) => {
              if (!hero.link) {
                e.preventDefault()
                onExploreCta?.()
                return
              }
              if (hero.link.startsWith('#')) {
                e.preventDefault()
                const el = document.querySelector(hero.link)
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }
            }}
            className="inline-flex min-h-[24px] items-center justify-center rounded-full bg-primary px-3 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white shadow-lg transition-all hover:scale-105 hover:shadow-primary/40 sm:min-h-[40px] sm:px-6 sm:py-2 sm:text-[10px] md:min-h-[48px] md:px-8 md:py-3 md:text-xs lg:px-10 lg:text-sm"
          >
            {hero.primaryCta}
          </a>
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 top-1/2 z-30 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:left-6 sm:h-12 sm:w-12"
      >
        <Icon name="chevron_left" className="text-xl" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 top-1/2 z-30 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:right-6 sm:h-12 sm:w-12"
      >
        <Icon name="chevron_right" className="text-xl" />
      </button>

      {/* Dots — mobile (compact, inside banner edge) */}
      <div className="flex sm:hidden absolute bottom-1 left-0 right-0 z-30 items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Dots — tablet/desktop */}
      <div className="hidden sm:flex absolute bottom-2 left-0 right-0 z-30 items-center justify-center gap-2 sm:bottom-5 md:bottom-7">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

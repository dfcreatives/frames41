import { useState, useEffect } from 'react'
import Icon from './Icon'

export default function WelcomeOfferModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 20000)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('FIRST10')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShopNow = () => {
    handleClose()
    const el = document.getElementById('collections') || document.getElementById('main-content')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-offer-heading"
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close welcome offer modal"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 backdrop-blur-md transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <Icon name="close" className="text-xl" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Visual Banner Image */}
          <div className="relative min-h-[220px] md:min-h-[380px] bg-slate-900 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"
              alt="Welcome Sale Discount Offer"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-block rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow">
                Limited Time
              </span>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex flex-col justify-between p-6 sm:p-8 text-center md:text-left bg-gray-50/50">
            <div>
              {/* Badge */}
              <div className="mb-3 flex justify-center md:justify-start">
                <span className="inline-block rounded-full bg-gray-200/80 px-3.5 py-1 text-xs font-semibold text-gray-700 tracking-wide">
                  Welcome Offer
                </span>
              </div>

              {/* Heading */}
              <h2 id="welcome-offer-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                Get <span className="text-[#800020]">10% OFF</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Use this special coupon on your first purchase and save instantly.
              </p>

              {/* Coupon Box */}
              <div className="mb-6 flex items-center justify-center md:justify-start gap-2">
                <div
                  onClick={handleCopyCoupon}
                  title="Click to copy coupon code"
                  className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-white px-5 py-2.5 shadow-sm transition-all hover:border-[#800020] hover:bg-amber-50/30"
                >
                  <span className="font-mono text-base font-extrabold tracking-widest text-gray-900 group-hover:text-[#800020]">
                    FIRST10
                  </span>
                  <span className="text-[11px] font-bold text-[#800020] underline">
                    {copied ? 'Copied! ✓' : 'Copy'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {/* CTA Button */}
              <button
                type="button"
                onClick={handleShopNow}
                className="w-full rounded-xl bg-gray-900 py-3.5 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#800020] active:scale-[0.99]"
              >
                Shop Now
              </button>

              {/* Fine Print Footer */}
              <p className="mt-3 text-center text-[11px] text-gray-400">
                Valid for first order only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

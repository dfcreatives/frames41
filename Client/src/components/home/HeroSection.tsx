import type { HERO } from '../../constants/home'

type HeroData = typeof HERO

interface HeroSectionProps {
  data: HeroData
  onExploreCta?: () => void
  onWatchCta?: () => void
}

export default function HeroSection({ data, onExploreCta, onWatchCta }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[65dvh] sm:min-h-[80vh] w-full overflow-hidden bg-black"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src={data.imageUrl}
          alt={data.imageAlt}
          loading="eager"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 min-h-[65dvh] sm:min-h-[80vh] flex flex-col justify-center items-start py-16 sm:py-0">
        <span className="text-label-bold text-white mb-4 sm:mb-6 border border-white/30 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] tracking-widest">
          {data.badge}
        </span>

        <h1
          id="hero-heading"
          className="font-headline text-[36px] sm:text-[48px] md:text-[56px] lg:text-display-xl text-white max-w-3xl mb-4 sm:mb-8 leading-[1.05] sm:leading-[0.95] italic"
        >
          {data.headline.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < data.headline.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="text-body-md sm:text-body-lg text-white/80 max-w-xl mb-6 sm:mb-10">{data.subheadline}</p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExploreCta}
            className="bg-primary text-white px-6 py-3 sm:px-10 sm:py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:scale-105 transition-all"
          >
            {data.primaryCta}
          </button>
          <button
            type="button"
            onClick={onWatchCta}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            {data.secondaryCta}
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-10 left-4 right-4 sm:left-6 sm:right-6 max-w-container mx-auto hidden sm:flex items-center gap-4" aria-hidden="true">
        <div className="h-[2px] bg-white flex-1" />
        <div className="h-[2px] bg-white/20 flex-1" />
        <div className="h-[2px] bg-white/20 flex-1" />
      </div>
    </section>
  )
}

import { useState } from 'react'
import type { Category } from '../../types/home'
import Icon from '../ui/Icon'

interface CategoryCardProps {
  category: Category
}

function CategoryCard({ category }: CategoryCardProps) {
  const spanClass = category.span === 'wide' ? 'md:col-span-2' : 'md:col-span-1'
  const [imgError, setImgError] = useState(false)
  const hasImage = category.imageUrl && !imgError

  return (
    <article className={`${spanClass} group relative h-[500px] overflow-hidden`}>
      {hasImage ? (
        <img
          src={category.imageUrl}
          alt={category.imageAlt}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-300 to-neutral-400 flex items-center justify-center">
          <span className="text-neutral-500 text-sm font-medium uppercase tracking-widest">
            {category.title}
          </span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"
      />
      <div className="absolute bottom-0 left-0 p-10 w-full text-white">
        <h3 className="font-headline text-headline-md italic mb-2">{category.title}</h3>
        {category.description && (
          <p className="text-white/80 mb-6 text-sm max-w-xs">{category.description}</p>
        )}
        <a
          href={`/shop?categoryId=${category.id}`}
          className="text-[10px] font-bold uppercase tracking-widest border-b border-white pb-1 hover:opacity-80 transition-opacity"
        >
          {category.cta}
        </a>
      </div>
    </article>
  )
}

interface CategoryGridProps {
  categories: ReadonlyArray<Category>
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section
      aria-labelledby="categories-heading"
      className="py-xl max-w-container mx-auto px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4 border-b border-on-background/10 pb-8">
        <div>
          <span className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase block mb-1">
            Collections
          </span>
          <h2 id="categories-heading" className="font-headline text-headline-lg italic">
            Curated Categories
          </h2>
        </div>
        <a
          href="/shop"
          className="text-label-bold text-[12px] uppercase tracking-widest flex items-center gap-2 group"
        >
          View All
          <Icon
            name="arrow_forward"
            className="text-sm group-hover:translate-x-1 transition-transform"
          />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}

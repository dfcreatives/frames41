import type { Product } from '../../types/home'
import { formatINR } from '../../utils/format'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <a href={`/shop/${product.slug}`} className="block">
        <div className="aspect-[4/5] bg-white overflow-hidden relative mb-4">
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            loading="lazy"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 bg-primary text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              {product.badge}
            </span>
          )}
        </div>
        <div className="text-center">
          <h4 className="font-bold mb-1 group-hover:text-primary transition-colors text-background">
            {product.name}
          </h4>
          <p className="text-white/60 text-label-bold">{formatINR(product.priceInr)}</p>
        </div>
      </a>
    </article>
  )
}

interface BudgetSectionProps {
  products: ReadonlyArray<Product>
  priceLimit?: number
}

export default function BudgetSection({ products, priceLimit = 999 }: BudgetSectionProps) {
  return (
    <section
      aria-labelledby="budget-heading"
      className="bg-on-background text-background py-xl"
    >
      <div className="max-w-container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-label-bold text-primary text-[10px] tracking-[0.3em] uppercase block mb-1">
            Value Picks
          </span>
          <h2 id="budget-heading" className="font-headline text-headline-lg italic">
            Under {formatINR(priceLimit)}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

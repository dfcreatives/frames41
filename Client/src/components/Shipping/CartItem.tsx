import type { CartLineItem } from '../../types/shipping'
import { formatINR } from '../../utils/format'
import Icon from '../ui/Icon'

interface CartItemProps {
  item: CartLineItem
  quantity: number
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
}

export default function CartItem({ item, quantity, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <article className="bg-white border border-outline-variant rounded-xl p-lg flex flex-col sm:flex-row gap-lg transition-shadow hover:shadow-md">
      <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden shrink-0 bg-surface-container">
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex-grow flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-headline text-h3 text-on-background mb-xs truncate">{item.name}</h3>
            <p className="text-body-md text-on-surface-variant">{item.variant}</p>
            {item.inStock === true && (
              <div
                role="status"
                className="mt-sm inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100"
              >
                <Icon name="check_circle" filled className="text-[12px]" />
                In Stock
              </div>
            )}
          </div>
          <span className="font-headline text-h3 text-on-background shrink-0">
            {formatINR(item.priceInr)}
          </span>
        </div>

        <div className="flex justify-between items-center mt-lg">
          <div
            role="group"
            aria-label={`Quantity for ${item.name}`}
            className="flex items-center border border-on-background/10 rounded-full bg-surface p-1"
          >
            <button
              type="button"
              onClick={() => onDecrement(item.id)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-background hover:bg-on-background/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="remove" className="text-sm" />
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              className="px-4 font-bold text-on-background select-none min-w-[2rem] text-center"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-background hover:bg-on-background/5 transition-colors"
            >
              <Icon name="add" className="text-sm" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex items-center gap-1 text-on-background/40 hover:text-error transition-colors font-bold uppercase text-[10px] tracking-widest"
          >
            <Icon name="delete" className="text-sm" />
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

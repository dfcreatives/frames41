import type { PaymentOrderSummary, PaymentStatus, TrustBadge } from '../../types/payment'
import Icon from '../ui/Icon'

interface OrderSummaryPanelProps {
  formId: string
  summary: PaymentOrderSummary
  trustBadges: ReadonlyArray<TrustBadge>
  status: PaymentStatus
}

export default function OrderSummaryPanel({
  formId,
  summary,
  trustBadges,
  status,
}: OrderSummaryPanelProps) {
  const isProcessing = status === 'verifying' || status === 'processing'
  const { product, lineItems, totalLabel, totalValue } = summary

  return (
    <div className="bg-surface-container p-xl rounded-lg sticky top-32">
      <h2 className="font-headline-md text-headline-md mb-8">Order Summary</h2>

      <div className="flex gap-md mb-8">
        <div className="w-24 h-32 flex-shrink-0 bg-surface-container-highest overflow-hidden rounded-sm">
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex flex-col justify-center gap-xs">
          <p className="font-label-sm text-on-surface-variant">{product.collection}</p>
          <h4 className="font-body-lg leading-tight">{product.name}</h4>
          <p className="font-label-bold text-on-surface">Qty: {product.qty}</p>
        </div>
      </div>

      <div className="space-y-4 border-t border-outline-variant pt-lg mb-8">
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="font-body-md text-on-surface-variant">{item.label}</span>
            <span className={`font-label-bold ${item.isFree ? 'text-primary' : ''}`}>
              {item.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-on-surface pt-4">
          <span className="font-label-bold text-body-lg uppercase tracking-wider">{totalLabel}</span>
          <span className="font-headline-md text-headline-md">{totalValue}</span>
        </div>
      </div>

      {/* Links to the active payment form so this button submits it */}
      <button
        type="submit"
        form={formId}
        disabled={isProcessing}
        className="w-full bg-primary text-white font-label-bold py-lg text-body-md uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing…' : 'Pay Now'}
        <Icon name="lock" className="text-[20px]" />
      </button>

      <div className="mt-8 flex items-center justify-center gap-md text-on-surface-variant opacity-60">
        <Icon name="verified_user" className="text-[18px]" />
        <span className="font-label-sm uppercase tracking-widest">100% Secure Transaction</span>
      </div>

      <div
        className="mt-8 pt-8 border-t border-outline-variant flex justify-center items-center gap-6 grayscale opacity-40"
        aria-label="Accepted payment providers"
      >
        {trustBadges.map((badge) => (
          <img
            key={badge.alt}
            src={badge.src}
            alt={badge.alt}
            className={badge.className}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}

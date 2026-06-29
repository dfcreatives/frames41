import type { CheckoutLineItem, CheckoutTotals, DeliveryMethod } from '../../types/checkout'
import { formatINR } from '../../utils/format'

interface SummaryLineItemProps {
  item: CheckoutLineItem
}

function SummaryLineItem({ item }: SummaryLineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-20 h-24 bg-surface-container overflow-hidden shrink-0">
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-col justify-between flex-grow min-w-0">
        <div>
          <h4 className="font-headline-md text-[18px] leading-tight truncate">{item.name}</h4>
          <p className="font-label-sm text-label-sm text-secondary uppercase">{item.variant}</p>
        </div>
        <p className="font-label-bold text-label-bold">{formatINR(item.priceInr)}</p>
      </div>
    </div>
  )
}

interface OrderTotalsProps {
  totals: CheckoutTotals
  selectedDelivery: DeliveryMethod | undefined
}

function OrderTotals({ totals, selectedDelivery }: OrderTotalsProps) {
  const shippingDisplay: string =
    selectedDelivery === undefined
      ? 'Calculated at next step'
      : selectedDelivery.priceInr === null
        ? 'Complimentary'
        : formatINR(selectedDelivery.priceInr)

  const shippingAmount = selectedDelivery?.priceInr ?? 0
  const grandTotal = totals.subtotalInr + totals.taxInr + shippingAmount

  return (
    <dl className="space-y-4 pt-6 border-t border-[#E2E2DE]">
      <div className="flex justify-between font-body-md text-body-md">
        <dt className="text-secondary">Subtotal</dt>
        <dd>{formatINR(totals.subtotalInr)}</dd>
      </div>
      <div className="flex justify-between font-body-md text-body-md">
        <dt className="text-secondary">Shipping</dt>
        <dd className="text-primary">{shippingDisplay}</dd>
      </div>
      <div className="flex justify-between font-body-md text-body-md">
        <dt className="text-secondary">Tax</dt>
        <dd>{formatINR(totals.taxInr)}</dd>
      </div>
      <div className="flex justify-between font-label-bold text-[20px] pt-4 border-t border-[#E2E2DE]">
        <dt>Total</dt>
        <dd>{formatINR(grandTotal)}</dd>
      </div>
    </dl>
  )
}

interface OrderSummarySidebarProps {
  items: ReadonlyArray<CheckoutLineItem>
  totals: CheckoutTotals
  selectedDelivery: DeliveryMethod | undefined
  onProceed: () => void
  canProceed: boolean
}

export default function OrderSummarySidebar({
  items,
  totals,
  selectedDelivery,
  onProceed,
  canProceed,
}: OrderSummarySidebarProps) {
  return (
    <aside className="w-full lg:w-[400px] shrink-0" aria-label="Order summary">
      <div className="bg-white border border-[#E2E2DE] p-lg sticky top-28">
        <h2 className="font-label-bold text-label-bold uppercase tracking-[0.15em] mb-8 border-b border-[#E2E2DE] pb-4">
          Order Summary
        </h2>

        <ul className="space-y-6 mb-8" aria-label="Items in order">
          {items.map((item) => (
            <li key={item.id}>
              <SummaryLineItem item={item} />
            </li>
          ))}
        </ul>

        <OrderTotals totals={totals} selectedDelivery={selectedDelivery} />

        <button
          type="button"
          onClick={onProceed}
          disabled={!canProceed}
          className="w-full bg-primary text-white font-label-bold py-5 mt-8 uppercase tracking-widest transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90 enabled:active:scale-[0.98]"
        >
          Proceed to Payment
        </button>
        {!canProceed && (
          <p className="text-center text-[11px] text-secondary mt-2">
            Please add or select a delivery address to continue.
          </p>
        )}

        <p className="text-center font-label-sm text-[10px] text-secondary mt-6 uppercase tracking-widest">
          Secure SSL Encrypted Checkout
        </p>
      </div>
    </aside>
  )
}

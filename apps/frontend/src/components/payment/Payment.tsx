import { useMemo, useState } from 'react'
import type { OrderType, PaymentMethodId, PaymentOrderSummary, PaymentPayload, PaymentStatus } from '../../types/payment'
import { ACTIVE_FORM_ID, PICKUP_ADVANCE_RATIO, TRUST_BADGES } from '../../constants/payment'
import { NAV_LINKS } from '../../constants/home'
import Navbar from '../layout/Navbar'
import Footer from '../layout/Footer'
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '../../constants/home'
import PaymentMethodSelector from './PaymentMethodSelector'
import OrderSummaryPanel from './OrderSummaryPanel'
import FulfillmentTypeSelector from './FulfillmentTypeSelector'

const DEFAULT_METHOD: PaymentMethodId = 'razorpay'
const DEFAULT_FULFILLMENT: OrderType = 'DELIVERY'

interface PaymentProps {
  summary: PaymentOrderSummary
  onPaymentSubmit?: (method: PaymentMethodId, fulfillmentType: OrderType) => Promise<void>
  externalStatus?: PaymentStatus
}

export default function Payment({ summary, onPaymentSubmit, externalStatus }: PaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>(DEFAULT_METHOD)
  const [fulfillmentType, setFulfillmentType] = useState<OrderType>(DEFAULT_FULFILLMENT)
  const [internalStatus, setInternalStatus] = useState<PaymentStatus>('idle')
  const status = externalStatus ?? internalStatus
  const isBusy = status === 'processing' || status === 'verifying'

  const displaySummary = useMemo<PaymentOrderSummary>(() => {
    if (fulfillmentType !== 'PICKUP') return summary

    const formatInr = (value: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

    const payNow = Math.round(summary.totalAmount * PICKUP_ADVANCE_RATIO * 100) / 100
    const dueAtPickup = Math.round((summary.totalAmount - payNow) * 100) / 100

    return {
      ...summary,
      lineItems: [
        ...summary.lineItems,
        { label: 'Due at pickup', value: `−${formatInr(dueAtPickup)}` },
      ],
      totalLabel: 'Pay Now (50%)',
      totalValue: formatInr(payNow),
      totalAmount: payNow,
    }
  }, [summary, fulfillmentType])

  const handleSubmit = async (payload: PaymentPayload) => {
    if (onPaymentSubmit) {
      await onPaymentSubmit(payload.method, fulfillmentType)
      return
    }
    setInternalStatus('processing')
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))
      setInternalStatus('success')
    } catch {
      setInternalStatus('error')
    }
  }

  const handleMethodChange = (id: PaymentMethodId) => {
    if (status !== 'processing' && status !== 'verifying') {
      setSelectedMethod(id)
      if (!externalStatus) setInternalStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex flex-col">
      <Navbar links={NAV_LINKS} />

      <main className="flex-1 pt-6 sm:pt-8 pb-section max-w-container-max mx-auto w-full px-4 sm:px-6">
        <header className="mb-4 sm:mb-6">
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg mb-1 sm:mb-2">Payment Method</h1>
          <p className="font-body-md text-on-surface-variant max-w-md text-sm sm:text-body-md">
            Secure checkout powered by Frames41. Select your preferred method of payment to
            complete your order.
          </p>
        </header>

        {status === 'success' && (
          <div
            role="status"
            aria-live="polite"
            className="mb-8 p-md border border-primary bg-primary/5 font-label-bold text-primary rounded-lg"
          >
            Payment successful! Redirecting to your order confirmation…
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="mb-8 p-md border border-error bg-error/5 font-label-bold text-error rounded-lg"
          >
            Payment failed. Please try again or choose a different method.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          <section className="lg:col-span-7" aria-label="Payment method selection">
            <FulfillmentTypeSelector
              value={fulfillmentType}
              onChange={setFulfillmentType}
              disabled={isBusy}
            />

            <PaymentMethodSelector
              formId={ACTIVE_FORM_ID}
              selectedMethod={selectedMethod}
              onMethodChange={handleMethodChange}
              onSubmit={handleSubmit}
              status={status}
              totalAmount={displaySummary.totalAmount}
            />
          </section>

          <aside className="lg:col-span-5" aria-label="Order summary">
            <OrderSummaryPanel
              formId={ACTIVE_FORM_ID}
              summary={displaySummary}
              trustBadges={TRUST_BADGES}
              status={status}
              paymentMethod={selectedMethod}
            />
          </aside>
        </div>
      </main>

      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </div>
  )
}

import { useState } from 'react'
import type { PaymentMethodId, PaymentPayload, PaymentStatus } from '../../types/payment'
import { ACTIVE_FORM_ID, ORDER_SUMMARY, TRUST_BADGES } from '../../constants/payment'
import { NAV_LINKS } from '../../constants/home'
import Navbar from '../home/Navbar'
import Footer from '../home/Footer'
import { FOOTER_COLUMNS, SOCIAL_LINKS } from '../../constants/home'
import PaymentMethodSelector from './PaymentMethodSelector'
import OrderSummaryPanel from './OrderSummaryPanel'

const DEFAULT_METHOD: PaymentMethodId = 'upi'

interface PaymentProps {
  onPaymentSubmit?: () => Promise<void>
  externalStatus?: PaymentStatus
}

export default function Payment({ onPaymentSubmit, externalStatus }: PaymentProps = {}) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>(DEFAULT_METHOD)
  const [internalStatus, setInternalStatus] = useState<PaymentStatus>('idle')
  const status = externalStatus ?? internalStatus

  const handleSubmit = async (_payload: PaymentPayload) => {
    if (onPaymentSubmit) {
      await onPaymentSubmit()
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

      <main className="flex-1 pt-32 pb-section max-w-container-max mx-auto w-full px-6">
        <header className="mb-12">
          <h1 className="font-headline-lg text-headline-lg mb-4">Payment Method</h1>
          <p className="font-body-md text-on-surface-variant max-w-md">
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
            <PaymentMethodSelector
              formId={ACTIVE_FORM_ID}
              selectedMethod={selectedMethod}
              onMethodChange={handleMethodChange}
              onSubmit={handleSubmit}
              status={status}
            />
          </section>

          <aside className="lg:col-span-5" aria-label="Order summary">
            <OrderSummaryPanel
              formId={ACTIVE_FORM_ID}
              summary={ORDER_SUMMARY}
              trustBadges={TRUST_BADGES}
              status={status}
            />
          </aside>
        </div>
      </main>

      <Footer columns={FOOTER_COLUMNS} socialLinks={SOCIAL_LINKS} />
    </div>
  )
}

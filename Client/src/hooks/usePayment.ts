import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type PaymentStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error'

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function usePayment(orderId: string) {
  const { user } = useAuth()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const startPayment = useCallback(async (): Promise<boolean> => {
    setStatus('loading')
    setError(null)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setStatus('error')
      setError('Payment gateway failed to load. Please refresh and try again.')
      return false
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentOrder = await api.payments.create(orderId) as any
      setStatus('processing')

      return await new Promise((resolve) => {
        const rzp = new window.Razorpay({
          key: paymentOrder.keyId ?? paymentOrder.key_id ?? '',
          amount: paymentOrder.amount,
          currency: paymentOrder.currency ?? 'INR',
          order_id: paymentOrder.razorpayOrderId ?? paymentOrder.id,
          name: 'Frames41',
          prefill: { contact: user?.phone ?? '' },
          theme: { color: '#800020' },
          modal: {
            ondismiss: () => {
              setStatus('idle')
              resolve(false)
            },
          },
          handler: async (response) => {
            try {
              await api.payments.verify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              setStatus('success')
              resolve(true)
            } catch (err: unknown) {
              setStatus('error')
              setError(err instanceof Error ? err.message : 'Payment verification failed')
              resolve(false)
            }
          },
        })
        rzp.open()
      })
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      return false
    }
  }, [orderId, user])

  return { status, error, startPayment }
}

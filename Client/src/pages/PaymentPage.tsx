import { useParams, useNavigate } from 'react-router-dom'
import { usePayment } from '@/hooks/usePayment'
import Payment from '@/components/payment/Payment'
import type { PaymentStatus } from '@/types/payment'

const STATUS_MAP: Record<string, PaymentStatus> = {
  idle: 'idle',
  loading: 'processing',
  processing: 'verifying',
  success: 'success',
  error: 'error',
}

export default function PaymentPage() {
  const { orderId = '' } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { status, startPayment } = usePayment(orderId)

  const handlePaymentSubmit = async () => {
    const success = await startPayment()
    if (success) navigate(`/order-confirm/${orderId}`, { replace: true })
  }

  return (
    <Payment
      onPaymentSubmit={handlePaymentSubmit}
      externalStatus={STATUS_MAP[status] ?? 'idle'}
    />
  )
}

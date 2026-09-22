import type { PaymentMethodId, PaymentPayload, PaymentStatus } from '../../types/payment'
import { PAYMENT_METHODS } from '../../constants/payment'
import PaymentMethodOption from './PaymentMethodOption'
import RazorpayForm from './RazorpayForm'

interface PaymentMethodSelectorProps {
  formId: string
  selectedMethod: PaymentMethodId
  onMethodChange: (id: PaymentMethodId) => void
  onSubmit: (payload: PaymentPayload) => Promise<void>
  status: PaymentStatus
  totalAmount: number
}

export default function PaymentMethodSelector({
  formId,
  selectedMethod,
  onMethodChange,
  onSubmit,
  status,
}: PaymentMethodSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Payment methods" className="space-y-4">
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id
        return (
          <PaymentMethodOption
            key={method.id}
            method={method}
            isSelected={isSelected}
            onSelect={onMethodChange}
          >
            {isSelected ? (
              <RazorpayForm
                formId={formId}
                status={status}
                onSubmit={() => onSubmit({ method: 'razorpay' })}
              />
            ) : null}
          </PaymentMethodOption>
        )
      })}
    </div>
  )
}

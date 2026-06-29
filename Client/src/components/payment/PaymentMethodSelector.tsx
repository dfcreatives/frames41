import type { PaymentMethodId, PaymentPayload, PaymentStatus } from '../../types/payment'
import { PAYMENT_METHODS } from '../../constants/payment'
import PaymentMethodOption from './PaymentMethodOption'
import UpiForm from './UpiForm'
import CardForm from './CardForm'
import NetbankingForm from './NetbankingForm'
import WalletForm from './WalletForm'

interface PaymentMethodSelectorProps {
  formId: string
  selectedMethod: PaymentMethodId
  onMethodChange: (id: PaymentMethodId) => void
  onSubmit: (payload: PaymentPayload) => Promise<void>
  status: PaymentStatus
}

export default function PaymentMethodSelector({
  formId,
  selectedMethod,
  onMethodChange,
  onSubmit,
  status,
}: PaymentMethodSelectorProps) {
  const activeForm = (() => {
    switch (selectedMethod) {
      case 'upi':
        return (
          <UpiForm
            formId={formId}
            status={status}
            onSubmit={(vpaId) => onSubmit({ method: 'upi', vpaId })}
          />
        )
      case 'card':
        return (
          <CardForm
            formId={formId}
            status={status}
            onSubmit={(values) => onSubmit({ method: 'card', ...values })}
          />
        )
      case 'netbanking':
        return (
          <NetbankingForm
            formId={formId}
            status={status}
            onSubmit={(bankId) => onSubmit({ method: 'netbanking', bankId })}
          />
        )
      case 'wallet':
        return (
          <WalletForm
            formId={formId}
            status={status}
            onSubmit={(walletId) => onSubmit({ method: 'wallet', walletId })}
          />
        )
    }
  })()

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
            {isSelected ? activeForm : null}
          </PaymentMethodOption>
        )
      })}
    </div>
  )
}

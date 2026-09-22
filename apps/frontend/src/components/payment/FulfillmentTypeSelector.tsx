import type { OrderType } from '../../types/payment'
import { STORE_PICKUP_LOCATION } from '../../constants/payment'
import Icon from '../ui/Icon'

interface FulfillmentOption {
  readonly id: OrderType
  readonly icon: string
  readonly label: string
  readonly description: string
}

const OPTIONS: ReadonlyArray<FulfillmentOption> = [
  {
    id: 'DELIVERY',
    icon: 'local_shipping',
    label: 'Home Delivery',
    description: 'Delivered to your saved address',
  },
  {
    id: 'PICKUP',
    icon: 'storefront',
    label: 'Store Pickup',
    description: 'Collect your order from our store, free of charge',
  },
]

interface FulfillmentTypeSelectorProps {
  value: OrderType
  onChange: (type: OrderType) => void
  disabled?: boolean
}

export default function FulfillmentTypeSelector({
  value,
  onChange,
  disabled,
}: FulfillmentTypeSelectorProps) {
  return (
    <div className="mb-xl">
      <h2 className="font-label-bold text-on-surface mb-md">Delivery Options</h2>

      <div role="radiogroup" aria-label="Fulfillment method" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((option) => {
          const isSelected = value === option.id
          const handleSelect = () => {
            if (!disabled) onChange(option.id)
          }
          return (
            <div
              key={option.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={handleSelect}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  handleSelect()
                }
              }}
              className={[
                'relative bg-surface-container-lowest border-2 p-lg rounded-lg cursor-pointer',
                'transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary'
                  : 'border-surface-container-highest hover:border-outline-variant',
                disabled ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-md">
                <Icon
                  name={option.icon}
                  className={`text-[28px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}
                />
                <div>
                  <h3 className="font-label-bold text-on-surface">{option.label}</h3>
                  <p className="font-label-sm text-on-surface-variant">{option.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {value === 'PICKUP' && (
        <div className="mt-4 p-lg rounded-lg border border-outline-variant bg-surface">
          <p className="font-label-bold text-on-surface mb-1">{STORE_PICKUP_LOCATION.name}</p>
          <p className="font-label-sm text-on-surface-variant">{STORE_PICKUP_LOCATION.address}</p>
          <p className="font-label-sm text-on-surface-variant mt-1">{STORE_PICKUP_LOCATION.hours}</p>
        </div>
      )}
    </div>
  )
}

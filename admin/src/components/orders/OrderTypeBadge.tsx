import type { OrderType } from '@/types/admin'

const CONFIG: Record<OrderType, { label: string; className: string }> = {
  DELIVERY: { label: 'Delivery', className: 'bg-blue-100 text-blue-800' },
  PICKUP:   { label: 'Pickup',   className: 'bg-amber-100 text-amber-800' },
}

export default function OrderTypeBadge({ type }: { type: OrderType }) {
  const { label, className } = CONFIG[type] ?? { label: type, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}

import { useState, type FormEvent, type MouseEvent } from 'react'
import type { AddressEditData, ProfileAddress } from '../../types/profile'

interface ProfileAddressCardProps {
  address: ProfileAddress
  onSave: (id: string, data: AddressEditData) => Promise<void> | void
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
}

function stopPropagationAnd(e: MouseEvent<HTMLButtonElement>, fn: () => void) {
  e.stopPropagation()
  fn()
}

export default function ProfileAddressCard({
  address,
  onSave,
  onRemove,
  onSetDefault,
}: ProfileAddressCardProps) {
  const { id, label, fullName, line1, line2, city, state, zip, country, isDefault } = address

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formLine1, setFormLine1] = useState(line1)
  const [formLine2, setFormLine2] = useState(line2 ?? '')
  const [formCity, setFormCity] = useState(city)
  const [formState, setFormState] = useState(state)
  const [formZip, setFormZip] = useState(zip)

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setFormLine1(line1)
    setFormLine2(line2 ?? '')
    setFormCity(city)
    setFormState(state)
    setFormZip(zip)
    setIsEditing(true)
  }

  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsEditing(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(id, {
        line1: formLine1,
        line2: formLine2 || undefined,
        city: formCity,
        state: formState,
        zip: formZip,
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <article
        className="bg-white p-8 flex flex-col justify-between h-full relative rounded-2xl border-2 border-[#111110]"
        aria-label={`Editing ${label} address`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-label-bold text-label-bold uppercase mb-2 tracking-widest text-[#111110]">
            {label}
          </h3>

          <div className="space-y-1">
            <label htmlFor={`addr-line1-${id}`} className="font-label-sm text-label-sm text-[#8A8A85] uppercase">
              Address Line 1
            </label>
            <input
              id={`addr-line1-${id}`}
              type="text"
              value={formLine1}
              onChange={(e) => setFormLine1(e.target.value)}
              required
              className="w-full font-body-md text-[#111110] py-1.5 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={`addr-line2-${id}`} className="font-label-sm text-label-sm text-[#8A8A85] uppercase">
              Address Line 2
            </label>
            <input
              id={`addr-line2-${id}`}
              type="text"
              value={formLine2}
              onChange={(e) => setFormLine2(e.target.value)}
              className="w-full font-body-md text-[#111110] py-1.5 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor={`addr-city-${id}`} className="font-label-sm text-label-sm text-[#8A8A85] uppercase">
                City
              </label>
              <input
                id={`addr-city-${id}`}
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                required
                className="w-full font-body-md text-[#111110] py-1.5 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`addr-state-${id}`} className="font-label-sm text-label-sm text-[#8A8A85] uppercase">
                State
              </label>
              <input
                id={`addr-state-${id}`}
                type="text"
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                required
                className="w-full font-body-md text-[#111110] py-1.5 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor={`addr-zip-${id}`} className="font-label-sm text-label-sm text-[#8A8A85] uppercase">
              Pincode
            </label>
            <input
              id={`addr-zip-${id}`}
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={formZip}
              onChange={(e) => setFormZip(e.target.value)}
              required
              className="w-full font-body-md text-[#111110] py-1.5 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#800020] text-white px-6 py-2 font-label-bold text-label-bold uppercase tracking-widest hover:opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="border border-[#111110] px-6 py-2 font-label-bold text-label-bold uppercase tracking-widest hover:bg-[#111110] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    )
  }

  return (
    <article
      className={[
        'bg-white p-8 flex flex-col justify-between h-full relative rounded-2xl',
        isDefault
          ? 'border-2 border-[#111110]'
          : 'border border-[#E2E2DE] hover:border-[#111110] transition-colors group',
      ].join(' ')}
      aria-label={`${label} address${isDefault ? ', default' : ''}`}
    >
      {isDefault && (
        <span
          className="absolute top-4 right-4 bg-[#111110] text-white text-[10px] px-2 py-1 font-label-bold uppercase tracking-widest"
          aria-label="Default address"
        >
          Default
        </span>
      )}

      <div>
        <h3
          className={[
            'font-label-bold text-label-bold uppercase mb-4 tracking-widest',
            isDefault ? 'text-[#111110]' : 'text-[#8A8A85] group-hover:text-[#111110]',
          ].join(' ')}
        >
          {label}
        </h3>

        <address className="not-bold">
          <p className="font-body-md text-[#111110] mb-1">{fullName}</p>
          {line1 && <p className="font-body-md text-[#5f5e5d]">{line1}</p>}
          {line2 && <p className="font-body-md text-[#5f5e5d]">{line2}</p>}
          <p className="font-body-md text-[#5f5e5d]">
            {city}, {state} {zip}
          </p>
          <p className="font-body-md text-[#5f5e5d]">{country}</p>
        </address>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E2E2DE] flex gap-6 items-center">
        <button
          type="button"
          onClick={handleEditClick}
          className="font-label-bold text-label-bold uppercase text-[#111110] hover:text-[#800020] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => stopPropagationAnd(e, () => onRemove(id))}
          className="font-label-bold text-label-bold uppercase text-[#8A8A85] hover:text-error transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Remove ${label} address`}
        >
          Remove
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={(e) => stopPropagationAnd(e, () => onSetDefault(id))}
            className="ml-auto font-label-bold text-label-bold uppercase text-[#8A8A85] hover:text-[#111110] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Set ${label} as default address`}
          >
            Set as Default
          </button>
        )}
      </div>
    </article>
  )
}

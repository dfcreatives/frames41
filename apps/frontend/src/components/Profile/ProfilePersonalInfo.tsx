import { useState, type FormEvent } from 'react'
import type { ProfileUser } from '../../types/profile'

interface PersonalField {
  readonly label: string
  readonly value: string
}

interface ProfilePersonalInfoProps {
  user: ProfileUser
  onSave?: (data: { legalName: string; email: string }) => Promise<void> | void
}

function PersonalInfoField({ label, value }: PersonalField) {
  return (
    <div className="space-y-1">
      <dt className="font-label-sm text-label-sm text-[#8A8A85] uppercase">{label}</dt>
      <dd className="font-body-lg text-body-lg text-[#111110] py-2 border-b border-[#EEEEEC]">
        {value}
      </dd>
    </div>
  )
}

export default function ProfilePersonalInfo({ user, onSave }: ProfilePersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [legalName, setLegalName] = useState(user.legalName)
  const [email, setEmail] = useState(user.email)

  const fields: ReadonlyArray<PersonalField> = [
    { label: 'Legal Name', value: user.legalName },
    { label: 'Email Address', value: user.email },
    { label: 'Phone Number', value: user.phone },
    { label: 'Timezone', value: user.timezone },
  ]

  const handleEditClick = () => {
    setLegalName(user.legalName)
    setEmail(user.email)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave?.({ legalName, email })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section
      className="bg-white border border-[#E2E2DE] p-8 md:p-12"
      aria-labelledby="personal-info-heading"
    >
      <div className="flex justify-between items-center mb-10">
        <h2 id="personal-info-heading" className="font-headline-md text-headline-md">
          Personal Information
        </h2>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEditClick}
            className="flex items-center gap-2 text-[#8A8A85] hover:text-[#111110] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Edit personal information"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              edit
            </span>
            <span className="font-label-bold text-label-bold uppercase">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-1">
              <label
                htmlFor="personal-legal-name"
                className="font-label-sm text-label-sm text-[#8A8A85] uppercase"
              >
                Legal Name
              </label>
              <input
                id="personal-legal-name"
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                required
                className="w-full font-body-lg text-body-lg text-[#111110] py-2 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="personal-email"
                className="font-label-sm text-label-sm text-[#8A8A85] uppercase"
              >
                Email Address
              </label>
              <input
                id="personal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full font-body-lg text-body-lg text-[#111110] py-2 border-b border-[#E2E2DE] bg-transparent focus:outline-none focus:border-[#111110]"
              />
            </div>
            <PersonalInfoField label="Phone Number" value={user.phone} />
            <PersonalInfoField label="Timezone" value={user.timezone} />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#800020] text-white px-8 py-3 font-label-bold text-label-bold uppercase tracking-widest hover:opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="border border-[#111110] px-8 py-3 font-label-bold text-label-bold uppercase tracking-widest hover:bg-[#111110] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fields.map((field) => (
            <PersonalInfoField key={field.label} label={field.label} value={field.value} />
          ))}
        </dl>
      )}
    </section>
  )
}

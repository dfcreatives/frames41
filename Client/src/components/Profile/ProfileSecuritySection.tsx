import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function ProfileSecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!currentPassword) e.currentPassword = 'Current password is required'
    if (!newPassword) e.newPassword = 'New password is required'
    else if (newPassword.length < 8) e.newPassword = 'Must be at least 8 characters'
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.auth.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border border-outline-variant rounded-lg p-6 bg-white">
      <h2 className="font-headline text-xl text-on-background mb-6">Security & Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.currentPassword && <p className="text-xs text-error mt-1">{errors.currentPassword}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.newPassword && <p className="text-xs text-error mt-1">{errors.newPassword}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-outline-variant rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all disabled:opacity-60"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}

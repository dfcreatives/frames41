import { useProfile } from '@/hooks/useProfile'
import Profile from '@/components/Profile/Profile'

export default function ProfilePage() {
  const { profileData, loading, updateProfile, deleteAddress } = useProfile()

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Profile
      data={profileData}
      onSaveAll={({ addresses }) => {
        // Sync any removed addresses
        const currentIds = new Set(profileData.addresses.map((a) => a.id))
        addresses.forEach((a) => {
          if (!currentIds.has(a.id)) deleteAddress(a.id)
        })
        // Update name/email from profile user
        updateProfile(profileData.user)
      }}
    />
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUserProfile } from '@/lib/supabase/queries'
import { ProfileProvider } from '@/components/providers/ProfileProvider'
import BottomNav from '@/components/navigation/BottomNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch (or lazily create) the user's profile row.
  // getOrCreateUserProfile handles the edge case where the DB trigger
  // hasn't fired yet for brand-new accounts.
  const profile = await getOrCreateUserProfile(supabase, user.id, user.email)

  return (
    <ProfileProvider initialUser={user} initialProfile={profile}>
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>
        <BottomNav />
      </div>
    </ProfileProvider>
  )
}

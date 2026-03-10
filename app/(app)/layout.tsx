import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUserProfile } from '@/lib/supabase/queries'
import { ProfileProvider } from '@/components/providers/ProfileProvider'
import BottomNav from '@/components/navigation/BottomNav'
import Sidebar from '@/components/navigation/Sidebar'

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

  const profile = await getOrCreateUserProfile(supabase, user.id, user.email)

  return (
    <ProfileProvider initialUser={user} initialProfile={profile}>
      {/*
        Two-track layout:
        • Mobile  — centered "phone card" (max-w-md, white bg, shadow) + BottomNav
        • Desktop — fixed sidebar (w-64) + full-width scrollable main area
      */}
      <div className="min-h-screen bg-slate-100 lg:bg-slate-50">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content column */}
        <div
          className={[
            // Mobile: centered phone card
            'max-w-md mx-auto bg-white shadow-xl min-h-screen',
            // Desktop: full-width, shifted right of sidebar
            'lg:ml-64 lg:max-w-none lg:shadow-none lg:bg-slate-50',
          ].join(' ')}
        >
          {/* Extra bottom padding on mobile for the nav bar; none needed on desktop */}
          <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
        </div>

        {/* Mobile-only bottom nav */}
        <BottomNav />
      </div>
    </ProfileProvider>
  )
}

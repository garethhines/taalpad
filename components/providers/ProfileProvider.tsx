'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { getUserProfile } from '@/lib/supabase/queries'

interface ProfileContextValue {
  user: User | null
  profile: UserProfile | null
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  user: null,
  profile: null,
  refreshProfile: async () => {},
})

export function ProfileProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode
  initialUser: User
  initialProfile: UserProfile | null
}) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)

  const refreshProfile = useCallback(async () => {
    const supabase = createClient()
    const updated = await getUserProfile(supabase, initialUser.id)
    setProfile(updated)
  }, [initialUser.id])

  return (
    <ProfileContext.Provider value={{ user: initialUser, profile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}

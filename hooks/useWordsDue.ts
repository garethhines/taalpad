'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWordsDueCount } from '@/lib/supabase/queries'
import { useProfile } from '@/hooks/useProfile'

/** Lightweight hook — returns the count of flashcards due for review today. */
export function useWordsDue(): number {
  const { user } = useProfile()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    getWordsDueCount(supabase, user.id).then(setCount)
  }, [user?.id])

  return count
}

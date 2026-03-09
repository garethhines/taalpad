'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLearningProgress } from '@/lib/supabase/queries'
import type { LearningProgress } from '@/lib/types'

export function useLearningProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<LearningProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    getLearningProgress(supabase, userId)
      .then((data) => setProgress(data))
      .finally(() => setLoading(false))
  }, [userId])

  return { progress, loading }
}

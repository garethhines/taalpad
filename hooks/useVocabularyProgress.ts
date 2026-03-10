'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getVocabularyProgress } from '@/lib/supabase/queries'
import type { VocabularyProgress } from '@/lib/types'

export function useVocabularyProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<VocabularyProgress[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const supabase = createClient()
    const data = await getVocabularyProgress(supabase, userId)
    setProgress(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  return { progress, loading, refresh }
}

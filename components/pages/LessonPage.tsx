'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { recordLessonCompletion } from '@/lib/supabase/queries'
import { useProfile } from '@/hooks/useProfile'
import ExerciseScreen from '@/components/exercises/ExerciseScreen'
import type { CurriculumLesson } from '@/lib/types'

interface Props {
  lesson: CurriculumLesson
  unitId: string
}

export default function LessonPage({ lesson, unitId }: Props) {
  const { user, refreshProfile } = useProfile()
  const router = useRouter()

  async function handleComplete(xpEarned: number, score: number) {
    if (!user) return
    const supabase = createClient()
    await recordLessonCompletion(supabase, user.id, unitId, lesson.id, xpEarned, score)
    await refreshProfile()
  }

  return (
    <ExerciseScreen
      lesson={lesson}
      unitId={unitId}
      onComplete={handleComplete}
    />
  )
}

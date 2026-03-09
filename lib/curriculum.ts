/**
 * Merges the static curriculum data (units/lessons) with per-user
 * learning progress fetched from Supabase.
 *
 * The curriculum structure is fixed in the app; only completion
 * status and scores come from the database.
 */
import { mockUnits } from './mock-data'
import type { Unit, LearningProgress } from './types'

export function mergeUnitsWithProgress(progress: LearningProgress[]): Unit[] {
  const progressMap = new Map(progress.map((p) => [p.lesson_id, p]))

  return mockUnits.map((unit) => {
    const lessons = unit.lessons.map((lesson) => {
      const lp = progressMap.get(lesson.id)
      if (!lp) return lesson

      return {
        ...lesson,
        isCompleted: lp.status === 'completed',
        isLocked: lp.status === 'locked',
        completedAt: lp.completed_at ?? undefined,
      }
    })

    const completedCount = lessons.filter((l) => l.isCompleted).length
    const unitProgress =
      lessons.length > 0
        ? Math.round((completedCount / lessons.length) * 100)
        : 0

    return {
      ...unit,
      lessons,
      progress: unitProgress,
      isCompleted: completedCount === lessons.length && lessons.length > 0,
    }
  })
}

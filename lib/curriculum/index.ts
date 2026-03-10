/**
 * Curriculum engine — loads all levels, merges with user progress,
 * and provides helper functions for the learning path.
 */
import type {
  CurriculumLevel,
  CurriculumUnit,
  CurriculumLesson,
  LevelWithStatus,
  UnitWithStatus,
  LessonWithStatus,
  LearningProgress,
  LevelEnum,
} from '@/lib/types'

// Static curriculum data — imported at build time
import a0Data from '@/data/curriculum/a0.json'
import a1Data from '@/data/curriculum/a1.json'
import a2Data from '@/data/curriculum/a2.json'
import b1Data from '@/data/curriculum/b1.json'
import b2Data from '@/data/curriculum/b2.json'

export const ALL_LEVELS: CurriculumLevel[] = [
  a0Data as CurriculumLevel,
  a1Data as CurriculumLevel,
  a2Data as CurriculumLevel,
  b1Data as CurriculumLevel,
  b2Data as CurriculumLevel,
]

/** Flat list of all units across all levels */
export const ALL_UNITS: CurriculumUnit[] = ALL_LEVELS.flatMap((l) => l.units)

/** Flat list of all lessons across all levels */
export const ALL_LESSONS: CurriculumLesson[] = ALL_UNITS.flatMap((u) => u.lessons)

/** Look up a lesson by id */
export function getLessonById(lessonId: string): CurriculumLesson | null {
  return ALL_LESSONS.find((l) => l.id === lessonId) ?? null
}

/** Look up a unit by id */
export function getUnitById(unitId: string): CurriculumUnit | null {
  return ALL_UNITS.find((u) => u.id === unitId) ?? null
}

/** Get the unit that contains a given lesson */
export function getUnitForLesson(lessonId: string): CurriculumUnit | null {
  return ALL_UNITS.find((u) => u.lessons.some((l) => l.id === lessonId)) ?? null
}

/**
 * Merge the full curriculum tree with a user's progress records.
 *
 * Unlock rules:
 *  - The very first lesson of the very first unit is always available.
 *  - A lesson is available when the lesson immediately before it is completed.
 *  - A unit is locked if its first lesson is still locked.
 *  - A unit unlocks when the last lesson of the preceding unit is completed.
 */
export function buildLearningPath(progress: LearningProgress[]): LevelWithStatus[] {
  const progressMap = new Map(progress.map((p) => [p.lesson_id, p]))

  // Flat ordered list of all lesson ids to determine unlock chain
  const allLessonIds = ALL_LESSONS.map((l) => l.id)

  // Determine status for each lesson
  function lessonStatus(lessonId: string): 'locked' | 'available' | 'completed' {
    const record = progressMap.get(lessonId)
    if (record?.status === 'completed') return 'completed'

    const idx = allLessonIds.indexOf(lessonId)
    if (idx === 0) return 'available' // first lesson is always open
    const prevId = allLessonIds[idx - 1]
    return progressMap.get(prevId)?.status === 'completed' ? 'available' : 'locked'
  }

  // Find the first non-completed available lesson
  const currentLessonId = allLessonIds.find((id) => lessonStatus(id) === 'available') ?? null

  return ALL_LEVELS.map((level): LevelWithStatus => {
    const units: UnitWithStatus[] = level.units.map((unit): UnitWithStatus => {
      const lessons: LessonWithStatus[] = unit.lessons.map((lesson): LessonWithStatus => {
        const status = lessonStatus(lesson.id)
        const record = progressMap.get(lesson.id)
        return {
          ...lesson,
          unitId: unit.id,
          unitTitle: unit.title,
          unitColor: unit.color,
          isCompleted: status === 'completed',
          isLocked: status === 'locked',
          isCurrentLesson: lesson.id === currentLessonId,
          score: record?.score ?? null,
          completedAt: record?.completed_at ?? null,
        }
      })

      const completedLessons = lessons.filter((l) => l.isCompleted).length
      const progress =
        lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0

      return {
        ...unit,
        lessons,
        progress,
        completedLessons,
        isCompleted: completedLessons === lessons.length && lessons.length > 0,
        isLocked: lessons[0]?.isLocked ?? true,
      }
    })

    const completedUnits = units.filter((u) => u.isCompleted).length
    const isLevelCompleted = completedUnits === units.length && units.length > 0
    const isCurrent = units.some((u) => !u.isLocked && !u.isCompleted)

    return {
      id: level.id,
      title: level.title,
      description: level.description,
      color: level.color,
      units,
      isCompleted: isLevelCompleted,
      isCurrent,
    }
  })
}

/** Calculate XP reward with accuracy bonus */
export function calculateXPReward(baseXP: number, correctCount: number, totalCount: number): number {
  if (totalCount === 0) return baseXP
  const accuracy = correctCount / totalCount
  const bonus = Math.round(baseXP * 0.5 * accuracy) // up to 50% bonus
  return baseXP + bonus
}

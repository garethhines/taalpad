// ----------------------------------------------------------------
// Curriculum types (static, defined in /lib/mock-data.ts)
// ----------------------------------------------------------------

export interface Lesson {
  id: string
  title: string
  titleNl: string
  description: string
  unit: number
  order: number
  type: 'vocabulary' | 'grammar' | 'conversation' | 'listening'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  xpReward: number
  isCompleted: boolean
  isLocked: boolean
  completedAt?: string
}

export interface Unit {
  id: string
  title: string
  titleNl: string
  description: string
  order: number
  color: string
  lessons: Lesson[]
  isCompleted: boolean
  progress: number // 0-100
}

export interface FlashCard {
  id: string
  dutch: string
  english: string
  phonetic?: string
  example?: string
  exampleTranslation?: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  nextReview?: string
  interval?: number // days
  easeFactor?: number
}

export interface FlashcardDeck {
  id: string
  title: string
  description: string
  cardCount: number
  category: string
  color: string
  progress: number // 0-100
}

export interface DailyGoal {
  target: number
  current: number
  unit: 'xp' | 'minutes' | 'lessons'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt?: string
  isEarned: boolean
}

// ----------------------------------------------------------------
// Database row types (mirrors Supabase schema)
// ----------------------------------------------------------------

export type LevelEnum = 'A0' | 'A1' | 'A2' | 'B1' | 'B2'
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface UserProfile {
  id: string
  display_name: string
  current_level: LevelEnum
  total_xp: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  created_at: string
}

export interface LearningProgress {
  id: string
  user_id: string
  unit_id: string
  lesson_id: string
  status: LessonStatus
  score: number | null
  completed_at: string | null
  attempts: number
}

export interface VocabularyProgress {
  id: string
  user_id: string
  word_id: string
  familiarity: number
  next_review_date: string
  times_correct: number
  times_incorrect: number
  last_reviewed: string
}

export interface StreakHistory {
  id: string
  user_id: string
  date: string
  xp_earned: number
  lessons_completed: number
}

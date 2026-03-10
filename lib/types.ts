// ----------------------------------------------------------------
// Curriculum exercise types
// ----------------------------------------------------------------

export type ExerciseType =
  | 'multiple_choice'
  | 'translation_to_en'
  | 'translation_to_nl'
  | 'fill_blank'
  | 'word_match'
  | 'sentence_order'
  | 'listening'

export interface MultipleChoiceExercise {
  id: string
  type: 'multiple_choice'
  question: string
  dutch?: string // optional Dutch text to display above question
  options: [string, string, string, string]
  correctAnswer: string
  hint?: string
}

export interface TranslationToEnExercise {
  id: string
  type: 'translation_to_en'
  dutch: string
  correctAnswer: string
  acceptedAnswers?: string[]
  hint?: string
}

export interface TranslationToNlExercise {
  id: string
  type: 'translation_to_nl'
  english: string
  correctAnswer: string
  acceptedAnswers?: string[]
  hint?: string
}

export interface FillBlankExercise {
  id: string
  type: 'fill_blank'
  sentence: string      // contains ___ for the blank
  options: string[]     // button options (3-4 items)
  correctAnswer: string
  translation?: string  // English meaning of the full sentence
  hint?: string
}

export interface WordMatchExercise {
  id: string
  type: 'word_match'
  pairs: { dutch: string; english: string }[] // exactly 4 pairs
  hint?: string
}

export interface SentenceOrderExercise {
  id: string
  type: 'sentence_order'
  words: string[]        // shuffled word tokens
  correctAnswer: string  // correct full sentence (words joined)
  translation?: string
  hint?: string
}

export interface ListeningExercise {
  id: string
  type: 'listening'
  dutch: string           // text to be spoken via TTS
  question: string
  options: [string, string, string, string]
  correctAnswer: string
  hint?: string
}

export type Exercise =
  | MultipleChoiceExercise
  | TranslationToEnExercise
  | TranslationToNlExercise
  | FillBlankExercise
  | WordMatchExercise
  | SentenceOrderExercise
  | ListeningExercise

// ----------------------------------------------------------------
// Curriculum structure types
// ----------------------------------------------------------------

export interface CurriculumLesson {
  id: string
  title: string
  titleNl: string
  description: string
  xpReward: number
  estimatedMinutes: number
  exercises: Exercise[]
}

export interface CurriculumUnit {
  id: string
  title: string
  titleNl: string
  description: string
  theme: string
  order: number
  level: string
  color: string
  lessons: CurriculumLesson[]
}

export interface CurriculumLevel {
  id: LevelEnum
  title: string
  description: string
  color: string
  units: CurriculumUnit[]
}

// Runtime lesson — curriculum data merged with user progress
export interface LessonWithStatus extends CurriculumLesson {
  unitId: string
  unitTitle: string
  unitColor: string
  isCompleted: boolean
  isLocked: boolean
  isCurrentLesson: boolean
  score?: number | null
  completedAt?: string | null
}

export interface UnitWithStatus extends CurriculumUnit {
  progress: number        // 0-100
  isCompleted: boolean
  isLocked: boolean
  completedLessons: number
  lessons: LessonWithStatus[]
}

export interface LevelWithStatus {
  id: LevelEnum
  title: string
  description: string
  color: string
  units: UnitWithStatus[]
  isCompleted: boolean
  isCurrent: boolean
}

// ----------------------------------------------------------------
// Legacy UI types (kept for FlashCard, Achievement, DailyGoal)
// ----------------------------------------------------------------

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
  interval?: number
  easeFactor?: number
}

export interface FlashcardDeck {
  id: string
  title: string
  description: string
  cardCount: number
  category: string
  color: string
  progress: number
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
  /** Set when the user completes the placement test. NULL = started from A0. */
  placement_level: string | null
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

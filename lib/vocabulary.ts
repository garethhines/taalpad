/**
 * Vocabulary bank helpers.
 * Words are static data from data/vocabulary-bank.json.
 * Progress (familiarity, next_review_date) lives in Supabase.
 */
import rawBank from '@/data/vocabulary-bank.json'
import { overdueScore } from './sm2'
import type { VocabularyProgress } from './types'

export interface VocabWord {
  id: string
  dutch: string
  english: string
  phonetic?: string
  example?: string
  exampleTranslation?: string
  notes?: string
  unitId: string
  level: string
  category: string
}

export const VOCAB_BANK: VocabWord[] = rawBank as VocabWord[]

/** Total number of words in the bank */
export const TOTAL_WORDS = VOCAB_BANK.length

/** Look up a word by id */
export function getWordById(id: string): VocabWord | undefined {
  return VOCAB_BANK.find((w) => w.id === id)
}

/** All words for a given unit */
export function getWordsByUnit(unitId: string): VocabWord[] {
  return VOCAB_BANK.filter((w) => w.unitId === unitId)
}

/** All words for a given CEFR level */
export function getWordsByLevel(level: string): VocabWord[] {
  return VOCAB_BANK.filter((w) => w.level === level)
}

// ----------------------------------------------------------------
// Session builders — merge bank with progress records
// ----------------------------------------------------------------

interface WordWithProgress extends VocabWord {
  familiarity: number
  nextReviewDate: string | null
  isDue: boolean
}

function withProgress(
  words: VocabWord[],
  progressMap: Map<string, VocabularyProgress>,
): WordWithProgress[] {
  return words.map((word) => {
    const p = progressMap.get(word.id)
    const nextReviewDate = p?.next_review_date ?? null
    const isDue = !nextReviewDate || new Date(nextReviewDate) <= new Date()
    return {
      ...word,
      familiarity: p?.familiarity ?? 0,
      nextReviewDate,
      isDue,
    }
  })
}

/** Daily Review: all words with progress records that are now due, sorted most-overdue first */
export function buildDailyReviewQueue(
  progress: VocabularyProgress[],
): VocabWord[] {
  const progressMap = new Map(progress.map((p) => [p.word_id, p]))

  // Only include words that have been studied before AND are due
  return progress
    .filter((p) => new Date(p.next_review_date) <= new Date())
    .sort((a, b) => overdueScore(b.next_review_date) - overdueScore(a.next_review_date))
    .map((p) => getWordById(p.word_id))
    .filter((w): w is VocabWord => w !== undefined)
}

/** Practice Unit Vocab: all words in a unit (new + studied) */
export function buildUnitQueue(unitId: string): VocabWord[] {
  return getWordsByUnit(unitId)
}

/** Weak Words: words with familiarity 0 or 1 (studied but struggling) */
export function buildWeakWordsQueue(progress: VocabularyProgress[]): VocabWord[] {
  const weakProgress = progress.filter((p) => p.familiarity <= 1)
  return weakProgress
    .sort((a, b) => a.familiarity - b.familiarity)
    .map((p) => getWordById(p.word_id))
    .filter((w): w is VocabWord => w !== undefined)
}

/** Quick 10: random selection of up to 10 due words */
export function buildQuick10Queue(progress: VocabularyProgress[]): VocabWord[] {
  const due = buildDailyReviewQueue(progress)
  // Shuffle and take 10
  const shuffled = [...due].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10)
}

/** Count of words due for review (for the badge) */
export function countWordsDue(progress: VocabularyProgress[]): number {
  return progress.filter((p) => new Date(p.next_review_date) <= new Date()).length
}

/** Count of words mastered (familiarity >= 3) */
export function countWordsMastered(progress: VocabularyProgress[]): number {
  return progress.filter((p) => p.familiarity >= 3).length
}

/** Count of all words ever studied */
export function countWordsStudied(progress: VocabularyProgress[]): number {
  return progress.length
}

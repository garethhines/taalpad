/**
 * SM-2 Spaced Repetition Algorithm for Taalpad
 *
 * Familiarity scale (0–5):
 *   0 → review immediately (end of session)
 *   1 → review in 1 day
 *   2 → review in 3 days
 *   3 → review in 7 days
 *   4 → review in 14 days
 *   5 → review in 30 days
 */

export type FlashcardRating = 'wrong' | 'hard' | 'good' | 'easy'

const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const

/** Familiarity delta applied per rating */
const RATING_DELTA: Record<FlashcardRating, number> = {
  wrong: -2, // significant drop — didn't remember
  hard:  -1, // slight drop — remembered with difficulty
  good:  +1, // increment — solid recall
  easy:  +2, // fast increment — perfect recall
}

export interface SM2Result {
  newFamiliarity: number
  nextReviewDate: Date
  intervalDays: number
}

export function applyRating(currentFamiliarity: number, rating: FlashcardRating): SM2Result {
  const newFamiliarity = Math.max(0, Math.min(5, currentFamiliarity + RATING_DELTA[rating]))
  const intervalDays = INTERVAL_DAYS[newFamiliarity]

  const nextReviewDate = new Date()
  if (intervalDays === 0) {
    // Review again within the same session (5 minutes from now)
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 5)
  } else {
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays)
  }

  return { newFamiliarity, nextReviewDate, intervalDays }
}

/** True if a word's next_review_date has passed (or has no record yet) */
export function isWordDue(nextReviewDate: string | null): boolean {
  if (!nextReviewDate) return true
  return new Date(nextReviewDate) <= new Date()
}

/** Sort key: most overdue first */
export function overdueScore(nextReviewDate: string | null): number {
  if (!nextReviewDate) return Number.MAX_SAFE_INTEGER
  return Date.now() - new Date(nextReviewDate).getTime()
}

/** Human-readable interval label */
export function intervalLabel(intervalDays: number): string {
  if (intervalDays === 0) return 'again soon'
  if (intervalDays === 1) return 'tomorrow'
  if (intervalDays < 7) return `in ${intervalDays} days`
  if (intervalDays < 30) return `in ${Math.round(intervalDays / 7)} week${intervalDays > 7 ? 's' : ''}`
  return 'in a month'
}

import type { UserProfile } from './types'

// XP thresholds for each CEFR level
export const LEVEL_XP: Record<string, { min: number; max: number }> = {
  A0: { min: 0,     max: 500   },
  A1: { min: 500,   max: 2000  },
  A2: { min: 2000,  max: 5000  },
  B1: { min: 5000,  max: 10000 },
  B2: { min: 10000, max: 10000 }, // max level
}

export type LevelEnum = 'A0' | 'A1' | 'A2' | 'B1' | 'B2'
const LEVEL_ORDER: LevelEnum[] = ['A0', 'A1', 'A2', 'B1', 'B2']

export function getLevelFromXP(totalXP: number): LevelEnum {
  if (totalXP >= 10000) return 'B2'
  if (totalXP >= 5000)  return 'B1'
  if (totalXP >= 2000)  return 'A2'
  if (totalXP >= 500)   return 'A1'
  return 'A0'
}

export function getLevelProgress(level: LevelEnum, totalXP: number): number {
  if (level === 'B2') return 100
  const { min, max } = LEVEL_XP[level]
  return Math.min(100, Math.max(0, Math.round(((totalXP - min) / (max - min)) * 100)))
}

export function getXPToNextLevel(level: LevelEnum, totalXP: number): number {
  if (level === 'B2') return 0
  return LEVEL_XP[level].max - totalXP
}

export function getNextLevel(level: LevelEnum): LevelEnum | null {
  const idx = LEVEL_ORDER.indexOf(level)
  return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null
}

/** Returns the next CEFR level as a string, or null if max level */
export function getCEFRNextLevel(level: string): string | null {
  const order = ['A0', 'A1', 'A2', 'B1', 'B2']
  const idx = order.indexOf(level)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
}

/**
 * Returns the effective current streak to display.
 *
 * Rules:
 *  - If last_activity_date is today   → streak is live, return current_streak
 *  - If last_activity_date is yesterday → streak is still valid (user hasn't
 *    had a chance to do today yet), return current_streak
 *  - If last_activity_date is 2+ days ago → streak has broken, return 0
 *  - If last_activity_date is null → no activity yet, return 0
 */
export function getEffectiveStreak(profile: UserProfile): number {
  if (!profile.last_activity_date) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const last = new Date(profile.last_activity_date)
  last.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  )

  return diffDays <= 1 ? profile.current_streak : 0
}

/**
 * Calculates the new streak value when a user records activity today.
 * Intended to be called inside a DB transaction / server action.
 *
 * @param lastActivityDate  current value from users_profile (may be null)
 * @param currentStreak     current value from users_profile
 * @returns                 the new streak value to write back
 */
export function computeNewStreak(
  lastActivityDate: string | null,
  currentStreak: number,
): number {
  const todayStr = new Date().toISOString().split('T')[0] // "YYYY-MM-DD"

  if (!lastActivityDate) return 1                   // First ever activity
  if (lastActivityDate === todayStr) return currentStreak // Already counted today

  const last = new Date(lastActivityDate)
  const today = new Date(todayStr)
  const diffDays = Math.round(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 1) return currentStreak + 1  // Consecutive day
  return 1                                       // Missed a day — reset
}

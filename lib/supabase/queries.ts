/**
 * All Supabase query helpers.
 * Each function accepts a supabase client so it works with both
 * the browser client and the server client.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfile, LearningProgress, VocabularyProgress, StreakHistory } from '@/lib/types'
import { computeNewStreak, getLevelFromXP } from '@/lib/streak'

// ----------------------------------------------------------------
// Profile
// ----------------------------------------------------------------

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as UserProfile
}

/**
 * Fetch profile; if it doesn't exist yet (trigger race), create it.
 */
export async function getOrCreateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  email?: string,
): Promise<UserProfile | null> {
  const existing = await getUserProfile(supabase, userId)
  if (existing) return existing

  const displayName = email ? email.split('@')[0] : 'Learner'
  const { data, error } = await supabase
    .from('users_profile')
    .insert({ id: userId, display_name: displayName })
    .select()
    .single()

  if (error) return null
  return data as UserProfile
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users_profile')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) return null
  return data as UserProfile
}

// ----------------------------------------------------------------
// Learning Progress
// ----------------------------------------------------------------

export async function getLearningProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<LearningProgress[]> {
  const { data, error } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) return []
  return data as LearningProgress[]
}

export async function upsertLessonProgress(
  supabase: SupabaseClient,
  userId: string,
  unitId: string,
  lessonId: string,
  status: LearningProgress['status'],
  score?: number,
): Promise<LearningProgress | null> {
  const updates: Partial<LearningProgress> = { status }
  if (score !== undefined) updates.score = score
  if (status === 'completed') updates.completed_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('learning_progress')
    .upsert(
      {
        user_id: userId,
        unit_id: unitId,
        lesson_id: lessonId,
        ...updates,
        attempts: 1, // Will be incremented below on conflict
      },
      {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false,
      },
    )
    .select()
    .single()

  if (error) return null
  return data as LearningProgress
}

// ----------------------------------------------------------------
// Vocabulary Progress
// ----------------------------------------------------------------

export async function getVocabularyProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<VocabularyProgress[]> {
  const { data, error } = await supabase
    .from('vocabulary_progress')
    .select('*')
    .eq('user_id', userId)
    .order('next_review_date', { ascending: true })

  if (error) return []
  return data as VocabularyProgress[]
}

/**
 * Record the result of a flashcard review.
 * familiarity: 0-5 (SM-2 scale — 0=complete blackout, 5=perfect)
 */
export async function upsertVocabularyProgress(
  supabase: SupabaseClient,
  userId: string,
  wordId: string,
  familiarity: number,
  isCorrect: boolean,
): Promise<void> {
  // Simple next review calculation based on familiarity
  const intervalDays = [0, 1, 3, 7, 14, 30][Math.min(familiarity, 5)]
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)

  await supabase.from('vocabulary_progress').upsert(
    {
      user_id: userId,
      word_id: wordId,
      familiarity,
      next_review_date: nextReview.toISOString(),
      last_reviewed: new Date().toISOString(),
      times_correct: isCorrect ? 1 : 0,
      times_incorrect: isCorrect ? 0 : 1,
    },
    { onConflict: 'user_id,word_id', ignoreDuplicates: false },
  )
}

// ----------------------------------------------------------------
// Streak & XP — called when a lesson is completed
// ----------------------------------------------------------------

/**
 * Records one lesson completion:
 * 1. Upserts the learning_progress row
 * 2. Increments total_xp and recalculates level
 * 3. Updates streak + last_activity_date
 * 4. Upserts today's row in streak_history
 *
 * Returns the updated profile.
 */
export async function recordLessonCompletion(
  supabase: SupabaseClient,
  userId: string,
  unitId: string,
  lessonId: string,
  xpReward: number,
  score?: number,
): Promise<UserProfile | null> {
  // 1. Update lesson status
  await upsertLessonProgress(supabase, userId, unitId, lessonId, 'completed', score)

  // 2. Fetch current profile
  const profile = await getUserProfile(supabase, userId)
  if (!profile) return null

  const todayStr = new Date().toISOString().split('T')[0]
  const newStreak = computeNewStreak(profile.last_activity_date, profile.current_streak)
  const newTotalXP = profile.total_xp + xpReward
  const newLevel = getLevelFromXP(newTotalXP)

  // 3. Update profile
  const updated = await updateUserProfile(supabase, userId, {
    total_xp: newTotalXP,
    current_level: newLevel,
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, profile.longest_streak),
    last_activity_date: todayStr,
  })

  // 4. Upsert streak_history (increment xp/lessons if row already exists today)
  await supabase.from('streak_history').upsert(
    {
      user_id: userId,
      date: todayStr,
      xp_earned: xpReward,
      lessons_completed: 1,
    },
    { onConflict: 'user_id,date', ignoreDuplicates: false },
  )

  return updated
}

// ----------------------------------------------------------------
// Streak History
// ----------------------------------------------------------------

export async function getStreakHistory(
  supabase: SupabaseClient,
  userId: string,
  days = 30,
): Promise<StreakHistory[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('streak_history')
    .select('*')
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error) return []
  return data as StreakHistory[]
}

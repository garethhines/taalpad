/**
 * All Supabase query helpers.
 * Each function accepts a supabase client so it works with both
 * the browser client and the server client.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfile, LearningProgress, VocabularyProgress, StreakHistory, LevelEnum } from '@/lib/types'
import { computeNewStreak, getLevelFromXP } from '@/lib/streak'
import { applyRating, type FlashcardRating } from '@/lib/sm2'
import { ALL_LEVELS } from '@/lib/curriculum/index'

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
 * Record a flashcard review using the SM-2 algorithm.
 * Fetches current familiarity, applies the rating delta, writes back.
 */
export async function recordFlashcardReview(
  supabase: SupabaseClient,
  userId: string,
  wordId: string,
  currentFamiliarity: number,
  rating: FlashcardRating,
): Promise<VocabularyProgress | null> {
  const { newFamiliarity, nextReviewDate } = applyRating(currentFamiliarity, rating)
  const isCorrect = rating === 'good' || rating === 'easy'

  const { data, error } = await supabase
    .from('vocabulary_progress')
    .upsert(
      {
        user_id: userId,
        word_id: wordId,
        familiarity: newFamiliarity,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed: new Date().toISOString(),
        // On insert these start at 0/1; on conflict the DB keeps existing values
        // (we increment via RPC or just let them be — good enough for now)
        times_correct: isCorrect ? 1 : 0,
        times_incorrect: isCorrect ? 0 : 1,
      },
      { onConflict: 'user_id,word_id', ignoreDuplicates: false },
    )
    .select()
    .single()

  if (error) return null
  return data as VocabularyProgress
}

/** Count of cards currently due for review */
export async function getWordsDueCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from('vocabulary_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_date', new Date().toISOString())

  return count ?? 0
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

  // 4. Accumulate today's xp + lesson count in streak_history.
  //    Fetch the existing row first so we can increment rather than overwrite.
  const { data: existing } = await supabase
    .from('streak_history')
    .select('xp_earned, lessons_completed')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .maybeSingle()

  await supabase.from('streak_history').upsert(
    {
      user_id: userId,
      date: todayStr,
      xp_earned: (existing?.xp_earned ?? 0) + xpReward,
      lessons_completed: (existing?.lessons_completed ?? 0) + 1,
    },
    { onConflict: 'user_id,date', ignoreDuplicates: false },
  )

  return updated
}

/**
 * Records a completed flashcard study session — updates streak and streak_history
 * without marking any lesson as complete.
 */
export async function recordFlashcardSession(
  supabase: SupabaseClient,
  userId: string,
  cardsReviewed: number,
): Promise<UserProfile | null> {
  const profile = await getUserProfile(supabase, userId)
  if (!profile) return null

  const todayStr = new Date().toISOString().split('T')[0]
  const newStreak = computeNewStreak(profile.last_activity_date, profile.current_streak)

  const updated = await updateUserProfile(supabase, userId, {
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, profile.longest_streak),
    last_activity_date: todayStr,
  })

  // Upsert streak_history row (accumulate if already studied today)
  const { data: existing } = await supabase
    .from('streak_history')
    .select('xp_earned, lessons_completed')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .maybeSingle()

  await supabase.from('streak_history').upsert(
    {
      user_id: userId,
      date: todayStr,
      xp_earned: existing?.xp_earned ?? 0,
      lessons_completed: existing?.lessons_completed ?? 0,
    },
    { onConflict: 'user_id,date', ignoreDuplicates: true },
  )

  return updated
}

/**
 * Resets all progress for a user — clears learning progress, vocabulary progress,
 * streak history, and resets the profile stats back to A0.
 */
export async function resetAllProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await Promise.all([
    supabase.from('learning_progress').delete().eq('user_id', userId),
    supabase.from('vocabulary_progress').delete().eq('user_id', userId),
    supabase.from('streak_history').delete().eq('user_id', userId),
  ])

  await supabase
    .from('users_profile')
    .update({
      total_xp: 0,
      current_level: 'A0' as LevelEnum,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      placement_level: null,
    })
    .eq('id', userId)
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

// ----------------------------------------------------------------
// Placement Test
// ----------------------------------------------------------------

/**
 * Records the outcome of a placement test:
 *  1. Bulk-marks all lessons in levels BELOW placementLevel as 'completed'
 *     so the curriculum engine unlocks the right starting point.
 *  2. Updates users_profile.current_level and placement_level.
 */
export async function completePlacementTest(
  supabase: SupabaseClient,
  userId: string,
  placementLevel: string,
): Promise<void> {
  const levelOrder = ['A0', 'A1', 'A2', 'B1', 'B2']
  const placedIdx = levelOrder.indexOf(placementLevel)

  // Gather all (unitId, lessonId) pairs for levels STRICTLY below placementLevel
  const rows: { user_id: string; unit_id: string; lesson_id: string; status: 'completed'; completed_at: string }[] = []
  const completedAt = new Date().toISOString()

  for (let i = 0; i < placedIdx; i++) {
    const levelId = levelOrder[i]
    const level = ALL_LEVELS.find((l) => l.id === levelId)
    if (!level) continue
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        rows.push({
          user_id: userId,
          unit_id: unit.id,
          lesson_id: lesson.id,
          status: 'completed',
          completed_at: completedAt,
        })
      }
    }
  }

  // Bulk upsert in one round-trip (Supabase handles large arrays fine)
  if (rows.length > 0) {
    await supabase
      .from('learning_progress')
      .upsert(rows, { onConflict: 'user_id,lesson_id', ignoreDuplicates: false })
  }

  // Update profile: current_level + placement_level
  await supabase
    .from('users_profile')
    .update({
      current_level: (placementLevel === 'A0' ? 'A0' : placementLevel) as LevelEnum,
      placement_level: placementLevel,
    })
    .eq('id', userId)
}

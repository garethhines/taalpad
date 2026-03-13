-- ================================================================
-- Taalpad — Add DELETE policies for user-owned tables
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ================================================================

CREATE POLICY "learning_progress: delete own"
  ON public.learning_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "vocabulary_progress: delete own"
  ON public.vocabulary_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "streak_history: delete own"
  ON public.streak_history FOR DELETE
  USING (auth.uid() = user_id);

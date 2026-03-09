-- ================================================================
-- Taalpad — Row Level Security Policies
-- Run this second, after 001_initial_schema.sql
-- ================================================================

-- Enable RLS on every table
ALTER TABLE public.users_profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_history     ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- users_profile
-- ----------------------------------------------------------------
CREATE POLICY "users_profile: select own"
  ON public.users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_profile: insert own"
  ON public.users_profile FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_profile: update own"
  ON public.users_profile FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------
-- learning_progress
-- ----------------------------------------------------------------
CREATE POLICY "learning_progress: select own"
  ON public.learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "learning_progress: insert own"
  ON public.learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_progress: update own"
  ON public.learning_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- vocabulary_progress
-- ----------------------------------------------------------------
CREATE POLICY "vocabulary_progress: select own"
  ON public.vocabulary_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "vocabulary_progress: insert own"
  ON public.vocabulary_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vocabulary_progress: update own"
  ON public.vocabulary_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- streak_history
-- ----------------------------------------------------------------
CREATE POLICY "streak_history: select own"
  ON public.streak_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "streak_history: insert own"
  ON public.streak_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streak_history: update own"
  ON public.streak_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

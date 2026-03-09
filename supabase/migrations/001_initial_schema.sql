-- ================================================================
-- Taalpad — Initial Schema
-- Run this first in your Supabase SQL editor (or via CLI)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------
CREATE TYPE public.cefr_level AS ENUM ('A0', 'A1', 'A2', 'B1', 'B2');
CREATE TYPE public.lesson_status AS ENUM ('locked', 'available', 'in_progress', 'completed');

-- ----------------------------------------------------------------
-- users_profile
-- One row per auth user. Created automatically by trigger below.
-- ----------------------------------------------------------------
CREATE TABLE public.users_profile (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT        NOT NULL DEFAULT '',
  current_level     public.cefr_level NOT NULL DEFAULT 'A0',
  total_xp          INTEGER     NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_streak    INTEGER     NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak    INTEGER     NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- learning_progress
-- Tracks per-user status for each lesson in the curriculum.
-- unit_id / lesson_id reference the static curriculum data in the app.
-- ----------------------------------------------------------------
CREATE TABLE public.learning_progress (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  unit_id       TEXT        NOT NULL,
  lesson_id     TEXT        NOT NULL,
  status        public.lesson_status NOT NULL DEFAULT 'locked',
  score         INTEGER     CHECK (score >= 0 AND score <= 100),
  completed_at  TIMESTAMPTZ,
  attempts      INTEGER     NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_learning_progress_user ON public.learning_progress(user_id);

-- ----------------------------------------------------------------
-- vocabulary_progress
-- SM-2 spaced repetition tracking per word per user.
-- word_id references words in /data/vocabulary.json
-- ----------------------------------------------------------------
CREATE TABLE public.vocabulary_progress (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  word_id          TEXT        NOT NULL,
  familiarity      INTEGER     NOT NULL DEFAULT 0 CHECK (familiarity BETWEEN 0 AND 5),
  next_review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  times_correct    INTEGER     NOT NULL DEFAULT 0 CHECK (times_correct >= 0),
  times_incorrect  INTEGER     NOT NULL DEFAULT 0 CHECK (times_incorrect >= 0),
  last_reviewed    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_vocab_progress_user        ON public.vocabulary_progress(user_id);
CREATE INDEX idx_vocab_progress_next_review ON public.vocabulary_progress(user_id, next_review_date);

-- ----------------------------------------------------------------
-- streak_history
-- One row per user per calendar day that had activity.
-- Used to display streak graphs and verify streak integrity.
-- ----------------------------------------------------------------
CREATE TABLE public.streak_history (
  id                  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID    NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  date                DATE    NOT NULL,
  xp_earned           INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  lessons_completed   INTEGER NOT NULL DEFAULT 0 CHECK (lessons_completed >= 0),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_streak_history_user_date ON public.streak_history(user_id, date DESC);

-- ----------------------------------------------------------------
-- TRIGGER: auto-create users_profile when a new auth user signs up
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_profile (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- Taalpad — Migration 003: Add placement test support
-- Run this in the Supabase SQL Editor after migrations 001 and 002.
-- ================================================================

-- Store which CEFR level the user placed into via the placement test.
-- NULL means they haven't taken the test (or started from A0 manually).
ALTER TABLE public.users_profile
  ADD COLUMN IF NOT EXISTS placement_level TEXT;

-- A tiny index to quickly find users who've completed the placement test.
CREATE INDEX IF NOT EXISTS idx_users_profile_placement_level
  ON public.users_profile(placement_level)
  WHERE placement_level IS NOT NULL;

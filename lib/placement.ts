/**
 * Adaptive placement test logic for Taalpad.
 *
 * Algorithm:
 *  - Starts at A1
 *  - After completing all questions at a level:
 *    - Pass (≥ 62.5%): confirm that level, advance to next
 *    - Fail:           end test, place at last confirmed level
 *  - 3 consecutive wrong answers at any level: end test immediately,
 *    place at level below current (or A0 if failing A1)
 *  - Test ends when B2 questions are exhausted or 30 questions answered
 */

import rawQuestions from '@/data/placement-test.json'

export type PlacementQuestionType = 'multiple_choice' | 'fill_blank' | 'translation'
export type TranslationDirection = 'nl_to_en' | 'en_to_nl'

export interface PlacementQuestion {
  id: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  type: PlacementQuestionType
  // multiple_choice
  question?: string
  options?: string[]
  // fill_blank
  sentence?: string
  choices?: string[]
  translation?: string
  // translation
  direction?: TranslationDirection
  prompt?: string
  // shared
  correctAnswer: string
  acceptedAnswers?: string[]
}

export const ALL_PLACEMENT_QUESTIONS: PlacementQuestion[] =
  rawQuestions as PlacementQuestion[]

// ── Difficulty / level config ─────────────────────────────────────────────

const TEST_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const
type TestLevel = (typeof TEST_LEVELS)[number]

const QUESTIONS_PER_LEVEL: Record<TestLevel, number> = {
  A1: 8, A2: 8, B1: 8, B2: 6,
}

/** Fraction of correct answers needed to pass a level */
const PASS_THRESHOLD = 5 / 8  // ~62.5%

/** Consecutive wrong answers before the test ends early */
const CONSECUTIVE_WRONG_LIMIT = 3

// ── State machine ─────────────────────────────────────────────────────────

export interface AdaptiveState {
  /** Index into TEST_LEVELS (0 = A1, 3 = B2) */
  currentLevelIdx: number
  questionsThisLevel: number
  correctThisLevel: number
  consecutiveWrong: number
  /** The last level that was fully passed; -1 means no level confirmed */
  confirmedLevelIdx: number
  isDone: boolean
  /** Populated when isDone === true */
  finalLevel: string | null
}

export function initialAdaptiveState(): AdaptiveState {
  return {
    currentLevelIdx: 0,    // start at A1
    questionsThisLevel: 0,
    correctThisLevel: 0,
    consecutiveWrong: 0,
    confirmedLevelIdx: -1, // haven't confirmed any level yet
    isDone: false,
    finalLevel: null,
  }
}

/** Determine the placed level when the test ends */
function determineFinalLevel(confirmedLevelIdx: number): string {
  if (confirmedLevelIdx < 0) return 'A0'
  return TEST_LEVELS[confirmedLevelIdx]
}

/**
 * Process a single answer and return the new adaptive state.
 * Pure function — no side effects.
 */
export function processAnswer(
  state: AdaptiveState,
  isCorrect: boolean,
): AdaptiveState {
  const s: AdaptiveState = { ...state }

  s.questionsThisLevel++

  if (isCorrect) {
    s.correctThisLevel++
    s.consecutiveWrong = 0
  } else {
    s.consecutiveWrong++
  }

  // ── Early exit: 3 consecutive wrong ──────────────────────────────────
  if (s.consecutiveWrong >= CONSECUTIVE_WRONG_LIMIT) {
    s.isDone = true
    // Place one level below current, but not lower than last confirmed
    const failIdx = Math.max(s.currentLevelIdx - 1, s.confirmedLevelIdx)
    s.finalLevel = determineFinalLevel(failIdx)
    return s
  }

  // ── Check if we've exhausted the current level's questions ────────────
  const level = TEST_LEVELS[s.currentLevelIdx]
  const targetCount = QUESTIONS_PER_LEVEL[level]

  if (s.questionsThisLevel < targetCount) {
    return s // still in this level
  }

  const passRate = s.correctThisLevel / s.questionsThisLevel
  const passed = passRate >= PASS_THRESHOLD

  if (passed) {
    s.confirmedLevelIdx = s.currentLevelIdx

    if (s.currentLevelIdx >= TEST_LEVELS.length - 1) {
      // Passed B2 — the highest level
      s.isDone = true
      s.finalLevel = 'B2'
    } else {
      // Advance to next level
      s.currentLevelIdx++
      s.questionsThisLevel = 0
      s.correctThisLevel = 0
      s.consecutiveWrong = 0
    }
  } else {
    // Failed this level — end test
    s.isDone = true
    s.finalLevel = determineFinalLevel(s.confirmedLevelIdx)
  }

  return s
}

// ── Question selection ────────────────────────────────────────────────────

/** Shuffle an array (Fisher-Yates, returns a new array) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Build the shuffled question pool for the test (questions grouped by level, each level shuffled) */
export function buildTestQueue(): PlacementQuestion[] {
  const queue: PlacementQuestion[] = []
  for (const level of TEST_LEVELS) {
    const levelQuestions = ALL_PLACEMENT_QUESTIONS.filter((q) => q.level === level)
    queue.push(...shuffle(levelQuestions))
  }
  return queue
}

/** Get the next unanswered question for the current level */
export function getNextQuestion(
  state: AdaptiveState,
  queue: PlacementQuestion[],
  answeredIds: Set<string>,
): PlacementQuestion | null {
  if (state.isDone) return null
  const currentLevel = TEST_LEVELS[state.currentLevelIdx]
  return (
    queue.find((q) => q.level === currentLevel && !answeredIds.has(q.id)) ?? null
  )
}

// ── Answer checking ───────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ')
}

export function checkAnswer(question: PlacementQuestion, userAnswer: string): boolean {
  const given = normalise(userAnswer)
  if (given === normalise(question.correctAnswer)) return true
  return (question.acceptedAnswers ?? []).some((a) => normalise(a) === given)
}

// ── Level metadata ────────────────────────────────────────────────────────

export const LEVEL_META: Record<
  string,
  { color: string; bgColor: string; title: string; description: string; emoji: string }
> = {
  A0: {
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    title: 'Complete Beginner',
    description:
      "You're just starting out — and that's perfectly fine! We'll build your Dutch from the ground up, starting with greetings and essential phrases.",
    emoji: '🌱',
  },
  A1: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    title: 'Beginner',
    description:
      "You know some basics! You can introduce yourself and handle very simple interactions. Time to expand your vocabulary and build your first real sentences.",
    emoji: '📖',
  },
  A2: {
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
    title: 'Elementary',
    description:
      "You can handle everyday situations — shopping, directions, small talk. We'll now work on your grammar and teach you to describe the world around you.",
    emoji: '💬',
  },
  B1: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    title: 'Intermediate',
    description:
      "Impressive! You can hold a real conversation and talk about familiar topics. Let's tackle opinions, compound sentences, and the nuances of natural Dutch.",
    emoji: '🗺️',
  },
  B2: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    title: 'Upper Intermediate',
    description:
      "You're very capable in Dutch! You can understand complex texts and express yourself fluently. Now we'll perfect your Dutch — idioms, formal register, and near-native expression.",
    emoji: '🏆',
  },
}

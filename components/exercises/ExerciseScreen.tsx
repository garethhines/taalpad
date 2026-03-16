'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, CheckCircle2, XCircle, Zap, Volume2, VolumeX, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateXPReward } from '@/lib/curriculum/index'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useProfileSettings } from '@/hooks/useProfileSettings'
import { useAudioFeedback } from '@/hooks/useAudioFeedback'
import type { CurriculumLesson, Exercise } from '@/lib/types'

import MultipleChoice from './types/MultipleChoice'
import TranslationInput from './types/TranslationInput'
import FillInBlank from './types/FillInBlank'
import WordMatch from './types/WordMatch'
import SentenceOrder from './types/SentenceOrder'
import ListeningExercise from './types/ListeningExercise'

interface Props {
  lesson: CurriculumLesson
  unitId: string
  onComplete: (xpEarned: number, score: number) => Promise<void>
}

type CheckState = 'unchecked' | 'correct' | 'incorrect'
type Phase = 'lesson' | 'review'

export default function ExerciseScreen({ lesson, unitId, onComplete }: Props) {
  const router = useRouter()

  // Lesson phase state
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  // Review phase state
  const [phase, setPhase] = useState<Phase>('lesson')
  const [mistakeQueue, setMistakeQueue] = useState<Exercise[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)

  // Per-question state
  const [answer, setAnswer] = useState<string | null>(null)
  const [checkState, setCheckState] = useState<CheckState>('unchecked')
  const [wordMatchDone, setWordMatchDone] = useState(false)

  // Completion state
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)

  const { speak, isSupported: ttsSupported } = useTextToSpeech()
  const { settings, updateSetting, mounted: settingsMounted } = useProfileSettings()
  const { playCorrect, playIncorrect } = useAudioFeedback(settingsMounted ? settings.soundEnabled : false)

  const exercises = lesson.exercises
  const exercise: Exercise = phase === 'lesson' ? exercises[index] : mistakeQueue[reviewIndex]

  const isLastLesson = index === exercises.length - 1
  const isLastReview = reviewIndex === mistakeQueue.length - 1
  const isLast = phase === 'lesson' ? isLastLesson : isLastReview

  // Progress bar: lesson phase = exercise progress; review phase = review progress
  const progress = phase === 'lesson'
    ? Math.round((index / exercises.length) * 100)
    : Math.round((reviewIndex / mistakeQueue.length) * 100)

  function optionsAreDutch(ex: Exercise): boolean {
    if (ex.type === 'fill_blank') return true
    if (ex.type === 'listening') return false
    if (ex.type === 'multiple_choice') {
      const q = ex.question.toLowerCase()
      return !q.includes('mean') && !q.includes('in english') && !q.includes('what is') && !q.includes('what number')
    }
    return false
  }

  function handleOptionSelect(value: string) {
    setAnswer(value)
    if (settingsMounted && settings.optionTts && ttsSupported && exercise && optionsAreDutch(exercise)) {
      speak(value)
    }
  }

  function checkAnswer(currentAnswer: string | null): boolean {
    if (!currentAnswer || !exercise) return false
    const normalise = (s: string) => s.trim().toLowerCase().replace(/[.!?,;:'"()]/g, '').replace(/\s+/g, ' ')
    if (exercise.type === 'word_match') return wordMatchDone
    if (exercise.type === 'multiple_choice' || exercise.type === 'listening' || exercise.type === 'fill_blank') {
      return currentAnswer === exercise.correctAnswer
    }
    const correct = normalise(exercise.correctAnswer)
    const given = normalise(currentAnswer)
    if (given === correct) return true
    const accepted: string[] =
      'acceptedAnswers' in exercise && Array.isArray(exercise.acceptedAnswers)
        ? exercise.acceptedAnswers : []
    return accepted.some((a: string) => normalise(a) === given)
  }

  function handleCheck() {
    const isCorrect = checkAnswer(answer)
    setCheckState(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) {
      if (phase === 'lesson') setCorrectCount((c) => c + 1)
      playCorrect()
    } else {
      playIncorrect()
    }
  }

  async function handleContinue() {
    // Collect mistake from this question if wrong (lesson phase only, non-word_match)
    let updatedMistakes = mistakeQueue
    if (phase === 'lesson' && checkState === 'incorrect' && exercise?.type !== 'word_match') {
      if (!updatedMistakes.some((e) => e.id === exercise.id)) {
        updatedMistakes = [...updatedMistakes, exercise]
        setMistakeQueue(updatedMistakes)
      }
    }

    if (phase === 'lesson' && isLastLesson) {
      if (updatedMistakes.length > 0) {
        // Transition to review phase
        setPhase('review')
        setReviewIndex(0)
        setAnswer(null)
        setCheckState('unchecked')
        setWordMatchDone(false)
      } else {
        await completeLesson(correctCount + (checkState === 'correct' ? 1 : 0))
      }
    } else if (phase === 'review' && isLastReview) {
      await completeLesson(correctCount)
    } else {
      // Advance to next question
      if (phase === 'lesson') setIndex((i) => i + 1)
      else setReviewIndex((i) => i + 1)
      setAnswer(null)
      setCheckState('unchecked')
      setWordMatchDone(false)
    }
  }

  async function completeLesson(finalCorrect: number) {
    const total = exercises.length
    const xp = calculateXPReward(lesson.xpReward, finalCorrect, total)
    const score = Math.round((finalCorrect / total) * 100)
    setEarnedXP(xp)
    setDone(true)
    setSaving(true)
    await onComplete(xp, score)
    setSaving(false)
  }

  const handleWordMatchComplete = useCallback((_correct: boolean) => {
    setWordMatchDone(true)
    setAnswer('matched')
  }, [])

  const canCheck =
    exercise?.type === 'word_match'
      ? wordMatchDone
      : (answer?.trim().length ?? 0) > 0

  // ── Completion screen ────────────────────────────────────────────────────
  if (done) {
    const total = exercises.length
    const scorePercent = Math.round((correctCount / total) * 100)

    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-950 items-center justify-center px-6 gap-8 text-center">
        <div className="text-6xl">{scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}</div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {scorePercent >= 80 ? 'Great work!' : scorePercent >= 50 ? 'Good effort!' : 'Keep practising!'}
          </h2>
          <p className="text-slate-500 mt-1">{lesson.title} complete</p>
        </div>

        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{correctCount}</p>
            <p className="text-sm text-slate-400">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{total - correctCount}</p>
            <p className="text-sm text-slate-400">Mistakes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Zap size={20} className="text-amber-500" fill="currentColor" />
              <p className="text-3xl font-bold text-amber-600">{earnedXP}</p>
            </div>
            <p className="text-sm text-slate-400">XP earned</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/learn')}
          disabled={saving}
          className="w-full max-w-xs bg-gradient-to-br from-violet-600 to-violet-800 text-white font-extrabold py-4 rounded-2xl hover:shadow-accent-glow disabled:opacity-60 transition-all"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    )
  }

  // ── Lesson / Review screen ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Top bar */}
      <div className="px-4 pt-12 pb-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              phase === 'review' ? 'bg-amber-400' : 'bg-gradient-to-r from-violet-600 to-violet-400',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {settingsMounted && ttsSupported && (
            <button
              onClick={() => updateSetting('optionTts', !settings.optionTts)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={settings.optionTts ? 'Mute option audio' : 'Unmute option audio'}
            >
              {settings.optionTts ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}
          <Zap size={14} className="text-amber-500" fill="currentColor" />
          <span className="text-xs font-bold text-amber-600">{lesson.xpReward}</span>
        </div>
      </div>

      {/* Review phase banner */}
      {phase === 'review' && (
        <div className="mx-4 mb-1 shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-700">Correct your errors</p>
            <p className="text-[11px] text-amber-600">Review {reviewIndex + 1} of {mistakeQueue.length}</p>
          </div>
        </div>
      )}

      {/* Exercise counter (lesson phase only) */}
      {phase === 'lesson' && (
        <p className="text-center text-xs text-slate-400 mb-1 shrink-0">
          {index + 1} / {exercises.length}
        </p>
      )}

      {/* Exercise content */}
      <div className="flex-1 px-5 py-3 overflow-y-auto min-h-0">
        {exercise && (
          <>
            {exercise.type === 'multiple_choice' && (
              <MultipleChoice
                exercise={exercise}
                selected={answer}
                onSelect={handleOptionSelect}
                isChecked={checkState !== 'unchecked'}
              />
            )}
            {(exercise.type === 'translation_to_en' || exercise.type === 'translation_to_nl') && (
              <TranslationInput
                exercise={exercise}
                value={answer ?? ''}
                onChange={setAnswer}
                isChecked={checkState !== 'unchecked'}
                isCorrect={checkState === 'unchecked' ? null : checkState === 'correct'}
              />
            )}
            {exercise.type === 'fill_blank' && (
              <FillInBlank
                exercise={exercise}
                selected={answer}
                onSelect={handleOptionSelect}
                isChecked={checkState !== 'unchecked'}
              />
            )}
            {exercise.type === 'word_match' && (
              <WordMatch
                exercise={exercise}
                onComplete={handleWordMatchComplete}
                isChecked={checkState !== 'unchecked'}
              />
            )}
            {exercise.type === 'sentence_order' && (
              <SentenceOrder
                exercise={exercise}
                onAnswer={setAnswer}
                isChecked={checkState !== 'unchecked'}
                isCorrect={checkState === 'unchecked' ? null : checkState === 'correct'}
              />
            )}
            {exercise.type === 'listening' && (
              <ListeningExercise
                exercise={exercise}
                selected={answer}
                onSelect={handleOptionSelect}
                isChecked={checkState !== 'unchecked'}
              />
            )}
          </>
        )}
      </div>

      {/* Feedback banner + bottom button */}
      <div className="px-4 pb-6 pt-2 space-y-3 shrink-0">
        {checkState !== 'unchecked' && exercise?.type !== 'word_match' && (
          <div
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-2xl',
              checkState === 'correct' ? 'bg-emerald-50' : 'bg-red-50',
            )}
          >
            {checkState === 'correct' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={cn('text-sm font-semibold', checkState === 'correct' ? 'text-emerald-700' : 'text-red-600')}>
                {checkState === 'correct' ? 'Correct!' : 'Not quite!'}
              </p>
              {checkState === 'incorrect' && 'correctAnswer' in exercise && (
                <p className="text-xs text-red-500 mt-0.5">
                  Answer: <span className="font-bold">{exercise.correctAnswer}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {checkState === 'unchecked' ? (
          <button
            onClick={handleCheck}
            disabled={!canCheck}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-base transition-all',
              canCheck
                ? 'bg-gradient-to-br from-violet-600 to-violet-800 text-white hover:shadow-accent-glow active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
          >
            Check
          </button>
        ) : (
          <button
            onClick={handleContinue}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98]',
              checkState === 'correct'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gradient-to-br from-violet-600 to-violet-800 text-white hover:shadow-accent-glow',
            )}
          >
            {isLast
              ? phase === 'review'
                ? 'Finish'
                : (mistakeQueue.length > 0 || checkState === 'incorrect') ? 'Review Errors' : 'Finish'
              : 'Continue'}
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateXPReward } from '@/lib/curriculum/index'
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

export default function ExerciseScreen({ lesson, unitId, onComplete }: Props) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [checkState, setCheckState] = useState<CheckState>('unchecked')
  const [correctCount, setCorrectCount] = useState(0)
  const [wordMatchDone, setWordMatchDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)

  const exercises = lesson.exercises
  const exercise = exercises[index]
  const isLastExercise = index === exercises.length - 1
  const progress = Math.round((index / exercises.length) * 100)

  function checkAnswer(currentAnswer: string | null): boolean {
    if (!currentAnswer || !exercise) return false

    const normalise = (s: string) => s.trim().toLowerCase().replace(/[.!?,]/g, '')

    if (exercise.type === 'word_match') return wordMatchDone

    if (exercise.type === 'multiple_choice' || exercise.type === 'listening' || exercise.type === 'fill_blank') {
      return currentAnswer === exercise.correctAnswer
    }

    const correct = normalise(exercise.correctAnswer)
    const given = normalise(currentAnswer)
    if (given === correct) return true
    const accepted: string[] =
      'acceptedAnswers' in exercise && Array.isArray(exercise.acceptedAnswers)
        ? exercise.acceptedAnswers
        : []
    return accepted.some((a: string) => normalise(a) === given)
  }

  function handleCheck() {
    const isCorrect = checkAnswer(answer)
    setCheckState(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) setCorrectCount((c) => c + 1)
  }

  async function handleContinue() {
    if (isLastExercise) {
      // Lesson complete
      const total = exercises.length
      const xp = calculateXPReward(lesson.xpReward, correctCount + (checkState === 'correct' ? 1 : 0), total)
      const score = Math.round(((correctCount + (checkState === 'correct' ? 1 : 0)) / total) * 100)
      setEarnedXP(xp)
      setDone(true)
      setSaving(true)
      await onComplete(xp, score)
      setSaving(false)
    } else {
      setIndex((i) => i + 1)
      setAnswer(null)
      setCheckState('unchecked')
      setWordMatchDone(false)
    }
  }

  const handleWordMatchComplete = useCallback((_correct: boolean) => {
    setWordMatchDone(true)
    setAnswer('matched')
  }, [])

  const canCheck =
    exercise?.type === 'word_match'
      ? wordMatchDone
      : exercise?.type === 'sentence_order'
        ? (answer?.trim().length ?? 0) > 0
        : (answer?.trim().length ?? 0) > 0

  if (done) {
    const total = exercises.length
    const finalCorrect = correctCount
    const scorePercent = Math.round((finalCorrect / total) * 100)

    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center px-6 gap-8 text-center">
        <div className="text-6xl">{scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}</div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {scorePercent >= 80 ? 'Great work!' : scorePercent >= 50 ? 'Good effort!' : 'Keep practising!'}
          </h2>
          <p className="text-slate-500 mt-1">{lesson.title} complete</p>
        </div>

        {/* Score breakdown */}
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{finalCorrect}</p>
            <p className="text-sm text-slate-400">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{total - finalCorrect}</p>
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
          className="w-full max-w-xs bg-primary-900 text-white font-bold py-4 rounded-2xl hover:bg-primary-800 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top bar */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
        {/* Progress bar */}
        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-primary-900 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Zap size={14} className="text-amber-500" fill="currentColor" />
          <span className="text-xs font-bold text-amber-600">{lesson.xpReward}</span>
        </div>
      </div>

      {/* Exercise counter */}
      <p className="text-center text-xs text-slate-400 mb-2">
        {index + 1} / {exercises.length}
      </p>

      {/* Exercise content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {exercise && (
          <>
            {exercise.type === 'multiple_choice' && (
              <MultipleChoice
                exercise={exercise}
                selected={answer}
                onSelect={setAnswer}
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
                onSelect={setAnswer}
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
                onSelect={setAnswer}
                isChecked={checkState !== 'unchecked'}
              />
            )}
          </>
        )}
      </div>

      {/* Feedback banner + bottom button */}
      <div className="px-4 pb-8 space-y-3">
        {checkState !== 'unchecked' && exercise?.type !== 'word_match' && (
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl',
              checkState === 'correct' ? 'bg-emerald-50' : 'bg-red-50',
            )}
          >
            {checkState === 'correct' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle size={20} className="text-red-500 shrink-0" />
            )}
            <p
              className={cn(
                'text-sm font-semibold',
                checkState === 'correct' ? 'text-emerald-700' : 'text-red-600',
              )}
            >
              {checkState === 'correct' ? 'Correct!' : 'Not quite — keep going!'}
            </p>
          </div>
        )}

        {checkState === 'unchecked' ? (
          <button
            onClick={handleCheck}
            disabled={!canCheck}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-base transition-all',
              canCheck
                ? 'bg-primary-900 text-white hover:bg-primary-800 active:scale-[0.98]'
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
                : 'bg-primary-900 text-white hover:bg-primary-800',
            )}
          >
            {isLastExercise ? 'Finish' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  )
}

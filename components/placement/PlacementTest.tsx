'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildTestQueue,
  getNextQuestion,
  checkAnswer,
  processAnswer,
  initialAdaptiveState,
  type PlacementQuestion,
} from '@/lib/placement'
import PlacementResult from './PlacementResult'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-blue-500',
  A2: 'bg-violet-500',
  B1: 'bg-emerald-500',
  B2: 'bg-amber-500',
}

export default function PlacementTest() {
  const router = useRouter()

  // ── State ─────────────────────────────────────────────────────────────
  const [queue] = useState<PlacementQuestion[]>(() => buildTestQueue())
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set())
  const [adaptive, setAdaptive] = useState(initialAdaptiveState)
  const [selected, setSelected] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  // Timer — stop when test is done
  useEffect(() => {
    if (adaptive.isDone) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [adaptive.isDone])

  const currentQuestion = getNextQuestion(adaptive, queue, answeredIds)

  // Reset input when question changes
  useEffect(() => {
    setSelected(null)
    setTextInput('')
    setChecked(false)
    setIsCorrect(null)
    if (currentQuestion?.type === 'translation') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [currentQuestion?.id])

  // ── Answer logic ──────────────────────────────────────────────────────
  function handleCheck() {
    if (!currentQuestion) return
    const answer = currentQuestion.type === 'translation' ? textInput : (selected ?? '')
    if (!answer.trim()) return

    const correct = checkAnswer(currentQuestion, answer)
    setIsCorrect(correct)
    setChecked(true)
    setTotalAnswered((n) => n + 1)
    if (correct) setTotalCorrect((n) => n + 1)
  }

  function handleContinue() {
    if (!currentQuestion) return
    const newAnsweredIds = new Set(answeredIds).add(currentQuestion.id)
    setAnsweredIds(newAnsweredIds)
    setAdaptive((s) => processAnswer(s, isCorrect === true))
  }

  const canCheck =
    currentQuestion?.type === 'translation'
      ? textInput.trim().length > 0
      : selected !== null

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`
  }

  // ── Done → show result ────────────────────────────────────────────────
  if (adaptive.isDone && adaptive.finalLevel) {
    return (
      <PlacementResult
        finalLevel={adaptive.finalLevel}
        questionsAnswered={totalAnswered}
        correctAnswers={totalCorrect}
        elapsedSeconds={elapsed}
        onRetake={() => {
          // Reset everything
          setAnsweredIds(new Set())
          setAdaptive(initialAdaptiveState())
          setTotalAnswered(0)
          setTotalCorrect(0)
          startTimeRef.current = Date.now()
        }}
      />
    )
  }

  if (!currentQuestion) return null

  const levelColor = LEVEL_COLORS[currentQuestion.level] ?? 'bg-slate-500'
  const questionNumber = totalAnswered + 1
  const maxQuestions = 30

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-xl mx-auto">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-4 border-b border-slate-100 flex items-center gap-4">
        <button
          onClick={() => router.push('/learn')}
          className="p-2 -ml-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Placement Test</span>
            <span>{formatElapsed(elapsed)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="h-2 bg-primary-900 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((questionNumber - 1) / maxQuestions) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            Question {questionNumber} of up to {maxQuestions}
          </p>
        </div>
      </div>

      {/* ── Question ──────────────────────────────────────────────── */}
      <div className="flex-1 px-5 py-8 flex flex-col gap-6">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <span className={cn('text-white text-xs font-bold px-2.5 py-1 rounded-full', levelColor)}>
            CEFR {currentQuestion.level}
          </span>
        </div>

        {/* Question content */}
        <QuestionContent
          question={currentQuestion}
          selected={selected}
          onSelect={setSelected}
          textInput={textInput}
          onTextInput={setTextInput}
          checked={checked}
          isCorrect={isCorrect}
          inputRef={inputRef}
          onSubmit={handleCheck}
        />

        {/* Feedback */}
        {checked && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3.5 text-sm font-semibold',
              isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
            )}
          >
            {isCorrect ? (
              '✓ Correct!'
            ) : (
              <span>
                ✗ The answer is:{' '}
                <span className="font-bold">{currentQuestion.correctAnswer}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom button ─────────────────────────────────────────── */}
      <div className="px-5 pb-10 pt-2">
        {!checked ? (
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
              isCorrect
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-primary-900 text-white hover:bg-primary-800',
            )}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}

// ── Question type renderers ───────────────────────────────────────────────

function QuestionContent({
  question,
  selected,
  onSelect,
  textInput,
  onTextInput,
  checked,
  isCorrect,
  inputRef,
  onSubmit,
}: {
  question: PlacementQuestion
  selected: string | null
  onSelect: (v: string) => void
  textInput: string
  onTextInput: (v: string) => void
  checked: boolean
  isCorrect: boolean | null
  inputRef: React.RefObject<HTMLInputElement>
  onSubmit: () => void
}) {
  if (question.type === 'multiple_choice') {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold text-slate-800 leading-snug">{question.question}</p>
        {(question as { dutch?: string }).dutch && (
          <p className="text-2xl font-bold text-primary-900">{(question as { dutch?: string }).dutch}</p>
        )}
        <div className="space-y-2.5">
          {(question.options ?? []).map((option) => {
            const isSelected = selected === option
            const isCorrectOption = checked && option === question.correctAnswer
            const isWrongSelection = checked && isSelected && option !== question.correctAnswer

            return (
              <button
                key={option}
                onClick={() => !checked && onSelect(option)}
                disabled={checked}
                className={cn(
                  'w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-medium transition-all duration-150',
                  !checked && !isSelected && 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50',
                  !checked && isSelected && 'bg-primary-50 border-primary-900 text-primary-900',
                  isCorrectOption && 'bg-emerald-50 border-emerald-500 text-emerald-800',
                  isWrongSelection && 'bg-red-50 border-red-400 text-red-700',
                  checked && !isCorrectOption && !isWrongSelection && 'opacity-50 bg-white border-slate-200',
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (question.type === 'fill_blank') {
    const parts = (question.sentence ?? '').split('___')
    return (
      <div className="space-y-5">
        <div className="bg-slate-50 rounded-2xl p-5 text-center">
          <p className="text-xl font-semibold text-slate-800 leading-relaxed">
            {parts[0]}
            <span
              className={cn(
                'inline-block min-w-[80px] border-b-2 mx-1 px-2 font-bold transition-colors',
                !selected && 'border-slate-400 text-slate-400',
                selected && !checked && 'border-primary-900 text-primary-900',
                checked && isCorrect && 'border-emerald-500 text-emerald-700',
                checked && isCorrect === false && 'border-red-400 text-red-600',
              )}
            >
              {selected ?? '___'}
            </span>
            {parts[1]}
          </p>
          {question.translation && (
            <p className="text-slate-400 text-xs italic mt-2">{question.translation}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(question.choices ?? []).map((choice) => {
            const isSelected = selected === choice
            const isCorrectChoice = checked && choice === question.correctAnswer
            const isWrongSelection = checked && isSelected && choice !== question.correctAnswer

            return (
              <button
                key={choice}
                onClick={() => !checked && onSelect(choice)}
                disabled={checked}
                className={cn(
                  'px-4 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all',
                  !checked && !isSelected && 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50',
                  !checked && isSelected && 'bg-primary-50 border-primary-900 text-primary-900',
                  isCorrectChoice && 'bg-emerald-50 border-emerald-500 text-emerald-800',
                  isWrongSelection && 'bg-red-50 border-red-400 text-red-700',
                  checked && !isCorrectChoice && !isWrongSelection && 'opacity-40',
                )}
              >
                {choice}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // translation
  const isNlToEn = question.direction === 'nl_to_en'
  const labelFrom = isNlToEn ? 'Dutch' : 'English'
  const labelTo = isNlToEn ? 'English' : 'Dutch'

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 rounded-2xl p-5 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
          Translate from {labelFrom}
        </p>
        <p className={cn('font-bold text-slate-800', isNlToEn ? 'text-3xl' : 'text-2xl')}>
          {question.prompt}
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">Your {labelTo} answer:</label>
        <input
          ref={inputRef}
          type="text"
          value={textInput}
          onChange={(e) => !checked && onTextInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !checked && textInput.trim()) onSubmit() }}
          readOnly={checked}
          placeholder={`Type in ${labelTo}…`}
          className={cn(
            'w-full px-4 py-4 rounded-2xl border-2 text-base font-medium transition-all focus:outline-none',
            !checked && 'bg-white border-slate-200 text-slate-800 focus:border-primary-900',
            checked && isCorrect && 'bg-emerald-50 border-emerald-500 text-emerald-800',
            checked && isCorrect === false && 'bg-red-50 border-red-400 text-red-700',
          )}
        />
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { SentenceOrderExercise } from '@/lib/types'

interface Props {
  exercise: SentenceOrderExercise
  onAnswer: (answer: string) => void
  isChecked: boolean
  isCorrect: boolean | null
}

export default function SentenceOrder({ exercise, onAnswer, isChecked, isCorrect }: Props) {
  const [bank, setBank] = useState<string[]>([])
  const [placed, setPlaced] = useState<string[]>([])

  // Shuffle word bank on mount / exercise change
  useEffect(() => {
    const shuffled = [...exercise.words].sort(() => Math.random() - 0.5)
    setBank(shuffled)
    setPlaced([])
  }, [exercise.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function moveToPlaced(word: string, bankIndex: number) {
    if (isChecked) return
    const newBank = [...bank]
    newBank.splice(bankIndex, 1)
    const newPlaced = [...placed, word]
    setBank(newBank)
    setPlaced(newPlaced)
    onAnswer(newPlaced.join(' '))
  }

  function moveToBank(word: string, placedIndex: number) {
    if (isChecked) return
    const newPlaced = [...placed]
    newPlaced.splice(placedIndex, 1)
    setPlaced(newPlaced)
    setBank([...bank, word])
    onAnswer(newPlaced.join(' '))
  }

  const correctSentence = exercise.correctAnswer

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-slate-500 text-sm mb-1">Arrange the words into the correct sentence</p>
        {exercise.translation && (
          <p className="text-slate-400 text-xs italic">{exercise.translation}</p>
        )}
      </div>

      {/* Answer tray */}
      <div
        className={cn(
          'min-h-[56px] rounded-2xl border-2 border-dashed p-3 flex flex-wrap gap-2 transition-colors',
          placed.length === 0 && 'border-slate-200',
          placed.length > 0 && !isChecked && 'border-primary-300',
          isChecked && isCorrect && 'border-emerald-400 bg-emerald-50',
          isChecked && isCorrect === false && 'border-red-300 bg-red-50',
        )}
      >
        {placed.length === 0 && (
          <span className="text-slate-300 text-sm self-center">Tap words below to build your sentence…</span>
        )}
        {placed.map((word, i) => (
          <button
            key={`placed-${i}`}
            onClick={() => moveToBank(word, i)}
            disabled={isChecked}
            className={cn(
              'px-3 py-2 rounded-xl text-sm font-semibold border transition-all',
              !isChecked && 'bg-primary-900 text-white border-primary-900 hover:bg-primary-800',
              isChecked && isCorrect && 'bg-emerald-600 text-white border-emerald-600',
              isChecked && isCorrect === false && 'bg-red-500 text-white border-red-500',
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {isChecked && isCorrect === false && (
        <p className="text-sm text-slate-600 text-center">
          Correct: <span className="font-bold text-slate-800">{correctSentence}</span>
        </p>
      )}

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, i) => (
          <button
            key={`bank-${i}`}
            onClick={() => moveToPlaced(word, i)}
            disabled={isChecked}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
              'bg-white border-slate-200 text-slate-700',
              !isChecked && 'hover:border-primary-300 hover:bg-primary-50 active:scale-95',
              isChecked && 'opacity-40',
            )}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  )
}

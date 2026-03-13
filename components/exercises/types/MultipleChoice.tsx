'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import SpeakerButton from '@/components/ui/SpeakerButton'
import type { MultipleChoiceExercise } from '@/lib/types'

interface Props {
  exercise: MultipleChoiceExercise
  selected: string | null
  onSelect: (answer: string) => void
  isChecked: boolean
}

export default function MultipleChoice({ exercise, selected, onSelect, isChecked }: Props) {
  const shuffledOptions = useMemo(
    () => [...exercise.options].sort(() => Math.random() - 0.5),
    [exercise.id], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <div className="text-center space-y-3">
        {exercise.dutch && (
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-bold text-primary-900">{exercise.dutch}</span>
            <SpeakerButton text={exercise.dutch} size="md" />
          </div>
        )}
        <p className="text-lg font-semibold text-slate-700">{exercise.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {shuffledOptions.map((option) => {
          const isSelected = selected === option
          const isCorrect = option === exercise.correctAnswer
          let state: 'default' | 'selected' | 'correct' | 'wrong' = 'default'
          if (isChecked) {
            if (isCorrect) state = 'correct'
            else if (isSelected) state = 'wrong'
          } else if (isSelected) {
            state = 'selected'
          }

          return (
            <button
              key={option}
              onClick={() => !isChecked && onSelect(option)}
              disabled={isChecked}
              className={cn(
                'w-full text-left px-5 py-4 rounded-2xl border-2 font-medium text-sm transition-all duration-150',
                state === 'default' && 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98]',
                state === 'selected' && 'bg-primary-50 border-primary-900 text-primary-900',
                state === 'correct' && 'bg-emerald-50 border-emerald-500 text-emerald-800',
                state === 'wrong' && 'bg-red-50 border-red-400 text-red-700',
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

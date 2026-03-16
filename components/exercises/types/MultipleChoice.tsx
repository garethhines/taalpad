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
            <span className="text-3xl font-bold text-primary-900 dark:text-white">{exercise.dutch}</span>
            <SpeakerButton text={exercise.dutch} size="md" />
          </div>
        )}
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">{exercise.question}</p>
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
                state === 'default' && 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 dark:hover:border-violet-500 active:scale-[0.98]',
                state === 'selected' && 'bg-violet-50 dark:bg-violet-900/20 border-violet-600 dark:border-violet-500 text-violet-700 dark:text-violet-300',
                state === 'correct' && 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-300',
                state === 'wrong' && 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300',
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

'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { FillBlankExercise } from '@/lib/types'

interface Props {
  exercise: FillBlankExercise
  selected: string | null
  onSelect: (v: string) => void
  isChecked: boolean
}

export default function FillInBlank({ exercise, selected, onSelect, isChecked }: Props) {
  const shuffledOptions = useMemo(
    () => [...exercise.options].sort(() => Math.random() - 0.5),
    [exercise.id], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Split sentence at ___ to render the blank inline
  const parts = exercise.sentence.split('___')

  return (
    <div className="flex flex-col gap-6">
      {/* Sentence with inline blank */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 text-center">
        <p className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
          {parts[0]}
          <span
            className={cn(
              'inline-block min-w-[80px] border-b-2 mx-1 px-2 font-bold transition-colors',
              !selected && 'border-slate-400 text-slate-400',
              selected && !isChecked && 'border-violet-600 text-violet-700 dark:text-violet-300',
              isChecked && selected === exercise.correctAnswer && 'border-emerald-500 text-emerald-700',
              isChecked && selected !== exercise.correctAnswer && 'border-red-400 text-red-600',
            )}
          >
            {selected ?? '___'}
          </span>
          {parts[1]}
        </p>
        {exercise.translation && (
          <p className="text-sm text-slate-400 mt-3 italic">{exercise.translation}</p>
        )}
      </div>

      {/* Option buttons */}
      <div className="grid grid-cols-2 gap-3">
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
                'px-4 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-150',
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

'use client'

import { cn } from '@/lib/utils'
import type { FillBlankExercise } from '@/lib/types'

interface Props {
  exercise: FillBlankExercise
  selected: string | null
  onSelect: (v: string) => void
  isChecked: boolean
}

export default function FillInBlank({ exercise, selected, onSelect, isChecked }: Props) {
  // Split sentence at ___ to render the blank inline
  const parts = exercise.sentence.split('___')

  return (
    <div className="flex flex-col gap-6">
      {/* Sentence with inline blank */}
      <div className="bg-slate-50 rounded-2xl p-6 text-center">
        <p className="text-xl font-semibold text-slate-800 leading-relaxed">
          {parts[0]}
          <span
            className={cn(
              'inline-block min-w-[80px] border-b-2 mx-1 px-2 font-bold transition-colors',
              !selected && 'border-slate-400 text-slate-400',
              selected && !isChecked && 'border-primary-900 text-primary-900',
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
        {exercise.options.map((option) => {
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

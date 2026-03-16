'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import SpeakerButton from '@/components/ui/SpeakerButton'
import type { TranslationToEnExercise, TranslationToNlExercise } from '@/lib/types'

type Exercise = TranslationToEnExercise | TranslationToNlExercise

interface Props {
  exercise: Exercise
  value: string
  onChange: (v: string) => void
  isChecked: boolean
  isCorrect: boolean | null
}

export default function TranslationInput({ exercise, value, onChange, isChecked, isCorrect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isChecked) inputRef.current?.focus()
  }, [isChecked])

  const sourceText = exercise.type === 'translation_to_en' ? exercise.dutch : exercise.english
  const targetLang = exercise.type === 'translation_to_en' ? 'English' : 'Dutch'
  const isDutchSource = exercise.type === 'translation_to_en'

  return (
    <div className="flex flex-col gap-6">
      {/* Source text */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className={cn('font-bold text-slate-800 dark:text-white', isDutchSource ? 'text-3xl' : 'text-2xl')}>
            {sourceText}
          </span>
          {isDutchSource && <SpeakerButton text={sourceText} size="md" />}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Translate to {targetLang}
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => !isChecked && onChange(e.target.value)}
          readOnly={isChecked}
          placeholder={`Type in ${targetLang}…`}
          className={cn(
            'w-full px-4 py-4 rounded-2xl border-2 text-base font-medium transition-all duration-150',
            'placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none',
            !isChecked && 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-slate-100 focus:border-violet-600',
            isChecked && isCorrect && 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-300',
            isChecked && isCorrect === false && 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300',
          )}
        />
        {isChecked && isCorrect === false && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-2">
            <span>
              Correct answer:{' '}
              <span className="font-bold text-slate-800 dark:text-slate-100">{exercise.correctAnswer}</span>
            </span>
            {exercise.type === 'translation_to_nl' && (
              <SpeakerButton text={exercise.correctAnswer} size="sm" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

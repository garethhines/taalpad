'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import type { ListeningExercise as ListeningExerciseType } from '@/lib/types'

interface Props {
  exercise: ListeningExerciseType
  selected: string | null
  onSelect: (v: string) => void
  isChecked: boolean
}

export default function ListeningExercise({ exercise, selected, onSelect, isChecked }: Props) {
  const { speak, isSpeaking, isSupported } = useTextToSpeech()

  // Auto-play on mount
  useEffect(() => {
    if (isSupported) {
      const timer = setTimeout(() => speak(exercise.dutch), 300)
      return () => clearTimeout(timer)
    }
  }, [exercise.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-6">
      {/* Play button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => speak(exercise.dutch)}
          disabled={!isSupported}
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200',
            'shadow-lg active:scale-95',
            isSpeaking
              ? 'bg-primary-900 scale-110 shadow-primary-900/30'
              : 'bg-primary-900 hover:bg-primary-800',
          )}
          aria-label="Play audio"
        >
          {isSpeaking ? (
            <SoundWave />
          ) : (
            <PlayIcon />
          )}
        </button>
        <p className="text-sm text-slate-500">{exercise.question}</p>
        <button
          onClick={() => speak(exercise.dutch)}
          disabled={!isSupported || isSpeaking}
          className="text-xs text-primary-900 font-medium hover:underline disabled:opacity-40"
        >
          Play again
        </button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
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
                'w-full text-left px-5 py-4 rounded-2xl border-2 font-medium text-sm transition-all duration-150',
                state === 'default' && 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50',
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

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}

function SoundWave() {
  return (
    <div className="flex items-end gap-1 h-8">
      {[3, 5, 7, 5, 3].map((h, i) => (
        <div
          key={i}
          className="w-1.5 bg-white rounded-full animate-pulse"
          style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { intervalLabel, type FlashcardRating } from '@/lib/sm2'
import { applyRating } from '@/lib/sm2'

interface Props {
  familiarity: number
  onRate: (rating: FlashcardRating) => void
  disabled?: boolean
}

const RATINGS: { rating: FlashcardRating; label: string; emoji: string; style: string }[] = [
  { rating: 'wrong', label: 'Wrong',  emoji: '✗', style: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200' },
  { rating: 'hard',  label: 'Hard',   emoji: '~', style: 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 active:bg-orange-200' },
  { rating: 'good',  label: 'Good',   emoji: '✓', style: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200' },
  { rating: 'easy',  label: 'Easy',   emoji: '★', style: 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:bg-emerald-200' },
]

export default function RatingButtons({ familiarity, onRate, disabled }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-slate-400 font-medium">How well did you know it?</p>
      <div className="grid grid-cols-4 gap-2">
        {RATINGS.map(({ rating, label, emoji, style }) => {
          const { intervalDays } = applyRating(familiarity, rating)
          return (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-3 rounded-2xl border-2 transition-all duration-150 disabled:opacity-50',
                style,
              )}
            >
              <span className="text-lg font-bold leading-none">{emoji}</span>
              <span className="text-xs font-bold">{label}</span>
              <span className="text-[10px] opacity-70 leading-tight text-center">
                {intervalLabel(intervalDays)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

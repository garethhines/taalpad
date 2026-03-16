'use client'

import { CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react'
import type { FlashcardRating } from '@/lib/sm2'
import type { VocabWord } from '@/lib/vocabulary'

interface RatedWord {
  word: VocabWord
  rating: FlashcardRating
  previousFamiliarity: number
  newFamiliarity: number
}

interface Props {
  rated: RatedWord[]
  onBack: () => void
  onRepeat: () => void
}

const RATING_COLORS: Record<FlashcardRating, string> = {
  easy: 'text-emerald-600',
  good: 'text-blue-600',
  hard: 'text-orange-500',
  wrong: 'text-red-500',
}

const RATING_EMOJI: Record<FlashcardRating, string> = {
  easy: '★',
  good: '✓',
  hard: '~',
  wrong: '✗',
}

export default function SessionSummary({ rated, onBack, onRepeat }: Props) {
  const total = rated.length
  const correct = rated.filter((r) => r.rating === 'good' || r.rating === 'easy').length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const ratingCounts = {
    easy: rated.filter((r) => r.rating === 'easy').length,
    good: rated.filter((r) => r.rating === 'good').length,
    hard: rated.filter((r) => r.rating === 'hard').length,
    wrong: rated.filter((r) => r.rating === 'wrong').length,
  }

  const emoji = accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📚'
  const message = accuracy >= 80 ? 'Great session!' : accuracy >= 50 ? 'Good effort!' : 'Keep practising!'

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100 dark:bg-slate-900 dark:border-white/5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Session Complete</h1>
      </div>

      <div className="flex-1 px-5 py-8 flex flex-col gap-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="text-5xl">{emoji}</div>
          <h2 className="text-2xl font-bold text-slate-800">{message}</h2>
          <p className="text-slate-500">You reviewed {total} card{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Accuracy ring */}
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r="56"
                fill="none" stroke="#e2e8f0" strokeWidth="10"
              />
              <circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke={accuracy >= 80 ? '#16a34a' : accuracy >= 50 ? '#2563eb' : '#f59e0b'}
                strokeWidth="10"
                strokeDasharray={`${(accuracy / 100) * 351.9} 351.9`}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-2xl font-bold text-slate-800">{accuracy}%</span>
            <span className="text-xs text-slate-400">accuracy</span>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="grid grid-cols-4 gap-3">
          {(Object.entries(ratingCounts) as [FlashcardRating, number][]).map(([rating, count]) => (
            <div key={rating} className="bg-white rounded-2xl border border-slate-100 p-3 text-center shadow-sm dark:bg-white/5 dark:border-white/[0.07]">
              <span className={`text-xl font-bold ${RATING_COLORS[rating]}`}>{RATING_EMOJI[rating]}</span>
              <p className="text-2xl font-bold text-slate-800 mt-1 dark:text-slate-100">{count}</p>
              <p className="text-xs text-slate-400 capitalize dark:text-slate-500">{rating}</p>
            </div>
          ))}
        </div>

        {/* Improved words */}
        {rated.filter((r) => r.newFamiliarity > r.previousFamiliarity).length > 0 && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">Words improved</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {rated
                .filter((r) => r.newFamiliarity > r.previousFamiliarity)
                .map((r) => (
                  <span key={r.word.id} className="bg-white text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 dark:bg-white/10 dark:text-emerald-300 dark:border-emerald-700">
                    {r.word.dutch}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <ArrowLeft size={16} />
            Decks
          </button>
          <button
            onClick={onRepeat}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-white font-semibold text-sm hover:shadow-accent-glow"
          >
            <RotateCcw size={16} />
            Again
          </button>
        </div>
      </div>
    </div>
  )
}

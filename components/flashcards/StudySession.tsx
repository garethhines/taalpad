'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { recordFlashcardReview } from '@/lib/supabase/queries'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'
import FlashCard from './FlashCard'
import RatingButtons from './RatingButtons'
import SessionSummary from './SessionSummary'
import type { VocabWord } from '@/lib/vocabulary'
import type { VocabularyProgress } from '@/lib/types'
import type { FlashcardRating } from '@/lib/sm2'

interface RatedWord {
  word: VocabWord
  rating: FlashcardRating
  previousFamiliarity: number
  newFamiliarity: number
}

interface Props {
  title: string
  initialQueue: VocabWord[]
  progress: VocabularyProgress[]
  onBack: () => void
  onSessionComplete: () => void // refresh progress after session
}

export default function StudySession({ title, initialQueue, progress, onBack, onSessionComplete }: Props) {
  const { user } = useProfile()
  const progressMap = new Map(progress.map((p) => [p.word_id, p]))

  // Session state
  const [queue, setQueue] = useState<VocabWord[]>(() => [...initialQueue])
  const [repeatQueue, setRepeatQueue] = useState<VocabWord[]>([])
  const [rated, setRated] = useState<RatedWord[]>([])
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const totalCards = initialQueue.length
  const currentIndex = rated.length
  const progress_pct = totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0
  const currentWord = queue[0] ?? null

  const getFamiliarity = useCallback(
    (wordId: string) => progressMap.get(wordId)?.familiarity ?? 0,
    [progressMap],
  )

  async function handleRate(rating: FlashcardRating) {
    if (!currentWord || !user || saving) return
    setSaving(true)

    const previousFamiliarity = getFamiliarity(currentWord.id)
    const supabase = createClient()
    const updated = await recordFlashcardReview(
      supabase,
      user.id,
      currentWord.id,
      previousFamiliarity,
      rating,
    )
    const newFamiliarity = updated?.familiarity ?? previousFamiliarity

    // Track result
    setRated((prev) => [...prev, { word: currentWord, rating, previousFamiliarity, newFamiliarity }])

    // Wrong/Hard → re-queue this card (max 1 repeat per card)
    const hasBeenRepeated = rated.some((r) => r.word.id === currentWord.id)
    if ((rating === 'wrong' || rating === 'hard') && !hasBeenRepeated) {
      setRepeatQueue((prev) => [...prev, currentWord])
    }

    // Advance queue
    const newQueue = queue.slice(1)
    if (newQueue.length === 0 && repeatQueue.length > 0) {
      // Done with main queue — add repeat cards (max 10)
      setQueue(repeatQueue.slice(0, 10))
      setRepeatQueue([])
    } else if (newQueue.length === 0) {
      // Truly done
      setDone(true)
      onSessionComplete()
    } else {
      setQueue(newQueue)
    }

    setFlipped(false)
    setSaving(false)
  }

  function handleRepeat() {
    setQueue([...initialQueue].sort(() => Math.random() - 0.5))
    setRepeatQueue([])
    setRated([])
    setFlipped(false)
    setDone(false)
  }

  if (done || !currentWord) {
    return (
      <SessionSummary
        rated={rated}
        onBack={onBack}
        onRepeat={handleRepeat}
      />
    )
  }

  const currentFamiliarity = getFamiliarity(currentWord.id)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
          >
            <X size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-slate-600 truncate">{title}</p>
              <p className="text-xs text-slate-400 shrink-0 ml-2">
                {currentIndex + 1} / {Math.max(totalCards, currentIndex + 1)}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 bg-primary-900 rounded-full transition-all duration-500"
                style={{ width: `${progress_pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card + rating */}
      <div className="flex-1 flex flex-col px-5 py-6 gap-5">
        <FlashCard
          word={currentWord}
          familiarity={currentFamiliarity}
          onFlip={() => setFlipped(true)}
        />

        {/* Rating buttons — only shown after flip */}
        <div className={cn('transition-all duration-300', flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none')}>
          <RatingButtons
            familiarity={currentFamiliarity}
            onRate={handleRate}
            disabled={saving}
          />
        </div>

        {!flipped && (
          <button
            onClick={() => setFlipped(true)}
            className="w-full py-4 bg-primary-900 text-white font-bold rounded-2xl hover:bg-primary-800 transition-colors"
          >
            Show Answer
          </button>
        )}
      </div>
    </div>
  )
}

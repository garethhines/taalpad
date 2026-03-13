'use client'

import SpeakerButton from '@/components/ui/SpeakerButton'
import { cn } from '@/lib/utils'
import type { VocabWord } from '@/lib/vocabulary'

interface Props {
  word: VocabWord
  familiarity: number
  flipped?: boolean
  onFlip?: () => void
}

const FAMILIARITY_LABELS = ['New', 'Learning', 'Learning', 'Familiar', 'Known', 'Mastered']
const FAMILIARITY_COLORS = [
  'bg-slate-100 text-slate-500',
  'bg-orange-100 text-orange-600',
  'bg-amber-100 text-amber-600',
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-600',
  'bg-emerald-100 text-emerald-700',
]

export default function FlashCard({ word, familiarity, flipped = false, onFlip }: Props) {
  function handleFlip() {
    if (!flipped) {
      onFlip?.()
    }
  }

  return (
    <div
      className="relative w-full select-none cursor-pointer"
      style={{ perspective: '1200px', minHeight: '300px' }}
      onClick={handleFlip}
      role="button"
      aria-label={flipped ? 'Card showing answer' : 'Tap to reveal answer'}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '300px',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 bg-white rounded-3xl border border-slate-100 shadow-lg p-8 flex flex-col items-center justify-center gap-5"
          style={{ backfaceVisibility: 'hidden', minHeight: '300px' }}
        >
          {/* Familiarity badge */}
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full absolute top-5 right-5', FAMILIARITY_COLORS[Math.min(familiarity, 5)])}>
            {FAMILIARITY_LABELS[Math.min(familiarity, 5)]}
          </span>

          <div className="flex flex-col items-center gap-3">
            <p className="text-4xl font-bold text-primary-900 text-center leading-tight">
              {word.dutch}
            </p>
            {word.phonetic && (
              <p className="text-slate-400 text-sm italic">[{word.phonetic}]</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <SpeakerButton text={word.dutch} size="lg" variant="pill" />
          </div>

          <p className="text-slate-300 text-xs mt-2">Tap to reveal</p>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 bg-primary-900 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center gap-5"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', minHeight: '300px' }}
        >
          <p className="text-4xl font-bold text-white text-center leading-tight">
            {word.english}
          </p>

          {word.example && (
            <div className="text-center space-y-1.5">
              <div className="flex items-start gap-2 justify-center">
                <p className="text-blue-200 text-sm italic leading-relaxed">
                  &ldquo;{word.example}&rdquo;
                </p>
                <SpeakerButton text={word.example} size="sm" className="mt-0.5 shrink-0 !bg-white/10 !text-white hover:!bg-white/20" />
              </div>
              {word.exampleTranslation && (
                <p className="text-blue-300/80 text-xs">{word.exampleTranslation}</p>
              )}
            </div>
          )}

          {word.notes && (
            <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
              <p className="text-blue-200 text-xs leading-relaxed">{word.notes}</p>
            </div>
          )}

          <p className="text-blue-300/60 text-xs mt-1">How well did you know this?</p>
        </div>
      </div>
    </div>
  )
}

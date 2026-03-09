'use client'

import { useState } from 'react'
import { Volume2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { mockDecks, mockFlashcards } from '@/lib/mock-data'
import { useSpeech } from '@/hooks/useSpeech'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'

type View = 'decks' | 'studying'

export default function FlashcardsPage() {
  const [view, setView] = useState<View>('decks')
  const [activeDeck, setActiveDeck] = useState<string | null>(null)

  const handleStartDeck = (deckId: string) => {
    setActiveDeck(deckId)
    setView('studying')
  }

  if (view === 'studying') {
    return (
      <StudyView
        cards={mockFlashcards}
        onBack={() => setView('decks')}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
        <p className="text-sm text-slate-500 mt-1">Review your vocabulary</p>
      </div>

      <div className="flex-1 px-4 py-5">
        <div className="space-y-4">
          {mockDecks.map((deck) => (
            <Card
              key={deck.id}
              hoverable
              onClick={() => handleStartDeck(deck.id)}
              className="p-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl shrink-0"
                  style={{ backgroundColor: deck.color + '20' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: deck.color }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{deck.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{deck.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{deck.cardCount} cards</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <ProgressBar value={deck.progress} size="sm" color="blue" />
                    <p className="text-xs text-slate-400">{deck.progress}% mastered</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function StudyView({
  cards,
  onBack,
}: {
  cards: typeof mockFlashcards
  onBack: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [results, setResults] = useState<Record<string, 'easy' | 'hard'>>({})
  const { speak, isSpeaking, isSupported } = useSpeech()

  const card = cards[currentIndex]
  const total = cards.length
  const progress = Math.round((currentIndex / total) * 100)

  const handleRate = (rating: 'easy' | 'hard') => {
    setResults((prev) => ({ ...prev, [card.id]: rating }))
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1)
      setIsFlipped(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setResults({})
  }

  const isDone = currentIndex === total - 1 && results[card.id]

  if (isDone) {
    const easy = Object.values(results).filter((r) => r === 'easy').length
    return (
      <div className="flex flex-col min-h-full bg-slate-50">
        <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-500">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Session Complete</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nice work!</h2>
            <p className="text-slate-500 mt-2">You reviewed {total} cards</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600">{easy}</p>
              <p className="text-sm text-slate-500">Easy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-500">{total - easy}</p>
              <p className="text-sm text-slate-500">Hard</p>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="secondary" fullWidth onClick={onBack}>Back to Decks</Button>
            <Button variant="primary" fullWidth onClick={handleRestart}>
              <RotateCcw size={16} className="mr-2 inline" />
              Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-500">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-500">{currentIndex + 1} / {total}</span>
              <span className="text-slate-500 font-medium">{progress}%</span>
            </div>
            <ProgressBar value={progress} size="sm" color="blue" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-6 gap-6">
        {/* Flashcard */}
        <div
          className={cn(
            'flex-1 relative cursor-pointer select-none',
            'perspective-1000'
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={cn(
              'w-full h-full min-h-[280px] relative transition-transform duration-500',
              'transform-style-preserve-3d'
            )}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.5s ease',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white rounded-3xl border border-slate-100 shadow-md p-8 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-4xl font-bold text-primary-900 text-center">{card.dutch}</p>
              {card.phonetic && (
                <p className="text-slate-400 text-sm italic">[{card.phonetic}]</p>
              )}
              {isSupported && (
                <button
                  onClick={(e) => { e.stopPropagation(); speak(card.dutch) }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-900 rounded-full text-sm font-medium',
                    isSpeaking && 'opacity-70'
                  )}
                >
                  <Volume2 size={16} />
                  Listen
                </button>
              )}
              <p className="text-slate-300 text-xs mt-4">Tap to reveal</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-primary-900 rounded-3xl shadow-md p-8 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-4xl font-bold text-white text-center">{card.english}</p>
              {card.example && (
                <div className="mt-2 text-center">
                  <p className="text-blue-200 text-sm italic">&ldquo;{card.example}&rdquo;</p>
                  <p className="text-blue-300 text-xs mt-1">{card.exampleTranslation}</p>
                </div>
              )}
              <p className="text-blue-300 text-xs mt-4">How well did you know this?</p>
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        {isFlipped && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleRate('hard')}
              className="border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100"
            >
              Hard
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => handleRate('easy')}
              className="border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
            >
              Easy
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

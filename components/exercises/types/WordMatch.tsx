'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { WordMatchExercise } from '@/lib/types'

interface Props {
  exercise: WordMatchExercise
  onComplete: (correct: boolean) => void
  isChecked: boolean
}

type MatchState = 'idle' | 'selected' | 'matched' | 'wrong'

interface WordItem {
  id: string
  text: string
  pairId: string
  side: 'dutch' | 'english'
  state: MatchState
}

export default function WordMatch({ exercise, onComplete, isChecked }: Props) {
  const [items, setItems] = useState<WordItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())

  // Initialise shuffled columns
  useEffect(() => {
    const dutch = [...exercise.pairs]
      .sort(() => Math.random() - 0.5)
      .map((p): WordItem => ({ id: `d-${p.dutch}`, text: p.dutch, pairId: p.dutch, side: 'dutch', state: 'idle' }))
    const english = [...exercise.pairs]
      .sort(() => Math.random() - 0.5)
      .map((p): WordItem => ({ id: `e-${p.dutch}`, text: p.english, pairId: p.dutch, side: 'english', state: 'idle' }))
    setItems([...dutch, ...english])
    setMatchedPairs(new Set())
    setSelectedId(null)
  }, [exercise.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const dutchItems = items.filter((i) => i.side === 'dutch')
  const englishItems = items.filter((i) => i.side === 'english')

  function handleTap(tappedId: string) {
    if (isChecked) return
    const tapped = items.find((i) => i.id === tappedId)
    if (!tapped || tapped.state === 'matched') return

    if (!selectedId) {
      setSelectedId(tappedId)
      setItems((prev) => prev.map((i) => i.id === tappedId ? { ...i, state: 'selected' } : i))
      return
    }

    if (selectedId === tappedId) {
      setSelectedId(null)
      setItems((prev) => prev.map((i) => i.id === tappedId ? { ...i, state: 'idle' } : i))
      return
    }

    const selected = items.find((i) => i.id === selectedId)!
    const isPair = selected.pairId === tapped.pairId && selected.side !== tapped.side

    if (isPair) {
      const newMatched = new Set(matchedPairs).add(tapped.pairId)
      setMatchedPairs(newMatched)
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedId || i.id === tappedId ? { ...i, state: 'matched' } : i,
        ),
      )
      setSelectedId(null)
      if (newMatched.size === exercise.pairs.length) {
        setTimeout(() => onComplete(true), 400)
      }
    } else {
      // Brief wrong flash
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedId || i.id === tappedId ? { ...i, state: 'wrong' } : i,
        ),
      )
      setTimeout(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedId || i.id === tappedId ? { ...i, state: 'idle' } : i,
          ),
        )
        setSelectedId(null)
      }, 600)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-slate-500 text-sm">Tap a Dutch word, then its English match</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {dutchItems.map((item) => (
            <WordTile key={item.id} item={item} onTap={handleTap} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {englishItems.map((item) => (
            <WordTile key={item.id} item={item} onTap={handleTap} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WordTile({ item, onTap }: { item: WordItem; onTap: (id: string) => void }) {
  return (
    <button
      onClick={() => onTap(item.id)}
      disabled={item.state === 'matched'}
      className={cn(
        'px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-center',
        item.state === 'idle' && 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 dark:hover:border-violet-500',
        item.state === 'selected' && 'bg-violet-50 dark:bg-violet-900/20 border-violet-600 dark:border-violet-500 text-violet-700 dark:text-violet-300 scale-[1.02]',
        item.state === 'matched' && 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-400 opacity-70',
        item.state === 'wrong' && 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400 animate-shake',
      )}
    >
      {item.text}
    </button>
  )
}

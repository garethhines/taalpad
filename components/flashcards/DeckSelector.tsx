'use client'

import { useState } from 'react'
import { Calendar, BookOpen, TrendingDown, Zap, ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_UNITS } from '@/lib/curriculum/index'
import {
  buildDailyReviewQueue,
  buildUnitQueue,
  buildWeakWordsQueue,
  buildQuick10Queue,
  countWordsDue,
  countWordsMastered,
  countWordsStudied,
  getWordsByUnit,
  TOTAL_WORDS,
} from '@/lib/vocabulary'
import type { VocabularyProgress } from '@/lib/types'
import type { VocabWord } from '@/lib/vocabulary'

export type StudyMode = 'daily' | 'unit' | 'weak' | 'quick10'

interface Props {
  progress: VocabularyProgress[]
  onStart: (mode: StudyMode, queue: VocabWord[], title: string) => void
}

export default function DeckSelector({ progress, onStart }: Props) {
  const [showUnitPicker, setShowUnitPicker] = useState(false)

  const dueCount = countWordsDue(progress)
  const masteredCount = countWordsMastered(progress)
  const studiedCount = countWordsStudied(progress)
  const weakCount = buildWeakWordsQueue(progress).length
  const quick10Queue = buildQuick10Queue(progress)

  function startMode(mode: StudyMode, unitId?: string) {
    let queue: VocabWord[]
    let title: string

    switch (mode) {
      case 'daily':
        queue = buildDailyReviewQueue(progress)
        title = 'Daily Review'
        break
      case 'unit':
        if (!unitId) { setShowUnitPicker(true); return }
        queue = buildUnitQueue(unitId)
        title = ALL_UNITS.find((u) => u.id === unitId)?.title ?? 'Unit Practice'
        break
      case 'weak':
        queue = buildWeakWordsQueue(progress)
        title = 'Weak Words'
        break
      case 'quick10':
        queue = quick10Queue
        title = 'Quick 10'
        break
    }

    if (queue.length === 0) return
    onStart(mode, queue, title)
  }

  if (showUnitPicker) {
    return <UnitPicker onSelect={(unitId) => startMode('unit', unitId)} onBack={() => setShowUnitPicker(false)} />
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2d4a7a] px-5 pt-14 pb-6">
        <h1 className="text-[22px] font-black tracking-tight text-white">Flashcards</h1>
        <p className="text-sm text-white/60 mt-0.5">Vocabulary spaced repetition</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Studied" value={studiedCount} total={TOTAL_WORDS} color="blue" />
          <StatPill label="Mastered" value={masteredCount} color="emerald" />
          <StatPill label="Due now" value={dueCount} color={dueCount > 0 ? 'amber' : 'slate'} />
        </div>

        {/* Daily Review — primary CTA */}
        <ModeCard
          icon={<Calendar size={22} className="text-primary-900" />}
          title="Daily Review"
          subtitle={
            dueCount === 0
              ? 'All caught up! ✓'
              : `${dueCount} card${dueCount !== 1 ? 's' : ''} due for review`
          }
          badge={dueCount > 0 ? dueCount : undefined}
          badgeColor="red"
          disabled={dueCount === 0}
          primary
          onClick={() => startMode('daily')}
        />

        {/* Other modes */}
        <div className="space-y-3">
          <ModeCard
            icon={<Zap size={20} className="text-amber-500" />}
            title="Quick 10"
            subtitle={quick10Queue.length > 0 ? `10 random due cards` : 'No cards due yet'}
            disabled={quick10Queue.length === 0}
            onClick={() => startMode('quick10')}
          />
          <ModeCard
            icon={<TrendingDown size={20} className="text-orange-500" />}
            title="Weak Words"
            subtitle={weakCount > 0 ? `${weakCount} word${weakCount !== 1 ? 's' : ''} at familiarity 0–1` : 'No weak words yet'}
            disabled={weakCount === 0}
            onClick={() => startMode('weak')}
          />
          <ModeCard
            icon={<BookOpen size={20} className="text-blue-500" />}
            title="Practice Unit Vocab"
            subtitle="Study all words from a specific unit"
            onClick={() => setShowUnitPicker(true)}
          />
        </div>

        {/* Familiarity legend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Familiarity levels</p>
          <div className="space-y-1.5">
            {[
              { level: 0, label: 'New', interval: 'review now', color: 'bg-slate-200' },
              { level: 1, label: 'Learning', interval: '1 day', color: 'bg-orange-300' },
              { level: 2, label: 'Learning', interval: '3 days', color: 'bg-amber-300' },
              { level: 3, label: 'Familiar', interval: '7 days', color: 'bg-blue-400' },
              { level: 4, label: 'Known', interval: '14 days', color: 'bg-emerald-400' },
              { level: 5, label: 'Mastered', interval: '30 days', color: 'bg-emerald-600' },
            ].map(({ level, label, interval, color }) => (
              <div key={level} className="flex items-center gap-3">
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', color)} />
                <span className="text-xs text-slate-600 flex-1">{label}</span>
                <span className="text-xs text-slate-400">review in {interval}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------

function StatPill({ label, value, total, color }: { label: string; value: number; total?: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    slate: 'text-slate-400 bg-slate-50',
    red: 'text-red-600 bg-red-50',
  }

  return (
    <div className={cn('rounded-2xl p-3 text-center', colorMap[color] ?? colorMap.slate)}>
      <p className="text-xl font-bold">
        {value}{total !== undefined ? <span className="text-xs font-normal opacity-60">/{total}</span> : ''}
      </p>
      <p className="text-[11px] font-medium opacity-80">{label}</p>
    </div>
  )
}

function ModeCard({
  icon, title, subtitle, badge, badgeColor = 'red', disabled, primary, onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  badge?: number
  badgeColor?: string
  disabled?: boolean
  primary?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all duration-150',
        primary
          ? 'bg-gradient-to-br from-violet-700 to-violet-900 border-violet-700 text-white shadow-md shadow-violet-900/20 hover:shadow-accent-glow active:from-violet-800'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.98]',
        disabled && 'opacity-50 cursor-not-allowed hover:shadow-sm hover:border-slate-200 active:scale-100',
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', primary ? 'bg-white/15' : 'bg-slate-50')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-bold text-sm', primary ? 'text-white' : 'text-slate-800')}>{title}</p>
        <p className={cn('text-xs mt-0.5 truncate', primary ? 'text-violet-200' : 'text-slate-500')}>{subtitle}</p>
      </div>
      {badge !== undefined && badge > 0 ? (
        <span className="shrink-0 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : (
        <ChevronRight size={16} className={cn('shrink-0', primary ? 'text-violet-300' : 'text-slate-300')} />
      )}
    </button>
  )
}

function UnitPicker({ onSelect, onBack }: { onSelect: (unitId: string) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Choose a Unit</h1>
      </div>
      <div className="flex-1 px-4 py-5 space-y-3">
        {ALL_UNITS.map((unit) => {
          const wordCount = getWordsByUnit(unit.id).length
          const hasWords = wordCount > 0
          return (
            <button
              key={unit.id}
              onClick={() => hasWords && onSelect(unit.id)}
              disabled={!hasWords}
              className={cn(
                'w-full text-left bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 transition-all shadow-sm',
                hasWords ? 'hover:border-slate-300 hover:shadow-md active:scale-[0.98]' : 'opacity-40 cursor-not-allowed',
              )}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: unit.color }}>
                {unit.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{unit.title}</p>
                <p className="text-xs text-slate-400">{hasWords ? `${wordCount} words` : 'No cards yet'}</p>
              </div>
              {hasWords ? <ChevronRight size={16} className="text-slate-300 shrink-0" /> : <Lock size={14} className="text-slate-300 shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

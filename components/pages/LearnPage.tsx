'use client'

import { useState } from 'react'
import { Lock, CheckCircle2, Clock, Zap, ChevronRight } from 'lucide-react'
import { mockUnits } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import XPBadge from '@/components/ui/XPBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import type { Lesson, Unit } from '@/lib/types'

export default function LearnPage() {
  const [expandedUnit, setExpandedUnit] = useState<string | null>('unit-2')

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Learn</h1>
        <p className="text-sm text-slate-500 mt-1">Continue your Dutch journey</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {mockUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            isExpanded={expandedUnit === unit.id}
            onToggle={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
          />
        ))}
      </div>
    </div>
  )
}

function UnitCard({
  unit,
  isExpanded,
  onToggle,
}: {
  unit: Unit
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Unit header */}
      <button
        className="w-full text-left p-4 flex items-center gap-3"
        onClick={onToggle}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ backgroundColor: unit.color }}
        >
          {unit.order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800">{unit.title}</p>
            {unit.isCompleted && (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" fill="currentColor" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{unit.titleNl}</p>
          <div className="flex items-center gap-2 mt-2">
            <ProgressBar value={unit.progress} size="sm" color="blue" className="flex-1" />
            <span className="text-xs text-slate-400 shrink-0">{unit.progress}%</span>
          </div>
        </div>
        <ChevronRight
          size={18}
          className={cn(
            'text-slate-300 shrink-0 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {/* Lessons */}
      {isExpanded && (
        <div className="border-t border-slate-50 divide-y divide-slate-50">
          {unit.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const typeColors: Record<Lesson['type'], string> = {
    vocabulary: 'info',
    grammar: 'warning',
    conversation: 'success',
    listening: 'default',
  }

  return (
    <div
      className={cn(
        'px-4 py-3 flex items-center gap-3',
        lesson.isLocked ? 'opacity-50' : 'cursor-pointer active:bg-slate-50'
      )}
    >
      {/* Status icon */}
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-slate-50">
        {lesson.isCompleted ? (
          <CheckCircle2 size={18} className="text-emerald-500" fill="currentColor" />
        ) : lesson.isLocked ? (
          <Lock size={16} className="text-slate-400" />
        ) : (
          <div className="w-3 h-3 bg-primary-900 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-semibold',
          lesson.isCompleted ? 'text-slate-500' : 'text-slate-800'
        )}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={typeColors[lesson.type] as any}>{lesson.type}</Badge>
          <span className="flex items-center gap-0.5 text-xs text-slate-400">
            <Clock size={11} />
            {lesson.estimatedMinutes}m
          </span>
          <XPBadge xp={lesson.xpReward} size="sm" />
        </div>
      </div>

      {!lesson.isLocked && !lesson.isCompleted && (
        <ChevronRight size={16} className="text-slate-300 shrink-0" />
      )}
    </div>
  )
}

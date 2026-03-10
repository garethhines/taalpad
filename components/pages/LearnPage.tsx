'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Lock, CheckCircle2, ChevronRight, BookOpen, ClipboardCheck } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { buildLearningPath } from '@/lib/curriculum/index'
import { cn } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import type { LevelWithStatus, UnitWithStatus, LessonWithStatus } from '@/lib/types'

export default function LearnPage() {
  const { user, profile } = useProfile()
  const { progress } = useLearningProgress(user?.id)
  const levels = buildLearningPath(progress)
  const currentRef = useRef<HTMLDivElement>(null)
  const placementLevel = profile?.placement_level ?? null

  // Smooth-scroll to the user's current position on load
  useEffect(() => {
    if (currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [progress.length])

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-5 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Learn</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your Dutch learning path</p>
      </div>

      {/* Path */}
      <div className="flex-1 px-4 py-6">
        {levels.map((level, li) => (
          <div key={level.id}>
            <LevelBanner level={level} isFirst={li === 0} />
            <div className="relative">
              {/* Vertical spine connecting the unit cards */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-4 pb-2">
                {level.units.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    placementLevel={placementLevel}
                    currentRef={
                      unit.lessons.some((l) => l.isCurrentLesson) ? currentRef : undefined
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="h-8" />
      </div>
    </div>
  )
}

// ----------------------------------------------------------------

function LevelBanner({ level, isFirst }: { level: LevelWithStatus; isFirst: boolean }) {
  const bgColor = level.isCompleted
    ? '#16a34a'
    : level.isCurrent
      ? '#1a365d'
      : '#94a3b8'

  return (
    <div className={cn('flex items-center gap-3 mb-5', !isFirst && 'mt-10')}>
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold shadow-sm shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {level.isCompleted && <CheckCircle2 size={13} fill="currentColor" />}
        <span>{level.id}</span>
        <span className="font-normal opacity-80">·</span>
        <span className="font-medium">{level.title}</span>
      </div>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

function UnitCard({
  unit,
  currentRef,
  placementLevel,
}: {
  unit: UnitWithStatus
  currentRef?: React.RefObject<HTMLDivElement>
  placementLevel?: string | null
}) {
  const isCurrentUnit = unit.lessons.some((l) => l.isCurrentLesson)
  const nextLesson = unit.lessons.find((l) => l.isCurrentLesson || (!l.isCompleted && !l.isLocked))

  // A unit is "tested out" if it's completed AND falls below the placement level
  const levelOrder = ['A0', 'A1', 'A2', 'B1', 'B2']
  const isTestedOut =
    unit.isCompleted &&
    !!placementLevel &&
    levelOrder.indexOf(unit.level) < levelOrder.indexOf(placementLevel)

  return (
    <div
      ref={isCurrentUnit ? currentRef : undefined}
      className={cn(
        'ml-12 rounded-2xl border bg-white overflow-hidden transition-all duration-200',
        unit.isLocked && 'opacity-50 bg-slate-50',
        isCurrentUnit && 'border-primary-900/40 shadow-md',
        !isCurrentUnit && !unit.isLocked && 'border-slate-200 shadow-sm',
        unit.isCompleted && 'border-emerald-200',
      )}
    >
      {/* Unit header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl shrink-0 flex items-center justify-center',
              unit.isCompleted ? 'bg-emerald-100' : unit.isLocked ? 'bg-slate-100' : 'text-white',
            )}
            style={
              !unit.isCompleted && !unit.isLocked ? { backgroundColor: unit.color } : undefined
            }
          >
            {isTestedOut ? (
              <ClipboardCheck size={18} className="text-violet-600" />
            ) : unit.isCompleted ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : unit.isLocked ? (
              <Lock size={16} className="text-slate-400" />
            ) : (
              <BookOpen size={18} className="text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 text-sm leading-snug">{unit.title}</p>
              {isTestedOut && (
                <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full shrink-0">
                  Tested out
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{unit.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <ProgressBar
                value={unit.progress}
                size="sm"
                color={unit.isCompleted ? 'green' : 'blue'}
                className="flex-1"
              />
              <span className="text-xs text-slate-400 shrink-0">
                {unit.completedLessons}/{unit.lessons.length}
              </span>
            </div>
          </div>
        </div>

        {/* Continue / Start CTA */}
        {isCurrentUnit && nextLesson && (
          <Link
            href={`/learn/${nextLesson.id}`}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-primary-800 active:bg-primary-950 transition-colors"
          >
            {nextLesson.isCurrentLesson ? 'Continue' : 'Start'}
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Lesson rows — visible for all unlocked units */}
      {!unit.isLocked && (
        <div className="border-t border-slate-50 divide-y divide-slate-50">
          {unit.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson }: { lesson: LessonWithStatus }) {
  const inner = (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        !lesson.isLocked && !lesson.isCompleted && 'hover:bg-slate-50',
        lesson.isCurrentLesson && 'bg-primary-50/60',
      )}
    >
      {/* Status indicator */}
      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
        {lesson.isCompleted ? (
          <CheckCircle2 size={17} className="text-emerald-500" fill="currentColor" />
        ) : lesson.isLocked ? (
          <Lock size={12} className="text-slate-300" />
        ) : lesson.isCurrentLesson ? (
          <div className="w-2.5 h-2.5 bg-primary-900 rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-slate-300 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-semibold truncate',
            lesson.isCompleted && 'text-slate-400',
            lesson.isLocked && 'text-slate-300',
            lesson.isCurrentLesson && 'text-primary-900',
            !lesson.isCompleted && !lesson.isLocked && !lesson.isCurrentLesson && 'text-slate-700',
          )}
        >
          {lesson.title}
        </p>
        {lesson.score !== null && lesson.score !== undefined && (
          <p className="text-xs text-emerald-600 font-medium">{lesson.score}%</p>
        )}
      </div>

      {lesson.isCompleted && lesson.score === 100 && (
        <span className="text-xs">⭐</span>
      )}
      {!lesson.isLocked && !lesson.isCompleted && (
        <ChevronRight size={13} className="text-slate-300 shrink-0" />
      )}
    </div>
  )

  if (!lesson.isLocked && !lesson.isCompleted) {
    return <Link href={`/learn/${lesson.id}`}>{inner}</Link>
  }
  return <div>{inner}</div>
}

'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Lock, CheckCircle2, ChevronRight, BookOpen, ClipboardCheck, RotateCcw } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { buildLearningPath } from '@/lib/curriculum/index'
import { cn } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import LanguageFlagBadge from '@/components/ui/LanguageFlagBadge'
import type { LevelWithStatus, UnitWithStatus, LessonWithStatus } from '@/lib/types'

export default function LearnPage() {
  const { user, profile } = useProfile()
  const { progress, loading: progressLoading } = useLearningProgress(user?.id)
  const levels = buildLearningPath(progressLoading ? [] : progress)
  const currentRef = useRef<HTMLDivElement>(null)
  const placementLevel = profile?.placement_level ?? null

  useEffect(() => {
    if (currentRef.current) {
      setTimeout(() => {
        currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [progress.length])

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2d4a7a] px-5 pt-14 pb-6 lg:px-10 lg:pt-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold text-white/[0.55] uppercase tracking-widest">Your Path</p>
          <LanguageFlagBadge />
        </div>
        <h1 className="text-[22px] font-black tracking-tight text-white">Learn Dutch</h1>
      </div>

      {/* Path */}
      <div className="flex-1 px-4 py-6">
        {levels.map((level, li) => (
          <div key={level.id}>
            <LevelBanner level={level} isFirst={li === 0} />
            <div className="relative">
              {/* Vertical spine — fades out below current unit */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-600 to-slate-200 dark:to-slate-700" />
              <div className="space-y-4 pb-2">
                {level.units.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    placementLevel={placementLevel}
                    progressLoading={progressLoading}
                    currentRef={unit.lessons.some((l) => l.isCurrentLesson) ? currentRef : undefined}
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

function LevelBanner({ level, isFirst }: { level: LevelWithStatus; isFirst: boolean }) {
  const bgColor = level.isCompleted ? '#16a34a' : level.isCurrent ? '#1a365d' : '#94a3b8'
  const badgeText = level.isCompleted ? 'Completed' : level.isCurrent ? 'In Progress' : 'Locked'
  const badgeBg = level.isCompleted ? 'bg-emerald-500' : level.isCurrent ? 'bg-amber-500' : 'bg-slate-400'

  return (
    <div className={cn('flex items-center gap-3 mb-5', !isFirst && 'mt-10')}>
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-extrabold shadow-sm shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {level.isCompleted && <CheckCircle2 size={13} fill="currentColor" />}
        <span>{level.id}</span>
        <span className="font-normal opacity-80">·</span>
        <span className="font-medium">{level.title}</span>
        <span className={cn('text-[10px] font-bold text-black/70 px-2 py-0.5 rounded-full', badgeBg)}>{badgeText}</span>
      </div>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

function UnitCard({
  unit,
  currentRef,
  placementLevel,
  progressLoading,
}: {
  unit: UnitWithStatus
  currentRef?: React.RefObject<HTMLDivElement>
  placementLevel?: string | null
  progressLoading?: boolean
}) {
  const isCurrentUnit = unit.lessons.some((l) => l.isCurrentLesson)
  const nextLesson = unit.lessons.find((l) => l.isCurrentLesson || (!l.isCompleted && !l.isLocked))

  const levelOrder = ['A0', 'A1', 'A2', 'B1', 'B2']
  const isTestedOut =
    unit.isCompleted &&
    !!placementLevel &&
    levelOrder.indexOf(unit.level) < levelOrder.indexOf(placementLevel)

  return (
    <div
      ref={isCurrentUnit ? currentRef : undefined}
      className={cn(
        'ml-12 rounded-2xl border bg-white dark:bg-white/5 overflow-hidden transition-all duration-200',
        unit.isLocked && 'opacity-55',
        isCurrentUnit && 'border-violet-600 dark:border-violet-700 shadow-[0_2px_16px_rgba(124,58,237,0.15)]',
        !isCurrentUnit && !unit.isLocked && unit.isCompleted && 'border-emerald-200 dark:border-emerald-800',
        !isCurrentUnit && !unit.isLocked && !unit.isCompleted && 'border-slate-200 dark:border-white/[0.07] shadow-sm',
        unit.isLocked && 'border-slate-200 dark:border-white/5',
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl shrink-0 flex items-center justify-center',
              unit.isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30' : unit.isLocked ? 'bg-slate-100 dark:bg-white/5' : '',
            )}
            style={!unit.isCompleted && !unit.isLocked ? { backgroundColor: isCurrentUnit ? '#ede9fe' : unit.color } : undefined}
          >
            {isTestedOut ? (
              <ClipboardCheck size={18} className="text-violet-600" />
            ) : unit.isCompleted ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : unit.isLocked ? (
              <Lock size={16} className="text-slate-400" />
            ) : (
              <BookOpen size={18} className={isCurrentUnit ? 'text-violet-600' : 'text-white'} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-snug">{unit.title}</p>
              {isTestedOut && (
                <span className="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full shrink-0">
                  Tested out
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{unit.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <ProgressBar
                value={unit.progress}
                size="sm"
                color={unit.isCompleted ? 'green' : 'violet'}
                glow={isCurrentUnit}
                className="flex-1"
              />
              <span className="text-xs text-slate-400 shrink-0">
                {unit.completedLessons}/{unit.lessons.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              {unit.isCompleted ? 'Completed' : isCurrentUnit ? 'In progress' : unit.isLocked ? 'Locked' : 'Not started'}
            </p>
          </div>
        </div>

        {isCurrentUnit && !progressLoading && nextLesson && (
          <Link
            href={`/learn/${nextLesson.id}`}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-br from-violet-600 to-violet-800 text-white text-sm font-extrabold py-3 rounded-xl hover:shadow-accent-glow transition-all active:scale-[0.98]"
          >
            {nextLesson.isCurrentLesson ? 'Continue' : 'Start'}
            <ChevronRight size={16} />
          </Link>
        )}
        {isCurrentUnit && progressLoading && (
          <div className="mt-3 w-full flex items-center justify-center py-3 rounded-xl bg-slate-100 dark:bg-white/5">
            <div className="w-4 h-4 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {!unit.isLocked && (
        <div className="border-t border-slate-50 dark:border-white/5 divide-y divide-slate-50 dark:divide-white/5">
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
        !lesson.isLocked && 'hover:bg-slate-50 dark:hover:bg-white/5',
        lesson.isCurrentLesson && 'bg-violet-50/60 dark:bg-violet-900/10',
      )}
    >
      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
        {lesson.isCompleted ? (
          <CheckCircle2 size={17} className="text-emerald-500" fill="currentColor" />
        ) : lesson.isLocked ? (
          <Lock size={12} className="text-slate-300 dark:text-slate-600" />
        ) : lesson.isCurrentLesson ? (
          <div className="w-2.5 h-2.5 bg-violet-600 rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-semibold truncate',
            lesson.isCompleted && 'text-slate-400',
            lesson.isLocked && 'text-slate-300 dark:text-slate-600',
            lesson.isCurrentLesson && 'text-violet-700 dark:text-violet-300',
            !lesson.isCompleted && !lesson.isLocked && !lesson.isCurrentLesson && 'text-slate-700 dark:text-slate-300',
          )}
        >
          {lesson.title}
        </p>
        {lesson.score !== null && lesson.score !== undefined && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{lesson.score}%</p>
        )}
      </div>

      {lesson.isCompleted && lesson.score === 100 && (
        <span className="text-xs mr-1">⭐</span>
      )}
      {lesson.isCompleted && (
        <RotateCcw size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
      )}
      {!lesson.isLocked && !lesson.isCompleted && (
        <ChevronRight size={13} className="text-slate-300 dark:text-slate-500 shrink-0" />
      )}
    </div>
  )

  if (!lesson.isLocked) {
    return <Link href={`/learn/${lesson.id}`}>{inner}</Link>
  }
  return <div>{inner}</div>
}

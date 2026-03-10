'use client'

import Link from 'next/link'
import { Flame, Zap, Layers, BookOpen, CheckCircle2, ArrowRight, Target } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useWordsDue } from '@/hooks/useWordsDue'
import { useStreakHistory } from '@/hooks/useStreakHistory'
import { buildLearningPath } from '@/lib/curriculum/index'
import { getEffectiveStreak, getLevelProgress, getXPToNextLevel, getCEFRNextLevel } from '@/lib/streak'
import { getCEFRTitle, formatXP } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import WeeklyActivityChart from '@/components/dashboard/WeeklyActivityChart'

// ── Time-based greeting in Dutch ─────────────────────────────────────────────
function getDutchGreeting(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Goedemorgen, ${name}!`
  if (h < 18) return `Goedemiddag, ${name}!`
  return `Goedenavond, ${name}!`
}

function getSubGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Ready for your morning lesson?"
  if (h < 18) return "Time for some Dutch practice."
  return "End the day with a lesson."
}

export default function DashboardPage() {
  const { profile, user } = useProfile()
  const { progress } = useLearningProgress(user?.id)
  const wordsDue = useWordsDue()
  const { chartData, todayXP, todayLessons } = useStreakHistory(user?.id)

  // Learning path
  const levels = buildLearningPath(progress)
  const nextLesson = levels.flatMap((l) => l.units).flatMap((u) => u.lessons).find((l) => l.isCurrentLesson)
  const currentLevel = levels.find((l) => l.isCurrent)
  const currentLevelUnits = currentLevel?.units ?? []
  const completedUnitsInLevel = currentLevelUnits.filter((u) => u.isCompleted).length

  // Profile-derived values
  const streak = profile ? getEffectiveStreak(profile) : 0
  const level = profile?.current_level ?? 'A0'
  const totalXP = profile?.total_xp ?? 0
  const xpPercent = profile ? getLevelProgress(level, totalXP) : 0
  const xpToNext = profile ? getXPToNextLevel(level, totalXP) : 0
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'
  const nextLevel = getCEFRNextLevel(level)

  // Daily goal: 100 XP per day
  const dailyGoal = 100
  const dailyGoalPct = Math.min(100, Math.round((todayXP / dailyGoal) * 100))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="bg-primary-900 text-white px-5 pt-14 pb-8 lg:px-10 lg:pt-10 lg:pb-10">
        <div className="max-w-5xl mx-auto">
          {/* Top row: greeting + stat pills */}
          <div className="flex items-start justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <p className="text-blue-300 text-sm mb-1">{getSubGreeting()}</p>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {getDutchGreeting(displayName)}
              </h1>
            </div>
            {/* Streak + XP pills */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5">
                <Flame size={15} className="text-orange-400" fill="currentColor" />
                <span className="text-sm font-bold">{streak}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5">
                <Zap size={14} className="text-amber-400" fill="currentColor" />
                <span className="text-sm font-bold">{formatXP(totalXP)}</span>
              </div>
            </div>
          </div>

          {/* Level + XP progress bar */}
          <div className="bg-white/10 rounded-2xl p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center text-xs font-extrabold text-amber-900">
                  {level}
                </div>
                <div>
                  <p className="font-semibold text-sm">{getCEFRTitle(level)}</p>
                  <p className="text-blue-300 text-xs">CEFR Level {level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{formatXP(totalXP)} XP</p>
                {nextLevel && (
                  <p className="text-blue-300 text-xs">{formatXP(xpToNext)} to {nextLevel}</p>
                )}
              </div>
            </div>
            <ProgressBar value={xpPercent} color="amber" size="md" />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-6 lg:px-10 lg:py-8 max-w-5xl mx-auto">

        {/* ── Desktop: 2-col grid / Mobile: single col ─────────────────── */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-5 lg:space-y-0">

          {/* ── LEFT COLUMN (primary): Continue Learning + Weekly Chart + Level Progress ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Continue Learning — most prominent card */}
            <div>
              <SectionLabel>Continue Learning</SectionLabel>
              {nextLesson ? (
                <Link href={`/learn/${nextLesson.id}`} className="block group">
                  <div className="bg-primary-900 rounded-2xl p-5 lg:p-6 text-white shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition-colors active:scale-[0.99] cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-blue-300 text-xs font-medium uppercase tracking-wide mb-1">
                          {nextLesson.unitTitle}
                        </p>
                        <h2 className="text-lg lg:text-xl font-bold leading-snug">{nextLesson.title}</h2>
                        <p className="text-blue-200 text-sm mt-1.5 line-clamp-2">{nextLesson.description}</p>
                      </div>
                      <div className="shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <BookOpen size={22} className="text-blue-200" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Zap size={11} fill="currentColor" />
                          {nextLesson.xpReward} XP
                        </span>
                        <span className="text-blue-300 text-xs">{nextLesson.estimatedMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white text-primary-900 font-bold text-sm px-4 py-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                        Start
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                  <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-800">All caught up!</p>
                    <p className="text-emerald-600 text-sm">You have no pending lessons right now.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Activity Chart */}
            <div>
              <SectionLabel>Weekly Activity</SectionLabel>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <WeeklyActivityChart data={chartData} />
              </div>
            </div>

            {/* Level Progress */}
            <div>
              <SectionLabel>Level Progress</SectionLabel>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800">
                      CEFR {level} — {getCEFRTitle(level)}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {completedUnitsInLevel} / {currentLevelUnits.length} units complete
                    </p>
                  </div>
                  {nextLevel && (
                    <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      Next: {nextLevel}
                    </span>
                  )}
                </div>
                {/* Unit dots */}
                <div className="flex gap-2 mb-3">
                  {currentLevelUnits.map((unit, i) => (
                    <div
                      key={unit.id}
                      className="flex-1 h-2 rounded-full"
                      style={{
                        backgroundColor: unit.isCompleted
                          ? unit.color
                          : unit.isLocked
                          ? '#e2e8f0'
                          : unit.color + '60',
                      }}
                      title={unit.title}
                    />
                  ))}
                </div>
                <ProgressBar
                  value={
                    currentLevelUnits.length > 0
                      ? Math.round((completedUnitsInLevel / currentLevelUnits.length) * 100)
                      : 0
                  }
                  size="md"
                  color="blue"
                />
                <p className="text-xs text-slate-400 mt-2">
                  {formatXP(xpToNext)} XP needed to reach {nextLevel ?? 'max level'}
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Streak card + Daily Review + Today's Progress ── */}
          <div className="space-y-5">

            {/* Streak highlight */}
            <div>
              <SectionLabel>Streak</SectionLabel>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-amber-100 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Flame size={28} className="text-orange-500" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-800">{streak}</p>
                    <p className="text-sm font-medium text-slate-600">
                      {streak === 1 ? '1 day streak' : `${streak} day streak`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {streak === 0
                        ? 'Start one today!'
                        : streak >= 7
                        ? 'Impressive! Keep it up!'
                        : 'Keep going!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Review — flashcards */}
            <div>
              <SectionLabel>Flashcards</SectionLabel>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${wordsDue > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <Layers size={20} className={wordsDue > 0 ? 'text-amber-500' : 'text-emerald-500'} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">Daily Review</p>
                    {wordsDue > 0 ? (
                      <p className="text-slate-500 text-xs">
                        {wordsDue} card{wordsDue !== 1 ? 's' : ''} due for review
                      </p>
                    ) : (
                      <p className="text-emerald-600 text-xs font-medium">All caught up ✓</p>
                    )}
                  </div>
                  {wordsDue > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {wordsDue > 99 ? '99+' : wordsDue}
                    </span>
                  )}
                </div>
                <Link
                  href="/flashcards"
                  className={`block w-full py-2.5 rounded-xl text-center text-sm font-bold transition-colors ${
                    wordsDue > 0
                      ? 'bg-primary-900 text-white hover:bg-primary-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {wordsDue > 0 ? 'Start Review' : 'Browse Cards'}
                </Link>
              </div>
            </div>

            {/* Today's Progress */}
            <div>
              <SectionLabel>Today&apos;s Progress</SectionLabel>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                {/* Daily goal */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-600">Daily Goal</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {todayXP} / {dailyGoal} XP
                    </span>
                  </div>
                  <ProgressBar value={dailyGoalPct} size="sm" color={dailyGoalPct >= 100 ? 'green' : 'blue'} />
                  {dailyGoalPct >= 100 && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">Goal complete! 🎉</p>
                  )}
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-slate-800">{todayXP}</p>
                    <p className="text-[11px] text-slate-400 font-medium">XP earned</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-slate-800">{todayLessons}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {todayLessons === 1 ? 'lesson' : 'lessons'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">{children}</p>
  )
}

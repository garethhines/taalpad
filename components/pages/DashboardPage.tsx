'use client'

import Link from 'next/link'
import { Flame, Zap, Layers, BookOpen, CheckCircle2, ArrowRight, Target, Award } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useWordsDue } from '@/hooks/useWordsDue'
import { useStreakHistory } from '@/hooks/useStreakHistory'
import { buildLearningPath } from '@/lib/curriculum/index'
import { getEffectiveStreak, getLevelProgress, getXPToNextLevel, getCEFRNextLevel } from '@/lib/streak'
import { getCEFRTitle, formatXP } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import WeeklyActivityChart from '@/components/dashboard/WeeklyActivityChart'
import LanguageFlagBadge from '@/components/ui/LanguageFlagBadge'

function getDutchGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Goedemorgen'
  if (h < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

export default function DashboardPage() {
  const { profile, user } = useProfile()
  const { progress } = useLearningProgress(user?.id)
  const wordsDue = useWordsDue()
  const { chartData, todayXP, todayLessons } = useStreakHistory(user?.id)

  const levels = buildLearningPath(progress)
  const nextLesson = levels.flatMap((l) => l.units).flatMap((u) => u.lessons).find((l) => l.isCurrentLesson)
  const currentLevel = levels.find((l) => l.isCurrent)
  const currentLevelUnits = currentLevel?.units ?? []
  const completedUnitsInLevel = currentLevelUnits.filter((u) => u.isCompleted).length

  const streak = profile ? getEffectiveStreak(profile) : 0
  const level = profile?.current_level ?? 'A0'
  const totalXP = profile?.total_xp ?? 0
  const xpPercent = profile ? getLevelProgress(level, totalXP) : 0
  const xpToNext = profile ? getXPToNextLevel(level, totalXP) : 0
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'
  const nextLevel = getCEFRNextLevel(level)

  const dailyGoal = 100
  const dailyGoalPct = Math.min(100, Math.round((todayXP / dailyGoal) * 100))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2d4a7a] text-white px-5 pt-14 pb-8 lg:px-10 lg:pt-10 lg:pb-10">
        <div className="max-w-5xl mx-auto">
          {/* Top row: greeting label + flag */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-white/[0.55] uppercase tracking-widest">{getDutchGreeting()}</p>
            <LanguageFlagBadge />
          </div>
          <h1 className="text-[22px] lg:text-3xl font-black tracking-tight text-white mb-3">
            {displayName}
          </h1>

          {/* Pills row */}
          <div className="flex items-center gap-2 mb-5">
            <span className="flex items-center gap-1.5 bg-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-full">
              <Flame size={13} fill="currentColor" className="text-black" />
              {streak} day streak
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.13] border border-white/[0.15] text-white/90 text-xs font-bold px-3 py-1.5 rounded-full">
              <Zap size={12} fill="currentColor" className="text-amber-400" />
              {formatXP(totalXP)} XP
            </span>
          </div>

          {/* XP level card */}
          <div className="bg-white/[0.08] border border-white/[0.12] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Level Progress</span>
              <span className="bg-amber-500 text-black text-xs font-black px-2.5 py-0.5 rounded-lg">{level}</span>
            </div>
            <ProgressBar value={xpPercent} color="violet" size="md" glow />
            <p className="text-[10px] text-white/[0.35] mt-2 font-semibold">
              {formatXP(totalXP)} / {formatXP(totalXP + xpToNext)} XP · {nextLevel ? `${nextLevel} unlocks at ${formatXP(totalXP + xpToNext)}` : 'Max level'}
            </p>
          </div>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────── */}
      <div className="px-4 py-6 lg:px-10 lg:py-8 max-w-5xl mx-auto">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-5 lg:space-y-0">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Placement prompt */}
            {progress.length === 0 && !profile?.placement_level && (
              <Link href="/placement">
                <div className="bg-gradient-to-r from-violet-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg hover:opacity-95 transition-opacity cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Award size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-base">Already know some Dutch?</p>
                      <p className="text-violet-200 text-sm mt-0.5">Take a 5-min placement test to skip levels you already know.</p>
                    </div>
                    <ArrowRight size={18} className="text-violet-300 shrink-0" />
                  </div>
                </div>
              </Link>
            )}

            {/* Continue Learning */}
            <div>
              <SectionLabel>Continue Learning</SectionLabel>
              {nextLesson ? (
                <Link href={`/learn/${nextLesson.id}`} className="block group">
                  <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-violet-200 dark:border-violet-800/50 shadow-[0_2px_12px_rgba(124,58,237,0.12)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.2)] transition-all active:scale-[0.99]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Continue</span>
                      <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {nextLesson.unitTitle}
                      </span>
                    </div>
                    <h2 className="text-[15px] font-extrabold text-primary-900 dark:text-slate-100 leading-snug mb-3">{nextLesson.title}</h2>
                    <ProgressBar value={60} color="violet" size="sm" glow className="mb-3" />
                    <div className="bg-gradient-to-br from-violet-600 to-violet-800 text-white text-sm font-extrabold py-3 rounded-xl text-center shadow-sm group-hover:shadow-accent-glow transition-all">
                      Start Next Lesson →
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4">
                  <CheckCircle2 size={28} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-extrabold text-emerald-800 dark:text-emerald-300">All caught up!</p>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">You have no pending lessons right now.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Streak card */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-amber-500/[0.08] dark:to-amber-500/[0.12] rounded-2xl border border-amber-100 dark:border-amber-500/20 p-5 flex items-center gap-4">
              <div className="text-4xl leading-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(234,88,12,0.3))' }}>🔥</div>
              <div className="flex-1">
                <p className="text-2xl font-black text-amber-900 dark:text-amber-300 leading-none">{streak} {streak === 1 ? 'day' : 'days'}</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  {streak === 0 ? 'Start a streak today!' : streak >= 7 ? 'Impressive! Keep it up!' : 'Keep going!'}
                </p>
              </div>
              <span className="bg-amber-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shrink-0">
                +10 XP/day
              </span>
            </div>

            {/* Weekly Chart */}
            <div>
              <SectionLabel>Weekly Activity</SectionLabel>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-sm p-5">
                <WeeklyActivityChart data={chartData} />
              </div>
            </div>

            {/* Level Progress */}
            <div>
              <SectionLabel>Level Progress</SectionLabel>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-slate-100">
                      CEFR {level} — {getCEFRTitle(level)}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {completedUnitsInLevel} / {currentLevelUnits.length} units complete
                    </p>
                  </div>
                  {nextLevel && (
                    <span className="text-xs text-slate-400 bg-slate-50 dark:bg-white/[0.07] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                      Next: {nextLevel}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  {currentLevelUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex-1 h-2 rounded-full"
                      style={{
                        backgroundColor: unit.isCompleted ? unit.color : unit.isLocked ? '#e2e8f0' : unit.color + '60',
                      }}
                      title={unit.title}
                    />
                  ))}
                </div>
                <ProgressBar
                  value={currentLevelUnits.length > 0 ? Math.round((completedUnitsInLevel / currentLevelUnits.length) * 100) : 0}
                  color="violet"
                  glow
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {formatXP(xpToNext)} XP needed to reach {nextLevel ?? 'max level'}
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Stats row */}
            <div>
              <SectionLabel>Stats</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                <MiniStatCard value={profile?.total_xp ? formatXP(profile.total_xp) : '0'} label="XP" valueClass="text-amber-600 dark:text-amber-400" />
                <MiniStatCard value={String(streak)} label="Streak" valueClass="text-violet-700 dark:text-violet-300" />
                <MiniStatCard value={level} label="Level" valueClass="text-primary-900 dark:text-blue-300" />
              </div>
            </div>

            {/* Flashcards */}
            <div>
              <SectionLabel>Flashcards</SectionLabel>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shrink-0">
                    <Layers size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Daily Review</p>
                    {wordsDue > 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{wordsDue} card{wordsDue !== 1 ? 's' : ''} due</p>
                    ) : (
                      <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">All caught up ✓</p>
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
                  className={`block w-full py-2.5 rounded-xl text-center text-sm font-extrabold transition-colors ${
                    wordsDue > 0
                      ? 'bg-gradient-to-br from-violet-600 to-violet-800 text-white hover:shadow-accent-glow'
                      : 'bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.12]'
                  }`}
                >
                  {wordsDue > 0 ? 'Start Review' : 'Browse Cards'}
                </Link>
              </div>
            </div>

            {/* Today's Progress */}
            <div>
              <SectionLabel>Today&apos;s Progress</SectionLabel>
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-sm p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-emerald-600" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Daily Goal</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{todayXP} / {dailyGoal} XP</span>
                  </div>
                  <ProgressBar value={dailyGoalPct} color={dailyGoalPct >= 100 ? 'green' : 'violet'} size="sm" glow={dailyGoalPct >= 100} />
                  {dailyGoalPct >= 100 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">Goal complete! 🎉</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400">{todayXP}</p>
                    <p className="text-[11px] text-slate-400 font-medium">XP earned</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-violet-700 dark:text-violet-300">{todayLessons}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{todayLessons === 1 ? 'lesson' : 'lessons'}</p>
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
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">{children}</p>
  )
}

function MiniStatCard({ value, label, valueClass }: { value: string; label: string; valueClass?: string }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/[0.07] p-3 text-center shadow-sm">
      <p className={`text-lg font-black leading-none ${valueClass ?? 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
      <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-1.5 font-semibold">{label}</p>
    </div>
  )
}

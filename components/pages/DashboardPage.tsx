'use client'

import { Flame, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/useProfile'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { mockAchievements } from '@/lib/mock-data'
import { buildLearningPath } from '@/lib/curriculum/index'
import { getEffectiveStreak, getLevelProgress, getXPToNextLevel } from '@/lib/streak'
import { getCEFRTitle, getStreakMessage, formatXP } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import Card from '@/components/ui/Card'
import XPBadge from '@/components/ui/XPBadge'

export default function DashboardPage() {
  const { profile, user } = useProfile()
  const { progress } = useLearningProgress(user?.id)

  // Build learning path with DB progress
  const levels = buildLearningPath(progress)
  const allUnits = levels.flatMap((l) => l.units)
  const nextLesson = levels.flatMap((l) => l.units).flatMap((u) => u.lessons).find((l) => l.isCurrentLesson)
  const earnedAchievements = mockAchievements.filter((a) => a.isEarned)

  // Derived values — fall back gracefully while profile loads
  const streak = profile ? getEffectiveStreak(profile) : 0
  const level = profile?.current_level ?? 'A0'
  const totalXP = profile?.total_xp ?? 0
  const xpPercent = profile ? getLevelProgress(level, totalXP) : 0
  const xpToNext = profile ? getXPToNextLevel(level, totalXP) : 0
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'

  // Today's XP goal progress (simple: first 100 XP earned today)
  const dailyXPGoal = 100
  const dailyXPProgress = Math.min(totalXP % dailyXPGoal, dailyXPGoal)
  const dailyXPPercent = Math.round((dailyXPProgress / dailyXPGoal) * 100)

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-primary-900 text-white px-5 pt-14 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-200 text-sm font-medium">Welcome back</p>
            <h1 className="text-2xl font-bold">{displayName} 👋</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <Flame size={16} className="text-orange-400" fill="currentColor" />
            <span className="text-sm font-bold">{streak}</span>
          </div>
        </div>

        {/* Level & XP bar */}
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900">
                {level}
              </div>
              <div>
                <p className="text-sm font-semibold">{getCEFRTitle(level)}</p>
                <p className="text-xs text-blue-200">CEFR {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{formatXP(totalXP)} XP</p>
              {level !== 'B2' && (
                <p className="text-xs text-blue-200">{formatXP(xpToNext)} to {getCEFRTitle(level === 'A0' ? 'A1' : level === 'A1' ? 'A2' : level === 'A2' ? 'B1' : 'B2')}</p>
              )}
            </div>
          </div>
          <ProgressBar value={xpPercent} color="amber" size="md" />
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-6 space-y-5">
        {/* Streak card */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Flame size={24} className="text-orange-500" fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">
                {streak > 0 ? `${streak}-day streak!` : 'No streak yet'}
              </p>
              <p className="text-sm text-slate-500">{getStreakMessage(streak)}</p>
            </div>
          </div>
        </Card>

        {/* Continue Learning */}
        {nextLesson && (
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3">Continue Learning</h2>
            <Link href={`/learn/${nextLesson.id}`}>
              <Card hoverable className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpenIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">{nextLesson.unitTitle}</p>
                    <p className="font-semibold text-slate-800 truncate">{nextLesson.title}</p>
                    <p className="text-sm text-slate-500 truncate">{nextLesson.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <XPBadge xp={nextLesson.xpReward} size="sm" />
                      <span className="text-xs text-slate-400">{nextLesson.estimatedMinutes} min</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 shrink-0" />
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Daily Goal */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Today&apos;s Goal</h2>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500" fill="currentColor" />
                <span className="font-medium text-slate-700">Earn {dailyXPGoal} XP</span>
              </div>
              <span className="text-sm font-semibold text-primary-900">
                {dailyXPProgress} / {dailyXPGoal}
              </span>
            </div>
            <ProgressBar value={dailyXPPercent} color="green" size="sm" />
            {dailyXPPercent < 100 ? (
              <p className="text-xs text-slate-400 mt-2">
                {dailyXPGoal - dailyXPProgress} XP to go — keep it up!
              </p>
            ) : (
              <p className="text-xs text-emerald-600 mt-2 font-medium">
                Daily goal complete! 🎉
              </p>
            )}
          </Card>
        </div>

        {/* Units overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">Your Path</h2>
            <Link href="/learn" className="text-sm text-primary-900 font-medium">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {allUnits.filter((u) => !u.isLocked).slice(0, 2).map((unit) => (
              <Card key={unit.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: unit.color + '20' }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: unit.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 text-sm">{unit.title}</p>
                      <span className="text-xs text-slate-500">{unit.progress}%</span>
                    </div>
                    <ProgressBar value={unit.progress} size="sm" color="blue" />
                    <p className="text-xs text-slate-400 mt-1">{unit.lessons.length} lessons</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">Recent Achievements</h2>
            <Link href="/profile" className="text-sm text-primary-900 font-medium">
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
            {earnedAchievements.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-14 h-14 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center text-2xl">
                  {achievement.icon}
                </div>
                <p className="text-[11px] text-slate-600 font-medium text-center w-14 leading-tight">
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BookOpenIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1a365d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

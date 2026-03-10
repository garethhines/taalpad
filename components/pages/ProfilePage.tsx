'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Award, BookOpen, Flame, Zap, ChevronRight, LogOut, Layers } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useVocabularyProgress } from '@/hooks/useVocabularyProgress'
import { createClient } from '@/lib/supabase/client'
import { mockAchievements } from '@/lib/mock-data'
import { getCEFRTitle, formatXP } from '@/lib/utils'
import { getEffectiveStreak, getLevelProgress, getXPToNextLevel } from '@/lib/streak'
import { countWordsMastered, countWordsStudied, countWordsDue, TOTAL_WORDS } from '@/lib/vocabulary'
import ProgressBar from '@/components/ui/ProgressBar'
import Card from '@/components/ui/Card'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, user } = useProfile()
  const { progress: vocabProgress } = useVocabularyProgress(user?.id)
  const [signingOut, setSigningOut] = useState(false)

  const earnedCount = mockAchievements.filter((a) => a.isEarned).length
  const streak = profile ? getEffectiveStreak(profile) : 0
  const wordsMastered = countWordsMastered(vocabProgress)
  const wordsStudied = countWordsStudied(vocabProgress)
  const wordsDue = countWordsDue(vocabProgress)
  const level = profile?.current_level ?? 'A0'
  const totalXP = profile?.total_xp ?? 0
  const xpPercent = profile ? getLevelProgress(level, totalXP) : 0
  const xpToNext = profile ? getXPToNextLevel(level, totalXP) : 0
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'Learner'
  const nextLevel = level === 'A0' ? 'A1' : level === 'A1' ? 'A2' : level === 'A2' ? 'B1' : 'B2'

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="bg-primary-900 text-white px-5 pt-14 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-primary-900 border-2 border-white/30 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{displayName}</h1>
              <p className="text-blue-200 text-sm">
                {getCEFRTitle(level)} · CEFR {level}
              </p>
              {user?.email && (
                <p className="text-blue-300/70 text-xs mt-0.5">{user.email}</p>
              )}
            </div>
          </div>
          <button className="p-2 bg-white/10 rounded-xl">
            <Settings size={20} />
          </button>
        </div>

        {/* XP bar */}
        <div className="mt-5 bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-blue-200">XP Progress</span>
            <span className="font-semibold">{formatXP(totalXP)} XP</span>
          </div>
          <ProgressBar value={xpPercent} color="amber" />
          {level !== 'B2' ? (
            <p className="text-xs text-blue-300 mt-1.5">
              {formatXP(xpToNext)} XP until {getCEFRTitle(nextLevel)}
            </p>
          ) : (
            <p className="text-xs text-amber-300 mt-1.5">Maximum level reached!</p>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Flame size={20} className="text-orange-500" />}
            value={streak}
            label="Day Streak"
          />
          <StatCard
            icon={<Zap size={20} className="text-amber-500" />}
            value={formatXP(totalXP)}
            label="Total XP"
          />
          <StatCard
            icon={<Award size={20} className="text-blue-500" />}
            value={earnedCount}
            label="Badges"
          />
        </div>

        {/* Vocabulary stats */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Vocabulary</h2>
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Words mastered</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{wordsMastered} / {TOTAL_WORDS}</span>
            </div>
            <ProgressBar value={TOTAL_WORDS > 0 ? Math.round((wordsMastered / TOTAL_WORDS) * 100) : 0} size="sm" color="green" />
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>{wordsStudied} studied</span>
              {wordsDue > 0 ? (
                <span className="text-amber-600 font-medium">{wordsDue} due for review</span>
              ) : (
                <span className="text-emerald-600 font-medium">All caught up ✓</span>
              )}
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Achievements</h2>
          <div className="grid grid-cols-3 gap-3">
            {mockAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-opacity ${
                  achievement.isEarned
                    ? 'bg-white border-slate-100 shadow-sm'
                    : 'bg-slate-50 border-slate-100 opacity-40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    achievement.isEarned ? 'bg-amber-50' : 'bg-slate-100'
                  }`}
                >
                  {achievement.icon}
                </div>
                <p className="text-[11px] font-medium text-slate-700 text-center leading-tight">
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Settings</h2>
          <Card className="overflow-hidden divide-y divide-slate-50">
            <SettingsRow icon={<BookOpen size={18} />} label="Daily Goal" value="100 XP" />
            <SettingsRow icon={<Flame size={18} />} label="Notifications" value="On" />
            <SettingsRow icon={<Settings size={18} />} label="App Language" value="English" />
          </Card>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 rounded-2xl border border-red-100 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <Card className="p-3 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </Card>
  )
}

function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
      <span className="text-slate-400">{icon}</span>
      <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm text-slate-400">{value}</span>
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  )
}

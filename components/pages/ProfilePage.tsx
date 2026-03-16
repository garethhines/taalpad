'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut, Flame, Zap, Award, BookOpen, Layers, Clock,
  Shield, Edit3, Check, X, Volume2, Mic, ChevronRight, Trash2, Moon,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useVocabularyProgress } from '@/hooks/useVocabularyProgress'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { useProfileSettings } from '@/hooks/useProfileSettings'
import { createClient } from '@/lib/supabase/client'
import { updateUserProfile, resetAllProgress } from '@/lib/supabase/queries'
import { countWordsMastered, TOTAL_WORDS } from '@/lib/vocabulary'
import { getCEFRTitle, formatXP } from '@/lib/utils'
import { getEffectiveStreak, getLevelProgress } from '@/lib/streak'
import { getLessonById } from '@/lib/curriculum/index'
import ProgressBar from '@/components/ui/ProgressBar'
import Card from '@/components/ui/Card'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, user, refreshProfile } = useProfile()
  const { progress: vocabProgress } = useVocabularyProgress(user?.id)
  const { progress: lessonProgress } = useLearningProgress(user?.id)
  const { settings, updateSetting, mounted } = useProfileSettings()

  const [signingOut, setSigningOut] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.display_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Derived stats
  const streak = profile ? getEffectiveStreak(profile) : 0
  const level = profile?.current_level ?? 'A0'
  const totalXP = profile?.total_xp ?? 0
  const xpPercent = profile ? getLevelProgress(level, totalXP) : 0
  const wordsMastered = countWordsMastered(vocabProgress)
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'Learner'

  const { lessonsCompleted, hoursStudied } = useMemo(() => {
    const completed = lessonProgress.filter((p) => p.status === 'completed')
    const minutes = completed.reduce((acc, p) => {
      const lesson = getLessonById(p.lesson_id)
      return acc + (lesson?.estimatedMinutes ?? 5)
    }, 0)
    return { lessonsCompleted: completed.length, hoursStudied: +(minutes / 60).toFixed(1) }
  }, [lessonProgress])

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—'

  async function handleSaveName() {
    if (!user || !nameInput.trim()) return
    setSavingName(true)
    const supabase = createClient()
    await updateUserProfile(supabase, user.id, { display_name: nameInput.trim() })
    await refreshProfile()
    setSavingName(false)
    setEditingName(false)
  }

  async function handleResetProgress() {
    if (!user) return
    setResetting(true)
    const supabase = createClient()
    await resetAllProgress(supabase, user.id)
    await refreshProfile()
    setResetting(false)
    setShowResetConfirm(false)
    router.push('/learn')
  }

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="bg-primary-900 text-white px-5 pt-14 pb-10 lg:px-10 lg:pt-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-400 to-primary-800 rounded-2xl flex items-center justify-center text-2xl lg:text-3xl font-bold border-2 border-white/20 shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              {/* Editable display name */}
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                    autoFocus
                    className="bg-white/10 text-white placeholder:text-white/40 rounded-xl px-3 py-1.5 text-lg font-bold flex-1 min-w-0 border border-white/20 focus:outline-none focus:border-white/50"
                    placeholder="Display name"
                  />
                  <button onClick={handleSaveName} disabled={savingName} className="p-2 bg-emerald-500/80 rounded-lg hover:bg-emerald-500">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl lg:text-2xl font-bold truncate">{displayName}</h1>
                  <button
                    onClick={() => { setNameInput(displayName); setEditingName(true) }}
                    className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              )}

              <p className="text-blue-200 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Shield size={11} fill="currentColor" />
                  <span className="whitespace-nowrap">{level} · {getCEFRTitle(level)}</span>
                </div>
                <span className="text-blue-300/60 text-xs">Member since {memberSince}</span>
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="mt-6 bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-blue-200">XP Progress</span>
              <span className="font-semibold">{formatXP(totalXP)} XP</span>
            </div>
            <ProgressBar value={xpPercent} color="amber" />
          </div>
        </div>
      </div>

      {/* ── RESET CONFIRM MODAL ─────────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={22} className="text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Reset all progress?</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                This will permanently delete all your lesson progress, flashcard history, XP, and streak. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                disabled={resetting}
                className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {resetting ? 'Resetting…' : 'Yes, reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-6 lg:px-10 lg:py-8 max-w-4xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">

          {/* ── LEFT ── */}
          <div className="space-y-6">
            {/* Stats grid */}
            <section>
              <SectionLabel>Statistics</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                <StatCard icon={<Flame size={18} className="text-orange-500" />} value={streak} label="Day Streak" />
                <StatCard icon={<Zap size={18} className="text-amber-500" />} value={formatXP(totalXP)} label="Total XP" />
                <StatCard icon={<Flame size={18} className="text-red-400" />} value={profile?.longest_streak ?? 0} label="Best Streak" />
                <StatCard icon={<Layers size={18} className="text-blue-500" />} value={`${wordsMastered}/${TOTAL_WORDS}`} label="Words Learned" />
                <StatCard icon={<BookOpen size={18} className="text-emerald-500" />} value={lessonsCompleted} label="Lessons Done" />
                <StatCard icon={<Clock size={18} className="text-violet-500" />} value={`${hoursStudied}h`} label="Study Time" />
              </div>
            </section>

            {/* Vocabulary progress */}
            <section>
              <SectionLabel>Vocabulary</SectionLabel>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700">Words mastered</p>
                  <p className="text-sm font-bold text-slate-800">{wordsMastered} / {TOTAL_WORDS}</p>
                </div>
                <ProgressBar value={TOTAL_WORDS > 0 ? Math.round((wordsMastered / TOTAL_WORDS) * 100) : 0} size="md" color="green" />
                <p className="text-xs text-slate-400 mt-2">
                  {vocabProgress.length} words studied in total
                </p>
              </Card>
            </section>

            {/* Placement test */}
            <section>
              <SectionLabel>Assessment</SectionLabel>
              <Link
                href="/placement"
                className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-4 hover:border-violet-300 transition-colors group"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                  <Award size={18} className="text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors">
                    {profile?.placement_level ? 'Retake Placement Test' : 'Take Placement Test'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile?.placement_level
                      ? `You placed at ${profile.placement_level} — retake to reassess`
                      : 'Skip levels you already know — 30 questions'}
                  </p>
                </div>
                <ChevronRight size={16} className="text-violet-300 group-hover:text-violet-500 shrink-0" />
              </Link>
            </section>
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-6">
            {/* Settings */}
            <section>
              <SectionLabel>Settings</SectionLabel>
              <Card className="overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
                {/* Display name */}
                <button
                  onClick={() => { setNameInput(displayName); setEditingName(true) }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                >
                  <Edit3 size={16} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Display Name</p>
                    <p className="text-xs text-slate-400 truncate">{displayName}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </button>

                {/* Sound effects toggle */}
                {mounted && (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Volume2 size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Sound Effects</p>
                      <p className="text-xs text-slate-400">Play sounds on correct/incorrect</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.soundEnabled}
                      onChange={(v) => updateSetting('soundEnabled', v)}
                    />
                  </div>
                )}

                {/* TTS auto-play toggle */}
                {mounted && (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Mic size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Auto-play Dutch Audio</p>
                      <p className="text-xs text-slate-400">Auto-play pronunciation in lessons</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.ttsAutoPlay}
                      onChange={(v) => updateSetting('ttsAutoPlay', v)}
                    />
                  </div>
                )}

                {/* Dark mode toggle */}
                {mounted && (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Moon size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                      <p className="text-xs text-slate-400">Switch to a dark colour scheme</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.darkMode}
                      onChange={(v) => updateSetting('darkMode', v)}
                    />
                  </div>
                )}
              </Card>
            </section>

            {/* App info */}
            <section>
              <SectionLabel>About</SectionLabel>
              <Card className="overflow-hidden divide-y divide-slate-50">
                <InfoRow label="Version" value={process.env.NEXT_PUBLIC_APP_VERSION ?? '—'} />
                <InfoRow label="Learning language" value="Dutch (Nederlands)" />
                <InfoRow label="Interface language" value="English" />
              </Card>
            </section>

            {/* Reset progress */}
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={resetting}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-orange-500 rounded-2xl border border-orange-100 bg-white hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              Reset All Progress
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-red-500 rounded-2xl border border-red-100 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">{children}</p>
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <Card className="p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-primary-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out m-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

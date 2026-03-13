'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { completePlacementTest } from '@/lib/supabase/queries'
import { useProfile } from '@/hooks/useProfile'
import { LEVEL_META } from '@/lib/placement'
import { cn } from '@/lib/utils'

interface Props {
  finalLevel: string
  questionsAnswered: number
  correctAnswers: number
  elapsedSeconds: number
  onRetake: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function PlacementResult({
  finalLevel,
  questionsAnswered,
  correctAnswers,
  elapsedSeconds,
  onRetake,
}: Props) {
  const router = useRouter()
  const { user, refreshProfile } = useProfile()
  const [saving, setSaving] = useState(false)

  const meta = LEVEL_META[finalLevel] ?? LEVEL_META['A0']
  const accuracy =
    questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0

  async function handleStartLearning() {
    if (!user) { router.push('/learn'); return }
    setSaving(true)
    const supabase = createClient()
    await completePlacementTest(supabase, user.id, finalLevel)
    await refreshProfile()
    router.push('/learn')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm text-center space-y-8">

        {/* Level badge */}
        <div className="space-y-4">
          <div
            className={cn(
              'w-28 h-28 rounded-3xl mx-auto flex flex-col items-center justify-center shadow-lg',
              meta.bgColor,
            )}
          >
            <span className="text-4xl">{meta.emoji}</span>
            <span className={cn('text-xl font-extrabold mt-1', meta.color)}>{finalLevel}</span>
          </div>

          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">
              Your Dutch level is
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{finalLevel}</h1>
            <p className={cn('text-base font-semibold mt-0.5', meta.color)}>{meta.title}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed">{meta.description}</p>

        {/* Stats row */}
        <div className="flex gap-4 justify-center">
          <StatChip label="Questions" value={questionsAnswered} />
          <StatChip label="Accuracy" value={`${accuracy}%`} />
          <StatChip label="Time" value={formatTime(elapsedSeconds)} />
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={handleStartLearning}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary-900 text-white font-bold py-4 rounded-2xl text-base hover:bg-primary-800 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              'Setting up your path…'
            ) : (
              <>
                Start learning at {finalLevel}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <button
            onClick={onRetake}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 text-slate-500 text-sm py-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={14} />
            Retake the test
          </button>

          <button
            onClick={async () => {
              if (!user) { router.push('/learn'); return }
              setSaving(true)
              const supabase = createClient()
              await completePlacementTest(supabase, user.id, 'A0')
              await refreshProfile()
              router.push('/learn')
            }}
            disabled={saving}
            className="w-full text-slate-400 text-xs py-2 hover:text-slate-600 transition-colors"
          >
            Skip and start from A0 instead
          </button>
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 rounded-xl px-4 py-2.5 text-center">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStreakHistory } from '@/lib/supabase/queries'
import type { StreakHistory } from '@/lib/types'

export interface DayStats {
  date: string
  label: string       // "Mon", "Tue" etc.
  labelShort: string  // "M", "T" etc.
  xp: number
  lessons: number
  isToday: boolean
}

export function useStreakHistory(userId: string | undefined, days = 7) {
  const [history, setHistory] = useState<StreakHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    const supabase = createClient()
    getStreakHistory(supabase, userId, days)
      .then((data) => { setHistory(data); setLoading(false) })
  }, [userId, days])

  const todayStr = new Date().toISOString().split('T')[0]
  const historyMap = new Map(history.map((h) => [h.date, h]))

  // Build a full array of the last `days` calendar days
  const chartData: DayStats[] = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const date = d.toISOString().split('T')[0]
    const rec = historyMap.get(date)
    return {
      date,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      labelShort: d.toLocaleDateString('en-GB', { weekday: 'narrow' }),
      xp: rec?.xp_earned ?? 0,
      lessons: rec?.lessons_completed ?? 0,
      isToday: date === todayStr,
    }
  })

  const todayRecord = historyMap.get(todayStr)

  return {
    history,
    loading,
    chartData,
    todayXP: todayRecord?.xp_earned ?? 0,
    todayLessons: todayRecord?.lessons_completed ?? 0,
  }
}

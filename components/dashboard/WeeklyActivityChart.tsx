'use client'

import { cn } from '@/lib/utils'
import type { DayStats } from '@/hooks/useStreakHistory'

interface Props {
  data: DayStats[]
  className?: string
}

export default function WeeklyActivityChart({ data, className }: Props) {
  const maxXP = Math.max(...data.map((d) => d.xp), 1)
  const totalWeekXP = data.reduce((s, d) => s + d.xp, 0)
  const activeDays = data.filter((d) => d.xp > 0).length

  return (
    <div className={cn('space-y-3', className)}>
      {/* Sub-header stats */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{totalWeekXP > 0 ? `${totalWeekXP} XP this week` : 'No activity yet'}</span>
        <span>{activeDays}/7 active days</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-20">
        {data.map((day) => {
          const heightPct = day.xp > 0 ? Math.max((day.xp / maxXP) * 100, 10) : 0

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: '56px' }}>
                {day.xp > 0 ? (
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all duration-500',
                      day.isToday ? 'bg-primary-900' : 'bg-primary-200',
                    )}
                    style={{ height: `${heightPct}%` }}
                    title={`${day.xp} XP`}
                  />
                ) : (
                  <div className="w-full h-1 bg-slate-100 rounded" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium',
                  day.isToday ? 'text-primary-900' : 'text-slate-400',
                )}
              >
                {day.isToday ? '·' : day.labelShort}
              </span>
            </div>
          )
        })}
      </div>

      {/* Day labels row */}
      <div className="flex gap-1.5">
        {data.map((day) => (
          <div key={day.date} className="flex-1 text-center">
            <span
              className={cn(
                'text-[10px]',
                day.isToday ? 'font-bold text-primary-900' : 'text-slate-400',
              )}
            >
              {day.isToday ? 'Today' : day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

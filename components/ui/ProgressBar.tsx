import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  color?: 'blue' | 'green' | 'amber' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-violet-500',
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3',
}

export default function ProgressBar({
  value,
  className,
  color = 'blue',
  size = 'md',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            animated && 'duration-700 ease-out',
            colorMap[color]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

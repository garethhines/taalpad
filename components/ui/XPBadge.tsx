import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface XPBadgeProps {
  xp: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function XPBadge({ xp, className, size = 'md' }: XPBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-0.5',
    md: 'text-sm px-2.5 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  }
  const iconSize = { sm: 12, md: 14, lg: 16 }

  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200',
      sizeClasses[size],
      className
    )}>
      <Zap size={iconSize[size]} className="text-amber-500" fill="currentColor" />
      {xp} XP
    </span>
  )
}

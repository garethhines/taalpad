import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export default function Card({ children, className, onClick, hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/[0.07] shadow-sm',
        hoverable && 'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

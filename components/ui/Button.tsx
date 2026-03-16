import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

const variants = {
  primary: 'bg-primary-900 text-white hover:bg-[#142a4a] active:bg-primary-950 shadow-sm dark:bg-primary-800 dark:hover:bg-primary-900',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/[0.12]',
  ghost: 'text-primary-900 hover:bg-primary-50 active:bg-primary-100 dark:text-violet-300 dark:hover:bg-violet-900/20',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  accent: 'bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-sm hover:shadow-accent-glow active:from-violet-700 active:to-violet-900',
}

const sizes = {
  sm: 'text-sm px-3 py-2 rounded-2xl',
  md: 'text-sm px-4 py-3 rounded-2xl',
  lg: 'text-base px-6 py-4 rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading…
        </span>
      ) : children}
    </button>
  )
}

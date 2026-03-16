'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Layers, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWordsDue } from '@/hooks/useWordsDue'

export default function BottomNav() {
  const pathname = usePathname()
  const wordsDue = useWordsDue()

  const navItems = [
    { href: '/dashboard', label: 'Home',    icon: Home,    badge: 0 },
    { href: '/learn',     label: 'Learn',   icon: BookOpen, badge: 0 },
    { href: '/flashcards',label: 'Cards',   icon: Layers,  badge: wordsDue },
    { href: '/profile',   label: 'Profile', icon: User,    badge: 0 },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t border-slate-100 dark:border-white/5 px-2 pb-safe-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive ? 'text-violet-700 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400',
              )}
            >
              <div className={cn('relative p-1.5 rounded-xl transition-all duration-200', isActive && 'bg-violet-100 dark:bg-violet-900/25')}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

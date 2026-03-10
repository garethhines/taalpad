'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Layers, User, Flame, Zap } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useWordsDue } from '@/hooks/useWordsDue'
import { getEffectiveStreak } from '@/lib/streak'
import { formatXP } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home',       icon: Home },
  { href: '/learn',     label: 'Learn',      icon: BookOpen },
  { href: '/flashcards',label: 'Flashcards', icon: Layers },
  { href: '/profile',   label: 'Profile',    icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { profile } = useProfile()
  const wordsDue = useWordsDue()
  const streak = profile ? getEffectiveStreak(profile) : 0

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-slate-100 z-40">
      {/* Wordmark */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-900 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold">NL</span>
          </div>
          <div>
            <span className="text-lg font-bold text-primary-900">Taalpad</span>
            <p className="text-[10px] text-slate-400 leading-none">Learn Dutch</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          const badge = href === '/flashcards' ? wordsDue : 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Streak + XP mini-stats */}
      {profile && (
        <div className="px-4 py-4 mx-3 mb-3 bg-slate-50 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-orange-500" fill="currentColor" />
              <span className="text-xs font-semibold text-slate-700">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" fill="currentColor" />
              <span className="text-xs font-semibold text-amber-700">{formatXP(profile.total_xp)} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* User info */}
      {profile && (
        <div className="px-4 py-4 border-t border-slate-100">
          <Link href="/profile" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary-900 transition-colors">
                {profile.display_name}
              </p>
              <p className="text-xs text-slate-400">CEFR {profile.current_level}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  )
}

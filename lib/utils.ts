import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function getLevelTitle(level: number): string {
  const titles = ['Beginner', 'Novice', 'Explorer', 'Student', 'Learner', 'Advanced', 'Master']
  return titles[Math.min(level - 1, titles.length - 1)] || 'Master'
}

export function getCEFRTitle(level: string): string {
  const titles: Record<string, string> = {
    A0: 'Absolute Beginner',
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
  }
  return titles[level] ?? level
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak today!'
  if (streak === 1) return '1 day streak — keep going!'
  if (streak < 7) return `${streak} day streak — you're on a roll!`
  if (streak < 30) return `${streak} day streak — impressive!`
  return `${streak} day streak — you're unstoppable!`
}

export function speakDutch(text: string): void {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'nl-NL'
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1

  // Try to find a Dutch voice
  const voices = window.speechSynthesis.getVoices()
  const dutchVoice = voices.find(
    (v) => v.lang === 'nl-NL' || v.lang === 'nl-BE' || v.lang.startsWith('nl')
  )
  if (dutchVoice) utterance.voice = dutchVoice

  window.speechSynthesis.speak(utterance)
}

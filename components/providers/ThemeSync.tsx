'use client'

import { useEffect } from 'react'

/**
 * Reads the dark mode setting from localStorage on mount and applies
 * the `dark` class to <html>. Handles initial page load / SSR hydration.
 */
export function ThemeSync() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taalpad-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        document.documentElement.classList.toggle('dark', !!settings.darkMode)
      }
    } catch {
      // ignore
    }
  }, [])

  return null
}

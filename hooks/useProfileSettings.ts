'use client'

import { useState, useEffect } from 'react'

export interface ProfileSettings {
  soundEnabled: boolean
  ttsAutoPlay: boolean
  optionTts: boolean  // speak selected option in exercises
  darkMode: boolean
}

const DEFAULT_SETTINGS: ProfileSettings = {
  soundEnabled: true,
  ttsAutoPlay: true,
  optionTts: true,
  darkMode: false,
}

function applyDarkMode(dark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }
}

export function useProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('taalpad-settings')
      if (saved) {
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        setSettings(parsed)
        applyDarkMode(parsed.darkMode)
      }
    } catch {
      // ignore
    }
  }, [])

  function updateSetting<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('taalpad-settings', JSON.stringify(next)) } catch {}
      if (key === 'darkMode') applyDarkMode(value as boolean)
      return next
    })
  }

  return { settings, updateSetting, mounted }
}

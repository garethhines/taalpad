'use client'

import { useState, useEffect } from 'react'

export interface ProfileSettings {
  soundEnabled: boolean
  ttsAutoPlay: boolean
  optionTts: boolean  // speak selected option in exercises
}

const DEFAULT_SETTINGS: ProfileSettings = {
  soundEnabled: true,
  ttsAutoPlay: true,
  optionTts: true,
}

export function useProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('taalpad-settings')
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    } catch {
      // ignore
    }
  }, [])

  function updateSetting<K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('taalpad-settings', JSON.stringify(next)) } catch {}
      return next
    })
  }

  return { settings, updateSetting, mounted }
}

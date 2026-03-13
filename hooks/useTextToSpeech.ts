'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTextToSpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { lang = 'nl-NL', rate = 0.85, pitch = 1 } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentText, setCurrentText] = useState<string | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setIsSupported(true)

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      // Chrome/Android: resume if paused, then cancel before speaking
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = 1

      // Prefer exact lang match, then any Dutch variant
      const voice =
        voicesRef.current.find((v) => v.lang === lang) ??
        voicesRef.current.find((v) => v.lang.startsWith('nl')) ??
        null
      if (voice) utterance.voice = voice

      utterance.onstart = () => { setIsSpeaking(true); setCurrentText(text) }
      utterance.onend = () => { setIsSpeaking(false); setCurrentText(null) }
      utterance.onerror = () => { setIsSpeaking(false); setCurrentText(null) }

      // Small delay after cancel — fixes Chrome mobile silent-speech bug
      setTimeout(() => window.speechSynthesis.speak(utterance), 50)
    },
    [isSupported, lang, rate, pitch],
  )

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setCurrentText(null)
  }, [isSupported])

  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking && currentText === text) {
        stop()
      } else {
        speak(text)
      }
    },
    [isSpeaking, currentText, speak, stop],
  )

  return { isSupported, isSpeaking, currentText, speak, stop, toggle }
}

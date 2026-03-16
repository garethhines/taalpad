'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTextToSpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
}

/**
 * Score a browser voice for Dutch quality. Higher = better.
 * Used as fallback when the cloud TTS API is unavailable.
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()

  if (!lang.startsWith('nl')) return -1

  let score = 0
  if (!voice.localService) score += 100  // cloud/neural
  if (name.includes('neural')) score += 80
  if (name.includes('natural')) score += 80
  if (name.includes('online')) score += 60
  if (name.includes('premium')) score += 50
  if (name.includes('enhanced')) score += 40
  if (name.includes('google')) score += 50
  if (name.includes('microsoft')) score += 40
  if (lang === 'nl-nl') score += 20
  else if (lang === 'nl-be') score += 10
  if (name.includes('espeak')) score -= 100
  if (name.includes('festival')) score -= 100
  if (name.includes('pico')) score -= 50

  return score
}

/** Module-level audio cache — survives remounts, cleared on full navigation */
const ttsCache = new Map<string, ArrayBuffer>()

/** Play an audio ArrayBuffer, resolves when done */
function playAudioBuffer(buffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer], { type: 'audio/mpeg' })
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = () => { URL.revokeObjectURL(url); reject() }
    audio.play().catch(reject)
  })
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { lang = 'nl-NL', rate = 0.88, pitch = 1 } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentText, setCurrentText] = useState<string | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const bestVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // null = untested, true = works, false = unavailable
  const apiAvailableRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsSupported(true)

    if ('speechSynthesis' in window) {
      const pickBestVoice = () => {
        const voices = window.speechSynthesis.getVoices()
        voicesRef.current = voices
        const scored = voices
          .map((v) => ({ voice: v, score: scoreVoice(v) }))
          .filter((x) => x.score >= 0)
          .sort((a, b) => b.score - a.score)
        bestVoiceRef.current = scored[0]?.voice ?? null
      }
      pickBestVoice()
      window.speechSynthesis.addEventListener('voiceschanged', pickBestVoice)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', pickBestVoice)
    }
  }, [])

  /** Try cloud TTS — returns true if audio played, false if unavailable */
  const speakViaApi = useCallback(async (text: string): Promise<boolean> => {
    // Skip if we already know the API is down
    if (apiAvailableRef.current === false) return false

    try {
      let buffer: ArrayBuffer
      if (ttsCache.has(text)) {
        buffer = ttsCache.get(text)!
      } else {
        const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
        if (!res.ok) {
          if (res.status === 503) apiAvailableRef.current = false // not configured
          return false
        }
        apiAvailableRef.current = true
        buffer = await res.arrayBuffer()
        ttsCache.set(text, buffer)
      }
      setIsSpeaking(true)
      setCurrentText(text)
      await playAudioBuffer(buffer)
      setIsSpeaking(false)
      setCurrentText(null)
      return true
    } catch {
      return false
    }
  }, [])

  /** Fallback: browser Web Speech API */
  const speakViaBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = 1

    if (bestVoiceRef.current) utterance.voice = bestVoiceRef.current

    utterance.onstart = () => { setIsSpeaking(true); setCurrentText(text) }
    utterance.onend = () => { setIsSpeaking(false); setCurrentText(null) }
    utterance.onerror = () => { setIsSpeaking(false); setCurrentText(null) }

    setTimeout(() => window.speechSynthesis.speak(utterance), 50)
  }, [lang, rate, pitch])

  const speak = useCallback(async (text: string) => {
    if (!isSupported) return
    // Stop any current audio element
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }

    const usedApi = await speakViaApi(text)
    if (!usedApi) speakViaBrowser(text)
  }, [isSupported, speakViaApi, speakViaBrowser])

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setCurrentText(null)
  }, [])

  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking && currentText === text) stop()
      else speak(text)
    },
    [isSpeaking, currentText, speak, stop],
  )

  return { isSupported, isSpeaking, currentText, speak, stop, toggle }
}

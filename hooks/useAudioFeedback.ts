'use client'

import { useCallback, useRef } from 'react'

/**
 * Plays short synthesised sound effects for correct / incorrect answers
 * using the Web Audio API (no audio files needed).
 */
export function useAudioFeedback(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!('AudioContext' in window || 'webkitAudioContext' in window)) return null
    if (!ctxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext ?? (window as any).webkitAudioContext
      ctxRef.current = new Ctx()
    }
    return ctxRef.current
  }

  function playTone(freq: number, startTime: number, duration: number, ctx: AudioContext, gainVal = 0.3) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }

  const playCorrect = useCallback(() => {
    if (!enabled) return
    const ctx = getCtx()
    if (!ctx) return
    // Resume if suspended (required after user gesture on some browsers)
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    // Two ascending tones: a pleasant "ding ding"
    playTone(880, t, 0.15, ctx)
    playTone(1100, t + 0.12, 0.2, ctx)
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const playIncorrect = useCallback(() => {
    if (!enabled) return
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    // Short descending buzz
    playTone(300, t, 0.12, ctx, 0.25)
    playTone(220, t + 0.1, 0.18, ctx, 0.2)
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { playCorrect, playIncorrect }
}

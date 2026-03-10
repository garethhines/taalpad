'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { cn } from '@/lib/utils'

interface SpeakerButtonProps {
  text: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'ghost' | 'pill'
}

const sizeMap = {
  sm: { icon: 14, btn: 'w-7 h-7' },
  md: { icon: 18, btn: 'w-9 h-9' },
  lg: { icon: 22, btn: 'w-11 h-11' },
}

export default function SpeakerButton({
  text,
  size = 'md',
  className,
  variant = 'ghost',
}: SpeakerButtonProps) {
  const { isSupported, isSpeaking, currentText, toggle } = useTextToSpeech()

  if (!isSupported) return null

  const isThisSpeaking = isSpeaking && currentText === text
  const { icon: iconSize, btn: btnSize } = sizeMap[size]

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle(text) }}
      aria-label={isThisSpeaking ? 'Stop' : `Listen to "${text}"`}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-150 shrink-0',
        btnSize,
        variant === 'pill' && 'gap-1.5 px-3 w-auto text-xs font-medium',
        isThisSpeaking
          ? 'bg-primary-900 text-white'
          : 'bg-primary-50 text-primary-900 hover:bg-primary-100 active:bg-primary-200',
        className,
      )}
    >
      {isThisSpeaking ? (
        <span className="flex items-center gap-1">
          <SoundWaveIcon size={iconSize} />
          {variant === 'pill' && <span>Stop</span>}
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <Volume2 size={iconSize} />
          {variant === 'pill' && <span>Listen</span>}
        </span>
      )}
    </button>
  )
}

function SoundWaveIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="9" width="2" height="6" rx="1" className="animate-[soundBar1_0.8s_ease-in-out_infinite]" />
      <rect x="6" y="6" width="2" height="12" rx="1" className="animate-[soundBar2_0.8s_ease-in-out_0.1s_infinite]" />
      <rect x="10" y="4" width="2" height="16" rx="1" className="animate-[soundBar3_0.8s_ease-in-out_0.2s_infinite]" />
      <rect x="14" y="6" width="2" height="12" rx="1" className="animate-[soundBar2_0.8s_ease-in-out_0.3s_infinite]" />
      <rect x="18" y="9" width="2" height="6" rx="1" className="animate-[soundBar1_0.8s_ease-in-out_0.4s_infinite]" />
    </svg>
  )
}

'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useVocabularyProgress } from '@/hooks/useVocabularyProgress'
import DeckSelector, { type StudyMode } from '@/components/flashcards/DeckSelector'
import StudySession from '@/components/flashcards/StudySession'
import type { VocabWord } from '@/lib/vocabulary'

type View = 'select' | 'studying'

interface ActiveSession {
  mode: StudyMode
  queue: VocabWord[]
  title: string
}

export default function FlashcardsPage() {
  const { user } = useProfile()
  const { progress, refresh } = useVocabularyProgress(user?.id)
  const [view, setView] = useState<View>('select')
  const [session, setSession] = useState<ActiveSession | null>(null)

  function handleStart(mode: StudyMode, queue: VocabWord[], title: string) {
    setSession({ mode, queue, title })
    setView('studying')
  }

  function handleBack() {
    setView('select')
    setSession(null)
  }

  async function handleSessionComplete() {
    await refresh()
  }

  if (view === 'studying' && session) {
    return (
      <StudySession
        title={session.title}
        initialQueue={session.queue}
        progress={progress}
        onBack={handleBack}
        onSessionComplete={handleSessionComplete}
      />
    )
  }

  return (
    <DeckSelector
      progress={progress}
      onStart={handleStart}
    />
  )
}

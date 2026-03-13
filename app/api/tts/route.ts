import { NextRequest, NextResponse } from 'next/server'

/**
 * TTS proxy — converts Dutch text to audio using ElevenLabs.
 *
 * Requires env var: ELEVENLABS_API_KEY
 *
 * ElevenLabs free tier: 10,000 chars/month.
 * Recommended voice: "Nicole" or any multilingual v2 voice.
 * Find voice IDs at: https://elevenlabs.io/docs/api-reference/get-voices
 *
 * If ELEVENLABS_API_KEY is not set, returns 503 and the client falls
 * back to the browser Web Speech API automatically.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
// "Nicole" — calm, clear female voice that works well for Dutch
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'piTKgcLEGmPE4e6mEKli'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')

  if (!text) {
    return NextResponse.json({ error: 'Missing text param' }, { status: 400 })
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'TTS API not configured' }, { status: 503 })
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    },
  )

  if (!res.ok) {
    const msg = await res.text()
    console.error('[TTS] ElevenLabs error:', res.status, msg)
    return NextResponse.json({ error: 'TTS request failed' }, { status: 502 })
  }

  const audio = await res.arrayBuffer()

  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      // Cache for 1 hour — same word/phrase will sound identical
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

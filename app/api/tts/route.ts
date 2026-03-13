import { NextRequest, NextResponse } from 'next/server'

/**
 * TTS proxy — converts Dutch text to audio using Azure Cognitive Services.
 *
 * Required env vars:
 *   AZURE_TTS_KEY    — your Azure Speech resource key
 *   AZURE_TTS_REGION — your Azure resource region (e.g. "westeurope")
 *
 * Free tier: 500,000 neural characters/month.
 * Default voice: nl-NL-FennaNeural (natural Dutch female voice).
 * Override voice with AZURE_TTS_VOICE env var.
 *
 * If keys are not set, returns 503 and the client falls back to the
 * browser Web Speech API automatically.
 */

const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION
const AZURE_TTS_VOICE = process.env.AZURE_TTS_VOICE ?? 'nl-NL-FennaNeural'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')

  if (!text) {
    return NextResponse.json({ error: 'Missing text param' }, { status: 400 })
  }

  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    return NextResponse.json({ error: 'TTS API not configured' }, { status: 503 })
  }

  const ssml = `<speak version='1.0' xml:lang='nl-NL'>
  <voice name='${AZURE_TTS_VOICE}'>
    ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </voice>
</speak>`

  const res = await fetch(
    `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: ssml,
    },
  )

  if (!res.ok) {
    const msg = await res.text()
    console.error('[TTS] Azure error:', res.status, msg)
    return NextResponse.json({ error: 'TTS request failed', azure_status: res.status, detail: msg }, { status: 502 })
  }

  const audio = await res.arrayBuffer()

  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

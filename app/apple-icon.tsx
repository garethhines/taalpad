import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Speech bubble */}
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            width: 138,
            height: 88,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 14px',
            boxShadow: '0 8px 24px rgba(124,58,237,0.28)',
          }}
        >
          {/* Node 1: Completed — emerald */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 5, background: 'white', display: 'flex' }} />
          </div>

          {/* Node 2: Active — violet with outer ring */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: 'rgba(124,58,237,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                background: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 9, height: 9, borderRadius: 5, background: 'white', display: 'flex' }} />
            </div>
          </div>

          {/* Node 3: Locked — slate */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'white', display: 'flex' }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}

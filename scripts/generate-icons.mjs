/**
 * Generates placeholder PWA icons for Taalpad.
 *
 * Creates solid deep-blue PNG files at all required sizes.
 * Replace with properly branded icons before public launch.
 *
 * Usage:  node scripts/generate-icons.mjs
 * No external dependencies — uses only built-in Node.js modules.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Minimal PNG writer ────────────────────────────────────────────────────

const CRC_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  CRC_TABLE[i] = c
}

function crc32(data) {
  let crc = 0xffffffff
  for (const b of data) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.allocUnsafe(4); lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([lenBuf, t, data, crcBuf])
}

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, bit-depth=8, color-type=2 (RGB), compression=0, filter=0, interlace=0
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type: truecolor

  // Raw image data: each row = 1 filter byte (0 = None) + width * 3 RGB bytes
  const rowBuf = Buffer.alloc(1 + size * 3)
  rowBuf[0] = 0 // filter: None
  for (let x = 0; x < size; x++) {
    rowBuf[1 + x * 3 + 0] = r
    rowBuf[1 + x * 3 + 1] = g
    rowBuf[1 + x * 3 + 2] = b
  }
  const rawData = Buffer.concat(Array.from({ length: size }, () => rowBuf))
  const idat = deflateSync(rawData)

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Generate icons ────────────────────────────────────────────────────────

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT_DIR = join(__dirname, '..', 'public', 'icons')

// Taalpad primary colour: #1a365d = rgb(26, 54, 93)
const [R, G, B] = [26, 54, 93]

mkdirSync(OUT_DIR, { recursive: true })

for (const size of SIZES) {
  const png = createSolidPNG(size, R, G, B)
  const outPath = join(OUT_DIR, `icon-${size}x${size}.png`)
  writeFileSync(outPath, png)
  process.stdout.write(`  ✓  icon-${size}x${size}.png\n`)
}

console.log(`\n${SIZES.length} placeholder icons written to public/icons/`)
console.log('They are solid deep-blue squares — replace with proper branded')
console.log('icons before your public launch (192×192 and 512×512 are critical).')

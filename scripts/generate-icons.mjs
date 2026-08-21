// One-off icon generation for the PWA manifest. Run with:
//   node scripts/generate-icons.mjs
// Rasterizes the hand-drawn SVG marks in scripts/ into the PNGs public/
// needs for manifest icons, apple-touch-icon, and favicon fallback.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dir, '..')
const src = path.join(dir, 'icon-source.svg')
const srcMaskable = path.join(dir, 'icon-maskable-source.svg')
const outIcons = path.join(root, 'public', 'icons')
const outPublic = path.join(root, 'public')

await mkdir(outIcons, { recursive: true })

const targets = [
  { input: src, out: path.join(outIcons, 'icon-192.png'), size: 192 },
  { input: src, out: path.join(outIcons, 'icon-512.png'), size: 512 },
  { input: srcMaskable, out: path.join(outIcons, 'icon-maskable-512.png'), size: 512 },
  { input: src, out: path.join(outPublic, 'apple-touch-icon.png'), size: 180 },
  { input: src, out: path.join(outPublic, 'pwa-64x64.png'), size: 64 },
]

for (const t of targets) {
  await sharp(t.input).resize(t.size, t.size).png().toFile(t.out)
  console.log('wrote', path.relative(root, t.out))
}

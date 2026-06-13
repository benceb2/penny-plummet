import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = join(__dirname, '../public/favicon.svg')
const outDir = join(__dirname, '../public/icons')

const sizes = [
  { size: 192, suffix: '192x192' },
  { size: 512, suffix: '512x512' },
]

for (const { size, suffix } of sizes) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(join(outDir, `icon-${suffix}.png`))
  console.log(`Generated icon-${suffix}.png`)
}

// maskable: add padding (10% inset) so the icon looks good in any mask shape
await sharp(svgPath)
  .resize(460, 460)
  .extend({ top: 26, bottom: 26, left: 26, right: 26, background: { r: 33, g: 37, b: 41, alpha: 1 } })
  .png()
  .toFile(join(outDir, 'icon-512x512-maskable.png'))
console.log('Generated icon-512x512-maskable.png')

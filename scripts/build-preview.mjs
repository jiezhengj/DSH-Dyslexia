/**
 * Builds `docs/preview.svg`, the single illustration the plugin page shows
 * below the description.
 *
 * The picture is composed from the real drawing engine: `vendor/pele` renders
 * the sample flowchart under the same theme colours the chat uses, and that SVG
 * is placed inside a frame that mirrors what the chat shows — a source card on
 * the left, an arrow, the drawing, and the two buttons under it. The labels are
 * the diagram's own content, so they are kept; everything the plugin draws
 * around them is made of shapes only.
 *
 * Usage: node scripts/build-preview.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 300
const SAMPLE = 'flowchart LR\n  A[Code block] --> B[Diagram]\n  A --> C[Source text]'
const SAMPLE_OPTIONS = { fontSize: 13, padding: 12, maxWidth: 300, autoDirection: false }

const INK = '#1F2430'
const MUTED = '#B9C1D9'
const LINE = '#E4E8F6'
const PAPER = '#FFFFFF'
const BLUE = '#658EFF'
const MINT = '#41E1AC'

/** Theme colours handed to the engine, matching what the chat maps from its tokens. */
const THEME_VARS = [
  '--pele-bg:#ffffff',
  '--pele-fg:#1f2430',
  '--pele-muted:#6b7387',
  '--pele-line:#4a5a86',
  '--pele-surface:#eef2fb',
  '--pele-surface-alt:#e2e9f8',
  '--pele-border:#b9cbef',
  '--pele-accent:#658eff',
  '--pele-font:system-ui, sans-serif',
  '--pele-font-mono:ui-monospace, monospace',
].join(';')

/** Runs the shipped engine in a sandbox and returns the drawing it produces. */
async function renderSample() {
  const engine = await readFile(join(root, 'vendor', 'pele', 'pele.global.js'), 'utf8')
  const sandbox = { console, setTimeout, clearTimeout }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(engine, sandbox, { filename: 'pele.global.js' })
  const pele = sandbox.pele
  if (!pele || typeof pele.render !== 'function') throw new Error('the engine did not expose render()')
  const drawn = pele.render(SAMPLE, SAMPLE_OPTIONS)
  if (!drawn || typeof drawn.svg !== 'string') throw new Error('the engine returned no svg')
  return drawn
}

/** The source card: a code block drawn as short rules, no letters. */
function sourceCard() {
  const rows = [
    [60, 30, BLUE],
    [96, 60, MUTED],
    [60, 40, MUTED],
    [104, 48, MUTED],
    [84, 64, MINT],
    [112, 36, MUTED],
  ]
  const rules = rows
    .map(([x, width, colour], index) => {
      const y = 108 + index * 20
      return `    <rect x="${x}" y="${y}" width="${width}" height="9" rx="4.5" fill="${colour}"/>`
    })
    .join('\n')
  return `<g id="source">
    <rect x="36" y="62" width="176" height="176" rx="16" fill="${PAPER}" stroke="${LINE}" stroke-width="2"/>
    <path d="M36 78a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16v18H36z" fill="${LINE}" fill-opacity="0.6"/>
    <circle cx="56" cy="79" r="4" fill="${BLUE}"/>
    <circle cx="70" cy="79" r="4" fill="${MUTED}"/>
    <circle cx="84" cy="79" r="4" fill="${MUTED}"/>
${rules}
  </g>`
}

/** Two icon-only buttons under the drawing, as the chat shows them. */
function buttons() {
  const pill = (x) => `<rect x="${x}" y="214" width="32" height="26" rx="13" fill="${LINE}" fill-opacity="0.8"/>`
  return `<g id="buttons">
    ${pill(278)}
    ${pill(318)}
    <g stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7">
      <rect x="288" y="221" width="9" height="11" rx="2.5"/>
      <path d="M294 218.5h5.5a2.5 2.5 0 0 1 2.5 2.5v8.5"/>
    </g>
    <g stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7">
      <path d="M331 221.5 326.5 226l4.5 4.5"/>
      <path d="M337 221.5 341.5 226l-4.5 4.5"/>
    </g>
  </g>`
}

/** The drawing, scaled into the frame the way the plugin lays it out. */
function figure(drawn) {
  const boxX = 260
  const boxY = 52
  const boxWidth = 344
  const boxHeight = 196
  const padX = 22
  const padTop = 20
  const padBottom = 54
  const scale = Math.min(
    (boxWidth - padX * 2) / drawn.width,
    (boxHeight - padTop - padBottom) / drawn.height,
    1,
  )
  const offsetX = boxX + (boxWidth - drawn.width * scale) / 2
  const offsetY = boxY + padTop + ((boxHeight - padTop - padBottom) - drawn.height * scale) / 2
  return `<g id="figure">
    <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="14" fill="${PAPER}" stroke="${LINE}" stroke-width="2"/>
    <g style="${THEME_VARS}" transform="translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})">
      ${drawn.svg}
    </g>
    <path d="M${boxX + 18} 202h${boxWidth - 36}" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>
  </g>`
}

function arrow() {
  return `<g id="arrow">
    <path d="M220 150h16" stroke="${BLUE}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M233 143.5 244 150l-11 6.5z" fill="${BLUE}"/>
  </g>`
}

async function main() {
  const drawn = await renderSample()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#F5F6FC"/>
  ${sourceCard()}
  ${arrow()}
  ${figure(drawn)}
  ${buttons()}
</svg>
`
  const target = join(root, 'docs', 'preview.svg')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, svg, 'utf8')
  console.log(`build-preview: docs/preview.svg (${svg.length} chars, drawing ${drawn.width}x${drawn.height})`)
}

await main()

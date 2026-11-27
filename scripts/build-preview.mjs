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
// The sample uses one shape per role, so the illustration shows the mapping the
// chat applies: a start, a decision, stored data, input, and a plain step.
const SAMPLE = [
  'flowchart LR',
  '  A([Reads]) --> B{Clear?}',
  '  B -->|yes| C[(Shows)]',
  '  B -->|no| D[/Rewrites/]',
  '  C --> E[Reads on]',
].join('\n')
const SAMPLE_OPTIONS = { fontSize: 12, padding: 12, maxWidth: 320, autoDirection: false }

/**
 * The real theme, not an invented one: `verify/host-tokens.json` is extracted
 * from the installed chat by `scripts/extract-host-tokens.mjs`, so the preview
 * goes grey and thinly drawn exactly when the chat does. A hand-picked palette
 * here is what let 0.2.x ship a preview that looked nothing like the product.
 */
const host = JSON.parse(await readFile(join(root, 'verify', 'host-tokens.json'), 'utf8'))
const LIGHT = host.light

function channels(value) {
  const match = /rgba?\(([^)]+)\)/.exec(value)
  if (!match) throw new Error(`host token is not a colour: ${value}`)
  return match[1].split(',').map((part) => Number(part.trim()))
}

/** `color-mix(in srgb, <colour> <share>%, <base>)`, done in the same space. */
function mix(colour, share, base) {
  const front = channels(colour)
  const back = channels(base)
  const alpha = share / 100
  const channelsOut = [0, 1, 2].map((index) => Math.round(front[index] * alpha + back[index] * (1 - alpha)))
  return `rgb(${channelsOut.join(', ')})`
}

const B = (name) => LIGHT[`--dsw-alias-${name}`]
const S = (name) => LIGHT[`--dsw-static-${name}`]

const PAPER = B('bg-layer-1')
const INK = B('label-primary')
const MUTED = B('label-secondary')
const LINE = B('border-l2')
const BLUE = B('link')
const MINT = S('green-500')

const HUE = {
  startEnd: S('green-500'),
  decision: S('amber-500'),
  data: S('violet-400'),
  io: B('link'),
  process: S('neutral-bluish-400'),
}

// The nine engine variables, resolved through the plugin's own mapping.
const THEME_VARS = [
  `--pele-bg:${PAPER}`,
  `--pele-fg:${INK}`,
  `--pele-muted:${MUTED}`,
  `--pele-line:${B('label-tertiary')}`,
  `--pele-surface:${mix(B('label-primary'), 4, PAPER)}`,
  `--pele-surface-alt:${B('bg-base')}`,
  `--pele-border:${B('label-tertiary')}`,
  `--pele-accent:${BLUE}`,
  `--pele-fg-on-light:${S('neutral-bluish-1000')}`,
  `--pele-fg-on-dark:${S('neutral-bluish-50')}`,
  '--pele-font:system-ui, sans-serif',
].join(';')

/**
 * The role rules, copied from `src/client/styles.js` in shape but resolved to
 * literal colours: an SVG file cannot run `color-mix()`, and a preview that
 * dropped them would show five grey boxes where the chat shows five hues.
 */
const ROLE_CSS = Object.entries({
  startEnd: ['stadium', 'circle', 'odd'],
  decision: ['diam', 'hex'],
  data: ['cyl'],
  io: ['lean-r', 'lean-l', 'trap-b', 'trap-t'],
  process: ['rect', 'rounded', 'fr-rect'],
})
  .map(([role, shapes]) => {
    const hue = HUE[role]
    const selectors = shapes
      .map((shape) => `.dsh-dyslexia-figure .pele-shape-${shape} > :is(rect, polygon, circle, path, ellipse, polyline)`)
      .join(', ')
    return `${selectors} { fill: ${mix(hue, 18, PAPER)}; stroke: ${mix(hue, 60, INK)}; }`
  })
  .join('\n')

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
    <g class="dsh-dyslexia-figure" style="${THEME_VARS}" transform="translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})">
      <style>${ROLE_CSS}</style>
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
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="${B('bg-base')}"/>
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

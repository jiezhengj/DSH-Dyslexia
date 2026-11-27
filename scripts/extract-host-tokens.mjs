/**
 * Reads the host's own theme variables out of the installed app and writes the
 * snapshot the fixture and the preview are built from.
 *
 * Why a snapshot and not a live read: the fixture runs from `file://` with no
 * network and no access to the app bundle, and the preview is opened by whoever
 * wants to look at it. Both used to carry hand-typed variables that looked
 * plausible and were wrong (#f6f7fb for the layer colour, a blue brand colour
 * where the real one is near-black), which is exactly how 325 green checks
 * failed to notice that diagrams were invisible. Committing the real values and
 * asserting that the fixture still carries them is what makes that impossible.
 *
 * Usage:
 *   node scripts/extract-host-tokens.mjs           write verify/host-tokens.json
 *   node scripts/extract-host-tokens.mjs --check    exit 1 when the file is stale
 *
 * The app bundle is read as bytes and parsed as text; nothing is executed and
 * nothing is uploaded. Point DSH_DYSLEXIA_HOST_ASAR at another install to take
 * a snapshot outside macOS.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT = join(ROOT, 'verify', 'host-tokens.json')

/** Tokens the picture is allowed to read. Adding one here is a design change. */
const ALIASES = [
  'bg-base',
  'bg-layer-1',
  'bg-layer-2',
  'border-l1',
  'border-l2',
  'border-l3',
  'brand-primary',
  'label-primary',
  'label-primary-foreground',
  'label-secondary',
  'label-tertiary',
  'link',
  'chart-messages',
  'chart-system',
  'chart-tools',
  'switch-thumb',
  'state-error-primary',
]

/** Static palette entries the role colours and the series order are drawn from. */
const STATICS = [
  'amber-500',
  'blue-400',
  'blue-450',
  'deepseek-400',
  'deepseek-500',
  'green-500',
  'neutral-bluish-50',
  'neutral-bluish-400',
  'neutral-bluish-600',
  'neutral-bluish-1000',
  'red-400',
  'red-500',
  'violet-400',
]

const ASAR_CANDIDATES = [
  process.env.DSH_DYSLEXIA_HOST_ASAR,
  '/Applications/DeepSeek Harness.app/Contents/Resources/app.asar',
  '/Applications/DeepSeek Harness Beta.app/Contents/Resources/app.asar',
  '/opt/DeepSeek Harness/resources/app.asar',
]

function locateAsar() {
  for (const candidate of ASAR_CANDIDATES) {
    if (candidate && existsSync(candidate)) return candidate
  }
  return null
}

function hostVersion(asarPath) {
  const plist = join(dirname(dirname(asarPath)), 'Info.plist')
  if (!existsSync(plist)) return null
  const text = readFileSync(plist, 'utf8')
  const match = /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/.exec(text)
  return match ? match[1] : null
}

/** Splits off the colour blocks and resolves `var()` chains to concrete colours. */
function parseTheme(css) {
  const anchor = css.indexOf('--dsw-static-neutral-bluish-1000: rgb(')
  if (anchor < 0) throw new Error('the theme block was not found in the bundle (host layout changed)')
  // The palette and the light aliases live in the same `body {` block, so the
  // selector only has to be tracked, never reset: `static-*` names are theme
  // independent and `alias-*` ones are what the `body[data-ds-dark-theme]`
  // block overrides further down.
  const region = css.slice(Math.max(0, anchor - 30000), anchor + 40000)
  const statics = {}
  const light = {}
  const dark = {}
  let theme = null
  for (const line of region.split('\n')) {
    const text = line.trim()
    if (text === 'body {') {
      theme = light
      continue
    }
    if (text === 'body[data-ds-dark-theme] {') {
      theme = dark
      continue
    }
    const match = /^--dsw-([a-z0-9-]+):\s*(.+);$/.exec(text)
    if (!match) continue
    const [, name, raw] = match
    if (name.startsWith('static-')) {
      // First declaration wins: a later block may override the palette for one
      // component, and that is not the theme's answer.
      if (!(name in statics)) statics[name.slice('static-'.length)] = raw.trim()
      continue
    }
    if (!theme || !name.startsWith('alias-')) continue
    if (!(name in theme)) theme[name] = raw.trim()
  }
  return { statics, light, dark }
}

function hexToRgb(text) {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(text)
  if (short) {
    const parts = [short[1], short[2], short[3]].map((part) => parseInt(part + part, 16))
    return parts.join(', ')
  }
  const long = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(text)
  if (long) return [long[1], long[2], long[3]].map((part) => parseInt(part, 16)).join(', ')
  const hex4 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(text)
  if (hex4) {
    const alpha = Math.round((parseInt(hex4[4], 16) / 255) * 1000) / 1000
    return [hex4[1], hex4[2], hex4[3]].map((part) => parseInt(part, 16)).join(', ') + `, ${alpha}`
  }
  return null
}

/** Every value the snapshot keeps is a concrete `rgb(...)`/`rgba(...)` string. */
function normalize(text) {
  const value = text.trim()
  const hex = hexToRgb(value)
  if (hex) return hex.split(', ').length === 4 ? `rgba(${hex})` : `rgb(${hex})`
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i.exec(value)
  if (!rgb) return null
  const channel = (part) => {
    const number = part.endsWith('%') ? (parseFloat(part) / 100) * 255 : parseFloat(part)
    return Math.round(number)
  }
  const alphaText = rgb[4]
  if (alphaText === undefined) return `rgb(${channel(rgb[1])}, ${channel(rgb[2])}, ${channel(rgb[3])})`
  const alpha = alphaText.endsWith('%') ? parseFloat(alphaText) / 100 : parseFloat(alphaText)
  return `rgba(${channel(rgb[1])}, ${channel(rgb[2])}, ${channel(rgb[3])}, ${Math.round(alpha * 1000) / 1000})`
}

function resolve(name, theme, statics, seen = 0) {
  if (seen > 8) return null
  const raw = statics[name] !== undefined ? statics[name] : theme[`alias-${name}`]
  if (raw === undefined) return null
  const reference = /^var\(\s*--dsw-(?:static-)?([a-z0-9-]+)\s*(?:,[^)]*)?\)$/.exec(raw)
  if (reference) return resolve(reference[1], theme, statics, seen + 1)
  return normalize(raw)
}

function collect(theme, statics) {
  const out = {}
  for (const alias of ALIASES) {
    const key = `--dsw-alias-${alias}`
    const value = resolve(alias, theme, statics)
    if (!value) throw new Error(`${key} did not resolve to a colour (raw: ${theme[`alias-${alias}`]})`)
    out[key] = value
  }
  for (const name of STATICS) {
    const key = `--dsw-static-${name}`
    const value = resolve(name, theme, statics)
    if (!value) throw new Error(`${key} did not resolve to a colour (raw: ${statics[name]})`)
    out[key] = value
  }
  return out
}

const asarPath = locateAsar()
if (!asarPath) {
  process.stderr.write(
    'extract-host-tokens: no DeepSeek Harness bundle found. Set DSH_DYSLEXIA_HOST_ASAR to the app.asar of an install.\n',
  )
  process.exit(1)
}

const css = readFileSync(asarPath).toString('latin1')
const { statics, light, dark } = parseTheme(css)
const snapshot = {
  $comment:
    'Real host theme colours, read from the installed app by scripts/extract-host-tokens.mjs. ' +
    'The fixture and the preview read these values; check-bundle refuses a hand-typed one.',
  source: asarPath,
  version: hostVersion(asarPath) || 'unknown',
  extracted_at: new Date().toISOString(),
  light: collect(light, statics),
  dark: collect(dark, statics),
}

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null
  const same = current && JSON.stringify({ ...current, extracted_at: null }) === JSON.stringify({ ...snapshot, extracted_at: null })
  if (!same) {
    process.stderr.write('extract-host-tokens: verify/host-tokens.json is stale; run node scripts/extract-host-tokens.mjs\n')
    process.exit(1)
  }
  process.stdout.write(`extract-host-tokens: verify/host-tokens.json matches ${asarPath} (${snapshot.version})\n`)
} else {
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n')
  const count = Object.keys(snapshot.light).length + Object.keys(snapshot.dark).length
  process.stdout.write(
    `extract-host-tokens: wrote verify/host-tokens.json — ${count} colours from ${asarPath} (${snapshot.version})\n`,
  )
}

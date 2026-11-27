/**
 * Writes the "after" evidence page for feature 003.
 *
 * The page is what the browser actually gets: the stylesheet from
 * `src/client/styles.js`, the host colours from `verify/host-tokens.json`, and
 * the vendored engine. The two stages show one diagram under light and dark,
 * and the script measures each shape so `--dump-dom` carries numbers as well as
 * a picture. It is not part of the package: `files` stops at the plugin.
 *
 * Usage: node scripts/build-evidence.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'specs', '003-diagram-palette-contrast', 'evidence', 'shipped.html')

const styles = await readFile(join(root, 'src', 'client', 'styles.js'), 'utf8')
const start = styles.indexOf('const FIGURE_CSS = [')
const open = styles.indexOf('[', start)
let depth = 0
let end = open
for (; end < styles.length; end += 1) {
  if (styles[end] === '[') depth += 1
  else if (styles[end] === ']') {
    depth -= 1
    if (depth === 0) break
  }
}
const consts = {}
for (const match of styles.matchAll(/^const ([A-Z_]+) = '([^']*)'/gm)) consts[match[1]] = match[2]
const css = new Function(...Object.keys(consts), `return ${styles.slice(open, end + 1)}`)(
  ...Object.values(consts),
).join('\n')

const host = JSON.parse(await readFile(join(root, 'verify', 'host-tokens.json'), 'utf8'))
const block = (selector, entries) =>
  `${selector} {\n${entries.map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`
const light = block(':root', Object.entries(host.light))
const dark = block('.dark-tokens', Object.entries(host.dark))
const darkStatics = block('.dark-tokens', Object.entries(host.light).filter(([name]) => name.startsWith('--dsw-static-')))

const CODE = `flowchart LR
  A([Reads]) --> B{Clear?}
  B -->|yes| C[(Shows)]
  B -->|no| D[/Rewrites/]
  C --> E[Reads on]
  E --> A`

const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>003 evidence: the shipped palette under the real host colours</title>
<style>
${light}
${dark}
${darkStatics}
  body { margin: 0; padding: 16px; font: 13px/1.5 system-ui, sans-serif; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); }
  h1 { font-size: 15px; margin: 0 0 4px; }
  p.lead { margin: 0 0 14px; color: var(--dsw-alias-label-secondary); }
  section { margin: 0 0 18px; padding: 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; max-width: 620px; }
  section h2 { font-size: 13px; margin: 0 0 10px; font-weight: 600; }
  .dark-tokens { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
  pre#report { white-space: pre-wrap; font: 11px/1.45 ui-monospace, monospace; }
  ${css}
</style>
<h1>The shipped palette, drawn with the host's own colours</h1>
<p class="lead">Stylesheet from <code>src/client/styles.js</code>, tokens from <code>verify/host-tokens.json</code> (${host.version}), engine 1.13.0. One diagram, light above, dark below.</p>
<section class="light-tokens"><h2>Light · :root tokens</h2><div class="stage" id="light"></div></section>
<section class="dark-tokens"><h2>Dark · body[data-ds-dark-theme] tokens</h2><div class="stage" id="dark"></div></section>
<pre id="report"></pre>
<script src="../../../vendor/pele/pele.global.js"></script>
<script>
const CODE = ${JSON.stringify(CODE)}
const SHAPES = ['stadium', 'circle', 'odd', 'diam', 'hex', 'cyl', 'lean-r', 'lean-l', 'trap-b', 'trap-t', 'rect', 'rounded', 'fr-rect']
// Chrome reports a resolved color-mix() as color(srgb 0.84 0.95 0.88), so the
// reader has to take both that and the plain rgb()/rgba() form.
function colourOf(value) {
  const text = value || ''
  const srgb = /color\\(srgb\\s+([0-9.]+)\\s+([0-9.]+)\\s+([0-9.]+)(?:\\s*\\/\\s*([0-9.]+))?\\)/.exec(text)
  if (srgb) {
    const a = srgb[4] === undefined ? 1 : Number(srgb[4])
    return { r: Number(srgb[1]) * 255, g: Number(srgb[2]) * 255, b: Number(srgb[3]) * 255, a }
  }
  const match = /rgba?\\(([^)]+)\\)/.exec(text)
  if (!match) return null
  const parts = match[1].split(',').map((part) => Number(part.trim()))
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 }
}
function mix(front, back) {
  const f = colourOf(front)
  const b = colourOf(back)
  if (!f || !b) return null
  if (f.a >= 1) return f
  const a = f.a
  return { r: f.r * a + b.r * (1 - a), g: f.g * a + b.g * (1 - a), b: f.b * a + b.b * (1 - a), a: 1 }
}
function luminance(c) {
  const channel = (value) => {
    const v = value / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b)
}
function ratio(front, back) {
  const f = mix(front, back)
  const b = mix(back, back)
  if (!f || !b) return 'n/a'
  const l1 = luminance(f)
  const l2 = luminance(b)
  return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)
}
async function draw(stage) {
  const host = stage.closest('section')
  const drawn = pele.render(CODE, { fontSize: 13, padding: 12, maxWidth: 560, autoDirection: false })
  const wrap = document.createElement('div')
  wrap.className = 'dsh-dyslexia-figure'
  wrap.innerHTML = drawn.svg
  stage.append(wrap)
  // A bare stage has no background of its own; the picture sits on the first
  // painted ancestor, so that is the colour the lines are judged against.
  const canvas = (function canvasOf(node) {
    for (let element = node; element; element = element.parentElement) {
      const value = getComputedStyle(element).backgroundColor
      if (colourOf(value) && colourOf(value).a > 0) return value
    }
    return 'rgb(255, 255, 255)'
  })(stage)
  const rows = []
  for (const shape of SHAPES) {
    const node = wrap.querySelector('.pele-shape-' + shape)
    if (!node) continue
    const kind = node.querySelector('rect, polygon, circle, path, ellipse, polyline')
    const label = node.querySelector('text')
    if (!kind) continue
    const fill = getComputedStyle(kind).fill
    const stroke = getComputedStyle(kind).stroke
    rows.push(shape + ' | fill ' + fill + ' | text ' + ratio(getComputedStyle(label).fill, fill) + ':1 | stroke ' + stroke + ' | stroke/bg ' + ratio(stroke, canvas) + ':1')
  }
  const edges = wrap.querySelector('.pele-edges')
  const marker = wrap.querySelector('.pele-marker')
  if (edges) rows.push('edges | ' + getComputedStyle(edges).stroke + ' | edge/bg ' + ratio(getComputedStyle(edges).stroke, canvas) + ':1')
  if (marker) rows.push('arrow | ' + getComputedStyle(marker).fill + ' | arrow/bg ' + ratio(getComputedStyle(marker).fill, canvas) + ':1')
  return (host.className.includes('dark') ? 'DARK\\n' : 'LIGHT\\n') + rows.join('\\n')
}
draw(document.getElementById('light')).then((lightRows) => {
  draw(document.getElementById('dark')).then((darkRows) => {
    document.getElementById('report').textContent = lightRows + '\\n\\n' + darkRows
  })
})
</script>
`

await writeFile(target, PAGE, 'utf8')
console.log(`build-evidence: ${target.replace(root + '/', '')} (${PAGE.length} chars)`)

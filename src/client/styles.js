/**
 * Styles of one rendered picture.
 *
 * Everything is scoped under the `dsh-dyslexia-` prefix and reads the host
 * theme variables, so light and dark follow the app. Colors are handed to the
 * engine through its own `--pele-*` variables: the engine paints with them and
 * repaints when the theme flips, without a re-render.
 */

const FIGURE_STYLE_ID = 'dsh-dyslexia-figure-style'
const FIGURE_GROUP_CLASS = 'dsh-dyslexia-group'
const FIGURE_CLASS = 'dsh-dyslexia-figure'
const STATUS_CLASS = 'dsh-dyslexia-status'
const NOTE_CLASS = 'dsh-dyslexia-note'
const BAR_CLASS = 'dsh-dyslexia-bar'
const BUTTON_CLASS = 'dsh-dyslexia-button'
const SOURCE_CLASS = 'dsh-dyslexia-source'
const HINT_CLASS = 'dsh-dyslexia-hint'
const HINT_LINE_CLASS = 'dsh-dyslexia-hint-line'
const HINT_MARK_CLASS = 'dsh-dyslexia-hint-mark'

const FIGURE_CSS = [
  '.dsh-dyslexia-section { display: flex; flex-direction: column; gap: 4px; padding: 4px 0 8px; max-width: 720px; }',
  '.dsh-dyslexia-section-title { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; color: var(--dsw-alias-label-primary); }',
  '.dsh-dyslexia-section-intro { margin: 0 0 8px; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }',
  '.dsh-dyslexia-row { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 8px 12px; padding: 12px 0; }',
  '.dsh-dyslexia-row-text { flex: 1 1 220px; min-width: 0; display: flex; flex-direction: column; gap: 4px; }',
  '.dsh-dyslexia-row-label { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary); }',
  '.dsh-dyslexia-row-hint { font-size: 12px; line-height: 20px; color: var(--dsw-alias-label-secondary); }',
  '.dsh-dyslexia-switch { position: relative; flex: 0 0 auto; box-sizing: border-box; width: 36px; height: 20px; margin: 2px 0 0 0; padding: 2px; border: 0; border-radius: 999px; background: var(--dsw-alias-border-l3); cursor: pointer; transition: background 120ms ease; }',
  '.dsh-dyslexia-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); }',
  '.dsh-dyslexia-switch-knob { display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-switch-thumb); transition: transform 120ms ease; }',
  '.dsh-dyslexia-switch[aria-checked="false"] .dsh-dyslexia-switch-knob { background: var(--dsw-alias-switch-thumb); }',
  '.dsh-dyslexia-switch[aria-checked="true"] .dsh-dyslexia-switch-knob { background: var(--dsw-alias-label-primary-foreground); transform: translateX(16px); }',
  '.dsh-dyslexia-switch:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-brand-primary)); outline-offset: 2px; }',
  '.dsh-dyslexia-row-state { flex: 1 1 100%; font-size: 12px; line-height: 20px; color: var(--dsw-alias-label-secondary); }',
  '.dsh-dyslexia-row-state[data-failed="true"] { color: var(--dsw-alias-state-error-primary); }',
  `.${FIGURE_GROUP_CLASS} {`,
  '  max-width: 100%;',
  '  min-width: 0;',
  '}',
  `.${FIGURE_CLASS} {`,
  // Each host token carries the engine's own default as its var() fallback, so
  // a host that hands over no tokens still gets a readable picture instead of
  // a declaration that turns invalid the moment it is used (FR-007).
  '  --pele-bg: var(--dsw-alias-bg-layer-1, #fff);',
  '  --pele-fg: var(--dsw-alias-label-primary, #1f1f1f);',
  '  --pele-muted: var(--dsw-alias-label-secondary, #6e6e6e);',
  // Lines, arrows and the outline of an unstyled box. `label-tertiary` is the
  // host's own "quiet but legible" ink (3.7:1 on white, 7.4:1 on the dark
  // surface); `border-l2` was 1.25:1 and drew mist.
  '  --pele-line: var(--dsw-alias-label-tertiary, #1f1f1f);',
  '  --pele-surface: color-mix(in srgb, var(--dsw-alias-label-primary, #1f1f1f) 4%, var(--pele-bg, #fff));',
  // Grid lines, zebra rows and excluded ranges. It cannot be the bare canvas
  // colour: a chart draws its grid with this, and white on white is no grid.
  '  --pele-surface-alt: color-mix(in srgb, var(--dsw-alias-label-primary, #1f1f1f) 20%, var(--pele-bg, #fff));',
  '  --pele-border: var(--dsw-alias-label-tertiary, #8a8a8a);',
  // The engine labels a filled area with the canvas colour (`--_bg`), so a
  // chart bar or a pie slice must carry that colour: dark in the light theme,
  // light in the dark one. Mixing the host accent into the text ink gives
  // exactly that with one formula, and keeps it a derived host colour.
  '  --pele-accent: color-mix(in srgb, var(--dsw-alias-link, #5b7bd5) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-critical: var(--dsw-alias-state-error-primary, #e45756);',
  // Ink the engine puts on a fill the author chose: dark on light fills, light
  // on dark ones, whatever the theme is, because the fill is what it reads.
  '  --pele-fg-on-light: var(--dsw-static-neutral-bluish-1000, #0f1115);',
  '  --pele-fg-on-dark: var(--dsw-static-neutral-bluish-50, #f9fafb);',
  '  --pele-font: inherit;',
  '  max-width: 100%;',
  '  box-sizing: border-box;',
  '  padding: 8px;',
  '  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.04));',
  '  border-radius: 8px;',
  '  background: var(--dsw-alias-bg-layer-1, #fff);',
  '  overflow: auto;',
  '}',
  // A shape in a flow chart says what the box does, so the box is coloured by
  // its role: start and end, decision, data, input and output each take a hue
  // from the host palette, and a plain step stays neutral so the common box
  // does not shout. `fill` mixes the hue into the picture background and
  // `stroke` mixes it into the text ink, so one formula holds in both themes.
  `.${FIGURE_CLASS} {`,
  '  --dx-hue-start-end: var(--dsw-static-green-500, #22c55e);',
  '  --dx-hue-decision: var(--dsw-static-amber-500, #f59e0b);',
  '  --dx-hue-data: var(--dsw-static-violet-400, #a78bfa);',
  '  --dx-hue-io: var(--dsw-alias-link, #5b7bd5);',
  '  --dx-hue-process: var(--dsw-static-neutral-bluish-400, #adb2b8);',
  // Pie slices, gantt bars, timeline periods and mind-map branches take their
  // fill straight from these, and the engine writes their labels in the canvas
  // colour, so each series colour is mixed into the text ink as well: a deep
  // tone in the light theme, a tint in the dark one, legible either way.
  '  --pele-series-1: color-mix(in srgb, var(--dsw-alias-chart-messages, #4c78a8) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-2: color-mix(in srgb, var(--dsw-static-green-500, #54a24b) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-3: color-mix(in srgb, var(--dsw-static-blue-400, #f58518) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-4: color-mix(in srgb, var(--dsw-static-amber-500, #e45756) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-5: color-mix(in srgb, var(--dsw-static-deepseek-400, #72b7b2) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-6: color-mix(in srgb, var(--dsw-static-red-500, #eeca3b) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-7: color-mix(in srgb, var(--dsw-static-violet-400, #b279a2) 55%, var(--pele-fg, #1f1f1f));',
  '  --pele-series-8: color-mix(in srgb, var(--dsw-static-neutral-bluish-400, #9d755d) 55%, var(--pele-fg, #1f1f1f));',
  '}',
  `.${FIGURE_CLASS} .pele-shape-stadium  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-circle  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-odd  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-sm-circ  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-fr-circ  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-dbl-circ  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-cross-circ  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-f-circ  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-state-start  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-state-end  :is(rect, polygon, circle, path, ellipse, polyline)`,
  '{',
    'fill: var(--pele-surface);',
    'fill: color-mix(in srgb, var(--dx-hue-start-end) 18%, var(--pele-bg));',
    'stroke: var(--pele-border);',
    'stroke: color-mix(in srgb, var(--dx-hue-start-end) 60%, var(--pele-fg));',
  '}',
  `.${FIGURE_CLASS} .pele-shape-diam  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-hex  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-bang  :is(rect, polygon, circle, path, ellipse, polyline)`,
  '{',
    'fill: var(--pele-surface);',
    'fill: color-mix(in srgb, var(--dx-hue-decision) 18%, var(--pele-bg));',
    'stroke: var(--pele-border);',
    'stroke: color-mix(in srgb, var(--dx-hue-decision) 60%, var(--pele-fg));',
  '}',
  `.${FIGURE_CLASS} .pele-shape-cyl  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-datastore  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-folder  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-bucket  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-doc  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-docs  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-lin-doc  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-tag-doc  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-tag-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-st-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-win-pane  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-state  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-class  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-entity  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-actor-participant  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-card  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-requirement  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-service  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-wardley-component  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-node.pele-task  :is(rect, polygon, circle, path, ellipse, polyline)`,
  '{',
    'fill: var(--pele-surface);',
    'fill: color-mix(in srgb, var(--dx-hue-data) 18%, var(--pele-bg));',
    'stroke: var(--pele-border);',
    'stroke: color-mix(in srgb, var(--dx-hue-data) 60%, var(--pele-fg));',
  '}',
  `.${FIGURE_CLASS} .pele-shape-lean-r  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-lean-l  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-trap-b  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-trap-t  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-curv-trap  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-person  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-browser  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-cloud  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-c4-person  :is(rect, polygon, circle, path, ellipse, polyline)`,
  '{',
    'fill: var(--pele-surface);',
    'fill: color-mix(in srgb, var(--dx-hue-io) 18%, var(--pele-bg));',
    'stroke: var(--pele-border);',
    'stroke: color-mix(in srgb, var(--dx-hue-io) 60%, var(--pele-fg));',
  '}',
  `.${FIGURE_CLASS} .pele-shape-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-rounded  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-fr-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-notch-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-lin-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-console  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-delay  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-div-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-tri  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-flip-tri  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-sl-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-bow-rect  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-brace  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-brace-r  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-braces  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-bolt  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-fork  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-hourglass  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-h-cyl  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-lin-cyl  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-notch-pent  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-flag  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-shape-text  :is(rect, polygon, circle, path, ellipse, polyline),`,
  `.${FIGURE_CLASS} .pele-c4-system  :is(rect, polygon, circle, path, ellipse, polyline)`,
  '{',
    'fill: var(--pele-surface);',
    'fill: color-mix(in srgb, var(--dx-hue-process) 18%, var(--pele-bg));',
    'stroke: var(--pele-border);',
    'stroke: color-mix(in srgb, var(--dx-hue-process) 60%, var(--pele-fg));',
  '}',
  `.${FIGURE_CLASS} svg {`,
  '  display: block;',
  '  max-width: 100%;',
  '  height: auto;',
  '}',
  `.${FIGURE_CLASS} text {`,
  '  font-family: inherit;',
  '}',
  `.${NOTE_CLASS} {`,
  '  margin: 0 0 6px;',
  '  font-size: 12px;',
  '  color: var(--dsw-alias-label-secondary);',
  '}',
  `.${BAR_CLASS} {`,
  '  display: flex;',
  '  flex-wrap: wrap;',
  '  gap: 6px;',
  '  margin-top: 6px;',
  '}',
  `.${BUTTON_CLASS} {`,
  '  font: inherit;',
  '  font-size: 12px;',
  '  line-height: 18px;',
  '  padding: 2px 8px;',
  '  border-radius: 6px;',
  '  border: 1px solid var(--dsw-alias-border-l2);',
  '  background: var(--dsw-alias-bg-layer-2);',
  '  color: var(--dsw-alias-label-primary);',
  '  cursor: pointer;',
  '}',
  `.${BUTTON_CLASS}:hover { border-color: var(--dsw-alias-border-l1); }`,
  `.${BUTTON_CLASS}:focus-visible {`,
  '  outline: 2px solid var(--dsw-alias-brand-primary);',
  '  outline-offset: 1px;',
  '}',
  `.${STATUS_CLASS} {`,
  '  font: inherit;',
  '  font-size: 12px;',
  '  line-height: 20px;',
  '  white-space: nowrap;',
  '  color: var(--dsw-alias-label-secondary);',
  '}',
  `.${SOURCE_CLASS} {`,
  '  margin: 6px 0 0;',
  '  padding: 8px;',
  '  max-height: 320px;',
  '  overflow: auto;',
  '  font-size: 12px;',
  '  border-radius: 6px;',
  '  background: var(--dsw-alias-bg-base);',
  '  border: 1px solid var(--dsw-alias-border-l1);',
  '}',
  `.${HINT_CLASS} {`,
  '  margin: 0 0 6px;',
  '  padding: 8px;',
  '  overflow: auto;',
  '  font-size: 12px;',
  '  line-height: 18px;',
  '  border-radius: 6px;',
  '  white-space: pre;',
  '  font-family: var(--dsw-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);',
  '  background: var(--dsw-alias-bg-base);',
  '  border: 1px solid var(--dsw-alias-border-l1);',
  '  color: var(--dsw-alias-label-primary);',
  '}',
  `.${HINT_LINE_CLASS} {`,
  '  color: var(--dsw-alias-label-secondary);',
  '  font-size: 11px;',
  '}',
  `.${HINT_MARK_CLASS} {`,
  '  border-radius: 2px;',
  '  box-decoration-break: clone;',
  '  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 22%, transparent);',
  '  text-decoration: underline;',
  '  text-decoration-color: var(--dsw-alias-state-error-primary);',
  '}',
].join('\n')

/**
 * Injects the figure stylesheet once, and answers with the element it owns so the
 * caller can take it back out when this plugin is disabled. A style tag left
 * behind by an uninstalled plugin is dead weight in the document, and it would
 * outlive the package that explains what it is for.
 */
function ensureFigureStyles(doc) {
  if (!doc || typeof doc.getElementById !== 'function') return null
  const existing = doc.getElementById(FIGURE_STYLE_ID)
  if (existing) return existing
  const host = doc.head || doc.documentElement
  if (!host || typeof doc.createElement !== 'function') return null
  const element = doc.createElement('style')
  element.id = FIGURE_STYLE_ID
  element.textContent = FIGURE_CSS
  host.appendChild(element)
  return element
}

function removeFigureStyles(element) {
  try {
    if (element && typeof element.remove === 'function') element.remove()
  } catch (ignored) {
    void ignored
  }
}


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
  '  --pele-bg: var(--dsw-alias-bg-layer-1);',
  '  --pele-fg: var(--dsw-alias-label-primary);',
  '  --pele-muted: var(--dsw-alias-label-secondary);',
  '  --pele-line: var(--dsw-alias-border-l2);',
  '  --pele-surface: var(--dsw-alias-bg-layer-2);',
  '  --pele-surface-alt: var(--dsw-alias-bg-base);',
  '  --pele-border: var(--dsw-alias-border-l1);',
  '  --pele-accent: var(--dsw-alias-brand-primary);',
  '  --pele-critical: var(--dsw-alias-state-error-primary);',
  '  --pele-font: inherit;',
  '  max-width: 100%;',
  '  box-sizing: border-box;',
  '  padding: 8px;',
  '  border: 1px solid var(--dsw-alias-border-l1);',
  '  border-radius: 8px;',
  '  background: var(--dsw-alias-bg-layer-1);',
  '  overflow: auto;',
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


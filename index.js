/**
 * Host half of `@jiezhengj/dsh-dyslexia`.
 *
 * Two jobs. First, the fence layer in `client.js` draws `mermaid` blocks, and
 * the model has to know what the chat UI does with such a block. Second, the
 * reader gets one switch — "prefer a picture when a picture says it faster" —
 * and the switch changes what the model reads, nothing else.
 *
 * The switch is a real setting: declared here as a schema field, persisted by
 * the host, shown by the client half. Closing it leaves the briefing exactly
 * as it was before the switch existed.
 *
 * Nothing here may be able to break a start. A host upgrade that renames the
 * service, changes the section signature or drops the method ends with no
 * section at all — never with an exception out of `apply`.
 */

import z from '@deepseek-ai/schemastery'

export const name = 'dsh-dyslexia'

export const inject = ['systemPrompt']

const SECTION_NAME = 'ui:dsh-dyslexia'
const SECTION_ORDER = 9000

/** The switch: `true` briefs the model to prefer a picture when it is faster. */
export const Config = z.object({
  visualFirst: z.boolean().default(true).volatile(),
})

const CAPABILITY_TEXT = [
  'The chat UI draws a Markdown code block whose language word is `mermaid` as a diagram, in place inside the conversation.',
  'The code of that block is the diagram, so it has to carry everything the picture shows: without the renderer it is shown as source text.',
  'Syntax is Mermaid (flowchart, sequence, class, state, entity relationship, gantt, timeline, mindmap, kanban, xychart, C4 and architecture).',
  'Shapes set colour: `([start])`, `{decision}`, `[(data)]`; `classDef`/`style` win; a quote must wrap the whole label.',
  'An invalid or oversized diagram falls back to its source with a one-line reason, so the block must stay readable alone.',
].join(' ')

/**
 * Added only while the switch is on. It states when a drawing saves reading
 * and when it does not; it never demands a drawing for every answer.
 */
const PREFERENCE_TEXT = [
  'The reader finds long stretches of prose hard work.',
  'When a flow, a structure, a comparison, a state change or a multi-step procedure would land faster as a picture, lead with a `mermaid` block and keep the surrounding prose to what the picture cannot show.',
  'Do not add a picture when one sentence already answers the question, and never pad an answer with a drawing that only repeats the text.',
].join(' ')

const claimed = new WeakSet()

// A failed attempt must not burn the context: the host may retry, and a retry
// that silently registers nothing would leave the model uninformed.
function release(target) {
  if (target !== null && target !== undefined && (typeof target === 'object' || typeof target === 'function')) {
    claimed.delete(target)
  }
}

/** Reads the switch, tolerating a host that hands over nothing at all. */
function prefersPictures(config) {
  try {
    const field = config === null || config === undefined ? undefined : config.visualFirst
    if (field === null || field === undefined) return true
    const value = typeof field.get === 'function' ? field.get() : field
    return value !== false
  } catch (error) {
    warn('visualFirst unreadable', error)
    return true
  }
}

/** The briefing for one assembly: capability always, preference on demand. */
function briefing(config) {
  try {
    return prefersPictures(config) ? `${CAPABILITY_TEXT}\n\n${PREFERENCE_TEXT}` : CAPABILITY_TEXT
  } catch (error) {
    warn('briefing unreadable', error)
    return CAPABILITY_TEXT
  }
}

export function apply(ctx, config) {
  try {
    // A host that calls `apply` twice on one context would otherwise get two
    // identical sections, which shows up twice in the model's briefing. The
    // claim is taken below, once a section is really registered.
    if (ctx !== null && ctx !== undefined && (typeof ctx === 'object' || typeof ctx === 'function') && claimed.has(ctx)) return
    // The switch owns its own row in the client half; a generated page would be
    // a second place to change the same value.
    claimSettingsPage(ctx)
    const prompt = ctx === null || ctx === undefined ? undefined : ctx.systemPrompt
    if (!prompt || typeof prompt.section !== 'function') return
    // Claimed only once a section is really registered: a host that gains
    // `systemPrompt` later still gets its briefing, and the de-duplication below
    // still holds because the second call finds the context already claimed.
    if (claimed.has(ctx)) return
    claimed.add(ctx)
    const result = prompt.section({
      name: SECTION_NAME,
      order: SECTION_ORDER,
      // Resolved at assembly time, so flipping the switch needs no re-register.
      text: () => briefing(config),
    })
    // A later host may make `section` asynchronous; an unhandled rejection here
    // would be noise in the host's console, so it is caught too.
    if (result && typeof result.then === 'function') {
      try {
        result.then(undefined, (error) => {
          // The refusal arrived after `apply` returned, so it has to release the
          // context here — otherwise the retry the host makes would register
          // nothing at all.
          release(ctx)
          warn('prompt section rejected', error)
        })
      } catch (error) {
        release(ctx)
        warn('prompt section promise unusable', error)
      }
    }
  } catch (error) {
    release(ctx)
    warn('prompt section skipped', error)
  }
}

/** Opts out of a generated settings page; a host without `settings` is fine. */
function claimSettingsPage(ctx) {
  try {
    if (!ctx || typeof ctx.inject !== 'function') return
    ctx.inject(['settings'], (child) => {
      try {
        if (child && typeof child.effect === 'function' && child.settings && typeof child.settings.configure === 'function') {
          child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
        }
      } catch (error) {
        warn('settings page not claimed', error)
      }
    })
  } catch (error) {
    warn('settings unavailable', error)
  }
}

function warn(scope, error) {
  try {
    console.warn(`dsh-dyslexia: ${scope}`, error)
  } catch (ignored) {
    void ignored
  }
}

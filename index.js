/**
 * Host half of `@jiezhengj/dsh-dyslexia`.
 *
 * The plugin itself is the fence layer in `client.js`; this half only states
 * the fact that the layer exists, so the model knows what the chat UI does
 * with a `mermaid` code block. It adds no tool, no setting and no preference:
 * how much a reader wants diagrams stays the reader's own instruction.
 *
 * Nothing here may be able to break a start. A host upgrade that renames the
 * service, changes the section signature or drops the method ends with no
 * section at all — never with an exception out of `apply`.
 */

export const name = 'dsh-dyslexia'

export const inject = ['systemPrompt']

const SECTION_NAME = 'ui:dsh-dyslexia'
const SECTION_ORDER = 9000

const MERMAID_RENDER_PROMPT = [
  'The chat UI draws a Markdown code block whose language word is `mermaid` as a diagram, in place inside the conversation.',
  'The code of that block is the diagram, so it has to carry everything the picture shows: without the renderer it is shown as source text.',
  'Syntax is Mermaid (flowchart, sequence, class, state, entity relationship, gantt, timeline, mindmap, kanban, xychart, C4 and architecture).',
  'An invalid or oversized diagram falls back to its source with a one-line reason, so the block must stay readable alone.',
].join(' ')

const claimed = new WeakSet()

export function apply(ctx) {
  try {
    const prompt = ctx === null || ctx === undefined ? undefined : ctx.systemPrompt
    if (!prompt || typeof prompt.section !== 'function') return
    // A host that calls `apply` twice on one context would otherwise get two
    // identical sections, which shows up twice in the model's briefing.
    if (typeof ctx === 'object' || typeof ctx === 'function') {
      if (claimed.has(ctx)) return
      claimed.add(ctx)
    }
    const result = prompt.section({
      name: SECTION_NAME,
      order: SECTION_ORDER,
      text: MERMAID_RENDER_PROMPT,
    })
    // A later host may make `section` asynchronous; an unhandled rejection here
    // would be noise in the host's console, so it is caught too.
    if (result && typeof result.then === 'function') {
      try {
        result.then(undefined, (error) => warn('prompt section rejected', error))
      } catch (error) {
        warn('prompt section promise unusable', error)
      }
    }
  } catch (error) {
    // A failed attempt must not burn the context: the host may retry, and a
    // retry that silently registers nothing would leave the model uninformed.
    if (ctx !== null && ctx !== undefined && (typeof ctx === 'object' || typeof ctx === 'function')) {
      claimed.delete(ctx)
    }
    warn('prompt section skipped', error)
  }
}

function warn(scope, error) {
  try {
    console.warn(`dsh-dyslexia: ${scope}`, error)
  } catch (ignored) {
    void ignored
  }
}

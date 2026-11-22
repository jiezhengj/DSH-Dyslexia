/**
 * Client half of `@jiezhengj/dsh-dyslexia`.
 *
 * One layer on the fence slot, keyed to the `mermaid` language, so only mermaid
 * blocks are touched: `diff`, `math` and every other fence keep the host's own
 * rendering. Nothing else is mounted — no button in the composer, no new chat
 * node — which is what keeps the history readable once this package is gone.
 *
 * Deliberately loose about the host. The only service this module asks for is
 * `slots`, because without it there is nothing to do; `locale` is used when it
 * is there and skipped when it is not. Every call into the host sits behind a
 * guard, so a renamed option, a changed signature or a service that moved ends
 * as "no picture" instead of an error that reaches the host's plugin loader.
 */

const SLOT_NAME = 'conversation.chat.markdown.fence'
const LAYER_ID = '@jiezhengj/dsh-dyslexia/mermaid'
const FENCE_KEY = 'mermaid'
const LAYER_ORDER = 100

const inject = ['slots']

function report(scope, error) {
  try {
    console.warn(`dsh-dyslexia: ${scope}`, error)
  } catch (ignored) {
    void ignored
  }
}

/** Registers the fence layer, dropping the locale option if the host rejects it. */
function registerLayer(slots) {
  const base = { name: SLOT_NAME, id: LAYER_ID, key: FENCE_KEY, order: LAYER_ORDER }
  try {
    return slots.register({ ...base, locale: LOCALE_NAMESPACE }, FigureBoundary)
  } catch (error) {
    report('register with locale', error)
  }
  try {
    return slots.register(base, FigureBoundary)
  } catch (error) {
    report('register', error)
  }
  return () => undefined
}

function apply(ctx) {
  try {
    ensureFigureStyles(typeof document === 'undefined' ? null : document)
  } catch (error) {
    report('styles', error)
  }
  try {
    const locale = ctx.locale
    if (locale && typeof locale.register === 'function') {
      ctx.effect(() => locale.register(LOCALE_NAMESPACE, DICTIONARY), 'dsh-dyslexia: figure strings')
    }
  } catch (error) {
    report('locale', error)
  }
  try {
    const slots = ctx.slots
    if (!slots || typeof slots.register !== 'function' || typeof slots.inject !== 'function') {
      report('slots service unavailable', null)
      return
    }
    slots.inject(SLOT_NAME, () => registerLayer(slots))
  } catch (error) {
    report('slots', error)
  }
}

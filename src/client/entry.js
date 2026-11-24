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

// One registration per context, as in the host half: a host that calls `apply`
// twice would otherwise stack a second identical layer on the slot.
const claimed = new WeakSet()

/**
 * The stylesheet this module put in the document when the host offered no
 * `ctx.effect`. `ensureFigureStyles` reuses the element by id, so repeated
 * applies cannot stack copies; without an effect hook there is nothing that
 * could take the one copy away on disable, and a host that old is not worth a
 * branch nothing can observe.
 */

function report(scope, error) {
  try {
    console.warn(`dsh-dyslexia: ${scope}`, error)
  } catch (ignored) {
    void ignored
  }
}

/**
 * Reads a service this module did not declare in `inject`.
 *
 * The host's cordis is strict: `ctx.someService` throws `cannot get property
 * "someService" without inject` unless `inject` lists it, and listing `locale`
 * or `configForms` would make the whole plugin wait for services a lean host may
 * not have — a figure that could still be drawn would not be drawn. `ctx.get`
 * exists exactly for this: it reads a live service without the inject
 * requirement. The direct property is the fallback for a host that has no
 * `ctx.get`, where reading it is what the old code did.
 */
function optional(ctx, name) {
  if (typeof ctx.get === 'function') {
    try {
      const value = ctx.get(name)
      if (value !== undefined) return value
    } catch (error) {
      report(name + ' via get', error)
    }
  }
  try {
    return ctx[name]
  } catch (error) {
    // A strict host answers every undeclared read with exactly this sentence.
    // It is the expected path here, not a fault: the caller drops only the
    // optional surface that needed the service. Reporting it put two warnings in
    // every reader's console (seen 2026-11-24 in a web session).
    if (!/without inject/.test(String(error && error.message))) report(name, error)
    return undefined
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
  // A second call on the same context must not stack a second layer; the host
  // may call `apply` again after an upgrade or a re-enable.
  if (ctx !== null && ctx !== undefined && (typeof ctx === 'object' || typeof ctx === 'function')) {
    if (claimed.has(ctx)) return
    claimed.add(ctx)
  }
  try {
    const doc = typeof document === 'undefined' ? null : document
    const styleElement = ensureFigureStyles(doc)
    // Asked for the stylesheet, so it goes away with us: a disabled plugin must
    // not leave a style tag in the host document that nothing can explain.
    if (styleElement) {
      const drop = () => removeFigureStyles(styleElement)
      // `ctx.effect(setup)` keeps whatever the setup returns as its disposer, so
      // the remover goes in the return value — passing it as the setup would run
      // it immediately and unstyle the picture.
      if (typeof ctx.effect === 'function') ctx.effect(() => drop, 'dsh-dyslexia: figure styles')
    }
  } catch (error) {
    report('styles', error)
  }
  try {
    const locale = optional(ctx, 'locale')
    if (locale && typeof locale.register === 'function') {
      const register = () => locale.register(LOCALE_NAMESPACE, DICTIONARY)
      if (typeof ctx.effect === 'function') {
        ctx.effect(register, 'dsh-dyslexia: figure strings')
      } else {
        register()
      }
    }
  } catch (error) {
    report('locale', error)
  }
  try {
    const slots = optional(ctx, 'slots')
    if (!slots || typeof slots.register !== 'function' || typeof slots.inject !== 'function') {
      report('slots service unavailable', null)
      return
    }
    slots.inject(SLOT_NAME, () => registerLayer(slots))
  } catch (error) {
    report('slots', error)
  }
  try {
    // The preference lives in Settings -> General, in the same row the host
    // uses for Language and Appearance. Client entries apply in parallel, so
    // `configForms` may arrive after this call: waiting for it on a child
    // context registers the row whenever that service appears and keeps the
    // fence layer independent of the settings surface. A host old enough to
    // have no `inject` is asked directly, as before.
    // A host whose services may only be read through ctx.get never fires the
    // inject callback, so the row is also attempted once directly; whichever
    // path finds a face first wins and the other becomes a no-op.
    let wired = false
    const wireOnce = (target) => {
      if (wired) return
      wired = wireSettingsRow(target) === true
    }
    if (typeof ctx.inject === 'function') {
      ctx.inject(['configForms'], (child) => wireOnce(child))
    }
    wireOnce(ctx)
  } catch (error) {
    report('settings row', error)
  }
}

/**
 * Registers the settings row on the context that carries `configForms`, through
 * that context's own `slots` and `effect` so the row is torn down with it. A
 * host with no `slots` or no face loses only the switch; a host whose face
 * cannot write still gets a row, and the row itself treats the click as failed.
 */
function wireSettingsRow(ctx) {
  // apply already returned when slots cannot inject or register, so this is
  // only the second call path's own check; anything deeper would be dead code.
  const slots = optional(ctx, 'slots')
  if (!slots) return false
  const configForms = optional(ctx, 'configForms')
  if (!configForms || typeof configForms.get !== 'function') return false
  const face = configForms.get(SETTINGS_NAMESPACE)
  if (!face) return false
  const row = createVisualFirstRow(face)
  if (typeof ctx.effect === 'function' && typeof face.subscribe === 'function') {
    ctx.effect(
      () =>
        face.subscribe(() => {
          row.store.set(readPreference(face))
        }),
      'dsh-dyslexia: settings value',
    )
  }
  slots.inject(SETTINGS_SLOT, () =>
    slots.register(
      {
        name: SETTINGS_SLOT,
        id: SETTINGS_ROW_ID,
        order: SETTINGS_ROW_ORDER,
        locale: LOCALE_NAMESPACE,
        inject: () => row.inject,
      },
      row.component,
    ),
  )
  return true
}

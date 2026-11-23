const SETTINGS_SLOT = 'settings.general.item'
const SETTINGS_NAMESPACE = 'dsh-dyslexia'
const SETTINGS_ROW_ID = '@jiezhengj/dsh-dyslexia/visual-first'
const SETTINGS_ROW_ORDER = 62

/**
 * The reader's preference, drawn as one row in Settings -> General.
 *
 * The row is the whole of the client's settings work: it reads the value the
 * host already knows, shows it as a switch, writes the new value back through
 * the `configForms` face and reports what happened. The value on screen is the
 * value in effect: a write that fails puts the switch back where it was and
 * says so, instead of showing an intention the host did not accept.
 */

function createValueStore(initial) {
  let value = initial
  const listeners = new Set()
  return {
    get() {
      return value
    },
    set(next) {
      if (next === value) return
      value = next
      listeners.forEach((listener) => {
        try {
          listener()
        } catch (ignored) {
          void ignored
        }
      })
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

function readPreference(face) {
  try {
    if (!face || typeof face.getSnapshot !== 'function') return true
    const snapshot = face.getSnapshot()
    const value = snapshot && snapshot.value ? snapshot.value.visualFirst : undefined
    return value === undefined ? true : value !== false
  } catch (error) {
    report('settings snapshot', error)
    return true
  }
}

/** The row component. Receives its store and writer through the inject face. */
function VisualFirstRow(props) {
  const injected = props || {}
  const store = injected.hooks ? injected.hooks.visualFirst : null
  const say = translateFor(props, typeof document === 'undefined' ? null : document)
  const labelId = React.useId() + '-label'
  const hintId = React.useId() + '-hint'
  const [state, setState] = React.useState('idle')
  if (!store || typeof React.useSyncExternalStore !== 'function') return null
  const value = React.useSyncExternalStore(store.subscribe, store.get)

  function choose(next) {
    const before = store.get()
    store.set(next)
    setState('idle')
    let pending = null
    try {
      pending = injected.setValue ? injected.setValue(next) : null
    } catch (error) {
      setState('failed')
      store.set(before)
      return
    }
    if (pending && typeof pending.then === 'function') {
      pending.then(
        () => setState('saved'),
        () => {
          setState('failed')
          store.set(before)
        },
      )
    }
  }

  const children = [
    React.createElement(
      'div',
      { className: 'dsh-dyslexia-row-text', key: 'text' },
      React.createElement('div', { className: 'dsh-dyslexia-row-label', id: labelId, key: 'label' }, say('settingLabel')),
      React.createElement('div', { className: 'dsh-dyslexia-row-hint', id: hintId, key: 'hint' }, say('settingHint')),
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        role: 'switch',
        className: 'dsh-dyslexia-switch',
        'aria-checked': value ? 'true' : 'false',
        'aria-labelledby': labelId,
        'aria-describedby': hintId,
        onClick: () => choose(!value),
        key: 'switch',
      },
      React.createElement('span', { className: 'dsh-dyslexia-switch-knob' }),
    ),
  ]
  if (state !== 'idle') {
    children.push(
      React.createElement(
        'span',
        { className: 'dsh-dyslexia-row-state', role: 'status', 'aria-live': 'polite', key: 'state' },
        say(state === 'saved' ? 'settingSaved' : 'settingFailed'),
      ),
    )
  }
  return React.createElement('div', { className: 'dsh-dyslexia-row' }, children)
}

/**
 * Builds the row for one `configForms` face. A host whose face does not answer
 * still gets a row — it just starts from the default the plugin ships.
 */
function createVisualFirstRow(face) {
  const store = createValueStore(readPreference(face))
  return {
    store,
    component: VisualFirstRow,
    inject: {
      hooks: { visualFirst: store },
      setValue(next) {
        if (!face || typeof face.set !== 'function') return null
        return face.set('visualFirst', next)
      },
    },
  }
}

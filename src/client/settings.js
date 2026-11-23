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

  /**
   * Puts the switch back on the value the host holds. A host reloads its mirror
   * and tells subscribers about the value it kept *before* a refused write
   * returns, so the value captured at click time can be older than the host's
   * own: restoring the capture would overwrite a newer value that arrived from
   * another window. The face is asked again whenever the row was given a way to
   * read it, and the capture is only the floor when there is nothing to read.
   */
  function restore(before) {
    let next = before
    try {
      if (typeof injected.readHostValue === 'function') {
        const hostValue = injected.readHostValue()
        if (hostValue === true || hostValue === false) next = hostValue
      }
    } catch (error) {
      report('settings revert', error)
    }
    store.set(next)
  }

  function choose(next) {
    const before = store.get()
    store.set(next)
    setState('idle')
    let pending = null
    try {
      if (typeof injected.setValue !== 'function') {
        // A host that cannot take the value is a failed write: the switch must
        // never stand on a preference the host did not accept.
        setState('failed')
        restore(before)
        return
      }
      pending = injected.setValue(next)
    } catch (error) {
      setState('failed')
      restore(before)
      return
    }
    try {
      if (pending && typeof pending.then === 'function') {
        // `set(field, value)` answers `Promise<boolean>`: true when the host took
        // the value, false when it refused or skipped the write. A host old
        // enough to resolve nothing still counts as acceptance; a refusal is a
        // failed write like any rejection, so the switch goes back and the row
        // says the value did not change.
        const settle = (accepted) => {
          if (accepted) {
            setState('saved')
            return
          }
          setState('failed')
          restore(before)
        }
        pending.then(
          (result) => settle(result === true || result === undefined),
          () => settle(false),
        )
      }
    } catch (error) {
      // A host that hands back a thenable whose `then` throws has refused the
      // write just as surely as a rejection: the click handler must not throw
      // out of the row, and the row says the value did not change.
      setState('failed')
      restore(before)
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
  const inject = { hooks: { visualFirst: store } }
  // A host whose face cannot write gets no writer at all: the row then treats
  // the click as a failed write, puts the switch back and says so, instead of
  // showing a preference the host never accepted.
  if (face && typeof face.set === 'function') {
    inject.setValue = (next) => face.set('visualFirst', next)
  }
  // A face that can answer is asked again whenever the row has to put the
  // switch back: the value captured at click time is not the host's latest.
  if (face) {
    inject.readHostValue = () => readPreference(face)
  }
  return { store, component: VisualFirstRow, inject }
}

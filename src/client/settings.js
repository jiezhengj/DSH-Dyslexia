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
    // The host turns every entry of the slot's `hooks` face into
    // `useSyncExternalStore`-style hook props, and that needs `getSnapshot`:
    // without it the settings page throws `w.getSnapshot is not a function`
    // and the row never appears even though it registered.
    getSnapshot() {
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

/**
 * The row. The host turns each entry of the slot's `hooks` face into a hook
 * prop named after it (`hooks: { visualFirst }` arrives as `useVisualFirst`), so
 * the value has two possible sources and the adapter that has one is chosen
 * before any hook runs: the `useVisualFirst` hook the host built, or the store
 * this module made when the host has no hook machinery. A row that takes
 * neither renders nothing, which is what kept it off the settings page on a
 * host that flattens hooks: it looked for `hooks` and the host had removed it.
 */
function VisualFirstRow(props) {
  const injected = props || {}
  if (typeof injected.useVisualFirst === 'function') {
    return React.createElement(HostValueRow, injected)
  }
  const store = injected.hooks ? injected.hooks.visualFirst : null
  if (!store || typeof React.useSyncExternalStore !== 'function') return null
  return React.createElement(StoreValueRow, { ...injected, store })
}

/** Reads the value through the host's own hook for the `hooks` face. */
function HostValueRow(props) {
  const value = props.useVisualFirst((current) => current)
  return React.createElement(RowBody, { ...props, value })
}

/** Reads the value through the store this module made for older hosts. */
function StoreValueRow(props) {
  const value = React.useSyncExternalStore(props.store.subscribe, props.store.get)
  return React.createElement(RowBody, { ...props, value })
}

/** The row itself: one label, one hint, one switch, and what the write said. */
function RowBody(props) {
  const injected = props || {}
  const store = injected.hooks ? injected.hooks.visualFirst : null
  const say = translateFor(props, typeof document === 'undefined' ? null : document)
  const labelId = React.useId() + '-label'
  const hintId = React.useId() + '-hint'
  const [state, setState] = React.useState('idle')
  // The host hook answers on the host's next render, so the switch stands on the
  // answer it was already given for one frame. `shown` is that answer; it is
  // dropped as soon as the host agrees or refuses.
  const [shown, setShown] = React.useState(null)
  const value = shown === null ? props.value === true : shown

  /**
   * Shows a value on the switch: the store this module made is told directly,
   * while a host that supplies the value through its own hook is shown the
   * answer for one render (`shown`) until the host's hook reports again.
   */
  function show(next) {
    if (store && typeof store.set === 'function') store.set(next)
    else setShown(next)
  }

  function current() {
    return shown === null ? props.value === true : shown
  }

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
    show(next)
  }

  function choose(next) {
    const before = current()
    show(next)
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
            // The host's hook is the truth from now on: dropping the local
            // answer lets its next render move the switch, including when
            // another window changed the value meanwhile.
            setShown(null)
            return
          }
          setState('failed')
          restore(before)
        }
        pending.then(
          (result) => settle(result === true || result === undefined),
          () => settle(false),
        )
      } else {
        setShown(null)
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

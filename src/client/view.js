/**
 * The fence layer itself.
 *
 * It receives one `mermaid` fence from the chat flow and gives back the drawn
 * picture, or — when the drawing cannot happen — the source block it was given,
 * unchanged, plus one complete sentence in the reader's language saying why. The
 * text is never hidden: a reader can always open the source of a picture that did
 * draw.
 *
 * Every read of a host prop goes through `safeRead`, because a host upgrade can
 * turn `code` or `children` into a getter that throws. A throw here would leave
 * the conversation with no picture *and* no source, and would be re-thrown by the
 * boundary below, which is exactly what the reader must never see.
 */

const COPIED_FEEDBACK_MS = 1500

function safeRead(source, name) {
  try {
    const value = source === null || source === undefined ? undefined : source[name]
    return { ok: true, value }
  } catch (error) {
    report('figure props', error)
    return { ok: false, value: undefined }
  }
}

/** Everything the layer needs from the host, read once and safely. */
/**
 * Whether a host's `children` is something React would actually render.
 *
 * Two failures have to be avoided here, and they point in opposite directions.
 * A host that hands over `null`, `false`, `0` or `''` for an empty slot has
 * given nothing, so the layer must show the source itself instead of an empty
 * box. A host that hands over a plain object, a function or an array containing
 * either has given something React refuses (error #31) — and that refusal would
 * happen while this layer's own boundary is rendering, so the boundary could not
 * catch it and the whole message would disappear. Only shapes React accepts are
 * passed through; everything else falls back to the source text.
 */
function isRenderableChild(value) {
  if (value === undefined || value === null || value === false || value === true) return false
  if (typeof value === 'string') return value !== ''
  if (typeof value === 'number') return value !== 0
  if (React.isValidElement(value)) return true
  // Arrays are the only container React renders; each entry is checked, so an
  // array holding a plain object cannot carry that object through to React.
  // Other iterables are refused: React does not render them either, and an
  // iterator that yields rubbish (or throws while iterating) would escape this
  // check and take the message with it.
  if (Array.isArray(value)) return value.length > 0 && value.every(isRenderableChild)
  return false
}

function sourceFallback(code) {
  return React.createElement(
    'pre',
    { className: SOURCE_CLASS },
    React.createElement('code', null, code),
  )
}

/** Zoom controls, in the order the engine lays them out. */
const ZOOM_BUTTONS = ['zoomIn', 'zoomOut', 'resetZoom']

/**
 * Names the drawing for the reader, in the reader's language.
 *
 * The engine replaces its whole `<svg>` node whenever it re-lays out (a resize,
 * a new column width), and the new node arrives with the engine's own English
 * role description and without our name. So this runs after every mount and
 * after every re-layout, and a mutation watcher calls it again whenever the
 * drawing is swapped underneath us. Without that, dragging a window would
 * quietly make a screen reader say "flowchart" in English about a picture with
 * no name at all.
 */
function labelFigure(host, translate) {
  if (!host) return
  try {
    const svg = host.querySelector('svg')
    if (svg) {
      svg.setAttribute('role', 'img')
      svg.setAttribute('aria-label', translate('figureLabel'))
      svg.removeAttribute('aria-roledescription')
    }
    host.setAttribute('role', 'presentation')
    const zoom = host.querySelector('.pele-zoom')
    if (zoom) {
      const buttons = zoom.querySelectorAll('button')
      for (let index = 0; index < buttons.length && index < ZOOM_BUTTONS.length; index += 1) {
        const text = translate(ZOOM_BUTTONS[index])
        buttons[index].setAttribute('aria-label', text)
        buttons[index].setAttribute('title', text)
      }
    }
  } catch (error) {
    // A host page that refuses attributes must not cost the reader the picture,
    // but the failure should still reach the console instead of vanishing.
    report('figure label', error)
  }
}

/**
 * The host's own block, rendered where the drawing would have been.
 *
 * It sits inside its own boundary because the host block is not ours: if it
 * throws while rendering (a host upgrade, a getter on its own props), that throw
 * must not travel out of the picture's boundary a second time — a second throw
 * escapes the boundary and takes the whole message with it. The outermost answer
 * is always plain text.
 */
class SafeChildren extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    report('figure host block', error)
  }

  render() {
    if (this.state.failed) return sourceFallback(this.props.code)
    return this.props.children
  }
}

function hostBlock(children, code) {
  if (children === null) return sourceFallback(code)
  return React.createElement(SafeChildren, { code }, children)
}


const DEFAULT_FENCE_LANGUAGE = 'mermaid'

function readLayerInput(props) {
  const code = safeRead(props, 'code')
  const streaming = safeRead(props, 'streaming')
  const children = safeRead(props, 'children')
  const lang = safeRead(props, 'lang')
  return {
    code: code.ok && typeof code.value === 'string' ? code.value : '',
    hasCode: code.ok && typeof code.value === 'string',
    streaming: streaming.ok ? Boolean(streaming.value) : false,
    children: children.ok && isRenderableChild(children.value) ? children.value : null,
    lang:
      lang.ok && typeof lang.value === 'string' && lang.value ? lang.value : DEFAULT_FENCE_LANGUAGE,
  }
}

function MermaidFenceLayer(props) {
  const doc = typeof document === 'undefined' ? null : document
  const input = readLayerInput(props)
  const code = input.code
  const streaming = input.streaming
  const children = input.children
  const lang = input.lang

  const hostTranslate = safeRead(props, 't').value
  const translate = React.useMemo(() => translateFor({ t: hostTranslate }, doc), [hostTranslate, doc])
  // A host may bind a fresh `t` on every render (a locale-bound slot prop). The
  // drawing must survive that: it is re-created when the source changes, never
  // because a label function changed identity. So the effect reads the current
  // translator through a ref instead of depending on it.
  const translateRef = React.useRef(translate)
  translateRef.current = translate
  const [status, setStatus] = React.useState('pending')
  const [reasonKind, setReasonKind] = React.useState('other')
  const [syntaxHint, setSyntaxHint] = React.useState(null)
  const [showSource, setShowSource] = React.useState(false)
  const [copyState, setCopyState] = React.useState('idle')
  const hostRef = React.useRef(null)
  const mountedRef = React.useRef(null)
  const watcherRef = React.useRef(null)
  const copiedTimerRef = React.useRef(null)

  const teardown = React.useCallback(() => {
    if (watcherRef.current !== null) {
      try {
        watcherRef.current.disconnect()
      } catch (error) {
        void error
      }
      watcherRef.current = null
    }
    const mounted = mountedRef.current
    mountedRef.current = null
    if (mounted) {
      try {
        mounted.destroy()
      } catch (error) {
        void error
      }
    }
  }, [])

  React.useLayoutEffect(() => {
    const host = hostRef.current
    if (streaming || !host || !doc) return undefined
    const t = translateRef.current
    teardown()
    setStatus('pending')
    host.textContent = ''
    const labels = {
      reset: t('resetZoom'),
      zoomIn: t('zoomIn'),
      zoomOut: t('zoomOut'),
    }
    const fail = (error) => {
      const raw = describeFigureError(error)
      host.textContent = ''
      setStatus('failed')
      setReasonKind(figureErrorKind(error))
      setSyntaxHint(figureErrorKind(error) === 'syntax' ? figureSyntaxHint(error, code) : null)
      if (raw) {
        try {
          console.warn('dsh-dyslexia: diagram not drawn', raw)
        } catch (ignored) {
          void ignored
        }
      }
    }
    let mounted = null
    try {
      mounted = mountFigure(host, code, doc, labels)
    } catch (error) {
      fail(error)
      return undefined
    }
    const failure = mounted && mounted.error ? mounted.error : null
    if (!mounted || failure) {
      if (mounted) {
        try {
          mounted.destroy()
        } catch (error) {
          void error
        }
      }
      fail(failure)
      return undefined
    }
    mountedRef.current = mounted
    setStatus('rendered')
    // The picture is the image; the box around it also holds the engine's own
    // zoom buttons, so the box is a group and only the drawing itself carries
    // role="img". Otherwise a screen reader would treat the zoom controls as
    // part of an image, which makes them unreachable.
    labelFigure(host, t)
    // Belt and braces: whichever path swaps the drawing — a re-layout we did not
    // cause, a future engine version drawing asynchronously — the name goes back
    // on as soon as the new node is in the document.
    if (typeof MutationObserver === 'function') {
      try {
        const watcher = new MutationObserver(() => {
          labelFigure(host, translateRef.current)
        })
        watcher.observe(host, { childList: true })
        watcherRef.current = watcher
      } catch (error) {
        void error
      }
    }
    return teardown
  }, [code, streaming, doc, teardown])

  React.useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) {
        clearTimeout(copiedTimerRef.current)
        copiedTimerRef.current = null
      }
    },
    [],
  )

  // A new source is a new picture: the panel folds away and the old "Copied"
  // answer stops applying to text that is no longer on screen. Without this, an
  // open panel plus a broken replacement would show the same source twice, and
  // a stale answer would sit under a figure it never described.
  React.useEffect(() => {
    setShowSource(false)
    setCopyState('idle')
    if (copiedTimerRef.current !== null) {
      clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = null
    }
  }, [code])

  const finishCopy = React.useCallback((state) => {
    setCopyState(state)
    if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => {
      copiedTimerRef.current = null
      setCopyState('idle')
    }, COPIED_FEEDBACK_MS)
  }, [])

  /**
   * Copies the source, and only says "Copied" once the text really went to the
   * clipboard: a reader who is told the wrong thing cannot check it.
   */
  const copySource = React.useCallback(() => {
    let clipboard = null
    try {
      clipboard = typeof navigator === 'undefined' ? null : navigator.clipboard
    } catch (error) {
      void error
      clipboard = null
    }
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      finishCopy('failed')
      return
    }
    try {
      const pending = clipboard.writeText(code)
      if (pending && typeof pending.then === 'function') {
        pending.then(
          () => finishCopy('copied'),
          () => finishCopy('failed'),
        )
        return
      }
      finishCopy('copied')
    } catch (error) {
      void error
      finishCopy('failed')
    }
  }, [code, finishCopy])

  const toggleSource = React.useCallback(() => {
    setShowSource((value) => !value)
  }, [])

  // The picture is drawn once per source, but its name belongs to the current
  // interface language: a language switch must rename the image — and the
  // engine's zoom buttons, which carry no visible text — in place, not redraw.
  const figureLabel = translate('figureLabel')
  React.useEffect(() => {
    labelFigure(hostRef.current, translate)
  }, [figureLabel, translate])

  if (streaming) return hostBlock(children, code)

  const failed = status === 'failed'
  const rendered = status === 'rendered'

  const figure = React.createElement(
    'div',
    {
      className: FIGURE_GROUP_CLASS,
      role: 'group',
      style: failed ? { display: 'none' } : undefined,
    },
    React.createElement('div', { className: FIGURE_CLASS, ref: hostRef }),
  )

  const copyLabel = copyState === 'copied' ? 'copied' : copyState === 'failed' ? 'copyFailed' : 'copySource'

  const actions = rendered
    ? React.createElement(
        'div',
        { className: BAR_CLASS },
        React.createElement(
          'button',
          {
            type: 'button',
            className: BUTTON_CLASS,
            onClick: toggleSource,
            'aria-expanded': showSource ? 'true' : 'false',
          },
          showSource ? translate('hideSource') : translate('showSource'),
        ),
        React.createElement(
          'button',
          { type: 'button', className: BUTTON_CLASS, onClick: copySource },
          translate('copySource'),
        ),
        React.createElement(
          'span',
          { className: STATUS_CLASS, role: 'status', 'aria-live': 'polite' },
          copyState === 'idle' ? '' : translate(copyLabel),
        ),
      )
    : null

  // While the picture is failing, the source is already on screen in the host's
  // own block below: a second copy would read as two different sources.
  const source =
    showSource && !failed
      ? React.createElement(
          'pre',
          { className: SOURCE_CLASS },
          React.createElement(
            'code',
            { className: 'language-' + lang },
            code,
          ),
        )
      : null

  const noteText =
    reasonKind === 'syntax'
      ? translate('syntaxError')
      : reasonKind === 'unavailable'
        ? translate('engineUnavailable')
        : translate('renderFailed')

  // A syntax error owes the reader the spot, not the grammar: their own line,
  // with the one character the parser could not use marked. The engine's English
  // token names never reach the picture, and nothing is counted into columns,
  // which is what would drift on a line with Chinese text.
  const hint =
    failed && reasonKind === 'syntax' && syntaxHint
      ? React.createElement(
          'pre',
          { className: HINT_CLASS },
          React.createElement(
            'span',
            { className: HINT_LINE_CLASS },
            translate('syntaxAtLine', { line: syntaxHint.line }),
          ),
          '\n',
          syntaxHint.before,
          React.createElement(
            'span',
            { className: HINT_MARK_CLASS },
            // Nothing left to mark means the parser wanted something after the
            // line: the marked blank says "here, at the end" in any language.
            syntaxHint.at || ' ',
          ),
          syntaxHint.after,
        )
      : null

  const note = failed
    ? React.createElement('p', { className: NOTE_CLASS }, noteText)
    : null

  // A failed picture still owes the reader the host's own block, wrapped so a
  // second failure inside that block can only cost the source panel, never the
  // message.
  const fallback = failed ? hostBlock(children, code) : null

  return React.createElement(React.Fragment, null, note, hint, figure, actions, source, fallback)
}

/**
 * The safety net around the picture.
 *
 * A host upgrade can hand this layer props it no longer understands, a code
 * block whose text is not a string, a getter that throws, or a document-less
 * environment; the engine can also throw while drawing. Any of those must cost
 * one picture, never the conversation: the boundary answers with the fence's own
 * children, which is exactly what the host would have rendered without this
 * plugin.
 */
class FigureBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    report('figure render', error)
  }

  componentDidUpdate(previous) {
    try {
      const before = previous === null || previous === undefined ? undefined : previous.code
      const now = this.props === null || this.props === undefined ? undefined : this.props.code
      if (this.state.failed && before !== now) this.setState({ failed: false })
    } catch (error) {
      void error
    }
  }

  render() {
    // The boundary cannot catch an exception thrown by its own render, so the
    // props are read inside a guard: a host that hands over a value whose
    // reading throws (a Proxy, a hostile getter) costs this one fence, never the
    // message around it. The code itself may still be readable, so it is shown.
    let input = null
    try {
      input = readLayerInput(this.props)
    } catch (error) {
      report('figure props', error)
      let code
      try {
        code = this.props === null || this.props === undefined ? undefined : this.props.code
      } catch (caught) {
        report('figure props', caught)
        code = undefined
      }
      return typeof code === 'string' && code.length > 0 ? sourceFallback(code) : null
    }
    const fallback = () => hostBlock(input.children, input.code)
    if (this.state.failed) return fallback()
    try {
      if (!input.hasCode || typeof document === 'undefined') return fallback()
      return React.createElement(MermaidFenceLayer, this.props)
    } catch (error) {
      report('figure props', error)
      return fallback()
    }
  }
}


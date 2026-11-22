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
 * Whether a host's `children` is something React would actually render. A host
 * that hands over `null`, `false`, `0` or `''` for an empty slot must not be
 * mistaken for "the host gave me nothing to show": in that case the layer still
 * has the source text and must show it itself.
 */
function isRenderableChild(value) {
  return value !== undefined && value !== null && value !== false && value !== '' && value !== 0
}

function readLayerInput(props) {
  const code = safeRead(props, 'code')
  const streaming = safeRead(props, 'streaming')
  const children = safeRead(props, 'children')
  return {
    code: code.ok && typeof code.value === 'string' ? code.value : '',
    hasCode: code.ok && typeof code.value === 'string',
    streaming: streaming.ok ? Boolean(streaming.value) : false,
    children: children.ok && isRenderableChild(children.value) ? children.value : null,
  }
}

function MermaidFenceLayer(props) {
  const doc = typeof document === 'undefined' ? null : document
  const input = readLayerInput(props)
  const code = input.code
  const streaming = input.streaming
  const children = input.children

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
  const [showSource, setShowSource] = React.useState(false)
  const [copyState, setCopyState] = React.useState('idle')
  const hostRef = React.useRef(null)
  const mountedRef = React.useRef(null)
  const observerRef = React.useRef(null)
  const copiedTimerRef = React.useRef(null)

  const teardown = React.useCallback(() => {
    if (observerRef.current !== null) {
      observerRef.current.disconnect()
      observerRef.current = null
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
    try {
      const svg = host.querySelector('svg')
      if (svg) {
        svg.setAttribute('role', 'img')
        svg.setAttribute('aria-label', t('figureLabel'))
        // The engine stamps its own English role description ("flowchart").
        // Read aloud next to a localized name it is just noise in the wrong
        // language, so it goes.
        svg.removeAttribute('aria-roledescription')
        host.setAttribute('role', 'presentation')
      }
    } catch (error) {
      void error
    }
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(() => {
        const current = mountedRef.current
        if (!current) return
        try {
          current.refresh()
        } catch (error) {
          void error
        }
      })
      observer.observe(host)
      observerRef.current = observer
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
  // interface language: a language switch must rename the image in place, not
  // redraw it.
  const figureLabel = translate('figureLabel')
  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    try {
      const svg = host.querySelector('svg')
      if (svg && svg.getAttribute('role') === 'img') svg.setAttribute('aria-label', figureLabel)
    } catch (error) {
      void error
    }
  }, [figureLabel])

  if (streaming) return children

  const failed = status === 'failed'
  const rendered = status === 'rendered'

  const figure = React.createElement(
    'div',
    {
      className: FIGURE_GROUP_CLASS,
      role: 'group',
      'aria-label': figureLabel,
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

  const source = showSource
    ? React.createElement(
        'pre',
        { className: SOURCE_CLASS },
        React.createElement('code', null, code),
      )
    : null

  const noteText =
    reasonKind === 'syntax'
      ? translate('syntaxError')
      : reasonKind === 'unavailable'
        ? translate('engineUnavailable')
        : translate('renderFailed')

  const note = failed
    ? React.createElement('p', { className: NOTE_CLASS }, noteText)
    : null

  const fallback = failed
    ? children !== null
      ? children
      : React.createElement(
          'pre',
          { className: SOURCE_CLASS },
          React.createElement('code', null, code),
        )
    : null

  return React.createElement(React.Fragment, null, note, figure, actions, source, fallback)
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
    const input = readLayerInput(this.props)
    if (this.state.failed) return input.children
    try {
      if (!input.hasCode || typeof document === 'undefined') return input.children
      return React.createElement(MermaidFenceLayer, this.props)
    } catch (error) {
      report('figure props', error)
      return input.children
    }
  }
}


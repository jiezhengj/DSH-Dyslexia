/**
 * The fence layer itself.
 *
 * It receives one `mermaid` fence from the chat flow and gives back the drawn
 * picture, or — when the drawing cannot happen — the source block it was given,
 * unchanged, plus one line saying why. The text is never hidden: a reader can
 * always open the source of a picture that did draw.
 */

const COPIED_FEEDBACK_MS = 1500

function MermaidFenceLayer(props) {
  const doc = typeof document === 'undefined' ? null : document
  const code = typeof props.code === 'string' ? props.code : ''
  const streaming = props.streaming === true
  const children = props.children === undefined ? null : props.children

  const translate = React.useMemo(() => translateFor(props, doc), [props.t, doc])
  const [status, setStatus] = React.useState('pending')
  const [reason, setReason] = React.useState('')
  const [figureKind, setFigureKind] = React.useState('')
  const [showSource, setShowSource] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
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
    teardown()
    host.textContent = ''
    const labels = {
      reset: translate('resetZoom'),
      zoomIn: translate('zoomIn'),
      zoomOut: translate('zoomOut'),
    }
    let mounted = null
    try {
      mounted = mountFigure(host, code, doc, labels)
    } catch (error) {
      host.textContent = ''
      setStatus('failed')
      setReason(describeFigureError(error, translate('syntaxError')))
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
      host.textContent = ''
      setStatus('failed')
      setReason(describeFigureError(failure, translate('syntaxError')))
      return undefined
    }
    mountedRef.current = mounted
    setStatus('rendered')
    setFigureKind(figureType(mounted))
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
  }, [code, streaming, doc, teardown, translate])

  React.useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) {
        clearTimeout(copiedTimerRef.current)
        copiedTimerRef.current = null
      }
    },
    [],
  )

  const copySource = React.useCallback(() => {
    try {
      const clipboard = typeof navigator === 'undefined' ? null : navigator.clipboard
      if (clipboard && typeof clipboard.writeText === 'function') {
        const pending = clipboard.writeText(code)
        if (pending && typeof pending.catch === 'function') pending.catch(() => undefined)
      }
    } catch (error) {
      void error
    }
    setCopied(true)
    if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => {
      copiedTimerRef.current = null
      setCopied(false)
    }, COPIED_FEEDBACK_MS)
  }, [code])

  const toggleSource = React.useCallback(() => {
    setShowSource((value) => !value)
  }, [])

  if (streaming) return children

  const failed = status === 'failed'
  const rendered = status === 'rendered'

  const figure = React.createElement('div', {
    className: FIGURE_CLASS,
    ref: hostRef,
    role: 'img',
    'aria-label': translate('figureLabel', { type: figureKind || 'diagram' }),
    style: failed ? { display: 'none' } : undefined,
  })

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
          copied ? translate('copied') : translate('copySource'),
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

  const note = failed
    ? React.createElement(
        'p',
        { className: NOTE_CLASS },
        translate('renderFailed', { reason }),
      )
    : null

  return React.createElement(
    React.Fragment,
    null,
    note,
    figure,
    actions,
    source,
    failed ? children : null,
  )
}

/**
 * The safety net around the picture.
 *
 * A host upgrade can hand this layer props it no longer understands, a code
 * block whose text is not a string, or a document-less environment; the engine
 * can also throw while drawing. Any of those must cost one picture, never the
 * conversation: the boundary answers with the fence's own children, which is
 * exactly what the host would have rendered without this plugin.
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
    if (this.state.failed && previous.code !== this.props.code) this.setState({ failed: false })
  }

  render() {
    const props = this.props
    const children = props.children === undefined ? null : props.children
    if (this.state.failed) return children
    try {
      if (typeof props.code !== 'string' || typeof document === 'undefined') return children
      return React.createElement(MermaidFenceLayer, props)
    } catch (error) {
      report('figure props', error)
      return children
    }
  }
}


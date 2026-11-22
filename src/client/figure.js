/**
 * The one place that calls the drawing engine.
 *
 * The engine is bundled, so nothing is fetched at run time. Options follow the
 * narrow-screen contract: the picture is laid out for the width it is given
 * instead of being shrunk as a whole, and a picture that does not fit can be
 * zoomed inside its own frame.
 *
 * Failures are classified here, not printed here: the reader gets one complete
 * sentence in their own language, while the engine's English, multi-line parse
 * text is kept for the console and the tooltip.
 */

const FIGURE_LIMITS = {
  limit: 24 * 1024,
  outputLimit: 2 * 1024 * 1024,
  maxEdges: 400,
}

const ENGINE_UNAVAILABLE = 'engine-unavailable'

function figureFontSize(doc) {
  try {
    const value = parseFloat(doc.defaultView.getComputedStyle(doc.body).fontSize)
    if (Number.isFinite(value) && value > 0) return Math.max(12, Math.round(value))
  } catch (error) {
    void error
  }
  return 14
}

function figureOptions(doc, labels) {
  const options = {
    autoDirection: true,
    directionBreakpoint: 640,
    fontSize: figureFontSize(doc),
    padding: 8,
    responsive: true,
    zoom: { controls: true, maxScale: 4, labels },
    ...FIGURE_LIMITS,
  }
  return options
}

/**
 * Draws `code` into `host`. A parse error is returned rather than thrown, as
 * `Mounted.error`, so the caller can put the source back in its place.
 */
function mountFigure(host, code, doc, labels) {
  if (!pele || typeof pele.mount !== 'function') {
    const missing = new Error('drawing engine unavailable')
    missing.code = ENGINE_UNAVAILABLE
    throw missing
  }
  return pele.mount(host, code, figureOptions(doc, labels))
}

/** `syntax`, `unavailable` or `other`: which sentence the reader should see. */
function figureErrorKind(error) {
  if (!error) return 'other'
  try {
    if (error && error.code === ENGINE_UNAVAILABLE) return 'unavailable'
    const message = typeof error === 'string' ? error : String(error.message || '')
    if (/parse|syntax|lexical|invalid/i.test(message)) return 'syntax'
  } catch (ignored) {
    void ignored
  }
  return 'other'
}

/**
 * The engine's own words, cut to one line. This is diagnostic material: it goes
 * to the console and to the note's tooltip, never into the visible sentence.
 */
function describeFigureError(error) {
  if (!error) return ''
  let message = ''
  try {
    message = typeof error === 'string' ? error : String(error.message || '')
  } catch (ignored) {
    void ignored
    return ''
  }
  return (
    message
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)[0] || ''
  )
}

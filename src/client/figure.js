/**
 * The one place that calls the drawing engine.
 *
 * The engine is bundled, so nothing is fetched at run time. Options follow the
 * narrow-screen contract: the picture is laid out for the width it is given
 * instead of being shrunk as a whole, and a picture that does not fit can be
 * zoomed inside its own frame.
 */

const FIGURE_LIMITS = {
  limit: 24 * 1024,
  outputLimit: 2 * 1024 * 1024,
  maxEdges: 400,
}

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
  if (!pele || typeof pele.mount !== 'function') throw new Error('drawing engine unavailable')
  return pele.mount(host, code, figureOptions(doc, labels))
}

/**
 * One line of reason for the reader: the engine's parse errors span several
 * lines and end with a caret drawing, which is noise in the chat.
 */
function describeFigureError(error, fallback) {
  if (!error) return fallback
  const message = typeof error === 'string' ? error : String(error.message || '')
  const first = message
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)[0]
  return first || fallback
}

function figureType(mounted) {
  const result = mounted && mounted.result
  return result && typeof result.type === 'string' ? result.type : ''
}

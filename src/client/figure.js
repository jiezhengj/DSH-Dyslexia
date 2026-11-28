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
 * text is kept for the console and for the caller to log; the reader only ever
 * sees the one sentence.
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
 * Where the parser stopped, as the reader can check it: the line number, the
 * line exactly as they wrote it, and the one character the parser could not use.
 *
 * The engine prints its own snippet and a caret line, but both are padded and
 * the caret counts characters while the page draws glyphs of different widths, so
 * on a line with Chinese text it lands somewhere else. The engine's English
 * ("Expecting 'SQE', … got 'STR'") also names grammar tokens a reader cannot act
 * on. The spot is what a reader can act on, so the spot is what is drawn, marked
 * on the reader's own line instead of counted into columns.
 *
 * The engine's caret says two different things, and the failure names which:
 * `got 'STR'` and its like mean a character was refused (the caret sits just
 * past it), while `got 'EOF'`/`'$end'` mean the line stopped before the parser
 * was done (the caret is where more was wanted, so the end is the spot).
 *
 * Returns `{ line, before, at, after }`: `at` is the character the parser
 * refused, or empty when the line stopped early, which the caller marks as a gap.
 */
function figureSyntaxHint(error, code) {
  if (!error) return null
  let message = ''
  try {
    message = typeof error === 'string' ? error : String(error.message || '')
  } catch (ignored) {
    void ignored
    return null
  }
  const lines = message.split('\n')
  let lineNumber = 0
  let at = -1
  for (let index = 0; index < lines.length; index += 1) {
    const found = /parse error on line (\d+)/i.exec(lines[index])
    if (found) {
      lineNumber = Number(found[1])
      at = index
      break
    }
  }
  if (!Number.isInteger(lineNumber) || lineNumber < 1 || at === -1) return null
  const snippet = Array.from((lines[at + 1] || '').replace(/\s+$/, ''))
  const caretLine = lines[at + 2] || ''
  const found = /^[\s-]*\^/.exec(caretLine)
  if (!found || snippet.length === 0) return null
  // The reader's own line, not the engine's padded copy of it: tabs stay tabs
  // and nothing the engine added is presented as something they wrote.
  const source = typeof code === 'string' ? code.split('\n')[lineNumber - 1] : ''
  const sourceChars = (source === undefined ? '' : source).replace(/\s+$/, '')
  const written = Array.from(sourceChars)
  const kept = written.length > 0 && written.length <= snippet.length ? written : snippet
  const indent = kept === written ? snippet.length - written.length : 0
  if (kept.length === 0) return null
  const caret = Math.max(0, found[0].indexOf('^') - indent)
  const stopped = /got '([^']*)'/.exec(message)
  const ranOut = !stopped || stopped[1] === 'EOF' || stopped[1] === '$end'
  const point = ranOut ? Math.min(caret, kept.length) : Math.max(0, caret - 1)
  return {
    line: lineNumber,
    before: kept.slice(0, point).join(''),
    at: kept.length > point ? kept[point] : '',
    after: kept.length > point ? kept.slice(point + 1).join('') : '',
  }
}

/**
 * The engine's own words, cut to one line. This is diagnostic material: it goes
 * to the console and to the caller's log, never into the visible sentence.
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

/**
 * Static and behavioural checks of the packaged plugin.
 *
 * Everything here runs offline with plain Node: the manifest, the patch file,
 * the locales, the client chunk's module shape, the host half's one prompt
 * section, and — through the vendored engine — that a real diagram can be
 * drawn and that a broken one reports a one-line reason.
 */

import { readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runInNewContext, Script } from 'node:vm'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

const failures = []
const notices = []

function check(name, run) {
  try {
    const detail = run()
    notices.push(`ok   ${name}${detail ? ` — ${detail}` : ''}`)
  } catch (error) {
    failures.push(`FAIL ${name} — ${error.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function read(relative) {
  return readFileSync(join(ROOT, relative), 'utf8')
}

function readJson(relative) {
  return JSON.parse(read(relative))
}

// Text assertions read code, not prose: a decoy `MutationObserver` left in a
// comment must not keep a guard green after the real one is deleted.
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

function readCode(relative) {
  return stripComments(read(relative))
}

const manifest = readJson('package.json')
const chunk = read('client.js')
const host = read('index.js')

/* ---------------------------------------------------------------- manifest */

check('package.json names and entry points', () => {
  assert(typeof manifest.name === 'string' && manifest.name.startsWith('@'), 'name must be scoped')
  assert(/^\d+\.\d+\.\d+/.test(manifest.version), 'version must be semver')
  assert(manifest.license === 'MIT', 'license must be MIT')
  assert(manifest.type === 'module', 'type must be module')
  assert(manifest.main === 'index.js', 'main must be index.js')
  assert(manifest.exports['.'] === './index.js', 'exports["."] must be index.js')
  assert(manifest.exports['./client'] === './client.js', 'exports["./client"] must be client.js')
  assert(manifest.exports['./icon'] === './icon.svg', 'exports["./icon"] must be icon.svg')
  assert(manifest.exports['./locale/*.json'] === './locale/*.json', 'locale glob must be exported')
  return `${manifest.name}@${manifest.version}`
})

check('package.json points at the repository npm trusts', () => {
  // A provenance publish is rejected unless the manifest names the same
  // repository the workflow runs in, so this must fail before the tag is pushed.
  const repository = manifest.repository && typeof manifest.repository === 'object' ? manifest.repository : {}
  assert(
    repository.url === 'git+https://github.com/jiezhengj/DSH-Dyslexia.git',
    'repository.url must match the trusted publisher repository',
  )
  assert(typeof manifest.homepage === 'string' && manifest.homepage.startsWith('https://github.com/'), 'homepage must be the repository')
  assert(typeof manifest.bugs === 'object' && typeof manifest.bugs.url === 'string', 'bugs.url must be set')
  return repository.url
})

check('package.json declares the bundle patch and the client half', () => {
  assert(manifest.dsh && manifest.dsh.bundle, 'dsh.bundle is missing')
  assert(manifest.dsh.bundle.patch === './cordis.patch.yml', 'dsh.bundle.patch must be cordis.patch.yml')
  const client = manifest.dsh.client
  assert(client && client.platform === 'web', 'dsh.client.platform must be web')
  assert(client.inject === undefined, 'dsh.client.inject ties the load to a host client package')
  return 'platform web, no package inject'
})

check('no dsh version gate can refuse a start', () => {
  // app-boot throws on an unmet requirement before the profile starts, so a
  // version bound here would be able to keep the whole app from opening.
  const engines = manifest.engines
  const declaresEngines = Object.hasOwn(manifest, 'engines') && engines !== null && typeof engines === 'object' && Object.hasOwn(engines, 'dsh')
  assert(!declaresEngines, 'engines.dsh would let a future dsh refuse to start')
  const peers = manifest.peerDependencies && typeof manifest.peerDependencies === 'object' ? manifest.peerDependencies : {}
  const dshPeers = Object.keys(peers).filter((name) => name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-'))
  assert(dshPeers.length === 0, `dsh peer ranges are checked the same way: ${dshPeers.join(', ')}`)
  return 'no engines.dsh, no dsh peers'
})

check('published files leave the build sources out', () => {
  const files = manifest.files
  assert(Array.isArray(files) && files.length > 0, 'files is empty')
  const forbidden = ['src', 'vendor', 'scripts', 'verify', 'specs', '.tools', '.tmp']
  files.forEach((entry) => {
    const head = entry.split('/')[0]
    assert(!forbidden.includes(head), `files must not ship ${entry}`)
  })
  for (const required of ['index.js', 'client.js', 'cordis.patch.yml', 'locale/*.json', 'docs', 'icon.svg', 'LICENSE', 'THIRD-PARTY-NOTICES.md', 'README*.md']) {
    assert(files.includes(required), `files must include ${required}`)
  }
  return `${files.length} patterns`
})

/* The eight interface languages DeepSeek Harness ships; a page that exists for
 * one of them must declare its own document, and that document must exist. */
const LANGUAGES = ['zh', 'en', 'ja', 'es', 'fr', 'de', 'ru', 'pt']

check('the required published files exist', () => {
  const required = ['index.js', 'client.js', 'cordis.patch.yml', 'icon.svg', 'LICENSE', 'THIRD-PARTY-NOTICES.md', 'README.md', 'docs/preview.svg']
  for (const language of LANGUAGES) required.push(`locale/${language}.json`, `README.${language}.md`)
  required.forEach((relative) => {
    const size = statSync(join(ROOT, relative)).size
    assert(size > 0, `${relative} is empty`)
  })
  return `${required.length} required files`
})

check('every interface language has its own plugin page', () => {
  const titles = new Set()
  for (const language of LANGUAGES) {
    const page = readJson(`locale/${language}.json`)
    const meta = page.meta && typeof page.meta === 'object' ? page.meta : {}
    assert(typeof meta.title === 'string' && meta.title.trim(), `locale/${language}.json needs meta.title`)
    assert(typeof meta.description === 'string' && meta.description.trim().length >= 80, `locale/${language}.json needs a real meta.description`)
    assert(typeof meta.detail === 'string', `locale/${language}.json needs meta.detail`)
    assert(meta.detail.endsWith('.md'), `meta.detail must be markdown: ${meta.detail}`)
    const document = read(meta.detail)
    const lines = document.split(/\r?\n/).filter((line) => line.trim())
    assert(lines.length === 1, `${meta.detail} must be exactly one image line`)
    assert(/^!\[[^\]]+\]\(preview\.svg\)$/.test(lines[0].trim()), `${meta.detail} must be an image with alt text pointing at preview.svg`)
    assert(statSync(join(ROOT, 'docs', 'preview.svg')).size > 0, 'docs/preview.svg is empty')
    titles.add(meta.title)
  }
  assert(titles.size === LANGUAGES.length, 'every language needs its own title')
  return `${LANGUAGES.length} languages`
})

/* ------------------------------------------------------------ patch/locale */

check('cordis.patch.yml inserts the plugin by package name', () => {
  const patch = read('cordis.patch.yml')
  const lines = patch.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  assert(lines[0] === '- insert:', 'patch must start with - insert:')
  assert(lines.includes('- id: dsh-dyslexia'), 'patch must insert id dsh-dyslexia')
  const named = lines.some((line) => line === `name: '${manifest.name}'` || line === `name: ${manifest.name}`)
  assert(named, 'patch name must be the package name')
  return lines.length + ' lines'
})

check('both locales carry metadata', () => {
  for (const locale of ['en', 'zh']) {
    const data = readJson(`locale/${locale}.json`)
    assert(data.meta, `${locale}.json has no meta`)
    assert(typeof data.meta.title === 'string' && data.meta.title.length > 0, `${locale}.json meta.title is empty`)
    assert(typeof data.meta.description === 'string' && data.meta.description.length > 0, `${locale}.json meta.description is empty`)
  }
  return 'en, zh'
})

/* -------------------------------------------------------------- client.js */

const banner = chunk.slice(0, chunk.indexOf('*/') + 2)
const body = chunk.slice(banner.length)

check('client.js is one loader chunk keyed by the package name', () => {
  assert(banner.startsWith('/*!'), 'client.js must start with a license banner')
  assert(chunk.includes('window.__ModuleLoader__.load('), 'client.js does not call the module loader')
  assert(chunk.includes(`id: "${manifest.name}"`), 'loader id must equal the package name')
  assert(chunk.includes('exports.apply = apply'), 'client.js does not export apply')
  assert(chunk.includes('exports.inject = inject'), 'client.js does not export inject')
  assert(!body.includes('</script'), 'an inline </script would end the host page')
  return `${statSync(join(ROOT, 'client.js')).size} bytes`
})

check('client.js requires react and nothing else', () => {
  const requested = [...body.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((match) => match[1])
  const unexpected = requested.filter((name) => name !== 'react')
  assert(unexpected.length === 0, `unexpected require: ${unexpected.join(', ')}`)
  assert(requested.includes('react'), 'client.js never requires react')
  return 'react'
})

check('client.js never reaches the network', () => {
  const code = chunk.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const needle of [
    'fetch(',
    'fetch (',
    'XMLHttpRequest',
    'importScripts',
    'new WebSocket',
    'EventSource',
    'import(',
    'sendBeacon',
    'new Image(',
    'new Worker(',
    'WebTransport',
  ]) {
    assert(!code.includes(needle), `client.js contains ${needle}`)
  }
  const withoutNamespaces = code.replace(/https?:\/\/www\.w3\.org\/[^"'\s]*/g, '')
  const found = /https?:\/\/[^\s"']*/.exec(withoutNamespaces)
  assert(!found, `client.js reaches a URL: ${found && found[0]}`)
  return 'no fetch, no XHR, no dynamic import, no remote URL'
})

check('client.js carries the vendored engine', () => {
  assert(body.includes('var pele=(()=>{'), 'engine global build is not inlined')
  assert(body.includes('Pele 1.13.0'), 'engine version banner is missing')
  assert(body.includes('pele.mount('), 'client.js never calls pele.mount')
  return 'Pele 1.13.0 inlined'
})

/* ------------------------------------------------------- compatibility */

const chunkContexts = []

function loadChunk(globals) {
  const context = { console, ...globals }
  runInNewContext(chunk, context)
  chunkContexts.push(context)
  return context
}

check('client.js compiles on its own', () => {
  new Script(chunk, { filename: 'client.js' })
  return 'no syntax error for a host batch to inherit'
})

check('a broken host loader cannot make the chunk throw', () => {
  loadChunk({ window: { __ModuleLoader__: { load() { throw new Error('host changed the loader') } } } })
  loadChunk({ window: {} })
  loadChunk({})
  return 'throwing loader, missing loader, missing window'
})

check('a failing factory still yields a silent module', () => {
  let factory = null
  loadChunk({ window: { __ModuleLoader__: { load(spec) { factory = spec.factory } } } })
  assert(typeof factory === 'function', 'the loader never received a factory')
  const module = factory(() => {
    throw new Error('react is gone')
  })
  assert(typeof module.apply === 'function', 'the module has no apply')
  assert(Array.isArray(module.inject), 'the module has no inject')
  module.apply(undefined)
  module.apply({})
  module.apply({ slots: null })
  module.apply({ slots: { inject() {}, register() {} } })
  return 'no react, no ctx, no slots, empty services'
})

check('an engine that fails to load leaves the picture to the host', () => {
  assert(chunk.includes('getDerivedStateFromError'), 'the layer has no error boundary')
  assert(chunk.includes('function readLayerInput'), 'the layer does not read the fence props defensively')
  assert(chunk.includes('safeRead'), 'the layer reads host props without a guard')
  assert(chunk.includes('engineUnavailable'), 'the layer has no sentence for a missing engine')
  // The half-drawn state a missing engine leaves behind is why the picture is
  // thrown away: without this guard the engine call itself would be the failure.
  assert(chunk.includes("typeof pele.mount !== 'function'"), 'the layer does not check the engine before drawing')
  return 'boundary + guarded props + engine guard + engine sentence'
})

check('the layer is keyed to mermaid on the fence slot', () => {
  assert(chunk.includes("'conversation.chat.markdown.fence'"), 'slot name is missing')
  assert(/key:\s*FENCE_KEY/.test(chunk) && /FENCE_KEY\s*=\s*'mermaid'/.test(chunk), 'the layer must be keyed to mermaid')
  assert(chunk.includes("locale: LOCALE_NAMESPACE"), 'the layer must claim the locale namespace')
  assert(chunk.includes('.inject(SLOT_NAME'), 'the slot is never taken')
  return 'conversation.chat.markdown.fence + mermaid'
})

/* ---------------------------------------------------------------- host half */

check('host half declares its package identity and one service', () => {
  assert(host.includes("export const name = 'dsh-dyslexia'"), 'host name must be dsh-dyslexia')
  assert(host.includes("export const inject = ['systemPrompt']"), 'host inject must be [systemPrompt]')
  assert(host.includes('.section('), 'host half must add a prompt section')
  assert(!host.includes('ctx.tools'), 'host half must not register a tool')
  return 'systemPrompt only'
})

const captured = []
let hostModule = null

// A rejected dynamic import must read as a failure line, not as a stack trace
// printed outside the report.
try {
  hostModule = await import(pathToFileURL(join(ROOT, 'index.js')).href)
  hostModule.apply({
    systemPrompt: {
      section(spec) {
        captured.push(spec)
      },
    },
  })
  assert(captured.length === 1, `host half added ${captured.length} sections on load`)
  notices.push('ok   the host half can be loaded and apply once — one section on a healthy host')
} catch (error) {
  failures.push(`FAIL the host half can be loaded and apply once — ${error.message}`)
}

check('host apply survives a host that changed shape', () => {
  assert(hostModule !== null, 'the host half never loaded')
  hostModule.apply(undefined)
  hostModule.apply(null)
  hostModule.apply({})
  hostModule.apply({ systemPrompt: null })
  hostModule.apply({ systemPrompt: {} })
  hostModule.apply({
    systemPrompt: {
      section() {
        throw new Error('signature changed')
      },
    },
  })
  const after = captured.length
  assert(after === 1, `hostile hosts added a section: ${after}`)
  return 'six hostile hosts, no throw, no section'
})

check('the prompt section states the capability once', () => {
  assert(hostModule !== null, 'the host half never loaded')
  assert(hostModule.name === 'dsh-dyslexia', 'module name mismatch')
  assert(Array.isArray(hostModule.inject) && hostModule.inject.includes('systemPrompt'), 'module inject mismatch')
  assert(captured.length === 1, `expected one section, got ${captured.length}`)
  const [section] = captured
  assert(typeof section.name === 'string' && section.name.length > 0, 'section name is empty')
  assert(Number.isInteger(section.order), 'section order must be an integer')
  assert(typeof section.text === 'string' && section.text.length > 0, 'section text is empty')
  const words = section.text.trim().split(/\s+/).length
  assert(words <= 90, `section text is ${words} words, budget is 90`)
  assert(section.text.includes('mermaid'), 'section text must name the language')
  const forbidden = ['always', 'must use', 'you should', 'prefer', 'every answer', 'always answer', '尽量', '必须']
  forbidden.forEach((phrase) => assert(!section.text.toLowerCase().includes(phrase.toLowerCase()), `section text states a preference: ${phrase}`))
  return `${words} words, order ${section.order}, name ${section.name}`
})

/* ------------------------------------------------------------ the engine */

const engineContext = { console }
runInNewContext(read('vendor/pele/pele.global.js'), engineContext)
const engine = engineContext
const SAMPLES = [
  ['flowchart LR\n  A[Login] --> B[Home]', 'flowchart'],
  ['sequenceDiagram\n  A->>B: hi', 'sequence'],
  ['classDiagram\n  class A\n  class B\n  A --> B', 'class'],
  ['stateDiagram-v2\n  [*] --> Idle\n  Idle --> Done', 'state'],
  ['erDiagram\n  CUSTOMER ||--o{ ORDER : places', 'er'],
  ['mindmap\n  root((Title))\n    Child', 'mindmap'],
  ['timeline\n  2024 : first\n  2025 : second', 'timeline'],
]

check('the engine type is exposed the way client.js expects', () => {
  const names = Object.keys(engine.pele).sort()
  for (const name of ['PeleError', 'mount', 'render']) assert(names.includes(name), `engine has no ${name}`)
  return names.join(', ')
})

check('every supported sample type draws an svg', () => {
  const drawn = []
  SAMPLES.forEach(([source, expected]) => {
    const result = engine.pele.render(source)
    assert(typeof result.svg === 'string' && result.svg.startsWith('<svg'), `${expected} produced no svg`)
    assert(result.svg.length > 100, `${expected} svg looks empty`)
    assert(String(result.type).toLowerCase().includes(expected), `${expected} reported type ${result.type}`)
    drawn.push(`${expected}:${result.width}x${result.height}`)
  })
  return drawn.join(' ')
})

check('a broken diagram reports a one-line reason', () => {
  let error = null
  try {
    engine.pele.render('flowchart TD\n  A-->')
  } catch (caught) {
    error = caught
  }
  assert(error, 'a broken diagram must not render silently')
  assert(error.name === 'PeleError' || error instanceof engine.pele.PeleError, `unexpected error type ${error.name}`)
  const first = String(error.message).split('\n').map((line) => line.trim()).filter(Boolean)[0]
  assert(first && first.length > 0, 'the error has no first line')
  return first
})

check('host key echo falls back to bundled strings', () => {
  const source = readCode('src/client/i18n.js')
  assert(/function isResolved/.test(source), 'i18n.js has no resolution guard')
  assert(source.indexOf('trimmed.indexOf(key) !== -1') !== -1, 'i18n.js accepts the key echoed back')
  assert(source.indexOf("indexOf('{{')") !== -1, 'i18n.js accepts an unfilled placeholder')
  assert(source.indexOf('trimmed.length === 0') !== -1, 'i18n.js accepts a blank translation')
  assert(/LANGUAGE_CODES/.test(source), 'i18n.js has no language list')
  for (const lang of ['en', 'zh', 'ja', 'es', 'fr', 'de', 'ru', 'pt']) {
    assert(source.indexOf('\n  ' + lang + ': {') !== -1, 'i18n.js is missing the ' + lang + ' strings')
  }
  return 'key echo, blanks, placeholders rejected'
})

check('every language carries the same complete sentences', () => {
  const source = readCode('src/client/i18n.js')
  const keys = [
    'copied',
    'copyFailed',
    'copySource',
    'engineUnavailable',
    'figureLabel',
    'hideSource',
    'renderFailed',
    'resetZoom',
    'showSource',
    'syntaxError',
    'zoomIn',
    'zoomOut',
  ]
  for (const key of keys) {
    const count = (source.match(new RegExp('\\n    ' + key + ':', 'g')) || []).length
    assert(count === 8, `${key} appears in ${count} languages, expected 8`)
  }
  assert(!source.includes('{{reason}}'), 'the engine reason is pasted into a visible sentence')
  return `${keys.length} keys x 8 languages, no engine text in labels`
})

function sourceFingerprint() {
  // Same normalisation as the builder: CRLF and LF checkouts must agree.
  const fragments = ['styles.js', 'i18n.js', 'figure.js', 'view.js', 'entry.js'].map((name) =>
    read(`src/client/${name}`).replace(/\r\n/g, '\n'),
  )
  const hash = createHash('sha256')
  hash.update(manifest.name)
  hash.update('\u0000')
  hash.update(String(manifest.version))
  hash.update('\u0000')
  fragments.forEach((text) => {
    hash.update(text)
    hash.update('\u0000')
  })
  return hash.digest('hex').slice(0, 32)
}

check('client.js matches the sources it claims', () => {
  const expected = sourceFingerprint()
  const found = /sources sha256:([0-9a-f]{32})/.exec(chunk)
  assert(found, 'client.js carries no source fingerprint')
  assert(found[1] === expected, `client.js is stale: rebuild it (chunk ${found[1]}, sources ${expected})`)
  return `${expected}`
})

check('the picture is the image, and the copy answer is announced', () => {
  const labels = readCode('src/client/i18n.js')
  assert(!labels.includes('{{type}}'), 'a label still interpolates the engine type')
  const view = readCode('src/client/view.js')
  assert(
    view.includes("svg.setAttribute('role', 'img')"),
    'the drawing itself must carry role="img" so the zoom buttons stay outside it',
  )
  assert(!/role: 'img'/.test(view), 'the container must not be role="img"')
  assert(view.includes('aria-live'), 'the copy result is only visible, never announced')
  assert(view.includes('isRenderableChild'), 'falsy host children are not treated as empty')
  return 'label is a noun, role="img" on the svg, copy result announced'
})

check('host children react would refuse fall back to the source', () => {
  const view = readCode('src/client/view.js')
  // A host that hands over a plain object (or a function, or an array holding
  // one) makes React throw #31 while this layer renders. That throw would happen
  // inside the layer's own boundary, so the boundary could not catch it and the
  // whole message would disappear. Only shapes React accepts may pass through.
  assert(view.includes('React.isValidElement(value)'), 'children are not whitelisted to React-accepted shapes')
  assert(view.includes('value.every(isRenderableChild)'), 'arrays of children are not checked element by element')
  assert(view.includes('sourceFallback('), 'no source fallback exists for a host block that cannot be shown')
  return 'objects, functions and mixed arrays fall back to the source text'
})

check('every drawing the engine swaps in is named again', () => {
  const view = readCode('src/client/view.js')
  // The engine owns re-layout: it re-draws by assigning innerHTML, which replaces
  // the whole <svg> with a node that carries role="graphics-document document",
  // an English aria-roledescription and no name. The plugin therefore must watch
  // the subtree and re-label, rather than driving its own refresh — a second
  // re-layout path would duplicate the engine's and could not be exercised in a
  // headless fixture (the browser never delivers those frames there).
  assert(view.includes('function labelFigure(host, translate)'), 'no shared labelling routine exists')
  assert(view.includes("svg.removeAttribute('aria-roledescription')"), 'the engine role description is not removed')
  assert(view.includes('MutationObserver'), 'a swapped drawing node is not watched for')
  assert(/watcher\.observe\(host, \{ childList: true \}\)/.test(view), 'the watcher does not watch the drawing subtree')
  assert(/labelFigure\(host, translateRef\.current\)/.test(view), 'a swapped drawing is not re-named')
  assert(!/new ResizeObserver/.test(view), 'the plugin still drives its own re-layout instead of leaving it to the engine')
  assert(!/requestAnimationFrame/.test(view), 'the plugin still schedules frames for a re-layout it does not own')
  assert(view.includes('const ZOOM_BUTTONS'), 'the engine zoom controls are never renamed')
  const labels = readCode('src/client/i18n.js')
  assert(
    labels.includes('const table = DICTIONARY[fallbackLanguage(doc)] || DICTIONARY.en'),
    'the bundled strings are captured once, so a language switch keeps the old words',
  )
  return 'the engine owns re-layout; every swapped drawing node and its zoom buttons are renamed, strings follow the language'
})

check('a host block that throws cannot empty the message', () => {
  const view = readCode('src/client/view.js')
  assert(view.includes('class SafeChildren extends React.Component'), 'the host block is rendered unguarded')
  assert(view.includes('function hostBlock(children, code)'), 'no single entry point for the host block')
  assert(!/Symbol\.iterator/.test(view), 'an iterable is still passed through to React unchecked')
  assert(view.includes('sourceFallback(this.props.code)'), 'the guarded block has no plain-text floor')
  return 'host blocks render inside their own boundary, with the source text as the floor'
})

check('a factory that cannot build never throws at the host', () => {
  let factory = null
  loadChunk({ window: { __ModuleLoader__: { load(spec) { factory = spec.factory } } } })
  assert(typeof factory === 'function', 'the loader never received a factory')
  // A host whose `react` throws on any property access: module evaluation blows
  // up inside `buildModule`, and the factory must still answer with a module.
  const explosive = new Proxy(
    {},
    {
      get() {
        throw new Error('react went feral')
      },
      has() {
        throw new Error('react went feral')
      },
    },
  )
  const module = factory(() => explosive)
  assert(module && typeof module.apply === 'function', 'the factory did not return a module')
  assert(Array.isArray(module.inject), 'the fallback module has no inject')
  assert(module.inject.length === 0, 'the fallback module must ask for nothing')
  module.apply({})
  return 'module-level throw contained, empty module returned'
})

function shippedTextFiles() {
  // The text a reader actually receives: the README index, one README per
  // language, and the plugin page each language declares in its locale file.
  const paths = ['README.md']
  for (const language of LANGUAGES) {
    paths.push(`README.${language}.md`)
    paths.push(readJson(`locale/${language}.json`).meta.detail)
  }
  return [...new Set(paths)].map((relative) => ({ path: relative, body: read(relative) }))
}

check('nothing in the package asks you to edit an instruction file', () => {
  // FR-012: the plugin takes effect from the plugin itself. If any shipped text
  // told the reader to put a preference into an instruction file, a user would
  // have to edit one to get the behaviour - and uninstalling would leave it behind.
  const shipped = shippedTextFiles()
  const offenders = shipped.filter((file) => /AGENTS\.md|CLAUDE\.md|\.cursorrules/i.test(file.body))
  assert(offenders.length === 0, `shipped text asks for an instruction file: ${offenders.map((f) => f.path).join(', ')}`)
  const code = readFileSync(join(ROOT, 'client.js'), 'utf8') + readFileSync(join(ROOT, 'index.js'), 'utf8')
  assert(!/AGENTS\.md|CLAUDE\.md/i.test(code), 'the code reads or writes an instruction file')
  return `${shipped.length} shipped text files, no instruction-file ask`
})

/* ------------------------------------------------- host half, for real */

const hostHalf = await import(pathToFileURL(join(ROOT, 'index.js')).href)

check('the host half registers exactly one capability section', () => {
  const sections = []
  hostHalf.apply({
    systemPrompt: {
      section(def) {
        sections.push(def)
        return () => undefined
      },
    },
  })
  assert(sections.length === 1, `the host half added ${sections.length} sections`)
  const [section] = sections
  assert(section.name === 'ui:dsh-dyslexia', `section name ${section.name}`)
  assert(section.order === 9000, `section order ${section.order}`)
  assert(typeof section.text === 'string' && section.text.trim().length > 0, 'the section has no text')
  return `${section.name}, order ${section.order}, ${section.text.trim().split(/\s+/).length} words`
})

check('the host half stays silent when the host changed shape', () => {
  const warnings = []
  const original = console.warn
  console.warn = (...args) => warnings.push(args.join(' '))
  try {
    for (const ctx of [undefined, null, {}, { systemPrompt: null }, { systemPrompt: {} }]) {
      hostHalf.apply(ctx)
    }
  } finally {
    console.warn = original
  }
  assert(warnings.length === 0, `the host half warned on ${warnings.length} unchanged hosts: ${warnings.join(' | ')}`)
  hostHalf.apply({
    systemPrompt: {
      section() {
        throw new Error('system prompt service changed')
      },
    },
  })
  hostHalf.apply({
    systemPrompt: {
      section() {
        return Promise.reject(new Error('asynchronous failure'))
      },
    },
  })
  return 'five silent hosts (no warning), two throwing sections (one warning each)'
})

/* ------------------------------------------- the fixtures can fail at all */

check("the contract's colour variables are the ones that are wired", () => {
  const contract = readFileSync(
    join(ROOT, 'specs', '001-mermaid-fence-render', 'contracts', 'client-fence-layer.md'),
    'utf8',
  )
  const styles = readFileSync(join(ROOT, 'src', 'client', 'styles.js'), 'utf8')
  // A decoy inside a comment must not win: strip comments before reading either
  // side, so writing the right mapping into a comment cannot launder a wrong one.
  const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  const pairOf = (text) => {
    const pairs = new Map()
    const pattern = /--pele-([a-z-]+):\s*([^;'\n]+);/g
    const source = strip(text)
    let match = pattern.exec(source)
    while (match) {
      assert(!pairs.has(match[1]), `--pele-${match[1]} is declared twice`)
      pairs.set(match[1], match[2].trim())
      match = pattern.exec(source)
    }
    return pairs
  }
  const wanted = pairOf(contract)
  const wired = pairOf(styles)
  // Anchor the names to the vendored engine itself: renaming a variable on both
  // sides used to stay green while the colour silently fell back to the default.
  const vendor = readFileSync(join(ROOT, 'vendor', 'pele', 'pele.global.js'), 'utf8')
  const engine = new Set([...vendor.matchAll(/--pele-([a-z-]+)/g)].map((match) => match[1]))
  const invented = [...wired.keys()].filter((name) => !engine.has(name))
  assert(invented.length === 0, `the styles wire names the engine does not know: ${invented.join(', ')}`)
  assert(wanted.size >= 10, `the contract names only ${wanted.size} engine variables`)
  assert(wired.has('critical'), 'the engine error colour (--pele-critical) is not wired')
  const missing = [...wanted.keys()].filter((name) => !wired.has(name))
  const extra = [...wired.keys()].filter((name) => !wanted.has(name))
  assert(missing.length === 0, `the contract names variables the styles do not wire: ${missing.join(', ')}`)
  assert(extra.length === 0, `the styles wire variables the contract never names: ${extra.join(', ')}`)
  const mismatched = [...wanted.keys()]
    .filter((name) => wanted.get(name) !== wired.get(name))
    .map((name) => `${name}: ${wanted.get(name)} vs ${wired.get(name)}`)
  assert(mismatched.length === 0, `the contract and the styles disagree: ${mismatched.join('; ')}`)
  return `${wired.size} engine variables, owned by engine and contract alike`
})

check('both size limits reach the engine, each proven on its own', () => {
  const figure = stripComments(readFileSync(join(ROOT, 'src', 'client', 'figure.js'), 'utf8'))
  const harness = readFileSync(join(ROOT, 'verify', 'harness', 'index.html'), 'utf8')
  // Compare the numbers themselves: a prefix match would accept
  // `24 * 1024 * 1000` or `4000`, and `prepack` only runs this file.
  const limitOf = (name) => {
    const match = figure.match(new RegExp(name + ':\\s*([0-9\\s*+]+),'))
    if (!match) return NaN
    try {
      return Function(`return ${match[1].trim()}`)()
    } catch (error) {
      return NaN
    }
  }
  assert(limitOf('limit') === 24 * 1024, `the character limit is ${limitOf('limit')}, not 24 KiB`)
  assert(limitOf('maxEdges') === 400, `the edge limit is ${limitOf('maxEdges')}, not 400`)
  assert(limitOf('outputLimit') === 2 * 1024 * 1024, `the output limit is ${limitOf('outputLimit')}, not 2 MiB`)
  // Declaring the limits is not enough: they have to reach `pele.mount`.
  assert(/\.\.\.FIGURE_LIMITS/.test(figure), 'FIGURE_LIMITS is not spread into the mount options')
  const fixtures = [
    'a source over the size limit says why',
    'a source over the size limit is not drawn',
    'a picture with too many edges says why',
    'a picture with too many edges is not drawn',
  ]
  for (const name of fixtures) {
    assert(harness.includes(name), `the harness lost the fixture ${name}`)
  }
  // Two fixtures, not one: a source that crosses both limits keeps passing when
  // either check is loosened, which is how the old single fixture stayed green.
  assert(
    /length: 40[\s\S]{0,80}x'\.repeat\(760\)/.test(harness),
    'the character-limit fixture does not cross only the character limit',
  )
  assert(
    /length: 420[\s\S]{0,80}--> A\$\{index \+ 1\}/.test(harness),
    'the edge-limit fixture does not cross only the edge limit',
  )
  return 'three limits passed to mount, two fixtures that cross one each'
})

check('the fixtures assert what the fixes promise, and can fail', () => {
  // Comments are stripped before scanning: a decoy name inside a `//` comment, or
  // an emptied assertion body, must not keep this check green.
  const harness = readFileSync(join(ROOT, 'verify', 'harness', 'index.html'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  const needed = [
    'the fixture really replaced the drawing node',
    'a swapped drawing is named again',
    'a drawing swapped after a width change is named again',
    'a picture that fits offers no zoom buttons',
    'disabling the plugin takes its stylesheet away',
    'the locale registration is dropped',
    'the fence layer is gone once the host disposes',
    'the layer survives a throwing code getter',
    'a throwing code getter still yields an element',
    'the hostile children bag mounted without a setup error',
    'the layer survives a throwing children getter',
    'a throwing children getter still yields an element',
    'a throwing code getter leaves the host block',
    'a throwing children getter leaves the source',
    'the source block keeps the language the host sent',
    'the picture box is capped to the column',
    'every zoom button in reach can take the keyboard',
    'every interface language has expectations',
    'the column measurement can see an overflow',
    'every zoom button is reachable once the picture is zoomed',
    'a source swapped for a broken one is shown once, not twice',
  'a new fence closes a panel the reader opened for the old one',
  'the new fence offers the panel closed, not open',
    'a copy answer does not outlive the source it described',
    'a fence whose props read throws is left to the host, not the message',
    'a host without effects keeps one stylesheet, not one per apply',
  ]
  const NEEDED_COUNT = 26
  if (needed.length !== NEEDED_COUNT) {
    throw new Error(`the guard list has ${needed.length} names, expected ${NEEDED_COUNT}`)
  }
  const missing = needed.filter((name) => harness.indexOf(name) === -1)
  if (missing.length > 0) throw new Error(`missing fixture assertions: ${missing.join(', ')}`)
  // A title alone proves nothing: the name has to sit inside an expect() call
  // whose condition reads something, or emptying the body (or writing `true`)
  // would keep this check green.
  const literals = /^(?:true|false|1|0|!0|!1|null|undefined)$/
  // `1 === 1` is a comparison that reads nothing, so a blacklist of bare
  // literals is not enough: the condition has to mention a name that the
  // fixture also uses, i.e. something bound in the page itself.
  const mentionsFixtureName = (head) => {
    const names = head.match(/[A-Za-z_$][\w$]*/g) || []
    return names.some((name) => {
      const pattern = new RegExp(`\\b${name}\\b`, 'g')
      return (harness.match(pattern) || []).length > 1
    })
  }
  // Mentioning a fixture name is still not enough: `!!drawn || true` reads the
  // name and is true whatever it holds. A condition whose value can be decided
  // by a constant in a short-circuit or ternary branch is treated as hollow.
  // A comparison of a name with itself (`x === x`, `x !== x`) is true whatever
  // the name holds, so it joins the constant branches below.
  const selfComparison = (head) => /^([\w$.()'"\[\] ]+?)\s*(===|!==)\s*\1$/.test(head)
  const constantBranch = new RegExp(
    [
      '\\|\\|\\s*(?:true|1|!0|"")',
      '&&\\s*(?:true|1|!0|"")',
      '\\|\\|\\s*(?:false|0|null|undefined|"")',
      '&&\\s*(?:false|0|null|undefined|"")',
      '\\?\\s*[^:]*:\\s*(?:true|false)\\b',
    ].join('|'),
  )
  const hollow = needed.filter((name) => {
    const at = harness.indexOf(name)
    const open = harness.lastIndexOf('expect(', at)
    if (open === -1) return true
    const head = harness
      .slice(open + 'expect('.length, at)
      .replace(/['",\s]+$/, '')
      .trim()
    return (
      head.length === 0 ||
      literals.test(head) ||
      !mentionsFixtureName(head) ||
      selfComparison(head) ||
      constantBranch.test(head)
    )
  })
  if (hollow.length > 0) throw new Error(`fixture assertions without a condition: ${hollow.join(', ')}`)
  return `${needed.length} assertions present, each with a condition that reads something`
})

/* ---------------------------------------------------------------- report */

const EXPECTED_CHECKS = 39
if (notices.length + failures.length !== EXPECTED_CHECKS) {
  failures.push(
    `[FAIL] the suite has ${notices.length + failures.length} checks, expected ${EXPECTED_CHECKS}: a check was added or removed without updating this number`,
  )
}

for (const line of notices) process.stdout.write(`${line}\n`)
for (const line of failures) process.stderr.write(`${line}\n`)

if (failures.length > 0) {
  process.stderr.write(`\ncheck-bundle: ${failures.length} failed, ${notices.length} passed\n`)
  process.exit(1)
}

const chunkBytes = statSync(join(ROOT, 'client.js')).size
process.stdout.write(
  `\ncheck-bundle: ${manifest.name}@${manifest.version} | client.js ${chunkBytes} bytes | sources sha256:${sourceFingerprint()} | all ${notices.length} checks passed\n`,
)

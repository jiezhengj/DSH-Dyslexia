/**
 * Static and behavioural checks of the packaged plugin.
 *
 * Everything here runs offline with plain Node: the manifest, the patch file,
 * the locales, the client chunk's module shape, the host half's one prompt
 * section, and — through the vendored engine — that a real diagram can be
 * drawn and that a broken one reports a one-line reason.
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
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

/**
 * Cuts one function out of a source file by counting braces.
 *
 * Braces inside a string do not count: `isResolved` ends with `indexOf('{{')`,
 * and a naive counter never came back to zero, so the function could not be
 * executed (found while making the echo guard falsifiable).
 */
function functionBody(source, signature) {
  const start = source.indexOf(signature)
  if (start < 0) return null
  const open = source.indexOf('{', start)
  if (open < 0) return null
  let depth = 0
  let quote = null
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i]
    if (quote) {
      if (ch === '\\') i += 1
      else if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1)
    }
  }
  return null
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
    // One sentence in the language of the page: CJK sentences are legitimately
    // shorter than Latin ones, so the minimum is the shortest real sentence,
    // not the length of the long English copy this page used to carry.
    assert(typeof meta.description === 'string' && meta.description.trim().length >= 24, `locale/${language}.json needs a real meta.description`)
    assert(/[.!?。！？]$/.test(meta.description.trim()), `locale/${language}.json meta.description must be a finished sentence`)
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

/* The headline promise of feature 002 is a name: 「我有阅读障碍」 said in the
 * user's own language. It is quoted in four places per language — the plugin
 * page title, the same sentence opening its description, the detail page's alt
 * text, and the README the package ships — so all four are compared with one
 * table here. Until this existed, replacing the Chinese title with 「DSH 图个
 * 明白」 and the English README title with something else passed every suite. */
const NAMING = {
  zh: 'DSH 我有阅读障碍',
  en: "DSH — I'm dyslexic",
  ja: 'DSH 私はディスレクシアです',
  es: 'DSH — Tengo dislexia',
  fr: 'DSH — Je suis dyslexique',
  de: 'DSH — Ich habe Legasthenie',
  ru: 'DSH — У меня дислексия',
  pt: 'DSH — Tenho dislexia',
}

check('every interface language names the plugin the way it was promised', () => {
  const problems = []
  for (const language of LANGUAGES) {
    const expected = NAMING[language]
    if (!expected) {
      problems.push(`no promised name for ${language}`)
      continue
    }
    const meta = readJson(`locale/${language}.json`).meta || {}
    if (meta.title !== expected) problems.push(`locale/${language}.json title is ${JSON.stringify(meta.title)}`)
    // The description has to open with the name, so the page reads as the user's
    // own sentence rather than a blurb that happens to sit under a title.
    if (!String(meta.description || '').startsWith(expected)) {
      problems.push(`locale/${language}.json description does not open with the name`)
    }
    const detail = String(meta.detail ? read(meta.detail) : '')
    if (!detail.includes(expected)) problems.push(`${meta.detail} does not carry the name`)
    // The drawing's alt text is what a reader who cannot see the page hears, so
    // the promise is checked on the sentence that is actually read aloud.
    const alt = /!\[([^\]]*)\]\(/.exec(detail)
    if (!alt) problems.push(`${meta.detail} has no image with alt text`)
    else if (!alt[1].includes(expected)) problems.push(`${meta.detail} alt text is ${JSON.stringify(alt[1])}`)
    // README.md is the English landing page; every other language has its own file.
    const readmes = language === 'en' ? ['README.md', 'README.en.md'] : [`README.${language}.md`]
    for (const readme of readmes) {
      const first = read(readme).split(/\r?\n/)[0].trim()
      if (first !== `# ${expected}`) problems.push(`${readme} first line is ${JSON.stringify(first)}`)
    }
  }
  const description = readJson('package.json').description || ''
  if (!description.startsWith(NAMING.en)) problems.push('package.json description does not open with the name')
  assert(problems.length === 0, problems.join('; '))
  return `${LANGUAGES.length} languages, page titles, detail pages, README titles and the package description`
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

// Comments, strings and template literals are removed before identifier scans:
// a call spelled `window['fet' + 'ch']` is still a call, and a URL split across
// two strings is still a URL. Interpolations inside a template are kept, so the
// code inside `${…}` is scanned as code. A small scanner, not a regex: nested
// quotes inside a template are what made a regex version leak a URL.
function stripStringsAndComments(text) {
  let out = ''
  let i = 0
  const n = text.length
  const skipQuoted = (q) => {
    i += 1
    while (i < n) {
      if (text[i] === '\\') {
        i += 2
        continue
      }
      if (text[i] === q || text[i] === '\n') {
        i += 1
        return
      }
      i += 1
    }
  }
  while (i < n) {
    const c = text[i]
    if (c === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') i += 1
      continue
    }
    if (c === '/' && text[i + 1] === '*') {
      i += 2
      while (i < n && !(text[i] === '*' && text[i + 1] === '/')) i += 1
      i += 2
      continue
    }
    if (c === "'" || c === '"') {
      skipQuoted(c)
      out += c + c
      continue
    }
    if (c === '`') {
      i += 1
      let depth = 0
      while (i < n) {
        const ch = text[i]
        if (ch === '\\') {
          i += 2
          continue
        }
        if (depth === 0 && ch === '`') {
          i += 1
          break
        }
        if (ch === '$' && text[i + 1] === '{') {
          depth += 1
          i += 2
          out += ' '
          continue
        }
        if (depth > 0 && ch === '}') {
          depth -= 1
          i += 1
          continue
        }
        if (depth > 0) out += ch
        i += 1
      }
      out += '``'
      continue
    }
    out += c
    i += 1
  }
  return out
}

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
  // Counting on the raw chunk: a scanner that strips strings would also strip the
  // argument of `require('react')`, and the count is the point. Every call has to
  // carry the literal, so `require(someVariable)` is a second dependency even when
  // it never appears in a quoted form.
  const calls = [...chunk.matchAll(/\brequire\s*\(/g)]
  assert(calls.length === 1, `client.js makes ${calls.length} require calls, not one`)
  for (const call of calls) {
    const tail = chunk.slice(call.index, call.index + 40)
    assert(/^require\s*\(\s*['"]react['"]\s*\)/.test(tail), `a require call is not the react literal: ${tail}`)
  }
  return 'one require call, and it is react'
})

check('client.js never reaches the network', () => {
  // Two passes over the chunk. The raw one catches the spellings that need no
  // trick. The stripped one is for identifiers: strings are erased there, so a
  // name assembled from pieces (`'fet' + 'ch'`) is invisible to it, and the same
  // trick in our own sources is refused by the bracket and literal rules below
  // rather than by this scan.
  const raw = chunk
  for (const needle of ['fetch(', 'fetch (', 'XMLHttpRequest', 'importScripts', 'new WebSocket', 'EventSource', 'import(', 'sendBeacon', 'new Image(', 'new Worker(', 'WebTransport']) {
    assert(!raw.includes(needle), `client.js contains ${needle}`)
  }
  const code = stripStringsAndComments(chunk)
  const forbidden = [
    /\bfetch\b/,
    /\bXMLHttpRequest\b/,
    /\bimportScripts\b/,
    /\bWebSocket\b/,
    /\bEventSource\b/,
    /\bsendBeacon\b/,
    /\bWebTransport\b/,
    /\bRTCPeerConnection\b/,
    /\bSharedWorker\b/,
    /\bnew\s+Worker\b/,
    /\bnew\s+Image\b/,
    /\bimport\s*\(/,
    /\bnavigator\s*\.\s*connection\b/,
  ]
  for (const pattern of forbidden) {
    const found = pattern.exec(code)
    assert(!found, `client.js names ${pattern} at column ${found ? found.index : -1}`)
  }
  const withoutNamespaces = code.replace(/www\.w3\.org[^"'\s]*/g, '')
  const found = /https?:\/\/[^\s"'`]*/.exec(withoutNamespaces)
  assert(!found, `client.js reaches a URL: ${found && found[0]}`)
  // The chunk carries 733 KB of vendored engine, so the plugin's own sources are the
  // place where every file is small enough to read and every one of them is code this
  // repository owns. A name can be spelled in pieces, so the bans read the shapes a
  // piece-built call still has to take: a call through a computed member, a window
  // pulled out of the document, a string built from character codes, and a URL
  // written onto an element as an attribute.
  const sources = ['index.js', 'src/client/entry.js', 'src/client/view.js', 'src/client/settings.js', 'src/client/figure.js', 'src/client/i18n.js', 'src/client/styles.js']
  const shapeBans = [
    [/\b(window|globalThis|self|navigator|document|this)\s*\[/, (m) => `is indexed with a bracket`],
    [/\beval\b/, () => 'names eval'],
    [/\bFunction\s*\(/, () => 'builds code with Function'],
    [/\brequire\b/, () => 'names require'],
    [/\bcreateElement\s*\(\s*['"](?:img|script|iframe|link)['"]/, () => 'creates a network-loading element'],
    [/\.src\s*=/, () => 'assigns an element URL'],
    [/\bimport\s*\(/, () => 'uses a dynamic import'],
    [/(?:[A-Za-z0-9_$)\]])\s*\[\s*['"]/, () => 'indexes with a string key'],
    [/\]\s*\(/, () => 'calls through a computed member'],
    [/(?:defaultView|ownerDocument|contentWindow)\s*\[/, () => 'indexes a window out of the document'],
    [/\[\s*\[/, () => 'indexes with a computed key'],
    [/\bString\s*\.\s*fromCharCode\b|\batob\b/, () => 'builds a string from character codes'],
    [/setAttribute\s*\(\s*['"](?:src|href)['"]/, () => 'writes a URL onto an element'],

    [/\bcreateElement\s*\(\s*['"](?:object|video|audio|source|embed|track|frame|portal)['"]/, () => 'creates a media element that loads by itself'],
    [/\bsetAttribute\s*\(\s*['"](?:data|poster|srcset|action|formaction)['"]/, () => 'writes a URL onto an element'],
    [/@import/, () => 'imports a stylesheet'],
    [/\burl\s*\(/, () => 'loads a stylesheet resource'],  ]
  // A URL can also be hidden as a pair of harmless-looking strings, so every
  // literal in those files is read: `'ht' + 'tps://…'` still contains `://`.
  // A global reached through an alias (`const g = globalThis; g[k](…)`) is a
  // network call the line-by-line bans above cannot see, so the plugin's own
  // sources may not name these at all. `navigator` stays legal: the language
  // and the clipboard are read through it, and the runtime spy in the harness
  // records any call that leaves the machine.
  const globalBans = [
    [/\bglobalThis\b/, () => 'names globalThis'],
    [/\bwindow\b/, () => 'names window'],
    [/\bself\b/, () => 'names self'],
  ]
  const textBans = [/https?:/, /:\/\//, /\bfetch\b/, /\brequire\b/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/]
  for (const relative of sources) {
    const source = read(relative)
    const withoutComments = stripComments(source)
    // The reading font size is the one thing the row needs a window for. Any other
    // use of `defaultView` hands the page a global to call, which is how a call
    // built from pieces used to reach the network while both suites stayed green.
    const withoutFont = withoutComments.replace(/defaultView\s*\.\s*getComputedStyle\b/g, '')
    assert(!/\bdefaultView\b/.test(withoutFont), `${relative} reaches a window through defaultView`)
    for (const [pattern, describe] of globalBans.concat(shapeBans)) {
      const hit = pattern.exec(withoutComments)
      assert(!hit, `${relative} ${describe(hit)} at ${hit ? withoutComments.slice(0, hit.index).split('\n').length : 0}`)
    }
    const literals = withoutComments.match(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g) || []
    for (const literal of literals) {
      for (const pattern of textBans) {
        assert(!pattern.test(literal), `${relative} carries a network token in a literal: ${literal.slice(0, 40)}`)
      }
    }
  }
  return 'no fetch, no XHR, no dynamic import, no remote URL, no string-keyed global lookup, no eval'
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
  // Comments are stripped first: a comment that mentions the guard must not keep
  // this check green after the guard itself is weakened.
  const code = stripComments(chunk)
  assert(code.includes('getDerivedStateFromError'), 'the layer has no error boundary')
  assert(code.includes('function readLayerInput'), 'the layer does not read the fence props defensively')
  assert(code.includes('safeRead'), 'the layer reads host props without a guard')
  assert(code.includes('engineUnavailable'), 'the layer has no sentence for a missing engine')
  // The half-drawn state a missing engine leaves behind is why the picture is
  // thrown away: without this guard the engine call itself would be the failure.
  assert(code.includes("typeof pele.mount !== 'function'"), 'the layer does not check the engine before drawing')
  return 'boundary + guarded props + engine guard + engine sentence'
})

check('the layer is keyed to mermaid on the fence slot', () => {
  const code = stripComments(chunk)
  assert(code.includes("'conversation.chat.markdown.fence'"), 'slot name is missing')
  assert(/key:\s*FENCE_KEY/.test(code) && /FENCE_KEY\s*=\s*'mermaid'/.test(code), 'the layer must be keyed to mermaid')
  assert(code.includes("locale: LOCALE_NAMESPACE"), 'the layer must claim the locale namespace')
  assert(code.includes('.inject(SLOT_NAME'), 'the slot is never taken')
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

/** Applies the host half to a throwaway host with a fixed switch value. */
function captureWith(value) {
  const sections = []
  const ctx = {
    systemPrompt: {
      section(def) {
        sections.push(def)
        return () => undefined
      },
    },
  }
  hostModule.apply(ctx, { visualFirst: { get: () => value } })
  return sections
}

function textOf(section) {
  return typeof section.text === 'function' ? section.text() : section.text
}

check('the section hands the host a function, not a frozen string', () => {
  let value = true
  const sections = []
  const ctx = { systemPrompt: { section(def) { sections.push(def); return () => undefined } } }
  hostModule.apply(ctx, { visualFirst: { get: () => value } })
  assert(sections.length === 1, `expected one section, got ${sections.length}`)
  const [section] = sections
  assert(typeof section.text === 'function', 'section text is a frozen string: the switch would only apply after a restart')
  const source = readFileSync(join(ROOT, 'index.js'), 'utf8')
  assert(source.includes('text: () => briefing(config)'), 'the section text is not a call into briefing()')
  const open = textOf(section)
  value = false
  const closed = textOf(section)
  value = true
  const reopened = textOf(section)
  assert(open !== closed, 'the same registration did not read the value again: the briefing is frozen at apply time')
  assert(open === reopened, 'the reopened briefing did not return to the open text')
  return 'one registration, three reads, the text follows the value'
})

// Feature 001's prompt contract records the capability text the switch must
// leave alone, sentence for sentence. Reading it back makes the check compare
// against the promise instead of against whatever `index.js` says today: a
// changed word in the host half goes red here.
function sentencesIn(relative, signature, expected) {
  const lines = read(relative).split(/\r?\n/)
  const start = lines.findIndex((line) => line.trim() === `const ${signature} = [`)
  assert(start !== -1, `${relative} no longer records ${signature}`)
  const sentences = []
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line.startsWith('].join')) break
    assert(line.length > 0, `the recorded text stops after ${sentences.length} sentences`)
    const quoted = /^'((?:[^'\\]|\\.)*)',$/.exec(line)
    assert(quoted !== null, `${relative} line ${index + 1} is not one quoted sentence: ${line}`)
    sentences.push(quoted[1].replace(/\\(.)/g, '$1'))
  }
  assert(sentences.length === expected, `${relative} recorded ${sentences.length} sentences, expected ${expected}`)
  return sentences
}

// Feature 003 added one sentence to the capability text; feature 001's four are
// the earlier promise, so they are still read back verbatim and must survive as
// the opening of the briefing.
function recordedFeatureOneSentences() {
  return sentencesIn('specs/001-mermaid-fence-render/contracts/host-prompt.md', 'MERMAID_RENDER_PROMPT', 4)
}

function recordedCapabilitySentences() {
  return sentencesIn('specs/003-diagram-palette-contrast/contracts/host-prompt.md', 'CAPABILITY_TEXT', 5)
}

// The preference paragraph is a promise too: feature 002's contract records the
// exact three sentences, so a word changed in `index.js` has to turn this red.
function recordedPreferenceText() {
  const contract = read('specs/002-visual-first-preference/contracts/host-prompt.md')
  const blocks = contract.match(/```text\n([\s\S]*?)\n```/g) || []
  assert(blocks.length >= 2, `feature 002's contract records ${blocks.length} text blocks, expected two`)
  const inner = /```text\n([\s\S]*?)\n```/.exec(blocks[1])
  assert(inner !== null, 'the preference block in feature 002\'s contract is not fenced text')
  return inner[1].trim()
}

check('the capability briefing is what it was before the switch', () => {
  assert(hostModule !== null, 'the host half never loaded')
  assert(hostModule.name === 'dsh-dyslexia', 'module name mismatch')
  assert(Array.isArray(hostModule.inject) && hostModule.inject.includes('systemPrompt'), 'module inject mismatch')
  const closed = captureWith(false)
  assert(closed.length === 1, `expected one section, got ${closed.length}`)
  const [section] = closed
  assert(typeof section.name === 'string' && section.name.length > 0, 'section name is empty')
  assert(Number.isInteger(section.order), 'section order must be an integer')
  const text = textOf(section)
  assert(typeof text === 'string' && text.length > 0, 'section text is empty')
  const words = text.trim().split(/\s+/).length
  assert(words <= 95, `capability text is ${words} words, budget is 95`)
  assert(text.includes('mermaid'), 'section text must name the language')
  const forbidden = ['always', 'must use', 'you should', 'every answer', 'prefer']
  forbidden.forEach((phrase) => assert(!text.toLowerCase().includes(phrase.toLowerCase()), `capability text states a preference: ${phrase}`))
  // The off-state briefing is not "whatever the host half says today": it is the
  // text feature 001 recorded, sentence for sentence. Comparing with the
  // contract is what makes a changed word in `index.js` go red.
  const recorded = recordedCapabilitySentences()
  const original = recordedFeatureOneSentences()
  // The one sentence 003 adds is the only one that may differ; taking it out
  // leaves feature 001's four, in order, one for one.
  const added = recorded.filter((sentence) => sentence.includes('classDef'))
  assert(added.length === 1, `feature 003 should add exactly one sentence, found ${added.length}`)
  const kept = recorded.filter((sentence) => sentence !== added[0])
  assert(kept.length === original.length, `feature 003 dropped or added sentences around its own: ${kept.length}`)
  original.forEach((sentence, index) => {
    assert(
      kept[index] === sentence,
      `feature 003 moved or reworded feature 001's sentence ${index + 1}: ${kept[index]}`,
    )
    assert(text.includes(sentence), `the off-state briefing no longer carries feature 001's sentence: ${sentence}`)
  })
  assert(
    text === recorded.join(' '),
    `the off-state briefing is not feature 003's text any more: ${JSON.stringify(text)}`,
  )
  // The new sentence is the one the reader asked for: colours follow the shape,
  // and an author's own colour wins. A briefing that dropped it would leave the
  // model writing flat diagrams and the palette would never be used.
  assert(/colour/i.test(added[0]), "feature 003's sentence does not mention colour")
  return `${words} words, five sentences (001's four first), order ${section.order}, name ${section.name}`
})

check('the switch adds the preference on top of the capability, and nothing else', () => {
  const open = textOf(captureWith(true)[0])
  const closed = textOf(captureWith(false)[0])
  assert(open.startsWith(closed), 'the capability briefing changed when the switch opened')
  const extra = open.slice(closed.length).trim()
  assert(extra.length > 0, 'the switch is on and nothing was added')
  assert(extra.includes('Do not add a picture'), 'the preference does not say when not to draw')
  assert(extra.includes('mermaid'), 'the preference does not say how to draw')
  // Unconditional wording is banned in any natural form, not just the five the
  // first version of this check listed: "Always use a picture, even for a single
  // word." passed the old guard and still says every answer needs a drawing.
  const lower = extra.toLowerCase()
  const unconditional = [
    'always',
    'every answer',
    'every reply',
    'every response',
    'every time',
    'each answer',
    'each reply',
    'each time',
    'at all times',
    'without exception',
    'no matter what',
    'unconditionally',
    'must ',
  ]
  unconditional.forEach((phrase) => assert(!lower.includes(phrase), `the preference is unconditional: ${phrase}`))
  const recordedPreference = recordedPreferenceText()
  assert(
    extra === recordedPreference,
    `the preference is not feature 002's text any more: ${JSON.stringify(extra)}`,
  )
  return `${extra.split(/\s+/).length} words of preference (feature 002's three sentences, verbatim), ${closed.split(/\s+/).length} of capability`
})

check('the switch is on for an empty configuration', () => {
  const schema = hostModule.Config
  assert(schema && typeof schema === 'function', 'the host half exports no Config schema')
  const value = schema({})
  assert(value && value.visualFirst && typeof value.visualFirst.get === 'function', 'visualFirst is not a live value')
  assert(value.visualFirst.get() === true, 'the switch does not default to on')
  return 'visualFirst defaults to true'
})

check('a host that hands over no configuration still gets the full briefing', () => {
  const sections = []
  hostModule.apply({
    systemPrompt: {
      section(def) {
        sections.push(def)
        return () => undefined
      },
    },
  })
  assert(sections.length === 1, `a config-less host got ${sections.length} sections`)
  const text = textOf(sections[0])
  assert(text.includes('Do not add a picture'), 'a config-less host lost the preference')
  return 'no config means the default, not an empty briefing'
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
  // The host keeps one dictionary for the whole window and its own copy buttons
  // own `copied`; asking for the bare key put the host's wording on our button
  // (found live on 2026-11-23). The ask must carry this plugin's namespace.
  assert(/function hostKey\(key\)/.test(source), 'i18n.js asks the host for a bare key')
  assert(source.indexOf("return LOCALE_NAMESPACE + '.' + key") !== -1, 'i18n.js does not namespace the host key')
  assert(source.indexOf('hostTranslate(hostKey(key), values)') !== -1, 'i18n.js does not ask the host under its namespace')
  for (const lang of ['en', 'zh', 'ja', 'es', 'fr', 'de', 'ru', 'pt']) {
    assert(source.indexOf('\n  ' + lang + ': {') !== -1, 'i18n.js is missing the ' + lang + ' strings')
  }
  return 'key echo, blanks, placeholders rejected; the host is asked under the plugin namespace'
})

check('the settings row reads the hook the host builds, not an object it never sends', () => {
  // The host turns each entry of the slot's `hooks` face into a hook prop named
  // after it, so `hooks: { visualFirst }` arrives as `useVisualFirst`. A row that
  // only read `props.hooks` rendered nothing on the real settings page while
  // every fixture that handed it a `hooks` object stayed green.
  const settings = readCode('src/client/settings.js')
  assert(
    settings.includes('injected.useVisualFirst') && settings.includes('HostValueRow'),
    'settings.js does not read the useVisualFirst hook prop',
  )
  assert(
    settings.includes('injected.hooks') && settings.includes('StoreValueRow'),
    'settings.js dropped the store form older hosts hand over',
  )
  // The host mounts each hooks entry with useSyncExternalStore, which calls
  // `getSnapshot`; without it the real settings page throws and the row dies.
  // The store itself, not the caller that reads a face: a bare substring search
  // for `getSnapshot()` is satisfied by `face.getSnapshot()` a few lines later,
  // so the assertion looks at the factory body the host's hook is built from.
  const factoryAt = settings.indexOf('function createValueStore')
  const factoryEnd = factoryAt === -1 ? -1 : settings.indexOf('\n}', factoryAt)
  const factory = factoryAt === -1 || factoryEnd === -1 ? '' : settings.slice(factoryAt, factoryEnd)
  assert(
    factory.includes('getSnapshot()') && factory.includes('subscribe(listener)'),
    'the value store does not carry the getSnapshot/subscribe pair a host hook is built from',
  )
  return 'useVisualFirst and the store form both wired, the store itself carries getSnapshot and subscribe'
})

check('the preference field is volatile, so the settings form can show it', () => {
  // The host's settings form projects volatile fields only; a plain boolean never
  // appears there, so the switch would vanish while both suites stayed green.
  const host = readCode('index.js')
  assert(
    /visualFirst:\s*z\.boolean\(\)\.default\(true\)\.volatile\(\)/.test(host),
    'index.js no longer declares visualFirst as a volatile boolean defaulting to true',
  )
  return 'visualFirst is a volatile boolean, default true'
})

check('the row is claimed through the slot name the host declares', () => {
  const settings = readCode('src/client/settings.js')
  const entry = readCode('src/client/entry.js')
  assert(settings.includes("const SETTINGS_SLOT = 'settings.section'"), 'settings.js does not name the general settings slot')
  assert(entry.includes('slots.inject(SETTINGS_SLOT, () =>'), 'entry.js does not register the row through that name')
  assert(entry.includes('name: SETTINGS_SLOT,'), 'the slot entry does not use the declared name')
  assert(entry.includes('id: SETTINGS_SECTION_ID,'), 'the slot entry does not use the declared id')
  // `configForms` arrives after `apply` on a real host, so the late wiring has to
  // exist; deleting it once left every suite green because only one assertion
  // covered the behaviour.
  assert(entry.includes("ctx.inject(['configForms']"), 'the late configForms wiring is gone')
  assert(entry.includes('wireOnce(child)'), 'the late wiring no longer claims the row')
  return 'one slot name, declared and used, with the late wiring in place'
})

check('a service the plugin never declared is read through ctx.get', () => {
  // The host's cordis is strict: `ctx.locale` throws under a context whose inject
  // lists only `slots`, and the row was never registered because of it. So the
  // reader is executed here rather than grepped around: a text check stayed
  // green with `typeof ctx.get === 'function'` rewritten to `false`.
  const entry = readCode('src/client/entry.js')
  const body = functionBody(entry, 'function optional(ctx, name)')
  assert(body, 'entry.js has no optional() reader')
  const optional = new Function('report', body + '\nreturn optional;')(() => {})
  const strict = {
    get: (name) => 'via-get:' + name,
    get locale() {
      throw new Error('cannot get property "locale" without inject')
    },
    get configForms() {
      throw new Error('cannot get property "configForms" without inject')
    },
  }
  assert(optional(strict, 'locale') === 'via-get:locale', 'ctx.get was not consulted for locale')
  assert(optional(strict, 'configForms') === 'via-get:configForms', 'ctx.get was not consulted for configForms')
  const plain = { locale: 'property-locale', configForms: 'property-configForms' }
  assert(optional(plain, 'locale') === 'property-locale', 'a host without ctx.get lost its locale')
  assert(optional(plain, 'configForms') === 'property-configForms', 'a host without ctx.get lost its configForms')
  assert(entry.includes("optional(ctx, 'locale')"), 'locale is still read as a bare property')
  assert(entry.includes("optional(ctx, 'configForms')"), 'configForms is still read as a bare property')
  assert(
    !/ctx\.locale\b/.test(entry) && !/ctx\.configForms\b/.test(entry),
    'a bare ctx.locale or ctx.configForms remains',
  )
  return 'the reader asked ctx.get first and fell back to the property, for locale and configForms alike'
})

check('a refused settings write is not reported as saved', () => {
  const settings = readCode('src/client/settings.js')
  // `set(field, value)` answers `Promise<boolean>`: true for Host acceptance,
  // false for a refusal or a skipped write. A handler that only listens for
  // rejection leaves the switch on a value the host refused and prints "Saved"
  // over it, which is what the row did before 2026-11-24. The settled value has
  // to reach the branch, so the branch itself is read here: an earlier version
  // of this check stayed green with `if (accepted)` rewritten to `if (true)`.
  const settle = functionBody(settings, 'const settle = (accepted) => {')
  assert(settle, 'settings.js has no settle() handler')
  assert(settle.includes('if (accepted)'), 'the settle handler does not branch on what the host answered')
  assert(settle.includes("setState('failed')"), 'the refusal path no longer says the write failed')
  assert(settle.includes('restore(before)'), 'the refusal path no longer puts the switch back')
  assert(
    /pending\.then\(\s*\n?\s*\(result\) => settle\(result === true \|\| result === undefined\)/.test(settings),
    'the fulfilment handler does not read the resolved boolean',
  )
  assert(settings.includes('() => settle(false)'), 'a rejected write no longer settles as failed')
  return 'the resolved boolean reaches the branch: true saves, false or a skipped write reverts and says so'
})

check('a face that cannot answer still reads as on', () => {
  // The default is on, and three shapes have to agree: a snapshot that carries
  // no field, one that is not an object, and a getter that throws. Only grepping
  // for `? true :` stayed green when the fallback was flipped to `false`, which
  // would show the switch off on a host whose prompt section is on.
  const settings = readCode('src/client/settings.js')
  const body = functionBody(settings, 'function readPreference(face) {')
  assert(body, 'settings.js has no readPreference()')
  const readPreference = new Function('report', body + '\nreturn readPreference;')(() => {})
  const shapes = [
    ['no face at all', null, true],
    ['no getSnapshot', {}, true],
    ['a snapshot that carries no field', { getSnapshot: () => ({ value: {} }) }, true],
    ['a snapshot that is not an object', { getSnapshot: () => null }, true],
    [
      'a getter that throws',
      {
        getSnapshot() {
          throw new Error('snapshot unavailable')
        },
      },
      true,
    ],
    ['a snapshot that says off', { getSnapshot: () => ({ value: { visualFirst: false } }) }, false],
    ['a snapshot that says on', { getSnapshot: () => ({ value: { visualFirst: true } }) }, true],
  ]
  for (const [label, face, expected] of shapes) {
    const actual = readPreference(face)
    assert(actual === expected, `${label} read as ${actual}, expected ${expected}`)
  }
  return 'missing field, missing getter, a throwing getter and a null snapshot all read as on'
})

check('a host word is used only when it is a real translation', () => {
  // A namespace-less host answers with the key itself; treating that as a
  // translation is how `copySource` once reached a button. The guard is executed
  // here: inverting its test left a plain substring search green.
  const source = readCode('src/client/i18n.js')
  const body = functionBody(source, 'function isResolved(value, key) {')
  assert(body, 'i18n.js has no isResolved()')
  const isResolved = new Function(body + '\nreturn isResolved;')()
  const cases = [
    ['a real translation', '复制源码', 'copySource', true],
    ['the key echoed back', 'copySource', 'copySource', false],
    ['the namespaced key echoed back', 'dyslexia.copySource', 'copySource', false],
    ['a blank answer', '   ', 'copySource', false],
    ['an unfilled placeholder', 'Copy {{what}}', 'copySource', false],
    ['a non-string answer', 5, 'copySource', false],
  ]
  for (const [label, value, key, expected] of cases) {
    const actual = isResolved(value, key)
    assert(actual === expected, `${label} was accepted as a translation (${String(actual)})`)
  }
  return 'echoes, blanks, placeholders and non-strings are refused; a real sentence is used'
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
    'settingFailed',
    'settingHint',
    'settingLabel',
    'settingSaved',
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

function sourceFingerprintWith(engine) {
  // Same normalisation as the builder: CRLF and LF checkouts must agree.
  const fragments = ['styles.js', 'i18n.js', 'figure.js', 'view.js', 'settings.js', 'entry.js'].map((name) =>
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
  hash.update(engine)
  hash.update('\u0000')
  return hash.digest('hex').slice(0, 32)
}

// The engine bundle is embedded in the chunk too; leaving it out of the digest
// would let two different chunks carry the same banner.
const ENGINE_TEXT = read('vendor/pele/pele.global.js').replace(/\r\n/g, '\n')

function sourceFingerprint() {
  return sourceFingerprintWith(ENGINE_TEXT)
}

// The builder exports its assembly, so the committed chunk can be compared with
// the bytes these sources produce, not just with the fingerprint it carries.
const builder = await import(pathToFileURL(join(ROOT, 'scripts', 'build-client.mjs')).href)

function describeDifference(actual, expected) {
  const limit = Math.min(actual.length, expected.length)
  let at = 0
  while (at < limit && actual[at] === expected[at]) at += 1
  const from = Math.max(0, at - 24)
  const sample = (text) => JSON.stringify(text.slice(from, at + 48))
  return `first difference at character ${at} of ${expected.length}: on disk ${sample(actual)}, rebuilt ${sample(expected)}`
}

check('client.js matches the sources it claims', () => {
  const expected = sourceFingerprint()
  const found = /sources sha256:([0-9a-f]{32})/.exec(chunk)
  assert(found, 'client.js carries no source fingerprint')
  assert(found[1] === expected, `client.js is stale: rebuild it (chunk ${found[1]}, sources ${expected})`)
  // The fingerprint only says which sources the banner names: code appended
  // after the banner leaves it untouched. Rebuilding the chunk here proves the
  // body is those sources, byte for byte, not just that it claims to be.
  const rebuilt = builder.buildChunk(ROOT)
  assert(
    rebuilt.chunk === chunk,
    `client.js is not the bytes its sources produce (${Buffer.byteLength(chunk, 'utf8')} bytes on disk vs ${Buffer.byteLength(rebuilt.chunk, 'utf8')} rebuilt; ${describeDifference(chunk, rebuilt.chunk)})`,
  )
  return `${expected}, ${Buffer.byteLength(chunk, 'utf8')} bytes rebuilt from the six sources`
})

check('the fingerprint covers the engine bundle, not only the six client sources', () => {
  const fingerprint = sourceFingerprint()
  const withoutEngine = sourceFingerprintWith('')
  const oneByte = sourceFingerprintWith(ENGINE_TEXT + ' ')
  assert(fingerprint !== withoutEngine, 'the engine bundle does not take part in the fingerprint')
  assert(fingerprint !== oneByte, 'one character added to the engine bundle leaves the fingerprint unchanged')
  assert(ENGINE_TEXT.length > 0, 'the engine bundle is empty')
  return `${ENGINE_TEXT.length} characters of engine inside the digest`
})

check('the lockfile names the version the manifest ships', () => {
  const lock = JSON.parse(read('package-lock.json'))
  const root = (lock.packages && lock.packages['']) || {}
  assert(lock.version === manifest.version, `package-lock.json says ${lock.version}, package.json says ${manifest.version}`)
  assert(
    root.version === manifest.version,
    `the lockfile's root entry says ${root.version}, package.json says ${manifest.version}`,
  )
  return `package-lock.json and package.json both ${manifest.version}`
})

check('the two host-side resources are handed to ctx.effect as disposables', () => {
  const entry = readCode('src/client/entry.js')
  assert(/const drop = \(\) => removeFigureStyles\(styleElement\)/.test(entry), 'the stylesheet has no drop of its own')
  assert(
    /ctx\.effect\(\(\) => drop, 'dsh-dyslexia: figure styles'\)/.test(entry),
    'the stylesheet drop is not returned from a ctx.effect setup',
  )
  assert(
    /ctx\.effect\(register, 'dsh-dyslexia: figure strings'\)/.test(entry),
    'the locale registration is not handed to ctx.effect, so nothing can unregister it',
  )
  return 'stylesheet and strings both registered as effects that return a disposer'
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
  return 'label is a noun, role="img" on the svg, copy result announced; behaviour is asserted by the fixture'
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
  return 'objects, functions and mixed arrays fall back to the source text; behaviour is asserted by the fixture'
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
  return 'the engine owns re-layout; every swapped drawing node and its zoom buttons are renamed, strings follow the language; behaviour is asserted by the fixture'
})

check('a host block that throws cannot empty the message', () => {
  const view = readCode('src/client/view.js')
  assert(view.includes('class SafeChildren extends React.Component'), 'the host block is rendered unguarded')
  assert(view.includes('function hostBlock(children, code)'), 'no single entry point for the host block')
  assert(!/Symbol\.iterator/.test(view), 'an iterable is still passed through to React unchecked')
  assert(view.includes('sourceFallback(this.props.code)'), 'the guarded block has no plain-text floor')
  return 'host blocks render inside their own boundary, with the source text as the floor; behaviour is asserted by the fixture'
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
  // The root used to carry `visual-first-agents-snippet.md`, a paragraph to paste
  // into AGENTS.md: exactly the mechanism this feature replaces. Deleting it is
  // part of the promise, so a copy left at the root would be the same ask again.
  const stale = 'visual-first-agents-snippet.md'
  assert(!existsSync(join(ROOT, stale)), `${stale} is back at the root, asking for an AGENTS.md preference`)
  return `${shipped.length} shipped text files, no instruction-file ask, no ${stale} at the root`
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
  const text = textOf(section)
  assert(typeof text === 'string' && text.trim().length > 0, 'the section has no text')
  return `${section.name}, order ${section.order}, ${text.trim().split(/\s+/).length} words`
})

check('the settings page is claimed with auto off, once per context', () => {
  // Without this call DSH would also auto-generate a page for the plugin's Config,
  // so the reader would meet two pages for one setting. Nothing else looks at it.
  const calls = []
  const host = {
    systemPrompt: { section: () => () => undefined },
    fiber: 'the-context-fiber',
    inject(services, callback) {
      assert(Array.isArray(services) && services.includes('settings'), `inject asked for ${JSON.stringify(services)}`)
      callback({
        effect(setup) {
          const stop = setup()
          return typeof stop === 'function' ? stop : () => undefined
        },
        settings: {
          configure(options, owner) {
            calls.push([options, owner])
          },
        },
      })
    },
  }
  hostHalf.apply(host)
  assert(calls.length === 1, `${calls.length} configure calls for one context`)
  const [options, owner] = calls[0]
  assert(options && options.auto === false, `configure got ${JSON.stringify(options)}`)
  assert(owner === host.fiber, 'configure was not given the context fibre')

  const asked = []
  hostHalf.apply({
    systemPrompt: { section: () => () => undefined },
    inject(services, callback) {
      asked.push(services)
      callback({ effect(setup) { setup() } })
    },
  })
  assert(asked.length === 1 && calls.length === 1, 'a host without a settings service still configured a page')

  let threw = null
  try {
    hostHalf.apply({
      systemPrompt: { section: () => () => undefined },
      inject() {
        throw new Error('inject exploded')
      },
    })
  } catch (error) {
    threw = error
  }
  assert(threw === null, `a throwing inject escaped apply: ${threw && threw.message}`)
  return `configure(${JSON.stringify(options)}) on the calling context`
})

check('a context is claimed only once a section is registered', () => {
  // A context claimed before the host hands over `systemPrompt` never got its
  // briefing, even when the service arrived a moment later: the claim was taken
  // and the early return kept it. The claim now follows the guard.
  const source = readCode('index.js')
  const guardAt = source.indexOf("typeof prompt.section !== 'function') return")
  assert(guardAt !== -1, 'index.js no longer guards the missing systemPrompt')
  const claimAt = source.indexOf('claimed.add(ctx)', guardAt)
  assert(claimAt !== -1, 'index.js does not claim the context after the guard')
  const before = source.slice(0, guardAt)
  assert(before.lastIndexOf('claimed.add(ctx)') === -1 || before.lastIndexOf('claimed.add(ctx)') < source.indexOf('export function apply'), 'index.js still claims the context before a section is registered')
  return 'the claim is taken after a section exists, so a host that gains systemPrompt later still gets its briefing'
})

check('the host half adds one section per context, not one per call', () => {
  const sections = []
  const ctx = {
    systemPrompt: {
      section(def) {
        sections.push(def)
        return () => undefined
      },
    },
  }
  hostHalf.apply(ctx)
  hostHalf.apply(ctx)
  hostHalf.apply(ctx)
  assert(sections.length === 1, `three applies on one context added ${sections.length} sections`)
  const other = {
    systemPrompt: {
      section(def) {
        sections.push(def)
        return () => undefined
      },
    },
  }
  hostHalf.apply(other)
  assert(sections.length === 2, `a second context added ${sections.length - 1} sections`)
  // A first attempt that the host rejects must not burn the context: the host may retry.
  let attempts = 0
  const flaky = {
    systemPrompt: {
      section() {
        attempts += 1
        if (attempts === 1) throw new Error('the host refused the first attempt')
        return () => undefined
      },
    },
  }
  hostHalf.apply(flaky)
  assert(attempts === 1, `a failing section was called ${attempts} times`)
  hostHalf.apply(flaky)
  assert(attempts === 2, `a retry after a failure did not reach the host (${attempts} attempts)`)
  // A host may refuse asynchronously. The refusal arrives after `apply` returned,
  // so the branch that catches it has to release the context itself.
  let lateAttempts = 0
  const late = {
    systemPrompt: {
      section() {
        lateAttempts += 1
        if (lateAttempts === 1) {
          return { then(ok, no) { no(new Error('the host refused the first attempt later')) } }
        }
        return { then() {} }
      },
    },
  }
  const heard = []
  const originalWarn = console.warn
  console.warn = (...args) => heard.push(args.join(' '))
  try {
    hostHalf.apply(late)
    assert(lateAttempts === 1, `a refusing section was called ${lateAttempts} times`)
    hostHalf.apply(late)
  } finally {
    console.warn = originalWarn
  }
  assert(lateAttempts === 2, `an async refusal burned the context (${lateAttempts} attempts)`)
  assert(heard.length === 1 && /refused the first attempt later/.test(heard[0]), `the async refusal was reported ${heard.length} times: ${heard.join(' | ')}`)
  // A thenable may also throw from `.then` itself, and then the rejection handler
  // never runs: the refusal is only visible to the `catch` around that call, so
  // that branch has to release the context too or the context is burned for good.
  let thenableAttempts = 0
  const hostile = {
    systemPrompt: {
      section() {
        thenableAttempts += 1
        if (thenableAttempts === 1) {
          return {
            then() {
              throw new Error('the host refused while its promise was being watched')
            },
          }
        }
        return { then() {} }
      },
    },
  }
  const heardFromThenable = []
  const originalWarnForThenable = console.warn
  console.warn = (...args) => heardFromThenable.push(args.join(' '))
  let thenableThrew = null
  try {
    hostHalf.apply(hostile)
  } catch (error) {
    thenableThrew = error
  }
  try {
    hostHalf.apply(hostile)
  } catch (error) {
    thenableThrew = thenableThrew || error
  } finally {
    console.warn = originalWarnForThenable
  }
  assert(
    thenableThrew === null,
    `a thenable that threw out of .then escaped apply: ${thenableThrew && thenableThrew.message}`,
  )
  assert(thenableAttempts === 2, `a thenable that threw out of .then burned the context (${thenableAttempts} attempts)`)
  assert(
    heardFromThenable.length === 1 && /refused while its promise was being watched/.test(heardFromThenable[0]),
    `the throwing thenable was reported ${heardFromThenable.length} times: ${heardFromThenable.join(' | ')}`,
  )
  return 'three calls on one context, one section; a second context gets its own; a failed attempt still allows a retry, whether the host refused at once, later, or by throwing out of .then'
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
  // Two refused sections must each be reported once, naming the failure — a
  // silent skip would leave the model uninformed with nothing in the log.
  const refused = []
  const originalWarn = console.warn
  console.warn = (...args) => refused.push(args.join(' '))
  try {
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
          return { then(ok, no) { no(new Error('asynchronous failure')) } }
        },
      },
    })
  } finally {
    console.warn = originalWarn
  }
  assert(refused.length === 2, `two refused sections produced ${refused.length} warnings: ${refused.join(' | ')}`)
  assert(/system prompt service changed/.test(refused[0]), `the first warning does not name the failure: ${refused[0]}`)
  assert(/asynchronous failure/.test(refused[1]), `the second warning does not name the failure: ${refused[1]}`)
  return 'five silent hosts (no warning), two refused sections (one warning each, naming the error)'
})

/* ------------------------------------------- the fixtures can fail at all */

check("the contract's colour variables are the ones that are wired", () => {
  // 001 recorded the first nine lines; 003 owns the mapping now (it changed two
  // of them and added the author-ink pair), so the current contract is read from
  // 003 and 001's names are still demanded as a subset: a rename or a removed
  // engine variable goes red on either side.
  const legacy = readFileSync(
    join(ROOT, 'specs', '001-mermaid-fence-render', 'contracts', 'client-fence-layer.md'),
    'utf8',
  )
  const owner = readFileSync(
    join(ROOT, 'specs', '003-diagram-palette-contrast', 'contracts', 'palette-mapping.md'),
    'utf8',
  )
  // The contract's own wiring block, not the whole document: prose around it
  // quotes variables too, and a quoted line must not be mistaken for the map.
  const block = /```css\n([\s\S]*?)```/.exec(owner.slice(owner.indexOf('## 5. 变量接线')))
  assert(block !== null, "003's contract has no fenced wiring block")
  const contract = block[1]
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
  const earlier = pairOf(legacy)
  const dropped = [...earlier.keys()].filter((name) => !wanted.has(name))
  assert(dropped.length === 0, `003 dropped engine variables 001 promised: ${dropped.join(', ')}`)
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

check('only the expected refusal stays quiet, and only for the service asked for', () => {
  // The host answers an undeclared read with `cannot get property "…" without
  // inject`, and that is the path this module plans for — reporting it warned in
  // every console on every start. The filter is exercised rather than grepped:
  // a sentence that merely borrows the same words about *another* service is a
  // fault, and swallowing it would hide a real one.
  const entry = readCode('src/client/entry.js')
  const refused = functionBody(entry, 'function refusedOptional(name, error) {')
  const body = functionBody(entry, 'function optional(ctx, name) {')
  assert(refused, 'entry.js has no refusedOptional() reader')
  assert(body, 'entry.js has no optional() reader')
  const reports = []
  const optional = new Function('report', refused + '\n' + body + '\nreturn optional;')((label) => reports.push(label))
  const refusal = (name) => new Error('cannot get property "' + name + '" without inject')
  const strict = {
    get(name) {
      throw refusal(name)
    },
    get locale() {
      throw refusal('locale')
    },
  }
  assert(optional(strict, 'locale') === undefined, 'a refusal left a value behind')
  assert(reports.length === 0, 'the expected refusal was reported: ' + reports.join(', '))
  const foreign = {
    get() {
      throw refusal('remote')
    },
  }
  optional(foreign, 'locale')
  assert(reports.length === 1 && reports[0] === 'locale via get', "another service's refusal was swallowed: " + reports.join(', '))
  const broken = {
    get() {
      throw new Error('the service store is gone')
    },
  }
  optional(broken, 'locale')
  assert(reports.length === 2 && reports[1] === 'locale via get', 'a real fault was swallowed by the refusal filter')
  return 'the expected refusal is silent; a borrowed sentence about another service and a real fault are reported'
})

check('a fence that failed comes back when its source changes', () => {
  // Without this, one bad edit left the message failed for good: the reader
  // fixed the text and the layer never retried.
  const view = readCode('src/client/view.js')
  const body = functionBody(view, 'componentDidUpdate(previous) {')
  assert(body, 'view.js has no componentDidUpdate()')
  assert(/this\.state\.failed && before !== now/.test(body), 'the boundary no longer notices a new source')
  assert(/setState\(\{ failed: false \}\)/.test(body), 'the failed state is never cleared')
  return 'a failed drawing is retried when the host hands over new source'
})

check('a missing engine is told apart from a broken diagram', () => {
  // Three causes, three sentences, and the mapping is executed rather than read:
  // a grep kept this green while the reader's sentence for a missing engine was
  // replaced by the syntax sentence (twelfth review).
  const figure = readCode('src/client/figure.js')
  const codeConstant = figure.match(/const ENGINE_UNAVAILABLE = '([^']+)'/)
  assert(codeConstant, 'figure.js has no ENGINE_UNAVAILABLE value')
  const body = functionBody(figure, 'function figureErrorKind(error) {')
  assert(body, 'figure.js has no figureErrorKind()')
  const kind = new Function('ENGINE_UNAVAILABLE', `return (${body})(arguments[1])`).bind(null, codeConstant[1])
  const missing = new Error('drawing engine unavailable')
  missing.code = codeConstant[1]
  assert(kind(missing) === 'unavailable', 'a missing engine is not classified as unavailable')
  assert(kind(new Error('Parse error on line 2 of the diagram')) === 'syntax', 'a parse error is not classified as syntax')
  assert(kind(new Error('something else broke')) === 'other', 'an unknown failure is not classified as other')
  assert(kind(null) === 'other', 'no error at all is not classified as other')

  // The sentence the reader sees has to follow that classification.
  const view = readCode('src/client/view.js')
  const start = view.indexOf('const noteText =')
  assert(start !== -1, 'view.js has no note sentence')
  const stop = view.indexOf('\n\n', start)
  assert(stop !== -1, 'the note sentence cannot be cut out of view.js')
  const mapping = view.slice(start, stop).trim()
  const noteFor = new Function('reasonKind', 'translate', `${mapping}\nreturn noteText`)
  assert(noteFor('syntax', (key) => key) === 'syntaxError', 'a syntax error does not reach the syntax sentence')
  assert(noteFor('unavailable', (key) => key) === 'engineUnavailable', 'a missing engine does not reach its own sentence')
  assert(noteFor('other', (key) => key) === 'renderFailed', 'any other failure does not reach the catch-all sentence')

  // And the three sentences stay distinct in every language the plugin ships.
  const i18n = readCode('src/client/i18n.js')
  const at = i18n.indexOf('const DICTIONARY = ')
  assert(at !== -1, 'i18n.js has no DICTIONARY')
  const open = i18n.indexOf('{', at)
  let depth = 0
  let end = -1
  for (let i = open; i < i18n.length; i += 1) {
    if (i18n[i] === '{') depth += 1
    if (i18n[i] === '}') {
      depth -= 1
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  assert(end !== -1, 'the dictionary cannot be cut out of i18n.js')
  const dictionary = new Function(`return ${i18n.slice(open, end)}`)()
  const languages = Object.keys(dictionary)
  assert(languages.length === 8, `the dictionary carries ${languages.length} languages, expected 8`)
  const collisions = []
  for (const language of languages) {
    const table = dictionary[language]
    const sentences = [table.engineUnavailable, table.syntaxError, table.renderFailed]
    if (!sentences.every((sentence) => typeof sentence === 'string' && sentence.length > 0)) {
      collisions.push(`${language}: missing sentence`)
    } else if (new Set(sentences).size !== 3) {
      collisions.push(`${language}: two causes share one sentence`)
    } else if (/^(zh|ja|ru)$/.test(language) && sentences.some((sentence) => /[A-Za-z]{2,}/.test(sentence))) {
      collisions.push(`${language}: a Latin word sits inside a translated sentence`)
    }
  }
  assert(collisions.length === 0, collisions.join('; '))
  return `three causes, three sentences in ${languages.length} languages`
})

check('an unsupported language falls back to english', () => {
  // A reader whose host speaks a language this plugin does not know must get
  // english, not whichever neighbour happened to be first in the table.
  const i18n = readCode('src/client/i18n.js')
  assert(/LANGUAGE_CODES\.indexOf\(base\) === -1 \? 'en' : base/.test(i18n), 'the fallback language is not english')
  return 'a language the plugin does not speak gets english'
})

check('the settings page claim can be taken back', () => {
  // `configure({ auto: false })` has to run inside `ctx.effect`, otherwise a
  // disposed plugin keeps the page it claimed while it was loaded.
  const host = readCode('index.js')
  assert(
    /child\.effect\(\(\) => child\.settings\.configure\(\{ auto: false \}, ctx\.fiber\)\)/.test(host),
    'configure is called outside an effect, so the claim is never released',
  )
  return 'the opt-out runs inside ctx.effect, so it is released when the plugin goes'
})

check('a host without react gets a silent module, not nothing', () => {
  // The loader factory is the only door the host has. Returning null there would
  // crash on `.apply`, and no fixture loads the chunk with a failing require.
  const stub = 'if (!React) return { apply: function () {}, inject: [] }'
  const builder = readFileSync(join(ROOT, 'scripts', 'build-client.mjs'), 'utf8')
  assert(builder.includes(stub), 'the builder no longer emits the react-less stub')
  const chunk = readCode('client.js')
  assert(chunk.includes(stub), 'the shipped chunk has no react-less stub')
  return 'a host whose react is missing receives a module that does nothing, not null'
})

check('a new write clears the sentence the last one left', () => {
  // Pressing the switch again after "Saved" has to start silent; otherwise the
  // old answer stands next to a write that has not been answered yet.
  const settings = readCode('src/client/settings.js')
  const body = functionBody(settings, 'function choose(next) {')
  assert(body, 'settings.js has no choose()')
  const reset = body.indexOf("setState('idle')")
  const write = body.indexOf('injected.setValue(next)')
  assert(reset !== -1, 'a new write no longer resets the sentence')
  assert(write !== -1, 'the write call moved out of choose()')
  assert(reset < write, 'the sentence is reset after the write starts, so the old one lingers')
  return 'a second press starts silent, then says what happened'
})

check('the engine is asked for the direction and the size it needs', () => {
  const figure = readCode('src/client/figure.js')
  const wanted = [
    [/autoDirection:\s*true/, 'the engine is not told to lay the diagram out by itself'],
    [/directionBreakpoint:\s*640/, 'the width where the direction flips is not 640'],
    [/padding:\s*8/, 'the padding around the drawing is not 8'],
    [/responsive:\s*true/, 'the drawing is not told to follow its column'],
    [/zoom:\s*\{\s*controls:\s*true,\s*maxScale:\s*4,\s*labels\s*\}/, 'the zoom controls are not asked for with their labels'],
    [/fontSize:\s*figureFontSize\(doc\)/, 'the font size is not read from the page'],
  ]
  const missing = wanted.filter(([pattern]) => !pattern.test(figure)).map(([, why]) => why)
  assert(missing.length === 0, missing.join('; '))
  return `${wanted.length} engine options pinned to the values the contract promises`
})

check('the network spy records every call, without a filter', () => {
  const harness = readFileSync(join(ROOT, 'verify', 'harness', 'index.html'), 'utf8')
  const note = functionBody(harness.slice(harness.indexOf('window.__netCalls = []')), 'const note = (name) => {')
  const pushes = harness.split('__netCalls.push').length - 1
  assert(pushes === 1, `the fixture pushes into the call log ${pushes} times, so a filter can hide one`)
  assert(/window\.__netSeen\s*\+=\s*1/.test(note), 'the spy keeps no count of its own')
  assert(/window\.__netCalls\.push\(name\)/.test(note), 'the spy keeps a call log of its own')
  assert(!/\bif\b|\btest\s*\(|\.filter\s*\(|\.some\s*\(/.test(note), 'the spy only records some calls')
  return 'one unconditional push, one independent count'
})

check('the fixtures assert what the fixes promise, and can fail', () => {
  // Comments are stripped before scanning: a decoy name inside a `//` comment, or
  // an emptied assertion body, must not keep this check green.
  const harness = readFileSync(join(ROOT, 'verify', 'harness', 'index.html'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  const needed = [
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
    'a host with configForms takes the section without throwing',
    'the section registers on the settings navigation and nowhere else',
    'the row label is our own sentence, not a host key',
    'the switch shows the value the host reports',
    'the switch is named and described by the visible sentences',
    'the switch keeps the keyboard',
    'one click asks the host for the opposite value once',
    'a rejected write leaves the switch where the host put it',
    'a host without configForms gets the picture and no settings row',
    'a host whose face has no setter hands the row no writer at all',
    'a refused write that resolves false puts the switch back and says so',
    'a refused write keeps the value the host took while it was pending',
    'a value the host pushes reaches the switch without a write',
    'a thenable that throws out of then cannot break the click',
    'a host that gains configForms after apply still gets the settings section',
    'a host that refuses undeclared services is not warned about',
    "[${lang}] the settings row label is that language's own sentence",
    "[${lang}] the settings row hint is that language's own sentence",
  ]
  const NEEDED_COUNT = 43
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
  // `typeof CODE === 'string'` reads a fixture constant and is true whatever the
  // product does, and `CODE.length > 0` is the same trick with a property. Any
  // condition whose left side is a constant and whose right side is a literal is
  // treated as hollow, however much it looks like a comparison.
  // The head loses the closing quote of the last string when the name argument is
  // stripped, so both spellings are tried: `typeof CODE === 'string` and the same
  // with the quote closed.
  const constantOnly = (head) => {
    const forms = [head, `${head}'`, `${head}"`]
    // A chain of string methods on a fixture constant (`CODE.toLowerCase().length > 0`)
    // reads the constant and is true whatever the product does, so it joins the
    // constant comparisons below.
    const chain = /^[A-Z][A-Z0-9_$]*(\s*\.\s*(?:toLowerCase|toUpperCase|trim|trimStart|trimEnd|slice|substring|split|replace|replaceAll|concat|normalize|padStart|padEnd|repeat|charAt|toString)\s*\([^()]*\))+(\s*\.\s*length)?\s*(===|!==|>=|<=|>|<)\s*(-?\d+|'[^']*'|true|false)$/
    return forms.some(
      (form) =>
        /^typeof\s+[A-Z][A-Z0-9_$]*\s*(===|!==)\s*'[a-z]+'$/.test(form) ||
        /^[A-Z][A-Z0-9_$]*(\.[\w$]+)*(\.length)?\s*(===|!==|>=|<=|>|<)\s*(-?\d+|'[^']*'|true|false)$/.test(form) ||
        chain.test(form),
    )
  }
  // A truthiness test alone cannot say what went wrong: `!!CODE` reads a fixture
  // constant and is true whatever the product does. A condition has to compare
  // something or query something, so a bare `!!x` no longer counts as a check.
  const comparesOrQueries = (head) =>
    /(===|!==|>=|<=|\.includes\(|\.test\(|\.some\(|\.every\(|\.filter\(|\.length|\.match\(|\.indexOf\(|\.getAttribute\(|\.hasAttribute\(|\.querySelector|\.getBoundingClientRect\(|\.clientWidth|\.textContent|\s[<>]\s)/.test(
      head,
    )
  const constantBranch = new RegExp(
    [
      '\\|\\|\\s*(?:true|1|!0|"")',
      '&&\\s*(?:true|1|!0|"")',
      '\\|\\|\\s*(?:false|0|null|undefined|"")',
      '&&\\s*(?:false|0|null|undefined|"")',
      '\\?\\s*[^:]*:\\s*(?:true|false)\\b',
    ].join('|'),
  )
  // An identifier bound to a literal in the same file is a constant whatever its
  // case, so `const alive = true; expect(!!alive === true, ...)` is caught too.
  const literalBound = [...new Set([...harness.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:true|false|null|-?\d+(?:\.\d+)?|'[^']*'|"[^"]*"|`[^`]*`)\s*(?![+\-*/%]|&&|\|\|)/g)].map((hit) => hit[1]))]
    .filter((name) => !/^(?:CODE|LANGS|LANGS_|EXACT)/.test(name))
    .map((name) => name.replace(/[$]/g, '\\$'))
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
      !comparesOrQueries(head) ||
      selfComparison(head) ||
      // `!!CONST === true` and `[CONST].length > 0` read a fixture constant and are
      // true whatever the product does; the negations and arrays around a real read stay.
      // The name does not have to be upper case: any identifier this file binds to a
      // literal is a constant too, so `const alive = true` joins the list.
      /^(?:!!?\s*[A-Za-z_$][\w$]*\s*(?:===|!==)|\[\s*[A-Za-z_$][\w$]*\s*\](?:\s*\.\s*length)?\s*(?:===|!==|>=|<=|>|<))/.test(head) ||
      literalBound.some(
        (name) =>
          new RegExp(
            '^(?:!!?\\s*' + name + '\\s*(?:===|!==)|\\[\\s*' + name + '\\s*\\](?:\\s*\\.\\s*length)?\\s*(?:===|!==|>=|<=|>|<)|typeof\\s+' + name + '\\s*(?:===|!==))',
          ).test(head),
      ) ||
      constantBranch.test(head) ||
      constantOnly(head)
    )
  })
  if (hollow.length > 0) throw new Error(`fixture assertions without a condition: ${hollow.join(', ')}`)
  return `${needed.length} assertions present, each with a condition that reads something`
})

check('every class the row writes has a rule in the stylesheet', () => {
  const settings = read('src/client/settings.js')
  const styles = read('src/client/styles.js')
  const names = new Set()
  for (const hit of settings.matchAll(/className:\s*'([^']+)'/g)) {
    for (const part of hit[1].split(/\s+/)) if (part) names.add(part)
  }
  assert(names.size > 0, 'settings.js writes no class at all')
  const css = styles.replace(/\s+/g, ' ')
  const missing = [...names].filter((name) => !new RegExp('\\.' + name + '(?![\\w-])').test(css))
  assert(missing.length === 0, `no stylesheet rule for ${missing.join(', ')}`)
  // A state written by the row and styled nowhere is a promise the stylesheet
  // makes and no code keeps (a refused write was announced but never coloured),
  // so both halves are demanded — and named, because a loop over whatever
  // happens to be written stays green when the write is deleted.
  const states = [...settings.matchAll(/'(data-[a-z-]+)':/g)].map((hit) => hit[1])
  assert(states.indexOf('data-failed') !== -1, 'the row never marks a refused write')
  // The attribute name alone proves nothing: a marker written as a constant is a
  // dead selector. The value has to be the state, so the refusal colours itself.
  assert(
    /'\s*data-failed\s*'\s*:\s*state\s*===\s*'failed'\s*\?\s*'true'\s*:\s*'false'/.test(settings),
    'the refused marker never follows the state',
  )
  assert(settings.indexOf("'aria-live': 'polite'") !== -1, 'the status sentence is never announced')
  assert(settings.indexOf("role: 'status'") !== -1 || settings.indexOf('role: "status"') !== -1, 'the status sentence is not a status region')
  for (const state of states) {
    assert(css.includes(`[${state}="true"]`), `settings.js writes ${state} and no rule styles it`)
  }
  return `${names.size} classes, each with a rule; ${states.length} data-state(s), each styled`
})

/* ------------------------------------------------- feature 003: colour */

// The palette promise is split between a stylesheet, a fixture and a preview,
// and each half can rot silently: a stylesheet that names a hex value still
// looks right in one theme, a fixture that hand-types a token still passes its
// own assertions, and a preview drawn from an invented palette still renders.
// These checks read the three of them against the host snapshot.
// The engine's own shape table is the list of shapes a reader can ask for, so
// it is also the list the stylesheet has to cover: a shape added to the engine
// fails here until the plugin paints it, instead of turning up as a grey box.
const engineSource = () => readFileSync(join(ROOT, 'vendor', 'pele', 'pele.global.js'), 'utf8')
const SHAPE_CLASSES = (() => {
  const engine = engineSource()
  const at = engine.indexOf('var G_=[[\"rect\"')
  assert(at >= 0, 'the engine shape table is gone: the guard has lost its source')
  const end = engine.indexOf(']]', at)
  const table = engine.slice(at, end + 2)
  const names = [...table.matchAll(/\[\"([a-z0-9-]+)\"/g)].map((match) => match[1])
  assert(names.length > 20, `the engine shape table reads as ${names.length} shapes, which cannot be right`)
  return names
})()

// Every diagram type the engine registers, and what the fixture draws for it.
// A new type has to be sampled in the fixture or listed here with the reason it
// cannot be: the point is that nobody has to notice a grey box in the chat.
const TYPE_SAMPLES = {
  flowchart: 'flowchart LR',
  mindmap: 'mindmap',
  architecture: 'architecture-beta',
  agentflow: 'agentflow-beta',
  c4: 'C4Context',
  kanban: 'kanban',
  class: 'classDiagram',
  er: 'erDiagram',
  gantt: 'gantt',
  info: "info: 'info'",
  pie: 'pieDiagram: PIE_CODE',
  requirement: 'requirementDiagram',
  sequence: 'sequenceDiagram',
  timeline: 'timeline',
  gitGraph: 'gitGraph',
  state: 'stateDiagram-v2',
  journey: 'journey',
  quadrantChart: 'quadrantChart',
  sankey: 'sankey-beta',
  packet: 'packet-beta',
  xychart: 'xychart',
  block: 'block-beta',
  radar: 'radar-beta',
  ishikawa: 'ishikawa',
  treemap: 'treemap',
  wardley: 'wardley-beta',
  cynefin: 'cynefin-beta',
}

const TYPE_NOT_SAMPLED = {
  swimlane: 'its grammar refuses every sample that was tried: `Expecting NODE_STRING`',
  eventmodeling: 'its grammar refuses every sample that was tried: `Expecting token of type EM_ID`',
  treeView: 'the engine registers the name but its lexer matches no header',
  venn: 'its grammar refuses every sample that was tried: `Expecting TITLE, SET`',
  usecase: 'no diagram type is detected for any sample that was tried',
  railroad: 'its grammar refuses every sample that was tried: `No diagram type detected`',
}

/**
 * The stylesheet as CSS: `FIGURE_CSS` is a JS array joined with newlines, so
 * reading the source text would compare quotes, commas and string boundaries
 * instead of selectors and declarations. Evaluating that one literal (no other
 * code from the file runs) gives the text the browser actually receives.
 */
function figureCss() {
  const styles = stripComments(read('src/client/styles.js'))
  const start = styles.indexOf('const FIGURE_CSS = [')
  assert(start !== -1, 'styles.js no longer declares FIGURE_CSS')
  const open = styles.indexOf('[', start)
  let depth = 0
  let end = open
  for (; end < styles.length; end += 1) {
    if (styles[end] === '[') depth += 1
    else if (styles[end] === ']') {
      depth -= 1
      if (depth === 0) break
    }
  }
  const literal = styles.slice(open, end + 1)
  const consts = {}
  for (const match of styles.matchAll(/^const ([A-Z_]+) = '([^']*)'/gm)) consts[match[1]] = match[2]
  return new Function(...Object.keys(consts), `return ${literal}`)(...Object.values(consts)).join('\n')
}

function cssBlocks(text) {
  const blocks = []
  const pattern = /([^{}]+)\{([^{}]*)\}/g
  let match = pattern.exec(text)
  while (match) {
    blocks.push({ selector: match[1].trim(), body: match[2] })
    match = pattern.exec(text)
  }
  const rest = pattern.exec(text)
  return rest === null ? blocks : blocks
}

check('the stylesheet colours nothing of its own', () => {
  const styles = stripComments(read('src/client/styles.js'))
  // A literal colour is a second theme: it cannot follow the host, and in one of
  // the two themes it is wrong. The one place a literal may appear is the
  // fallback slot of a host token — `var(--dsw-…, #1f1f1f)` — which is only ever
  // read when the host has no tokens at all (FR-007), never in its place.
  const fallback = [
    /var\(\s*--[a-z0-9-]+\s*,\s*rgba?\([^)]*\)\s*\)/g,
    /var\(\s*--[a-z0-9-]+\s*,\s*#[0-9a-fA-F]{3,8}\s*\)/g,
  ]
  const scrubbed = fallback.reduce((text, pattern) => text.replace(pattern, 'fallback'), styles)
  const literals = scrubbed.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch?\(|\blab\(|\blch\(/g) || []
  assert(literals.length === 0, `the stylesheet writes ${literals.length} colour(s) outside a host-token fallback: ${literals.join(', ')}`)
  return 'every literal sits in the fallback slot of a host token'
})

check('every host token keeps the engine default behind it', () => {
  // FR-007: a host that hands over no tokens must still get a picture. A bare
  // `var(--dsw-…)` turns invalid at computed-value time instead of falling back,
  // so the shape loses its fill and inherits the text ink — black boxes.
  const styles = stripComments(read('src/client/styles.js'))
  // Only the palette that reaches the engine: the settings row and the buttons
  // are host chrome, and a host with no tokens has no chrome to match either.
  const palette = styles
    .split('\n')
    .filter((line) => /--(pele|dx)-[a-z-]+:/.test(line))
    .join('\n')
  const used = [...palette.matchAll(/var\(\s*(--dsw-[a-z0-9-]+)\s*(,)?/g)]
  const bare = used.filter((match) => !match[2]).map((match) => match[1])
  assert(used.length >= 16, `the palette wires only ${used.length} host tokens`)
  assert(bare.length === 0, `these host tokens have no engine default: ${[...new Set(bare)].join(', ')}`)
  return `${used.length} host-token uses, each with a default of its own`
})

check('the stylesheet never shouts and never reaches outside the figure', () => {
  const styles = stripComments(read('src/client/styles.js'))
  assert(!styles.includes('!important'), '!important would beat an author classDef written inline')
  assert(!/[\s,{]body[\s,{]/.test(styles), 'the stylesheet styles body')
  assert(!/html[\s,{]/.test(styles), 'the stylesheet styles html')
  assert(!/\[data-ds-dark-theme\]/.test(styles), 'the stylesheet knows the host dark attribute, which is the second theme it must not build')
  return 'no !important, no body/html selector, no dark-theme attribute'
})

check('every shape class has a role rule of its own', () => {
  const styles = read('src/client/styles.js')
  const bare = SHAPE_CLASSES.filter((name) => !new RegExp(`\\.pele-shape-${name}(?![\\w-])`).test(styles))
  assert(bare.length === 0, `no role rule for ${bare.join(', ')}`)
  // A selector that names a class the engine never emits is a rule for nothing:
  // anchoring the names to the engine keeps a typo from looking like coverage.
  // The engine builds the class with a template (`pele-shape-${shape}`), so the
  // names live in its shape table as quoted strings, not next to the prefix.
  const engine = readFileSync(join(ROOT, 'vendor', 'pele', 'pele.global.js'), 'utf8')
  const invented = SHAPE_CLASSES.filter((name) => !engine.includes(`"${name}"`))
  assert(invented.length === 0, `the stylesheet styles shapes the engine never draws: ${invented.join(', ')}`)
  return `${SHAPE_CLASSES.length} shapes, every name known to the engine`
})

check('every diagram type the engine registers is sampled or explained', () => {
  const engine = engineSource()
  const anchor = engine.indexOf('["kanban","kanban"')
  assert(anchor >= 0, 'the engine type registry is gone: the guard has lost its source')
  const at = engine.lastIndexOf('[[', anchor)
  const stop = engine.indexOf(']]', anchor)
  const registry = engine.slice(at, stop + 2)
  const ids = [...registry.matchAll(/\["([A-Za-z][A-Za-z0-9]*)","[^"]+",\s*\/\^/g)].map((match) => match[1])
  assert(ids.length >= 30, `the engine registry reads as ${ids.length} types, which cannot be right`)
  const fixture = read('verify/harness/index.html')
  const drawn = Object.keys(TYPE_SAMPLES).filter((id) => fixture.includes(TYPE_SAMPLES[id]))
  const explained = Object.keys(TYPE_NOT_SAMPLED)
  const missing = ids.filter((id) => drawn.indexOf(id) < 0 && explained.indexOf(id) < 0)
  assert(
    missing.length === 0,
    `the engine draws ${missing.join(', ')} and nothing tests it: sample it in the fixture or say why not`,
  )
  const stale = explained.filter((id) => ids.indexOf(id) < 0)
  assert(stale.length === 0, `the not-sampled list names types the engine no longer has: ${stale.join(', ')}`)
  const unknown = drawn.filter((id) => ids.indexOf(id) < 0)
  assert(unknown.length === 0, `the fixture samples types the engine does not register: ${unknown.join(', ')}`)
  return `${drawn.length} drawn, ${explained.length} explained, ${ids.length} registered`
})

// Class, state, entity, sequence and board diagrams do not draw flowchart shapes:
// their nodes are records, states and participants. They must still be coloured,
// or the reader gets one grey box for every kind of thing in the picture.
const ENTITY_CLASSES = ['pele-state', 'pele-state-start', 'pele-state-end', 'pele-class', 'pele-entity', 'pele-actor-participant', 'pele-card']

check('records, states and participants are coloured too', () => {
  const styles = read('src/client/styles.js')
  const bare = ENTITY_CLASSES.filter((name) => !new RegExp(`\\.${name}(?![\\w-])`).test(styles))
  assert(bare.length === 0, `no role rule for ${bare.join(', ')}`)
  const engine = readFileSync(join(ROOT, 'vendor', 'pele', 'pele.global.js'), 'utf8')
  const invented = ENTITY_CLASSES.filter((name) => {
    const stem = name.split('-').slice(0, 2).join('-')
    return !engine.includes(stem)
  })
  assert(invented.length === 0, `the stylesheet styles nodes the engine never draws: ${invented.join(', ')}`)
  return `${ENTITY_CLASSES.length} record-ish nodes, every stem known to the engine`
})

check('role rules colour the shape and leave the label alone', () => {
  const css = figureCss()
  const coloured = cssBlocks(css).filter((block) => /(^|[\s;])(fill|stroke)\s*:/.test(block.body))
  assert(coloured.length >= 5, `only ${coloured.length} blocks paint a colour`)
  const onText = coloured.filter((block) => /(?:^|[\s,>])(?:text|tspan)(?:[\s,>{:]|$)/.test(block.selector))
  assert(onText.length === 0, `a fill or stroke lands on text: ${onText.map((block) => block.selector).join(' | ')}`)
  const textRules = cssBlocks(css).filter((block) => /(?:^|[\s,>])(?:text|tspan)(?:[\s,>{:]|$)/.test(block.selector))
  const painted = textRules.filter((block) => /(^|[\s;])color\s*:/.test(block.body))
  assert(painted.length === 0, 'a text rule sets color, which the engine already reads from --pele-fg')
  return `${coloured.length} painted blocks, none of them text`
})

check('each role rule keeps a readable fallback before its mixed colour', () => {
  const css = figureCss()
  // Only rules that paint a shape: the variable block also mentions colour-mix,
  // but as a token definition, not as a fill or a stroke.
  const mixed = cssBlocks(css).filter((block) => /(^|[;\n])\s*(fill|stroke)\s*:\s*color-mix\(/.test(block.body))
  assert(mixed.length >= 5, `only ${mixed.length} blocks use colour-mix`)
  for (const block of mixed) {
    const lines = block.body.split(';').map((line) => line.trim()).filter(Boolean)
    const fill = lines.findIndex((line) => line.startsWith('fill: color-mix('))
    const stroke = lines.findIndex((line) => line.startsWith('stroke: color-mix('))
    assert(fill !== -1 && stroke !== -1, `a rule mixes one property only: ${block.selector}`)
    assert(
      lines[fill - 1] === 'fill: var(--pele-surface)',
      `the fill has no plain fallback before it (${lines[fill - 1]})`,
    )
    assert(
      lines[stroke - 1] === 'stroke: var(--pele-border)',
      `the stroke has no plain fallback before it (${lines[stroke - 1]})`,
    )
  }
  return `${mixed.length} rules, each with a plain declaration first`
})

check('the series palette is eight host hues, each mixed into the text ink', () => {
  const styles = stripComments(read('src/client/styles.js'))
  const tokens = []
  for (let index = 1; index <= 8; index += 1) {
    const hit = new RegExp(`--pele-series-${index}:\\s*([^;]+);`).exec(styles)
    assert(hit !== null, `--pele-series-${index} is not declared`)
    const value = hit[1].trim()
    // The engine writes the label of a filled area in the canvas colour, so a
    // series colour must be pushed towards the text ink to be readable as both
    // a fill and an outline in either theme.
    const mix = /^color-mix\(in srgb, var\((--dsw-[a-z0-9-]+), [^)]*\) 55%, var\(--pele-fg, [^)]*\)\)$/.exec(value)
    assert(mix !== null, `--pele-series-${index} is not a host hue mixed into the ink: ${value}`)
    tokens.push(mix[1])
  }
  assert(new Set(tokens).size === 8, `the eight series repeat a host hue: ${tokens.join(', ')}`)
  return 'eight series, eight host hues, all mixed into the ink'
})

check('the colours a reader gets are written down where an author can find them', () => {
  // FR-012 asks for the meaning to be documented, so every hue the stylesheet
  // takes from the host is named in docs/colours.md, with the shape it colours.
  const styles = stripComments(read('src/client/styles.js'))
  const doc = read('docs/colours.md')
  const tokens = new Set()
  const pattern = /--(?:dx-hue-[a-z-]+|pele-series-[0-9]+):[^;]*?var\((--dsw-[a-z0-9-]+)/g
  let match = pattern.exec(styles)
  while (match) {
    tokens.add(match[1])
    match = pattern.exec(styles)
  }
  const named = [...tokens].filter((token) => !doc.includes(token))
  assert(tokens.size >= 9, `the stylesheet takes only ${tokens.size} hue tokens`)
  assert(named.length === 0, `docs/colours.md never names ${named.join(', ')}`)
  const shapes = ['stadium', 'diam', 'cyl', 'lean-r', 'rect']
  const undocumented = shapes.filter((shape) => !doc.includes(shape))
  assert(undocumented.length === 0, `docs/colours.md never names the shape ${undocumented.join(', ')}`)
  return `${tokens.size} host hues and five shapes written down in docs/colours.md`
})

check("the preview is drawn with the snapshot's colours, not invented ones", () => {
  const preview = read('scripts/build-preview.mjs')
  assert(preview.includes('host-tokens.json'), 'the preview does not read the host snapshot')
  const literals = preview.match(/#[0-9a-fA-F]{3,8}\b/g) || []
  assert(literals.length === 0, `the preview still writes invented colours: ${literals.join(', ')}`)
  return 'read from verify/host-tokens.json, no hex left'
})

check("the fixture's host tokens are the snapshot's", () => {
  const snapshot = readJson('verify/host-tokens.json')
  const html = read('verify/harness/index.html')
  const blockOf = (selector) => {
    const start = html.indexOf(`${selector} {`)
    assert(start !== -1, `the fixture has no ${selector} block`)
    const end = html.indexOf('}', start)
    return html.slice(start, end)
  }
  const light = blockOf(':root')
  const dark = blockOf('body[data-ds-dark-theme]')
  const missing = []
  for (const [name, value] of Object.entries(snapshot.light)) {
    const wanted = `${name}: ${value};`.replace(/\s+/g, ' ')
    const found = light.replace(/\s+/g, ' ').includes(wanted)
    if (!found) missing.push(`${name} (light ${value})`)
  }
  for (const [name, value] of Object.entries(snapshot.dark)) {
    if (!name.startsWith('--dsw-alias-')) continue
    const wanted = `${name}: ${value};`.replace(/\s+/g, ' ')
    if (!dark.replace(/\s+/g, ' ').includes(wanted)) missing.push(`${name} (dark ${value})`)
  }
  assert(missing.length === 0, `the fixture disagrees with the snapshot: ${missing.join(', ')}`)
  return `${Object.keys(snapshot.light).length} light and ${Object.keys(snapshot.dark).length} dark values match ${snapshot.version}`
})

check('the fixture can fail: its contrast helpers are exercised', () => {
  const html = read('verify/harness/index.html')
  assert(html.includes('assertion has teeth'), 'the fixture has no negative self-check for its contrast maths')
  assert(/relativeLuminance|contrastOf/.test(html), 'the fixture has no contrast helper')
  // A self-check that passes without the maths is worse than none: it must state
  // the old border colour lands under 3:1 and require that.
  assert(
    /ratio\s*!==\s*null\s*&&\s*ratio\s*<\s*3/.test(html),
    'the self-check never demands a failing ratio',
  )
  return 'contrast helpers present, and a check that requires the old palette to fail'
})

/* ---------------------------------------------------------------- report */

const EXPECTED_CHECKS = 80
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

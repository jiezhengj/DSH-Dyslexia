/**
 * Static and behavioural checks of the packaged plugin.
 *
 * Everything here runs offline with plain Node: the manifest, the patch file,
 * the locales, the client chunk's module shape, the host half's one prompt
 * section, and — through the vendored engine — that a real diagram can be
 * drawn and that a broken one reports a one-line reason.
 */

import { readFileSync, statSync } from 'node:fs'
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

check('every published file exists', () => {
  const required = ['index.js', 'client.js', 'cordis.patch.yml', 'icon.svg', 'LICENSE', 'THIRD-PARTY-NOTICES.md', 'README.md', 'docs/preview.svg']
  for (const language of LANGUAGES) required.push(`locale/${language}.json`, `README.${language}.md`)
  required.forEach((relative) => {
    const size = statSync(join(ROOT, relative)).size
    assert(size > 0, `${relative} is empty`)
  })
  return `${required.length} files`
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
  return `${chunk.length} bytes`
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
  for (const needle of ['fetch(', 'fetch (', 'XMLHttpRequest', 'importScripts', 'new WebSocket', 'EventSource', 'import(']) {
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
  assert(chunk.includes("report['figure render']") === false, 'sanity: no bracket access to report')
  assert(chunk.includes("report('figure render'"), 'the layer boundary does not report render failures')
  assert(chunk.includes('getDerivedStateFromError'), 'the layer has no error boundary')
  assert(chunk.includes("typeof props.code !== 'string'"), 'the layer does not guard the fence props')
  return 'boundary + prop guard present'
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
const hostModule = await import(pathToFileURL(join(ROOT, 'index.js')).href)
hostModule.apply({
  systemPrompt: {
    section(spec) {
      captured.push(spec)
    },
  },
})

check('host apply survives a host that changed shape', () => {
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

/* ---------------------------------------------------------------- report */

for (const line of notices) process.stdout.write(`${line}\n`)
for (const line of failures) process.stderr.write(`${line}\n`)

if (failures.length > 0) {
  process.stderr.write(`\ncheck-bundle: ${failures.length} failed, ${notices.length} passed\n`)
  process.exit(1)
}

process.stdout.write(`\ncheck-bundle: all ${notices.length} checks passed\n`)

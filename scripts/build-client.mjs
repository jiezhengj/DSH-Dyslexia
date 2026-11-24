/**
 * Builds `client.js`: one self-contained client chunk, the shape the host
 * serves for a `dsh.client` package.
 *
 * The drawing engine is pasted in verbatim under its own license banner, and
 * the module's source files are concatenated in dependency order, so the chunk
 * asks the loader for nothing except `react` — no relative chunk, no network.
 *
 * Everything here is defensive on purpose. A client chunk is evaluated inside
 * the host's batch script, so a throw while the chunk registers its factory
 * would cost the page every plugin that shares that script. The emitted wrapper
 * therefore never lets an error out: a failed engine, a missing `react`, a
 * throwing factory all end as "this package renders nothing", never as a broken
 * page. The compiled chunk is also syntax-checked here, because a syntax error
 * is the one failure a later try/catch cannot contain.
 *
 * The assembly is exported as `buildChunk`, and the command line below only
 * writes what it returns. `verify/check-bundle.mjs` imports it and rebuilds the
 * same bytes in memory: the banner fingerprint says which sources a chunk
 * claims, but only a byte comparison says the chunk is those sources, because
 * code appended after the banner leaves the fingerprint untouched.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Script } from 'node:vm'

const SELF = fileURLToPath(import.meta.url)
const ROOT = dirname(dirname(SELF))
const OUTPUT = join(ROOT, 'client.js')
const SOURCES = ['styles.js', 'i18n.js', 'figure.js', 'view.js', 'settings.js', 'entry.js']
// The chunk also embeds the engine bundle, so the fingerprint has to cover it:
// otherwise two different chunks could carry the same banner.
const ENGINE_SOURCE = 'vendor/pele/pele.global.js'

function fail(message) {
  process.stderr.write(`build-client: ${message}\n`)
  process.exit(1)
}

/**
 * A digest of everything the chunk is built from, printed in the banner so a
 * stale `client.js` can be detected instead of published. `verify/check-bundle.mjs`
 * recomputes it from the same inputs.
 */
function sourceFingerprint(manifest, fragments, engine) {
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

const header = [
  ';(function () {',
  '  function reportLoadFailure(scope, error) {',
  "    try { console.error('dsh-dyslexia: ' + scope, error) } catch (_error) {}",
  '  }',
  '',
  '  function buildModule(require) {',
  '    var module = { exports: {} }',
  '    var exports = module.exports',
  "    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })",
  '    var React = null',
  "    try { React = require('react') } catch (error) { React = null }",
  '    if (!React) return { apply: function () {}, inject: [] }',
  '    var pele = null',
  '    try {',
  '      pele = (function () {',
  '',
  '',
].join('\n')

const between = ['', '', '        return pele', '      })()', '    } catch (error) { pele = null }', '', ''].join('\n')

function footerFor(manifest) {
  return [
    '',
    '    exports.apply = apply',
    '    exports.inject = inject',
    '',
    '    return module.exports',
    '  }',
    '',
    '  try {',
    '    window.__ModuleLoader__.load({',
    `      id: ${JSON.stringify(manifest.name)},`,
    '      factory: function (require) {',
    '        try {',
    '          return buildModule(require)',
    '        } catch (error) {',
    "          reportLoadFailure('module', error)",
    '          return { apply: function () {}, inject: [] }',
    '        }',
    '      },',
    '    })',
    '  } catch (error) {',
    "    reportLoadFailure('loader', error)",
    '  }',
    '})()',
    '',
  ].join('\n')
}

/**
 * The whole chunk, built from the manifest, the vendored engine and the six
 * sources under `root`. Throws with the reason a build would fail; the command
 * line turns that into `build-client: ...` and exit 1.
 */
export function buildChunk(root = ROOT) {
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  if (typeof manifest.name !== 'string' || manifest.name.length === 0) throw new Error('package.json has no name')
  const vendorPath = join(root, 'vendor', 'pele', 'pele.global.js')
  if (!existsSync(vendorPath)) throw new Error(`missing ${vendorPath}; see quickstart.md for how to vendor it`)

  const vendor = readFileSync(vendorPath, 'utf8').replace(/\r\n/g, '\n')
  if (!vendor.includes('var pele=(()=>{')) throw new Error('vendor/pele/pele.global.js is not the global build')
  if (!vendor.trimEnd().endsWith('})();')) throw new Error('vendor/pele/pele.global.js is truncated')
  if (vendor.includes('sourceMappingURL')) throw new Error('vendored engine must not point at a source map')

  const engineVersion = (vendor.match(/Pele (\d+\.\d+\.\d+)/) || [])[1] || 'unknown'

  /**
   * Sources are read with their newlines normalised to LF. A Windows checkout can
   * hand over CRLF, and the committed chunk is LF (`.gitattributes`), so without
   * this the same sources would produce two different chunks — which is exactly how
   * a "stale chunk" guard turns into a false alarm on a clean build.
   */
  function readSource(name) {
    return readFileSync(join(root, 'src', 'client', name), 'utf8').replace(/\r\n/g, '\n')
  }

  const fragments = SOURCES.map((name) => {
    const text = readSource(name)
    if (text.includes('</script')) throw new Error(`${name}: an inline </script would end the host page`)
    if (!text.endsWith('\n')) throw new Error(`${name}: must end with a newline`)
    return text
  })

  const banner = [
    `/*! ${manifest.name} ${manifest.version} | MIT | bundles Pele ${engineVersion} (MIT, see THIRD-PARTY-NOTICES.md) | sources sha256:${sourceFingerprint(manifest, fragments, vendor)} */`,
    '',
  ].join('\n')

  const chunk = banner + header + vendor + between + fragments.join('\n') + footerFor(manifest)
  return { manifest, engineVersion, chunk }
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(SELF)
if (invokedDirectly) {
  let built = null
  try {
    built = buildChunk()
  } catch (error) {
    fail(error.message)
  }
  try {
    // Compile-only: a syntax error here would take down the whole host batch.
    new Script(built.chunk, { filename: 'client.js' })
  } catch (error) {
    fail(`client.js does not compile: ${error.message}`)
  }
  writeFileSync(OUTPUT, built.chunk)
  process.stdout.write(
    `build-client: ${built.manifest.name} -> client.js (${Buffer.byteLength(built.chunk, 'utf8')} bytes, ${built.chunk.length} characters, engine ${built.engineVersion}, sources ${SOURCES.length}, syntax ok)\n`,
  )
}

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
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Script } from 'node:vm'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const VENDOR = join(ROOT, 'vendor', 'pele', 'pele.global.js')
const OUTPUT = join(ROOT, 'client.js')
const SOURCES = ['styles.js', 'i18n.js', 'figure.js', 'view.js', 'entry.js']

function fail(message) {
  process.stderr.write(`build-client: ${message}\n`)
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
if (typeof manifest.name !== 'string' || manifest.name.length === 0) fail('package.json has no name')
if (!existsSync(VENDOR)) fail(`missing ${VENDOR}; see quickstart.md for how to vendor it`)

const vendor = readFileSync(VENDOR, 'utf8')
if (!vendor.includes('var pele=(()=>{')) fail('vendor/pele/pele.global.js is not the global build')
if (!vendor.trimEnd().endsWith('})();')) fail('vendor/pele/pele.global.js is truncated')
if (vendor.includes('sourceMappingURL')) fail('vendored engine must not point at a source map')

const engineVersion = (vendor.match(/Pele (\d+\.\d+\.\d+)/) || [])[1] || 'unknown'

const fragments = SOURCES.map((name) => {
  const text = readFileSync(join(ROOT, 'src', 'client', name), 'utf8')
  if (text.includes('</script')) fail(`${name}: an inline </script would end the host page`)
  if (!text.endsWith('\n')) fail(`${name}: must end with a newline`)
  return text
})

const banner = [
  `/*! ${manifest.name} ${manifest.version} | MIT | bundles Pele ${engineVersion} (MIT, see THIRD-PARTY-NOTICES.md) | sources sha256:${sourceFingerprint(manifest, fragments)} */`,
  '',
].join('\n')

/**
 * A digest of everything the chunk is built from, printed in the banner so a
 * stale `client.js` can be detected instead of published. `verify/check-bundle.mjs`
 * recomputes it from the same inputs.
 */
function sourceFingerprint(manifest, fragments) {
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

const footer = [
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

const chunk = banner + header + vendor + between + fragments.join('\n') + footer

try {
  // Compile-only: a syntax error here would take down the whole host batch.
  new Script(chunk, { filename: 'client.js' })
} catch (error) {
  fail(`client.js does not compile: ${error.message}`)
}

writeFileSync(OUTPUT, chunk)

process.stdout.write(
  `build-client: ${manifest.name} -> client.js (${Buffer.byteLength(chunk, 'utf8')} bytes, ${chunk.length} characters, engine ${engineVersion}, sources ${SOURCES.length}, syntax ok)\n`,
)

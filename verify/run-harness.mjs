/**
 * Runs `verify/harness/index.html` in a real Chromium and reports its verdict.
 *
 * The fixture is committed, so the browser evidence in
 * `specs/001-mermaid-fence-render/evidence/verification.md` can be reproduced
 * from a fresh clone: `node verify/run-harness.mjs`. Nothing is uploaded and no
 * server is started — the page is opened from disk with `file://`, which is also
 * how the "no network at run time" claim stays honest.
 *
 * Chrome is the only external requirement. It is looked up through
 * `DSH_DYSLEXIA_CHROME`, then the usual install paths, then `PATH`.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildChunk } from '../scripts/build-client.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const PAGE = join(ROOT, 'verify', 'harness', 'index.html')

const CANDIDATES = [
  process.env.DSH_DYSLEXIA_CHROME,
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]

function findBrowser() {
  const fromPath = ['google-chrome', 'chromium', 'chromium-browser', 'msedge'].map((name) => {
    const probe = spawnSync(name, ['--version'], { encoding: 'utf8' })
    return probe.status === 0 ? name : null
  })
  for (const candidate of [...CANDIDATES, ...fromPath]) {
    if (candidate && (candidate.includes('/') || candidate.includes('\\') ? existsSync(candidate) : true)) return candidate
  }
  return null
}

function fail(message) {
  process.stderr.write(`run-harness: ${message}\n`)
  process.exit(1)
}

if (!existsSync(PAGE)) fail(`fixture missing: ${PAGE}`)

const browser = findBrowser()
if (!browser) {
  fail(
    'no Chromium found. Set DSH_DYSLEXIA_CHROME to a Chrome/Chromium/Edge executable; ' +
      'the fixture needs a real browser for React and the SVG engine.',
  )
}

const url = pathToFileURL(PAGE).href
const run = spawnSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--virtual-time-budget=30000',
    '--window-size=1280,900',
    '--dump-dom',
    url,
  ],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)

if (run.error) fail(`could not start ${browser}: ${run.error.message}`)

const dom = run.stdout || ''
const verdict = /data-dsh-checks="ok:(\d+)\/failed:(\d+)"/.exec(dom)
if (!verdict) {
  const tail = (run.stderr || '').split('\n').filter(Boolean).slice(-5).join(' | ')
  fail(`the fixture did not report a verdict (page did not finish). ${tail}`)
}

const passed = Number(verdict[1])
const failed = Number(verdict[2])
const logMatch = /<pre id="log">([\s\S]*?)<\/pre>/.exec(dom)
const lines = logMatch
  ? logMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .split('\n')
      .filter((line) => line.trim().length > 0)
  : []

const failures = lines.filter((line) => line.startsWith('[bad]'))
for (const line of failures) process.stderr.write(`${line}\n`)

// `--list` prints every check so an evidence file can quote one run verbatim
// instead of reassembling output from several runs.
if (process.argv.includes('--list')) {
  for (const line of lines) process.stdout.write(`${line}\n`)
}

if (failed > 0) {
  process.stderr.write(`\nrun-harness: ${failed} failed, ${passed} passed\n`)
  process.exit(1)
}

// The summary line names the tree it came from, so a pasted run cannot belong to
// a different commit than the one it claims. The fingerprint in it is the one
// baked into client.js, so it only proves what the chunk says; the sources are
// rebuilt here and compared, which is what actually catches a stale chunk.
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const chunk = readFileSync(join(ROOT, 'client.js'), 'utf8')
const stamped = /sources sha256:([0-9a-f]{32})/.exec(chunk)
let fresh = null
try {
  fresh = /sources sha256:([0-9a-f]{32})/.exec(buildChunk(ROOT).chunk)[1]
} catch (error) {
  process.stderr.write(`\nrun-harness: the sources do not build: ${(error && error.message) || error}\n`)
  process.exit(1)
}
if (!stamped || stamped[1] !== fresh) {
  process.stderr.write(
    `\nrun-harness: client.js is stale: rebuild it (chunk ${stamped ? stamped[1] : 'unstamped'}, sources ${fresh})\n`,
  )
  process.exit(1)
}
const EXPECTED_CHECKS = 306
if (EXPECTED_CHECKS > 0 && passed !== EXPECTED_CHECKS) {
  process.stderr.write(
    `\nrun-harness: suite reported ${passed} checks, expected ${EXPECTED_CHECKS}: a check was added or removed\n`,
  )
  process.exit(1)
}
process.stdout.write(
  `run-harness: ${pkg.name}@${pkg.version} | client.js ${statSync(join(ROOT, 'client.js')).size} bytes | sources sha256:${stamped ? stamped[1] : 'unstamped'} | all ${passed} checks passed (${browser})\n`,
)



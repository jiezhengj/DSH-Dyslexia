# Evidence — feature 002: the preference switch and the new name

This file records what was actually observed while building feature 002. Each block is one run on one tree; no block mixes trees. E-PUB/E-INS exist for all six published versions — `0.2.0`, `0.2.1`, `0.2.2`, `0.2.3`, `0.2.4` and `0.2.5` — and for no unpublished tree: every version that was cut has both blocks, and `0.2.5` is one of them (commit `0be17fe`, tag `v0.2.5`, run `45240437544`, installed into the live `desktop` profile — see "E-PUB · 0.2.5" and "E-INS · 0.2.5" below). E-BLD, E-CHK and E-HARN quote the `0.2.1` tree only (44 static, 251 browser; the `0.2.5` runs are summary lines in "E-CHK/E-HARN · 0.2.5" below, not transcripts; E-CHK is the complete stdout of that run — 44 `ok` lines plus the summary — while the 52 deliberately triggered `warn`/stack lines went to stderr). The current tree is `0.2.5`, committed, released and installed — the same tree this file's runs measured: 45 static and 274 browser checks, `client.js` 783360 bytes / 781845 characters, sources sha256 `2b5728286c556d8dbaaa349cc9fb8ec5`, file SHA-256 `279c33781ef551e3d3bbb0aabf3d37a681fd5da4f4738c29c724b596667a8766`. The tree `0.2.5` replaced in the profile is `0.2.4` (45 static and 271 browser checks, `client.js` 781963 bytes, sources sha256 `9f13d80f0230257569dd0e525c6eb048`). E-PROBE records F3–F8 on `0.2.1`, F1/F9 on the `0.2.3` tree, and F10–F13 on the `0.2.5` tree; the `0.2.4` tree itself was never probed, and `0.2.5` supersedes it (G10 discharged).

## E-BLD build

The `0.2.1` tree (the tree E-CHK and E-HARN below quote):

```
build-client: @jiezhengj/dsh-dyslexia -> client.js (780550 bytes, 779035 characters, engine 1.13.0, sources 6, syntax ok)
```

The current `0.2.5` tree; `client.js` on disk measures 783360 bytes and 781845 characters, the pair this line prints:

```
build-client: @jiezhengj/dsh-dyslexia -> client.js (783360 bytes, 781845 characters, engine 1.13.0, sources 6, syntax ok)
```

## E-CHK static and behavioural checks (44) — the `0.2.1` tree

```
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.2.1
ok   package.json points at the repository npm trusts — git+https://github.com/jiezhengj/DSH-Dyslexia.git
ok   package.json declares the bundle patch and the client half — platform web, no package inject
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 9 patterns
ok   the required published files exist — 24 required files
ok   every interface language has its own plugin page — 8 languages
ok   cordis.patch.yml inserts the plugin by package name — 3 lines
ok   both locales carry metadata — en, zh
ok   client.js is one loader chunk keyed by the package name — 780550 bytes
ok   client.js requires react and nothing else — react
ok   client.js never reaches the network — no fetch, no XHR, no dynamic import, no remote URL
ok   client.js carries the vendored engine — Pele 1.13.0 inlined
ok   client.js compiles on its own — no syntax error for a host batch to inherit
ok   a broken host loader cannot make the chunk throw — throwing loader, missing loader, missing window
ok   a failing factory still yields a silent module — no react, no ctx, no slots, empty services
ok   an engine that fails to load leaves the picture to the host — boundary + guarded props + engine guard + engine sentence
ok   the layer is keyed to mermaid on the fence slot — conversation.chat.markdown.fence + mermaid
ok   host half declares its package identity and one service — systemPrompt only
ok   the host half can be loaded and apply once — one section on a healthy host
ok   host apply survives a host that changed shape — six hostile hosts, no throw, no section
ok   the section hands the host a function, not a frozen string — text is a function, and the value at capture time changes the text
ok   the capability briefing is what it was before the switch — 85 words, order 9000, name ui:dsh-dyslexia
ok   the switch adds the preference on top of the capability, and nothing else — 70 words of preference, 85 of capability
ok   the switch is on for an empty configuration — visualFirst defaults to true
ok   a host that hands over no configuration still gets the full briefing — no config means the default, not an empty briefing
ok   the engine type is exposed the way client.js expects — PeleError, detectType, enableZoom, forgetTextWidths, mount, parse, register, registered, render, supports
ok   every supported sample type draws an svg — flowchart:218x64 sequence:184x167 class:80x192 state:87x206 er:144x201 mindmap:172x71 timeline:408x133
ok   a broken diagram reports a one-line reason — Parse error on line 2:
ok   host key echo falls back to bundled strings — key echo, blanks, placeholders rejected; the host is asked under the plugin namespace
ok   every language carries the same complete sentences — 16 keys x 8 languages, no engine text in labels
ok   client.js matches the sources it claims — 6b5d4e192279b1294304cbed6303e546
ok   the picture is the image, and the copy answer is announced — label is a noun, role="img" on the svg, copy result announced; behaviour is asserted by the fixture
ok   host children react would refuse fall back to the source — objects, functions and mixed arrays fall back to the source text; behaviour is asserted by the fixture
ok   every drawing the engine swaps in is named again — the engine owns re-layout; every swapped drawing node and its zoom buttons are renamed, strings follow the language; behaviour is asserted by the fixture
ok   a host block that throws cannot empty the message — host blocks render inside their own boundary, with the source text as the floor; behaviour is asserted by the fixture
ok   a factory that cannot build never throws at the host — module-level throw contained, empty module returned
ok   nothing in the package asks you to edit an instruction file — 17 shipped text files, no instruction-file ask
ok   the host half registers exactly one capability section — ui:dsh-dyslexia, order 9000, 155 words
ok   the host half adds one section per context, not one per call — three calls on one context, one section; a second context gets its own; a failed attempt still allows a retry, whether the host refused at once or later
ok   the host half stays silent when the host changed shape — five silent hosts (no warning), two refused sections (one warning each, naming the error)
ok   the contract's colour variables are the ones that are wired — 10 engine variables, owned by engine and contract alike
ok   both size limits reach the engine, each proven on its own — three limits passed to mount, two fixtures that cross one each
ok   the fixtures assert what the fixes promise, and can fail — 35 assertions present, each with a condition that reads something

check-bundle: @jiezhengj/dsh-dyslexia@0.2.1 | client.js 780550 bytes | sources sha256:6b5d4e192279b1294304cbed6303e546 | all 44 checks passed
```

## E-HARN browser checks (251), the `0.2.1` tree — `node verify/run-harness.mjs --list` (a plain run prints only the summary line)

```
[ok] loading client.js registers one factory
[ok] the module exposes apply
[ok] the module asks for slots only — slots
[ok] apply registers exactly one fence layer — count 1
[ok] layer sits on the fence slot — conversation.chat.markdown.fence
[ok] layer is keyed to mermaid — mermaid
[ok] layer id — @jiezhengj/dsh-dyslexia/mermaid
[ok] layer order — 100
[ok] layer claims the locale namespace — dyslexia
[ok] every interface language has expectations
[ok] [zh] the picture carries a plain name — 图
[ok] [zh] first render shows the two buttons — 查看源码 | 复制源码
[ok] [zh] a picture is drawn
[ok] [zh] exactly two buttons — 2
[ok] [zh] no internal key reaches the screen
[ok] [zh] the source toggle starts collapsed
[ok] [zh] the source toggle flips its word — 隐藏源码
[ok] [zh] the source toggle announces itself as expanded
[ok] [zh] the expanded source keeps its fence language — language-mermaid
[ok] [zh] the mount point is presentational
[ok] [zh] the copy answer is announced in words — 已复制 / expected 已复制
[ok] [zh] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [zh] a refused clipboard says so — 复制失败 / expected 复制失败
[ok] [en] the picture carries a plain name — Diagram
[ok] [en] first render shows the two buttons — Show source | Copy source
[ok] [en] a picture is drawn
[ok] [en] exactly two buttons — 2
[ok] [en] no internal key reaches the screen
[ok] [en] the source toggle starts collapsed
[ok] [en] the source toggle flips its word — Hide source
[ok] [en] the source toggle announces itself as expanded
[ok] [en] the expanded source keeps its fence language — language-mermaid
[ok] [en] the mount point is presentational
[ok] [en] the copy answer is announced in words — Copied / expected Copied
[ok] [en] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [en] a refused clipboard says so — Copy failed / expected Copy failed
[ok] [ja] the picture carries a plain name — 図
[ok] [ja] first render shows the two buttons — ソースを表示 | ソースをコピー
[ok] [ja] a picture is drawn
[ok] [ja] exactly two buttons — 2
[ok] [ja] no internal key reaches the screen
[ok] [ja] the source toggle starts collapsed
[ok] [ja] the source toggle flips its word — ソースを隠す
[ok] [ja] the source toggle announces itself as expanded
[ok] [ja] the expanded source keeps its fence language — language-mermaid
[ok] [ja] the mount point is presentational
[ok] [ja] the copy answer is announced in words — コピーしました / expected コピーしました
[ok] [ja] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [ja] a refused clipboard says so — コピーできませんでした / expected コピーできませんでした
[ok] [es] the picture carries a plain name — Diagrama
[ok] [es] first render shows the two buttons — Mostrar el código | Copiar el código
[ok] [es] a picture is drawn
[ok] [es] exactly two buttons — 2
[ok] [es] no internal key reaches the screen
[ok] [es] the source toggle starts collapsed
[ok] [es] the source toggle flips its word — Ocultar el código
[ok] [es] the source toggle announces itself as expanded
[ok] [es] the expanded source keeps its fence language — language-mermaid
[ok] [es] the mount point is presentational
[ok] [es] the copy answer is announced in words — Copiado / expected Copiado
[ok] [es] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [es] a refused clipboard says so — No se pudo copiar / expected No se pudo copiar
[ok] [fr] the picture carries a plain name — Schéma
[ok] [fr] first render shows the two buttons — Afficher la source | Copier la source
[ok] [fr] a picture is drawn
[ok] [fr] exactly two buttons — 2
[ok] [fr] no internal key reaches the screen
[ok] [fr] the source toggle starts collapsed
[ok] [fr] the source toggle flips its word — Masquer la source
[ok] [fr] the source toggle announces itself as expanded
[ok] [fr] the expanded source keeps its fence language — language-mermaid
[ok] [fr] the mount point is presentational
[ok] [fr] the copy answer is announced in words — Copié / expected Copié
[ok] [fr] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [fr] a refused clipboard says so — Échec de la copie / expected Échec de la copie
[ok] [de] the picture carries a plain name — Diagramm
[ok] [de] first render shows the two buttons — Quelle anzeigen | Quelle kopieren
[ok] [de] a picture is drawn
[ok] [de] exactly two buttons — 2
[ok] [de] no internal key reaches the screen
[ok] [de] the source toggle starts collapsed
[ok] [de] the source toggle flips its word — Quelle ausblenden
[ok] [de] the source toggle announces itself as expanded
[ok] [de] the expanded source keeps its fence language — language-mermaid
[ok] [de] the mount point is presentational
[ok] [de] the copy answer is announced in words — Kopiert / expected Kopiert
[ok] [de] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [de] a refused clipboard says so — Kopieren fehlgeschlagen / expected Kopieren fehlgeschlagen
[ok] [ru] the picture carries a plain name — Диаграмма
[ok] [ru] first render shows the two buttons — Показать код | Копировать код
[ok] [ru] a picture is drawn
[ok] [ru] exactly two buttons — 2
[ok] [ru] no internal key reaches the screen
[ok] [ru] the source toggle starts collapsed
[ok] [ru] the source toggle flips its word — Скрыть код
[ok] [ru] the source toggle announces itself as expanded
[ok] [ru] the expanded source keeps its fence language — language-mermaid
[ok] [ru] the mount point is presentational
[ok] [ru] the copy answer is announced in words — Скопировано / expected Скопировано
[ok] [ru] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [ru] a refused clipboard says so — Не удалось скопировать / expected Не удалось скопировать
[ok] [pt] the picture carries a plain name — Diagrama
[ok] [pt] first render shows the two buttons — Mostrar o código | Copiar o código
[ok] [pt] a picture is drawn
[ok] [pt] exactly two buttons — 2
[ok] [pt] no internal key reaches the screen
[ok] [pt] the source toggle starts collapsed
[ok] [pt] the source toggle flips its word — Ocultar o código
[ok] [pt] the source toggle announces itself as expanded
[ok] [pt] the expanded source keeps its fence language — language-mermaid
[ok] [pt] the mount point is presentational
[ok] [pt] the copy answer is announced in words — Copiado / expected Copiado
[ok] [pt] the copy answer can be read, not only heard — 12px / rgb(91, 95, 114)
[ok] [pt] a refused clipboard says so — Não foi possível copiar / expected Não foi possível copiar
[ok] every interface language actually translates
[ok] the source block keeps the language the host sent — language-mmd
[ok] a host t that echoes the key still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that throws still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that answers blanks still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that echoes key with a value still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that leaves a placeholder still shows words — 查看源码 | 复制源码 / 图
[ok] a streaming fence shows only the host block
[ok] a truthy streaming flag is honoured
[ok] the layer survives a throwing code getter
[ok] a throwing code getter still yields an element
[ok] a throwing code getter leaves the host block — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] the hostile children bag mounted without a setup error — nodes=1
[ok] the layer survives a throwing children getter
[ok] a throwing children getter still yields an element
[ok] a throwing children getter leaves the source — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] a fence whose props read throws is left to the host, not the message — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] a non-string fence is left to the host
[ok] a broken diagram says why
[ok] the reason is a complete sentence — 图里的语法有误，已改为显示源码。
[ok] the engine English is not pasted into the sentence
[ok] a broken diagram keeps the host block
[ok] a broken diagram without host children still shows its source
[ok] a throwing engine leaves a sentence
[ok] a throwing engine keeps the host block
[ok] the opened panel is on screen before the source changes — 1
[ok] a source swapped for a broken one is shown once, not twice — copies=1 panels=0
[ok] the swapped-in failure still says why
[ok] the panel is open before a new fence replaces the text — 1
[ok] a new fence closes a panel the reader opened for the old one — panels=0
[ok] the new fence offers the panel closed, not open — false
[ok] the copy answer is on screen before the source changes — 已复制
[ok] a copy answer does not outlive the source it described
[ok] a missing clipboard is reported, not faked — 复制失败 / 查看源码 | 复制源码
[ok] the copy button writes once — 1
[ok] a real copy is reported as copied — 已复制 / 查看源码 | 复制源码
[ok] a host dictionary that already owns a word does not put it on our button — 已复制
[ok] a host that translates the namespaced key is used — HOST COPIED
[ok] two fences draw two pictures — 2
[ok] the second fence draws its own picture — 1
[ok] the prose around a picture is left alone — 3
[ok] the picture and the prose keep their order — p,figure,p,figure,p
[ok] the column measurement can see an overflow — 4000/360
[ok] the column goes back to fitting once the control is gone — 360/360
[ok] the picture takes the column width — 358/360
[ok] a wide picture does not widen the column — 360/360
[ok] the page itself never overflows — 0
[ok] the picture box is capped to the column — 100%
[ok] the picture box counts its own padding — border-box
[ok] a wide picture scrolls inside its own box — auto
[ok] a drawn picture has text to colour
[ok] the picture follows the host colour without reloading — rgb(16, 16, 20) -> rgb(1, 2, 3)
[ok] a host that rejects the locale option does not break apply
[ok] the layer is registered once after the retry — 1
[ok] the retried registration drops the locale option — {"name":"conversation.chat.markdown.fence","id":"@jiezhengj/dsh-dyslexia/mermaid","key":"mermaid","order":100}
[ok] apply stays silent on a changed host — null
[ok] apply stays silent on a changed host — null
[ok] apply stays silent on a changed host — null
[ok] apply stays silent on a changed host — null
[ok] apply stays silent on a changed host — null
[ok] apply stays silent on a changed host — null
[ok] apply stays silent on a changed host — null
[ok] styles arrive with apply — true
[ok] one fence layer while installed — 1
[ok] styles and strings are claimed as effects — 2
[ok] the layer draws while the fiber lives — true
[ok] disabling the plugin takes its stylesheet away — false
[ok] the locale registration is dropped — 1
[ok] the fence layer is gone once the host disposes — 0
[ok] a second apply does not add a second fence layer — 1
[ok] a host without effects keeps one stylesheet, not one per apply — 1
[ok] no internal key reaches the eye — leaked: 
[ok] a source over the size limit says why — 这张图无法绘制，已改为显示源码。long
[ok] a source over the size limit keeps the host block
[ok] a source over the size limit is not drawn
[ok] a picture with too many edges says why — 这张图无法绘制，已改为显示源码。many edges
[ok] a picture with too many edges keeps the host block
[ok] a picture with too many edges is not drawn
[ok] the picture appears when the stream ends
[ok] a falsy children is not mistaken for content — 图里的语法有误，已改为显示源码。flowchart TD
[ok] a refused children cannot empty the message — object — children=1 text=flowchart LR
[ok] a refused children falls back to the source — object — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] no React error 31 escapes — object
[ok] a refused children cannot empty the message — function — children=1 text=flowchart LR
[ok] a refused children falls back to the source — function — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] no React error 31 escapes — function
[ok] a refused children cannot empty the message — object in a failed picture — children=3 text=图里的语法有误，已改为显示源码。flow
[ok] a refused children falls back to the source — object in a failed picture — "图里的语法有误，已改为显示源码。flowchart TD\n  A-->"
[ok] no React error 31 escapes — object in a failed picture
[ok] a refused children cannot empty the message — array with an object — children=3 text=图里的语法有误，已改为显示源码。flow
[ok] a refused children falls back to the source — array with an object — "图里的语法有误，已改为显示源码。flowchart TD\n  A-->"
[ok] no React error 31 escapes — array with an object
[ok] a streaming block with no host children still shows its source — flowchart LR
[ok] a fresh t does not redraw the picture
[ok] the drawing is named when it is first laid out — img|图
[ok] the fixture really replaced the drawing node — new node
[ok] a swapped drawing is named again — img|图|roledesc=null
[ok] the fixture replaced the drawing again after the column narrowed — new node
[ok] a drawing swapped after a width change is named again — img|图|roledesc=null
[ok] a hostile host block still leaves the message — an iterable of plain objects — text=图里的语法有误，已改为显示源码。flowchar
[ok] a hostile host block still leaves the message — a host block that throws while rendering — text=图里的语法有误，已改为显示源码。flowchar
[ok] the zoom buttons speak the language they were mounted in — 放大 | 缩小 | 重置缩放
[ok] the zoom buttons follow the interface language — labels=[Zoom in | Zoom out | Reset zoom] nodes=DIV.pele pele-zoom: ~ BUTTON.pele-zoom-in:Zoom in ~ svg.[object SVGAnimatedString]: ~ path.[object SVGAnimatedString]: ~ BUTTON.pele-zoom-out:Zoom out ~ svg.[object SVGAnimatedString]: ~ path.[object SVGAnimatedString]: ~ BUTTON.pele-zoom-reset:Reset zoom ~ svg.[object SVGAnimatedString]: ~ path.[ob
[ok] the copy answer is announced, not only coloured — 已复制
[ok] the box around the picture is a group
[ok] the box around the picture carries no name of its own — null
[ok] the drawing itself is the image
[ok] a picture that fits offers no zoom buttons — 0
[ok] the image carries the localised name — 图
[ok] the image carries no english role description — absent
[ok] exactly one image in the picture — 1
[ok] a scaled picture offers the engine zoom buttons — scaled=3 fitting=0
[ok] the zoom buttons sit outside the image — 0
[ok] the zoom buttons speak the interface language — 放大 | 缩小 | 重置缩放
[ok] the zoom button titles say the same as their names — 放大 | 缩小 | 重置缩放
[ok] every zoom button in reach can take the keyboard — 1/1 reachable of 3
[ok] every zoom button is reachable once the picture is zoomed — 3/3 after zoom
[ok] a host with configForms takes the row without throwing — quiet
[ok] the row registers on the general settings slot and nowhere else — 2 defs, 1 on the slot
[ok] the row carries its id, order and locale — @jiezhengj/dsh-dyslexia/visual-first 62 dyslexia
[ok] the settings row renders inside its slot component
[ok] the row label is our own sentence, not a host key — 优先用图，而不是成段文字
[ok] the row hint is our own sentence, not a host key — 当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。
[ok] the switch shows the value the host reports — true
[ok] the switch is named and described by the visible sentences — :r0:-label -> 优先用图，而不是成段文字 | :r1:-hint -> 当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。
[ok] the switch keeps the keyboard — disabled=false tabindex=null
[ok] no status sentence before the reader touches the switch
[ok] one click asks the host for the opposite value once — [["visualFirst",false]]
[ok] the switch turns off after the write — false
[ok] a saved write says so in the status sentence — 已保存
[ok] the second click tries the other value once — [["visualFirst",false],["visualFirst",true]]
[ok] a rejected write leaves the switch where the host put it — false
[ok] a rejected write explains itself in the status sentence — 保存失败，开关保持原来的状态。
[ok] the switch starts off when the host already says off — false
[ok] a host without configForms gets the picture and no settings row — 1 defs, threw=no
[ok] the picture still draws when the settings surface is missing
[ok] a configForms face that answers nothing adds no row — 1 defs

run-harness: @jiezhengj/dsh-dyslexia@0.2.1 | client.js 780550 bytes | sources sha256:6b5d4e192279b1294304cbed6303e546 | all 251 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

## E-CHK/E-HARN · 0.2.5 (45 static, 274 browser)

Only the summary lines were recorded on this tree; the full stdout above stays the `0.2.1` transcript, and no block mixes trees.

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.5 | client.js 783360 bytes | sources sha256:2b5728286c556d8dbaaa349cc9fb8ec5 | all 45 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.5 | client.js 783360 bytes | sources sha256:2b5728286c556d8dbaaa349cc9fb8ec5 | all 274 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

CI on run `45240437544` printed the same two lines for the tagged commit (only the browser path differs, `/usr/bin/google-chrome`), so these are the published release's numbers and not a local run alone; the verbatim CI block is under "E-PUB · 0.2.5" below.

The three browser assertions this round added are `a refused write keeps the value the host took while it was pending` (`verify/harness/index.html:1549`), `a value the host pushes reaches the switch without a write` (`:1612`) and `a thenable that throws out of then cannot break the click` (`:1676`); the static side changed inside `the capability briefing is what it was before the switch` (`verify/check-bundle.mjs:401`), so the static count is unchanged at 45.

## E-PUB · 0.2.2

- tag `v0.2.2`, commit `cf91d6f`, run `45211420278` completed/success
- CI: `check-bundle ... all 44 checks passed` and `run-harness ... all 252 checks passed (/usr/bin/google-chrome)`
- `npm notice shasum: 1f17ac1be4c1ea5c5e97c814cc699a6c910ee03d`, `npm notice total files: 33`
- provenance `logIndex=4054074805`

## E-INS · 0.2.2

- `remove_bundle @jiezhengj/dsh-dyslexia` removed `0.2.1`; `install_bundle @jiezhengj/dsh-dyslexia@0.2.2` returned `application: applied`, `version: 0.2.2`
- registry tarball answered HEAD 200 on try 24
- installed copy `client.js` is 780967 bytes, SHA-256 `1829B38B0EBE284E...`, byte-identical to the repository copy; installed `package.json` says `0.2.2`
- this is a code change (settings.js writer lane, the liveness check, one new fixture), so the running window still has the 0.2.1 chunk until the app restarts

## E-PROBE — the new checks can fail

Each probe below breaks one protected behaviour in a working copy of the sources, rebuilds it, runs the suite that should see it, records the red line, and restores the copy. F1 and F9 were last run on the `0.2.3` tree (44 static, 260 browser); no probe was run on `0.2.4`, which `0.2.5` supersedes; F10–F13 ran on `0.2.5` (45 static, 274 browser), each in a fresh `%TEMP%` copy of the final tree, restored afterwards. So F1/F9's red lines and counts are `0.2.3` numbers, not the current tree's 45 / 274. `0.2.2` shipped 44 static and 252 browser checks, and F9's no-writer assertion did not exist there. F3–F8 are the earlier runs on the `0.2.1` tree (44 static, 251 browser) and were not re-run. The untouched `0.2.3` copy reported `all 44 checks passed` and `all 260 checks passed` before the breaks.

| probe | change | result |
|---|---|---|
| F1 | `index.js`: `briefing` ignores the switch and always appends the preference | `FAIL the section hands the host a function, not a frozen string — the same registration did not read the value again: the briefing is frozen at apply time`, `FAIL the capability briefing is what it was before the switch — capability text is 155 words, budget is 95`, `FAIL the switch adds the preference on top of the capability, and nothing else — the switch is on and nothing was added`, `check-bundle: 3 failed, 41 passed`, exit 1; last run on the `0.2.3` tree, not re-run since |
| F2 | `index.js`: `text: briefing(config)` instead of `text: () => briefing(config)` | `FAIL the section hands the host a function, not a frozen string — section text is a frozen string: the switch would only apply after a restart`, `check-bundle: 1 failed, 43 passed`, exit 1 |
| F3 | `index.js`: `visualFirst` default `false` | `FAIL the switch is on for an empty configuration — the switch does not default to on`, `check-bundle: 1 failed, 43 passed`, exit 1 |
| F4 | `src/client/entry.js`: locale registration run immediately instead of through `ctx.effect` | `[bad] styles and strings are claimed as effects — 1`, `[bad] the locale registration is dropped — 0`, `run-harness: 2 failed, 249 passed`, exit 1 |
| F5 | `src/client/settings.js`: a rejected write drops `store.set(before)` | `[bad] a rejected write leaves the switch where the host put it — true`, `run-harness: 1 failed, 250 passed`, exit 1 |
| F6 | `src/client/settings.js`: `setValue` calls `face.set` twice | `[bad] one click asks the host for the opposite value once — [["visualFirst",false],["visualFirst",false]]`, `[bad] the second click tries the other value once — [["visualFirst",false],["visualFirst",false],["visualFirst",true],["visualFirst",true]]`, `[bad] a rejected write leaves the switch where the host put it — true`, `[bad] a rejected write explains itself in the status sentence — 已保存`, `run-harness: 4 failed, 247 passed`, exit 1 |
| F7 | `src/client/settings.js`: `aria-checked` always `true` | `[bad] the switch turns off after the write — true`, `[bad] a rejected write leaves the switch where the host put it — true`, `[bad] the switch starts off when the host already says off — true`, `run-harness: 3 failed, 248 passed`, exit 1 |
| F8 | `src/client/i18n.js`: `hostKey` returns the bare key | `[bad] a host dictionary that already owns a word does not put it on our button — 复制成功`, `[bad] a host that translates the namespaced key is used — 已复制`, `run-harness: 2 failed, 249 passed`, exit 1 |
| F9 | `src/client/settings.js`: attach `setValue` regardless of `face.set` (`if (face) {` instead of `if (face && typeof face.set === 'function') {`) | `[bad] a host whose face has no setter hands the row no writer at all — setValue is function`, `run-harness: 1 failed, 259 passed`, exit 1; last run on the `0.2.3` tree, not re-run since |
| F10 | `src/client/settings.js`: `restore` puts back the value captured before the click and never asks the face again | `[bad] a refused write keeps the value the host took while it was pending — aria-checked=false host=true status=保存失败，开关保持原来的状态。`, `run-harness: 1 failed, 273 passed`, exit 1 |
| F11 | `src/client/entry.js`: drop the `face.subscribe` effect, so a value the host pushes never reaches the store | `[bad] a refused write that resolves false puts the switch back and says so — sets=[["visualFirst",false],["visualFirst",true],["visualFirst",true]] aria-checked=true host=true status=保存失败，开关保持原来的状态。`, `[bad] a value the host pushes reaches the switch without a write — aria-checked=true paint rgb(74, 108, 247) -> rgb(74, 108, 247)`, `run-harness: 2 failed, 272 passed`, exit 1 |
| F12 | `index.js`: one word changed in the capability sentence (`in place inside the conversation.` → `in place within the conversation.`) | `FAIL the capability briefing is what it was before the switch — the off-state briefing no longer carries feature 001's sentence: …`, `check-bundle: 1 failed, 44 passed`, exit 1 |
| F13 | `src/client/settings.js`: the `pending.then(...)` chain moved outside the `try` | `[bad] a thenable that throws out of then cannot break the click — threw=no uncaught=Script error. aria-checked=false host=true status=none`, `run-harness: 1 failed, 273 passed`, exit 1 |

The function-form break (F2) was not caught by the suites before the function check existed: a frozen `text` string kept every earlier check green, and only `the section hands the host a function, not a frozen string` sees it. That is why the check was added; in the E-CHK order it is #22 of the 44 checks.

After restoring and rebuilding, the `0.2.1` probe session passed again: `build-client` reported `sources 6, syntax ok`, `check-bundle` reported `all 44 checks passed`, `run-harness` reported `all 251 checks passed`. The `0.2.3` re-runs of F1 and F9 reported the untouched copy as `all 44 checks passed` and `all 260 checks passed` before the breaks. The `0.2.5` probes (F10–F13) each started from a fresh copy of the final tree and were restored afterwards; that tree's own suites are green at 45 / 274 (see "E-CHK/E-HARN · 0.2.5"). The `0.2.4` tree itself was never probed (G10, discharged on `0.2.5`).

Two fixture details are worth recording. Headless Chrome's virtual time does not advance the 120 ms CSS transition on the switch, so the paint assertion sets `style.transition = 'none'` on the switch before reading the computed colour (`verify/harness/index.html:1596`). React 18 routes an event-handler throw to `window`'s `error` event rather than rethrowing it from `.click()`, so F13's fixture watches that event instead of expecting a throw at the call site (`verify/harness/index.html:1655-1667`).

## E-GAPS — not proven here

| gap | what is missing |
|---|---|
| G1 | The switch was not operated in a live DSH window: the row is proven in the browser fixture (fake `configForms`), not against the running host service. |
| G2 | The write path to the host (`settings.update`) was not exercised end to end; the fixture proves only that our half calls `set` once and honours its answer. |
| G3 | The row label is asserted in the fixture in all eight languages (`the row label is our own sentence, not a host key — 优先用图，而不是成段文字` for zh, plus one label assertion per other language after this review pass). No narrow-layout assertion exists: neither suite renders the row at 360px or at 200% font size. No assertion compares a non-English string with its English counterpart word for word. |
| G4 | The renamed names were not seen in a live window (plugin page, settings row); 8 titles are proven in the locale files and by assertion. |
| G5 | No screenshot comparison against host rows (SC-008); the row uses host tokens and matches the neighbour row structure by construction, not by pixels. |
| G6 | The E1–E14 end-to-end rows in `quickstart.md` were not run against a live host; no live window was observed for this feature. |
| G7 | SC-001's five sample requests were not run: no model was asked to answer them with the switch on, so the briefing's effect on real answers is untested. |
| G8 | `@deepseek-ai/schemastery` is a static import in `index.js`; if the package cannot resolve, the plugin fails to load at import time. There is no graceful degradation, and this failure path was not exercised. |
| G9 | **Discharged in `0.2.5`**: `the capability briefing is what it was before the switch` (`verify/check-bundle.mjs:401-429`) parses the four `MERMAID_RENDER_PROMPT` sentences read-only out of `specs/001-mermaid-fence-render/contracts/host-prompt.md` and asserts exact equality (`text === recorded.join(' ')`) as well as one `includes` per sentence, so one changed word in `index.js` goes red (F12). Still unproven: a comparison with a running feature 001 build — the reference is 001's recorded contract, and no 001 binary was kept. |
| G10 | **Discharged in `0.2.5`**: four probes (F10–F13) ran on the `0.2.5` tree, each in a fresh `%TEMP%` copy, one per round-5 fix. The `0.2.4` tree itself was never probed — `0.2.5` carries its code plus the fixes, so it supersedes it. F1 and F9 have still not been re-run since `0.2.3`: F1's target (`index.js`) is unchanged since then, while F9's target line in `src/client/settings.js` still exists but that file changed twice after `0.2.3`; neither is a re-run. |

## E-PUB publish

| version | tag | workflow run | shasum | transparency log | files |
|---|---|---|---|---|---|
| 0.2.0 | `v0.2.0` | `45194947185` | `c3bedd58f4973d3752043532caeb1f6bf781fc48` | `logIndex=4051965933` | 33 of the packed set, npm `total files: 33` |

CI lines from that run:

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.0 | client.js 780550 bytes | sources sha256:db71eb3381be5f8bbd6a8701f8f9ea06 | all 43 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.0 | client.js 780550 bytes | sources sha256:db71eb3381be5f8bbd6a8701f8f9ea06 | all 251 checks passed (/usr/bin/google-chrome)
```

The first two tag pushes (`45194558416`, `45194732082`) failed and published nothing: the workflow had never needed `npm ci`, so `index.js` could not import `@deepseek-ai/schemastery`. The workflow now installs the manifest's own dependencies before rebuilding and checking, and the tag was moved onto that fix.

## E-INS install into the live profile

| what | value |
|---|---|
| command | `remove_bundle @jiezhengj/dsh-dyslexia` then `install_bundle @jiezhengj/dsh-dyslexia@0.2.0` |
| result | `application: applied`, `version: 0.2.0`, pnpm `+ @jiezhengj/dsh-dyslexia 0.2.0` |
| profile dependency | `"@jiezhengj/dsh-dyslexia": "0.2.0"` |
| installed `client.js` | unverified — the 0.2.0 tarball hash was not recorded |
| repository `client.js` | unverified — the 0.2.0 tarball hash was not recorded |

Both `client.js` rows are unverified because that hash was never recorded for 0.2.0: `client.js` embeds the version, so the fingerprint hashes it; the 780550 bytes and SHA256 that stood here before are the 0.2.1 artifact's, not 0.2.0's.

The 0.2.0 rows above stay as history. 0.2.1 followed the feature-002 review and was not documentation-only: besides the wording corrections it added the function-form check to `verify/check-bundle.mjs` (#22) and rebuilt `client.js` with it. It was published (run `45204279829`, shasum `b5c03c272b89f53f2416a5140c29b212b5f55b7a`, logIndex `4053240981`) and installed (E-PUB/E-INS 0.2.1 below); E-CHK and E-HARN in this file are that tree. 0.2.2 is the later code change recorded in E-PUB · 0.2.2 and E-INS · 0.2.2 above (the E-PUB · 0.2.2 and E-INS · 0.2.2 sections above); the counts near the top of this file belong to the `0.2.1` and `0.2.4` trees, not to `0.2.2`.

## E-PUB publish, 0.2.1

| version | tag | workflow run | shasum | transparency log | files |
|---|---|---|---|---|---|
| 0.2.1 | `v0.2.1` | `45204279829` | `b5c03c272b89f53f2416a5140c29b212b5f55b7a` | `logIndex=4053240981` | 33 |

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.1 | client.js 780550 bytes | sources sha256:6b5d4e192279b1294304cbed6303e546 | all 44 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.1 | client.js 780550 bytes | sources sha256:6b5d4e192279b1294304cbed6303e546 | all 251 checks passed (/usr/bin/google-chrome)
```

## E-INS install, 0.2.1

| what | value |
|---|---|
| command | `remove_bundle @jiezhengj/dsh-dyslexia` then `install_bundle @jiezhengj/dsh-dyslexia@0.2.1` |
| result | `application: applied`, `version: 0.2.1`, pnpm `+ @jiezhengj/dsh-dyslexia 0.2.1` |
| installed `client.js` | 780550 bytes, same SHA256 as the repository copy (`5BD4168C2F8971F67B0982CC3E73BE01EC49BE9DAAA01474EDA245CC401DD85A`) |

## E-PUB · 0.2.3

- tag `v0.2.3` on commit `acb4343`, pushed to `main`; Actions run `45219837527` concluded `success`
- CI, verbatim: `check-bundle: @jiezhengj/dsh-dyslexia@0.2.3 | client.js 780967 bytes | sources sha256:72f28eeb68d05c266cb96c689b0dbce6 | all 44 checks passed` and `run-harness: @jiezhengj/dsh-dyslexia@0.2.3 | client.js 780967 bytes | sources sha256:72f28eeb68d05c266cb96c689b0dbce6 | all 260 checks passed (/usr/bin/google-chrome)`
- `npm notice shasum: 60b0136612e52b64e1e3920117ed3f41b9185e05`, `npm notice total files: 33`

## E-INS · 0.2.3

- `remove_bundle @jiezhengj/dsh-dyslexia` removed `0.2.2`; `install_bundle @jiezhengj/dsh-dyslexia@0.2.3` returned `application: applied`, `version: 0.2.3`
- registry tarball answered HEAD 200 on try 20
- installed copy `client.js` is 780967 bytes, SHA-256 `8C7E4EE76D95304D738CA44F2E7605B079CD2D64AC54332A52D7B20C70E9E211`, byte-identical to the repository copy; installed `package.json` says `0.2.3`; `locale/` 8 files, `docs/` 9
- this is a build and verification change, not a logic change: the six sources are unchanged (only the version string and the fingerprint differ); `client.js` is now compared byte for byte with a rebuild of them, while `scripts/build-client.mjs`, the fixtures and the docs carry the work (the no-writer lane is asserted directly, the throwing thenable is covered, all eight settings labels are asserted, and the stale AGENTS.md snippet is gone). A window that was already open keeps the `0.2.2` chunk until DSH restarts.

## E-PUB · 0.2.4

- tag `v0.2.4`, commit `b2ce0a9`, Actions run `45230719544` success
- CI printed `check-bundle: @jiezhengj/dsh-dyslexia@0.2.4 | client.js 781963 bytes | sources sha256:9f13d80f0230257569dd0e525c6eb048 | all 45 checks passed` and `run-harness: @jiezhengj/dsh-dyslexia@0.2.4 | client.js 781963 bytes | sources sha256:9f13d80f0230257569dd0e525c6eb048 | all 271 checks passed (/usr/bin/google-chrome)`
- `npm notice shasum: 2a731d8c13067d88859eeec4f918773b1fd9578c`, `npm notice total files: 33`, unpacked 874520 bytes
- registry tarball answered HEAD 200 on try 1

## E-INS · 0.2.4

- `remove_bundle @jiezhengj/dsh-dyslexia` removed `0.2.3`; `install_bundle @jiezhengj/dsh-dyslexia@0.2.4` returned `application: applied`, `version: 0.2.4`
- installed copy `client.js` is 781963 bytes, SHA-256 `D74D8083E8E417F578A3E26B10C986CEBDEDBA84C7A7F03114A250D0AB3B6DFB`, byte-identical to the repository copy; installed `package.json` says `0.2.4`; `locale/` 8, `docs/` 9
- this is a code change (the resolved-write result is now read; the row waits for `configForms`): a window that is already open keeps the `0.2.3` chunk until the app restarts

## E-PUB · 0.2.5

- commit `0be17fe` ("0.2.5: refuse-write honesty against the host's real value, an external-change fixture, a verbatim 001 briefing guard"), tag `v0.2.5` ("0.2.5: the switch follows the host, not the click"), both pushed to `main`
- GitHub Actions run `45240437544`, conclusion `success`, workflow `publish`, head branch `v0.2.5`
- CI, verbatim:

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.5 | client.js 783360 bytes | sources sha256:2b5728286c556d8dbaaa349cc9fb8ec5 | all 45 checks passed
npm notice shasum: c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8
npm notice total files: 33
run-harness: @jiezhengj/dsh-dyslexia@0.2.5 | client.js 783360 bytes | sources sha256:2b5728286c556d8dbaaa349cc9fb8ec5 | all 274 checks passed (/usr/bin/google-chrome)
```

## E-INS · 0.2.5

- registry tarball `dsh-dyslexia-0.2.5.tgz` answered HEAD 200 on poll `try=15` (20 s apart); the version document answered before the tarball did, as in every earlier release
- `remove_bundle @jiezhengj/dsh-dyslexia` removed `0.2.4` (pnpm printed `- @jiezhengj/dsh-dyslexia 0.2.4`), then `install_bundle @jiezhengj/dsh-dyslexia@0.2.5` returned `application: applied`, `version: 0.2.5` (pnpm `+ @jiezhengj/dsh-dyslexia 0.2.5`, and it added a `minimumReleaseAgeExclude` line for this version)
- installed copy at `C:\Users\jiezhengj\.dsh\profiles\desktop\node_modules\@jiezhengj\dsh-dyslexia`: `package.json` version `0.2.5`; `client.js` 783360 bytes, SHA-256 `279C33781EF551E3D3BBB0AABF3D37A681FD5DA4F4738C29C724B596667A8766`, identical to the repository copy; `locale/` 8 files; `docs/` 9 entries; the profile `package.json` dependency reads `"@jiezhengj/dsh-dyslexia": "0.2.5"`
- this is a code release: a window that was already open keeps the `0.2.4` chunk until the app restarts, so the live window has still not shown this build — T020 and G1 stay open

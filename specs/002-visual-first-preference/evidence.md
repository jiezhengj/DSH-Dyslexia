# Evidence — feature 002: the preference switch and the new name

This file records what was actually observed while building feature 002. Every block below is one run on one tree; nothing is copied from another version. The E-PUB and E-INS blocks record the last published version, 0.2.0, as history; everything else was re-run on the 0.2.1 tree.

## E-BLD build

```
build-client: @jiezhengj/dsh-dyslexia -> client.js (780550 bytes, 779035 characters, engine 1.13.0, sources 6, syntax ok)
```

## E-CHK static and behavioural checks (44)

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

## E-HARN browser checks (251)

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

## E-PROBE — the new checks can fail

Each new check was shown to fail with its own break. The break was applied to a working copy of the sources, rebuilt, run, then restored; the tree ended where it started.

| probe | change | result |
|---|---|---|
| F1 | `index.js`: `briefing` ignores the switch and always appends the preference | `FAIL the capability briefing is what it was before the switch — capability text is 155 words, budget is 95`, `FAIL the switch adds the preference on top of the capability, and nothing else — the switch is on and nothing was added`, `FAIL the section hands the host a function, not a frozen string — two captures with different values produced the same text`, `check-bundle: 3 failed, 41 passed`, exit 1 |
| F2 | `index.js`: `text: briefing(config)` instead of `text: () => briefing(config)` | `FAIL the section hands the host a function, not a frozen string — section text is a frozen string: the switch would only apply after a restart`, `check-bundle: 1 failed, 43 passed`, exit 1 |
| F3 | `index.js`: `visualFirst` default `false` | `FAIL the switch is on for an empty configuration — the switch does not default to on`, `check-bundle: 1 failed, 43 passed`, exit 1 |
| F4 | `src/client/entry.js`: locale registration run immediately instead of through `ctx.effect` | `[bad] styles and strings are claimed as effects — 1`, `[bad] the locale registration is dropped — 0`, `run-harness: 2 failed, 249 passed`, exit 1 |
| F5 | `src/client/settings.js`: a rejected write drops `store.set(before)` | `[bad] a rejected write leaves the switch where the host put it — true`, `run-harness: 1 failed, 250 passed`, exit 1 |
| F6 | `src/client/settings.js`: `setValue` calls `face.set` twice | `[bad] one click asks the host for the opposite value once — [["visualFirst",false],["visualFirst",false]]`, `[bad] the second click tries the other value once — [["visualFirst",false],["visualFirst",false],["visualFirst",true],["visualFirst",true]]`, `[bad] a rejected write leaves the switch where the host put it — true`, `[bad] a rejected write explains itself in the status sentence — 已保存`, `run-harness: 4 failed, 247 passed`, exit 1 |
| F7 | `src/client/settings.js`: `aria-checked` always `true` | `[bad] the switch turns off after the write — true`, `[bad] a rejected write leaves the switch where the host put it — true`, `[bad] the switch starts off when the host already says off — true`, `run-harness: 3 failed, 248 passed`, exit 1 |
| F8 | `src/client/i18n.js`: `hostKey` returns the bare key | `[bad] a host dictionary that already owns a word does not put it on our button — 复制成功`, `[bad] a host that translates the namespaced key is used — 已复制`, `run-harness: 2 failed, 249 passed`, exit 1 |

The function-form break (F2) was not caught by the suites before check 44 existed: a frozen `text` string kept every earlier check green, and only `the section hands the host a function, not a frozen string` sees it. That is why 44 was added.

After restoring and rebuilding, the tree passed again: `build-client` reported `sources 6, syntax ok`, `check-bundle` reported `all 44 checks passed`, `run-harness` reported `all 251 checks passed`.

## E-GAPS — not proven here

| gap | what is missing |
|---|---|
| G1 | The switch was not operated in a live DSH window: the row is proven in the browser fixture (fake `configForms`), not against the running host service. |
| G2 | The write path to the host (`settings.update`) was not exercised end to end; the fixture proves only that our half calls `set` once and honours its answer. |
| G3 | Only the zh row text is asserted in the fixture (`the row label is our own sentence, not a host key — 优先用图，而不是成段文字` and its hint). No narrow-layout assertion exists: neither suite renders the row at 360px or at 200% font size. The six non-zh translations are proven only by the 16-keys-x-8-languages completeness check and by differing from English, not by being rendered. |
| G4 | The renamed names were not seen in a live window (plugin page, settings row); 8 titles are proven in the locale files and by assertion. |
| G5 | No screenshot comparison against host rows (SC-008); the row uses host tokens and matches the neighbour row structure by construction, not by pixels. |
| G6 | The E1–E14 end-to-end rows in `quickstart.md` were not run against a live host; no live window was observed for this feature. |
| G7 | SC-001's five sample requests were not run: no model was asked to answer them with the switch on, so the briefing's effect on real answers is untested. |
| G8 | `@deepseek-ai/schemastery` is a static import in `index.js`; if the package cannot resolve, the plugin fails to load at import time. There is no graceful degradation, and this failure path was not exercised. |

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
| installed `client.js` | 780550 bytes, SHA256 `0014F3499121F6C6D8E5973662441E5E5DF3DFA37A5EFF2EB53253935EA29D85` |
| repository `client.js` | same 780550 bytes and the same SHA256 |

0.2.0 is the last published version. 0.2.1 is the documentation-only correction that follows the feature-002 review: it is not tagged, not published and not installed; the 0.2.0 rows above stay as history, and the checks in this file were re-run on the 0.2.1 tree.

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
| installed `client.js` | 780550 bytes, same SHA256 as the repository copy (`0014F3499121F6C6D8E5973662441E5E5DF3DFA37A5EFF2EB53253935EA29D85`) |

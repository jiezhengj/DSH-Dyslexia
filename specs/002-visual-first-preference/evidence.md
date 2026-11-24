# Evidence — feature 002: the preference switch and the new name

This file records what was actually observed while building feature 002. Each block is one run on one tree — E-PROBE is the exception, collecting one run per probe, the tree of each probe is named in the list just below the table; F1, F9, F14, F15, P24, P30 and P29 also name it inside their row (P24 and P30 were re-run on `0.2.11`, P29 on `0.2.13`); no block mixes trees silently. E-PUB/E-INS exist for every published version of this feature, `0.2.0` through `0.2.14` (the package also carries the earlier `0.1.x` line and one `0.0.0-stage` placeholder, which this file does not record); the current blocks are the `0.2.14` tree (62 static, 299 browser). The `0.2.1` blocks below (44 static, 251 browser) are kept as history; the `0.2.5` build line and the `0.2.5` check runs are summary lines in their own sections, not transcripts. **The current tree is `0.2.14`**, prepared after the tenth review and not yet committed, released or installed — the same tree this file's current blocks measured: 62 static and 299 browser checks, `client.js` 787768 bytes / 786251 characters, sources sha256 `486b90e17026855e9e7d9e769845d106`, file SHA-256 `B1B3039E5B937AA9E69B4C0C6C8728A20CAA0CF36090B158F06DB1FFBFAC0F23`. It replaced `0.2.13` (55 static / 294 browser, `client.js` 787768 bytes, sources sha256 `bec49f4eeba79400e467078384088f38`, file SHA-256 `A22E6E3AA23E14CF927CF62E61E7EBD70307AEF5DDAB4615930DEE39771B70DF`), which replaced `0.2.12` (52 static / 292 browser, `client.js` 787768 bytes, sources sha256 `838eef8dcc57b574bd405b70689df2e9`, file SHA-256 `C58A4DD653B5973C7B60E3F8EE2658989E74EEEB6BD27192DA24B25540652F2C`), which replaced `0.2.11` (51 static / 292 browser, `client.js` 787768 bytes, sources sha256 `25576ab91ac35a54cd3ec710e0e2ba93`, file SHA-256 `14C6514A5D504676C04137D943A0D6B791A1441548C1160B6149280451A35975`), which replaced `0.2.10` (50 static / 292 browser, `client.js` 787768 bytes, sources sha256 `25fe69385f7372015944ae0b18386c31`), which replaced `0.2.9` (49 static / 287 browser, `client.js` 787688 bytes, sources sha256 `b6c17c26e57f7d50cd2ed86a9002ad28`), which replaced `0.2.8` (47 / 283, `client.js` 787325 bytes, sources sha256 `a82c554f992a9871b4b8dcdff8499f7b`). E-PROBE records F3–F8 on `0.2.1`, F1/F9 on the `0.2.3` tree, F10–F13 on `0.2.5`, F14 on `0.2.6`, F15 on `0.2.7`, P19/P20 on `0.2.8`, P21–P23 on `0.2.9`, P24–P27 on `0.2.10`, P28–P30 on `0.2.11`, P31/P32 on `0.2.12`, P29's re-run with P33–P35 on `0.2.13`, and P36's eight cases on `0.2.14`; the `0.2.4` tree itself was never probed, and `0.2.5` supersedes it (G10 discharged).

## E-BLD · 0.2.1 build

The `0.2.1` tree (the tree E-CHK and E-HARN below quote):

```
build-client: @jiezhengj/dsh-dyslexia -> client.js (780550 bytes, 779035 characters, engine 1.13.0, sources 6, syntax ok)
```

## E-BLD · 0.2.5 build

The `0.2.5` tree; `client.js` on disk measured 783360 bytes and 781845 characters, the pair this line prints:

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

Only the summary lines were recorded on this tree; the full stdout above stays the `0.2.1` transcript.

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.5 | client.js 783360 bytes | sources sha256:2b5728286c556d8dbaaa349cc9fb8ec5 | all 45 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.5 | client.js 783360 bytes | sources sha256:2b5728286c556d8dbaaa349cc9fb8ec5 | all 274 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

CI on run `45240437544` printed the same two lines for the tagged commit (only the browser path differs, `/usr/bin/google-chrome`), so these are the published release's numbers and not a local run alone; the verbatim CI block is under "E-PUB · 0.2.5" below.

The three browser assertions this round added are `a refused write keeps the value the host took while it was pending` (`verify/harness/index.html:1549` on the `0.2.5` tree, `:1670` here), `a value the host pushes reaches the switch without a write` (`:1612` on `0.2.5`, `:1733` here) and `a thenable that throws out of then cannot break the click` (`:1676` on `0.2.5`, `:1797` here); the static side changed in two places: inside `the capability briefing is what it was before the switch` (`verify/check-bundle.mjs:435`), and in the guard list of `the fixtures assert what the fixes promise, and can fail` (check #55), where `verify/check-bundle.mjs:1338-1341` adds the three names `'a refused write keeps the value the host took while it was pending'`, `'a value the host pushes reaches the switch without a write'` and `'a thenable that throws out of then cannot break the click'`, and `:1345` raises `NEEDED_COUNT` from 40 to 43; the `:1341` name `'a host that gains configForms after apply still gets the settings row'` was already present in `0.2.4` and is unchanged context, so the static count is unchanged at 45.

## E-PROBE — the new checks can fail

Each probe below breaks one protected behaviour in a working copy of the sources, rebuilds it, runs the suite that should see it, records the red line, and restores the copy. F1 and F9 were last run on the `0.2.3` tree (44 static, 260 browser); no probe was run on `0.2.4`, which `0.2.5` supersedes; F10–F13 ran on `0.2.5` (45 static, 274 browser), each in a fresh `%TEMP%` copy of the final tree, restored afterwards. So F1/F9's red lines and counts are `0.2.3` numbers, not the `0.2.5` tree's 45 / 274 (the `0.2.9` tree ran 49 static and 287 browser checks, the `0.2.10` tree 50 and 292, the `0.2.11` tree 51 and 292, the `0.2.12` tree 52 and 292, and this `0.2.13` tree runs 55 static and 294). `0.2.2` shipped 44 static and 252 browser checks, and F9's no-writer assertion did not exist there. F3–F8 are the earlier runs on the `0.2.1` tree (44 static, 251 browser) and were not re-run. The untouched `0.2.3` copy reported `all 44 checks passed` and `all 260 checks passed` before the breaks.

| probe | change | result |
|---|---|---|
| F1 | `index.js`: `briefing` ignores the switch and always appends the preference | `FAIL the section hands the host a function, not a frozen string — the same registration did not read the value again: the briefing is frozen at apply time`, `FAIL the capability briefing is what it was before the switch — capability text is 155 words, budget is 95`, `FAIL the switch adds the preference on top of the capability, and nothing else — the switch is on and nothing was added`, `check-bundle: 3 failed, 41 passed`, exit 1; last run on the `0.2.3` tree, not re-run since |
| F2 | `index.js`: `text: briefing(config)` instead of `text: () => briefing(config)` | `FAIL the section hands the host a function, not a frozen string — section text is a frozen string: the switch would only apply after a restart`, `check-bundle: 1 failed, 43 passed`, exit 1; historical record, not one of the fourteen counted probes (F1, F3–F15): that line comes from the `0.2.1` tree's 44 static checks (43 passed + 1 failed), not from the `0.2.5` tree's 45 |
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
| F14 | `src/client/settings.js`: the `useVisualFirst` branch removed, back to reading only `props.hooks` | `[bad] a host that passes hooks as hook props still gets a visible row — nothing rendered`, `[bad] the switch follows the value the host hook reports — no switch`, `[bad] clicking the switch writes through the writer the host gave it — []`, `[bad] the switch then shows the value the host now holds — no switch`, `run-harness: 4 failed, 276 passed`, exit 1; the static suite reds too: `FAIL the settings row reads the hook the host builds, not an object it never sends — settings.js does not read the useVisualFirst hook prop`, `check-bundle: 1 failed, 46 passed`. Run on the `0.2.6` tree, whose static suite had 47 checks. |
| F15 | `src/client/settings.js`: `getSnapshot()` dropped from the value store | `FAIL the settings row reads the hook the host builds, not an object it never sends — the value store does not carry the getSnapshot/subscribe pair a host hook is built from`, `check-bundle: 1 failed, 46 passed`, exit 1; and the harness sees it too: `[bad] the store this module hands the host can be read the way the host reads it — get=function getSnapshot=undefined subscribe=function`, `[bad] a hook built from that store draws the switch — no switch`, `run-harness: 2 failed, 281 passed`, exit 1. Run on the `0.2.7` tree. |
| P19 | `src/client/entry.js`: `if (typeof ctx.get === 'function') {` → `if (false) {` | `FAIL a service the plugin never declared is read through ctx.get — ctx.get was not consulted for locale`, `check-bundle: 2 failed, 45 passed` (the second red line is `client.js matches the sources it claims — client.js is stale: rebuild it …`, because the edit was not rebuilt), exit 1 (the other failure is the stale-chunk line, which any source change produces). **On the `0.2.7` tree this break left the static suite green** — the check only grepped for `function optional(`/`optional(ctx, 'locale')` — so `0.2.8` executes the sliced reader: `optional({ get: (name) => 'via-get:' + name, get locale() { throw } }, 'locale')` must answer `via-get:locale`, and a host without `ctx.get` must still answer from the property. |
| P20 | `src/client/settings.js`: `if (accepted) {` → `if (true) {` (a refusal reported as saved) | `FAIL a refused settings write is not reported as saved — the settle handler does not branch on what the host answered`, `check-bundle: 2 failed, 45 passed` (the second red line is the stale-chunk one; the named check is the first), exit 1. **On the `0.2.7` tree this break also left the static suite green** (it only grepped for `result === true` elsewhere in the file); `0.2.8` slices the `settle` handler and requires `if (accepted)`, the failure sentence and `restore(before)` inside it. |
| P21 | `src/client/settings.js`: `return value === undefined ? true : value !== false` → `? false :` (a snapshot without the field read as off) | `FAIL a face that cannot answer still reads as on — a snapshot that carries no field read as false, expected true`, `check-bundle: 1 failed, 48 passed`, exit 1; and in the browser `[bad] a snapshot that carries no field still shows the switch on — aria-checked=false`, `[bad] a snapshot that is not an object still shows the switch on — aria-checked=false`, `run-harness: 2 failed, 285 passed` |
| P22 | `src/client/i18n.js`: `if (trimmed.indexOf(key) !== -1)` → `=== -1` (the echoed key accepted as a translation) | `FAIL host key echo falls back to bundled strings — i18n.js accepts the key echoed back`, `FAIL a host word is used only when it is a real translation — a real translation was accepted as a translation (false)`, `check-bundle: 2 failed, 47 passed`; browser `[bad] a host t that echoes the key still shows words — dyslexia.showSource \| …`, `[bad] no internal key reaches the eye — leaked: syntaxError`, `run-harness: 5 failed, 282 passed` |
| P23 | `src/client/settings.js`: `const value = shown === null ? props.value === true : shown` → `const value = props.value === true` (the requested value no longer shows while the host decides) | `[bad] a pending write shows the requested value before the host answers — aria-checked=true`, `run-harness: 1 failed, 286 passed`, exit 1; the static suite stayed green, which is why the browser assertion was added |
| P24 | `src/client/settings.js`: `const SETTINGS_SLOT = 'settings.general.item'` → `'settings.general.item-x'` (the owner key the host never names) | `FAIL the row is claimed through the slot name the host declares — settings.js does not name the general settings slot`, `check-bundle: 1 failed, 50 passed`, exit 1; `[bad] the row is claimed through the slot the host names — conversation.chat.markdown.fence,settings.general.item-x`, `[bad] the row registers on the general settings slot and nowhere else — 1 defs, 0 on the slot`, `[bad] the row carries its id, order and locale — undefined undefined undefined`, `[bad] the store this module hands the host can be read the way the host reads it — no store`, then seven more `[bad]` lines (the hook-built store, the row render, the label, the hint, the value, the name and description, the keyboard), then the fixture aborts: `[bad] fixture aborted — TypeError: Cannot read properties of null (reading 'click')`; `run-harness: 12 failed, 237 passed`. Run on the `0.2.11` tree. The static suite only learned to see this in `0.2.10`, when the break was first exercised; this row re-runs it on `0.2.11` (`1 failed, 50 passed`). |
| P25 | `src/client/entry.js`: `if (!face) return false` removed (`configForms.get(...)` returned `null`, then used) | `[bad] a host whose face lookup finds nothing stays quiet — dsh-dyslexia: settings row TypeError: Cannot read properties of null (reading 'subscribe')`, `run-harness: 1 failed, 291 passed`. Silent before this build: the warning was swallowed with no assertion reading the console. |
| P26 | `src/client/entry.js`: `if (!configForms \|\| typeof configForms.get !== 'function') return false` removed | `[bad] a host with no configForms stays quiet — dsh-dyslexia: settings row TypeError: Cannot read properties of undefined (reading 'get')`, `run-harness: 1 failed, 291 passed`. Silent before this build, for the same reason. |
| P27 | `src/client/entry.js`: `if (!slots) return false` removed from `wireSettingsRow` | **no red line**: `run-harness: … all 292 checks passed`. `apply` already returns before this path when `slots` cannot inject or register, so the check is unreachable rather than proven; it stays as defence and is recorded in G15 instead of being called verified. |
| P28 | `index.js`: `claimSettingsPage(ctx)` call removed from `apply` | `FAIL the settings page is claimed with auto off, once per context — 0 configure calls for one context`, `check-bundle: 1 failed, 50 passed`. Silent before this build: neither suite mentioned the call, so a regression would have shipped. |
| P29 | `src/client/styles.js` edited without rebuilding: one comment line appended (a stale chunk) | `run-harness: client.js is stale: rebuild it (chunk bec49f4eeba79400e467078384088f38, sources 9b06cbf0757113f6f9fbe4206d976a46)`, exit 1; the static suite reds the same edit — `FAIL client.js matches the sources it claims — client.js is stale: rebuild it (chunk bec49f4eeba79400e467078384088f38, sources 9b06cbf0757113f6f9fbe4206d976a46)`, `check-bundle: 1 failed, 54 passed`. Silent before `0.2.11`: the harness printed the stamp baked into the chunk and passed. Before `0.2.13` the fingerprint covered only the six client sources, so a vendor edit rebuilt into a different chunk kept the same fingerprint. Run on the `0.2.13` tree; the `0.2.11` run of this probe (`chunk 25576ab9…`, `1 failed, 50 passed`) is superseded. |
| P30 | `src/client/settings.js`: the `role: 'switch',` line dropped from the row's markup | `[bad] a hook built from that store draws the switch — no switch`, `[bad] the switch shows the value the host reports — no switch`, `[bad] the switch is named and described by the visible sentences — null -> missing \| null -> missing`, `[bad] the switch keeps the keyboard — no switch`, `[bad] fixture aborted — TypeError: Cannot read properties of null (reading 'click')` (each name printed once — the abort stops the fixture before the second mount path); `run-harness: 5 failed, 244 passed`, and 292 − (244 + 5) = 43 checks never executed. The static suite stays green (`all 51 checks passed`). Run on the `0.2.11` tree. |
| P31 | `index.js`: `.default(true).volatile()` → `.default(true)` (the field stops being volatile) | `FAIL the switch is on for an empty configuration — visualFirst is not a live value`, `FAIL the preference field is volatile, so the settings form can show it — index.js no longer declares visualFirst as a volatile boolean defaulting to true`, `check-bundle: 2 failed, 50 passed`, exit 1. Run on the `0.2.12` tree; no browser check moves. |
| P32 | `src/client/settings.js`: `SETTINGS_SLOT` renamed to `settings.general.item-x` **and** a decoy string `const DECOY_NOTE = "const SETTINGS_SLOT = 'settings.general.item'"` added | `FAIL the row is claimed through the slot name the host declares — settings.js declares SETTINGS_SLOT 2 times, expected exactly one`, `check-bundle: 2 failed, 50 passed` (the second is the stale-chunk line). Run on the `0.2.12` tree. The `0.2.11` check matched the sentence, so this decoy kept it green; the check now reads the assignment and refuses a second declaration. |
| P33 | `vendor/pele/pele.global.js` edited without rebuilding: `/* probe */ ` prepended (a stale chunk that only a vendor-aware fingerprint can see) | `FAIL client.js matches the sources it claims — client.js is stale: rebuild it (chunk bec49f4eeba79400e467078384088f38, sources 044eff57fe64892c62e09ee6f9a0294f)`, `check-bundle: 1 failed, 54 passed`, exit 1. Silent before this build: `sources sha256` hashed only the six client sources, so two different chunks could carry one fingerprint. Run on the `0.2.13` tree. |
| P34 | `src/client/view.js`: the boundary's source fallback returned `null` instead of `sourceFallback(this.props.code)`, then rebuilt | `[bad] a hostile host block still leaves the source text — a host block that throws while rendering — "图里的语法有误，已改为显示源码。"`, `run-harness: 1 failed, 293 passed`, exit 1. The older fixture only asked for a non-empty message, which the note sentence satisfied; the new one looks for the source text itself. Static reds too (`a host block that throws cannot empty the message`, the failure branch no longer returns the source first). Run on the `0.2.13` tree. |
| P35 | `src/client/entry.js`: `ctx.effect(() => drop, 'dsh-dyslexia: figure styles')` deleted, no rebuild | stale line, then `FAIL the two host-side resources are handed to ctx.effect as disposables — the stylesheet drop is not returned from a ctx.effect setup`, `check-bundle: 2 failed, 53 passed`, exit 1. Run on the `0.2.13` tree. |
| P36a | `src/client/entry.js`: `if (!/without inject/.test(...)) report(...)` replaced by an unconditional report | `FAIL a host that refuses undeclared services is not reported as a fault — entry.js no longer recognises the refusal sentence`, `check-bundle: 2 failed, 60 passed` (the other line is the stale chunk). Green before `0.2.14`. |
| P36b | `src/client/view.js`: `if (this.state.failed && before !== now) this.setState({ failed: false })` removed | `FAIL a fence that failed comes back when its source changes — the boundary no longer notices a new source`, `2 failed, 60 passed`. Green before `0.2.14`. |
| P36c | `src/client/figure.js`: `missing.code = ENGINE_UNAVAILABLE` removed | `FAIL a missing engine is told apart from a broken diagram — the missing-engine error carries no code`, `2 failed, 60 passed`. Green before `0.2.14`. |
| P36d | `src/client/figure.js`: the `/parse\|syntax\|lexical\|invalid/i` test replaced by `false` | `FAIL a missing engine is told apart from a broken diagram — the engine message no longer decides the sentence`, `2 failed, 60 passed`. Green before `0.2.14`. |
| P36e | `src/client/i18n.js`: the unsupported-language fallback changed from `'en'` to `'de'` | `FAIL an unsupported language falls back to english — the fallback language is not english`, `2 failed, 60 passed`. Green before `0.2.14`. |
| P36f | `index.js`: `child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))` replaced by a direct call | `FAIL the settings page claim can be taken back — configure is called outside an effect, so the claim is never released`, `1 failed, 61 passed`. Green before `0.2.14`. |
| P36g | `scripts/build-client.mjs`: the no-React branch `return { apply: function () {}, inject: [] }` replaced by `return null` | `FAIL a host without react gets a silent module, not nothing — …`, `2 failed, 60 passed` (plus the byte-level stale line, since the builder is not a client source). Green before `0.2.14`. |
| P36h | `src/client/settings.js`: the `setState('idle')` before a write removed | `FAIL a new write clears the sentence the last one left — a new write no longer resets the sentence`, `2 failed, 60 passed`. Green before `0.2.14`. |
**This probe was first recorded on `0.2.6` as `1 failed, 47 passed` for a break that left both suites green** — a 47-item suite cannot report 1 failed and 47 passed, and deleting only the store method was not seen by anything: the substring check was satisfied by `face.getSnapshot()` elsewhere in the file and no fixture built a host hook out of the plugin's own store. `0.2.7` retargets the static check at the `createValueStore` body and adds two fixtures that mount a `useSyncExternalStore` hook made from the store the module hands over.


Five names above are printed from a template and never appear verbatim in the fixtures: two host shapes (`a host whose face lookup finds nothing`, `a host with no configForms`) are followed by ` stays quiet`, `a host t that echoes the key` is followed by ` still shows words`, and two of the three degraded snapshot shapes are followed by ` still shows the switch on` (the third, a snapshot getter that throws, is quoted in no row) — so a source grep finds the prefix, and `run-harness --list` prints the whole line.

The function-form break (F2) was not caught by the suites before the function check existed: a frozen `text` string kept every earlier check green, and only `the section hands the host a function, not a frozen string` sees it. That is why the check was added; in the E-CHK order it is #22 of the 44 checks.

After restoring and rebuilding, the `0.2.1` probe session passed again: `build-client` reported `sources 6, syntax ok`, `check-bundle` reported `all 44 checks passed`, `run-harness` reported `all 251 checks passed`. The `0.2.3` re-runs of F1 and F9 reported the untouched copy as `all 44 checks passed` and `all 260 checks passed` before the breaks. The `0.2.5` probes (F10–F13) each started from a fresh copy of the final tree and were restored afterwards; that tree's own suites are green at 45 / 274 (see "E-CHK/E-HARN · 0.2.5"). The `0.2.4` tree itself was never probed (G10, discharged on `0.2.5`). The probes that guard the live-window defect E-LIVE records are F14 and F15. F14 ran on a copy of the `0.2.6` tree (untouched copy: `all 47 checks passed`, `all 280 checks passed`) and F15 on a copy of the `0.2.7` tree (`all 47 checks passed`, `all 283 checks passed`) — on `0.2.6` the F15 break left both suites green, which is why `0.2.7` retargeted the static check and added the two store fixtures.

Two fixture details are worth recording. Headless Chrome's virtual time does not advance the 120 ms CSS transition on the switch, so the paint assertion sets `style.transition = 'none'` on the switch before reading the computed colour (`verify/harness/index.html:1599` on the `0.2.5` tree, `:1634` on `0.2.7`). React 18 routes an event-handler throw to `window`'s `error` event rather than rethrowing it from `.click()`, so F13's fixture watches that event instead of expecting a throw at the call site (`verify/harness/index.html:1655-1667` on the `0.2.5` tree, `:1689-1702` on `0.2.7`).

## E-BLD · 0.2.14 build

```console
build-client: @jiezhengj/dsh-dyslexia -> client.js (787768 bytes, 786251 characters, engine 1.13.0, sources 6, syntax ok)
```

## E-CHK · 0.2.14 static and behavioural checks (62)

```console
dsh-dyslexia: loader Error: host changed the loader
    at Object.load (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:285:60)
    at evalmachine.<anonymous>:1607:29
    at evalmachine.<anonymous>:1621:3
    at Script.runInContext (node:vm:149:12)
    at Script.runInNewContext (node:vm:154:17)
    at runInNewContext (node:vm:310:38)
    at loadChunk (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:274:3)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:285:3
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:284:1
dsh-dyslexia: loader TypeError: Cannot read properties of undefined (reading 'load')
    at evalmachine.<anonymous>:1607:29
    at evalmachine.<anonymous>:1621:3
    at Script.runInContext (node:vm:149:12)
    at Script.runInNewContext (node:vm:154:17)
    at runInNewContext (node:vm:310:38)
    at loadChunk (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:274:3)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:286:3
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:284:1
    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)
dsh-dyslexia: loader ReferenceError: window is not defined
    at evalmachine.<anonymous>:1607:5
    at evalmachine.<anonymous>:1621:3
    at Script.runInContext (node:vm:149:12)
    at Script.runInNewContext (node:vm:154:17)
    at runInNewContext (node:vm:310:38)
    at loadChunk (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:274:3)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:287:3
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:284:1
    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)
dsh-dyslexia: prompt section skipped Error: signature changed
    at Object.section (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:366:15)
    at Module.apply (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/index.js:95:27)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:363:14
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:356:1
dsh-dyslexia: module Error: react went feral
    at Object.get (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:937:15)
    at buildModule (evalmachine.<anonymous>:777:34)
    at factory (evalmachine.<anonymous>:1611:18)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:944:18
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:927:1
dsh-dyslexia: settings unavailable Error: inject exploded
    at Object.inject (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:1046:15)
    at claimSettingsPage (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/index.js:127:9)
    at Module.apply (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/index.js:92:5)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:1043:14
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:1003:1
dsh-dyslexia: prompt section skipped Error: the host refused the first attempt
    at Object.section (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:1086:35)
    at Module.apply (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/index.js:95:27)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:1091:12
    at check (file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:23:20)
    at file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/verify/check-bundle.mjs:1056:1
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.2.14
ok   package.json points at the repository npm trusts — git+https://github.com/jiezhengj/DSH-Dyslexia.git
ok   package.json declares the bundle patch and the client half — platform web, no package inject
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 9 patterns
ok   the required published files exist — 24 required files
ok   every interface language has its own plugin page — 8 languages
ok   cordis.patch.yml inserts the plugin by package name — 3 lines
ok   both locales carry metadata — en, zh
ok   client.js is one loader chunk keyed by the package name — 787768 bytes
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
ok   the section hands the host a function, not a frozen string — one registration, three reads, the text follows the value
ok   the capability briefing is what it was before the switch — 85 words, all four sentences match feature 001's contract, order 9000, name ui:dsh-dyslexia
ok   the switch adds the preference on top of the capability, and nothing else — 70 words of preference, 85 of capability
ok   the switch is on for an empty configuration — visualFirst defaults to true
ok   a host that hands over no configuration still gets the full briefing — no config means the default, not an empty briefing
ok   the engine type is exposed the way client.js expects — PeleError, detectType, enableZoom, forgetTextWidths, mount, parse, register, registered, render, supports
ok   every supported sample type draws an svg — flowchart:218x64 sequence:184x167 class:80x192 state:87x206 er:144x201 mindmap:172x71 timeline:408x133
ok   a broken diagram reports a one-line reason — Parse error on line 2:
ok   host key echo falls back to bundled strings — key echo, blanks, placeholders rejected; the host is asked under the plugin namespace
ok   the settings row reads the hook the host builds, not an object it never sends — useVisualFirst and the store form both wired, the store itself carries getSnapshot and subscribe
ok   the preference field is volatile, so the settings form can show it — visualFirst is a volatile boolean, default true
ok   the row is claimed through the slot name the host declares — claimed and registered under settings.general.item
ok   a service the plugin never declared is read through ctx.get — the reader asked ctx.get first and fell back to the property, for locale and configForms alike
ok   a refused settings write is not reported as saved — the resolved boolean reaches the branch: true saves, false or a skipped write reverts and says so
ok   a face that cannot answer still reads as on — missing field, missing getter, a throwing getter and a null snapshot all read as on
ok   a host word is used only when it is a real translation — echoes, blanks, placeholders and non-strings are refused; a real sentence is used
ok   every language carries the same complete sentences — 16 keys x 8 languages, no engine text in labels
ok   client.js matches the sources it claims — 486b90e17026855e9e7d9e769845d106, 787768 bytes rebuilt from the six sources
ok   the fingerprint covers the engine bundle, not only the six client sources — 733369 characters of engine inside the digest
ok   the lockfile names the version the manifest ships — package-lock.json and package.json both 0.2.14
ok   the two host-side resources are handed to ctx.effect as disposables — stylesheet and strings both registered as effects that return a disposer
ok   the picture is the image, and the copy answer is announced — label is a noun, role="img" on the svg, copy result announced; behaviour is asserted by the fixture
ok   host children react would refuse fall back to the source — objects, functions and mixed arrays fall back to the source text; behaviour is asserted by the fixture
ok   every drawing the engine swaps in is named again — the engine owns re-layout; every swapped drawing node and its zoom buttons are renamed, strings follow the language; behaviour is asserted by the fixture
ok   a host block that throws cannot empty the message — host blocks render inside their own boundary, with the source text as the floor; behaviour is asserted by the fixture
ok   a factory that cannot build never throws at the host — module-level throw contained, empty module returned
ok   nothing in the package asks you to edit an instruction file — 17 shipped text files, no instruction-file ask, no visual-first-agents-snippet.md at the root
ok   the host half registers exactly one capability section — ui:dsh-dyslexia, order 9000, 155 words
ok   the settings page is claimed with auto off, once per context — configure({"auto":false}) on the calling context
ok   the host half adds one section per context, not one per call — three calls on one context, one section; a second context gets its own; a failed attempt still allows a retry, whether the host refused at once, later, or by throwing out of .then
ok   the host half stays silent when the host changed shape — five silent hosts (no warning), two refused sections (one warning each, naming the error)
ok   the contract's colour variables are the ones that are wired — 10 engine variables, owned by engine and contract alike
ok   both size limits reach the engine, each proven on its own — three limits passed to mount, two fixtures that cross one each
ok   a host that refuses undeclared services is not reported as a fault — a refusal is recognised by its sentence, and only other faults reach console.warn
ok   a fence that failed comes back when its source changes — a failed drawing is retried when the host hands over new source
ok   a missing engine is told apart from a broken diagram — missing engine, syntax error and any other failure stay distinguishable
ok   an unsupported language falls back to english — a language the plugin does not speak gets english
ok   the settings page claim can be taken back — the opt-out runs inside ctx.effect, so it is released when the plugin goes
ok   a host without react gets a silent module, not nothing — a host whose react is missing receives a module that does nothing, not null
ok   a new write clears the sentence the last one left — a second press starts silent, then says what happened
ok   the fixtures assert what the fixes promise, and can fail — 43 assertions present, each with a condition that reads something

check-bundle: @jiezhengj/dsh-dyslexia@0.2.14 | client.js 787768 bytes | sources sha256:486b90e17026855e9e7d9e769845d106 | all 62 checks passed
```

## E-HARN · 0.2.14 browser checks (299) — `node verify/run-harness.mjs --list`

```console
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
[ok] a language the plugin does not speak falls back to english — ["Show source","Copy source"]
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
[ok] a failed fence says why before it is fixed
[ok] a fence that failed draws again when its source changes — TextPicture查看源码复制源码
[ok] a throwing engine leaves a sentence
[ok] a throwing engine keeps the host block
[ok] a syntax error and a failed engine get different sentences — syntax=图里的语法有误，已改为显示源码。 engine=这张图无法绘制，已改为显示源码。
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
  A-->
[ok] a refused children cannot empty the message — object — children=1 text=flowchart LR
  A[Tex
[ok] a refused children falls back to the source — object — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] no React error 31 escapes — object
[ok] a refused children cannot empty the message — function — children=1 text=flowchart LR
  A[Tex
[ok] a refused children falls back to the source — function — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] no React error 31 escapes — function
[ok] a refused children cannot empty the message — object in a failed picture — children=3 text=图里的语法有误，已改为显示源码。flow
[ok] a refused children falls back to the source — object in a failed picture — "图里的语法有误，已改为显示源码。flowchart TD\n  A-->"
[ok] no React error 31 escapes — object in a failed picture
[ok] a refused children cannot empty the message — array with an object — children=3 text=图里的语法有误，已改为显示源码。flow
[ok] a refused children falls back to the source — array with an object — "图里的语法有误，已改为显示源码。flowchart TD\n  A-->"
[ok] no React error 31 escapes — array with an object
[ok] a streaming block with no host children still shows its source — flowchart LR
  A[Text] --> B[P
[ok] a fresh t does not redraw the picture
[ok] the drawing is named when it is first laid out — img|图
[ok] the fixture really replaced the drawing node — new node
[ok] a swapped drawing is named again — img|图|roledesc=null
[ok] the fixture replaced the drawing again after the column narrowed — new node
[ok] a drawing swapped after a width change is named again — img|图|roledesc=null
[ok] a hostile host block still leaves the message — an iterable of plain objects — text=图里的语法有误，已改为显示源码。flowchar
[ok] a hostile host block still leaves the source text — an iterable of plain objects — "图里的语法有误，已改为显示源码。flowchart TD\n  A-->"
[ok] a hostile host block still leaves the message — a host block that throws while rendering — text=图里的语法有误，已改为显示源码。flowchar
[ok] a hostile host block still leaves the source text — a host block that throws while rendering — "图里的语法有误，已改为显示源码。flowchart TD\n  A-->"
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
[ok] the row is claimed through the slot the host names — conversation.chat.markdown.fence,settings.general.item
[ok] the row registers on the general settings slot and nowhere else — 2 defs, 1 on the slot
[ok] the row carries its id, order and locale — @jiezhengj/dsh-dyslexia/visual-first 62 dyslexia
[ok] a host with no slots service is told once that nothing can be drawn — dsh-dyslexia: slots service unavailable null
[ok] an older slots service that cannot register is reported once — dsh-dyslexia: slots service unavailable null
[ok] a host with no configForms stays quiet — no warning
[ok] a host whose face lookup finds nothing stays quiet — no warning
[ok] the store this module hands the host can be read the way the host reads it — get=function getSnapshot=function subscribe=function
[ok] a hook built from that store draws the switch — aria-checked=true
[ok] the settings row renders inside its slot component
[ok] the row label is our own sentence, not a host key — 优先用图，而不是成段文字
[ok] the row hint is our own sentence, not a host key — 当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。
[ok] the switch shows the value the host reports — true
[ok] the switch is named and described by the visible sentences — :r2:-label -> 优先用图，而不是成段文字 | :r3:-hint -> 当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。
[ok] the switch keeps the keyboard — disabled=false tabindex=null
[ok] no status sentence before the reader touches the switch
[ok] one click asks the host for the opposite value once — [["visualFirst",false]]
[ok] the switch turns off after the write — false
[ok] a saved write says so in the status sentence — 已保存
[ok] the second click tries the other value once — [["visualFirst",false],["visualFirst",true]]
[ok] a rejected write leaves the switch where the host put it — aria-checked=false host=false
[ok] a rejected write explains itself in the status sentence — 保存失败，开关保持原来的状态。
[ok] a refused write that resolves false puts the switch back and says so — sets=[["visualFirst",false],["visualFirst",true],["visualFirst",false]] aria-checked=true host=true status=保存失败，开关保持原来的状态。
[ok] a refused write keeps the value the host took while it was pending — aria-checked=true host=true status=保存失败，开关保持原来的状态。
[ok] a value the host pushes reaches the switch without a write — aria-checked=false paint rgb(74, 108, 247) -> rgba(120, 130, 150, 0.35)
[ok] a thenable that throws out of then cannot break the click — threw=no uncaught=no aria-checked=true host=true status=保存失败，开关保持原来的状态。
[ok] [zh] the settings row label is that language's own sentence — 优先用图，而不是成段文字
[ok] [zh] the settings row hint is that language's own sentence — 当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。
[ok] [en] the settings row label is that language's own sentence — Prefer pictures to prose
[ok] [en] the settings row hint is that language's own sentence — When a picture carries the answer better than a paragraph, the model draws one and keeps the text to what the picture cannot show.
[ok] [ja] the settings row label is that language's own sentence — 文章より図を優先
[ok] [ja] the settings row hint is that language's own sentence — 図のほうが伝わりやすいときは図を描き、文章は図で表せない部分だけにします。
[ok] [es] the settings row label is that language's own sentence — Prefiere las imágenes al texto
[ok] [es] the settings row hint is that language's own sentence — Cuando una imagen explica mejor que un párrafo, el modelo dibuja y deja en texto solo lo que la imagen no puede mostrar.
[ok] [fr] the settings row label is that language's own sentence — Préférer les schémas au texte
[ok] [fr] the settings row hint is that language's own sentence — Quand un schéma explique mieux qu'un paragraphe, le modèle en dessine un et ne garde en texte que ce que le schéma ne peut pas montrer.
[ok] [de] the settings row label is that language's own sentence — Bilder statt Textabsätze
[ok] [de] the settings row hint is that language's own sentence — Wenn ein Bild mehr erklärt als ein Absatz, zeichnet das Modell eines und lässt im Text nur, was das Bild nicht zeigen kann.
[ok] [ru] the settings row label is that language's own sentence — Картинки вместо абзацев
[ok] [ru] the settings row hint is that language's own sentence — Когда рисунок объясняет лучше абзаца, модель рисует его, а в тексте оставляет только то, чего на рисунке не видно.
[ok] [pt] the settings row label is that language's own sentence — Preferir imagens ao texto
[ok] [pt] the settings row hint is that language's own sentence — Quando uma imagem explica melhor que um parágrafo, o modelo desenha e deixa no texto só o que a imagem não mostra.
[ok] the switch starts off when the host already says off — false
[ok] a host whose face has no setter hands the row no writer at all — setValue is undefined
[ok] a host whose face has no setter keeps the switch and says the write failed — aria-checked=true status=保存失败，开关保持原来的状态。 set=undefined threw=no
[ok] a host without configForms gets the picture and no settings row — 1 defs, threw=no
[ok] the picture still draws when the settings surface is missing
[ok] a host that gains configForms after apply still gets the settings row — 0 before, 1 after
[ok] a configForms face that answers nothing adds no row — 1 defs
[ok] a host that passes hooks as hook props still gets a visible row — row
[ok] the switch follows the value the host hook reports — aria-checked=true
[ok] a pending write shows the requested value before the host answers — aria-checked=false
[ok] clicking the switch writes through the writer the host gave it — [["visualFirst",false]]
[ok] the switch then shows the value the host now holds — aria-checked=false
[ok] a snapshot that carries no field still shows the switch on — aria-checked=true
[ok] a snapshot that is not an object still shows the switch on — aria-checked=true
[ok] a snapshot getter that throws still shows the switch on — aria-checked=true
[ok] a host that refuses undeclared services is still served without a throw — quiet
[ok] a host whose services must be read through ctx.get still gets the row — 2 defs
[ok] a host that refuses undeclared properties still gets the strings registered — [["dyslexia",8]]
[ok] a host that refuses undeclared services is not warned about — []
run-harness: @jiezhengj/dsh-dyslexia@0.2.14 | client.js 787768 bytes | sources sha256:486b90e17026855e9e7d9e769845d106 | all 299 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

## E-LIVE — the row and the new name on a running host (`0.2.6`, re-checked on `0.2.8` and `0.2.9`)

What was run: the shipped desktop build (`@deepseek-ai/dsh-desktop` `0.2.2-rc.5`) with the web surface, on a
throwaway profile so nothing in the reader's own profile was touched:

    ELECTRON_RUN_AS_NODE=1 "<app>\DeepSeek Harness.exe" "<app>\resources\app.asar\dsh\node_modules\@deepseek-ai\dsh\lib\bin.js" webcheck --no-open --port 0
    dsh web: http://127.0.0.1:<port>/?token=<token>

The profile was made with `--from-default-profile web`, the published build was installed into it with
`plugin add`, and the page was driven with `agent-browser` (an independent Chrome, so the refs and the console
below belong to that page alone).

| surface | what was seen |
|---|---|
| plugin page | `button "查看 DSH 我有阅读障碍"`, heading `DSH 我有阅读障碍`, `StaticText "v0.2.6"`, `StaticText "@jiezhengj/dsh-dyslexia@0.2.6"`, and the preview image whose accessible name is the sentence `会话中的一条消息把 mermaid 代码块就地画成了示意图，图下方是「查看源码」与「复制源码」两个按钮，由插件「DSH 我有阅读障碍」呈现` |
| Settings → General | `StaticText "优先用图，而不是成段文字"`, `StaticText "当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。"`, `switch "优先用图，而不是成段文字" [checked=true]` — placed between the host's 性能与用量 row and its Session Log row, i.e. in the slot it registered for |
| the write | clicking the switch flipped it to `checked=false` and showed `role="status"` with `StaticText "已保存"`; the throwaway profile's `cordis.patch.yml` then carried `- id: dsh-dyslexia … config: visualFirst: false`. Clicking again flipped it back to `checked=true`, wrote `visualFirst: true`, and the value survived closing and reopening the settings dialog |
| console | `0.2.5`: one `dsh-dyslexia: locale … without inject` warning. `0.2.6`: none. `0.2.8`: two warnings (`locale`, `configForms`), each ending in `without inject` — see the re-check below, which is what `0.2.9` silences |

**The defect this found, and what `0.2.6` changes.** On the running host the row registered but rendered
nothing: our module logged no warning, the settings page logged `TypeError: w.getSnapshot is not a function`
from the slot, and the switch was simply absent. Three separate causes, each invisible to the suites as they
were:

1. The host turns each entry of the slot's `hooks` face into a **hook prop** named after it, so `hooks: {
   visualFirst: store }` arrives as `useVisualFirst(selector)` — the host's own row in
   `dsh-client-ui-settings-general/lib/client.js` reads `const enabled = useDeveloperTools(value => value)`.
   Our row only looked for `props.hooks` and returned `null` when it was missing, so a host that flattens
   hooks got an empty row. `VisualFirstRow` now picks its adapter before any hook runs: `HostValueRow`
   (through `useVisualFirst`) when that prop exists, `StoreValueRow` (through `useSyncExternalStore`) when the
   older `hooks` object is what the host hands over.
2. The store the row hands the host had `get`/`set`/`subscribe` but no `getSnapshot`, which is what the host's
   hook plumbing calls: the slot threw and the row died. `createValueStore` now has `getSnapshot()`.
3. The host's cordis is strict: `ctx.locale` throws `cannot get property "locale" without inject` on a context
   whose `inject` lists only `slots`, which is why the string table was never registered and why the row could
   be skipped. `entry.js` reads `locale`, `slots` and `configForms` through `optional(ctx, name)`, which
   prefers `ctx.get(name)` — the read that needs no `inject` — and falls back to the bare property for a host
   without `ctx.get`. The row is attempted once directly and once from `ctx.inject`, and whichever finds a
   face first wins, so a host that only answers `ctx.get` still gets a row.

Both new static checks and both new fixture groups go red when their cause is put back, on a copy of the tree
that was restored afterwards: removing `getSnapshot()` from the store fails `the settings row reads the hook the host
builds, not an object it never sends` and two harness assertions (F15); deleting the `useVisualFirst` branch fails four fixtures (`a host that passes
hooks as hook props still gets a visible row`, `the switch follows the value the host hook reports`, `clicking
the switch writes through the writer the host gave it`, `the switch then shows the value the host now holds`)
with `4 failed, 276 passed`.

**What is still not proven.** The desktop window itself: in this build settings opens as a separate document
(`ctx.remote.settings.openSettingsDocument()`), the desktop window's accessibility tree has no 设置 control
(50 elements), and `agent-desktop press` cannot send `Ctrl+,` (its key list has no comma) — so the desktop
path is recorded as "not reachable in this build", not as "works". The web surface runs the same client bundle
against the same host services, so the row, the label and the write path are proven for the plugin; only the
desktop trigger is not.

### the `0.2.8` re-check — persistence, uninstall, and the warnings this build left

Same method, second throwaway profile (`webcheck2`, again `--from-default-profile web`, `plugin add` of the
published `0.2.8`), one `dsh web` process per step:

| step | what was seen |
|---|---|
| how the panel is reached | the sidebar has no 设置 button; `button "账号菜单"` (labelled 更多) opens a menu whose first entry is `menuitem "设置"`, and the menu text names the shortcut `Ctrl+Alt+,` |
| row, first look | `StaticText "优先用图，而不是成段文字"`, its hint sentence, `switch … [checked=true]`, between the host's 性能与用量 and 上传 Session Log rows |
| click | `[checked=false]`, `role="status"` `StaticText "已保存"`, and `webcheck2\cordis.patch.yml` gained `- id: dsh-dyslexia … config: visualFirst: false` |
| restart | the process was stopped and started again on the same profile: the settings panel showed `switch … [checked=false]`, so the preference survived a restart |
| uninstall | `plugin remove @jiezhengj/dsh-dyslexia`, restart: the row is gone (the host's 上传 Session Log row is now the last one) — the feature leaves nothing behind |
| console | two of our own warnings: `dsh-dyslexia: locale { … without inject }` and `dsh-dyslexia: configForms { … without inject }` |

### the `0.2.9` re-check — the refusals are gone from the log

A third throwaway profile (`webcheck3`, `plugin add` of the published `0.2.9`), one `dsh web` process, the page
driven with `agent-browser`: the settings panel listed `switch "优先用图，而不是成段文字" [checked=true]` and the
page console carried **no** `dsh-dyslexia:` line at all. The capture was live rather than empty — a marker
written from the console (`console.warn('probe-marker-123')`) showed up as the only entry. So the row still
registers through the strict host while the two expected refusals no longer reach the log.

The warnings are the strict-inject path working as designed: `optional()` tries `ctx.get(name)`, does not find
`locale`/`configForms` that way on this host, falls back to the bare property, is refused, and reports the
refusal. Nothing is broken — but a plugin that logs an expected refusal on every boot teaches readers to ignore
its log. `0.2.9` stops reporting `cannot get property "…" without inject` and keeps reporting everything else.

## E-GAPS — not proven here

Eighteen gaps are open here: G2–G8, G11–G21; G1 is discharged below in E-LIVE (web surface only), and G9 and G10 are discharged by `0.2.5`.

| gap | what is missing |
|---|---|
| G1 | **Discharged in `0.2.6`** — see E-LIVE: on the running host (same DSH build, `dsh web` on a throwaway profile, plugin `0.2.6`) the row rendered in Settings → General with the Chinese label, the hint and a switch reading the host's value, and a click wrote through to `cordis.patch.yml`. Getting there found a real defect that no fixture had caught (the row looked for `props.hooks` while the host sends `useVisualFirst`), which is why the gap was worth keeping open. Not proven in the **desktop** window: its settings surface opens as a separate document and no trigger was reachable in this build (see E-LIVE). |
| G2 | The host's own `settings.update` call was not observed directly; what was observed is its effect: after the click the profile's `cordis.patch.yml` carried `visualFirst: false`, and after the second click `visualFirst: true`. |
| G3 | The row label is asserted in the fixture in all eight languages (`the row label is our own sentence, not a host key — 优先用图，而不是成段文字` for zh, plus one `[lang] the settings row label is that language's own sentence` per other language, in the fixtures since `0.2.9`). No narrow-layout assertion exists: neither suite renders the row at 360px or at 200% font size. No assertion compares a non-English string with its English counterpart word for word. |
| G4 | The renamed names were not seen in a live **desktop** window — this build offers no reachable settings control there. The web surface saw both: the plugin page heading `DSH 我有阅读障碍` and the settings row label (E-LIVE). The 8 titles are also proven in the locale files and by assertion. |
| G5 | No screenshot comparison against host rows (SC-008); the row uses host tokens and matches the neighbour row structure by construction, not by pixels. |
| G6 | The E1–E14 end-to-end rows in `quickstart.md` were not run against a live host. The web surface was observed for this feature (E-LIVE); no live **desktop** window showed it. The switch's keyboard activation and its announcement are the browser's own `role="switch"` behaviour: the fixtures assert role, name, `aria-checked` and focusability, never a keydown. |
| G7 | SC-001's five sample requests were not run: no model was asked to answer them with the switch on, so the briefing's effect on real answers is untested. |
| G8 | `@deepseek-ai/schemastery` is a static import in `index.js`; if the package cannot resolve, the plugin fails to load at import time. There is no graceful degradation, and this failure path was not exercised. |
| G9 | **Discharged in `0.2.5`**: `the capability briefing is what it was before the switch` (`verify/check-bundle.mjs:435-463`) parses the four `MERMAID_RENDER_PROMPT` sentences read-only out of `specs/001-mermaid-fence-render/contracts/host-prompt.md` and asserts exact equality (`text === recorded.join(' ')`) as well as one `includes` per sentence, so one changed word in `index.js` goes red (F12). Still unproven: a comparison with a running feature 001 build — the reference is 001's recorded contract, and no 001 binary was kept. |
| G10 | **Discharged in `0.2.5`**: four probes (F10–F13) ran on the `0.2.5` tree, each in a fresh `%TEMP%` copy, one per round-5 fix. The `0.2.4` tree itself was never probed — `0.2.5` carries its code plus the fixes, so it supersedes it. F1 and F9 have still not been re-run since `0.2.3`: F1's target (`index.js`) is unchanged since then, while F9's target line in `src/client/settings.js` still exists but that file changed twice after `0.2.3`; neither is a re-run. |
| G11 | A write whose promise never settles is not covered: `src/client/settings.js:110-113` (`show()`) puts the requested value into the store before `injected.setValue` is awaited, so from the click until the host answers the row shows a value the host has not accepted; the fixtures only drive promises that resolve `true`, resolve `false`, reject, or throw out of `then`. A promise that never settles leaves the row on the requested value with no failure sentence, and no assertion covers that state. |
| G12 | A face whose `getSnapshot` throws or is missing restores the row to the default `true`, not to the captured value: `readPreference(face)` (`src/client/settings.js:48-58`) returns `true` for a missing, unreadable, `getSnapshot`-less or raising face and never signals "unreadable"; `inject.readHostValue` is attached whenever a face exists (`src/client/settings.js:243-245`), and a row is mounted only when a face exists (`src/client/entry.js:173-174`), so `restore()` (`src/client/settings.js:127-138`) always re-reads the host for any mounted row, and the captured value only runs when `readHostValue` is absent — i.e. for no mounted row. On such a degraded face the row can show "on" without a saved write. The fallback itself is now covered: `a face that cannot answer still reads as on` (`verify/check-bundle.mjs:693`, check #36) executes `readPreference` against seven face shapes (no face, no `getSnapshot`, a snapshot without the field, `null`, a raise, `false`, `true`), and three fixtures mount the degraded shapes and read the switch (`a snapshot that carries no field still shows the switch on`, `a snapshot that is not an object still shows the switch on`, `a snapshot getter that throws still shows the switch on`). What is still unproven is the click path on such a face: no fixture clicks the switch while the face cannot answer. |
| G13 | Documentation consistency across `README*.md`, `docs/DETAIL*.md` and `locale/<lang>.json` is not asserted. Nothing checks that `README.<lang>.md`'s first line equals `locale/<lang>.json`'s `meta.title`, nor that the DETAIL image alt sentence contains that title, so FR-012's 「说明页与随包 README MUST 使用同一说法」 is a MUST with no assertion: the locale-and-meta check only requires the meta fields, one image line and eight distinct titles, and check #48 (`verify/check-bundle.mjs:963`) only forbids instruction-file mentions. Verified by hand only (zh/en/de); read for this record: `README.en.md:1` is `# DSH — I'm dyslexic` (equal to `locale/en.json` `meta.title`), `README.de.md:1` is `# DSH — Ich habe Legasthenie` (equal to `locale/de.json` `meta.title`), and `docs/DETAIL.md:1`'s alt ends `… shown by the plugin DSH — I'm dyslexic`. This is a documentation-consistency gap, not a runtime defect: the shipped plugin never reads these files at runtime. |
| G14 | SC-005's timing half ("切换操作在 1 秒内反映到界面；写入失败时 1 秒内出现可见提示") is not asserted: no fixture measures elapsed time between the click and the repaint, so the sentence stands on the implementation's synchronous state update, not on a measurement. |
| G15 | `wireSettingsRow` keeps a `if (!slots) return false` that neither suite can observe: `apply` already returns before it calls that path when `slots` cannot inject or register, so removing it changes nothing in either suite. The deeper `typeof slots.register` guard was removed as dead code for the same reason; this row records that the remaining check is unobservable rather than proven. |
| G16 | Two client-side invariants are caught only by the browser suite, while the static suite stays green when they break: the direction of the store snapshot (`a pending write shows the requested value before the host answers`) and the host-pushed value (`a value the host pushes reaches the switch without a write`). The `useVisualFirst` branch is not one of them: F14 reds the static check `the settings row reads the hook the host builds, not an object it never sends` too. The pair of suites is the evidence; neither half alone is. |
| G17 | One missing attribute aborts part of the settings fixture: probe **P30** (dropping `role: 'switch'`) reds 5 distinct checks and reports `run-harness: 5 failed, 244 passed`, but 292 − (244 + 5) = 43 checks never executed, because the fixture's later steps click a switch that no longer exists. The run still fails, so nothing can pass silently; the cost is that a reader of a green run learns nothing about the checks one wrong attribute would hide. |
| G18 | The `0.2.9` behaviour change recorded in E-LIVE — a strict-inject host no longer produces `dsh-dyslexia:` warnings of our own — has no assertion: putting the unconditional `report(name, error)` back in `optional()` leaves both suites green (51 / 292). The quiet is real but unwatched. |
| G19 | A `Config` getter that throws is not asserted: `prefersPictures` (`index.js`) catches the throw, warns `dsh-dyslexia: visualFirst unreadable` and falls back to the capability briefing, keeping the section present — seen by hand on the `0.2.11` tree, by neither suite. |
| G20 | What persistence means for this Config is unasserted: the click writes `cordis.patch.yml`, as E-LIVE observed on `0.2.8`, but no suite reads that file, so a host that kept volatile fields in memory only would drop the preference on restart unnoticed. What *is* asserted since `0.2.12` is the other half — that the field is volatile at all (`the preference field is volatile, so the settings form can show it`; probe P31), because the host's form projects volatile fields only and a plain boolean would make the switch disappear. |
| G21 | No in-place upgrade has ever been observed: every install in E-INS runs `remove_bundle` first and then `install_bundle`, so FR-013's 「升级 MUST NOT 需要迁移动作或重装」 is asserted only by the package's identity (same name, entry id, file names, config key) — never by watching one version replace another without removal. |

## E-PUB · 0.2.0 publish

| version | tag | workflow run | shasum | transparency log | files |
|---|---|---|---|---|---|
| 0.2.0 | `v0.2.0` | `45194947185` | `c3bedd58f4973d3752043532caeb1f6bf781fc48` | `logIndex=4051965933` | 33 of the packed set, npm `total files: 33` |

CI lines from that run:

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.0 | client.js 780550 bytes | sources sha256:db71eb3381be5f8bbd6a8701f8f9ea06 | all 43 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.0 | client.js 780550 bytes | sources sha256:db71eb3381be5f8bbd6a8701f8f9ea06 | all 251 checks passed (/usr/bin/google-chrome)
```

The first two tag pushes (`45194558416`, `45194732082`) failed and published nothing: the workflow had never needed `npm ci`, so `index.js` could not import `@deepseek-ai/schemastery`. The workflow now installs the manifest's own dependencies before rebuilding and checking, and the tag was moved onto that fix.

## E-INS · 0.2.0 install into the live profile

| what | value |
|---|---|
| command | `remove_bundle @jiezhengj/dsh-dyslexia` then `install_bundle @jiezhengj/dsh-dyslexia@0.2.0` |
| result | `application: applied`, `version: 0.2.0`, pnpm `+ @jiezhengj/dsh-dyslexia 0.2.0` |
| profile dependency | `"@jiezhengj/dsh-dyslexia": "0.2.0"` |
| installed `client.js` | unverified — the 0.2.0 tarball hash was not recorded |
| repository `client.js` | unverified — the 0.2.0 tarball hash was not recorded |

Both `client.js` rows are unverified because that hash was never recorded for 0.2.0: `client.js` embeds the version, so the fingerprint hashes it. The 780550 bytes are not 0.2.1's alone: the `0.2.0` CI lines above also measured `client.js 780550 bytes` (only its `sources sha256` differed, `db71eb3381be5f8bbd6a8701f8f9ea06`), the size being shared because `0.2.0` and `0.2.1` are the same length. What was wrong here was the SHA256: it belongs to the `0.2.1` artifact, not to `0.2.0`'s.

The 0.2.0 rows above stay as history. 0.2.1 followed the feature-002 review and was not documentation-only: besides the wording corrections it added the function-form check to `verify/check-bundle.mjs` (#22) and rebuilt `client.js` with it. It was published (run `45204279829`, shasum `b5c03c272b89f53f2416a5140c29b212b5f55b7a`, logIndex `4053240981`) and installed (E-PUB/E-INS 0.2.1 below); E-CHK and E-HARN in this file are that tree. 0.2.2 is the later code change recorded in E-PUB · 0.2.2 and E-INS · 0.2.2 above (the E-PUB · 0.2.2 and E-INS · 0.2.2 sections above); the counts near the top of this file belong to the `0.2.1` and `0.2.5` trees, not to `0.2.2`.

## E-PUB · 0.2.1

| version | tag | workflow run | shasum | transparency log | files |
|---|---|---|---|---|---|
| 0.2.1 | `v0.2.1` | `45204279829` | `b5c03c272b89f53f2416a5140c29b212b5f55b7a` | `logIndex=4053240981` | 33 |

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.1 | client.js 780550 bytes | sources sha256:6b5d4e192279b1294304cbed6303e546 | all 44 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.1 | client.js 780550 bytes | sources sha256:6b5d4e192279b1294304cbed6303e546 | all 251 checks passed (/usr/bin/google-chrome)
```

## E-INS · 0.2.1

| what | value |
|---|---|
| command | `remove_bundle @jiezhengj/dsh-dyslexia` then `install_bundle @jiezhengj/dsh-dyslexia@0.2.1` |
| result | `application: applied`, `version: 0.2.1`, pnpm `+ @jiezhengj/dsh-dyslexia 0.2.1` |
| installed `client.js` | 780550 bytes, same SHA256 as the repository copy (`5BD4168C2F8971F67B0982CC3E73BE01EC49BE9DAAA01474EDA245CC401DD85A`) |

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

## E-PUB · 0.2.6

- commit `c3520c2` ("0.2.6: the settings row the host actually renders"), tag `v0.2.6` ("0.2.6: the settings row the host actually renders"), both pushed to `main`
- GitHub Actions run `45302814465`, conclusion `success`, workflow `publish`, head branch `v0.2.6`
- CI lines from that run (the same bytes this tree measures; only the browser path differs):

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.6 | client.js 787325 bytes | sources sha256:b69ddecef48b3acc5a9b51e2a1a27bc1 | all 47 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.6 | client.js 787325 bytes | sources sha256:b69ddecef48b3acc5a9b51e2a1a27bc1 | all 280 checks passed (/usr/bin/google-chrome)
npm notice shasum: 1deccbbf61f9068c22ff418980fb16d960bf5e4b
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4063373865
```

## E-INS · 0.2.6

- registry `https://registry.npmjs.org/@jiezhengj/dsh-dyslexia/0.2.6` answered `version: 0.2.6`, `shasum: 1deccbbf61f9068c22ff418980fb16d960bf5e4b`; the tarball `dsh-dyslexia-0.2.6.tgz` answered HEAD 200 on the first poll (20 s apart), so this release copied faster than the earlier ones
- `remove_bundle @jiezhengj/dsh-dyslexia` removed `0.2.5` (pnpm printed `- @jiezhengj/dsh-dyslexia 0.2.5`), then `install_bundle @jiezhengj/dsh-dyslexia@0.2.6` returned `application: applied`, `version: 0.2.6` (pnpm `+ @jiezhengj/dsh-dyslexia 0.2.6`)
- installed copy at `C:\Users\jiezhengj\.dsh\profiles\desktop\node_modules\@jiezhengj\dsh-dyslexia`: `package.json` version `0.2.6`; `client.js` 787325 bytes, SHA-256 `63B5517E3074F37D44CB8F63EB84593426F3B451B1FE3951336A125E16D6D786`, identical to the repository copy; `locale/` 8 files; `docs/` 9 entries; the profile `package.json` dependency reads `"@jiezhengj/dsh-dyslexia": "0.2.6"`
- this is a code release: a window that was already open keeps the `0.2.5` chunk until the app restarts. The settings row was observed for this same code through `dsh web` on a throwaway profile (E-LIVE); the desktop window's own settings entry stays unreachable in this host build, which G1 records

## E-PUB · 0.2.7

- commit `a9a2bc9` ("0.2.7: make the getSnapshot regression visible"), tag `v0.2.7` ("0.2.7: make the getSnapshot regression visible"), both pushed to `main`
- GitHub Actions run `45305735507`, conclusion `success`, workflow `publish`, head branch `v0.2.7`
- CI lines from that run (the same bytes this tree measures; only the browser path differs):

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.7 | client.js 787325 bytes | sources sha256:a08cd79acf40084829e270e0564b1b85 | all 47 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.7 | client.js 787325 bytes | sources sha256:a08cd79acf40084829e270e0564b1b85 | all 283 checks passed (/usr/bin/google-chrome)
npm notice shasum: d424a48f8e0c3650f8c62281c3818dca59f715b1
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4064162219
```

## E-INS · 0.2.7

- registry `https://registry.npmjs.org/@jiezhengj/dsh-dyslexia/0.2.7` answered `version: 0.2.7`, `shasum: d424a48f8e0c3650f8c62281c3818dca59f715b1`; the tarball answered HEAD 200 on poll 29 of 40 (10 s apart), i.e. about five minutes after the run, slower than `0.2.6`
- installed into the live `desktop` profile after `remove_bundle` returned `- @jiezhengj/dsh-dyslexia 0.2.6`; `install_bundle @jiezhengj/dsh-dyslexia@0.2.7` answered `application: applied`, `version: 0.2.7` (pnpm `+ @jiezhengj/dsh-dyslexia 0.2.7`), and the profile `package.json` dependency reads `"@jiezhengj/dsh-dyslexia": "0.2.7"`
- the installed copy's `client.js` is 787325 bytes and hashes to `496b5c4133d726fa928c69661afecac2452ae215bd86074363857529599ca913`, identical to the repository copy; `locale/` 8 files, `docs/` 9 entries, package version `0.2.7`

Nothing in this release changes what a reader sees: `client.js` is the `0.2.6` code plus its version banner. What changed is the guard rail — the two fixtures and the retargeted static check that make the `getSnapshot` regression visible (F15).

## E-PUB · 0.2.8

- commit `6edaef3` ("0.2.8: make the two shape-only static checks execute"), tag `v0.2.8`
  ("0.2.8: make the two shape-only static checks execute"), both pushed to `main`
- GitHub Actions run `45310290797`, conclusion `success`, workflow `publish`, head branch `v0.2.8`
- CI lines from that run (the same bytes this tree measures; only the browser path differs):

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.8 | client.js 787325 bytes | sources sha256:a82c554f992a9871b4b8dcdff8499f7b | all 47 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.8 | client.js 787325 bytes | sources sha256:a82c554f992a9871b4b8dcdff8499f7b | all 283 checks passed (/usr/bin/google-chrome)
npm notice shasum: ab9f82fbec6c6553b3f0031586785af0417ac52e
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4065743074
```

- registry `https://registry.npmjs.org/@jiezhengj/dsh-dyslexia/0.2.8` answered `version: 0.2.8`,
  `shasum: ab9f82fbec6c6553b3f0031586785af0417ac52e`; the tarball answered HEAD 200 on poll 29 of 40 (10 s
  apart), about five minutes after the run

## E-INS · 0.2.8

- installed into the live `desktop` profile after `remove_bundle` returned `- @jiezhengj/dsh-dyslexia 0.2.7`;
  `install_bundle @jiezhengj/dsh-dyslexia@0.2.8` answered `application: applied`, `version: 0.2.8`
  (pnpm `+ @jiezhengj/dsh-dyslexia 0.2.8`), and the profile `package.json` dependency reads
  `"@jiezhengj/dsh-dyslexia": "0.2.8"`
- the installed copy's `client.js` is 787325 bytes and hashes to
  `35397283cd5f8f89ec9469c503176922bdf49c57551d5d8c4e40a49dfd5a24fd`, identical to the repository copy;
  `locale/` 8 files, `docs/` 9 entries, package version `0.2.8`
- what a reader sees is unchanged from `0.2.7`: `client.js` carries the same code and only the version banner
  differs. What changed is two static checks that now execute the reader and read the refusal branch instead of
  matching source text (P19/P20)

## E-PUB · 0.2.9

- commit `dcf9293` ("0.2.9: make the optimistic frame and a degraded face assertable; stop reporting expected
  refusals"), tag `v0.2.9` ("0.2.9: the optimistic frame and a degraded face are now observable"), both pushed
  to `main`
- GitHub Actions run `45314418891`, conclusion `success`, workflow `publish`, head branch `v0.2.9`
- CI lines from that run:

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.9 | client.js 787688 bytes | sources sha256:b6c17c26e57f7d50cd2ed86a9002ad28 | all 49 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.9 | client.js 787688 bytes | sources sha256:b6c17c26e57f7d50cd2ed86a9002ad28 | all 287 checks passed (/usr/bin/google-chrome)
npm notice shasum: 8a1204246b01652a6c84756a2878e9ae0d695d85
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4066763564
```

- the tarball answered HEAD 200 on poll 29 (10 s apart), about five minutes after the run

## E-INS · 0.2.9

- installed into the live `desktop` profile after `remove_bundle` returned `- @jiezhengj/dsh-dyslexia 0.2.8`;
  `install_bundle @jiezhengj/dsh-dyslexia@0.2.9` answered `application: applied`, `version: 0.2.9`
  (pnpm `+ @jiezhengj/dsh-dyslexia 0.2.9`), and the profile `package.json` dependency reads
  `"@jiezhengj/dsh-dyslexia": "0.2.9"`
- the installed copy's `client.js` is 787688 bytes and hashes to
  `95DEBB6B71946111B5371B3480C3F19B09DE35516A10EF007747CAA88D9C9981`, identical to the repository copy;
  `locale/` 8 files, `docs/` 9 entries, package version `0.2.9`
- what a reader sees is unchanged from `0.2.8`: `client.js` differs only in the version banner and in the
  refusal that is no longer logged; what changed are the checks behind the optimistic frame and the degraded faces

## E-PUB · 0.2.10

- commit `951b28c`; tag `v0.2.10`; GitHub Actions run `45318980674` — `success`
- registry tarball `dsh-dyslexia-0.2.10.tgz` answered HEAD 200 on poll 29 (10 s apart, about five minutes after the run);
  `npm notice shasum: 3baa6e7922ff2fbdb320146b4448909f315e7bcd`; `npm notice total files: 33`;
  provenance `logIndex=4067826736`

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.10 | client.js 787768 bytes | sources sha256:25fe69385f7372015944ae0b18386c31 | all 50 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.10 | client.js 787768 bytes | sources sha256:25fe69385f7372015944ae0b18386c31 | all 292 checks passed (/usr/bin/google-chrome)
```

## E-INS · 0.2.10

- installed into the live `desktop` profile after `remove_bundle` returned `- @jiezhengj/dsh-dyslexia 0.2.9`;
  `install_bundle @jiezhengj/dsh-dyslexia@0.2.10` answered `application: applied`, `version: 0.2.10`
  (pnpm `+ @jiezhengj/dsh-dyslexia 0.2.10`), and the profile `package.json` dependency reads
  `"@jiezhengj/dsh-dyslexia": "0.2.10"`
- the installed copy's `client.js` is 787768 bytes and hashes to
  `1E51881A0F20F068387F2ED2A63CE2ED25B182FB30544EFDF94A2C16ECB3495B`, identical to the repository copy;
  `locale/` 8 files, `docs/` 9 entries, package version `0.2.10`
- what a reader sees is unchanged from `0.2.9`: only the checks moved — the slot's owner key, the quiet paths of
  three guards, and one piece of dead code removed from `wireSettingsRow`

## E-PUB · 0.2.11

- commit `5b5b200`; tag `v0.2.11`; GitHub Actions run `45323036631` — `success`
- registry tarball `dsh-dyslexia-0.2.11.tgz` answered HEAD 200 on poll 29 (10 s apart, about five minutes after the run);
  `npm notice shasum: 1f0c7a262c0a60559833524b64ffac173ea906c9`; `npm notice total files: 33`;
  provenance `logIndex=4068548518`

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.11 | client.js 787768 bytes | sources sha256:25576ab91ac35a54cd3ec710e0e2ba93 | all 51 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.11 | client.js 787768 bytes | sources sha256:25576ab91ac35a54cd3ec710e0e2ba93 | all 292 checks passed (/usr/bin/google-chrome)
```

## E-INS · 0.2.11

- installed into the live `desktop` profile after `remove_bundle` returned `- @jiezhengj/dsh-dyslexia 0.2.10`;
  `install_bundle @jiezhengj/dsh-dyslexia@0.2.11` answered `application: applied`, `version: 0.2.11`,
  and the profile `package.json` dependency reads `"@jiezhengj/dsh-dyslexia": "0.2.11"`
- the installed copy's `client.js` is 787768 bytes and hashes to
  `14C6514A5D504676C04137D943A0D6B791A1441548C1160B6149280451A35975`, identical to the repository copy;
  `locale/` 8 files, `docs/` 9 entries, package version `0.2.11`
- what a reader sees is unchanged from `0.2.10`: this release only adds the missing assertion for the
  settings-page claim and makes `run-harness` fail on a stale chunk

## E-PUB · 0.2.12

- commit `4964cb4`; tag `v0.2.12`; GitHub Actions run `45328884899` — `success`
- registry tarball `dsh-dyslexia-0.2.12.tgz` answered HEAD 200 on poll 29 (10 s apart, about five minutes after the run);
  `npm notice shasum: a85192f551db4c42ef62906eb54cbb193ae919ff`; `npm notice total files: 33`;
  provenance `logIndex=4069471531`

```
check-bundle: @jiezhengj/dsh-dyslexia@0.2.12 | client.js 787768 bytes | sources sha256:838eef8dcc57b574bd405b70689df2e9 | all 52 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.12 | client.js 787768 bytes | sources sha256:838eef8dcc57b574bd405b70689df2e9 | all 292 checks passed (/usr/bin/google-chrome)
```

## E-INS · 0.2.12

- installed into the live `desktop` profile after `remove_bundle` returned `- @jiezhengj/dsh-dyslexia 0.2.11`;
  `install_bundle @jiezhengj/dsh-dyslexia@0.2.12` answered `application: applied`, `version: 0.2.12`,
  and the profile `package.json` dependency reads `"@jiezhengj/dsh-dyslexia": "0.2.12"`
- the installed copy's `client.js` is 787768 bytes and hashes to
  `C58A4DD653B5973C7B60E3F8EE2658989E74EEEB6BD27192DA24B25540652F2C`, identical to the repository copy;
  `locale/` 8 files, `docs/` 8 documents plus `preview.svg`, package version `0.2.12`
- what a reader sees is unchanged from `0.2.11`: this release adds the missing `.volatile()` assertion, turns the
  slot-name check from a text search into a read of the one assignment, and corrects the claims the eighth review found

## E-PUB · 0.2.13

- commit `2bf20a2`, tag `v0.2.13`, GitHub Actions run **`45331868407`** — conclusion `success`, job `publish`, duration `21s`.
- `shasum` `f62098a52c614c6b964b7c4d937c1458c10056ca`, `total files: 33`, provenance `logIndex=4069910039`.
- the two report lines the workflow printed, copied here as they appeared:

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.2.13 | client.js 787768 bytes | sources sha256:bec49f4eeba79400e467078384088f38 | all 55 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.2.13 | client.js 787768 bytes | sources sha256:bec49f4eeba79400e467078384088f38 | all 294 checks passed (/usr/bin/google-chrome)
```

## E-INS · 0.2.13

`plugin_manager` `remove_bundle @jiezhengj/dsh-dyslexia` printed `- @jiezhengj/dsh-dyslexia 0.2.12`, then `install_bundle @jiezhengj/dsh-dyslexia@0.2.13` returned `{"stage":"enable","changed":true,"application":"applied","version":"0.2.13"}` and pnpm printed `+ @jiezhengj/dsh-dyslexia 0.2.13` (and added `@jiezhengj/dsh-dyslexia@0.2.13` to `minimumReleaseAgeExclude`).

| what | observed |
|---|---|
| profile dependency | `"@jiezhengj/dsh-dyslexia": "0.2.13"` |
| installed `client.js` | 787768 bytes |
| installed `client.js` SHA-256 | `A22E6E3AA23E14CF927CF62E61E7EBD70307AEF5DDAB4615930DEE39771B70DF` |
| repository `client.js` SHA-256 | the same value |
| `locale/` | 8 language files |
| `docs/` | 9 files (8 DETAIL + `preview.svg`) |
| package version inside the installed copy | `0.2.13` |

What readers see is unchanged from `0.2.12`: the settings row, the switch and the drawings are the same. What this build adds is evidence — the engine bytes now enter the fingerprint, the boundary fallback is asserted at the page, the stylesheet is handed to `ctx.effect` as a disposable, and the lockfile follows the manifest.

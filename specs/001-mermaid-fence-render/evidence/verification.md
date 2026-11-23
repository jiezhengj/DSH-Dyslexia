# 验证证据

本文件只记录**已经真实跑过**的命令输出。E-BLD、E-CHK、E-HARN 三段各自来自一次运行，其中 E-CHK 与 E-HARN 的报告行自带 `包名@版本 | client.js 字节数 | sources sha256:<指纹>`，所以这两段可被追溯到具体的一棵树；E-BLD 是构建日志本身（它写出 `client.js`，随后由这两段报告行限定）。E-PUB 记录 CI 运行，E-INS 与 E-LIVE 记录真机操作，各自注明版本与 run，不能当成"同一次运行"的输出。当前版本：`0.1.20`。

复跑方式（任何人 clone 后都一样）：

```bash
node scripts/build-client.mjs       # 由 src/client/*.js + vendor/pele 生成 client.js
node verify/check-bundle.mjs        # 39 项静态与行为断言，纯 Node 内置模块
node verify/run-harness.mjs --list  # 220 项浏览器断言，需要本机 Chrome
```

## E-BLD 构建

```text
build-client: @jiezhengj/dsh-dyslexia -> client.js (769453 bytes, 768423 characters, engine 1.13.0, sources 5, syntax ok)
```

## E-CHK 静态与行为校验

```text
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.1.20
ok   package.json points at the repository npm trusts — git+https://github.com/jiezhengj/DSH-Dyslexia.git
ok   package.json declares the bundle patch and the client half — platform web, no package inject
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 9 patterns
ok   the required published files exist — 24 required files
ok   every interface language has its own plugin page — 8 languages
ok   cordis.patch.yml inserts the plugin by package name — 3 lines
ok   both locales carry metadata — en, zh
ok   client.js is one loader chunk keyed by the package name — 769453 bytes
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
ok   the prompt section states the capability once — 85 words, order 9000, name ui:dsh-dyslexia
ok   the engine type is exposed the way client.js expects — PeleError, detectType, enableZoom, forgetTextWidths, mount, parse, register, registered, render, supports
ok   every supported sample type draws an svg — flowchart:218x64 sequence:184x167 class:80x192 state:87x206 er:144x201 mindmap:172x71 timeline:408x133
ok   a broken diagram reports a one-line reason — Parse error on line 2:
ok   host key echo falls back to bundled strings — key echo, blanks, placeholders rejected
ok   every language carries the same complete sentences — 12 keys x 8 languages, no engine text in labels
ok   client.js matches the sources it claims — c84e521f2df9e30ef9ab2e11db545cdc
ok   the picture is the image, and the copy answer is announced — label is a noun, role="img" on the svg, copy result announced
ok   host children react would refuse fall back to the source — objects, functions and mixed arrays fall back to the source text
ok   every drawing the engine swaps in is named again — the engine owns re-layout; every swapped drawing node and its zoom buttons are renamed, strings follow the language
ok   a host block that throws cannot empty the message — host blocks render inside their own boundary, with the source text as the floor
ok   a factory that cannot build never throws at the host — module-level throw contained, empty module returned
ok   nothing in the package asks you to edit an instruction file — 17 shipped text files, no instruction-file ask
ok   the host half registers exactly one capability section — ui:dsh-dyslexia, order 9000, 85 words
ok   the host half stays silent when the host changed shape — five silent hosts, two throwing sections
ok   the contract's colour variables are the ones that are wired — 10 engine variables, same names and same host aliases on both sides
ok   both size limits reach the engine, each proven on its own — three limits passed to mount, two fixtures that cross one each
ok   the fixtures assert what the fixes promise, and can fail — 21 assertions present and carrying a condition

check-bundle: @jiezhengj/dsh-dyslexia@0.1.20 | client.js 769453 bytes | sources sha256:c84e521f2df9e30ef9ab2e11db545cdc | all 39 checks passed
```

## E-HARN 浏览器行为校验

```text
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
[ok] a throwing code getter does not reach the host
[ok] a throwing code getter leaves the host block — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] a throwing children getter does not reach the host
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
[ok] no React error 31 escapes — object
[ok] a refused children cannot empty the message — function — children=1 text=flowchart LR
  A[Tex
[ok] no React error 31 escapes — function
[ok] a refused children cannot empty the message — object in a failed picture — children=3 text=图里的语法有误，已改为显示源码。flow
[ok] no React error 31 escapes — object in a failed picture
[ok] a refused children cannot empty the message — array with an object — children=3 text=图里的语法有误，已改为显示源码。flow
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
[ok] a scaled picture offers the engine zoom buttons — 3
[ok] the zoom buttons sit outside the image — 0
[ok] the zoom buttons speak the interface language — 放大 | 缩小 | 重置缩放
[ok] every zoom button in reach can take the keyboard — 1/1 reachable of 3
[ok] every zoom button is reachable once the picture is zoomed — 3/3 after zoom
run-harness: @jiezhengj/dsh-dyslexia@0.1.20 | client.js 769453 bytes | sources sha256:c84e521f2df9e30ef9ab2e11db545cdc | all 220 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

同一次运行的 stderr 另有 7 段被**刻意捕获**的异常堆栈（loader ×3、prompt section ×3、module ×1，例如 `dsh-dyslexia: loader Error: host changed the loader`、`dsh-dyslexia: prompt section rejected Error: asynchronous failure`）：它们来自敌意宿主用例，属正常输出，不是失败。

## E-A11Y 图像的读屏取舍（`role="img"` 的代价与补偿）

`role="img"` 让一张图对读屏是一个**有名字的图形**，而不是一堆散落的 `<text>`，代价是：**一旦容器声明为 `img`，辅助技术不再念其中的文字**，图里的节点文字对读屏用户不可达。这是有意的取舍，补偿有三条：

1. 名字可本地化：`svg` 上的 `aria-label` 来自 8 种界面语言的 `figureLabel`（纯名词，不拼引擎类型），并删掉引擎塞进来的英文 `aria-roledescription="flowchart"`；外面那层盒子只声明 `role="group"`，**不带自己的名字**，避免读屏把同一个名字念两遍。夹具在 8 种语言里各断言 `[lang] the picture carries a plain name`、`[lang] first render shows the two buttons`、`[lang] the copy answer is announced in words`（期望值写在 `EXACT` 表里，缺一种语言就红）；另有各自跑一次的 `the image carries the localised name` 与 `the image carries no english role description`。
2. 可读文本始终可得：图下"查看源码"按钮展开同一段 Mermaid 源码（`dsh-dyslexia-source`），源码本身就是信息本体；夹具 `the source toggle flips its word` 与 `a broken diagram without host children still shows its source`，还有"内部 key 不外泄"覆盖。
3. 引擎自己的缩放控件留在图像**之外**并可聚焦：夹具 `the zoom buttons speak the interface language`、`the zoom buttons sit outside the image`、`every zoom button in reach can take the keyboard`，且"小图不渲染缩放控件"（`a picture that fits offers no zoom buttons`）。

因此"读屏用户听不到图内文字"是登记在案的已知取舍，而不是缺陷；可读文本走源码面板，这也是"文本即信息本体"在无障碍上的同一条原则。

## E-PROBE 夹具能失败吗：用破坏性探针验证

如果一个断言恒真，"套件全绿"就不构成证据。0.1.8 至 0.1.20 期间共做了二十一次探针：故意破坏被断言保护的代码、重建 `client.js`、跑两套检查、确认目标断言**变红**，再还原（0.1.10 起的几次在 `%TEMP%` 的仓库副本里做，不动工作树）。报告行里的项数属于**当时的套件**：0.1.10 = 119 项、0.1.11 = 152 项、0.1.12 = 156 项、0.1.13 = 197 项、0.1.14 = 205 项、0.1.15 起 = 213 项、0.1.17 起 = 216 项、0.1.19 起 = 220 项（静态 0.1.19 起 = 39 项）。

| 探针 | 破坏方式 | 变红的断言（含报告行） | 说明 |
|---|---|---|---|
| P1 | 删掉 `src/client/view.js` 里整个 `MutationObserver` 块 | 夹具 `a swapped drawing is named again` → `graphics-document document\|null\|roledesc=flowchart`；`a drawing swapped after a width change is named again` → 同上；静态 `every drawing the engine swaps in is named again` → `a swapped drawing node is not watched for` | 报告行 `run-harness: 2 failed, 117 passed`（exit 1）。这是本插件对"引擎换掉 `<svg>`"的**唯一**路径，也是 FR-018 的实际机制 |
| P2 | `entry.js` 的 `ctx.effect(() => drop, 'dsh-dyslexia: figure styles')` → `void drop` | 夹具 `styles and strings are claimed as effects` → `1`（应 2）、`disabling the plugin takes its stylesheet away` → `true`（应 `false`） | 停用后 `<style>` 留在宿主文档里 |
| P3 | 0.1.8 时：两处 `labelFigure(host, translateRef.current)` → `void 0` | 同上两条命名断言 | 那一版还自带 ResizeObserver 驱动的重排版路径，已被 0.1.10 删除（见 D22） |
| P4 | `src/client/figure.js` 把字号改成 200 | 夹具 `a picture that fits offers no zoom buttons` → `3`（应 0） | 条件渲染缩放按钮的断言确实在执行 |
| P5 | 0.1.11 时：删掉 `src/client/view.js` 里 `safeRead` 的 `try/catch`，让宿主属性取值器的异常直接抛出 | 夹具 `a throwing code getter leaves the host block` → `""`、`a throwing children getter leaves the source` → `""` | 报告行 `run-harness: 2 failed, 150 passed`（exit 1）。这正是 FR-016 要防的"整条消息空白"；第八轮实现评审证明旧版同名断言在同义反复下仍绿，P5 是它修好之后可失败的证明 |
| PA | 0.1.12 时：把 `src/client/view.js` 的 `lang` 分支硬编码成 `'mermaid'`（夹具曾经只测默认值） | 夹具 `the source block keeps the language the host sent` → `language-mermaid`（应 `language-mmd`） | 报告行 `run-harness: 1 failed, 155 passed`（exit 1）。第九轮实现评审指出旧断言只测常量，这是它修好之后可失败的证明 |
| PB | 0.1.12 时：把 `src/client/styles.js` 的 `FIGURE_CSS` 清空 | 夹具 `the picture box is capped to the column` → `none`、`the picture box counts its own padding` → `content-box`、`a wide picture scrolls inside its own box` → `visible`，另有 `the picture follows the host colour without reloading` 变红 | 第九轮实现评审指出旧套件在 `FIGURE_CSS` 清空后几乎全绿；这三条计算样式断言是补上之后可失败的证明 |
| PC | 0.1.12 时：让夹具里 `slots.register` 的 disposer 不删 `defs` | 夹具 `the fence layer is gone once the host disposes` → `1`（应 0） | 报告行 `run-harness: 1 failed, 155 passed`（exit 1）。该断言旧名 `the fence layer is dropped` 只是重复计量同一份簿记，0.1.12 起改成真的把层从宿主表里删掉并改名 |
| P6 | 0.1.13 时：把夹具里 `expect(missingLanguage.length === 0, 'every interface language has expectations'` 改成不调用 `expect` | 驱动报 `run-harness: suite reported 196 checks, expected 197: a check was added or removed`（exit 1） | 夹具套件现在钉死条目数：删一条断言不再可能全绿 |
| P7 | 0.1.13 时：删掉 `check-bundle.mjs` 里一整条 `check('no dsh version gate can refuse a start', …)` 块 | 报告行 `[FAIL] the suite has 36 checks, expected 37: a check was added or removed without updating this number`、`check-bundle: 1 failed, 36 passed`（exit 1） | 静态套件同样钉死条目数 |
| PR1 | 0.1.14 时：把 `src/client/view.js` 的 `setShowSource(false); setCopyState('idle')` 两行换成 `void 0` | 夹具 `a copy answer does not outlive the source it described` 报 `已复制` | `run-harness: 1 failed, 204 passed`，exit 1 |
| PR2 | 0.1.14 时：把 `showSource && !failed` 换成 `showSource` | **没有断言变红（205 全过）** | 如实记录：这条守卫是防御性的——源码一换，PR1 的重置 effect 已经收起面板，所以失败态下不会出现第二份源码；因此不能把 PR2 当成「该守卫可证伪」的证据 |
| PR3 | 0.1.14 时：把 `FigureBoundary.render` 里 `try { input = readLayerInput(this.props) }` 拆开，直接读 | 夹具 `a fence whose props read throws is left to the host, not the message` 报 `""`（整条消息被清空） | `run-harness: 1 failed, 204 passed`，exit 1 |
| PT1 | 0.1.15 时：把 `src/client/view.js` 的 `finishCopy('failed')` 全换成 `finishCopy('copied')` | 8 条 `[lang] a refused clipboard says so` 全部变红（`已复制 / expected 复制失败` 等） | `run-harness: 8 failed, 205 passed`，exit 1 |
| PS1 | 0.1.17 时：只删掉 `src/client/view.js` 里 `setShowSource(false)` 一行（保留 `setCopyState('idle')`） | 夹具 `a new fence closes a panel the reader opened for the old one` → `panels=1`（应 0）、`the new fence offers the panel closed, not open` → `true`（应 `false`） | `run-harness: 2 failed, 214 passed`，exit 1。0.1.17 之前这一行删掉没有任何断言变红（第十三轮实现评审 P3-7 指出的覆盖缺口），所以新增这两条才让"源码一换就收起面板"成为可证伪的行为 |
| PS2 | `src/client/figure.js` 的 `FIGURE_LIMITS` 删掉 `limit: 24 * 1024,` 一行 | 夹具 `a source over the size limit says why`、`a source over the size limit keeps the host block`、`a source over the size limit is not drawn` 三条变红；`a picture with too many edges …` 三条仍绿 | 报告行 `run-harness: 3 failed, 217 passed`（exit 1）。证明「字符上限」这一条被单独保护：旧的 `huge` 夹具同时越两条上限，删任一条都不会红 |
| PS3 | 同上，删掉 `maxEdges: 400,` 一行 | 夹具 `a picture with too many edges says why`、`a picture with too many edges keeps the host block`、`a picture with too many edges is not drawn` 三条变红；字符上限三条仍绿 | 报告行 `run-harness: 3 failed, 217 passed`（exit 1）。两条上限各自可证伪 |
| PS4 | `contracts/client-fence-layer.md` 把 `--pele-line: var(--dsw-alias-border-l2)` 改回 `border-l1` | 静态 `the contract's colour variables are the ones that are wired` → `the contract and the styles disagree: line: var(--dsw-alias-border-l1) vs var(--dsw-alias-border-l2)` | 报告行 `check-bundle: 1 failed, 38 passed`（exit 1）。契约与 `styles.js` 的十行变量逐行相等由断言看守 |
| PS5 | `src/client/styles.js` 把 `--pele-line` 改成 `border-l1`（错值），再在文件末尾追加一行注释 `// --pele-line: var(--dsw-alias-border-l2);` | 静态 `the contract's colour variables are the ones that are wired` → `line: var(--dsw-alias-border-l2) vs var(--dsw-alias-border-l1)` | 报告行 `check-bundle: 1 failed, 38 passed`（exit 1）。注释在读取前被剥掉，诱饵不能把错值洗白（第十七轮实现评审 P3-1） |
| PS6 | `src/client/figure.js` 删掉 `    ...FIGURE_LIMITS,`（三个上限仍声明，但不再传给 `pele.mount`） | 静态 `both size limits reach the engine, each proven on its own` → `FIGURE_LIMITS is not spread into the mount options`；浏览器侧同改动会让六条上限断言全红（`6 failed, 214 passed`） | 报告行 `check-bundle: 1 failed, 38 passed`（exit 1）。「到达引擎」不只是常量存在（P3-3） |
| PS7 | 同时删掉 `styles.js` 与契约里的 `--pele-critical` 行 | 静态 `the contract's colour variables are the ones that are wired` → `the contract names only 9 engine variables` | 报告行 `check-bundle: 1 failed, 38 passed`（exit 1）。两侧同时缺变量也会被抓（P3-4） |

静态检查里另有一条守护 `the fixtures assert what the fixes promise, and can fail`：它要求 P1/P2/P4/P5/PA/PB/PC 里那几个"能变红的断言名"继续存在于夹具中，并且每条名字必须落在带条件的 `expect(` 调用里（掏空断言体会红），否则说明有人把夹具删了而代码检查仍绿。P6/P7 是另一道：两套检查各自的条目数被钉死，删一条也会红。

## E-COMP 兼容性断言与要求逐条对应

| 要求 | 可复跑的断言 |
|---|---|
| FR-001 就地成图、不改消息 | 浏览器：`[zh] a picture is drawn`、`[zh] exactly two buttons`、`two fences draw two pictures`、`the second fence draws its own picture`、`the prose around a picture is left alone`、`the picture and the prose keep their order`（一条消息里两块图与正文并存、顺序不变）；真机：E-LIVE 的「会话里的 mermaid 代码块就地变成图」一行（0.1.2，见 G13） |
| FR-002 不打开侧栏、不生成文件、不新增会话条目 | 静态：`client.js never reaches the network`（不发请求）、`published files leave the build sources out`（源码不进包）；"不写文件、不打开侧栏"由结构决定，结构层面在 E-LIVE 的「会话里的 mermaid 代码块就地变成图」一行里描述过，真机面未核对（G12） |
| FR-003 图旁可看源码与复制 | 浏览器：`[zh] the source toggle flips its word`、`the copy button writes once`、`a real copy is reported as copied` |
| FR-004 渲染失败回退原文 + 可读原因 | 静态：`a broken diagram reports a one-line reason`；浏览器：`a source over the size limit says why`、`a source over the size limit keeps the host block`、`a source over the size limit is not drawn`、`a picture with too many edges says why`、`a picture with too many edges keeps the host block`、`a picture with too many edges is not drawn`（后两组的可证伪性见 E-PROBE 的 PS2、PS3）、`a broken diagram without host children still shows its source` |
| FR-005 浏览器端渲染、零网络请求 | 静态：`client.js never reaches the network`、`client.js carries the vendored engine`；断网实跑仍未做（G9） |
| FR-006 按容器宽度重排、页面不横向溢出 | 浏览器：`the picture takes the column width`、`a wide picture does not widen the column`；真机触控未试（G2） |
| FR-007 跟随宿主主题并在切换后更新 | 浏览器：`the picture follows the host colour without reloading`；真实明暗切换未做（G10） |
| FR-008 8 种界面语言可读、畸形翻译服务回退 | 静态：`every language carries the same complete sentences`、`host key echo falls back to bundled strings`；浏览器：`[ja] a picture is drawn`（8 语言各一轮）、`a host t that echoes the key still shows words`、`a host t that throws still shows words`、`no internal key reaches the eye` |
| FR-009 卸载/禁用/出错时回退文本 | 浏览器：`disabling the plugin takes its stylesheet away`、`a throwing children getter does not reach the host`、`styles and strings are claimed as effects`；真机卸载回退见 E-LIVE 的「卸载插件后，同一条消息变回纯文本代码块」一行（0.1.2，见 G13） |
| FR-010 重装后图恢复、无需迁移 | 真机：E-LIVE 的「重新安装后图与按钮立刻回来」一行（0.1.2，见 G13）；数据层面由 `data-model.md` 的"图源只在消息文本里"保证 |
| FR-011 启用时让模型知情、停用后消失 | 静态：`the host half registers exactly one capability section`、`the host half stays silent when the host changed shape`；"停用后模型侧看不到"未实测（G11） |
| FR-012 不需要改任何指令文件就生效 | 静态：`nothing in the package asks you to edit an instruction file`（17 个随包文本文件里不出现 `AGENTS.md`/`CLAUDE.md`/`.cursorrules`，`client.js` 与 `index.js` 也不读写它们） |
| FR-013 不声明版本否决字段 | `no dsh version gate can refuse a start` |
| FR-014 启动/运行失败就地降级 | `apply stays silent on a changed host`、`a host that rejects the locale option does not break apply`、`a throwing engine leaves a sentence`、`an engine that fails to load leaves the picture to the host` |
| FR-015 产物自身可编译、加载失败不连累同批 | `client.js compiles on its own`、`a broken host loader cannot make the chunk throw`、`a failing factory still yields a silent module`、`a factory that cannot build never throws at the host` |
| FR-016 宿主数据畸形时交回原代码块 | `a hostile host block still leaves the message — an iterable of plain objects`、`a throwing code getter leaves the host block`、`a throwing children getter does not reach the host`、`a falsy children is not mistaken for content`、`a refused children cannot empty the message — object`、`a refused children cannot empty the message — function`、`a refused children cannot empty the message — object in a failed picture`、`a refused children cannot empty the message — array with an object`、`no React error 31 escapes — object`、`a streaming block with no host children still shows its source` |
| FR-017 每条加固都有可重复证据 | 本节所有断言都在仓库里，`node verify/*.mjs` 可复跑；`npm test` 一次跑完两套 |
| FR-018 无障碍结构与播报（每次排版之后） | 静态：`the picture is the image, and the copy answer is announced`、`every drawing the engine swaps in is named again`；浏览器：`the drawing is named when it is first laid out`、`the drawing itself is the image`、`the image carries the localised name`、`the image carries no english role description`、`exactly one image in the picture`、`the box around the picture carries no name of its own`、`the fixture really replaced the drawing node`、`a swapped drawing is named again`、`the fixture replaced the drawing again after the column narrowed`、`a drawing swapped after a width change is named again`、`the zoom buttons speak the interface language`、`the zoom buttons sit outside the image`、`every zoom button in reach can take the keyboard`、`the copy answer is announced in words`（8 语言各一轮）、`the copy answer can be read, not only heard` |

夹具里这几条"证明修复真的在起作用"的断言名，由静态检查 `the fixtures assert what the fixes promise, and can fail` 逐一要求存在——有人删掉夹具时 `check-bundle` 会先变红（评审曾指出：把修复代码换成 `void 0` 而套件仍全绿，等于没有证据）。

卸载清理（FR-014 的"就地降级"在停用路径上的一半）：夹具的假 `ctx` 按 cordis 语义执行 effect/register 返回的 disposer，`disabling the plugin takes its stylesheet away`、`the locale registration is dropped`、`the fence layer is gone once the host disposes` 三条断言"停用后什么都没留下"。

宿主半边另有两项（复用 `index.js` 本体，而非源码字符串匹配）：`the host half registers exactly one capability section`（`ui:dsh-dyslexia`、order 9000、85 词）与 `the host half stays silent when the host changed shape`（5 种畸形宿主 + `section` 抛错 + `section` 返回 rejected Promise）。

## E-PKG 打包内容

`npm pack --dry-run` 报告的 `total files: 33`：`client.js`、`cordis.patch.yml`、`icon.svg`、`index.js`、`LICENSE`、`THIRD-PARTY-NOTICES.md`、`package.json`、9 份 `README*.md`（`README.md` 索引 + 8 份分语言）、8 个 `locale/*.json`、8 篇 `docs/DETAIL*.md`、`docs/preview.svg`。构建源码、夹具、`specs/`、`.specify/`、`.tmp/` 都不在包内。

## E-PUB 发布（tag 触发，不在网页上点确认）

工作流 `.github/workflows/publish.yml` 由 `v*` tag 触发，用 npm trusted publisher（OIDC）发布，不需要在网页上点确认。下表是每一次发布的实况：

| 版本 | Actions run | 结果 | tarball shasum | provenance logIndex | 打包文件数 |
|---|---|---|---|---|---|
| 0.1.0 | 2026-11-22 手动 `npm publish`（浏览器安全密钥） | success | `ad9374f351616c6ded13cc5e3a48115dd0140cad` | — | 10 |
| 0.1.1 | `45031254012` | success | `6f730efa33a453c8f8b2ed08155e2dc85325d5be` | `4045962187` | 33 |
| 0.1.2 | `45036311606` | success | `c27a63156485cb908ede76fce6f4759a8b4eb37b` | `4046319715` | 33 |
| 0.1.3 | `45043233136` | success | `101688f9e27af38436bc12a8898a1a3f56bf361b` | 未记录 | 33 |
| 0.1.4 | `45044972866` | success | `a14b910f0e76647f289211fdedef6f15f19c1b4f` | 未记录 | 33 |
| 0.1.5（第一次） | `45046044274` | **failure**（陈旧产物闸门开火，见 E-CI） | — | — | — |
| 0.1.5 | `45046178925` | success | `e2a4b81bc0d6b45916cf5739a566e89469274cfd` | `4046928419` | 33 |
| 0.1.6 | `45050133828` | success | `8a0a2425c87d7b864b6d6089500bae6a12fe9637` | `4047226918` | 33 |
| 0.1.7 | `45052680467` | success | `935b05b457e8756ab8b45593252ab44594def0e1` | `4047274153` | 33 |
| 0.1.8 | `45055683813` | success | `30408a56f8e3d3054e7ace7feafa0fbde8e676b6` | `4047584418` | 33 |
| 0.1.9 | `45059529254` | success | `71feabc22885e097974a35668e4717837fefd226` | `4047793870` | 33 |
| 0.1.10 | `45062588313` | success | `cff93a6b81b34057d733797834b4549afbd92816` | `4047938866` | 33 |
| 0.1.11 | `45065089410` | success | `7c6d33570ed12ec709effb09349b247db4754655` | `4048037334` | 33 |
| 0.1.12 | `45067949499` | success | `2cae4ca880ddb5401dec6faed1492e1f1622d9f8` | `4048231715` | 33 |
| 0.1.13 | `45071920218` | success | `37da6a6b834f178aca04f91884c7f7f779e91417` | `4048415674` | 33 |
| 0.1.14 | `45074961635` | success | `7a5c2fff3ee9e3408d59506d6a1e8e235db8a59f` | `4048513739` | 33 |
| 0.1.15 | `45077593236` | success | `5fbef04ff91abd350983df0349386f13df8e2a27` | `4048568677` | 33 |
| 0.1.16 | `45079253651` | success | `4a559a0cd107e2dd2175b2d2ff10e3075a53e309` | `4048629730` | 33 |
| 0.1.17 | `45079768869` | success | `e7db974d5fe519d9d454b9a5807ce7d49f943955` | `4048647791` | 33 |
| 0.1.18 | `45082937620` | success | `a84c639452632014ea9fbde9063b7b4f06d236d5` | `4048815195` | 33 |
| 0.1.19 | `45086312392` | success | `9bcbc948d917b04df6f8a93639a4d6437ac5a74c` | `4049111154` | 33 |
| 0.1.20 | `45088530926` | success | `43a5602197d04d37211db3c5c225d5b9b3ffe059` | `4049292002` | 33 |

> `—` 表示该次发布没有对应记录：0.1.0 是手动 `npm publish`，没有 provenance；0.1.5 的第一次是失败的运行，没有产物。0.1.3 与 0.1.4 当时没有记下 logIndex，这里写"未记录"而不是补造一个。

### E-PUB-LOG 0.1.5 起每次发布 CI 日志里的检查报告行（按版本排序）

这些汇总行由工作流在**发布前**跑出来，所以它们证明「发出去的那个 tarball 对应的是通过检查的那棵树」，而不是本地某次运行。工作流不传 `--list`，CI 日志里因此没有任何 `[ok]` 明细行；需要明细时用本地 `--list` 复跑，并如下面 0.1.12 一段那样标明来源。

0.1.5（run `45046178925`，当时 31 项静态 / 82 项浏览器）——CI 日志里只有汇总行：工作流不传 `--list`，`[ok]` 行只写进页面的 DOM，stdout 只有下面两行：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.5 | client.js 761974 bytes | sources sha256:5f89ee58c00607c98d5356575e6be451 | all 31 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.5 | client.js 761974 bytes | all 82 checks passed (/usr/bin/google-chrome)
```

0.1.6（run `45050133828`，31 / 92）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.6 | client.js 762625 bytes | sources sha256:737f61ee187d1956e13917922a931cf0 | all 31 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.6 | client.js 762625 bytes | all 92 checks passed (/usr/bin/google-chrome)
```

0.1.7（run `45052680467`，32 / 101）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.7 | client.js 765002 bytes | sources sha256:e10fbd04aa7812fdbc9adbc0b1d2e95b | all 32 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.7 | client.js 765002 bytes | all 101 checks passed (/usr/bin/google-chrome)
npm notice shasum: 935b05b457e8756ab8b45593252ab44594def0e1
npm notice total files: 33
```

0.1.8（run `45055683813`，34 / 108）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.8 | client.js 768340 bytes | sources sha256:19c9e9146858e7820cb0aa5d8ae7c92a | all 34 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.8 | client.js 768340 bytes | all 108 checks passed (/usr/bin/google-chrome)
npm notice shasum: 30408a56f8e3d3054e7ace7feafa0fbde8e676b6
npm notice total files: 33
```

0.1.9（run `45059529254`，36 / 118）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.9 | client.js 769386 bytes | sources sha256:17eb5c7a6fb8339a904cfa56c6540d3b | all 36 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.9 | client.js 769386 bytes | all 118 checks passed (/usr/bin/google-chrome)
npm notice shasum: 71feabc22885e097974a35668e4717837fefd226
npm notice total files: 33
```

0.1.10（run `45062588313`，36 / 119）——这是**当时**那棵树的两条报告行；版本、字节数、指纹与项数都与当前不同（当前 0.1.20 是 769,453 字节、`c84e521f…`、39 / 220），共同点只有命令与工作流：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.10 | client.js 767298 bytes | sources sha256:336ea7199fb90a0c8202c03e0c14bbe7 | all 36 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.10 | client.js 767298 bytes | all 119 checks passed (/usr/bin/google-chrome)
npm notice 📦  @jiezhengj/dsh-dyslexia@0.1.10
npm notice shasum: cff93a6b81b34057d733797834b4549afbd92816
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4047938866
```

0.1.11（run `45065089410`，36 / 152）——同样是**当时**那棵树的两条报告行，与当前版本在字节数、指纹与项数上都不同：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.11 | client.js 767643 bytes | sources sha256:53c0bc25d05679cd92e7e115d07d7c7d | all 36 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.11 | client.js 767643 bytes | all 152 checks passed (/usr/bin/google-chrome)
npm notice shasum: 7c6d33570ed12ec709effb09349b247db4754655
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048037334
```

0.1.12（run `45067949499`，36 项静态 / 156 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.12 | client.js 767639 bytes | sources sha256:486190784bdd378b14ef3af86af3fcff | all 36 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.12 | client.js 767639 bytes | all 156 checks passed (/usr/bin/google-chrome)
```

0.1.12 本地复跑（`node verify/run-harness.mjs --list`，**不是** CI 日志）——工作流只打印汇总行，`[ok]` 明细只存在于页面 DOM；这是同一棵树在本机复跑的**节选**（末尾的 `run-harness: @jiezhengj/dsh-dyslexia@0.1.12 … all 156 checks passed` 汇总行与当前版本的同名行格式相同，见下面 E-HARN 段）：

```text
[ok] loading client.js registers one factory
[ok] the module exposes apply
[ok] the module asks for slots only — slots
[ok] apply registers exactly one fence layer — count 1
[ok] layer sits on the fence slot — conversation.chat.markdown.fence
[ok] layer is keyed to mermaid — mermaid
[ok] layer id — @jiezhengj/dsh-dyslexia/mermaid
[ok] layer order — 100
[ok] layer claims the locale namespace — dyslexia
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
[ok] [ja] a picture is drawn
[ok] [ja] exactly two buttons — 2
[ok] [ja] no internal key reaches the screen
[ok] [ja] the source toggle starts collapsed
[ok] [ja] the source toggle announces itself as expanded
[ok] [ja] the expanded source keeps its fence language — language-mermaid
[ok] [ja] the mount point is presentational
[ok] [es] a picture is drawn
[ok] [es] exactly two buttons — 2
[ok] [es] no internal key reaches the screen
[ok] [es] the source toggle starts collapsed
[ok] [es] the source toggle announces itself as expanded
[ok] [es] the expanded source keeps its fence language — language-mermaid
[ok] [es] the mount point is presentational
[ok] [fr] a picture is drawn
[ok] [fr] exactly two buttons — 2
[ok] [fr] no internal key reaches the screen
[ok] [fr] the source toggle starts collapsed
[ok] [fr] the source toggle announces itself as expanded
[ok] [fr] the expanded source keeps its fence language — language-mermaid
[ok] [fr] the mount point is presentational
[ok] [de] a picture is drawn
[ok] [de] exactly two buttons — 2
[ok] [de] no internal key reaches the screen
[ok] [de] the source toggle starts collapsed
[ok] [de] the source toggle announces itself as expanded
[ok] [de] the expanded source keeps its fence language — language-mermaid
[ok] [de] the mount point is presentational
[ok] [ru] a picture is drawn
[ok] [ru] exactly two buttons — 2
[ok] [ru] no internal key reaches the screen
[ok] [ru] the source toggle starts collapsed
[ok] [ru] the source toggle announces itself as expanded
[ok] [ru] the expanded source keeps its fence language — language-mermaid
[ok] [ru] the mount point is presentational
[ok] [pt] a picture is drawn
[ok] [pt] exactly two buttons — 2
[ok] [pt] no internal key reaches the screen
[ok] [pt] the source toggle starts collapsed
[ok] [pt] the source toggle announces itself as expanded
[ok] [pt] the expanded source keeps its fence language — language-mermaid
[ok] [pt] the mount point is presentational
[ok] every interface language actually translates
[ok] the source block keeps the language the host sent — language-mmd
[ok] a host t that echoes the key still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that throws still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that answers blanks still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that echoes key with a value still shows words — 查看源码 | 复制源码 / 图
[ok] a host t that leaves a placeholder still shows words — 查看源码 | 复制源码 / 图
[ok] a streaming fence shows only the host block
[ok] a truthy streaming flag is honoured
[ok] a throwing code getter does not reach the host
[ok] a throwing code getter leaves the host block — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] a throwing children getter does not reach the host
[ok] a throwing children getter leaves the source — "flowchart LR\n  A[Text] --> B[Picture]"
[ok] a non-string fence is left to the host
[ok] a broken diagram says why
[ok] the reason is a complete sentence — 图里的语法有误，已改为显示源码。
[ok] the engine English is not pasted into the sentence
[ok] a broken diagram keeps the host block
[ok] a broken diagram without host children still shows its source
[ok] a throwing engine leaves a sentence
[ok] a throwing engine keeps the host block
[ok] a missing clipboard is reported, not faked — 复制失败 / 查看源码 | 复制源码
[ok] the copy button writes once — 1
[ok] a real copy is reported as copied — 已复制 / 查看源码 | 复制源码
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
[ok] no internal key reaches the eye — leaked: 
[ok] a source past the size limit says why — 这张图无法绘制，已改为显示源码。huge
[ok] a source past the size limit keeps the host block
[ok] the picture appears when the stream ends
[ok] a falsy children is not mistaken for content — 图里的语法有误，已改为显示源码。flowchart TD
[ok] a refused children cannot empty the message — object — children=1 text=flowchart LR
[ok] no React error 31 escapes — object
[ok] a refused children cannot empty the message — function — children=1 text=flowchart LR
[ok] no React error 31 escapes — function
[ok] a refused children cannot empty the message — object in a failed picture — children=3 text=图里的语法有误，已改为显示源码。flow
[ok] no React error 31 escapes — object in a failed picture
[ok] a refused children cannot empty the message — array with an object — children=3 text=图里的语法有误，已改为显示源码。flow
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
[ok] a scaled picture offers the engine zoom buttons — 3
[ok] the zoom buttons sit outside the image — 0
[ok] the zoom buttons speak the interface language — 放大 | 缩小 | 重置缩放
[ok] every zoom button in reach can take the keyboard — 1/1 reachable of 3
```

0.1.13（run `45071920218`，37 项静态 / 197 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.13 | client.js 767639 bytes | sources sha256:0a1deabdc8b0c983289478e451d16283 | all 37 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.13 | client.js 767639 bytes | sources sha256:0a1deabdc8b0c983289478e451d16283 | all 197 checks passed (/usr/bin/google-chrome)
npm notice shasum: 37da6a6b834f178aca04f91884c7f7f779e91417
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048415674
```

0.1.14（run `45074961635`，37 项静态 / 205 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.14 | client.js 769771 bytes | sources sha256:c0e38c5373e00f1f9432895504946ba3 | all 37 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.14 | client.js 769771 bytes | sources sha256:c0e38c5373e00f1f9432895504946ba3 | all 205 checks passed (/usr/bin/google-chrome)
npm notice shasum: 7a5c2fff3ee9e3408d59506d6a1e8e235db8a59f
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048513739
```

0.1.15（run `45077593236`，37 项静态 / 213 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.15 | client.js 769391 bytes | sources sha256:4df7b0b5ee7636f67b467672946f5b1b | all 37 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.15 | client.js 769391 bytes | sources sha256:4df7b0b5ee7636f67b467672946f5b1b | all 213 checks passed (/usr/bin/google-chrome)
npm notice shasum: 5fbef04ff91abd350983df0349386f13df8e2a27
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048568677
```

0.1.16（run `45079253651`，37 项静态 / 213 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.16 | client.js 769391 bytes | sources sha256:f837913297259c0f99bc780f154d287a | all 37 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.16 | client.js 769391 bytes | sources sha256:f837913297259c0f99bc780f154d287a | all 213 checks passed (/usr/bin/google-chrome)
npm notice shasum: 4a559a0cd107e2dd2175b2d2ff10e3075a53e309
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048629730
```

0.1.17（run `45079768869`，37 项静态 / 216 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.17 | client.js 769391 bytes | sources sha256:1c53080c47f54e1b683218022207dcd1 | all 37 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.17 | client.js 769391 bytes | sources sha256:1c53080c47f54e1b683218022207dcd1 | all 216 checks passed (/usr/bin/google-chrome)
npm notice shasum: e7db974d5fe519d9d454b9a5807ce7d49f943955
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048647791
```

0.1.18（run `45082937620`，37 项静态 / 216 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.18 | client.js 769391 bytes | sources sha256:f5b4e6eb0b1402f42ba0fcc19e23df9e | all 37 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.18 | client.js 769391 bytes | sources sha256:f5b4e6eb0b1402f42ba0fcc19e23df9e | all 216 checks passed (/usr/bin/google-chrome)
npm notice shasum: a84c639452632014ea9fbde9063b7b4f06d236d5
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4048815195
```

0.1.19（run `45086312392`，39 项静态 / 220 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.19 | client.js 769453 bytes | sources sha256:f08d3ef095f2cc09d26ca04c013dcc9a | all 39 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.19 | client.js 769453 bytes | sources sha256:f08d3ef095f2cc09d26ca04c013dcc9a | all 220 checks passed (/usr/bin/google-chrome)
npm notice shasum: 9bcbc948d917b04df6f8a93639a4d6437ac5a74c
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4049111154
```

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.20 | client.js 769453 bytes | sources sha256:c84e521f2df9e30ef9ab2e11db545cdc | all 39 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.20 | client.js 769453 bytes | sources sha256:c84e521f2df9e30ef9ab2e11db545cdc | all 220 checks passed (/usr/bin/google-chrome)
npm notice shasum: 43a5602197d04d37211db3c5c225d5b9b3ffe059
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4049292002
+ @jiezhengj/dsh-dyslexia@0.1.20
```

## E-CI 发布前检查抓到一个真实缺陷（0.1.5 第一次运行）

`45046044274` 在 "Refuse to publish if the committed chunk is stale" 这一步失败：

两行只保留头尾，中间的品牌行省略（CI 原文是 `| MIT | bundles Pele 1.13.0 (MIT, see THIRD-PARTY-NOTICES.md) |`）：

```text
-/*! @jiezhengj/dsh-dyslexia 0.1.5 | ... | sources sha256:9876db88174469acc5a4266c272e5b34 */
+/*! @jiezhengj/dsh-dyslexia 0.1.5 | ... | sources sha256:5f89ee58c00607c98d5356575e6be451 */
```

原因：Windows 工作区的源码是 CRLF，CI 检出是 LF（`.gitattributes` 的 `* text=auto eol=lf`），指纹按原始字节计算，于是同一份源码在两处算出两个指纹。修法已进仓库：`scripts/build-client.mjs` 的 `readSource()` 与 `verify/check-bundle.mjs` 的 `sourceFingerprint()` 都先把源码统一成 LF，再内联与哈希。提交 `eeb4a05` 之后 CI 与本机指纹一致（`5f89ee58…`）。这条失败因此保留在这里：它证明"拒绝发陈旧产物"这道闸门真的会开火，而不是摆设。

## E-INS 从 registry 安装

`plugin_manager remove_bundle @jiezhengj/dsh-dyslexia`（卸 0.1.19，pnpm 输出 `- @jiezhengj/dsh-dyslexia 0.1.19`）→ `install_bundle` 目标 `@jiezhengj/dsh-dyslexia@0.1.20`，结果 `application: "applied"`、`version: "0.1.20"`，pnpm 输出：

```text
dependencies:
+ @jiezhengj/dsh-dyslexia 0.1.20

Done in 2.8s using pnpm v11.28.5
```

第一次尝试失败过一次，原因是镜像落后（`ERR_PNPM_NO_MATCHING_VERSION … while fetching it from https://registry.npmmirror.com/`，当时 npmjs 的版本文件已 200 但 tarball 仍 404）；等 npmjs 的 tarball 复制完成后再按包名安装即成功。这个滞后每次发版都会出现（约 2–10 分钟），不是包的问题。

安装后实测（`C:\Users\jiezhengj\.dsh\profiles\desktop`）：

| 检查 | 实测 |
|---|---|
| profile 依赖 | `"@jiezhengj/dsh-dyslexia": "0.1.20"`（版本号，不是 `link:`） |
| `node_modules/@jiezhengj/dsh-dyslexia/client.js` | 769,453 字节，SHA256 `910E7E465228102851AC14228B994FBA418FA215C17C90140C1C2410650DA7DE`（与仓库根逐字节相同） |
| `locale/` | 8 个 json |
| `docs/` | 9 个文件（8 篇 `DETAIL*.md` + `preview.svg`） |
| 包内 `version` | `0.1.20` |

## E-LIVE 真机（DSH 桌面窗口内）

**以下记录来自 0.1.2**，当前版本（0.1.19）的重启核对是 T079（**尚未取证**，见 G13）。之所以保留，是因为它们证明了链路本身可用；从 0.1.2 到 0.1.19 渲染层改过多次（`role` 结构、`aria-roledescription` 的移除与重排版后重标、可见的复制反馈、空/非法 `children` 的处理、源码块的 `language-mermaid` 标记、外层盒子去掉名字），所以这些观察**不能**自动转移到 `0.1.18`。

| 观察 | 当时的证据 | 归属 |
|---|---|---|
| 插件列表里出现 `DSH 图示阅读`，说明页是**中文**描述 + `preview.svg` 渲染出的插图（当时只看了中文这一种语言） | 侧栏「插件」→「已安装插件」→「查看 DSH 图示阅读」，`agent-desktop find --role image` 命中 alt = "一条会话消息里的 mermaid 代码块被就地画成图，图下方是查看源码与复制源码两个按钮" | US1 的可见性（FR-008 的 zh 一种语言），不含 SC-001 计时，也不含其余 7 种语言的说明页 |
| 会话里的 ```mermaid 代码块就地变成图，图下有"查看源码/复制源码" | 回复里贴真代码块后 `agent-desktop find --role image` 命中 `name="图：flowchart"`、`find --role button` 命中 `复制源码` | FR-003、FR-007 |
| 卸载插件后，同一条消息变回纯文本代码块，无报错无占位 | `remove_bundle` 后 `flowchart LR … A[代码块] --> B[就地成图]` 原样显示，`role="img"`（`agent-desktop` 报告为 image）与按钮计数为 0 | US2/FR-009（不含 SC-002 的会话检索命中） |
| 重新安装后图与按钮立刻回来，历史消息不用改 | `install_bundle` 后同一屏立刻渲染 | FR-010 |

## E-GAPS 没有取证的部分（共 19 项）

真机、设备与离线条件（都要求动手换条件，不能在 CI 里做）：

- **G1 宿主升级演练（T042）**：需要在真实 DSH 升级时验证"升级后仍能打开、插件不连累启动"。目前只有源码级论证（`unpatch` 语义、无 `engines` 门、`ctx.effect` 清理、层与包同生命周期）与 0.1.8 的 CI/夹具证据，没有一次真实升级。
- **G2 实体手机/平板触控（T023 的硬件部分）**：窄屏证据来自 headless Chrome 的 360 px 夹具（`the picture takes the column width`、`a wide picture does not widen the column`、`the page itself never overflows`），不是真实设备触控。
- **G3 断网裸机安装（T025）**：`client.js never reaches the network` 只证明产物没有网络调用；"一台没有任何缓存/CDN 的机器上离线装得上"没有验证。
- **G4 畸形宿主的真机注入（T041）**：宿主机侧 7 次 `apply`（5 种静默 ctx + 2 次异常调用）与客户端 7 种畸形 `ctx`（`undefined`、`null`、`{}`、`{slots:null}`、`{slots:{}}`、`inject`/`register` 为空函数、`inject` 抛错）只在夹具与 `check-bundle` 的 vm 里复现，没有在一次真实宿主里注入过。
- **G5 quickstart 的 E1–E16 逐条复跑（T031）**：证据表本身不是证据。其中 E2（同一条消息两块 `mermaid` 并存）自 0.1.13 起有夹具（`two fences draw two pictures`、`the second fence draws its own picture`、`the prose around a picture is left alone`、`the picture and the prose keep their order`），E16（非 `mermaid` 的代码块不受影响）**既没有夹具、也没有真机观察**——220 项夹具里没有这一用例（0.1.13 时是 197 项，0.1.15 与 0.1.16 是 213 项，0.1.17 至 0.1.19 是 216 项）。E10（**卸载后旧会话回退为代码块**）有 0.1.2 的真机观察；E15 按 `quickstart.md` 的定义是"**未装插件的新会话不产生只有插件才看得懂的内容**"，它既没有夹具也没有真机观察（0.1.2 的观察里没有这一条）。

指标类（定义写得出来，但没有一条被真正测量）：

- **G6 SC-001（1 秒内出图）**：没有任何计时断言。
- **G7 SC-002（卸载后可被 `session_search` 命中）**：没有跑过检索（T019）。
- **G8 SC-003（图内文字不小于正文最小字号）**：`figureSize` 保证字号下限，但没有断言把"正文最小字号"作为比较基准。
- **G9 SC-004（断网渲染，外部请求数为 0）**：只有"产物不含 `fetch`/`XMLHttpRequest`/外部 URL"的静态断言与 `file://` 夹具，没有断网下真的渲染一次并数请求。
- **G10 SC-005（主题切换无需刷新）**：夹具只换了一个 CSS 变量并验证 `fill` 变化，不等于真实明→暗→明切换。

行为类：

- **G11 FR-011 的后半（停用插件后提示词段消失）**：只有 `apply` 注册段的静态证据与宿主半边契约，没有"停用后模型侧看不到"的实测（T027）。
- **G12 FR-002 的真机面（不打开侧栏、不生成文件、不新增会话条目）**：插件在结构上不写文件、不碰宿主布局（静态可读），但没有一次真机上"看完这张图，磁盘与会话条目都没变"的核对。
- **G13 当前版本的重启后真机核对（T079）**：`E-LIVE` 的观察取自 **0.1.2**，且只有四件事——插件页的**中文**说明与插图、会话里就地成图（图名 `图：flowchart`、两个按钮）、卸载后同一条消息回退为代码块、重装后图与按钮立刻回来。**复制播报**（0.1.5 起才有）与**其余 7 种语言的插件页**从未在真机上看过，不能算已观察。0.1.3–0.1.19 改过 `view.js`、`i18n.js`、`entry.js`、`styles.js`（0.1.18 只改了文档与 README；0.1.19 改了 `styles.js` 的变量块；0.1.20 只改了测试与文档），这些观察不能自动转移。0.1.11 至 0.1.20 都已发布并装进 `desktop` profile，但**没有在重启后的宿主里逐项复核过**，所以算未取证。
- **G14 真实窗口缩放时的引擎重绘（FR-018 的端到端面）**：0.1.10 把重排版交给引擎自己的 `ResizeObserver`（pele 内部），插件只负责"节点被换回来就重新命名"。夹具能证明"节点被换 → 立刻重新命名"，但**无法让引擎在无头浏览器里真的因窗口缩放而重绘**（无头环境第一帧之后不再派发帧与 ResizeObserver 通知）。真实窗口里"拖窄窗口 → 引擎重绘 → 名字回来"这条链只有机制级证据。
- **G15 尚未覆盖的加固面（第十轮实现评审记录，第十七轮复核后收窄）**：以下五项都没有断言守着的反面，但不影响已发布行为——① `src/client/figure.js` 的 `outputLimit`（2 MiB 绘制输出上限）没有用例（字符上限 `limit: 24 * 1024` 与边数上限 `maxEdges: 400` 在 0.1.19 起已有单独夹具，见 E-HARN 的 `a source over the size limit *` 与 `a picture with too many edges *` 六条，以及 E-PROBE 的 PS2、PS3）；② `src/client/entry.js` 里 `slots.inject(...)` 返回的 disposer 被丢掉（层本身随 `apply` 的作用域一起消失，但没有“二次 apply 不重复注册”或“ inject 的句柄被单独释放”的断言）；③ `apply` 没有幂等断言（连装两次会怎样没有测试）；④ `package.json` 的 `prepack` 只跑构建与 `check-bundle`，不跑夹具（依赖 CI 的五步兜住）；⑤ `package.json` 若加入 `engines.node` 等非 `dsh` 子键，`no dsh version gate can refuse a start` 不会变红（当前清单没有 `engines` 键，属“没有断言的清单形状面”）。
- **G16 vendor 文本与换节点的无头局限（记录）**：`client.js` 里 vendor 许可注释含 `https://github.com/obsidianmd/pele`，属静态文本、无网络行为；「引擎换掉 `<svg>` 后重新命名」在无头环境里只能靠夹具重放（真实拖窄窗口的端到端见 G14）。绘制输出上限（`outputLimit` 2 MiB）仍按 G15 记；字符上限与边数上限在 0.1.19 起已有夹具，这里同样不重复。
- **G17 视图层的几处行为没有任何断言（第十四轮实现评审 P3 汇总）**：以下保证在代码里存在，但删掉/改坏不会让任何断言变红——①「画不出来的原因分三种」只有"有一句话"被保护（把 `translate('syntaxError')` 换成 `translate('renderFailed')`、或把 `engineUnavailable` 换成 `renderFailed`，两套检查仍全绿）；②缩放按钮按引擎顺序贴标签（`ZOOM_BUTTONS = ['zoomIn','zoomOut','resetZoom']`），顺序写错不会变红，读屏会把"放大"念成"缩小"；③失败后同一实例的自愈（`FigureBoundary.componentDidUpdate` 里 `code` 变了才复位）无断言；④失败时隐藏那个空画框（`style: failed ? { display: 'none' } : undefined`）无断言；⑤"已复制"1.5 秒后自动消失（`COPIED_FEEDBACK_MS`）无断言；⑥`children: []`（React 合法、但画不出东西）会退回原文这条分支无断言；⑦`MutationObserver` 只观察直接子节点（无 `subtree`），引擎若在既有 `<svg>` 内部重排则名字不补；⑧`FigureBoundary` 在 `props` 与 `code` 都读不出来时返回 `null`，这条兜底无断言。
  这些都不影响"能力存在"，但它们是这一层最薄的地方；不再往下修的原因是每加一条断言都要连带重算证据与发版，而这一轮的目标是把**说法**收紧到与证据一致。
- **G18 引擎缺失分支只有静态证据（第十六轮实现评审 P3，第十七轮文档评审修正）**：引擎被内联进 `client.js`，正常构建下运行期不会缺失；`an engine that fails to load leaves the picture to the host` 断言的是产物里存在错误边界、`readLayerInput`、`safeRead`、`engineUnavailable` 这句话，以及 `typeof pele.mount !== 'function'` 这个守卫字符串（把守卫改成恒真，这条静态断言会立刻变红），但**没有动态用例**把引擎置空后观察回退——`scripts/build-client.mjs` 的 `catch (error) { pele = null }` 与 `plan.md` 的「引擎 IIFE 失败则置空」就是这条分支的入口。它的价值是「模型知情、宿主换了加载方式时仍给一句话而不是白屏」，不是可演练的行为。
- **G19 静态套件只钉顶层条目数，不钉条目内部的断言数（第十七轮实现评审 P3）**：`verify/check-bundle.mjs` 的 `EXPECTED_CHECKS = 39` 只保证「有 39 个 `check()`」，某一条 `check()` 内部的某行 `assert()` 被删掉时套件仍报全过；浏览器夹具是逐条 `expect()` 计数（删一条即 `run-harness: suite reported X checks, expected Y`），两侧的看守强度并不相同。
---

**本文件与 tasks.md 的关系**：`tasks.md` 末尾的状态表逐行对应上面 19 项，两处若不一致，以本文件为准（本文件是证据的归属地，`tasks.md` 是工作项的记录）。

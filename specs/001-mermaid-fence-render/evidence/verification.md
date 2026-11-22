# 验证证据

本文件只记录**已经真实跑过**的命令输出。每一段输出来自**同一次运行**，并且这次运行的报告行自带 `包名@版本 | client.js 字节数 | sources sha256:<指纹>`，所以任何一段都可以被追溯到具体的一棵树。当前版本：`0.1.9`。

复跑方式（任何人 clone 后都一样）：

```bash
node scripts/build-client.mjs       # 由 src/client/*.js + vendor/pele 生成 client.js
node verify/check-bundle.mjs        # 36 项静态与行为断言，纯 Node 内置模块
node verify/run-harness.mjs --list  # 119 项浏览器断言，需要本机 Chrome
```

## E-BLD 构建

```text
build-client: @jiezhengj/dsh-dyslexia -> client.js (767298 bytes, 766268 characters, engine 1.13.0, sources 5, syntax ok)
```

## E-CHK 静态与行为校验

```text
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.1.10
ok   package.json points at the repository npm trusts — git+https://github.com/jiezhengj/DSH-Dyslexia.git
ok   package.json declares the bundle patch and the client half — platform web, no package inject
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 9 patterns
ok   every published file exists — 24 files
ok   every interface language has its own plugin page — 8 languages
ok   cordis.patch.yml inserts the plugin by package name — 3 lines
ok   both locales carry metadata — en, zh
ok   client.js is one loader chunk keyed by the package name — 767298 bytes
ok   client.js requires react and nothing else — react
ok   client.js never reaches the network — no fetch, no XHR, no dynamic import, no remote URL
ok   client.js carries the vendored engine — Pele 1.13.0 inlined
ok   client.js compiles on its own — no syntax error for a host batch to inherit
ok   a broken host loader cannot make the chunk throw — throwing loader, missing loader, missing window
ok   a failing factory still yields a silent module — no react, no ctx, no slots, empty services
ok   an engine that fails to load leaves the picture to the host — boundary + guarded props + engine sentence
ok   the layer is keyed to mermaid on the fence slot — conversation.chat.markdown.fence + mermaid
ok   host half declares its package identity and one service — systemPrompt only
ok   host apply survives a host that changed shape — six hostile hosts, no throw, no section
ok   the prompt section states the capability once — 85 words, order 9000, name ui:dsh-dyslexia
ok   the engine type is exposed the way client.js expects — PeleError, detectType, enableZoom, forgetTextWidths, mount, parse, register, registered, render, supports
ok   every supported sample type draws an svg — flowchart:218x64 sequence:184x167 class:80x192 state:87x206 er:144x201 mindmap:172x71 timeline:408x133
ok   a broken diagram reports a one-line reason — Parse error on line 2:
ok   host key echo falls back to bundled strings — key echo, blanks, placeholders rejected
ok   every language carries the same complete sentences — 12 keys x 8 languages, no engine text in labels
ok   client.js matches the sources it claims — 336ea7199fb90a0c8202c03e0c14bbe7
ok   the picture is the image, and the copy answer is announced — label is a noun, role="img" on the svg, copy result announced
ok   host children react would refuse fall back to the source — objects, functions and mixed arrays fall back to the source text
ok   every drawing the engine swaps in is named again — the engine owns re-layout; every swapped drawing node and its zoom buttons are renamed, strings follow the language
ok   a host block that throws cannot empty the message — host blocks render inside their own boundary, with the source text as the floor
ok   a factory that cannot build never throws at the host — module-level throw contained, empty module returned
ok   nothing in the package asks you to edit an instruction file — 17 shipped text files, no instruction-file ask
ok   the host half registers exactly one capability section — ui:dsh-dyslexia, order 9000, 85 words
ok   the host half stays silent when the host changed shape — five silent hosts, one throwing section
ok   the fixtures assert what the fixes promise, and can fail — 7 assertions present
check-bundle: @jiezhengj/dsh-dyslexia@0.1.10 | client.js 767298 bytes | sources sha256:336ea7199fb90a0c8202c03e0c14bbe7 | all 36 checks passed
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
[ok] [zh] the picture carries a plain name — 图
[ok] [zh] first render shows the two buttons — 查看源码 | 复制源码
[ok] [zh] a picture is drawn
[ok] [zh] exactly two buttons — 2
[ok] [zh] no internal key reaches the screen
[ok] [zh] the source toggle flips its word — 隐藏源码
[ok] [en] the picture carries a plain name — Diagram
[ok] [en] first render shows the two buttons — Show source | Copy source
[ok] [en] a picture is drawn
[ok] [en] exactly two buttons — 2
[ok] [en] no internal key reaches the screen
[ok] [en] the source toggle flips its word — Hide source
[ok] [ja] a picture is drawn
[ok] [ja] exactly two buttons — 2
[ok] [ja] no internal key reaches the screen
[ok] [es] a picture is drawn
[ok] [es] exactly two buttons — 2
[ok] [es] no internal key reaches the screen
[ok] [fr] a picture is drawn
[ok] [fr] exactly two buttons — 2
[ok] [fr] no internal key reaches the screen
[ok] [de] a picture is drawn
[ok] [de] exactly two buttons — 2
[ok] [de] no internal key reaches the screen
[ok] [ru] a picture is drawn
[ok] [ru] exactly two buttons — 2
[ok] [ru] no internal key reaches the screen
[ok] [pt] a picture is drawn
[ok] [pt] exactly two buttons — 2
[ok] [pt] no internal key reaches the screen
[ok] every interface language actually translates
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
[ok] the fence layer is dropped — 1
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
[ok] every enabled zoom button can take the keyboard — 2/2 enabled of 3
run-harness: @jiezhengj/dsh-dyslexia@0.1.10 | client.js 767298 bytes | all 119 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

## E-A11Y 图像的读屏取舍（`role="img"` 的代价与补偿）

`role="img"` 让一张图对读屏是一个**有名字的图形**，而不是一堆散落的 `<text>`，代价是：**一旦容器声明为 `img`，辅助技术不再念其中的文字**，图里的节点文字对读屏用户不可达。这是有意的取舍，补偿有三条：

1. 名字可本地化：`svg` 上的 `aria-label` 来自 8 种界面语言的 `figureLabel`（纯名词，不拼引擎类型），并删掉引擎塞进来的英文 `aria-roledescription="flowchart"`；外面那层盒子只声明 `role="group"`，**不带自己的名字**，避免读屏把同一个名字念两遍；夹具逐语言断言 `the image carries the localised name` 与 `the image carries no english role description`。
2. 可读文本始终可得：图下"查看源码"按钮展开同一段 Mermaid 源码（`dsh-dyslexia-source`），源码本身就是信息本体；夹具 `the source toggle flips its word` 与 `a broken diagram without host children still shows its source`，还有"内部 key 不外泄"覆盖。
3. 引擎自己的缩放控件留在图像**之外**并可聚焦：夹具 `the zoom buttons speak the interface language`、`the zoom buttons sit outside the image`、`every enabled zoom button can take the keyboard`，且"小图不渲染缩放控件"（`a picture that fits offers no zoom buttons`）。

因此"读屏用户听不到图内文字"是登记在案的已知取舍，而不是缺陷；可读文本走源码面板，这也是"文本即信息本体"在无障碍上的同一条原则。

## E-PROBE 夹具能失败吗：用破坏性探针验证

如果一个断言恒真，"套件全绿"就不构成证据。0.1.10 发布前在同一工作树上做了四次探针：故意破坏被断言保护的代码、重建 `client.js`、跑两套检查、确认目标断言**变红**，再还原。

| 探针 | 破坏方式 | 变红的断言（含报告行） | 说明 |
|---|---|---|---|
| P1 | 删掉 `src/client/view.js` 里整个 `MutationObserver` 块 | 夹具 `a swapped drawing is named again` → `graphics-document document\|null\|roledesc=flowchart`；`a drawing swapped after a width change is named again` → 同上；静态 `every drawing the engine swaps in is named again` → `a swapped drawing node is not watched for` | 报告行 `run-harness: 2 failed, 117 passed`（exit 1）。这是本插件对"引擎换掉 `<svg>`"的**唯一**路径，也是 FR-018 的实际机制 |
| P2 | `entry.js` 的 `ctx.effect(() => drop, 'dsh-dyslexia: figure styles')` → `void drop` | 夹具 `styles and strings are claimed as effects` → `1`（应 2）、`disabling the plugin takes its stylesheet away` → `true`（应 `false`） | 停用后 `<style>` 留在宿主文档里 |
| P3 | 0.1.8 时：两处 `labelFigure(host, translateRef.current)` → `void 0` | 同上两条命名断言 | 那一版还自带 ResizeObserver 驱动的重排版路径，已被 0.1.10 删除（见 D22） |
| P4 | `src/client/figure.js` 把字号改成 200 | 夹具 `a picture that fits offers no zoom buttons` → `3`（应 0） | 条件渲染缩放按钮的断言确实在执行 |

静态检查里另有一条守护 `the fixtures assert what the fixes promise, and can fail`：它要求 P1/P2/P4 里那几个"能变红的断言名"继续存在于夹具中，否则说明有人把夹具删了而代码检查仍绿。

## E-COMP 兼容性断言与要求逐条对应

| 要求 | 可复跑的断言 |
|---|---|
| FR-001 就地成图、不改消息 | 浏览器：`[zh] a picture is drawn`、`[zh] exactly two buttons`；真机：E-LIVE-2（0.1.2，见 G13） |
| FR-002 不打开侧栏、不生成文件、不新增会话条目 | 静态：`client.js never reaches the network`（不写文件、不发请求）、`published files leave the build sources out`；结构层面在 E-LIVE-2 描述过，但真机面未核对（G12） |
| FR-003 图旁可看源码与复制 | 浏览器：`[zh] the source toggle flips its word`、`the copy button writes once`、`a real copy is reported as copied` |
| FR-004 渲染失败回退原文 + 可读原因 | 静态：`a broken diagram reports a one-line reason`；浏览器：`a source past the size limit says why`、`a source past the size limit keeps the host block`、`a broken diagram without host children still shows its source` |
| FR-005 浏览器端渲染、零网络请求 | 静态：`client.js never reaches the network`、`client.js carries the vendored engine`；断网实跑仍未做（G9） |
| FR-006 按容器宽度重排、页面不横向溢出 | 浏览器：`the picture takes the column width`、`a wide picture does not widen the column`；真机触控未试（G2） |
| FR-007 跟随宿主主题并在切换后更新 | 浏览器：`the picture follows the host colour without reloading`；真实明暗切换未做（G10） |
| FR-008 8 种界面语言可读、畸形翻译服务回退 | 静态：`every language carries the same complete sentences`、`host key echo falls back to bundled strings`；浏览器：`[ja] the picture is drawn`（8 语言各一轮）、`a host t that echoes the key still shows words`、`a host t that throws still shows words`、`no internal key reaches the eye` |
| FR-009 卸载/禁用/出错时回退文本 | 浏览器：`disabling the plugin takes its stylesheet away`、`a throwing children getter does not reach the host`、`styles and strings are claimed as effects`；真机卸载回退见 E-LIVE-5（0.1.2，见 G13） |
| FR-010 重装后图恢复、无需迁移 | 真机：E-LIVE-6（0.1.2，见 G13）；数据层面由 `data-model.md` 的"图源只在消息文本里"保证 |
| FR-011 启用时让模型知情、停用后消失 | 静态：`the host half registers exactly one capability section`、`the host half stays silent when the host changed shape`；"停用后模型侧看不到"未实测（G11） |
| FR-012 不需要改任何指令文件就生效 | 静态：`nothing in the package asks you to edit an instruction file`（17 个随包文本文件里不出现 `AGENTS.md`/`CLAUDE.md`/`.cursorrules`，`client.js` 与 `index.js` 也不读写它们） |
| FR-013 不声明版本否决字段 | `no dsh version gate can refuse a start` |
| FR-014 启动/运行失败就地降级 | `apply stays silent on a changed host`、`a host that rejects the locale option does not break apply`、`a throwing engine leaves a sentence`、`an engine that fails to load leaves the picture to the host` |
| FR-015 产物自身可编译、加载失败不连累同批 | `client.js compiles on its own`、`a broken host loader cannot make the chunk throw`、`a failing factory still yields a silent module`、`a factory that cannot build never throws at the host` |
| FR-016 宿主数据畸形时交回原代码块 | `a hostile host block still leaves the message — an iterable of plain objects`、`a throwing code getter leaves the host block`、`a throwing children getter does not reach the host`、`a falsy children is not mistaken for content`、`a refused children cannot empty the message — object`、`a refused children cannot empty the message — function`、`a refused children cannot empty the message — object in a failed picture`、`a refused children cannot empty the message — array with an object`、`no React error 31 escapes — object`、`a streaming block with no host children still shows its source` |
| FR-017 每条加固都有可重复证据 | 本节所有断言都在仓库里，`node verify/*.mjs` 可复跑；`npm test` 一次跑完两套 |
| FR-018 无障碍结构与播报（每次排版之后） | 静态：`the picture is the image, and the copy answer is announced`、`every drawing the engine swaps in is named again`；浏览器：`the drawing is named when it is first laid out`、`the drawing itself is the image`、`the image carries the localised name`、`the image carries no english role description`、`exactly one image in the picture`、`the box around the picture carries no name of its own`、`the fixture really replaced the drawing node`、`a swapped drawing is named again`、`the fixture replaced the drawing again after the column narrowed`、`a drawing swapped after a width change is named again`、`the zoom buttons speak the interface language`、`the zoom buttons sit outside the image`、`every enabled zoom button can take the keyboard` |

夹具里这几条"证明修复真的在起作用"的断言名，由静态检查 `the fixtures assert what the fixes promise, and can fail` 逐一要求存在——有人删掉夹具时 `check-bundle` 会先变红（评审曾指出：把修复代码换成 `void 0` 而套件仍全绿，等于没有证据）。

卸载清理（FR-014 的"就地降级"在停用路径上的一半）：夹具的假 `ctx` 按 cordis 语义执行 effect/register 返回的 disposer，`disabling the plugin takes its stylesheet away`、`the locale registration is dropped`、`the fence layer is dropped` 三条断言"停用后什么都没留下"。

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
| 0.1.3 | `45043233136` | success | `101688f9e27af38436bc12a8898a1a3f56bf361b` | — | 33 |
| 0.1.4 | `45044972866` | success | `a14b910f0e76647f289211fdedef6f15f19c1b4f` | — | 33 |
| 0.1.5（第一次） | `45046044274` | **failure**（陈旧产物闸门开火，见 E-CI） | — | — | — |
| 0.1.5 | `45046178925` | success | `e2a4b81bc0d6b45916cf5739a566e89469274cfd` | `4046928419` | 33 |
| 0.1.6 | `45050133828` | success | `8a0a2425c87d7b864b6d6089500bae6a12fe9637` | `4047226918` | 33 |
| 0.1.7 | `45052680467` | success | `935b05b457e8756ab8b45593252ab44594def0e1` | `4047274153` | 33 |
| 0.1.8 | `45055683813` | success | `30408a56f8e3d3054e7ace7feafa0fbde8e676b6` | `4047584418` | 33 |
| 0.1.9 | `45059529254` | success | `71feabc22885e097974a35668e4717837fefd226` | `4047793870` | 33 |
| 0.1.10 | `45062588313` | success | `cff93a6b81b34057d733797834b4549afbd92816` | `4047938866` | 33 |

### E-PUB-LOG 每次发布 CI 日志里的检查报告行（原文照抄）

这些行由工作流在**发布前**跑出来，所以它们证明"发出去的那个 tarball 对应的是通过检查的那棵树"，而不是本地某次运行。

0.1.5（run `45046178925`，当时 31 项静态 / 82 项浏览器）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.5 | client.js 761974 bytes | sources sha256:5f89ee58c00607c98d5356575e6be451 | all 31 checks passed
run-harness: all 82 checks passed (/usr/bin/google-chrome)
```

0.1.6（run `45050133828`，32 / 92）：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.6 | client.js 762625 bytes | sources sha256:737f61ee187d1956e13917922a931cf0 | all 32 checks passed
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

0.1.10（run `45062588313`，36 / 119）——与本次单机运行的两条报告行逐字相同，只有 `run-harness` 行末尾的浏览器路径不同：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.10 | client.js 767298 bytes | sources sha256:336ea7199fb90a0c8202c03e0c14bbe7 | all 36 checks passed
run-harness: @jiezhengj/dsh-dyslexia@0.1.10 | client.js 767298 bytes | all 119 checks passed (/usr/bin/google-chrome)
npm notice 📦  @jiezhengj/dsh-dyslexia@0.1.10
npm notice shasum: cff93a6b81b34057d733797834b4549afbd92816
npm notice total files: 33
npm notice publish Provenance statement published to transparency log: https://search.sigstore.dev/?logIndex=4047938866
```

## E-CI 发布前检查抓到一个真实缺陷（0.1.5 第一次运行）

`45046044274` 在 "Refuse to publish if the committed chunk is stale" 这一步失败：

```text
-/*! @jiezhengj/dsh-dyslexia 0.1.5 | ... | sources sha256:9876db88174469acc5a4266c272e5b34 */
+/*! @jiezhengj/dsh-dyslexia 0.1.5 | ... | sources sha256:5f89ee58c00607c98d5356575e6be451 */
```

原因：Windows 工作区的源码是 CRLF，CI 检出是 LF（`.gitattributes` 的 `* text=auto eol=lf`），指纹按原始字节计算，于是同一份源码在两处算出两个指纹。修法已进仓库：`scripts/build-client.mjs` 的 `readSource()` 与 `verify/check-bundle.mjs` 的 `sourceFingerprint()` 都先把源码统一成 LF，再内联与哈希。提交 `eeb4a05` 之后 CI 与本机指纹一致（`5f89ee58…`）。这条失败因此保留在这里：它证明"拒绝发陈旧产物"这道闸门真的会开火，而不是摆设。

## E-INS 从 registry 安装

`plugin_manager remove_bundle @jiezhengj/dsh-dyslexia`（卸 0.1.9，pnpm 输出 `- @jiezhengj/dsh-dyslexia 0.1.9`）→ `install_bundle` 目标 `@jiezhengj/dsh-dyslexia@0.1.10`，结果 `application: "applied"`、`version: "0.1.10"`，pnpm 输出：

```text
dependencies:
+ @jiezhengj/dsh-dyslexia 0.1.10

Done in 2.9s using pnpm v11.28.5
```

第一次尝试失败过一次，原因是镜像落后（`ERR_PNPM_NO_MATCHING_VERSION … while fetching it from https://registry.npmmirror.com/`，当时 npmjs 的版本文件已 200 但 tarball 仍 404）；等 npmjs 的 tarball 复制完成后再按包名安装即成功。这个滞后每次发版都会出现（约 2–10 分钟），不是包的问题。

安装后实测（`C:\Users\jiezhengj\.dsh\profiles\desktop`）：

| 检查 | 实测 |
|---|---|
| profile 依赖 | `"@jiezhengj/dsh-dyslexia": "0.1.10"`（版本号，不是 `link:`） |
| `node_modules/@jiezhengj/dsh-dyslexia/client.js` | 767,298 字节，SHA256 `3D860D243FFF5012CBD7D29D54737F3064206DEEED20F45752692093B060D0E9` |
| 仓库里的 `client.js` | 767,298 字节，SHA256 同上（逐字节相同） |
| `locale/` | 8 个 json |
| `docs/` | 9 个文件（8 篇 `DETAIL*.md` + `preview.svg`） |
| 包内 `version` | `0.1.10` |

## E-LIVE 真机（DSH 桌面窗口内）

**以下记录来自 0.1.2**，当前版本（0.1.10）的重启核对是 T079（**尚未取证**，见 G13）。之所以保留，是因为它们证明了链路本身可用；从 0.1.2 到 0.1.8 渲染层改过多次（`role` 结构、`aria-roledescription` 的移除与重排版后重标、可见的复制反馈、空/非法 `children` 的处理），所以这些观察**不能**自动转移到 `0.1.8`。

| 观察 | 当时的证据 | 归属 |
|---|---|---|
| 插件列表里出现 `DSH 图示阅读`，说明页是中文描述 + `preview.svg` 渲染出的插图 | 侧栏「插件」→「已安装插件」→「查看 DSH 图示阅读」，`agent-desktop find --role image` 命中 alt = "一条会话消息里的 mermaid 代码块被就地画成图，图下方是查看源码与复制源码两个按钮" | US1 的可见性（FR-008），不含 SC-001 计时 |
| 会话里的 ```mermaid 代码块就地变成图，图下有"查看源码/复制源码" | 回复里贴真代码块后 `agent-desktop find --role image` 命中 `name="图：flowchart"`、`find --role button` 命中 `复制源码` | FR-003、FR-007 |
| 卸载插件后，同一条消息变回纯文本代码块，无报错无占位 | `remove_bundle` 后 `flowchart LR … A[代码块] --> B[就地成图]` 原样显示，`role="img"`（`agent-desktop` 报告为 image）与按钮计数为 0 | US2/FR-009（不含 SC-002 的会话检索命中） |
| 重新安装后图与按钮立刻回来，历史消息不用改 | `install_bundle` 后同一屏立刻渲染 | FR-010 |

## E-GAPS 没有取证的部分（共 14 项）

真机、设备与离线条件（都要求动手换条件，不能在 CI 里做）：

- **G1 宿主升级演练（T042）**：需要在真实 DSH 升级时验证"升级后仍能打开、插件不连累启动"。目前只有源码级论证（`unpatch` 语义、无 `engines` 门、`ctx.effect` 清理、层与包同生命周期）与 0.1.8 的 CI/夹具证据，没有一次真实升级。
- **G2 实体手机/平板触控（T023 的硬件部分）**：窄屏证据来自 headless Chrome 的 360 px 夹具（`the picture takes the column width`、`a wide picture does not widen the column`、`the page itself never overflows`），不是真实设备触控。
- **G3 断网裸机安装（T025）**：`client.js never reaches the network` 只证明产物没有网络调用；"一台没有任何缓存/CDN 的机器上离线装得上"没有验证。
- **G4 畸形宿主的真机注入（T041）**：宿主机侧 7 次 `apply`（5 种静默 ctx + 2 次异常调用）与客户端 7 种畸形 `ctx`（`undefined`、`null`、`{}`、`{slots:null}`、`{slots:{}}`、`inject`/`register` 为空函数、`inject` 抛错）只在夹具与 `check-bundle` 的 vm 里复现，没有在一次真实宿主里注入过。
- **G5 quickstart 的 E1–E16 逐条复跑（T031）**：证据表本身不是证据。其中 E2（同一条消息两块 `mermaid` 并存）、E16（非 `mermaid` 的代码块不受影响）**既没有夹具、也没有真机观察**——108 项夹具里没有这两类用例。E10（**卸载后旧会话回退为代码块**）有 0.1.2 的真机观察；E15 按 `quickstart.md` 的定义是"**未装插件的新会话不产生只有插件才看得懂的内容**"，它既没有夹具也没有真机观察（0.1.2 的观察里没有这一条）。

指标类（定义写得出来，但没有一条被真正测量）：

- **G6 SC-001（1 秒内出图）**：没有任何计时断言。
- **G7 SC-002（卸载后可被 `session_search` 命中）**：没有跑过检索（T019）。
- **G8 SC-003（图内文字不小于正文最小字号）**：`figureSize` 保证字号下限，但没有断言把"正文最小字号"作为比较基准。
- **G9 SC-004（断网渲染，外部请求数为 0）**：只有"产物不含 `fetch`/`XMLHttpRequest`/外部 URL"的静态断言与 `file://` 夹具，没有断网下真的渲染一次并数请求。
- **G10 SC-005（主题切换无需刷新）**：夹具只换了一个 CSS 变量并验证 `fill` 变化，不等于真实明→暗→明切换。

行为类：

- **G11 FR-011 的后半（停用插件后提示词段消失）**：只有 `apply` 注册段的静态证据与宿主半边契约，没有"停用后模型侧看不到"的实测（T027）。
- **G12 FR-002 的真机面（不打开侧栏、不生成文件、不新增会话条目）**：插件在结构上不写文件、不碰宿主布局（静态可读），但没有一次真机上"看完这张图，磁盘与会话条目都没变"的核对。
- **G14 真实窗口缩放时的引擎重绘（FR-018 的端到端面）**：0.1.10 把重排版交给引擎自己的 `ResizeObserver`（pele 内部），插件只负责"节点被换回来就重新命名"。夹具能证明"节点被换 → 立刻重新命名"，但**无法让引擎在无头浏览器里真的因窗口缩放而重绘**（无头环境第一帧之后不再派发帧与 ResizeObserver 通知）。真实窗口里"拖窄窗口 → 引擎重绘 → 名字回来"这条链只有机制级证据。
- **G13 当前版本的重启后真机核对（T079）**：`E-LIVE` 的观察取自 **0.1.2**——插件页的 8 语言说明、图名的语言、两个按钮的文案、复制播报、卸载回退与重装恢复都是那时看的；0.1.3–0.1.9 改过 `view.js`、`i18n.js`、`entry.js`、`styles.js`，这些观察不能自动转移（见 `E-LIVE` 自己的版本注记）。0.1.9 已发布并装进 `desktop` profile，但**没有在重启后的宿主里逐项复核过**，所以算未取证。

---

**本文件与 tasks.md 的关系**：`tasks.md` 末尾的状态表逐行对应上面 14 项，两处若不一致，以本文件为准（本文件是证据的归属地，`tasks.md` 是工作项的记录）。

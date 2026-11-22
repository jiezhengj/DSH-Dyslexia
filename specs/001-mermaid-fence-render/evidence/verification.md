# 验证证据

本文件只记录**已经真实跑过**的命令输出。每一段输出来自**同一次运行**，并且这次运行的报告行自带 `包名@版本 | client.js 字节数 | sources sha256:<指纹>`，所以任何一段都可以被追溯到具体的一棵树。当前版本：`0.1.5`。

复跑方式（任何人 clone 后都一样）：

```bash
node scripts/build-client.mjs       # 由 src/client/*.js + vendor/pele 生成 client.js
node verify/check-bundle.mjs        # 31 项静态与行为断言，纯 Node 内置模块
node verify/run-harness.mjs --list  # 82 项浏览器断言，需要本机 Chrome
```

## E-BLD 构建

```
build-client: @jiezhengj/dsh-dyslexia -> client.js (761974 bytes, 760962 characters, engine 1.13.0, sources 5, syntax ok)
```

产物 `client.js` 的 SHA256 = `2D14A5B757F85290C8B9D9EE6078EEB70B059425045580EDD8729FC7A7FB0F34`，仓库里的文件与 `desktop` profile 中安装的那份逐字节相同（见 E-INS）。

## E-CHK 静态与行为校验

命令：`node verify/check-bundle.mjs`，完整输出（stdout，逐行照抄）：

```text
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.1.5
ok   package.json points at the repository npm trusts — git+https://github.com/jiezhengj/DSH-Dyslexia.git
ok   package.json declares the bundle patch and the client half — platform web, no package inject
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 9 patterns
ok   every published file exists — 24 files
ok   every interface language has its own plugin page — 8 languages
ok   cordis.patch.yml inserts the plugin by package name — 3 lines
ok   both locales carry metadata — en, zh
ok   client.js is one loader chunk keyed by the package name — 761974 bytes
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
ok   client.js matches the sources it claims — 5f89ee58c00607c98d5356575e6be451
ok   the picture is the image, and the copy answer is announced — label is a noun, role="img" on the svg, copy result announced
ok   a factory that cannot build never throws at the host — module-level throw contained, empty module returned
ok   the host half registers exactly one capability section — ui:dsh-dyslexia, order 9000, 85 words
ok   the host half stays silent when the host changed shape — five silent hosts, one throwing section

check-bundle: @jiezhengj/dsh-dyslexia@0.1.5 | client.js 761974 bytes | sources sha256:5f89ee58c00607c98d5356575e6be451 | all 31 checks passed
```

## E-HARN 浏览器行为校验

命令：`node verify/run-harness.mjs --list`（`--list` 逐行打印每一项），完整输出：

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
[ok] no internal key reaches the eye — leaked: 
[ok] a source past the size limit says why — 这张图无法绘制，已改为显示源码。huge
[ok] a source past the size limit keeps the host block
[ok] the picture appears when the stream ends
[ok] a falsy children is not mistaken for content — 图里的语法有误，已改为显示源码。flowchart TD
  A-->
[ok] a fresh t does not redraw the picture
[ok] the copy answer is announced, not only coloured — 已复制
run-harness: all 82 checks passed (C:/Program Files/Google/Chrome/Application/chrome.exe)
```

夹具是提交进仓库的 `verify/harness/index.html`（+ `verify/harness/vendor/` 下的 React 18.3.1 UMD 副本），自建假 loader / 假 slots / 假 locale，加载仓库里的 `client.js` 本体与 `vendor/pele/pele.global.js`。故障注入覆盖：宿主 `t` 抛错/回显 key/回空白/回 `key:value`/留占位符、`code` 与 `children` 取值器抛错、引擎 `innerHTML` 抛错、无 slots 服务、6 种畸形 ctx、坏语法（有/无宿主 `children`）、falsy `children`、超限源码、流式→完成、`t` 换身份、裁剪板缺失/成功、360 px 栏宽、主题换色。

## E-COMP 兼容性断言与要求逐条对应

| 要求 | 可复跑的断言 |
|---|---|
| FR-013 不声明版本否决字段 | `no dsh version gate can refuse a start` |
| FR-014 启动/运行失败就地降级 | `apply stays silent on a changed host`、`a host that rejects the locale option does not break apply`、`a throwing engine leaves a sentence`、`an engine that fails to load leaves the picture to the host` |
| FR-015 产物自身可编译、加载失败不连累同批 | `client.js compiles on its own`、`a broken host loader cannot make the chunk throw`、`a failing factory still yields a silent module`、`a factory that cannot build never throws at the host` |
| FR-016 宿主数据畸形时交回原代码块 | `a throwing code getter leaves the host block`、`a throwing children getter does not reach the host`、`a falsy children is not mistaken for content` |
| FR-017 每条加固都有可重复证据 | 本节所有断言都在仓库里，`node verify/*.mjs` 可复跑；`npm test` 一次跑完两套 |
| FR-018 无障碍结构与播报 | `the picture is the image, and the copy answer is announced`、`a fresh t does not redraw the picture`、`the copy answer is announced, not only coloured`、`no internal key reaches the eye` |

宿主半边另有两项（复用 `index.js` 本体，而非源码字符串匹配）：`the host half registers exactly one capability section`（`ui:dsh-dyslexia`、order 9000、85 词）与 `the host half stays silent when the host changed shape`（5 种畸形宿主 + `section` 抛错 + `section` 返回 rejected Promise）。

## E-PKG 打包内容

`npm pack --dry-run` 报告的 `total files: 33`：`client.js`、`cordis.patch.yml`、`icon.svg`、`index.js`、`LICENSE`、`THIRD-PARTY-NOTICES.md`、`package.json`、8 份 `README*.md`、8 个 `locale/*.json`、8 篇 `docs/DETAIL*.md`、`docs/preview.svg`。构建源码、夹具、`specs/`、`.specify/`、`.tmp/` 都不在包内。

## E-PUB 发布（tag 触发，不在网页上点确认）

| 版本 | workflow run | 结果 | tarball shasum |
|---|---|---|---|
| 0.1.1 | `45031254012` | success | `6f730efa33a453c8f8b2ed08155e2dc85325d5be` |
| 0.1.2 | `45036311606` | success | `c27a63156485cb908ede76fce6f4759a8b4eb37b` |
| 0.1.3 | `45043233136` | success | `101688f9e27af38436bc12a8898a1a3f56bf361b` |
| 0.1.4 | `45044972866` | success | `a14b910f0e76647f289211fdedef6f15f19c1b4f` |
| 0.1.5 第一次 | `45046044274` | **failure**（见 E-CI） | — |
| 0.1.5 | `45046178925` | success，provenance logIndex `4046928419` | `e2a4b81bc0d6b45916cf5739a566e89469274cfd` |

0.1.5 的 CI 日志里两套检查与本机完全一致：

```text
check-bundle: @jiezhengj/dsh-dyslexia@0.1.5 | client.js 761974 bytes | sources sha256:5f89ee58c00607c98d5356575e6be451 | all 31 checks passed
run-harness: all 82 checks passed (/usr/bin/google-chrome)
```

## E-CI 发布前检查抓到一个真实缺陷（0.1.5 第一次运行）

`45046044274` 在 "Refuse to publish if the committed chunk is stale" 这一步失败：

```text
-/*! @jiezhengj/dsh-dyslexia 0.1.5 | ... | sources sha256:9876db88174469acc5a4266c272e5b34 */
+/*! @jiezhengj/dsh-dyslexia 0.1.5 | ... | sources sha256:5f89ee58c00607c98d5356575e6be451 */
```

原因：Windows 工作区的源码是 CRLF，CI 检出是 LF（`.gitattributes` 的 `* text=auto eol=lf`），指纹按原始字节计算，于是同一份源码在两处算出两个指纹。修法已进仓库：`scripts/build-client.mjs` 的 `readSource()` 与 `verify/check-bundle.mjs` 的 `sourceFingerprint()` 都先把源码统一成 LF，再内联与哈希。提交 `eeb4a05` 之后 CI 与本机指纹一致（`5f89ee58…`）。这条失败因此保留在这里：它证明"拒绝发陈旧产物"这道闸门真的会开火，而不是摆设。

## E-INS 从 registry 安装

`plugin_manager remove_bundle` → `install_bundle` 目标 `@jiezhengj/dsh-dyslexia@0.1.5`，结果 `application: "applied"`，pnpm 输出：

```text
dependencies:
+ @jiezhengj/dsh-dyslexia 0.1.5

Done in 2.8s using pnpm v11.28.5
```

安装后实测：

- `C:\Users\jiezhengj\.dsh\profiles\desktop\package.json` 的依赖为 `"@jiezhengj/dsh-dyslexia": "0.1.5"`（不是 `link:`），`dsh.profile.bundles` 末尾含该包名。
- `node_modules/@jiezhengj/dsh-dyslexia/client.js` = **761974 字节**，SHA256 前缀 `2D14A5B757F85290`，与仓库根 `client.js` 一致。
- `locale/` 8 个 json、`docs/` 9 个文件（8 篇 DETAIL + `preview.svg`）、`package.json` 的 `version` 为 `0.1.5`。
- npm 镜像（`registry.npmmirror.com`）比 npmjs 慢：0.1.5 发布后约 12 分钟镜像仍报 `No matching version found`，等镜像追上后按包名安装成功。

## E-LIVE 真机（DSH 桌面窗口内）

**以下记录来自 0.1.2**，0.1.5 的重启核对是 T079（**尚未取证**）。之所以保留，是因为它们证明了链路本身可用；0.1.5 改了渲染层（`role` 结构、播报区域、空 `children` 处理），所以这些观察**不能**自动转移到 0.1.5。

| 观察 | 当时的证据 | 归属 |
|---|---|---|
| 插件列表里出现 `DSH 图示阅读`，说明页是中文描述 + `preview.svg` 渲染出的插图 | 侧栏「插件」→「已安装插件」→「查看 DSH 图示阅读」，`agent-desktop find --role image` 命中 alt = "一条会话消息里的 mermaid 代码块被就地画成图，图下方是查看源码与复制源码两个按钮" | US1 的可见性（FR-008/FR-012），不含 SC-001 计时 |
| 会话里的 ```mermaid 代码块就地变成图，图下有"查看源码/复制源码" | 回复里贴真代码块后 `agent-desktop find --role image` 命中 `name="图：flowchart"`、`find --role button` 命中 `复制源码` | FR-003、FR-007 |
| 卸载插件后，同一条消息变回纯文本代码块，无报错无占位 | `remove_bundle` 后 `flowchart LR … A[代码块] --> B[就地成图]` 原样显示，`role="image"` 与按钮计数为 0 | US2/FR-009（不含 SC-002 的会话检索命中） |
| 重新安装后图与按钮立刻回来，历史消息不用改 | `install_bundle` 后同一屏立刻渲染 | FR-010 |

## E-GAPS 没有取证的部分

- **宿主升级演练（T041/T042）**：需要在真实 DSH 升级时验证"升级后仍能打开、插件不连累启动"。目前只有源码级论证（`unpatch` 语义、无 `engines` 门、`ctx.effect` 清理、层与包同生命周期）与 0.1.5 的 CI/夹具证据，没有一次真实升级。
- **实体手机/平板（T019/T023 的硬件部分）**：窄屏证据来自 headless Chrome 的 360 px 夹具（`the picture takes the column width`、`a wide picture does not widen the column`、`the page itself never overflows`），不是真实设备触控。
- **断网裸机安装（T025）**：`client.js never reaches the network` 只证明产物没有网络调用；"一台没有任何缓存/CDN 的机器上离线装得上"没有验证。
- **SC-001（1 秒内出图）**：没有任何计时断言。
- **SC-002（卸载后可被 `session_search` 命中）**：没有跑过检索。
- **SC-003（图内文字不小于正文最小字号）**：`figureSize` 保证字号下限，但没有断言把"正文最小字号"作为比较基准。
- **SC-005（主题切换无需刷新）**：夹具只换了一个 CSS 变量并验证 `fill` 变化，不等于真实深浅主题切换。
- **FR-011 的后半**（停用插件后提示词段消失）：只有 `apply` 注册段的静态证据与宿主半边契约，没有"停用后模型侧看不到"的实测。

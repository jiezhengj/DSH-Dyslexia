# 验证证据

记录时间：2026-11-22 至 2026-11-23（Asia/Hong_Kong）。环境：DeepSeek Harness Desktop 0.2.2-rc.5，profile `desktop`，Windows；构建与校验用 DSH 自带 Node v24.21.0；浏览器检查用本机 Chrome。

本文只写实际跑过的命令与结果。没有跑过的事情写在第 E-GAPS 节，不写成"已验证"。

## E-BLD 构建

```text
build-client: @jiezhengj/dsh-dyslexia -> client.js (760611 bytes, 759581 characters, engine 1.13.0, sources 5, syntax ok)
```

`client.js` 是唯一产物：引擎 Pele 1.13.0 原样内联（MIT，见 `THIRD-PARTY-NOTICES.md`），源码片段顺序为 `styles → i18n → figure → view → entry`。banner 里带 `sources sha256:<32 hex>`，是 `name + version + 五个片段` 的摘要，用来证明产物与源码对应。

## E-CHK 静态与行为校验（`node verify/check-bundle.mjs`）

**30 项全通过**。可复现：任何一台有 Node 22+ 的机器上跑这条命令即可。

覆盖的关键项（节选）：

```text
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.1.3
ok   package.json points at the repository npm trusts — git+https://github.com/jiezhengj/DSH-Dyslexia.git
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 9 patterns
ok   every published file exists — 24 files
ok   every interface language has its own plugin page — 8 languages
ok   client.js is one loader chunk keyed by the package name — 760611 bytes
ok   client.js requires react and nothing else — react
ok   client.js never reaches the network — no fetch, no XHR, no dynamic import, no remote URL
ok   client.js carries the vendored engine — Pele 1.13.0 inlined
ok   client.js compiles on its own — no syntax error for a host batch to inherit
ok   a broken host loader cannot make the chunk throw — throwing loader, missing loader, missing window
ok   a failing factory still yields a silent module — no react, no ctx, no slots, empty services
ok   an engine that fails to load leaves the picture to the host — boundary + guarded props + engine sentence
ok   the layer is keyed to mermaid on the fence slot — conversation.chat.markdown.fence + mermaid
ok   host apply survives a host that changed shape — six hostile hosts, no throw, no section
ok   the prompt section states the capability once — 85 words, order 9000, name ui:dsh-dyslexia
ok   every supported sample type draws an svg — flowchart:218x64 sequence:184x167 class:80x192 state:87x206 er:144x201 mindmap:172x71 timeline:408x133
ok   a broken diagram reports a one-line reason — Parse error on line 2:
ok   host key echo falls back to bundled strings — key echo, blanks, placeholders rejected
ok   every language carries the same complete sentences — 13 keys x 8 languages, no engine text in labels
ok   client.js matches the sources it claims — f1a005057a9181561a78dda65e32f74a
ok   a factory that cannot build never throws at the host — module-level throw contained, empty module returned
ok   the host half registers exactly one capability section — ui:dsh-dyslexia, order 9000, 85 words
ok   the host half stays silent when the host changed shape — five silent hosts, one throwing section
```

## E-HARN 浏览器行为校验（`node verify/run-harness.mjs`）

**76 项全通过**，跑在真实 Chromium（`--headless=new`）里，页面是提交进仓库的 `verify/harness/index.html`，React 18.3.1 UMD 副本在同一目录的 `vendor/`。夹具自建假 loader、假 slots、假 locale，加载的是仓库里的 `client.js` 本体。

覆盖范围（每一类都有对应的 `[ok]` 行写进 `<pre id="log">`）：

- 模块形状：loader 调用一次、`apply`/`inject` 存在、`inject` 只有 `slots`。
- 槽注册：`conversation.chat.markdown.fence` + `key: 'mermaid'` + `order: 100` + `locale: 'dyslexia'`。
- 八种界面语言逐个驱动：中文、英文给出精确字符串断言；其余六种断言"与英文不同且没有裸 key"。
- 五类敌意宿主 `t`：回显 key、抛错、只回空白、回 `key:value`、留未替换占位符 —— 都回落成自带文案。
- 绘制：真实 SVG 出图、`role="img"`、`aria-label` 带图类型、两个按钮。
- 死路：坏语法（有/无宿主代码块两种）、引擎抛错、`code`/`children` getter 抛错、非字符串 code —— 都保留代码块并给一整句本语言原因。
- 复制：剪贴板缺失时显示"复制失败"，真实写入时显示"已复制"且只写一次。
- 窄屏：360 px 栏宽下图宽贴合栏宽、页面无横向溢出。
- 主题：改宿主颜色变量后图内文字颜色跟着变，不需要重新加载或重绘。
- 宿主变化：首次带 locale 注册被拒后自动退化为不带 locale 再注册一次；六种畸形 `ctx` 下 `apply` 均静默。
- 内部 key 不外泄：所有检查渲染结果里搜不到 `copySource`、`figureLabel`、`renderFailed` 等内部标识。

## E-COMP 兼容性（"插件不会把 DSH 搞成打不开"）

调查与加固的推理写在 `research.md` 的 D15–D19；可复现的断言在 E-CHK 与 E-HARN 里：

- 包里没有 `engines.dsh`、没有 dsh peer 依赖 —— 宿主升级后不存在"版本门直接抛错"这条路径。
- `client.js` 是自闭合 IIFE：加载器抛错、加载器不存在、`window` 不存在，都不向外抛；factory 抛错时返回空模块（`apply` 为空、`inject` 为空），同批其他插件不受牵连。
- 渲染期异常由 `FigureBoundary` 接管，读宿主 props 一律经过 `readLayerInput`/`safeRead`，getter 抛错不会逃出边界；拿不到宿主 `children` 时自己画代码块。
- 宿主服务缺失或签名变化：`apply` 静默返回；`locale` 不可用时退化为不带 locale 注册；`systemPrompt` 不存在或 `section()` 抛错/Promise 拒绝时都不影响启动，也不加段。
- 绘制引擎不可用（编辑器里被裁掉、加载失败）时显示"引擎不可用"整句并保留代码块。

## E-PKG 打包内容

`npm pack --dry-run`（0.1.3）：33 个文件 —— `index.js`、`client.js`、`cordis.patch.yml`、`icon.svg`、`locale/` 8 个 json、`docs/` 8 篇 `DETAIL*.md` + `preview.svg`、`README*.md` 9 份、`LICENSE`、`THIRD-PARTY-NOTICES.md`、`package.json`。不含 `src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.specify/`、`.tmp/`。

## E-PUB 发布（tag 触发，不在网页上点确认）

- 0.1.1：GitHub Actions run `45031254012` 成功，日志含 `+ @jiezhengj/dsh-dyslexia@0.1.1`，provenance 写入 sigstore transparency log（logIndex 4045962187）。此前 run `45031124935` 失败于 `E422 … "repository.url" is ""`，补 `repository`/`homepage`/`bugs` 后通过。
- 0.1.2：run `45036311606` 成功，provenance logIndex 4046319715，registry `dist-tags.latest = 0.1.2`，tarball shasum `c27a63156485cb908ede76fce6f4759a8b4eb37b`。
- registry 版本文件有 CDN 滞后（约 2 分钟后才 200），不是发布失败。

## E-INS 从 registry 安装

`plugin_manager remove_bundle` → `install_bundle` target `@jiezhengj/dsh-dyslexia@<version>`，返回 `application: "applied"`。profile `desktop` 的 `package.json` 依赖从 `link:` 变为具体版本号，`dsh.profile.bundles` 末尾含该包名；`node_modules/@jiezhengj/dsh-dyslexia/` 里的 `version`、`locale/`、`docs/`、`icon.svg` 与发布包一致。

## E-LIVE 真机（DSH 桌面窗口内）

工具：`agent-desktop`（读无障碍树）。

- 插件页：侧栏「插件」→「已安装插件」→「查看 DSH 图示阅读」，详情页显示中文标题与描述、说明图渲染成功（`docs/DETAIL.zh.md` → `preview.svg`），来源信息 `@jiezhengj/dsh-dyslexia@0.1.2`，状态「运行中」。对应 FR-008/SC-009。
- 会话内成图：一条真 ```mermaid 代码块渲染成图，无障碍树里出现 `role: image`、`name: "图：flowchart"`；`role: button` 有「查看源码」「复制源码」两个。对应 US1/SC-001/FR-003。
- 卸载回退：`remove_bundle` 后同一条消息变回代码块原文（`flowchart LR … A[代码块] --> B[就地成图] …`），`role: image` 与「复制源码」按钮消失。对应 US2/SC-002。
- 重装恢复：再 `install_bundle` 同一版本后，图与按钮立刻回来，纯文本消失，历史消息无需修改。对应 FR-010/SC-002。

## E-GAPS 没有取证的部分

- **宿主跨小版本/大版本升级演练（T041/T042）**：没有真的把 DSH 升一个版本再打开会话。要求"升级后仍能启动、未渲染的内容仍是代码块"目前只有静态与夹具证据（E-COMP），没有升级后的真机证据。
- **实体手机/平板**：只验证了 360 px 视口下不横向溢出、图宽贴合栏宽；没有在真机触摸屏上试缩放按钮。
- **断网裸机安装（E12/E13）**：没有在没有任何构建工具链的机器上断网安装一遍；"运行期零网络"由静态断言（无 fetch/XHR/动态 import/远程 URL）与 `file://` 夹具支撑，不是断网实测。
- **`dsh --profile desktop --dump-config`（T027）**：本机是 Desktop 发行版，PATH 上没有 `dsh` CLI；能力播报改用 `node verify/check-bundle.mjs` 的两项宿主机断言（注册一段、畸形宿主静默）取证。

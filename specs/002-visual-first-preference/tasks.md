# Tasks: 视觉优先开关与「我有阅读障碍」命名

**Feature**: `002-visual-first-preference` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

图例：`[P]` 可并行；每条任务以"证据"结尾——没有证据的任务不算完成。

## Phase 1：宿主侧配置与两档提示词

- [x] **T001** 在 `package.json` 增加依赖 `"@deepseek-ai/schemastery": "^3.19.0"`，并确认 `npm install` 后 `node_modules` 可解析（不引入构建脚本）。
- [x] **T002** `index.js` 新增 `Config`（`z.object({ visualFirst: z.boolean().default(true).volatile() })`）与 `apply(ctx, config)`；`@deepseek-ai/schemastery` 在模块顶部静态 import——该包无法解析时插件在 import 阶段就失败，没有降级（见 `evidence.md` G8）。
- [x] **T003** 把 `MERMAID_RENDER_PROMPT` 拆成 `CAPABILITY_TEXT` + `PREFERENCE_TEXT`，段 `text` 改为函数：`visualFirst` 为真时两段拼接，否则只出能力段（逐字等于 001）。
- [x] **T004** 在宿主没有 `settings` 服务时不调用 `configure`；有则 `ctx.inject(['settings'], child => child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)))`，避免宿主生成多余设置页。
- [x] **T005** `verify/check-bundle.mjs` 新增静态断言：`Config` 含 `visualFirst`、`.default(true)`、`.volatile()`；偏好段字符串存在且只在真分支出现；两张禁止措辞表分别不出现（能力段：`always`/`must use`/`you should`/`every answer`/`prefer`；偏好段：`every answer`/`always draw`/`always answer`/`must draw`/`must use a diagram`）；段名/order 未变。静态检查现为 **45** 条，其中第 22 条是 `the section hands the host a function, not a frozen string`（#44 是 `both size limits reach the engine, each proven on its own`，第 45 条是 `the fixtures assert what the fixes promise, and can fail`）。
  - 证据：`check-bundle` 通过行 + 对应断言名。

## Phase 2：客户端设置行

- [x] **T006** 新增 `src/client/settings.js`：`createVisualFirstRow(face)` 返回 `{ store, component, inject }`；`VisualFirstRow` 组件（标题 + 说明 + 开关）从 `inject.hooks.visualFirst` 读值，`inject.setValue` 仅在 face 有 `set` 时存在；点击无写入面、写入被拒、reject 或 thenable 的 `then` 抛错时，用 `inject.readHostValue()` → `readPreference(face)` 恢复**宿主当前值**：`readHostValue` 只要有 face 就会挂上（`src/client/settings.js:182-184`），而设置行只在有 face 时注册（`src/client/entry.js:133-134`），所以已挂载行总会重读宿主，点击前的捕获值只在 `readHostValue` 缺席（没有已挂载行）时兜底，因为宿主在 resolve `false` 前会先把自己的镜像改为真实值并通知订阅者（见 `src/client/settings.js:72-83`）。`readPreference(face)`（`:41-51`）对缺 `getSnapshot`、抛出或快照缺字段的 face 返回默认 `true`，从不表示读不到；退化 face 上行因此回到 `true` 而非捕获值，可能在没有保存写入时显示为打开（`evidence.md` G12）——并给 `role="status"` 失败提示；宿主尚未回答期间行显示读者请求的值。没有禁用态，也没有 2 秒清空。实现见 T023。
- [x] **T007** `src/client/entry.js`：宿主同时提供 `slots.inject`/`slots.register`，且 `configForms.get('dsh-dyslexia')` 返回 face 时，注册 `settings.general.item`（`id: '@jiezhengj/dsh-dyslexia/visual-first'`、`order: 62`、`locale: 'dyslexia'`），并 `ctx.effect` 订阅与注销；否则整行不注册（没有"不可用"占位），图照常。
- [x] **T008** `src/client/i18n.js` 增 4 条设置文案 × 8 语言（`settingLabel`/`settingHint`/`settingSaved`/`settingFailed`），沿用 `hostKey` 命名空间发问。
- [x] **T009** `src/client/styles.js` 增设置行样式（flex 行、标题/说明层级、开关轨道与圆点、焦点环），全部取宿主 token，无固定宽度。
- [x] **T010** `verify/harness/index.html` 增设置行夹具：假 `configForms`（可读/可写/外部改值/写失败/缺服务）、`role="switch"` 与 `aria-checked`、点击一次只写一次、失败提示；8 种语言的标签与说明逐条断言（`SETTING_LABELS` 在 `verify/harness/index.html:1694-1703`，标签比对在 `:1728-1732`；`SETTING_HINTS` 在 `:1704-1713`，逐语言的说明断言在 `:1733-1737`；zh 行另有断言），360px 与 200% 字体未断言（见 `evidence.md` G3）。
  - 证据：`run-harness` 通过行 + 新增断言名清单。

## Phase 3：改名与文案

- [x] **T011** `locale/*.json` 8 份的 `meta.title`/`meta.description` 换成 `research.md` D6 的译名。
- [x] **T012** `docs/DETAIL*.md` 8 篇保持"唯一图片行"（静态检查禁止正文），新名字只进该图 alt 句；开关说明放 README，不放 DETAIL。
- [x] **T013** 9 份 README：标题、首段、特性列表里的"只渲染"改成"渲染 + 可选视觉优先"，开关作为现有特性列表里的一条/一段（`README.<lang>.md:15`，`README.md:13-14`），不另立小节；8 份本地化 README 删掉"插件只声明会画图"的旧说法，各补一段说明插件会在图更省力时主动要图、设置 → 通用设置有开关。
- [x] **T014** `package.json` 的 `description` 改成 `research.md` D6 的英文句子（逐字）：`Draws mermaid blocks right in the conversation and, when it helps, asks for a picture instead of a wall of text.`

## Phase 4：探针与证据

- [x] **T015** 探针（当时十二条，quickstart 现在列十四条：F14/F15 是 0.2.6/0.2.7 追加的）：F1 两档提示词、F3 默认 true、F4 dispose 路径、F5 写失败回退、F6 只写一次、F7 `aria-checked` 绑定、F8 命名空间、F9 无 setter 宿主——逐条破坏 → 重建 → 跑两套 → 录下红行 → 还原，把输出行原文记进 `evidence.md`。F1 与 F9 最后一次在 `0.2.3` 工作树上重跑（F9 用 `a host whose face has no setter hands the row no writer at all` 断言）；`0.2.5` 上重跑的是新增的 F10–F13（每条在 `%TEMP%` 的新副本里破坏、跑完还原），`0.2.4` 树本身从未被探针跑过，见 `evidence.md` G10（已由 `0.2.5` 关闭）。F3–F8 是 `0.2.1` 树上的记录。F2（段文本改回冻结字符串）在这个函数断言存在前两套都抓不到，现在由第 22 条静态检查捕获，单列为历史说明。
- [ ] **T016** `specs/002-visual-first-preference/evidence.md`：E-BLD · 0.2.1、E-CHK 与 E-HARN 是 `0.2.1` 树那次运行的输出原样照抄（`0.2.5` 的构建行单列为 `E-BLD · 0.2.5`；`0.2.5` 的检查只有 E-CHK/E-HARN 的汇总行，无逐条输出）；E-CHK 是该次运行的完整 stdout（44 条 `ok` 行加末行汇总），故意触发的 `warn` 与堆栈行走 stderr（52 行），不混入 stdout；F10–F13 的探针行已按 `0.2.5` 记录；未取证项单列。E1–E14 端到端逐条记录未做，见 `evidence.md` G6。
- [ ] **T017** `spec.md`/`plan.md`/`data-model.md`/`contracts/*` 与本清单的计数、断言名、版本号与实际一致（交叉核对每个反引号名都存在）；本轮已对齐 `0.2.5` 的版本号、45/274 计数与所引夹具行号；未逐条核对全部反引号名，故未勾。

## Phase 5：发版与评审

- [x] **T018** 版本升到 `0.2.0`（新增依赖与用户可见行为），`npm pack` 核对文件数；feature 001 的 `specs/001-mermaid-fence-render/contracts/plugin-manifest.md` 未改动（它仍是 feature 001 早期留下的 `0.1.32` 清单，已过时），本 feature 的配置契约由自己的 `contracts/plugin-config.md` 与 `contracts/settings-row.md` 承载。本轮修正把版本升到 `0.2.2`，这是代码变更而不只是文档：`settings.js` 里宿主 face 没有 `set` 时不再挂 `setValue`（点击回退并显示失败句）；第 22 条静态检查改写成读一次注册取三次值，静态条数仍是 **44**；浏览器夹具新增无 setter 宿主一条，发布时浏览器条数 **252**。评审并行改动又加了 8 条夹具断言（7 种语言的标签 + 直接断言 inject 面无 `setValue`），`0.2.3` 发布时是 **44 / 260**；`client.js` 随之重建。
- [x] **T019** 打 tag、GitHub Actions 发布、从 registry 装回 `desktop`、核对安装副本哈希与 `locale/`。发布与装回记录见 `evidence.md` E-PUB/E-INS：`0.2.0` 是历史，`0.2.1` 与 `0.2.2` 是中间版本（`0.2.1` run `45204279829`、shasum `b5c03c272b89f53f2416a5140c29b212b5f55b7a`、logIndex `4053240981`；`0.2.2` run `45211420278`、shasum `1f17ac1be4c1ea5c5e97c814cc699a6c910ee03d`、logIndex `4054074805`），**本条完成时点**（`0.2.5`）：当前发布版本是 `0.2.5`（run `45240437544`、shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`、33 files），六个版本都已装回（`0.2.5` 的装回见 `evidence.md` E-INS 0.2.5）；此后 `0.2.6`/`0.2.7` 的发版装回见 T029/T037。
- [ ] **T020** 真机核对：设置行出现、两档切换生效、重启后保持、8 语言标题正确、卸载后行消失。未做（`0.2.5` 同样未观察），见 `evidence.md` G1/G3/G4/G6。
- [ ] **T021** 起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。评审返回 FAIL；本轮按评审清单修正文档后重审；第 5 轮的四个 P2 已在 `0.2.5` 处理，见 `evidence.md` G1–G8 与 G11–G13（G9/G10 已关闭）。
- [x] **T022** 发版 `0.2.4`：读 `set(...)` 解析出的布尔值（`true` 保存，`false` 回退并显示失败句），`configForms` 改由 `ctx.inject` 等待而不是提前读取；静态检查加第 31 条 `a refused settings write is not reported as saved`，夹具加 `a refused write that resolves false puts the switch back and says so` 与 `a host that gains configForms after apply still gets the settings row`，另补 8 种语言的说明断言，条数 **45 / 271**；发布 run `45230719544`、shasum `2a731d8c13067d88859eeec4f918773b1fd9578c`、33 files，装回见 `evidence.md` E-PUB/E-INS 0.2.4；`0.2.5` 见 T023。
- [x] **T023** 升到 `0.2.5` 并发布、装回（commit `0be17fe`、tag `v0.2.5`、run `45240437544` success、shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`、33 files，见 `evidence.md` E-PUB/E-INS 0.2.5）：拒绝写入时改用 `inject.readHostValue` → `readPreference(face)` 恢复宿主当前值（宿主在 resolve `false` 前先通知真实状态，见 `dsh-client-ui-settings/src/client/config-form.ts` 的 `recover()`）；`pending.then(...)` 移进 `try`，新增 `a thenable that throws out of then cannot break the click`；新增 `a refused write keeps the value the host took while it was pending`（两窗口）与 `a value the host pushes reaches the switch without a write`（`aria-checked` + 计算出的开关颜色）；静态检查 `the capability briefing is what it was before the switch` 改为逐句比对 `specs/001-mermaid-fence-render/contracts/host-prompt.md` 里的四句 `MERMAID_RENDER_PROMPT`（G9 关闭）。条数 **45 / 274**，`client.js` 783360 bytes / 781845 characters，sources sha256 `2b5728286c556d8dbaaa349cc9fb8ec5`，文件 SHA-256 `279c33781ef551e3d3bbb0aabf3d37a681fd5da4f4738c29c724b596667a8766`。探针 F10–F13 见 `evidence.md`。

## Phase 6：真机核对掀开的空行缺陷（0.2.6）

- [x] **T024** 在运行中的宿主里核对 `0.2.5`（`dsh web` + 独立 `webcheck` profile，配方见 `evidence.md` E-LIVE）：插件页与「设置 → 通用设置」都能打开，但**我们的行渲染为空**，控制台报 `dsh-dyslexia: locale {cannot get property "locale" without inject}`。三个根因：宿主把 slot 的 `hooks: { name: store }` 展开成钩子 prop `useName(selector)`（宿主自己的 `DeveloperToolsRow` 写作 `const enabled = useDeveloperTools((value) => value)`），我们的组件只读 `props.hooks`；宿主钩子管线要求 store 提供 `getSnapshot()`，我们的 `createValueStore` 没有；宿主 cordis 严格 `inject`，`ctx.locale` 在 `inject: ['slots']` 下直接抛错，而 `ctx.get(name)` 是"不要求 inject 的读取"。
- [x] **T025** `src/client/settings.js` 增加两种适配器：`HostValueRow`（`props.useVisualFirst((current) => current)`）与 `StoreValueRow`（`useSyncExternalStore`），`VisualFirstRow` 按第一个可用的适配器选，两个都没有才返回 `null`；渲染与写入逻辑下沉到 `RowBody`，内部 `shown` 状态用 `show(next)`/`current()` 统一"有 store 写 store、没有 store 写本地"，`restore()` 成功后被拒的写入由宿主真值接管；`createValueStore` 补 `getSnapshot()`。
- [x] **T026** `src/client/entry.js` 新增 `optional(ctx, name)`（`ctx.get(name)` 优先，退回 `ctx[name]`，都拿不到则 `report` 后返回 `undefined`），`locale`/`slots`/`configForms` 全部改走它；设置行改为两条注册路径（`ctx.inject(['configForms'], child => wireOnce(child))` 与直接 `wireOnce(ctx)`），先拿到 face 的一方生效，`wireSettingsRow` 返回布尔。
- [x] **T027** 验证：`verify/check-bundle.mjs` 新增 `the settings row reads the hook the host builds, not an object it never sends` 与 `a service the plugin never declared is read through ctx.get`（`EXPECTED_CHECKS` 45 → 47）；`verify/harness/index.html` 新增 6 条夹具（钩子 prop 宿主、store 缺 `getSnapshot`、`ctx.get` 路径、钩子宿主上的点击回写与回显），`EXPECTED_CHECKS` 274 → 280；探针 F14（删 `useVisualFirst` 分支 → 4 红）、F15 记入 `evidence.md` E-PROBE——**F15 在 0.2.6 记录的红行是错的**（47 项套件不可能出现 `1 failed, 47 passed`，删掉 `getSnapshot()` 后两套检查实际全绿），真实红行由 T031 在 `0.2.7` 重做（`1 failed, 46 passed` 与 `2 failed, 281 passed`）。
- [x] **T028** 真机复核（同一个 `webcheck` 实例，`plugin add @0.2.6` 后重启 `dsh web`）：设置页出现标签、说明与 `switch [checked=true]`，位于"性能与用量"与"上传 Session Log"之间；点击变 `checked=false` 并出现 `role="status"` 的 `已保存`，`cordis.patch.yml` 写入 `visualFirst: false`；再点回 `true`；关开设置值保持；插件页标题「DSH 我有阅读障碍」、`v0.2.6`、图片 alt 为详情页那句中文；控制台无我们自己的告警。记录见 `evidence.md` E-LIVE，G1 关闭（限 Web 界面）。
- [x] **T029** 发版 `0.2.6`：commit `c3520c2`、tag `v0.2.6`、GitHub Actions run `45302814465` success（CI 47 / 280，`sources sha256:b69ddecef48b3acc5a9b51e2a1a27bc1`，shasum `1deccbbf61f9068c22ff418980fb16d960bf5e4b`、33 files、logIndex `4063373865`）→ registry 装回 `desktop` profile（卸 0.2.5、装 0.2.6，安装副本 787325 字节、SHA-256 `63B5517E3074F37D44CB8F63EB84593426F3B451B1FE3951336A125E16D6D786` 与仓库根逐字节相同、`locale/` 8、`docs/` 9）→ E-PUB/E-INS 补 0.2.6 行 → 清理 `webcheck` profile 与本次起的 `dsh web` 进程。
- [ ] **T030** 再次起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。

## Phase 7：让 getSnapshot 的回归能被看见（0.2.7）

- [x] **T031** 独立实现评审 `review-impl-002r` 指出的 P0：`evidence.md` 的 F15 在 `0.2.6` 上写的红行是假的（`1 failed, 47 passed` 在 47 项套件里不可能，且只删 `createValueStore` 的 `getSnapshot()` 时两套检查全绿）。修法不是改数字，而是让破坏真的变红。
- [x] **T032** `verify/check-bundle.mjs` 的 `getSnapshot()` 断言原来是对整个 `settings.js` 的子串匹配，会命中 `readPreference` 里的 `face.getSnapshot()`；改为只检查 `createValueStore` 函数体，并要求 `getSnapshot()` 与 `subscribe(listener)` 同时在该函数体内。返回串改为 `the store itself carries getSnapshot and subscribe`。
- [x] **T033** `verify/harness/index.html` 新增两条夹具（280 → 282）：`the store this module hands the host can be read the way the host reads it`（从注册的 `inject.hooks.visualFirst` 取插件自己的 store，断言 `get/getSnapshot/subscribe` 三类齐全且 `getSnapshot()` 返回初始值）与 `a hook built from that store draws the switch`（用 `useSyncExternalStore(store.subscribe, store.getSnapshot)` 按宿主的方式造一个 `useVisualFirst` prop，断言开关渲染并显示 true）。
- [x] **T034** 修 P2：严格 `inject` 夹具改用 `makeContext({ noLocale: true })` 并给 `ctx.locale` 定义会抛错的 getter，同时断言 `locale.register` 恰好被调用一次（`dyslexia`），使"把 `optional(ctx,'locale')` 换回 `ctx.locale`"在夹具层也变红（282 → 283）。
- [x] **T035** 重跑探针并记录真实红行：删 store 的 `getSnapshot()` → `FAIL the settings row reads the hook the host builds, not an object it never sends — the value store does not carry the getSnapshot/subscribe pair a host hook is built from`、`check-bundle: 1 failed, 46 passed`，以及 `[bad] … get=function getSnapshot=undefined subscribe=function`、`[bad] a hook built from that store draws the switch — no switch`、`run-harness: 2 failed, 281 passed`；`optional(ctx,'locale')` → `ctx.locale` → `FAIL … locale is still read as a bare property` 与 `[bad] a host that refuses undeclared properties still gets the strings registered — []`。
- [x] **T036** 文档：`evidence.md` 的 E-BLD/E-CHK/E-HARN 三块用 `0.2.7` 单次运行重写、头注与版本链改 `0.2.7`、F15 行改为真实红行并注明"`0.2.6` 上记录的那行是错的"、G12 的行号改到当前文件、E-PUB/E-INS 追加 0.2.7；`plan.md`/`quickstart.md`/`spec.md`/`tasks.md` 的计数与版本同步。
- [ ] **T037** 发版 `0.2.7`：commit → tag `v0.2.7` → GitHub Actions → registry 装回 `desktop` profile → E-PUB/E-INS 补 run/shasum/logIndex 与实测哈希。
- [ ] **T038** 再次起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。

## Dependencies

- Phase 2 依赖 T002/T003（段文本两档）先用静态断言钉住契约，再写客户端。
- Phase 3 可与 Phase 2 并行（不同文件）。
- Phase 4/5 依赖 Phase 1–3 全部完成。

## Implementation Strategy

1. 先钉契约（T002/T003/T005），保证"开关到底改变了什么"是可断言的事实。
2. 再做界面（T006–T010），夹具先行：假 `configForms` 的能力边界先写出来，组件照着它写。
3. 改名（T011–T014）风险低，可并行。
4. 探针与证据（T015–T017）必须在发版前完成，否则发版后的核对没有对照。

## Implementation status (2026-11-24)

| area | state |
|---|---|
| Host half: `Config` with `visualFirst` (default on, `.volatile()`), two-tier briefing, `claimSettingsPage` | done, 47 static checks |
| Client half: settings row on `settings.general.item`, `configForms` read/write, revert on refusal | done, 283 browser checks in the published `0.2.7` (`0.2.6` shipped 280) (`0.2.5` shipped 274, `0.2.4` 271, `0.2.3` 260, `0.2.2` 252); the row reads the hook prop the host builds (`useVisualFirst`) and keeps the store path for hosts that send `hooks`; no disabled state, no timer; a refused write restores the host's current value |
| Eight-language rename (locale, DETAIL alt line, 8 READMEs, index, package description) | done; DETAIL keeps exactly one image line (its alt sentence carries the new name) |
| Evidence | `evidence.md` (this feature): `0.2.7` build and 47 / 283, fourteen falsifiability probes (F1, F3–F15), E-LIVE records the row and the switch in a running host; gaps G2–G8 and G11–G14 open, G1 discharged by `0.2.6` (web surface only), G9/G10 by `0.2.5` |
| Not done | SC-005's one-second timing (G14), the desktop window's settings entry (the row was observed through `dsh web`; the desktop build opens settings as a separate document that this window offers no control for — G1 records the limit), the host write path to `settings.update` seen directly (G2 records what was observed instead), 200%/360px layout assertion for the row (G3), pixel comparison (G5), E1–E14 end-to-end rows (G6), SC-001 five sample requests (G7), schemastery import failure path (G8) |

**2026-11-24：** T021 的两项评审曾均 PASS（实现 `review-impl-002f`、文档 `review-docs-002m`），但那是在没有真机观察的前提下——按用户建议用 `dsh web` 起独立 profile 复现后，`0.2.5` 的设置行在真实设置页里渲染为空（T024），`0.2.6` 修好三处并补了 2 条静态检查、6 条夹具与 2 条探针（T025–T027），真机观察写进 `evidence.md` 的 E-LIVE（T028），G1 关闭（限 Web 界面）。发版与再评审见 T029/T030。

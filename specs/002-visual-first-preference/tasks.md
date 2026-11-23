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

- [x] **T006** 新增 `src/client/settings.js`：`createVisualFirstRow(face)` 返回 `{ store, component, inject }`；`VisualFirstRow` 组件（标题 + 说明 + 开关）从 `inject.hooks.visualFirst` 读值，`inject.setValue` 仅在 face 有 `set` 时存在；点击无写入面、写入被拒、reject 或 thenable 的 `then` 抛错时，用 `inject.readHostValue()` → `readPreference(face)` 恢复**宿主当前值**——点击前的值只作读不到快照时的兜底下限，因为宿主在 resolve `false` 前会先把自己的镜像改为真实值并通知订阅者（见 `src/client/settings.js:72-83`）——并给 `role="status"` 失败提示；宿主尚未回答期间行显示读者请求的值。没有禁用态，也没有 2 秒清空。实现见 T023。
- [x] **T007** `src/client/entry.js`：宿主同时提供 `slots.inject`/`slots.register`，且 `configForms.get('dsh-dyslexia')` 返回 face 时，注册 `settings.general.item`（`id: '@jiezhengj/dsh-dyslexia/visual-first'`、`order: 62`、`locale: 'dyslexia'`），并 `ctx.effect` 订阅与注销；否则整行不注册（没有"不可用"占位），图照常。
- [x] **T008** `src/client/i18n.js` 增 4 条设置文案 × 8 语言（`settingLabel`/`settingHint`/`settingSaved`/`settingFailed`），沿用 `hostKey` 命名空间发问。
- [x] **T009** `src/client/styles.js` 增设置行样式（flex 行、标题/说明层级、开关轨道与圆点、焦点环），全部取宿主 token，无固定宽度。
- [x] **T010** `verify/harness/index.html` 增设置行夹具：假 `configForms`（可读/可写/外部改值/写失败/缺服务）、`role="switch"` 与 `aria-checked`、点击一次只写一次、失败提示；8 种语言的标签与说明逐条断言（`SETTING_LABELS` 在 `verify/harness/index.html:1694-1703`，标签比对在 `:1728-1732`；`SETTING_HINTS` 在 `:1704-1713`，逐语言的说明断言在 `:1733-1737`；zh 行另有断言），360px 与 200% 字体未断言（见 `evidence.md` G3）。
  - 证据：`run-harness` 通过行 + 新增断言名清单。

## Phase 3：改名与文案

- [x] **T011** `locale/*.json` 8 份的 `meta.title`/`meta.description` 换成 `research.md` D6 的译名。
- [x] **T012** `docs/DETAIL.*.md` 8 篇保持"唯一图片行"（静态检查禁止正文），新名字只进该图 alt 句；开关说明放 README，不放 DETAIL。
- [x] **T013** 9 份 README：标题、首段、特性列表里的"只渲染"改成"渲染 + 可选视觉优先"，开关作为现有特性列表里的一条/一段（`README.<lang>.md:15`，`README.md:13-14`），不另立小节；8 份本地化 README 删掉"插件只声明会画图"的旧说法，各补一段说明插件会在图更省力时主动要图、设置 → 通用设置有开关。
- [x] **T014** `package.json` 的 `description` 改成 `research.md` D6 的英文句子（逐字）：`Draws mermaid blocks right in the conversation and, when it helps, asks for a picture instead of a wall of text.`

## Phase 4：探针与证据

- [x] **T015** 探针八条（quickstart 列出）：F1 两档提示词、F3 默认 true、F4 dispose 路径、F5 写失败回退、F6 只写一次、F7 `aria-checked` 绑定、F8 命名空间、F9 无 setter 宿主——逐条破坏 → 重建 → 跑两套 → 录下红行 → 还原，把输出行原文记进 `evidence.md`。F1 与 F9 最后一次在 `0.2.3` 工作树上重跑（F9 用 `a host whose face has no setter hands the row no writer at all` 断言）；`0.2.5` 上重跑的是新增的 F10–F13（每条在 `%TEMP%` 的新副本里破坏、跑完还原），`0.2.4` 树本身从未被探针跑过，见 `evidence.md` G10（已由 `0.2.5` 关闭）。F3–F8 是 `0.2.1` 树上的记录。F2（段文本改回冻结字符串）在这个函数断言存在前两套都抓不到，现在由第 22 条静态检查捕获，单列为历史说明。
- [ ] **T016** `specs/002-visual-first-preference/evidence.md`：E-BLD · 0.2.1、E-CHK 与 E-HARN 是 `0.2.1` 树那次运行的输出原样照抄（`0.2.5` 的构建行单列为 `E-BLD · 0.2.5`；`0.2.5` 的检查只有 E-CHK/E-HARN 的汇总行，无逐条输出）；E-CHK 是该次运行的完整 stdout（44 条 `ok` 行加末行汇总），故意触发的 `warn` 与堆栈行走 stderr（52 行），不混入 stdout；F10–F13 的探针行已按 `0.2.5` 记录；未取证项单列。E1–E14 端到端逐条记录未做，见 `evidence.md` G6。
- [ ] **T017** `spec.md`/`plan.md`/`data-model.md`/`contracts/*` 与本清单的计数、断言名、版本号与实际一致（交叉核对每个反引号名都存在）；本轮已对齐 `0.2.5` 的版本号、45/274 计数与所引夹具行号；未逐条核对全部反引号名，故未勾。

## Phase 5：发版与评审

- [x] **T018** 版本升到 `0.2.0`（新增依赖与用户可见行为），`npm pack` 核对文件数；feature 001 的 `specs/001-mermaid-fence-render/contracts/plugin-manifest.md` 未改动（它仍是 feature 001 早期留下的 `0.1.32` 清单，已过时），本 feature 的配置契约由自己的 `contracts/plugin-config.md` 与 `contracts/settings-row.md` 承载。本轮修正把版本升到 `0.2.2`，这是代码变更而不只是文档：`settings.js` 里宿主 face 没有 `set` 时不再挂 `setValue`（点击回退并显示失败句）；第 22 条静态检查改写成读一次注册取三次值，静态条数仍是 **44**；浏览器夹具新增无 setter 宿主一条，发布时浏览器条数 **252**。评审并行改动又加了 8 条夹具断言（7 种语言的标签 + 直接断言 inject 面无 `setValue`），`0.2.3` 发布时是 **44 / 260**；`client.js` 随之重建。
- [x] **T019** 打 tag、GitHub Actions 发布、从 registry 装回 `desktop`、核对安装副本哈希与 `locale/`。发布与装回记录见 `evidence.md` E-PUB/E-INS：`0.2.0` 是历史，`0.2.1` 与 `0.2.2` 是中间版本（`0.2.1` run `45204279829`、shasum `b5c03c272b89f53f2416a5140c29b212b5f55b7a`、logIndex `4053240981`；`0.2.2` run `45211420278`、shasum `1f17ac1be4c1ea5c5e97c814cc699a6c910ee03d`、logIndex `4054074805`），当前发布版本是 `0.2.5`（run `45240437544`、shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`、33 files），六个版本都已装回（`0.2.5` 的装回见 `evidence.md` E-INS 0.2.5）。
- [ ] **T020** 真机核对：设置行出现、两档切换生效、重启后保持、8 语言标题正确、卸载后行消失。未做（`0.2.5` 同样未观察），见 `evidence.md` G1/G3/G4/G6。
- [ ] **T021** 起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。评审返回 FAIL；本轮按评审清单修正文档后重审；第 5 轮的四个 P2 已在 `0.2.5` 处理，见 `evidence.md` G1–G8 与 G11（G9/G10 已关闭）。
- [x] **T022** 发版 `0.2.4`：读 `set(...)` 解析出的布尔值（`true` 保存，`false` 回退并显示失败句），`configForms` 改由 `ctx.inject` 等待而不是提前读取；静态检查加第 31 条 `a refused settings write is not reported as saved`，夹具加 `a refused write that resolves false puts the switch back and says so` 与 `a host that gains configForms after apply still gets the settings row`，另补 8 种语言的说明断言，条数 **45 / 271**；发布 run `45230719544`、shasum `2a731d8c13067d88859eeec4f918773b1fd9578c`、33 files，装回见 `evidence.md` E-PUB/E-INS 0.2.4；`0.2.5` 见 T023。
- [x] **T023** 升到 `0.2.5` 并发布、装回（commit `0be17fe`、tag `v0.2.5`、run `45240437544` success、shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`、33 files，见 `evidence.md` E-PUB/E-INS 0.2.5）：拒绝写入时改用 `inject.readHostValue` → `readPreference(face)` 恢复宿主当前值（宿主在 resolve `false` 前先通知真实状态，见 `dsh-client-ui-settings/src/client/config-form.ts` 的 `recover()`）；`pending.then(...)` 移进 `try`，新增 `a thenable that throws out of then cannot break the click`；新增 `a refused write keeps the value the host took while it was pending`（两窗口）与 `a value the host pushes reaches the switch without a write`（`aria-checked` + 计算出的开关颜色）；静态检查 `the capability briefing is what it was before the switch` 改为逐句比对 `specs/001-mermaid-fence-render/contracts/host-prompt.md` 里的四句 `MERMAID_RENDER_PROMPT`（G9 关闭）。条数 **45 / 274**，`client.js` 783360 bytes / 781845 characters，sources sha256 `2b5728286c556d8dbaaa349cc9fb8ec5`，文件 SHA-256 `279c33781ef551e3d3bbb0aabf3d37a681fd5da4f4738c29c724b596667a8766`。探针 F10–F13 见 `evidence.md`。

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
| Host half: `Config` with `visualFirst` (default on, `.volatile()`), two-tier briefing, `claimSettingsPage` | done, 45 static checks |
| Client half: settings row on `settings.general.item`, `configForms` read/write, revert on refusal | done, 274 browser checks in the published `0.2.5` (`0.2.4` shipped 271, `0.2.3` 260, `0.2.2` 252); no disabled state, no timer; a refused write restores the host's current value |
| Eight-language rename (locale, DETAIL alt line, 8 READMEs, index, package description) | done; DETAIL keeps exactly one image line (its alt sentence carries the new name) |
| Evidence | `evidence.md` (this feature): build, 45 / 274, twelve falsifiability probes (F1, F3–F13), gaps G1–G8 and G11 open, G9/G10 discharged by `0.2.5` |
| Not done | live-window switch and renamed labels (G1, G4), the host write path to `settings.update` (G2), 200%/360px layout assertion for the row (G3), pixel comparison (G5), E1–E14 end-to-end rows (G6), SC-001 five sample requests (G7), schemastery import failure path (G8); `0.2.5` is published and installed but unobserved in a live window |

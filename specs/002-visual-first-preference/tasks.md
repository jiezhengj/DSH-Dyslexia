# Tasks: 视觉优先开关与「我有阅读障碍」命名

**Feature**: `002-visual-first-preference` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

图例：`[P]` 可并行；每条任务以"证据"结尾——没有证据的任务不算完成。

## Phase 1：宿主侧配置与两档提示词

- [x] **T001** 在 `package.json` 增加依赖 `"@deepseek-ai/schemastery": "^3.19.0"`，并确认 `npm install` 后 `node_modules` 可解析（不引入构建脚本）。
- [x] **T002** `index.js` 新增 `Config`（`z.object({ visualFirst: z.boolean().default(true).volatile() })`）与 `apply(ctx, config)`；`@deepseek-ai/schemastery` 在模块顶部静态 import——该包无法解析时插件在 import 阶段就失败，没有降级（见 `evidence.md` G8）。
- [x] **T003** 把 `MERMAID_RENDER_PROMPT` 拆成 `CAPABILITY_TEXT` + `PREFERENCE_TEXT`，段 `text` 改为函数：`visualFirst` 为真时两段拼接，否则只出能力段（逐字等于 001）。
- [x] **T004** 在宿主没有 `settings` 服务时不调用 `configure`；有则 `ctx.inject(['settings'], child => child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)))`，避免宿主生成多余设置页。
- [x] **T005** `verify/check-bundle.mjs` 新增静态断言：`Config` 含 `visualFirst`、`.default(true)`、`.volatile()`；偏好段字符串存在且只在真分支出现；两张禁止措辞表分别不出现（能力段：`always`/`must use`/`you should`/`every answer`/`prefer`；偏好段：`every answer`/`always draw`/`always answer`/`must draw`/`must use a diagram`）；段名/order 未变。静态检查现为 **44** 条，其中第 22 条是 `the section hands the host a function, not a frozen string`（#44 是 `the fixtures assert what the fixes promise, and can fail`）。
  - 证据：`check-bundle` 通过行 + 对应断言名。

## Phase 2：客户端设置行

- [x] **T006** 新增 `src/client/settings.js`：`VisualFirstRow` 组件（标题 + 说明 + 开关）与 `inject` 面（`getValue`/`subscribe`/`setValue`）；写入失败回退 + `role="status"` 提示。没有禁用态，也没有 2 秒清空。
- [x] **T007** `src/client/entry.js`：宿主同时提供 `slots.inject`/`slots.register`，且 `configForms.get('dsh-dyslexia')` 返回 face 时，注册 `settings.general.item`（`id: '@jiezhengj/dsh-dyslexia/visual-first'`、`order: 62`、`locale: 'dyslexia'`），并 `ctx.effect` 订阅与注销；否则整行不注册（没有"不可用"占位），图照常。
- [x] **T008** `src/client/i18n.js` 增 4 条设置文案 × 8 语言（`settingLabel`/`settingHint`/`settingSaved`/`settingFailed`），沿用 `hostKey` 命名空间发问。
- [x] **T009** `src/client/styles.js` 增设置行样式（flex 行、标题/说明层级、开关轨道与圆点、焦点环），全部取宿主 token，无固定宽度。
- [x] **T010** `verify/harness/index.html` 增设置行夹具：假 `configForms`（可读/可写/外部改值/写失败/缺服务）、`role="switch"` 与 `aria-checked`、点击一次只写一次、失败提示；语言只断言 zh 行文本，360px 与 200% 字体未断言（见 `evidence.md` G3）。
  - 证据：`run-harness` 通过行 + 新增断言名清单。

## Phase 3：改名与文案

- [x] **T011** `locale/*.json` 8 份的 `meta.title`/`meta.description` 换成 `research.md` D6 的译名。
- [x] **T012** `docs/DETAIL.*.md` 8 篇保持"唯一图片行"（静态检查禁止正文），新名字只进该图 alt 句；开关说明放 README，不放 DETAIL。
- [x] **T013** 9 份 README：标题、首段、特性列表里的"只渲染"改成"渲染 + 可选视觉优先"，补开关小节；8 份本地化 README 删掉"插件只声明会画图"的旧说法，各补一段说明插件会在图更省力时主动要图、设置 → 常规有开关。
- [x] **T014** `package.json` 的 `description` 改成 `research.md` D6 的英文句子（逐字）：`Draws mermaid blocks right in the conversation and, when it helps, asks for a picture instead of a wall of text.`

## Phase 4：探针与证据

- [x] **T015** 探针七条（quickstart 列出）：F1 两档提示词、F3 默认 true、F4 dispose 路径、F5 写失败回退、F6 只写一次、F7 `aria-checked` 绑定、F8 命名空间——逐条破坏 → 重建 → 跑两套 → 确认变红 → 还原，把输出行原文记进 `evidence.md`。F2（段文本改回冻结字符串）在这个函数断言存在前两套都抓不到，现在由第 22 条静态检查捕获，单列为历史说明。
- [x] **T016** `specs/002-visual-first-preference/evidence.md`：E-BLD/E-CHK/E-HARN 三块用单次运行输出原样照抄；未取证项单列。E1–E14 端到端逐条记录未做，见 `evidence.md` G6。
- [x] **T017** `spec.md`/`plan.md`/`data-model.md`/`contracts/*` 与本清单的计数、断言名、版本号与实际一致（交叉核对每个反引号名都存在）。

## Phase 5：发版与评审

- [x] **T018** 版本升到 `0.2.0`（新增依赖与用户可见行为），`npm pack` 核对文件数，更新 `specs/001-mermaid-fence-render/contracts/plugin-manifest.md`（feature 002 没有自己的 manifest 契约）。本轮修正把版本升到 `0.2.2`：文档修正 + 新增一条静态检查 + 版本号，`client.js` 随之重建。
- [x] **T019** 打 tag、GitHub Actions 发布、从 registry 装回 `desktop`、核对安装副本哈希与 `locale/`。发布与装回记录见 `evidence.md` E-PUB/E-INS：`0.2.0` 是历史，`0.2.1` 已发布（run `45204279829`、shasum `b5c03c272b89f53f2416a5140c29b212b5f55b7a`、logIndex `4053240981`）并已装回。
- [ ] **T020** 真机核对：设置行出现、两档切换生效、重启后保持、8 语言标题正确、卸载后行消失。未做，见 `evidence.md` G1/G3/G4/G6。
- [ ] **T021** 起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。评审返回 FAIL；本轮按评审清单修正文档后重审，见 `evidence.md` G1–G9。

## Dependencies

- Phase 2 依赖 T002/T003（段文本两档）先用静态断言钉住契约，再写客户端。
- Phase 3 可与 Phase 2 并行（不同文件）。
- Phase 4/5 依赖 Phase 1–3 全部完成。

## Implementation Strategy

1. 先钉契约（T002/T003/T005），保证"开关到底改变了什么"是可断言的事实。
2. 再做界面（T006–T010），夹具先行：假 `configForms` 的能力边界先写出来，组件照着它写。
3. 改名（T011–T014）风险低，可并行。
4. 探针与证据（T015–T017）必须在发版前完成，否则发版后的核对没有对照。

## Implementation status (2026-11-23)

| area | state |
|---|---|
| Host half: `Config` with `visualFirst` (default on, `.volatile()`), two-tier briefing, `claimSettingsPage` | done, 44 static checks |
| Client half: settings row on `settings.general.item`, `configForms` read/write, revert on refusal | done, 252 browser checks; no disabled state, no timer |
| Eight-language rename (locale, DETAIL alt line, 8 READMEs, index, package description) | done; DETAIL keeps exactly one image line (its alt sentence carries the new name) |
| Evidence | `evidence.md` (this feature): build, 44, 252, seven falsifiability probes (F1, F3–F8), nine gaps |
| Not done | live-window switch and renamed labels (G1, G4), the host write path to `settings.update` (G2), 200%/360px layout assertion for the row (G3), pixel comparison (G5), E1–E14 end-to-end rows (G6), SC-001 five sample requests (G7), schemastery import failure path (G8), no verbatim diff of the switch-off text against 001 (G9) |

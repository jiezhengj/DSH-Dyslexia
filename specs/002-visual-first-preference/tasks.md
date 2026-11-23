# Tasks: 视觉优先开关与「我有阅读障碍」命名

**Feature**: `002-visual-first-preference` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

图例：`[P]` 可并行；每条任务以"证据"结尾——没有证据的任务不算完成。

## Phase 1：宿主侧配置与两档提示词

- [ ] **T001** 在 `package.json` 增加依赖 `"@deepseek-ai/schemastery": "^3.19.0"`，并确认 `npm install` 后 `node_modules` 可解析（不引入构建脚本）。
- [ ] **T002** `index.js` 新增 `Config`（`z.object({ visualFirst: z.boolean().default(true).volatile() })`）与 `apply(ctx, config)`；`Config` 创建失败时降级为只注册能力段并 `warn`。
- [ ] **T003** 把 `MERMAID_RENDER_PROMPT` 拆成 `CAPABILITY_TEXT` + `PREFERENCE_TEXT`，段 `text` 改为函数：`visualFirst` 为真时两段拼接，否则只出能力段（逐字等于 001）。
- [ ] **T004** 在宿主没有 `settings` 服务时不调用 `configure`；有则 `ctx.inject(['settings'], child => child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)))`，避免宿主生成多余设置页。
- [ ] **T005** `verify/check-bundle.mjs` 新增静态断言：`Config` 含 `visualFirst`、`.default(true)`、`.volatile()`；偏好段字符串存在且只在真分支出现；禁止措辞表（`must`/`always`/`every answer`）不出现；段名/order 未变。
  - 证据：`check-bundle` 通过行 + 对应断言名。

## Phase 2：客户端设置行

- [ ] **T006** 新增 `src/client/settings.js`：`VisualFirstRow` 组件（标题 + 说明 + 开关）与 `inject` 面（`getValue`/`subscribe`/`setValue`）；写入失败回退 + `role="status"` 提示。
- [ ] **T007** `src/client/entry.js`：拿到 `configForms` 时注册 `settings.general.item`（`id: 'visual-first'`、`order: 80`、`locale: 'dyslexia'`），并 `ctx.effect` 注销；拿不到则静默跳过。
- [ ] **T008** `src/client/i18n.js` 增 4 条设置文案 × 8 语言（`settingsTitle`/`settingsSummary`/`settingsUnavailable`/`settingsSaveFailed`），沿用 `hostKey` 命名空间发问。
- [ ] **T009** `src/client/styles.js` 增设置行样式（flex 行、标题/说明层级、开关轨道与圆点、焦点环），全部取宿主 token，无固定宽度。
- [ ] **T010** `verify/harness/index.html` 增设置行夹具：假 `configForms`（可读/可写/外部改值/写失败/缺服务）、8 语言标题与说明、`role="switch"` 与 `aria-checked`、Space/Enter 切换、失败提示出现与消失、360px 与 200% 字体不溢出。
  - 证据：`run-harness` 通过行 + 新增断言名清单。

## Phase 3：改名与文案

- [ ] **T011** `locale/*.json` 8 份的 `meta.title`/`meta.description` 换成 `research.md` D6 的译名。
- [ ] **T012** `docs/DETAIL.*.md` 8 篇首句改成同义说法，并补一句开关说明（该语言）。
- [ ] **T013** 9 份 README：标题、首段、特性列表里的"只渲染"改成"渲染 + 可选视觉优先"，补开关小节；删除任何"插件不携带偏好/不改指令文件才能用"的旧表述（改为"不需要改任何文件，开关就在设置里"）。
- [ ] **T014** `package.json` 的 `description` 改成"（英文）DSH — I'm dyslexic: draws mermaid blocks in place and, when it helps, asks for a picture"。

## Phase 4：探针与证据

- [ ] **T015** 探针 P1–P6（quickstart 列出）：逐条破坏 → 重建 → 跑两套 → 确认变红 → 还原，把输出行原文记进证据。
- [ ] **T016** `specs/002-visual-first-preference/evidence/verification.md`：E-BLD/E-CHK/E-HARN 三块用单次运行输出原样照抄；E-LIVE 按 quickstart E1–E14 逐条记录；未取证项单列（模型是否真的更爱画图、真实读屏播报、200% 字体真机）。
- [ ] **T017** `spec.md`/`plan.md`/`data-model.md`/`contracts/*` 与本清单的计数、断言名、版本号与实际一致（交叉核对每个反引号名都存在）。

## Phase 5：发版与评审

- [ ] **T018** 版本升到 `0.2.0`（新增依赖与用户可见行为），`npm pack` 核对文件数，更新 `contracts/plugin-manifest.md`。
- [ ] **T019** 打 tag、GitHub Actions 发布、从 registry 装回 `desktop`、核对安装副本哈希与 `locale/`。
- [ ] **T020** 真机核对：设置行出现、两档切换生效、重启后保持、8 语言标题正确、卸载后行消失。
- [ ] **T021** 起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。

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
| Host half: `Config` with `visualFirst` (default on, `.volatile()`), two-tier briefing, `claimSettingsPage` | done, 43 static checks |
| Client half: settings row on `settings.general.item`, `configForms` read/write, revert on refusal | done, 20 browser checks |
| Eight-language rename (locale, DETAIL alt line, 8 READMEs, index, package description) | done; DETAIL keeps exactly one image line (its alt sentence carries the new name) |
| Evidence | `evidence.md` (this feature): build, 43, 251, one falsifiability probe, five gaps |
| Not done | live-window checks (G1, G2, G4), six-language narrow layout (G3), pixel comparison (G5) |

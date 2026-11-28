---
description: "Task list for 003-diagram-palette-contrast"
---

# Tasks: 会话内的图看得清、有颜色分辨度

**Input**: Design documents from `/specs/003-diagram-palette-contrast/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)、[quickstart.md](./quickstart.md)

**Tests**: 本 feature 的"测试"就是仓库既有的两层检查（`verify/check-bundle.mjs` 静态断言 + `verify/harness/index.html` 浏览器断言，由 `verify/run-harness.mjs` 驱动）。spec 的 FR-009/SC-005 明确要求"夹具用真实令牌 + 结构线/文字对比度断言 + 旧配色至少失败 6 条"，因此**每个故事都先写检查、再改实现**。

**Organization**: 按 spec 的 6 个用户故事分阶段，P1 优先；每个阶段结束时都能独立验证（重建产物 + 跑检查 + 看预览）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可并行（不同文件，且不依赖未完成任务）
- **[Story]**：所属用户故事（US1–US6）
- 所有路径以仓库根 `/Users/jiezhengj/Documents/Project/DSH-Dyslexia/` 为基准

## Path Conventions

单包插件：宿主半边 `index.js`、客户端源码 `src/client/*.js`、产物 `client.js`、检查 `verify/*`、设计文档 `specs/003-diagram-palette-contrast/*`。

---

## Phase 1: Setup（共享基础设施）

**Purpose**: 把"真实令牌"这件事落成文件，后面所有检查都从这里取值

- [x] T001 生成 `verify/host-tokens.json` 快照：只收本 feature 用到的键（`--dsw-alias-bg-layer-1`、`-bg-base`、`-label-primary/secondary/tertiary`、`-link`、`-state-error-primary`、`-chart-messages`、`--dsw-static-green-500`、`-amber-500`、`-violet-400`、`-blue-400`、`-red-500`、`-deepseek-400`、`-deepseek-500`、`-neutral-bluish-400`），按 `contracts/verification-baseline.md` §1 的形状写 `source` / `version` / `extracted_at` / `light` / `dark`
- [x] T002 [P] 新增 `scripts/extract-host-tokens.mjs`：从已安装宿主的 `app.asar` 提取上述令牌，输出与 T001 同格式的 JSON，供宿主升级后刷新（只读，不联网，不改包内容）
- [x] T003 [P] 在 `scripts/build-preview.mjs`（令牌块，现为 `scripts/build-preview.mjs:35-43`）改为读 `verify/host-tokens.json`，删掉编造的 `--pele-line:#4a5a86` 等值

**Checkpoint**: `verify/host-tokens.json` 存在，提取脚本可重复运行且输出与快照一致

---

## Phase 2: Foundational（阻塞性前置）

**Purpose**: 夹具具备"真实令牌 + 会算对比度"的能力；没有这些，任何故事都无法验证

**⚠️ CRITICAL**: 本阶段完成前不要改 `src/client/styles.js`

- [x] T004 用 `verify/host-tokens.json` 生成 `verify/harness/index.html:8-19` 的 light 与 dark 两套令牌块（dark 仅在本测试文件内用 `body[data-ds-dark-theme]` 模拟），删除 `#f6f7fb`/`#b9bdd0`/`#4a6cf7` 等自造值
- [x] T005 [P] 在 `verify/harness/index.html` 内新增颜色工具函数：解析 `rgb()/rgba()`、按画布底色合成半透明色、WCAG 相对亮度、对比度、色相角；要求对 `rgba(0,0,0,0.04)` 这类值能算出研究阶段记录的 1.09:1（用 `probe-compare.html` 的旧值自检函数本身）
- [x] T006 [P] 在 `verify/check-bundle.mjs` 新增源码禁止项断言（按 `contracts/palette-mapping.md` §3）：样式表内不得有 `!important`、不得有 `#rrggbb` / `rgb(` / `hsl(` 字面色值、不得有 `body`/`:root`/`html` 起头的选择器、`src/` 内不得出现 `data-ds-dark-theme`
- [x] T007 在 `verify/run-harness.mjs` 建立计数纪律：`EXPECTED_CHECKS` 与实际检查数逐字相等（现为 `verify/run-harness.mjs:137` 的 325），并在日志里输出独立的 `assertion has teeth` 行位（供 Phase 8 的负向自检使用）

**Checkpoint**: `npm run harness` 在真实令牌下运行，可能因旧配色而**变红**——这是预期的，说明夹具终于能看见真实世界

---

## Phase 3: User Story 1 - 普通流程图在真实宿主里看得清（P1）🎯 MVP

**Goal**: 连边、箭头、方框描边不再"雾一样淡"；浅色与深色都 ≥3:1

**Independent Test**: 用真实 light 与 dark 令牌渲染同一张流程图，量测连边 `stroke` 与未分类形状描边对画布背景的对比度，两项都 ≥3:1；把 `--pele-line` 改回 `--dsw-alias-border-l2` 后断言必须变红

### Tests for User Story 1

- [x] T008 [P] [US1] 在 `verify/harness/index.html` 新增 A 组断言：flowchart 连边 `stroke` 对画布背景 ≥3:1、箭头 `path.pele-marker` 同源继承、未分类形状描边对背景 ≥3:1，浅色与深色各一遍（阈值见 `contracts/verification-baseline.md` §3 A 组）
- [x] T009 [US1] 在 `verify/harness/index.html` 新增负向自检：把 `--pele-line` 临时设为 `var(--dsw-alias-border-l2)` 后，A 组第一项必须失败，并打印 `assertion has teeth`

### Implementation for User Story 1

- [x] T010 [US1] 改 `src/client/styles.js:39-57`：`--pele-line` 与 `--pele-border` 改为 `var(--dsw-alias-label-tertiary)`；`--pele-surface` 改为 `color-mix(in srgb, var(--dsw-alias-label-primary) 4%, var(--pele-bg))`，并在前面保留一行纯变量回退声明（降级见 `contracts/palette-mapping.md` §1）
- [x] T011 [US1] 重建并验证：`npm run build && npm test`；截图浅/深两张存入 `specs/003-diagram-palette-contrast/evidence/`，命名含主题与日期

**Checkpoint**: US1 独立可用——图在真实宿主里能看清骨架

---

## Phase 4: User Story 2 - 图里的文字清楚（P1）

**Goal**: 新的填充（尤其深色下的深底）不得压住节点标签；文字对其直接背景 ≥7:1

**Independent Test**: 对 fixture 里出现的每一种节点填充，量测其中 `text.pele-label` 的对比度，浅/深各一遍，全部 ≥7:1（高于 FR-002 的 4.5:1）

### Tests for User Story 2

- [x] T012 [P] [US2] 在 `verify/harness/index.html` 新增 B 组断言：遍历 `g.pele-node` 内的 `text`，取其所在形状的实际 `fill` 作为背景，断言对比度 ≥7:1；对无形状填充的情形退回画布背景；浅/深各一遍
- [x] T013 [US2] 若 T012 在深色下不达标，调整 `src/client/styles.js` 的填充混合比例（只允许动比例，不允许引入字面色值），并在 `research.md` D1 记录新比例的实测值

**Checkpoint**: US1 + US2 同时成立——骨架可见、文字可读

---

## Phase 5: User Story 3 - 普通图按节点角色呈现多种颜色（P1）

**Goal**: 不含任何颜色指令的流程图，按形状角色呈现四种色相 + 一种明度档；模型侧获得一句能力说明

**Independent Test**: 一张只含 `/`、`{}`、`[( )]`、`[ / ]`、`[ ]` 五类形状的流程图，在浅/深主题下五个角色的填充互不相同、四个彩色角色彩色通道差 ≥20、相邻角色色相差 ≥20°、"处理"类填充对背景 >1.05

### Tests for User Story 3

- [x] T014 [P] [US3] 在 `verify/harness/index.html` 的 fixture 里加入覆盖 13 个形状类的流程图，并新增 C 组断言（按 `contracts/verification-baseline.md` §3 C 组；取值约束见 `data-model.md` 的 `Role.fill` / `Role.stroke` / `Role.shapeClasses`）
- [x] T015 [P] [US3] 在 `verify/check-bundle.mjs` 断言 `index.js` 的 `CAPABILITY_TEXT` 含能力说明句、且 `PREFERENCE_TEXT` 逐字未变（002 契约），并断言 `index.js` 内不出现十六进制色值

### Implementation for User Story 3

- [x] T016 [US3] 在 `src/client/styles.js` 增加角色规则：按 `data-model.md` §1 的 `Role.shapeClasses` 选 `> rect` / `> polygon` / `> circle` / `> path` / `> ellipse` / `> polyline`，填充与描边按 `data-model.md` §2 的公式；每条规则先写回退声明；**不得**给 `text` 设色、**不得**用 `!important`（`contracts/palette-mapping.md` §2/§3）
- [x] T017 [US3] 在 `index.js:32-38` 的 `CAPABILITY_TEXT` 末尾追加 `contracts/palette-mapping.md` §4 那一句（英文，不写色值、不改 `PREFERENCE_TEXT`）
- [x] T018 [US3] 重建并验证：`npm run build && npm test`；在 `scripts/build-preview.mjs` 生成的预览页里确认五类角色成色（浅/深），截图存档

**Checkpoint**: 三个 P1 故事全部成立——这正是"修好看不清"的 MVP

---

## Phase 6: User Story 4 - 作者标了类别时颜色可分（P2）

**Goal**: 作者写的 `classDef` / `style` 颜色优先于插件角色色，且不被 `!important` 压掉

**Independent Test**: 同一张图里既有无 `classDef` 的节点、也有带 `classDef fillcolor/stroke` 的节点；量测后者计算样式等于作者值，前者仍是角色色

### Tests for User Story 4

- [x] T019 [P] [US4] 在 `verify/harness/index.html` 新增 D 组断言：带 `classDef` 的节点，其形状元素的计算 `fill`/`stroke` 逐字等于作者值；同图里未标色的节点仍等于角色色；浅/深各一遍

### Implementation for User Story 4

- [x] T020 [US4] 若 T019 失败，只允许通过**降低选择器特异性**或调整规则顺序解决（禁止 `!important`、禁止改引擎选项）；修正后把原因写进 `research.md` R8

**Checkpoint**: 作者优先与插件上色并存，互不覆盖

---

## Phase 7: User Story 5 - 图表类图形的配色与宿主一致（P3）

**Goal**: 饼图、gantt、多类别图的分片用宿主色相序列，不再是引擎默认的旧 mermaid 调色板

**Independent Test**: 一张 4 分片饼图与一张 3 条 gantt，分片填充互不相同且都来自宿主令牌；浅/深主题各一遍

### Tests for User Story 5

- [x] T021 [P] [US5] 在 `verify/harness/index.html` 新增 E 组断言：饼图 `path` 分片填充互不相同（≥3 种）、且每种都能在宿主令牌快照里找到同源色相（按 `data-model.md` §4 的 `SeriesPalette.1..8` 顺序）

### Implementation for User Story 5

- [x] T022 [US5] 在 `src/client/styles.js` 增加 `--pele-series-1..8`，顺序取 `data-model.md` §4（相邻色相差最小 42°）
- [x] T023 [US5] 重建并验证：`npm run build && npm test`；预览页加一张饼图与一张 gantt，确认分片成色

**Checkpoint**: 结构性图与流程性图都有颜色语义

---

## Phase 8: User Story 6 - 维护者能挡住"又看不清"的回归（P2）

**Goal**: 夹具令牌与真实宿主一致；旧配色在新断言下至少失败 6 条；计数纪律可执行

**Independent Test**: 把 `styles.js` 的配色改回 0.2.24 的九行映射，`npm run harness` 必须失败且失败条数 ≥6；改回新映射后全绿

### Tests for User Story 6

- [x] T024 [P] [US6] 在 `verify/check-bundle.mjs` 新增断言：`verify/harness/index.html` 与预览脚本里出现的每个 `--dsw-*` 变量与值，都必须在 `verify/host-tokens.json` 里找到同值；快照的 `source`/`version`/`extracted_at` 必须齐全
- [x] T025 [US6] 在 `verify/run-harness.mjs` 汇总"负向自检"结果：一次运行内临时注入旧映射，断言失败条数 ≥6（SC-005），并把条数写进日志
- [x] T026 [US6] 全量回归：`npm run build && npm test`，核对 `EXPECTED_CHECKS` 与实跑数；在 `specs/003-diagram-palette-contrast/evidence/README.md` 记录本次运行的检查数

**Checkpoint**: 谁再把线调淡、把夹具换成好看的值，检查会红

---

## Phase 9: Polish & Cross-Cutting Concerns

> 落地说明：仓库内验收全部通过（npm test 静态 76 条 + 浏览器 346 条）；真机会话五项（浅色、深色、作者 classDef、360 px 视口、200% 字体、卸载回退）尚未补做，原因见 T030。

**Purpose**: 读者可见的收尾：文档、版本、真实宿主取证

- [x] T027 [P] 在 `docs/` 写明"颜色含义来自节点图形角色"（SC-009）：五类角色、作者 `classDef` 优先、深浅主题自动跟随；并指向 `specs/003-diagram-palette-contrast/data-model.md` 的取值表
- [x] T028 [P] `README*.md` 只在与"图会被画成什么样"相关的段落补一句；没有对应表述的语种不改（避免九份译文大面积漂移）
- [x] T029 版本号 `0.2.24` → `0.3.0`（`package.json`），重建 `client.js`，`npm run prepack` 确认产物与静态检查都过
- [ ] T030 按 `quickstart.md` §2 做反向验证（旧映射必须红），§5 做宿主内人工核对：浅色、深色、作者 `classDef`、360px 视口、200% 字体、卸载回退文本；截图存入 `specs/003-diagram-palette-contrast/evidence/`
  （反向验证已完成：0.2.24 映射整轮跑出 11 条红 ≥6；宿主内五项待 0.3.0 装上后补做，本机 profile 仍是 0.2.24）
- [x] T031 [P] 更新 `specs/003-diagram-palette-contrast/evidence/README.md`：补入本次两张真实宿主截图与量测数值

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**：无依赖，可立即开始（T001 → T002、T003 可并行）
- **Phase 2 Foundational**：依赖 Phase 1（T004 需要 T001 的快照）；**阻塞所有故事**
- **Phase 3–8 故事**：都依赖 Phase 2；故事之间按 P1 → P2 → P3 顺序推进
- **Phase 9 Polish**：依赖全部已完成故事

### User Story Dependencies

- **US1（P1，骨架可见）**：Phase 2 后即可做，无前置故事
- **US2（P1，文字可读）**：Phase 2 后即可做；T012 必须能在"尚无角色色"时通过（对无形状填充退回画布背景），因此与 US3 互不阻塞
- **US3（P1，角色成色）**：Phase 2 后即可做；T013/US2 的深色调整会在 US3 之后复跑一次（同一条断言，不需新任务）
- **US4（P2，作者优先）**：依赖 US3（需要角色规则存在才能证明"被作者覆盖"）
- **US5（P3，图表色）**：只依赖 Phase 2（`--pele-series-*` 独立于角色规则），可与 US3/US4 并行
- **US6（P2，回归防线）**：依赖 US1–US5 的断言都已就位；它的产物是"让这些断言在旧代码下必然失败"

### Within Each User Story

- 先写断言（T008/T012/T014/T019/T021/T024），确认在旧实现下**失败**，再改实现
- 实现只动 `src/client/styles.js` 与 `index.js`；`figure.js` / `view.js` / `settings.js` 不动（FR-010）
- 每个故事末尾都是"重建 + 跑检查 + 截图"，不允许只改代码不验证

### Parallel Opportunities

- T002 与 T003（不同文件）、T005 与 T006（不同文件）
- US1 的 T008 与 T009 可并行（同一文件不同断言块，建议按块拆开写）
- US3 的 T014（夹具）与 T015（静态检查）可并行；T016（样式）与 T017（提示词）在不同文件，可并行
- US5 的 T021 与 T022 可并行
- Phase 9 的 T027/T028/T031 可并行

---

## Parallel Example: P1 三故事

```bash
# 三条 P1 断言的落点互不相同，可同时开工：
Task: "verify/harness/index.html A 组：连边/描边对比度断言"        # US1
Task: "verify/harness/index.html B 组：文字对填充对比度断言"        # US2
Task: "verify/harness/index.html C 组：角色成色断言 + 13 形状夹具"   # US3
```

## Parallel Example: US3 实现

```bash
# 两个文件互不重叠：
Task: "src/client/styles.js 角色规则"          # T016
Task: "index.js CAPABILITY_TEXT 追加一句"      # T017
```

---

## Implementation Strategy

### MVP First（只做 US1）

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3（US1）：线可见
3. **STOP & VALIDATE**：真实令牌下量测 ≥3:1，反向自检必须红
4. 若只想先止血（读者抱怨"看不见线"），此时即可发一个补丁版

### Incremental Delivery

1. Setup + Foundational → 夹具变真（此时旧代码大概率红）
2. +US1 → 骨架可见；+US2 → 文字可读；+US3 → 角色成色（**建议一起发 0.3.0**）
3. +US4 → 作者优先被钉住；+US5 → 图表色统一；+US6 → 防线成型
4. Polish → 文档、版本、真实宿主截图

### 任务量与风险

- 代码面很小（`styles.js` 约 50 行、`index.js` 1 句），**风险集中在验收侧**：断言写不对就会"全绿但没用"。因此 T005（工具函数自检）、T009/T025（负向自检）不是可选项。
- 若 T012 在深色下反复不达标，优先调 T013 的混合比例，而不是给深色单开一套规则（那会退化成 R9 说的问题）。

---

## Notes

- [P] = 不同文件、无未完成依赖
- 每个任务完成即可提交；不要把一个故事的"改代码"和"改断言"拆到两次提交之外
- `verify/harness/index.html` 的 `EXPECTED_CHECKS` 数字必须与实际检查数逐字相等——新增断言不加数字，等于没加
- 不允许用"手动看图"代替断言；人工核对是补充证据，不是验收依据（quickstart.md §5）

## Phase 10: Convergence

- [ ] T032 [CRITICAL] 让系列色与强调色按主题派生，使彩色区域上的 `--_bg` 文字与画布上的系列色描边都达标 per FR-001, FR-002, SC-001, SC-002 (contradicts)
- [x] T033 [CRITICAL] 把 0.3.0 装进真实桌面 profile 并在真机会话取证浅色/深色/作者 `classDef`/360px/200% 字体/卸载回退 per Constitution 验收证据, US1–US5 (missing)

  实现：`npm pack` 后 `dsh plugin --profile desktop add jiezhengj-dsh-dyslexia-0.3.0.tgz`（真实 `desktop` profile 已是 0.3.0，registry 仍是 0.2.24）；因 Electron 独占 profile，另复制一份 `desktop-check` 由 CLI 起真实宿主实例 `http://127.0.0.1:50991`，在其中新开会话、让模型自己写 mermaid。量测：浅色连边与箭头 `rgb(129,133,140)` = 3.71:1、五类填充 `color(srgb 0.844 0.959 0.886)` / `0.993 0.932 0.828` / `0.942 0.946 0.950`、文字 `rgb(15,17,21)`；深色画布 `rgb(21,21,23)`、连边 `rgb(173,178,184)`、填充 `0.137/0.252/0.182`（绿）、`0.285/0.224/0.124`（琥珀）、`0.235/0.238/0.246`（中性）；饼图分片 `0.605/0.758/0.978` 等、分片标签 `rgb(35,35,36)` 最坏 8.53:1、图例 `rgb(249,250,251)`；360px 视口图宽 271px 无溢出；200% 缩放图宽 578px 无溢出；卸掉插件后同一会话只剩代码块文本（`flowchart TD …`），无任何 `dsh-dyslexia-*` 元素。截图见 `evidence/{light-flowchart,dark-flowchart,dark-pie,narrow360-light,zoom200-light,uninstalled-fallback-light}.png`。
- [x] T034 在夹具内对全部受支持图种（sequence/class/state/er/gantt/timeline/mindmap/kanban/xychart）断言结构线与文字对比度 per SC-001, SC-002 (missing)

  实现：新增 `TYPE_CODES`、`surfaceAt`、`ratioBetween`、`paintBehind`、`typesPass(theme)`，每个图种 2 条断言（结构线 ≥3:1、文字 ≥4.5:1），xychart 追加网格 ≥1.4:1；`run-harness` 检查数 346 → 409。实测最低：浅色线 3.71、文字 5.34；深色线 7.36、文字 7.96。
- [x] T035 让图表网格线在两种主题下可见（`--pele-surface-alt` 不再等于画布底色）per FR-001 (partial)

  实现：`--pele-surface-alt` 改为 `color-mix(in srgb, var(--dsw-alias-label-primary) 20%, var(--pele-bg))`；实测网格 1.55:1（浅）/1.89:1（深），断言与契约门槛 1.4:1。
- [x] T036 在 `docs/` 与 README 列出作者可用的分类色（五个角色色 + 八个系列色及其实测对比度）per FR-004 (partial)

  实现：新增 `docs/colours.md`（五角色表 + 八系列色表 + 作者优先 + 数字来源），`README.md` 颜色段落补 `style`、系列色与链接；新增静态检查 `the colours a reader gets are written down where an author can find them`（9 个色相与五个形状必须在文档里），check-bundle 77 → 78。
- [x] T037 夹具新增"宿主令牌缺失"用例，断言 `color-mix()` 全部失效时回退到引擎默认仍满足 FR-001/FR-002 per FR-007 (partial)

  实现：`defaultsPass()` 把 `HOST_TOKEN_NAMES` 里 17 个令牌设成 `initial` 后要求线 ≥3:1、文字 ≥4.5:1；同时给 `styles.js` 的全部 `var(--dsw-…)` 补引擎默认兜底，否则 SVG `fill` 会继承文字墨色（实测黑方块），补兜底后该场景线 16.48:1。静态侧新增 `every host token keeps the engine default behind it`。
- [x] T038 能力说明补上 `style`，仍保持总词数 ≤95 per FR-011 (partial)

  实现：第四句改为 ``Shapes set colour: `([start])`, `{decision}`, `[(data)]`; `classDef`/`style` win.``，`contracts/host-prompt.md` 由 `index.js` 逐句重生成，check-bundle 断言 5 句逐字一致且词数 ≤95。

## Phase 11: Converge 结果

- 2026-11-27 `/speckit-converge` 判定的 7 条缺口（T032–T038）全部落地：系列色/强调色按主题派生、全图种对比度断言、网格可见、`docs/colours.md`、令牌缺失回退、能力说明补 `style`、真机取证。
- 收口验证：`npm run build && npm test` = 静态 78 条 + 浏览器 409 条全绿；`client.js` 796627 bytes / `sources sha256:215cb427bb57b2d7a8f106a7b3b04637`；`verify/host-tokens.json` 与宿主 0.2.2-rc.5 一致。
- 真机：取证用的 0.3.0 tarball 已删除；`desktop` profile 现装 npm 上的 0.3.1（CI 发布、带 provenance）。六张真机截图与量测见 `evidence/README.md`。

## Phase 12: 非流程图的主体节点（真机复现后补）

用户报告：0.3.1 装上后，会话里的 `stateDiagram-v2` 依然不是彩色。原因是角色规则只覆盖 `pele-shape-*`，而 class/state/er/sequence/kanban 的节点类是 `pele-state` / `pele-class` / `pele-entity` / `pele-actor-participant` / `pele-card`，整张图退回中性填充，只剩浅灰方块。

- [x] T039 给非流程图的主体节点接角色色：起止符（`pele-state-start` / `pele-state-end`）用起止绿，其余主体节点（`pele-state`、`pele-class`、`pele-entity`、`pele-actor-participant`、`pele-card`）用数据紫 per FR-004/FR-012

  实现：`src/client/styles.js` 的"数据"规则扩到五个主体类，新增"起止"规则覆盖 `pele-state-start`/`-end`；四条声明顺序与回退声明沿用原有约定。实测状态机：浅色端点填充 `#d7f5e2`、状态填充 `#efeafe`（文字 16.10:1）、状态描边对画布 5.86:1；深色 10.71:1 / 11.12:1 / 10.11:1。

- [x] T040 夹具断言每种图都至少有一个节点带自己的色相 per SC-001/SC-002

  实现：`typesPass(theme)` 每种图新增一条 `colours a node of its own (channel spread ≥8)`，取 `.pele-node` 的形状、`.pele-task`/`.pele-series` 的子元素与 `.pele-slice` 的填充，按 0–255 通道极差判定；浏览器检查 409 → 429。

- [x] T041 静态检查与文档同步：主体类必须有规则、`docs/colours.md` 写清"不是流程图的时候" per FR-004

  实现：`check-bundle.mjs` 新增 `records, states and participants are coloured too`（7 个主体类必须各有规则、类名主干必须被引擎使用），78 → 79；`docs/colours.md` 新增一节（状态机示例 + 实测表）；`contracts/palette-mapping.md` 补主体类映射；`scripts/build-evidence.mjs` 的证据页加上浅/深两块状态机与量测行。

- 收口：`npm run build && npm test` = 静态 79 条 + 浏览器 429 条全绿；版本 0.3.2，随 tag `v0.3.2` 由 GitHub Actions 发布。

## Phase 13: 把"发现缺口"从人工变成构建期（用户问）

用户问（原文）：「这个只能靠不断地发现 bad case 吗？不能提前找到缺口吗？」——上一轮的答案只是"以后哪个图种发灰就发我截图"，等于继续靠人肉发现。本阶段改为把**引擎自己的词汇表**当成权威来源，用构建期检查覆盖它：引擎支持哪些图种、能画哪些形状、每个图种画出哪些节点类，缺一个就红。

- [x] T042 引擎的 53 个形状全部接角色规则 per FR-004

  实现：`src/client/styles.js` 的角色规则从 13 个形状扩到 `var G_` 表里的全部 53 个（起止 8、判断 3、数据 11、输入输出 8、处理 23）；选择器从直系子代改为后代 `:is(rect, polygon, circle, path, ellipse, polyline)`，因为 `docs`、`brace`、`braces` 把 `<path>` 包在 `<g transform>` 里。实测 30 个彩色形状通道极差 20–29，23 个处理类保持 2–3 的中性档。

- [x] T043 图种覆盖扩到 26 个样例 + 9 个"解析失败但有理由"的登记 per SC-001/SC-002

  实现：`verify/harness/index.html` 的 `TYPE_CODES` 新增 `block`、`requirement`、`architecture`、`c4`、`agentflow`、`journey`、`treemap`、`wardley`、`packet`、`sankey`、`radar`、`quadrantChart`、`gitGraph`、`info`、`cynefin`、`ishikawa`；`usecase`/`railroad` 族/`eventmodeling`/`swimlane`/`venn`/`treeView` 记入 `TYPE_NOT_SAMPLED` 并附解析器原话。雷达的蛛网、图表的网格按装饰线单测（≥1.4:1）。

- [x] T044 非流程图的节点类补齐 + "每种节点类必须有规则"断言 per FR-012

  实现：数据规则加 `pele-requirement`、`pele-service`、`pele-leaf`（后撤，见下）、`pele-wardley-component`；C4 的 `pele-c4-person` 归输入输出、`pele-c4-system` 归处理；`typesPass` 在遍历每个图种时把 `.pele-node` 的类名收进 `seenNodeTokens`，闭合后断言"每个类都能在样式表里找到规则"（分组类 `pele-node`/`pele-nodes`/`pele-section` 除外）。**`pele-leaf` 随后被撤掉**：树图叶子就是数据，引擎用 `--pele-series-N` 铺满、用画布色写标签，接管后白字压浅紫只剩 1.17:1（夹具当场发现）。

- [x] T045 静态守卫：形状表与图种登记表都从引擎源码解析 per FR-006

  实现：`verify/check-bundle.mjs` 的 `SHAPE_CLASSES` 改为解析 `vendor/pele/pele.global.js` 的 `var G_=[[…]]`（不再是手写 13 个）；新增 `every diagram type the engine registers is sampled or explained`，解析 `["id","keyword",/^…/]` 登记表（35 个图种），要求每个都在夹具里被采样或在 `TYPE_NOT_SAMPLED` 里有理由，反向也查（列表过期 / 夹具采样了引擎没有的图种）。静态检查 79 → 80 条。

- 收口：`npm run build && npm test` = 静态 80 条 + 浏览器 540 条全绿；证据图 `evidence/all-shapes.png`（53 形状 × 浅/深 × 五角色）与 `evidence/all-types.png`（12 个额外图种）；版本 0.3.3。

- 反向验证（这套守卫真的有牙齿，2026-11-27 实测）：
  - 删掉 `styles.js` 里 `pele-shape-win-pane` 一行 → `every shape class has a role rule of its own` 红（`no role rule for win-pane`）。
  - 往引擎登记表插一个假图种 `polygonnet` → `every diagram type the engine registers is sampled or explained` 红（`the engine draws polygonnet and nothing tests it`）。
  - 两处都 `git checkout` 还原后 `npm test` 回到静态 80 + 浏览器 540 全绿。也就是说：以后引擎升级带来新形状/新图种，**构建**会先红，不必等聊天里出现灰方块。

## Phase 14: 标签里的直引号（用户复现后补）

用户贴来一张流程图，插件判定"语法有误"退回源码，问"这个的确是语法有误吗"。复核结论：**是引擎词法规则**，不是插件问题——`A[想给 wu 加"带路径行号复制"]` 中裸写的 `"` 被当成字符串 token，报 `Expecting 'SQE', 'UNICODE_TEXT', 'TEXT', 'TAGSTART', got 'STR'`；引号只能包住整段标签（`A["…"]`），全角引号、`「」`、`#quot;` 都合法（四种写法均实测渲染正确）。用户选择"在模型侧能力说明里加一句"，于是：

- [x] T046 能力说明加上"引号须包住整段标签"，预算 95 → 100 词 per FR-011

  实现：`index.js` 的 `CAPABILITY_TEXT` 第四句改为 `Shapes set colour: `([start])`, `{decision}`, `[(data)]`; `classDef`/`style` win; a quote must wrap the whole label.`（整段 100 词，仍是 001 的四句 + 003 的一句）；`verify/check-bundle.mjs` 的词数上限 95 → 100；`contracts/host-prompt.md` 的逐字块与说明同步，并补一条"标签里要引号怎么写"的解释（`A["他说#quot;好#quot;"]`、`A[他说「好」]` 可以，裸 `"` 不行）。检查：静态 80 条全绿，仍断言"五句、001 四句逐字在前"。

## Phase 15: 语法错误指出位置（用户要求补）

读者看到"图里的语法有误，已改为显示源码"之后仍要找半天：引擎的英文报错（`Expecting 'SQE', … got 'STR'`）只进控制台，屏幕上没有位置。用户要求把位置显示出来。做法不是搬运引擎英文，而是画出读者自己那一行：

- [x] T047 回退提示里画出出错的行号与该行源码，并标出解析器拒绝的那个字符 per FR-002、SC-008

  实现：`src/client/figure.js` 新增 `figureSyntaxHint(error, code)`——从引擎报文的 `Parse error on line N:`、缩进代码行、`^` 行与 `got '…'` 取位置；**不用引擎的字符列**（中文按单字符计数会错位），而是按 `got` 区分两种情况：拒绝某字符（`STR` 等）时标该字符本身，行不够长（`EOF`/`$end`）时标行尾空白；行文本取读者写的 `code.split('\n')[N-1]`（去掉引擎加的缩进），引擎英文不进屏幕。`src/client/view.js` 新增 `syntaxHint` 状态与 `.dsh-dyslexia-hint`（`pre`，等宽、`white-space: pre`、可横向滚动）+ `.dsh-dyslexia-hint-line`（行号，`label-secondary`）+ `.dsh-dyslexia-hint-mark`（被拒字符：`state-error-primary` 的 22% 底色 + 下划线）；`i18n.js` 八语言新增 `syntaxAtLine`（`Line {{line}}:` / `第 {{line}} 行：` / …）。检查：夹具新增 10 条（有提示、行号是本语言、显示原文行、有标记、标记是引号本身、引擎英文不上屏、行尾空白标记），浏览器检查 540 → **550**；`verify/check-bundle.mjs` 新增 `a syntax error is pointed at, not parroted`（函数存在、`got` 分支存在、view 传了源码、标记类存在、八语言都带 `{{line}}`），静态 80 → **81**。

## Phase 16: 图没有用满窗口宽度（用户复现后补）

用户贴来一张 13 个类目的 `xychart`，问"渲染出来根本没有把我的窗口宽度用足，柱状图中有一些柱下面的文字就显示不出来了"。实测根因：**引擎给图表类硬编码了绘制宽度**（xychart 700、gantt 700），与容器无关；`figureOptions()` 又从不把容器宽度交给引擎，于是宽窗口下图表仍挤在 700px 里，类目多时引擎只能每隔一个抽掉一批横轴标签。其余图种是内容自适应（宽流程图会画到 2000px 再由 CSS 缩），所以"没用足"只在图表类上看得见。

- [x] T048 把框架的真实宽度交给引擎（图表类），并在框架变宽变窄时重画 per FR-014 / SC-010（本文档新增：图表类按可用宽度绘制）

  实现：`src/client/figure.js` 新增 `figureWidth(host)`（读 `clientWidth` 减去左右 padding，拿不到就返回 0 让引擎自己定）与 `figureChartConfig(width)`（`{ xyChart: { width }, gantt: { useWidth: width } }`，其它图种不读它所以无条件附带），`figureOptions(doc, labels, width)` 在宽度 > 0 时挂上 `config`；`mountFigure` 传 `figureWidth(host)`。`src/client/view.js` 新增 `watchWidth()`：`ResizeObserver` 观察框架，宽度变化 ≥16px 且已挂载时调 `mounted.update(code, figureOptions(doc, labels, next))`——走引擎自己的 `update`，不自己重画、不缩放旧图；teardown 里 disconnect。`verify/check-bundle.mjs` 的 `every drawing the engine swaps in is named again` 从"禁止 ResizeObserver"改成"必须有宽度回写"，并保留"不得自己 requestAnimationFrame 重排"。

- [x] T049 手机宽度下的回归：窄栏与旧行为一致，且没有新的横向滚动 per FR-014 / SC-007

  实现：实测 320/360/390/414px 下引擎本来就把图缩到栏宽（旧行为 342 → 新行为 342），交给引擎的宽度与之相差 ≤ 8px，`scrollWidth` 不增加；`verify/harness/index.html` 新增两条断言（`a phone-width column gets a chart that fits it exactly`、`a chart in a phone column does not add a sideways scroll`），`verify/run-harness.mjs` 的 `EXPECTED_CHECKS` 553 → 555。平板/桌面上旧行为停在 700/800px 的下限被修掉（768px 栏：700 → 750；900px 栏：700 → 882），手机宽度下没有任何变化。
- [x] T050 手机窄栏：读者选择“不动”，作为缩略图使用（决策记录，无代码变更） per FR-014 非目标

  决策：读者在 320–414px 宽度下接受“只画能装下的类目名”（360px 栏实测 2/13），不采用“图宽于框架 + 内部横向滚动”，也不做 SVG 标签旋转（后者要接管引擎渲染，违反宪法“不接管宿主 DOM/样式”的边界）。因此 FR-014 的非目标写明：手机宽度下的标签抽稀是设计如此，后续 Converge 不得把它当缺口。此前实测（320/360/390/414px）新旧行为完全一致（342/342、372/372 等），无回归；宽于 700px 的栏目才使用新增的宽度。

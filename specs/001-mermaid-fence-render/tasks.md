---
description: "Task list for 会话内图形渲染"
---

# Tasks: 会话内图形渲染

**Input**: Design documents from `/specs/001-mermaid-fence-render/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**（历史任务行里的断言名是当时的名字，改名记录见 Phase 24 的 T168）：本功能不引入测试框架（宪法原则 III）。验收 = `verify/check-bundle.mjs` 的 39 项静态断言 + `verify/run-harness.mjs --list` 的 228 项浏览器断言（0.1.9 起 118 项、0.1.10 起 119 项、0.1.11 起 152 项、0.1.12 起 156 项、0.1.13 起 197 项、0.1.14 起 205 项、0.1.15 与 0.1.16 是 213 项、0.1.17 与 0.1.18 是 216 项、0.1.19–0.1.24 是 220 项、0.1.25 是 223 项、0.1.26 是 228 项），外加 `quickstart.md` 证据表里的真机项（见 E-GAPS）。

**Organization**: 按 spec 的用户故事分阶段；每个故事独立可验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可与同阶段其它任务并行（不同文件、无未完成依赖）
- **[Story]**: 对应 spec.md 的 US1–US5
- 所有任务都带确切文件路径

## 路径约定

仓库根 `C:\Users\jiezhengj\Documents\Project\DSH-Dyslexia` 即 npm 包根。Node 用 DSH 自带运行时：
`C:\Users\jiezhengj\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe`。

---

## Phase 1: Setup（共享基础）

**Purpose**: 把交付物的骨架、外部素材与元数据准备到位。

- [x] T001 落地 vendored 渲染引擎：取 `pele@1.13.0` 的 global 构建写入 `vendor/pele/pele.global.js`、其 MIT 许可写入 `vendor/pele/LICENSE`，并在 `THIRD-PARTY-NOTICES.md` 记录包名、版本、许可、来源 URL、取得日期
- [x] T002 写 `package.json`：`name`/`version`/`type`/`main`/`exports`/`dsh.bundle`/`dsh.client`/`files`/`license`，字段与约束逐条对齐 [contracts/plugin-manifest.md](./contracts/plugin-manifest.md)（其中 `engines.dsh` 一项已由 T034 按 FR-013 撤销，最终清单不含任何版本否决字段）
- [x] T003 [P] 写 `cordis.patch.yml`（单条 `insert` 行，`id: dsh-dyslexia`，`name: '@jiezhengj/dsh-dyslexia'`）
- [x] T004 [P] 写 `locale/en.json` 与 `locale/zh.json` 的 `meta.title`/`meta.description`
- [x] T005 [P] 写 `LICENSE`（本项目 MIT）与 `README.md` 骨架（安装、卸载、已知限制留待 Phase 8 补全）

**Checkpoint**: 包形态齐备，`node -e "require('./package.json')"` 之外无需任何运行时。

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 宿主半边、样式基座、构建管线与静态校验——没有这些，任何故事都无法在真机里被观察到。

**⚠️ CRITICAL**: 本阶段完成前不要开始用户故事。

- [x] T006 写宿主半边 `index.js`：`export const name`、`export const inject = ['systemPrompt']`、`apply(ctx)` 内一次 `ctx.systemPrompt.section({ name: 'ui:dsh-dyslexia', order: 9000, text: MERMAID_RENDER_PROMPT })`，文本按 [contracts/host-prompt.md](./contracts/host-prompt.md) 的四件必含 / 五条必不包含写
- [x] T007 [P] 写 `src/client/styles.js`：主题令牌映射（`--dsw-alias-*` → `--pele-*`）与容器样式常量，样式只允许行内或 `dsh-dyslexia-` 前缀，见 [contracts/client-fence-layer.md](./contracts/client-fence-layer.md) 的「样式边界」
- [x] T008 写 `scripts/build-client.mjs`：按固定顺序拼接 头部 `window.__ModuleLoader__.load({ id })` + `require('react')` + `vendor/pele/pele.global.js` + `src/client/{styles,i18n,figure,view,entry}.js` + 尾部导出，产出 `client.js`；只读仓库内文件、不联网、幂等、缺文件时非零退出（依赖 T001、T007）
- [x] T009 [P] 写 `verify/check-bundle.mjs`：实现 [contracts/plugin-manifest.md](./contracts/plugin-manifest.md#可静态校验项verifycheck-bundlemjs-断言) 的 8 条断言，只用 Node 内置模块
- [x] T010 跑通第一次构建 + 静态校验（`scripts/build-client.mjs` → `verify/check-bundle.mjs`），修到全绿；构建产物 `client.js` 提交进仓库
- [x] T011 装进 `desktop` profile 冒烟：`plugin_manager` 的 `install_bundle` 指向仓库根（需 danger-full-access，先向用户报备），确认插件在列表里、中文界面下的标题/描述正确、加载日志无报错（其余 7 种语言的说明页从未在真机上看过，见 T052 与 G13）；随后立即 `remove_bundle` 复原

**Checkpoint**: 宿主提示词段在位、客户端模块可被宿主加载、静态校验可跑——三个用户故事都能被真机观察了。

---

## Phase 3: User Story 1 - 图直接出现在会话里 (P1) 🎯 MVP

**Goal**: 标记为 `mermaid` 的代码块在原位置变成图，可查看源码，失败/流式/超限都退回代码块。

**Independent Test**: 让 Agent 输出含 ` ```mermaid ` 的 flowchart 回答，观察该块位置变成图、会话里不出现新文件、不打开侧栏、消息顺序不变。

### Implementation for User Story 1

- [x] T012 [P] [US1] 写 `src/client/figure.js`：pele 实例生命周期——`mount(el, code, options)`、`refresh()`、`destroy()`、缩放控制；选项含 `autoDirection`、`directionBreakpoint`、`padding`、`maxEdges`、`outputLimit`、`zoom`、`onError`（本条记录**当时的设计**；最终调用面见 `contracts/client-fence-layer.md` 的「引擎调用面」：不传 `onError`、不使用 `refresh()`，生命周期终点只有 `destroy()`）；只接受 `MermaidSource.code`（见 [data-model.md](./data-model.md)）作为输入，不缓存
- [x] T013 [P] [US1] 写 `src/client/view.js` 的层组件骨架：`streaming === true` 直接返回 `children`（消费 `MermaidSource.streaming`）；渲染成功返回图容器 + 源码切换条；失败返回本地化说明 + `children`
- [x] T014 [US1] 写 `src/client/entry.js`：`ctx.slots.inject('conversation.chat.markdown.fence', …)` 注册 `{ name, id: '@jiezhengj/dsh-dyslexia/mermaid', key: 'mermaid', order: 100, locale: 'dyslexia' }`，并 `ctx.locale.register('dyslexia', { zh, en })` 提供全部可见文案（依赖 T013）
- [x] T015 [US1] 接上失败与超限回退：把 pele 的 `error`/超限判定映射为「代码块 + 一行可读原因」，原因文案不得含堆栈（[contracts/client-fence-layer.md](./contracts/client-fence-layer.md) 行为契约 3）
- [x] T016 [US1] 接上「查看源码 / 隐藏源码」按钮：展开的源码块保留 `mermaid` 语言标记、可全选复制（FR-003）
- [ ] T017 [US1] 构建并安装后取证 E1（图直接出现）、E2（多图并存）、E3（查看源码）、E4（语法错误回退）、E5（流式期间不闪烁）、E16（其他代码块不受影响），证据写进交付说明

**Checkpoint**: US1 独立可交付——这就是 MVP。

---

## Phase 4: User Story 2 - 卸载插件后历史仍然可读 (P2)

**Goal**: 卸载/禁用后旧会话里 100% 的 mermaid 块以完整文本呈现，可复制、可检索；模型也不再被告知会渲染。

**Independent Test**: 卸载后重开旧会话，检查旧块是完整文本且 `session_search` 能命中；让 Agent 在卸载态表达结构信息，不产生只有装插件才看得懂的内容。

### Implementation for User Story 2

- [x] T018 [US2] 审计客户端半边与宿主半边：确认没有任何持久化写入（无会话实体、无文件、无索引、无设置项），并把该结论写进 README 的「数据与隐私」一节（对应 [data-model.md](./data-model.md) 的 `Installation` 状态表）
- [ ] T019 [US2] 取证 E10：`remove_bundle` 后重开旧会话，原图位置显示完整代码块、无报错无占位，并用 `session_search` 命中该块文本
- [ ] T020 [US2] 取证 E11（重装后同一旧会话自动恢复渲染，无迁移）与 E15（卸载态新会话不再出现只有装插件才可读的内容）

**Checkpoint**: US1 与 US2 都独立成立——"装了更好看、卸了不丢东西"。

---

## Phase 5: User Story 3 - 手机上读图不加倍费力 (P2)

**Goal**: 360 px 视口下页面无横向溢出，图按容器宽重排，超大图可在图内缩放平移。

**Independent Test**: 以 360 px 宽浏览含图会话，页面无横向滚动；超大图可缩放且不影响会话其余布局。

### Implementation for User Story 3

- [x] T021 [P] [US3] 在 `src/client/figure.js` 加 `ResizeObserver` → `refresh()`，让容器尺寸/字体变化时重排而不重新解析（本条记录**当时的设计**；0.1.10 起插件不再自建 `ResizeObserver`，重排归引擎，见 D22 / T119）（消费 `RenderArtifact.width`/`height`）
- [x] T022 [US3] 落窄屏规则：容器 `max-width: 100%`、溢出在图内滚动（`src/client/styles.js`）；字号下限由绘制选项 `fontSize` 保证（`src/client/figure.js` 的 `figureFontSize`），**不是** CSS；缩放控件只在溢出时出现。（"图内文字不小于正文最小字号"目前无断言，见 E-GAPS）。**0.1.10 起插件不再自建 `ResizeObserver`**（重排归引擎，见 D22 / T119），本条记录的是当时的设计。
- [ ] T023 [US3] 取证 E8（360 px 无横向溢出、图按容器重排）与 E9（触屏/鼠标缩放与复位，不影响其余布局），至少含一张 360 px 截图

**Checkpoint**: US3 独立成立——窄屏不是"挤成一小块"。

---

## Phase 6: User Story 4 - 不装东西、不联网也能用 (P3)

**Goal**: 只在装有 DSH 的机器上装好即见，渲染过程中外部请求为 0。

**Independent Test**: 断网 + 无额外运行时的情况下完成一次完整渲染；网络面板外部请求为 0。

### Implementation for User Story 4

- [x] T024 [US4] 复核 `client.js` 无外部资源引用与无 `fetch`/`XMLHttpRequest`/动态 `import`，把该项纳入 `verify/check-bundle.mjs` 断言（若不满足则修 `scripts/build-client.mjs`）
- [ ] T025 [US4] 取证 E12（断网渲染成功、外部请求 0）与 E13（无 Node/Python/其他工具链的机器上装好即可见）

**Checkpoint**: US4 独立成立——装了就有，不依赖环境。

---

## Phase 7: FR-011 能力播报（模型知道这里会渲染）

**Goal**: 插件启用期间模型知道 mermaid 块会被渲染；停用后该信息一并消失。

**Independent Test**: 启用时新建会话，看模型是否会在合适时自行给出 mermaid；停用后 `--dump-config` 或日志里不再出现该提示词段。

### Implementation for FR-011 (capability briefing, US2)

- [x] T026 [FR-011] 校准 `index.js` 的 `MERMAID_RENDER_PROMPT` 文案：复核四件必含、五条必不包含（尤其不得写"尽量用图"、不得点名图类型、不得规定篇幅），并记录 `order: 9000` 的落位理由
- [ ] T027 [FR-011] 取证：启用态新会话里该段出现在系统提示词中且模型行为合理；禁用/卸载后该段消失（用 `dsh --profile desktop --dump-config` 或会话日志核对）

**Checkpoint**: 五个故事全部独立成立。

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T028 [P] 补全 `README.md`：安装、卸载、验证方法、已验证/未验证/已知不支持三档限制、数据与隐私说明
- [x] T029 [P] 校准 `THIRD-PARTY-NOTICES.md` 与 `LICENSE`：pele 的 MIT 全文、来源与固定版本、我们的 MIT
- [ ] T030 打包复检：`npm pack --dry-run` 核对当前版本的 33 个文件不含 `src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.specify/`、`.tmp/`（清单已核对，断网 tarball 复跑未做，故不勾）
- [ ] T031 汇总证据表（E1–E16）到交付说明，逐条标注已验证 / 未验证 / 已知不支持；未验证项不得写成"应该可以"
- [x] T032 清理 `client.js` 生成物之外的多余产物（不留在仓库根）、确认 `.gitignore` 覆盖 `.tmp/` 与临时 spill 文件

---

## Phase 9: User Story 5 - DSH 升级不会把应用拖到打不开 (P1)（2026-11-22 补记）

**目的**：把"插件最多自己不工作，绝不让宿主打不开"落成要求、设计与可重复的证据。对应 spec 的 US5 与 FR-013～FR-017；设计与依据见 plan.md「兼容性策略」、research.md D15–D19、data-model.md「兼容性降级态」、contracts 的 manifest 第 9–14 项与 client-fence-layer 第 7–11 条。

- [x] T033 复核宿主启动路径，定位"插件能把 DSH 搞成打不开"的确切机制（`dsh-app-boot` 的 `unmetRequirements()` 只看插件自身 `engines.dsh`；`lib/index.js:1811-1812` 启动期 `throw`）→ 写入 research.md D15
- [x] T034 [P] 移除一切版本否决字段：`package.json` 删 `engines`、删 `dsh.client.inject`；`cordis.patch.yml` 与 `files` 不变；写入 contracts/plugin-manifest.md 的字段约束
- [x] T035 [P] 客户端产物自兜：`scripts/build-client.mjs` 产出 IIFE（loader 缺失/抛错、factory 抛错、引擎 IIFE 抛错均降级为空模块），末尾 `new Script(chunk)` 语法检查 → 对应 FR-015
- [x] T036 [P] 服务与注册降级：`entry.js` 的 `inject = ['slots']`、locale 注册失败去 locale 重试、`apply` 三段各自 try/catch、`i18n.js` 对宿主 `t` 的安全包装 → 对应 FR-014
- [x] T037 [P] 渲染期兜底：`view.js` 增加错误边界与围栏数据守卫、`figure.js` 增加引擎缺失守卫 → 对应 FR-016
- [x] T038 主机半边降级：`index.js` 的 `apply` 对缺失/变形 `systemPrompt` 静默跳过（不注册半截段落、不抛错）→ 对应 FR-014
- [x] T039 静态证据：`verify/check-bundle.mjs` 增加六项兼容性断言（"无版本门""可独立编译""畸形加载器不抛""工厂抛错仍可用""含边界与守卫""畸形宿主 ctx 不抛"）→ 对应 FR-017 / SC-008
- [x] T040 渲染期证据：夹具迁入仓库 `verify/harness/index.html` + `node verify/run-harness.mjs`，增加到 76 项（0.1.5 起 82 项，0.1.6 起 92 项，0.1.7 起 101 项，0.1.8 起 108 项，0.1.9 起 118 项，0.1.10 起 119 项，0.1.11 起 152 项，0.1.12 起 156 项，0.1.13 起 197 项、0.1.14 起 205 项、0.1.15 与 0.1.16 是 213 项、0.1.17 起 216 项、0.1.19 起 220 项（历史值按发布时的实跑记录，不追改）；宿主 `t` 抛错/回显 key、`code`/`children` 取值器抛错、引擎抛错、无 slots 服务、坏语法、裁剪板缺失、窄屏、主题）→ 对应 FR-017 / SC-006 / SC-009
- [ ] T041 真机验证 US5：装机后应用正常打开、会话正常、图照常显示（已由 E-LIVE 覆盖一部分）；"畸形宿主"降级只在夹具里复现，真机未注入 → 部分取证
- [ ] T042 宿主升级演练：记录当前版本号，下一次 DSH 升级后检查"能打开、能进会话、历史图回退为文本"，并把结果追加到 evidence

---

## Phase 10: 八种语言、图标、README 与发布（2026-11-22 追加）

用户四项要求（图标照官方风格重做、说明页对齐官方全部界面语言、README 双语索引 + 分语言简介、GitHub 建仓并本机测试）。复核结论：官方界面语言是 **8 种**（zh/en/ja/es/fr/de/ru/pt），不是 9 种。

- [x] T043 `icon.svg` 按官方风格重做（36×36、`fill="none"`、stroke 3、渐变 `#7CB7FF→#145AF3` + `#679EFE` 折线 + `#41E1AC` 描边节点），Chrome headless 逐版对比定稿
- [x] T044 客户端文案扩到 8 语言（现为 12 个键 × 8 种语言，`src/client/i18n.js`）
- [x] T045 `scripts/build-preview.mjs` 生成 `docs/preview.svg`（640×300，含 pele 真实渲染的流程图，可重复生成）
- [x] T046 8 份 `locale/<lang>.json`（title / description / detail 全部本地化）
- [x] T047 8 份 `docs/DETAIL{,.zh,.ja,.es,.fr,.de,.ru,.pt}.md`（各自一行图片 + 该语言 alt）
- [x] T048 `README.md` 索引 + 8 份 `README.<lang>.md`（2026-11-23 由 `readme-writer` 补齐「数据与隐私 / 验证方法 / 已知限制」三节）
- [x] T049 `verify/check-bundle.mjs` 增加发布文件齐全、每种界面语言都有说明页、清单指向 npm 可信仓库等断言
- [x] T050 `package.json` 补 `repository`/`homepage`/`bugs`（E422 的教训），`files` 收进 `docs` 与 `README*.md`
- [x] T051 GitHub 建仓 `https://github.com/jiezhengj/DSH-Dyslexia` 并推送；`.github/workflows/publish.yml` 走 npm trusted publisher（OIDC + provenance）
- [x] T052 重启后的真机取证：插件页**中文**说明与新图标、会话里就地画图、卸载后旧会话回退（`evidence/verification.md` 的 E-LIVE 实际记录了 **4 条观察**——插件页/说明页、会话内成图、卸载回退、重装恢复；取证的版本是 0.1.2）；说明：其余 7 种语言的插件页只由无头夹具证据（E-HARN 的 8 语言循环）支撑，**不是**真机观察；真机的 8 语言说明页从未看过，记在 G13。待处理期间的形式见 `evidence/verification.md` 的 E-LIVE 引言

## Phase 11: 标签回显 key 的修复（2026-11-22 追加，同一 feature 内）

真机发现宿主 `t` 在命名空间未注册时回显 key，界面出现 `copySource`/`figureLabel`。按 SDD 就地补记：FR-008 改写、SC-006 增至 7 类、新增 SC-009、research D20、data-model 增加降级行、contracts 第 8 条改写。

- [x] T053 `translateFor` 加 `isResolved()`：非空、不等于 key、无未替换占位符、非纯空白；不满足一律回落包内 8 语言字典
- [x] T054 静态断言 `host key echo falls back to bundled strings`
- [x] T055 夹具 `a host t that echoes the key still shows words` 与 `no internal key reaches the eye`
- [x] T056 重建、跑全部断言、版本升 0.1.2
- [x] T057 打 `v0.1.2` 标签经 GitHub Actions 发布，从 registry 装回
- [x] T058 重启后核对图名/按钮为可读短语（E-LIVE）

## Phase 12: 独立评审后的修复（2026-11-23 追加）

两个独立评审 agent（文档 / 实现）均判 FAIL：文档多处过期与夸大，代码有 2 条 P1（边界在 `try` 外读 `props.children` 与 `previous.code`；证据不在仓库、不可复现）与十余条 P2。

- [x] T059 `src/client/i18n.js` 重写：12 键 × 8 语言，错误句是各语言完整句子，不含英文技术片段、不含未填占位符
- [x] T060 复制只在 `writeText()` 兑现后显示"已复制"，否则"复制失败"
- [x] T061 失败且无宿主 `children` 时自己渲染源码；`streaming` 用 `Boolean()`；空图类型用本地化的"图"而不是英文 `diagram`
- [x] T062 `FigureBoundary` 的读取全部走 `readLayerInput`/`safeRead`，取值器抛错不再逃出边界
- [x] T063 宿主半边：`section()` 返回 thenable 时兜住 rejection；`warn()` 辅助
- [x] T064 夹具迁入仓库 `verify/harness/`（含 React 18.3.1 UMD 副本）+ `verify/run-harness.mjs`（headless Chrome，失败非零退出）
- [x] T065 `verify/check-bundle.mjs` 增加六项（宿主半边恰好一段、畸形宿主静默、8 语言整句、产物指纹、真实工厂抛错、图像与播报角色）
- [x] T066 发布 workflow 增加：重建 → `git diff --exit-code -- client.js` → check-bundle → run-harness → publish
- [x] T067 `package.json` 加 `scripts`（build/verify/harness/test/prepack），版本升 0.1.3
- [x] T068 文档与证据全量同步（spec/plan/research/data-model/contracts/quickstart/tasks/checklist/evidence）
- [x] T069 打 `v0.1.3` 经 GitHub Actions 发布（run `45043233136`），从 registry 装回 `desktop` profile
- [x] T070 已作废（由 T079 取代），不再单独核对 0.1.3

## Phase 13: 第二轮独立评审后的修复（2026-11-23 追加，版本 0.1.5）

第二轮评审同样两份 FAIL：文档侧 1 条 P0（Status 与 E-GAPS 缺口数不一致、SC-001/SC-003 无断言）+ 多条 P1（证据块跨版本拼装、Phase 10/11 被我改文档时整段截掉、"24 文件"应为 32、夹具名不存在、把宿主半边断言当客户端降级证据、SC 勾选过早）；实现侧无 P0，但有 2 条 P1（证据不可自证、E-LIVE 停留在 0.1.2）与 7 条 P2（无障碍结构、标签拼引擎类型、falsy children、`t` 换身份重挂、规模上限与流式切换无夹具、复制无播报、tooltip 塞英文诊断）。

- [x] T071 `role="img"` 与 `aria-label` 移到 `svg`，外层改 `role="group"`，挂载点 `role="presentation"`（FR-018）
- [x] T072 `figureLabel` 改为各语言纯名词，删除 `figureUntyped` 与 `figureType`（12 键 × 8 语言，字典串 96 条）
- [x] T073 `isRenderableChild()`：`undefined/null/false/''/0` 一律当成"没有宿主内容"，此时自己渲染源码
- [x] T074 `t` 经 `useRef` 读取，layout effect 依赖减为 `[code, streaming, doc, teardown]`；宿主每次新建 `t` 不再重挂绘制、不丢缩放
- [x] T075 复制按钮文案固定"复制源码"，结果写入 `role="status" aria-live="polite"` 的视觉隐藏区域；去掉 `title` 里的英文原始诊断（只进 console）
- [x] T076 `verify/check-bundle.mjs` 新增"图是图像、复制被播报"一项，并让报告行自带 `包名@版本 | 字节数 | 源码指纹`，让任何粘贴的输出自证来自哪棵树
- [x] T077 夹具新增五类用例（超限源码、流式→完成、falsy children、`t` 换身份不重绘、复制播报），无障碍结构另加三项（组名、缩放按钮在图像外、可聚焦）；`verify/run-harness.mjs` 增加 `--list` 以便证据整段引用单次运行
- [x] T078 `spec.md` 增 FR-018 与 SC-010；`contracts/client-fence-layer.md`、`data-model.md`、`research.md`（D22）同步
- [ ] T079 重启 DSH 后做真机核对（图名/按钮/播报/插件页说明/卸载回退）。**0.1.11 至 0.1.28 的发布与安装完成后仍未重启核对**：运行中的界面仍加载旧 chunk；E-LIVE 里能查到的真机观察仍是 **0.1.2**，0.1.7 与 0.1.8 从未在真实宿主里跑过，0.1.9、0.1.10、0.1.11、0.1.12 与 0.1.13 同样如此。
- [ ] T080 再次请两位评审复核（目标 PASS），通过后把 feature 001 标记完成

## Phase 14: 第三轮独立评审后的修复（2026-11-23 追加，版本 0.1.6）

- [x] T081 `view.js` 移除引擎自带的 `aria-roledescription`；`svg` 的 `aria-label` 随界面语言就地更新（依赖 `[figureLabel]` 的 effect，不重挂载）
- [x] T082 复制反馈从"仅读屏可见"改为可见的小号次要文字（`role="status" aria-live="polite"` 保留），按钮文案仍固定为"复制源码"
- [x] T083 夹具补**十项**无障碍断言，分六类（组名、图像名、无 `aria-roledescription`、全图一个 `role="img"`、缩放按钮在图像之外、缩放文案用界面语言且可聚焦；后两类各含多条）→ 82 → 92 项（+10，0.1.9 起 118 项）；删掉已废弃的 `figureUntyped` 泄漏项
- [x] T084 `verify/run-harness.mjs` 汇总行带上 `@jiezhengj/dsh-dyslexia@0.1.6 | client.js 762625 bytes`，E-HARN 块可自证来源
- [x] T085 清理仓库：删掉误提交的 `.tmp-ls.json` 与无引用的 `dsh-visual-ceiling.svg`，`.gitattributes` 加 `*.md text eol=lf`，把 `README.md`/`README.en.md` 的 CRLF 规范化为 LF
- [x] T086 文档同步到 0.1.6：`plan.md` 行数改实测（842 行客户端代码 / 147 构建 / 519 静态校验 / 582 夹具 / 122 驱动——这是 **0.1.6 时**的实测值，0.1.8 已增至 978 / 147 / 558 / 739 / 122）、`role="img"`、E-GAPS 重写为 G1–G12、`tasks.md` 状态表重写、i18n 键数 12、README 计数 9、`contracts/plugin-manifest.md` 与 `quickstart.md` 示例改 0.1.6、32 个随包文件（33 个打包文件含 `package.json`）
- [x] T087 `package.json` 升 0.1.6，重建并跑 `check-bundle`（31 项）与 `run-harness`（92 项）
- [x] T088 打 `v0.1.6` 经 GitHub Actions 发布（run `45050133828`，shasum `8a0a2425c87d7b864b6d6089500bae6a12fe9637`），从 registry 装回 `desktop` profile（依赖 `"0.1.6"`，安装件与仓库逐字节相同）
- [ ] T089 第四轮双评审（文档 + 实现）复核；通过后把 feature 001 标记完成。**第四轮结论：两份都 FAIL**（见 `evidence/verification.md` 末尾与 Phase 15）

## Phase 15: 第四轮独立评审后的修复（2026-11-23 追加，版本 0.1.7）

- [x] T090 `view.js` 的 `isRenderableChild` 改为白名单（元素 / 字符串 / 数字 / 全由这些组成的数组），否则一律当"宿主没给内容"：普通对象、函数、含对象的数组会让 React 抛 `#31`，而这个抛错发生在边界自己的 render 里，边界接不住，整条消息会消失
- [x] T091 流式且无宿主块、失败且宿主块不可用时，改为自绘 `<pre><code>` 源码，屏幕不再出现空块
- [x] T092 `ResizeObserver` 的构造与 `observe` 一并放进 `try`：缺该构造函数的宿主只失去"随宽度重排"，不会失去一次渲染（本条记录**当时的设计**；0.1.10 起插件不再自建尺寸监听，见 T119）
- [x] T093 `ensureFigureStyles` 返回自己注入的 `<style>`，`apply` 用 `ctx.effect(() => drop)` 在停用时移除（注意 `ctx.effect(setup)` 把返回值当清理函数，把清理函数当 setup 传会立刻执行）
- [x] T094 夹具补 9 项：对象 `children`、函数 `children`、失败图 + 对象 `children`、含对象的数组 `children`（各断言"消息不为空"且"没有 React #31"）、流式无宿主块仍显示源码、以及图像名/无英文 role description/全图唯一图像三项 → 92 → 101 项
- [x] T095 文档更正：证据版本口径（0.1.5 → 0.1.7）、E-LIVE 的缺口绑定到 0.1.7、G5 改成"E2/E16 无夹具无观察"、E15 编号纠正、FR-016/FR-018 补齐断言名、plan 与 research 的实测行数（客户端 842 / 夹具 582 / 驱动 122）、T040 与 T083 的项数历史（76 → 82 → 92 → 101）、T088 勾选、T070 标作废、删掉多余围栏
- [x] T096 打 `v0.1.7` 发布并从 registry 装回 `desktop` profile —— 已完成：run `45052680467`，provenance logIndex `4047274153`，shasum `935b05b457e8756ab8b45593252ab44594def0e1`；`install_bundle` 装成 `0.1.7`，profile 依赖 `"0.1.7"`，安装副本 765002 字节、SHA256 `4DD2F68573DD7943CC1130488477A9B88F5045EE32BB8739C1AA8A6CFA3972B6` 与仓库一致
- [ ] T097 第五轮双评审复核；通过后把 feature 001 标记完成

## Phase 16: 第五轮独立评审后的修复（2026-11-23 追加，版本 0.1.8）

**目的**：第五轮评审找到三条真缺陷——重排版后图形失去 `role="img"` 与本地化名称（并回流英文 `aria-roledescription`）、`children` 为 iterable 或自身抛错时能把整条消息变空白、切换界面语言后缩放按钮不跟随。全部修掉并补测试与文档。

- [x] T098 标注抽成 `labelFigure(host, translate)`：`role="img"`、本地化 `aria-label`、删 `aria-roledescription`、缩放按钮 `aria-label`/`title`，挂载后、每次重排版后、以及 `MutationObserver` 看到绘图节点被换掉时各调一次 → FR-018 / SC-010
- [x] T099 `isRenderableChild` 真正白名单化：只放行 React 收的形状（元素、非空字符串、非零数字、逐项检查过的数组），iterable 不再放行 → FR-016
- [x] T100 宿主块渲染包进 `SafeChildren` 边界：宿主块自己抛错时降级为源码文本，绝不二次抛出（二次抛出会逃出图片边界、让消息空白） → FR-016
- [x] T101 `i18n.js` 的内置字典改为**每次调用按当前界面语言取表**（原先在创建时捕获），语言切换后图名、按钮、缩放控件同时跟随 → FR-008 / FR-018
- [x] T102 夹具 +7 项：重排版后仍命名（800px→220px）、iterable `children`、自身抛错的宿主块、注入抛错的 `inject` 宿主、缩放按钮随语言切换等 → 101 → 108 项（后续 T108/T112/T115 又加到 118）
- [x] T103 `check-bundle` +2 项：`a re-laid-out drawing is named again, not just at mount`、`a host block that throws cannot empty the message` → 34 项全过（当时；0.1.9 起 36 项）
- [x] T104 文档更正（第五轮评审逐条）：`inject` 抛错确有夹具、92/101 → 109 项（0.1.9 起 118 项）、行数、畸形宿主"5 种静默 + 2 次异常"不再混用、G5 的 E15 定义、T052 的观察条数、`data-model` 的断言指向、`Mounted.result.type` 不进入 `aria-label` → 见 Phase 16 本条
- [x] T105 打 `v0.1.8`（提交 `603a75d`）、GitHub Actions run `45055683813` success（provenance logIndex `4047584418`、tarball shasum `30408a56f8e3d3054e7ace7feafa0fbde8e676b6`、`total files: 33`）、CI 与本机同为 34 项静态 + 108 项浏览器；`remove_bundle` 卸 0.1.7 → `install_bundle @jiezhengj/dsh-dyslexia@0.1.8` applied，profile 依赖 `"0.1.8"`，安装副本 `client.js` 768340 字节 / SHA256 `E632EA8E7E5ECC1DA705B69298859D6E35BBE6E863BA0E00D2F6824ACC481755` 与仓库根一致

## Phase 17: 第六轮独立评审（2026-11-23）

- [ ] T106 第六轮双评审（文档 + 实现）复核 0.1.8；通过后把 feature 001 标记完成并回写 `spec.md` 的 Status

## Phase 18: 第六轮独立评审后的修复（2026-11-23 追加，版本 0.1.9）

**目的**：第六轮文档评审给出两个 P0——"未取证项全在 E-GAPS"的声明不成立（FR-012 无任何承接）、把 0.1.6 时 92 项的运行记成 108 项；另有若干断言名不存在、计数口径三套。本阶段把两条缺口补成真断言（而不是继续挂在 E-GAPS 上），并把 README 里"偏好写进 `AGENTS.md`"的措辞删掉——那与"装好即生效、不需要改任何指令文件"矛盾。

- [x] T107 `check-bundle` +1 项 `nothing in the package asks you to edit an instruction file`：17 个随包文本文件不得出现 `AGENTS.md`/`CLAUDE.md`/`.cursorrules`，`client.js` 与 `index.js` 也不读写它们 → FR-012（36 项）
- [x] T108 夹具 +1 项 `a picture that fits offers no zoom buttons`：小图不渲染引擎缩放控件，与"超宽图有 3 个"配对 → FR-018 的条件渲染（109 项，0.1.9 起 118 项）
- [x] T109 9 份 README 的设计说明把"偏好写在自己的 `AGENTS.md`"改为"装好即生效，不需要改任何指令文件"（与 T107 的断言一致）
- [x] T110 第六轮文档评审逐条：T087 的 `run-harness` 92 项（不是 108）、`evidence` 头版本 0.1.9、`plan.md` 的 108/34 口径、`quickstart` 的 34 项与发布示例占位符、`contracts/client-fence-layer.md` 的 `a host that rejects the locale option does not break apply` / `the retried registration drops the locale option`、`contracts/plugin-manifest.md` 的 `apply stays silent on a changed host` 与"七种"、T079/quickstart 的 0.1.8、`research.md` 的 7 组与"739 行夹具 + 122 行驱动"、`checklists` 的 SC-009～SC-010、G4 行口径
- [x] T112 夹具把"重排版后重新标注"改成**会失败**的检查（第六轮实现评审 P0：原用例在无头夹具里根本没换 `<svg>`，删掉修复仍全绿）：新增"夹具确实换掉了绘图节点"与"换掉的绘图被重新命名"，并保留"重排版后仍命名"；探针验证——把两处 `labelFigure(host, translateRef.current)` 全换成 `void 0` 后这三条变红（`graphics-document document|null|roledesc=flowchart`），恢复后全绿（0.1.10 起改为"引擎换掉节点后重新命名"，本条记录当时的设计，见 T119）
- [x] T113 `src/client/view.js` 用 `requestAnimationFrame` 推迟 ReObserver 回调里的 `refresh()` 与重标注，消除真实重排版时宿主控制台的 `ResizeObserver loop completed with undelivered notifications.`（0.1.10 起不再使用 `requestAnimationFrame` 与 `refresh()`，本条记录当时的设计，见 T119）
- [x] T114 证据里写明 `role="img"` 的取舍：图有了名字与类型无关的标签，但图内节点文字对读屏不可达，可读文本走"查看源码"面板
- [x] T115 夹具的假 `ctx` 按 cordis 语义收集 disposer，并断言卸载后 `<style id="dsh-dyslexia-figure-style">` 消失、层与 locale 注销被调用
- [x] T116 `check-bundle` +1 项 `the fixtures assert what the fixes promise, and can fail`：把评审证明"恒真"的那几条断言名（换节点、重命名、缩放条件渲染、卸载清理）逐一要求存在于夹具里，防止有人删掉夹具而代码检查仍绿 → 36 项
- [x] T117 卸载清理的证据：夹具的假 `ctx` 按 cordis 语义执行 disposer，断言卸载后样式表消失、locale 注销与层注销各被调用一次；探针验证——把 `entry.js` 的 `ctx.effect(() => drop, …)` 换成 `void drop` 后这两条变红
- [x] T111 打 `v0.1.9`（提交 `eddad24`）、发布并从 registry 装回 —— GitHub Actions run `45059529254` success（provenance logIndex `4047793870`、tarball shasum `71feabc22885e097974a35668e4717837fefd226`、`total files: 33`）；`remove_bundle` 卸 0.1.8 → `install_bundle @jiezhengj/dsh-dyslexia@0.1.9` applied，profile 依赖 `"0.1.9"`，安装副本 `client.js` 769,386 字节 / SHA256 `DAD0A3334BB557C77E8B0C9E1183C654980F86A5B3A783134F888C422A3067A8` 与仓库根一致；第七轮双评审进行中

## Phase 19: 第七轮独立评审后的修复（2026-11-23 追加，版本 0.1.10）

**目的**：第七轮实现评审给出一个 P1——`a resized drawing stays named` 在无头夹具里**恒真**（首帧后无头 Chrome 不再派发帧与 ResizeObserver 通知，舞台改宽 220px 后 `svg` 仍是 695px；断言真正看到的是夹具自己造的替身节点），而 `evidence`、`spec.md` 的 FR-018/SC-010 都把它当成"重排版后仍成立"的证据。文档评审同时指出 G13 与敌意 `ctx` 数量口径不一致。

- [x] T119 删掉插件自带的重排版路径：`src/client/view.js` 移除 `scheduleFrame`/`frameRef`/`observerRef`/整段 `ResizeObserver` 与 `requestAnimationFrame`，重排版交给引擎自己的尺寸观察（D22）
- [x] T120 外层 `div.dsh-dyslexia-group` 去掉 `aria-label`（名字只由 `svg` 提供，避免读屏念两遍）；`labelFigure()` 仍负责 `role="img"`、本地化名称、删 `aria-roledescription`、重写缩放按钮文案
- [x] T121 夹具删掉恒真的 `a resized drawing stays named`，改为"收窄舞台后再按引擎方式换节点"：`the fixture replaced the drawing again after the column narrowed` + `a drawing swapped after a width change is named again`；`the group carries the localised name` → `the box around the picture carries no name of its own`（118 → 119 项）
- [x] T122 静态断言 `a re-laid-out drawing is named again, not just at mount` 重写为 `every drawing the engine swaps in is named again`：要求 `MutationObserver`/`watcher.observe(host, { childList: true })`/`labelFigure(host, translateRef.current)` 存在，且**禁止** `new ResizeObserver` 与 `requestAnimationFrame` 出现
- [x] T123 探针复验：删掉整块 `MutationObserver` → `run-harness: 2 failed, 117 passed`（两条命名断言报 `graphics-document document|null|roledesc=flowchart`）、静态 `a swapped drawing node is not watched for`；还原后 36/119 全绿
- [x] T124 `evidence/verification.md`：E-BLD/E-CHK/E-HARN 用 0.1.10 单次运行快照整段重写；新增 **E-PROBE**（四次真跑探针：删观察器、`void drop`、0.1.8 的 `void 0`、字号 200）；E-GAPS 扩到 14 项并新增 **G14**（真实窗口缩放时引擎重绘只有机制级证据）
- [x] T125 `spec.md`：Status 改 `0.1.10`；FR-018 改为"重排版归引擎，插件的保证是不论谁换掉图名字都会回来"；SC-010 改为"首挂之后与节点被换掉之后各断言一次；容器自身不带名字"
- [x] T126 `contracts/client-fence-layer.md` 第 5 条改为"断开自己的 `MutationObserver`，不另建 `ResizeObserver`、不 `requestAnimationFrame`"；`data-model.md` 的可访问性字段改为"名字只落在 `svg` 上"
- [x] T127 `plan.md`/`research.md`/`quickstart.md`/`contracts/plugin-manifest.md` 的计数与行数改 36/119、0.1.10、D22 修订
- [x] T128 打 `v0.1.10`（提交 `926d072`）、GitHub Actions run `45062588313` success（CI 36 项静态 + 119 项浏览器、shasum `cff93a6b81b34057d733797834b4549afbd92816`、logIndex `4047938866`、33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.10"`，安装副本 767,298 字节、SHA256 `3D860D24…D0E9` 与仓库一致）→ E-PUB/E-INS 已补 0.1.10 行
- [x] T129 第八轮双评审（文档 + 实现）——两份都判 **FAIL**（无 P0；P1 是夹具里一条同义反复与三条无断言行为），结论与修复见 Phase 20

## Phase 20: 第八轮独立评审后的修复（2026-11-23 追加，版本 0.1.11）

**目的**：第八轮实现评审给出一个 P1——`a throwing children getter does not reach the host` 是同义反复（React 18 在 `createRoot().render()` 之后才渲染，`childrenThrew` 恒为 `null`），而"源码块保留 `mermaid` 语言标记""`aria-expanded` 翻转""挂载点 `role="presentation"`"三条行为完全没有断言；文档评审另给 13 条数字与口径缺陷。本阶段让每个断言都能被自己的失效探针打红。

- [x] T130 `src/client/view.js`：`readLayerInput` 读取 `lang`（`DEFAULT_FENCE_LANGUAGE = 'mermaid'`），展开的源码块渲染为 `<code className="language-mermaid">`，让 T016 与 `contracts/client-fence-layer.md` 的说法成立
- [x] T131 `verify/harness/index.html`：children-getter 用例改为看结果——`a throwing children getter leaves the source`（断言舞台上出现源码文本），并注明"没有抛到宿主"这一条在 React 异步渲染下本身不构成证据
- [x] T132 夹具每种语言各加四条：`the source toggle starts collapsed`、`the source toggle announces itself as expanded`（`aria-expanded` 由 `false` 变 `true`）、`the expanded source keeps its fence language`（`code.className` 含 `language-mermaid`）、`the mount point is presentational`（`[role="presentation"]` 存在）→ 119 → 152 项
- [x] T133 探针复验：删掉 `safeRead` 的 `try/catch` → 整条消息变成空串（FR-016 要防的现象），新断言与 `a throwing code getter leaves the host block` 一起变红；还原后 36/152 全绿
- [x] T134 `src/client/figure.js` 注释改为"引擎英文只进 console 与调用方日志；读者只看到那一句完整句子"（删掉从未实现的 tooltip 说法）
- [x] T135 文档按第八轮文档评审逐条改：`data-model.md` 生命周期改为"重排归引擎"、外层 group 不带名字；`plan.md:19/43/111` 的 152 项与"不另建 ResizeObserver"；`research.md` 夹具行数 880 + 122 = 1002；`quickstart.md` 的 152 项与本版复核版本；`checklists/requirements.md` 的 SC-006 证据描述（4 类浏览器夹具 + 2 类 vm）；`evidence/verification.md` 的头版本 0.1.11、`[ja] a picture is drawn` 真名、G5 的夹具项数、G13 的版本范围 0.1.3–0.1.11、FR-002 行删掉"不写文件"
- [x] T136 打 `v0.1.11`（提交 `6eebdb5`）→ GitHub Actions run `45065089410` success（CI 36 项静态 + 152 项浏览器、shasum `7c6d33570ed12ec709effb09349b247db4754655`、logIndex `4048037334`、33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.11"`、安装副本 767,643 字节、SHA256 `FED8A871…9199` 与仓库一致、`locale/` 8、`docs/` 9）→ E-PUB/E-INS 已补 0.1.11 行
- [ ] T137 第九轮双评审（文档 + 实现），目标 PASS

## Phase 21: 第九轮独立评审后的修复（2026-11-23 追加，版本 0.1.12）

**目的**：第九轮两份评审都判 FAIL，但产品代码没有 P0/P1——问题全在**证据层**：两条断言在旧形态下恒真（`lang` 只测默认值、`FIGURE_CSS` 清空后四条布局断言仍绿），另有一批计数、版本口径与实现细节写错。

- [x] T139 夹具 +4 项：`the source block keeps the language the host sent`（传 `lang: 'mmd'`，点开源码断言 `language-mmd`）、`the picture box is capped to the column`（`max-width === '100%'`）、`the picture box counts its own padding`（`box-sizing === 'border-box'`）、`a wide picture scrolls inside its own box`（`overflow-x === 'auto'`）→ 152 → 156 项（FR-015 / SC-003）
- [x] T140 缩放可达性判据改成真实可见性（`disabled !== true && offsetParent !== null && getClientRects().length > 0`），断言改名 `every zoom button in reach can take the keyboard`；`makeContext` 的 `slots.register` disposer 真的从 `defs` 里删，断言改为 `the fence layer is gone once the host disposes`——不再用两份簿记互相印证（FR-018 / FR-013）
- [x] T141 `check-bundle` 的 `needed` 名单扩到 12 条（含 P5/PA/PB/PC 的断言名），并新增"每个守护名必须落在带条件的 `expect(` 里"的检查，掏空断言体会红（FR-017）
- [x] T142 三条破坏性探针在 `%TEMP%` 的仓库副本上做（PA 硬编码 `lang`、PB 清空 `FIGURE_CSS`、PC 让 disposer 不删 `defs`），全部被抓红，记录进 `evidence/verification.md` 的 E-PROBE（FR-017）
- [x] T143 0.1.12 文档逐条：E-LIVE/E-GAPS 的版本口径、G13 与 G14 的顺序、`contracts/client-fence-layer.md` 的引擎调用面表按实现重写（不再声称调用 `refresh()`）、`research.md` 的 D11 标注被 D22 取代 / D19 ⑦ 归属 / D22 的"可见小字"、`checklists` 的 SC-006 四类夹具名、`plan.md`/`quickstart.md`/`contracts/plugin-manifest.md` 的 156 项与 0.1.12
- [x] T144 打 `v0.1.12`（提交 `8a223d7`）→ GitHub Actions run `45067949499` success（CI 36 项静态 + 156 项浏览器、shasum `2cae4ca880ddb5401dec6faed1492e1f1622d9f8`、logIndex `4048231715`、33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.12"`，安装副本 767,639 字节、SHA256 `65BA5EDA…EC87` 与仓库一致）→ E-PUB/E-INS 已补 0.1.12 行
- [x] T145 第十轮独立评审（文档 + 实现）已跑：实现 PASS、文档 FAIL，缺陷见 Phase 22

## Phase 22: 第十轮独立评审后的修复（2026-11-23 追加，版本 0.1.13）

**目的**：第十轮实现评审 PASS，但留下 6 条 P2 证据强度缺陷；文档评审 FAIL，P1 全是"文档引用了不存在或已改名的断言"与"把某个版本的观察说成通用事实"。这一轮把**检查项本身**也钉死：两套套件各自记录期望条目数，删一条断言就红。

- [x] T146 `verify/check-bundle.mjs` 网络 token 表补 `sendBeacon`、`new Image(`、`new Worker(`、`WebTransport`（FR-005）
- [x] T147 宿主半边的加载与 `apply` 收进 `try/catch` 并写成一条 ok/FAIL 行（原先在 `check()` 之外，抛错只有堆栈）；两条依赖它的检查加 `assert(hostModule !== null, …)`（FR-011 / FR-014）
- [x] T148 静态套件钉死 `EXPECTED_CHECKS = 37`：删掉任一条 `check()` 时输出 `[FAIL] the suite has 36 checks, expected 37` 并 exit 1（探针 P7）
- [x] T149 夹具套件钉死 `EXPECTED_CHECKS = 197`，`run-harness.mjs` 报 `suite reported N checks, expected 197`；汇总行补 `sources sha256`（探针 P6）
- [x] T150 夹具 8 语言全部补齐期望值（`EXACT` 表含 name/show/copy/hidden/copied/failed），每语言断言图名、两个按钮文案、复制播报文案与可见性；新增 `every interface language has expectations`（FR-008 / SC-009 / SC-010）
- [x] T151 窄屏段加可证伪对照（临时插入 4000px 的 `data-probe="overflow"` 元素让测量必须看到溢出，再移除），证明"宽度测量"本身有效（SC-003）
- [x] T152 多栅栏与正文共存的夹具（`two fences draw two pictures`、`the second fence draws its own picture`、`the prose around a picture is left alone`、`the picture and the prose keep their order`）→ 承接 FR-001，并补上 G5 里 E2 的缺口
- [x] T153 0.1.13 文档逐条：E-LIVE 去掉不存在的 `E-LIVE-2/5/6` 编号、CI 日志比较改成逐版本口径、G13 只保留 0.1.2 真看到的四件事、E-PROBE 补 P6/P7 与十次探针口径、`contracts/client-fence-layer.md` 的 `the fence layer is gone once the host disposes`、`checklists` 的 SC-006 四类夹具名、`plan.md`/`quickstart.md`/`research.md`/`contracts/plugin-manifest.md` 的 37/197 与行数
- [x] T154 打 `v0.1.13`（提交 `e757f92`）→ GitHub Actions run `45071920218` success（CI 37 项静态 + 197 项浏览器、shasum `37da6a6b834f178aca04f91884c7f7f779e91417`、logIndex `4048415674`、33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.13"`，安装副本 767,639 字节、SHA256 `0FF12628…D333` 与仓库一致、`locale/` 8、`docs/` 9）→ E-PUB/E-INS 已补 0.1.13 行
- [ ] T155 第十一轮独立评审（文档 + 实现），两份都 PASS 才把 feature 001 标记完成

## Phase 23: 第十一轮实现评审后的修复（2026-11-23 追加，版本 0.1.14）

**目的**：第十一轮实现评审 PASS，但列出 8 条 P2。其中三条是真实可复现的观感/健壮性缺口（源码面板与失败回退同时展示同一份源码、复制结果跨源码残留、边界自身 render 里读 props 仍在 try 外），其余是断言强度与证据措辞。这一轮把能修的都修成有断言的行为。

- [x] T156 `src/client/view.js`：源码更换时折叠源码面板并清空复制结果（`React.useEffect(() => { setShowSource(false); setCopyState('idle'); … }, [code])`），失败态不再渲染源码面板（`showSource && !failed`）——同一份源码不会以"面板 + 宿主块"两种形态并排出现（P2-1 / P2-8）
- [x] T157 `src/client/view.js`：`FigureBoundary.render` 把 `readLayerInput(this.props)` 包进 `try`，读抛错时用仍可读的 `code` 渲染 `sourceFallback`，否则返回 `null`——边界自己的 render 不再有能把整条消息掀掉的读操作（P2-2）
- [x] T158 `src/client/entry.js`：宿主没有 `ctx.effect` 时，下一次 `apply` 回收上一次留下的 `<style>`（`unownedStyle`），最多留一份而不是每次一份（P2-7）
- [x] T159 `verify/check-bundle.mjs`：`an engine that fails to load leaves the picture to the host` 增加 `typeof pele.mount !== 'function'` 断言——删掉引擎守卫这条检查就会红（P2-3）
- [x] T160 `verify/harness/index.html` 新增 8 项：`every zoom button is reachable once the picture is zoomed`、`a source swapped for a broken one is shown once, not twice`、`a copy answer does not outlive the source it described`、`a fence whose props read throws is left to the host, not the message`、`a host without effects keeps one stylesheet, not one per apply` 等 → 197 → 205 项（P2-1/P2-2/P2-5/P2-7/P2-8）
- [x] T161 `verify/run-harness.mjs` 钉数改 `EXPECTED_CHECKS = 205`；`check-bundle` 的 `needed` 名单扩到 19 条（新断言被删会红）
- [x] T162 0.1.14 文档逐条：`spec.md` Status、`plan.md`/`quickstart.md`/`contracts/plugin-manifest.md` 的 37/205 与行数、`evidence/verification.md` 的 E-BLD/E-CHK/E-HARN 重生成、E-PROBE 补一次探针（累计十四次）、E-GAPS 增 G16（`outputLimit`/`maxEdges` 无用例；"引擎换掉节点后重命名"只有夹具重放；vendor 许可注释里的 `https://github.com/obsidianmd/pele` 属允许的静态文本）
- [x] T163 打 `v0.1.14`（提交 `1599245`）→ GitHub Actions run `45074961635` success（CI 37 项静态 / 205 项浏览器，shasum `7a5c2fff3ee9e3408d59506d6a1e8e235db8a59f`，provenance logIndex `4048513739`，33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.14"`，安装副本 769,771 字节、SHA256 `F7C599EF…C6C9A` 与仓库根逐字节相同，`locale/` 8、`docs/` 9、包内 `0.1.14`）→ E-PUB/E-INS 补 0.1.14 行
- [ ] T164 第十二轮双评审（文档 + 实现），两份都 PASS 才把 feature 001 标记完成

## Phase 24: 第十二轮双评审后的修复（2026-11-23 追加，版本 0.1.15）

- [x] T165 夹具：`EXACT.fr.failed` 改成 i18n 的真实句子（`Échec de la copie`，此前是 `Impossible de copier` 且从未被引用）
- [x] T166 夹具：语言循环里新增 `[lang] a refused clipboard says so`——`navigator.clipboard.writeText` 改成 reject 后点复制，断言状态区等于该语言的失败句（8 语言各一条，循环体位置见 `verify/harness/index.html`）
- [x] T167 `src/client/entry.js`：删掉无 `ctx.effect` 时的 `unownedStyle` 回收分支——`ensureFigureStyles` 已按 id 复用，那条分支永远不可达也无断言保护（探针 L：改成 `if (false)` 两套仍全绿）
- [x] T168 `verify/check-bundle.mjs`：`every published file exists` 改名为 `the required published files exist`，细节改成 "24 required of the 33 packed files"，不再让检查名暗示覆盖全部 33 个
- [x] T169 `verify/run-harness.mjs`：`EXPECTED_CHECKS = 213`
- [x] T170 文档：`spec.md` Status（0.1.15、G1–G16、删掉自相矛盾的"本行不重复计数"）、`tasks.md` T052/T075/T162 措辞、状态表 G5 行（E2 已有夹具）与 G15/G16 去重并排序、`T079` 口径、`evidence` 的 G5 计数、G13 版本区间、E-LIVE 区间、E-PROBE 表头说明与 PT1 行、E-CHK 的 stderr 说明、`plan.md`/`quickstart.md`/`research.md`/`contracts/*` 的 213 与行数
- [x] T171 `contracts/plugin-manifest.md`：样例 `package.json` 补 `prepack`，并注明 `repository`/`homepage`/`bugs`/`publishConfig`/`keywords` 与根清单同形（provenance 的 `E422` 依据）
- [x] T172 改正 T162 里写错的 `spec.md` Status 与探针次数口径（当时写 0.1.13、"第十一次探针"，实际 0.1.15 与十四次）
- [x] T173 打 `v0.1.15`（提交 `8633ead`）→ GitHub Actions run `45077593236` success（CI 37 项静态 / 213 项浏览器，shasum `5fbef04ff91abd350983df0349386f13df8e2a27`，provenance logIndex `4048568677`，33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.15"`，安装副本 769,391 字节、SHA256 `481C6859…BDF0A` 与仓库根逐字节相同，`locale/` 8、`docs/` 9、包内 `0.1.15`）→ E-PUB/E-INS 补 0.1.15 行
- [ ] T174 第十三轮双评审（文档 + 实现），两份都 PASS 才把 feature 001 标记完成

## Phase 25: 第十三轮文档评审后的修复（2026-11-23 追加，版本 0.1.16）

- [x] T175 `tasks.md` 的 P0/P1：T052 改成"插件页**中文**说明与新图标"，并写明其余 7 种语言的插件页只由无头夹具支撑、不是真机观察；G5 行改成"E2 自 0.1.13 起有夹具；E16 与其他非 mermaid 代码块既无夹具也无真机观察；E15 无观察"
- [x] T176 探针次数统一：T162 的"第十一次"改成"累计十四次"，T172 的"十三次"改成"十四次"，与 `evidence/verification.md` 的 E-PROBE 行数一致（当时十四行；0.1.17 增 PS1 后为十五行）
- [x] T177 `contracts/plugin-manifest.md`：`every published file exists` → `the required published files exist`（并注明报告串 `24 required of the 33 packed files`）；`keywords` 与 `publishConfig` 改成与仓库根 `package.json` 逐项相同（`publishConfig` 只有 `access` 与 `registry`，provenance 由 CI 的 `--provenance` 传入）
- [x] T178 README：`README.zh.md` 的"验证了八种界面语言"补"（在无头测试环境里；插件 `0.1.2` 的真机验证只覆盖中文说明页）"；`README.md` 的"8 接口语言"改"8 种界面语言"
- [x] T179 `evidence/verification.md` 的 P2：G16 去掉与 G15 重复的规模上限、只留 vendor 文本与"无头环境只能夹具重放"；E-LIVE 引言"不能自动转移到 `0.1.14`"改 `0.1.15`；0.1.12 本地 `--list` 块标明是**节选**；E-PUB 表 0.1.3/0.1.4 的 logIndex 由 `—` 改"未记录"并加脚注说明 `—` 的含义
- [x] T180 措辞统一（"偏好"不是使用前提，FR-012）：`spec.md`、`plan.md`、`research.md`（D19 ⑦ 的七组枚举与 `quickstart.md` 的 E-COMP-1 对齐）、`contracts/host-prompt.md` 四处；`quickstart.md` 的 E-COMP 标题补 SC-009、E-COMP-5 的"真机装/重启"改"真机装卸"
- [x] T181 `verify/check-bundle.mjs` 的报告串改 `five silent hosts, two throwing sections`（实际跑 5 次静默 + 2 次抛错），并同步证据里的 E-CHK 行
- [x] T182 重建与复跑：`node verify/check-bundle.mjs` = `@0.1.16 | 769391 bytes | sources sha256:f837913297259c0f99bc780f154d287a | all 37 checks passed`；`node verify/run-harness.mjs --list` = 213 项全过；`evidence/verification.md` 的 E-BLD/E-CHK/E-HARN 用同一次运行重写
- [x] T183 发布 `v0.1.16`（run `45079253651`，shasum `4a559a0cd107e2dd2175b2d2ff10e3075a53e309`，logIndex `4048629730`，33 文件）、从 registry 装回 profile `desktop`（依赖 `0.1.16`、安装副本 769,391 字节 / `9A5ADC5B…BB3D`）、补 E-PUB/E-INS 的 0.1.16 行
- [ ] T184 第十四轮双评审（文档 + 实现）；两份都 PASS 才把 feature 001 标记完成（实现侧 PASS、文档侧 FAIL，故本轮未完）

## Phase 26: 第十三轮实现评审的 P3 收口（2026-11-23 追加，版本 0.1.17）

- [x] T185 夹具补两条把"源码一换就收起面板"变成可证伪行为：`a new fence closes a panel the reader opened for the old one`（先打开面板，再用另一段**有效**源码替换，断言 `.dsh-dyslexia-source` 计数为 0）与 `the new fence offers the panel closed, not open`（`aria-expanded === 'false'`）；新增常量 `NEXT_CODE = 'flowchart TD\n  X[Second] --> Y[Drawing]'`
- [x] T186 探针 PS1（`%TEMP%\r16-probe` 副本）：只删 `setShowSource(false)` → 上述两条变红（`panels=1`、`true`），`run-harness: 2 failed, 214 passed`，exit 1；0.1.17 之前删这一行没有任何断言变红（第十三轮实现评审 P3-7 的覆盖缺口）
- [x] T187 `verify/check-bundle.mjs` 的 `the required published files exist` 不再把打包总数写死：返回 `${required.length} required files`（原为 `24 required of the 33 packed files`——打包总数写死在报告串里；复跑确认：往 `files` 加一个条目后报告串仍为 `24 required files`，说明这个数字现在是派生的，不再是写死的 33）；`needed` 名单补两条新断言名
- [x] T188 `verify/run-harness.mjs` 的 `EXPECTED_CHECKS` 由 213 改 216（新增三条：两条面板断言 + 既有 `the opened panel is on screen before the source changes` 已计入）
- [x] T189 文档计数与行数：`plan.md`（216、`check-bundle.mjs` 663 行、`harness/index.html` 1163 行）、`quickstart.md`、`research.md`（1163 + 131 = 1294）、`contracts/plugin-manifest.md`、`evidence/verification.md`（E-BLD/E-CHK/E-HARN 用 0.1.17 单次运行重写、E-PROBE 增 PS1 并把项数口径补到 0.1.17 = 216）
- [x] T190 发布 `v0.1.17`（run `45079768869`，shasum `e7db974d5fe519d9d454b9a5807ce7d49f943955`，logIndex `4048647791`，33 文件）、从 registry 装回 profile `desktop`（依赖 `0.1.17`、安装副本 769,391 字节 / `2FE079ED…B43B`）、补 E-PUB/E-INS 的 0.1.17 行
- [ ] T191 第十四轮双评审（文档侧 FAIL 收口后再确认；两份都 PASS 才把 feature 001 标记完成）

## Phase 27: 第十四轮文档评审后的修复（2026-11-23 追加；文档改动未触及随包文件，故未发新版）

- [x] T192 计数统一为 216：`plan.md:19` 的"213 项"、`tasks.md:11` 的当前值（并把历史串补成"0.1.15 与 0.1.16 是 213 项、0.1.17 起 216 项"）、`tasks.md` 的复跑行、`evidence/verification.md:10` 的复跑注释
- [x] T193 `evidence/verification.md` 的跨版本拼接：`431` 行"当前 0.1.16 是 …`f8379132…`、37 / 213"改成"当前 0.1.17 是 769,391 字节、`1c53080c…`、37 / 216"；G5 的夹具总数改 216（并注明 0.1.15/0.1.16 是 213）；G13 与 T079 的版本区间由 0.1.15 改 0.1.17（E-LIVE 的改写目标同步为 0.1.17）
- [x] T194 探针次数口径：T176 补"当时十四行；0.1.17 增 PS1 后为十五行"
- [x] T195 `contracts/plugin-manifest.md` 的样例 `version` 由 0.1.15 改 0.1.17（该文件自称"与仓库根 `package.json` 逐项相同"）
- [x] T196 `quickstart.md` 的 E-COMP-1 把"宿主半边只注册一段、畸形宿主静默"与"停用后不留残留"合并为第 ⑦ 组，恢复"七组"的自洽，并注明"七组 ≠ SC-006 的七类畸形宿主"
- [x] T197 `spec.md` 的 SC-007 不再声称 `no dsh version gate can refuse a start` 逐项检查 `engines`：该断言只查 `engines.dsh` 与指向 DSH 包的 peer 依赖，`engines` 其余子键登记在 G15 第五条
- [x] T198 `tasks.md` 的 T011 措辞：真机只确认过中文界面下的标题/描述，其余 7 种语言的说明页从未在真机上看过（指向 T052 与 G13）
- [x] T199 复跑确认：`check-bundle` 37 项、`run-harness` 216 项均不受文档改动影响；本轮没有改动任何随包文件（`client.js`、`locale/`、`docs/`、README 均未变），因此不发新版、不重装，直接进入下一轮评审

## Phase 28: 第十五轮文档评审的收口（2026-11-23 追加，版本 0.1.18）

- [x] T200 `evidence/verification.md` 的 G15 增第五条（`package.json` 若加入 `engines.node` 等非 `dsh` 子键，`no dsh version gate can refuse a start` 不会变红），"这四项"改"这五项"——修第十五轮文档评审的 P1（`spec.md:144` 的归属指针指向一个不存在的条目）
- [x] T201 `spec.md` 的 SC-007 与 `tasks.md` 的 T197、状态表 G15 行同步写成"G15 第五条"
- [x] T202 `contracts/plugin-manifest.md` 第 9 条拆成三句：`engines.dsh` 与 dsh peer 由 `no dsh version gate can refuse a start` 保证；`dsh.client.inject` 由 `package.json declares the bundle patch and the client half` 保证（第 79 行 `assert(client.inject === undefined, …)`）；其余 `engines` 子键见 G15 第五条
- [x] T203 `data-model.md` 的"清单被版本门否决"行不再把整条 `engines` 归给静态断言，改为"`engines.dsh` 与 dsh peer 由断言、整个 `engines` 键与 `dsh.client.inject` 由人工核对 `package.json`"
- [x] T204 `evidence/verification.md` 的 E-LIVE 引言"从 0.1.2 到 0.1.13"改为"从 0.1.2 到 0.1.17"（0.1.18 只改了文档与 README，没有再动渲染层），G13 区间改 0.1.3–0.1.17（第十七轮文档评审指出这已是中间态：`76d9181` 把 E-LIVE 引言推进到 0.1.19，G13 随后也改到 0.1.3–0.1.19，以 `evidence/verification.md` 现文为准）；`README.md` 的中文半句补回"（插件 `0.1.2`，真机只覆盖中文说明页）"，`README.zh.md` 同步
- [x] T205 `tasks.md` 的 T187 去掉无法在 E-PROBE 表里复核的"探针 P12b"编号，改写成本轮复跑的事实（往 `files` 加一个条目后报告串仍为 `24 required files`，说明打包总数已是派生值）
- [x] T206 因为本轮改了随包文本（`README.md`），升版本到 `0.1.18`、重建 `client.js`（fingerprint `f5b4e6eb…`）、复跑 37 / 216，避免仓库与已发布 tarball 的 README 不一致
- [x] T207 发布 `v0.1.18`（run `45082937620`，shasum `a84c639452632014ea9fbde9063b7b4f06d236d5`，logIndex `4048815195`，33 文件）、从 registry 装回 profile `desktop`（依赖 `0.1.18`、安装副本 769,391 字节 / `3C6AABC1…37F1`，与仓库根逐字节相同）、补 E-PUB/E-INS 行
- [ ] T208 第十六轮双评审（目标 PASS；两份都 PASS 才把 feature 001 标记完成）

## Phase 29: 第十六轮双评审的收口（2026-11-23 追加，版本 0.1.19）

第十六轮：实现侧判 FAIL（1 条 P2 + 3 条 P3，无 P0/P1），文档侧判 FAIL（1 条 P1 + 2 条 P2）。本轮只改测试设施、样式变量与文档，**不改任何用户可见行为**。

- [x] T209 `verify/harness/index.html`：把同时越过 `limit`（24 KiB）与 `maxEdges`（400）的 `huge` 夹具拆成两个互不掩盖的夹具——`longSource`（40 个节点、每标签 760 字符，约 31 KB、40 条边）只越字符上限；`manyEdges`（420 条边、约 5 KB）只越边数上限；各配「说了为什么」「保留宿主块」「没有画出来」三条断言（216 → 220）。原夹具只要任一条上限还在报错就为真，把 `limit` 或 `maxEdges` 单独改成极大值都不会变红（第十六轮实现评审 P2-1）
- [x] T210 `verify/check-bundle.mjs` 新增两条：①"两个上限各自到得了引擎、各自能被单条破坏证明"（`figure.js` 的 `limit: 24 * 1024`、`maxEdges: 400`、`outputLimit: 2 * 1024 * 1024` 都在，夹具四个断言名都在，且两个夹具的形状分别只压一条上限）；②`the contract's colour variables are the ones that are wired`：读 `contracts/client-fence-layer.md` 的变量块与 `src/client/styles.js` 的 `FIGURE_CSS` 变量块，比较**名字集合与宿主别名映射**，任一侧多、少或写错都会红（37 → 39）
- [x] T211 `src/client/styles.js` 补 `--pele-critical: var(--dsw-alias-state-error-primary);`（pele 的错误色变量名是 `--pele-critical`，源码写作 `var(--pele-critical,#e45756)`）；`contracts/client-fence-layer.md` 的变量块换成与源码逐行相同的十行（并纠正 `--pele-line` / `--pele-border` 原本写反的映射、补上漏掉的 `--pele-surface` / `--pele-surface-alt`、删掉实现里不存在的 `--pele-error`）
- [x] T212 探针 PS2/PS3/PS4（都在 `C:\Users\jiezhengj\Documents\Project\.probe-*` 的 tar 副本里做）：PS2 只删 `figure.js` 的 `limit: 24 * 1024,` → `a source over the size limit says why / keeps the host block / is not drawn` 三条变红、`a picture with too many edges …` 三条仍绿（`3 failed, 217 passed`）；PS3 只删 `maxEdges: 400,` → 反之（`a picture with too many edges …` 三条红、字符上限三条绿）；PS4 只把契约的 `--pele-line` 映射改成 `border-l1` → `the contract's colour variables are the ones that are wired` 变红（`1 failed, 38 passed`），还原后 39 全过。结果写进 E-PROBE 的 PS2/PS3/PS4 三行；两条上限的覆盖缺口记进 G15（G18 是引擎缺失分支，与上限无关）
- [x] T213 文档：`spec.md` Status 改 `0.1.19` 与"E-GAPS 18 项（G1–G18）"；`evidence/verification.md` 的 E-GAPS 增 **G18**（引擎缺失分支只有静态证据：引擎已内联、正常构建下运行期不会缺失；静态断言覆盖了错误边界、`readLayerInput`、`safeRead`、`engineUnavailable` 与 `typeof pele.mount !== 'function'` 守卫字符串，把守卫改成恒真会让 `an engine that fails to load leaves the picture to the host` 变红，但**没有动态用例**把引擎置空后观察回退——入口是 `scripts/build-client.mjs` 的 `catch (error) { pele = null }`）；计数 37 → 39、216 → 220（`plan.md`、`quickstart.md`、`tasks.md`、`contracts/plugin-manifest.md`、`evidence` 的复跑注释）
- [x] T204/T214 的最终事实：`evidence/verification.md` 的 E-LIVE 引言现为“从 0.1.2 到 0.1.19”，G13 区间现为 0.1.3–0.1.19（0.1.19 改了 `src/client/styles.js` 的变量块、测试与文档），0.1.18 只改了文档与 README；两处若再漂移，以 `evidence/verification.md` 为准
- [x] T215 八份 README 的英文半句补上"real-machine verification covers the Chinese docs page only"（`README.md` 的英文半句另有 `（插件 `0.1.2`）` → `(plugin `0.1.2`)` 的混排修正），与 `README.zh.md` 口径一致
- [x] T216 发布 `v0.1.19`（提交 `17ea689`）→ GitHub Actions run `45086312392` success（CI 39 项静态 / 220 项浏览器，shasum `9bcbc948d917b04df6f8a93639a4d6437ac5a74c`，provenance logIndex `4049111154`，33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.19"`，安装副本 769,453 字节、SHA256 `5B54B79C7D59CF25B9CE06ED713F60B7B45D7A74155D0132B0EB3EE7CBE0CFF9` 与仓库根逐字节相同，`locale/` 8、`docs/` 9、包内 `0.1.19`）→ E-PUB/E-INS 补 0.1.19 行
- [x] T217 第十七轮双评审：实现侧 **PASS**（4 条 P3；其中 P3-1/P3-3/P3-4 在 Phase 30 修掉、P3-2 即 G19 登记），文档侧 **FAIL**（3 条 P0 + 5 条 P1 + 4 条 P2，Phase 30 逐条修完）；两份都在 0.1.20 上复核过

## Phase 30: 第十七轮双评审的收口（2026-11-23 追加，版本 0.1.20）

第十七轮：实现侧 **PASS**（4 条 P3 均本轮修掉或登记），文档侧 **FAIL**（3 条 P0 都是"证据归属写错"，5 条 P1 + 4 条 P2）。本轮仍不改任何用户可见行为。

- [x] T218 `verify/check-bundle.mjs` 的 `the contract's colour variables are the ones that are wired` 加 `strip()`（解析前先剥 `/* … */` 与 `// …` 注释）、重复声明断言、下限 `>= 10`、以及 `wired.has('critical')`——注释诱饵不能再把错映射洗白（实现评审 P3-1/P3-4）
- [x] T219 `both size limits reach the engine, each proven on its own` 增 `assert(/\.\.\.FIGURE_LIMITS/.test(figure))`：上限声明存在不够，还得真的传进 `pele.mount`（P3-3）
- [x] T220 探针 PS5/PS6/PS7（`C:\Users\jiezhengj\Documents\Project\.probe-ps5|ps6|ps7` 的 tar 副本）：PS5 错映射 + 末尾注释诱饵 → `1 failed, 38 passed`；PS6 删 `...FIGURE_LIMITS,` → `1 failed, 38 passed`；PS7 两侧同时删 `--pele-critical` → `1 failed, 38 passed`。三行写入 E-PROBE（前言改"二十一次"）
- [x] T221 文档侧 3 条 P0：G18 的两句断言改成"静态断言存在、没有动态用例"；G15 删掉 `maxEdges`（0.1.19 起已有夹具与 PS2/PS3）只留 `outputLimit`；G13 区间改 0.1.3–0.1.19、E-LIVE 引言改 0.1.19 并把 G18/G19 移进 E-GAPS 列表内、收尾句改"上面 19 项"
- [x] T222 文档侧 5 条 P1 + 4 条 P2：T204/T214 改成最终事实、头注版本 0.1.20、`evidence:442` 的旧值改现値、G5 的 220 项、FR-004 的夹具名 `past`→`over` 并补边数六条、E-CHK 块内多余空行、T212 的结果指向、G18 行移到 G17 之后、`quickstart.md:33` 锚点、`README.md:21` 英文半句去掉中文标签
- [x] T223 发布 `v0.1.20`（提交 `df68d96`）→ GitHub Actions run `45088530926` success（CI 39 项静态 / 220 项浏览器，shasum `43a5602197d04d37211db3c5c225d5b9b3ffe059`，logIndex `4049292002`，33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.20"`，安装副本 769,453 字节 / SHA256 `910E7E465228102851AC14228B994FBA418FA215C17C90140C1C2410650DA7DE`）→ 补 E-PUB/E-INS → 第十八轮双评审

## Phase 31: 第十八轮双评审的收口（2026-11-23 追加，版本 0.1.21）

第十八轮：实现侧 **PASS**（无 P0/P1/P2，4 条 P3），文档侧 **FAIL**（1 条 P0 + 3 条 P1 + 5 条 P2）。用户可见行为不变，但静态检查与文档都更严。

- [x] T224 实现评审 P3-A：颜色契约检查把 `wired` 的每个名字锚到 `vendor/pele/pele.global.js` 里真实出现的 `--pele-<name>`（`engine` 集合），新增 `assert(invented.length === 0, 'the styles wire names the engine does not know: …')`；返回值改成 `${wired.size} engine variables, owned by engine and contract alike`。两侧一起改名的绕过因此失效
- [x] T225 探针 PS8（`%TEMP%`/`.probe-ps8` 的 tar 副本，两侧把 `--pele-line` 改名 `--pele-anything`）→ `FAIL … the styles wire names the engine does not know: anything`、`1 failed, 38 passed`，写入 E-PROBE（前言改“二十二次”）
- [x] T226 实现评审 P3-B/P3-C：G15 的②③ 重写——③ 撤回（`the fence layer is gone once the host disposes` 已守着 `slots.inject` 的 disposer），② 改成静态可读的说法（`index.js` 的 `apply` 每次都用 `prompt.section({ name: 'ui:dsh-dyslexia', … })` 注册、没有幂等守卫，所以同一个正常 `ctx` 上再 `apply` 会得到两段同名提示词），不再引用没有命令输出的“实测”；仍算缺口的只有①、②、④、⑤
- [x] T227 文档评审 P0：按 0.1.21 重跑两套检查，把 E-BLD/E-CHK/E-HARN 三块用**同一次运行**的完整输出整段重写（E-CHK 的第 37 行随着报告串改成 `owned by engine and contract alike` 而更新）
- [x] T228 文档评审 P1-1/P1-2/P1-3：E-LIVE 引言的“当前版本（0.1.21）”“从 0.1.2 到 0.1.21”“不能自动转移到 `0.1.21`”；G5 改成“0.1.17 与 0.1.18 是 216 项，0.1.19 起 220 项”；T079 状态行的标题与正文都写 0.1.21
- [x] T229 文档评审 P2-1/P2-2/P2-3：`plan.md:33` 的行数按 0.1.21 实测重写；E-PROBE 的 PS2/PS3 两行补上“静态 `both size limits reach the engine, each proven on its own` 也会变红（`check-bundle: 1 failed, 38 passed`）”；`quickstart.md`、`README.md`、`README.zh.md` 的“启用/停用立刻生效”改成“卸载已观察、启用与停用走宿主插件机制（未单独取证）”
- [x] T230 发布 `v0.1.21`（提交 `577bbe0`）→ GitHub Actions run `45091169265` success（CI 39 项静态 / 220 项浏览器，shasum `75589577bf6a3e8ac8258485c7d85bc441e93cc4`，logIndex `4049694107`，33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.21"`，安装副本 769,453 字节 / SHA256 `C65A95A2E754BFEF9F64043C496EF976EF66352E915B976E005F2C82D4FF7C03` 与仓库根逐字节相同）→ 补 E-PUB/E-INS 的 0.1.21 行
- [ ] T231 第十九轮双评审（目标 PASS；两份都 PASS 才把 feature 001 标记完成）

## Phase 32: 第二十轮双评审的收口（2026-11-23 追加，版本 0.1.23）

第二十轮：实现侧 **PASS**（无 P0/P1/P2，4 条 P3），文档侧 **FAIL**（1 条 P0 + 3 条 P1 + 7 条 P2）。用户可见行为不变；本轮只改文档、README 与测试守护。

- [x] T232 文档评审 P0：把"启用/停用在运行中的宿主里没有单独观察"登记为 **G20**，E-GAPS 标题与范围改 `共 20 项` / `G1–G20`，`tasks.md` 状态表补 G20 行，`spec.md` Status 的计数同步
- [x] T233 文档评审 P1-1：九份 README 的安装段整行重写——只把**卸载**写成运行中观察过，启用/停用写成"走宿主插件机制、没有单独观察（见 G20）"，换版本要重启；`README.md` / `README.en.md` / `README.zh.md` 同步同一口径
- [x] T234 文档评审 P1-2：E-COMP 的 FR-014 行把 `an engine that fails to load leaves the picture to the host` 从"客户端（夹具）"移到"宿主半边（静态）"，并注明它在产物里不可达、见 G18
- [x] T235 文档评审 P1-3/P2：`verification.md` 头注、`spec.md`、`plan.md` 的版本口径统一到 0.1.23；探针表把 PS8 的说明从 PS12 行挪回 PS8 行；`plan.md:33` 的 `check-bundle.mjs` 766 行 / `harness/index.html` 1177 行 / `run-harness.mjs` 131 行按实测重写（0.1.24 加"恒真分支"守护后 `check-bundle.mjs` 为 776 行）；`data-model.md` 的 74–77 行证据列加"静态"前缀；`tasks.md` 的表格标题改"待重启复核的项"；T092/T112/T113 补"本条记录当时的设计"；`README.zh.md` / `README.en.md` 的"宿主升级不会让它开不了机"补"未演练，见 G1"；`contracts/host-prompt.md` 的样例告警补前缀说明
- [x] T236 重建 `client.js`（README 随包，文档改动必须发版）：`769453 bytes`、`sources sha256:00fe7860f20f5178fcd5e5a0073883e8`、SHA256 `B8389139F5223D6034C8CEC6FB90AB8613736AED17BAF930D4A4A7572510448B`；`check-bundle` 39 项、`run-harness` 220 项全绿
- [x] T237 E-BLD/E-CHK/E-HARN 三块用本次运行（0.1.23）的完整输出整段重写，`.tmp/verify-evidence.py` 复核 `check doc 40 live 40 same` / `harness doc 225 live 225 same`
- [x] T238 发布 `v0.1.23`（提交 `31b6f24`）→ GitHub Actions run `45097568628` success（CI 39 项静态 / 220 项浏览器，shasum `36154060cc710492abd04fe7037d0e2fc9b3cd16`，logIndex `4049860584`，33 文件）→ 从 registry 装回 profile `desktop`（依赖 `"0.1.23"`，安装副本 769,453 字节 / SHA256 `B8389139F5223D6034C8CEC6FB90AB8613736AED17BAF930D4A4A7572510448B` 与仓库根逐字节相同）→ 补 E-PUB 的 0.1.22 与 0.1.23 行、E-INS 的 0.1.23 行（`remove_bundle` 返回 not-removable，0.1.22 的安装没有单独记录）
- [x] T239 第二十一轮双评审（实现侧 PASS、文档侧 FAIL，本轮未完）：实现 PASS 的 1 条 P2 已加固（T240），文档侧 1 P0 + 7 P1 + 10 P2 逐条处理（T241–T246）

## Phase 33: 第二十一轮双评审的收口（2026-11-23 追加，版本 0.1.24）

第二十一轮：实现侧 **PASS**（无 P0/P1，1 条 P2 + 3 条 P3），文档侧 **FAIL**（1 条 P0 + 7 条 P1 + 10 条 P2）。README 属于随包文件，因此本轮必须发版。

- [x] T240 实现评审 P2：夹具守护再加一条"恒真分支"规则（`|| true`、`&& false`、`?: true/false`），PS13 探针（`!!renamed || true`）由全绿变为 `fixture assertions without a condition: a swapped drawing is named again`、`check-bundle: 1 failed, 38 passed`
- [x] T241 文档评审 P0/P1-2/P1-8：九份 README 的"宿主升级不会让它开不了机"改为"没有任何版本检查会拒绝启动；真实宿主升级尚未演练（见 G1）"，"尚未演练跨大版本升级"改为"尚未演练任何一次升级（见 G1）"
- [x] T242 文档评审 P1-3：九份 README 的卸载段改成"仍然可读"（检索是 G7，从未跑过）；索引页与中文 README 顶部那两句"可检索"由 T257 收掉
- [x] T243 文档评审 P1-4：九份 README 的"以及 Mermaid 12.1 的其他图形类型"改成"引擎支持的其他图种；夹具只覆盖这七种（见 G21）"，并把 G21 登记进 E-GAPS（共 21 项）
- [x] T244 文档评审 P2-12/P2-13：`README.md` 的安装段补上门户口径（启用/停用未单独观察，见 G20）；"已在此验证"列表拆成"真机"与"无头夹具"两段
- [x] T245 文档评审 P1-5/P1-6/P2-9/P2-10/P2-11/P2-14/P2-15/P2-16/P2-17：E-GAPS 计数 20→21 与 `:835` 的 19→21；T079 与 G13 的版本口径改 0.1.23；状态表 G19/G20 归位；`contracts/plugin-manifest.md` 的断言行号 79→91；`plan.md:33` 行数 766/1177/131；`plan.md:45` 的 `OP-2/OP-3` 悬空 ID 换成 E-PKG/E-PUB；`data-model.md` 的"HMR 增量、无需重载"标为未观察；`checklists/requirements.md` 两条"无实现细节"改回未勾；`verification.md:789` 的"即刻生效"改为"磁盘换了、运行中的会话仍持旧 chunk"
- [x] T246 文档评审 P2-18：E-CHK/E-HARN 的 fence 尾空行去掉（由 `.tmp/regen-evidence.py` 生成时裁掉）
- [x] T247 重建 `client.js` 并发版：版本 0.1.24；`check-bundle` 39 项、`run-harness` 220 项全绿。发布 `v0.1.24`（提交 `25592a9`）→ GitHub Actions run `45101933555` success（shasum `2f46c409eb78b648d2b31dafe4d921c8ede66fee`，provenance logIndex `4049949251`，33 文件）→ registry tarball 第 20 次轮询可下载 → `remove_bundle`（卸 0.1.23）→ `install_bundle @0.1.24` applied；profile 依赖 `"0.1.24"`、安装副本 769,453 字节 / SHA256 `79C3EC79…2B07` 与仓库根逐字节相同、`locale/` 8、`docs/` 9
- [ ] T248 第二十二轮双评审（实现侧 PASS；文档侧 FAIL，见 Phase 34）

## Phase 34: 第二十二轮双评审的收口（2026-11-23 追加，工作树未发版）

第二十二轮：实现侧 **PASS**（无 P0/P1，1 条 P2 + 6 条 P3），文档侧 **FAIL**（1 条 P0 + 6 条 P1 + 9 条 P2）。本轮只改 `verify/`、`specs/` 与 `README` 之外的随包文件为零，因此**不发新版**，registry 仍是 0.1.24。

- [x] T249 实现评审 P2-1：`check-bundle` 的防掏空守护 `needed` 名单由 21 个名字扩到 25 个（补上 PS14 新增的四条同步渲染断言），PS17 探针（把 `a throwing code getter still yields an element` 的条件换成 `true`）由全绿变为 `fixture assertions without a condition: …`、`check-bundle: 1 failed, 38 passed`
- [x] T250 实现评审 P3-2：删掉夹具里对已删除变量 `childrenThrew` 的赋值与死变量 `codeGetterThrew`，并把那段注释改成解释为什么"没抛"本身不构成断言
- [x] T251 实现评审 P3-3/P3-4/P3-5：E-COMP 的 FR-009/FR-016 与契约第 9 条、`data-model.md` 改引现行断言名；PS14 行由 6 格并回 4 格；删掉段落里的残留半句
- [x] T252 文档评审 P0：E-PUB-LOG 的 0.1.5 块改为真实 stdout（`run-harness: all 82 checks passed (/usr/bin/google-chrome)`，并注明版本前缀是 0.1.6 起、指纹段是 0.1.13 起）
- [x] T253 文档评审 P1：E-PUB 表补首次 0.1.1 的失败 run `45031124935`（E422）；`:459` 区分"已发布 0.1.24 是 39/220"与"当前工作树 39/222"；`quickstart.md` 与 `:10` 的 220 改 222；`tasks.md` 的 T079/G13 安装版本改到 0.1.24
- [x] T254 文档评审 P2：G5 的 220→222（并补"0.1.24 发布之后 222 项"）；`plan.md` 的文档树补 `evidence/verification.md`；`contracts/plugin-manifest.md` 去掉"0.1.25 起"，改为"未发版的核验提交起"
- [x] T255 E-BLD/E-CHK/E-HARN 三块用同一棵树的单次运行重写，`.tmp/verify-evidence-024.py` 复核 `41 == 41` / `227 == 227`；E-PROBE 补 PS17 行、前言改"二十九次"
- [x] T256 第二十三轮双评审：实现侧 **PASS**（无 P0/P1，4 条 P2 + 11 条 P3），文档侧 **FAIL**（4 条 P1 + 8 条 P2）→ 本轮收口见 Phase 35

## Phase 35: 第二十三轮双评审的收口（2026-11-23 追加，版本 0.1.25）

第二十三轮：实现侧 **PASS**（31 条单点破坏探针全部按要求变红或按登记保持绿；4 条 P2 全是"证据强度"问题），文档侧 **FAIL**（4 条 P1 + 8 条 P2）。索引页与中文 README 顶部两句"可检索"属随包文件，因此本轮**发版**。

- [x] T257 文档评审 P1-3/P1-4：`README.md` 的 "copyable, searchable, and readable" → "copyable and readable"、"可复制、可检索" → "可复制"，`README.zh.md` 的"可以复制、可以检索、可以转发" → "可以复制、可以转发"（检索是 G7，从未跑过）
- [x] T258 文档评审 P1-1：`plan.md:33` 的夹具行数改"v0.1.24 发布时 1177 行 / 当前工作树 1208 行"，`research.md:186` 改"1208 行夹具 + 131 行驱动（1339）"
- [x] T259 文档评审 P1-2/P2：G17 的 ⑦ 说明改为"有静态字符串守卫（`the watcher does not watch the drawing subtree`），没有行为观察"，`tasks.md` 的 G17 状态行同步；`plan.md:24` 的 22 → 21 → 22（G21/G22 补齐后为 22 项）；E-GAPS 的 G19/G20 顺序与 `tasks.md` 状态表一致
- [x] T260 实现评审 P2-1：`check-bundle` 的限额断言改为按数值比较（`limitOf('limit') === 24 * 1024` 等），探针（把 `limit` 改成 `24 * 1024 * 1000`）由"静态绿"变为 `the character limit is 24576000, not 24 KiB`
- [x] T261 实现评审 P2-2：`the host half stays silent when the host changed shape` 现在替换 `console.warn` 计数并断言五种静默宿主 0 次警告；探针（在 `index.js` 的空守卫里加一句 `warn('probe', null)`）由全绿变为 `the host half warned on 5 unchanged hosts`
- [x] T262 实现评审 P2-3：G5 的 E16 改为"只有语言透传夹具，没有多代码块会话观察"，G15① 改为"只有静态锚点，没有夹具或真机观察"，G17⑦ 改为"有静态守卫、没有行为观察"
- [x] T263 实现评审 P2-4：防掏空名单自身加守护（`const NEEDED_COUNT = 26`，`needed.length !== NEEDED_COUNT` 直接失败），并补上本轮新增的 `the hostile children bag mounted without a setup error`
- [x] T264 实现评审 P3：夹具的复制播报段在结束时还原 `navigator.clipboard`；`childrenView` 的空 `catch` 改为记录 `childrenSetupError` 并由断言检查为 `null`；`harness` 由 222 项增至 223 项，`EXPECTED_CHECKS` 同步 223
- [x] T265 契约样例与计数：`contracts/host-prompt.md` 的 `apply` 样例按 `index.js` 真实实现整块重写（含 `ctx` 空值守卫、thenable 兜底、`warn` 前缀），`plugin-manifest.md` 的浏览器项数改"0.1.24 之后的核验提交起 223 项"，`spec/quickstart` 的 222 → 223（`plan.md` 的两处在 `1b19aae` 补上）
- [x] T266 重建 `client.js` 并发版 0.1.25：`check-bundle` 39 项、`run-harness` 223 项全绿 → 版本提交 `aafabb7` → 证据提交 `a7b62aa`（tag `v0.1.25` 指向它，CI headSha 也是它）→ Actions run `45109072637` success（shasum `04f750a1…`、logIndex `4050087976`、33 文件）→ 先 remove 0.1.24 再装回 `desktop`（`version 0.1.25`、安装副本 SHA256 `D4742D44…FC9219`）→ 补 E-PUB/E-INS
- [x] T268 第二十四轮文档意见（`review-docs-24`）：七份随包 README 的"可搜索"改成"可复制、转发，卸载后仍可读（检索未取证，见 G7）"、`README.ja.md` 补"引擎支持其他图种但未验证"半句；`verification.md` 的复跑说明/探针前言/G5 的 222 → 223、G13 区间改到 0.1.25、PS12/PS13 两份重复行删掉（表现在 33 行）；`tasks.md:11`/`:581` 的 222 → 223 并补 0.1.24→0.1.25 的历史、T265 与 T266 的措辞按实际提交改（`plan.md:112` 由 `1b19aae` 补、tag 指向 `a7b62aa`）；`plan.md:9` 删"可检索"、`:33` 改"第二十三轮改的是随包 README、随 0.1.25 发布"；`plugin-manifest.md:119` 补"中间一度 222 项"；`data-model.md:88` 的不变量注明检索为 G7
- [ ] T267 第二十四轮双评审：两个只读评审分别审文档一致性与实现证据；两份都 PASS 后把 feature 001 标为完成并回写 `spec.md` Status

## Phase 36: 第二十四轮实现评审的加固与 0.1.26（2026-11-23 追加）

- [x] T269 语言轮里的 `if (.dsh-dyslexia-bar button)` 补 `else`，缺动作栏时显式报 `the actions bar is missing`
- [x] T270 `childrenSetupError === null` 加上「视图存在且舞台有节点」的条件与细节串，不再在异步渲染下恒真
- [x] T271 拒绝 children 的四个场景各加 `a refused children falls back to the source`，与「不出现 #31」成对
- [x] T272 缩放配对条件改为 `zoomButtons.length > 0 && quietZoom.length === 0`；复制回执字号断言改 `=== 12`
- [x] T273 新增 `the zoom button titles say the same as their names`；PS20 说明那一行是兜底（引擎自己也设标题）
- [x] T274 `check-bundle` 的恒真守护加 `&& true`/`|| false` 分支与 `selfComparison`（`x === x`），PS21/PS22 各验证一次
- [x] T275 探针表补 PS20–PS22，前言改「三十六次」，G17 增 ⑨ 并写明守护只覆盖 `needed` 名单
- [x] T276 版本 0.1.26 的文档口径（39 静态 / 228 浏览器、`check-bundle.mjs` 815 行、`harness/index.html` 1237 行、E-BLD/E-CHK/E-HARN 单次运行重写）

## Phase 37: 0.1.26 的发布与装回（2026-11-23 追加）

- [x] T277 发布 `v0.1.26`（提交 `0026db4`）→ GitHub Actions run `45112579779` success；`check-bundle` 39 项 / `run-harness` 228 项，CI 与本机两行逐字相同；shasum `6eed7f9d48d579b22abe80abdf3ed5d956c495b1`，logIndex `4050182557`，total files 33
- [x] T278 registry tarball 第 21 次轮询返回 200 后 `remove_bundle`（卸 0.1.25）→ `install_bundle @0.1.26` → `applied`；profile 依赖 `"0.1.26"`，安装副本 `client.js` 769,453 字节、SHA256 `F63EB3FE3842BCBD5DC00231EF2D4003E6000806002BC25B152187A6AA847AD8` 与仓库根逐字节相同，`locale/` 8、`docs/` 9、包内 0.1.26
- [x] T279 证据补 0.1.26 的 E-PUB 行与 CI 日志块、E-INS 实测表（`evidence/verification.md`）
- [ ] T280 第二十五轮双评审（目标：两份都 PASS）

## Phase 38: 0.1.27 的发布、装回与第二十五轮评审判定（2026-11-23 追加）

- [x] T281 `review-impl-25` 判 **PASS**（无 P0/P1/P2；11 条探针逐条复核，三方产物 SHA256 `f63eb3fe…7ad8` 相同，兼容性扫描 0 命中）
- [x] T282 `review-docs-25` 判 **FAIL**：P0 五条（E-PROBE 前言 223 口径、`plan.md:19`、`quickstart.md:89`、`tasks.md:11`、`plugin-manifest.md:119` 顺序）、P1 六条（`evidence:475/:868/:882`、`research.md:186`、`tasks.md:636`、八份 README 的七种图种归属）、P2 五条
- [x] T283 逐条修：探针史改 `220 → 222 → 223 → 228`、八份 README 改成"静态检查采样七种、浏览器夹具只画前两种"、`README.md`/`README.zh.md` 补 G7 免责、`README.md` 的"不进会话历史"补 G12、G21 归属拆开、`research.md` 夹具行数改 1237/1368
- [x] T284 发版 0.1.27（只改文档、README 与版本号；`client.js` 只差 banner 的版本与指纹）：提交 `cf73c1e` → run `45114993254` success、39/228、shasum `b85f6c59e4b09cd9ffb46cff815491a5d16c86f0`、logIndex `4050249983`
- [x] T285 registry 第 20 次轮询 200 后 `remove_bundle`（卸 0.1.26）→ `install_bundle @0.1.27`；profile 依赖 `"0.1.27"`、安装副本 769,453 字节、SHA256 `33ED2519D2D0B1AE1BE79A16E55FF87BE0B78C4526832E2AC3816EA5F68FC003` 与仓库根一致
- [x] T286 第二十六轮双评审：`review-impl-26` 判 **PASS**（无 P0/P1；三条 P2 是记录与覆盖精度问题，已登记）；`review-docs-26` 判 **FAIL**（P1 三条、P2 五条），逐条修见 T287–T289

## Phase 39: 0.1.28 的修复、发布、装回与第二十七轮评审（2026-11-23 追加）

- [x] T287 `review-impl-26` 的 P2：banner 的 `sources sha256` 含 version 的问题、`check-bundle` 全绿不等于行为正确、`children` getter 双保险的覆盖精度——三条都记进 `evidence/verification.md` 的 G15 与 `research.md` D22，不改代码
- [x] T288 `review-docs-26` 的 P1：`spec.md:7` 的"当前版本"改到 0.1.28；`evidence` 的 G21 与 `tasks.md` 的 G21 行把"夹具只画两种"与"静态采样七种"分开写，不再互相引述成矛盾句
- [x] T289 `review-docs-26` 的 P2：E-CHK 块补回真实 stdout 的空行（41 行）、九份 README 的 G7/G12 双向补齐、探针前言改成"破坏是临时的，落地后留下的改动只在 `verify/` 与 `specs/` 里"、`evidence` 与 `tasks.md` 的 0.1.27 描述补上 `package.json` 与 banner、`plan.md:33` 的 `v0.1.26` 行注明"0.1.27 未改动这两套"
- [x] T290 发版 0.1.28（只改文档、README 与版本号）：提交 `2895817` → tag `v0.1.28` → run `45117521081` success、39/228、shasum `816a80a70fe2a3a8c95d131d0412b97e81393bc3`、logIndex `4050291751`、33 文件
- [x] T291 registry 第 20 次轮询 200 后 `remove_bundle`（卸 0.1.27）→ `install_bundle @0.1.28`；profile 依赖 `"0.1.28"`、安装副本 769,453 字节、SHA256 `0E276FC51F806104E49938248081CD314D3A4C2127361E5A797473BB2E74B0DC` 与仓库根一致、`locale/` 8、`docs/` 9、包内 0.1.28
- [x] T292 证据补 0.1.28 的 E-PUB 行与 CI 日志块、E-INS 实测表（`evidence/verification.md`）
- [ ] T293 第二十七轮双评审（`review-docs-27` / `review-impl-27`，目标：两份都 PASS）

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Setup；**阻塞所有用户故事**
- **US1 (Phase 3)**: 依赖 Phase 2；MVP
- **US2 (Phase 4)**: 依赖 Phase 2，与 US1 无实现依赖（审计 + 取证）
- **US3 (Phase 5)**: 依赖 Phase 2；与 US1 共享 `figure.js`/`styles.js`，故排在 US1 之后
- **US4 (Phase 6)**: 依赖 Phase 2 与 T008 的构建产物
- **FR-011 (Phase 7)**: 依赖 Phase 2 的 T006
- **US5 (Phase 9)**: 依赖 Phase 2 的 T006
- **Polish (Phase 8)**: 依赖全部故事完成

### Within Each User Story

- 引擎/样式（T012、T013）先于注册（T014）
- 注册先于取证（T017）
- 取证任务一律最后，且必须在真机里做完再勾选

### Parallel Opportunities

- T003、T004、T005 并行
- T007 与 T006 并行；T009 与 T008 并行（不同文件）
- T012 与 T013 并行（不同文件）
- T028 与 T029 并行
- US2 的审计（T018）可与 US1 的实现并行

---

## Parallel Example: User Story 1

```text
# 两个文件可同时动手：
Task: "写 src/client/figure.js 的 pele 生命周期"
Task: "写 src/client/view.js 的层组件骨架"

# 取证阶段可并行准备三份夹具：
Task: "准备一份合法 flowchart 夹具（E1）"
Task: "准备一份非法 mermaid 夹具（E4）"
Task: "准备一份 200+ 节点大图夹具（E6）"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 → Phase 2（真机可观察）
2. Phase 3（US1）
3. **STOP and VALIDATE**：E1–E5、E16 全绿再往下

### Incremental Delivery

1. Setup + Foundational → 骨架可装可卸
2. + US1 → 图能画出来（MVP）
3. + US2 → 卸了不丢东西
4. + US3 → 手机上能读
5. + US4 → 断网/裸机可用
6. + FR-011（Phase 7）→ 模型知情；+ US5（Phase 9）→ 升级不拖垮宿主
7. Polish → 打包、文档、证据表

---

## Notes

- `[P]` = 不同文件、无未完成依赖
- 每个取证任务都要留下可见证据（截图 / 网络面板 / 会话内容），否则不得勾选
- `client.js` 是生成物但必须提交：宿主只认已构建单块 chunk，发布包里不能缺它
- 任何一项无法验证，写进「未验证」，不要用"应该可以"替代

## 实施状态（2026-11-23 更新）

**当前自动化证据**（命令即证据，任何人 clone 后可复跑）：

- `node verify/check-bundle.mjs` → **39 项全过**
- `node verify/run-harness.mjs --list` → 真实 Chromium 里 **228 项全过**（夹具 `verify/harness/index.html`，已提交）

**真机证据**（`evidence/verification.md` 的 E-LIVE）：会话内就地成图、卸载回退、重装恢复、插件页说明；取证的版本是 0.1.2。

**仍未取证的项**（与 `evidence/verification.md` 的 E-GAPS 一一对应；不写成"已完成"）：

| 缺口 | 项 | 状态 | 说明 |
|---|---|---|---|
| G1 | T042 宿主升级演练 | 未做 | 未真的升级 DSH 一个版本；只有源码级论证与 CI/夹具证据 |
| G2 | T023 实体手机/平板触控 | 部分 | 360 px 无横向溢出由夹具覆盖（不是真机窗口），触屏缩放与复位未在真机试 |
| G3 | T025 断网/裸机安装 | 未做 | 运行期零网络只有静态断言与 `file://` 夹具支撑 |
| G4 | T041 真机注入畸形宿主 | 部分 | 应用能正常打开、会话正常已确认；七种畸形宿主只在夹具与 vm 里复现 |
| G5 | T031 E1–E16 逐条复跑 | 部分 | E1/E3/E4/E5 有夹具或 E-LIVE（0.1.2）支撑；E2（同一条消息两块图并存）**自 0.1.13 起有夹具**；E16 与其他非 mermaid 代码块既无夹具也无真机观察；E15（未装插件的新会话不产生只有插件才看得懂的内容）无观察；E10（卸载后旧会话回退）有 0.1.2 观察 |
| G6 | SC-001 计时 | 未做 | 没有"1 秒内出图"的计时 |
| G7 | SC-002 检索命中（T019） | 未做 | 未在卸载态用 `session_search` 查过该块原文 |
| G8 | SC-003 字号下限 | 未做 | 没有图内字号与正文最小字号的比较断言 |
| G9 | SC-004 断网渲染 | 未做 | 只有"产物无网络调用"的静态断言，没有断网实跑并数请求 |
| G10 | SC-005 主题切换 | 部分 | 只验证了换 CSS 变量后变色，没做明→暗→明切换 |
| G11 | FR-011 停用后提示词消失（T027） | 未做 | 宿主半边只有静态断言；本机 PATH 无 `dsh` CLI，改用 vm 断言，但不证明真实会话里停用后消失 |
| G12 | FR-002 真机"无侧栏/无新文件" | 未做 | 结构上不写文件、不碰宿主布局，但没有一次真机核对磁盘与会话条目未变 |
| G13 | T079 当前版本的重启后真机核对 | 未做 | 0.1.11 至 0.1.28 都已发布并装进 profile `desktop`，运行中的界面仍加载旧 chunk；`E-LIVE` 的观察取自 **0.1.2**（只有中文说明页、就地成图、卸载回退、重装恢复四件事），不能自动转移 |
| G14 | 真实窗口缩放时引擎重绘（FR-018 端到端） | 未做 | 无头环境首帧后不再派发帧与 ResizeObserver 通知，只能证明"节点被换 → 立刻重新命名"；拖窄真实窗口这条链只有机制级证据 |
| G15 | 尚未覆盖的加固面 | 未做 | ①`outputLimit`（2 MiB 绘制输出上限）无用例（字符上限与边数上限自 0.1.19 起已有单独夹具与 PS2/PS3 探针）；②`index.js` 的 `apply` 每次都用 `prompt.section({ name: 'ui:dsh-dyslexia', … })` 注册、没有幂等守卫，同一个正常 `ctx` 上再 `apply` 会得到两段同名提示词，无断言守着；③`slots.inject` 回调丢 disposer 这半句**不成立**（`the fence layer is gone once the host disposes` 就守着它，回调不返回 disposer 即变红），不算缺口；④`prepack` 不跑夹具；⑤`package.json` 若加入 `engines.node` 等非 `dsh` 子键，`no dsh version gate can refuse a start` 不会变红 |
| G16 | vendor 文本与无头环境的换节点 | 未做 | 绘制输出上限（`outputLimit` 2 MiB）仍按 G15 记，字符上限与边数上限已有夹具，不再重复；这里只记两件小事：`client.js` 里 vendor 许可注释含 `https://github.com/obsidianmd/pele`（静态文本、无网络行为），以及「引擎换掉 `<svg>` 后重新命名」在无头环境只能夹具重放（真实拖窄窗口的端到端见 G14） |
| G17 | 视图层无断言的行为 | 未做 | 第十四轮实现评审的 P3 汇总，逐条登记在 `evidence/verification.md` 的 G17：失败原因三分类、"已复制"1.5 秒后消失、缩放按钮与引擎顺序的配对、失败后同一实例的自愈、失败时隐藏空画框、`children: []` 退回原文、`props` 与 `code` 都读不出时返回 `null`——这些分支都存在，但删掉不会让任何断言变红；`MutationObserver` 只看直接子节点这一条例外：它有静态字符串守卫（改成 `subtree: true` 会红），只是没有行为观察 |
| G18 | 引擎缺失分支只有静态证据 | 未做 | 第十六轮实现评审 P3（第十七轮文档评审修正措辞）：静态断言覆盖了错误边界、`readLayerInput`、`safeRead`、`engineUnavailable` 与 `typeof pele.mount !== 'function'` 守卫字符串（改成恒真会让它变红），但**没有动态用例**把引擎置空后观察回退——入口是 `scripts/build-client.mjs` 的 `catch (error) { pele = null }` |
| G19 | 静态套件只钉顶层条目数 | 未做 | 第十七轮实现评审 P3：`EXPECTED_CHECKS = 39` 只保证有 39 个 `check()`；某条 `check()` 内部删掉一行 `assert()` 仍是全过（浏览器侧逐条 `expect()` 计数，删一条即报错） |
| G20 | 启用/停用在运行中的宿主里没有单独观察 | 未做 | E-LIVE 只观察到卸载回退与重装恢复；九份 README 与 `quickstart.md` 都写成"走宿主插件机制、未单独取证" |
| G21 | 引擎支持的其它图种与"Mermaid 12.1"版本说法 | 未做 | 静态检查采样七种（flowchart/sequence/class/state/er/mindmap/timeline，见 `every supported sample type draws an svg`），浏览器夹具只画了 flowchart 与一条 `sequenceDiagram`；gantt、kanban、xychart、C4、architecture 无任何用例；"Mermaid 12.1" 只来自上游 pele 的说明。九份 README 按"静态采样七种、夹具只画前两种（见 G21）"措辞 |
| G22 | `check-bundle` 需要 `specs/` 才完整（合同文件不在 `files` 里） | 未修（登记为局限） | 合同文件不在包里；正常 clone 与 CI 都通过，缺 `specs/` 的副本里 `npm pack` 会以 ENOENT 变红 |
| G23 | 三处证据强度（banner 指纹含版本、静态全绿≠行为正确、children getter 双保险） | 记录（不改代码） | 第二十六轮实现评审 P2 的原文见 `evidence/verification.md` 的 G23；三条都不影响已发布行为 |

**待重启复核的项**：

| 项 | 状态 | 说明 |
|---|---|---|
| T070 0.1.3 重启核对 | 已作废 | 由 T079 取代 |
| T079 重启后真机核对（0.1.28） | 未做 | 0.1.11 至 0.1.28 已发布并装进 profile `desktop`，运行中的界面仍加载旧 chunk；重启后才换新，届时核对图名/按钮/播报/插件页说明/卸载回退，并把 E-LIVE 改写成 0.1.28 的记录。E-LIVE 里现有的观察是 0.1.2 的 |

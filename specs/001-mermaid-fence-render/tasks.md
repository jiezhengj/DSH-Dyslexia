---
description: "Task list for 会话内图形渲染"
---

# Tasks: 会话内图形渲染

**Input**: Design documents from `/specs/001-mermaid-fence-render/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 本功能不引入测试框架（宪法原则 III）。验收 = `verify/check-bundle.mjs` 的 31 项静态断言 + `verify/run-harness.mjs --list` 的 82 项浏览器断言 + quickstart.md 的 E1–E16 真机证据表（该表定义"要取什么证据"，本身不是证据）。

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
- [x] T011 装进 `desktop` profile 冒烟：`plugin_manager` 的 `install_bundle` 指向仓库根（需 danger-full-access，先向用户报备），确认插件在列表里、标题/描述随界面语言显示、加载日志无报错；随后立即 `remove_bundle` 复原

**Checkpoint**: 宿主提示词段在位、客户端模块可被宿主加载、静态校验可跑——三个用户故事都能被真机观察了。

---

## Phase 3: User Story 1 - 图直接出现在会话里 (P1) 🎯 MVP

**Goal**: 标记为 `mermaid` 的代码块在原位置变成图，可查看源码，失败/流式/超限都退回代码块。

**Independent Test**: 让 Agent 输出含 ` ```mermaid ` 的 flowchart 回答，观察该块位置变成图、会话里不出现新文件、不打开侧栏、消息顺序不变。

### Implementation for User Story 1

- [x] T012 [P] [US1] 写 `src/client/figure.js`：pele 实例生命周期——`mount(el, code, options)`、`refresh()`、`destroy()`、缩放控制；选项含 `autoDirection`、`directionBreakpoint`、`padding`、`maxEdges`、`outputLimit`、`zoom`、`onError`；只接受 `MermaidSource.code`（见 [data-model.md](./data-model.md)）作为输入，不缓存
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

- [x] T021 [P] [US3] 在 `src/client/figure.js` 加 `ResizeObserver` → `refresh()`，让容器尺寸/字体变化时重排而不重新解析（消费 `RenderArtifact.width`/`height`）
- [x] T022 [US3] 落窄屏规则：容器 `max-width: 100%`、溢出在图内滚动（`src/client/styles.js`）；字号下限由绘制选项 `fontSize` 保证（`src/client/figure.js` 的 `figureFontSize`），**不是** CSS；缩放控件只在溢出时出现。（"图内文字不小于正文最小字号"目前无断言，见 E-GAPS）
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

### Implementation for User Story 5

- [x] T026 [US5] 校准 `index.js` 的 `MERMAID_RENDER_PROMPT` 文案：复核四件必含、五条必不包含（尤其不得写"尽量用图"、不得点名图类型、不得规定篇幅），并记录 `order: 9000` 的落位理由
- [ ] T027 [US5] 取证：启用态新会话里该段出现在系统提示词中且模型行为合理；禁用/卸载后该段消失（用 `dsh --profile desktop --dump-config` 或会话日志核对）

**Checkpoint**: 五个故事全部独立成立。

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T028 [P] 补全 `README.md`：安装、卸载、验证方法、已验证/未验证/已知不支持三档限制、数据与隐私说明
- [x] T029 [P] 校准 `THIRD-PARTY-NOTICES.md` 与 `LICENSE`：pele 的 MIT 全文、来源与固定版本、我们的 MIT
- [ ] T030 打包复检：`npm pack --dry-run` 核对 0.1.3 的 33 个文件不含 `src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.specify/`、`.tmp/`（清单已核对，断网 tarball 复跑未做，故不勾）
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
- [x] T039 静态证据：`verify/check-bundle.mjs` 由 17 项增至 22 项（新增"无版本门""可独立编译""畸形加载器不抛""工厂抛错仍可用""含边界与守卫""畸形宿主 ctx 不抛"）→ 对应 FR-017 / SC-008
- [x] T040 渲染期证据：夹具迁入仓库 `verify/harness/index.html` + `node verify/run-harness.mjs`，由 25 项增至 82 项（宿主 `t` 抛错/回显 key、`code`/`children` 取值器抛错、引擎抛错、无 slots 服务、坏语法、裁剪板缺失、窄屏、主题）→ 对应 FR-017 / SC-006 / SC-009
- [ ] T041 真机验证 US5：装机后应用正常打开、会话正常、图照常显示（已由 E-LIVE 覆盖一部分）；"畸形宿主"降级只在夹具里复现，真机未注入 → 部分取证
- [ ] T042 宿主升级演练：记录当前版本号，下一次 DSH 升级后检查"能打开、能进会话、历史图回退为文本"，并把结果追加到 evidence

---

## Phase 10: 八种语言、图标、README 与发布（2026-11-22 追加）

用户四项要求（图标照官方风格重做、说明页对齐官方全部界面语言、README 双语索引 + 分语言简介、GitHub 建仓并本机测试）。复核结论：官方界面语言是 **8 种**（zh/en/ja/es/fr/de/ru/pt），不是 9 种。

- [x] T043 `icon.svg` 按官方风格重做（36×36、`fill="none"`、stroke 3、渐变 `#7CB7FF→#145AF3` + `#679EFE` 折线 + `#41E1AC` 描边节点），Chrome headless 逐版对比定稿
- [x] T044 客户端文案扩到 8 语言（现为 13 个键 × 8 种语言，`src/client/i18n.js`）
- [x] T045 `scripts/build-preview.mjs` 生成 `docs/preview.svg`（640×300，含 pele 真实渲染的流程图，可重复生成）
- [x] T046 8 份 `locale/<lang>.json`（title / description / detail 全部本地化）
- [x] T047 8 份 `docs/DETAIL{,.zh,.ja,.es,.fr,.de,.ru,.pt}.md`（各自一行图片 + 该语言 alt）
- [x] T048 `README.md` 索引 + 8 份 `README.<lang>.md`（2026-11-23 由 `readme-writer` 补齐「数据与隐私 / 验证方法 / 已知限制」三节）
- [x] T049 `verify/check-bundle.mjs` 增加发布文件齐全、每种界面语言都有说明页、清单指向 npm 可信仓库等断言（现共 31 项）
- [x] T050 `package.json` 补 `repository`/`homepage`/`bugs`（E422 的教训），`files` 收进 `docs` 与 `README*.md`
- [x] T051 GitHub 建仓 `https://github.com/jiezhengj/DSH-Dyslexia` 并推送；`.github/workflows/publish.yml` 走 npm trusted publisher（OIDC + provenance）
- [x] T052 重启后的真机取证：插件页 8 语言说明与新图标、会话里就地画图、卸载后旧会话回退（E-LIVE-1～6，取证的版本是 0.1.2）

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
- [x] T065 `verify/check-bundle.mjs` 25 → 31 项（宿主半边恰好一段、畸形宿主静默、8 语言整句、产物指纹、真实工厂抛错、图像与播报角色）
- [x] T066 发布 workflow 增加：重建 → `git diff --exit-code -- client.js` → check-bundle → run-harness → publish
- [x] T067 `package.json` 加 `scripts`（build/verify/harness/test/prepack），版本升 0.1.3
- [x] T068 文档与证据全量同步（spec/plan/research/data-model/contracts/quickstart/tasks/checklist/evidence）
- [x] T069 打 `v0.1.3` 经 GitHub Actions 发布（run `45043233136`），从 registry 装回 `desktop` profile
- [ ] T070（已由 T079 取代，不再单独核对 0.1.3）新 chunk 生效、图名/按钮、插件页 0.1.3 说明、卸载回退（E-LIVE 目前是 0.1.2 的记录）

## Phase 13: 第二轮独立评审后的修复（2026-11-23 追加，版本 0.1.5）

第二轮评审同样两份 FAIL：文档侧 1 条 P0（Status 与 E-GAPS 缺口数不一致、SC-001/SC-003 无断言）+ 多条 P1（证据块跨版本拼装、Phase 10/11 被我改文档时整段截掉、"24 文件"应为 32、夹具名不存在、把宿主半边断言当客户端降级证据、SC 勾选过早）；实现侧无 P0，但有 2 条 P1（证据不可自证、E-LIVE 停留在 0.1.2）与 7 条 P2（无障碍结构、标签拼引擎类型、falsy children、`t` 换身份重挂、规模上限与流式切换无夹具、复制无播报、tooltip 塞英文诊断）。

- [x] T071 `role="img"` 与 `aria-label` 移到 `svg`，外层改 `role="group"`，挂载点 `role="presentation"`（FR-018）
- [x] T072 `figureLabel` 改为各语言纯名词，删除 `figureUntyped` 与 `figureType`（12 键 × 8 语言，字典串 96 条）
- [x] T073 `isRenderableChild()`：`undefined/null/false/''/0` 一律当成"没有宿主内容"，此时自己渲染源码
- [x] T074 `t` 经 `useRef` 读取，layout effect 依赖减为 `[code, streaming, doc, teardown]`；宿主每次新建 `t` 不再重挂绘制、不丢缩放
- [x] T075 复制按钮文案固定"复制源码"，结果写入 `role="status" aria-live="polite"` 的视觉隐藏区域；去掉 `title` 里的英文原始诊断（只进 console）
- [x] T076 `verify/check-bundle.mjs` 30 → 31 项（新增"图是图像、复制被播报"），并让报告行自带 `包名@版本 | 字节数 | 源码指纹`，让任何粘贴的输出自证来自哪棵树
- [x] T077 夹具 76 → 82 项（新增：超限源码、流式→完成、falsy children、`t` 换身份不重绘、复制播报）；`verify/run-harness.mjs` 增加 `--list` 以便证据整段引用单次运行
- [x] T078 `spec.md` 增 FR-018 与 SC-010；`contracts/client-fence-layer.md`、`data-model.md`、`research.md`（D22）同步
- [x] T079 打 `v0.1.5` 发布、从 registry 装回、重启后真机核对（图名/按钮/播报/插件页说明/卸载回退），；E-PUB/E-INS/E-CHK/E-HARN 已按单次运行重写（E-LIVE 仍是 0.1.2，待重启后补 0.1.5）
- [ ] T080 再次请两位评审复核（目标 PASS），通过后把 feature 001 标记完成

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Setup；**阻塞所有用户故事**
- **US1 (Phase 3)**: 依赖 Phase 2；MVP
- **US2 (Phase 4)**: 依赖 Phase 2，与 US1 无实现依赖（审计 + 取证）
- **US3 (Phase 5)**: 依赖 Phase 2；与 US1 共享 `figure.js`/`styles.js`，故排在 US1 之后
- **US4 (Phase 6)**: 依赖 Phase 2 与 T008 的构建产物
- **US5 (Phase 7)**: 依赖 Phase 2 的 T006
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
6. + US5 → 模型知情
7. Polish → 打包、文档、证据表

---

## Notes

- `[P]` = 不同文件、无未完成依赖
- 每个取证任务都要留下可见证据（截图 / 网络面板 / 会话内容），否则不得勾选
- `client.js` 是生成物但必须提交：宿主只认已构建单块 chunk，发布包里不能缺它
- 任何一项无法验证，写进「未验证」，不要用"应该可以"替代

## 实施状态（2026-11-23 更新）

**当前自动化证据**（命令即证据，任何人 clone 后可复跑）：

- `node verify/check-bundle.mjs` → **31 项全过**
- `node verify/run-harness.mjs --list` → 真实 Chromium 里 **82 项全过**（夹具 `verify/harness/index.html`，已提交）

**真机证据**（`evidence/verification.md` 的 E-LIVE）：会话内就地成图、卸载回退、重装恢复、插件页说明；取证的版本是 0.1.2。

**仍未取证的项**（不写成"已完成"）：

| 项 | 状态 | 说明 |
|---|---|---|
| T017 US1 取证 | 部分 | E1（图出现）、E3（查看源码）、E4（坏语法回退）、E5（流式不画）已由 E-LIVE 与夹具覆盖；**E2 多图并存、E16 其他代码块不受影响没有专门取证** |
| T019 `session_search` 命中 | 未做 | 未在卸载态用会话检索工具查过该块原文 |
| T020 重装 + 卸载态新会话 | 部分 | 重装恢复已做（E-LIVE）；"卸载后新会话里仍可读"未单独取证 |
| T023 窄屏 + 缩放 | 部分 | 360 px 无横向溢出由图宽夹具覆盖（不是真机窗口缩放）；触屏缩放与复位未在真机试 |
| T025 断网/裸机 | 未做 | 运行期零网络只有静态断言与 `file://` 夹具支撑 |
| T027 `--dump-config` | 改口径 | 本机 PATH 无 `dsh` CLI；改用 check-bundle 的两项宿主机断言，**且这两项不证明提示词段出现在真实会话里** |
| T030 断网 tarball 复跑 | 未做 | 清单已核对，断网复跑未做 |
| T041 真机验证 US5 | 部分 | 应用正常打开与会话正常已确认；"注入畸形宿主"只在夹具里做 |
| T042 宿主升级演练 | 未做 | 未真的升级 DSH 一个版本 |
| T070 0.1.3 重启核对 | 未做 | 运行中的界面仍加载 0.1.2 的 chunk |
| SC-001 计时 | 未做 | 没有"1 秒内出图"的计时 |
| SC-002 检索命中 | 未做 | 同 T019 |
| SC-003 字号下限 | 未做 | 没有图内字号与正文最小字号的比较断言 |
| SC-005 主题切换 | 部分 | 只验证了换 CSS 变量后变色，没做明→暗→明切换 |
| FR-011 提示词消失 | 未做 | 停用插件后提示词段是否消失未取证 |

# Implementation Plan: 会话内的图看得清、有颜色分辨度

**Branch**: `003-diagram-palette-contrast`（仓库自由度内不建分支，工作留在 `main`，与 001/002 一致） | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

## Summary

问题不在模型写图，而在配色映射：`src/client/styles.js:39-57` 把引擎的九行变量接到了宿主最淡的那一层（`--pele-line` 取 `border-l2`＝10% 黑、`--pele-border` 取 `border-l1`＝4% 黑、`--pele-surface` 取 `bg-layer-2`＝与背景同白、`--pele-accent` 取 `brand-primary`＝近黑/近白），于是方框白底白线、连边 1.25:1、描边 1.09:1，且引擎默认给所有节点同一填充，整张图无一处彩色。

本 feature 只改三处能力面：

1. **配色映射**（`src/client/styles.js`）：结构线改用 `label-tertiary`；填充按"图形角色"上色，公式为 `color-mix(in srgb, <语义色> 18%, var(--pele-bg))`，描边为 `color-mix(in srgb, <语义色> 60%, var(--pele-fg))`；色相全部来自宿主既有令牌，浅深两套主题共用同一公式（18% / 60% 已在两套真实令牌上验算，见 [research.md](./research.md) D1）。
2. **角色识别**：引擎给每种 flowchart 形状打出稳定的类名（`pele-shape-stadium`/`-diam`/`-cyl`/`-lean-r`/`-rect` 等 13 种），插件只在这些类上覆盖填充与描边，不改源文本、不改引擎、不要求模型配合；作者写了 `classDef` 时引擎把颜色写成行内样式，天然优先（R8）。
3. **模型侧一句能力说明**（`index.js` 的 `CAPABILITY_TEXT`）：告诉模型"颜色由形状角色决定"，并点出五种约定形状，使模型用常见形状即可得到正确配色（FR-011）。

**验收侧同步做真**：`verify/harness/index.html` 与 `scripts/build-preview.mjs` 目前用的是编造的、比真实宿主好看得多的令牌（`border-l2 #b9bdd0`、`brand-primary #4a6cf7`），325 项检查全绿也证明不了真实环境下看得见。本 feature 让夹具改用真实令牌快照，并新增"相对亮度/对比度"断言，使旧配色在新断言下必然失败。

## Technical Context

**Language/Version**: JavaScript（ES2022、ESM）；宿主半边 `index.js` 无构建，客户端半边由 `scripts/build-client.mjs` 打成自包含 `client.js`

**Primary Dependencies**: 无新增依赖。`color-mix()` 与 SVG 内联样式由宿主 Chromium 提供；`@deepseek-ai/schemastery` 维持 002 的用法

**Storage**: 不涉及。配色不持久化，全部在运行期由 CSS 变量解析

**Testing**: `verify/check-bundle.mjs`（静态/源码断言）+ `verify/harness/index.html`（无头浏览器行为断言，`verify/run-harness.mjs` 驱动，`EXPECTED_CHECKS` 计数）+ 真实令牌下的人工核对与截图

**Target Platform**: DeepSeek Harness Desktop `0.2.2-rc.5`（Electron Web 前端），light 与 dark 两套主题

**Project Type**: 单包插件（宿主半边 + 客户端半边），沿用 001 的双半边结构

**Performance Goals**: 不新增渲染次数与网络请求；纯 CSS 覆盖，主题切换由变量解析自动跟随（无重绘逻辑）

**Constraints**:
- 运行期零网络；不引入第二套主题系统；颜色 MUST 取自宿主主题变量（Constitution 技术约束）
- 不接管宿主 DOM 与样式：只写入 `.dsh-dyslexia-figure` 作用域内的 CSS，不写 `!important`，不改宿主 `body` 上的任何东西
- 卸载后回退文本（001 契约不变）；窄视口不溢出（001/002 契约不变）
- 引擎与作者颜色优先级：插件样式表不得压过引擎写在元素上的行内 `style`

**Scale/Scope**: `styles.js` 新增约 20 行映射 + 约 30 行形状规则；`index.js` 提示词加 1 句；夹具令牌块重写 + 新增对比度/角色色断言约 120 行；`build-preview.mjs` 令牌块改真实值；文档 1–2 处；版本号 `0.2.24` → `0.3.0`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 本 feature 的处理 | 结论 |
| --- | --- | --- |
| I. 默认带偏好，但界面上可见可关 | 只加能力说明，不改 002 的 `visualFirst` 偏好文本与开关语义（FR-011 明文限定）。图变得更清楚不会替读者做"要不要看图"的决定。 | 通过 |
| II. 零环境假设 | 不假设字体、系统工具或网络。`color-mix()` 在宿主 Chromium 可用；不可用时退回上一行声明的纯宿主变量（级联回退，见 D2），不会渲染成空白。 | 通过 |
| III. 依赖自包含 | 无新依赖、无 CDN、运行期零网络；色相用宿主既定令牌，不自带调色板文件。 | 通过 |
| IV. 降级不丢数据 | 只改 CSS 与一句提示词；引擎失败路径、源文本回退、`data-failed` 路径一字不改。作者 `classDef` 仍优先，不被插件覆盖。 | 通过 |
| V. 窄屏先行 | 只改颜色，不改布局、字号、缩放或 `responsive`/`zoom` 选项；360px 与 200% 字体的既有行为不变。填充变深不改变 SVG 尺寸。 | 通过 |
| 技术约束（颜色取自宿主变量、不引入第二套主题） | 九个 `--pele-*` 与五个角色色**全部**是宿主令牌的引用或 `color-mix` 派生，派生基色仍是宿主令牌；不新增十六进制字面色值，不定义自己的主题类或主题选择器，靠变量解析自动跟随主题（无 `data-ds-dark-theme` 之类的宿主实现细节耦合）。 | 通过 |

**Phase 1 后复检**：设计产物（[data-model.md](./data-model.md) 的取值表、[contracts/palette-mapping.md](./contracts/palette-mapping.md) 的变量契约、[contracts/verification-baseline.md](./contracts/verification-baseline.md) 的夹具基线）逐项复核：无写死色值、无 `!important`、无宿主 DOM 写入、无 `body` 级选择器 → 结论不变，仍通过。

## Project Structure

### Documentation (this feature)

```text
specs/003-diagram-palette-contrast/
├── spec.md
├── plan.md                      # 本文件
├── research.md                  # R1–R9 现象与根因 + D1–D6 决策
├── data-model.md                # 角色→令牌→派生色取值表（浅/深两套实测）
├── quickstart.md                # 端到端验证步骤（含"旧配色必须失败"的反向验证）
├── evidence/                    # 复现与原型（compare/types/candidate-palette 及其截图）
├── contracts/
│   ├── palette-mapping.md       # 宿主主题 → 插件 CSS 变量的契约与禁止项
│   └── verification-baseline.md # 夹具令牌基线、对比度阈值与计分口径
├── checklists/
│   └── requirements.md          # 20 条需求质量检查
└── tasks.md                     # Phase 2 输出（/speckit-tasks）
```

### Source Code (repository root)

```text
index.js                         # 宿主半边：CAPABILITY_TEXT 加一句（FR-011）
src/client/
├── styles.js                    # 九行映射重写 + 角色形状规则（本 feature 的主要改动）
├── figure.js                    # 不动（引擎选项与错误分类保持 001 契约）
├── view.js                      # 不动
├── entry.js                     # 不动
├── i18n.js                      # 不动（本 feature 无新读者文案）
└── settings.js                  # 不动（002 的开关不受影响）
client.js                        # 由 scripts/build-client.mjs 生成，随改动重建
scripts/build-preview.mjs        # 预览改用真实令牌值（与夹具同源）
verify/
├── check-bundle.mjs             # 新增：样式表禁止项断言（无 !important、无十六进制色值、无 body 级选择器）
├── harness/index.html           # 真实令牌快照 + 对比度/角色色断言
├── host-tokens.json             # 新增：真实宿主令牌快照（light/dark，含来源与提取日期）
└── run-harness.mjs              # EXPECTED_CHECKS 随新增检查更新
docs/                            # 颜色语义说明（SC-009：颜色来自图形角色）
THIRD-PARTY-NOTICES.md           # 不动（引擎未变）
```

**Structure Decision**: 沿用单包双半边结构，不新增目录层级、不新增运行时模块。核心改动集中在一个已有文件 `src/client/styles.js`，其余是"让证据变真"的验收侧改动与一句提示词。

## 实现方案

### 1. 九个引擎变量重接线（`src/client/styles.js:39-57`）

| 引擎变量 | 现值 | 改为 | 理由 |
| --- | --- | --- | --- |
| `--pele-line` | `border-l2`（10% 黑） | `--dsw-alias-label-tertiary` | 连边、箭头、时序线的主要可见来源；tertiary 实测浅色 3.71:1、深色 7.36:1 |
| `--pele-border` | `border-l1`（4% 黑） | `--dsw-alias-label-tertiary` | 未分类形状的描边，不再是"几乎不存在" |
| `--pele-surface` | `bg-layer-2`（浅色与背景同白） | `color-mix(in srgb, var(--dsw-alias-label-primary) 4%, var(--pele-bg))` | 浅色下有可见的浅底，深色下自动变亮一档；基色仍是宿主令牌 |
| `--pele-surface-alt` | `bg-base` | 保留 | 引擎用于表头、泳道等次级面，语义正确 |
| `--pele-accent` | `brand-primary`（近黑/近白） | `--dsw-alias-link` | 强调色恢复成彩色（deepseek 蓝） |
| `--pele-critical` | `state-error-primary` | 保留 | 已是彩色 |
| `--pele-bg` / `--pele-fg` / `--pele-muted` | 现有 | 保留 | 文字对比度实测 15–19:1，本就合格 |
| `--pele-series-1..8` | 未设置（引擎默认） | 宿主 8 色有序序列（见 data-model.md §4） | 饼图、xychart 柱、gantt 条按类别上色；顺序经计算，相邻两色的色相差均 ≥42° |
| `--pele-font` | `inherit` | 保留 | 字体跟随宿主 |

### 2. 角色 → 形状类 → 色相

引擎输出的每个 flowchart 节点结构已实测确认：

```html
<g class="pele-node pele-shape-diam" data-id="a8" transform="translate(309.82,147.94)">
  <polygon points="0,-43.94 70.31,0 0,43.94 -70.31,0" fill="var(--_s)" stroke="var(--_b)"></polygon>
  <text class="pele-label" x="0" y="5.6" text-anchor="middle">菱形</text>
</g>
```

形状图元用**表现属性**（`fill="var(--_s)"`）而非行内 `style`，所以插件里一条普通 CSS 规则就能覆盖，不需要 `!important`；作者的 `classDef` 走行内 `style`，优先级更高。连边在 `<g class="pele-edges" fill="none" stroke="var(--_l)">` 上继承颜色，箭头是其中的 `path.pele-marker`——只改 `--pele-line` 即可让连线与箭头一起变清楚，无需额外规则。

插件在 `.dsh-dyslexia-figure` 作用域内按类覆盖**形状图元**（`> rect`、`> polygon`、`> circle`、`> path`、`> ellipse`、`> polyline`），不碰 `text`：

| 角色 | 源文本 | 形状类 | 色相令牌 | 浅色填充 | 深色填充 |
| --- | --- | --- | --- | --- | --- |
| 起止 | `A([..])`、`A((..))` | `stadium`、`circle`、`odd` | `--dsw-static-green-500` | `rgb(215,245,226)` | `rgb(35,64,46)` |
| 判断 | `B{..}`、`B{{..}}` | `diam`、`hex` | `--dsw-static-amber-500` | `rgb(253,238,211)` | `rgb(73,57,32)` |
| 数据 | `C[(..)]` | `cyl` | `--dsw-static-violet-400` | `rgb(239,234,254)` | `rgb(59,54,75)` |
| 输入输出 | `D[/../]`、`D[\..\]` | `lean-r`、`lean-l`、`trap-b`、`trap-t` | `--dsw-alias-link` | `rgb(221,230,251)` | `rgb(51,59,75)` |
| 处理（默认） | `E[..]`、`E(..)` | `rect`、`rounded`、`fr-rect` | `--dsw-static-neutral-bluish-400`（非彩色角色） | `rgb(240,241,242)` | `rgb(60,61,63)` |

派生公式（两套主题共用，实测见 [data-model.md](./data-model.md)）：

```css
fill:   color-mix(in srgb, var(<色相>) 18%, var(--pele-bg));
stroke: color-mix(in srgb, var(<色相>) 60%, var(--pele-fg));
```

- 18% 混入背景：浅色下文字对比度 ≥15.1:1、深色下 ≥10.4:1；四个彩色角色的彩色通道差 20–42，肉眼可辨"这一块是绿的/黄的"。
- 颜色只由形状决定，与源文本里的词无关；**处理类刻意不取色相**（见下条），所以"至少四类各自成色"由起止/判断/数据/输入输出承担（FR-012）。
- 60% 混入前景文字色：浅色下描边对背景 4.9–8.0:1、深色下 6.9–10.0:1，跨两套主题一次成型——这正是 R9 的"深色混色坑"的解法：不是按主题换比例，而是换混入的基色（浅色混黑、深色混白）。
- 每条规则先写一行回退声明（`fill: var(--pele-surface)` / `stroke: var(--pele-border)`），再写 `color-mix` 版本，`color-mix()` 不可用时按级联退回宿主纯变量。

**不写 `!important`**：作者 `classDef` 由引擎写成元素行内 `style`，行内样式优先于样式表，无需提权即满足 FR-010（R8）。

### 3. 模型侧一句能力说明（`index.js:32-38`）

在 `CAPABILITY_TEXT` 数组末尾追加一句（英文，与现有提示词同风格）：

> `A picture is drawn with colours that carry meaning — start and end, decision, data, input and output, and a plain step each get their own hue — so write the conventional shapes (`([start])`, `{decision}`, `[(data)]`, `[/input/]`, `[step]`) when you want that reading, and add `classDef` only when a colour must carry a meaning of its own.`

字数与现有段落相当，不加例子代码块，不改变 `PREFERENCE_TEXT`（002 契约不动）。`contracts/` 需同步记录这句的契约位置与"不得扩展为风格指令"的边界。

### 4. 让验收变真

- `verify/host-tokens.json`（新增）：真实宿主令牌快照，形如 `{"source":"app.asar …","extracted_at":"2026-11-26","light":{...},"dark":{...}}`，只收本 feature 用到的键；附提取命令，便于宿主升级后刷新。
- `verify/harness/index.html:8-19`：删掉编造值，按快照生成 light/dark 两套 `body` / `body[data-ds-dark-theme]` 令牌块（夹具自己模拟 dark 作用域，仅供测试）。
- 新增断言（`run-harness.mjs` 计数同步）：
  1. **结构可见**：连边 `stroke` 对背景 ≥3:1；未分类形状描边对背景 ≥3:1；文字对填充 ≥7:1（浅/深各一组）。
  2. **角色成色**：四个彩色角色（起止/判断/数据/输入输出）的 `fill` 两两不等且彩色通道差 ≥20，相邻角色对色相差 ≥20°；处理类不用色相，单独断言其填充与背景对比度 >1.05、描边对背景 ≥3:1（不再是"白底白框"）。
  3. **作者优先**：同一节点同时有 `classDef` 与插件规则时，计算样式取作者值。
  4. **旧配色必然失败**：把 `--pele-line`/`--dsw-alias-border-l2` 临时改回旧映射，第 1 组断言必须报错（用一个"负向自检"检查确认断言本身有牙齿，沿用 002 夹具里"给间谍自检在岗"的手法）。
- `scripts/build-preview.mjs:35-43`：预览令牌改为读同一份快照，避免预览与夹具各说一套。
- `verify/check-bundle.mjs`：新增源码级禁止项——样式表里不得出现 `!important`、不得出现 `#rrggbb`/`rgb(...)` 字面色值（必须走令牌）、不得出现 `body` 级或 `:root` 级选择器。

### 5. 文档与版本

- `docs/`：新增或扩写一节"图里的颜色是什么意思"，说明颜色来自图形角色、作者 `classDef` 优先、深浅主题自动跟随（SC-009）。
- `README*.md`：仅在"图会被画成什么样"相关表述处补一句，避免九份译文大面积改动；若某语种没有对应表述则不改。
- `package.json`：`0.2.24` → `0.3.0`（读者可见行为变化，按 semver 走次版本）；`client.js` 重新构建；`cordis.patch.yml` 不动。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| 用 `color-mix()` 派生填充/描边，而不是直接挑 5 组固定色值 | 宿主 light/dark 令牌不同，写死色值要么浅色丑、要么深色糊；派生让同一份 CSS 在两套主题下都落在可读区间（D1/D2） | 直接引用 `--dsw-static-*-500` 原色做填充：浅色下饱和块压住文字（violet 底 + 近黑字只有 2:1），深色下又太扎眼；按主题写两套规则需要耦合宿主 `data-ds-dark-theme` 属性，违反"不引入第二套主题系统" |

其余原则无违规，无需豁免。

## 交付后核对清单

- [ ] `npm run build` 后 `client.js` 内的样式表含角色规则，且 `npm test` 全绿（检查数已更新）
- [ ] 真实宿主 light/dark 下各截一张图（会话内 flowchart + 一张饼图），对比 [evidence/compare.png](./evidence/compare.png) 证明线可见、角色成色
- [ ] 作者 `classDef` 的图仍按作者颜色渲染
- [ ] 卸载插件后代码块回退为文本；360px 视口与 200% 字体不溢出

# 契约：宿主主题 → 插件配色

本 feature 唯一对外的接口面是 **CSS 变量契约**：宿主提供令牌，插件把令牌接到引擎变量与角色色上；读者与模型看到的颜色是这条链的结果。另一条对外面是提示词里的一句能力说明（见文末）。

## 1. 入向：插件只消费这些宿主令牌

| 令牌 | 用途 | 插件是否可缺席 |
| --- | --- | --- |
| `--dsw-alias-bg-layer-1` | 画布与 `--pele-bg` | 必须存在；缺席时 `--pele-bg` 的 `#fff` 兜底 |
| `--dsw-alias-label-primary` | 正文文字 `--pele-fg`、`--pele-surface` 的派生基色 | 必须存在 |
| `--dsw-alias-label-secondary` | 次要文字 `--pele-muted` | 建议存在 |
| `--dsw-alias-label-tertiary` | **结构线** `--pele-line`、未分类描边 `--pele-border` | 必须存在；这是本 feature 修"看不清"的关键 |
| `--dsw-alias-bg-base` | 次级面 `--pele-surface-alt` | 建议存在 |
| `--dsw-alias-link` | 强调色 `--pele-accent`、输入输出色相 | 必须存在 |
| `--dsw-alias-state-error-primary` | `--pele-critical` | 建议存在 |
| `--dsw-alias-chart-messages` | 序列色 1 | 建议存在 |
| `--dsw-static-green-500` / `-amber-500` / `-violet-400` / `-red-500` / `-neutral-bluish-400` / `-deepseek-400` / `-deepseek-500` | 角色色相与序列色 | 必须存在（静态色板是宿主公开变量） |

**缺席时的行为**：`var(--tok, fallback)` 里的 fallback 只允许是"上一行的宿主引用"或引擎默认值，不允许写新的十六进制字面色（`check-bundle.mjs` 断言）。整套令牌都缺席时（例如宿主换成不兼容版本），图仍是可读的黑白图——降级不丢信息，只是不再有角色色。

## 2. 出向：插件承诺的九个引擎变量 + 五组角色色

| 引擎变量 | 语义 | 契约 |
| --- | --- | --- |
| `--pele-bg` / `--pele-fg` / `--pele-muted` | 画布/文字/次要文字 | 必须与宿主同名令牌一致 |
| `--pele-line` | 连边、箭头、时序线 | 对背景对比度 ≥3:1（浅/深各测） |
| `--pele-border` | 未分类形状描边 | 同上 |
| `--pele-surface` / `--pele-surface-alt` | 未分类填充、次级面 | 与背景有可见差，且不压住文字 |
| `--pele-accent` | 强调 | 必须是彩色（不得来自 `brand-primary` 这类近黑/近白令牌） |
| `--pele-critical` | 错误态 | 保留错误色语义 |
| `--pele-font` | 字体 | `inherit`，不指定字体族 |
| `--pele-series-1..8` | 多类别图 | 八个互不相同的宿主色相 |

角色色规则（详见 [data-model.md](../data-model.md)）：

实测节点结构（引擎 1.13.0）：

```html
<g class="pele-node pele-shape-diam"><polygon fill="var(--_s)" stroke="var(--_b)"></polygon><text class="pele-label">…</text></g>
<g class="pele-edges" fill="none" stroke="var(--_l)"><g class="pele-edge"><path></path><path class="pele-marker"></path></g></g>
```

因此规则形如（以"判断"为例，其余四类同构）：

```css
.dsh-dyslexia-figure .pele-shape-diam :is(rect, polygon, circle, path, ellipse, polyline),
.dsh-dyslexia-figure .pele-shape-hex :is(rect, polygon, circle, path, ellipse, polyline) {
  fill: var(--pele-surface);                                  /* 回退声明，先写 */
  fill: color-mix(in srgb, var(--dx-hue-decision) 18%, var(--pele-bg));
  stroke: var(--pele-border);
  stroke: color-mix(in srgb, var(--dx-hue-decision) 60%, var(--pele-fg));
}
```

色相先落到五个中间变量（`--dx-hue-start-end`、`--dx-hue-decision`、`--dx-hue-data`、`--dx-hue-io`、`--dx-hue-process`），规则只引用中间变量；这样"哪一类用哪个宿主令牌"只在变量块里出现一次，序列色与角色色不会各自抄一份令牌名。

形状图元用表现属性承载默认色，普通 CSS 规则即可覆盖；作者 `classDef` 走行内 `style`，优先级更高，故无需 `!important`。

- 填充 `color-mix(in srgb, <hue> 18%, var(--pele-bg))`
- 描边 `color-mix(in srgb, <hue> 60%, var(--pele-fg))`
- 每条规则必须先写回退声明（`var(--pele-surface)` / `var(--pele-border)`），再写 `color-mix` 版本

**非流程图的主体节点**：`class`、`state`、`er`、`sequence`、`kanban` 画出来的节点类不是 `pele-shape-*`，而是 `pele-state`、`pele-state-start`、`pele-state-end`、`pele-class`、`pele-entity`、`pele-actor-participant`、`pele-card`。这些类一并接角色色：起止符用"起止"绿，其余主体节点用"数据"紫——图的"名词"只有一个可辨认的色相，读者不会把每个状态看成同一个灰方块。检查项：`check-bundle.mjs` 的 `records, states and participants are coloured too`、夹具里每种图的 `colours a node of its own`。

### 2.1 形状清单来自引擎，不来自手写

53 个形状按角色分组，名单由 `vendor/pele/pele.global.js` 的 `var G_=[[…]]` 形状表解析得到（`verify/check-bundle.mjs`）：

| 角色 | 形状（引擎名） |
| --- | --- |
| 起止 | `stadium` `circle` `odd` `sm-circ` `fr-circ` `dbl-circ` `cross-circ` `f-circ` |
| 判断 | `diam` `hex` `bang` |
| 数据 | `cyl` `datastore` `folder` `bucket` `doc` `docs` `lin-doc` `tag-doc` `tag-rect` `st-rect` `win-pane` |
| 输入输出 | `lean-r` `lean-l` `trap-b` `trap-t` `curv-trap` `person` `browser` `cloud` |
| 处理 | `rect` `rounded` `fr-rect` `notch-rect` `lin-rect` `console` `delay` `div-rect` `tri` `flip-tri` `sl-rect` `bow-rect` `brace` `brace-r` `braces` `bolt` `fork` `hourglass` `h-cyl` `lin-cyl` `notch-pent` `flag` `text` |

不变量（构建期检查）：

1. 引擎形状表里的每个形状，样式表里必须有一条角色规则；样式表里不得出现引擎没有的形状名。
2. 同一条规则只许用后代选择器 `:is(… )`（`docs`、`brace` 等把 `<path>` 包在 `<g>` 里，直系子代选不到），且选择器列表中除最后一条外，逗号必须写在 CSS 字符串内部——否则整组选择器会被解析成一个永不匹配的后代选择器（0.3.2 的真实事故）。
3. 多选择器规则的最后一个选择器**不得**带尾逗号（`a, b, c, { … }` 会让整条规则被丢弃）。
4. 处理类只给中性明度档，不给色相；彩色角色（起止/判断/数据/输入输出）必须四类齐全。
5. 树图 `.pele-leaf` 不接管：叶子就是数据，引擎用 `--pele-series-N` 铺满并用画布色写标签，插件不叠角色色。

### 2.2 图种登记表同样来自引擎

引擎注册了 35 个图种（`["id","keyword",/^…/]` 表）。`verify/check-bundle.mjs` 的 `every diagram type the engine registers is sampled or explained` 要求：每个图种要么在夹具里有一个样例（`TYPE_SAMPLES`），要么写进 `TYPE_NOT_SAMPLED` 并说明为什么（当前的解析失败者：`usecase`、`railroad` 族、`eventmodeling`、`swimlane`、`venn`、`treeView`）。夹具的 `typesPass` 对每个样例断言结构线 ≥3:1、文字 ≥4.5:1、节点有独立色相（通道极差 ≥8，仅对彩色角色的形状）；`shapesPass` 对 53 个形状逐主题实测。

## 3. 禁止项（检查会拦住）

1. `!important` —— 会压过作者 `classDef` 的行内样式（FR-010）。
2. `#rrggbb` / `rgb(…)` / `hsl(…)` 字面色值 —— 绕过宿主主题（Constitution 技术约束）。
3. `body`、`:root`、`html` 起头的选择器，或引用 `[data-ds-dark-theme]` 之类的宿主实现属性 —— 不接管宿主 DOM、不自建第二套主题。
4. 给 `text`、`tspan` 设填充色 —— 文字必须保持 `--pele-fg`。
5. 修改 `figure.js` 的引擎选项（`responsive`、`zoom`、`autoDirection`、`directionBreakpoint`、`fontSize`、`padding`）—— 001 契约不动。

## 4. 模型侧契约（`index.js` 的 `CAPABILITY_TEXT`）

追加一句，位置在"语法清单"之后、"回退说明"之前：

> `Shapes set colour: ([start]), {decision}, [(data)]; classDef wins.`
>
> （原文用等宽标记包住每个形状，此处为可读性去掉反引号；逐字版本见链接。）

逐字记录见 [host-prompt.md](./host-prompt.md)。

约束：

- 只描述**能力**（图会怎么被画），不得变成风格指令（不写"你应该用颜色表达…"）。
- 不得写出具体色值（会绕过主题变量，深色下必错）。
- 不得改动 `PREFERENCE_TEXT`（002 契约：偏好段只讲"何时该画图"）。
- 不得要求每张图都写 `classDef`（漏写即退回单色，正是当前问题的成因）。

## 5. 变量接线（`verify/check-bundle.mjs` 读这一块，与 `src/client/styles.js` 逐行相同）

```css
--pele-bg: var(--dsw-alias-bg-layer-1, #fff);
--pele-fg: var(--dsw-alias-label-primary, #1f1f1f);
--pele-muted: var(--dsw-alias-label-secondary, #6e6e6e);
--pele-line: var(--dsw-alias-label-tertiary, #1f1f1f);
--pele-surface: color-mix(in srgb, var(--dsw-alias-label-primary, #1f1f1f) 4%, var(--pele-bg, #fff));
--pele-surface-alt: color-mix(in srgb, var(--dsw-alias-label-primary, #1f1f1f) 20%, var(--pele-bg, #fff));
--pele-border: var(--dsw-alias-label-tertiary, #8a8a8a);
--pele-accent: color-mix(in srgb, var(--dsw-alias-link, #5b7bd5) 55%, var(--pele-fg, #1f1f1f));
--pele-critical: var(--dsw-alias-state-error-primary, #e45756);
--pele-fg-on-light: var(--dsw-static-neutral-bluish-1000, #0f1115);
--pele-fg-on-dark: var(--dsw-static-neutral-bluish-50, #f9fafb);
--pele-font: inherit;
```

`--pele-fg-on-light` / `--pele-fg-on-dark` 是引擎给**作者自选填充**配的墨色（引擎常量 `sc` / `ic`）；不接它们时引擎会退回 `#1f1f1f` / `#fff`，作者在浅底上选深填充就会看不清。


## 6. 主题跟随契约

- 主题翻转时**不重新渲染**：颜色全部由 CSS 变量解析，宿主换主题即换色（001 的既有能力，夹具 `'the picture follows the host colour without reloading'` 已覆盖）。
- 插件不监听、不查询主题状态，不写 `document.body` 的属性或 class。

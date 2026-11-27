# Evidence: 复现脚本与原型

这些页面是**取证**用的，不参与构建，也不进 npm 包（`package.json` 的 `files` 不含 `specs/`）。所有页面都通过相对路径引用仓库内的引擎 `../../../vendor/pele/pele.global.js`，直接用浏览器打开即可。`shipped.html` 由 `node scripts/build-evidence.mjs` 生成，其余是手写探针。

| 文件 | 证明什么 | 截图 |
| --- | --- | --- |
| `probe-compare.html` | 同一张流程图在四种配色下的差别：A 插件现有映射（真实宿主令牌）/ B 引擎默认主题 / C 作者写 `classDef` / D 真实深色令牌 | `compare.png` |
| `probe-types.html` | 11 种图在插件现有映射下的逐类彩色元素计数（flowchart/sequence/state/class/er/gantt/kanban 全为 0；`xychart-beta` 引擎不支持，`svg:false`） | `types.png` |
| `probe-shapes.html` | 引擎为 flowchart 输出的 13 个形状类名，以及节点 DOM 结构（`g.pele-node.pele-shape-X > 图元` + 表现属性 `fill="var(--_s)"`） | — |
| `candidate-palette.html` | 候选配色原型：`--pele-line` 改 `label-tertiary`、五类角色按形状类上色，浅色与深色并排（已被 `shipped.html` 取代，留作设计过程记录） | `candidate-palette.png` |
| `all-shapes.png` | 引擎形状表里的全部 53 个形状，按五个角色分行、浅/深各一套：彩色角色 30 个（起止绿、判断琥珀、数据紫、输入输出蓝）、处理类 23 个中性档 | — |
| `all-types.png` | 流程图之外的 12 个图种实测：状态机、类图、实体图、时序图、看板、旅程、树图、需求、架构、C4、智能体流、块图 | — |
| `shipped.html` | **落地后的真实配色**：`src/client/styles.js` 的样式表 + `verify/host-tokens.json` 的真实浅/深令牌 + 引擎，同一张流程图上下并排，页面底部打印每类角色的填充、文字与描边对比度 | `shipped.png` |

## 怎么复现量测

无头 Chrome 打开页面并导出 DOM，用页面脚本统计计算样式：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --virtual-time-budget=6000 \
  --dump-dom "file://$PWD/probe-compare.html"
```

页面里的 `<pre id="report">` 会打印每个候选方案的填充/描边取值与对比度。

## 落地后的实测数字（`shipped.html`，宿主 0.2.2-rc.5）

| | 浅色 | 深色 |
| --- | --- | --- |
| 连边与箭头对背景 | 3.71:1 | 8.54:1 |
| 方框文字对填充 | 15.1–16.7:1 | 10.4–11.1:1 |
| 方框描边对背景 | 4.9–8.1:1 | 10.1–11.6:1 |
| 五类角色填充 | 绿 `rgb(215,245,226)`、琥珀 `rgb(253,238,211)`、紫 `rgb(239,234,254)`、蓝 `rgb(221,230,251)`、中性 `rgb(240,241,242)` | 对应深色混入量 20% 的取值 |

对照旧配色（`probe-compare.html` 的 A/D 两栏，2026-11-26 量测）：连边 1.25:1 / 1.46:1，描边 1.09:1 / 1.19:1，五类填充同色、彩色 0。

## 已知限制

- 原型里的深色作用域是测试页面自己声明的 `body[data-ds-dark-theme]`，仅用于取证；插件源码不得引用该属性（`check-bundle.mjs` 断言）。`shipped.html` 把深色令牌放在一个容器类上，不触碰 `body` 属性。
- 截图与数字来自 2026-11-27 的宿主令牌值；宿主升级后需按 [quickstart.md](../quickstart.md) 第 4 节刷新快照并重拍、重跑。
- 真机会话截图（装进 profile 后在聊天里看）已于 2026-11-27 补齐，见下面一节；`desktop` profile 现在是 npm 上的 0.3.1（由 GitHub Actions 以 OIDC 发布并带 provenance）。

## 非流程图的主体节点（2026-11-27，Phase 12）

0.3.1 装上后，会话里的 `stateDiagram-v2` 仍不是彩色：角色规则只覆盖 `pele-shape-*`，而状态机的节点类是 `pele-state` / `pele-state-start` / `pele-state-end`，整张图退回中性填充。0.3.2 起，主体节点（`pele-state`、`pele-class`、`pele-entity`、`pele-actor-participant`、`pele-card`）接"数据"紫，端点接"起止"绿。

`evidence/shipped.html` 现在同时渲染五角色流程图与一台状态机（浅/深各两块），页面底部 `<pre id="report">` 打印每类节点实测值：

| 节点 | 浅色 | 深色 |
| --- | --- | --- |
| `pele-state` 填充 / 文字 | `#efeafe` · 16.10:1 | `#3b364b` · 11.12:1 |
| `pele-state` 描边对画布 | 5.86:1 | 10.11:1 |
| `pele-state-start` / `-end` 填充 | `#d7f5e2` · 描边 5.18:1 | `#23402e` · 描边 10.71:1 |

夹具新增每种图一条 `colours a node of its own`：静态 79 + 浏览器 429 全绿。

## 真机会话取证（2026-11-27，T033）

做法：`npm pack` → `dsh plugin --profile desktop add jiezhengj-dsh-dyslexia-0.3.0.tgz`（真实 `desktop` profile 已是 0.3.0）。桌面应用独占该 profile，故复制一份为 `desktop-check`，用 CLI 起真实宿主实例（`dsh --profile desktop-check --no-open --port 50991`），在实例里新开会话、让模型自己按能力说明写 mermaid，再用浏览器量测计算样式并截图。

| 截图 | 场景 | 量测 |
| --- | --- | --- |
| `light-flowchart.png` | 浅色主题，模型自写的缓存失效流程图 | 连边与箭头 `rgb(129,133,140)` = 3.71:1；起止 `color(srgb 0.844 0.959 0.886)`、判断 `0.993 0.932 0.828`、处理 `0.942 0.946 0.950`；文字 `rgb(15,17,21)` |
| `dark-flowchart.png` | 同一张图在深色主题 | 画布 `rgb(21,21,23)`；连边与箭头 `rgb(173,178,184)`；填充 `0.137/0.252/0.182`（绿）、`0.285/0.224/0.124`（琥珀）、`0.235/0.238/0.246`（中性） |
| `dark-pie.png` | 深色主题，模型自写饼图 | 分片 `0.605/0.758/0.978` 等系列派生色；分片标签 `rgb(35,35,36)` 对最坏分片 8.53:1；图例 `rgb(249,250,251)` 对画布 |
| `narrow360-light.png` | 360px 视口 | 图宽 271px，`documentElement.scrollWidth` = 360，无横向溢出 |
| `zoom200-light.png` | 页面 200% 缩放 | 图宽 578px，无横向溢出 |
| `uninstalled-fallback-light.png` | 同一会话卸掉插件后 | 0 个 `dsh-dyslexia-*` 元素，mermaid 块回到代码块文本（`flowchart TD …`） |

容器与临时物：测试用的 `desktop-check` profile 与 `50991` 实例、`npm pack` 的 tarball 都已在取证后删除；`desktop` profile 里是 npm 的 0.3.1，回退用 `dsh plugin --profile desktop add @jiezhengj/dsh-dyslexia@0.2.24`。

发布记录：0.3.0 曾从本机 `npm publish`（无 provenance、无 git 提交），已被 deprecate 指向 0.3.1；0.3.1 走仓库既有流程——提交 → 打标签 `v0.3.1` → 推送 → `.github/workflows/publish.yml` 在 CI 里以 OIDC 发布（`npm view @jiezhengj/dsh-dyslexia@0.3.1 dist.attestations` 可见）。
- `preview.png` —— `docs/preview.svg` 的渲染截图（7649 chars，drawing 529x140），用真实宿主令牌复算后的预览图赏，五类角色同色系。

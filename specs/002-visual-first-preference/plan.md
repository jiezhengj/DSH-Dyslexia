# Implementation Plan: 视觉优先开关与「我有阅读障碍」命名

**Branch**: `002-visual-first-preference` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

## Summary

在现有的 `@jiezhengj/dsh-dyslexia` 包里加三件事：①宿主侧一个可持久化的布尔偏好 `visualFirst`（默认 `true`），它决定模型可见的提示词段里是否追加"图更省力时优先用图"的判据段；②客户端侧在设置「通用设置」区贡献一行开关（复用宿主的 `settings.general.item` 槽），支持键盘与读屏、8 种界面语言；③把插件标题/说明/README 改成「DSH 我有阅读障碍」及 7 种译文。渲染、回退、窄屏、卸载可逆这些 feature 001 的契约不变。

**当前工作树**：`0.2.22`（65 静态 / 306 浏览器；把第十七轮指出的两处空承诺补成真断言：整个浏览器运行期对 `fetch`/`XHR`/`WebSocket`/`sendBeacon` 等的间谍，加上插件自有源码里禁止出现 `globalThis`/`window`/`self`；8 语言标题与 `README*.md` 首行、`meta.description` 首句逐条比对。第十八轮再补：插件自有源码里禁掉计算成员调用、计算键下标、`String.fromCharCode`/`atob`、`setAttribute('src'|'href')` 与 `document.defaultView`（仅允许读计算样式）；命名检查加比 DETAIL 的 alt 文本；样式检查要求拒绝标记跟随状态；夹具为 `Function`/`eval`/`src` 写入加间谍并自检间谍在岗；`zh`/`ja`/`ru` 的失败句不得含拉丁字母；九份 README 不再声称某个旧版本"已安装"。另把 `optional()` 的吞异常收窄到点名服务，并给 `data-failed` 找出真正写它的代码（`0.2.20` 的 64 / 303 记录保留在下面）（`0.2.6` 的运行记录是 commit `c3520c2` / tag `v0.2.6` / run `45302814465`、47 / 280；`0.2.7` 是 commit `a9a2bc9` / tag `v0.2.7` / run `45305735507`、47 / 283；`0.2.8` 是 47 / 283，改的是两条静态检查的执行方式；`0.2.9` 加上退化 face 与乐观帧的夹具，并把严格 inject 的预期拒绝静音；`0.2.10` 给 `slots.inject` 的 owner key 与告警通道加断言（50 / 292）；`0.2.11` 给设置页认领加断言、让 `run-harness` 自己发现陈旧产物（51 / 292）；`0.2.12` 把 `.volatile()` 与槽名检查改成读赋值（52 / 292）；`0.2.13` 把引擎字节纳入指纹、让 `SafeChildren` 的兜底有页面级断言、把样式表交给 `ctx.effect`（55 / 294）；行与开关已在运行中的宿主里观察过，见 `evidence.md` 的 E-LIVE；桌面窗口仍不可达，见 T020 / G1）。

## Technical Context

**Language/Version**: JavaScript（ES2022、ESM），无构建步骤的宿主半边 + 一个用 `scripts/build-client.mjs` 打成的自包含客户端 chunk
**Primary Dependencies**: `@deepseek-ai/schemastery`（唯一新增运行时依赖，MIT，与宿主同为 3.19.0 系列，仅用于声明配置 schema）；React 由宿主提供
**Storage**: 插件在 profile entry 上的配置行（Cordis 配置文件），通过 `settings` / `configForms` 服务读写
**Testing**: `verify/check-bundle.mjs`（静态与源码级断言）+ `verify/harness/index.html`（无头浏览器行为断言，由 `verify/run-harness.mjs` 驱动）+ 真机核对
**Target Platform**: DeepSeek Harness Desktop `0.2.2-rc.5`（Electron 里的 Web 界面前端）
**Project Type**: 单包插件（宿主半边 `index.js` + 客户端半边 `client.js`），沿用 001 的双半边结构
**Performance Goals**: 开关切换的界面反馈 ≤ 1 秒；提示词段求值发生在每次 assemble，无额外 IO
**Constraints**: 运行期零网络；不读写 profile 的 `cordis.patch.yml`；不接管宿主界面；开关缺席不得影响启动与会话
**Scale/Scope**: 新增约 200 行客户端代码 + 约 90 行宿主代码 + 4 条新文案 × 8 语言；不改消息格式、不改包名与入口 id

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 本 feature 的处理 | 结论 |
| --- | --- | --- |
| I. 默认带偏好，但界面上可见可关 | **原则被本 feature 修订**：偏好不再只属于读者的指令文件，而是插件提供的、默认打开且可关闭的开关（v2.0.0）。迁移：001 的行为等价于"开关关闭"。 | 修订后通过（见下方 Amendment） |
| II. 零环境假设 | 不引入新运行时、不假设字体或系统工具；schema 包随包依赖安装，运行期不取网络。 | 通过 |
| III. 依赖自包含 | 新增 `@deepseek-ai/schemastery` 作为 npm 依赖（MIT、无运行期网络），不引 CDN；`index.js` 静态 import 该包，取不到时插件在 import 阶段失败（见 `evidence.md` G8）。 | 通过（依赖随包发布；取不到即不加载，不再声称降级） |
| IV. 降级不丢数据 | 开关只影响"是否鼓励画图"，不影响已渲染内容；关闭插件后开关行消失、历史回退为文本（001 契约不变）。 | 通过 |
| V. 窄屏先行 | 开关行走宿主行的流式布局，设计意图是 200% 字体与 360px 下不溢出（FR-017 / SC-009）。**没有任何 360px / 200% 断言**（见 `evidence.md` G3）。 | 未取证 |
| 技术约束 | 颜色与间距取宿主 token；文案走客户端本地化；通过 slot 贡献，不追加 `document.body` 节点。 | 通过 |

### Amendment 提案（Constitution 1.0.0 → 2.0.0）

- **变更**：原则 I 重写为"默认带偏好，但界面上可见可关"：①偏好在界面上可见、可由读者一键开关，不需要编辑任何指令文件；②偏好文本给出判据，不使用"每次""必须"这类无条件要求；③关闭偏好后行为与"没有这条偏好"的版本逐字等价；④偏好的存在与状态在交付说明中写明，不得暗示"插件中立"。
- **理由**：只渲染不鼓励输出时，阅读障碍读者仍需自己想到"请画图"才有收益；把偏好做成可见、可关的开关，比藏在指令文件里更可控。
- **受影响产物**：`spec.md`（本 feature）、9 份 README 的"不携带偏好"表述、`contracts/host-prompt.md` 的段落说明；001 侧只有 `research.md` 删掉了指向已删除的 `visual-first-agents-snippet.md` 的一句引用，FR-012 原文未改（"不要求改指令文件"仍然成立）。
- **迁移**：001 的用户升级后默认开启；点一次开关即可回到 001 的纯能力行为。

## Project Structure

### Documentation (this feature)

```text
specs/002-visual-first-preference/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── evidence.md                 # 构建/检查/探针输出与未取证项（G2–G8、G11–G24 未取证；G1 的 Web 部分由 0.2.6 的 E-LIVE 关闭（桌面窗口仍不可达），G9/G10 由 0.2.5 关闭；0.2.7 只加固守护，不改变读者所见）
├── contracts/
│   ├── plugin-config.md        # 配置项与宿主侧读取契约
│   ├── settings-row.md         # 设置行的槽契约、DOM/可访问性契约
│   └── host-prompt.md          # 两档提示词文本与判据
├── checklists/
│   ├── requirements.md
│   └── implementation.md       # 实施前清单：哪条断言缺失就在这里不勾
└── tasks.md
```

### Source Code (repository root)

```text
index.js                        # 宿主半边：Config + 提示词段（两档文本）
src/client/
├── entry.js                    # apply：注入样式、注册渲染层、注册设置行
├── i18n.js                     # 12 条渲染文案 + 4 条设置文案 × 8 语言
├── settings.js                 # 新增：设置行组件与 configForms 读写
├── styles.js                   # 渲染层样式 + 设置行样式（沿用宿主 token）
├── figure.js / view.js         # 不变（001 的渲染与降级）
client.js                       # 构建产物（scripts/build-client.mjs 生成）
locale/*.json                   # 8 语言 meta.title/description 改名
docs/DETAIL*.md                # 8 篇说明页只有图片行，新名字只在该图 alt 句
README*.md                      # 索引 + 8 篇：改名、开关说明、偏好措辞
verify/
├── check-bundle.mjs            # 新增静态/源码级断言
├── harness/index.html          # 新增设置行行为断言
└── run-harness.mjs
```

**Structure Decision**: 沿用 001 的"一个包、两个半边"；设置行放在 `settings.general.item`（官方给"单个、无需独立页面的偏好"准备的座位），不新建设置页，不新增侧栏入口，避免为一行开关扩大接触面。

## Phase 0：研究结论（→ `research.md`）

1. 偏好如何进入模型可见指令：`ctx.systemPrompt.section({ name, order, text })`，`text` 可为函数，每次 assemble 求值 → 开关无需重注册。
2. 配置如何声明与持久化：宿主 `Config` + `.volatile()` 字段走 `settings` 服务的表单投影；改值走 `configForms` / `settings` 写操作，不能直接改 `cordis.patch.yml`。
3. 设置行放在哪：`settings.general.item`（kind `list`、scope `root`，owner 不传 props，行自己经 `inject` 面读写），与官方"Composer Enter""Language"行同级。
4. 默认值语义：`.default(true)` 让"没有配置行"的老用户也拿到"视觉优先"；关闭时提示词段退回 001 的纯能力陈述。
5. 依赖：`@deepseek-ai/schemastery`（npm 有 3.19.0，MIT、无运行期网络），用它声明 schema；`index.js` 静态 import，取不到时插件在 import 阶段失败，不降级（见 `evidence.md` G8）。
6. 8 语种命名与设置文案的译法（见 `contracts/settings-row.md` 与 `research.md` 的译名表）。

## Phase 1：设计产物

- `data-model.md`：阅读偏好（两档、默认、持久化、状态迁移）、偏好段落（两档文本与判据）、插件身份（8 语种标题/说明）。
- `contracts/plugin-config.md`：字段名、默认值、读写路径、写失败的降级（缺依赖 = import 失败，不是降级）。
- `contracts/settings-row.md`：槽名与注册项字段、DOM 结构、`role="switch"`/`aria-checked`、键盘行为、4 个设置文案键、视觉与布局要求。
- `contracts/host-prompt.md`：两档提示词原文（英文）、判据清单、禁止措辞。
- `quickstart.md`：E1–E14 的验证脚本（含 8 语言、键盘、外部改动、写失败、缺服务、探针）。

## Phase 2：实施顺序（→ `tasks.md`）

1. 宿主：`Config` + 两档提示词段 + 降级；静态断言先行。
2. 客户端：`settings.js` + 文案 + 样式；夹具先行（假 `configForms`、假 `t`、8 语言、写失败）。
3. 改名：`locale/*.json`、`docs/DETAIL*.md`、9 份 README、`package.json` description。
4. 探针：七十一条编号（F1–F15、P19–P37、M1–M8、N1–N4、Q1–Q7、R1–R4、S1b–S7；其中 F2 是历史记录、P36 按 a–h 拆开）逐条破坏受保护行为，确认断言会红。
5. 文档与证据：spec/plan/data-model/contracts/quickstart/evidence 同步；发版、装回、双评审。

## Complexity Tracking

| 复杂度来源 | 为什么需要 | 更简单的做法为什么不行 |
| --- | --- | --- |
| 新增一个依赖（schema 包） | 设置行的表单投影与写入必须用宿主认得的 schema | 自带手写 schema 会被宿主当作未知形状，无法生成可写的偏好行 |
| 宿主侧两档提示词文本 | 开关的语义就是"模型读到什么" | 让客户端改提示词会让指令随界面状态漂移，且无法在装配期求值 |
| 新增 4 条 × 8 语言文案 | FR-011 要求 8 语言无未翻译键 | 复用渲染层文案会混淆"图的按钮"与"设置项"的语义 |

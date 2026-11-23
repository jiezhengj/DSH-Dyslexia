# Feature Specification: 视觉优先开关与「我有阅读障碍」命名

**Feature Branch**: `002-visual-first-preference`

**Created**: 2026-11-23

**Status**: Implemented in `0.2.0` (2026-11-23); `0.2.1` was an intermediate correction and `0.2.2` an intermediate code change, and the published version is `0.2.5` (run `45240437544`, shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`, 33 files), installed into the live `desktop` profile; six versions are published: `0.2.0`, `0.2.1`, `0.2.2`, `0.2.3`, `0.2.4` and `0.2.5`. `0.2.2` is a code change, not a documentation pass: the settings writer lane hands the row no `setValue` when the host face has no `set` (a click reverts the switch and shows the failure sentence), the liveness check was rewritten to read one registration three times (static check #22), and one browser fixture was added for the no-setter host; that run passed 44 static and 252 browser checks. The eight browser assertions this review added (seven non-zh settings labels plus a direct check that a setter-less face hands the row no writer) are released in `0.2.3`, whose published run passed 44 static and 260 browser checks; `0.2.3` is a build and verification change rather than a logic change: the six sources are unchanged (only the version string and the resulting fingerprint differ), while `scripts/build-client.mjs`, the fixtures and the docs carry the work. Evidence: `evidence.md` in this folder — E-BLD/E-CHK/E-HARN are the `0.2.1` tree (44 static, 251 browser; E-CHK is the complete stdout of that run — its 44 `ok` lines plus the summary — while the 52 deliberately triggered `warn`/stack lines went to stderr), E-PUB/E-INS exist for all six published versions, and E-PROBE records F3–F8 on `0.2.1`, F1 and F9 on the `0.2.3` tree, and F10–F13 on the `0.2.5` tree. Twelve falsifiability probes F1, F3–F13. Not proven: SC-001 (five sample requests), the E1–E14 end-to-end rows, live-window switch operation and live renamed labels, any 200%/360px layout assertion for the settings row, the host write path (`settings.update`, G2), pixel comparison against host rows, the schemastery import-failure path — see gaps G1–G8; G9 and G10 are discharged by `0.2.5`. **Review round 4 (0.2.4)**: the row's write contract was wrong, not just its docs. DSH resolves `set(...)` with `true` for acceptance and `false` for refusal or a skipped write (`dsh-client-ui-settings/src/client/config-form.ts`); the row reported both as saved. `0.2.4` reads the resolved boolean, reverts the switch and shows the failure sentence on `false`, waits for `configForms` through `ctx.inject` instead of reading it eagerly, and pins both: the refusal by `a refused settings write is not reported as saved` (`verify/check-bundle.mjs:535`) plus `a refused write that resolves false puts the switch back and says so`, and the wait by `a host that gains configForms after apply still gets the settings row` (`verify/harness/index.html:1881`, static twin at `verify/check-bundle.mjs:1047`), with the eight per-language hint assertions pinned by `[${lang}] the settings row hint is that language's own sentence` (45 static / 271 browser on the `0.2.4` tree). **Review round 5 (0.2.5, published as commit `0be17fe` / tag `v0.2.5`)**: four further P2 findings, all in the client half and its fixtures. (1) A refused write now restores the value the host holds at the moment of the refusal (`inject.readHostValue` → `readPreference(face)`) instead of the value captured before the click, because the host reloads its mirror and notifies subscribers before it resolves `false` (`dsh-client-ui-settings/src/client/config-form.ts`, `recover()`); the two-window case is pinned by `a refused write keeps the value the host took while it was pending` (`verify/harness/index.html:1549`). (2) `a value the host pushes reaches the switch without a write` (`verify/harness/index.html:1612`) asserts that an externally pushed value reaches the row with no write, in `aria-checked` and in the computed paint colour. (3) The off-state briefing is now compared sentence for sentence with the four `MERMAID_RENDER_PROMPT` sentences parsed read-only out of `specs/001-mermaid-fence-render/contracts/host-prompt.md`, exact equality included, so one changed word in `index.js` goes red (`verify/check-bundle.mjs:401`); this discharges G9. (4) The `pending.then(...)` chain sits inside the `try`, and `a thenable that throws out of then cannot break the click` (`verify/harness/index.html:1676`) watches `window`'s `error` event, because React 18 routes an event-handler throw there instead of rethrowing it from `.click()`. The tree runs 45 static and 274 browser checks; `client.js` is 783360 bytes / 781845 characters, sources sha256 `2b5728286c556d8dbaaa349cc9fb8ec5`, file SHA-256 `279c33781ef551e3d3bbb0aabf3d37a681fd5da4f4738c29c724b596667a8766`. It is committed as `0be17fe`, tagged `v0.2.5`, published by run `45240437544` and installed into the live `desktop` profile; no live window has shown this build yet, because a window that was already open keeps the `0.2.4` chunk until the app restarts, so T020 and G1 still stand.

**Input**: User description: "插件可以有个简单的设置面板，里面有个开关：仅仅是在会话里更好地渲染 mermaid，还是同时更积极地用图形化的方式表达和输出。名称改为 DSH 我有阅读障碍（其他语种按语义翻译）。如果 Agent 并不积极地用图形化的方式输出，渲染再完美也没有意义。"

## 背景

feature 001 交付的是**渲染能力**：会话里出现 `mermaid` 代码块就地画成图。但一个只渲染、不鼓励输出的插件，对阅读障碍读者收益有限——模型默认仍以长段文字作答，图只在读者自己主动要求时才出现。

本 feature 把插件的重心从"画得好"移到"该画的时候画出来"，并修正命名：插件名要说的是读者处境（"我有阅读障碍"），不是渲染器型号。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 在设置里选择"只渲染"还是"渲染 + 视觉优先" (Priority: P1)

读者打开设置，在通用设置区看到一行开关，标题与一句说明；关闭时插件只做渲染（与 feature 001 行为一致），打开时模型还会收到"图更省力时优先用图"的偏好，从下一条回答起生效，重启后保持。

**Why this priority**: 这是本 feature 的全部价值所在——没有它，插件仍然是"读者先想到画图才用得上"的工具；同时它必须可关，让不需要的人保持旧行为。

**Independent Test**: 在已安装插件、开关默认打开的情况下问一个多步骤流程问题，回答里出现图；关闭开关后再问同类问题，回答以文字为主（图仍可被显式要求或模型自行决定）；两次都无需重启。

**Acceptance Scenarios**:

1. **Given** 插件刚安装或刚从旧版本升级，**When** 读者打开设置，**Then** 通用设置区出现一行开关，处于"打开"状态，有标题和一句说明，都用界面语言书写。
2. **Given** 开关处于打开，**When** 读者提出一个用图比用段落更省力的请求，**Then** 模型收到的指令里含"何时该画、何时不必画"的偏好说明。
3. **Given** 开关处于关闭，**When** 读者提出同样的请求，**Then** 模型收到的指令里只有渲染能力说明，没有偏好；渲染行为与 feature 001 完全一致。
4. **Given** 读者切换开关，**When** 下一条消息发出，**Then** 新状态已生效，不需要重启应用或重装插件。
5. **Given** 读者切换过开关，**When** 关闭应用再打开，**Then** 开关保持上次的选择。

---

### User Story 2 - 插件叫"DSH 我有阅读障碍" (Priority: P1)

读者在插件列表、插件说明页与 README 里看到的都是"我有阅读障碍"这层意思，8 种界面语言各有对应说法；包名、入口 id、安装路径、缓存键都不变，升级不需要任何迁移动作。

**Why this priority**: 命名决定读者是否认为自己是对的人；同时改名不得让已安装的用户被迫重装。

**Independent Test**: 分别在 8 种界面语言下打开插件列表与说明页，标题与说明是当地语言且含"阅读障碍/失读症"的意思；从 0.1.x 升级后，消息历史与插件设置都未变化。

**Acceptance Scenarios**:

1. **Given** 界面语言为简体中文，**When** 读者打开插件列表，**Then** 标题是「DSH 我有阅读障碍」，说明页与 README 用的是同一说法。
2. **Given** 界面语言为其余 7 种之一，**When** 读者打开插件列表，**Then** 标题与说明是该语言里"我有阅读障碍"的说法，不出现英文占位或未翻译键。
3. **Given** 读者已安装旧版本，**When** 升级到本版本，**Then** 包名、入口 id、插件设置与消息历史都不变，不需要重装或重新启用。

---

### User Story 3 - 开关本身可用键盘与读屏操作 (Priority: P2)

不用鼠标也能切换；读屏与 TTS 能读出"开关、当前状态、这一行是做什么的"，切换后状态被播报。

**Why this priority**: 这个功能的读者本身就依赖无障碍路径；一个只有鼠标能用的开关对他们是死路。

**Independent Test**: 只用键盘 Tab 到开关并用空格/回车切换，读屏（或无障碍树）报出角色、名称、开/关状态；切换后播报新状态。

**Acceptance Scenarios**:

1. **Given** 设置面板打开，**When** 读者用键盘移动到开关，**Then** 开关可聚焦，无障碍树里角色是开关、名称是界面语言的标题、状态与当前值一致。
2. **Given** 开关聚焦，**When** 读者按空格或回车，**Then** 状态翻转，切换结果被播报，外观与状态一致（不出现"看起来开了但其实没保存"）。
3. **Given** 界面宽度为手机竖屏宽度，**When** 读者看到这一行，**Then** 标题与说明换行不溢出、不遮挡开关。

---

### User Story 4 - 状态变化不崩、不撒谎 (Priority: P2)

开关读不到、写不进、被更高优先级配置覆盖，或别处改了同一个值时，界面如实反映；会话、渲染、插件启动都不受影响。

**Why this priority**: 读者可能是这台机器上唯一的用户，也可能是被 IT 集中管理的一份配置；两种情况都不该出现白屏或"显示已开但实际未生效"。

**Independent Test**: 断网、宿主服务缺失、写入被拒、外部改值四种情况下，界面显示与实际生效值一致，应用不报错、不卡死。

**Acceptance Scenarios**:

1. **Given** 读取偏好失败或快照缺字段，**When** 读者打开设置，**Then** 开关按默认值（打开）显示，不显示崩溃或空白页。
2. **Given** 读者切换开关但写入被拒，**When** 操作结束，**Then** 界面回到实际生效值，并给出可见的失败提示，不谎报已保存。
3. **Given** 配置在别处（例如配置文件）被改动，**When** 设置面板处于打开状态，**Then** 开关无需刷新就跟随新值。
4. **Given** 宿主没有提供 `configForms`（没有可写的设置面），**When** 应用启动，**Then** 设置行整个缺席（没有禁用态），插件仍提供渲染，会话内容不受影响。

### Edge Cases

- 从没有本开关的旧版本升级：配置里没有这一项，插件必须按默认值（打开）工作，且不因为"缺少字段"而报错。
- 读者快速连续切换：界面不得出现开关抖动或回退到旧值；最终状态与实际保存值一致。
- 两个窗口同时打开设置：一个窗口改动后，另一个窗口跟随。
- 关闭插件：开关行、偏好段一并消失；重新启用后回到关闭前的值（因为值存在插件配置里，随插件一起保留）。
- 宿主升级后配置 schema 多出未知字段：插件忽略未知字段，不阻塞启动，不丢既有值。
- 界面语言在运行中切换：开关的标题与说明立刻跟随，不重载页面。
- 偏好段文本本身被误判为"强制要求"：必须有明确判据（何时画、何时不必画），不得出现"每次都画""必须以图作答"这类话。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 设置面板 MUST 在通用设置区提供一行开关，包含标题与一句说明；两档分别是"只渲染"和"渲染 + 视觉优先"。
- **FR-002**: 开关 MUST 默认处于"渲染 + 视觉优先"，对全新安装与从旧版本升级同样成立。
- **FR-003**: 开关打开时，模型可见的指令 MUST 含偏好段落：说明何时用图更省力（流程、结构、对比、多步骤、状态迁移等），并明确简单问题仍用文字。
- **FR-004**: 开关关闭时，模型可见的指令 MUST NOT 含该偏好段落，只保留渲染能力说明；渲染行为与 feature 001 一致。
- **FR-005**: 切换 MUST 在不需要重启、不需要重装的情况下对下一条消息生效。
- **FR-006**: 选择 MUST 持久保存，应用重启后保持。
- **FR-007**: 开关显示的状态 MUST 等于实际生效值；被外部改动时界面 MUST 跟随更新，无需刷新页面。
- **FR-008**: 写入失败 MUST 以可见方式告知读者，并把界面恢复为实际生效值，不得显示未生效的状态。
- **FR-009**: 宿主缺少配置/设置能力时，插件 MUST 继续提供渲染；开关缺席 MUST NOT 使应用无法启动或会话无法使用。
- **FR-010**: 开关 MUST 可键盘操作，并在无障碍信息里表现为"开关"角色、带界面语言名称与当前开/关状态；切换结果 MUST 被播报。
- **FR-011**: 开关的标题与说明 MUST 在 8 种界面语言里都有译文，且不含未翻译的键名或英文占位。
- **FR-012**: 插件标题与说明 MUST 在 8 种界面语言里改为"我有阅读障碍"的当地说法；说明页与随包 README MUST 使用同一说法。
- **FR-013**: 改名 MUST NOT 改变包名、入口 id、安装路径、配置项标识与消息格式；升级 MUST NOT 需要迁移动作或重装。
- **FR-014**: 插件 MUST NOT 要求读者编辑任何指令文件来获得上述行为（沿用 feature 001 的约束）。
- **FR-015**: 偏好段落 MUST 用判据表达，禁止"每次""必须"这类无条件要求；关闭开关后 MUST 完全不带该段。
- **FR-016**: 开关行 MUST 与设置面板既有行使用同一套视觉语言（同一左对齐基线、同一标题字号与字重、同一说明字号与次要色、同一行内边距与分隔方式），不得出现自绘按钮、独立配色或第三方控件的默认外观。
- **FR-017**: 开关行 MUST 在 8 种界面语言、系统字体放大到 200%、以及手机竖屏宽度下都不截断、不重叠、不横向溢出；语言切换时标题与说明 MUST 原地更新。

### Key Entities

- **阅读偏好（Reading preference）**: 两档选择——只渲染 / 渲染 + 视觉优先；默认"渲染 + 视觉优先"；随插件配置持久化。
- **偏好段落（Preference text）**: 仅在"视觉优先"档加入模型可见指令的文字，含何时用图、何时不用的判据。
- **插件身份（Plugin identity）**: 8 种界面语言下的标题与一句说明；包名与入口 id 不变。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开关打开后，面对固定 5 个"用图更省力"的样板请求，至少 3 个回答里出现可渲染的图；关闭时同一批样板仍至少 1 个出现图（能力未丧失，只是不再被鼓励）。
- **SC-002**: 切换开关后第一条新消息即反映新状态，读者不需要重启、重装或改任何文件（0 次重启）。
- **SC-003**: 重启应用后，开关状态与重启前一致（对比 2 次，均一致）。
- **SC-004**: 8 种界面语言下，开关标题、说明与插件名全部是该语言的译文，未翻译键数量为 0。
- **SC-005**: 切换操作在 1 秒内反映到界面；写入失败时 1 秒内出现可见提示，且显示值与实际生效值一致。
- **SC-006**: 关闭插件后，历史消息回到纯文本代码块呈现，开关行消失；重新启用后开关回到关闭前的值（沿用 feature 001 的可逆性）。
- **SC-007**: 只用键盘可完成"聚焦 → 切换 → 读到新状态"三步，读屏或无辅助工具的无障碍树中角色、名称、状态齐备。
- **SC-008**: 开关行与相邻官方设置在截图级对比中同属一套视觉语言：标题基线对齐、说明字号与次要色一致、行距与分隔方式一致（逐项对照，允许 1px 级差异）。
- **SC-009**: 8 种界面语言 × 200% 字体放大 × 360px 栏宽共 24 种组合下，开关行不截断、不重叠、不产生横向滚动。

## Assumptions

- 读者用的就是本机这一份 DSH 安装；不涉及多设备同步。
- "视觉优先"只影响模型何时选择用图，不改变图的语法、渲染、缩放、回退与复制行为。
- 偏好段落用英文书写（模型读的是英文），界面文案走 8 种界面语言。
- 默认值按读者明确要求设为"渲染 + 视觉优先"；这打破了 feature 001 的"插件不携带偏好"约定，因此 Constitution 原则 I MUST 在本 feature 计划阶段修订（版本升为 2.0.0），并说明迁移与影响。
- 声明配置项需要一个 schema 能力；当前实现直接在 `index.js` 顶部静态 import `@deepseek-ai/schemastery`，拿不到该包时插件在 import 阶段失败（见 `evidence.md` G8），没有可切换的降级。
- 改名只改展示层名称与文案，不改包名、入口 id 与文件名（分发与升级路径保持稳定）。

# Feature Specification: 视觉优先开关与「我有阅读障碍」命名

**Feature Branch**: `002-visual-first-preference`

**Created**: 2026-11-23

**Status**: Implemented in `0.2.0` and corrected through `0.2.20`; the published tree is `0.2.20`, and twenty versions of this feature are published (`0.2.0`–`0.2.20`) — the package as a whole carries more versions (the earlier `0.1.x` line and one `0.0.0-stage` placeholder), of which these twenty are this feature's. `0.2.5` registered the settings row and rendered nothing where a reader would look; `0.2.6` fixed the three causes (the host hands `hooks` over as hook props, the store needs `getSnapshot`, `ctx.locale` throws under strict `inject`) and was the first build whose row was seen in a running host; `0.2.7`–`0.2.19` each turned evidence that could not fail into an assertion that does, one review round at a time; `0.2.20` closes the sixteenth round's three hollow promises (the network guard could be bypassed with a string-keyed global lookup, a fixture condition could read a constant, and the settings row's own stylesheet had no assertion) and gives the row's classes a rule-level check. This tree: 64 static and 303 browser checks, `client.js` 788314 bytes / 786797 characters, sources sha256 `b6c1b8f2c46c49466ced702258d8ce19`. Evidence lives in `evidence.md`: its `0.2.20` E-BLD/E-CHK/E-HARN blocks are one run of this tree copied line for line, build line included, E-PUB/E-INS exist for every published version of this feature, E-PROBE holds sixty probe ids, and E-GAPS lists what is not proven (G2–G8 and G11–G23 open; G1 discharged for the web surface only, because the desktop window of this build offers no reachable settings control; G9 and G10 discharged by `0.2.5`).

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
2. **Given** 开关聚焦，**When** 读者按空格或回车，**Then** 状态翻转，切换结果被播报；宿主给出答案后，外观与实际生效值一致（不出现"看起来开了但其实没保存"）；写入始终不落定时，行可能停在读者请求的值（`evidence.md` G11）。
3. **Given** 界面宽度为手机竖屏宽度，**When** 读者看到这一行，**Then** 标题与说明换行不溢出、不遮挡开关。

---

### User Story 4 - 状态变化不崩、不撒谎 (Priority: P2)

开关读不到、写不进、被更高优先级配置覆盖，或别处改了同一个值时，界面如实反映；会话、渲染、插件启动都不受影响。

**Why this priority**: 读者可能是这台机器上唯一的用户，也可能是被 IT 集中管理的一份配置；两种情况都不该出现白屏；宿主给出答案后，就不该出现"显示已开但实际未生效"——写入始终不落定时，行可能停在读者请求的值（`evidence.md` G11）。

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
- **FR-002**: 开关 MUST 默认处于"渲染 + 视觉优先"，对全新安装与从旧版本升级同样成立。（升级路径的"原地升级"未取证，见 E-GAPS 的 G21。）
- **FR-003**: 开关打开时，模型可见的指令 MUST 含偏好段落：说明何时用图更省力（流程、结构、对比、多步骤、状态迁移等），并明确简单问题仍用文字。
- **FR-004**: 开关关闭时，模型可见的指令 MUST NOT 含该偏好段落，只保留渲染能力说明；渲染行为与 feature 001 一致。
- **FR-005**: 切换 MUST 在不需要重启、不需要重装的情况下对下一条消息生效。
- **FR-006**: 选择 MUST 持久保存，应用重启后保持（持久化本身由 `evidence.md` G20 的写入断言覆盖；「重启后保持」目前只有 E-LIVE 的一次观察）。
- **FR-007**: 开关显示的状态 MUST 在宿主给出答案之后等于实际生效值；一次写入从点击到落定之间，行允许先显示读者请求的值（`src/client/settings.js:110-113` 的 `show()` 在 `injected.setValue` 之前就把值写进 store，此时宿主尚未接受），落定后按宿主答案显示；被外部改动时界面 MUST 跟随更新，无需刷新页面。宿主永不回答的写入不在本条保证内（见 `evidence.md` G11）。
- **FR-008**: 写入失败（resolve `false`、reject，或 thenable 的 `then` 抛错）MUST 以可见方式告知读者，并把开关恢复为宿主当前值：`restore()`（`src/client/settings.js:127-138`）经 `inject.readHostValue()` → `readPreference(face)`（`:48-58`）重读宿主快照。`readHostValue` 只要有 face 就会挂上（`:243-245`），而设置行只在有 face 时注册（`src/client/entry.js:176-177`），所以任何已挂载的行都会真正重读宿主，点击前捕获的值只在 `readHostValue` 缺席时生效——即没有已挂载行的时候（该捕获值还可能已被另一个窗口改过）。退化情形：face 缺 `getSnapshot`、`getSnapshot` 抛错或快照不可读时，`readPreference` 返回默认 `true`，从不表示读不到，行因此回到 `true` 而不是捕获值，可能在没有保存写入的情况下显示为打开（`evidence.md` G12）；MUST NOT 停在读者点出而宿主未接受的值上。
- **FR-009**: 宿主缺少配置/设置能力时，插件 MUST 继续提供渲染；开关缺席 MUST NOT 使应用无法启动或会话无法使用。
- **FR-010**: 开关 MUST 可键盘操作，并在无障碍信息里表现为"开关"角色、带界面语言名称与当前开/关状态；切换结果 MUST 被播报。键盘触发本身是浏览器原生的 `role="switch"` 行为，夹具只断言角色、名称、`aria-checked` 与可聚焦性（见 `evidence.md` G6）。
- **FR-011**: 开关的标题与说明 MUST 在 8 种界面语言里都有译文，且不含未翻译的键名或英文占位。
- **FR-012**: 插件标题与说明 MUST 在 8 种界面语言里改为"我有阅读障碍"的当地说法；说明页与随包 README MUST 使用同一说法（这一句没有断言，只在 zh/en/de 上人工核对过，见 `evidence.md` G13）。
- **FR-013**: 改名 MUST NOT 改变包名、入口 id、安装路径、配置项标识与消息格式；升级 MUST NOT 需要迁移动作或重装。（**未取证**：每次安装都是先 `remove_bundle` 再重装，原地升级从未观察过，见 E-GAPS 的 G21。）
- **FR-014**: 插件 MUST NOT 要求读者编辑任何指令文件来获得上述行为（沿用 feature 001 的约束）。
- **FR-015**: 偏好段落 MUST 用判据表达，禁止"每次""必须"这类无条件要求；关闭开关后 MUST 完全不带该段。
- **FR-016**: 开关行 MUST 与设置面板既有行使用同一套视觉语言（同一左对齐基线、同一标题字号与字重、同一说明字号与次要色、同一行内边距与分隔方式），不得出现第三方控件的默认外观；本插件自绘的 `button.dsh-dyslexia-switch` 是唯一例外（几何与配色由 `contracts/settings-row.md` 规定），它与宿主开关的像素级一致性从未对比，见 E-GAPS 的 G5。
- **FR-017**: 开关行 MUST 在 8 种界面语言、系统字体放大到 200%、以及手机竖屏宽度下都不截断、不重叠、不横向溢出；界面语言切换后，标题与说明 MUST 用新语言显示（宿主重渲染该行时即生效；「原地更新」与「整行重挂载」在本夹具中不可区分，见 E-GAPS G23）。

### Key Entities

- **阅读偏好（Reading preference）**: 两档选择——只渲染 / 渲染 + 视觉优先；默认"渲染 + 视觉优先"；随插件配置持久化。
- **偏好段落（Preference text）**: 仅在"视觉优先"档加入模型可见指令的文字，含何时用图、何时不用的判据。
- **插件身份（Plugin identity）**: 8 种界面语言下的标题与一句说明；包名与入口 id 不变。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开关打开后，面对固定 5 个"用图更省力"的样板请求，至少 3 个回答里出现可渲染的图；关闭时同一批样板仍至少 1 个出现图（能力未丧失，只是不再被鼓励）。（**未取证**：需要真实模型会话，见 E-GAPS 的 G7。）
- **SC-002**: 切换开关后第一条新消息即反映新状态，读者不需要重启、重装或改任何文件（0 次重启）。**未取证**：见 `evidence.md` E-GAPS 的 G6 与 E4 一节。
- **SC-003**: 重启应用后，开关状态与重启前一致（对比 1 次：`0.2.8` 的 Web 复核，E-LIVE 的 restart 行，一致）。
- **SC-004**: 8 种界面语言下，开关标题、说明与插件名全部是该语言的译文，未翻译键数量为 0。
- **SC-005**: 切换操作在 1 秒内反映到界面；写入失败时 1 秒内出现可见提示，且显示值与实际生效值一致。（这一条**没有计时断言**：夹具只检查状态与提示是否出现，不测耗时——见 `evidence.md` G14。）
- **SC-006**: 关闭插件后，历史消息回到纯文本代码块呈现，开关行消失；重新启用后开关回到关闭前的值（沿用 feature 001 的可逆性）。（**未取证**：真机卸载只观察到行消失，见 E-GAPS 的 G6 与 E14。）
- **SC-007**: 只用键盘可完成"聚焦 → 切换 → 读到新状态"三步，读屏或无辅助工具的无障碍树中角色、名称、状态齐备。键盘触发未被夹具驱动（只断言角色、名称、状态与可聚焦性，见 `evidence.md` G6）。
- **SC-008**（未取证：G5）: 开关行与相邻官方设置在截图级对比中同属一套视觉语言：标题基线对齐、说明字号与次要色一致、行距与分隔方式一致（逐项对照，允许 1px 级差异）。
- **SC-009**（未取证：G3）: 8 种界面语言（200% 字体放大、360px 栏宽为固定条件）共 8 种组合下，开关行不截断、不重叠、不产生横向滚动。

## Assumptions

- 读者用的就是本机这一份 DSH 安装；不涉及多设备同步。
- "视觉优先"只影响模型何时选择用图，不改变图的语法、渲染、缩放、回退与复制行为。
- 偏好段落用英文书写（模型读的是英文），界面文案走 8 种界面语言。
- 默认值按读者明确要求设为"渲染 + 视觉优先"；这打破了 feature 001 的"插件不携带偏好"约定，因此 Constitution 原则 I MUST 在本 feature 计划阶段修订（版本升为 2.0.0），并说明迁移与影响。
- 声明配置项需要一个 schema 能力；当前实现直接在 `index.js` 顶部静态 import `@deepseek-ai/schemastery`，拿不到该包时插件在 import 阶段失败（见 `evidence.md` G8），没有可切换的降级。
- 改名只改展示层名称与文案，不改包名、入口 id 与文件名（分发与升级路径保持稳定）。

## 完成状态

**待复评（2026-11-24）。** 前十轮独立评审（每轮一份文档、一份实现）在 `0.2.0`–`0.2.13` 上都抓到过问题，逐轮修法与红行记在 `evidence.md` 的 E-PROBE；第八轮的发现（`.volatile()` 从未被断言、槽名检查可被同文诱饵骗过、九份 README 落后于真机观察）修进 `0.2.12`，第九轮的发现（`SafeChildren` 兜底只有一句 grep 证明、引擎字节不在指纹里、`package-lock` 版本落后、`entry.js` 注释里藏了一个控制字符、九份 README 的安装句仍写「开关没在真机窗口观察」）修进 `0.2.13`。第十一轮在 `0.2.14` 上运行（T091：实现 PASS、文档 FAIL）；第十二轮在 `0.2.15` 上运行（T099：两份均 FAIL），其发现（引擎句子无断言、拒绝路径不可观测、条件守卫可被真值判断骗过、注释诱饵）修进 `0.2.16`（T100–T104）；第十三轮在 `0.2.16` 上运行（T106：两份均 FAIL），其发现（偏好段与 002 契约文本从未逐字比对、无条件措辞清单过窄、FR-017 无断言、`slots.register` 无兜底）修进 `0.2.17`（T107–T114）；第十四轮在 `0.2.17` 上运行（T115：实现 PASS、文档 FAIL），其十一条文档发现与自证构建行修进 `0.2.18`（T116–T121）。各轮评审任务尚未全部勾选（T030/T045/T054/T062/T069/T084/T130）；第十六轮（T130）的两份结论与 `0.2.20` 的修复见 `evidence.md` 的 E-PROBE Q1–Q7；两份 PASS 之前，本条目的状态是「已实现、未通过评审」。

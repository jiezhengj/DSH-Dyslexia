# Contract: 提示词两档文本

段名 `ui:dsh-dyslexia`，`order 9000`，出现在系统提示词的 `plugin` 分区。

## 能力段（两档共有，逐字沿用 001）

```text
The chat UI draws a Markdown code block whose language word is `mermaid` as a diagram, in place inside the conversation. The code of that block is the diagram, so it has to carry everything the picture shows: without the renderer it is shown as source text. Syntax is Mermaid (flowchart, sequence, class, state, entity relationship, gantt, timeline, mindmap, kanban, xychart, C4 and architecture). An invalid or oversized diagram falls back to its source with a one-line reason, so the block must stay readable alone.
```

## 偏好段（仅 `visualFirst === true`）

```text
The reader finds long stretches of prose hard work. When a flow, a structure, a comparison, a state change or a multi-step procedure would land faster as a picture, lead with a `mermaid` block and keep the surrounding prose to what the picture cannot show. Do not add a picture when one sentence already answers the question, and never pad an answer with a drawing that only repeats the text.
```

## 判据（写进偏好段的目的，验收时逐条核对）

1. 触发：流程 / 结构 / 对比 / 状态迁移 / 多步骤 —— 图能减少阅读量的场合。
2. 不触发：一句话能答完的问题、需要精确措辞的法律/数字结论、图只会重复文字。
3. 图文分工：图承担结构，文字只补图里没有的约束与结论。

## 禁止措辞（静态断言守护）

- 偏好段（仅开关打开时追加的那一段）不得出现十三种无条件措辞（`always`、`every answer`、`every reply`、`every response`、`every time`、`each answer`、`each reply`、`each time`、`at all times`、`without exception`、`no matter what`、`unconditionally`、`must `），`the switch adds the preference on top of the capability, and nothing else` 对它们逐个做小写子串断言，并把整段与 feature 002 的文本逐字比较。
- 能力段（开关关闭时输出的那一段）不得出现 `always`、`must use`、`you should`、`every answer`、`prefer`；`the capability briefing is what it was before the switch` 对这五条做大小写不敏感的子串断言。
- 偏好段（开关打开时新增的那一段）不得出现无条件措辞：`always`、`every answer`、`every reply`、`every response`、`every time`、`each answer`、`each reply`、`each time`、`at all times`、`without exception`、`no matter what`、`unconditionally`、`must `（13 条，尾随空格也算判定的一部分）；`the preference is not feature 002's text any more` 先逐条断言，再把这一段与 `contracts/host-prompt.md` 里记录的契约文本逐字比对（`extra === recordedPreference`）。
- 这两张表守护的是上面列出的整词/短语：能力段里不带限定的 `must`（“the block must stay readable alone”）是允许的；偏好段的 13 条连裸 `must ` 与 `each reply` 都算。判据是否足够具体仍靠人工核对。
- 不得要求读者改任何指令文件。
- 不得声称图能替代源码（源码必须可复制、可检索）。

## 组装规则

- `visualFirst === false`：输出能力段单独一段，与 001 逐字相同。
- `visualFirst === true`：能力段 + 空行 + 偏好段，共两段。
- 段 MUST NOT 在读不到的配置上抛错：读到 `undefined` 视为 `true`。

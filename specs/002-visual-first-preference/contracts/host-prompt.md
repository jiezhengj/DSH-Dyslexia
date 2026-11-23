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

- 不得出现 `must`、`always`、`every answer`、`each reply` 这类无条件要求。
- 不得要求读者改任何指令文件。
- 不得声称图能替代源码（源码必须可复制、可检索）。

## 组装规则

- `visualFirst === false`：输出能力段单独一段，与 001 逐字相同。
- `visualFirst === true`：能力段 + 空行 + 偏好段，共两段。
- 段 MUST NOT 在读不到的配置上抛错：读到 `undefined` 视为 `true`。

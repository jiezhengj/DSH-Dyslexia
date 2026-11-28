# 契约：能力说明里的那一句颜色

003 只给模型的**能力说明**（`index.js` 的 `CAPABILITY_TEXT`，只在能力块里，不动偏好段）加一句：颜色跟着形状走，`classDef` 优先于插件。其余四句逐字沿用 001 的契约。

理由与取舍见 [research.md](../research.md) D5。要点：

- 只陈述**能力**（图会怎么被画），不写成风格指令（"你应该用颜色…"）。
- 不写具体色值：色值属于宿主主题，写死在提示词里在深色下必错。
- 不要求每张图都写 `classDef`：漏写会退回单色，正是 003 要修的成因；作者写 `classDef` 时插件的角色色让位。

## 逐字契约（`verify/check-bundle.mjs` 读这一块）

```js
const CAPABILITY_TEXT = [
  'The chat UI draws a Markdown code block whose language word is `mermaid` as a diagram, in place inside the conversation.',
  'The code of that block is the diagram, so it has to carry everything the picture shows: without the renderer it is shown as source text.',
  'Syntax is Mermaid (flowchart, sequence, class, state, entity relationship, gantt, timeline, mindmap, kanban, xychart, C4 and architecture).',
  'Shapes set colour: `([start])`, `{decision}`, `[(data)]`; `classDef`/`style` win; a quote must wrap the whole label.',
  'An invalid or oversized diagram falls back to its source with a one-line reason, so the block must stay readable alone.',
].join(' ')
```

前四句与 001 契约（`specs/001-mermaid-fence-render/contracts/host-prompt.md`）逐字相同，新句插在"语法清单"之后、"回退说明"之前；整段受 100 词预算约束（原 95 词，0.3.4 加"引号须包住整段标签"这半句后为 100 词，见 tasks.md 的 Phase 14）。

## 模型侧期望

写流程图时用常规形状（`([start])`、`{decision}`、`[(data)]`、`[/input/]`、`[step]`），图就会被画成"起止/判断/数据/输入输出各一色、普通步骤中性"；只有颜色本身要表达别的含义时才写 `classDef`。

标签里要用引号时，把整段标签用直引号包住（`A["他说\"好\""]` 不行，`A["他说#quot;好#quot;"]` 或 `A[他说「好」]` 可以）——裸写 `"` 会被引擎当成字符串 token，整张图退回源码。

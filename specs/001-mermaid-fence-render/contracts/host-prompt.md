# 契约：宿主半边的提示词段

**消费者**：模型（经宿主的 `ctx.systemPrompt` 装配）。

# 导出面（`index.js`）

```js
export const name = 'dsh-dyslexia'
export const inject = ['systemPrompt']

export function apply(ctx) {
  try {
    const systemPrompt = ctx?.systemPrompt
    if (!systemPrompt || typeof systemPrompt.section !== 'function') return
    systemPrompt.section({
      name: SECTION_NAME,   // 'ui:dsh-dyslexia'
      order: SECTION_ORDER, // 9000
      text: MERMAID_RENDER_PROMPT,
    })
  } catch (error) {
    console.warn('[dsh-dyslexia] prompt section skipped:', error)
  }
}
```

**约束**

| 约束 | 理由 |
|---|---|
| `name` 用 `'dsh-dyslexia'` | 与 patch `id` 无关，是 Loader 身份标识 |
| `inject` 只列 `systemPrompt` | 少一条注入少一条失败路径；不在浏览器宿主里要求任何服务 |
| `order` 用固定有限数值（9000） | 官方文档允许"External contributions may use any finite order"；9000 落在第一方指引之后、persona 后缀（10200）之前 |
| 用 `ctx.systemPrompt.section(...)` 的返回值做自动注销 | 该调用已绑定 `systemPrompt.section()` 这个 effect label，插件卸载即撤销 |
| 不注册工具、不注册命令、不注册设置项 | 能力播报不该新增任何可调用面（research D4） |
| 不注册动态 context | 静态事实；动态 provider 会打乱提示词缓存 |
| 不读写文件、不发网络请求 | 宪法原则 II / III |

# 文本契约（`MERMAID_RENDER_PROMPT`）

**必须包含**（四件事，缺一不可）：

1. 事实：标记为 `mermaid` 的 Markdown 代码块会在会话里**就地**渲染成图（不是被保存成文件，也不在侧栏）。
2. 图源即信息：渲染结果可以随时丢弃，所以代码块本身必须写全图里的信息，文字要能独立读懂。
3. 支持的语法范围：Mermaid 语法（flowchart / sequence / class / state / ER / gantt / timeline / mindmap / kanban / xychart / C4 / architecture 等内置图类型）。**不写具体版本号**：版本号会在宿主升级后变成错误信息，实测内联引擎为 1.13.0 时该段刻意不带版本。
4. 失败可见：语法不合法或规模超限时，读者看到的是代码块本身加一句原因说明——因此不要指望"渲染器帮你兜底表达"。

**必须不包含**（违反即视为破坏原则 I）：

- 任何"总是 / 必须 / 尽量使用图"的偏好指令（偏好属于使用者自己的 AGENTS.md）。
- 任何"什么内容用什么图类型"的映射表。
- 任何篇幅、段落、结尾条数、节点上限的规定。
- 任何工具名、命令名、设置项、文件路径，或"请调用…"的祈使句。
- 任何"未安装时降级为…"的说明（模型不需要知道插件安装态，安装态由宿主报告）。

**文本长度**：一句话事实 + 一句话信息完整性 + 一句语法范围 + 一句失败可见，合计 ≤ 4 句 / ≤ 90 词（中文 ≤ 150 字），与会话里其他段落的篇幅量级相当。

# 卸载与禁用行为

| 事件 | 期望 | 验证方式 |
|---|---|---|
| 插件卸载 | 段落从下一轮装配起消失；后续对话不再出现"只有装插件才看得懂"的内容 | 卸载后新开一轮，检查提示词里不再有该段（`--dump-config` 或会话日志） |
| 插件禁用（不卸载） | 同上 | 同上 |
| 宿主升级 | 若 `ctx.systemPrompt` 或 `section()` 签名变化：`apply` 就地捕获、静默跳过（不注册段落、不抛错），宿主与其他插件照常启动 | 兼容性断言 `the host half stays silent when the host changed shape`（5 种静默 ctx + 2 次异常调用，共 7 次 `apply`）；客户端槽位的七种畸形 ctx 由 `apply stays silent on a changed host` 覆盖；见 FR-014 |

# 与客户端半边的耦合约束

宿主半边只说"会被渲染"，不说"谁来渲染"；客户端半边只负责"渲染出来"，不改变模型行为。两者同属一个包、同进同退——这是 FR-011 在实现层面的唯一保证方式。


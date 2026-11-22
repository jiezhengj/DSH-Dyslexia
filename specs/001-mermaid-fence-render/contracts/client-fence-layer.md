# 契约：浏览器半边的槽层

**消费者**：DSH Web 前端的槽系统（`conversation.chat.markdown.fence`，kind `hoc`，scope `session`）。

# 导出面

`client.js` 是经典脚本，经 `window.__ModuleLoader__.load({ id, factory })` 注册工厂；工厂返回 `module.exports`，其中必须包含：

| 导出 | 类型 | 说明 |
|---|---|---|
| `inject` | `string[]` | 客户端服务名，本插件为 `['slots']`（`locale` 不可用时不依赖它；见下） |
| `apply` | `(ctx) => void` | 尝试注册 locale 字典（可选）并注册槽层 |

# 槽注册

```js
const SLOT = 'conversation.chat.markdown.fence'

ctx.slots.inject(SLOT, () => ctx.slots.register({
  name: SLOT,
  id: '@jiezhengj/dsh-dyslexia/mermaid',
  key: 'mermaid',
  order: 100,
  locale: 'dyslexia',
}, MermaidFenceLayer))
```

**约束**

| 约束 | 理由 |
|---|---|
| `id` 用包名 + 用途后缀，稳定不变 | 层的身份；改动等于换一个层 |
| `key: 'mermaid'` | 只接管 ` ```mermaid ` 代码块，`entryKey` 即语言标记 |
| 不省略 `key` | 省略会接管**所有**代码块（diff/math/patch 已有自己的层） |
| `order: 100` | 与宿主 `register.ts` 现有层同量级，不抢占 |
| 用 `ctx.slots.inject(...)` 而非顶层直接 `register` | 槽服务迟到时自动等到可用；随插件卸载注销 |
| 不注册第二个槽、不注册会话节点 | 最小挂载点；卸载无残留 |

# 层组件契约

```ts
type Props = {
  lang: string            // 宿主 dispatch 的语言标记，恒为 'mermaid'
  code: string            // 图源，图的全部信息
  streaming: boolean      // 流式输出中
  children: ReactNode     // 宿主原本的代码块（回退目标）
  t: (key: string, vars?: Record<string, unknown>) => string  // 框架注入的翻译座位
}
```

**行为契约**

1. `streaming === true` → 返回 `children`，不解析、不闪烁。
2. 渲染成功 → 返回 `[图容器, 源码切换条]`；不包裹 `children`。
3. 解析失败或超限 → 返回 `[一行本地化说明, children]`；说明必须可见、可读屏、不带堆栈。
4. 渲染中不改页面其余部分：不设全局样式、不动 `<html>`/`<body>`、不监听 `window` 的滚动或按键。
5. 卸载/重渲染必须 `destroy()` pele 实例并断开自己的 `MutationObserver`，不留定时器、不留事件监听。**重排版不归插件管**：引擎自己的尺寸观察会重绘，插件不另建 `ResizeObserver`、不 `requestAnimationFrame`（0.1.10 起，见 `research.md` D22）。
6. 组件自身抛错时必须由本层的错误边界就地接管并渲染 `children`，不得让异常冒到宿主的渲染树、也不得让同消息其他块白屏（FR-014、FR-016）。

# 降级契约（兼容性，对应 FR-014～FR-016）

宿主仍在迭代，本层对"接口变了"的唯一正确反应是**安静地不画**。以下每条都是必须成立的行为，且都有一条可重复的断言（括号内为 `verify/check-bundle.mjs` 的断言名或夹具用例名）：

7. **不注册也不抛**：`ctx.slots` 缺失、`ctx.slots.inject()` 抛错、`register` 签名变化 → 放弃注册，宿主照常渲染原代码块（夹具 `apply stays silent on a changed host`（7 种畸形 `ctx`：`undefined`、`null`、`{}`、`{slots:null}`、`{slots:{}}`、`inject`/`register` 为空函数、`inject` 抛错） 覆盖 `slots` 为 `null`、`{}`、`{inject(){},register(){}}` 与 `inject` 抛错四种；`register` 抛错由 `a host that rejects the locale option does not break apply` 与 `the retried registration drops the locale option` 覆盖）。
8. **locale 可选且不可信**：`ctx.locale` 缺失或 `register` 失败 → 改用不带 `locale` 的注册重试；仍失败则放弃注册。宿主 `t` 只有在返回"真实译文"时才采信——非空字符串、不等于请求的 key、不含未替换的 `{{占位符}}`；否则用包内 8 语言字典（夹具 `a host t that throws still shows words`、`a host t that echoes the key still shows words`、`no internal key reaches the eye`）。
9. **数据守卫**：`code` 不是字符串、取值器抛错、缺 `document`、`children` 是 React 不收的形状（普通对象 / 函数 / 含对象的数组）→ 不进入绘制，并把源码交回（夹具 `a throwing code getter leaves the host block`、`a throwing children getter does not reach the host`、`a refused children cannot empty the message — object`、`a refused children cannot empty the message — function`）。语法错误是另一件事（E4），由 `a broken diagram says why` 覆盖。
10. **绘制期零外泄**：pele 在渲染子树里抛错 → 错误边界渲染 `children`，并在 `code` 变化时复位（夹具 `a throwing engine leaves a sentence`、`a throwing engine keeps the host block`）。
11. **停用后什么都不留下**：样式表、locale 文案与围栏层都由 `apply()` 里的注册句柄持有，插件停用时按注册顺序逆序释放（夹具 `disabling the plugin takes its stylesheet away`、`the locale registration is dropped`、`the fence layer is gone once the host disposes`；探针验证——把 `entry.js` 的 `ctx.effect(() => drop, …)` 换成 `void drop` 后，`styles and strings are claimed as effects` 由 1 变 2、`disabling the plugin takes its stylesheet away` 由 `true` 变 `false`，见 E-PROBE 的 P2）。
12. **引擎不可用**：pele 未挂载或 `mount` 不存在 → 视为"该处不画"，保留原文并给一行本地化原因，不抛错（`an engine that fails to load leaves the picture to the host`）。

# DOM 与可访问性契约

- 结构：外层 `div.dsh-dyslexia-group`（`role="group"`，**自身不带 `aria-label`**——名字已经由里面的图像提供，两处都写会让读屏念两遍），内层 `div.dsh-dyslexia-figure` 是唯一的挂载点，`max-width: 100%`、`overflow: auto`。
- 图像角色：`role="img"` + `aria-label` 只落在引擎画出的 `svg` 上（且全图恰好一个），挂载点 `role="presentation"`。理由：pele 会把自己的缩放按钮追加在挂载点里，若 `role="img"` 落在容器上，读屏会把缩放按钮当成图像的一部分而无法单独聚焦（FR-018）。
- 引擎标记：挂载后移除引擎自带的 `aria-roledescription`（它会读出英文引擎类型，如 `flowchart`）；换界面语言时就地改写 `svg` 的 `aria-label`，不重挂载（不丢缩放状态）。
- 命名：`aria-label` 只用本地化名词，**不拼引擎类型**（不出现 `flowchart`、`{{type}}` 之类技术标记）。
- 源码切换条：一个按钮（`<button type="button">`），文案"查看源码 / 隐藏源码"；展开的源码块保留语言标记 `mermaid`，可全选复制（FR-003）。
- 复制：按钮文案固定"复制源码"；结果写入 `<span class="dsh-dyslexia-status" role="status" aria-live="polite">`（"已复制"/"复制失败"），**可见的小号次要文字**同时被读屏播报——明眼用户与读屏用户看到同一句话；按钮文案不因结果而变，避免重复朗读同一控件（FR-018）。
- 缩放控件：仅在图宽超出容器时渲染（`a picture that fits offers no zoom buttons` 与 `a scaled picture offers the engine zoom buttons` 各断言一次）；按钮的 `aria-label` 用界面语言（不得出现 `Zoom`/`Reset` 之类英文），位于 `role="img"` 之外、可用键盘聚焦；缩放只改挂载点内部变换，不改变页面布局。
- 键盘可达：所有按钮可 Tab 聚焦，`Enter`/`Space` 生效；图本身不设为 Tab 焦点。
- 稳定挂载：宿主每次渲染都新建 `t` 时，绘制 MUST NOT 因此重建（`t` 经 ref 读取，不在 layout effect 依赖里）；只有源码或流式状态变化才重挂。
- 颜色：不使用硬编码色值；深浅主题切换后无需重新解析图源（pele 就地重绘）。

# 样式边界

- 只写行内样式或注入唯一前缀的 `<style>`（例如 `dsh-dyslexia-` 前缀），不覆盖宿主既有类名、不引入全局选择器。
- 变量映射（容器上）：

```
--pele-bg: var(--dsw-alias-bg-layer-1);
--pele-fg: var(--dsw-alias-label-primary);
--pele-muted: var(--dsw-alias-label-secondary);
--pele-line: var(--dsw-alias-border-l1);
--pele-border: var(--dsw-alias-border-l2);
--pele-accent: var(--dsw-alias-brand-primary);
--pele-error: var(--dsw-alias-state-error-primary);
--pele-font: inherit;
```

# 渲染引擎调用面（pele）

| 调用 | 参数 | 说明 |
|---|---|---|
| `mount(host, code, options)` | `{ autoDirection: true, directionBreakpoint: 640, fontSize, padding: 8, responsive: true, zoom: { controls: true, maxScale: 4, labels }, limit, outputLimit, maxEdges }` | 同步生成 SVG、自适容器宽；**不传 `onError`**，失败由抛出的 `PeleError` 捕获 |
| `Mounted.error` | `PeleError` | 判定失败路径（`figureErrorKind` 分类成语法 / 引擎不可用 / 其它） |
| `Mounted.result.type` | string | 仅用于内部判断；**不进入 `aria-label`**（FR-018 要求名称为本地化纯名词） |
| `destroy()` | — | 唯一的生命周期终点：卸载与重置都走它 |

**不使用**：`refresh()`（重排由引擎自己的尺寸观察负责，见 D22）、`enableZoom()`（缩放控件由 `zoom` 选项生成）。**禁止**：`parse()` + 自绘（放弃 pele 的字体与主题适配）、`render()` 后手工塞进 DOM（放弃引擎自己的重排）、把 SVG 序列化成字符串存任何地方。



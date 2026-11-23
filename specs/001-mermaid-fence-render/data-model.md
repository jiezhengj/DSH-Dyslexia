# Phase 1 数据模型

本功能**不持久化任何新数据**。以下实体中，"图源"与"插件安装态"是既有的、本功能只读或只受影响的东西；"渲染结果"纯属内存态，随时可丢弃。

# 实体：图源（MermaidSource）

**定义**：会话消息里一个语言标记为 `mermaid` 的 Markdown 代码块的文本内容。

| 属性 | 类型 | 来源 | 说明 |
|---|---|---|---|
| `lang` | string | 宿主层 props（`entryKey`） | 固定为 `mermaid` 才进入本层 |
| `code` | string | 宿主层 props（`fence.code`） | 图的全部信息；**不可再生** |
| `streaming` | boolean | 宿主层 props | 为 true 时本轮不渲染 |

**不变量**

- 图源只存在于会话消息文本里；插件不复制、不缓存到磁盘、不改写它。
- 任何失败路径都不得让图源不可见：层失败时宿主渲染 `children`（同一段文本的代码块）。
- 卸载插件不改变图源，因此重装后图自动回来（**FR-010**）；"卸载后仍能被 `session_search` 检索到"是另一条要求（SC-002），目前未取证（G7）。

# 实体：渲染结果（RenderArtifact）

**定义**：由图源在浏览器内派生出的 SVG 与配套控件。**不入库、不进会话历史、卸载即消失。**

| 属性 | 类型 | 说明 |
|---|---|---|
| `svg` | string | pele 产出的矢量图 |
| `width` / `height` | number | 用于容器尺寸与"是否溢出"判断 |
| `type` / `mermaidType` | string | pele 识别出的图类型；仅用于内部判断与提示文案 |
| `error` | PeleError \| null | 解析/规模超限失败时携带可读原因 |
| `zoom` | 控制器 \| null | 溢出时才启用 |

**生命周期**：消息挂载 → `mount()` 生成 → 容器尺寸变化时**由引擎自己重排**（pele 内部有尺寸观察与逐帧调度，插件不另建 `ResizeObserver`，见 D22）→ 节点被换掉后插件只负责重新命名 → 卸载或重渲染 → `destroy()` 释放。

**可访问性字段**（对应 FR-018）：`accessibleName`（本地化纯名词，不含引擎类型，只落在 `svg` 上）、`imageRoleOn`（`svg` 恒为 `role="img"`；外层 `div.dsh-dyslexia-group` 是 `role="group"` 但**不带名字**（否则读屏会把同一个名字念两遍）；内层挂载点是 `role="presentation"`）、`copyAnnouncement`（`idle` / `copied` / `failed`，写入 `role="status" aria-live="polite"`）。挂载点尺寸变化不改变这三项。

# 实体：插件安装态（Installation）

| 状态 | 会话里的表现 | 模型是否知道会渲染 |
|---|---|---|
| 已启用 | 图源显示为图，可切回源码 | 是（宿主提示词段在场） |
| 已禁用 / 已卸载 | 图源原样显示为代码块，无报错、无占位 | 否（提示词段随插件消失） |
| 层注册失败（宿主升级、槽改名） | 同上 | 视宿主提示词段是否仍能注册而定；两者同属一个包，通常同时失效 |

**状态迁移**：安装 → 已启用；启用 ↔ 禁用（走宿主插件机制；"不用重载页面"这一步**没有单独观察**，见 G20）；卸载 → 图源不变，表现回退为代码块。

# 每张图的渲染状态机

```text
[源码就位]
   │ streaming = true
   ├──► 直接显示代码块（本轮不解析）
   │ streaming = false
   ▼
[尝试渲染]
   ├── 成功 ──► 显示为图（可切换源码、可缩放） ──► 尺寸变化 ──► 重排（不重新解析）
   ├── 语法错误 ──► 显示代码块 + 一行本地化原因（FR-004）
   └── 超出规模限制 ──► 显示代码块 + 一行本地化原因（FR-004）
```

**约束**

- 状态机只在浏览器内存里跑；宿主无感知，重启页面后由同一段图源重新走一遍。
- 同一消息内多张图各自独立走状态机，互不阻塞（US1 场景 2）。
- 非 `mermaid` 语言标记不进本层，也就不进该状态机（spec 边界情形 6）。

# 实体：兼容性降级态（CompatibilityFallback）

插件对"宿主变了"这件事只有两种输出：**照常画**或**安静不画**。没有第三种（尤其没有"抛错"和"阻断启动"）。下表是允许出现的全部降级点，以及每一处的可见表现。最后一列写的是该行的归属证据，**来源可能是 `verify/check-bundle.mjs` 的静态断言，也可能是 `verify/harness/index.html` 里的浏览器断言**——每一行都注明了是哪一个，不假定全在同一处。

| 降级点 | 触发条件 | 可见表现 | 断言 / 证据 |
|---|---|---|---|
| 清单被版本门否决 | 不可能：清单里没有 `engines`、`engines.dsh`、也没有 dsh peer | 不会发生（这是要求本身） | `engines.dsh` 与 dsh peer 由 `no dsh version gate can refuse a start` 断言；整个 `engines` 键与 `dsh.client.inject` 由人工核对 `package.json`（`dsh.client.inject` 另有 `package.json declares the bundle patch and the client half`）；其余 `engines` 子键见 G15 第五条（FR-013） |
| 产物语法错误 | 构建期 | 不产出包 | 静态 `client.js compiles on its own`（FR-015） |
| 加载器缺失 / `load` 抛错 | 宿主加载客户端模块时 | 本插件不生效，其他插件照常 | 静态 `a broken host loader cannot make the chunk throw`（FR-015） |
| 工厂内 `require`/初始化抛错 | 宿主注入的 `react` 缺失等 | 返回空模块 `{ apply(){}, inject: [] }` | 静态 `a failing factory still yields a silent module`（FR-015） |
| 引擎 IIFE 抛错 | pele 在未知宿主里执行失败 | 图不画，代码块原样显示，并有一行原因 | 静态 `an engine that fails to load leaves the picture to the host`（FR-014） |
| 缺 `slots` 服务 / 注册签名变化 | 宿主接口变化 | 不注册层，代码块原样显示 | 夹具 `apply stays silent on a changed host`（FR-014） |
| 缺 `locale` 或 `t` 抛错 | 宿主本地化接口变化 | 图照画，标签回落包内 8 语言字典 | 夹具 `a host t that throws still shows words`（FR-014） |
| `t` 把 key 原样回显 / 占位符未替换 | 宿主命名空间未注册（实测行为） | 图照画，标签用包内 8 语言字典，界面上不出现 `copySource` 这类内部 key | `host key echo falls back to bundled strings` + 夹具 `a host t that echoes the key still shows words`、`no internal key reaches the eye`（FR-008 / SC-009） |
| 缺 `systemPrompt`（缺失 / `null` / `{}` / `section` 抛错 / `section` 返回 rejected Promise） | 宿主提示词接口变化 | 不注入那段话，其余照常 | `check-bundle` 的 `the host half stays silent when the host changed shape`（5 种静默 ctx + 2 次异常调用，共 7 次 `apply`）（FR-014） |
| 围栏数据畸形（`code` 非字符串、取值器抛错） | 宿主数据形态变化 | 交回宿主原本的代码块 | 夹具 `a throwing code getter leaves the host block`、`the layer survives a throwing children getter`（FR-016） |
| 宿主交来的 `children` React 不收（普通对象 / 函数 / 含这些的数组 / 产出这些的 iterable） | 宿主数据形态变化 | 交回源码文本，消息不空白 | 夹具 `a refused children cannot empty the message — *`、`a hostile host block still leaves the message — *`（FR-016） |
| 绘制期异常 | pele 在渲染子树里抛错 | 错误边界接管，交回代码块 | 夹具 `a throwing engine leaves a sentence` / `a throwing engine keeps the host block`（FR-016） |

**不变量**

- 以上任何一条发生，图源文本都必须仍然可见、可复制、可检索（宪法 IV；检索为 G7，未取证）。
- 插件不得改变宿主的启动结果：没有"因为本插件而启动失败"这一状态（FR-013）。
- 降级是**安静**的：不弹窗、不打断会话、不影响同一消息里的其他内容。




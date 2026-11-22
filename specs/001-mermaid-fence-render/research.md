# Phase 0 研究与决策

调研对象是本机实际安装的 DSH Desktop **0.2.2-rc.5**（`C:\Users\jiezhengj\AppData\Local\Programs\DeepSeek Harness\resources\app.asar`，下文路径省略 `dsh/node_modules/@deepseek-ai/` 前缀）。凡"官方文档"均指 asar 内 `dsh/docs/`；凡"宿主实现"均指随包发布的 `lib/`、`src/` 文件。

# 一、包形态

## D1 交付形态：一个 bundle 包，两个半边

**结论**：一个 npm 包 `@jiezhengj/dsh-dyslexia`，同时是宿主 Loader 条目（`main: index.js`）与浏览器模块（`exports['./client']`）。

**依据**：`docs/architecture.md:21` 说明包用 package.json 的 `dsh` 字段自我声明；`docs/user/develop/basic/publish.md` 给出 bundle 最小清单 `{"name","version","type":"module","main","files","dsh":{"bundle":{"patch":"./cordis.patch.yml"}}}`，patch 文件里用 `- insert: [{ id, name }]` 把条目挂进 profile。`@deepseek-ai/dsh-client-ui-chat` 正是同一包同时拥有 `main: lib/index.js` 与 `./client` → `lib/client.js` 的现成范例。

**被否方案**：拆成"宿主提示词包 + 客户端渲染包"两个包。否决理由：两个包的启用状态可以不同步，会出现"模型知道会被渲染、但没有任何东西渲染"或反之，违反 spec 的 FR-011 与用户对"卸载即一致消失"的要求。

## D2 浏览器半边必须是"已构建单块 chunk"

**结论**：`client.js` 手写成单文件、只 `require('react')`，不拆相对文件，不用打包器。

**依据**：`docs/subsystems/client-modules.md` 与 `dsh-client-modules/README.md`：包必须导出 `exports['./client']` 指向已构建产物，且"entry and chunk outputs cannot synchronously require another relative client*.js output"；宿主以 `GET /plugins/??<pkg>/client.js,...&rev=<rev>` 组合下发；模块解析顺序为平台种子表（`PLATFORM_MODULES`）→ 已物化记录 → boot 图行 → 已注册工厂，其它一律抛错。宿主自己的构建产物外形可直接照抄（`@deepseek-ai/dsh-client-ui-chat/lib/client.js`，509,178 B）：

```
window.__ModuleLoader__.load({id:`@deepseek-ai/dsh-client-ui-chat`,factory:require=>{var module={exports:{}};var exports=module.exports;…let react=require("react");…exports.apply=apply;exports.inject=inject;return module.exports}});
```

**被否方案**：用 esbuild/rollup 产 chunk。否决理由：唯一外部符号是 `require('react')`，其余代码全是自家逻辑与一个已经构建好的 vendored 引擎，拼接没有收益，反而多一条构建期依赖（违反原则 III 的精神）。

## D3 渲染引擎：pele 内联进 client.js

**结论**：vendored `pele@1.13.0` 的 global 构建原样提交进 `vendor/pele/`，构建时内联，`window.pele.mount(...)` 使用。

**依据**：`pele` 支持 Mermaid 12.1 全部内置图类型（flowchart/sequence/class/state/ER/gantt/timeline/mindmap/kanban/xychart/C4/architecture…），零运行期依赖、同步渲染、CSS 变量配色、`mount()` 读 CSS 字体并按容器宽度自适配、自动转义图内文字并限制源码与输出规模，MIT 许可。宿主客户端模块表是冻结的（`PLATFORM_MODULES`），`dsh.client.external` 只能引用**已安装的客户端包**，而 pele 不是 DSH 客户端包，所以无法以外部依赖形式引入——必须内联。

**代价**：`client.js` 体积约 751 KiB（0.1.9 实测 769,386 字节；其中 pele global 构建 733,670 B，其余是自家代码）。宿主现有 `ui-chat` 单块即 509 KB，同一量级，可接受。

**被否方案**：① 运行期从 CDN 载入 mermaid/pele——违反原则 III 与 SC-004（外部请求数 0）；② 把 mermaid 源码存成文件、由宿主渲染——违反 FR-002（不生成文件）与用户"内容要留在会话里"的诉求。

# 二、宿主半边

## D4 能力播报用一句静态提示词段，不注册工具

**结论**：`index.js` 只有 `name`、`inject: ['systemPrompt']`、`apply(ctx)`，在 `apply` 里注册一条 `order` 固定的静态段落。

**依据**：现成的纯指引插件范式 `dsh-deliverable-file-references/src/index.ts`：整包只有一段 `FILE_REFERENCE_PROMPT` + 一次 `ctx.systemPrompt.section({ name, order: ctx.systemPrompt.getSectionOrder('DELIVERABLE_FILE_REFERENCES'), text })`。`dsh-system-prompt/README.md` 明示 "External contributions may use any finite order"——所以第三方插件不必挤进仓库集中分配的座位表，直接给一个有限数值即可；段落按 `order` 升序拼接，同序按名字码位序。

**被否方案**：① 注册一个 `render_diagram` 工具——没有可执行动作（渲染发生在客户端），工具会让模型误以为必须调用，同时在没有客户端半边的宿主上撒谎；② 用 `ctx.systemPrompt.context()` 动态注入——动态 provider 在每次装配时变化会打乱提示词缓存，且本信息是静态事实，没有动态的必要；③ 不注册任何提示词——模型不知道这里会渲染，就不会主动写 mermaid，US1 事实上无法发生。

## D5 播报文本只陈述能力

**结论**：文本固定为"标记为 `mermaid` 的代码块会在会话里就地渲染成图；图的文字就是它的全部信息，所以代码块本身要写全图里的东西"，不写"尽量用图表达"、不点名任何图类型、不给篇幅限制。

**依据**：宪法原则 I（能力与偏好分离）与 spec FR-011/FR-012；用户的个人偏好来自她自己的 AGENTS.md（`visual-first-agents-snippet.md` 已在仓库根目录）。段落随 `ctx.effect` 生命周期注册与销毁，所以卸载插件后这句话一并消失。

# 三、浏览器半边

## D6 挂载点：`conversation.chat.markdown.fence`，`key: 'mermaid'`

**结论**：向该 hoc 槽注册 `{ name: 'conversation.chat.markdown.fence', id: '@jiezhengj/dsh-dyslexia/mermaid', key: 'mermaid', order: 100, locale: 'dyslexia' }`。

**依据**：客户端 Slots Inspect 的权威声明——kind `hoc`、scope `session`、purpose "Language-keyed layers around one Markdown fence in the Chat flow; the content is the plain code block."、replaceRisk `wraps-owner-content`、registration `{ id 必填, key?, order? }`、keyDomain "open: any entryKey the owner dispatches; a layer without key serves every dispatch, already taken: diff, math, patch"。宿主调用处 `dsh-client-ui-chat/src/client/chat/ChatView.tsx:114-119`：

```
renderSlot('conversation.chat.markdown.fence', fence, {
  entryKey: fence.lang,
  children: <FenceCodeBlock lang={fence.lang} code={fence.code} streaming={fence.streaming} labels={codeLabels} diff={false} />
})
```

也就是说 `entryKey` 就是代码块语言标记，写成 `mermaid` 即只会命中 ` ```mermaid ` 块；`children` 是宿主原本那个代码块，正好作为回退。`src/client/contract/slots.ts:433` 声明 `{ kind: 'hoc'; scope: 'session'; owner: MarkdownDelegateFenceInfo }`；`src/client/fence/register.ts:13-20` 是宿主自己的三层注册（math / diff / patch），照抄其形状即可。

**被否方案**：`conversation.chat.node`（按 `ChatNodeKind` 键控）。否决理由：占一个节点键意味着往会话流里写入自定义实体，卸载后历史里会残留无法解释的节点，直接违反原则 IV 与"最小挂载点"约束。

## D7 层组件签名与卸载语义

**结论**：组件是 `props => ReactElement`，`props` 里既有 `children`（宿主自己的代码块）也有 fence 信息；层只有在"已渲染出图"时才替换 `children`，其余一切情况原样返回 `children`。

**依据**：`src/client/fence/FenceLayers.tsx:9` `MathFenceLayerProps = PropsRuntime<'conversation.chat.markdown.fence'> & HocShare<SlotMap['conversation.chat.markdown.fence']>`（`HocShare` 即 `children`）；`slots` 文档原文 "with no applicable layer the content renders unchanged"，崩溃层 "reports its error and renders its `children` at the occurrence that failed"；层若包裹 `children` 而不希望自带盒子，须 `display: contents`。

**推论（正好是我们的降级故事）**：插件未装/被禁用 → 无匹配层 → 原样显示代码块；层自身抛错 → 宿主渲染 `children`；宿主升级把这个槽改名 → 注册不生效，代码块照旧。

## D8 流式输出期间不渲染

**结论**：`fence.streaming === true` 时直接返回 `children`，输出结束后渲染一次。

**依据**：spec 边界情形"流式输出中的半截代码块不得闪烁为空图或错误"；pele 是同步解析器，半截 `flowchart TD; A[登` 会抛错。宿主传入的 `streaming` 字段（`ChatView.tsx:117`）正好给出这个信号。

## D9 失败与超限的处理

**结论**：捕获 `mount` 抛出的 `PeleError`，回退 `children`，并在代码块上方显示一行本地化说明（例如"这张图无法渲染，下面显示其源码：{{message}}"）；超限（`limit`/`outputLimit`/`maxEdges`）走同一条路径。

**依据**：FR-004 要求"回退为完整代码块文本，并显示可读的失败原因"；pele 的 `MountOptions` 提供 `limit`、`outputLimit`、`maxEdges`、`onError`；`PeleError` 是导出类型，带可读消息。

## D10 主题跟随

**结论**：容器上把 pele 的 CSS 变量映射到宿主主题令牌，不写死颜色。

**依据**：客户端 Theme Inspect 的令牌表（全部 `requiresLightAndDark`）：`--dsw-alias-bg-base`、`--dsw-alias-bg-layer-1`、`--dsw-alias-bg-layer-2`、`--dsw-alias-bg-overlay`、`--dsw-alias-border-l1`、`--dsw-alias-border-l2`、`--dsw-alias-brand-primary`、`--dsw-alias-label-primary`、`--dsw-alias-label-secondary`、`--dsw-alias-state-{error,idle,success,warn}-primary`、`--dsw-specific-sidebar-fill`；pele 侧变量为 `--pele-bg`、`--pele-fg`、`--pele-muted`、`--pele-line`、`--pele-surface`、`--pele-surface-alt`、`--pele-border`、`--pele-accent`、`--pele-font`、`--pele-radius`、`--pele-series-1..8`。pele 的 `mount()` 从 CSS 读字体并对主题变量变化就地重绘，无需重新解析。

## D11 窄屏与缩放

**结论**（重排版部分已被 D22 取代：插件不另建尺寸监听，重排归引擎）：`mount()`（按容器宽自适配）；`autoDirection: true`、`directionBreakpoint: 640`；`zoom: { controls: true, maxScale: 4, labels }`（仅在溢出时出现缩放控件）。

**依据**：pele README 关于 `mount()` 自适容器宽、`autoDirection`/`directionBreakpoint` 与 `ZoomOptions { always, maxScale, controls, labels }` 的说明；spec US3 与 SC-003（视口 360 px 时页面级横向溢出为 0，图内文字不小于正文最小字号）。宿主自身在 `AssistantMarkdown.module.css` 里对方形超出列宽的宽表格用"breakout + 图内横向滚动"处理，照此模式：容器 `max-width: 100%`，溢出在图内滚动，绝不撑破页面。

## D12 文案与本地化

**结论**：浏览器半边自带 8 种界面语言（`zh, en, ja, es, fr, de, ru, pt`，与宿主 `dsh-client-locale` 支持的语言集合一致）的文案字典，语言按 `document.documentElement.lang` 取（缺失时看 `navigator.language`，再不行回退 `en`）；`apply` 里仍尝试 `ctx.locale.register('dyslexia', DICTIONARY)` 并把 `locale: 'dyslexia'` 写进槽注册，但**不依赖**它：宿主 `t` 只在返回"真实译文"时采信（非空、不等于 key、无未替换的 `{{}}` 占位符）。插件卡片文案放 `locale/<lang>.json` 的 `meta.title`/`meta.description`/`meta.detail`。

**依据**：`dsh-client-locale` 实测只注册 `ja/es/fr/de/ru/pt` 六种并内建 `zh`/`en`，即 8 种（无 `zh-TW`/`yue`/`ko`）；`ctx.locale.register(ns, { zh, en, ja })` 要求至少 `zh`/`en` 两个基线语言，消费者用 `ctx.locale.bind(ns)` 或框架注入的 `t` 座位。**实测反证（2026-11-22，真机）**：`inject` 不含 `locale` 时 `ctx.locale` 取不到、注册被静默跳过，而宿主 `t` 在命名空间未注册时**把 key 原样返回**（旧版 `translateFor` 只判断"非空字符串"就采信，导致界面出现裸 key `copySource`/`figureLabel`）。故"自带字典 + 只采信真实译文"才是可靠路径；见 D20。

## D13 安装路径

**结论**：源码就放在仓库根目录的包形态里，用 `plugin_manager install_bundle`（等价 `dsh plugin --profile desktop add <本地目录>`）装进 `desktop` profile；卸载用 `remove_bundle`。开发期反复验证走 `install_bundle` → 看 HMR 生效 → `remove_bundle`。

**依据**：`docs/user/develop/basic/publish.md` 的 add/remove 语义；本机 profile 为 `desktop`（`C:\Users\jiezhengj\.dsh\profiles\desktop\package.json`，bundles 列表含 `@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app`、`billion-context` 等，另有用户自己的 `cordis.patch.yml`）；`dsh.client` 的启用/停用走 HMR 图增量，所以装完不必重启桌面应用。git 安装需要 `prepare` 脚本与 pnpm `allowBuilds`，故本地目录 / `npm pack` tarball 是首选。

# 四、验证策略

## D14 证据式验收，不引入测试框架

**结论**：`verify/check-bundle.mjs`（Node 内置模块）做静态断言 + 真机装/卸/窄屏人工证据表；不装 jest/vitest/jsdom。

**依据**：宪法原则 III（DSH 未自带的依赖必须打包，运行期零网络）与"开发与验证流程"（装、卸、窄屏三项证据；打包后核对文件列表并断网复跑；未验证项必须标注）。静态断言清单见 `contracts/plugin-manifest.md` 的"可静态校验项"。真机证据在 DSH Desktop 会话里做，截图与网络面板结论写进交付说明。

# 五、未确定项（实现前必须实测）

- `pele.global.js` 的确切全局名与是否在顶层直接赋 `window.pele`（若非 IIFE 赋值，构建脚本需补一层捕获）。落地方式已定：构建后 `check-bundle.mjs` 断言 `pele.mount` 可取。
- `require('react')` 在层组件里是否足够（是否需要 `react/jsx-runtime`）。若足够，`src/client/view.js` 一律用 `React.createElement`。
- 从插件包内注册的 locale 字典名是否与 `locale: 'dyslexia'` 的查找命名空间一致；不一致则退化为组件内直接用 `ctx.locale.bind('dyslexia')` 的闭包。

# 六、兼容性与启动安全（2026-11-22 补记，对应 FR-013～FR-017）

## D15 干脆不写任何版本否决字段

**结论**：`package.json` 不留 `engines`、不留 dsh 的 `peerDependencies`、包级 `dsh.client` 不写 `inject`。插件在未知宿主版本上的行为是"不渲染"，而不是"被拒绝加载"。

**依据**：宿主的启动门在 `dsh-app-boot`。`src/plugin-compatibility.ts:55-74` 的 `unmetRequirements()` 只看**插件自己**的 `engines.dsh`——`semver.satisfies(runtimeVersion, range, { includePrerelease: true })`；`engines` 不是对象或 `engines.dsh` 不是字符串会被判为清单不可读并拒绝；没有 `peerDependencies` 时该函数返回空集，等于不过门。`docs/upgrade-guide/v0.2.1-alpha.3/plugin-engines-dsh/guide.zh.md` 明确写着"包自身的 `engines.dsh` 范围单独决定结果"，且"安装和 profile 启动"都据此判定。真正致命的一步是 `lib/index.js:1811-1812`：`if (issue !== void 0 && !issue.exempted) throw new Error(pluginCompatibilityWarning(issue))` —— 这是启动期抛错，profile 起不来；豁免要 `dsh plugin allow-version`，而应用打不开时用户根本进不去做这件事。这正是"升级后打不开、禁用也没用"的机制。

## D16 客户端产物自兜，绝不让异常漏到宿主

**结论**：`client.js` 整体用 IIFE 包住，内部三层兜底：加载器缺失/抛错、工厂内 `require` 抛错、引擎 IIFE 抛错。任何一层失败都只让本插件安静地不生效，返回 `{ apply(){}, inject: [] }`。

**依据**：宿主的客户端模块是被拼进**同一批** `<script>` 里执行的（`GET /plugins/??<pkg>/client.js&rev=<rev>` 的组合脚本），一个 chunk 的语法或加载期异常会连累同批其他插件；`client-modules/README.zh.md:96` 只保证"启动时创建失败的条目…记录日志并保持未激活"，不保证 chunk 自身抛错时的隔离。故：① 构建末尾 `new Script(chunk)` 做编译期语法检查，语法错误在发布前失败；② 运行期所有入口 try/catch。

## D17 服务、注册、翻译全部按"可能不存在/可能变形"处理

**结论**：`apply()` 里 styles / locale / slots 三段各自 try/catch；`ctx.slots.register` 带 `locale` 失败则去掉 locale 重试、再失败放弃；宿主 `t` 抛错或返回非字符串时回落到包内 en/zh 字典；`ctx.systemPrompt.section` 不存在就静默跳过。

**依据**：spec FR-014 与 US5 场景 3；宿主仍在迭代，`register` 的可选参数、`apply` 收到的 ctx 形状、`t` 的签名都可能在升级中改变；`dsh-app-boot/lib/index.js:5279-5333` 的 `boot()` 只对 **required** 条目抛 `StartupError`（`auditStartupEntries` 里 `required.size > 0` 才 throw，否则只 `warn(activationDiagnostic(...))`），所以"安静失败"是被宿主允许且鼓励的路径。

## D18 渲染期双向兜底：错误边界 + 数据守卫

**结论**：层组件外包一个 `FigureBoundary`（`getDerivedStateFromError` + `componentDidCatch`，`code` 变化时复位）；`code` 非字符串、缺 `document`、引擎不可用时直接返回宿主的 `children`。

**依据**：React 错误边界是唯一能在渲染期捕获子树异常而不影响整棵树的手段；分子层是 hoc，`children` 就是宿主原本的 `FenceCodeBlock`，所以"交回原文"不需要任何额外逻辑，只需保证不抛。spec FR-016 与 US5 场景 4。

## D19 兼容性也要有证据，且必须逐条对应要求

**结论**：`verify/check-bundle.mjs` 用 7 组兼容性断言（① 无版本门；② 产物可独立编译；③ 畸形加载器下不抛；④ 工厂抛错仍返回可用模块；⑤ 含错误边界与数据守卫；⑥ 畸形 `ctx` 下 `apply` 不抛；⑦ 停用后不留残留——样式表、locale 注册与围栏层都被释放，该条的实际证据是夹具 `disabling the plugin takes its stylesheet away` 与 `the fence layer is gone once the host disposes`，不是静态字符串检查），Chromium 夹具再用故障注入覆盖渲染期。断言名与 FR 编号在 `contracts/client-fence-layer.md` 与 `evidence/verification.md` 里对应。

**依据**：spec FR-017（加固必须有可重复的自动化证据）与 SC-006/SC-007/SC-008；宪法"开发与验证流程"要求未验证项必须标注。

## D20 标签只采信"真实译文"，回显的 key 一律当未解析

**结论**：`translateFor` 对宿主 `t` 的返回值加三道判定——非空字符串、不等于请求的 key、不含未替换的 `{{占位符}}`；任何一条不满足就改用包内 8 语言字典。语言按 `document.documentElement.lang` → `navigator.language` → `en` 的顺序确定。断言名：静态检查 `host key echo falls back to bundled strings`、夹具 `a host t that echoes the key still shows words` 与 `no internal key reaches the eye`。

**依据**：真机实测（2026-11-22）宿主 `t` 在命名空间未注册时返回 key 本身，且**不抛错、不为空**，旧判定 `typeof value === 'string' && value.length > 0` 因此放行，界面上出现 `copySource`、`figureLabel` 这类内部 key；同类"看起来成功其实没生效"的签名变化也会这样伪装，故判定必须比"有返回值"更强。spec FR-008（8 语言 + 不得显示内部 key）、SC-009；宪法 IV（降级不得降低可读性）。

# 七、原"未确定项"的实测结论（2026-11-22）

- `pele.global.js`：外层是 `"use strict";var pele=(()=>{…})();`，**不自带** `window.pele` 赋值；构建脚本已把整个文件包在 `try { … pele = <表达式> } catch` 里，失败则 `pele = null`，由 `figure.js` 的引擎守卫降级。全局对象键为 `PeleError, detectType, enableZoom, forgetTextWidths, mount, parse, register, registered, render, supports`。
- `require('react')` 足够：层组件全部用 `React.createElement`，不需要 `react/jsx-runtime`；Chromium 夹具里以 `require` 返回宿主注入的 React 18.3.1 验证通过。
- locale 命名空间：`ctx.locale.register('dyslexia', …)` 与槽注册里的 `locale: 'dyslexia'` 一致；夹具断言槽定义为 `{"name":"conversation.chat.markdown.fence","id":"@jiezhengj/dsh-dyslexia/mermaid","key":"mermaid","order":100,"locale":"dyslexia"}`。带 locale 的注册失败时会退回不带 locale 的注册（标签改用包内字典）。**补充实测**：`inject = ['slots']` 时 `ctx.locale` 不可用、注册被跳过，宿主 `t` 会回显 key——所以标签正确性最终由 D20 的"自带字典 + 只采信真实译文"保证，而不是由命名空间注册保证。

## D21 证据基础设施进仓库，而不是留在被忽略的临时目录（2026-11-23 修订）

**问题**：初版的浏览器夹具放在 `.tmp/harness/`，而 `.tmp/` 被 `.gitignore` 忽略。于是"夹具 19/25/28 项全绿"这类说法在别人 clone 之后无法复跑，FR-017（每条加固都要有可重复的自动化证据）实际上不成立。

**决定**：

- 夹具迁入 `verify/harness/index.html`，React 18.3.1 的 UMD 副本放在同目录 `verify/harness/vendor/`（不联网、不装依赖）。
- 新增 `verify/run-harness.mjs`：找本机 Chrome（`DSH_DYSLEXIA_CHROME` → 常见安装路径 → `PATH`），用 `--headless=new --dump-dom` 打开 `file://` 页面，读页面写出的 `data-dsh-checks="ok:N/failed:M"` 判定，失败时打印 `[bad]` 行并退出 1。
- `package.json` 加 `scripts`：`build` / `verify` / `harness` / `test` / `prepack`（打包前重建并自检，避免发出陈旧产物）。
- 发布 workflow 增加三步：重建 → `git diff --exit-code -- client.js` 拒绝陈旧产物 → 跑 `check-bundle` 与 `run-harness`，之后才 `npm publish`。
- `.tmp/` 仍然忽略：它只是我本机的一次性实验区，不再承担任何证据职责。

**代价**：仓库多了 React UMD 两个文件和 914 行夹具 + 122 行驱动（合计 1036 行）；换来的是任何人 clone 后能自己重算每一个"已验证"。

## D22 无障碍：图像角色只给图本身，复制结果用实时区域播报（2026-11-23 修订）

**问题**：初版把 `role="img"` 与 `aria-label` 放在挂载容器上。pele 会把自己生成的缩放按钮追加进同一个容器，于是读屏把"放大/缩小/复位"当成图像的一部分——图像节点内的可交互子元素既不能单独聚焦，也不会被读出来。另外 `aria-label` 里拼了引擎类型（`图：flowchart`），把英文技术标记塞进了各语言的替代文本；复制反馈只把按钮文案改成"已复制"，没有非视觉通道。

**决定**（0.1.10 再修订：重排版归引擎，插件只负责"节点被换回来就重新命名"）：

- `role="img"` + `aria-label` 只给引擎画出的 `svg`；外层 `div.dsh-dyslexia-group` 只声明 `role="group"`、**自带名字一律不写**（名字已由图像提供，两处都写会让读屏念两遍），内层挂载点 `role="presentation"`。缩放按钮因此留在图像之外，可独立 Tab 聚焦。
- `aria-label` 只用本地化纯名词（`图`/`Diagram`/`図`/…），不拼 `{{type}}`；引擎类型只进代码块与源码面板。
- 复制按钮文案固定为"复制源码"；结果写入 `role="status" aria-live="polite"` 的**可见**小号次要文字（`12px`、`--dsw-alias-label-secondary`），读屏与明眼用户看到同一件事。一只按钮、一句话，避免读屏重复朗读同一个控件。
- 宿主每次渲染新建 `t` 时不得重建图：`t` 经 `useRef` 读取，layout effect 依赖里只有 `code`、`streaming`、`document`。

**证据**：`verify/check-bundle.mjs` 的 `the picture is the image, and the copy answer is announced`；夹具 `verify/harness/index.html` 的 `a fresh t does not redraw the picture`、`the copy answer is announced, not only coloured`、`[zh]/[en] the picture carries a plain name`、`no internal key reaches the eye`。

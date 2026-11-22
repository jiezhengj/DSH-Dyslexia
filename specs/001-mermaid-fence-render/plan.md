# Implementation Plan: 会话内图形渲染

**Branch**: `001-mermaid-fence-render` | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-mermaid-fence-render/spec.md`

## Summary

做一个 DSH 插件包 `@jiezhengj/dsh-dyslexia`，一个包两个半边：宿主半边（`index.js`）向系统提示词注册一段静态能力播报，只用一句话说明"标记为 `mermaid` 的代码块会被就地渲染成图，图的文字就是它的全部信息"；浏览器半边（`client.js`）向 `conversation.chat.markdown.fence` 槽注册一层 `key: 'mermaid'` 的 hoc 层，把该代码块原位替换为矢量图，并提供源码查看、图内缩放、深色浅色跟随与窄屏重排。渲染引擎 pele（Mermaid 12.1 语法，零依赖，MIT）以内联形式打进 `client.js`，运行期零网络请求、零额外运行时。层在卸载、禁用或渲染失败时一律回退到宿主原本的代码块（`children`），因此历史会话里的图源文本永远可读、可检索。

## Technical Context

**Language/Version**: Node.js 22+（构建与校验脚本只用内置模块）；浏览器端 ES2020 直接跑在宿主的 Web 前端里（不引入构建器，不产出 source map）。

**Primary Dependencies**: 运行期零第三方依赖。构建期唯一外部素材是 `pele@1.13.0`（MIT）的 `dist/pele.global.js` 与 `LICENSE`，以 vendored 文件形式提交进仓库并内联进 `client.js`，不再从 npm 安装。浏览器侧唯一外部符号是宿主注入的 `react`（通过 `require('react')`）。

**Storage**: 无。不新增会话实体、不写文件、不建索引；图源就是既有会话消息里的代码块文本。

**Testing**: 不引入测试框架（遵守"依赖自包含"）。实现阶段提供三类证据：① `verify/check-bundle.mjs` 纯 Node 内置模块的静态断言（bundle 外形、允许的 `require` 白名单、无外部 URL、pele 版本与许可存在、manifest 字段完整、**无版本否决字段、产物可独立编译、宿主加载器异常下不抛出、工厂抛错时仍返回可用模块**）；② `.tmp/harness/` 里的真实 Chromium 夹具（React + `client.js` + 独立引擎，含**故障注入**：宿主 `t` 抛错、`code` 取值器抛错、无 slots 服务、畸形围栏数据）；③ 真实宿主里的装/卸/窄屏三类人工证据（见 quickstart.md 的证据表）。

**Target Platform**: DSH Desktop 0.2.2-rc.5（Web 前端，含内嵌桌面窗口）为唯一实测基线；**但不以任何版本字段声明基线**——清单里没有 `engines`、没有 dsh 的 peerDependencies，也没有对宿主客户端包的版本绑定（见"兼容性策略"）。

**Project Type**: 单个 npm 包（DSH bundle）：宿主 ESM 半边 + 手写单块浏览器 SDK 半边 + vendored 渲染引擎。

**Performance Goals**: 20 节点以内的图从消息渲染完成到图出现 ≤ 1 秒（SC-001）；图出现不阻塞同一消息里其余段落的首屏；一屏内多图各自渲染互不拖累。

**Constraints**: 运行期零网络请求（SC-004）；页面级横向溢出为 0（SC-003）；图内文字不小于正文最小字号；不新增侧栏、文件、会话条目（FR-002）；卸载/禁用/异常时回退为完整代码块且不影响其余消息（FR-009）；不改宿主既有 UI 结构，只占用 `conversation.chat.markdown.fence` 这一个挂载点；**兼容性硬约束**——任何宿主的启动路径都不得因本插件失败（FR-013～FR-016）：
- 不以版本字段让宿主在启动前否决本插件（`engines.dsh`、dsh peer 一律不写）；
- 客户端产物必须能独立编译、能独自承受宿主加载器的任何异常；
- 所有宿主服务调用、注册调用、渲染调用都就地降级，绝不把异常抛回宿主；
- 宿主派发的数据不符合预期时，一律交回宿主原本的代码块。

**Scale/Scope**: 单张图通常 5–20 个节点；上限由 pele 的 `limit`/`outputLimit`/`maxEdges` 约束，超限即回退为文本（FR-004）。代码量预期：宿主半边 ~30 行，浏览器半边 ~500 行（含降级与边界），构建脚本 ~120 行，校验脚本 ~260 行。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I 能力与偏好分离** — PASS：插件只说"这里会渲染 mermaid"，不规定何时画、画什么类型、文字多长；偏好仍留在使用者自己的 AGENTS.md。
- **II 零环境假设** — PASS：无 Node/Python/包管理器/字体/网络前提；渲染器随包内联；也不对宿主版本设前提（不写任何版本门字段）。
- **III 依赖自包含** — PASS：`pele` 以 vendored 文件形式随包发布并打进 `client.js`；不引入 CDN、不引入 npm 安装步骤、不用打包器；`client.js` 是已构建单块 chunk，符合宿主"entry 不能同步 require 相邻 client*.js"的限制。
- **IV 降级不丢数据** — PASS（本功能最重的一项）：hoc 层缺省即回退（"with no applicable layer the content renders unchanged"）；异常时渲染 `children`；浏览器半边整体不注册任何持久化实体，卸载即无痕；重装后由图源重画；**并追加启动侧降级**——插件不得把宿主拖到打不开（见"兼容性策略"与 FR-013～FR-016）。
- **V 窄屏先行** — PASS：`mount()` 按容器宽重排 + ResizeObserver 触发 `refresh()`；`autoDirection` + `directionBreakpoint` 处理窄屏流程图；溢出在图内滚动；缩放控件只作用于图自身。
- **技术约束** — PASS：配色全部走 `--dsw-alias-*` 主题令牌并映射到 pele 的 `--pele-*` 变量；可见文字走 `ctx.locale.register('dyslexia', { zh, en })` 并在注册槽层时带 `locale: 'dyslexia'`；插件标题/描述用 `locale/{en,zh}.json` 的 `meta` 段；LICENSE 与第三方许可随包发布。
- **验证流程** — PASS：装、卸、窄屏三类证据在 quickstart.md 里列成表；打包后核对 `npm pack` 文件清单并断网复跑；无法验证的项在交付说明里显式标注。

无违反项，`Complexity Tracking` 留空。

## 兼容性策略（对应 FR-013～FR-017）

宿主仍在快速迭代，而插件一旦参与宿主启动就可能把整个应用拖住。因此这里把"失败"定义为**插件自己不工作**，而不是宿主被拉下水。四条落地手段，每条都有对应的静态断言或故障注入证据：

1. **不使用任何版本否决字段**（FR-013）。宿主的启动门在 `dsh-app-boot`：`unmetRequirements()` 只读插件自身的 `engines.dsh`（或 dsh 的 peer 版本），`lib/index.js:1811-1812` 一旦判定不满足就 `throw`，profile 根本起不来。因此清单里不写 `engines`、不写 dsh peer；包级 `dsh.client.inject` 也不写宿主客户端包名，避免升级后名字变化导致加载图缺边。
2. **客户端产物自兜**（FR-015）。产物用 IIFE 包住：缺 `window.__ModuleLoader__`、加载器 `load` 抛错、工厂内 `require` 抛错，都只记录并返回一个空模块 `{ apply(){}, inject: [] }`；pele 引擎的 IIFE 也用 try/catch 包住，失败则置空。构建末尾用 `new Script(chunk)` 做编译期语法检查——语法错误在发布前就失败，而不是到用户机器上连累同批 `<script>`。
3. **服务与注册全部按可选处理**（FR-014）。`apply()` 对 styles / locale / slots 三段各自 try/catch；`slots.register` 带 locale 失败则去掉 locale 重试，再失败就放弃注册；宿主 `t` 抛错或返回非字符串时回落到包内 en/zh 字典。
4. **渲染与数据双向兜底**（FR-016）。React 错误边界接管绘制期异常并渲染 `children`；`code` 非字符串、缺 `document`、字段缺失时直接交回宿主代码块；引擎不可用则记为一行原因并保留原文。

## Project Structure

### Documentation (this feature)

```text
specs/001-mermaid-fence-render/
├── plan.md              # 本文件
├── research.md          # Phase 0：契约调研与决策（含出处）
├── data-model.md        # Phase 1：图源/渲染结果/安装态与状态机
├── quickstart.md        # Phase 1：构建、安装、验证与证据表
├── contracts/           # Phase 1：三份契约
│   ├── plugin-manifest.md
│   ├── client-fence-layer.md
│   └── host-prompt.md
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # Phase 2（/speckit-tasks 产出）
```

### Source Code (repository root)

```text
package.json             # name/main/exports/dsh{bundle,client}/files（无 engines、无 dsh peer）
index.js                 # 宿主半边：export name / inject / apply → 一条提示词段（全段 try/catch）
client.js                # 生成物：IIFE 自兜 + window.__ModuleLoader__.load(...) 单块 chunk（提交进仓库）
cordis.patch.yml         # 一条 insert 行，把本包挂进 profile
locale/en.json           # meta.title / meta.description（插件卡片文案）
locale/zh.json
LICENSE                  # 本项目 MIT
THIRD-PARTY-NOTICES.md   # pele 的 MIT 许可与来源固定版本
README.md                # 装、卸、验证、兼容性承诺与已知限制
src/client/
├── entry.js             # 槽注册（key: 'mermaid'）+ locale 注册（无 import/export 的脚本片段）
├── figure.js            # pele 生命周期：mount / update / destroy，缩放与尺寸监听（引擎缺失自兜）
├── styles.js            # 主题令牌 → pele 变量映射 + 容器样式
├── i18n.js              # 包内 en/zh 字典 + 宿主翻译函数的安全包装
└── view.js              # React 组件 + 错误边界：图 / 源码切换 / 失败回退 / 流式中占位
scripts/
└── build-client.mjs     # header + IIFE 自兜 + require('react') + vendored pele + 片段 → client.js（末尾语法检查）
vendor/pele/
├── pele.global.js       # pele@1.13.0 的 global 构建（原样保存）
└── LICENSE
verify/
└── check-bundle.mjs     # 纯 Node 内置模块的静态断言（含兼容性检查组）
tests/                   # 不放测试框架；verify/ 即验收脚本
```

**Structure Decision**: 仓库根目录就是 npm 包根目录（`specs/`、`.specify/`、`verify/`、`vendor/` 不进 `files`，只发布运行所需文件：`index.js`、`client.js`、`cordis.patch.yml`、`locale/*.json`、`LICENSE`、`THIRD-PARTY-NOTICES.md`、`README.md`）。`client.js` 由 `scripts/build-client.mjs` 从 `src/client/*.js` + `vendor/pele/pele.global.js` 拼出：不引入 bundler，因为唯一允许的外部符号是宿主的 `react`，拼接即可满足宿主"已构建单块 chunk"的要求，同时让 vendored 依赖和自家代码在仓库里可读、可审计。`src/client/*.js` 刻意写成不带 `import`/`export` 的脚本片段，构建脚本按固定顺序拼接，避免为拼接引入任何解析器。

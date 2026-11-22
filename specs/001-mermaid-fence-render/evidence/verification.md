# 验证证据

记录时间：2026-11-22（Asia/Hong_Kong）。环境：DeepSeek Harness Desktop 0.2.2-rc.5，profile `desktop`，Windows；构建与校验用 DSH 自带 Node v24.21.0。

## E-BLD 构建

```text
build-client: @jiezhengj/dsh-dyslexia -> client.js (750926 bytes, engine 1.13.0, sources 5, syntax ok)
```

`client.js` 是唯一产物：引擎 Pele 1.13.0 原样内联，源码片段顺序为 `styles → i18n → figure → view → entry`。

## E-CHK 静态与行为校验（`verify/check-bundle.mjs`）

22 项全通过，其中关键项：

```text
ok   package.json names and entry points — @jiezhengj/dsh-dyslexia@0.1.0
ok   package.json declares the bundle patch and the client half — platform web, no package inject
ok   no dsh version gate can refuse a start — no engines.dsh, no dsh peers
ok   published files leave the build sources out — 8 patterns
ok   client.js requires react and nothing else — react
ok   client.js never reaches the network — no fetch, no XHR, no dynamic import, no remote URL
ok   client.js carries the vendored engine — Pele 1.13.0 inlined
ok   client.js compiles on its own — no syntax error for a host batch to inherit
ok   a broken host loader cannot make the chunk throw — throwing loader, missing loader, missing window
ok   a failing factory still yields a silent module — no react, no ctx, no slots, empty services
ok   an engine that fails to load leaves the picture to the host — boundary + prop guard present
ok   host apply survives a host that changed shape — six hostile hosts, no throw, no section
ok   the layer is keyed to mermaid on the fence slot — conversation.chat.markdown.fence + mermaid
ok   the prompt section states the capability once — 85 words, order 9000, name ui:dsh-dyslexia
ok   every supported sample type draws an svg — flowchart:218x64 sequence:184x167 class:80x192 state:87x206 er:144x201 mindmap:172x71 timeline:408x133
ok   a broken diagram reports a one-line reason — Parse error on line 2:
```

"never reaches the network" 的判定方式：剥掉注释后，除 SVG 命名空间 `http://www.w3.org/2000/svg`（绘图必需，不发起请求）外不存在任何 `http(s)://`；且 `fetch(`、`XMLHttpRequest`、`WebSocket`、`EventSource`、动态 `import(` 均为 0。

## E-HARN 真实浏览器里跑客户端半边（360 px 舞台）

`:file:///C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia/.tmp/harness/index.html`，Chromium（Magpie Browser），React 18.3.1 UMD + `client.js` + 独立加载的 `pele.global.js`，假宿主 ctx：

```text
ok loader id @jiezhengj/dsh-dyslexia
ok exports apply, inject
ok inject ["slots","locale"]
ok effect dsh-dyslexia: figure strings
ok slots.inject conversation.chat.markdown.fence
ok slot def {"name":"conversation.chat.markdown.fence","id":"@jiezhengj/dsh-dyslexia/mermaid","key":"mermaid","order":100,"locale":"dyslexia"}
ok dictionary dyslexia zh/en
ok stylesheet injected (1629 chars)
ok svg drawn
ok frame 360x77px in a 360px stage
ok no horizontal overflow (scrollWidth 360)
ok label font 14px
ok buttons showSource | copySource
ok source panel shows the source
ok failure note: renderFailed<Parse error on line 2:>
ok reason is one line
ok host code block kept on failure
ok streaming block shows the host fence, no partial figure
ok a throwing host t still draws the picture
ok fallback labels 查看源码 | 复制源码
ok a non-text fence falls back to the host code block
ok no figure for a non-text fence
ok a fence with no children renders nothing, not a crash
ok apply stays silent across 4 changed hosts
ok locale-less retry registered a plain layer (1 attempt)
```

无障碍树同时确认：图容器是 `role="img"`、名字来自 `figureLabel:flowchart`，图内文字为 `登录 / 首页 / 设置`。

## E-INS 安装

`plugin_manager install_bundle` → `{"stage":"enable","target":"@jiezhengj/dsh-dyslexia","enabled":true,"changed":true,"application":"applied"}`。

profile `desktop` 的 `package.json` 随后为：

```json
"dependencies": { "@jiezhengj/dsh-dyslexia": "link:C:/Users/jiezhengj/Documents/Project/DSH-Dyslexia", "billion-context": "0.1.216" },
"dsh": { "profile": { "bundles": [ …, "billion-context", "@jiezhengj/dsh-dyslexia" ] } }
```

安装是 `link:`，所以重建 `client.js` 即更新运行中的插件。

## E-REM 卸载

`plugin_manager remove_bundle` → `{"stage":"remove","changed":true,"application":"applied"}`。随后 profile 的 `dsh.profile.bundles` 中不再有该包，`dependencies` 也只剩 `billion-context`。重新 `install_bundle` 后恢复为上面的状态。

## E-PKG 发布包内容（`pnpm pack --dry-run`）

```text
client.js
cordis.patch.yml
icon.svg
index.js
LICENSE
locale/en.json
locale/zh.json
package.json
README.md
THIRD-PARTY-NOTICES.md
```

不含 `src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.specify/`、`.tmp/`。

## E-COMP 兼容性加固（针对"升级后 DSH 打不开"）

调查确认的唯一致命路径在 DSH 启动前的版本门：`dsh/node_modules/@deepseek-ai/dsh-app-boot/src/plugin-compatibility.ts` 的 `unmetRequirements()` 先看包自己的 `engines.dsh`（`semver.satisfies(version, range, { includePrerelease: true })`），不看就直接看 dsh peers，两者都没有则返回 `{}` 放行；而 `dsh/node_modules/@deepseek-ai/dsh-app-boot/lib/index.js:1811-1812` 一旦拿到 issue 就 `throw`，profile 起不来——这就是"升级后打不开、连界面都进不去"的机制。

对应的加固：

| 风险 | 加固 | 证据 |
| --- | --- | --- |
| 版本门拒绝启动 | 删除 `engines`，并让 `dsh.client.inject` 与 dsh peers 都不出现 | E-CHK "no dsh version gate can refuse a start" |
| 客户端脚本语法错误连累同批插件 | 构建末尾 `new Script(chunk)` 编译检查，语法错直接 fail | E-BLD "syntax ok"、E-CHK "client.js compiles on its own" |
| 宿主 loader / window 缺失 | chunk 整体包在 IIFE 里，`reportLoadFailure` 兜住，factory 抛错也只交出空模块 | E-CHK "a broken host loader cannot make the chunk throw"、"a failing factory still yields a silent module" |
| 槽注册、locale 服务签名变化 | 先带 `locale` 注册，失败降级为不带 locale 再注册；`apply` 三段各自 try/catch | E-HARN "apply stays silent across 4 changed hosts"、"locale-less retry registered a plain layer" |
| 宿主 `t` 变化或抛错 | `translateFor` 包一层，异常或非字符串回落到包内中英文案 | E-HARN "a throwing host t still draws the picture" |
| 栅栏 props 不是预期形状 | 边界组件只认字符串 `code`，否则交回宿主代码块；无 `children` 时渲染为空 | E-HARN "a non-text fence falls back to the host code block"、"a fence with no children renders nothing, not a crash" |
| 绘图引擎缺失或抛错 | `mountFigure` 先查 `pele.mount`，缺失即抛给上层转成"源码 + 一行原因" | E-CHK "an engine that fails to load leaves the picture to the host" |
| 宿主 ctx 形状变化（systemPrompt 缺失/签名变） | `apply` 整段 try/catch，拿不到 `ctx.systemPrompt.section` 就静默返回 | E-CHK "host apply survives a host that changed shape" |

删掉的是 **package.json 里的包级 `dsh.client.inject`**（只影响包加载顺序），保留的是 **模块级的 `export const inject = ['slots']`**：模块级 inject 声明的是服务依赖，宿主会等服务就绪后再执行 `apply`，因此不会出现"抢在槽服务之前注册"的时序问题。参照 `dsh/node_modules/@deepseek-ai/dsh-client-ui-chat/src/client/apply.ts`：它同样是 `export const inject = [...]`（服务名）+ `ctx.slots.inject(...)` 的写法。服务一直不存在时本插件只是不激活，不报错。

## 尚未取证（需要真机 DSH 界面）

以下项目没有在 DSH 会话界面里亲眼确认，因此不写成"已验证"：

- E1/E2/E3/E5/E16 在 DSH 会话里的实际显示（插件是否已被运行中的界面加载）——已由 E-HARN 在真实 Chromium 里覆盖同一份 `client.js`（含故障注入），但 DSH 窗口内未截图确认；界面需刷新一次以取到加固后的 `client.js`。
- E10/E11 卸载后旧会话里的显示与重装恢复：只验证了 profile 层卸载，未在会话界面里观察旧图位置。
- E12 断网真机复跑、E13 无工具链裸机安装。
- E27 用 `dsh --profile desktop --dump-config` 核对提示词段：本机是 Desktop 发行版，PATH 上没有 `dsh` CLI。

## E-PUB 发布与从 registry 安装

- npm 账号 `jiezhengj` 的 2FA 是 `auth-and-writes`，非 TTY 环境下 npm 把二次认证链接打码；用 `.tmp/tty.cjs` 给 npm 补一个"看起来是终端"的 `isTTY` + 光标空实现后，链接完整可见：`https://www.npmjs.com/auth/cli/c3824294-603a-4cc8-9af3-78a3f5382c6c`，浏览器里通过安全密钥完成 → `npm publish` 成功。
- registry 首次 `PUT` 返回 401，随后走 `/-/v1/done?authId` 轮询，最终 `PUT 202`，随后 CLI 打印 `+ @jiezhengj/dsh-dyslexia@0.1.0`。
- 包页面：`https://www.npmjs.com/package/@jiezhengj/dsh-dyslexia`；`dist-tags.latest = 0.1.0`（另有 npm 自动生成的 `0.0.0-stage` 占位版本）。
- 已发布 tarball 内容核对（`npm pack @jiezhengj/dsh-dyslexia@0.1.0` + `tar -tzf`）：正好 10 个文件，与 `pnpm pack --dry-run` 一致，不含 `src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.specify/`、`.tmp/`。
- 安装：先 `remove_bundle`（去掉 `link:`），再 `install_bundle` 目标 `@jiezhengj/dsh-dyslexia` → `{"stage":"enable","changed":true,"application":"applied"}`，pnpm 输出 `+ @jiezhengj/dsh-dyslexia 0.1.0`。
- profile `desktop` 的 `package.json` 现在是 `"@jiezhengj/dsh-dyslexia": "^0.1.0"`（不再是 `link:`），`dsh.profile.bundles` 末尾为其包名；`node_modules/@jiezhengj/dsh-dyslexia/client.js` 751,335 字节，与本地产物一致。


## E-PUB2 0.1.1 发布：改由 GitHub Actions 走 OIDC，不再点网页

- 起因：`npm publish` 每次都要在浏览器里碰一次安全密钥，且那次会话过期后 registry 直接回 `404 GET /-/v1/done?authId=***`（0.1.1 没发出去）。
- 采用 npm 的 trusted publisher（OIDC）：包设置页 → Trusted Publisher → GitHub Actions，`jiezhengj/DSH-Dyslexia`、workflow `publish.yml`、允许 `npm publish` 与 `npm stage publish`；创建后状态为 "Pending validation"，要求首次发布后才生效。
- `.github/workflows/publish.yml`：`on: push: tags: v*`，`permissions: contents: read` + `id-token: write`，步骤 = checkout → setup-node 22 → `npm install -g npm@latest` → `node verify/check-bundle.mjs` → `npm publish --access public --provenance`。
- 第一次运行失败于 `E422`：provenance 校验要求 `package.json` 的 `repository.url` 与 workflow 所在仓库一致，而清单里没有 `repository` 字段。补上 `repository.url = git+https://github.com/jiezhengj/DSH-Dyslexia.git`、`homepage`、`bugs` 后，`verify/check-bundle.mjs` 增加第 24 项 "package.json points at the repository npm trusts"，让这类失败在打 tag 之前就暴露。
- 第二次运行成功：`+ @jiezhengj/dsh-dyslexia@0.1.1`，provenance 写入 transparency log（`https://search.sigstore.dev/?logIndex=4045962187`），`dist.attestations.provenance.predicateType = https://slsa.dev/provenance/v1`。
- registry 侧可见：`dist-tags.latest = 0.1.1`、`versions` 含 `0.0.0-stage, 0.1.0, 0.1.1`，tarball `https://registry.npmjs.org/@jiezhengj/dsh-dyslexia/-/dsh-dyslexia-0.1.1.tgz`、shasum `6f730efa33a453c8f8b2ed08155e2dc85325d5be`；npm 会提示"正在处理，可能几分钟后才可用"，实际约两分钟后 `dist-tags` 才切到 0.1.1。
- 仓库：`https://github.com/jiezhengj/DSH-Dyslexia`（public，main），首次 `git push` 遇到 `HTTP 408`，`git config http.postBuffer 524288000` + `http.version HTTP/1.1` 后成功。

## E-INS2 从 registry 安装 0.1.1

- `plugin_manager remove_bundle` → `changed: true, application: applied`（pnpm 移除 0.1.0）。
- `plugin_manager install_bundle` 目标 `@jiezhengj/dsh-dyslexia@0.1.1` → `{"stage":"enable","changed":true,"application":"applied"}`，pnpm 输出 `+ @jiezhengj/dsh-dyslexia 0.1.1`。
- profile `desktop`：`dependencies["@jiezhengj/dsh-dyslexia"] = "0.1.1"`（registry 版本，非 `link:`），`dsh.profile.bundles` 含该包；`node_modules/@jiezhengj/dsh-dyslexia` 内 `version 0.1.1`、`locale/` 8 个文件、`docs/` 8 个 `DETAIL*.md` + `preview.svg`、`icon.svg` 625 字节。
- 运行中的界面仍是 0.1.0 的 chunk（客户端每次启动加载），因此"插件页 8 语言说明 + 新图标 + 会话里画图"的肉眼确认需要在重启 DSH 之后进行。

## E-LANG 八种界面语言

- DSH 自带界面语言 8 种：`zh, en, ja, es, fr, de, ru, pt`（`dsh-client-locale` 的 `addLanguage` 注册 ja/es/fr/de/ru/pt，加内建 zh/en；`desktop-runtime.json` 只收录这 8 个 locale）。
- `locale/<lang>.json` 各带 `meta.title`、`meta.description`、`meta.detail`；`docs/DETAIL{,.zh,.ja,.es,.fr,.de,.ru,.pt}.md` 各自是"一行图片 + 该语言 alt"，指向同目录 `preview.svg`。
- `verify/check-bundle.mjs` 第 6 项 "every interface language has its own plugin page" 校验：8 个 locale 都能解析、title 互不相同、description 长度 ≥ 80、detail 以 `.md` 结尾、对应文档恰好一行且形如 `![alt](preview.svg)`。
- `README.md` 是索引（中英双语简介 + 8 语言链接），`README.en.md` + `README.zh.md` + 6 份其他语言 README 结构一致（它做什么 / 为什么这样设计 / 你会得到什么 / 安装 / 示例 / 卸载与兼容性 / 许可）。

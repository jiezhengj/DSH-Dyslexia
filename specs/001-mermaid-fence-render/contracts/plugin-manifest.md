# 契约：插件清单与加载

**消费者**：DSH Kotori Loader（宿主）与 pnpm / `plugin_manager`。

# package.json

```json
{
  "name": "@jiezhengj/dsh-dyslexia",
  "version": "0.1.12",
  "description": "Draws mermaid code blocks in DeepSeek Harness conversations as diagrams, in place in the message.",
  "type": "module",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./client": "./client.js",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg",
    "./package.json": "./package.json"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web" }
  },
  "files": [
    "index.js",
    "client.js",
    "cordis.patch.yml",
    "locale/*.json",
    "docs",
    "icon.svg",
    "LICENSE",
    "THIRD-PARTY-NOTICES.md",
    "README*.md"
  ],
  "scripts": {
    "build": "node scripts/build-client.mjs",
    "verify": "node verify/check-bundle.mjs",
    "harness": "node verify/run-harness.mjs",
    "test": "node verify/check-bundle.mjs && node verify/run-harness.mjs"
  },
  "license": "MIT"
}
```

> **本清单里不允许出现的东西**（兼容性硬约束，FR-013）：`engines`（含 `engines.dsh`）、任何指向 DSH 包的 `peerDependencies`、`dsh.client.inject`。三者都会让宿主在**启动前**对插件下判断，而插件在未知版本上的正确表现是"不渲染"，不是"被拒绝加载"或"拖垮启动"。

**字段约束**

| 字段 | 约束 | 依据 |
|---|---|---|
| `name` | 必须等于浏览器 bundle 里 `window.__ModuleLoader__.load({ id })` 的 `id` | ui-chat 的 `id` 即包名 |
| `main` | 宿主半边入口，ESM，导出 `name`/`inject`/`apply` | 官方 publish 文档 |
| `exports["./client"]` | 指向已构建单块 chunk，不得再同步 `require` 相邻相对文件 | client-modules 文档 |
| `exports["./icon"]` | 指向 `icon.svg`，供插件页取图标 | 官方 decoration 模板 |
| `dsh.bundle.patch` | 指向 patch 文件（或有序文件列表） | 官方 publish 文档 |
| `dsh.client.platform` | `"web"` | client-modules 文档 |
| `engines` / dsh `peerDependencies` | **一律不写**：写了就会在 `dsh-app-boot` 的启动门里被判定，不满足即 `throw`，profile 起不来（`plugin-compatibility.ts:55-74`、`lib/index.js:1811-1812`） | FR-013 |
| `dsh.client.inject` | **不写**：客户端模块级 `inject` 已能声明所需服务，包级 inject 只会把包名绑死到升级可能改名的宿主包 | FR-013 |
| `repository` / `homepage` / `bugs` | 必须指向真实仓库，且与发布 workflow 所在仓库一致，否则 npm 的 provenance 校验 `E422` | E-PUB 实证 |
| `files` | 只含运行所需文件；`src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.tmp/` 不发布 | 交付自包含 + 体积 |
| 运行期依赖 | 无 `dependencies`；无 `peerDependencies` | 宪法原则 III |

# cordis.patch.yml

```yaml
- insert:
    - id: dsh-dyslexia
      name: '@jiezhengj/dsh-dyslexia'
```

**约束**

- 只有一条 `insert`，`id` 用短横线形式，`name` 用包名。
- 不修改任何宿主既有行的 `config`（不改主题、不改模型、不改权限）。
- 卸载（`remove`）会移除该行并撤掉包，不残留配置。

# 主题与本地化承载

| 文件 | 内容 | 用途 |
|---|---|---|
| `locale/<lang>.json`（8 个） | `{"meta":{"title","description","detail":"docs/DETAIL[.<lang>].md"}}` | 插件页标题、描述与说明图 |
| `docs/DETAIL{,.zh,.ja,.es,.fr,.de,.ru,.pt}.md` | 每篇恰好一行图片，alt 文本用该语言 | 说明页正文 |
| `docs/preview.svg` | 640×300 自包含 SVG，`node scripts/build-preview.mjs` 生成 | 说明页插图 |
| `icon.svg` | 36×36，官方线描风格 | 插件页图标 |
| `src/client/i18n.js` | 12 个键 × 8 种语言 | 层内可见文字（按钮、图名、失败整句） |

8 种界面语言 `zh`、`en`、`ja`、`es`、`fr`、`de`、`ru`、`pt` 各有一份，取自宿主 `dsh-client-locale` 实际注册的语言集合。

# 可静态校验项（`node verify/check-bundle.mjs`，36 项）

与清单直接相关的断言：

1. `package.json` 的 9 条 `files` 模式覆盖 32 个实际文件（`npm pack` 展开为 33 个，含 `package.json`），清单由 `npm pack --dry-run` 核对；`check-bundle` 里那条 `every published file exists` 断言只覆盖其中 **24 个必须存在的文件**（8 个基础文件 + 8 个 `locale/<lang>.json` + 8 份 `README.<lang>.md`）；8 篇 `DETAIL*.md` 由 `every interface language has its own plugin page` 证明，`package.json` 由 `npm pack` 清单证明，都不由那条断言证明。未匹配到 `src/`、`vendor/`、`scripts/`、`verify/`、`specs/` 下任何路径。
2. `exports["./client"]` 指向的文件存在，以授权 banner 开头，`window.__ModuleLoader__.load(` 的 `id` 与包名逐字相等，导出 `apply` 与 `inject`，且正文不含 `</script`。
3. `client.js` 中 `require(` 的实参集合 ⊆ {`react`}。
4. `client.js` 不含 `fetch(`、`XMLHttpRequest`、动态 `import(`、外部 `http(s)://` 资源引用（仅保留 SVG 命名空间字符串）；内联 `Pele 1.13.0`。
5. banner 的 `sources sha256:` 与按源码重算的摘要一致（产物不陈旧）。
6. `cordis.patch.yml` 含 `insert:`、`id: dsh-dyslexia`、`name: '@jiezhengj/dsh-dyslexia'`。
7. 8 个 `locale/*.json` 各有 `meta.title`、`meta.description`（≥80 字符）、`meta.detail`；`detail` 指向的文档存在且恰好一行、形如 `![alt](preview.svg)`；8 种标题互不相同。
8. `index.js` 含 `export const inject = ['systemPrompt']`；`apply` 在正常宿主上恰好注册一段（`ui:dsh-dyslexia`、order 9000、85 词），在 **5 种静默 ctx**（`undefined`、`null`、`{}`、`systemPrompt: null`、`systemPrompt: {}`）与 **2 次异常调用**（`section` 抛错、`section` 返回 rejected Promise）共 7 次 `apply` 上都静默——框架的 `apply stays silent on a changed host` 断言七种畸形客户端 ctx，另有本次宿主机侧的七次调用，两者不是同一组。
9. **无版本门**：不含 `engines`、不含指向 DSH 包的 `peerDependencies`、不含 `dsh.client.inject`（FR-013 / SC-007）。
10. **产物可独立编译**：`new vm.Script(client.js)` 不抛错（FR-015 / SC-008）。
11. **宿主加载器异常不连累**：会抛错的 `load`、缺失 `load`、缺失 `window` 三种宿主执行 `client.js` 均不抛。
12. **工厂抛错仍可用**：工厂里 `require('react')` 抛错时返回空模块（`apply` 与 `inject` 都在、`inject` 为空），`apply` 静默。
13. **含边界与守卫**：`client.js` 内含 `getDerivedStateFromError`、`readLayerInput`、`safeRead`、`engineUnavailable` 文案。
14. **引擎故障可控**：`PeleError` 只输出一行原因；7 种图各能真画出 SVG。
15. **文案完整**：12 个键 × 8 语言齐全，失败整句里不含 `{{reason}}`、不含引擎英文。
16. **key 回显防线**：`i18n.js` 的 `isResolved` 拒绝回显 key、纯空白、未替换占位符。

# 浏览器行为校验（`node verify/run-harness.mjs --list`，156 项）

夹具 `verify/harness/index.html` 提交进仓库，用真实 Chromium 打开 `file://`，覆盖：槽注册形状、8 语言逐个驱动、5 类敌意 `t`、绘制/坏图/引擎抛错/getter 抛错、复制成功与失败、360 px 窄屏、主题换色、locale 重试、7 种畸形 `ctx`、内部 key 不外泄。


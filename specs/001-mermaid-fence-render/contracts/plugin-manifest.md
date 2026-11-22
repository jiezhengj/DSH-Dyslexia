# 契约：插件清单与加载

**消费者**：DSH Kotori Loader（宿主）与 pnpm / `plugin_manager`。

# package.json

```json
{
  "name": "@jiezhengj/dsh-dyslexia",
  "version": "0.1.0",
  "description": "Renders Mermaid code blocks in DeepSeek Harness conversations as diagrams.",
  "type": "module",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./client": "./client.js",
    "./locale/*.json": "./locale/*.json",
    "./package.json": "./package.json"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web" }
  },
  "files": ["index.js", "client.js", "cordis.patch.yml", "locale/*.json", "LICENSE", "THIRD-PARTY-NOTICES.md", "README.md"],
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
| `dsh.bundle.patch` | 指向 patch 文件（或有序文件列表） | 官方 publish 文档 |
| `dsh.client.platform` | `"web"` | client-modules 文档 |
| `engines` / dsh `peerDependencies` | **一律不写**：写了就会在 `dsh-app-boot` 的启动门里被判定，不满足即 `throw`，profile 起不来（`plugin-compatibility.ts:55-74`、`lib/index.js:1811-1812`） | FR-013 |
| `dsh.client.inject` | **不写**：客户端模块级 `inject` 已能声明所需服务，包级 inject 只会把包名绑死到升级可能改名的宿主包 | FR-013 |
| `files` | 只含运行所需文件；`src/`、`vendor/`、`scripts/`、`verify/`、`specs/` 不发布 | 交付自包含 + 体积 |
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
| `locale/en.json` | `{"meta":{"title":"DSH Dyslexia","description":"Renders Mermaid code blocks in the chat as diagrams."}}` | 插件卡片文案 |
| `locale/zh.json` | `{"meta":{"title":"DSH 图表渲染","description":"把会话里的 Mermaid 代码块渲染成图。"}}` | 同上 |
| `src/client/entry.js` 内 | `ctx.locale.register('dyslexia', { zh:{…}, en:{…} })` | 层内可见文字（失败原因、源码切换、缩放按钮） |

两个基线语言 `zh` 与 `en` 必须同时提供（client-locale 契约）。

# 可静态校验项（`verify/check-bundle.mjs` 断言）

1. `package.json` 的 `files` 列出的文件全部存在；`files` 未匹配到 `src/`、`vendor/`、`specs/` 下任何路径。
2. `exports["./client"]` 指向的文件存在，且首行以 `window.__ModuleLoader__.load({id:` 开头、`id` 与包名逐字相等。
3. `client.js` 中出现的 `require(` 实参集合 ⊆ {`react`}。
4. `client.js` 中不含 `http://` / `https://` 外部资源引用（本地 `data:`/`dsh-resource:` 允许），不含 `fetch(`、`XMLHttpRequest`、`import(`。
5. `vendor/pele/pele.global.js` 存在且含版本串 `1.13.0`；`vendor/pele/LICENSE` 与 `THIRD-PARTY-NOTICES.md` 存在。
6. `cordis.patch.yml` 可被极简 YAML 断言命中：含 `insert:`、`id: dsh-dyslexia`、`name: '@jiezhengj/dsh-dyslexia'`。
7. `locale/en.json` 与 `locale/zh.json` 均含 `meta.title`、`meta.description`，且 `en` 为英文、`zh` 含中日韩字符。
8. `index.js` 含 `export const inject = ['systemPrompt']` 与一次 `ctx.systemPrompt.section(`，且不含 `http`/`fs`/`child_process` 引用。
9. **无版本门**：`package.json` 不含 `engines`，不含任何指向 DSH 包的 `peerDependencies`，不含 `dsh.client.inject`（FR-013 / SC-007）。
10. **产物可独立编译**：`new vm.Script(client.js)` 不抛错（FR-015 / SC-008）。
11. **宿主加载器异常不连累**：用会抛错的 `load`、缺失 `load`、缺失 `window` 三种宿主执行 `client.js`，均不抛错（FR-015）。
12. **工厂抛错仍可用**：工厂里 `require` 抛错时仍返回 `{ apply, inject }`，且 `apply(undefined)`/`apply({})`/`apply({ slots: null })` 均不抛（FR-014 / FR-015）。
13. **含边界与守卫**：`client.js` 内含错误边界与围栏数据守卫（FR-016）。
14. **畸形宿主 ctx 不抛**：`apply` 在六种畸形宿主下不抛错（`undefined`、`null`、`{}`、`systemPrompt: null`、`section` 为空、`section` 会抛）；且宿主提示词失败时不留下半截段落（FR-014）。

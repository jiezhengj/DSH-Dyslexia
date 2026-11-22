# Quickstart：构建、安装、验证

本文只写可执行步骤与证据要求。所有命令在仓库根目录 `C:\Users\jiezhengj\Documents\Project\DSH-Dyslexia` 下执行；Node 用 DSH 自带运行时即可，不额外安装：

```powershell
$node = "C:\Users\jiezhengj\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
```

# 一、准备 vendored 渲染引擎（一次性）

1. 取 `pele@1.13.0` 的 `dist/pele.global.js` 与仓库 `LICENSE`，放到 `vendor/pele/`（`pele.global.js`、`LICENSE`）。
2. 在 `THIRD-PARTY-NOTICES.md` 记录：包名、版本 `1.13.0`、许可 MIT、来源 URL、取得日期。
3. 只信已落地文件：`vendor/pele/pele.global.js` 内应可搜到 `1.13.0`。

# 二、构建浏览器半边

```powershell
& $node scripts/build-client.mjs
```

产物 `client.js` = 头部 `window.__ModuleLoader__.load({ id, factory })` + `require('react')` + 内联的 pele + `src/client/{styles,i18n,figure,view,entry}.js`（按此顺序，共 5 段）+ 尾部导出。构建脚本必须：

- 只读仓库内文件，不联网、不装依赖；
- 幂等（同输入同输出）；
- 失败时以非零码退出并说明缺哪个文件。

# 三、静态校验

```powershell
& $node verify/check-bundle.mjs
```

逐条断言见 [contracts/plugin-manifest.md](./contracts/plugin-manifest.md#可静态校验项verifycheck-bundlemjs-断言)。任何一条失败即视为不可发布。

# 四、安装进本机 profile

宿主 profile 为 `desktop`（`C:\Users\jiezhengj\.dsh\profiles\desktop`）。推荐路径是 DSH 内的插件管理（等价于 `dsh plugin --profile desktop add <目录>`）：

1. 用 `plugin_manager` 的 `install_bundle` 指向本仓库根目录（需要 danger-full-access 权限，由用户批准）。
2. 装完确认：`plugin_manager` 的列表里出现 `@jiezhengj/dsh-dyslexia`，标题与描述随当前界面语言显示。
3. 生效范围（实测口径，两件事分开）：启用/停用/卸载**已在运行的界面里立刻生效**（层随 HMR 图增删，图与按钮立刻出现或消失）；换成**另一个版本的包**时需要重启 DSH，因为宿主进程里的宿主半边与页面里的 chunk 都要重新加载。

卸载：`plugin_manager` 的 `remove_bundle`，目标 `@jiezhengj/dsh-dyslexia`。

# 五、验收证据表

每条都要有可见证据（截图 / 网络面板 / 会话内容），结论写进交付说明；无法验证的项**必须标注为未验证**。

| # | 场景 | 操作 | 通过标准 | 对应 |
|---|---|---|---|---|
| E1 | 图直接出现 | 让 Agent 输出一个含 ` ```mermaid ` 的 flowchart 回答 | 代码块位置显示为图；无新文件、无侧栏、消息顺序不变 | US1 / FR-001 / FR-002 |
| E2 | 多图并存 | 一条回答里放 2–3 个不同图类型 | 各自独立渲染，互不影响 | US1-2 |
| E3 | 查看源码 | 点"查看源码" | 出现完整 mermaid 文本，可复制；再点可收起 | FR-003 |
| E4 | 语法错误 | 手工构造非法 mermaid | 原样显示代码块 + 一行可读原因；无白屏、无堆栈 | FR-004 / 边界 1 |
| E5 | 流式中 | 观察 Agent 正在写代码块时 | 期间显示代码块，写完一次渲染，无空图闪烁 | 边界 2 / D8 |
| E6 | 超大图 | 构造 200+ 节点图 | 回退为代码块 + 原因；页面不卡死 | 边界 3 / FR-004 |
| E7 | 主题切换 | 深 → 浅 → 深 | 图配色跟随，无需刷新 | FR-007 / SC-005 |
| E8 | 窄屏 | 视口 360 px 浏览含图会话 | 页面无横向溢出；图按容器宽重排；图内文字不小于正文 | US3 / FR-006 / SC-003 |
| E9 | 缩放 | 触屏或鼠标操作溢出图 | 可放大/缩小/复位，且不影响会话其余布局 | US3-2 |
| E10 | 卸载回退 | 卸载插件后重开旧会话 | 原图位置显示完整代码块，可复制、可被 `session_search` 命中 | US2 / FR-009 / SC-002 |
| E11 | 重装恢复 | 重新安装后打开同一旧会话 | 图恢复渲染，无迁移动作 | FR-010 |
| E12 | 断网渲染 | 断网后打开含图会话 | 图正常显示；网络面板外部请求为 0 | US4 / FR-005 / SC-004 |
| E13 | 裸机假设 | 只在装有 DSH 的机器上安装（不装 Node/Python/其他工具） | 装好即可见，无额外依赖步骤 | US4-1 / 原则 II |
| E14 | 语言跟随 | 切换界面语言 中文 ↔ English | 失败说明、按钮、插件卡片文案都随之变化 | FR-008 |
| E15 | 未装插件的新会话 | 卸载后让 Agent 表达结构信息 | 不产生"只有装插件才看得懂"的内容（模型不再被告知会渲染） | US2-2 / FR-011 |
| E16 | 其他代码块不受影响 | 同一条消息里放 js / diff / math / 无语言代码块 | 只有 mermaid 块变化，其余与升级前一致 | 边界 5、6 |

# 六、打包后复检

```powershell
npm pack --dry-run   # 或 pnpm pack --dry-run
```

- 核对清单只含 `files` 允许的条目；`src/`、`vendor/`、`scripts/`、`verify/`、`specs/`、`.specify/`、`.tmp/` 均不在内。
- 在断网状态下、用打出来的 tarball 装一次并重跑 E1/E4/E10/E12/E13。

# 七、已知限制的写法

交付说明里必须显式区分：**已验证**（有证据）、**未验证**（没条件或没做）、**已知不支持**（例如本期只认 mermaid 代码块这一种图源；其他图形格式另立功能）。不得把"未验证"表述成"应该可以"。

# 兼容性证据（E-COMP，对应 FR-013～FR-017 / SC-006～SC-008）

这一组证据回答的问题是"插件能不能把 DSH 搞成打不开"，与功能证据分开记；全部为可重复命令，结论写在 `evidence/verification.md` 的 E-COMP 一节。

| 编号 | 做什么 | 通过标准 | 对应 |
|---|---|---|---|
| E-COMP-1 | `node verify/check-bundle.mjs` | 35 项全过，其中"无版本门""可独立编译""畸形加载器不抛""工厂抛错仍可用""含边界与守卫""畸形宿主 ctx 不抛""宿主半边注册一段/畸形宿主静默"七组必须全绿 | FR-013～FR-017 |
| E-COMP-2 | `node scripts/build-client.mjs` | 末尾 `new Script(chunk)` 语法检查通过（故意插入语法错误时必须失败） | FR-015 / SC-008 |
| E-COMP-3 | `node verify/run-harness.mjs --list`（夹具 `verify/harness/index.html` 已提交） | 109 项全绿，含故障注入（宿主 `t` 抛错/回显 key、围栏 `code`/`children` 取值器抛错、宿主交出 React 不收的 `children`、引擎抛错、无 slots 服务、坏语法、裁剪板缺失），宿主侧无未捕获异常 | FR-014～FR-016 / SC-006 / SC-009 |
| E-COMP-4 | 发布包清单核对 | `npm pack` 后的 `package.json` 无 `engines`、无 dsh peer、无 `dsh.client.inject` | FR-013 / SC-007 |
| E-COMP-5 | 真机装/重启 | DSH 正常打开、会话正常、图照常显示；随后 `remove_bundle` 后旧会话立刻回退为代码块，重装后立刻恢复（已取证，但**取证的版本是 0.1.2**，见 evidence/verification.md 的 E-LIVE；0.1.8 的复核是 T079） | FR-009 / FR-013 |
| E-COMP-6 | 宿主升级演练（记版本号，下次升级后复跑） | 升级后应用能打开、历史图回退为文本、重装后图恢复 | US5（**未取证**） |

**写法要求**：E-COMP-5 与 E-COMP-6 未做时不得写"应该没问题"，只能写"未验证"并说明原因（与 T031 同一口径）。

# 八、发布（tag 触发，不点网页）

发布不走本地 `npm publish`：npm 端为该包建了 trusted publisher（OIDC），只认 `jiezhengj/DSH-Dyslexia` 仓库的 `.github/workflows/publish.yml`。

```powershell
$node -v                                  # 只为跑校验脚本
git push origin main                      # 先确认工作区干净
# 改 package.json 的 version，然后：
git commit -am "<version>: …"
git tag -a v<version> -m "0.1.7: …"
git push origin main; git push origin v<version>
gh run watch                              # 观察 publish 工作流
```

工作流依次做五件事：`node scripts/build-client.mjs` 重建 chunk → `git diff --exit-code -- client.js` 拒绝发布陈旧产物 → `node verify/check-bundle.mjs`（35 项）→ `node verify/run-harness.mjs`（109 项浏览器检查，与本地 `--list` 同一脚本、同一批断言，只是不逐行打印）→ `npm publish --access public --provenance` 并把 provenance 写到 transparency log。

- 版本号必须先改：tag 与 `package.json` 不一致时 npm 会拒绝。
- `repository.url` 必须与 workflow 所在仓库一致，否则 `npm publish` 报 `E422 … Failed to validate repository information`。
- 发布后需要等一两分钟 `dist-tags.latest` 才会切换；`npm stage publish` 权限也在连接里，需要"先暂存、后人工批准"时把 workflow 的 `npm publish` 换成 `npm stage publish`。
- 本地验证安装：`plugin_manager install_bundle` 目标写 `@jiezhengj/dsh-dyslexia@<version>`，装完重启 DSH；profile 里应看到版本号而不是 `link:`。


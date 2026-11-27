# Quickstart: 亲手验证"图看得清、有颜色"

本文件只讲**怎么跑、看什么**；取值与阈值见 [data-model.md](./data-model.md) 和 [contracts/verification-baseline.md](./contracts/verification-baseline.md)。

## 前置

- Node.js 18+；仓库根目录执行
- 无头浏览器断言由 `verify/run-harness.mjs` 自己拉起，无需手工开浏览器
- 刷新令牌快照时才需要装好的 DeepSeek Harness 桌面版

## 1. 构建与全套检查

```bash
npm run build     # 重建 client.js（样式改动只有重建后才进产物）
npm test          # check-bundle.mjs（静态/源码断言）+ run-harness.mjs（浏览器断言）
```

期望：全部通过，且控制台打印的检查数等于 `verify/run-harness.mjs` 里的 `EXPECTED_CHECKS`。数量不符本身就是失败——新增断言时必须同步改数字。

单独跑其中一半：

```bash
npm run verify    # 只跑静态/源码断言
npm run harness   # 只跑浏览器断言
```

## 2. 证明旧配色确实会失败（反向验证）

把配色整块改回 0.2.24 的九行映射：`--pele-line` → `var(--dsw-alias-border-l2)`、`--pele-border` → `var(--dsw-alias-border-l1)`、`--pele-surface` → `var(--dsw-alias-bg-layer-2)`、`--pele-accent` → `var(--dsw-alias-brand-primary)`，并删掉那五条角色规则：

```bash
npm run build && npm run harness   # 期望：11 条断言失败，不止一条
```

实际结果（2026-11-27，宿主 0.2.2-rc.5 令牌、Chrome 158）：

| 主题 | 失败断言 | 实测 |
| --- | --- | --- |
| 浅色 | flow lines ≥3:1 | 1.25:1 |
| 浅色 | 五个角色各自成色 | 只有 1 种填充（`rgb(255,255,255)`） |
| 浅色 | 四类角色通道差 ≥18 | 起止 0 / 判断 0 / 数据 0 / 输入输出 0 |
| 浅色 | 相邻角色色相差 ≥20° | 0° / 0° / 0° |
| 浅色 | 处理类填充对背景 >1.05 | 1.00:1 |
| 浅色 | 处理类描边 ≥3:1 | 1.09:1 |
| 深色 | flow lines ≥3:1 | 1.46:1 |
| 深色 | 五个角色各自成色 | 只有 1 种填充（`rgb(44,44,46)`） |
| 深色 | 四类角色通道差 ≥18 | 全部 2 |
| 深色 | 相邻角色色相差 ≥20° | 0° / 0° / 0° |
| 深色 | 处理类描边 ≥3:1 | 1.19:1 |

改回新映射再跑一次，346 条全绿。**这一步不能跳过**：它证明新断言不是恒真式——旧 bug 在新夹具下必然被抓到（SC-005 要求 ≥6 条，实测 11 条），是本 feature 的验收地基。

## 3. 看角色配色（真实令牌）

```bash
node scripts/build-preview.mjs     # 生成 docs/preview.svg（令牌来自 verify/host-tokens.json）
node scripts/build-evidence.mjs    # 生成 evidence/shipped.html：浅色与深色并排 + 量测报告
open specs/003-diagram-palette-contrast/evidence/shipped.html
```

`build-evidence.mjs` 直接引用 `src/client/styles.js` 的样式与快照令牌，页面底部 `<pre id="report">` 会打印每个角色的填充、文字对比度、描边对比度，可用 `--dump-dom` 读数（不需要截图肉眼看）。当前实测：浅色连边 3.71:1、文字 15.1–16.7:1、描边 4.9–8.1:1；深色连边 8.54:1、文字 10.4–11.1:1、描边 10.1–11.6:1。

逐项对图确认：

1. 五个方框（起止/判断/数据/输入输出/处理）颜色**互不相同**，且一眼能说出"这个是判断框"。
2. 连边与箭头是清楚的深灰（`label-tertiary`），不是雾一样的浅灰。
3. 深色主题下（切系统外观或手动改 body 的 dark 作用域）方框仍是彩色，不是泥褐色。
4. 用 `classDef` 指定颜色的节点，颜色等于作者写的值，不被插件覆盖。

## 4. 刷新宿主令牌快照

宿主升级后（`/Applications/DeepSeek Harness.app` 版本变化）：

```bash
# 从 app.asar 里取 light 与 dark 两套令牌，写入 verify/host-tokens.json
node scripts/extract-host-tokens.mjs         # 快照实现阶段新增，路径见 tasks.md
npm run build && npm test                    # 快照变了就重跑全套
```

期望：若宿主把 `label-tertiary`、`link`、静态色板改弱了，A/B 组断言会失败——这正是我们希望在升级时被提醒的。

## 5. 宿主内核对（人工，不可替代）

装进一个 profile 并开会话：

```bash
dsh plugin add ./jiezhengj-dsh-dyslexia-0.3.0.tgz   # 或按项目既有安装方式
```

在会话里贴一个典型流程图与一个饼图，确认：

| 场景 | 期望 |
| --- | --- |
| 浅色主题 | 线可见、五类角色成色、文字清晰 |
| 深色主题 | 同上，无泥褐色、无"黑底黑框" |
| 作者写了 `classDef` | 按作者颜色渲染 |
| 窄屏（360px）与 200% 字体 | 图不溢出，颜色不因此失效 |
| 卸载插件 | 代码块回退为文本（001 契约） |

截图存到 `specs/003-diagram-palette-contrast/evidence/`，文件名带主题与日期。

**本次落地状态**：仓库内证据（`evidence/shipped.html` + `shipped.png`）与**真机会话**五项都已在 2026-11-27 完成：`npm pack` 的 0.3.0 已装进 `desktop` profile（registry 仍是 0.2.24），用复制出的 `desktop-check` profile 起真实宿主实例后逐项截图，文件与量测数字见 [evidence/README.md](evidence/README.md) 的"真机会话取证"一节（`light-flowchart.png`、`dark-flowchart.png`、`dark-pie.png`、`narrow360-light.png`、`zoom200-light.png`、`uninstalled-fallback-light.png`）。宿主升级后仍需按上面第 4、5 节重刷快照并重拍。

## 6. 常见疑问

- **颜色是写死的吗？** 不是。所有色相都是宿主 `--dsw-*` 令牌的引用，深浅主题靠变量解析自动跟随，插件里没有十六进制色值（`check-bundle.mjs` 会断言）。
- **为什么"处理"框是灰的？** 处理是流程图里最常见的一类，给它低饱和色可避免整张图花掉；它的可见性靠描边（`label-tertiary` 派生）保证。
- **模型不写 `([ ])` 怎么办？** 那就是普通矩形，按"处理"上色，图依然可读；提示词里已点名五种约定形状（FR-011），但不强制。
- **`color-mix()` 不支持怎么办？** 每条规则前有一行纯变量回退声明，会退回黑白可读图，不会空白（D2）。

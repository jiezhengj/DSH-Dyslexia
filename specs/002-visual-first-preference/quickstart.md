# Quickstart: 视觉优先开关与命名

前置：仓库根目录、Node.js 22 或更新版本、本机已装 Chrome（`DSH_DYSLEXIA_CHROME` 可覆盖路径）、已安装 DSH 桌面端。

## 离线校验（不需要 DSH）

```bash
node scripts/build-client.mjs      # 生成 client.js，打印字节数/字符数/引擎版本/sources 数与语法检查结果（版本号与指纹由 check-bundle 打印）
node verify/check-bundle.mjs       # 静态与源码级断言
node verify/run-harness.mjs        # 无头浏览器行为断言
node verify/run-harness.mjs --list # 逐条列出断言名（证据引用用）
```

期望：三项全绿（`0.2.17` 工作树上是 63 条静态、301 条浏览器断言）；`build-client` 只打印 `(788314 bytes, 786797 characters, engine 1.13.0, sources 6, syntax ok)` 这一行，版本/字节/指纹行由两条 `verify` 命令输出（形如 `包名@版本 | client.js 字节 | sources sha256`），可直接粘贴进证据。

## 端到端验证（需要 DSH）

| 编号 | 步骤 | 期望 |
| --- | --- | --- |
| E1 | 安装本版本并重启桌面端 | 插件列表标题是「DSH 我有阅读障碍」（或当前界面语言的对应说法） |
| E2 | 打开设置 → 通用设置 | 出现一行开关「优先用图，而不是成段文字」，默认打开，说明一句话 |
| E3 | 关掉开关，问一个多步骤流程问题 | 回答以文字为主；图仍可被显式要求 |
| E4 | 打开开关，问同类问题 | 回答以图（mermaid 代码块就地成图）为主，文字只补图外的约束 |
| E5 | 切换后不重启，直接发下一条消息 | 新状态已生效 |
| E6 | 重启桌面端再打开设置 | 开关保持上次状态 |
| E7 | 只用键盘 Tab + Space | 可聚焦、可切换，`aria-checked` 变化 |
| E8 | 把界面语言切到其余 7 种 | 标题与说明是该语言文本，无未翻译键 |
| E9 | 360px 宽 + 200% 字体 | 说明换行，不截断、不横向溢出 |
| E10 | 在配置文件里改 `visualFirst` | 打开着的设置面板跟随变化，无需刷新 |
| E11 | 制造写入失败（只读 profile / 权限拒绝） | 开关回退到实际值 + 可见失败提示 |
| E12 | 移除插件配置行（等价旧版本） | 插件按默认打开工作，不因缺字段报错 |
| E13 | 卸载插件并重启 | 开关行消失；历史消息回退为纯代码块 |
| E14 | 重新安装并重启 | 开关回到卸载前的值；历史恢复为图 |

## 证据采集

- E1–E14 的每一项 MUST 在 `specs/002-visual-first-preference/evidence.md` 里落成一行，写清工具、命令、观察值与截图路径；本次未跑，见 `evidence.md` G6。
- 无法自动化的项（真实键盘手感、读屏播报、模型是否真的更爱画图）MUST 另记在"未取证"段，并给出人工核对方式。

## 探针（证明断言会失败）

对每个关键断言做一次"故意破坏 → 重建 → 跑 → 确认变红 → 还原"；已跑四十九个探针编号、四十余次记录（F1–F15 十五条，P19–P37 二十五条针对检查本身的探针，`0.2.16` 的 M1–M6 与 `0.2.17` 追加的 M7–M8（P24–P37 明细见 E-PROBE 表，P36 拆成 P36a–P36h 八次记录）：P24 把 `SETTINGS_SLOT` 改名（宿主永不认领的 owner key）、P25 删 `if (!face) return false`、P26 删 configForms 守卫、P27 删 `if (!slots) return false`（无可观测红线，保留为防御）、P28 删 `claimSettingsPage(ctx)` 调用、P29 改源码不重建（陈旧产物）、P30 删行内的 `role: 'switch'`（夹具中断，43 条不再执行）、P31 去掉 `.volatile()`（静态 2 红、浏览器不动）、P32 改名 `SETTINGS_SLOT` 并加一句同文诱饵（静态 2 红）、P33 改 `vendor/pele/pele.global.js` 不重建（旧指纹看不见，静态 1 红）、P34 让边界兜底 `return null`（页面级断言红，静态也红）、P35 删样式表的 `ctx.effect` 登记（静态 2 红）、M7 改偏好段一个词（静态 1 红）、M8 追加无条件句（静态 1 红）。），输出行记在 `evidence.md` 的 E-PROBE：

1. **F1 两档提示词**：让 `briefing` 无视开关、总是拼上偏好段 → `the section hands the host a function, not a frozen string`、`the capability briefing is what it was before the switch`、`the switch adds the preference on top of the capability, and nothing else` 报红。
2. **F3 默认值**：把 `.default(true)` 改成 `.default(false)` → `the switch is on for an empty configuration` 报红。
3. **F4 注销路径**：把 `ctx.effect` 换成直接调用 → `styles and strings are claimed as effects` 等浏览器断言报红。
4. **F5 写失败回退**：删掉失败分支里的 `store.set(before)` → `a rejected write leaves the switch where the host put it` 报红。
5. **F6 只写一次**：把 `setValue(next)` 调两次 → `one click asks the host for the opposite value once` 报红。
6. **F7 `aria-checked` 绑定**：把 `aria-checked` 固定成 `true` → `the switch turns off after the write` 报红。
7. **F8 命名空间**：让 `hostKey` 返回裸键 → `a host dictionary that already owns a word does not put it on our button`、`a host that translates the namespaced key is used` 报红。
8. **F9 无 setter 宿主**：在 `inject` 里无条件挂 `setValue`（把 `if (face && typeof face.set === 'function')` 改成 `if (face)`）→ `a host whose face has no setter hands the row no writer at all` 报红（`[bad] ... — setValue is function`，`run-harness: 1 failed, 259 passed`）。

9. **F10 拒绝写入的恢复目标**：让 `restore` 只放回点击前捕获的 `before`、不再读 face → `a refused write keeps the value the host took while it was pending` 报红（`run-harness: 1 failed, 273 passed`）。
10. **F11 宿主推送的值**：删掉 `entry.js` 里的 `face.subscribe` effect → `a refused write that resolves false puts the switch back and says so` 与 `a value the host pushes reaches the switch without a write` 报红（`run-harness: 2 failed, 272 passed`）。
11. **F12 能力段逐字比对**：把 `index.js` 能力段里的 `in place inside the conversation.` 改成 `in place within the conversation.` → `the capability briefing is what it was before the switch` 报红（`check-bundle: 1 failed, 44 passed`）。
12. **F13 thenable 抛错**：把 `pending.then(...)` 移到 `try` 之外 → `a thenable that throws out of then cannot break the click` 报红（`run-harness: 1 failed, 273 passed`）。

13. **F14 宿主钩子形态**：删掉 `VisualFirstRow` 里的 `useVisualFirst` 分支 → `a host that passes hooks as hook props still gets a visible row`、`the switch follows the value the host hook reports`、`clicking the switch writes through the writer the host gave it`、`the switch then shows the value the host now holds` 报红（`run-harness: 4 failed, 276 passed`）。
14. **F15 值仓库的宿主接口**：删掉 `createValueStore` 的 `getSnapshot()` → `the settings row reads the hook the host builds, not an object it never sends` 与两条夹具报红（`check-bundle: 1 failed, 46 passed`、`run-harness: 2 failed, 281 passed`）。
15. **P19–P23 检查自身的可证伪性**：分别把 `if (typeof ctx.get === 'function')` 改成 `if (false)`、把 `if (accepted)` 改成 `if (true)`、让缺字段回落 `false`、把回显守卫取反、删掉乐观帧 —— 每条都让对应断言变红，红行见 `evidence.md` 的 E-PROBE。

F2（段 `text` 从函数改回冻结字符串）在这个函数断言存在前两套都抓不到；现在由第 22 条静态检查 `the section hands the host a function, not a frozen string` 捕获，因此不单列为一条可复现探针。

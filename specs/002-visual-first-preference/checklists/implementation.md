# Implementation Checklist: 视觉优先开关与命名

**Purpose**: 在实现前把"容易做漏、做假"的点列成可勾项
**Created**: 2026-11-23

## 行为

- [x] 默认值为 `true`：全新安装时配置文件里没有该字段，两档都由这段代码的默认值决定；从 001 的"升级"其实是 `remove_bundle` 后重装，原地升级从未观察（G21）。
- [x] 关闭后提示词段与 001 **逐字**相同：`the capability briefing is what it was before the switch` 逐句比对 001 契约里的四句 `MERMAID_RENDER_PROMPT`，并断言整段相等（`0.2.5`，G9 关闭）。
- [x] 打开后偏好段出现在能力段之后，且仍只有一个 `ui:dsh-dyslexia` 段。
- [ ] 切换即时生效：不重启、不重装，下一条消息即遵循。未做，见 `evidence.md` G6。
- [x] 写入失败时界面回到宿主当前值 + 可见提示（`readHostValue` 重读快照）；保证以宿主给出答案为前提——宿主答过后显示值才等于实际生效值，写入始终不落定时行可能停在读者请求的值（`evidence.md` G11）。
- [ ] 外部改值后面板跟随更新：夹具已断言宿主推送的值到达开关（`a value the host pushes reaches the switch without a write`，`aria-checked` 与计算出的颜色），订阅注销与真机跟随仍未断言，见 `evidence.md` G6/G1。

## 无障碍与本地化

- [x] 原生 `button` + `role="switch"` + `aria-checked`，`aria-labelledby`/`aria-describedby` 指向可见文本。
- [ ] 键盘 Space/Enter 可切换；焦点环不被样式吞掉。夹具只断言可聚焦，未单独断言按键行为，见 `evidence.md` G6。
- [x] 4 条新文案 × 8 语言全部有译文；任一条退回英文即视为不通过。
- [ ] 8 语言 × 200% 字体 × 360px 不截断、不重叠、不横向溢出。没有断言，见 `evidence.md` G3。

## 视觉

- [ ] 标题/说明的字号、字重、颜色取自宿主 token；与相邻官方行对齐（截图比对）。token 已用，截图未比对，见 `evidence.md` G5。
- [ ] 开关尺寸、轨道色、圆点、焦点态与宿主其它开关一致。控件是自绘的（`src/client/styles.js:24-28`：轨道 36×20、`rgba(120, 130, 150, 0.35)`、白色圆点，checked/focus 用 `--dsw-alias-brand-primary`），与宿主开关的像素级一致性从未并排对比（E-GAPS 的 G5），因此不勾。
- [ ] 深色与浅色主题各看一次。未做，见 `evidence.md` G5。

## 交付

- [x] 8 语种 `meta.title`/`meta.description`、8 篇 `docs/DETAIL`（名字只在 alt 句）、9 份 README 同名同义；九份的安装段写同一句诚实的真机边界——渲染器在 `0.1.31` 上真机验证过（`0.1.32` 已安装，其复制回执的实机复核仍待，见 feature 001 的 T331）；本 feature 的开关在 **Web 界面**观察过四次（`0.2.6` 首次渲染与点击写入、`0.2.8` 重启与卸载、`0.2.9` 控制台安静、`0.2.16` 已发布的构建，E-LIVE），尚未在**桌面**窗口观察（G1/G6）。
- [ ] 包名、入口 id、文件名不变（已核实）；但「升级不需要迁移或重装」没有取证——每次安装都是 `remove_bundle` 后重装，原地升级从未观察（E-GAPS 的 G21）。
- [ ] 证据文件按 E1–E14 逐条落档；未取证项单独登记，不写成已验证。E1–E14 未跑，见 `evidence.md` G6。
- [x] 探针（当时 12 条：F1、F3–F13；后续追加到六十条编号：F1–F15 十五条、P19–P37 二十六条、M1–M8 八条（M1–M6 于 `0.2.16`、M7–M8 于 `0.2.17`；P31/P32 于 `0.2.12`、P33–P35 于 `0.2.13`、P36a–P36h 于 `0.2.14`、P37 于 `0.2.15`）、N1–N4 于 `0.2.19`、Q1–Q7 于 `0.2.20`）逐条破坏并复原记录在案：F10–F13 在 `0.2.5` 树上重跑，F9 由 no-writer 断言报红；F2 由第 22 条静态检查捕获，单列说明。

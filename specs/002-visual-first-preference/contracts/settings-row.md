# Contract: 设置行（Client 半边）

## 槽与注册项

```js
ctx.slots.inject('settings.general.item', () => ctx.slots.register({
  name: 'settings.general.item',
  id: 'visual-first',
  order: 80,
  locale: 'dyslexia',
  inject: () => ({ … }),
}, VisualFirstRow))
```

- 槽名 MUST 是 `settings.general.item`（`kind: list`、`scope: root`）。
- 注册项 `id` MUST 为稳定字面量 `visual-first`（重复注册同 id 由宿主去重）。
- 只有拿到 `configForms` 服务时才注册；拿不到 MUST 静默跳过（不抛错、不占位）。
- 组件 MUST NOT 依赖 owner 传入的任何 props；标题、值、写入路径全部经 `inject` 面提供。

## 数据面

| 成员 | 类型 | 语义 |
| --- | --- | --- |
| `getValue()` | `boolean \| undefined` | 当前生效值；`undefined` = 不可用 |
| `subscribe(listener)` | `() => void` | 外部改动回调；用 `ctx.effect` 注册清理 |
| `setValue(next)` | `Promise<void>` | 写入；失败时 reject |

## DOM 与可访问性

- 整行结构：`<div class="dsh-dyslexia-setting">` → 文本列（标题 + 说明）+ 右侧 `<button role="switch">`。
- 开关 MUST 是原生 `button`，MUST 带 `role="switch"`、`aria-checked="true|false"`、`aria-labelledby` 指向标题节点、`aria-describedby` 指向说明节点。
- 键盘：`Tab` 可达；`Space` 与 `Enter` MUST 切换（原生 button 行为），切换后状态 MUST 通过 `aria-checked` 变化被读屏播报。
- 禁用态（不可用/写入中）：`disabled` + `aria-disabled="true"`；不可用时说明文字换成"不可用"文案。
- 失败提示 MUST 出现在 `role="status" aria-live="polite"` 的区域里，2 秒后清空。

## 视觉与布局（FR-016 / FR-017）

- 标题：与相邻官方行同字号同字重；说明：小一号、`--dsw-alias-label-secondary`。
- 开关：轨道高 ≈20px、圆点 ≈14px、开启色 `--dsw-alias-brand-primary`、关闭色 `--dsw-alias-label-quaternary`；焦点环用 `outline` + `:focus-visible`，不隐藏。
- 间距：行内上下 `12px`、文本列与开关之间 `16px`；整行 `display:flex; align-items:flex-start; gap:16px`；文本列 `min-width:0`，说明 `overflow-wrap:anywhere`。
- MUST NOT 设固定宽度；360px 与 200% 字体下说明换行而非截断。

## 文案键（8 语言，走客户端 locale 服务，带 `dyslexia.` 命名空间）

| 键 | 用途 |
| --- | --- |
| `settingsTitle` | 行标题 / 开关名 |
| `settingsSummary` | 一句说明（打开后的行为） |
| `settingsUnavailable` | 读不到设置时的说明 |
| `settingsSaveFailed` | 写入失败的提示 |

## 降级

| 情形 | 期望 |
| --- | --- |
| `configForms` 缺失 | 不注册行，渲染层照常 |
| 快照缺字段 | 行禁用，说明用 `settingsUnavailable` |
| 写入 reject | 开关回退到实际值 + `settingsSaveFailed` |
| 宿主 `t` 回显键名 / 抛错 / 空白 | 回落包内 8 语言字典（复用 001 的 `hostKey` 命名空间发问） |

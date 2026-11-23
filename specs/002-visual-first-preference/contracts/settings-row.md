# Contract: 设置行（Client 半边）

## 槽与注册项

```js
ctx.slots.inject('settings.general.item', () => ctx.slots.register({
  name: 'settings.general.item',
  id: '@jiezhengj/dsh-dyslexia/visual-first',
  order: 62,
  locale: 'dyslexia',
  inject: () => row.inject,
}, row.component))
```

- 槽名 MUST 是 `settings.general.item`（`kind: list`、`scope: root`）。
- 注册项 `id` MUST 为稳定字面量 `@jiezhengj/dsh-dyslexia/visual-first`；`order` MUST 为 `62`（重复注册同 id 由宿主去重）。
- 注册条件：`ctx.slots.inject`/`ctx.slots.register` 都是函数，且 `ctx.configForms.get('dsh-dyslexia')` 返回 face；否则整行不注册（不抛错、不占位，没有"不可用"状态）。
- 组件 MUST NOT 依赖 owner 传入的任何 props；标题、值、写入路径全部经 `inject` 面提供。

## 数据面

| 成员 | 类型 | 语义 |
| --- | --- | --- |
| `face.getSnapshot()` | `{ value: { visualFirst?: boolean } }` | 宿主已生效值；缺字段按 `true` |
| `face.subscribe(listener)` | `() => void` | 外部改动回调；`entry.js` 用 `ctx.effect` 注册清理 |
| `face.set('visualFirst', next)` | `Promise<void>` | 写入；失败时 reject |
| `row.store` | `{ get, set, subscribe }` | 组件用 `useSyncExternalStore` 读取 |
| `row.setValue(next)` | `Promise<void> \| null` | 调一次 `face.set`；face 不可写时返回 null |

## DOM 与可访问性

- 根节点 `.dsh-dyslexia-row`：文本列 `.dsh-dyslexia-row-text`（标题 `.dsh-dyslexia-row-label` + 说明 `.dsh-dyslexia-row-hint`）+ 右侧 `<button role="switch" class="dsh-dyslexia-switch">`（圆点 `.dsh-dyslexia-switch-knob`）。
- 开关 MUST 是原生 `button`，MUST 带 `role="switch"`、`aria-checked="true|false"`、`aria-labelledby` 指向标题节点、`aria-describedby` 指向说明节点。
- 键盘：`Tab` 可达；`Space` 与 `Enter` MUST 切换（原生 button 行为），切换后状态 MUST 通过 `aria-checked` 变化被读屏播报。
- 没有禁用态：不写 `disabled`/`aria-disabled`；宿主没有设置面时整行不注册（见上）。
- 状态句 `.dsh-dyslexia-row-state` 用 `role="status"` + `aria-live="polite"` 显示 `settingSaved` 或 `settingFailed`；只在读者点击后出现，保留到下一次点击，没有计时器。

## 视觉与布局（FR-016 / FR-017）

- 标题：`font-size:14px; line-height:22px`、`--dsw-alias-label-primary`；说明：`12px/20px`、`--dsw-alias-label-secondary`。
- 开关：轨道 `36px × 20px`、圆点 `16px`、开启色 `--dsw-alias-brand-primary`；焦点环用 `outline 2px` + `:focus-visible`，不隐藏。
- 间距：整行 `display:flex; align-items:flex-start; flex-wrap:wrap; gap:8px 12px; padding:12px 0`；文本列 `flex:1 1 220px; min-width:0`，说明可换行。
- MUST NOT 设固定宽度；360px 与 200% 字体是否溢出**没有断言**（见 `evidence.md` G3）。

## 文案键（8 语言，走客户端 locale 服务，带 `dyslexia.` 命名空间）

| 键 | 用途 |
| --- | --- |
| `settingLabel` | 行标题 / 开关名 |
| `settingHint` | 一句说明（打开后的行为） |
| `settingSaved` | 写入成功的提示 |
| `settingFailed` | 写入失败的提示 |

## 降级

| 情形 | 期望 |
| --- | --- |
| `configForms` 缺失 | 不注册行，渲染层照常 |
| 快照缺字段 | 行按 `true` 显示，不禁用 |
| 写入 reject | 开关回退到实际值 + `settingFailed` |
| 宿主 `t` 回显键名 / 抛错 / 空白 | 回落包内 8 语言字典（复用 001 的 `hostKey` 命名空间发问） |
| 宿主已在别处注册同 id | 宿主去重，不重复 |

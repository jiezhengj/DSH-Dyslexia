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
- 组件 MUST 能读两种宿主形态：宿主把 `hooks` 展开成钩子 prop 时，值来自 `props.useVisualFirst(selector)`（DSH 的真实做法，见宿主 `dsh-client-ui-settings-general` 的 `DeveloperToolsRow`）；宿主原样传 `hooks` 时，值来自 `props.hooks.visualFirst`（`useSyncExternalStore`）。两种都没有时返回 `null`，不渲染半张行。写入路径一律来自 `inject.setValue`，回退目标来自 `inject.readHostValue`。
- `createVisualFirstRow(face)` MUST 返回 `{ store, component, inject }`；`inject` MUST 始终带 `hooks.visualFirst`，MUST 带 `readHostValue`（= 再读一次 `readPreference(face)` 的快照），`setValue` MUST 仅在 host face 的 `set` 是函数时存在，否则整个键缺席。
- 读者点击而 `inject.setValue` 缺席时，行 MUST 把开关放回宿主当前值（`readHostValue()` 重读快照）并显示 `settingFailed` 句，MUST NOT 静默停在读者点出的新值上。`readHostValue` 在有 face 时总会挂上（`src/client/settings.js:243-245`），而设置行只在有 face 时注册（`src/client/entry.js:173-174`），所以任何已挂载的行都有它；它缺席意味着没有 face、因而没有已挂载行，此时才用点击前捕获的值兜底。face 存在但快照不可读（缺 `getSnapshot`、抛错或缺字段）时，`readPreference`（`settings.js:48-58`）返回默认 `true`，恢复目标是 `true`，不是捕获值（见 `evidence.md` G12）。

**回退目标**：写入被拒、reject 或 thenable 抛错时，行 MUST 把开关放回**宿主当前值**，而不是点击前捕获的值。DSH 的 `config-form` 在拒绝时会先重载自己的镜像并通知订阅者，然后才 resolve `false`（`dsh-client-ui-settings/src/client/config-form.ts` 的 `recover()`），所以点击前捕获的值可能比宿主的旧；两个窗口同时改值时，放回旧捕获值会覆盖别处写入的新值。`inject.readHostValue` 缺席不代表「有 face 但读不到」：它只要有 face 就挂上（`src/client/settings.js:243-245`），而设置行只在有 face 时注册（`src/client/entry.js:173-174`），所以任何已挂载的行都有它；缺席只意味着没有 face、没有已挂载行，只有那时才用捕获值兜底。face 存在但 `getSnapshot` 缺失或抛错时，`readPreference`（`settings.js:48-58`）返回默认 `true`（G12），不表示「读不到」，所以恢复目标是 `true` 而不是捕获值。

## 数据面

| 成员 | 类型 | 语义 |
| --- | --- | --- |
| `face.getSnapshot()` | `{ value: { visualFirst?: boolean } }` | 宿主已生效值；缺字段按 `true` |
| `face.subscribe(listener)` | `() => void` | 外部改动回调；`entry.js` 用 `ctx.effect` 注册清理 |
| `face.set('visualFirst', next)` | `Promise<boolean>` | 写入；**resolve `true` 表示宿主接受**，resolve `false` 表示拒绝或跳过（DSH 的 `config-form` 在 `!response.ok` 时 `return false`），reject 表示调用本身失败 |
| `row.inject` | `{ hooks: { visualFirst: store }, readHostValue?: () => boolean, setValue?: (next) => Promise<boolean> }` | 传给组件的 inject 面；`readHostValue` 再读一次宿主快照（回退时用）；`setValue` 只在 `typeof face.set === 'function'` 时挂上，否则整个键缺席 |
| `row.store` | `{ get, getSnapshot, set, subscribe }` | 也就是 `inject.hooks.visualFirst`。宿主把 hooks 展开成钩子时会调用 `getSnapshot`（`useSyncExternalStore(store.subscribe, store.getSnapshot)`），缺它宿主就抛 `getSnapshot is not a function`，整行消失——0.2.5 的真实故障。`get` 是给不展开 hooks 的宿主用的读法。 |

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
| 写入 resolve `false` | 开关回到宿主当前值（`readHostValue` 重读；快照不可读时按默认 `true`，见 G12；只有没有已挂载行、`readHostValue` 缺席时才用点击前捕获的值）+ `settingFailed` |
| 写入 reject | 开关回到宿主当前值（同上）+ `settingFailed` |
| 写入返回的 thenable 的 `then` 抛错 | 当作失败写入：不报错到点击处理器，开关回到宿主当前值 + `settingFailed` |
| 宿主 face 没有 `set` | `inject` 不带 `setValue`；点击经 `readHostValue` 回到宿主当前值（该 face 存在时总会挂上；快照不可读时按默认 `true`；只有没有已挂载行时才用捕获值）+ `settingFailed` |
| 宿主 `t` 回显键名 / 抛错 / 空白 | 回落包内 8 语言字典（复用 001 的 `hostKey` 命名空间发问） |
| 宿主已在别处注册同 id | 宿主去重，不重复 |

# Contract: 插件配置（Host 半边）

## 导出的形状

```js
export const name = '@jiezhengj/dsh-dyslexia'
export const inject = ['systemPrompt']

export const Config = z.object({
  visualFirst: z.boolean().default(true).volatile(),
})

export function apply(ctx, config) { … }
```

- `Config` MUST 用 `@deepseek-ai/schemastery`（`^3.19.0`）声明；字段 MUST 带 `.default(true)` 与 `.volatile()`。
- 命名空间 MUST 与 profile entry id 一致：`dsh-dyslexia`（客户端用同名 `ns` 读写）。
- 若 `Config` 无法导出（依赖缺失）：插件 MUST 仍注册纯能力提示词段，`apply` MUST NOT 抛错，且必须 `console.warn` 一行说明"偏好开关缺席"。

## 读取

- `config.visualFirst.get()` MUST 在**每次装配时**调用（放在段 `text` 函数体内），不得在 `apply` 里求值后缓存。
- 读取 MUST 容忍 `config` 为 `undefined`、字段缺失、`get` 不是函数三种情形（回落到 `true`）。

## 写入

- 读者侧写入 MUST 走宿主设置投影（客户端 `configForms.set` → 宿主 `settings.update`），MUST NOT 直接改 `cordis.patch.yml` 或自己写文件。
- 写入被拒（例如被更高层配置覆盖）：值 MUST 保持不变，界面 MUST 显示失败。

## 提示词段

- 段名 `ui:dsh-dyslexia`、`order 9000` MUST 与 001 相同。
- `false` 时段文本 MUST 与 001 逐字相同（能力段单独出现）。
- `true` 时 MUST 是能力段 + 偏好段（见 `host-prompt.md`）。

## 降级

| 情形 | 期望 |
| --- | --- |
| `Config` 无法创建 | `apply` 正常返回；无设置行；渲染不受影响 |
| 宿主无 `settings` 服务 | 不调用 `configure`；段文本按默认值装配 |
| `systemPrompt.section` 抛错 | `apply` 捕获并 `warn`，不阻塞启动（沿用 001 的 `claimed`/`release` 幂等） |

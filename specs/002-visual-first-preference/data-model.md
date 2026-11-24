# Data Model: 视觉优先开关与命名

## 实体 1：阅读偏好（ReadingPreference）

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `visualFirst` | 布尔 | 默认 `true`；可写；`volatile` | 打开 = "渲染 + 视觉优先"；关闭 = "只渲染" |
| 归属 | profile entry | 唯一 | 存在插件自身配置行，随插件安装/卸载存在/消失 |
| 命名空间 | 字符串 | 固定 `dsh-dyslexia` | 等于 profile entry id；客户端读写的 `ns` |

**状态迁移**

- `未设置 → true`：首次安装或从 001 升级（`default(true)` 生效）。
- `true → false`：读者在设置里关闭；上一状态立即失效（提示词段不再追加偏好）。
- `false → true`：反向；下一条消息即恢复偏好段。
- `读不到 → 保持`：快照缺字段时界面按默认 `true` 显示开关，宿主侧也按 `true` 装配。
- `写入失败 → 回到宿主当前值`：被拒、reject 或 thenable 抛错后，`restore()`（`src/client/settings.js:127-138`）经 `inject.readHostValue()` → `readPreference(face)`（`:48-58`）重读一次快照再显示；`readHostValue` 只要有 face 就会挂上（`:243-245`），而设置行只在有 face 时注册（`src/client/entry.js:186-187`），所以已挂载的行总会重读宿主，点击前捕获的值只在 `readHostValue` 缺席（即没有已挂载行）时生效。`readPreference` 对缺字段、不可读、无 `getSnapshot` 或抛出的 face 一律返回默认 `true`，从不表示读不到；退化 face 上开关因此回到 `true` 而非捕获值，可能在没有保存写入时显示为打开（`evidence.md` G12）。两窗口同时改值时不得用旧捕获值覆盖别处写入的新值，并给出可见提示。

**校验规则**

- 只接受布尔；非布尔写入视为无效，界面不翻转。
- 未知字段忽略，不阻塞装配。

## 实体 2：偏好段落（PreferenceText）

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| 能力段 | 字符串 | 恒存在 | 001 的四句能力陈述，逐字保留 |
| 偏好段 | 字符串 | 仅当 `visualFirst === true` | "何时该画、何时不必画"的判据 |
| 禁止措辞 | 词表 | 偏好段不含 `always`/`every answer`/`every reply`/`every response`/`every time`/`each answer`/`each reply`/`each time`/`at all times`/`without exception`/`no matter what`/`unconditionally`/`must `（13 条），且整段与契约文本逐字相等；能力段不含 `always`/`must use`/`you should`/`every answer`/`prefer` | 由静态断言逐条守护 |

**组装规则**：`capability`，若 `visualFirst` 为真再追加 `\n\n` + `preference`。段名 `ui:dsh-dyslexia`、`order 9000` 不变（保证装配顺序稳定，不产生第二段）。

## 实体 3：插件身份（PluginIdentity）

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `meta.title` | 8 语言字符串 | 每语言含"阅读障碍"语义 | 插件列表与详情页标题 |
| `meta.description` | 8 语言字符串 | 每语言以标题开头：`<标题> — <一句说明>` | 列表副标题 |
| 详情文档 | 8 语言 | 只有一行图片；新名字只出现在该图 alt 句，不写正文 | `docs/DETAIL[.<lang>].md` |
| 包名 / 入口 id / 文件名 | 固定 | 不得改动 | 升级不迁移 |

## 实体 4：设置行（SettingsRow，仅界面）

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| 标题 | 8 语言 | 复选开关的可访问名 |
| 说明 | 8 语言 | 一行，次要色 |
| 状态 | `on` / `off` | 与 `visualFirst` 对应；没有 `disabled` |
| 反馈 | `idle` / `saved` / `failed` | 失败时回到宿主当前值并可见提示；提示留到下一次点击，没有计时器 |

**不变量**：宿主给出答案之后，显示的状态等于实际生效值；一次写入从点击到落定之间，行先显示读者请求的值（`src/client/settings.js:110-113` 在 `injected.setValue` 被等待之前就写进 store，此时宿主尚未接受），落定后按宿主答案显示——被拒、reject 或 thenable 抛错时回到宿主当前值：`restore()`（`src/client/settings.js:127-138`）经 `inject.readHostValue()` → `readPreference(face)`（`:48-58`）重读快照；`readHostValue` 只要有 face 就会挂上（`:243-245`），而设置行只在有 face 时注册（`src/client/entry.js:186-187`），故任何已挂载行都会真正重读宿主，捕获值只在 `readHostValue` 缺席（没有已挂载行）时生效。`readPreference` 从不表示读不到：face 缺 `getSnapshot`、抛错或快照缺字段时一律返回默认 `true`，退化 face 上开关因此回到 `true` 而非捕获值，可能在没有保存写入时显示为打开（`evidence.md` G12）。所以规则是"宿主答过之后等价"，不是"永远等价"；宿主始终不回答（promise 永不 settle）的情形未覆盖，登记为 `evidence.md` G11。不存在"不可用"占位。

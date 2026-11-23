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
- `写入失败 → 回到宿主当前值`：被拒、reject 或 thenable 抛错后重读一次快照（`readPreference(face)`）再显示，只有读不到快照才用点击前捕获的值；两窗口同时改值时不得用旧捕获值覆盖别处写入的新值，并给出可见提示。

**校验规则**

- 只接受布尔；非布尔写入视为无效，界面不翻转。
- 未知字段忽略，不阻塞装配。

## 实体 2：偏好段落（PreferenceText）

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| 能力段 | 字符串 | 恒存在 | 001 的四句能力陈述，逐字保留 |
| 偏好段 | 字符串 | 仅当 `visualFirst === true` | "何时该画、何时不必画"的判据 |
| 禁止措辞 | 词表 | 偏好段不含 `every answer`/`always draw`/`always answer`/`must draw`/`must use a diagram`；能力段不含 `always`/`must use`/`you should`/`every answer`/`prefer`（裸 `must`、`each reply` 没有断言） | 由静态断言逐条守护 |

**组装规则**：`capability`，若 `visualFirst` 为真再追加 `\n\n` + `preference`。段名 `ui:dsh-dyslexia`、`order 9000` 不变（保证装配顺序稳定，不产生第二段）。

## 实体 3：插件身份（PluginIdentity）

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `meta.title` | 8 语言字符串 | 每语言含"阅读障碍"语义 | 插件列表与详情页标题 |
| `meta.description` | 8 语言字符串 | 每语言一句 | 列表副标题 |
| 详情文档 | 8 语言 | 只有一行图片；新名字只出现在该图 alt 句，不写正文 | `docs/DETAIL[.<lang>].md` |
| 包名 / 入口 id / 文件名 | 固定 | 不得改动 | 升级不迁移 |

## 实体 4：设置行（SettingsRow，仅界面）

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| 标题 | 8 语言 | 复选开关的可访问名 |
| 说明 | 8 语言 | 一行，次要色 |
| 状态 | `on` / `off` | 与 `visualFirst` 对应；没有 `disabled` |
| 反馈 | `idle` / `saved` / `failed` | 失败时回到宿主当前值并可见提示；提示留到下一次点击，没有计时器 |

**不变量**：显示的状态永远等于实际生效值；不存在"显示已开但未生效"的中间态，也不存在"不可用"占位。

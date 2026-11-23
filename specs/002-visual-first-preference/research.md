# Research: 视觉优先开关与命名

## D1 偏好怎样进入模型可见的指令

- **决定**：继续用 `ctx.systemPrompt.section()`，但把 `text` 从字符串改成函数，每次装配时读 `config.visualFirst.get()` 决定是否追加偏好段。
- **理由**：`lib/index.js` 里 `text: typeof section.text === 'function' ? section.text(context) : section.text` 每次 assemble 求值；这样开关切换不需要重新注册、不会在会话里留下两条同名段。
- **备选**：切换时 dispose 段再重新注册 —— 会在装配顺序里抖动，且失败时可能一段都不剩。

## D2 偏好怎样持久化

- **决定**：宿主导出 `Config`（`@deepseek-ai/schemastery`），字段 `visualFirst: z.boolean().default(true).volatile()`；值存在 profile 的 Cordis 配置里，由宿主的 settings 投影读写。
- **理由**：`.volatile()` 才会出现在设置投影里（`dsh-settings` 的表单只暴露 volatile 字段）；`default(true)` 让没有配置行的老用户也拿到新默认。
- **备选**：自己写文件（macOS/Windows 路径分歧、断电半写风险、与宿主的配置层打架）。

## D3 用哪个设置座位

- **决定**：客户端半边向 `settings.general.item` 注册一行（`kind: list`、`scope: root`）。
- **理由**：官方文档写明这是"单个、不需要独立页面的偏好"的座位，与 Language / Appearance / Composer Enter 同级；比新建设置页小得多，也不新开侧栏入口。
- **备选**：`settings.section`（要自己画整页，接触面大）、`settings.plugins.tab`（那是"内置插件"区，语义不符）。

## D4 客户端如何读与写

- **决定**：`inject: ['slots', 'locale', 'configForms']`；`const face = ctx.configForms.get('dsh-dyslexia')`；`getSnapshot().value.visualFirst` 取当前值，`face.subscribe(cb)` + `ctx.effect` 跟随外部改动，`face.set('visualFirst', v).catch(…)` 写入。
- **理由**：这是官方 ui-chat 的 link-opening 行同款写法；命名空间就是 profile entry id `dsh-dyslexia`；设置行 id 是 `@jiezhengj/dsh-dyslexia/visual-first`。
- **备选**：自己发 HTTP 请求 —— 违反"运行期零网络"，且要自己处理鉴权。

## D5 依赖：`@deepseek-ai/schemastery`

- **决定**：作为运行时依赖声明（`^3.19.0`，MIT，npm 上由 DeepSeek 发布，宿主自身也装 3.19.0）；不打包副本，也不手写 schema。
- **理由**：schema 通过 `Symbol.for('schemastery')` 识别，跨副本可互认，但版本语义仍需与宿主同大版本；手写对象不会被宿主当作 schema，设置行就拿不到字段。
- **影响**：安装时需要取这个包（3 个极小包，无构建脚本）；运行期仍然零网络。取不到时 `index.js` 在静态 import 阶段失败，插件不加载——这不是降级，见 D7 与 `evidence.md` G8。

## D6 8 语种命名

| 语言 | 标题 | 一句说明 |
| --- | --- | --- |
| zh | DSH 我有阅读障碍 | 把会话里的 mermaid 代码块就地画成图，并在需要时鼓励 Agent 用图说话。 |
| en | DSH — I'm dyslexic | Draws mermaid blocks right in the conversation and, when it helps, asks for a picture instead of a wall of text. |
| ja | DSH 私はディスレクシアです | 会話の mermaid コードブロックをその場で図にし、必要なら図で語るよう働きかけます。 |
| es | DSH — Tengo dislexia | Dibuja los bloques mermaid en la conversación y, cuando ayuda, pide una imagen en vez de un muro de texto. |
| fr | DSH — Je suis dyslexique | Dessine les blocs mermaid dans la conversation et, quand c'est utile, demande un schéma plutôt qu'un mur de texte. |
| de | DSH — Ich habe Legasthenie | Zeichnet mermaid-Blöcke direkt im Gespräch und bittet bei Bedarf um ein Bild statt einer Textwand. |
| ru | DSH — У меня дислексия | Рисует блоки mermaid прямо в беседе и, когда это помогает, просит схему вместо стены текста. |
| pt | DSH — Tenho dislexia | Desenha blocos mermaid na conversa e, quando ajuda, pede um diagrama em vez de uma parede de texto. |

## D7 降级矩阵

| 缺失/失败 | 宿主侧行为 | 客户端侧行为 |
| --- | --- | --- |
| 没有 `schemastery`（依赖未装成） | `index.js` 静态 import 失败，插件在 import 阶段就不加载 | —— |
| 宿主没有 `settings` 服务 | 不 `configure`，段文本按默认值（打开）走 | `configForms` 缺失 → 不注册行 |
| `configForms` 快照读不到字段 | —— | 行按默认值（打开）显示，不出现禁用态 |
| 写入被拒/失败 | 值不变 | 开关回到实际值 + 可见失败提示 |
| 插件被卸载 | 段与配置随插件一起消失 | 行消失 |

## D8 视觉与布局

- 行结构照官方行：左侧标题（与相邻行同字号同字重）+ 下方一句说明（次要色、小一号），右侧开关；整行可点击区域包含标题。
- 颜色只取 `--dsw-alias-*`；不用自绘色块；开关用宿主控件尺寸（36×20 轨道 + 16px 圆点），焦点环沿用宿主 `:focus-visible`。
- 8 语言 × 200% 字体 × 360px 的布局由"标题换行、说明换行、开关不缩"保证，不设固定宽度。以上是设计意图，没有 360px / 200% 断言（见 `evidence.md` G3）。

## D9 验收口径

- 行为断言在无头夹具里跑（假 `configForms`）；真实宿主行为由真机核对（重启后看设置里是否出现该行、切换后下一条回答是否遵循）。
- SC-001 的"5 个样板请求"文稿与判读结果 MUST 进证据文件；本次未跑，登记为缺口 G7。

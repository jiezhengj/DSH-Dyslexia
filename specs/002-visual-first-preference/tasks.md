# Tasks: 视觉优先开关与「我有阅读障碍」命名

**Feature**: `002-visual-first-preference` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

图例：`[P]` 可并行；每条任务以"证据"结尾——没有证据的任务不算完成。

## Phase 1：宿主侧配置与两档提示词

- [x] **T001** 在 `package.json` 增加依赖 `"@deepseek-ai/schemastery": "^3.19.0"`，并确认 `npm install` 后 `node_modules` 可解析（不引入构建脚本）。
- [x] **T002** `index.js` 新增 `Config`（`z.object({ visualFirst: z.boolean().default(true).volatile() })`）与 `apply(ctx, config)`；`@deepseek-ai/schemastery` 在模块顶部静态 import——该包无法解析时插件在 import 阶段就失败，没有降级（见 `evidence.md` G8）。
- [x] **T003** 把 `MERMAID_RENDER_PROMPT` 拆成 `CAPABILITY_TEXT` + `PREFERENCE_TEXT`，段 `text` 改为函数：`visualFirst` 为真时两段拼接，否则只出能力段（逐字等于 001）。
- [x] **T004** 在宿主没有 `settings` 服务时不调用 `configure`；有则 `ctx.inject(['settings'], child => child.effect(() => child.settings.configure({ auto: false }, ctx.fiber)))`，避免宿主生成多余设置页。
- [x] **T005** `verify/check-bundle.mjs` 新增静态断言：`Config` 含 `visualFirst`、`.default(true)`、`.volatile()`；偏好段字符串存在且只在真分支出现；两张禁止措辞表分别不出现（能力段：`always`/`must use`/`you should`/`every answer`/`prefer`；偏好段：`every answer`/`always draw`/`always answer`/`must draw`/`must use a diagram`）；段名/order 未变。静态检查当时为 **45** 条（`0.2.7`–`0.2.8` 47 条、`0.2.9` 49 条、`0.2.10` 50 条、`0.2.11` 51 条、`0.2.12` 起 52 条）。**更正（`0.2.12`）**：本条当时声称覆盖 `.volatile()`，其实没有任何断言看过它——第八轮实现评审把 `.volatile()` 删掉后两套全绿；`0.2.12` 才补上 `the preference field is volatile, so the settings form can show it`（见 T070 与探针 P31），其中第 22 条是 `the section hands the host a function, not a frozen string`（当时 #44 是 `both size limits reach the engine, each proven on its own`、第 45 条是 `the fixtures assert what the fixes promise, and can fail`；`0.2.10` 的 50 项套件里它们是第 49 与第 50 条）。
  - 证据：`check-bundle` 通过行 + 对应断言名。

## Phase 2：客户端设置行

- [x] **T006** 新增 `src/client/settings.js`：`createVisualFirstRow(face)` 返回 `{ store, component, inject }`；`VisualFirstRow` 组件（标题 + 说明 + 开关）从 `inject.hooks.visualFirst` 读值，`inject.setValue` 仅在 face 有 `set` 时存在；点击无写入面、写入被拒、reject 或 thenable 的 `then` 抛错时，用 `inject.readHostValue()` → `readPreference(face)` 恢复**宿主当前值**：`readHostValue` 只要有 face 就会挂上（`src/client/settings.js:243-245`），而设置行只在有 face 时注册（`src/client/entry.js:173-174`），所以已挂载行总会重读宿主，点击前的捕获值只在 `readHostValue` 缺席（没有已挂载行）时兜底，因为宿主在 resolve `false` 前会先把自己的镜像改为真实值并通知订阅者（见 `src/client/settings.js:127-138`）。`readPreference(face)`（`:48-58`）对缺 `getSnapshot`、抛出或快照缺字段的 face 返回默认 `true`，从不表示读不到；退化 face 上行因此回到 `true` 而非捕获值，可能在没有保存写入时显示为打开（`evidence.md` G12）——并给 `role="status"` 失败提示；宿主尚未回答期间行显示读者请求的值。没有禁用态，也没有 2 秒清空。实现见 T023。
- [x] **T007** `src/client/entry.js`：宿主同时提供 `slots.inject`/`slots.register`，且 `configForms.get('dsh-dyslexia')` 返回 face 时，注册 `settings.general.item`（`id: '@jiezhengj/dsh-dyslexia/visual-first'`、`order: 62`、`locale: 'dyslexia'`），并 `ctx.effect` 订阅与注销；否则整行不注册（没有"不可用"占位），图照常。
- [x] **T008** `src/client/i18n.js` 增 4 条设置文案 × 8 语言（`settingLabel`/`settingHint`/`settingSaved`/`settingFailed`），沿用 `hostKey` 命名空间发问。
- [x] **T009** `src/client/styles.js` 增设置行样式（flex 行、标题/说明层级、开关轨道与圆点、焦点环），全部取宿主 token，无固定宽度。
- [x] **T010** `verify/harness/index.html` 增设置行夹具：假 `configForms`（可读/可写/外部改值/写失败/缺服务）、`role="switch"` 与 `aria-checked`、点击一次只写一次、失败提示；8 种语言的标签与说明逐条断言（`SETTING_LABELS` 在 `verify/harness/index.html:1810-1819`，标签比对在 `:1844-1848`；`SETTING_HINTS` 在 `:1820-1829`，逐语言的说明断言在 `:1849-1853`；zh 行另有断言），360px 与 200% 字体未断言（见 `evidence.md` G3）。
  - 证据：`run-harness` 通过行 + 新增断言名清单。

## Phase 3：改名与文案

- [x] **T011** `locale/*.json` 8 份的 `meta.title`/`meta.description` 换成 `research.md` D6 的译名。
- [x] **T012** `docs/DETAIL*.md` 8 篇保持"唯一图片行"（静态检查禁止正文），新名字只进该图 alt 句；开关说明放 README，不放 DETAIL。
- [x] **T013** 9 份 README：标题、首段、特性列表里的"只渲染"改成"渲染 + 可选视觉优先"，开关作为现有特性列表里的一条/一段（`README.<lang>.md:15`，`README.md:13-14`），不另立小节；8 份本地化 README 删掉"插件只声明会画图"的旧说法，各补一段说明插件会在图更省力时主动要图、设置 → 通用设置有开关。
- [x] **T014** `package.json` 的 `description` 改成 `research.md` D6 的英文句子（逐字）：`Draws mermaid blocks right in the conversation and, when it helps, asks for a picture instead of a wall of text.`

## Phase 4：探针与证据

- [x] **T015** 探针（当时十二条；quickstart 现在列二十八条：F14/F15 与 P19–P32 是后续追加的）：F1 两档提示词、F3 默认 true、F4 dispose 路径、F5 写失败回退、F6 只写一次、F7 `aria-checked` 绑定、F8 命名空间、F9 无 setter 宿主——逐条破坏 → 重建 → 跑两套 → 录下红行 → 还原，把输出行原文记进 `evidence.md`。F1 与 F9 最后一次在 `0.2.3` 工作树上重跑（F9 用 `a host whose face has no setter hands the row no writer at all` 断言）；`0.2.5` 上重跑的是新增的 F10–F13（每条在 `%TEMP%` 的新副本里破坏、跑完还原），`0.2.4` 树本身从未被探针跑过，见 `evidence.md` G10（已由 `0.2.5` 关闭）。F3–F8 是 `0.2.1` 树上的记录。F2（段文本改回冻结字符串）在这个函数断言存在前两套都抓不到，现在由第 22 条静态检查捕获，单列为历史说明。
- [ ] **T016** `specs/002-visual-first-preference/evidence.md`：E-BLD · 0.2.1、E-CHK 与 E-HARN 是 `0.2.1` 树那次运行的输出原样照抄（`0.2.5` 的构建行单列为 `E-BLD · 0.2.5`；`0.2.5` 的检查只有 E-CHK/E-HARN 的汇总行，无逐条输出）；E-CHK 是该次运行的完整 stdout（44 条 `ok` 行加末行汇总），故意触发的 `warn` 与堆栈行走 stderr（52 行），不混入 stdout；F10–F13 的探针行已按 `0.2.5` 记录；未取证项单列。E1–E14 端到端逐条记录未做，见 `evidence.md` G6。
- [ ] **T017** `spec.md`/`plan.md`/`data-model.md`/`contracts/*` 与本清单的计数、断言名、版本号与实际一致（交叉核对每个反引号名都存在）；本轮已对齐 `0.2.5` 的版本号、45/274 计数与所引夹具行号；未逐条核对全部反引号名，故未勾。

## Phase 5：发版与评审

- [x] **T018** 版本升到 `0.2.0`（新增依赖与用户可见行为），`npm pack` 核对文件数；feature 001 的 `specs/001-mermaid-fence-render/contracts/plugin-manifest.md` 未改动（它仍是 feature 001 早期留下的 `0.1.32` 清单，已过时），本 feature 的配置契约由自己的 `contracts/plugin-config.md` 与 `contracts/settings-row.md` 承载。本轮修正把版本升到 `0.2.2`，这是代码变更而不只是文档：`settings.js` 里宿主 face 没有 `set` 时不再挂 `setValue`（点击回退并显示失败句）；第 22 条静态检查改写成读一次注册取三次值，静态条数仍是 **44**；浏览器夹具新增无 setter 宿主一条，发布时浏览器条数 **252**。评审并行改动又加了 8 条夹具断言（7 种语言的标签 + 直接断言 inject 面无 `setValue`），`0.2.3` 发布时是 **44 / 260**；`client.js` 随之重建。
- [x] **T019** 打 tag、GitHub Actions 发布、从 registry 装回 `desktop`、核对安装副本哈希与 `locale/`。发布与装回记录见 `evidence.md` E-PUB/E-INS：`0.2.0` 是历史，`0.2.1` 与 `0.2.2` 是中间版本（`0.2.1` run `45204279829`、shasum `b5c03c272b89f53f2416a5140c29b212b5f55b7a`、logIndex `4053240981`；`0.2.2` run `45211420278`、shasum `1f17ac1be4c1ea5c5e97c814cc699a6c910ee03d`、logIndex `4054074805`），**本条完成时点**（`0.2.5`）：当前发布版本是 `0.2.5`（run `45240437544`、shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`、33 files），六个版本都已装回（`0.2.5` 的装回见 `evidence.md` E-INS 0.2.5）；此后 `0.2.6`/`0.2.7` 的发版装回见 T029/T037。
- [ ] **T020** 真机核对：设置行出现、两档切换生效、重启后保持、8 语言标题正确、卸载后行消失。未做（`0.2.5` 同样未观察），见 `evidence.md` G1/G3/G4/G6。
- [x] **T021** 起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。评审返回 FAIL；本轮按评审清单修正文档后重审；第 5 轮的四个 P2 已在 `0.2.5` 处理，见 `evidence.md` G1–G8 与 G11–G20（G9/G10 已关闭）；注：这两份 PASS 是在没有真机观察的前提下给的，随后被 E-LIVE（T024）推翻。
- [x] **T022** 发版 `0.2.4`：读 `set(...)` 解析出的布尔值（`true` 保存，`false` 回退并显示失败句），`configForms` 改由 `ctx.inject` 等待而不是提前读取；静态检查加第 31 条 `a refused settings write is not reported as saved`，夹具加 `a refused write that resolves false puts the switch back and says so` 与 `a host that gains configForms after apply still gets the settings row`，另补 8 种语言的说明断言，条数 **45 / 271**；发布 run `45230719544`、shasum `2a731d8c13067d88859eeec4f918773b1fd9578c`、33 files，装回见 `evidence.md` E-PUB/E-INS 0.2.4；`0.2.5` 见 T023。
- [x] **T023** 升到 `0.2.5` 并发布、装回（commit `0be17fe`、tag `v0.2.5`、run `45240437544` success、shasum `c9a8cd6145a7cab17f6b19f66d520f1b5c6b48f8`、33 files，见 `evidence.md` E-PUB/E-INS 0.2.5）：拒绝写入时改用 `inject.readHostValue` → `readPreference(face)` 恢复宿主当前值（宿主在 resolve `false` 前先通知真实状态，见 `dsh-client-ui-settings/src/client/config-form.ts` 的 `recover()`）；`pending.then(...)` 移进 `try`，新增 `a thenable that throws out of then cannot break the click`；新增 `a refused write keeps the value the host took while it was pending`（两窗口）与 `a value the host pushes reaches the switch without a write`（`aria-checked` + 计算出的开关颜色）；静态检查 `the capability briefing is what it was before the switch` 改为逐句比对 `specs/001-mermaid-fence-render/contracts/host-prompt.md` 里的四句 `MERMAID_RENDER_PROMPT`（G9 关闭）。条数 **45 / 274**，`client.js` 783360 bytes / 781845 characters，sources sha256 `2b5728286c556d8dbaaa349cc9fb8ec5`，文件 SHA-256 `279c33781ef551e3d3bbb0aabf3d37a681fd5da4f4738c29c724b596667a8766`。探针 F10–F13 见 `evidence.md`。

## Phase 6：真机核对掀开的空行缺陷（0.2.6）

- [x] **T024** 在运行中的宿主里核对 `0.2.5`（`dsh web` + 独立 `webcheck` profile，配方见 `evidence.md` E-LIVE）：插件页与「设置 → 通用设置」都能打开，但**我们的行渲染为空**，控制台报 `dsh-dyslexia: locale {cannot get property "locale" without inject}`。三个根因：宿主把 slot 的 `hooks: { name: store }` 展开成钩子 prop `useName(selector)`（宿主自己的 `DeveloperToolsRow` 写作 `const enabled = useDeveloperTools((value) => value)`），我们的组件只读 `props.hooks`；宿主钩子管线要求 store 提供 `getSnapshot()`，我们的 `createValueStore` 没有；宿主 cordis 严格 `inject`，`ctx.locale` 在 `inject: ['slots']` 下直接抛错，而 `ctx.get(name)` 是"不要求 inject 的读取"。
- [x] **T025** `src/client/settings.js` 增加两种适配器：`HostValueRow`（`props.useVisualFirst((current) => current)`）与 `StoreValueRow`（`useSyncExternalStore`），`VisualFirstRow` 按第一个可用的适配器选，两个都没有才返回 `null`；渲染与写入逻辑下沉到 `RowBody`，内部 `shown` 状态用 `show(next)`/`current()` 统一"有 store 写 store、没有 store 写本地"，`restore()` 成功后被拒的写入由宿主真值接管；`createValueStore` 补 `getSnapshot()`。
- [x] **T026** `src/client/entry.js` 新增 `optional(ctx, name)`（`ctx.get(name)` 优先，退回 `ctx[name]`，都拿不到则 `report` 后返回 `undefined`），`locale`/`slots`/`configForms` 全部改走它；设置行改为两条注册路径（`ctx.inject(['configForms'], child => wireOnce(child))` 与直接 `wireOnce(ctx)`），先拿到 face 的一方生效，`wireSettingsRow` 返回布尔。
- [x] **T027** 验证：`verify/check-bundle.mjs` 新增 `the settings row reads the hook the host builds, not an object it never sends` 与 `a service the plugin never declared is read through ctx.get`（`EXPECTED_CHECKS` 45 → 47）；`verify/harness/index.html` 新增 6 条夹具（钩子 prop 宿主、store 缺 `getSnapshot`、`ctx.get` 路径、钩子宿主上的点击回写与回显），`EXPECTED_CHECKS` 274 → 280；探针 F14（删 `useVisualFirst` 分支 → 4 红）、F15 记入 `evidence.md` E-PROBE——**F15 在 0.2.6 记录的红行是错的**（47 项套件不可能出现 `1 failed, 47 passed`，删掉 `getSnapshot()` 后两套检查实际全绿），真实红行由 T031 在 `0.2.7` 重做（`1 failed, 46 passed` 与 `2 failed, 281 passed`）。
- [x] **T028** 真机复核（同一个 `webcheck` 实例，`plugin add @0.2.6` 后重启 `dsh web`）：设置页出现标签、说明与 `switch [checked=true]`，位于"性能与用量"与"上传 Session Log"之间；点击变 `checked=false` 并出现 `role="status"` 的 `已保存`，`cordis.patch.yml` 写入 `visualFirst: false`；再点回 `true`；关开设置值保持；插件页标题「DSH 我有阅读障碍」、`v0.2.6`、图片 alt 为详情页那句中文；控制台无我们自己的告警。记录见 `evidence.md` E-LIVE，G1 关闭（限 Web 界面）。
- [x] **T029** 发版 `0.2.6`：commit `c3520c2`、tag `v0.2.6`、GitHub Actions run `45302814465` success（CI 47 / 280，`sources sha256:b69ddecef48b3acc5a9b51e2a1a27bc1`，shasum `1deccbbf61f9068c22ff418980fb16d960bf5e4b`、33 files、logIndex `4063373865`）→ registry 装回 `desktop` profile（卸 0.2.5、装 0.2.6，安装副本 787325 字节、SHA-256 `63B5517E3074F37D44CB8F63EB84593426F3B451B1FE3951336A125E16D6D786` 与仓库根逐字节相同、`locale/` 8、`docs/` 9）→ E-PUB/E-INS 补 0.2.6 行 → 清理 `webcheck` profile 与本次起的 `dsh web` 进程。
- [ ] **T030** 再次起两份独立评审（文档 / 实现），两份 PASS 才把 feature 002 标记完成。

## Phase 7：让 getSnapshot 的回归能被看见（0.2.7）

- [x] **T031** 独立实现评审 `review-impl-002r` 指出的 P0：`evidence.md` 的 F15 在 `0.2.6` 上写的红行是假的（`1 failed, 47 passed` 在 47 项套件里不可能，且只删 `createValueStore` 的 `getSnapshot()` 时两套检查全绿）。修法不是改数字，而是让破坏真的变红。
- [x] **T032** `verify/check-bundle.mjs` 的 `getSnapshot()` 断言原来是对整个 `settings.js` 的子串匹配，会命中 `readPreference` 里的 `face.getSnapshot()`；改为只检查 `createValueStore` 函数体，并要求 `getSnapshot()` 与 `subscribe(listener)` 同时在该函数体内。返回串改为 `the store itself carries getSnapshot and subscribe`。
- [x] **T033** `verify/harness/index.html` 新增两条夹具（280 → 282）：`the store this module hands the host can be read the way the host reads it`（从注册的 `inject.hooks.visualFirst` 取插件自己的 store，断言 `get/getSnapshot/subscribe` 三类齐全且 `getSnapshot()` 返回初始值）与 `a hook built from that store draws the switch`（用 `useSyncExternalStore(store.subscribe, store.getSnapshot)` 按宿主的方式造一个 `useVisualFirst` prop，断言开关渲染并显示 true）。
- [x] **T034** 修 P2：严格 `inject` 夹具改用 `makeContext({ noLocale: true })` 并给 `ctx.locale` 定义会抛错的 getter，同时断言 `locale.register` 恰好被调用一次（`dyslexia`），使"把 `optional(ctx,'locale')` 换回 `ctx.locale`"在夹具层也变红（282 → 283）。
- [x] **T035** 重跑探针并记录真实红行：删 store 的 `getSnapshot()` → `FAIL the settings row reads the hook the host builds, not an object it never sends — the value store does not carry the getSnapshot/subscribe pair a host hook is built from`、`check-bundle: 1 failed, 46 passed`，以及 `[bad] … get=function getSnapshot=undefined subscribe=function`、`[bad] a hook built from that store draws the switch — no switch`、`run-harness: 2 failed, 281 passed`；`optional(ctx,'locale')` → `ctx.locale` → `FAIL … locale is still read as a bare property` 与 `[bad] a host that refuses undeclared properties still gets the strings registered — []`。
- [x] **T036** 文档：`evidence.md` 的 E-BLD/E-CHK/E-HARN 三块用 `0.2.7` 单次运行重写、头注与版本链改 `0.2.7`、F15 行改为真实红行并注明"`0.2.6` 上记录的那行是错的"、G12 的行号改到当前文件、E-PUB/E-INS 追加 0.2.7；`plan.md`/`quickstart.md`/`spec.md`/`tasks.md` 的计数与版本同步。
- [x] **T037** 发版 `0.2.7`：commit `a9a2bc9` → tag `v0.2.7` → Actions run `45305735507` success（shasum `d424a48f8e0c3650f8c62281c3818dca59f715b1`、logIndex `4064162219`、33 files）→ registry 第 29 次轮询可下载 → `remove_bundle` 卸 0.2.6 → `install_bundle @0.2.7` applied（profile 依赖 `"0.2.7"`、安装副本 787325 字节 / `496B5C41…A913`）→ E-PUB/E-INS 已补；随后的文档更正 commit `12e6cd1` 只动 `specs/`。
- [x] **T038** 第三轮评审：`review-docs-002s` 判 FAIL（5 处行号引用落到旧树），`review-impl-002s` 判 FAIL 并给出两条 P0——`a service the plugin never declared is read through ctx.get` 与 `a refused settings write is not reported as saved` 只检查源码形状，把 `entry.js` 的 `if (typeof ctx.get === 'function')` 改成 `if (false)`、把 `settings.js` 的 `if (accepted)` 改成 `if (true)` 后静态套件仍全绿（真实故障与假证据）。行号问题已按 `fc30f95` 修正；两条 P0 的处理见 Phase 8。

## Phase 8：让两条只认形状的静态检查真能红（0.2.8）

- [x] **T039** `verify/check-bundle.mjs` 新增 `functionBody(source, signature)`（按花括号配平切出函数体），`a service the plugin never declared is read through ctx.get` 改为**执行**切出的 `optional()`：严格宿主（`ctx.get` 返回 `via-get:<name>`、`ctx.locale`/`ctx.configForms` 的 getter 抛 `cannot get property … without inject`）必须得到 `via-get:locale` / `via-get:configForms`，无 `ctx.get` 的宿主必须回退到属性值；保留 `optional(ctx, 'locale')` 与禁止裸 `ctx.locale` 的形状断言。
- [x] **T040** `a refused settings write is not reported as saved` 改为切出 `const settle = (accepted) => {…}` 并断言其中有 `if (accepted)`、`setState('failed')`、`restore(before)`，同时保留 `(result) => settle(result === true || result === undefined)` 与 `() => settle(false)` 两条流断言。
- [x] **T041** 探针（原地破坏→跑→立刻还原，`git status` 只留检查文件的改动）：P19 把 `ctx.get` 分支改成 `if (false)` → `FAIL a service the plugin never declared is read through ctx.get — ctx.get was not consulted for locale`、`check-bundle: 2 failed, 45 passed`、exit 1；P20 把 `if (accepted)` 改成 `if (true)` → `FAIL a refused settings write is not reported as saved — the settle handler does not branch on what the host answered`、`check-bundle: 2 failed, 45 passed`、exit 1。（两条在 `0.2.7` 树上破坏后静态套件都是全绿，这就是 P0。）
- [x] **T042** 版本升 `0.2.8`、重建（`787325 bytes, 785808 characters, engine 1.13.0, sources 6, syntax ok`，`sources sha256:a82c554f992a9871b4b8dcdff8499f7b`、文件 SHA-256 `35397283cd5f8f89ec9469c503176922bdf49c57551d5d8c4e40a49dfd5a24fd`），两套与 `0.2.7` 同为 47 / 283 全绿。
- [x] **T043** `evidence.md`：头注改 `0.2.8` 与九个版本、E-BLD/E-CHK/E-HARN 三块用 `0.2.8` 单次运行输出整段重写、F14 行补上当时漏记的静态红行、把"F14 与 F15 都在 `0.2.6` 树上跑过"的错误说法改成 F14 在 `0.2.6`、F15 在 `0.2.7`、新增 P19/P20 两行（并写明它们在 `0.2.7` 上曾全绿）、E-PUB/E-INS 补 `0.2.8` 占位块。
- [x] **T044** 发版 `0.2.8`：commit `6edaef3` → tag `v0.2.8` → Actions run `45310290797` success（shasum `ab9f82fbec6c6553b3f0031586785af0417ac52e`、logIndex `4065743074`、33 files）→ registry 第 29 次轮询可下载→ `remove_bundle` 卸 0.2.7 → `install_bundle @0.2.8` applied（profile 依赖 `"0.2.8"`、安装副本 787325 字节 / `35397283…24FD`）→ E-PUB/E-INS 已填。
- [ ] **T045** 第四轮两份独立评审，两份 PASS 才把 feature 002 标记完成。

## Phase 9：让乐观帧与退化 face 有断言，并让预期拒绝闭嘴（0.2.9）

- [x] **T046** 第四轮实现评审的两个 P0：`settings.js` 的乐观帧（`shown`，点击后先显示请求值、等宿主答复）与「快照缺字段按开处理」都没有断言——`hookFace.set` 同步生效时，把 `const value = shown === null ? props.value === true : shown` 改成 `props.value === true`、或把缺字段回落改成 `false`，两套检查都仍全绿。
- [x] **T047** 夹具修法（`verify/harness/index.html`，283 → 287）：`hookFace.set` 改成 `new Promise` + `setTimeout(…, 30)`，点击后 `tick(6)` 断言 `a pending write shows the requested value before the host answers`（`aria-checked === 'false'`），再 `tick(80)`；新增三种退化 face（`() => ({ value: {} })`、`() => null`、抛错）各断言开关仍在且按开显示。
- [x] **T048** 静态检查修法（`verify/check-bundle.mjs`，47 → 49）：`functionBody()` 改成字符串感知的花括号扫描（`'{{'` 不再让计数失衡），新增两条**执行**实现的检查——`a face that cannot answer still reads as on`（`readPreference` 的 7 种形状）与 `a host word is used only when it is a real translation`（`isResolved` 的 6 种输入）。
- [x] **T049** 探针：P21（缺字段回落 `false`）→ 静态 `1 failed, 48 passed`、浏览器 `2 failed, 285 passed`；P22（回显守卫取反）→ 静态 `2 failed, 47 passed`、浏览器 `5 failed, 282 passed`；P23（删乐观帧）→ 浏览器 `1 failed, 286 passed`（静态仍绿，故这条由浏览器负责）。
- [x] **T050** `src/client/entry.js` 的 `optional()` 不再报告 strict cordis 的 `cannot get property "…" without inject`（预期路径），其余错误照旧上报；依据是 `0.2.8` 真机复核时控制台留下的 `dsh-dyslexia: locale` 与 `dsh-dyslexia: configForms` 两条警告。
- [x] **T051** 真机复核 `0.2.8`（第二个 throwaway profile `webcheck2`）：设置行、点击写入 `cordis.patch.yml`、**重启后仍为关闭**、**卸载后行消失**、控制台两条我们自己的警告；入口是 `账号菜单`（更多）→ `menuitem "设置"`，菜单里标出快捷键 `Ctrl+Alt+,`。
- [x] **T052** 文档：`evidence.md` 头注改 `0.2.9`、E-BLD/E-CHK/E-HARN 用 `0.2.9` 单次运行输出整段重写、E-PROBE 补 P21–P23、E-LIVE 增加 `0.2.8` 复核小节（重启保持、卸载回退、两条警告）并把 console 行改成按版本记录、`spec.md` Status 与完成段改 `0.2.9`、`plan.md`/`quickstart.md` 计数改 49 / 287、quickstart 探针列表补 F14/F15/P19–P23。
- [x] **T053** 发版 `0.2.9`：commit `dcf9293` → tag `v0.2.9` → Actions run `45314418891` success（shasum `8a1204246b01652a6c84756a2878e9ae0d695d85`、logIndex `4066763564`、33 files）→ registry 第 29 次轮询可下载 → `remove_bundle` 卸 0.2.8 → `install_bundle @0.2.9` applied（profile 依赖 `"0.2.9"`、安装副本 787688 字节 / `95DEBB6B…9981`）→ E-PUB/E-INS 已填。
- [ ] **T054** 第五轮两份独立评审，两份 PASS 才把 feature 002 标记完成。

## Phase 10 — 0.2.10: the owner key, and guards whose failures were invisible

- [x] **T055** 夹具：`makeContext` 的 `slots.inject(name, fn)` 只在 `SLOT_NAMES = ['conversation.chat.markdown.fence', 'settings.general.item']` 里执行 `fn()`，并记录 `injectedSlots`（未知 owner key 永不触发，镜像真实宿主）；新增 `captureWarnings(run)` 收集 `console.warn`。
- [x] **T056** 夹具：`the row is claimed through the slot the host names`、`a host with no slots service is told once that nothing can be drawn`、`a host with no configForms stays quiet`、`a host whose face lookup finds nothing stays quiet`、`an older slots service that cannot register is reported once`（最后一组让 `ctx.get('slots')` 也返回那份不完整的服务，否则守卫不可观测）。
- [x] **T057** 静态检查：`the row is claimed through the slot name the host declares`（`SETTINGS_SLOT`、`slots.inject(SETTINGS_SLOT, () =>`、`name: SETTINGS_SLOT,`、`id: SETTINGS_ROW_ID,`）→ 静态 49 → **50**；`EXPECTED_CHECKS` 同步；两套套件的期望分别同步到 **50**（`verify/check-bundle.mjs`）与 **292**（`verify/run-harness.mjs`）。
- [x] **T058** 源码：`wireSettingsRow` 里不可达的 `typeof slots.inject/register` 守卫删掉（`apply` 在 `slots` 不能注入/注册时已提前返回），只留 `if (!slots) return false`；残留的不可观测性记进 E-GAPS **G15**。
- [x] **T059** 探针：**P24** 把 `SETTINGS_SLOT` 改成 `settings.general.item-x` → 静态 `FAIL the row is claimed through the slot name the host declares — settings.js does not name the general settings slot`（`0.2.10` 上 `1 failed, 49 passed`；`0.2.11` 复跑 `1 failed, 50 passed`）、浏览器 `run-harness: 12 failed, 237 passed`（11 条具名红行 + 一次 `fixture aborted`）；**P25** 去掉 face 守卫 → `[bad] a host whose face lookup finds nothing stays quiet — dsh-dyslexia: settings row TypeError: Cannot read properties of null (reading 'subscribe')`；**P26** 去掉 `configForms` 守卫 → `[bad] a host with no configForms stays quiet — … TypeError: Cannot read properties of undefined (reading 'get')`；**P27** 去掉 `if (!slots) return false` 仍绿（`all 292 checks passed`）——`apply` 已提前返回，该检查因此不可观测；守卫保留为防御，登记为 G15。
- [x] **T060** 文档：`evidence.md` 头注与 E-BLD/E-CHK/E-HARN 改用 `0.2.10` 单次运行输出（50 / 292、787768 字节、sources `25fe6938…`、file `1E51881A…`）、E-PROBE 补 P24–P27、E-GAPS 改「Thirteen gaps…G2–G8、G11–G16」并新增 G15/G16、G12/G13 按新证据改写；`spec.md` 的 Status 与「待复评」两段改写为当前口径；`plan.md`/`quickstart.md`/`tasks.md` 的计数与探针数同步（50/292、二十三条）。
- [x] **T061** 版本升 `0.2.10` → 提交 `951b28c` → tag `v0.2.10` → Actions run `45318980674` success（CI 50 / 292，shasum `3baa6e79…`，33 文件，logIndex `4067826736`）→ tarball 第 29 次轮询 200 → 装回 `desktop`（依赖 `"0.2.10"`，安装副本 787768 字节、`1E51881A…3495B`，`locale/` 8、`docs/` 9）→ E-PUB/E-INS 已补。
- [ ] **T062** 第六轮两份独立评审（文档 + 实现），两份 PASS 才把 feature 002 标记完成。

## Phase 11: the seventh review's findings and the `0.2.11` release

- [x] **T063** `verify/check-bundle.mjs` 新增 `the settings page is claimed with auto off, once per context`：真导入 `index.js`，给带 `inject` 的宿主，断言 `settings.configure({ auto: false }, ctx.fiber)` 恰好一次；无 `settings` 服务的宿主不配置也不抛；`inject` 抛错不逃出 `apply`。→ 静态 50 → **51**。
- [x] **T064** `verify/run-harness.mjs` 真的检测陈旧产物：`import { buildChunk } from '../scripts/build-client.mjs'`，重建后比较 `sources sha256`，不一致即 `client.js is stale: rebuild it (chunk …, sources …)` 并 exit 1。
- [x] **T065** `package-lock.json` 的 `version` 与 `packages[""].version` 从 `0.2.0` 改成 `0.2.11`。
- [x] **T066** 探针 **P28**（删 `claimSettingsPage(ctx)` 调用）→ `FAIL the settings page is claimed with auto off, once per context — 0 configure calls for one context`、`1 failed, 50 passed`；**P29**（改源不重建）→ `run-harness: client.js is stale: rebuild it (chunk 25576ab9…, sources 77513faf…)`、exit 1。
- [x] **T067** 文档：`evidence.md` 头注与 E-BLD/E-CHK/E-HARN 改用 `0.2.11` 单次运行输出（51 / 292、787768 字节、sources `25576ab9…`）、E-PROBE 补 P28/P29、G16 补夹具中断的说明、E-GAPS 改 "Fourteen gaps … G11–G17"（`0.2.11` 已发布版本里的说法）；**第七轮复评后**：G16 重写（"48 条"是错的，实测 P30 只中断 43 条）、新增 **G18**（`optional()` 静音的告警无断言）、**G19**（`Config` getter 抛错无断言）、**G20**（`.volatile()` 的持久化语义无断言）、计数改 "Seventeen gaps … G11–G20"、E-PROBE 加 **P30** 行。
- [x] **T068** 提交 `5b5b200` → tag `v0.2.11` → Actions run `45323036631` success（CI 51 / 292，shasum `1f0c7a262c0a60559833524b64ffac173ea906c9`，33 文件，logIndex `4068548518`）→ tarball 第 29 次轮询 200 → 装回 `desktop`（依赖 `"0.2.11"`、安装副本 787768 字节、SHA-256 `14C6514A…35975` 与仓库一致）→ E-PUB/E-INS 已补。
- [ ] **T069** 第七轮两份独立评审；两份 PASS 才把 feature 002 标记完成。

## Phase 12: the eighth implementation review, and `0.2.12`

- [x] **T070** 静态检查 `the preference field is volatile, so the settings form can show it`：`index.js` 的 `visualFirst` 必须写成 `z.boolean().default(true).volatile()`（宿主设置表单只投影 volatile 字段，普通布尔会让开关消失）。探针 P31 去掉 `.volatile()` → 静态 2 红。
- [x] **T071** `the row is claimed through the slot name the host declares` 改为**读赋值**：`settings.js` 里 `SETTINGS_SLOT` 的声明必须恰好一处（`declares SETTINGS_SLOT N times, expected exactly one`），取值必须是 `settings.general.item`；探针 P32 改名并加一句同文诱饵 → 静态 2 红（旧版只匹配句子，诱饵让它保持全绿）。
- [x] **T072** 探针 P31、P32 按实测写进 `evidence.md` 的 E-PROBE（含失败原文与"0.2.11 上绿、0.2.12 上红"的差别）。
- [x] **T073** 探针 P29 重做并写清改的是什么（`src/client/styles.js` 追加一行注释、不重建）：静态 `1 failed, 51 passed`、浏览器 `client.js is stale: rebuild it (chunk 25576ab9…, sources c740d04e…)`、exit 1；`evidence.md` 的 P29 行补上静态同红与新的 `sources` 指纹。
- [x] **T074** 九份 README（索引 + 8 语言）的"验证"条目补上 Web 界面真机观察（插件 `0.2.8`：标签与说明、开关、点击写 `cordis.patch.yml`、重启后保持），未测试范围收窄为"在桌面窗口里操作开关"。
- [x] **T075** 文档同步：`evidence.md` 的 E-BLD/E-CHK/E-HARN 换成 `0.2.12` 单次运行输出（52 / 292）、G20 改写（持久化仍未断言，volatile 自 `0.2.12` 起有断言）；`spec.md` 十三版 `0.2.0`–`0.2.12`、`0.2.7`–`0.2.12`、P19–P32、52 静态与 `sources 838eef8d…`；`plan.md`、`quickstart.md` 的计数与探针描述。
- [x] **T076** 发布 `0.2.12`：提交 `4964cb4` → tag `v0.2.12` → GitHub Actions run `45328884899`（`success`，shasum `a85192f5…`、logIndex `4069471531`、33 文件）→ registry tarball 第 29 次轮询 HEAD 200 → `remove_bundle`（卸 `0.2.11`）后 `install_bundle @0.2.12`（`applied`、依赖 `"0.2.12"`、安装副本 787768 字节 / `C58A4DD6…2F2C`）→ 回填 E-PUB · 0.2.12 与 E-INS · 0.2.12。
- [ ] **T077** 第九轮两份独立评审（文档 / 实现）；两份 PASS 才把 feature 002 标记完成。

## Dependencies

- Phase 2 依赖 T002/T003（段文本两档）先用静态断言钉住契约，再写客户端。
- Phase 3 可与 Phase 2 并行（不同文件）。
- Phase 4/5 依赖 Phase 1–3 全部完成。

## Implementation Strategy

1. 先钉契约（T002/T003/T005），保证"开关到底改变了什么"是可断言的事实。
2. 再做界面（T006–T010），夹具先行：假 `configForms` 的能力边界先写出来，组件照着它写。
3. 改名（T011–T014）风险低，可并行。
4. 探针与证据（T015–T017）必须在发版前完成，否则发版后的核对没有对照。

## Implementation status (2026-11-24)

| area | state |
|---|---|
| Host half: `Config` with `visualFirst` (default on, `.volatile()`, asserted since `0.2.12`), two-tier briefing, `claimSettingsPage` | done, 52 static checks |
| Client half: settings row on `settings.general.item`, `configForms` read/write, revert on refusal | done, 52 static and 292 browser checks in the published `0.2.12` (`0.2.7` shipped the same code with two shape-only static checks, `0.2.6` shipped 280) (`0.2.5` shipped 274, `0.2.4` 271, `0.2.3` 260, `0.2.2` 252); the row reads the hook prop the host builds (`useVisualFirst`) and keeps the store path for hosts that send `hooks`; no disabled state, no timer; a refused write restores the host's current value |
| Eight-language rename (locale, DETAIL alt line, 8 READMEs, index, package description) | done; DETAIL keeps exactly one image line (its alt sentence carries the new name) |
| Evidence | `evidence.md` (this feature): `0.2.12` build and 52 / 292, twenty-eight falsifiability probes (F1, F3–F15, P19–P32), E-LIVE records the row
| Not done | SC-005's one-second timing (G14), the desktop window's settings entry (the row was observed through `dsh web`; the desktop build opens settings as a separate document that this window offers no control for — G1 records the limit), the host write path to `settings.update` seen directly (G2 records what was observed instead), 200%/360px layout assertion for the row (G3), pixel comparison (G5), E1–E14 end-to-end rows (G6), SC-001 five sample requests (G7), schemastery import failure path (G8), live-host injection of malformed contexts (G4), degraded-face click path (G12), README/DETAIL wording consistency (G13), the unobservable `slots` guard (G15), invariants only the browser suite sees (G16), the 43 checks one missing attribute hides (G17), the silenced strict-inject warning (G18), a `Config` getter that throws (G19), what volatile persistence means (G20) |

**2026-11-24：** T021 的两项评审曾均 PASS（实现 `review-impl-002f`、文档 `review-docs-002m`），但那是在没有真机观察的前提下——按用户建议用 `dsh web` 起独立 profile 复现后，`0.2.5` 的设置行在真实设置页里渲染为空（T024），`0.2.6` 修好三处并补了 2 条静态检查、6 条夹具与 2 条探针（T025–T027），真机观察写进 `evidence.md` 的 E-LIVE（T028），G1 关闭（限 Web 界面）。发版与再评审见 T029/T030。

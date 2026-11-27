# 颜色是有含义的

图里的颜色不是装饰：形状决定角色，角色决定色相。想换颜色时，作者自己写的 `classDef` 或 `style` 优先，插件不会覆盖。

## 五个角色

按形状类（引擎写进 `g.pele-node.pele-shape-<形状>`）取色相，填充是把色相 18% 混进图底色，描边是把色相 60% 混进文字墨色，所以浅色与深色主题共用一套规则。

| 角色 | 形状 | 宿主色相 | 浅色填充 / 文字 | 深色填充 / 文字 |
| --- | --- | --- | --- | --- |
| 起止 start / end | `stadium` `circle` `odd` | `--dsw-static-green-500` `#22c55e` | `#d7f5e2` · 16.20:1 | `#23402e` · 10.87:1 |
| 判断 decision | `diam` `hex` | `--dsw-static-amber-500` `#f59e0b` | `#fdeed3` · 16.47:1 | `#493920` · 10.63:1 |
| 数据 data | `cyl` | `--dsw-static-violet-400` `#a78bfa` | `#efeafe` · 16.10:1 | `#3b364b` · 11.12:1 |
| 输入输出 input / output | `lean-r` `lean-l` `trap-b` `trap-t` | `--dsw-alias-link` `#4176e6` | `#dde6fb` · 15.13:1 | `#333b4b` · 10.73:1 |
| 处理 step | `rect` `rounded` `fr-rect` | `--dsw-static-neutral-bluish-400` `#adb2b8` | `#f0f1f2` · 16.73:1 | `#3c3d3f` · 10.44:1 |

描边对画布：浅色 4.87–8.05:1，深色 8.71–10.02:1。

## 八个系列色

饼图、甘特条、时间线、思维导图与柱状图不按形状取色，它们按顺序读 `--pele-series-1..8`。引擎会用画布色给这些填充区写标签，所以每个系列色都 55% 混进文字墨色：浅色主题得到深色调，深色主题得到浅色调，两边都能读。

| 序号 | 宿主色相 | 浅色 | 深色调 · 画布墨 |
| --- | --- | --- | --- |
| 1 | `--dsw-alias-chart-messages` `#4d93f8` | `#2b4c7b` · 8.72:1 | `#acccfa` · 9.52:1 |
| 2 | `--dsw-static-green-500` `#22c55e` | `#186236` · 7.40:1 | `#98e2b4` · 10.39:1 |
| 3 | `--dsw-static-blue-400` `#60a5fa` | `#33547c` · 7.81:1 | `#b4d4fb` · 10.26:1 |
| 4 | `--dsw-static-amber-500` `#f59e0b` | `#765011` · 7.13:1 | `#f7d18f` · 10.80:1 |
| 5 | `--dsw-static-deepseek-400` `#7aaaff` | `#3f567e` · 7.39:1 | `#c0d6fd` · 10.67:1 |
| 6 | `--dsw-static-red-500` `#ef4444` | `#74282a` · 10.11:1 | `#f5a8a9` · 8.26:1 |
| 7 | `--dsw-static-violet-400` `#a78bfa` | `#53487c` · 8.12:1 | `#d4c8fb` · 10.06:1 |
| 8 | `--dsw-static-neutral-bluish-400` `#adb2b8` | `#56595e` · 6.99:1 | `#d7dadd` · 11.15:1 |

## 作者优先

`classDef` 与行内 `style` 落在形状元素上，浏览器里行内样式永远压过插件的样式表，所以作者写 `classDef important fill:#dbeafe,stroke:#2563eb` 就是最终颜色。引擎会按填充深浅自动挑墨色，插件只负责把 `--pele-fg-on-light` / `--pele-fg-on-dark` 接到宿主令牌，保证这个墨色在两套主题里都读得出来。

## 数字从哪来

上表由 `verify/host-tokens.json`（宿主 0.2.2-rc.5）里的真实令牌算出，算法与 `src/client/styles.js` 的 `color-mix()` 相同；改主题、改宿主版本后，用 `node scripts/extract-host-tokens.mjs` 刷新快照，再用 `node scripts/build-evidence.mjs` 重新生成实测页 `specs/003-diagram-palette-contrast/evidence/shipped.html`。

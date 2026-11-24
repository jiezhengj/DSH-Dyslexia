# DSH — I'm dyslexic

Draws mermaid blocks right in the conversation and, when it helps, asks for a picture instead of a wall of text.
把会话里的 mermaid 代码块就地画成图，并在需要时鼓励 Agent 用图说话。

- 8 种界面语言 / 8 interface languages: [English](README.en.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

## About

A reply often explains a structure in words a diagram would show in a glance. This plugin lets the chat draw `mermaid` blocks where they stand, so the picture sits in the conversation and the code block stays its text: copyable and readable after the plugin is removed. (searching is not verified: see feature 001's E-GAPS, G7).
回复里经常用一段文字去讲一个结构，而一张图一眼就能看清。这个插件让聊天就地画出 `mermaid` 代码块：图留在会话里，代码块仍是消息的文本——可复制，插件卸掉之后也仍可读（检索未取证，见 feature 001 的 E-GAPS 里的 G7）。

The plugin now asks the assistant for a picture when a picture is easier to follow than a paragraph, and keeps the text for what the picture cannot show. Settings → General has the switch; turn it off and the plugin renders only, as before.
当一张图比一段话更好懂时，插件现在会请助手画图，文字只留图讲不清的部分。设置 → 通用设置里有这个开关；关掉后插件就只负责渲染，和以前一样。

## Data and privacy / 数据与隐私

- The plugin makes no network requests at runtime; the diagram engine is bundled inside `client.js`.
  插件在运行时不发起任何网络请求；绘制引擎内联打包在 `client.js` 中。
- It collects nothing and sends nothing anywhere.
  不收集任何信息，也不向任何地方发送数据。
- It reads only the `mermaid` code block text that is already displayed in your page, and it writes only the diagram into that page.
  只读取页面上已经显示出来的 `mermaid` 代码块文本，只把生成的图写回该页面。
- The **Copy source** button uses your browser clipboard; nothing leaves the page.
  **复制源码**（**Copy source**）按钮只使用浏览器剪贴板；没有任何内容离开当前页面。
- Nothing is added to your session history: the diagram is a rendering, not a stored object (the real-machine side of this is not checked yet: see feature 001's E-GAPS, G12).
  不会向会话历史写入任何内容：图只是界面渲染结果，不是保存的对象（真机未核对，见 feature 001 的 E-GAPS 里的 G12）。

## How to verify / 验证方法

Requirements: Node.js 22 or newer, and Chrome/Chromium for the browser checks.
环境要求：Node.js 22 或更新版本，以及用于浏览器检查的 Chrome/Chromium。

- `node verify/check-bundle.mjs` — static and engine checks of the shipped bundle (manifest, no network calls, no version gate, the vendored engine, eight interface languages, seven sample diagrams, drawn by the vendored engine; other diagram types are untested, see feature 001's E-GAPS, G21). Prints one line per check and exits non-zero on failure.
  `node verify/check-bundle.mjs` — 对随包产物执行静态与引擎检查（manifest、无网络调用、无版本门、内联引擎、八种界面语言、七种图形的示例图；其他图种未测，见 feature 001 的 E-GAPS 里的 G21）。每项检查打印一行，失败时以非零状态码退出。
- `node verify/run-harness.mjs` — runs the browser checks in headless Chrome against `verify/harness/index.html` (drawing, eight languages, hostile hosts, broken diagrams, copy, narrow 360 px column, theme colours). Set `DSH_DYSLEXIA_CHROME` to point at a specific Chrome executable if auto-detection fails.
  `node verify/run-harness.mjs` — 在无头 Chrome 中针对 `verify/harness/index.html` 运行浏览器检查（成图、八种语言、异常宿主环境、损坏的图形语法、复制、360 px 窄栏、主题颜色）。若自动探测失败，可设置 `DSH_DYSLEXIA_CHROME` 指向指定的 Chrome 可执行文件。

Both commands are in the repository, so the claims in this file can be re-checked at any time; they are also what CI runs before publishing.
两条命令都在仓库中，可随时重新验证本文所述内容；它们也是发布前 CI 运行的检查。

## Known limits / 已知限制

Gap ids (`G…`) refer to feature 001's E-GAPS in `specs/001-mermaid-fence-render/evidence/verification.md`.
文中的 `G…` 编号指 feature 001 的 E-GAPS，原文在 `specs/001-mermaid-fence-render/evidence/verification.md`。

- **Verified here:** the live-window checks that still transfer are plugin `0.1.31` (`0.1.32` is installed, but its copy feedback has not been re-checked live: feature 001's task T331); the older `0.1.2` rows no longer transfer after the renderer changes in `0.1.3`–`0.1.31`. This version's evidence is fixture-level for the desktop window, plus one live observation on the web surface (plugin `0.2.8`: the row's label and hint, the switch, a click writing the profile's `cordis.patch.yml`, and the value surviving a restart — feature 002's E-LIVE). Not yet tested: the switch operated in a **desktop** window, an eight-language narrow layout, and any pixel comparison with the host's own rows. The plugin pages in the other languages have still not been seen (see feature 001's E-GAPS, G13).
  **已在此验证：** 仍可转移的真机检查来自插件 `0.1.31`（`0.1.32` 已安装，它的复制回执还没做真机复核，见 feature 001 的 T331）；`0.1.3`–`0.1.31` 改过渲染之后，`0.1.2` 的旧观察不再转移；本版本的证据在桌面窗口上只到夹具级别，另有一次 Web 界面的真机观察（插件 `0.2.8`：设置行的标签与说明、开关、点击后写入 profile 的 `cordis.patch.yml`、重启后值保持 —— 见 feature 002 的 E-LIVE）。尚未测试：在**桌面**窗口里操作开关、八种语言的窄栏布局、与宿主自带行的像素比对。其余语言的插件页仍未看过（见 feature 001 的 E-GAPS 里的 G13）。
- **Likely, not proven on your machine:** other DSH versions; other Chromium-based browsers; the same checks on mobile devices (the layout is verified in a 360 px viewport in a desktop browser, not on a physical phone); very large diagrams (limits: source 24 KiB, drawing output 2 MiB, 400 edges; beyond that it falls back to the code block).
  **大概率可用，但未在你的机器上实证：** 其他 DSH 版本；其他 Chromium 内核浏览器；移动设备上的同类表现（布局仅在桌面浏览器的 360 px 视口中验证，未在实体手机上实测）；超大图形（上限为源码 24 KiB、绘制输出 2 MiB、400 条边；超出后回退显示代码块）。
- **Not done:** no DSH upgrade has been rehearsed yet (see feature 001's E-GAPS, G1); diagrams are not drawn while a message is still streaming; only `mermaid` fences (` ```mermaid `) are handled (not other fence languages).
  **尚未覆盖：** 尚未演练任何一次 DSH 升级（见 feature 001 的 E-GAPS 里的 G1）；消息仍在流式输出时不会成图；只处理 ` ```mermaid ` 代码块（不处理其他语言标记的代码块）。

## Install

Install `@jiezhengj/dsh-dyslexia` in the DeepSeek Harness Plugins page. It draws figures in the conversation; the renderer was live-checked on plugin `0.1.31` (`0.1.32` is installed, but its copy feedback has not been re-checked live: feature 001's task T331), and the switch itself has not been operated in a **desktop** window yet (it has been seen working on the web surface, feature 002's E-LIVE) (see feature 002's E-GAPS, G1/G6). Uninstalling takes effect after restarting the app: a running window keeps the figure and both buttons it has already loaded, and history is untouched (see feature 001's E-GAPS, G24①); enabling and disabling go through the host's own plugin mechanism and need no config edit, but **those two steps have not been observed separately** (see feature 001's E-GAPS, G20). A version change needs the app restarted before the new client code is loaded.
在 DeepSeek Harness 的插件页安装 `@jiezhengj/dsh-dyslexia`。它会在会话里画图；渲染器在插件 `0.1.31`（`0.1.32` 已安装，它的复制回执还没做真机复核，见 feature 001 的 T331） 上做过真机检查，这个开关在 **Web 界面**上观察过它工作（插件 `0.2.8`，见 feature 002 的 E-LIVE），还没有在**桌面**窗口里操作过（见 E-GAPS 的 G1/G6）。卸载要重启应用后才生效：打开着的窗口会继续显示已经画出的图与两个按钮，历史消息不变（见 feature 001 的 E-GAPS 里的 G24①）；启用与停用走宿主自己的插件机制、不需要改配置，但**这两步还没有单独的真机观察**（见 feature 001 的 E-GAPS 里的 G20）。更换版本需要重启应用才会加载新的客户端代码。

- Source: https://github.com/jiezhengj/DSH-Dyslexia

## Documentation

- English: [README.en.md](README.en.md)
- 简体中文: [README.zh.md](README.zh.md)
- 日本語: [README.ja.md](README.ja.md)
- Español: [README.es.md](README.es.md)
- Français: [README.fr.md](README.fr.md)
- Deutsch: [README.de.md](README.de.md)
- Русский: [README.ru.md](README.ru.md)
- Português: [README.pt.md](README.pt.md)


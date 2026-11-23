# DSH Dyslexia

Draws `mermaid` code blocks in a DeepSeek Harness conversation as diagrams, in place in the message — no side panel, no second window.
把 DeepSeek Harness 会话里的 `mermaid` 代码块就地画成图——不开侧栏，也不弹第二个窗口。

- 8 种界面语言 / 8 interface languages: [English](README.en.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

## About

A reply often explains a structure in words a diagram would show in a glance. This plugin lets the chat draw `mermaid` blocks where they stand, so the picture sits in the conversation and the code block stays its text: copyable, searchable, and readable after the plugin is removed.
回复里经常用一段文字去讲一个结构，而一张图一眼就能看清。这个插件让聊天就地画出 `mermaid` 代码块：图留在会话里，代码块仍是消息的文本——可复制、可检索，插件卸掉之后也仍可读。

## Data and privacy / 数据与隐私

- The plugin makes no network requests at runtime; the diagram engine is bundled inside `client.js`.
  插件在运行时不发起任何网络请求；绘制引擎内联打包在 `client.js` 中。
- It collects nothing and sends nothing anywhere.
  不收集任何信息，也不向任何地方发送数据。
- It reads only the `mermaid` code block text that is already displayed in your page, and it writes only the diagram into that page.
  只读取页面上已经显示出来的 `mermaid` 代码块文本，只把生成的图写回该页面。
- The **Copy source** button uses your browser clipboard; nothing leaves the page.
  **复制源码**（**Copy source**）按钮只使用浏览器剪贴板；没有任何内容离开当前页面。
- Nothing is added to your session history: the diagram is a rendering, not a stored object.
  不会向会话历史写入任何内容：图只是界面渲染结果，不是保存的对象。

## How to verify / 验证方法

Requirements: Node.js 22 or newer, and Chrome/Chromium for the browser checks.
环境要求：Node.js 22 或更新版本，以及用于浏览器检查的 Chrome/Chromium。

- `node verify/check-bundle.mjs` — static and engine checks of the shipped bundle (manifest, no network calls, no version gate, the vendored engine, eight interface languages, sample diagrams of every supported type). Prints one line per check and exits non-zero on failure.
  `node verify/check-bundle.mjs` — 对随包产物执行静态与引擎检查（manifest、无网络调用、无版本门、内联引擎、八种界面语言、每种支持图形的示例图）。每项检查打印一行，失败时以非零状态码退出。
- `node verify/run-harness.mjs` — runs the browser checks in headless Chrome against `verify/harness/index.html` (drawing, eight languages, hostile hosts, broken diagrams, copy, narrow 360 px column, theme colours). Set `DSH_DYSLEXIA_CHROME` to point at a specific Chrome executable if auto-detection fails.
  `node verify/run-harness.mjs` — 在无头 Chrome 中针对 `verify/harness/index.html` 运行浏览器检查（成图、八种语言、异常宿主环境、损坏的图形语法、复制、360 px 窄栏、主题颜色）。若自动探测失败，可设置 `DSH_DYSLEXIA_CHROME` 指向指定的 Chrome 可执行文件。

Both commands are in the repository, so the claims in this file can be re-checked at any time; they are also what CI runs before publishing.
两条命令都在仓库中，可随时重新验证本文所述内容；它们也是发布前 CI 运行的检查。

## Known limits / 已知限制

- **Verified here:** in-chat drawing in DSH desktop `0.2.2-rc.5` (plugin `0.1.2`, real-machine verification covers the Chinese docs page only); label fallback; uninstall fallback and reinstall; eight interface languages (in the headless harness); a 360 px wide column in a headless Chrome fixture (a layout check, not a phone).
  **已在此验证：** DSH 桌面端 `0.2.2-rc.5`（插件 `0.1.2`，真机只覆盖中文说明页）会话内成图；标签回退；卸载回退与重新安装；八种界面语言（在无头测试环境里）；360 px 窄栏布局。
- **Likely, not proven on your machine:** other DSH versions; other Chromium-based browsers; the same checks on mobile devices (the layout is verified in a 360 px viewport in a desktop browser, not on a physical phone); very large diagrams (limits: source 24 KiB, drawing output 2 MiB, 400 edges; beyond that it falls back to the code block).
  **大概率可用，但未在你的机器上实证：** 其他 DSH 版本；其他 Chromium 内核浏览器；移动设备上的同类表现（布局仅在桌面浏览器的 360 px 视口中验证，未在实体手机上实测）；超大图形（上限为源码 24 KiB、绘制输出 2 MiB、400 条边；超出后回退显示代码块）。
- **Not done:** upgrading DSH across a major version has not been rehearsed; diagrams are not drawn while a message is still streaming; only `mermaid` fences (` ```mermaid `) are handled (not other fence languages).
  **尚未覆盖：** 尚未演练跨大版本升级 DSH；消息仍在流式输出时不会成图；只处理 ` ```mermaid ` 代码块（不处理其他语言标记的代码块）。

## Install

Install `@jiezhengj/dsh-dyslexia` in the DeepSeek Harness Plugins page. Uninstalling was watched on a running app (the figure falls back to the code block at once, history untouched); enabling and disabling go through the host's own plugin mechanism and need no config edit. A version change needs the app restarted before the new client code is loaded.
在 DeepSeek Harness 的插件页安装 `@jiezhengj/dsh-dyslexia`。卸载已在运行中的界面上观察过（图立刻退回代码块、历史不变）；启用与停用走宿主自己的插件机制、不需要改配置。更换版本需要重启应用才会加载新的客户端代码。

- npm: https://www.npmjs.com/package/@jiezhengj/dsh-dyslexia
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


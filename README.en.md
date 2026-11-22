# DSH Dyslexia

> A diagram instead of a wall of text — drawn where the text is.

## What it does

DeepSeek Harness already renders Markdown in a chat. This plugin adds one thing: when a reply contains a `mermaid` code block, the chat draws it as a diagram right there — inside the message, in the flow of the conversation. No window opens beside it, nothing switches to a side panel.

The code block is never consumed. It stays in the message as text: it can be copied, searched, sent on, and read after this plugin is gone.

## Why it is built this way

- **The text is the record.** Every drawing is made from the code block when it is shown, so nothing lives only as pixels. Turn the plugin off and the conversation is still complete.
- **Inside the message, not beside it.** A preview window breaks the thread of reading: you lose the line you were on.
- **Capability belongs to the plugin, preference to you.** The plugin only says that drawings appear here. Whether the assistant should draw is your own instruction, in your own `AGENTS.md`.
- **Nothing about your machine is assumed.** The drawing engine is bundled, the plugin works offline, and it asks nothing of the host.

## What you get

- Diagrams in place for `mermaid` code blocks: flowcharts, sequence, class, state, ER, mind map, timeline and the other Mermaid 12.1 diagram types.
- **Show source** and **Copy source** under every drawing, so the text behind the picture is one click away.
- While a reply is streaming, the block stays a code block; the drawing appears when the block is complete.
- A block that cannot be parsed shows the plain code block plus one line saying why — never an empty frame.
- Colours and fonts follow the interface theme, and a theme switch is picked up without a reload.
- On a phone or a narrow window the drawing reflows to the column width and zoom stays inside the drawing, so the page never scrolls sideways.
- Eight interface languages, the same set DeepSeek Harness ships.
- Nothing is fetched at runtime: the engine is inside the plugin.

## Install

Install the package `@jiezhengj/dsh-dyslexia` in your DeepSeek Harness profile (the Plugins page), then restart the app. The package is on npm: https://www.npmjs.com/package/@jiezhengj/dsh-dyslexia.

## Example

A reply contains this code block, and the chat shows it as a picture:

```mermaid
flowchart LR
  A[Text] --> B[Diagram]
```

## Uninstalling and compatibility

- Uninstalling keeps every past conversation intact: earlier drawings turn back into the code blocks they came from, still readable and still searchable.
- The plugin declares no version gate and no required host package, so a host upgrade cannot stop the app from starting; if the host changes shape, the plugin steps aside and the plain code block is shown.

## License

MIT. The bundled drawing engine Pele 1.13.0 is MIT as well; see `THIRD-PARTY-NOTICES.md`.

Source: https://github.com/jiezhengj/DSH-Dyslexia

Other languages: [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

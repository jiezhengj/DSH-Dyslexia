# DSH — Ich habe Legasthenie

> Ein Diagramm statt einer Textwand – gezeichnet, wo der Text stand.

## Was es tut

DeepSeek Harness stellt Markdown im Chat bereits dar. Dieses Plugin fügt genau eines hinzu: Enthält eine Antwort einen `mermaid`-Codeblock, zeichnet der Chat ihn an genau dieser Stelle als Diagramm – in der Nachricht, im Lauf der Unterhaltung. Daneben öffnet sich kein Fenster, nichts wechselt in eine Seitenleiste.

Der Codeblock wird nie verbraucht. Er bleibt der Text der Nachricht: kopierbar, weitergebbar und auch dann noch lesbar, wenn dieses Plugin entfernt ist (Suchen ist nicht verifiziert: siehe die E-GAPS von Feature 001, G7).

## Warum es so gebaut ist

- **Der Text ist die Aufzeichnung.** Jedes Diagramm wird beim Anzeigen aus dem Codeblock neu erzeugt; nichts existiert nur als Pixel. Plugin aus – die Unterhaltung bleibt vollständig.
- **In der Nachricht, nicht daneben.** Ein Vorschaufenster zerreißt den Lesefaden: Man verliert die Zeile, bei der man war.
- **Das Plugin bittet um ein Diagramm, wenn ein Diagramm leichter ist.** Wenn ein Schaubild eine Antwort leichter verfolgbar macht als ein Absatz, sagt das Plugin das jetzt dem Assistenten und lässt Text nur für das, was das Bild nicht zeigen kann. Unter Einstellungen → Allgemein gibt es einen Schalter; ausgeschaltet zeichnet das Plugin wieder nur.
- **Über deinen Rechner wird nichts angenommen.** Die Zeichen-Engine ist mitgeliefert, das Plugin arbeitet offline und verlangt nichts vom Host.

## Was du bekommst

- Diagramme an Ort und Stelle für `mermaid`-Codeblöcke: Flussdiagramm, Sequenz, Klasse, Zustand, ER, Mindmap, Zeitachse und weitere vom Motor unterstützte Diagrammtypen; die statische Prüfung tastet diese sieben ab, der Browser-Test zeichnet nur die ersten beiden (weitere Typen sind ungetestet, siehe die E-GAPS von Feature 001, G21).
- **Quelle anzeigen** und **Quelle kopieren** unter jedem Diagramm – der Text hinter dem Bild ist einen Klick entfernt.
- Während eine Antwort noch streamt, bleibt der Block ein Codeblock; das Diagramm erscheint, sobald der Block vollständig ist.
- Ein nicht auswertbarer Block zeigt den ursprünglichen Codeblock plus eine Zeile mit dem Grund – nie einen leeren Rahmen.
- Farben und Schriften folgen dem Oberflächenthema; ein Themenwechsel wird ohne Neuladen übernommen.
- Auf dem Telefon oder in einem schmalen Fenster passt sich das Diagramm der Spaltenbreite an, und der Zoom bleibt im Diagramm – die Seite scrollt nie seitwärts.
- Acht Oberflächensprachen, dieselben, die DeepSeek Harness mitbringt.
- Zur Laufzeit wird nichts geladen: Die Engine steckt im Plugin.

## Daten und Datenschutz

- Das Plugin stellt zur Laufzeit keine Netzwerkanfragen; die Zeichen-Engine ist in `client.js` gebündelt.
- Es sammelt nichts und sendet nichts irgendwohin.
- Es liest nur den Text des `mermaid`-Codeblocks, der bereits auf deiner Seite angezeigt wird, und schreibt nur das Diagramm in diese Seite.
- Die Schaltfläche **Quelle kopieren** nutzt die Zwischenablage deines Browsers; nichts verlässt die Seite.
- Deinem Sitzungsverlauf wird nichts hinzugefügt: Das Diagramm ist eine Darstellung, kein gespeichertes Objekt (reale Maschine nicht geprüft: siehe die E-GAPS von Feature 001, G12).

## So überprüfst du es

Voraussetzungen: Node.js 22 oder neuer sowie Chrome/Chromium für die Browser-Prüfungen.

- `node verify/check-bundle.mjs` – statische und Engine-Prüfungen des ausgelieferten Pakets (Manifest, keine Netzwerkaufrufe, keine Versionsschwelle, die mitgelieferte Engine, acht Oberflächensprachen, sieben Beispieldiagramme). Gibt pro Prüfung eine Zeile aus und beendet sich bei Fehlschlag mit einem Wert ungleich null.
- `node verify/run-harness.mjs` – führt die Browser-Prüfungen im Headless-Chrome gegen `verify/harness/index.html` aus (Zeichnen, acht Sprachen, ungünstige Hosts, fehlerhafte Diagramme, Kopieren, schmale 360-px-Spalte, Themenfarben). Setze `DSH_DYSLEXIA_CHROME` auf eine bestimmte Chrome-Programmdatei, falls die automatische Erkennung fehlschlägt.

Beide Befehle liegen im Repository, sodass sich die Aussagen in dieser Datei jederzeit erneut prüfen lassen; dieselben Prüfungen führt auch die CI vor der Veröffentlichung aus.

## Bekannte Grenzen

Die Kennungen `G…` verweisen auf die E-GAPS von Feature 001 in `specs/001-mermaid-fence-render/evidence/verification.md`.

- **Hier verifiziert:** Die weiterhin übertragbaren Prüfungen auf echter Hardware sind die von Plugin `0.1.31` und `0.1.32`; die alten `0.1.2`-Zeilen lassen sich nach den Renderer-Änderungen in `0.1.3`–`0.1.31` nicht mehr übertragen. Die Belege dieser Version sind für das Desktop-Fenster reine Fixture-Ebene, dazu eine echte Beobachtung auf der Web-Oberfläche (Plugin `0.2.8`: Label und Hinweis der Zeile, der Schalter, ein Klick, der die `cordis.patch.yml` des Profils schreibt, und der nach einem Neustart erhaltene Wert — siehe E-LIVE von Feature 002). Nicht getestet: der Schalter in einem **Desktop**-Fenster, ein schmales Layout in acht Sprachen und ein Pixelvergleich mit den Zeilen des Hosts. Die Plugin-Seiten in den übrigen Sprachen wurden noch nicht gesehen (siehe die E-GAPS von Feature 001, G13).
- **Wahrscheinlich, aber auf deinem Rechner nicht bewiesen:** andere DSH-Versionen; andere Chromium-basierte Browser; dieselben Prüfungen auf Mobilgeräten (das Layout ist in einem 360-px-Viewport eines Desktop-Browsers verifiziert, nicht auf einem physischen Telefon); sehr große Diagramme (es gibt Grenzen: 24 KiB Quelltext, 2 MiB Zeichenausgabe, 400 Kanten; darüber hinaus fällt es auf den Codeblock zurück).
- **Nicht durchgeführt:** ein DSH-Upgrade wurde noch nie geprobt (siehe die E-GAPS von Feature 001, G1); Diagramme werden nicht gezeichnet, solange eine Nachricht noch streamt; nur ` ```mermaid `-Blöcke werden behandelt (keine anderen Codeblock-Sprachen).

## Installation

Installiere das Paket `@jiezhengj/dsh-dyslexia` in deinem DeepSeek-Harness-Profil (Plugin-Seite); es zeichnet Diagramme im Gespräch; der Renderer wurde live mit den Plugins `0.1.31` und `0.1.32` geprüft, und der Schalter wurde noch nicht in einem echten Fenster beobachtet (siehe die E-GAPS von Feature 002, G1/G6). Das Deinstallieren wirkt erst nach einem Neustart der App: Ein geöffnetes Fenster zeigt die bereits geladenen Abbildungen und beide Schaltflächen weiterhin, die Historie bleibt unverändert (siehe die E-GAPS von Feature 001, G24①). Aktivieren und Deaktivieren laufen über den Plugin-Mechanismus des Hosts, ohne dass eine Konfigurationsdatei angefasst wird, **wurden aber nicht getrennt beobachtet** (siehe die E-GAPS von Feature 001, G20). Bei einem Versionswechsel muss die App neu starten, damit der neue Client-Code geladen wird. Auf npm: https://www.npmjs.com/package/@jiezhengj/dsh-dyslexia

## Beispiel

Eine Antwort enthält diesen Block, und der Chat zeigt ihn als Bild:

```mermaid
flowchart LR
  A[Text] --> B[Diagram]
```

## Deinstallation und Kompatibilität

- Eine Deinstallation verändert keine frühere Unterhaltung, wirkt aber erst nach einem Neustart der App: Bis dahin zeigt ein geöffnetes Fenster die bereits geladenen Diagramme und beide Schaltflächen weiterhin; nach dem Neustart werden frühere Diagramme wieder zu den Codeblöcken, aus denen sie entstanden, lesbar.
- Das Plugin deklariert keine Versionsschwelle und kein erforderliches Host-Paket, sodass eine Versionsprüfung den Start nicht ablehnen kann; ein echtes Host-Update wurde noch nicht geprobt (siehe die E-GAPS von Feature 001, G1). Ändert sich die Form des Hosts, tritt das Plugin zurück und der ursprüngliche Codeblock wird gezeigt.

## Lizenz

MIT. Die mitgelieferte Zeichen-Engine Pele 1.13.0 steht ebenfalls unter MIT; siehe `THIRD-PARTY-NOTICES.md`.

Quellcode: https://github.com/jiezhengj/DSH-Dyslexia

Andere Sprachen: [English](README.en.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Русский](README.ru.md) · [Português](README.pt.md)

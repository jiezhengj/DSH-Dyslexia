/**
 * Visible strings of the figure, in every language the DeepSeek Harness interface
 * ships (zh, en, ja, es, fr, de, ru, pt). The host serves the dictionary this
 * module exports; the copy here is also the fallback used before the host locale
 * service answers, so a figure never shows a bare key.
 *
 * Every visible sentence is complete in its own language: no English fragment is
 * pasted into a Chinese label, and the engine's own error text (which is English
 * and multi-line) never reaches the reader — it goes to the console and to the
 * caller's log instead.
 */

const LOCALE_NAMESPACE = 'dyslexia'

const DICTIONARY = {
  en: {
    copied: 'Copied',
    copyFailed: 'Copy failed',
    copySource: 'Copy source',
    engineUnavailable: 'The drawing engine is unavailable, so the source is shown.',
    figureLabel: 'Diagram',
    hideSource: 'Hide source',
    renderFailed: 'This diagram cannot be drawn, so its source is shown.',
    resetZoom: 'Reset zoom',
    showSource: 'Show source',
    syntaxError: 'The diagram syntax is not valid, so its source is shown.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    settingFailed: 'Could not save the change, so the switch stays where it was.',
    settingHint: 'When a picture carries the answer better than a paragraph, the model draws one and keeps the text to what the picture cannot show.',
    settingLabel: 'Prefer pictures to prose',
    settingSaved: 'Saved',

  },
  zh: {
    copied: '已复制',
    copyFailed: '复制失败',
    copySource: '复制源码',
    engineUnavailable: '绘图引擎不可用，已改为显示源码。',
    figureLabel: '图',
    hideSource: '隐藏源码',
    renderFailed: '这张图无法绘制，已改为显示源码。',
    resetZoom: '重置缩放',
    showSource: '查看源码',
    syntaxError: '图里的语法有误，已改为显示源码。',
    zoomIn: '放大',
    zoomOut: '缩小',
    settingFailed: '保存失败，开关保持原来的状态。',
    settingHint: '当一张图比一段话更好懂时，模型会画图，文字只留图讲不清的部分。',
    settingLabel: '优先用图，而不是成段文字',
    settingSaved: '已保存',

  },
  ja: {
    copied: 'コピーしました',
    copyFailed: 'コピーできませんでした',
    copySource: 'ソースをコピー',
    engineUnavailable: '描画エンジンを利用できないため、ソースを表示しています。',
    figureLabel: '図',
    hideSource: 'ソースを隠す',
    renderFailed: 'この図は描画できないため、ソースを表示しています。',
    resetZoom: '倍率をリセット',
    showSource: 'ソースを表示',
    syntaxError: '図の構文が正しくないため、ソースを表示しています。',
    zoomIn: '拡大',
    zoomOut: '縮小',
    settingFailed: '保存できませんでした。スイッチは元のままです。',
    settingHint: '図のほうが伝わりやすいときは図を描き、文章は図で表せない部分だけにします。',
    settingLabel: '文章より図を優先',
    settingSaved: '保存しました',

  },
  es: {
    copied: 'Copiado',
    copyFailed: 'No se pudo copiar',
    copySource: 'Copiar el código',
    engineUnavailable: 'El motor de dibujo no está disponible, así que se muestra el código.',
    figureLabel: 'Diagrama',
    hideSource: 'Ocultar el código',
    renderFailed: 'No se puede dibujar este diagrama, así que se muestra su código.',
    resetZoom: 'Restablecer el zoom',
    showSource: 'Mostrar el código',
    syntaxError: 'La sintaxis del diagrama no es válida, así que se muestra su código.',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    settingFailed: 'No se pudo guardar el cambio, así que el interruptor se queda como estaba.',
    settingHint: 'Cuando una imagen explica mejor que un párrafo, el modelo dibuja y deja en texto solo lo que la imagen no puede mostrar.',
    settingLabel: 'Prefiere las imágenes al texto',
    settingSaved: 'Guardado',

  },
  fr: {
    copied: 'Copié',
    copyFailed: 'Échec de la copie',
    copySource: 'Copier la source',
    engineUnavailable: "Le moteur de dessin n'est pas disponible ; la source est affichée.",
    figureLabel: 'Schéma',
    hideSource: 'Masquer la source',
    renderFailed: 'Impossible de dessiner ce schéma ; sa source est affichée.',
    resetZoom: 'Réinitialiser le zoom',
    showSource: 'Afficher la source',
    syntaxError: "La syntaxe du schéma n'est pas valide ; sa source est affichée.",
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    settingFailed: 'Impossible d\'enregistrer le changement : l\'interrupteur reste tel quel.',
    settingHint: 'Quand un schéma explique mieux qu\'un paragraphe, le modèle en dessine un et ne garde en texte que ce que le schéma ne peut pas montrer.',
    settingLabel: 'Préférer les schémas au texte',
    settingSaved: 'Enregistré',

  },
  de: {
    copied: 'Kopiert',
    copyFailed: 'Kopieren fehlgeschlagen',
    copySource: 'Quelle kopieren',
    engineUnavailable: 'Die Zeichen-Engine ist nicht verfügbar, daher wird die Quelle angezeigt.',
    figureLabel: 'Diagramm',
    hideSource: 'Quelle ausblenden',
    renderFailed: 'Dieses Diagramm lässt sich nicht zeichnen, daher wird seine Quelle angezeigt.',
    resetZoom: 'Zoom zurücksetzen',
    showSource: 'Quelle anzeigen',
    syntaxError: 'Die Diagrammsyntax ist ungültig, daher wird ihre Quelle angezeigt.',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    settingFailed: 'Die Änderung konnte nicht gespeichert werden, der Schalter bleibt, wie er war.',
    settingHint: 'Wenn ein Bild mehr erklärt als ein Absatz, zeichnet das Modell eines und lässt im Text nur, was das Bild nicht zeigen kann.',
    settingLabel: 'Bilder statt Textabsätze',
    settingSaved: 'Gespeichert',

  },
  ru: {
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать',
    copySource: 'Копировать код',
    engineUnavailable: 'Движок отрисовки недоступен, поэтому показан код.',
    figureLabel: 'Диаграмма',
    hideSource: 'Скрыть код',
    renderFailed: 'Эту диаграмму не удалось нарисовать, поэтому показан её код.',
    resetZoom: 'Сбросить масштаб',
    showSource: 'Показать код',
    syntaxError: 'Синтаксис диаграммы неверен, поэтому показан её код.',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    settingFailed: 'Не удалось сохранить изменение, переключатель остался прежним.',
    settingHint: 'Когда рисунок объясняет лучше абзаца, модель рисует его, а в тексте оставляет только то, чего на рисунке не видно.',
    settingLabel: 'Картинки вместо абзацев',
    settingSaved: 'Сохранено',

  },
  pt: {
    copied: 'Copiado',
    copyFailed: 'Não foi possível copiar',
    copySource: 'Copiar o código',
    engineUnavailable: 'O mecanismo de desenho não está disponível, então o código é exibido.',
    figureLabel: 'Diagrama',
    hideSource: 'Ocultar o código',
    renderFailed: 'Não foi possível desenhar este diagrama, então o código é exibido.',
    resetZoom: 'Redefinir o zoom',
    showSource: 'Mostrar o código',
    syntaxError: 'A sintaxe do diagrama não é válida, então o código é exibido.',
    zoomIn: 'Ampliar',
    zoomOut: 'Reduzir',
    settingFailed: 'Não foi possível guardar a alteração, o interruptor fica como estava.',
    settingHint: 'Quando uma imagem explica melhor que um parágrafo, o modelo desenha e deixa no texto só o que a imagem não mostra.',
    settingLabel: 'Preferir imagens ao texto',
    settingSaved: 'Guardado',

  },
}

const LANGUAGE_CODES = Object.keys(DICTIONARY)

/** The page's language when the interface ships it, otherwise English. */
function fallbackLanguage(doc) {
  let language = ''
  try {
    language = String((doc && doc.documentElement && doc.documentElement.lang) || '')
  } catch (error) {
    void error
  }
  if (!language && typeof navigator !== 'undefined' && navigator && navigator.language) {
    language = String(navigator.language)
  }
  const base = language.toLowerCase().split('-')[0]
  return LANGUAGE_CODES.indexOf(base) === -1 ? 'en' : base
}

/**
 * Used only when the host did not hand the layer a `t`, so a figure never shows
 * a bare key.
 */
function makeFallbackTranslate(doc) {
  // The language is read per call, not captured: the reader can switch the
  // interface language while a picture is on screen, and every label — the
  // image's name, the buttons, the engine's zoom controls — must follow.
  return function translate(key, values) {
    const table = DICTIONARY[fallbackLanguage(doc)] || DICTIONARY.en
    const template = Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : DICTIONARY.en[key] || key
    if (!values) return template
    return template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
    )
  }
}

/**
 * A host answer counts only when it is a real translation: a non-empty,
 * non-blank string that is not the key echoed back and that no longer carries an
 * unfilled placeholder. A host that has not registered this plugin's namespace
 * answers with the key itself, which is how a bare `copySource` once reached a
 * screen; a host that answers with blanks would otherwise leave a blank button.
 */
function isResolved(value, key) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  if (trimmed.indexOf(key) !== -1) return false
  return trimmed.indexOf('{{') === -1
}

/**
 * The key the host is asked for. The host keeps one dictionary for the whole
 * window, and its own copy buttons already own `copied` — asking for the bare
 * key made the reader see the host's wording ("复制成功") instead of this
 * plugin's ("已复制"), a collision a 2026-11-23 live check found. Asking under
 * the plugin's namespace keeps the two dictionaries apart: a host that does not
 * know `dyslexia.copied` echoes it back, `isResolved` rejects that, and the
 * bundled table answers.
 */
function hostKey(key) {
  return LOCALE_NAMESPACE + '.' + key
}

/**
 * A host `t` is used when it answers with a real translation and its signature
 * still matches; anything else — a changed signature, a throw, a blank answer,
 * the key echoed back, an unfilled placeholder — falls back to the strings
 * shipped here, so a picture is never lost over a label and no internal key is
 * ever shown.
 */
function translateFor(props, doc) {
  const fallback = makeFallbackTranslate(doc)
  let hostTranslate = null
  try {
    hostTranslate = typeof props.t === 'function' ? props.t : null
  } catch (error) {
    void error
    hostTranslate = null
  }
  if (!hostTranslate) return fallback
  return function translate(key, values) {
    try {
      const value = hostTranslate(hostKey(key), values)
      // The namespaced key contains the bare key, so an echo is still caught by
      // the "does the answer quote the key" rule in `isResolved`.
      if (isResolved(value, key)) return value
    } catch (error) {
      void error
    }
    return fallback(key, values)
  }
}


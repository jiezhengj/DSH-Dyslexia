/**
 * Visible strings of the figure, in every language the DeepSeek Harness interface
 * ships (zh, en, ja, es, fr, de, ru, pt). The host serves the dictionary this
 * module exports; the copy here is also the fallback used before the host locale
 * service answers, so a figure never shows a bare key.
 */

const LOCALE_NAMESPACE = 'dyslexia'

const DICTIONARY = {
  en: {
    copied: 'Copied',
    copySource: 'Copy source',
    figureLabel: 'Diagram: {{type}}',
    hideSource: 'Hide source',
    renderFailed: 'This diagram cannot be drawn, so its source is shown: {{reason}}',
    resetZoom: 'Reset zoom',
    showSource: 'Show source',
    syntaxError: 'the diagram syntax is not valid',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
  },
  zh: {
    copied: '已复制',
    copySource: '复制源码',
    figureLabel: '图：{{type}}',
    hideSource: '隐藏源码',
    renderFailed: '这张图无法绘制，已改为显示源码：{{reason}}',
    resetZoom: '重置缩放',
    showSource: '查看源码',
    syntaxError: '图的语法不合法',
    zoomIn: '放大',
    zoomOut: '缩小',
  },
  ja: {
    copied: 'コピーしました',
    copySource: 'ソースをコピー',
    figureLabel: '図：{{type}}',
    hideSource: 'ソースを隠す',
    renderFailed: 'この図は描画できないため、ソースを表示しています：{{reason}}',
    resetZoom: '倍率をリセット',
    showSource: 'ソースを表示',
    syntaxError: '図の構文が正しくありません',
    zoomIn: '拡大',
    zoomOut: '縮小',
  },
  es: {
    copied: 'Copiado',
    copySource: 'Copiar el código',
    figureLabel: 'Diagrama: {{type}}',
    hideSource: 'Ocultar el código',
    renderFailed: 'No se puede dibujar este diagrama, así que se muestra su código: {{reason}}',
    resetZoom: 'Restablecer el zoom',
    showSource: 'Mostrar el código',
    syntaxError: 'la sintaxis del diagrama no es válida',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
  },
  fr: {
    copied: 'Copié',
    copySource: 'Copier la source',
    figureLabel: 'Schéma : {{type}}',
    hideSource: 'Masquer la source',
    renderFailed: 'Impossible de dessiner ce schéma ; sa source est affichée : {{reason}}',
    resetZoom: 'Réinitialiser le zoom',
    showSource: 'Afficher la source',
    syntaxError: "la syntaxe du schéma n'est pas valide",
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
  },
  de: {
    copied: 'Kopiert',
    copySource: 'Quelle kopieren',
    figureLabel: 'Diagramm: {{type}}',
    hideSource: 'Quelle ausblenden',
    renderFailed: 'Dieses Diagramm lässt sich nicht zeichnen, daher wird seine Quelle angezeigt: {{reason}}',
    resetZoom: 'Zoom zurücksetzen',
    showSource: 'Quelle anzeigen',
    syntaxError: 'die Diagrammsyntax ist ungültig',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
  },
  ru: {
    copied: 'Скопировано',
    copySource: 'Копировать код',
    figureLabel: 'Диаграмма: {{type}}',
    hideSource: 'Скрыть код',
    renderFailed: 'Эту диаграмму не удалось нарисовать, поэтому показан её код: {{reason}}',
    resetZoom: 'Сбросить масштаб',
    showSource: 'Показать код',
    syntaxError: 'синтаксис диаграммы неверен',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
  },
  pt: {
    copied: 'Copiado',
    copySource: 'Copiar o código',
    figureLabel: 'Diagrama: {{type}}',
    hideSource: 'Ocultar o código',
    renderFailed: 'Não foi possível desenhar este diagrama, então o código é exibido: {{reason}}',
    resetZoom: 'Redefinir o zoom',
    showSource: 'Mostrar o código',
    syntaxError: 'a sintaxe do diagrama não é válida',
    zoomIn: 'Ampliar',
    zoomOut: 'Reduzir',
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
  const table = DICTIONARY[fallbackLanguage(doc)]
  return function translate(key, values) {
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
 * A host answer counts only when it is a real translation: a non-empty string
 * that is not the key echoed back and that no longer carries an unfilled
 * placeholder. A host that has not registered this plugin's namespace answers
 * with the key itself, which is how a bare `copySource` once reached a screen.
 */
function isResolved(value, key) {
  if (typeof value !== 'string' || value.length === 0) return false
  if (value.indexOf(key) !== -1) return false
  return value.indexOf('{{') === -1
}

/**
 * A host `t` is used when it answers with a real translation and its signature
 * still matches; anything else — a changed signature, a throw, an empty answer,
 * the key echoed back, an unfilled placeholder — falls back to the strings
 * shipped here, so a picture is never lost over a label and no internal key is
 * ever shown.
 */
function translateFor(props, doc) {
  const fallback = makeFallbackTranslate(doc)
  if (typeof props.t !== 'function') return fallback
  const hostTranslate = props.t
  return function translate(key, values) {
    try {
      const value = hostTranslate(key, values)
      if (isResolved(value, key)) return value
    } catch (error) {
      void error
    }
    return fallback(key, values)
  }
}

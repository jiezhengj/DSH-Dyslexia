# DSH Diagramas legibles

> Un diagrama en lugar de un muro de texto, dibujado donde estaba el texto.

## Qué hace

DeepSeek Harness ya dibuja Markdown en el chat. Este complemento añade una sola cosa: cuando una respuesta trae un bloque de código `mermaid`, el chat lo dibuja como diagrama ahí mismo, dentro del mensaje y en el hilo de la conversación. No se abre una ventana al lado ni se cambia a un panel lateral.

El bloque de código no se consume: sigue en el mensaje como texto, de modo que se puede copiar, reenviar y leer cuando este complemento ya no esté (la búsqueda no está verificada: ver G7).

## Por qué está construido así

- **El texto es el registro.** Cada dibujo se hace desde el bloque de código al mostrarlo, así que nada vive solo como píxeles. Desactiva el complemento y la conversación sigue completa.
- **Dentro del mensaje, no al lado.** Una ventana de vista previa corta el hilo de lectura: pierdes la línea en la que estabas.
- **La capacidad es del complemento, la preferencia es tuya.** El complemento solo dice que aquí aparecen dibujos. Que el asistente dibuje o no es tu decisión, y funciona sin editar ningún archivo de instrucciones.
- **No se da nada por supuesto de tu equipo.** El motor de dibujo viene incluido, el complemento funciona sin conexión y no exige nada al anfitrión.

## Qué obtienes

- Diagramas en su sitio para bloques `mermaid`: flujo, secuencia, clases, estados, ER, mapas mentales, líneas de tiempo y otros tipos que admite el motor; la comprobación estática muestrea estos siete y el arnés de navegador solo dibuja los dos primeros (los demás no están probados, véase G21).
- **Mostrar el código** y **Copiar el código** bajo cada dibujo: el texto detrás de la imagen queda a un clic.
- Mientras una respuesta se está generando, el bloque sigue siendo un bloque; el dibujo aparece cuando el bloque está completo.
- Un bloque que no se puede analizar muestra el código original y una línea con el motivo; nunca un marco vacío.
- Los colores y las fuentes siguen el tema de la interfaz, y el cambio de tema se recoge sin recargar.
- En un teléfono o una ventana estrecha el dibujo se recompone al ancho de la columna y el zoom ocurre dentro del dibujo, así que la página nunca se desplaza en horizontal.
- Ocho idiomas de interfaz, los mismos que incluye DeepSeek Harness.
- Nada se descarga en tiempo de ejecución: el motor está dentro del complemento.

## Datos y privacidad

- El complemento no hace ninguna petición de red en tiempo de ejecución; el motor de dibujo viene empaquetado dentro de `client.js`.
- No recoge nada ni envía nada a ningún sitio.
- Solo lee el texto del bloque de código `mermaid` que ya se muestra en tu página, y solo escribe el diagrama dentro de esa página.
- El botón **Copiar el código** usa el portapapeles de tu navegador; nada sale de la página.
- No se añade nada al historial de la sesión: el diagrama es una representación visual, no un objeto guardado.

## Cómo verificarlo

Requisitos: Node.js 22 o superior, y Chrome/Chromium para las comprobaciones en navegador.

- `node verify/check-bundle.mjs` — comprobaciones estáticas y de motor del paquete distribuido (manifiesto, ausencia de llamadas de red, ausencia de puerta de versión, el motor incluido, ocho idiomas de interfaz, diagramas de ejemplo de cada tipo admitido). Imprime una línea por comprobación y termina con código distinto de cero si falla.
- `node verify/run-harness.mjs` — ejecuta las comprobaciones en navegador con Chrome sin cabeza sobre `verify/harness/index.html` (dibujo, ocho idiomas, anfitriones hostiles, diagramas rotos, copia, columna estrecha de 360 px, colores del tema). Define `DSH_DYSLEXIA_CHROME` apuntando a un ejecutable de Chrome concreto si falla la detección automática.

Ambos comandos están en el repositorio, de modo que lo afirmado en este archivo puede volver a comprobarse en cualquier momento; son también los que ejecuta CI antes de publicar.

## Límites conocidos

- **Verificado aquí:** dibujo en el chat verificado en DSH escritorio `0.2.2-rc.5` (plugin `0.1.2`, la verificación en equipo real solo cubre la página de documentación en chino); respaldo de etiquetas verificado; respaldo al desinstalar y reinstalación verificados; ocho idiomas de interfaz verificados en el arnés sin interfaz; columna estrecha de 360 px verificada.
- **Probable, pero no demostrado en tu equipo:** otras versiones de DSH; otros navegadores basados en Chromium; las mismas comprobaciones en dispositivos móviles (la disposición está verificada en un área de visualización de 360 px en un navegador de escritorio, no en un teléfono físico); diagramas muy grandes (hay límites: 24 KiB de código fuente, 2 MiB de salida dibujada y 400 aristas; más allá de eso vuelve al bloque de código).
- **No realizado:** no se ha ensayado ninguna actualización de DSH (véase G1); los diagramas no se dibujan mientras un mensaje sigue transmitiéndose; solo se tratan bloques ` ```mermaid ` (no otros lenguajes de bloque de código).

## Instalación

Instala el paquete `@jiezhengj/dsh-dyslexia` en tu perfil de DeepSeek Harness (página de complementos); dibuja figuras en la conversación en cuanto se instala (verificado en una máquina real). La desinstalación se observó en una interfaz en marcha: la figura y sus botones desaparecen, el mensaje vuelve a mostrar su bloque de código original y el historial no necesita cambios. Activar y desactivar pasan por el mecanismo de complementos del anfitrión sin tocar ningún archivo de configuración, pero **esos dos pasos no se han observado por separado** (véase G20). Al cambiar de versión hay que reiniciar la aplicación para cargar el nuevo código de cliente. En npm: https://www.npmjs.com/package/@jiezhengj/dsh-dyslexia

## Ejemplo

Una respuesta contiene este bloque y el chat lo muestra como dibujo:

```mermaid
flowchart LR
  A[Text] --> B[Diagram]
```

## Desinstalación y compatibilidad

- Desinstalar mantiene intactas las conversaciones anteriores: los dibujos vuelven a ser los bloques de código de los que salieron, legibles.
- El complemento no declara puerta de versión ni paquete anfitrión obligatorio, así que ninguna comprobación de versión impide el arranque; una actualización real del anfitrión no se ha ensayado (véase G1). si el anfitrión cambia de forma, el complemento se aparta y se muestra el bloque de código original.

## Licencia

MIT. El motor de dibujo incluido, Pele 1.13.0, también es MIT; véase `THIRD-PARTY-NOTICES.md`.

Código fuente: https://github.com/jiezhengj/DSH-Dyslexia

Otros idiomas: [English](README.en.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

# DSH — Tenho dislexia

> Um diagrama no lugar de uma parede de texto — desenhado onde o texto estava.

## O que ele faz

O DeepSeek Harness já desenha Markdown no chat. Este plugin acrescenta uma coisa: quando uma resposta traz um bloco de código `mermaid`, o chat o desenha como diagrama ali mesmo, dentro da mensagem e no fluxo da conversa. Nenhuma janela abre ao lado, nada muda para um painel lateral.

O bloco de código nunca é consumido. Continua sendo o texto da mensagem: pode ser copiado, reenviado e lido depois que este plugin for removido (a pesquisa não está verificada: ver os E-GAPS da funcionalidade 001, G7).

## Por que foi feito assim

- **O texto é o registro.** Cada desenho é refeito a partir do bloco de código na hora de mostrar, então nada vive só como pixels. Desligue o plugin e a conversa continua completa.
- **Dentro da mensagem, não ao lado.** Uma janela de prévia quebra o fio da leitura: perde-se a linha em que se estava.
- **O plugin pede um desenho quando um desenho é mais fácil.** Quando um diagrama torna uma resposta mais fácil de acompanhar do que um parágrafo, o plugin agora diz isso ao assistente e deixa texto apenas para o que a imagem não consegue mostrar. Em Configurações → Geral há um interruptor; desligue-o e o plugin volta a apenas desenhar.
- **Nada é presumido sobre a sua máquina.** O motor de desenho vem incluído, o plugin funciona sem rede e não exige nada do anfitrião.

## O que você recebe

- Diagramas no lugar para blocos `mermaid`: fluxo, sequência, classes, estados, ER, mapa mental, linha do tempo e outros tipos que o motor suporta; a verificação estática amostra estes sete e o harness de navegador desenha apenas os dois primeiros (os demais não foram testados, ver os E-GAPS da funcionalidade 001, G21).
- **Mostrar o código** e **Copiar o código** sob cada desenho: o texto por trás da imagem a um clique.
- Enquanto uma resposta é gerada, o bloco continua bloco; o desenho aparece quando o bloco está completo.
- Um bloco que não pode ser interpretado mostra o código original e uma linha com o motivo — nunca um quadro vazio.
- Cores e fontes seguem o tema da interface, e a troca de tema é captada sem recarregar.
- No celular ou numa janela estreita o desenho se reorganiza na largura da coluna e o zoom acontece dentro do desenho, então a página nunca rola na horizontal.
- Oito idiomas de interface, os mesmos que o DeepSeek Harness traz.
- Nada é buscado em tempo de execução: o motor está dentro do plugin.

## Dados e privacidade

- O plugin não faz nenhuma requisição de rede em tempo de execução; o motor de desenho vem empacotado dentro de `client.js`.
- Ele não coleta nada e não envia nada para lugar nenhum.
- Ele lê apenas o texto do bloco de código `mermaid` que já está exibido na sua página, e escreve apenas o diagrama nessa página.
- O botão **Copiar o código** usa a área de transferência do seu navegador; nada sai da página.
- Nada é adicionado ao histórico da sua sessão: o diagrama é uma renderização, não um objeto armazenado (o lado da máquina real não está verificado: ver os E-GAPS da funcionalidade 001, G12).

## Como verificar

Requisitos: Node.js 22 ou mais recente, e Chrome/Chromium para as verificações no navegador.

- `node verify/check-bundle.mjs` — verificações estáticas e do motor sobre o pacote entregue (manifesto, ausência de chamadas de rede, ausência de trava de versão, o motor empacotado, oito idiomas de interface, sete diagramas de exemplo). Imprime uma linha por verificação e sai com código diferente de zero em caso de falha.
- `node verify/run-harness.mjs` — executa as verificações no navegador em Chrome headless contra `verify/harness/index.html` (desenho, oito idiomas, anfitriões hostis, diagramas quebrados, cópia, coluna estreita de 360 px, cores do tema). Defina `DSH_DYSLEXIA_CHROME` apontando para um executável específico do Chrome se a detecção automática falhar.

Os dois comandos estão no repositório, portanto o que este arquivo afirma pode ser conferido novamente a qualquer momento; são também os comandos que a CI executa antes de publicar.

## Limites conhecidos

Os identificadores `G…` remetem aos E-GAPS da funcionalidade 001, em `specs/001-mermaid-fence-render/evidence/verification.md`.

- **Verificado aqui:** as verificações em máquina real que continuam transferíveis são as do plugin `0.1.31` e `0.1.32`; as linhas antigas de `0.1.2` já não se transferem depois das mudanças de renderização de `0.1.3`–`0.1.31`. As evidências desta versão ficam no nível de fixture. Não testados: o interruptor numa janela real, o layout estreito em oito idiomas e qualquer comparação de pixels com as linhas do anfitrião. As páginas do plugin nos outros idiomas ainda não foram vistas (ver os E-GAPS da funcionalidade 001, G13).
- **Provável, mas não provado na sua máquina:** outras versões do DSH; outros navegadores baseados em Chromium; as mesmas verificações em dispositivos móveis (o layout foi verificado em uma viewport de 360 px em um navegador de desktop, não em um celular físico); diagramas muito grandes (há limites: 24 KiB de código-fonte, 2 MiB de saída desenhada, 400 arestas; acima disso ele volta ao bloco de código).
- **Não feito:** nenhuma atualização do DSH foi ensaiada (ver os E-GAPS da funcionalidade 001, G1); os diagramas não são desenhados enquanto a mensagem ainda está sendo transmitida; apenas blocos ` ```mermaid ` são tratados (não outras linguagens de bloco de código).

## Instalação

Instale o pacote `@jiezhengj/dsh-dyslexia` no seu perfil do DeepSeek Harness (página de plugins); ele desenha figuras na conversa; o renderizador foi verificado ao vivo nos plugins `0.1.31` e `0.1.32`, e o interruptor ainda não foi observado numa janela real (ver os E-GAPS da funcionalidade 002, G1/G6). A desinstalação passa a valer depois de reiniciar a aplicação: uma janela aberta continua a mostrar a figura e os dois botões já carregados, e o histórico não precisa de alterações (ver os E-GAPS da funcionalidade 001, G24①). Ativar e desativar passam pelo mecanismo de plugins do anfitrião sem tocar em nenhum ficheiro de configuração, mas **esses dois passos não foram observados separadamente** (ver os E-GAPS da funcionalidade 001, G20). Trocar de versão exige reiniciar a aplicação para carregar o novo código de cliente. No npm: https://www.npmjs.com/package/@jiezhengj/dsh-dyslexia

## Exemplo

Uma resposta contém este bloco e o chat o mostra como desenho:

```mermaid
flowchart LR
  A[Text] --> B[Diagram]
```

## Desinstalação e compatibilidade

- Desinstalar não altera nenhuma conversa anterior, mas passa a valer depois de reiniciar a aplicação: até lá uma janela aberta continua a mostrar as figuras e os dois botões já carregados; depois do reinício, os desenhos antigos voltam a ser os blocos de código de onde vieram, legíveis.
- O plugin não declara limite de versão nem pacote de anfitrião obrigatório, então nenhuma verificação de versão impede a inicialização; uma atualização real do anfitrião não foi ensaiada (ver os E-GAPS da funcionalidade 001, G1). Se a forma do anfitrião mudar, o plugin se retira e o bloco de código original é mostrado.

## Licença

MIT. O motor de desenho incluído, Pele 1.13.0, também é MIT; veja `THIRD-PARTY-NOTICES.md`.

Código-fonte: https://github.com/jiezhengj/DSH-Dyslexia

Outros idiomas: [English](README.en.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

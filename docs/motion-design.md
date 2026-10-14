# Aviso de mana · direção e contagem

A alteração financeira é o protagonista: **+2.000** ou **−2.000**. A reserva anterior e o saldo confirmado permanecem separados abaixo, sem depender de esperar a contagem. O aviso dura 4 segundos por padrão ou 4,6 segundos no perfil imersivo.

## Referências consultadas

| Referência | Aplicação original no módulo |
| --- | --- |
| [Michael Rigley / Cyberpunk 2077](https://www.michaelrigley.com/work/cyberpunk-2077) e [Behance](https://www.behance.net/gallery/110671027/CYBERPUNK-2077-UI-CONCEPT-LOOK-DEV) | Tipografia dominante, recortes e sinalização fina em módulos. Foram inspecionadas imagens do portfólio e do projeto; a página principal do Behance também apresentou 403 em parte das tentativas. |
| [Cyberpunk 2077 UI / Vladimír Vilimovský](https://www.behance.net/gallery/118663901/Cyberpunk-2077User-Interface-%28Part-1%29) | Contraste entre superfície escura, branco e cor de sinal; imagens do projeto consultadas. |
| [Oblivion GFX / GMUNK](https://gmunk.com/Oblivion-GFX) | Referência inicial de consistência visual. Na 2.4.1, diagramas e instrumentação foram removidos por orientação do usuário. |
| [Miss Anthropocene / GMUNK](https://gmunk.com/Grimes-Miss-Anthropocene) | Densidade, grade e textura de monitor. A referência descreve o processo; não se presume ter reproduzido os vídeos incorporados. |
| [Blade Runner 2049 / Territory Studio](https://territorystudio.com/project/blade-runner-2049/) | Tecnologia com materialidade e textura, combinada com legibilidade funcional. A influência aqui está nas linhas de monitor e na apresentação de equipamento. |
| [Moedula / Jean Claeys](https://www.behance.net/gallery/76514213/M-O-E-D-U-L-A-control-interface) | Referência de console retrofuturista, organização de comandos e motion. O texto do projeto foi consultado; os vídeos incorporados não foram tratados como assistidos. |
| [HUD Design / Sci-fi Elements Animation](https://www.behance.net/gallery/120956023/HUD-Design-Sci-fi-Elements-animation) | Referência adicional identificada pelos quadros indexados do projeto. A página completa apresentou acesso restrito. |

Os desenhos e elementos implementados são originais em SVG/CSS. Nenhuma imagem, GIF ou sequência desses projetos é distribuída dentro do módulo. Não há novas fontes externas ou biblioteca de motion.

## Sequência

- 0–310 ms: abertura do corpo recortado e dos sinais de identificação.
- 160–650 ms: entrada do título, leitura financeira, cantos e identificação.
- 380–2.280 ms: contagem linear rápida da alteração inteira, com números completos.
- 2.280–3.720 ms: valor final estável, selo desenhado e reflexo breve na borda inferior.
- Últimos 280 ms: fechamento e remoção de todos os recursos.

O perfil imersivo conserva a contagem e prolonga a leitura final em 600 ms. O modo de movimento reduzido mostra os valores finais, sem criar worker ou executar o motion.

## Contagem

O caminho principal usa **OffscreenCanvas em Worker**, com desenho e relógio próprios. Os números não são recortados em rolos e não dependem do requestAnimationFrame da janela do Foundry. A quantidade de quadros realmente desenhados é medida nos testes. Um bloqueio controlado da interface de 650 ms verifica que a contagem continua em outra tarefa.

Se Worker/OffscreenCanvas não estiver disponível, o navegador anima uma faixa com 121 quadros de números completos por transform. Se essa animação também estiver indisponível, existe um contador textual limitado ao período do aviso. Nenhum caminho altera o saldo: o recibo financeiro já foi persistido antes da apresentação.

[OffscreenCanvas / MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) · [requestAnimationFrame em Worker / MDN](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/requestAnimationFrame)

O desempenho ainda depende do navegador, hardware e carga gráfica. Os testes não equivalem a uma sessão licenciada do Foundry em todos os computadores. A demonstração MP4 registra o navegador executando o componente real, sem pós-animação dos números.

## Refinamento 2.4.1 · textura e microanimação

A referência enviada pelo usuário exclui radar, instrumentos, gráficos e qualquer estética analítica. Foram removidos o emblema hexagonal, a onda, os segmentos da contagem, as barras de conexão/duração e o ornamento circular do cartão. A área de leitura agora ocupa uma coluna; valor e saldo conservam sua hierarquia.

Fontes primárias adicionais consultadas em 14/10/2026:

| Fonte | Decisão aplicada |
| --- | --- |
| [LottieFiles — jLottie e microanimações](https://lottiefiles.com/blog/working-with-lottie-animations/jlottie-the-ultimate-lottie-player-for-micro-animations) | Considerar tanto tamanho quanto custo de reprodução. Os detalhes pequenos foram implementados nativamente, sem instalar um player Lottie. |
| [School of Motion — UX Animation Essentials](https://schoolofmotion.com/courses/ux-animation-essentials) | Motion com função e tempos documentados; manter o valor como foco e usar a confirmação como fechamento. |
| [School of Motion — Anticipation](https://schoolofmotion.com/blog/anticipation-principle-quick-tip) | Identificação e sinal entram antes da leitura numérica. |
| [School of Motion — Follow Through](https://schoolofmotion.com/blog/follow-through-tutorial) | Entrada curta com acomodação de 2px na etiqueta e confirmação em duas pequenas etapas. |
| [Motion — Performance](https://motion.dev/docs/performance) | Transform e opacidade nos efeitos; superfícies pequenas, animações finitas, sem filtros ou ruído recalculado a cada quadro. |

Aplicação própria desses princípios, sem copiar animações ou afirmar um ranking de popularidade. A pesquisa de Lottie serve de referência de linguagem; o módulo não depende de Lottie, Motion, Rive ou serviços externos.

A textura é um SVG original de 48×48px embutido no CSS, composto de poucos pontos irregulares e linhas discretas estáticas. Não há vídeos de fundo, feTurbulence ou blur. A hachura fica restrita à lateral. Os reflexos passam apenas nas bordas superior (350–1.450ms) e inferior (2.280–3.080ms), sem atravessar a contagem. Cantos entram a 270/340ms; o selo aparece a 2.280ms e seus dois traços concluem a 2.640ms. Nenhum detalhe fica em loop.

O teste visual adicional impede o retorno de radar/gráficos, limita os efeitos decorativos e verifica que só animam transform/opacidade. A janela de 320px é verificada com o maior valor permitido. Movimento reduzido mantém a textura estática e exibe os valores finais sem efeitos.

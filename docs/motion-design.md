# Aviso de mana · direção e contagem

A alteração financeira é o protagonista: **+2.000** ou **−2.000**. A reserva anterior e o saldo confirmado permanecem separados abaixo, sem depender de esperar a contagem. O aviso dura 4 segundos por padrão ou 4,6 segundos no perfil imersivo.

## Referências consultadas

| Referência | Aplicação original no módulo |
| --- | --- |
| [Michael Rigley / Cyberpunk 2077](https://www.michaelrigley.com/work/cyberpunk-2077) e [Behance](https://www.behance.net/gallery/110671027/CYBERPUNK-2077-UI-CONCEPT-LOOK-DEV) | Tipografia dominante, recortes e sinalização fina em módulos. Foram inspecionadas imagens do portfólio e do projeto; a página principal do Behance também apresentou 403 em parte das tentativas. |
| [Cyberpunk 2077 UI / Vladimír Vilimovský](https://www.behance.net/gallery/118663901/Cyberpunk-2077User-Interface-%28Part-1%29) | Contraste entre superfície escura, branco e cor de sinal; imagens do projeto consultadas. |
| [Oblivion GFX / GMUNK](https://gmunk.com/Oblivion-GFX) | Instrumentação com uma linguagem consistente. Na criação: diagrama da reserva à esquerda e leitura financeira à direita. |
| [Miss Anthropocene / GMUNK](https://gmunk.com/Grimes-Miss-Anthropocene) | Densidade, grade e textura de monitor. A referência descreve o processo; não se presume ter reproduzido os vídeos incorporados. |
| [Blade Runner 2049 / Territory Studio](https://territorystudio.com/project/blade-runner-2049/) | Tecnologia com materialidade e textura, combinada com legibilidade funcional. A influência aqui está nas linhas de monitor e na apresentação de equipamento. |
| [Moedula / Jean Claeys](https://www.behance.net/gallery/76514213/M-O-E-D-U-L-A-control-interface) | Referência de console retrofuturista, organização de comandos e motion. O texto do projeto foi consultado; os vídeos incorporados não foram tratados como assistidos. |
| [HUD Design / Sci-fi Elements Animation](https://www.behance.net/gallery/120956023/HUD-Design-Sci-fi-Elements-animation) | Referência adicional identificada pelos quadros indexados do projeto. A página completa apresentou acesso restrito. |

Os desenhos e elementos implementados são originais em SVG/CSS. Nenhuma imagem, GIF ou sequência desses projetos é distribuída dentro do módulo. Não há novas fontes externas ou biblioteca de motion.

## Sequência

- 0–310 ms: abertura do corpo recortado e dos sinais de identificação.
- 160–650 ms: entrada do título, instrumento, leitura financeira e saldo.
- 380–2.280 ms: contagem linear rápida da alteração inteira, com números completos.
- 2.280–3.720 ms: valor final estável, confirmação e término dos sinais auxiliares.
- Últimos 280 ms: fechamento e remoção de todos os recursos.

O perfil imersivo conserva a contagem e prolonga a leitura final em 600 ms. O modo de movimento reduzido mostra os valores finais, sem criar worker ou executar o motion.

## Contagem

O caminho principal usa **OffscreenCanvas em Worker**, com desenho e relógio próprios. Os números não são recortados em rolos e não dependem do requestAnimationFrame da janela do Foundry. A quantidade de quadros realmente desenhados é medida nos testes. Um bloqueio controlado da interface de 650 ms verifica que a contagem continua em outra tarefa.

Se Worker/OffscreenCanvas não estiver disponível, o navegador anima uma faixa com 121 quadros de números completos por transform. Se essa animação também estiver indisponível, existe um contador textual limitado ao período do aviso. Nenhum caminho altera o saldo: o recibo financeiro já foi persistido antes da apresentação.

[OffscreenCanvas / MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) · [requestAnimationFrame em Worker / MDN](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/requestAnimationFrame)

O desempenho ainda depende do navegador, hardware e carga gráfica. Os testes não equivalem a uma sessão licenciada do Foundry em todos os computadores. A demonstração MP4 registra o navegador executando o componente real, sem pós-animação dos números.

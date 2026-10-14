# Direção visual · Banco de Mana

Brief: banco do esquadrão em Foundry 13. Uma reserva compartilhada, jogador gasta, mestre adiciona/remove, aviso de movimentação para todos e recibo no chat. SciFi/Cyberpunk/Lancer com saldo imediatamente visível e pouca navegação.

Pesquisa em Behance e portfólios dos próprios criadores. Algumas páginas completas do Behance responderam com acesso restrito; nesses casos foram usados os quadros indexados e os portfólios públicos. Não se presume ter assistido aos vídeos incorporados indisponíveis.

| Referência | Aspecto observado / aplicação original |
| --- | --- |
| [Michael Rigley · Cyberpunk 2077 / Behance](https://www.behance.net/gallery/110671027/CYBERPUNK-2077-UI-CONCEPT-LOOK-DEV), [portfólio do autor](https://www.michaelrigley.com/work/cyberpunk-2077) | Grade técnica, hierarquia tipográfica, módulos e geometrias angulares. Na implementação: reserva dominante, metadados discretos e acento âmbar. |
| [Vladimír Vilimovský · Cyberpunk 2077 User Interface / Behance](https://www.behance.net/gallery/118663901/Cyberpunk-2077User-Interface-%28Part-1%29) | Referência adicional de organização visual e linguagem de interface cyberpunk, consultada por imagens indexadas. |
| [Rushes Creative · Altered Carbon UI / Behance](https://www.behance.net/gallery/57737495/Altered-Carbon-UI-Design) | Painéis de informação organizados em colunas, linhas finas e leitura técnica. Na implementação: separação entre reserva, operação e configuração do mestre. |
| [GMUNK · Oblivion GFX / Behance](https://www.behance.net/gallery/49675041/OBLIVION-GFX) | Acentos de sinal em estrutura de controle operacional. Na implementação: referências TX/revisão e sinais direcionais na movimentação. |
| [I Am Mother · UI Screen Graphics / Behance](https://www.behance.net/gallery/87411255/I-Am-Mother-UI-Screen-Graphics) | Composição escura com elemento radial e dados essenciais em primeiro plano. Na implementação: diagrama vetorial próprio e reserva numericamente dominante. |
| [Guillermo Martínez Calero · HUD Design / Behance](https://www.behance.net/gallery/120956023/HUD-Design-Sci-fi-Elements-animation) | Referência de linguagem HUD animada. Na implementação: entrada em camadas, varredura e tempos distintos para informação principal e sinalização. |
| [Adriaan Scheepers · Lancer: Tactics](https://www.adriaanscheepers.com/lancer-tactics/) | Interface focada no contexto para reduzir a carga de informação. Na implementação: duas abas e nenhuma seleção de conta. |
| [André de Oliveira · LANCER Mock UI Exercise](https://www.andredeoliveirart.com/projects/18OXke) | Painéis de cockpit e construção holográfica em camadas. Na implementação: diagrama hexagonal, trilhos e abertura mecânica da notificação. |

## Decisões

- Grafite, marfim e âmbar: terminal de operações, com detalhes em verde/ciano discreto. A cor do aviso pode ser livremente escolhida sem alterar o contraste dos controles.
- Reserva e formulário lado a lado em janela larga; empilhados em janela estreita. Descrição opcional sempre acessível.
- Duas abas: Reserva e Movimentações. Sem transferências, empréstimos ou contas individuais.
- Movimento funcional: entrada progressiva ao abrir/trocar aba, resposta dos botões e atualização visual do saldo. A sincronização não apaga o formulário.
- Aviso de 6,8s: abertura (0–1,2s), contagem e confirmação (1–2,8s), selo (2,85–3,5s), leitura e fechamento (6,25–6,8s). Perfil tático mantém a composição em 4,6s.
- Efeitos finitos, limite de partículas e limpeza de frames/WAAPI/timers. Movimento reduzido conserva os dados finais.
- A trilha mostra estados já confirmados; a animação não representa uma espera real de autorização.

# Histórico

## 2.4.1

- Remove o instrumento hexagonal, ondas, barras segmentadas e barra de duração do aviso; remove também a ornamentação circular do cartão do banco.
- Layout de leitura único, sem radares ou gráficos. Preserva os números grandes, cores do mestre, contagem e duração de 4s.
- Textura vetorial estática mínima, acabamento hachurado na borda e microanimações finitas: cantos, identificação, reflexos na moldura e selo desenhado ao finalizar.
- Efeitos de acabamento usam somente transform e opacidade; sem filtros animados, bibliotecas ou arquivos externos.
- 56 testes Node e 54 cenários Chromium, incluindo ausência de instrumentos/gráficos e valor máximo em janela de 320px.

## 2.4.0

- Novo HUD de transferência: alteração de mana dominante, recortes, instrumento da reserva, textura, sinais, waveform e confirmação em etapas.
- Novo acento padrão vermelho tático; preserva a escolha de cor do mestre.
- Contagem da própria alteração com números completos de 0 a +/−valor; reserva anterior e saldo confirmado ficam separados.
- OffscreenCanvas em Worker, com renderização independente da interface. Fallback com 121 quadros inteiros por transform e alternativa textual.
- Contagem linear de 1,9s dentro do aviso padrão de 4s; mantém opção imersiva de 4,6s e movimento reduzido.
- Demonstração MP4 gravada no navegador; referências e decisões documentadas.
- 56 testes Node e 52 cenários Chromium, incluindo interface bloqueada por 650ms, ausência de RAF, Worker indisponível, valores máximos e limpeza dos recursos.

## 2.3.1

- Corrige eco de solicitações nas flags completas: confirmação deixa de recolocar pedidos recebidos na fila.
- Pacotes JSON como valor único evitam merges e atualizações parciais no transporte; mantém autenticação pelo usuário do evento.
- Ícone SVG próprio do banco substitui a máscara genérica do HoloSuite, com CSS específico apenas deste app e arquivo incluído no ZIP.
- Aviso novo de 4s por padrão, com opção imersiva de 4,6s. Saldo em destaque, alteração fixa, fluxo direcional, circuito e confirmação.
- Contadores usam tempo próprio, fallback temporal e valor final exato, inclusive sem frames ou com falha em um efeito.
- Contador do cartão conserva o início da transição entre renderizações; formatação numérica reutiliza um único formatter.
- 54 testes Node e 45 cenários Chromium. Inclui 20 créditos consecutivos, eco de flags, ícone com máscara/cascata e falhas de animação.

## 2.3.0

- Integração de compras com Máquina de Lanches 0.5.0 no saldo compartilhado.
- Reserva persistente, plano de entrega imutável e recuperação idempotente após falhas.
- Preço autoritativo, validação de saldo/estoque e bloqueio de edições enquanto há reserva.
- Um débito, aviso e mensagem por compra paga; entrega gratuita sem mensagem financeira.
- Mantém instalação sem dependências obrigatórias, app do celular e limpeza do histórico.
- 47 testes Node e 33 cenários Chromium, além da integração no repositório da máquina.

## 2.2.0

- Banco de Mana registrado como app do celular HoloSuite para mestre e jogadores.
- Remove o botão da barra de configurações e o menu de abertura do Foundry.
- Manifesto continua sem dependências obrigatórias.
- Limpar histórico na aba Movimentações, com confirmação exclusiva do mestre; saldo e chat são mantidos.
- Uma mensagem pública por operação, somente com alteração e saldos antes/depois, usando o nome Banco de Mana.
- Solicitações e confirmações deixam de criar mensagens no chat e usam documentos User nativos.
- Mantém autenticação pelo usuário do evento, fila, revisão global, recuperação de chat e proteção contra replay.
- 36 testes Node e 33 cenários Chromium com três clientes independentes.

## 2.1.0

- Nome Banco de Mana em todas as telas, avisos, chat e manifesto.
- Remove todas as dependências e a integração obrigatória com HoloSuite.
- Acesso nativo pelo botão Banco de Mana na aba Configurações e pelo menu Abrir banco.
- Cartão de saldo maior, ocupando a largura principal, com chip e identificação de conta compartilhada.
- Controles de movimentação abaixo do cartão.
- Testes de abertura com somente o banco instalado, tanto para mestre quanto para jogadores.

## 2.0.0

- Reserva única de mana compartilhada; todos os pilotos gastam do mesmo saldo.
- Saldo inicial zero, sem importação ou migração de dinheiro.
- Redesenho completo Banco de Mana: terminal tático grafite/âmbar, diagrama vetorial e navegação em duas abas.
- Histórico filtrável e paginado, valores rápidos, descrição e responsável por operação.
- Motion de entrada, respostas de interação e contagem do saldo na janela.
- Nova sequência de aviso com recorte, varredura, sinais direcionais, confirmação em etapas e selo.
- Cor livre por operação e perfis Cinemática / Tática para o mestre.
- Revisão global impede gastos simultâneos de sobrescrever a reserva.
- 30 testes Node e 28 cenários Chromium, incluindo três clientes independentes.

## 1.0.3

- Corrige o requisito mínimo do HoloSuite Core para 1.0.12 no manifesto.
- A validação do pacote confere o contrato de dependência para impedir mudanças acidentais.

## 1.0.2

- A cor da notificação é independente da paleta do banco; controles continuam legíveis com preto e cores escuras.
- Tipografia dos valores do aviso preserva contraste com todas as cores personalizadas.
- 31 testes Node e 27 cenários Chromium.

## 1.0.1

- Isola falhas de janela/animação para que não alterem a confirmação do saldo.
- Reconhece movimentações persistidas mesmo quando a resposta da gravação falha.
- Confirmações consultam o recibo persistido antes de apresentar erro de transporte.
- 31 testes Node e 26 cenários Chromium.

## 1.0.0

- Banco Mana registrado como aplicativo do HoloSuite para Foundry 13.
- Saldo por jogador, independente de token, ator ou cena.
- Jogador pode gastar a própria mana; mestre pode adicionar ou remover de qualquer jogador.
- Painel bancário cyberpunk com contas individuais e saldo imediato.
- Seletor de cor por movimentação e teste local da notificação.
- Avisos centrais para todos, com contagem, partículas, varredura, anéis e fechamento.
- Recibo público no chat e recuperação de registros pendentes.
- Autoridade de mestre, fila, revisões, idempotência e validação do remetente.
- Preferência de movimento reduzido e limpeza de todos os efeitos ao terminar.
- 29 testes Node e 27 cenários Chromium, incluindo três clientes independentes.

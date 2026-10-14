# Histórico

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

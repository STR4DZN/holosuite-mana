# Histórico

## 2.0.0

- Reserva única de mana compartilhada; todos os pilotos gastam do mesmo saldo.
- Saldo inicial zero, sem importação ou migração de dinheiro.
- Redesenho completo Hollow Switch: terminal tático grafite/âmbar, diagrama vetorial e navegação em duas abas.
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

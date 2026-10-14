Banco de Mana 2.2.0 · Foundry VTT 13.

- App Banco de Mana no celular HoloSuite, disponível para mestre e jogadores.
- Remove botão e menu de abertura das configurações do Foundry.
- Mantém manifesto sem dependências obrigatórias.
- Movimentações → Limpar histórico: somente mestre, com confirmação. Saldo e mensagens do chat são mantidos.
- Exatamente uma mensagem pública por pagamento: alteração de mana e saldo antes/depois. Sem nome de quem alterou nem descrição, com alias Banco de Mana.
- Solicitação e confirmação passam a usar documentos User nativos e deixam de criar mensagens de chat.
- Mantém fila, revisão global, autenticação de remetente, proteção contra duplicação/replay, animações e recuperação de chat.
- 36 testes Node e 33 cenários Chromium, incluindo três clientes independentes.

Atualize o módulo e recarregue com F5 em todos os clientes. Com HoloSuite ativo, abra o celular e clique em Banco de Mana.

Banco-Mana-Preview.html demonstra a interface com dados fictícios.

Validação em contratos simulados e Chromium. Sessão licenciada real ainda precisa ser validada.

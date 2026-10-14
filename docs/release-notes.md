Banco de Mana 2.3.0 · Foundry VTT 13.

- Compras integradas à Máquina de Lanches 0.5.0 usando o único saldo compartilhado.
- Validação autoritativa de preços, estoque, saldo, usuário, revisão e limites financeiros.
- Reserva persistente e recuperação da entrega pelo mesmo ID, preservando o resultado do sorteio.
- Falhas de conexão e respostas perdidas não duplicam débito nem produto. Validação definitiva antes da entrega restitui a reserva.
- Uma mensagem pública e um aviso financeiro por compra paga. Produtos gratuitos não geram débito.
- Mantém app no celular HoloSuite, limpeza exclusiva do mestre e manifesto sem dependências obrigatórias.
- 47 testes Node e 33 cenários Chromium do banco; integração adicional testada com três clientes na Máquina de Lanches.

Atualize também a Máquina de Lanches para 0.5.0 e recarregue todos os clientes com F5. Mantenha ambos os módulos ativos para recuperar compras pendentes.

Banco-Mana-Preview.html demonstra a interface com dados fictícios. Validação em contratos simulados e Chromium; sessão licenciada real ainda precisa ser validada.

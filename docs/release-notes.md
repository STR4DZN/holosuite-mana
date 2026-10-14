Banco Mana 1.0.2 · Foundry VTT 13 / HoloSuite.

- Aplicativo **Banco Mana**, com ícone de banco, dentro do HoloSuite.
- Saldo de mana exibido imediatamente; conta individual por jogador.
- Jogador: gastar a própria mana. Mestre: adicionar e remover mana de qualquer jogador.
- Interface bancária cyberpunk, com cor personalizada por movimentação.
- Avisos centrais para todos: abertura do painel, anéis, partículas, varredura, contagem dos números e fechamento.
- Registro público no chat, saldo persistente e recuperação de chat indisponível.
- Testar aviso é local e não movimenta dinheiro.
- 31 testes Node e 27 cenários de navegador, incluindo três clientes independentes.

**Instalação:** cole a URL do asset `module.json` no campo URL do Manifesto do Foundry. Ative HoloSuite Core 1.0.22+ e HoloSuite · Banco Mana.

O saldo inicial é zero e pertence ao jogador, sem depender de personagem ou token. Um mestre ativo é necessário para movimentar mana. A compra automática na Máquina de Lanches não está ligada nesta versão.

`Banco-Mana-Preview.html` permite experimentar a interface e as animações com dados locais de exemplo.

A validação usa contratos simulados e Chromium; instalação em uma sessão real do Foundry ainda precisa ser validada.

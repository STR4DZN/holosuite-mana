# Banco Mana · HoloSuite

Aplicativo bancário cyberpunk para **Foundry VTT 13**, integrado ao HoloSuite Core 1.0.12 ou mais recente. Cada jogador tem uma conta de mana, independente de personagem, ator, token ou cena. Contas novas começam em **0 mana**.

## Instalar

Em **Configuração → Módulos → Instalar módulo → URL do Manifesto**, cole:

```text
https://github.com/STR4DZN/holosuite-mana/releases/latest/download/module.json
```

Ative **HoloSuite Core** e **HoloSuite · Banco Mana** no mundo. Abra o HoloSuite e clique em **Banco Mana**, com ícone de banco. O módulo não adiciona botões aos controles de Tokens ou do mapa.

## Uso

**Jogador:** o saldo aparece ao abrir. Informe uma quantidade inteira positiva e clique em **Confirmar gasto**. A descrição é opcional. Não é possível adicionar mana, remover de outra conta ou gastar além do saldo.

**Mestre:** selecione um jogador, escolha **Adicionar mana** ou **Remover mana**, informe o valor e confirme. As cores prontas e o seletor personalizado determinam a cor do aviso daquela operação. **Testar aviso** mostra a animação somente para o mestre, sem alterar saldo e sem publicar no chat. A última cor fica salva neste navegador.

Cada movimentação confirmada mostra, para todos os clientes conectados, o nome do jogador, ganho/perda e saldo final em um painel central animado. Há abertura por recorte, linhas de varredura, partículas, anéis, contagem progressiva do valor e do saldo, barra de duração e fechamento. Avisos simultâneos entram em fila. O chat recebe um recibo público com jogador, valor, saldo final e descrição. A solicitação e a confirmação também usam uma mensagem privada entre solicitante e mestre responsável, como transporte nativo.

A contagem é visual: o saldo real é gravado primeiro. Os efeitos terminam e são removidos; não existem animações permanentes ou fontes remotas. A preferência individual **Banco Mana: reduzir movimentos** e a preferência do sistema operacional são respeitadas. É possível fechar o aviso com o X sem alterar a movimentação.

É necessário um mestre ativo para movimentar dinheiro. O saldo já salvo continua disponível para consulta sem mestre. O mestre pode movimentar contas de jogadores offline. Os avisos aparecem para quem está conectado no momento da movimentação; o chat mantém o registro. Conectar novamente ou reabrir a janela não reproduz avisos antigos.

## Dados e consistência

- Mana inteira, sem valores negativos ou fracionários. Limite de 999.999.999.999 mana por conta.
- Saldos e recibos ficam juntos na configuração de mundo `holosuite-mana.ledger`, protegida pelo Foundry para gravação exclusiva de mestres. A interface dos jogadores mostra somente a própria conta. Os dados do banco não são secretos: os avisos e os recibos são públicos.
- O remetente é o usuário atribuído pelo Foundry ao evento de criação do documento de solicitação; campos enviados pelo cliente não dão permissão de mestre.
- Uma autoridade de mestre e uma fila serializam as operações. Revisões rejeitam operações com saldo obsoleto. Solicitações duplicadas não movimentam o saldo novamente.
- Falha ao salvar não produz ganho/perda. Falha posterior no chat conserva o saldo e o recibo pendente; o mestre responsável tenta publicar novamente com um ID fixo para evitar duplicatas. Se a confirmação demorar, confira o saldo e o chat antes de repetir o pedido.
- O extrato interno conserva cerca de 300 registros recentes e todos os recibos de chat ainda pendentes. O chat mantém o histórico persistente do mundo. O banco não oferece empréstimos, transferências, juros ou funções bancárias reais.
- Nenhum dado de ator é alterado. Não migra saldos de módulos antigos desconhecidos e não desconta compras automaticamente na Máquina de Lanches nesta versão.

## Desenvolvimento

JavaScript ES Modules, ApplicationV2 e CSS isolado, sem dependências de execução adicionais ao HoloSuite. Não usa socketlib; o transporte e a replicação usam documentos/configurações nativos.

```bash
npm test
npm run check
python3 docs/build-preview.py
python3 docs/build-release.py
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node docs/test-preview.mjs
node docs/test-native.mjs
```

`HV_CHROMIUM_PATH` permite usar um Chromium já instalado. `Banco-Mana-Preview.html` é uma prévia local autocontida com dados de exemplo; não se conecta ao Foundry e não altera o mundo.

**Validação:** 29 testes Node do motor e serviço; 14 cenários da prévia; 12 cenários com três clientes de navegador independentes, importando o ponto de entrada real do módulo e contratos simulados do Foundry 13/HoloSuite. Foram inspecionados saldo, tela do mestre, cores e quadros da animação. Cobertura inclui concorrência, permissões, falha de persistência/chat, recuperação, mestre offline e notificações em todos os clientes. Esses testes não substituem instalação numa sessão licenciada real do Foundry 13. O manifesto não declara uma versão `verified` sem esse teste.

## API

```javascript
const bank = game.modules.get('holosuite-mana').api;
await bank.open();
bank.getBalance(); // conta do usuário atual
bank.getBalance('ID_DO_JOGADOR');
await bank.debit(150, {note: 'Compra'}); // jogador: somente a própria conta
await bank.credit('ID_DO_JOGADOR', 500, {note: 'Missão', color: '#ad8aff'}); // mestre
await bank.debit(50, {accountId: 'ID_DO_JOGADOR', color: '#ff5b78'}); // mestre
```

A API aplica as mesmas validações do aplicativo. Uma chamada recusada não movimenta o saldo. Operações externas confirmadas também produzem aviso global e recibo público.

## Referências

Direção visual original inspirada em linguagem de interfaces corporativas cyberpunk: hierarquia de banco digital, cantos chanfrados, trilhas de circuito, paleta escura e acentos neon. Referência de movimento e identidade: [Territory Studio / Cyberpunk 2077](https://territorystudio.com/project/cyberpunk/). Sem copiar assets ou logotipos do jogo.

Contrato de integração verificado nos módulos existentes: [`holosuite-news/src/integration/holosuite.ts`](https://github.com/STR4DZN/holosuite-news/blob/main/src/integration/holosuite.ts) e sua auditoria do Core 1.0.12. Registro oficial por `registerApp` e hook `holosuite-core.apiReady`.

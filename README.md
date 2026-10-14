# Banco de Mana

Banco de **todos os jogadores** para **Foundry VTT 13**, como aplicativo do **celular HoloSuite**. Um único saldo de mana compartilhado, começando em zero.

## Instalar e abrir

Use em **Instalar módulo → URL do Manifesto**:

```text
https://github.com/STR4DZN/holosuite-mana/releases/latest/download/module.json
```

Ative **Banco de Mana** e o **HoloSuite** no mundo. Abra o celular HoloSuite e clique no app **Banco de Mana**, com ícone de banco. O app aparece para mestre e jogadores. Não há botão de abertura na barra de configurações ou no controle de tokens/mapa.

O manifesto continua sem dependências obrigatórias, permitindo ativar o módulo sem bloqueio por versões de outro módulo. A integração com o celular ocorre quando a API do HoloSuite está disponível. Ao atualizar, todos os participantes devem recarregar o Foundry com **F5** para usar o mesmo protocolo de movimentação.

## Uso

O saldo ocupa um cartão grande, com chip, identificação compartilhada e valor em destaque. Os controles ficam abaixo.

**Jogadores:** informe a quantidade e clique em **Confirmar gasto**. A descrição opcional fica no histórico do banco. O débito sai do saldo compartilhado.

**Mestre:** adicione ou remova mana. Em **Assinatura do aviso**, escolha cor e perfil **Cinemática / 6,8s** ou **Tática / 4,6s**. **Testar aviso** é local e não movimenta dinheiro nem publica chat.

**Limpar histórico:** como mestre, abra **Movimentações → Limpar histórico → Apagar histórico**. Há confirmação antes de executar. Os registros da janela são apagados para todos; o saldo e as mensagens já enviadas no chat são mantidos. Jogadores não veem esse controle e não conseguem executá-lo pela API ou forjando uma solicitação. Recibos ainda pendentes no chat precisam ser publicados antes da limpeza.

A aba Movimentações tem filtros, paginação, responsável, horário, descrição e valor. O nome do responsável continua nesse histórico interno; não é exibido na mensagem do chat.

## Uma mensagem no chat

Cada alteração confirmada cria **exatamente uma mensagem pública**, com o alias **Banco de Mana** e somente os valores. Exemplo:

```text
+250 mana
1.000 → 1.250 mana
```

Não há nome de jogador/mestre, descrição ou mensagens de solicitação/confirmação no chat. Limpar o histórico não gera mensagem financeira. Solicitações recusadas não publicam débito ou crédito.

Os avisos centrais e animações continuam sendo mostrados aos clientes conectados, com a cor escolhida pelo mestre. O saldo real é salvo antes da animação. Efeitos são removidos ao terminar, e a preferência de movimento reduzido interrompe os efeitos em andamento e mostra os valores finais.

## Consistência

- Um mestre ativo é necessário para movimentar mana. Consultar o saldo salvo continua possível sem mestre conectado.
- Somente mestres podem adicionar mana ou limpar o histórico. Jogadores podem gastar do saldo compartilhado.
- Quantidades inteiras e positivas, saldo nunca negativo; limite de 999.999.999.999 mana.
- Saldo e recibo são gravados juntos na configuração de mundo, com escrita exclusiva de mestres.
- Solicitações usam atualizações das flags do próprio documento User. A identidade vem do evento nativo do Foundry; campos de remetente enviados não concedem permissões. Confirmações só são aceitas quando vêm do mestre responsável.
- Uma autoridade de mestre e uma fila serializam pagamentos e limpeza. Revisões globais rejeitam operações obsoletas, e IDs evitam repetição da mesma solicitação.
- Limpar o histórico mantém a sequência de operações e avança a revisão, impedindo replay de solicitações anteriores sem alterar o saldo.
- Falha ao salvar não confirma ganho/perda. Chat indisponível após a gravação conserva o recibo e tenta publicá-lo com ID fixo, sem duplicar saldo, aviso ou mensagem.
- A janela conserva cerca de 300 registros recentes, mais recibos pendentes, até o mestre limpar. Não depende de personagem, token ou cena. Não desconta automaticamente compras da Máquina de Lanches.

## Desenvolvimento e validação

JavaScript ES Modules, ApplicationV2, SVG, CSS isolado e Web Animations API. Transporte por documentos nativos, sem socketlib ou biblioteca adicional.

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

`HV_CHROMIUM_PATH` aceita um Chromium já instalado. `Banco-Mana-Preview.html` usa dados fictícios e não altera o mundo.

Validação: **36 testes Node**, **17 cenários da prévia** e **16 cenários com três clientes independentes** importando o código real sob contratos simulados do Foundry 13 e HoloSuite. Inclui registro tardio do app, ausência do botão antigo, uma mensagem por pagamento, limpeza cancelada/confirmada, saldo preservado, recusa de pedidos forjados, concorrência, mestre offline e falhas de persistência/chat. A sessão licenciada real ainda precisa ser validada; o manifesto não declara `verified`.

## API

```javascript
const bank = game.modules.get('holosuite-mana').api;
await bank.open();
bank.getBalance();
await bank.debit(150, {note: 'Suprimentos'});
await bank.credit(500, {note: 'Recompensa', color: '#ad8aff'}); // mestre
await bank.clearHistory(); // mestre; limpa registros da janela e mantém saldo/chat
```

O identificador técnico foi preservado para manter o saldo já criado no banco. As mesmas permissões são verificadas no serviço autoritativo.

## Referências

[Direção visual](docs/design-research.md). Vetores e interface originais, sem assets de terceiros. A integração segue o contrato `registerApp` e o hook `holosuite-core.apiReady`, como em [HoloNews](https://github.com/STR4DZN/holosuite-news/blob/main/src/integration/holosuite.ts).

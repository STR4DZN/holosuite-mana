# Banco de Mana

Banco de **todos os jogadores** para **Foundry VTT 13**. Um único saldo de mana compartilhado, começando em zero. **Não exige nenhum outro módulo.**

## Instalar e abrir

Cole em **Configuração → Módulos → Instalar módulo → URL do Manifesto**:

```text
https://github.com/STR4DZN/holosuite-mana/releases/latest/download/module.json
```

Ative somente **Banco de Mana** no mundo. Na aba **Configurações** da barra lateral do Foundry, clique no botão **Banco de Mana**. Também é possível abrir em **Configurar definições → Banco de Mana → Abrir banco**. Os dois acessos estão disponíveis para mestre e jogadores.

## Uso

O saldo aparece em um **cartão grande**, ocupando a largura principal da janela, com chip, identificação de conta compartilhada e valor em destaque. Os controles ficam abaixo do cartão.

**Jogadores:** informe o valor, adicione uma descrição opcional e clique em **Confirmar gasto**. O débito sai do mesmo saldo que todos veem.

**Mestre:** escolha **Adicionar** ou **Remover**, informe valor e descrição e confirme. Em **Assinatura do aviso**, escolha uma cor, inclusive personalizada, e o perfil **Cinemática / 6,8s** ou **Tática / 4,6s**. **Testar aviso** mostra a prévia apenas para você, sem alterar dinheiro nem chat. A última cor fica salva neste navegador.

A aba **Movimentações** tem filtros de entradas/saídas, paginação, responsável, horário, descrição, valor e número do registro. A tela principal mostra os três movimentos mais recentes.

## Avisos e consistência

Cada operação confirmada gera um aviso central nos clientes conectados e um recibo público no chat. A animação tem abertura, trilhos, varredura, partículas direcionais, contagem do valor e do saldo, trilha de confirmação, selo e fechamento. A cor e o perfil do mestre acompanham o recibo em todos os clientes.

- O saldo real é salvo antes do aviso. Os efeitos terminam e são removidos; avisos simultâneos entram em fila.
- A opção **Banco de Mana: reduzir movimentos** e a preferência do sistema mostram os valores finais e interrompem os efeitos em andamento.
- Um mestre ativo é necessário para movimentar mana. O saldo já salvo pode ser consultado sem mestre.
- Todos compartilham a mesma reserva. Somente mestres podem adicionar mana; jogadores podem gastar.
- Quantidades inteiras e positivas, sem saldo negativo; limite de 999.999.999.999 mana.
- Saldo e recibo são gravados juntos em uma configuração de mundo protegida. A identidade é fornecida pelo evento nativo do Foundry.
- Uma autoridade de mestre e uma fila serializam as operações. A revisão global rejeita confirmações obsoletas; solicitações duplicadas não movimentam dinheiro novamente.
- Falha ao salvar não confirma ganho/perda. Se o chat falhar após o saldo ser salvo, o recibo fica pendente e é republicado com ID fixo, sem repetir o valor nem o aviso.
- A janela mostra cerca de 300 registros recentes e conserva recibos pendentes. O chat mantém o registro público do mundo.
- Não depende de personagem, token ou cena. Compras na Máquina de Lanches não são descontadas automaticamente.

## Desenvolvimento e validação

JavaScript ES Modules, ApplicationV2, SVG e CSS isolado. Web Animations API e documentos nativos do Foundry. Nenhuma biblioteca ou módulo adicional em execução.

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

`HV_CHROMIUM_PATH` aceita um Chromium já instalado. `Banco-Mana-Preview.html` é uma demonstração com dados fictícios e não altera o Foundry.

Validação: **30 testes Node**, **15 cenários da prévia** e **13 cenários com três clientes independentes** importando o código real, sob contratos simulados do Foundry 13. O cenário de abertura instala somente o banco, sem outros módulos. Testes incluem concorrência entre jogadores, permissões, persistência/chat indisponíveis, recuperação, mestre offline, cores e limpeza das animações. A sessão licenciada real ainda precisa ser validada; o manifesto não declara `verified`.

## API

```javascript
const bank = game.modules.get('holosuite-mana').api;
await bank.open();
bank.getBalance(); // o mesmo saldo para todos
await bank.debit(150, {note: 'Suprimentos'}); // jogador ou mestre
await bank.credit(500, {note: 'Recompensa', color: '#ad8aff', profile: 'cinematic'}); // mestre
```

O identificador técnico foi preservado para manter o saldo já criado no banco. As permissões e validações são as mesmas da interface.

## Referências visuais

Veja [pesquisa de direção visual](docs/design-research.md). A interface e os vetores são originais; nenhum asset de terceiros é distribuído.

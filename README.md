# Hollow Switch · Mana

Banco do esquadrão para **Foundry VTT 13**, dentro do HoloSuite Core 1.0.12+. **Uma reserva única de mana, compartilhada por todos os jogadores.** O saldo inicial é zero; não depende de personagem, token ou cena.

## Instalar e abrir

Cole em **Configuração → Módulos → Instalar módulo → URL do Manifesto**:

```text
https://github.com/STR4DZN/holosuite-mana/releases/latest/download/module.json
```

Ative **HoloSuite Core** e **HoloSuite · Hollow Switch** no mundo. Abra **Hollow Switch** no HoloSuite. O banco não adiciona controles de token ou de mapa.

## Uso

**Jogadores:** o saldo do grupo aparece ao abrir. Informe o valor, adicione uma descrição opcional e clique em **Confirmar gasto**. O débito sai da mesma reserva que todos veem. Somente o mestre adiciona mana.

**Mestre:** escolha **Adicionar** ou **Remover**, informe valor e descrição e confirme. Não há seleção de jogador ou contas individuais. Em **Assinatura do aviso**, escolha a cor, inclusive uma cor personalizada, e a sequência **Cinemática / 6,8s** ou **Tática / 4,6s**. **Testar aviso** mostra a prévia somente no seu computador, sem alterar saldo nem chat. A última cor escolhida fica salva neste navegador.

A aba **Movimentações** mostra o histórico compartilhado, com filtros de entradas/saídas, paginação, responsável, horário, descrição, valor e número do registro. A tela principal mostra os três movimentos recentes.

## Animação e chat

Cada operação confirmada gera um aviso central em todos os clientes conectados e um recibo público no chat. A sequência tem abertura por linha e recorte, trilhos laterais, varredura, diagrama vetorial, partículas entrando no crédito e saindo no débito, contagem progressiva do valor e do saldo, trilha de confirmação, selo e fechamento. A cor e o perfil escolhidos pelo mestre acompanham o mesmo recibo em todos os clientes.

O saldo real é salvo antes da animação. Os avisos entram em fila e podem ser fechados com X. Em filas longas, a sequência fica mais curta para manter os avisos em dia. Todos os elementos, timers, animações e contadores são removidos ao terminar. Não há efeitos permanentes ou fontes remotas. A opção individual **Banco Mana: reduzir movimentos** e a preferência de acessibilidade do sistema mostram os valores finais sem a sequência de movimento.

Um mestre ativo é necessário para movimentar mana. O saldo salvo continua disponível para consulta sem mestre; reabrir o banco não reproduz animações passadas. A solicitação e a confirmação usam um documento privado entre o solicitante e o mestre responsável, além do recibo público da operação.

## Consistência

- Uma reserva de mundo, começando em zero. Mana inteira, sem negativos ou frações; limite de 999.999.999.999.
- Saldo e recibo são gravados juntos em `holosuite-mana.ledger`, uma configuração de mundo com escrita exclusiva de mestres.
- A identidade vem do usuário atribuído pelo Foundry ao evento de criação. Informar outro nome ou papel em campos enviados não concede permissões.
- Um mestre responsável e uma fila serializam as operações. A revisão é global: dois jogadores confirmando a mesma revisão não sobrescrevem dinheiro. O segundo recebe o saldo atualizado e pode confirmar novamente.
- A mesma solicitação não movimenta dinheiro duas vezes. Falha ao salvar não gera aviso de ganho/perda. Falha posterior no chat preserva o saldo e tenta publicar o recibo novamente com um ID fixo.
- O histórico da janela conserva cerca de 300 registros recentes, além de recibos de chat pendentes. O chat conserva os registros públicos do mundo.
- Nenhum saldo é separado por jogador. Não há importação, soma de contas anteriores ou migração de dinheiro. Compras na Máquina de Lanches não estão ligadas automaticamente nesta versão.

## Desenvolvimento e validação

JavaScript ES Modules, ApplicationV2, SVG e CSS isolado. As animações usam Web Animations API e contadores por frame, sem dependência de execução adicional. O transporte usa os documentos nativos do Foundry.

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

`HV_CHROMIUM_PATH` aceita um Chromium já instalado. `Banco-Mana-Preview.html` usa dados fictícios e não se conecta ao Foundry. Seu valor de exemplo não é o saldo inicial do módulo.

Validação: **30 testes Node**, **15 cenários da prévia** e **13 cenários com três clientes independentes** importando o código real, sob contratos simulados do Foundry 13/HoloSuite. Cobertura de concorrência entre jogadores, permissões, persistência/chat indisponíveis, recuperação, mestre offline, cores e limpeza das animações. A instalação em uma sessão licenciada real ainda precisa ser validada; o manifesto não declara `verified`.

## API

```javascript
const bank = game.modules.get('holosuite-mana').api;
await bank.open();
bank.getBalance(); // a mesma reserva para todos
await bank.debit(150, {note: 'Suprimentos'}); // jogador ou mestre
await bank.credit(500, {note: 'Contrato', color: '#ad8aff', profile: 'cinematic'}); // mestre
await bank.debit(50, {note: 'Reparo', color: '#73dded', profile: 'tactical'}); // mestre
```

A API mantém as mesmas permissões, revisão, avisos e recibos. Valores acima do saldo são recusados.

## Referências visuais

Veja [pesquisa de direção visual](docs/design-research.md). A interface e os vetores são originais; nenhum asset de terceiros é distribuído. Registro no HoloSuite por `registerApp` e hook `holosuite-core.apiReady`, conforme o contrato do Core 1.0.12.

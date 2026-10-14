Banco de Mana 2.4.1 · Foundry VTT 13.

- Remove o radar hexagonal da captura, ondas, barras segmentadas e barra de duração. O cartão principal também deixa de usar o ornamento circular.
- Preserva a identidade e a contagem da versão 2.4.0: valores grandes, cor do mestre, 1,9s de contagem e aviso de 4s (4,6s no perfil imersivo).
- Nova textura estática original de 48px, hachura discreta na lateral e acabamento de borda.
- Microanimações de cantos, identificação e sinal; reflexos curtos limitados à moldura e selo de confirmação desenhado ao terminar a contagem.
- Sem bibliotecas, assets de terceiros ou filtros animados; todos os efeitos decorativos são finitos e usam transform/opacidade.
- Mantém saldo compartilhado, uma mensagem por operação, histórico e compras da máquina.
- 56 testes Node e 54 cenários Chromium. Inclui ausência de radar/gráficos, quantidade limitada de efeitos, janela de 320px, contagem sob bloqueio, fallbacks e limpeza.
- Prévia HTML interativa e demonstração MP4 de ganho e gasto.

Atualize o banco e use Ctrl+F5 em todos os clientes. O saldo é preservado e não há dependências obrigatórias.

Demonstração usa dados fictícios. Verificação em Chromium com contratos simulados do Foundry; a sessão licenciada real ainda precisa ser validada.

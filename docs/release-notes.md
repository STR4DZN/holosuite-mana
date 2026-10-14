Banco de Mana 2.4.0 · Foundry VTT 13.

- Aviso reconstruído como HUD tático: contraste alto, vermelho como acento padrão, tipografia grande, recortes, textura, instrumentação e sinais em etapas.
- A alteração de mana é a contagem principal: +2.000 ou −2.000. A reserva anterior e o saldo confirmado permanecem legíveis abaixo.
- Números completos desenhados em OffscreenCanvas/Worker com ciclo independente da janela do Foundry, sem rolos ou dígitos cortados.
- Fallback com 121 quadros animados pelo navegador, além de alternativa textual.
- Contagem linear rápida de 1,9s; aviso padrão de 4s e perfil imersivo de 4,6s.
- Mantém cor personalizada, saldo compartilhado, uma mensagem por operação, histórico e compras da máquina.
- Inclui Banco-Mana-Animacao.mp4, captura real de ganho e gasto no navegador, e prévia HTML interativa.
- 56 testes Node e 52 cenários Chromium. Verifica desenho durante bloqueio de interface, RAF indisponível, fallback, encerramento e valores extremos.

Atualize o banco e use Ctrl+F5 em todos os clientes. O saldo é preservado e não há dependências obrigatórias.

Demonstração usa dados fictícios. O desempenho depende do navegador/hardware/carga gráfica; teste em sessão licenciada real continua necessário.

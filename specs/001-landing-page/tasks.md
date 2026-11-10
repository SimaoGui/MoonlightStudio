# Tarefas 001: landing page parallax do TryTonStudio

> Cada tarefa aponta para o requisito da `spec.md` que ela atende. O teste de aceite (`npm run verify`, dentro de `trytonstudio/`) confere os requisitos mensuráveis em um navegador real.

## Fase 1. Spec

- [x] Analisar o MoonlightStudio (camadas, velocidades, problemas a corrigir)
- [x] Pesquisar UI/UX: glassmorphism (NN/g), materiais do Windows 11 (Microsoft Learn), movimento reduzido (WebKit)
- [x] Escrever requisitos funcionais (RF-01 a RF-12) e não funcionais (RNF-01 a RNF-08)
- [x] Espelhar a spec nesta pasta

## Fase 2. Design

- [x] Design system Neo/Windows Glass: cores, materiais, tipografia, componentes
- [x] Artboards de desktop e celular no Claude Design
- [x] Corrigir os produtos no design: TrytonPlayer é player de vídeo, TrytonScreens é compartilhamento de tela

## Fase 3. Fundação

- [x] Projeto Vite + React 19 + TypeScript + Tailwind CSS 4
- [x] Tokens em `@theme` e materiais Mica, Acrylic, Acrylic fino e Smoke (`src/index.css`)
- [x] Alternativas sólidas para `prefers-reduced-transparency`, `prefers-contrast` e navegadores sem `backdrop-filter` (RNF-04)
- [x] Componentes de interface: botão, chip, card de vidro, janela, ícones, cabeçalho de seção
- [x] Tridente em SVG e favicon (RNF-08)
- [x] Todo o texto e todos os links em `src/content.ts` (RF-10)

## Fase 4. Mergulho

- [x] Motor de parallax com valores compartilhados de scroll, ponteiro e intensidade por tela (RNF-02)
- [x] Hero em camadas: estrelas, halo, rochas, tridente, título, texto e três faixas de onda (RF-02, RF-03)
- [x] Fundo contínuo da superfície ao abismo, com raios de luz, plâncton, bolhas, peixes e leito do mar (RF-05)
- [x] Navegação em vidro com link ativo e menu mobile (RF-01)
- [x] Medidor de profundidade, com trilho fino entre 1024 e 1439 px (RF-04)
- [x] Movimento reduzido: camadas paradas, sem loops, player pausado (RNF-03)

## Fase 5. Vitrine

- [x] Seção Estúdio com os três princípios
- [x] Janela interativa do TrytonPlayer: tocar, pausar, barra de progresso, fila, velocidade, legendas (RF-06)
- [x] Janela interativa do TrytonScreens: transmitir, parar, fonte, microfone, selo Ao vivo (RF-07)
- [x] Tilt 3D das janelas (RF-08) e revelação ao rolar (RF-09)
- [x] Recursos em comum, download e rodapé
- [x] Estado honesto de download enquanto não há instalador (RF-11) e legenda de demonstração (RF-12)
- [x] Teclado, foco visível e alvos de toque de 44 px (RNF-06)

## Verificação

- [x] Teste de aceite automatizado em `trytonstudio/scripts/verify.mjs`: 45 verificações
- [x] Larguras de 320, 390, 768, 1024, 1366, 1440, 1920 e 2560 px sem scroll horizontal e sem texto cortado (RNF-01)
- [x] axe-core sem violações em desktop e celular (WCAG 2.2 AA e boas práticas)
- [x] Contraste dos tokens de texto calculado contra a superfície mais clara de cada material (RNF-05)
- [x] JavaScript inicial de 135 kB comprimido, abaixo do limite de 150 kB (RNF-07)

## Fase 6. Publicação (depende do time)

Tudo abaixo se resolve editando `trytonstudio/src/content.ts`, onde cada item está marcado com `PENDENTE`.

- [ ] Links de download do TrytonPlayer e do TrytonScreens (`links.playerDownload`, `links.screensDownload`)
- [ ] Versão, tamanho do instalador e versões do Windows suportadas em cada card de download
- [ ] Recursos reais de cada app, no lugar dos exemplos
- [ ] Confirmar os três princípios do estúdio e os seis recursos em comum
- [ ] Nomes e links dos três integrantes e o GitHub do estúdio
- [ ] Capturas ou vídeos reais dos apps
- [ ] Hospedagem, domínio e imagem de compartilhamento (Open Graph)

## Próximas implementações

Sugestões para depois desta entrega, em ordem de prioridade. O detalhe e as referências estão na seção "Próximos passos" do documento da spec.

### Credibilidade

- [ ] Download de verdade: versão, data, tamanho, requisitos, hash do instalador e link para o histórico de versões
- [ ] Capturas e vídeos reais ao lado das demonstrações interativas
- [ ] Quem somos: nomes, fotos ou avatares, links e um contato
- [ ] Números medidos no lugar de adjetivos (memória em repouso, tempo de abertura, latência da transmissão)
- [ ] Comparação honesta do TrytonScreens com o Discord na tarefa de compartilhar tela
- [ ] Página de privacidade, importante para um app que transmite a tela
- [ ] "Avise-me do lançamento" enquanto o download estiver em breve

### Imersão

- [ ] Descobertas ao longo do mergulho: criaturas, fatos e zonas do oceano em profundidades reais
- [ ] Seção fixa por produto em que o scroll conduz a demonstração, recurso por recurso
- [ ] Travessia da superfície: a linha d'água passa pela tela inteira quando o visitante sai do hero
- [ ] Lanterna no abismo: o ponteiro ilumina o fundo e revela bioluminescência nos 4.000 m
- [ ] Hero em WebGL com água e tridente em 3D, carregado depois do primeiro paint, com a cena em SVG como alternativa
- [ ] Som ambiente opcional, desligado por padrão

### Engenharia

- [ ] Camadas decorativas em animações de scroll do CSS (`animation-timeline`), com a versão atual como alternativa
- [ ] CI rodando `npm run build`, `npm run lint` e `npm run verify` a cada pull request
- [ ] Deploy automático em repositório e domínio próprios
- [ ] Páginas por produto, com perguntas frequentes e histórico de versões
- [ ] Versão em inglês

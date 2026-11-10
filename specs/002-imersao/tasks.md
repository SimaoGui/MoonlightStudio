# Tarefas 002: imersão da landing page

> Cada tarefa aponta para o requisito da `spec.md` que ela atende. O teste de aceite (`npm run verify`, dentro de `trytonstudio/`) confere todos eles em um navegador real.

## Fase 1. Spec

- [x] Escrever os requisitos RF-13 a RF-20 e RNF-09 a RNF-11
- [x] Conferir cada fato das descobertas na fonte (NOAA, Smithsonian, Phys.org)

## Fase 2. Título em bolhas

- [x] Amostrar o texto do título em partículas (RF-13)
- [x] Círculo em volta do ponteiro, com máscara no texto e bolhas em órbita (RF-13)
- [x] Estouro no clique, toque no celular e bolhas soltas quando parado (RF-13)
- [x] Sem canvas com movimento reduzido (RNF-10)

## Fase 3. Mergulho com descobertas

- [x] Provedor de profundidade único para medidor, descobertas e som (RF-14)
- [x] Cinco descobertas com ilustração, fato e fonte (RF-14)
- [x] Zona do oceano e pontos das descobertas no medidor (RF-15)

## Fase 4. Scroll que conduz a demonstração

- [x] Janela fixa a partir de 1024 px e recurso ativo pelo meio da tela (RF-16)
- [x] Estados de cada recurso nas duas janelas, com os controles novos: biblioteca com busca, convite e som do sistema (RF-16)
- [x] Recursos clicáveis em qualquer largura (RF-16)

## Fase 5. Travessia e abismo

- [x] Lâmina d'água e bolhas uma vez por descida (RF-17)
- [x] Superfície vista de baixo no topo da área submersa (RF-17)
- [x] Lanterna que segue o ponteiro e passeia sozinha (RF-18)
- [x] Luz fixa e texto sem máscara com movimento reduzido (RNF-10)

## Fase 6. Som e 3D

- [x] Som sintetizado que muda com a profundidade, com botão na navegação (RF-19)
- [x] Sons da travessia e do título (RF-19)
- [x] Tridente em 3D a partir do contorno do logo, em arquivo separado (RF-20, RNF-09)
- [x] SVG como alternativa quando o WebGL falta, é lento ou falha (RF-20)
- [x] Motion carregado por `LazyMotion` para manter o JavaScript inicial abaixo de 150 kB (RNF-09)

## Verificação

- [x] Teste de aceite ampliado de 45 para 96 verificações, com todos os requisitos das duas specs
- [x] Larguras de 320 a 2560 px sem scroll horizontal e sem texto cortado
- [x] axe-core sem violações em desktop e celular
- [x] JavaScript inicial de cerca de 137 kB comprimido, abaixo do limite de 150 kB. A cena 3D tem 144 kB e só é baixada por quem vai ver
- [x] Nenhum arquivo de áudio, vídeo, imagem raster ou modelo 3D no build (RNF-11)

## Para o time conferir em aparelhos reais

O teste roda em um Chromium sem tela, então estes pontos pedem um olhar humano:

- [ ] Ouvir o som em caixas e em fones, e ajustar o volume se estiver alto ou baixo demais
- [ ] Ver o tridente 3D em um computador com placa de vídeo (no teste ele roda por software, forçado com `?3d=on`)
- [ ] Sentir o título em bolhas e a lanterna em um celular de verdade

## Próximas implementações

- [ ] Mais descobertas ao longo do mergulho (basta acrescentar em `content.ts` e desenhar a criatura)
- [ ] Água em WebGL no hero, com as ondas em SVG como alternativa
- [ ] As sugestões de credibilidade e de engenharia que continuam abertas em `specs/001-landing-page/tasks.md`

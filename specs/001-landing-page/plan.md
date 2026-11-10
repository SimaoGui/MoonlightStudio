# Plano 001: landing page parallax do TryTonStudio

> Como a spec (`spec.md`) vira código. As tarefas e o que ficou pendente estão em `tasks.md`.

## Arquitetura

A landing page é um app React 19 com TypeScript, empacotado pelo Vite e estilizado com Tailwind CSS 4. O resultado do build é um site estático que pode ser hospedado em GitHub Pages, Vercel ou Netlify sem servidor.

| Decisão | Escolha | Motivo |
| --- | --- | --- |
| Build | Vite | Build estático rápido, sem servidor, suficiente para uma página única |
| Estilo | Tailwind CSS 4 com tokens em `@theme` | Os tokens do design system viram classes sem arquivo de configuração em JavaScript |
| Animação | Biblioteca Motion | Liga valores de scroll direto ao `transform` no DOM, sem renderizar o React a cada frame |
| Ilustração | SVG inline em componentes React | Nítido em qualquer tela, leve, e cada camada pode ser animada separadamente |
| 3D | Transformações 3D de CSS | Tilt e profundidade sem carregar uma biblioteca de WebGL |
| Fontes | Sora e Inter variáveis, servidas pelo próprio site | Sem dependência de servidor de fontes externo |
| Local no repositório | Pasta `trytonstudio/` | O site de referência na raiz continua intacto |

### Estrutura de pastas

```text
trytonstudio/
  index.html
  public/
    favicon.svg             tridente
  scripts/
    verify.mjs              teste de aceite da spec em um navegador real
  src/
    main.tsx
    App.tsx
    content.ts              textos e links da página (RF-10)
    index.css               tokens, materiais e preferências de acessibilidade
    lib/
      parallax.tsx          motor de parallax: scroll, ponteiro e intensidade por tela
      useTilt.ts            tilt 3D das janelas
      useActiveSection.ts   seção visível para navegação e medidor
      random.ts             números pseudoaleatórios fixos para estrelas e partículas
    components/
      brand/                tridente em SVG
      ui/                   botão, chip, card de vidro, janela, ícones, cabeçalho de seção
      layout/               navegação, medidor de profundidade, fundo do oceano, rodapé
    sections/
      Hero.tsx
      Studio.tsx
      Player.tsx
      Screens.tsx
      Features.tsx
      Download.tsx
specs/
  001-landing-page/
    spec.md
    plan.md
    tasks.md
```

### Motor de parallax

Um único componente de camada recebe a velocidade e cuida do resto. Ele lê o scroll da página, suavizado por mola, multiplica pela velocidade da camada e pela intensidade da tela, e escreve o resultado em `transform`.

- A intensidade é 1,0 a partir de 1024 px, 0,7 em tablets, 0,4 em celulares e 0 com movimento reduzido.
- As camadas do hero usam velocidades de 0,1x a 1,2x. O título é a camada mais rápida e mergulha atrás das ondas da frente.
- Fora do hero, partículas, raios de luz e bolhas formam 3 planos de fundo com velocidades diferentes ao longo da página inteira.

## Plano de desenvolvimento

O desenvolvimento tem 6 fases, e cada fase só começa com a anterior validada contra a spec. As fases 1 a 5 saem nesta primeira entrega. A fase 6 depende das respostas do time.

| Fase | O que entra | Requisitos |
| --- | --- | --- |
| 1. Spec | Este documento e a cópia em `specs/001-landing-page/` | Todos |
| 2. Design | Design system e artboards de desktop, tablet e celular no Claude Design | Seções, tokens, componentes |
| 3. Fundação | Projeto Vite, tokens, materiais, componentes de interface, tridente em SVG | RF-10, RNF-04, RNF-05 |
| 4. Mergulho | Hero em camadas, fundo contínuo, navegação e medidor de profundidade | RF-01 a RF-05, RNF-02, RNF-03 |
| 5. Vitrine | Janelas interativas dos dois produtos, recursos, download e rodapé | RF-06 a RF-09, RNF-06, RNF-08 |
| 6. Publicação | Textos e capturas reais, links de download, hospedagem e domínio | Pendências abaixo |

Antes do pull request, o teste de aceite (`npm run verify`) abre o build em um navegador real e confere os requisitos mensuráveis: parallax, interações das janelas, navegação, larguras de 320 a 2560 px (RNF-01), acessibilidade com axe-core, movimento reduzido (RNF-03) e mais contraste (RNF-04).

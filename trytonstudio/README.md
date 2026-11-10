# TryTonStudio: landing page

Landing page do TryTonStudio, estúdio de ferramentas para Windows. O scroll funciona como um mergulho: o visitante começa na superfície do mar, com o tridente, e desce em parallax até o TrytonPlayer (player de vídeo) e o TrytonScreens (compartilhamento de tela).

O projeto segue o modelo SDD (Spec-Driven Development). A spec, o plano e as tarefas ficam em [`../specs/001-landing-page/`](../specs/001-landing-page/), e o código só implementa o que está escrito lá.

## Rodar

Precisa de Node.js 20.19 ou 22.12 em diante.

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # checa os tipos e gera o site estático em dist/
npm run preview   # serve o build em http://localhost:4173
npm run lint      # oxlint
```

## Testar

O teste de aceite abre o build em um Chromium de verdade e confere os requisitos mensuráveis da spec: parallax, interações das duas janelas, navegação, oito larguras de tela, acessibilidade com axe-core, movimento reduzido e mais contraste.

```bash
npx playwright install chromium   # só na primeira vez
npm run build
npm run verify
```

## Editar o conteúdo

Todo o texto e todos os links ficam em [`src/content.ts`](src/content.ts). Para mudar uma frase, um recurso ou um link, edite só esse arquivo.

Os itens que ainda dependem do time estão marcados com `PENDENTE` nesse arquivo:

- Links de download. Enquanto `links.playerDownload` e `links.screensDownload` forem `null`, nenhum botão promete download: a página mostra "Download em breve" e aponta para o GitHub. Ao preencher os links, os botões viram "Baixar para Windows" sozinhos.
- Recursos reais de cada app, princípios do estúdio e recursos em comum.
- Versão, tamanho do instalador e versões do Windows suportadas.
- Nomes e links dos três integrantes e o GitHub do estúdio.

## Estrutura

```text
src/
  content.ts              textos e links da página
  index.css               tokens do design system, materiais e preferências de acessibilidade
  lib/
    parallax.tsx          motor de parallax: scroll, ponteiro e intensidade por tela
    useTilt.ts            tilt 3D das janelas
    useActiveSection.ts   seção visível para navegação e medidor
  components/
    brand/                tridente em SVG
    ui/                   botão, chip, card de vidro, janela, ícones
    layout/               navegação, medidor de profundidade, fundo do oceano, rodapé
  sections/               Hero, Studio, Player, Screens, Features, Download
scripts/
  verify.mjs              teste de aceite da spec
```

## Design system

Neo/Windows Glass: as cores saem do ícone do tridente e as superfícies usam os materiais do Windows 11.

- Os tokens ficam no bloco `@theme` de `src/index.css` e viram classes do Tailwind, como `bg-abyss-900`, `text-tide-200`, `rounded-card` e `shadow-window`.
- Os materiais são classes prontas: `.mica` para o corpo das janelas, `.acrylic` para navegação e cards, `.acrylic-thin` para chips e `.smoke` atrás do menu mobile.
- Com `prefers-reduced-transparency`, `prefers-contrast: more` ou sem suporte a `backdrop-filter`, o vidro vira superfície sólida.

## Parallax

Todas as camadas leem os mesmos valores (scroll suavizado por mola, posição do ponteiro e intensidade da tela) e escrevem só `transform`, sem renderizar o React a cada frame.

```tsx
<Layer speed={0.5} drift={0.1} pointer={6} className="inset-0">
  {/* conteúdo decorativo */}
</Layer>
```

- `speed` é quanto a camada anda na vertical para cada pixel de scroll. Com 0 ela rola com a página, com 1 parece presa na tela, e acima de 1 ela afunda.
- `drift` é o mesmo na horizontal, e `pointer` é o máximo em pixels que a camada segue o mouse.
- A intensidade é 1 a partir de 1024 px, 0,7 em tablets, 0,4 em celulares e 0 com `prefers-reduced-motion`.

## Publicar

O build é um site estático com caminhos relativos (`base: './'`), então a pasta `dist/` funciona em GitHub Pages, Vercel, Netlify ou qualquer servidor de arquivos, inclusive em subpasta.

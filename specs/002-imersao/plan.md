# Plano 002: imersão da landing page

> Como a spec (`spec.md`) vira código. As tarefas estão em `tasks.md`. A base é a mesma do plano 001: React 19, TypeScript, Vite, Tailwind CSS 4 e Motion.

## Decisões

| Requisito | Escolha | Motivo |
| --- | --- | --- |
| RF-13 Título em bolhas | Canvas 2D por cima do título e uma máscara CSS que abre o buraco no texto | O texto continua sendo texto de verdade (um `h1` selecionável, com nome acessível). Centenas de partículas em DOM custariam layout a cada frame |
| RF-14 e RF-15 Descobertas e zonas | Um provedor de profundidade único (`lib/depth.tsx`), lido pelo medidor, pelas descobertas e pelo som | Antes só o medidor calculava a profundidade. Com um valor só, a leitura é a mesma em todo lugar |
| RF-14 Ilustrações | SVG desenhado à mão em componentes React | Nítido em qualquer tela, sem arquivo de imagem (RNF-11) |
| RF-16 Janela fixa | `position: sticky` em CSS, com o recurso ativo decidido pela posição na tela | Sem biblioteca de scroll e sem sequestrar a rolagem: o scroll continua sendo o do navegador |
| RF-17 Travessia | Camada fixa montada só durante o evento, animada em CSS | Custo zero fora daqueles dois segundos |
| RF-18 Lanterna | Máscara radial em CSS guiada por duas variáveis (`--lx`, `--ly`) | A luz se move sem renderizar o React e sem canvas |
| RF-19 Som | Web Audio API, tudo sintetizado | Nenhum arquivo de áudio para baixar ou licenciar (RNF-11) |
| RF-20 Tridente 3D | three.js em um arquivo separado, carregado sob demanda | A cena pesa mais que todo o resto do site, então só baixa quem vai ver (RNF-09) |
| RNF-09 Peso | Motion carregado por `LazyMotion` com o conjunto `domAnimation` | Liberou cerca de 14 kB do JavaScript inicial, o espaço que o som e o carregador do 3D ocuparam |

## Como cada parte funciona

### Título em bolhas (`lib/bubbleField.ts`, `components/hero/BubbleTitle.tsx`)

1. Na carga e a cada mudança de tamanho, o título é desenhado em um canvas escondido e amostrado: cada ponto de tinta vira a posição de casa de uma bolha. São centenas, e a grade de amostragem acompanha o tamanho da fonte.
2. Com o ponteiro perto, abre-se um círculo em volta dele. As letras dentro do círculo somem por uma máscara radial em CSS (`.bubble-mask`), e as bolhas cuja casa está ali são soltas e passam a orbitar o círculo, cada uma com ângulo, raio e velocidade próprios.
3. Ao sair, o círculo fecha, as bolhas voltam para casa e somem quando chegam, e o texto reaparece.
4. Clique estoura as bolhas para longe. Toque abre o círculo por alguns instantes. Parado, o título solta um punhado de bolhas de tempos em tempos.
5. O laço de animação só roda enquanto há algo para desenhar. Com movimento reduzido, o canvas nem é criado.

### Profundidade, descobertas e zonas (`lib/depth.tsx`, `components/dive/`)

- Cada seção e cada descoberta é uma parada com profundidade conhecida. O provedor mede onde cada parada fica na página e interpola entre elas.
- Uma seção marca a sua profundidade quando o topo dela chega a 45% da altura da tela. Uma descoberta marca quando o meio dela está no meio da tela (RF-14).
- `zoneAt()` em `content.ts` traduz metros em zona (RF-15).
- As cinco descobertas ficam em `content.ts`, com título, fato e fonte. Cada uma usa o componente `Discovery` e um desenho de `creatures.tsx`.

### Scroll que conduz a demonstração (`components/ui/FeatureSteps.tsx`, `lib/demo.ts`)

- A grade de cada produto tem quatro áreas: cabeçalho, janela, recursos e botão. A partir de 1024 px a janela ocupa uma coluna inteira e fica `sticky`.
- Cada recurso tem cerca de meia tela de altura. O que contém o meio da tela é o ativo.
- Cada janela expõe `applyStep(índice)`. O estado só é aplicado quando o recurso ativo muda, então o que o visitante ajusta à mão fica até o próximo recurso.
- Cada recurso também é um botão. Abaixo de 1024 px nada fica fixo: tocar no recurso aplica o estado e traz a janela para a tela.

### Travessia e lanterna (`components/dive/SurfaceCrossing.tsx`, `components/dive/Abyss.tsx`)

- A travessia dispara quando o scroll passa da metade do hero descendo. Ela se arma de novo perto do topo, e um salto por link (que cai longe em um passo só) não conta.
- No abismo, a posição da luz vive em variáveis CSS escritas direto no DOM. A luz persegue o ponteiro com suavização, passeia sozinha depois de 2,6 s sem movimento e só anima enquanto a seção está na tela.

### Som (`lib/sound.ts`)

- Um ruído marrom em laço passa por dois caminhos: um filtro passa-banda com volume que sobe e desce (ondas, na superfície) e um passa-baixa que fecha com a profundidade (água abafada). No fundo entra um zumbido grave de três senoides.
- A travessia toca um ruído varrido e um baque grave. O título e as profundidades soltam bolhas, que são senoides curtas subindo de tom.
- Nada é criado antes do clique no botão. Com a aba escondida, o áudio é suspenso.

### Tridente 3D (`components/hero/HeroTrident.tsx`, `components/hero/Trident3D.tsx`)

- `HeroTrident` mostra o SVG, decide se o aparelho aguenta (RF-20) e, 900 ms depois de montar, importa `Trident3D`.
- `Trident3D` é o único arquivo que importa three.js. Ele transforma o contorno do logo em uma forma, extruda com chanfro, pinta os vértices com o degradê do logo e ilumina com um ambiente gerado em código.
- A cena só troca de lugar com o SVG depois do primeiro frame desenhado. Se o contexto WebGL se perde, o SVG volta.

## Movimento reduzido (RNF-10)

| Efeito | Com `prefers-reduced-motion` |
| --- | --- |
| Título em bolhas | Só o texto, sem canvas |
| Descobertas | Conteúdo completo, ilustração parada |
| Scroll que conduz a demonstração | Continua, sem tocar o vídeo sozinho |
| Travessia | Não dispara |
| Lanterna | Luz fixa sobre o texto, que fica sem máscara |
| Tridente 3D | Não carrega |
| Som | Continua opcional e desligado por padrão |

## Riscos e como foram tratados

| Risco | Tratamento |
| --- | --- |
| A janela fixa esconder conteúdo em telas baixas | O topo fixo é calculado para a janela caber em 1024 × 700, e o teste confere |
| Efeitos pesarem em aparelhos fracos | Um título menor gera menos bolhas, os laços de animação param quando não há nada para desenhar e o 3D só entra com aceleração por hardware |
| O 3D estourar o limite de peso | three.js fica fora do carregamento inicial, e o teste mede o JavaScript inicial a partir do build |
| Fatos errados nas descobertas | Cada fato tem link para a fonte, e as fontes estão listadas na spec |

## Arquivos novos

```text
trytonstudio/src/
  lib/
    bubbleField.ts          partículas do título
    depth.tsx               profundidade do mergulho
    demo.ts                 classes da janela fixa
    sound.ts                som sintetizado
  components/
    hero/
      BubbleTitle.tsx       título em bolhas
      HeroTrident.tsx       SVG ou 3D
      Trident3D.tsx         cena em three.js (arquivo separado)
    dive/
      Discovery.tsx         uma descoberta
      creatures.tsx         ilustrações
      SurfaceCrossing.tsx   travessia e superfície vista de baixo
      Abyss.tsx             lanterna
    ui/
      FeatureSteps.tsx      recursos que conduzem a janela
```

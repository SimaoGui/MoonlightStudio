# Spec 001: landing page parallax do TryTonStudio

> Fonte da verdade do projeto no modelo SDD (Spec-Driven Development). O código em `trytonstudio/` só implementa o que está escrito aqui. Mudou o comportamento? Mude a spec primeiro.
>
> Versão comentável: https://claude.ai/artifact/Maw3a7fa8waBY82dsF8kpD · Design: https://claude.ai/artifact/Ev7Ccqkc4Xq5ZTRvR6DPgJ

## Resumo

A landing page do TryTonStudio será uma página única em React e Tailwind cujo scroll funciona como um mergulho: o visitante começa na superfície do mar, com o tridente no hero, e desce por camadas de parallax até os produtos TrytonPlayer e TrytonScreens.

O MoonlightStudio é a referência de vibe. Mantemos a ideia das camadas que se movem em velocidades diferentes e trocamos a implementação por uma que roda a 60 fps, funciona em qualquer tela e respeita quem desativa animações.

O trabalho segue o modelo SDD (Spec-Driven Development): esta spec vem primeiro, o design valida a spec, e o código só implementa o que está escrito aqui. As entregas são três:

- Esta spec, espelhada no repositório em `specs/001-landing-page/`.
- O design no Claude Design, com o design system Neo/Windows Glass e os artboards de desktop, tablet e celular.
- O código da landing page em `trytonstudio/` no repositório, em um pull request.

## Análise do MoonlightStudio

O site de referência é um HTML estático de 3 arquivos (`index.html`, `style.css` e 4 PNGs de 2049 x 1152) que cria profundidade movendo 6 elementos em velocidades diferentes dentro de um único listener de scroll.

| Camada | Propriedade alterada | Velocidade em relação ao scroll | Efeito percebido |
| --- | --- | --- | --- |
| Estrelas | `left` | 1,0x na horizontal | O céu desliza para o lado |
| Lua | `top` | 0,8x | A lua desce devagar e se põe atrás das montanhas |
| Montanhas de trás | `top` | 1,0x | Ficam presas na tela, como fundo distante |
| Título | `margin-top` e `margin-left` | 2,2x para baixo e 2,0x para a esquerda | O texto mergulha atrás da montanha da frente |
| Botão | `margin-top` | 1,5x | Segue o título um pouco mais devagar |
| Montanhas da frente | nenhuma | 0x | Primeiro plano, cobre tudo que passa por trás |

Além do parallax, o site usa `mix-blend-mode: screen` na lua, um degradê no rodapé do hero para emendar com a seção seguinte e a biblioteca ScrollReveal para revelar o texto.

O que funciona e vamos manter:

- A ordem de empilhamento conta uma história: o título passa por trás do primeiro plano e some.
- Poucas camadas com velocidades bem diferentes dão mais profundidade do que muitas camadas parecidas.
- O degradê de transição esconde a emenda entre o hero e o conteúdo.

O que vamos corrigir:

- Animar `top`, `left` e `margin` força o navegador a recalcular o layout a cada frame. A nova versão anima só `transform` e `opacity`, que rodam na GPU.
- O listener de scroll roda sem `requestAnimationFrame` e sem `passive`, então trava em celulares.
- O parallax existe só no hero. Depois dele a página vira um bloco de texto.
- Não há media queries. O `padding: 100px` e o `padding-left: 150px` do logo quebram em telas pequenas e não existe menu mobile.
- Os 4 PNGs em resolução cheia pesam no carregamento. Ilustrações em SVG ficam nítidas em qualquer tela com uma fração do peso.
- O botão usa `href`, que não existe em `<button>`, e não leva a lugar nenhum. Falta foco visível e suporte a `prefers-reduced-motion`.

## Pesquisa de UI/UX

Três fontes definem as regras do projeto: o guia de glassmorphism do Nielsen Norman Group, a documentação de materiais do Windows 11 e o guia de movimento reduzido do WebKit. Cada regra abaixo vira um requisito na spec.

| Princípio | O que a fonte diz | Como aplicamos |
| --- | --- | --- |
| Vidro com moderação | Glassmorphism serve para criar profundidade e hierarquia, não para cobrir tudo ([NN/g](https://www.nngroup.com/articles/glassmorphism/)) | Vidro só na navegação, nos cards e nas janelas de produto. O texto corrido fica direto sobre o fundo escuro |
| Mais blur em fundo movimentado | Fundos com animação pedem blur alto. Com 30% de opacidade, 25 px ainda deixa as bordas do fundo visíveis ([NN/g](https://www.nngroup.com/articles/glassmorphism/)) | Blur de 24 a 40 px e preenchimento mínimo de 55% em qualquer superfície que carrega texto |
| Contraste garantido | Texto sobre vidro precisa passar no WCAG mesmo com o fundo variando ([NN/g](https://www.nngroup.com/articles/glassmorphism/)) | Contraste mínimo de 4,5:1 medido contra o ponto mais claro que pode passar atrás do vidro |
| Usuário controla a transparência | Oferecer alternativa sólida ajuda quem tem baixa visão ([NN/g](https://www.nngroup.com/articles/glassmorphism/)) | `prefers-reduced-transparency` e `prefers-contrast` trocam o vidro por superfícies sólidas |
| Materiais com papel definido | No Windows 11, Mica é a base opaca da janela, Acrylic é o vidro fosco de superfícies temporárias e Smoke escurece o que está atrás de um modal ([Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials)) | Três materiais com os mesmos papéis: Mica nas janelas de produto, Acrylic na navegação e nos menus, Smoke atrás do menu mobile |
| Parallax é gatilho vestibular | Movimento em várias velocidades, zoom, mudança de plano e movimento periférico causam enjoo em parte das pessoas ([WebKit](https://webkit.org/blog/7551/responsive-design-for-motion/)) | Com `prefers-reduced-motion`, as camadas ficam paradas, as bolhas somem e as revelações viram fade simples |
| Reduzir sem apagar o sentido | Remover só o que é gatilho e manter o que comunica ([WebKit](https://webkit.org/blog/7551/responsive-design-for-motion/)) | A ilustração do mergulho continua visível e estática. O medidor de profundidade continua funcionando |

Além das fontes, a página segue quatro decisões de landing page:

- Uma única ação principal por tela. No hero é "Explorar", em cada produto é "Baixar para Windows".
- O produto aparece funcionando. Cada seção mostra uma janela interativa do app em vez de uma lista de recursos.
- O parallax tem intensidade proporcional à tela. Em celulares o deslocamento cai para 40% e o parallax de mouse é desligado.
- Alvos de toque de pelo menos 44 x 44 px e foco visível em todos os elementos interativos.

### Fontes

- [Glassmorphism: Definition and Best Practices](https://www.nngroup.com/articles/glassmorphism/), Nielsen Norman Group
- [Materials in Windows 11](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials), Microsoft Learn
- [Responsive Design for Motion](https://webkit.org/blog/7551/responsive-design-for-motion/), WebKit

## Spec

A página tem 6 seções em uma única rota, e cada seção corresponde a uma profundidade do mergulho. O código está pronto quando todos os requisitos abaixo passam.

### Seções

| Ordem | Seção | Profundidade | Conteúdo | Ação principal |
| --- | --- | --- | --- | --- |
| 1 | Hero | 0 m | Cena parallax do mar com o tridente, nome do estúdio e frase de posicionamento | Explorar |
| 2 | Estúdio | 50 m | Quem somos: três amigos, três princípios, um para cada dente do tridente | Conhecer os produtos |
| 3 | TrytonPlayer | 200 m | Janela interativa do player de vídeo, 3 recursos principais | Baixar para Windows |
| 4 | TrytonScreens | 1.000 m | Janela interativa de uma sala de compartilhamento de tela, 3 recursos principais | Baixar para Windows |
| 5 | Recursos em comum | 2.500 m | Grade de 6 cards com o que os dois apps compartilham | Nenhuma |
| 6 | Download e rodapé | 4.000 m | Chamada final com os dois downloads, links e créditos | Baixar para Windows |

### Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | Navegação fixa em vidro com âncoras para as seções | O link da seção visível fica destacado. Abaixo de 768 px vira menu hambúrguer que fecha com Esc e ao escolher um link |
| RF-02 | Hero com parallax de scroll em pelo menos 6 camadas | Cada camada tem velocidade própria e o título passa por trás da camada da frente, como no MoonlightStudio |
| RF-03 | Parallax de ponteiro no hero | Em dispositivos com mouse, as camadas se deslocam até 40 px seguindo o cursor, mais nas camadas da frente. Em toque fica desligado |
| RF-04 | Medidor de profundidade | A partir de 1024 px, um indicador lateral mostra a profundidade atual em metros e a seção ativa, sem cobrir o conteúdo: trilho fino só com pontos até 1439 px e com os rótulos de profundidade a partir de 1440 px. Clicar em um ponto rola até a seção |
| RF-05 | Fundo contínuo | A cor de fundo escurece da superfície até o abismo ao longo da página, sem emendas visíveis entre seções |
| RF-06 | Janela do TrytonPlayer | Tocar e pausar, avançar pela barra de progresso, escolher vídeo na fila, trocar a velocidade e ligar ou desligar as legendas funcionam. A cena e a barra de progresso animam só enquanto toca |
| RF-07 | Janela do TrytonScreens | Iniciar e parar o compartilhamento, escolher entre Tela inteira, Janela e Região e ligar ou desligar o microfone funcionam. O selo Ao vivo aparece só durante a transmissão |
| RF-08 | Tilt 3D nas janelas de produto | A janela inclina até 6 graus seguindo o ponteiro e volta ao centro ao sair |
| RF-09 | Revelação ao rolar | Blocos de conteúdo entram com fade e deslocamento de 24 px uma única vez |
| RF-10 | Conteúdo editável | Todos os textos e links ficam em um único arquivo de conteúdo, separado dos componentes |
| RF-11 | Download honesto | Enquanto um produto não tem link de instalador, nenhum botão promete download: os botões viram "Acompanhar lançamento", a navegação mostra "Em breve" e o card mostra "Download em breve" com o link do GitHub. Com o link preenchido, tudo volta a "Baixar para Windows" |
| RF-12 | Demonstração identificada | Cada janela interativa traz a legenda "Demonstração interativa", para não se passar por captura real do app |

### Requisitos não funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RNF-01 | Responsividade | Sem scroll horizontal e sem texto cortado de 320 px a 2560 px de largura |
| RNF-02 | Desempenho de animação | Parallax anima só `transform` e `opacity`. Nenhuma imagem raster no hero |
| RNF-03 | Movimento reduzido | Com `prefers-reduced-motion`, nenhuma camada se move com o scroll ou o ponteiro e não há animação em loop |
| RNF-04 | Transparência reduzida | Com `prefers-reduced-transparency` ou sem suporte a `backdrop-filter`, o vidro vira superfície sólida |
| RNF-05 | Contraste | Texto com contraste mínimo de 4,5:1 e ícones e bordas de controles com 3:1 |
| RNF-06 | Teclado | Link "Pular para o conteúdo", ordem de foco igual à ordem visual e anel de foco visível em todo controle |
| RNF-07 | Peso | JavaScript inicial de até 150 kB comprimido |
| RNF-08 | SEO e compartilhamento | `lang="pt-BR"`, título, descrição, Open Graph e favicon do tridente |

### Comportamento por largura de tela

| Faixa | Largura | Layout | Parallax |
| --- | --- | --- | --- |
| Celular | 320 a 639 px | 1 coluna, menu hambúrguer, janela do produto abaixo do texto | Scroll a 40%, sem ponteiro e sem tilt |
| Tablet | 640 a 1023 px | 1 coluna larga, grade de recursos em 2 colunas | Scroll a 70%, sem ponteiro |
| Notebook | 1024 a 1439 px | 2 colunas nos produtos, medidor de profundidade, grade em 3 colunas | Completo |
| Desktop | 1440 px ou mais | Conteúdo limitado a 1200 px, cena do hero ocupa a largura toda | Completo |

## Design system Neo/Windows Glass

O design system parte das cores do ícone do tridente, que vai de `#74c4d6` no topo a `#121f38` na base, e usa os três materiais do Windows 11 sobre um fundo de oceano escuro. Os tokens vivem em um único arquivo CSS e viram classes do Tailwind.

### Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `abyss-950` | `#040915` | Fundo do abismo, rodapé |
| `abyss-900` | `#08142a` | Fundo das seções profundas |
| `abyss-800` | `#121f38` | Base das janelas, cor mais escura do ícone |
| `abyss-700` | `#1a3050` | Preenchimento do Acrylic |
| `shallow` | `#123a5a` | Água logo abaixo da superfície, início do degradê do mergulho |
| `tide-500` | `#41758f` | Bordas ativas, ilustrações |
| `tide-400` | `#548ba2` | Ilustrações, estados de hover |
| `tide-300` | `#67b1c4` | Cor da marca, botão principal |
| `tide-200` | `#8fd3e0` | Links, ícones, destaques |
| `foam-50` | `#eefafc` | Texto principal |
| `mist`, `haze`, `fog` | `#d3e3ea`, `#b7c9d4`, `#8ea4b3` | Texto secundário, do mais forte ao mais discreto. `fog` só sobre fundos escuros, onde passa de 4,5:1 |
| `ink` | `#04101f` | Texto sobre o botão principal e sobre o coral |
| `lume` | `#5ff2e0` | Brilho bioluminescente, foco, indicador ativo |
| `coral` | `#ff7d6b` | Selo Ao vivo e alertas, usado só no TrytonScreens |

### Materiais

| Material | Preenchimento | Blur | Borda | Onde |
| --- | --- | --- | --- | --- |
| Mica | `abyss-800` a 82% | 40 px | Branco a 8% | Corpo das janelas de produto |
| Acrylic | `abyss-700` a 58% com ruído de 3% | 28 px, saturação de 160% | Branco a 14% com brilho de 1 px no topo | Navegação, cards, menus |
| Acrylic fino | Branco a 7% | 16 px | Branco a 12% | Chips, botões secundários |
| Smoke | `abyss-950` a 64% | Nenhum | Nenhuma | Atrás do menu mobile |

### Tipografia

| Estilo | Fonte | Tamanho | Uso |
| --- | --- | --- | --- |
| Display | Sora 600 | 44 a 112 px, fluido | Nome do estúdio no hero |
| Título | Sora 600 | 32 a 56 px, fluido | Título de seção |
| Subtítulo | Sora 500 | 20 a 24 px | Título de card e de recurso |
| Corpo | Segoe UI Variable, com Inter como alternativa | 16 a 20 px | Parágrafos |
| Legenda | Mesma do corpo | 13 px | Barras de título, metadados |
| Sobrelinha | Cascadia Code, com monoespaçada do sistema como alternativa | 12 px, maiúsculas | Marcador de profundidade de cada seção |

Quem está no Windows vê a Segoe UI Variable, a fonte nativa do sistema. Em outros sistemas a Inter assume com métricas parecidas.

### Forma, elevação e movimento

- Raios: 8 px em controles, 12 px em janelas, 20 px em cards e 999 px em chips.
- Elevação: cards com sombra de 32 px a 28%. Janelas com sombra de 80 px a 45% e um halo `lume` de 4% para destacar do fundo.
- Entrada de elementos: 500 ms com curva `cubic-bezier(0.16, 1, 0.3, 1)`.
- Hover e press: 150 ms. Botões sobem 1 px no hover e descem no press.
- Parallax: preso ao scroll, suavizado por mola para não tremer em mouses de roda.

### Componentes

| Componente | Variantes | Observações |
| --- | --- | --- |
| Botão | Principal, vidro, sutil | Altura mínima de 44 px, ícone opcional |
| Chip | Padrão, ativo | Usado nas fontes de compartilhamento do TrytonScreens e nas etiquetas |
| Card de vidro | Padrão, com destaque | Acrylic, brilho segue o ponteiro |
| Janela | Ativa | Barra de título de 40 px com ícone, nome e os botões minimizar, maximizar e fechar do Windows 11 |
| Navegação | Desktop, mobile | Acrylic, encolhe depois de 80 px de scroll |
| Medidor de profundidade | Desktop | Trilho vertical com 6 pontos e leitura em metros |
| Cabeçalho de seção | Alinhado à esquerda, centralizado | Sobrelinha com a profundidade, título e parágrafo de apoio |

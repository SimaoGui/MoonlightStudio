# Spec 002: imersão da landing page

> Continua a `specs/001-landing-page/spec.md`. Os identificadores seguem a mesma numeração: os requisitos funcionais vão de RF-13 a RF-20 e os não funcionais de RNF-09 a RNF-11. Tudo o que a spec 001 exige continua valendo.

## Resumo

A primeira entrega fez o scroll funcionar como um mergulho. Esta segunda dá ao visitante o que fazer e o que descobrir durante a descida: o nome do estúdio se desfaz em bolhas em volta do ponteiro, cada trecho do mergulho mostra uma criatura ou um fato da profundidade real, o scroll conduz a demonstração de cada produto, a passagem pela superfície vira um evento, o fundo só aparece sob uma lanterna, e o hero ganha um tridente em 3D e som ambiente opcional.

A ideia do título em bolhas veio do time. As outras quatro saíram das referências estudadas na spec 001: The Deep Sea (neal.fun), as páginas de produto da Apple e o Igloo Inc.

## Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-13 | Título em bolhas | O nome do estúdio no hero é texto normal. Com o ponteiro perto, a parte do texto dentro de um círculo em volta do ponteiro se desfaz em centenas de bolhas, que orbitam esse círculo. Ao afastar o ponteiro, as bolhas voltam e o texto se recompõe. Um clique estoura as bolhas para longe. No toque, tocar no título faz o mesmo por alguns instantes. Parado, o título solta algumas bolhas de vez em quando, para avisar que reage |
| RF-14 | Descobertas no mergulho | Entre as seções aparecem pelo menos 5 descobertas, cada uma com ilustração, profundidade real e um fato com fonte. A ordem das profundidades é crescente e o medidor marca a profundidade de cada descoberta quando ela está no meio da tela |
| RF-15 | Zona do oceano no medidor | O medidor de profundidade mostra o nome da zona atual: luz do sol até 200 m, crepuscular até 1.000 m, meia-noite até 4.000 m e abissal a partir daí |
| RF-16 | Scroll que conduz a demonstração | A partir de 1024 px, a janela de cada produto fica fixa na tela enquanto os três recursos passam. O recurso no meio da tela fica destacado e coloca a janela no estado correspondente. Em qualquer largura, tocar ou clicar em um recurso faz o mesmo. Os controles da janela continuam funcionando à mão |
| RF-17 | Travessia da superfície | Ao rolar para fora do hero, uma lâmina d'água cruza a tela inteira seguida de uma leva de bolhas, uma vez por descida. O topo da área submersa mostra a superfície vista de baixo |
| RF-18 | Lanterna no abismo | Na seção de download, o ponteiro ou o dedo ilumina um círculo do fundo e revela o que está escondido no escuro: criaturas bioluminescentes, um fato da profundidade e uma marca do estúdio. Sem ponteiro, a luz passeia sozinha |
| RF-19 | Som ambiente opcional | Um botão na navegação liga e desliga o som, que começa desligado. O som é sintetizado no navegador, muda com a profundidade (ondas na superfície, grave abafado no fundo) e marca a travessia da superfície |
| RF-20 | Hero em WebGL | Em aparelhos capazes, o tridente do hero vira um modelo 3D que reage ao ponteiro e ao scroll. A cena carrega depois do primeiro paint. Se o WebGL faltar ou falhar, a cena em SVG da spec 001 continua no lugar |

## Requisitos não funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RNF-09 | Peso | O JavaScript inicial continua em até 150 kB comprimido (RNF-07). A cena 3D fica em um arquivo separado, baixado só quando vai ser usada |
| RNF-10 | Movimento reduzido | Com `prefers-reduced-motion`, o título não vira bolhas, a travessia não dispara, a cena 3D não carrega e a lanterna vira luz fixa. O conteúdo das descobertas e o scroll que conduz a demonstração continuam |
| RNF-11 | Sem arquivos de mídia | Nenhum áudio, vídeo ou imagem raster entra no repositório para estes efeitos |

## Descobertas e fontes

| Profundidade | Descoberta | Fato | Fonte |
| --- | --- | --- | --- |
| 120 m | Zona da luz do sol | É nos primeiros 200 m que está quase toda a luz visível do oceano | [NOAA, Layers of the Ocean](https://noaa.gov/jetstream/ocean/layers-of-ocean) |
| 630 m | Lula-gigante | Só foi filmada viva no seu habitat em 2012, a cerca de 630 m | [Phys.org, 2013](https://phys.org/news276754904.html) |
| 1.500 m | Peixe-pescador | A isca brilha em azul fraco por causa de bactérias luminosas que vivem nela | [Smithsonian Ocean](https://ocean.si.edu/node/111009) |
| 2.000 m | Cachalote | Mergulha até a zona da meia-noite atrás de comida | [NOAA, Layers of the Ocean](https://noaa.gov/jetstream/ocean/layers-of-ocean) |
| 3.800 m | Titanic | Os destroços estão a 3.800 m | [NOAA Ocean Exploration](https://oceanexplorer.noaa.gov/?p=13754) |
| 4.000 m | Pressão | A pressão passa de 5.850 psi, cerca de 400 vezes a da superfície | [NOAA, Layers of the Ocean](https://noaa.gov/jetstream/ocean/layers-of-ocean) |

Os nomes e os limites das zonas do medidor (RF-15) vêm da mesma página da NOAA.

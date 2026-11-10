/**
 * Todo o texto e todos os links da landing page ficam aqui (RF-10).
 * Para mudar uma frase, um recurso ou um link de download, edite só este arquivo.
 *
 * Itens marcados com PENDENTE são suposições que o time precisa confirmar.
 */

import type { IconName } from './components/ui/Icon'

export type SectionId = 'topo' | 'estudio' | 'player' | 'screens' | 'recursos' | 'download'

export type Feature = { icon: IconName; title: string; text: string }

/** Ordem do mergulho. `depth` é a profundidade em metros mostrada no medidor. */
export const sections: { id: SectionId; label: string; depth: number; inNav: boolean }[] = [
  { id: 'topo', label: 'Superfície', depth: 0, inNav: false },
  { id: 'estudio', label: 'Estúdio', depth: 50, inNav: true },
  { id: 'player', label: 'TrytonPlayer', depth: 200, inNav: true },
  { id: 'screens', label: 'TrytonScreens', depth: 1000, inNav: true },
  { id: 'recursos', label: 'Recursos', depth: 2500, inNav: true },
  { id: 'download', label: 'Download', depth: 4000, inNav: false },
]

export const links: { playerDownload: string | null; screensDownload: string | null; github: string } = {
  // PENDENTE: colocar aqui o link real de cada instalador (releases, site ou Microsoft Store).
  // Enquanto o valor for `null`, o card de download mostra "Download em breve" em vez de um
  // botão que não leva a lugar nenhum.
  playerDownload: null,
  screensDownload: null,
  // PENDENTE: trocar pelo GitHub do estúdio, se houver um.
  github: 'https://github.com/SimaoGui',
}

/**
 * Chamada de download de um produto. Com link, o botão baixa o instalador direto. Sem link,
 * ele leva para a seção de download, que mostra o aviso de lançamento.
 */
export function downloadCta(href: string | null): { href: string; label: string; icon: IconName } {
  return href
    ? { href, label: 'Baixar para Windows', icon: 'download' }
    : { href: '#download', label: 'Acompanhar lançamento', icon: 'arrowDown' }
}

const hasDownload = Boolean(links.playerDownload || links.screensDownload)

/** Botão de destaque da navegação. Só promete download quando existe um link de verdade. */
export const navCta: { short: string; long: string; icon: IconName } = hasDownload
  ? { short: 'Baixar', long: 'Baixar para Windows', icon: 'download' }
  : { short: 'Em breve', long: 'Acompanhar lançamento', icon: 'clock' }

export const hero = {
  overline: 'Estúdio de ferramentas para Windows',
  title: 'TryTonStudio',
  tagline:
    'Apps leves e bem acabados para o seu Windows. Feitos por três amigos, afiados como um tridente.',
  primaryCta: 'Explorar os apps',
  secondaryCta: 'Conhecer o estúdio',
}

export const studio = {
  overline: 'O estúdio',
  title: 'Três amigos, três pontas, um tridente.',
  lead: 'O TryTonStudio nasceu de três amigos que queriam ferramentas para Windows do jeito que eles mesmos gostam de usar. Cada ponta do tridente é um compromisso que vale para tudo o que lançamos.',
  // PENDENTE: confirmar se estes são os três princípios do estúdio.
  pillars: [
    {
      title: 'Leve',
      text: 'Abre na hora e fica fora do caminho. Nada de processo pesado rodando em segundo plano.',
    },
    {
      title: 'Nativo',
      text: 'Visual e comportamento de Windows 11: materiais, atalhos e janelas como o sistema espera.',
    },
    {
      title: 'Direto',
      text: 'Cada app resolve uma coisa e resolve bem. Sem cadastro e sem tela sobrando.',
    },
  ],
}

export const player = {
  name: 'TrytonPlayer',
  overline: 'TrytonPlayer',
  title: 'Aperte o play. O resto some.',
  lead: 'Um player de vídeo para Windows que abre rápido, toca seus arquivos e deixa a interface sair da frente.',
  cta: downloadCta(links.playerDownload),
  // PENDENTE: trocar pelos recursos reais do TrytonPlayer.
  features: [
    {
      icon: 'folder',
      title: 'Biblioteca local',
      text: 'Aponte suas pastas e encontre qualquer vídeo em segundos.',
    },
    {
      icon: 'queue',
      title: 'Fila sempre à mão',
      text: 'Monte a fila e pule entre vídeos sem sair da tela.',
    },
    {
      icon: 'captions',
      title: 'Legendas e velocidade',
      text: 'Troque legenda, áudio e velocidade direto do teclado.',
    },
  ] satisfies Feature[],
  /** Vídeos de demonstração da janela interativa. `seconds` é a duração fictícia. */
  queue: [
    { title: 'Recife de Coral', file: 'Recife de Coral.mp4', seconds: 48, scene: 'reef' },
    { title: 'Mar Aberto', file: 'Mar Aberto.mp4', seconds: 72, scene: 'open' },
    { title: 'Fossa Abissal', file: 'Fossa Abissal.mp4', seconds: 36, scene: 'abyss' },
  ] as const,
  caption: 'A luz do sol alcança os primeiros duzentos metros.',
}

export const screens = {
  name: 'TrytonScreens',
  overline: 'TrytonScreens',
  title: 'Mostre sua tela para a galera em um clique.',
  lead: 'Compartilhamento de tela para Windows, feito para quando você só quer mostrar a tela sem abrir um app pesado de chamada. Crie a sala, mande o convite e transmita.',
  cta: downloadCta(links.screensDownload),
  // PENDENTE: trocar pelos recursos reais do TrytonScreens.
  features: [
    {
      icon: 'bolt',
      title: 'Sala em um clique',
      text: 'Crie a sala, envie o convite e comece a transmitir.',
    },
    {
      icon: 'crop',
      title: 'Tela, janela ou região',
      text: 'Escolha exatamente o que os outros vão ver.',
    },
    {
      icon: 'sound',
      title: 'Som do sistema junto',
      text: 'Leve o áudio do jogo ou do vídeo junto com a imagem.',
    },
  ] satisfies Feature[],
  room: 'Sala do trio',
  sources: [
    { id: 'tela', label: 'Tela inteira' },
    { id: 'janela', label: 'Janela' },
    { id: 'regiao', label: 'Região' },
  ] as const,
  people: [
    { initial: 'V', name: 'Você' },
    { initial: 'A', name: 'Amigo 1' },
    { initial: 'B', name: 'Amigo 2' },
  ],
}

export const features = {
  overline: 'Em comum',
  title: 'O que vem em todo app do estúdio.',
  // PENDENTE: confirmar quais destes pontos valem para os dois apps.
  items: [
    {
      icon: 'window',
      title: 'Materiais do Windows 11',
      text: 'Mica e Acrylic de verdade, com tema claro e escuro seguindo o sistema.',
    },
    {
      icon: 'keyboard',
      title: 'Atalhos em tudo',
      text: 'O teclado chega a qualquer função. O mouse é opcional.',
    },
    {
      icon: 'gauge',
      title: 'Leve na memória',
      text: 'Consumo baixo em repouso para ficar aberto o dia todo.',
    },
    {
      icon: 'shield',
      title: 'Privacidade primeiro',
      text: 'Seus arquivos e suas transmissões ficam entre você e quem você convida.',
    },
    {
      icon: 'download',
      title: 'Instalação simples',
      text: 'Um instalador, poucos cliques, sem pacote extra.',
    },
    {
      icon: 'people',
      title: 'Feito por quem usa',
      text: 'Os três usam os apps todos os dias e corrigem o que incomoda.',
    },
  ] satisfies Feature[],
}

export const download = {
  overline: 'Fundo do mar',
  title: 'Chegou ao fundo. Hora de levar um app.',
  cards: [
    {
      name: 'TrytonPlayer',
      text: 'Player de vídeo.',
      href: links.playerDownload,
      // PENDENTE: versão, tamanho do instalador e versões do Windows suportadas.
      meta: 'Para Windows',
    },
    {
      name: 'TrytonScreens',
      text: 'Compartilhamento de tela.',
      href: links.screensDownload,
      meta: 'Para Windows',
    },
  ],
  cta: 'Baixar para Windows',
  soon: 'Download em breve',
  soonNote: 'Acompanhe o lançamento no GitHub',
}

/** Legenda mostrada embaixo das janelas interativas dos produtos. */
export const demoHint = 'Demonstração interativa. Experimente os controles.'

export const footer = {
  // PENDENTE: nomes e links dos três integrantes.
  credit: 'TryTonStudio. Feito por três amigos.',
  backToTop: 'Voltar à superfície',
}

/** Formata metros como no medidor: 1000 vira "1.000 m". */
export function formatDepth(meters: number): string {
  return `${Math.round(meters).toLocaleString('pt-BR')} m`
}

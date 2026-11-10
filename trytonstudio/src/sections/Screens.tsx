import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { ButtonLink } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { FeatureList } from '../components/ui/FeatureList'
import { Icon } from '../components/ui/Icon'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WindowFrame } from '../components/ui/WindowFrame'
import { screens } from '../content'

type SourceId = (typeof screens.sources)[number]['id']

function formatClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

const codeLines = [
  ['46%', 'bg-lume/80'],
  ['72%', 'bg-tide-400'],
  ['58%', 'bg-tide-400'],
  ['34%', 'bg-tide-200'],
  ['66%', 'bg-tide-500'],
  ['50%', 'bg-tide-500'],
]

/** The fake desktop being shared, with one overlay per source (screen, window, region). */
function SharedDesktop({ sharing, source }: { sharing: boolean; source: SourceId }) {
  const sourceLabel = screens.sources.find((item) => item.id === source)?.label
  return (
    <div className="relative aspect-video min-w-0 flex-1 overflow-hidden bg-[linear-gradient(140deg,#1d5478_0%,#123a5a_40%,#0a1d38_100%)] sm:aspect-auto sm:min-h-[290px]">
      <div aria-hidden="true">
        {/* Window A: an editor */}
        <div
          className={`absolute top-[12%] left-[7%] h-[62%] w-[56%] overflow-hidden rounded-lg border bg-abyss-900 shadow-[0_12px_32px_rgb(0_0_0/0.4)] transition duration-300 ${
            sharing && source === 'janela' ? 'z-[2] border-lume ring-2 ring-lume' : 'border-white/16'
          }`}
        >
          <div className="h-[14%] border-b border-white/8 bg-abyss-800" />
          <div className="flex flex-col gap-[7%] p-[6%]">
            {codeLines.map(([width, color]) => (
              <span key={width} className={`h-1.5 rounded-full ${color}`} style={{ width }} />
            ))}
          </div>
        </div>
        {/* Window B: a picture */}
        <div className="absolute top-[36%] left-[50%] h-[48%] w-[42%] rounded-lg border border-white/20 bg-[linear-gradient(160deg,#2f86a8,#0a1d38)] shadow-[0_12px_32px_rgb(0_0_0/0.4)]" />
        {/* Taskbar */}
        <div className="absolute inset-x-0 bottom-0 flex h-[8%] items-center justify-center gap-1.5 bg-abyss-950/60">
          <span className="size-1.5 rounded-sm bg-tide-200" />
          <span className="size-1.5 rounded-sm bg-white/40" />
          <span className="size-1.5 rounded-sm bg-white/40" />
        </div>

        {/* Dim everything but the chosen window */}
        <div
          className={`absolute inset-0 z-[1] bg-abyss-950/60 transition-opacity duration-300 ${
            sharing && source === 'janela' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {sharing && source === 'tela' && <div className="absolute inset-0 z-[3] border-2 border-lume" />}

        {sharing && source === 'regiao' && (
          <div className="absolute top-[18%] left-[22%] z-[3] h-[54%] w-[52%] border-[1.5px] border-dashed border-lume shadow-[0_0_0_2000px_rgb(4_9_21/0.58)]">
            <span className="absolute -top-1 -left-1 size-2 bg-lume" />
            <span className="absolute -top-1 -right-1 size-2 bg-lume" />
            <span className="absolute -bottom-1 -left-1 size-2 bg-lume" />
            <span className="absolute -right-1 -bottom-1 size-2 bg-lume" />
            <span className="absolute -top-7 left-0 rounded-md bg-abyss-950 px-2 py-0.5 font-mono text-[11px] text-lume">
              1280 × 720
            </span>
          </div>
        )}

        {sharing && (
          <svg
            viewBox="0 0 16 16"
            className="motion-decor absolute top-[30%] left-[30%] z-[3] size-4 animate-cursor drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)]"
          >
            <path d="M2 1l10 9H7.5L5 15z" fill="#eefafc" stroke="#040915" strokeWidth="1" />
          </svg>
        )}
      </div>

      {sharing ? (
        <p className="absolute bottom-[12%] left-3 z-[4] rounded-md bg-abyss-950/80 px-2.5 py-1 text-xs">
          Você está compartilhando · {sourceLabel}
        </p>
      ) : (
        <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center gap-1.5 bg-abyss-950/78 px-4 text-center">
          <Icon name="monitor" className="size-8 text-tide-200" />
          <p className="font-display text-lg font-medium">Ninguém está compartilhando</p>
          <p className="text-[13px] text-haze">Escolha o que mostrar e comece.</p>
        </div>
      )}
    </div>
  )
}

/** Interactive mock of a TrytonScreens room (RF-07). */
function ScreensWindow() {
  const container = useRef<HTMLDivElement>(null)
  const inView = useInView(container, { amount: 0.35 })
  const [sharing, setSharing] = useState(true)
  const [source, setSource] = useState<SourceId>('tela')
  const [mic, setMic] = useState(true)
  const [seconds, setSeconds] = useState(12)

  useEffect(() => {
    if (!sharing || !inView) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [sharing, inView])

  const toggleSharing = () => {
    setSharing((value) => !value)
    setSeconds(0)
  }

  return (
    <WindowFrame title={screens.name} icon={<Icon name="monitor" className="size-4" />} restTilt={4}>
      <div ref={container}>
        <div className="flex min-h-12 flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-white/6 px-3.5 py-2 text-[13px]">
          <strong className="font-semibold">{screens.room}</strong>
          {sharing && (
            <span className="flex items-center gap-1.5 rounded-full border border-coral/50 bg-coral/16 px-2.5 py-0.5 text-xs text-[#ffb3a7]">
              <span aria-hidden="true" className="size-2 animate-pulse-dot rounded-full bg-coral" />
              Ao vivo
              <span className="font-mono tabular-nums">{formatClock(seconds)}</span>
            </span>
          )}
          <span className="ml-auto text-fog">{screens.people.length} na sala</span>
        </div>

        <div className="flex flex-col sm:flex-row">
          <SharedDesktop sharing={sharing} source={source} />

          <ul className="flex shrink-0 gap-2 border-t border-white/6 p-2.5 text-[13px] sm:w-[156px] sm:flex-col sm:border-t-0 sm:border-l">
            {screens.people.map((person, index) => {
              const isYou = index === 0
              const status = !sharing ? 'Na sala' : isYou ? 'Transmitindo' : 'Assistindo'
              return (
                <li
                  key={person.name}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-[10px] border p-2 text-center transition-colors duration-300 sm:flex-none sm:flex-row sm:gap-2.5 sm:text-left ${
                    isYou && sharing ? 'border-lume/50 bg-white/6' : 'border-white/8 bg-white/4'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full font-semibold ${
                      isYou ? 'bg-tide-300 text-ink' : index === 1 ? 'bg-tide-500 text-foam-50' : 'bg-abyss-700 text-foam-50'
                    }`}
                  >
                    {person.initial}
                  </span>
                  <span className="flex min-w-0 max-w-full flex-col sm:pr-1">
                    <span className="flex items-center justify-center gap-1 truncate sm:justify-start">
                      {person.name}
                      {isYou && !mic && <Icon name="micOff" className="size-3.5 text-coral" />}
                    </span>
                    <span className={`text-[11px] ${isYou && sharing ? 'text-lume' : 'text-fog'}`}>
                      {status}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/6 p-2.5">
          <button
            type="button"
            aria-label="Microfone"
            aria-pressed={mic}
            onClick={() => setMic((value) => !value)}
            className={`acrylic-thin flex size-11 shrink-0 items-center justify-center rounded-[10px] transition duration-150 hover:bg-white/12 active:scale-95 ${
              mic ? 'text-foam-50' : 'text-coral'
            }`}
          >
            <Icon name={mic ? 'mic' : 'micOff'} />
          </button>
          <div role="group" aria-label="O que compartilhar" className="flex flex-wrap gap-2">
            {screens.sources.map((item) => (
              <Chip key={item.id} active={source === item.id} onClick={() => setSource(item.id)}>
                {item.label}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleSharing}
            className={`ml-auto flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold transition duration-150 active:scale-[0.97] ${
              sharing
                ? 'bg-coral text-[#2a0a05] hover:brightness-110'
                : 'bg-tide-300 text-ink hover:bg-tide-200'
            }`}
          >
            {sharing ? 'Parar de compartilhar' : 'Compartilhar tela'}
          </button>
        </div>
      </div>
    </WindowFrame>
  )
}

/** 1.000 m. TrytonScreens, screen sharing. */
export function Screens() {
  return (
    <section
      id="screens"
      className="relative mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-[clamp(3.5rem,8vw,6rem)] sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14"
    >
      <div className="flex min-w-0 flex-col gap-5 lg:order-2">
        <SectionHeading depth={1000} overline={screens.overline} title={screens.title} lead={screens.lead} />
        <FeatureList items={screens.features} />
        <div className="mt-3">
          <ButtonLink href={screens.cta.href} aria-label={`${screens.cta.label}: ${screens.name}`}>
            <Icon name={screens.cta.icon} className="size-[18px]" />
            {screens.cta.label}
          </ButtonLink>
        </div>
      </div>
      <ScreensWindow />
    </section>
  )
}

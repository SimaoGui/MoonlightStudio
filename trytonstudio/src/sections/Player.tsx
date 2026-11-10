import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useInView } from 'motion/react'
import { ButtonLink } from '../components/ui/Button'
import { FeatureList } from '../components/ui/FeatureList'
import { Icon } from '../components/ui/Icon'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WindowFrame } from '../components/ui/WindowFrame'
import { player } from '../content'

type SceneKind = (typeof player.queue)[number]['scene']

const SPEEDS = [1, 1.25, 1.5, 2]
const TICK_SECONDS = 0.25

const sceneSky: Record<SceneKind, string> = {
  reef: 'linear-gradient(180deg, #2f86a8 0%, #17466a 46%, #0a1d38 100%)',
  open: 'linear-gradient(180deg, #44a3c4 0%, #1d5478 52%, #123a5a 100%)',
  abyss: 'linear-gradient(180deg, #0d2745 0%, #08142a 55%, #040915 100%)',
}

function formatTime(seconds: number): string {
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

function formatSpeed(speed: number): string {
  return `${speed.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}x`
}

function Fish({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" className={className}>
      <path d="M2 12 C14 2 34 2 46 12 L58 4 L58 20 L46 12 C34 22 14 22 2 12 Z" fill="currentColor" />
    </svg>
  )
}

/** The "video": a small animated ocean scene that only moves while playing. */
function Scene({ kind, running }: { kind: SceneKind; running: boolean }) {
  return (
    <motion.div
      key={kind}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 [&_*]:[animation-play-state:var(--play)]"
      style={{ background: sceneSky[kind], '--play': running ? 'running' : 'paused' } as CSSProperties}
    >
      {kind !== 'abyss' && (
        <>
          <div className="absolute top-[-10%] left-[16%] h-[120%] w-[22%] animate-sway bg-linear-to-b from-foam-50/30 to-transparent blur-md" />
          <div className="absolute top-[-10%] left-[54%] h-[100%] w-[14%] animate-sway bg-linear-to-b from-foam-50/20 to-transparent blur-md [animation-delay:-4s]" />
        </>
      )}

      {kind === 'reef' && (
        <>
          <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[44%] w-full">
            <path d="M0 120 L0 70 C30 50 50 80 80 64 C110 48 120 20 150 34 C180 48 190 76 230 66 C270 56 280 28 310 40 C340 52 360 74 400 60 L400 120 Z" fill="#0c2745" />
            <path d="M0 120 L0 96 C40 84 70 104 120 94 C170 84 210 106 260 96 C310 86 350 104 400 92 L400 120 Z" fill="#071226" />
          </svg>
          <div className="absolute inset-x-0 top-[30%] animate-swim text-abyss-900/70" style={{ '--swim-duration': '14s' } as CSSProperties}>
            <Fish className="w-[14%] -scale-x-100" />
          </div>
          <div className="absolute inset-x-0 top-[46%] animate-swim text-abyss-900/55 [animation-delay:-6s]" style={{ '--swim-duration': '20s' } as CSSProperties}>
            <Fish className="w-[9%] -scale-x-100" />
          </div>
        </>
      )}

      {kind === 'open' && (
        <div className="absolute inset-x-0 top-[26%] animate-swim text-abyss-900/60" style={{ '--swim-duration': '16s' } as CSSProperties}>
          <div className="relative h-24 w-[38%]">
            <Fish className="absolute top-0 left-[30%] w-[26%] -scale-x-100" />
            <Fish className="absolute top-[32%] left-0 w-[22%] -scale-x-100" />
            <Fish className="absolute top-[44%] left-[52%] w-[24%] -scale-x-100" />
            <Fish className="absolute top-[78%] left-[24%] w-[18%] -scale-x-100" />
            <Fish className="absolute top-[10%] left-[74%] w-[16%] -scale-x-100" />
          </div>
        </div>
      )}

      {kind === 'abyss' && (
        <>
          {[
            ['18%', '30%'],
            ['34%', '62%'],
            ['58%', '24%'],
            ['72%', '54%'],
            ['86%', '36%'],
            ['46%', '44%'],
          ].map(([left, top], index) => (
            <span
              key={left}
              className="absolute size-1.5 animate-pulse-dot rounded-full bg-lume shadow-[0_0_10px_var(--color-lume)]"
              style={{ left, top, animationDelay: `${-index * 0.4}s` }}
            />
          ))}
          <svg viewBox="0 0 80 120" fill="none" className="absolute top-[18%] left-[62%] w-[13%] animate-float text-lume drop-shadow-[0_0_12px_rgb(95_242_224/0.7)]">
            <path d="M8 44 C8 18 24 6 40 6 C56 6 72 18 72 44 C64 38 56 50 48 44 C44 40 36 40 32 44 C24 50 16 38 8 44 Z" fill="currentColor" opacity="0.4" />
            <path d="M20 48 C16 66 26 78 20 100 M32 48 C36 70 26 84 32 112 M48 48 C44 70 54 84 48 112 M60 48 C64 66 54 78 60 100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          </svg>
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[20%] w-full">
            <path d="M0 60 L0 34 C60 20 110 44 180 32 C250 20 300 42 400 26 L400 60 Z" fill="#02050d" />
          </svg>
        </>
      )}
    </motion.div>
  )
}

const controlButton =
  'flex size-11 shrink-0 items-center justify-center rounded-control text-foam-50 transition duration-150 hover:bg-white/12 active:scale-95'

/** Interactive mock of TrytonPlayer (RF-06): play, pause, seek, queue, speed and captions. */
function PlayerWindow() {
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, { amount: 0.35 })
  const [playback, setPlayback] = useState({ index: 0, progress: 0.34 })
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [speedIndex, setSpeedIndex] = useState(0)
  const [captions, setCaptions] = useState(true)

  const video = player.queue[playback.index]
  const speed = SPEEDS[speedIndex]
  const running = playing && inView
  const elapsed = playback.progress * video.seconds

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setPlayback((current) => {
        const duration = player.queue[current.index].seconds
        const progress = current.progress + (TICK_SECONDS * speed) / duration
        return progress >= 1
          ? { index: (current.index + 1) % player.queue.length, progress: 0 }
          : { ...current, progress }
      })
    }, TICK_SECONDS * 1000)
    return () => window.clearInterval(timer)
  }, [running, speed])

  const select = (index: number) => {
    setPlayback({ index: (index + player.queue.length) % player.queue.length, progress: 0 })
    setPlaying(true)
  }

  return (
    <WindowFrame title={player.name} icon={<Icon name="play" className="size-4" />} restTilt={-4}>
      <div className="flex flex-col sm:flex-row">
        <div ref={stage} className="relative aspect-[4/3] min-w-0 flex-1 overflow-hidden sm:aspect-auto sm:min-h-[320px]">
          <Scene kind={video.scene} running={running} />

          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setPlaying((value) => !value)}
            className="absolute inset-0 flex cursor-pointer items-center justify-center"
          >
            <span
              className={`flex size-16 items-center justify-center rounded-full bg-abyss-950/60 text-foam-50 backdrop-blur-md transition duration-200 ${
                playing ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              <Icon name="play" className="size-7" />
            </span>
          </button>

          <p className="pointer-events-none absolute top-3 left-3.5 rounded-md bg-abyss-950/62 px-2.5 py-1 text-xs">
            {video.file}
          </p>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-b from-transparent to-abyss-950/88 px-3 pt-10 pb-2">
            {captions && (
              <p className="mx-auto mb-1 max-w-[90%] rounded bg-abyss-950/70 px-2 py-0.5 text-center text-xs text-foam-50 sm:text-[13px]">
                {player.caption}
              </p>
            )}

            <div className="group pointer-events-auto relative flex h-5 items-center rounded-full has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-lume">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/22">
                <div
                  className="h-full rounded-full bg-lume transition-[width] duration-200 ease-linear"
                  style={{ width: `${playback.progress * 100}%` }}
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute size-3 -translate-x-1/2 rounded-full bg-lume opacity-0 shadow-[0_0_10px_var(--color-lume)] transition-opacity group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
                style={{ left: `${playback.progress * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(playback.progress * 1000)}
                onChange={(event) =>
                  setPlayback((current) => ({ ...current, progress: Number(event.target.value) / 1000 }))
                }
                aria-label="Posição do vídeo"
                aria-valuetext={`${formatTime(elapsed)} de ${formatTime(video.seconds)}`}
                className="absolute inset-x-0 -top-5 h-11 w-full cursor-pointer opacity-0"
              />
            </div>

            <div className="pointer-events-auto flex items-center gap-1">
              <button
                type="button"
                aria-label="Vídeo anterior"
                onClick={() => select(playback.index - 1)}
                className={`${controlButton} max-[359px]:hidden`}
              >
                <Icon name="previous" />
              </button>
              <button
                type="button"
                aria-label={playing ? 'Pausar' : 'Reproduzir'}
                onClick={() => setPlaying((value) => !value)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-tide-300 text-ink shadow-accent transition duration-150 hover:bg-tide-200 active:scale-95"
              >
                <Icon name={playing ? 'pause' : 'play'} />
              </button>
              <button type="button" aria-label="Próximo vídeo" onClick={() => select(playback.index + 1)} className={controlButton}>
                <Icon name="next" />
              </button>
              <span className="min-w-0 flex-1 truncate pl-1 font-mono text-[11px] text-mist tabular-nums">
                {formatTime(elapsed)}
                <span className="max-sm:hidden"> / {formatTime(video.seconds)}</span>
              </span>
              <button
                type="button"
                aria-label={`Velocidade ${formatSpeed(speed)}. Trocar velocidade`}
                onClick={() => setSpeedIndex((value) => (value + 1) % SPEEDS.length)}
                className="flex h-11 min-w-12 shrink-0 items-center justify-center rounded-control px-1.5 text-xs tabular-nums transition duration-150 hover:bg-white/12"
              >
                <span className="rounded-md border border-white/25 px-1.5 py-0.5">{formatSpeed(speed)}</span>
              </button>
              <button
                type="button"
                aria-label="Legendas"
                aria-pressed={captions}
                onClick={() => setCaptions((value) => !value)}
                className={`${controlButton} ${captions ? 'text-lume' : ''}`}
              >
                <Icon name="captions" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 border-t border-white/6 p-2.5 sm:w-[190px] sm:border-t-0 sm:border-l">
          <p className="px-1.5 pb-0.5 text-xs text-fog">A seguir</p>
          <ul className="flex flex-col gap-1.5">
            {player.queue.map((item, index) => {
              const current = index === playback.index
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => select(index)}
                    aria-current={current ? 'true' : undefined}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-control p-1.5 text-left text-[13px] transition duration-150 ${
                      current
                        ? 'bg-white/8 text-foam-50 shadow-[inset_3px_0_0_var(--color-lume)]'
                        : 'text-haze hover:bg-white/6 hover:text-foam-50'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-[30px] w-[52px] shrink-0 rounded"
                      style={{ background: sceneSky[item.scene] }}
                    />
                    <span className="flex min-w-0 flex-col pr-1.5">
                      <span className="line-clamp-2 leading-snug">{item.title}</span>
                      <span className="text-[11px] text-fog tabular-nums">{formatTime(item.seconds)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </WindowFrame>
  )
}

/** 200 m. TrytonPlayer, the video player. */
export function Player() {
  return (
    <section
      id="player"
      className="relative mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-[clamp(3.5rem,8vw,6rem)] sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <SectionHeading depth={200} overline={player.overline} title={player.title} lead={player.lead} />
        <FeatureList items={player.features} />
        <div className="mt-3">
          <ButtonLink href={player.cta.href} aria-label={`${player.cta.label}: ${player.name}`}>
            <Icon name={player.cta.icon} className="size-[18px]" />
            {player.cta.label}
          </ButtonLink>
        </div>
      </div>
      <PlayerWindow />
    </section>
  )
}

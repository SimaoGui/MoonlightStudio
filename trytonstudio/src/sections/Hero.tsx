import type { CSSProperties } from 'react'
import { m, useTransform } from 'motion/react'
import { BubbleTitle } from '../components/hero/BubbleTitle'
import { HeroTrident } from '../components/hero/HeroTrident'
import { ButtonLink } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { hero } from '../content'
import { Layer, useLayerMotion, useParallax } from '../lib/parallax'
import { createRandom } from '../lib/random'

const stars = (() => {
  const random = createRandom(7)
  return Array.from({ length: 110 }, () => ({
    cx: Math.round(random() * 1600),
    cy: Math.round(random() * 520),
    r: Number((0.6 + random() * 1.3).toFixed(2)),
    opacity: Number((0.25 + random() * 0.6).toFixed(2)),
  }))
})()

type WaveProps = {
  /** Path in a 2880 x 220 box. It must repeat every 1440 px so the loop is seamless. */
  d: string
  fill: string
  duration: string
  reverse?: boolean
  opacity?: number
}

/** One strip of sea surface, twice the width of the scene, sliding sideways in a loop. */
function Wave({ d, fill, duration, reverse = false, opacity = 1 }: WaveProps) {
  return (
    <svg
      viewBox="0 0 2880 220"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 h-full w-[200%] min-w-[2880px] animate-wave"
      style={
        {
          '--wave-duration': duration,
          animationDirection: reverse ? 'reverse' : 'normal',
          opacity,
        } as CSSProperties
      }
    >
      <path d={d} fill={fill} />
    </svg>
  )
}

const waveBox = 'inset-x-[-60px] bottom-[-64px] h-[calc(var(--wave-h)+64px)] z-20'

/**
 * Surface of the dive (0 m). Eight layers move at different speeds (RF-02) and
 * follow the mouse (RF-03). As in the MoonlightStudio hero, the title is the
 * fastest layer: it sinks behind the front waves while the page scrolls.
 */
export function Hero() {
  const { scroll, intensity } = useParallax()
  const title = useLayerMotion({ speed: 1.15, pointer: -8 })
  const copy = useLayerMotion({ speed: 0.92, pointer: -5 })
  const copyOpacity = useTransform(() => 1 - Math.min(1, scroll.get() / 460) * Math.min(1, intensity.get() * 4))

  return (
    <section
      id="topo"
      className="relative isolate h-svh max-h-[1100px] min-h-[660px] overflow-hidden bg-[linear-gradient(180deg,#040a1a_0%,#0a1d38_46%,#164467_100%)]"
      style={{ '--wave-h': 'clamp(100px, 18svh, 220px)' } as CSSProperties}
    >
      {/* 1. Stars drift sideways, like the sky of the reference */}
      <Layer speed={0.5} drift={0.1} pointer={6} className="inset-x-[-160px] inset-y-0">
        <svg viewBox="0 0 1600 520" preserveAspectRatio="xMidYMin slice" className="h-[62%] w-full">
          {stars.map((star, index) => (
            <circle key={index} {...star} fill="#eefafc" />
          ))}
        </svg>
      </Layer>

      {/* 2. Moon glow behind the trident */}
      <Layer speed={0.7} pointer={10} className="inset-0">
        <div className="absolute top-[4%] left-1/2 aspect-square h-[84%] max-w-[150vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(143_211_224/0.34)_0%,rgb(103_177_196/0.12)_38%,transparent_68%)]" />
      </Layer>

      {/* 3. Rocks on the horizon */}
      <Layer speed={0.55} pointer={14} className="inset-x-[-60px] inset-y-0">
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-[calc(var(--wave-h)*0.62)] h-[clamp(90px,18svh,200px)] w-full"
        >
          <path
            d="M0 200 L0 150 L90 128 L150 142 L230 92 L300 126 L380 110 L470 150 L600 160 L760 170 L900 158 L1010 120 L1090 136 L1170 84 L1250 118 L1330 104 L1440 140 L1440 200 Z"
            fill="#0c2745"
            opacity="0.9"
          />
        </svg>
      </Layer>

      {/* 4. The trident rising from the sea */}
      <Layer speed={0.35} pointer={22} className="inset-0">
        <div className="absolute top-[max(9%,5rem)] left-1/2 aspect-square h-[58%] max-h-[96vw] -translate-x-1/2">
          <HeroTrident />
        </div>
      </Layer>

      {/* 5. Title and copy: the fastest layers */}
      <div className="absolute inset-x-0 bottom-[calc(var(--wave-h)+clamp(0.75rem,3svh,2rem))] z-10 flex flex-col items-center gap-[clamp(0.75rem,2.2svh,1.25rem)] px-5 text-center">
        <m.p
          style={{ ...copy, opacity: copyOpacity }}
          className="eyebrow rounded-full border border-white/12 bg-abyss-950/50 px-4 py-1.5 text-[0.6875rem] text-tide-200 backdrop-blur-md sm:text-xs"
        >
          {hero.overline}
        </m.p>

        <BubbleTitle
          text={hero.title}
          style={title}
          className="font-display text-[clamp(2.25rem,min(11.5vw,14svh),7.75rem)] leading-[0.95] font-semibold tracking-[-0.04em] [text-shadow:0_8px_48px_rgb(4_9_21/0.7)]"
        />

        <m.div
          style={{ ...copy, opacity: copyOpacity }}
          className="flex flex-col items-center gap-[clamp(1rem,2.6svh,1.75rem)]"
        >
          <p className="max-w-[35rem] text-[clamp(1rem,1.4vw,1.1875rem)] leading-[1.55] text-mist">
            {hero.tagline}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="#player">
              {hero.primaryCta}
              <Icon name="arrowDown" className="size-[18px]" />
            </ButtonLink>
            <ButtonLink href="#estudio" variant="glass">
              {hero.secondaryCta}
            </ButtonLink>
          </div>
        </m.div>
      </div>

      {/* 6 to 8. Three strips of waves. The front one scrolls with the page and covers the title */}
      <Layer speed={0.26} pointer={30} className={waveBox}>
        <Wave
          d="M0 40 Q360 -24 720 40 T1440 40 T2160 40 T2880 40 V220 H0 Z"
          fill="#1d5478"
          opacity={0.78}
          duration="46s"
        />
      </Layer>
      <Layer speed={0.12} pointer={40} className={waveBox}>
        <Wave
          d="M0 84 Q180 50 360 84 T720 84 T1080 84 T1440 84 T1800 84 T2160 84 T2520 84 T2880 84 V220 H0 Z"
          fill="#17466a"
          duration="30s"
          reverse
        />
      </Layer>
      <div aria-hidden="true" className={`pointer-events-none absolute ${waveBox}`}>
        <Wave
          d="M0 122 Q120 102 240 122 T480 122 T720 122 T960 122 T1200 122 T1440 122 T1680 122 T1920 122 T2160 122 T2400 122 T2640 122 T2880 122 V220 H0 Z"
          fill="#123a5a"
          duration="20s"
        />
      </div>
    </section>
  )
}

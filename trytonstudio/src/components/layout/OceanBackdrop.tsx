import type { CSSProperties } from 'react'
import { Layer } from '../../lib/parallax'
import { createRandom } from '../../lib/random'

type Dot = { left: string; top: string; size: number; opacity: number }

function makeDots(seed: number, count: number, minSize: number, maxSize: number): Dot[] {
  const random = createRandom(seed)
  return Array.from({ length: count }, () => ({
    left: `${(random() * 100).toFixed(2)}%`,
    top: `${(random() * 100).toFixed(2)}%`,
    size: Math.round(minSize + random() * (maxSize - minSize)),
    opacity: Number((0.15 + random() * 0.4).toFixed(2)),
  }))
}

// Three planes of plankton at different depths.
const farDots = makeDots(3, 70, 1, 3)
const midDots = makeDots(11, 44, 2, 4)
const nearDots = makeDots(29, 16, 8, 18)

const bubbles = (() => {
  const random = createRandom(17)
  return Array.from({ length: 22 }, () => ({
    left: `${(random() * 96).toFixed(2)}%`,
    top: `${(4 + random() * 88).toFixed(2)}%`,
    size: Math.round(6 + random() * 20),
    duration: `${(9 + random() * 10).toFixed(1)}s`,
    delay: `${(-random() * 14).toFixed(1)}s`,
    sway: `${Math.round(-18 + random() * 36)}px`,
  }))
})()

function Fish({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" className={className}>
      <path
        d="M2 12 C14 2 34 2 46 12 L58 4 L58 20 L46 12 C34 22 14 22 2 12 Z"
        fill="currentColor"
      />
    </svg>
  )
}

function School({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`motion-decor absolute inset-x-0 ${className}`}>
      <div className="relative h-24 w-56 animate-swim text-abyss-950/50" style={style}>
        <Fish className="absolute top-2 left-10 w-12 -scale-x-100" />
        <Fish className="absolute top-9 left-0 w-9 -scale-x-100" />
        <Fish className="absolute top-12 left-24 w-10 -scale-x-100" />
        <Fish className="absolute top-0 left-32 w-7 -scale-x-100" />
        <Fish className="absolute top-16 left-40 w-8 -scale-x-100" />
      </div>
    </div>
  )
}

function Jellyfish({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none">
      <path
        d="M8 44 C8 18 24 6 40 6 C56 6 72 18 72 44 C64 38 56 50 48 44 C44 40 36 40 32 44 C24 50 16 38 8 44 Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M20 48 C16 66 26 78 20 100 M32 48 C36 70 26 84 32 112 M48 48 C44 70 54 84 48 112 M60 48 C64 66 54 78 60 100"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

/**
 * Everything behind the content below the surface: light shafts, three planes
 * of plankton moving at different speeds (the page-long parallax), rising
 * bubbles, sea life and the seabed. Purely decorative.
 */
export function OceanBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Light shafts near the surface */}
      <Layer
        speed={0.22}
        className="inset-x-0 top-0 h-[1700px] [mask-image:linear-gradient(to_bottom,transparent,black_280px)]"
      >
        <div className="absolute top-[-200px] left-[10%] h-full w-[min(420px,40vw)] animate-sway bg-linear-to-b from-tide-200/16 to-transparent blur-2xl" />
        <div className="absolute top-[-200px] left-[48%] h-[80%] w-[min(260px,28vw)] animate-sway bg-linear-to-b from-tide-200/12 to-transparent blur-2xl [animation-delay:-3s]" />
        <div className="absolute top-[-200px] left-[78%] h-[65%] w-[min(180px,20vw)] animate-sway bg-linear-to-b from-tide-200/10 to-transparent blur-2xl [animation-delay:-6s]" />
      </Layer>

      {/* Plankton: far plane lags behind the page, near plane overtakes it */}
      <Layer speed={0.1} className="inset-0">
        {farDots.map((dot, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-tide-200"
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, opacity: dot.opacity }}
          />
        ))}
      </Layer>
      <Layer speed={0.04} className="inset-0">
        {midDots.map((dot, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-lume"
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, opacity: dot.opacity * 0.8 }}
          />
        ))}
      </Layer>
      <Layer speed={-0.08} className="inset-0">
        {nearDots.map((dot, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-tide-200 blur-sm"
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, opacity: dot.opacity * 0.45 }}
          />
        ))}
      </Layer>

      {/* Rising bubbles */}
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="motion-decor absolute animate-rise rounded-full border border-tide-200/30 bg-[radial-gradient(circle_at_30%_30%,rgb(238_250_252/0.18),transparent_60%)]"
          style={
            {
              left: bubble.left,
              top: bubble.top,
              width: bubble.size,
              height: bubble.size,
              animationDelay: bubble.delay,
              '--rise-duration': bubble.duration,
              '--rise-x': bubble.sway,
            } as CSSProperties
          }
        />
      ))}

      {/* Sea life */}
      <School className="top-[19%]" style={{ '--swim-duration': '46s' } as CSSProperties} />
      <School
        className="top-[43%] scale-75 opacity-70"
        style={{ '--swim-duration': '64s', animationDelay: '-30s' } as CSSProperties}
      />
      <Layer speed={-0.05} className="inset-0">
        <Jellyfish className="absolute top-[67%] left-[1.5%] hidden w-20 animate-float text-lume drop-shadow-[0_0_18px_rgb(95_242_224/0.6)] xl:block" />
        <Jellyfish className="absolute top-[77%] right-[1.5%] hidden w-12 animate-float text-tide-200 drop-shadow-[0_0_14px_rgb(143_211_224/0.5)] [animation-delay:-3s] xl:block" />
      </Layer>

      {/* Seabed */}
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[clamp(96px,11vw,150px)] w-full"
      >
        <path
          d="M0 220 L0 130 C120 104 200 162 340 140 C460 122 520 66 640 92 C760 118 820 162 960 146 C1100 130 1160 76 1280 100 C1360 114 1400 140 1440 132 L1440 220 Z"
          fill="#0a1a33"
        />
        <path
          d="M0 220 L0 176 C160 154 280 196 440 182 C620 166 760 204 940 186 C1120 170 1280 198 1440 180 L1440 220 Z"
          fill="#060e1f"
        />
        <g fill="#5ff2e0">
          <circle cx="212" cy="150" r="2.5" opacity="0.8" />
          <circle cx="236" cy="142" r="1.5" opacity="0.6" />
          <circle cx="652" cy="96" r="2.5" opacity="0.8" />
          <circle cx="676" cy="104" r="1.5" opacity="0.5" />
          <circle cx="1268" cy="104" r="2.5" opacity="0.8" />
          <circle cx="1242" cy="112" r="1.5" opacity="0.6" />
        </g>
      </svg>
    </div>
  )
}

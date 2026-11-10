import { useRef, useState, type CSSProperties } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { createRandom } from '../../lib/random'
import { sound } from '../../lib/sound'

const bubbles = (() => {
  const random = createRandom(41)
  return Array.from({ length: 38 }, () => ({
    left: `${(random() * 100).toFixed(1)}%`,
    size: Math.round(6 + random() * random() * 34),
    delay: `${(0.12 + random() * 0.55).toFixed(2)}s`,
    duration: `${(0.9 + random() * 0.9).toFixed(2)}s`,
    sway: `${Math.round(-40 + random() * 80)}px`,
  }))
})()

/**
 * Crossing the surface (RF-17).
 *
 * `SurfaceCrossing` is the event: the first time each descent scrolls past the
 * middle of the hero, a sheet of water sweeps up the whole screen followed by
 * a burst of bubbles. It is armed again near the top of the page and never
 * runs with reduced motion (RNF-10).
 */
export function SurfaceCrossing() {
  const reduced = useReducedMotion()
  const [run, setRun] = useState(0)
  const armed = useRef(true)
  const timer = useRef(0)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (value) => {
    if (reduced) return
    const hero = document.getElementById('topo')
    const height = hero ? hero.offsetHeight : window.innerHeight
    if (value < height * 0.12) armed.current = true
    const previous = scrollY.getPrevious() ?? 0
    // Only a real descent counts: a jump from a link lands far below in one step.
    if (!armed.current || value < height * 0.5 || previous >= value || value > height * 1.1) return
    armed.current = false
    sound.splash()
    setRun((count) => count + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setRun(0), 2200)
  })

  if (!run) return null
  return (
    <div key={run} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <svg
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-[70vh] w-full animate-crossing-sheet"
      >
        <defs>
          <linearGradient id="crossing-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eefafc" stopOpacity="0.5" />
            <stop offset="0.12" stopColor="#8fd3e0" stopOpacity="0.34" />
            <stop offset="0.55" stopColor="#67b1c4" stopOpacity="0.16" />
            <stop offset="1" stopColor="#67b1c4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 46 C120 10 240 70 360 40 C480 10 600 76 720 44 C840 12 960 72 1080 40 C1200 8 1320 66 1440 36 L1440 600 L0 600 Z"
          fill="url(#crossing-water)"
        />
        <path
          d="M0 46 C120 10 240 70 360 40 C480 10 600 76 720 44 C840 12 960 72 1080 40 C1200 8 1320 66 1440 36"
          fill="none"
          stroke="#eefafc"
          strokeOpacity="0.85"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 92 C140 60 260 118 400 88 C540 58 640 120 780 92 C920 64 1040 116 1180 90 C1280 72 1360 100 1440 84"
          fill="none"
          stroke="#eefafc"
          strokeOpacity="0.35"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="absolute top-full animate-crossing-bubble rounded-full border border-foam-50/60 bg-[radial-gradient(circle_at_30%_30%,rgb(238_250_252/0.4),rgb(143_211_224/0.08)_60%)]"
          style={
            {
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration,
              '--rise-x': bubble.sway,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

/**
 * The surface seen from below: strips of light that ripple at the very top of
 * the underwater part of the page, right under the waves of the hero.
 */
export function SurfaceUnderside() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(120px,18vw,220px)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_48%,transparent)]"
    >
      <svg
        viewBox="0 0 2880 200"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 h-full w-[200%] min-w-[2880px] animate-wave"
        style={{ '--wave-duration': '34s' } as CSSProperties}
      >
        <path
          d="M0 0 H2880 V58 Q2700 104 2520 58 T2160 58 T1800 58 T1440 58 T1080 58 T720 58 T360 58 T0 58 Z"
          fill="#8fd3e0"
          opacity="0.16"
        />
      </svg>
      <svg
        viewBox="0 0 2880 200"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 h-full w-[200%] min-w-[2880px] animate-wave"
        style={{ '--wave-duration': '22s', animationDirection: 'reverse' } as CSSProperties}
      >
        <path
          d="M0 0 H2880 V30 Q2760 62 2640 30 T2400 30 T2160 30 T1920 30 T1680 30 T1440 30 T1200 30 T960 30 T720 30 T480 30 T240 30 T0 30 Z"
          fill="#eefafc"
          opacity="0.14"
        />
        <path
          d="M0 30 Q120 62 240 30 T480 30 T720 30 T960 30 T1200 30 T1440 30 T1680 30 T1920 30 T2160 30 T2400 30 T2640 30 T2880 30"
          fill="none"
          stroke="#eefafc"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { abyss } from '../../content'
import { createRandom } from '../../lib/random'
import { Trident } from '../brand/Trident'
import { Icon } from '../ui/Icon'

const plankton = (() => {
  const random = createRandom(53)
  return Array.from({ length: 56 }, () => ({
    left: `${(random() * 100).toFixed(2)}%`,
    top: `${(random() * 100).toFixed(2)}%`,
    size: Math.round(2 + random() * 4),
    lume: random() > 0.35,
  }))
})()

function Jelly({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} fill="none">
      <path
        d="M8 44 C8 18 24 6 40 6 C56 6 72 18 72 44 C64 38 56 50 48 44 C44 40 36 40 32 44 C24 50 16 38 8 44 Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M20 48 C16 66 26 78 20 100 M32 48 C36 70 26 84 32 112 M48 48 C44 70 54 84 48 112 M60 48 C64 66 54 78 60 100"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

/** A lanternfish: a dark body that only shows by the row of lights along its belly. */
function Lanternfish({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none">
      <path
        d="M14 40 C40 14 110 10 150 36 L186 18 L180 40 L186 62 L150 44 C110 70 40 66 14 40 Z"
        fill="#16304f"
      />
      <circle cx="44" cy="34" r="7" fill="#8fd3e0" />
      <circle cx="46" cy="34" r="3.4" fill="#04101f" />
      <g fill="#5ff2e0">
        {[58, 74, 90, 106, 122, 138].map((x, index) => (
          <circle key={x} cx={x} cy={54 - Math.abs(index - 2.5) * 1.6} r="2.6" />
        ))}
        <circle cx="30" cy="46" r="2" />
      </g>
    </svg>
  )
}

/** Tube worms and sea pens growing from the bottom, with glowing tips. */
function Garden({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 200" className={className} fill="none" strokeLinecap="round">
      <g stroke="#24456a" strokeWidth="5">
        <path d="M30 200 C26 150 40 120 34 84" />
        <path d="M64 200 C70 160 56 130 64 60" />
        <path d="M100 200 C96 170 108 150 104 112" />
        <path d="M140 200 C146 150 132 110 142 44" />
        <path d="M182 200 C178 170 190 140 186 100" />
      </g>
      <g fill="#5ff2e0">
        <circle cx="34" cy="80" r="6" />
        <circle cx="64" cy="56" r="7" />
        <circle cx="104" cy="108" r="5" />
        <circle cx="142" cy="40" r="7" />
        <circle cx="186" cy="96" r="5.5" />
      </g>
      <g stroke="#5ff2e0" strokeWidth="2" opacity="0.7">
        <path d="M64 56 L50 40 M64 56 L78 40 M64 56 L64 34" />
        <path d="M142 40 L128 24 M142 40 L156 24 M142 40 L142 18" />
      </g>
    </svg>
  )
}

/**
 * The abyss (RF-18). It wraps the last section of the page. The bottom is
 * pitch black, and the pointer is a flashlight: a circle of light follows it
 * and reveals what hides in the dark, including a fact about the depth and a
 * mark left by the studio. Without a pointer the light wanders by itself, and
 * with reduced motion it is a fixed light over the text (RNF-10).
 *
 * The light position lives in two CSS variables, written straight to the DOM.
 */
export function Abyss({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const secrets = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = root.current
    const text = secrets.current
    if (!scene || !text) return

    let width = scene.offsetWidth
    let height = scene.offsetHeight
    // Where the text box sits inside the scene. It only changes with the layout.
    let textLeft = 0
    let textTop = 0
    const measure = () => {
      width = scene.offsetWidth
      height = scene.offsetHeight
      const outer = scene.getBoundingClientRect()
      const inner = text.getBoundingClientRect()
      textLeft = inner.left - outer.left
      textTop = inner.top - outer.top
    }
    measure()
    // Rest position: over the text at the bottom.
    const restX = () => width / 2
    const restY = () => textTop + text.offsetHeight / 2
    let x = restX()
    let y = restY()
    let targetX = x
    let targetY = y

    const place = () => {
      scene.style.setProperty('--lx', `${x.toFixed(1)}px`)
      scene.style.setProperty('--ly', `${y.toFixed(1)}px`)
      // The text is masked in its own box, so it needs its own coordinates.
      text.style.setProperty('--lx', `${(x - textLeft).toFixed(1)}px`)
      text.style.setProperty('--ly', `${(y - textTop).toFixed(1)}px`)
    }
    place()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = new ResizeObserver(() => {
      measure()
      if (reduced) {
        x = restX()
        y = restY()
        place()
      }
    })
    resize.observe(scene)

    if (reduced) return () => resize.disconnect()

    let frame = 0
    let lastMove = -Infinity

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (now - lastMove > 2600) {
        // Nobody is holding the flashlight: it sweeps the bottom by itself.
        const t = now / 1000
        targetX = width * (0.5 + 0.38 * Math.sin(t * 0.37))
        targetY = height * (0.56 + 0.34 * Math.sin(t * 0.29 + 1.3))
      }
      x += (targetX - x) * 0.085
      y += (targetY - y) * 0.085
      place()
    }

    const onPointer = (event: PointerEvent) => {
      if (!frame) return
      const box = scene.getBoundingClientRect()
      const py = event.clientY - box.top
      if (py < -160 || py > box.height + 160) return
      targetX = event.clientX - box.left
      targetY = py
      lastMove = performance.now()
    }

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) frame = requestAnimationFrame(tick)
      if (!entry.isIntersecting && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    })
    visibility.observe(scene)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      visibility.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [])

  return (
    <div
      ref={root}
      data-abyss=""
      className="relative isolate"
      style={{ '--lr': 'clamp(150px, 24vw, 300px)' } as CSSProperties}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* The beam itself: a little light scattered in the water */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_var(--lr)_at_var(--lx,50%)_var(--ly,70%),rgb(143_211_224/0.28),rgb(95_242_224/0.09)_46%,transparent)]" />
        {/* What the beam reveals */}
        <div className="abyss-mask absolute inset-0">
          {plankton.map((dot, index) => (
            <span
              key={index}
              className={`absolute rounded-full ${dot.lume ? 'bg-lume shadow-[0_0_8px_var(--color-lume)]' : 'bg-tide-200'}`}
              style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
            />
          ))}
          <Jelly className="absolute top-[9%] left-[5%] w-[clamp(3rem,7vw,5.5rem)] animate-float text-lume drop-shadow-[0_0_16px_rgb(95_242_224/0.7)]" />
          <Jelly className="absolute top-[46%] right-[4%] w-[clamp(2.25rem,5vw,4rem)] animate-float text-tide-200 drop-shadow-[0_0_14px_rgb(143_211_224/0.6)] [animation-delay:-3s]" />
          <Lanternfish className="absolute top-[14%] right-[6%] w-[clamp(6rem,13vw,11rem)] animate-float [animation-delay:-2s]" />
          <Lanternfish className="absolute top-[58%] left-[3%] w-[clamp(4.5rem,9vw,8rem)] -scale-x-100 animate-float [animation-delay:-4.5s]" />
          {/* Something is watching from the dark */}
          <div className="absolute top-[36%] left-[8%] flex gap-3 max-md:hidden">
            <span className="h-2.5 w-6 animate-blink rounded-[100%] bg-lume shadow-[0_0_14px_var(--color-lume)]" />
            <span className="h-2.5 w-6 animate-blink rounded-[100%] bg-lume shadow-[0_0_14px_var(--color-lume)]" />
          </div>
          <Garden className="absolute bottom-[clamp(40px,5vw,70px)] left-[1%] w-[clamp(6rem,14vw,12rem)]" />
          <Garden className="absolute right-[2%] bottom-[clamp(30px,4vw,60px)] w-[clamp(5rem,11vw,9.5rem)] -scale-x-100" />
        </div>
      </div>

      {children}

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-5 pb-[clamp(8.5rem,14vw,11.5rem)] text-center sm:px-8">
        <p className="flex items-center gap-2 text-[13px] text-haze motion-reduce:hidden">
          <Icon name="pointer" className="size-4 shrink-0 text-tide-200" />
          <span className="pointer-coarse:hidden">{abyss.hint}</span>
          <span className="pointer-fine:hidden">{abyss.hintTouch}</span>
        </p>
        <div
          ref={secrets}
          className="abyss-mask abyss-text grid w-full max-w-[860px] items-center gap-x-10 gap-y-6 md:grid-cols-2 md:text-left"
        >
          <div className="flex flex-col gap-1.5">
            <p className="eyebrow text-lume">4.000 m · Pressão</p>
            <p className="text-mist">{abyss.fact}</p>
            <p className="text-sm text-haze">
              Fonte:{' '}
              <a
                href={abyss.source.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-foam-50 hover:decoration-lume"
              >
                {abyss.source.label}
              </a>
            </p>
          </div>
          <p className="flex items-center justify-center gap-3 font-display text-lg text-foam-50 md:justify-end">
            <Trident className="size-9 shrink-0 text-lume drop-shadow-[0_0_14px_rgb(95_242_224/0.6)]" />
            {abyss.mark}
          </p>
        </div>
      </div>
    </div>
  )
}

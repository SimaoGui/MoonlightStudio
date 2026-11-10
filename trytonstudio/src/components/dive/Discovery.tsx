import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { formatDepth, zoneAt, type Discovery as DiscoveryItem } from '../../content'
import { useParallax } from '../../lib/parallax'
import { Reveal } from '../ui/Reveal'
import { Creature } from './creatures'

type DiscoveryProps = {
  item: DiscoveryItem
  /**
   * Side of the illustration from 768 px. On phones it always comes first. The
   * drawings on the left face right and the ones on the right face left, so
   * each animal swims towards its own text.
   */
  side?: 'left' | 'right'
}

/**
 * One discovery of the dive (RF-14): a depth mark across the page, an
 * illustration that swims past while the page scrolls, and a fact with its
 * source. When the band is in the middle of the screen the gauge shows exactly
 * this depth (see lib/depth).
 */
export function Discovery({ item, side = 'left' }: DiscoveryProps) {
  const ref = useRef<HTMLElement>(null)
  const { intensity } = useParallax()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const direction = side === 'left' ? 1 : -1
  // The wreck stays put. Everything alive crosses its half of the screen.
  const travel = item.creature === 'wreck' ? 0 : 90
  const x = useTransform(() => (scrollYProgress.get() - 0.5) * 2 * travel * direction * intensity.get())
  const y = useTransform(() => (0.5 - scrollYProgress.get()) * 2 * 28 * intensity.get())
  const titleId = `${item.id}-titulo`

  return (
    <section
      ref={ref}
      id={item.id}
      aria-labelledby={titleId}
      className="relative mx-auto max-w-[1200px] px-5 py-[clamp(2rem,6vw,4.5rem)] sm:px-8"
    >
      <p aria-hidden="true" className="flex items-center gap-4 font-mono text-xs text-tide-200">
        <span className="h-px w-8 bg-tide-200/50" />
        <span className="tabular-nums">{formatDepth(item.depth)}</span>
        <span className="h-px flex-1 bg-linear-to-r from-tide-200/40 to-transparent" />
      </p>

      <div className="mt-[clamp(1.25rem,3vw,2.5rem)] grid items-center gap-x-12 gap-y-6 md:grid-cols-2">
        <motion.div
          aria-hidden="true"
          style={{ x, y }}
          className={`flex justify-center will-change-transform ${side === 'right' ? 'md:order-2' : ''}`}
        >
          <Creature
            id={item.creature}
            className={`h-auto w-[min(100%,26rem)] ${item.creature === 'wreck' ? '' : 'animate-float'}`}
          />
        </motion.div>

        <Reveal className={side === 'right' ? 'md:order-1 md:justify-self-end' : ''}>
          <div className="acrylic-thin flex max-w-md flex-col gap-2.5 rounded-card p-6 sm:p-7">
            <p className="eyebrow text-lume">
              Descoberta · {zoneAt(item.depth).replace('Zona da ', '').replace('Zona ', '')}
            </p>
            <h3 id={titleId} className="font-display text-2xl font-medium tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="text-mist">{item.fact}</p>
            <p className="text-sm text-haze">
              Fonte:{' '}
              <a
                href={item.source.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-foam-50 hover:decoration-lume"
              >
                {item.source.label}
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

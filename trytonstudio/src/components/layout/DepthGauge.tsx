import { useEffect, useRef } from 'react'
import { useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { formatDepth, sections } from '../../content'
import { useActiveSection } from '../../lib/useActiveSection'

/** Scroll position at which each section becomes the active one. */
function measureStops(): number[] {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  let previous = -1
  return sections.map(({ id }, index) => {
    const element = document.getElementById(id)
    const top = element ? element.getBoundingClientRect().top + window.scrollY : 0
    const stop = index === 0 ? 0 : Math.min(top - window.innerHeight * 0.45, maxScroll)
    previous = Math.max(stop, previous + 1)
    return previous
  })
}

/** Linear interpolation of the depth between two consecutive sections. */
function depthAt(scroll: number, stops: number[]): number {
  for (let index = 1; index < stops.length; index += 1) {
    if (scroll <= stops[index]) {
      const span = stops[index] - stops[index - 1]
      const ratio = span > 0 ? Math.max(0, scroll - stops[index - 1]) / span : 1
      return sections[index - 1].depth + (sections[index].depth - sections[index - 1].depth) * ratio
    }
  }
  return sections[sections.length - 1].depth
}

/**
 * Side gauge shown from 1024 px (RF-04): live depth in meters and one point
 * per section. From 1024 to 1439 px the page has no free margin, so the gauge
 * is a slim rail (points plus a vertical readout). From 1440 px it shows the
 * depth of every point. The readout is written straight to the DOM, so
 * scrolling doesn't re-render React.
 */
export function DepthGauge() {
  const active = useActiveSection()
  const readout = useRef<HTMLSpanElement>(null)
  const stops = useRef<number[]>(sections.map((_, index) => index * 1000))
  const { scrollY } = useScroll()
  const depth = useTransform(() => depthAt(scrollY.get(), stops.current))

  useEffect(() => {
    const measure = () => {
      stops.current = measureStops()
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useMotionValueEvent(depth, 'change', (value) => {
    if (readout.current) readout.current.textContent = formatDepth(value)
  })

  return (
    <nav
      aria-label="Profundidade"
      className="acrylic-thin fixed top-1/2 right-1 z-40 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-2xl p-1 font-mono text-[11px] lg:flex min-[1440px]:right-5 min-[1440px]:items-stretch min-[1440px]:p-2.5"
    >
      <p className="flex justify-center border-b border-white/10 py-2 text-haze min-[1440px]:justify-start min-[1440px]:px-2 min-[1440px]:pt-0">
        <span className="sr-only">Profundidade atual: </span>
        <span
          ref={readout}
          className="text-xs text-lume tabular-nums max-[1439px]:[writing-mode:vertical-rl]"
        >
          {formatDepth(0)}
        </span>
      </p>
      {sections.map((section) => {
        const isActive = section.id === active
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${section.label}, ${formatDepth(section.depth)}`}
            title={`${section.label} · ${formatDepth(section.depth)}`}
            className={`flex size-6 items-center justify-center gap-2 rounded-md transition-colors duration-150 hover:bg-white/8 min-[1440px]:size-auto min-[1440px]:min-h-8 min-[1440px]:justify-start min-[1440px]:px-2 ${
              isActive ? 'text-lume' : 'text-haze hover:text-foam-50'
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full transition duration-300 ${
                isActive
                  ? 'scale-125 bg-lume shadow-[0_0_12px_var(--color-lume)]'
                  : 'border border-current'
              }`}
            />
            <span className="hidden tabular-nums min-[1440px]:inline">
              {formatDepth(section.depth)}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

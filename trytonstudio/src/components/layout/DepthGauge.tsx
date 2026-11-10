import { useRef } from 'react'
import { useMotionValueEvent } from 'motion/react'
import { discoveries, formatDepth, sections, zoneAt } from '../../content'
import { useDepth } from '../../lib/depth'
import { useActiveSection } from '../../lib/useActiveSection'

/** Sections and discoveries in the order of the dive. */
const points = [
  ...sections.map((section) => ({ ...section, kind: 'section' as const })),
  ...discoveries.map(({ id, title, depth }) => ({ id, label: title, depth, kind: 'discovery' as const })),
].sort((a, b) => a.depth - b.depth)

/**
 * Side gauge shown from 1024 px (RF-04): live depth in meters, the ocean zone
 * (RF-15), one point per section and a smaller mark per discovery (RF-14).
 * From 1024 to 1439 px the page has no free margin, so the gauge is a slim
 * rail (points plus a vertical readout). From 1440 px it shows the depth of
 * every point and the zone. The readout is written straight to the DOM, so
 * scrolling doesn't re-render React.
 */
export function DepthGauge() {
  const active = useActiveSection()
  const readout = useRef<HTMLSpanElement>(null)
  const zone = useRef<HTMLSpanElement>(null)
  const depth = useDepth()

  useMotionValueEvent(depth, 'change', (value) => {
    if (readout.current) readout.current.textContent = formatDepth(value)
    const name = zoneAt(value)
    if (zone.current && zone.current.textContent !== name) zone.current.textContent = name
  })

  return (
    <nav
      aria-label="Profundidade"
      className="acrylic-thin fixed top-1/2 right-1 z-40 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-2xl p-1 font-mono text-[11px] lg:flex min-[1440px]:right-5 min-[1440px]:items-stretch min-[1440px]:p-2.5"
    >
      <p className="flex flex-col items-center gap-0.5 border-b border-white/10 py-2 text-haze min-[1440px]:items-start min-[1440px]:px-2 min-[1440px]:pt-0">
        <span className="sr-only">Profundidade atual: </span>
        <span
          ref={readout}
          className="text-xs text-lume tabular-nums max-[1439px]:[writing-mode:vertical-rl]"
        >
          {formatDepth(0)}
        </span>
        <span ref={zone} data-zone="" className="text-[10px] text-haze max-[1439px]:sr-only">
          {zoneAt(0)}
        </span>
      </p>
      {points.map((section) => {
        if (section.kind === 'discovery') {
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-label={`Descoberta: ${section.label}, ${formatDepth(section.depth)}`}
              title={`${section.label} · ${formatDepth(section.depth)}`}
              className="flex h-3.5 w-6 items-center justify-center gap-2 rounded-md text-fog transition-colors duration-150 hover:bg-white/8 hover:text-foam-50 min-[1440px]:w-auto min-[1440px]:justify-start min-[1440px]:px-2"
            >
              <span aria-hidden="true" className="mx-0.5 size-1 rounded-full bg-current" />
              <span className="hidden text-[10px] tabular-nums min-[1440px]:inline">
                {formatDepth(section.depth)}
              </span>
            </a>
          )
        }
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

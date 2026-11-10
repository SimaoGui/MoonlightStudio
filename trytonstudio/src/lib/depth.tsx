import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { discoveries, sections } from '../content'
import { sound } from './sound'

/**
 * Depth of the dive, in metres, for the current scroll position.
 *
 * Every section and every discovery is a stop with a known depth. Between two
 * stops the depth is interpolated, so the gauge (RF-04), the discoveries
 * (RF-14) and the sound (RF-19) all read the same number.
 */
type Stop = { scroll: number; depth: number }

/** Where each stop sits in the viewport when the gauge shows exactly its depth. */
const marks = [
  ...sections.map(({ id, depth }) => ({ id, depth, anchor: 'top' as const })),
  ...discoveries.map(({ id, depth }) => ({ id, depth, anchor: 'middle' as const })),
].sort((a, b) => a.depth - b.depth)

function measureStops(): Stop[] {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  let previous = -1
  const stops: Stop[] = []
  for (const mark of marks) {
    const element = document.getElementById(mark.id)
    if (!element) continue
    const box = element.getBoundingClientRect()
    const top = box.top + window.scrollY
    const raw =
      mark.depth === 0
        ? 0
        : mark.anchor === 'top'
          ? top - window.innerHeight * 0.45
          : top + box.height / 2 - window.innerHeight / 2
    previous = Math.max(Math.min(raw, maxScroll), previous + 1)
    stops.push({ scroll: previous, depth: mark.depth })
  }
  return stops
}

function depthAt(scroll: number, stops: Stop[]): number {
  if (!stops.length) return 0
  for (let index = 1; index < stops.length; index += 1) {
    const from = stops[index - 1]
    const to = stops[index]
    if (scroll <= to.scroll) {
      const span = to.scroll - from.scroll
      const ratio = span > 0 ? Math.max(0, scroll - from.scroll) / span : 1
      return from.depth + (to.depth - from.depth) * ratio
    }
  }
  return stops[stops.length - 1].depth
}

const DepthContext = createContext<MotionValue<number> | null>(null)

export function DepthProvider({ children }: { children: ReactNode }) {
  const stops = useRef<Stop[]>([])
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

  useMotionValueEvent(depth, 'change', (value) => sound.setDepth(value))

  return <DepthContext.Provider value={depth}>{children}</DepthContext.Provider>
}

/** Live depth in metres. A motion value: reading it doesn't re-render React. */
export function useDepth(): MotionValue<number> {
  const depth = useContext(DepthContext)
  if (!depth) throw new Error('useDepth must be used inside <DepthProvider>')
  return depth
}

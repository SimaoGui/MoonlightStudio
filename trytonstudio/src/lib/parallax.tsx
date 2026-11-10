import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'

/**
 * Parallax engine.
 *
 * The MoonlightStudio reference moved `top`, `left` and `margin` inside a raw
 * scroll listener. Here every layer reads shared motion values and writes only
 * `transform`, straight to the DOM, without re-rendering React (RNF-02).
 *
 * - `scroll`      window scroll in px, smoothed by a spring so wheel steps don't judder
 * - `intensity`   1 from 1024 px, 0.7 on tablets, 0.4 on phones, 0 with reduced motion
 * - `pointerX/Y`  mouse position from -1 to 1, only on devices with a fine pointer
 */
type ParallaxContextValue = {
  scroll: MotionValue<number>
  intensity: MotionValue<number>
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  pointerGain: MotionValue<number>
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null)

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const scroll = useSpring(scrollY, { stiffness: 260, damping: 40, mass: 0.35 })

  const intensity = useMotionValue(1)
  const pointerGain = useMotionValue(0)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const pointerX = useSpring(rawX, { stiffness: 60, damping: 18 })
  const pointerY = useSpring(rawY, { stiffness: 60, damping: 18 })

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    const update = () => {
      const width = window.innerWidth
      intensity.set(reduced ? 0 : width >= 1024 ? 1 : width >= 640 ? 0.7 : 0.4)
      pointerGain.set(!reduced && finePointer.matches && width >= 1024 ? 1 : 0)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      rawX.set((event.clientX / window.innerWidth) * 2 - 1)
      rawY.set((event.clientY / window.innerHeight) * 2 - 1)
    }

    update()
    window.addEventListener('resize', update)
    finePointer.addEventListener('change', update)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('resize', update)
      finePointer.removeEventListener('change', update)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [reduced, intensity, pointerGain, rawX, rawY])

  const value = useMemo(
    () => ({ scroll, intensity, pointerX, pointerY, pointerGain }),
    [scroll, intensity, pointerX, pointerY, pointerGain],
  )
  return <ParallaxContext.Provider value={value}>{children}</ParallaxContext.Provider>
}

export function useParallax(): ParallaxContextValue {
  const context = useContext(ParallaxContext)
  if (!context) throw new Error('useParallax must be used inside <ParallaxProvider>')
  return context
}

export type LayerMotion = {
  /** Vertical px moved per px scrolled. 0 scrolls with the page, 1 looks pinned, above 1 sinks. */
  speed?: number
  /** Horizontal px moved per px scrolled. */
  drift?: number
  /** Max px the layer follows the mouse. */
  pointer?: number
}

/** Motion values for one layer tied to the window scroll (used by the hero). */
export function useLayerMotion({ speed = 0, drift = 0, pointer = 0 }: LayerMotion) {
  const { scroll, intensity, pointerX, pointerY, pointerGain } = useParallax()
  const x = useTransform(
    () => scroll.get() * drift * intensity.get() + pointerX.get() * pointer * pointerGain.get(),
  )
  const y = useTransform(
    () =>
      scroll.get() * speed * intensity.get() + pointerY.get() * pointer * 0.6 * pointerGain.get(),
  )
  return { x, y }
}

type LayerProps = LayerMotion & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** A decorative layer of a parallax scene. Pass its position (for example `inset-0`) in className. */
export function Layer({ className = '', style, children, ...layerMotion }: LayerProps) {
  const { x, y } = useLayerMotion(layerMotion)
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute will-change-transform ${className}`}
      style={{ ...style, x, y }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Vertical offset for an element anywhere on the page: it travels from
 * `+distance` to `-distance` px while its container crosses the viewport.
 */
export function useFloat(ref: RefObject<HTMLElement | null>, distance: number) {
  const { intensity } = useParallax()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return useTransform(() => (0.5 - scrollYProgress.get()) * 2 * distance * intensity.get())
}

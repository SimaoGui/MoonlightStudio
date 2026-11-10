import { useEffect, type PointerEvent } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import { useParallax } from './parallax'

type TiltOptions = {
  /** Max degrees added by the pointer on each axis (RF-08). */
  max?: number
  /** Resting rotation in degrees, applied only where the pointer parallax is on. */
  restX?: number
  restY?: number
}

/**
 * 3D tilt that follows the mouse over an element and springs back when it
 * leaves. It stays flat on touch devices, small screens and with reduced motion.
 */
export function useTilt({ max = 6, restX = 0, restY = 0 }: TiltOptions = {}) {
  const { pointerGain } = useParallax()
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const rotateX = useSpring(targetX, { stiffness: 150, damping: 18 })
  const rotateY = useSpring(targetY, { stiffness: 150, damping: 18 })

  useEffect(() => {
    const rest = (gain: number) => {
      targetX.set(restX * gain)
      targetY.set(restY * gain)
    }
    rest(pointerGain.get())
    return pointerGain.on('change', rest)
  }, [pointerGain, restX, restY, targetX, targetY])

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (pointerGain.get() === 0 || event.pointerType !== 'mouse') return
    const box = event.currentTarget.getBoundingClientRect()
    const nx = (event.clientX - box.left) / box.width - 0.5
    const ny = (event.clientY - box.top) / box.height - 0.5
    targetY.set(restY + nx * 2 * max)
    targetX.set(restX - ny * 2 * max)
  }

  const onPointerLeave = () => {
    const gain = pointerGain.get()
    targetX.set(restX * gain)
    targetY.set(restY * gain)
  }

  return { rotateX, rotateY, onPointerMove, onPointerLeave }
}

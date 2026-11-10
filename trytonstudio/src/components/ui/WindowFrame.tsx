import { useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { demoHint } from '../../content'
import { useFloat } from '../../lib/parallax'
import { useTilt } from '../../lib/useTilt'
import { Icon } from './Icon'

type WindowFrameProps = {
  title: string
  icon: ReactNode
  /** Resting tilt in degrees around the vertical axis: negative faces left. */
  restTilt?: number
  children: ReactNode
}

const captionButton = 'flex h-10 w-[46px] items-center justify-center transition-colors'

/**
 * Windows 11 style window in Mica: 40 px title bar with the minimize, maximize
 * and close captions. It floats with the scroll and tilts with the pointer (RF-08).
 */
export function WindowFrame({ title, icon, restTilt = 0, children }: WindowFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useFloat(ref, 36)
  const { rotateX, rotateY, onPointerMove, onPointerLeave } = useTilt({
    max: 6,
    restX: 2,
    restY: restTilt,
  })

  return (
    <div ref={ref} className="min-w-0 [perspective:1400px]">
      <motion.div
        role="group"
        aria-label={`Demonstração interativa do ${title}`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{ y, rotateX, rotateY }}
        className="mica overflow-hidden rounded-window shadow-window will-change-transform"
      >
        <div className="flex h-10 items-center gap-2.5 border-b border-white/6 pl-3.5 text-[13px] text-haze">
          <span className="text-tide-200">{icon}</span>
          <span className="flex-1 truncate">{title}</span>
          <div aria-hidden="true" className="flex">
            <span className={`${captionButton} hover:bg-white/8`}>
              <svg viewBox="0 0 12 12" className="size-[11px]" fill="none" stroke="currentColor">
                <path d="M1 6h10" />
              </svg>
            </span>
            <span className={`${captionButton} hover:bg-white/8`}>
              <svg viewBox="0 0 12 12" className="size-[11px]" fill="none" stroke="currentColor">
                <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" />
              </svg>
            </span>
            <span className={`${captionButton} hover:bg-[#c42b1c] hover:text-white`}>
              <svg viewBox="0 0 12 12" className="size-[11px]" fill="none" stroke="currentColor">
                <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
              </svg>
            </span>
          </div>
        </div>
        {children}
      </motion.div>
      <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-fog">
        <Icon name="pointer" className="size-4 text-tide-200" />
        {demoHint}
      </p>
    </div>
  )
}

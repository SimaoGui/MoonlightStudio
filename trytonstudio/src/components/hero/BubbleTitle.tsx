import { useEffect, useRef } from 'react'
import { m, useReducedMotion, type MotionStyle } from 'motion/react'
import { createBubbleField } from '../../lib/bubbleField'
import { sound } from '../../lib/sound'

type BubbleTitleProps = {
  text: string
  style?: MotionStyle
  className?: string
}

/**
 * The studio name in the hero (RF-13). It is ordinary text, and near the
 * pointer the letters dissolve into bubbles that orbit a circle around it.
 * With reduced motion it is only the text.
 */
export function BubbleTitle({ text, style, className = '' }: BubbleTitleProps) {
  const reduced = useReducedMotion()
  const host = useRef<HTMLHeadingElement>(null)
  const letters = useRef<HTMLSpanElement>(null)
  const baseline = useRef<HTMLSpanElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced || !host.current || !letters.current || !baseline.current || !canvas.current) return
    return createBubbleField({
      host: host.current,
      letters: letters.current,
      baseline: baseline.current,
      canvas: canvas.current,
      onFizz: () => sound.fizz(),
      onPop: () => sound.pop(),
    })
  }, [reduced, text])

  return (
    <m.h1 ref={host} style={style} aria-label={text} className={`relative ${className}`}>
      <span ref={letters} className="bubble-mask block">
        {Array.from(text).map((letter, index) => (
          <m.span
            key={index}
            data-letter=""
            aria-hidden="true"
            className="inline-block"
            initial={{ opacity: 0, y: reduced ? 0 : 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {letter}
          </m.span>
        ))}
        <span ref={baseline} aria-hidden="true" className="inline-block h-0 w-0 align-baseline" />
      </span>
      {!reduced && (
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 max-w-none" />
      )}
    </m.h1>
  )
}

import { useId } from 'react'

/** Outline of the TryTonStudio trident, redrawn as a vector from the 64 px icon. */
export const TRIDENT_PATH =
  'M32 2.5 L37.2 15.8 L34 14.8 L34 30 Q34.2 34.4 37.6 34.4 Q41.4 34.4 41.6 30 L41.6 22.4 L39.6 20.6 L42.2 17.6 Q45 12.4 50.4 8.6 Q47.6 14.6 46.8 20 L46.8 31 Q47 34.4 49 36.4 Q45.6 39.8 41.6 41.4 Q37.4 43.2 35.6 46.6 Q34.6 48.6 34.6 51 Q34.6 56.4 30.4 59.4 Q26 62.2 20.6 60.6 Q18 59.6 17.4 57.6 Q21.6 58 25.4 56 Q29.2 54 29.4 50.6 Q29.4 48.4 28.4 46.6 Q26.6 43.2 22.4 41.4 Q18.4 39.8 15 36.4 Q17 34.4 17.2 31 L17.2 20 Q16.4 14.6 13.6 8.6 Q19 12.4 21.8 17.6 L24.4 20.6 L22.4 22.4 L22.4 30 Q22.6 34.4 26.4 34.4 Q29.8 34.4 30 30 L30 14.8 L26.8 15.8 Z'

type TridentProps = {
  className?: string
  /** `gradient` paints the icon's teal-to-navy ramp, `solid` uses currentColor. */
  tone?: 'gradient' | 'solid'
  title?: string
}

export function Trident({ className, tone = 'solid', title }: TridentProps) {
  const id = useId()
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {tone === 'gradient' && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7f6fa" />
            <stop offset="0.4" stopColor="#67b1c4" />
            <stop offset="0.85" stopColor="#1f4a69" />
          </linearGradient>
        </defs>
      )}
      <path fill={tone === 'gradient' ? `url(#${id})` : 'currentColor'} d={TRIDENT_PATH} />
    </svg>
  )
}

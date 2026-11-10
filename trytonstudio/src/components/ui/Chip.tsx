import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
}

/** Pill toggle. `active` paints the lume outline and sets aria-pressed. */
export function Chip({ active = false, className = '', children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] transition duration-150 ${
        active
          ? 'border-lume/50 bg-lume/12 text-foam-50'
          : 'border-white/10 bg-white/6 text-haze hover:bg-white/10 hover:text-foam-50'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

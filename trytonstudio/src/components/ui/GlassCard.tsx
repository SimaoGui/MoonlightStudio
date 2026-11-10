import type { HTMLAttributes, PointerEvent, ReactNode } from 'react'

type GlassCardProps = HTMLAttributes<HTMLElement> & { children: ReactNode }

/** Acrylic card with a soft highlight that follows the pointer. */
export function GlassCard({ className = '', children, ...props }: GlassCardProps) {
  const trackPointer = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`)
  }
  return (
    <article
      onPointerMove={trackPointer}
      className={`acrylic glow-follow rounded-card transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-white/25 ${className}`}
      {...props}
    >
      {children}
    </article>
  )
}

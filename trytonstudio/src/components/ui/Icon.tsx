import type { ReactNode } from 'react'

const strokeIcons = {
  download: <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />,
  arrowDown: <path d="M12 5v14m0 0l-6-6m6 6l6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  folder: <path d="M3 7a2 2 0 012-2h4l2 2.5h8a2 2 0 012 2V17a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  queue: <path d="M4 6h16M4 12h16M4 18h10" />,
  captions: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15h4M13 15h4M7 11.5h2M11 11.5h6" />
    </>
  ),
  bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  crop: <path d="M7 3v14h14M3 7h14v14" />,
  sound: <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />,
  muted: <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM16 9.5l5 5M21 9.5l-5 5" />,
  window: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </>
  ),
  gauge: <path d="M12 14l4-5M5.2 17a8 8 0 1113.6 0" />,
  shield: <path d="M12 3l7 3v5.5c0 4.4-3 7.7-7 9.5-4-1.8-7-5.1-7-9.5V6z" />,
  people: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M2.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M15.5 14.6c2.6-.3 4.8 1.2 5.5 3.9" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16v4" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
    </>
  ),
  micOff: (
    <>
      <path d="M9 9V6a3 3 0 015.8-1.1M15 10.5V11a3 3 0 01-4.7 2.5" />
      <path d="M5.5 11a6.5 6.5 0 0010.4 5.2M18.5 11c0 .8-.15 1.6-.4 2.3M12 17.5V21M4 4l16 16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pointer: <path d="M5 3.5l13 7.5-5.5 1.6L10.8 18.5z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  link: <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  github: (
    <path d="M9 19c-4 1.3-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 3.3 5.4 3.6 5.4 3.6a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21.5" />
  ),
} satisfies Record<string, ReactNode>

const solidIcons = {
  play: <path d="M8 5.5v13l11-6.5z" />,
  pause: <path d="M7 5h4v14H7zM13 5h4v14h-4z" />,
  previous: <path d="M6 6h2v12H6zM20 6l-10 6 10 6z" />,
  next: <path d="M16 6h2v12h-2zM4 6l10 6-10 6z" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof strokeIcons | keyof typeof solidIcons

type IconProps = { name: IconName; className?: string }

/** Decorative 24 px icon. Controls that show only an icon carry their own aria-label. */
export function Icon({ name, className = 'size-5' }: IconProps) {
  if (name in solidIcons) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        {solidIcons[name as keyof typeof solidIcons]}
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {strokeIcons[name as keyof typeof strokeIcons]}
    </svg>
  )
}

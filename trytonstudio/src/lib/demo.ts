/**
 * Layout shared by the two product sections (RF-16).
 *
 * The demo window sits in the `demo` grid area. From 1024 px that area spans
 * the whole height of the section and the window sticks to the middle of the
 * screen while the feature steps scroll past it.
 */
export const pinnedDemo =
  'min-w-0 scroll-mt-24 [grid-area:demo] lg:sticky lg:top-[max(6.5rem,calc(50svh-15.5rem))] lg:self-start'

/**
 * Below 1024 px the window is not pinned, so choosing a feature could change a
 * window that is off screen. Bring it back into view when that happens.
 */
export function revealDemo(frame: HTMLElement | null) {
  if (!frame || window.matchMedia('(min-width: 1024px)').matches) return
  const box = frame.getBoundingClientRect()
  if (box.top < 72 || box.top > window.innerHeight * 0.55) frame.scrollIntoView({ block: 'start' })
}

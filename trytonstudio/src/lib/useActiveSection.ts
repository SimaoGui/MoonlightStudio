import { useEffect, useState } from 'react'
import { sections, type SectionId } from '../content'

/**
 * Returns the id of the section crossing the middle of the viewport. Feeds the
 * active link in the navigation (RF-01) and the depth gauge (RF-04).
 */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('topo')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId)
        }
      },
      // A thin band around the middle of the viewport decides the active section.
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const { id } of sections) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return active
}

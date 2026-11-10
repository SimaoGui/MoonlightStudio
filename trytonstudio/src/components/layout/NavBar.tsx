import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { navCta, sections, soundToggle } from '../../content'
import { sound } from '../../lib/sound'
import { useActiveSection } from '../../lib/useActiveSection'
import { Trident } from '../brand/Trident'
import { ButtonLink } from '../ui/Button'
import { Icon } from '../ui/Icon'

const navLinks = sections.filter((section) => section.inNav)

/**
 * Fixed Acrylic navigation (RF-01). Highlights the visible section, shrinks
 * after 80 px of scroll and turns into a sheet menu below 768 px.
 */
export function NavBar() {
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const soundOn = useSyncExternalStore(sound.subscribe, sound.getSnapshot)

  useMotionValueEvent(scrollY, 'change', (value) => setCompact(value > 80))

  useEffect(() => {
    if (!open) return
    sheetRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    // The sheet only exists below 768 px: close it if the window grows.
    const desktop = window.matchMedia('(min-width: 768px)')
    const onDesktop = () => desktop.matches && setOpen(false)
    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onDesktop)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onDesktop)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-control focus:bg-tide-300 focus:px-4 focus:py-3 focus:font-semibold focus:text-ink"
      >
        Pular para o conteúdo
      </a>

      <nav
        aria-label="Principal"
        className={`acrylic mx-auto flex max-w-[1200px] items-center justify-between gap-3 rounded-2xl pr-2 pl-4 transition-[padding] duration-300 ease-out-expo ${
          compact ? 'py-1' : 'py-2'
        }`}
      >
        <a
          href="#topo"
          className="flex min-h-11 items-center gap-2.5 font-display text-[17px] font-semibold tracking-[-0.01em]"
        >
          <Trident className="size-7 text-tide-200" />
          TryTonStudio
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? 'true' : undefined}
                className={`flex min-h-11 items-center rounded-control px-3.5 text-sm transition-colors duration-150 ${
                  active === link.id
                    ? 'bg-white/10 text-foam-50'
                    : 'text-haze hover:bg-white/6 hover:text-foam-50'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {sound.supported && (
            <button
              type="button"
              aria-label={soundToggle.label}
              aria-pressed={soundOn}
              title={soundOn ? soundToggle.turnOff : soundToggle.turnOn}
              onClick={() => void sound.toggle()}
              className={`acrylic-thin flex size-11 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-150 hover:bg-white/12 ${
                soundOn ? 'text-lume' : 'text-haze'
              }`}
            >
              <Icon name={soundOn ? 'sound' : 'muted'} />
            </button>
          )}

          <div className="hidden md:block">
            <ButtonLink href="#download" className="!min-h-11 !px-4 text-sm">
              <Icon name={navCta.icon} className="size-[18px]" />
              {navCta.short}
            </ButtonLink>
          </div>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((value) => !value)}
            className="acrylic-thin flex size-11 items-center justify-center rounded-[10px] md:hidden"
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              aria-hidden="true"
              className="smoke fixed inset-0 -z-10 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <m.div
              ref={sheetRef}
              id="menu-mobile"
              className="acrylic mx-auto mt-2 flex max-w-[1200px] flex-col gap-1 rounded-2xl p-2 md:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={`flex min-h-12 items-center rounded-control px-4 text-base ${
                    active === link.id ? 'bg-white/10 text-foam-50' : 'text-mist'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <ButtonLink href="#download" onClick={() => setOpen(false)} className="mt-1">
                <Icon name={navCta.icon} className="size-[18px]" />
                {navCta.long}
              </ButtonLink>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

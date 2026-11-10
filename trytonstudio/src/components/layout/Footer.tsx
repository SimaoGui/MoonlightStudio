import { footer, links, sections } from '../../content'
import { Trident } from '../brand/Trident'
import { Icon } from '../ui/Icon'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="relative z-10 bg-[#060e1f] text-sm text-fog">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-2.5">
          <Trident className="size-5 text-tide-300" />© {year} {footer.credit}
        </p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {sections
            .filter((section) => section.inNav)
            .map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex min-h-11 items-center text-tide-200 hover:text-foam-50"
                >
                  {section.label}
                </a>
              </li>
            ))}
          <li>
            <a
              href={links.github}
              className="flex min-h-11 items-center gap-1.5 text-tide-200 hover:text-foam-50"
            >
              <Icon name="github" className="size-4" />
              GitHub
            </a>
          </li>
          <li>
            <a href="#topo" className="flex min-h-11 items-center text-tide-200 hover:text-foam-50">
              {footer.backToTop}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

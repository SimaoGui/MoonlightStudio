import type { Feature } from '../../content'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

/** Icon, title and one line for each product feature. */
export function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item.title}>
          <Reveal delay={0.08 * index} className="flex gap-3.5">
            <span className="acrylic-thin flex size-10 shrink-0 items-center justify-center rounded-[10px] text-tide-200">
              <Icon name={item.icon} />
            </span>
            <span className="flex flex-col">
              <strong className="font-semibold">{item.title}</strong>
              <span className="text-haze">{item.text}</span>
            </span>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}

import { GlassCard } from '../components/ui/GlassCard'
import { Icon } from '../components/ui/Icon'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { features } from '../content'

/** 2.500 m. What both apps share, in a grid of glass cards. */
export function Features() {
  return (
    <section
      id="recursos"
      className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-[clamp(3.5rem,8vw,6rem)] sm:px-8"
    >
      <SectionHeading depth={2500} overline={features.overline} title={features.title} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.items.map((item, index) => (
          <li key={item.title}>
            <Reveal delay={0.06 * (index % 3)} className="h-full">
              <GlassCard className="flex h-full flex-col gap-2.5 p-6">
                <Icon name={item.icon} className="size-6 text-tide-200" />
                <h3 className="mt-1.5 font-display text-xl font-medium">{item.title}</h3>
                <p className="text-haze">{item.text}</p>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

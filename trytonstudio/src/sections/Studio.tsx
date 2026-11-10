import { GlassCard } from '../components/ui/GlassCard'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { studio } from '../content'

/** 50 m. Who the studio is: three friends, three principles, one per prong. */
export function Studio() {
  return (
    <section
      id="estudio"
      className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-5 pt-[clamp(5rem,11vw,8rem)] pb-[clamp(3.5rem,8vw,6rem)] sm:px-8"
    >
      <SectionHeading depth={50} overline={studio.overline} title={studio.title} lead={studio.lead} />
      <ol className="grid gap-5 md:grid-cols-3">
        {studio.pillars.map((pillar, index) => (
          <li key={pillar.title}>
            <Reveal delay={0.1 * index} className="h-full">
              <GlassCard className="flex h-full flex-col gap-3 p-7">
                <span className="font-mono text-xs text-tide-200">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-2xl font-medium tracking-[-0.01em]">
                  {pillar.title}
                </h3>
                <p className="text-haze">{pillar.text}</p>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}

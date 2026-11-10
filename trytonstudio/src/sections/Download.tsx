import { Trident } from '../components/brand/Trident'
import { ButtonLink } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { Icon } from '../components/ui/Icon'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { download, links } from '../content'

/** 4.000 m. The seabed: final call with both downloads. `Abyss` wraps it with the flashlight (RF-18). */
export function Download() {
  return (
    <section
      id="download"
      className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-5 pt-[clamp(3.5rem,8vw,6rem)] pb-10 sm:px-8"
    >
      <Reveal>
        <Trident className="size-[72px] animate-float text-lume drop-shadow-[0_0_24px_rgb(95_242_224/0.5)]" />
      </Reveal>
      <SectionHeading
        depth={4000}
        overline={download.overline}
        title={download.title}
        align="center"
      />
      <ul className="grid w-full max-w-[860px] gap-5 sm:grid-cols-2">
        {download.cards.map((card, index) => (
          <li key={card.name}>
            <Reveal delay={0.1 * index} className="h-full">
              <GlassCard className="flex h-full flex-col gap-3 p-7">
                <h3 className="font-display text-2xl font-semibold">{card.name}</h3>
                <p className="text-haze">{card.text}</p>
                {card.href ? (
                  <>
                    <ButtonLink
                      href={card.href}
                      className="mt-3 w-full"
                      aria-label={`${download.cta}: ${card.name}`}
                    >
                      <Icon name="download" className="size-[18px]" />
                      {download.cta}
                    </ButtonLink>
                    <p className="text-[13px] text-fog">{card.meta}</p>
                  </>
                ) : (
                  <>
                    <p className="acrylic-thin mt-3 flex min-h-12 items-center justify-center gap-2.5 rounded-[10px] px-6 font-medium text-mist">
                      <Icon name="clock" className="size-[18px] text-tide-200" />
                      {download.soon}
                    </p>
                    <p className="text-[13px] text-fog">
                      {card.meta} ·{' '}
                      <a href={links.github} className="text-tide-200 underline-offset-4 hover:underline">
                        {download.soonNote}
                      </a>
                    </p>
                  </>
                )}
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

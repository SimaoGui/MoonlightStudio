import { formatDepth } from '../../content'
import { Reveal } from './Reveal'

type SectionHeadingProps = {
  depth: number
  overline: string
  title: string
  lead?: string
  align?: 'left' | 'center'
}

/** Depth marker, section title and optional lead paragraph. */
export function SectionHeading({ depth, overline, title, lead, align = 'left' }: SectionHeadingProps) {
  return (
    <Reveal
      className={`flex max-w-3xl flex-col gap-4 ${align === 'center' ? 'mx-auto items-center text-center' : ''}`}
    >
      <p className="eyebrow text-lume">
        {formatDepth(depth)} · {overline}
      </p>
      <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
        {title}
      </h2>
      {lead && <p className="text-[clamp(1.0625rem,1.35vw,1.1875rem)] text-mist">{lead}</p>}
    </Reveal>
  )
}

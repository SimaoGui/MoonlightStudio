import { useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { stepsHint, type Feature } from '../../content'
import { Icon } from './Icon'

/** What a product window exposes so the features can drive it (RF-16). */
export type DemoHandle = { applyStep: (index: number) => void }

type FeatureStepsProps = {
  items: Feature[]
  /** Name of the product, for the accessible name of the list. */
  product: string
  /** Runs when a feature becomes the active one, by scroll or by click. */
  onStep: (index: number) => void
}

/**
 * The features of a product as steps that drive its demo window (RF-16).
 *
 * From 1024 px each step is about half a screen tall and the window next to it
 * is pinned: the step crossing the middle of the viewport becomes the active
 * one. At any width, a step is also a button that does the same on click.
 */
export function FeatureSteps({ items, product, onStep }: FeatureStepsProps) {
  const [active, setActive] = useState(-1)
  const steps = useRef<(HTMLLIElement | null)[]>([])
  const scrolledTo = useRef(-1)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', () => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    const middle = window.innerHeight / 2
    let found = -1
    steps.current.forEach((step, index) => {
      if (!step) return
      const box = step.getBoundingClientRect()
      if (box.top <= middle && box.bottom > middle) found = index
    })
    // Leaving the list forgets the last step, so coming back applies it again.
    if (found === scrolledTo.current) return
    scrolledTo.current = found
    if (found === -1) return
    setActive(found)
    onStep(found)
  })

  const choose = (index: number) => {
    setActive(index)
    onStep(index)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-[13px] text-haze">
        <Icon name="pointer" className="size-4 shrink-0 text-tide-200" />
        <span className="lg:hidden">{stepsHint.narrow}</span>
        <span className="max-lg:hidden">{stepsHint.wide}</span>
      </p>
      <ol aria-label={`Recursos do ${product}`} className="flex flex-col gap-1.5 lg:gap-0">
        {items.map((item, index) => {
          const isActive = index === active
          return (
            <li
              key={item.title}
              ref={(element) => {
                steps.current[index] = element
              }}
              className="lg:flex lg:min-h-[42svh] lg:items-center"
            >
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => choose(index)}
                className={`flex w-full items-start gap-3.5 rounded-2xl border p-3 text-left transition duration-300 ease-out-expo ${
                  isActive
                    ? 'border-lume/40 bg-white/7'
                    : 'border-transparent hover:bg-white/5 lg:opacity-70 lg:hover:opacity-100'
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-300 ${
                    isActive ? 'bg-lume text-ink' : 'acrylic-thin text-tide-200'
                  }`}
                >
                  <Icon name={item.icon} />
                </span>
                <span className="flex flex-col">
                  <span className="font-mono text-[11px] text-tide-200 tabular-nums max-lg:hidden">
                    {index + 1} de {items.length}
                  </span>
                  <strong className="font-semibold lg:font-display lg:text-xl lg:font-medium lg:tracking-[-0.01em]">
                    {item.title}
                  </strong>
                  <span className="text-haze">{item.text}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

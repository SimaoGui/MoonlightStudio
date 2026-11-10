import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'glass' | 'subtle'

const base =
  'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[10px] px-6 text-base transition duration-150 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary: 'bg-tide-300 font-semibold text-ink shadow-accent hover:bg-tide-200',
  glass: 'acrylic-thin font-medium text-foam-50 hover:bg-white/12',
  subtle: 'font-medium text-tide-200 hover:bg-white/8 hover:text-foam-50',
}

type CommonProps = { variant?: Variant; className?: string; children: ReactNode }

/** Link styled as a button. Use it for navigation and downloads. */
export function ButtonLink({
  variant = 'primary',
  className = '',
  children,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </a>
  )
}

/** Real button, for actions that change something on the page. */
export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

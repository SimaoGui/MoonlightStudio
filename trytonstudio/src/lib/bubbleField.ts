/**
 * Bubble field behind the hero title (RF-13).
 *
 * The title stays real text. Its glyphs are sampled into a few hundred points,
 * and each point owns one bubble that is invisible while it rests on its glyph.
 * When the pointer comes close, the text inside a circle around the pointer is
 * masked out and the bubbles that live there are pushed to the edge of that
 * circle, where they orbit. Move away and they spring back into the letters.
 *
 * Everything runs on one 2D canvas, outside React, and the loop sleeps
 * whenever there is nothing to draw.
 */

type Particle = {
  hx: number
  hy: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  angle: number
  spin: number
  ring: number
  phase: number
  held: boolean
  /** Seconds left of a free "leak" towards the surface. 0 when not leaking. */
  leak: number
  leakLife: number
}

export type BubbleFieldOptions = {
  /** The heading element. The canvas is positioned against it. */
  host: HTMLElement
  /** Wrapper of the letters. It receives the mask that opens the hole in the text. */
  letters: HTMLElement
  /** Zero-height inline element sitting on the text baseline. */
  baseline: HTMLElement
  canvas: HTMLCanvasElement
  onFizz?: () => void
  onPop?: () => void
}

const MAX_PARTICLES = 1500
const TAU = Math.PI * 2

function makeSprite(): HTMLCanvasElement {
  const size = 64
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const ctx = sprite.getContext('2d')
  if (!ctx) return sprite
  const c = size / 2
  const body = ctx.createRadialGradient(c, c, c * 0.2, c, c, c - 2)
  body.addColorStop(0, 'rgba(143, 211, 224, 0.05)')
  body.addColorStop(0.72, 'rgba(143, 211, 224, 0.16)')
  body.addColorStop(1, 'rgba(238, 250, 252, 0.5)')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(c, c, c - 2, 0, TAU)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(238, 250, 252, 0.92)'
  ctx.stroke()
  // Highlight on the upper left, the detail that makes a circle read as a bubble.
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(c, c, c * 0.56, Math.PI * 1.08, Math.PI * 1.42)
  ctx.stroke()
  return sprite
}

/** The large bubble that surrounds the pointer: a thin membrane and two highlights. */
function makeLens(): HTMLCanvasElement {
  const size = 384
  const lens = document.createElement('canvas')
  lens.width = size
  lens.height = size
  const ctx = lens.getContext('2d')
  if (!ctx) return lens
  const c = size / 2
  const r = c - 4
  const body = ctx.createRadialGradient(c, c, r * 0.55, c, c, r)
  body.addColorStop(0, 'rgba(143, 211, 224, 0)')
  body.addColorStop(0.82, 'rgba(143, 211, 224, 0.05)')
  body.addColorStop(1, 'rgba(238, 250, 252, 0.26)')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(c, c, r, 0, TAU)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(238, 250, 252, 0.5)'
  ctx.stroke()
  ctx.lineCap = 'round'
  ctx.lineWidth = 5
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.beginPath()
  ctx.arc(c, c, r * 0.86, Math.PI * 1.1, Math.PI * 1.36)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(95, 242, 224, 0.4)'
  ctx.beginPath()
  ctx.arc(c, c, r * 0.9, Math.PI * 0.14, Math.PI * 0.3)
  ctx.stroke()
  return lens
}

export function createBubbleField({ host, letters, baseline, canvas, onFizz, onPop }: BubbleFieldOptions) {
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const ctx: CanvasRenderingContext2D = context

  const sprite = makeSprite()
  const lens = makeLens()
  let particles: Particle[] = []
  let pad = 0
  let radius = 0
  let width = 0
  let height = 0
  let dpr = 1
  let maskLeft = 0
  let maskTop = 0

  // Pointer, in viewport coordinates.
  let clientX = -9999
  let clientY = -9999
  let hovering = false
  let touchUntil = 0
  // Last position of the hole, in canvas coordinates. It stays put while the hole closes.
  let holeX = 0
  let holeY = 0
  let hole = 0
  let burstUntil = 0
  let wasActive = false

  let frame = 0
  let last = 0
  let inView = true
  let leakTimer = 0
  let disposed = false

  function build() {
    const style = getComputedStyle(host)
    const fontSize = parseFloat(style.fontSize)
    radius = Math.max(52, Math.min(150, fontSize * 0.92))
    pad = Math.ceil(radius * 1.45 + 16)
    width = host.offsetWidth + pad * 2
    height = host.offsetHeight + pad * 2
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    maskLeft = letters.offsetLeft
    maskTop = letters.offsetTop
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.style.transform = `translate(${-pad}px, ${-pad}px)`

    // Draw every letter where the browser laid it out, then keep the opaque pixels.
    const stencil = document.createElement('canvas')
    stencil.width = width
    stencil.height = height
    const sctx = stencil.getContext('2d', { willReadFrequently: true })
    if (!sctx) return
    sctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    sctx.textBaseline = 'alphabetic'
    sctx.fillStyle = '#fff'
    const baselineY = baseline.offsetTop + pad
    for (const letter of letters.querySelectorAll<HTMLElement>('[data-letter]')) {
      sctx.fillText(letter.textContent ?? '', letter.offsetLeft + pad, baselineY)
    }

    const step = Math.max(3, Math.min(5, Math.round(fontSize / 26)))
    const data = sctx.getImageData(0, 0, width, height).data
    const next: Particle[] = []
    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        if (data[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < 128) continue
        const jitterX = (Math.random() - 0.5) * step * 0.7
        const jitterY = (Math.random() - 0.5) * step * 0.7
        const size = Math.random()
        next.push({
          hx: x + jitterX,
          hy: y + jitterY,
          x: x + jitterX,
          y: y + jitterY,
          vx: 0,
          vy: 0,
          r: step * (size > 0.94 ? 1.25 + Math.random() * 0.7 : 0.34 + size * size * 0.7),
          alpha: 0,
          angle: 0,
          spin: (0.35 + Math.random() * 1.25) * (Math.random() < 0.84 ? 1 : -1),
          ring: Math.random(),
          phase: Math.random() * TAU,
          held: false,
          leak: 0,
          leakLife: 1,
        })
      }
    }
    // Too many points on a huge screen: thin them out evenly.
    if (next.length > MAX_PARTICLES) {
      const keep = MAX_PARTICLES / next.length
      particles = next.filter(() => Math.random() < keep)
    } else {
      particles = next
    }
  }

  function setMask() {
    // The mask box is the letters wrapper, which is larger than the heading.
    letters.style.setProperty('--bx', `${holeX - pad - maskLeft}px`)
    letters.style.setProperty('--by', `${holeY - pad - maskTop}px`)
    letters.style.setProperty('--br', `${hole < 0.5 ? 0 : hole}px`)
  }

  function leakSome() {
    if (!particles.length) return
    const count = 10 + Math.floor(Math.random() * 8)
    // Bubbles escape from one stretch of the word, not from everywhere at once.
    const centre = particles[Math.floor(Math.random() * particles.length)]
    let released = 0
    for (let tries = 0; tries < count * 30 && released < count; tries += 1) {
      const p = particles[Math.floor(Math.random() * particles.length)]
      if (p.leak > 0 || p.held || Math.abs(p.hx - centre.hx) > radius * 1.4) continue
      p.leakLife = 1.3 + Math.random() * 1.1
      p.leak = p.leakLife
      p.x = p.hx
      p.y = p.hy
      p.vx = (Math.random() - 0.5) * 16
      p.vy = -(26 + Math.random() * 44)
      released += 1
    }
    wake()
  }

  function scheduleLeak() {
    window.clearTimeout(leakTimer)
    leakTimer = window.setTimeout(
      () => {
        if (disposed) return
        if (inView && !hovering && document.visibilityState === 'visible') leakSome()
        scheduleLeak()
      },
      3200 + Math.random() * 3200,
    )
  }

  function tick(now: number) {
    frame = 0
    // The frame time can be older than the moment the loop was woken up.
    const dt = Math.max(0.001, Math.min(0.04, (now - last) / 1000))
    last = now
    const t = now / 1000

    const rect = canvas.getBoundingClientRect()
    const mx = clientX - rect.left
    const my = clientY - rect.top
    const reach = radius * 0.6
    const near =
      mx > pad - reach && mx < width - pad + reach && my > pad - reach && my < height - pad + reach
    const active = near && (hovering || now < touchUntil)

    if (active) {
      holeX = mx
      holeY = my
      if (!wasActive) onFizz?.()
    }
    wasActive = active
    hole += ((active ? radius : 0) - hole) * (1 - Math.exp(-dt * (active ? 9 : 6)))
    setMask()

    const bursting = now < burstUntil
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    if (hole > 2) {
      const size = hole * 0.76 * (1 + Math.sin(t * 2.1) * 0.012)
      ctx.globalAlpha = Math.min(1, hole / radius) * (bursting ? 0.35 : 0.85)
      ctx.drawImage(lens, holeX - size, holeY - size, size * 2, size * 2)
    }

    let visible = 0
    for (const p of particles) {
      if (p.leak > 0) {
        // A free bubble: rises, wobbles, fades, then goes back to its glyph.
        p.leak -= dt
        p.vx += Math.sin(t * 3 + p.phase) * 40 * dt
        p.vy -= 14 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        const life = Math.max(0, p.leak / p.leakLife)
        p.alpha = Math.min(1, (1 - life) * 6) * Math.min(1, life * 1.6) * 0.9
        if (p.leak <= 0) {
          p.x = p.hx
          p.y = p.hy
          p.vx = 0
          p.vy = 0
          p.alpha = 0
        }
      } else {
        const dx = p.hx - holeX
        const dy = p.hy - holeY
        const inside = hole > 1 && dx * dx + dy * dy < hole * hole
        if (inside && !p.held) {
          p.held = true
          // Start near where the glyph was, spread out so the ring fills at once.
          p.angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 3.4
        } else if (!inside && p.held) {
          p.held = false
        }

        let tx = p.hx
        let ty = p.hy
        let stiffness = 42
        let damping = 9.5
        if (p.held) {
          p.angle += p.spin * dt
          const orbit = hole * (0.84 + p.ring * 0.42) + Math.sin(t * 1.7 + p.phase) * 5
          tx = holeX + Math.cos(p.angle) * orbit
          ty = holeY + Math.sin(p.angle) * orbit - 4
          stiffness = 22
          damping = 6.5
          p.alpha = Math.min(1, p.alpha + dt * 6)
        } else {
          const home = Math.hypot(p.x - p.hx, p.y - p.hy)
          if (home < 5) p.alpha = Math.max(0, p.alpha - dt * 5)
        }

        if (bursting && p.alpha > 0) {
          // After a click the bubbles fly free for a moment: drag and buoyancy only.
          p.vx *= 1 - dt * 2.2
          p.vy = p.vy * (1 - dt * 2.2) - 60 * dt
        } else {
          p.vx += ((tx - p.x) * stiffness - p.vx * damping) * dt
          p.vy += ((ty - p.y) * stiffness - p.vy * damping) * dt
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
      }

      if (p.held || p.leak > 0) visible += 1
      if (p.alpha > 0.02) {
        visible += 1
        ctx.globalAlpha = Math.min(1, p.alpha)
        if (p.r < 1.7) {
          ctx.fillStyle = 'rgb(214, 240, 246)'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, TAU)
          ctx.fill()
        } else {
          ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
        }
      }
    }
    ctx.globalAlpha = 1

    if (active || hole > 0.5 || visible > 0 || bursting) frame = requestAnimationFrame(tick)
  }

  function wake() {
    if (frame || disposed) return
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  function isNear(x: number, y: number) {
    const rect = host.getBoundingClientRect()
    const reach = radius * 0.6
    return (
      x > rect.left - reach && x < rect.right + reach && y > rect.top - reach && y < rect.bottom + reach
    )
  }

  function onPointerMove(event: PointerEvent) {
    clientX = event.clientX
    clientY = event.clientY
    hovering = event.pointerType !== 'touch'
    if (!inView || !isNear(clientX, clientY)) return
    // A finger dragged over the title keeps the circle open under it.
    if (!hovering) touchUntil = performance.now() + 1400
    wake()
  }

  function onPointerDown(event: PointerEvent) {
    if (!inView || !isNear(event.clientX, event.clientY)) return
    clientX = event.clientX
    clientY = event.clientY
    const now = performance.now()
    if (event.pointerType === 'touch') {
      // No hover on touch screens: a tap opens the circle for a moment.
      hovering = false
      touchUntil = now + 1900
    } else {
      // Click: the bubbles around the pointer are blown away, then come back.
      const rect = canvas.getBoundingClientRect()
      const mx = clientX - rect.left
      const my = clientY - rect.top
      for (const p of particles) {
        if (!p.held) continue
        const angle = Math.atan2(p.y - my, p.x - mx)
        const force = 260 + Math.random() * 360
        p.vx += Math.cos(angle) * force
        p.vy += Math.sin(angle) * force - 60
      }
      burstUntil = now + 620
      onPop?.()
    }
    wake()
  }

  function onPointerGone(event: Event) {
    // Lifting a finger also "leaves" the page: the tap keeps its circle until it times out.
    if (event instanceof PointerEvent && event.pointerType === 'touch') return
    hovering = false
    clientX = -9999
    clientY = -9999
  }

  let resizeTimer = 0
  const resize = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      if (disposed) return
      hole = 0
      setMask()
      build()
    }, 120)
  })
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
  })

  build()
  setMask()
  // The first sample may run before the display font arrives.
  void document.fonts.ready.then(() => !disposed && build())
  resize.observe(host)
  visibility.observe(host)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerGone)
  window.addEventListener('blur', onPointerGone)
  scheduleLeak()

  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    window.clearTimeout(leakTimer)
    window.clearTimeout(resizeTimer)
    resize.disconnect()
    visibility.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown)
    document.documentElement.removeEventListener('pointerleave', onPointerGone)
    window.removeEventListener('blur', onPointerGone)
    letters.style.setProperty('--br', '0px')
  }
}

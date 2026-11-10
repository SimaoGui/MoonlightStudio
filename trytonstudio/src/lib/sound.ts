/**
 * Optional ambient sound (RF-19), synthesized with the Web Audio API so the
 * repository carries no audio files (RNF-11).
 *
 * - at the surface: filtered noise that swells like waves
 * - under water: the same noise heavily muffled, plus a low drone that grows
 *   with depth and the odd bubble
 * - events: a splash when the page crosses the surface, a fizz and a pop for
 *   the bubble title
 *
 * It starts switched off, and every method is a no-op until `enable()` runs
 * from a click (browsers only start audio after a user gesture).
 */

type Listener = () => void

type Graph = {
  ctx: AudioContext
  master: GainNode
  noise: AudioBuffer
  surface: GainNode
  deep: GainNode
  deepFilter: BiquadFilterNode
  drone: GainNode
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function makeNoise(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // Brown noise: integrated white noise, the colour of distant water.
  let last = 0
  for (let index = 0; index < data.length; index += 1) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[index] = last * 3.5
  }
  return buffer
}

function buildGraph(): Graph {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const noise = makeNoise(ctx)
  const source = ctx.createBufferSource()
  source.buffer = noise
  source.loop = true

  // Surface: band-passed noise whose volume swells every nine seconds or so.
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 520
  band.Q.value = 0.5
  const swell = ctx.createGain()
  swell.gain.value = 0.55
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.11
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = 0.38
  lfo.connect(lfoDepth).connect(swell.gain)
  const surface = ctx.createGain()
  surface.gain.value = 0
  source.connect(band).connect(swell).connect(surface).connect(master)

  // Under water: the same noise through a low-pass that closes with depth.
  const deepFilter = ctx.createBiquadFilter()
  deepFilter.type = 'lowpass'
  deepFilter.frequency.value = 900
  deepFilter.Q.value = 0.7
  const deep = ctx.createGain()
  deep.gain.value = 0
  source.connect(deepFilter).connect(deep).connect(master)

  // Abyss: a quiet drone, a root and a fifth slightly out of tune.
  const drone = ctx.createGain()
  drone.gain.value = 0
  const droneFilter = ctx.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 220
  for (const frequency of [55, 82.6, 110.4]) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.connect(droneFilter)
    osc.start()
  }
  droneFilter.connect(drone).connect(master)

  source.start()
  lfo.start()
  return { ctx, master, noise, surface, deep, deepFilter, drone }
}

class OceanSound {
  private graph: Graph | null = null
  private listeners = new Set<Listener>()
  private depth = 0
  private blipTimer = 0
  private watching = false
  enabled = false

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.enabled

  /** False where the browser has no Web Audio at all: the toggle is then hidden. */
  get supported(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window
  }

  async toggle(): Promise<void> {
    if (this.enabled) this.disable()
    else await this.enable()
  }

  async enable(): Promise<void> {
    if (!this.supported || this.enabled) return
    this.graph ??= buildGraph()
    const { ctx, master } = this.graph
    if (!this.watching) {
      // No sound from a tab nobody is looking at.
      this.watching = true
      document.addEventListener('visibilitychange', () => {
        if (!this.enabled) return
        if (document.hidden) void ctx.suspend()
        else void ctx.resume()
      })
    }
    await ctx.resume()
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6)
    this.enabled = true
    this.applyDepth(0.05)
    window.clearInterval(this.blipTimer)
    this.blipTimer = window.setInterval(() => {
      // Stray bubbles, more of them in the first few hundred metres.
      const chance = this.depth < 15 ? 0 : this.depth < 1200 ? 0.3 : 0.12
      if (Math.random() < chance) this.bubbles(1 + Math.floor(Math.random() * 3), 0.035)
    }, 900)
    this.emit()
  }

  disable(): void {
    if (!this.graph || !this.enabled) return
    const { ctx, master } = this.graph
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
    window.clearInterval(this.blipTimer)
    this.enabled = false
    window.setTimeout(() => {
      if (!this.enabled) void ctx.suspend()
    }, 900)
    this.emit()
  }

  /** Current depth of the dive in metres. Cheap to call on every scroll frame. */
  setDepth(metres: number): void {
    if (Math.abs(metres - this.depth) < 1) return
    this.depth = metres
    if (this.enabled) this.applyDepth(0.25)
  }

  /** Crossing the surface on the way down (RF-17). */
  splash(): void {
    const graph = this.live()
    if (!graph) return
    const { ctx, master, noise } = graph
    const now = ctx.currentTime
    const source = ctx.createBufferSource()
    source.buffer = noise
    const sweep = ctx.createBiquadFilter()
    sweep.type = 'bandpass'
    sweep.Q.value = 0.8
    sweep.frequency.setValueAtTime(1500, now)
    sweep.frequency.exponentialRampToValueAtTime(240, now + 0.8)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.9, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)
    source.connect(sweep).connect(gain).connect(master)
    source.start(now)
    source.stop(now + 1.2)

    const thump = ctx.createOscillator()
    thump.frequency.setValueAtTime(130, now)
    thump.frequency.exponentialRampToValueAtTime(46, now + 0.45)
    const thumpGain = ctx.createGain()
    thumpGain.gain.setValueAtTime(0.32, now)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    thump.connect(thumpGain).connect(master)
    thump.start(now)
    thump.stop(now + 0.6)

    this.bubbles(9, 0.05, 0.25)
  }

  /** The title starts to dissolve into bubbles (RF-13). */
  fizz(): void {
    this.bubbles(6, 0.028)
  }

  /** A click blows the title bubbles away (RF-13). */
  pop(): void {
    this.bubbles(11, 0.045)
  }

  private live(): Graph | null {
    return this.enabled ? this.graph : null
  }

  private applyDepth(timeConstant: number): void {
    if (!this.graph) return
    const { ctx, surface, deep, deepFilter, drone } = this.graph
    const now = ctx.currentTime
    const depth = this.depth
    surface.gain.setTargetAtTime(0.5 * clamp01(1 - depth / 160), now, timeConstant)
    deep.gain.setTargetAtTime(0.5 * clamp01(depth / 60), now, timeConstant)
    deepFilter.frequency.setTargetAtTime(140 + 900 * Math.exp(-depth / 1800), now, timeConstant)
    drone.gain.setTargetAtTime(0.11 * clamp01((depth - 150) / 2500), now, timeConstant)
  }

  /** A handful of rising chirps, the sound of small bubbles. */
  private bubbles(count: number, level: number, delay = 0): void {
    const graph = this.live()
    if (!graph) return
    const { ctx, master } = graph
    for (let index = 0; index < count; index += 1) {
      const start = ctx.currentTime + delay + Math.random() * 0.06 * count
      const from = 260 + Math.random() * 420
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(from, start)
      osc.frequency.exponentialRampToValueAtTime(from * (1.9 + Math.random() * 0.8), start + 0.07)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(level, start + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09)
      osc.connect(gain).connect(master)
      osc.start(start)
      osc.stop(start + 0.1)
    }
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }
}

/** One sound engine for the whole page. */
export const sound = new OceanSound()

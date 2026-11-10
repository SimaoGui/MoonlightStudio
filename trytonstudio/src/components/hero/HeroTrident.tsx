import { useEffect, useState, type ComponentType } from 'react'
import { Trident } from '../brand/Trident'

type SceneProps = { onReady: () => void; onFail: () => void }

/**
 * Whether this device should get the 3D trident (RF-20). `?3d=on` and
 * `?3d=off` in the address force the answer, for testing.
 */
function wants3D(): boolean {
  const forced = new URLSearchParams(window.location.search).get('3d')
  if (forced === 'off') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // Software rendering counts as "no WebGL": the SVG looks better than a slow canvas.
  const probe = document.createElement('canvas')
  const options = { failIfMajorPerformanceCaveat: forced !== 'on' }
  const gl = (probe.getContext('webgl2', options) ?? probe.getContext('webgl', options)) as
    | WebGLRenderingContext
    | null
  if (!gl) return false
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  if (forced === 'on') return true

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !connection?.saveData && (navigator.hardwareConcurrency ?? 4) >= 4
}

/**
 * The trident of the hero. It starts as the SVG of the logo, which is what the
 * first paint shows. On capable devices the 3D scene is downloaded afterwards
 * and fades in over it. If WebGL is missing, slow or fails later, the SVG stays.
 */
export function HeroTrident() {
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!wants3D()) return
    let cancelled = false
    // After the first paint and the entrance of the title.
    const timer = window.setTimeout(() => {
      import('./Trident3D')
        .then((module) => !cancelled && setScene(() => module.default))
        .catch(() => {
          // Offline or blocked: the SVG is already there.
        })
    }, 900)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  const fail = () => {
    setReady(false)
    setScene(null)
  }

  return (
    <>
      <Trident
        tone="gradient"
        className={`size-full animate-float drop-shadow-[0_0_48px_rgb(95_242_224/0.28)] transition-opacity duration-700 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {Scene && (
        <div
          data-trident-3d={ready ? 'ready' : 'loading'}
          className={`absolute inset-[-12%] transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          <Scene onReady={() => setReady(true)} onFail={fail} />
        </div>
      )}
    </>
  )
}

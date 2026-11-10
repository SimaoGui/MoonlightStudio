import { useEffect, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  Shape,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useParallax } from '../../lib/parallax'
import { createRandom } from '../../lib/random'
import { TRIDENT_PATH } from '../brand/Trident'

/**
 * The hero trident as a 3D model (RF-20). This file is the only one that
 * imports three.js, and the hero loads it on demand, so it lands in its own
 * chunk (RNF-09).
 *
 * The outline is the same path as the SVG logo, extruded and bevelled. It
 * sways by itself, leans towards the pointer and turns as the page scrolls.
 */

/** Turns the logo path (only M, L, Q and Z, absolute) into a shape centred on the origin. */
function tridentShape(): Shape {
  const shape = new Shape()
  const tokens = TRIDENT_PATH.match(/[MLQZ]|-?\d*\.?\d+/g) ?? []
  const x = (index: number) => Number(tokens[index]) - 32
  const y = (index: number) => 32 - Number(tokens[index])
  let index = 0
  while (index < tokens.length) {
    const command = tokens[index]
    if (command === 'M') {
      shape.moveTo(x(index + 1), y(index + 2))
      index += 3
    } else if (command === 'L') {
      shape.lineTo(x(index + 1), y(index + 2))
      index += 3
    } else if (command === 'Q') {
      shape.quadraticCurveTo(x(index + 1), y(index + 2), x(index + 3), y(index + 4))
      index += 5
    } else {
      shape.closePath()
      index += 1
    }
  }
  return shape
}

/** Same ramp as the SVG logo: pale foam at the tips, navy at the base. */
function paint(geometry: BufferGeometry) {
  const stops: [number, Color][] = [
    [0, new Color('#1f4a69')],
    [0.15, new Color('#1f4a69')],
    [0.6, new Color('#67b1c4')],
    [1, new Color('#d7f6fa')],
  ]
  const position = geometry.getAttribute('position')
  const colors = new Float32Array(position.count * 3)
  const mixed = new Color()
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const height = (position.getY(vertex) + 30) / 60
    let upper = 1
    while (upper < stops.length - 1 && height > stops[upper][0]) upper += 1
    const [from, low] = stops[upper - 1]
    const [to, high] = stops[upper]
    const ratio = Math.min(1, Math.max(0, (height - from) / (to - from)))
    mixed.copy(low).lerp(high, ratio)
    colors[vertex * 3] = mixed.r
    colors[vertex * 3 + 1] = mixed.g
    colors[vertex * 3 + 2] = mixed.b
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
}

function sparkTexture(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    glow.addColorStop(0, 'rgba(255, 255, 255, 1)')
    glow.addColorStop(0.35, 'rgba(255, 255, 255, 0.55)')
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 32, 32)
  }
  return new CanvasTexture(canvas)
}

type Trident3DProps = {
  /** Runs after the first frame is on screen: the SVG can fade out. */
  onReady: () => void
  /** Runs when WebGL fails or the context is lost: the SVG must come back. */
  onFail: () => void
}

export default function Trident3D({ onReady, onFail }: Trident3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { scroll, pointerX, pointerY, pointerGain } = useParallax()
  const callbacks = useRef({ onReady, onFail })

  useEffect(() => {
    callbacks.current = { onReady, onFail }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      callbacks.current.onFail()
      return
    }
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const scene = new Scene()
    const pmrem = new PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const environment = pmrem.fromScene(room, 0.04)
    scene.environment = environment.texture

    const camera = new PerspectiveCamera(28, 1, 1, 600)
    camera.position.set(0, 0, 168)

    const geometry = new ExtrudeGeometry(tridentShape(), {
      depth: 7,
      bevelEnabled: true,
      bevelThickness: 1.6,
      bevelSize: 1.1,
      bevelSegments: 5,
      curveSegments: 18,
    })
    geometry.center()
    paint(geometry)
    const material = new MeshStandardMaterial({
      vertexColors: true,
      metalness: 0.72,
      roughness: 0.24,
      envMapIntensity: 1.25,
    })
    const trident = new Mesh(geometry, material)
    const group = new Group()
    group.add(trident)
    scene.add(group)

    // Moonlight from the upper left, a teal rim from behind, and a faint fill.
    const key = new DirectionalLight('#eefafc', 2.6)
    key.position.set(-60, 90, 120)
    const rim = new PointLight('#5ff2e0', 5200, 0, 2)
    rim.position.set(46, 8, -52)
    const under = new PointLight('#2f86a8', 2600, 0, 2)
    under.position.set(-20, -70, 40)
    scene.add(key, rim, under, new AmbientLight('#8fd3e0', 0.35))

    // Spray hanging in the air around the trident.
    const random = createRandom(23)
    const sparkCount = 90
    const sparkPositions = new Float32Array(sparkCount * 3)
    const sparkSpeeds = new Float32Array(sparkCount)
    for (let spark = 0; spark < sparkCount; spark += 1) {
      sparkPositions[spark * 3] = (random() - 0.5) * 96
      sparkPositions[spark * 3 + 1] = (random() - 0.5) * 84
      sparkPositions[spark * 3 + 2] = (random() - 0.5) * 60
      sparkSpeeds[spark] = 1.2 + random() * 3.2
    }
    const sparkGeometry = new BufferGeometry()
    sparkGeometry.setAttribute('position', new BufferAttribute(sparkPositions, 3))
    const sparkMap = sparkTexture()
    const sparkMaterial = new PointsMaterial({
      map: sparkMap,
      color: '#8fd3e0',
      size: 1.7,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    const sparks = new Points(sparkGeometry, sparkMaterial)
    scene.add(sparks)

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    let announced = false
    let last = performance.now()
    const frame = (now: number) => {
      const t = now / 1000
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const dive = Math.min(1.4, scroll.get() / Math.max(1, window.innerHeight))
      const gain = pointerGain.get()
      const px = pointerX.get() * gain
      const py = pointerY.get() * gain

      group.rotation.y = Math.sin(t * 0.5) * 0.26 + px * 0.6 + dive * Math.PI * 0.9
      group.rotation.x = Math.sin(t * 0.37) * 0.05 + py * 0.24 - dive * 0.3
      group.rotation.z = Math.sin(t * 0.31) * 0.03
      group.position.y = Math.sin(t * 0.9) * 1.3

      const position = sparkGeometry.getAttribute('position') as BufferAttribute
      for (let spark = 0; spark < sparkCount; spark += 1) {
        let height = position.getY(spark) + sparkSpeeds[spark] * dt
        if (height > 42) height = -42
        position.setY(spark, height)
      }
      position.needsUpdate = true
      sparks.rotation.y = t * 0.05

      renderer.render(scene, camera)
      if (!announced) {
        announced = true
        callbacks.current.onReady()
      }
    }

    // Draw only while the hero is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      last = performance.now()
      renderer.setAnimationLoop(entry.isIntersecting ? frame : null)
    })
    visibility.observe(canvas)

    const onLost = (event: Event) => {
      event.preventDefault()
      renderer.setAnimationLoop(null)
      callbacks.current.onFail()
    }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      visibility.disconnect()
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      geometry.dispose()
      material.dispose()
      sparkGeometry.dispose()
      sparkMaterial.dispose()
      sparkMap.dispose()
      environment.dispose()
      room.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [scroll, pointerX, pointerY, pointerGain])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
}

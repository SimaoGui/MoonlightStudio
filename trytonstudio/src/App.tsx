import { Abyss } from './components/dive/Abyss'
import { Discovery } from './components/dive/Discovery'
import { SurfaceCrossing, SurfaceUnderside } from './components/dive/SurfaceCrossing'
import { DepthGauge } from './components/layout/DepthGauge'
import { Footer } from './components/layout/Footer'
import { NavBar } from './components/layout/NavBar'
import { OceanBackdrop } from './components/layout/OceanBackdrop'
import { LazyMotion, domAnimation } from 'motion/react'
import { discoveries } from './content'
import { DepthProvider } from './lib/depth'
import { ParallaxProvider } from './lib/parallax'
import { Download } from './sections/Download'
import { Features } from './sections/Features'
import { Hero } from './sections/Hero'
import { Player } from './sections/Player'
import { Screens } from './sections/Screens'
import { Studio } from './sections/Studio'

const [sunlight, squid, angler, whale, wreck] = discoveries

/**
 * The page is one dive: the hero is the surface and each section below is a
 * depth, over a background that darkens continuously down to the abyss (RF-05).
 * Between the sections, the discoveries show what lives at each depth (RF-14).
 */
export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <ParallaxProvider>
        <DepthProvider>
          <NavBar />
          <DepthGauge />
          <SurfaceCrossing />
          <main id="conteudo">
            <Hero />
            {/* overflow-clip, not hidden: a scroll container here would break the pinned demos (RF-16) */}
            <div className="relative overflow-clip bg-[linear-gradient(180deg,var(--color-shallow)_0%,#0d2745_22%,var(--color-abyss-900)_52%,var(--color-abyss-950)_100%)]">
              <OceanBackdrop />
              <SurfaceUnderside />
              <Studio />
              <Discovery item={sunlight} side="left" />
              <Player />
              <Discovery item={squid} side="right" />
              <Screens />
              <Discovery item={angler} side="left" />
              <Discovery item={whale} side="right" />
              <Features />
              <Discovery item={wreck} side="left" />
              <Abyss>
                <Download />
              </Abyss>
            </div>
          </main>
          <Footer />
        </DepthProvider>
      </ParallaxProvider>
    </LazyMotion>
  )
}

import { DepthGauge } from './components/layout/DepthGauge'
import { Footer } from './components/layout/Footer'
import { NavBar } from './components/layout/NavBar'
import { OceanBackdrop } from './components/layout/OceanBackdrop'
import { ParallaxProvider } from './lib/parallax'
import { Download } from './sections/Download'
import { Features } from './sections/Features'
import { Hero } from './sections/Hero'
import { Player } from './sections/Player'
import { Screens } from './sections/Screens'
import { Studio } from './sections/Studio'

/**
 * The page is one dive: the hero is the surface and each section below is a
 * depth, over a background that darkens continuously down to the abyss (RF-05).
 */
export default function App() {
  return (
    <ParallaxProvider>
      <NavBar />
      <DepthGauge />
      <main id="conteudo">
        <Hero />
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-shallow)_0%,#0d2745_26%,var(--color-abyss-900)_58%,var(--color-abyss-950)_100%)]">
          <OceanBackdrop />
          <Studio />
          <Player />
          <Screens />
          <Features />
          <Download />
        </div>
      </main>
      <Footer />
    </ParallaxProvider>
  )
}

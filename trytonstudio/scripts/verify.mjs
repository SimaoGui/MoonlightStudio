/**
 * Teste de aceite das specs (specs/001-landing-page e specs/002-imersao).
 *
 * Abre o build de produção em um Chromium de verdade e confere os requisitos
 * que dá para medir: parallax, interações das janelas, navegação, responsividade,
 * acessibilidade (axe-core), as preferências de movimento e contraste e, da
 * spec 002, o título em bolhas, as descobertas, o scroll que conduz as
 * demonstrações, a travessia, a lanterna, o som, a cena 3D e o peso do build.
 *
 *   npm run build && npm run verify
 *
 * Na primeira vez, baixe o navegador com `npx playwright install chromium`.
 */
import { spawn } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'

const PORT = 4173
const URL = `http://localhost:${PORT}/`
// `URL` above is the address of the preview, so the class comes from globalThis.
const DIST = fileURLToPath(new globalThis.URL('../dist/', import.meta.url))
const WIDTHS = [
  [320, 640],
  [390, 844],
  [768, 1024],
  [1024, 700],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1300],
]

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`)
}

async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
  await page.waitForTimeout(900)
}

/** Scrolls until the middle of the element is in the middle of the screen. */
async function centre(page, locator) {
  const top = await locator.evaluate((element) => {
    const box = element.getBoundingClientRect()
    return box.top + scrollY + box.height / 2 - innerHeight / 2
  })
  await scrollTo(page, top)
}

/**
 * Clicks a control where it is right now, like a person does. `locator.click()`
 * waits for the control to stop moving and, while a window is still tilting,
 * retries by scrolling it to another part of the screen. In the pinned product
 * windows a scroll changes the active feature (RF-16), so the test must not
 * scroll by itself.
 */
async function press(page, locator) {
  const box = await locator.boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

/** Mean brightness (0 to 255) of a region of the screen. */
async function brightness(page, clip) {
  const png = (await page.screenshot({ clip })).toString('base64')
  return page.evaluate(async (data) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let sum = 0
    for (let index = 0; index < pixels.length; index += 4) sum += pixels[index] + pixels[index + 1] + pixels[index + 2]
    return sum / (pixels.length / 4) / 3
  }, png)
}

/** Scrolls the whole page in steps, so every entrance animation has run. */
async function tour(page, step) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= height; y += step) await scrollTo(page, y)
}

/** Radius in px of the hole the pointer opens in the title (RF-13). */
const titleHole = (page) =>
  page.locator('h1 .bubble-mask').evaluate((element) => parseFloat(element.style.getPropertyValue('--br')) || 0)

/** Where the abyss light is, in viewport coordinates (RF-18). */
const abyssLight = (page) =>
  page.locator('[data-abyss]').evaluate((element) => {
    const box = element.getBoundingClientRect()
    return {
      x: parseFloat(element.style.getPropertyValue('--lx')) + box.left,
      y: parseFloat(element.style.getPropertyValue('--ly')) + box.top,
    }
  })

const crossingSheets = (page) => page.locator('.animate-crossing-sheet').count()

const sectionTop = (page, id) =>
  page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY - 88, id)

/** translateX / translateY of every decorative hero layer, read from the computed matrix. */
const heroLayers = (page, axis) =>
  page.evaluate((index) => {
    return [...document.querySelectorAll('#topo > div[aria-hidden="true"]')].map((element) => {
      const transform = getComputedStyle(element).transform
      return transform === 'none' ? 0 : Math.round(parseFloat(transform.split(',')[index]))
    })
  }, axis === 'x' ? 4 : 5)

async function runAxe(page) {
  await page.evaluate(axeSource)
  const { violations } = await page.evaluate(() =>
    window.axe.run(document, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'],
    }),
  )
  return violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`)
}

async function startPreview() {
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore',
  })
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(URL)).ok) return server
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  server.kill()
  throw new Error(`O preview não respondeu em ${URL}. Rode "npm run build" antes.`)
}

/** Fails the check when the page logged an error. */
function watchErrors(page) {
  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(String(error)))
  return errors
}

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  // RF-19: count what the page does with Web Audio, without changing it.
  await context.addInitScript(() => {
    const Native = window.AudioContext
    window.__audio = { contexts: [], ramps: 0, sources: 0 }
    window.AudioContext = class extends Native {
      constructor(...args) {
        super(...args)
        window.__audio.contexts.push(this)
      }
      createBufferSource() {
        window.__audio.sources += 1
        return super.createBufferSource()
      }
    }
    const setTarget = AudioParam.prototype.setTargetAtTime
    AudioParam.prototype.setTargetAtTime = function (...args) {
      window.__audio.ramps += 1
      return setTarget.apply(this, args)
    }
  })
  const page = await context.newPage()
  const errors = watchErrors(page)
  await page.goto(URL)
  await page.waitForTimeout(1800)

  check('RNF-08 título e idioma', (await page.title()).includes('TryTonStudio') && (await page.getAttribute('html', 'lang')) === 'pt-BR')
  check('um único h1', (await page.locator('h1').count()) === 1)

  await page.keyboard.press('Tab')
  check(
    'RNF-06 "Pular para o conteúdo" é a primeira parada do teclado',
    (await page.evaluate(() => document.activeElement.textContent.trim())) === 'Pular para o conteúdo',
  )

  // RF-02 / RNF-02: scroll parallax
  const titleY = () =>
    page.locator('h1').evaluate((element) => {
      const transform = getComputedStyle(element).transform
      return transform === 'none' ? 0 : parseFloat(transform.split(',')[5])
    })
  const before = await titleY()
  await scrollTo(page, 300)
  const moved = (await titleY()) - before
  check('RF-02 o título é a camada mais rápida (1,15x)', Math.abs(moved - 345) < 12, `${Math.round(moved)} px para 300 px de scroll`)
  const speeds = await heroLayers(page, 'y')
  check('RF-02 pelo menos 6 camadas com velocidades diferentes', new Set(speeds).size >= 6, JSON.stringify(speeds))
  check(
    'RNF-02 o parallax escreve só transform',
    await page.evaluate(() =>
      [...document.querySelectorAll('#topo *')].every(
        (element) => !element.style.top && !element.style.left && !element.style.marginTop,
      ),
    ),
  )
  check('RNF-02 nenhuma imagem raster no hero', (await page.locator('#topo img').count()) === 0)

  // RF-03: pointer parallax
  await scrollTo(page, 0)
  await page.mouse.move(720, 450)
  await page.waitForTimeout(900)
  const centered = await heroLayers(page, 'x')
  await page.mouse.move(1400, 450)
  await page.waitForTimeout(1500)
  const shifted = (await heroLayers(page, 'x')).map((value, index) => Math.abs(value - centered[index]))
  check('RF-03 as camadas seguem o ponteiro', Math.max(...shifted) >= 5, JSON.stringify(shifted))
  check('RF-03 deslocamento de ponteiro de até 40 px', Math.max(...shifted) <= 40)

  // RF-13: the title turns into bubbles around the pointer
  const heading = page.locator('h1')
  const bubbles = () =>
    page.locator('h1 canvas').evaluate((canvas) => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
      let painted = 0
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 40) painted += 1
      return painted
    })
  await page.mouse.move(40, 860)
  await page.waitForTimeout(2600)
  check(
    'RF-13 o título é texto normal com o ponteiro longe',
    (await heading.getAttribute('aria-label')) === 'TryTonStudio' &&
      (await heading.locator('[data-letter]').count()) === 12 &&
      (await titleHole(page)) === 0,
  )
  const headingBox = await heading.boundingBox()
  const overTitle = [headingBox.x + headingBox.width * 0.4, headingBox.y + headingBox.height / 2]
  await page.mouse.move(...overTitle, { steps: 12 })
  await page.waitForTimeout(1200)
  const opened = await titleHole(page)
  const painted = await bubbles()
  check('RF-13 perto do ponteiro o texto vira bolhas em volta de um círculo', opened >= 40 && painted > 2000, `círculo de ${Math.round(opened)} px, ${painted} px de bolhas`)
  await page.mouse.move(40, 860, { steps: 6 })
  await page.waitForTimeout(3000)
  check('RF-13 ao afastar o ponteiro o texto se recompõe', (await titleHole(page)) === 0)

  // RF-17: crossing the surface
  const heroHeight = await page.locator('#topo').evaluate((element) => element.offsetHeight)
  const jump = (top) => page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top)
  check('RF-17 nada cruza a tela antes de rolar', (await crossingSheets(page)) === 0)
  await jump(heroHeight * 0.6)
  await page.waitForTimeout(350)
  check(
    'RF-17 ao sair do hero uma lâmina d\'água e bolhas cruzam a tela',
    (await crossingSheets(page)) === 1 && (await page.locator('.animate-crossing-bubble').count()) >= 20,
  )
  await page.waitForTimeout(2400)
  await jump(heroHeight * 0.3)
  await page.waitForTimeout(250)
  await jump(heroHeight * 0.7)
  await page.waitForTimeout(350)
  check('RF-17 a travessia acontece uma vez por descida', (await crossingSheets(page)) === 0)
  await jump(0)
  await page.waitForTimeout(250)
  await jump(heroHeight * 0.6)
  await page.waitForTimeout(350)
  check('RF-17 voltar ao topo arma a travessia de novo', (await crossingSheets(page)) === 1)
  await page.waitForTimeout(2400)
  check('RF-17 a travessia sai da tela depois de passar', (await crossingSheets(page)) === 0)
  await scrollTo(page, 0)

  // RF-04 / RF-01: depth gauge and active link
  const gauge = page.locator('nav[aria-label="Profundidade"]')
  const reading = async () => Number((await gauge.locator('p span').nth(1).textContent()).replace(/\D/g, ''))
  const zone = async () => (await gauge.locator('[data-zone]').textContent()).trim()
  check('RF-04 medidor de profundidade visível em 1440 px', await gauge.isVisible())
  check('RF-15 na superfície o medidor diz Superfície', (await zone()) === 'Superfície' && (await gauge.locator('[data-zone]').isVisible()))
  await gauge.locator('a[href="#screens"]').click()
  await page.waitForTimeout(1600)
  check(
    'RF-01 a navegação destaca a seção visível',
    (await page.locator('nav[aria-label="Principal"] a[aria-current="true"]').textContent()).trim() === 'TrytonScreens',
  )
  const meters = await reading()
  check('RF-04 a leitura acompanha o scroll', meters >= 900 && meters <= 2500, `${meters} m`)

  // RF-14 / RF-15: discoveries along the dive
  const found = await page.evaluate(() =>
    [...document.querySelectorAll('section[id^="descoberta-"]')].map((section) => ({
      id: section.id,
      depth: Number(section.querySelector('p[aria-hidden="true"]').textContent.replace(/\D/g, '')),
      title: section.querySelector('h3')?.textContent.trim() ?? '',
      fact: section.querySelector('h3 + p')?.textContent.trim() ?? '',
      source: section.querySelector('a[target="_blank"]')?.href ?? '',
      drawings: section.querySelectorAll('svg').length,
    })),
  )
  check(
    'RF-14 pelo menos 5 descobertas com ilustração, profundidade, fato e fonte',
    found.length >= 5 &&
      found.every((item) => item.depth > 0 && item.title && item.fact.length > 30 && item.source.startsWith('https://') && item.drawings >= 1),
    `${found.length} descobertas`,
  )
  const dive = await gauge.locator('a').evaluateAll((links) =>
    links.map((link) => ({
      depth: Number(link.getAttribute('aria-label').split(',').pop().replace(/\D/g, '')),
      top: document.querySelector(link.getAttribute('href')).getBoundingClientRect().top + scrollY,
    })),
  )
  const byPage = [...dive].sort((a, b) => a.top - b.top).map((point) => point.depth)
  check(
    'RF-14 as profundidades crescem de cima para baixo',
    dive.length >= 11 && byPage.every((depth, index) => index === 0 || depth > byPage[index - 1]),
    byPage.join(' < '),
  )
  const zoneOf = (depth) => (depth < 200 ? 'Zona da luz do sol' : depth < 1000 ? 'Zona crepuscular' : 'Zona da meia-noite')
  const readings = []
  for (const item of found) {
    await centre(page, page.locator(`#${item.id}`))
    readings.push({ depth: item.depth, read: await reading(), zone: await zone() })
  }
  check(
    'RF-14 o medidor marca a profundidade da descoberta no meio da tela',
    readings.every((item) => Math.abs(item.read - item.depth) <= 2),
    readings.map((item) => `${item.depth}: ${item.read} m`).join(', '),
  )
  check(
    'RF-15 o medidor mostra a zona de cada profundidade',
    readings.every((item) => item.zone === zoneOf(item.depth)),
    readings.map((item) => `${item.depth} m: ${item.zone}`).join(', '),
  )

  // RF-18: the abyss and the flashlight
  await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight))
  check('RF-15 no fundo o medidor diz Zona abissal aos 4.000 m', (await zone()) === 'Zona abissal' && (await reading()) === 4000, `${await reading()} m`)
  const secrets = page.locator('[data-abyss] .abyss-text')
  check(
    'RF-18 o escuro esconde criaturas, um fato com fonte e a marca do estúdio',
    (await secrets.evaluate((element) => getComputedStyle(element).maskImage)) !== 'none' &&
      (await secrets.locator('a[target="_blank"]').count()) === 1 &&
      (await secrets.textContent()).includes('Três amigos chegaram até aqui.') &&
      (await page.locator('[data-abyss] .abyss-mask svg').count()) >= 6,
  )
  const markBox = await secrets.locator('p').last().boundingBox()
  const overMark = [markBox.x + markBox.width / 2, markBox.y + markBox.height / 2]
  await page.mouse.move(...overMark, { steps: 6 })
  await page.waitForTimeout(1400)
  let light = await abyssLight(page)
  const lit = await brightness(page, markBox)
  const followed = Math.hypot(light.x - overMark[0], light.y - overMark[1])
  const away = [overMark[0] - 620, overMark[1] - 260]
  await page.mouse.move(...away, { steps: 6 })
  await page.waitForTimeout(1400)
  light = await abyssLight(page)
  const dark = await brightness(page, markBox)
  check(
    'RF-18 a luz segue o ponteiro',
    followed < 8 && Math.hypot(light.x - away[0], light.y - away[1]) < 8,
    `a ${followed.toFixed(1)} px do ponteiro`,
  )
  check('RF-18 só o que está sob a luz aparece', lit > dark * 1.5 && dark < 30, `brilho ${lit.toFixed(1)} com luz, ${dark.toFixed(1)} sem`)

  // RF-19: optional sound
  await scrollTo(page, 0)
  const soundButton = page.getByRole('button', { name: 'Som ambiente' })
  const audio = () =>
    page.evaluate(() => ({ ...window.__audio, contexts: window.__audio.contexts.map((ctx) => ctx.state) }))
  check(
    'RF-19 o som começa desligado e nada toca antes do clique',
    (await soundButton.getAttribute('aria-pressed')) === 'false' && (await audio()).contexts.length === 0,
  )
  await soundButton.click()
  await page.waitForTimeout(700)
  let sounding = await audio()
  check(
    'RF-19 o botão da navegação liga o som',
    (await soundButton.getAttribute('aria-pressed')) === 'true' && sounding.contexts.length === 1 && sounding.contexts[0] === 'running',
    sounding.contexts.join(', '),
  )
  await jump(heroHeight * 0.6)
  await page.waitForTimeout(500)
  const crossed = await audio()
  check('RF-19 a travessia da superfície tem som', crossed.sources > sounding.sources)
  await scrollTo(page, await sectionTop(page, 'screens'))
  check('RF-19 o som muda com a profundidade', (await audio()).ramps > crossed.ramps)
  await soundButton.click()
  await page.waitForTimeout(1300)
  sounding = await audio()
  check(
    'RF-19 o mesmo botão desliga o som',
    (await soundButton.getAttribute('aria-pressed')) === 'false' && sounding.contexts[0] === 'suspended',
    sounding.contexts.join(', '),
  )

  // Honest download state + accessibility
  await tour(page, 600)
  const deadLinks = await page.locator('#download a[href="#download"], a[href="#"]').count()
  check('nenhum botão de download leva a lugar nenhum', deadLinks === 0)
  const violations = await runAxe(page)
  check('RNF-05/06 axe-core sem violações (desktop)', violations.length === 0, violations.join(' | '))
  check('sem erros no console', errors.length === 0, errors.join(' | '))
  await context.close()
}

/** The interactive product windows, by hand (RF-06 to RF-08) and driven by the scroll (RF-16). */
async function demos(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = watchErrors(page)
  await page.goto(URL)
  await page.waitForTimeout(1500)

  const pressed = async (locator) => (await locator.getAttribute('aria-pressed')) === 'true'
  /** Top of the pinned box that holds a product window. */
  const pinnedTop = (id) =>
    page.locator(`#${id} [aria-label^="Demonstração interativa"]`).evaluate((element) => {
      let node = element
      while (node && getComputedStyle(node).position !== 'sticky') node = node.parentElement
      return node ? Math.round(node.getBoundingClientRect().top) : null
    })

  // RF-06: player, with no feature active yet
  await scrollTo(page, await sectionTop(page, 'player'))
  const player = page.locator('[aria-label="Demonstração interativa do TrytonPlayer"]')
  const button = (name) => player.getByRole('button', { name })
  const time = async () => (await player.locator('span.font-mono').first().textContent()).trim()
  const speed = async () => (await button(/Velocidade/).textContent()).trim()
  const t0 = await time()
  await page.waitForTimeout(2300)
  check('RF-06 o vídeo avança enquanto toca', t0 !== (await time()))
  await press(page, button('Pausar'))
  await page.waitForTimeout(400)
  const paused = await time()
  await page.waitForTimeout(1600)
  check('RF-06 pausar para o vídeo', paused === (await time()))
  await press(page, button(/Mar Aberto/))
  await page.waitForTimeout(500)
  check('RF-06 escolher um vídeo da fila troca o vídeo', (await player.textContent()).includes('Mar Aberto.mp4'))
  await press(page, button(/Velocidade/))
  await page.waitForTimeout(200)
  check('RF-06 o botão de velocidade alterna', (await speed()) === '1,25x', await speed())
  await press(page, button('Legendas'))
  await page.waitForTimeout(200)
  check('RF-06 as legendas desligam', !(await pressed(button('Legendas'))))
  await press(page, button('Pausar'))
  await player.getByRole('slider').focus()
  await page.keyboard.press('End')
  await page.waitForTimeout(300)
  check('RF-06 a barra de progresso funciona pelo teclado', (await time()).startsWith('1:12'), await time())
  await press(page, button('Biblioteca'))
  await page.waitForTimeout(200)
  await player.getByRole('searchbox').fill('fossa')
  await page.waitForTimeout(200)
  const library = await player.getByRole('button', { name: /\.mp4|Recife|Mar Aberto|Fossa/ }).allTextContents()
  check('RF-06 a busca filtra a biblioteca', library.length === 1 && library[0].includes('Fossa Abissal'), library.join(' | '))

  // RF-08: tilt
  const flat = await player.evaluate((element) => getComputedStyle(element).transform)
  const box = await player.boundingBox()
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2)
  await page.waitForTimeout(900)
  const tilted = await player.evaluate((element) => getComputedStyle(element).transform)
  check('RF-08 a janela inclina com o ponteiro', flat !== tilted && tilted.startsWith('matrix3d'))

  // RF-16: the scroll drives the player
  const playerSteps = page.locator('#player ol li')
  await centre(page, playerSteps.nth(0))
  const pinnedAt = await pinnedTop('player')
  check(
    'RF-16 o recurso no meio da tela fica destacado e muda a janela (biblioteca)',
    (await pressed(playerSteps.nth(0).locator('button'))) && (await pressed(button('Biblioteca'))) && (await speed()) === '1,0x',
  )
  const fileBefore = (await player.textContent()).match(/[\wÀ-ÿ ]+\.mp4/)?.[0]
  await centre(page, playerSteps.nth(1))
  const fileAfter = (await player.textContent()).match(/[\wÀ-ÿ ]+\.mp4/)?.[0]
  check(
    'RF-16 o recurso seguinte troca o estado (fila e próximo vídeo)',
    (await pressed(playerSteps.nth(1).locator('button'))) &&
      !(await pressed(playerSteps.nth(0).locator('button'))) &&
      (await pressed(button('Fila'))) &&
      fileBefore !== fileAfter &&
      (await button('Pausar').count()) === 1,
    `${fileBefore} -> ${fileAfter}`,
  )
  await centre(page, playerSteps.nth(2))
  check(
    'RF-16 o último recurso liga as legendas e muda a velocidade',
    (await pressed(playerSteps.nth(2).locator('button'))) && (await pressed(button('Legendas'))) && (await speed()) === '1,5x',
    await speed(),
  )
  check('RF-16 a janela fica fixa enquanto os recursos passam', pinnedAt !== null && (await pinnedTop('player')) === pinnedAt, `topo em ${pinnedAt} px`)
  await press(page, button(/Velocidade/))
  await page.waitForTimeout(200)
  await page.mouse.wheel(0, 60)
  await page.waitForTimeout(700)
  check('RF-16 os controles continuam funcionando à mão com a janela fixa', (await speed()) === '2,0x', await speed())
  await centre(page, playerSteps.nth(1))
  await press(page, playerSteps.nth(2).locator('button'))
  await page.waitForTimeout(300)
  check(
    'RF-16 clicar em um recurso faz o mesmo que rolar até ele',
    (await pressed(playerSteps.nth(2).locator('button'))) && (await speed()) === '1,5x',
    await speed(),
  )

  // RF-07: screen sharing room, with no feature active yet
  await scrollTo(page, await sectionTop(page, 'screens'))
  const room = page.locator('[aria-label="Demonstração interativa do TrytonScreens"]')
  const control = (name) => room.getByRole('button', { name })
  check('RF-07 selo Ao vivo durante a transmissão', (await room.getByText('Ao vivo').count()) === 1)
  await press(page, control('Região'))
  await page.waitForTimeout(300)
  check('RF-07 trocar a fonte para Região', (await pressed(control('Região'))) && (await room.textContent()).includes('1280 × 720'))
  await press(page, control('Microfone'))
  await page.waitForTimeout(200)
  check('RF-07 desligar o microfone', !(await pressed(control('Microfone'))))
  await press(page, control('Parar de compartilhar'))
  await page.waitForTimeout(300)
  check('RF-07 parar esconde o selo Ao vivo', (await room.getByText('Ao vivo').count()) === 0 && (await control('Compartilhar tela').count()) === 1)

  // RF-16: the scroll drives the room
  const roomSteps = page.locator('#screens ol li')
  await centre(page, roomSteps.nth(0))
  check(
    'RF-16 a sala volta a transmitir quando o primeiro recurso chega ao meio',
    (await pressed(roomSteps.nth(0).locator('button'))) && (await room.getByText('Ao vivo').count()) === 1 && (await pressed(control('Tela inteira'))),
  )
  await centre(page, roomSteps.nth(1))
  check('RF-16 o segundo recurso troca a fonte para região', (await pressed(control('Região'))) && (await room.textContent()).includes('1280 × 720'))
  await centre(page, roomSteps.nth(2))
  check('RF-16 o terceiro recurso liga o som do sistema', (await pressed(roomSteps.nth(2).locator('button'))) && (await pressed(control('Som do sistema'))))

  check('sem erros no console nas demonstrações', errors.length === 0, errors.join(' | '))
  await context.close()
}

/** RF-20: the 3D trident, forced on and off through the address. */
async function webgl(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  let page = await context.newPage()
  let chunks = []
  page.on('request', (request) => /Trident3D/.test(request.url()) && chunks.push(request.url()))
  await page.goto(`${URL}?3d=off`)
  await page.waitForTimeout(2500)
  check(
    'RF-20 sem WebGL a cena em SVG continua no lugar',
    chunks.length === 0 &&
      (await page.locator('[data-trident-3d]').count()) === 0 &&
      (await page.locator('#topo svg.opacity-100').first().isVisible()),
  )
  await page.close()

  page = await context.newPage()
  const errors = watchErrors(page)
  chunks = []
  page.on('request', (request) => /Trident3D/.test(request.url()) && chunks.push(request.url()))
  await page.goto(`${URL}?3d=on`)
  const early = chunks.length
  let ready = true
  try {
    await page.waitForSelector('[data-trident-3d="ready"]', { timeout: 20000 })
  } catch {
    ready = false
  }
  check('RF-20 a cena 3D só é baixada depois do primeiro paint', early === 0 && chunks.length === 1, `${chunks.length} pedido(s)`)
  await page.waitForTimeout(900)
  const scene = ready
    ? await page.locator('[data-trident-3d] canvas').evaluate((canvas) => ({
        width: canvas.width,
        opacity: getComputedStyle(canvas.parentElement).opacity,
      }))
    : null
  check(
    'RF-20 o tridente vira um modelo 3D e o SVG sai de cena',
    ready && scene.width > 0 && scene.opacity === '1' && (await page.locator('#topo svg.opacity-0').count()) === 1,
    ready ? `canvas de ${scene.width} px` : 'a cena não ficou pronta',
  )
  check('RF-20 sem erros no console com a cena 3D', errors.length === 0, errors.join(' | '))
  await context.close()
}

async function responsive(browser) {
  for (const [width, height] of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()
    await page.goto(URL)
    await page.waitForTimeout(800)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button')]
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          return rect.width > 0 && !element.closest('[aria-hidden="true"]') && (rect.left < -1 || rect.right > window.innerWidth + 1)
        })
        .map((element) => element.textContent.trim().slice(0, 30)),
    )
    check(`RNF-01 sem scroll horizontal nem texto cortado em ${width} px`, overflow <= 0 && clipped.length === 0, clipped.join(', '))
    await context.close()
  }

  // The depth gauge must never sit on top of content.
  let context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  let page = await context.newPage()
  await page.goto(URL)
  await page.waitForTimeout(1200)
  await scrollTo(page, await sectionTop(page, 'player'))
  const gauge = await page.locator('nav[aria-label="Profundidade"]').boundingBox()
  const windowBox = await page.locator('[aria-label="Demonstração interativa do TrytonPlayer"]').boundingBox()
  check('RF-04 o medidor não cobre o conteúdo em 1280 px', gauge.x >= windowBox.x + windowBox.width - 1)
  await context.close()

  // RF-16: at the smallest pinned width the whole window still fits under the navigation.
  context = await browser.newContext({ viewport: { width: 1024, height: 700 } })
  page = await context.newPage()
  await page.goto(URL)
  await page.waitForTimeout(1200)
  const fits = []
  for (const id of ['player', 'screens']) {
    await centre(page, page.locator(`#${id} ol li`).nth(1))
    const frame = await page.locator(`#${id} [aria-label^="Demonstração interativa"]`).boundingBox()
    const nav = await page.locator('header').first().boundingBox()
    fits.push({ id, top: Math.round(frame.y), bottom: Math.round(frame.y + frame.height), nav: Math.round(nav.y + nav.height) })
  }
  check(
    'RF-16 a janela fixa cabe inteira na tela em 1024 x 700',
    fits.every((frame) => frame.top >= frame.nav && frame.bottom <= 700),
    fits.map((frame) => `${frame.id}: ${frame.top} a ${frame.bottom} px`).join(', '),
  )
  await context.close()
}

async function phone(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const page = await context.newPage()
  await page.goto(URL)
  await page.waitForTimeout(1500)

  check('RF-04 medidor escondido no celular', !(await page.locator('nav[aria-label="Profundidade"]').isVisible()))

  // RF-13: touching the title
  const heading = await page.locator('h1').boundingBox()
  await page.touchscreen.tap(heading.x + heading.width / 2, heading.y + heading.height / 2)
  await page.waitForTimeout(700)
  const touched = await titleHole(page)
  await page.waitForTimeout(3600)
  check('RF-13 no toque o título vira bolhas por alguns instantes', touched >= 30 && (await titleHole(page)) === 0, `círculo de ${Math.round(touched)} px`)

  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.waitForTimeout(400)
  check('RF-01 o menu mobile abre', await page.locator('#menu-mobile').isVisible())
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check(
    'RF-01 Esc fecha o menu e devolve o foco',
    (await page.locator('#menu-mobile').count()) === 0 &&
      (await page.evaluate(() => document.activeElement.getAttribute('aria-label'))) === 'Abrir menu',
  )
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.waitForTimeout(300)
  await page.locator('#menu-mobile a[href="#screens"]').click()
  await page.waitForTimeout(1500)
  check('RF-01 escolher um link fecha o menu', (await page.locator('#menu-mobile').count()) === 0)

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a, button, input')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        const inlineLink = element.tagName === 'A' && element.closest('p')
        return (
          rect.width > 0 &&
          !element.closest('[aria-hidden="true"]') &&
          element.tabIndex !== -1 &&
          !element.classList.contains('sr-only') &&
          !inlineLink &&
          (rect.height < 43.5 || rect.width < 43.5)
        )
      })
      .map((element) => (element.getAttribute('aria-label') || element.textContent).trim().slice(0, 24)),
  )
  check('alvos de toque de pelo menos 44 px', small.length === 0, small.join(', '))

  // RF-16: below 1024 px nothing is pinned and a tap on a feature drives the window
  const lastStep = page.locator('#player ol li').nth(2).locator('button')
  await centre(page, lastStep)
  const player = page.locator('[aria-label="Demonstração interativa do TrytonPlayer"]')
  const speed = async () => (await player.getByRole('button', { name: /Velocidade/ }).textContent()).trim()
  const untouched = (await lastStep.getAttribute('aria-pressed')) === 'false' && (await speed()) === '1,0x'
  await lastStep.tap()
  await page.waitForTimeout(1400)
  const frame = await player.boundingBox()
  check(
    'RF-16 no celular o scroll não muda a janela e tocar em um recurso muda',
    untouched && (await lastStep.getAttribute('aria-pressed')) === 'true' && (await speed()) === '1,5x',
    await speed(),
  )
  check('RF-16 no celular a janela vem para a tela ao tocar no recurso', frame.y >= 0 && frame.y < 844 * 0.6, `topo em ${Math.round(frame.y)} px`)

  // RF-18: with no pointer the light wanders by itself
  await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight))
  const first = await abyssLight(page)
  await page.waitForTimeout(1200)
  const second = await abyssLight(page)
  check('RF-18 sem ponteiro a luz passeia sozinha', Math.hypot(second.x - first.x, second.y - first.y) > 4)

  await tour(page, 700)
  const violations = await runAxe(page)
  check('RNF-05/06 axe-core sem violações (celular)', violations.length === 0, violations.join(' | '))
  await context.close()
}

async function preferences(browser) {
  let context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  let page = await context.newPage()
  const chunks = []
  page.on('request', (request) => /Trident3D/.test(request.url()) && chunks.push(request.url()))
  // `?3d=on` asks for the 3D scene, and reduced motion must still win (RNF-10).
  await page.goto(`${URL}?3d=on`)
  await page.waitForTimeout(1500)
  await scrollTo(page, 300)
  await page.mouse.move(1400, 300)
  await page.waitForTimeout(800)
  const still = [...(await heroLayers(page, 'x')), ...(await heroLayers(page, 'y'))].every((value) => value === 0)
  check('RNF-03 nenhuma camada se move com movimento reduzido', still)
  check(
    'RNF-03 sem animação em loop',
    await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .filter((element) => getComputedStyle(element).animationName !== 'none' && getComputedStyle(element).display !== 'none')
        .every((element) => getComputedStyle(element).animationIterationCount === '1'),
    ),
  )
  check('RNF-03 o player começa pausado', (await page.getByRole('button', { name: 'Reproduzir' }).count()) === 1)

  // RNF-10: what the immersion switches off, and what it keeps
  await scrollTo(page, 0)
  const heading = await page.locator('h1').boundingBox()
  await page.mouse.move(heading.x + heading.width * 0.4, heading.y + heading.height / 2, { steps: 8 })
  await page.waitForTimeout(900)
  check(
    'RNF-10 o título não vira bolhas',
    (await page.locator('h1 canvas').count()) === 0 && (await titleHole(page)) === 0 && (await page.locator('h1').getAttribute('aria-label')) === 'TryTonStudio',
  )
  const heroHeight = await page.locator('#topo').evaluate((element) => element.offsetHeight)
  await scrollTo(page, heroHeight * 0.6)
  check('RNF-10 a travessia não dispara', (await crossingSheets(page)) === 0)
  check('RNF-10 a cena 3D não carrega', chunks.length === 0 && (await page.locator('[data-trident-3d]').count()) === 0)
  check('RNF-10 as descobertas continuam na página', (await page.locator('section[id^="descoberta-"] h3').count()) >= 5)
  const lastStep = page.locator('#player ol li').nth(2)
  await centre(page, lastStep)
  const player = page.locator('[aria-label="Demonstração interativa do TrytonPlayer"]')
  check(
    'RNF-10 o scroll continua conduzindo a demonstração',
    (await lastStep.locator('button').getAttribute('aria-pressed')) === 'true' &&
      (await player.getByRole('button', { name: /Velocidade/ }).textContent()).trim() === '1,5x',
  )
  await scrollTo(page, await page.evaluate(() => document.documentElement.scrollHeight))
  const fixed = await abyssLight(page)
  await page.mouse.move(300, 300, { steps: 5 })
  await page.waitForTimeout(1000)
  const after = await abyssLight(page)
  const secrets = page.locator('[data-abyss] .abyss-text')
  const secretsBox = await secrets.boundingBox()
  check(
    'RNF-10 a lanterna vira luz fixa sobre o texto, que fica sempre legível',
    Math.hypot(after.x - fixed.x, after.y - fixed.y) < 1 &&
      (await secrets.evaluate((element) => getComputedStyle(element).maskImage)) === 'none' &&
      fixed.y > secretsBox.y &&
      fixed.y < secretsBox.y + secretsBox.height,
  )
  await context.close()

  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, contrast: 'more' })
  page = await context.newPage()
  await page.goto(URL)
  await page.waitForTimeout(1000)
  const glass = await page.evaluate(() =>
    [...document.querySelectorAll('.acrylic, .mica, .acrylic-thin')].map((element) => getComputedStyle(element).backdropFilter),
  )
  check('RNF-04 o vidro vira superfície sólida com mais contraste', glass.length > 5 && glass.every((value) => value === 'none'))
  await context.close()
}

/** RNF-09 and RNF-11: what the build weighs and what it carries. */
function bundle() {
  const html = readFileSync(`${DIST}index.html`, 'utf8')
  const initial = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.js)"/g)].map((match) => match[1])
  const kB = initial.reduce((sum, file) => sum + gzipSync(readFileSync(DIST + file)).length, 0) / 1000
  check('RNF-09 JavaScript inicial de até 150 kB comprimido', initial.length > 0 && kB <= 150, `${kB.toFixed(1)} kB`)
  const files = readdirSync(DIST, { recursive: true }).map(String)
  check(
    'RNF-09 a cena 3D fica em um arquivo separado, fora do carregamento inicial',
    files.some((file) => /Trident3D-.+\.js$/.test(file)) && !initial.some((file) => file.includes('Trident3D')) && !html.includes('Trident3D'),
  )
  const media = files.filter((file) => /\.(mp3|ogg|oga|wav|m4a|aac|flac|mp4|webm|mov|png|jpe?g|gif|webp|avif|bmp|hdr|exr|glb|gltf)$/i.test(file))
  check('RNF-11 nenhum áudio, vídeo, imagem raster ou modelo no build', media.length === 0, media.join(', '))
}

const server = await startPreview()
const browser = await chromium.launch()
try {
  bundle()
  await desktop(browser)
  await demos(browser)
  await webgl(browser)
  await responsive(browser)
  await phone(browser)
  await preferences(browser)
} finally {
  await browser.close()
  server.kill()
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length} de ${results.length} verificações passaram`)
process.exit(failed.length === 0 ? 0 : 1)

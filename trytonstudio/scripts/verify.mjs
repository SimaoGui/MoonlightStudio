/**
 * Teste de aceite da spec (specs/001-landing-page/spec.md).
 *
 * Abre o build de produção em um Chromium de verdade e confere os requisitos
 * que dá para medir: parallax, interações das janelas, navegação, responsividade,
 * acessibilidade (axe-core) e as preferências de movimento e contraste.
 *
 *   npm run build && npm run verify
 *
 * Na primeira vez, baixe o navegador com `npx playwright install chromium`.
 */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'

const PORT = 4173
const URL = `http://localhost:${PORT}/`
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

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(String(error)))
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

  // RF-04 / RF-01: depth gauge and active link
  const gauge = page.locator('nav[aria-label="Profundidade"]')
  check('RF-04 medidor de profundidade visível em 1440 px', await gauge.isVisible())
  await gauge.locator('a[href="#screens"]').click()
  await page.waitForTimeout(1600)
  check(
    'RF-01 a navegação destaca a seção visível',
    (await page.locator('nav[aria-label="Principal"] a[aria-current="true"]').textContent()).trim() === 'TrytonScreens',
  )
  const meters = Number((await gauge.locator('p span').nth(1).textContent()).replace(/\D/g, ''))
  check('RF-04 a leitura acompanha o scroll', meters >= 900 && meters <= 2500, `${meters} m`)

  // RF-06: player
  await scrollTo(page, await sectionTop(page, 'player'))
  const player = page.locator('[aria-label="Demonstração interativa do TrytonPlayer"]')
  const time = async () => (await player.locator('span.font-mono').first().textContent()).trim()
  const t0 = await time()
  await page.waitForTimeout(2300)
  check('RF-06 o vídeo avança enquanto toca', t0 !== (await time()))
  await player.getByRole('button', { name: 'Pausar' }).click()
  await page.waitForTimeout(400)
  const paused = await time()
  await page.waitForTimeout(1600)
  check('RF-06 pausar para o vídeo', paused === (await time()))
  await player.getByRole('button', { name: /Mar Aberto/ }).click()
  await page.waitForTimeout(500)
  check('RF-06 escolher um vídeo da fila troca o vídeo', (await player.textContent()).includes('Mar Aberto.mp4'))
  await player.getByRole('button', { name: /Velocidade/ }).click()
  check('RF-06 o botão de velocidade alterna', (await player.getByRole('button', { name: /Velocidade/ }).textContent()).trim() === '1,25x')
  await player.getByRole('button', { name: 'Legendas' }).click()
  check('RF-06 as legendas desligam', (await player.getByRole('button', { name: 'Legendas' }).getAttribute('aria-pressed')) === 'false')
  await player.getByRole('button', { name: 'Pausar' }).click()
  await player.getByRole('slider').focus()
  await page.keyboard.press('End')
  await page.waitForTimeout(300)
  check('RF-06 a barra de progresso funciona pelo teclado', (await time()).startsWith('1:12'), await time())

  // RF-08: tilt
  const flat = await player.evaluate((element) => getComputedStyle(element).transform)
  const box = await player.boundingBox()
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2)
  await page.waitForTimeout(900)
  const tilted = await player.evaluate((element) => getComputedStyle(element).transform)
  check('RF-08 a janela inclina com o ponteiro', flat !== tilted && tilted.startsWith('matrix3d'))

  // RF-07: screen sharing room
  await scrollTo(page, await sectionTop(page, 'screens'))
  const room = page.locator('[aria-label="Demonstração interativa do TrytonScreens"]')
  check('RF-07 selo Ao vivo durante a transmissão', (await room.getByText('Ao vivo').count()) === 1)
  await room.getByRole('button', { name: 'Região' }).click()
  await page.waitForTimeout(300)
  check('RF-07 trocar a fonte para Região', (await room.getByRole('button', { name: 'Região' }).getAttribute('aria-pressed')) === 'true' && (await room.textContent()).includes('1280 × 720'))
  await room.getByRole('button', { name: 'Microfone' }).click()
  check('RF-07 desligar o microfone', (await room.getByRole('button', { name: 'Microfone' }).getAttribute('aria-pressed')) === 'false')
  await room.getByRole('button', { name: 'Parar de compartilhar' }).click()
  await page.waitForTimeout(300)
  check('RF-07 parar esconde o selo Ao vivo', (await room.getByText('Ao vivo').count()) === 0 && (await room.getByRole('button', { name: 'Compartilhar tela' }).count()) === 1)

  // Honest download state + accessibility
  for (let y = 0; y <= 7000; y += 600) await scrollTo(page, y)
  const deadLinks = await page.locator('#download a[href="#download"], a[href="#"]').count()
  check('nenhum botão de download leva a lugar nenhum', deadLinks === 0)
  const violations = await runAxe(page)
  check('RNF-05/06 axe-core sem violações (desktop)', violations.length === 0, violations.join(' | '))
  check('sem erros no console', errors.length === 0, errors.join(' | '))
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
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()
  await page.goto(URL)
  await page.waitForTimeout(1200)
  await scrollTo(page, await sectionTop(page, 'player'))
  const gauge = await page.locator('nav[aria-label="Profundidade"]').boundingBox()
  const windowBox = await page.locator('[aria-label="Demonstração interativa do TrytonPlayer"]').boundingBox()
  check('RF-04 o medidor não cobre o conteúdo em 1280 px', gauge.x >= windowBox.x + windowBox.width - 1)
  await context.close()
}

async function phone(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const page = await context.newPage()
  await page.goto(URL)
  await page.waitForTimeout(1500)

  check('RF-04 medidor escondido no celular', !(await page.locator('nav[aria-label="Profundidade"]').isVisible()))
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

  for (let y = 0; y <= 9000; y += 700) await scrollTo(page, y)
  const violations = await runAxe(page)
  check('RNF-05/06 axe-core sem violações (celular)', violations.length === 0, violations.join(' | '))
  await context.close()
}

async function preferences(browser) {
  let context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  let page = await context.newPage()
  await page.goto(URL)
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

const server = await startPreview()
const browser = await chromium.launch()
try {
  await desktop(browser)
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

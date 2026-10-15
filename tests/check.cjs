// Validação do site gerado em ./dist com Playwright (instalação global):
//   NODE_PATH="$(npm root -g)" node tests/check.cjs [pasta-de-screenshots]
// Verifica overflow horizontal em 9 larguras, erros de console/rede, links internos e âncoras,
// menu mobile, FAQ, formulário (validação e mensagem gerada) e movimento reduzido.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const DIST = path.join(__dirname, '..', 'dist');
const SHOTS = process.argv[2];
const PAGES = ['/', '/v2/', '/areas-de-atuacao/', '/contato/', '/privacidade/', '/termos/'];
const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const failures = [];
const fail = (msg) => { failures.push(msg); console.log('  FALHA', msg); };

const server = http.createServer((req, res) => {
  let p = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  const ok = fs.existsSync(p);
  res.writeHead(ok ? 200 : 404, { 'content-type': TYPES[path.extname(ok ? p : '.html')] || 'application/octet-stream' });
  res.end(fs.readFileSync(ok ? p : path.join(DIST, '404.html')));
});

(async () => {
  // CSS com chaves desbalanceadas faz o navegador descartar regras em silêncio.
  const css = fs.readFileSync(path.join(DIST, 'assets/css/site.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) fail('site.css com chaves desbalanceadas');

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

  const open = async (url, opts = {}) => {
    const page = await browser.newPage(opts);
    page.on('console', (m) => m.type() === 'error' && fail(`${url}: console: ${m.text()}`));
    page.on('pageerror', (e) => fail(`${url}: js: ${e.message}`));
    page.on('response', (r) => r.status() >= 400 && r.url().startsWith(base) && fail(`${url}: HTTP ${r.status()} ${r.url()}`));
    await page.goto(base + url, { waitUntil: 'networkidle' });
    return page;
  };
  const scrollThrough = async (page) => {
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      scrollTo(0, 0); await new Promise((r) => setTimeout(r, 2200));
    });
  };

  // 1. Overflow, erros e screenshots
  const links = new Set();
  for (const url of PAGES) {
    console.log(url);
    for (const width of WIDTHS) {
      const page = await open(url, { viewport: { width, height: 860 } });
      await scrollThrough(page);
      const over = await page.evaluate(() => {
        const W = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth <= W) return null;
        return [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > W + 1).slice(0, 5).map((el) => el.tagName + '.' + el.className);
      });
      if (over) fail(`${url} @${width}px: overflow horizontal em ${over.join(', ')}`);
      const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal],[data-split],[data-hero],.area,.review,[data-faq]')].filter((e) => { const s = getComputedStyle(e); return s.visibility === 'hidden' || s.opacity === '0'; }).length);
      if (hidden) fail(`${url} @${width}px: ${hidden} elemento(s) continuam invisíveis após rolar a página`);
      if (width === WIDTHS[0]) (await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))).forEach((h) => links.add(`${url}|${h}`));
      if (SHOTS && (width === 390 || width === 1440)) await page.screenshot({ path: path.join(SHOTS, `${url.replace(/\//g, '_') || '_'}${width}.png`), fullPage: true });
      await page.close();
    }
  }

  // 2. Links internos e âncoras
  const checked = new Map();
  for (const entry of links) {
    const [from, href] = entry.split('|');
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const target = new URL(href, base + from);
    if (!checked.has(target.pathname)) {
      const res = await fetch(base + target.pathname);
      checked.set(target.pathname, res.status === 200 ? await res.text() : null);
    }
    const html = checked.get(target.pathname);
    if (!html) fail(`link quebrado em ${from}: ${href}`);
    else if (target.hash && !html.includes(`id="${target.hash.slice(1)}"`)) fail(`âncora inexistente em ${from}: ${href}`);
  }

  // 3. Menu mobile
  {
    const page = await open('/', { viewport: { width: 390, height: 844 } });
    await page.click('[data-menu-open]');
    if (!(await page.$eval('#menu', (d) => d.open))) fail('menu mobile não abriu');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    if (await page.$eval('#menu', (d) => d.open)) fail('menu mobile não fechou com Esc');
    if ((await page.getAttribute('[data-menu-open]', 'aria-expanded')) !== 'false') fail('aria-expanded do menu não voltou para false');
    await page.click('[data-menu-open]');
    await page.click('#menu a[href="/#faq"]');
    if (await page.$eval('#menu', (d) => d.open)) fail('menu não fechou ao navegar');
    // FAQ
    await page.click('.faq__item summary');
    if (!(await page.$eval('.faq__item', (d) => d.open))) fail('FAQ não abriu');
    await page.close();
  }

  // 4. Formulário
  {
    const page = await open('/contato/', { viewport: { width: 390, height: 844 } });
    await page.evaluate(() => { window.open = (u) => { window.__opened = u; return null; }; });
    await page.click('#contact-form button[type=submit]');
    const errors = await page.$$eval('.field__error', (es) => es.filter((e) => e.textContent.trim()).length);
    if (errors !== 3) fail(`formulário vazio deveria mostrar 3 erros, mostrou ${errors}`);
    if ((await page.evaluate(() => document.activeElement.id)) !== 'nome') fail('foco não foi para o primeiro campo inválido');
    await page.fill('#nome', 'Teste Silva');
    await page.fill('#empresa', 'Indústria Exemplo');
    await page.selectOption('#assunto', 'Contratos empresariais');
    await page.fill('#mensagem', 'Preciso revisar contratos com fornecedores.');
    await page.click('#contact-form button[type=submit]');
    const opened = await page.evaluate(() => window.__opened || '');
    const text = decodeURIComponent(opened.split('text=')[1] || '');
    if (!opened.startsWith('https://wa.me/5542999601379?text=') || !text.includes('Teste Silva') || !text.includes('Assunto: Contratos empresariais')) fail(`mensagem de WhatsApp incorreta: ${opened}`);
    if (!(await page.textContent('#form-status')).includes('WhatsApp')) fail('status de sucesso não exibido');
    await page.check('input[value=email]');
    if ((await page.textContent('[data-submit-label]')) !== 'Enviar por e-mail') fail('rótulo do botão não mudou para e-mail');
    await page.close();
  }

  // 4b. Abas das áreas: clique, teclado e abertura pelo #id
  {
    const page = await open('/areas-de-atuacao/#contratos', { viewport: { width: 390, height: 844 } });
    const visible = () => page.$$eval('[role=tabpanel]', (ps) => ps.filter((p) => !p.hidden).map((p) => p.id));
    if ((await visible()).join() !== 'contratos') fail('aba do #contratos não abriu');
    await page.click('#tab-marcas');
    if ((await visible()).join() !== 'marcas') fail('clique na aba não trocou o painel');
    await page.keyboard.press('ArrowRight');
    if ((await visible()).join() !== 'treinamentos' || (await page.evaluate(() => document.activeElement.id)) !== 'tab-treinamentos') fail('seta não moveu para a próxima aba');
    await page.close();
  }

  // 5. Movimento reduzido: conteúdo visível sem animação
  {
    const page = await open('/', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const vis = await page.$eval('h1', (h) => getComputedStyle(h).visibility);
    if (vis !== 'visible' || (await page.evaluate(() => document.documentElement.classList.contains('motion')))) fail('movimento reduzido ainda esconde conteúdo');
    await page.close();
  }

  // 6. 404
  const r404 = await fetch(base + '/nao-existe/');
  if (r404.status !== 404 || !(await r404.text()).includes('não foi encontrada')) fail('página 404 não servida');

  await browser.close();
  server.close();
  console.log(failures.length ? `\n${failures.length} falha(s).` : `\nOK: ${PAGES.length} páginas x ${WIDTHS.length} larguras, ${links.size} links, interações e movimento reduzido.`);
  process.exit(failures.length ? 1 : 0);
})();

// KS Advocacia: interações e motion. Sem framework; GSAP, ScrollTrigger, SplitText e Lenis servidos localmente.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
window.__ksMotion = true;
let lenis = null;

// Cabeçalho sólido depois do topo (IntersectionObserver, sem listener de scroll).
const header = $('.site-header');
new IntersectionObserver(([e]) => header.classList.toggle('is-solid', !e.isIntersecting)).observe($('#top-sentinel'));

// Menu mobile: <dialog> nativo cuida de foco, Esc e fundo inerte.
const menu = $('#menu');
const menuBtn = $('[data-menu-open]');
menuBtn.addEventListener('click', () => { menu.showModal(); menuBtn.setAttribute('aria-expanded', 'true'); lenis?.stop(); });
menu.addEventListener('close', () => { menuBtn.setAttribute('aria-expanded', 'false'); lenis?.start(); });
menu.addEventListener('click', (e) => { if (e.target === menu || e.target.closest('a, [data-menu-close]')) menu.close(); });
matchMedia('(min-width: 64rem)').addEventListener('change', (e) => e.matches && menu.open && menu.close());

// Botão flutuante some quando já existe um CTA visível (chamada final, rodapé, formulário).
const fab = $('.wa-fab');
const covering = new Set();
const fabIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => (e.isIntersecting ? covering.add(e.target) : covering.delete(e.target)));
  fab.classList.toggle('is-hidden', covering.size > 0);
});
$$('[data-hide-fab]').forEach((el) => fabIO.observe(el));

// Formulário de contato: monta a mensagem e abre WhatsApp ou e-mail. Nada é enviado a servidor nem armazenado.
const form = $('#contact-form');
if (form) {
  const status = $('#form-status');
  const submitLabel = $('[data-submit-label]', form);
  const fields = $$('[required]', form);

  const validate = (el) => {
    const msg = el.validity.valueMissing ? el.dataset.msgRequired
      : el.validity.tooShort ? el.dataset.msgShort
      : el.validity.typeMismatch ? el.dataset.msgType : '';
    el.closest('.field').classList.toggle('is-invalid', !!msg);
    msg ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid');
    $(`#${el.id}-erro`).textContent = msg;
    return !msg;
  };

  form.addEventListener('change', (e) => {
    if (e.target.name === 'canal') submitLabel.textContent = e.target.value === 'email' ? 'Enviar por e-mail' : 'Enviar pelo WhatsApp';
  });
  form.addEventListener('input', (e) => { if (e.target.closest('.is-invalid')) validate(e.target); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = fields.filter((f) => !validate(f));
    if (invalid.length) {
      status.dataset.state = 'error';
      status.textContent = 'Revise os campos destacados para continuar.';
      invalid[0].focus();
      return;
    }
    const d = new FormData(form);
    const empresa = d.get('empresa').trim();
    const text = `Olá! Meu nome é ${d.get('nome').trim()}${empresa ? `, da empresa ${empresa}` : ''}.\nAssunto: ${d.get('assunto')}\n\n${d.get('mensagem').trim()}`;
    const byEmail = d.get('canal') === 'email';
    const url = byEmail
      ? `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Contato pelo site: ${d.get('assunto')}`)}&body=${encodeURIComponent(text)}`
      : `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`;

    const link = Object.assign(document.createElement('a'), { href: url, textContent: 'abra por este link', target: byEmail ? '' : '_blank', rel: 'noopener' });
    status.dataset.state = 'ok';
    status.replaceChildren(
      byEmail ? 'Abrimos o seu aplicativo de e-mail com a mensagem pronta. Para concluir, é só enviar por lá. Se nada abriu, ' : 'Abrimos o WhatsApp com a sua mensagem pronta. Para concluir, toque em enviar no aplicativo. Se ele não abriu, ',
      link, '.');
    byEmail ? (location.href = url) : window.open(url, '_blank', 'noopener');
  });
}

// Áreas de atuação: <details name="areas"> já é exclusivo; aqui só troca a imagem ao lado.
const areas = $('[data-areas]');
if (areas) {
  $$('details[data-area]', areas).forEach((d) => d.addEventListener('toggle', () => {
    if (!d.open) return;
    $$('[data-area-img]', areas).forEach((img) => img.classList.toggle('is-active', img.dataset.areaImg === d.dataset.area));
  }));
}

// Abas das áreas de atuação (padrão WAI-ARIA): clique, setas, Home/End e #id no endereço.
const tabsEl = $('[data-tabs]');
if (tabsEl) {
  const tabs = $$('[role="tab"]', tabsEl);
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const select = (i, { focus = false, hash = false } = {}) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
    if (hash) history.replaceState(null, '', `#${panels[i].id}`);
    // No celular a lista rola na horizontal: centraliza a aba ativa sem mexer na rolagem da página.
    const list = tabs[i].parentElement;
    if (list.scrollWidth > list.clientWidth) {
      const lb = list.getBoundingClientRect(), tb = tabs[i].getBoundingClientRect();
      list.scrollTo({ left: list.scrollLeft + tb.left - lb.left - (lb.width - tb.width) / 2, behavior: 'smooth' });
    }
    if (window.gsap && root.classList.contains('motion')) window.gsap.fromTo(panels[i], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  };
  tabsEl.addEventListener('click', (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) select(tabs.indexOf(t), { hash: true });
  });
  tabsEl.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const keys = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select((keys[e.key] + tabs.length) % tabs.length, { focus: true, hash: true });
  });
  // Abre a aba indicada no endereço (links da home apontam para /areas-de-atuacao/#area).
  const fromHash = () => {
    const i = panels.findIndex((p) => `#${p.id}` === location.hash);
    select(Math.max(i, 0));
    if (i >= 0) tabsEl.scrollIntoView({ block: 'start' });
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
}

// Avaliações: rolagem nativa (swipe/teclado) + avanço automático que pausa com mouse, foco, fora da tela ou aba oculta.
const reviews = $('[data-reviews]');
if (reviews && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const track = $('[data-reviews-track]', reviews);
  let hold = false, inView = false;
  const next = () => {
    const w = track.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 16);
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + w, behavior: 'smooth' });
  };
  ['pointerenter', 'focusin', 'touchstart'].forEach((t) => reviews.addEventListener(t, () => (hold = true), { passive: true }));
  ['pointerleave', 'focusout'].forEach((t) => reviews.addEventListener(t, () => (hold = false)));
  new IntersectionObserver(([e]) => (inView = e.isIntersecting)).observe(track);
  setInterval(() => { if (!hold && inView && !document.hidden) next(); }, 4000);
}

// ---------- Motion ----------
const { gsap, ScrollTrigger, SplitText } = window;
if (!root.classList.contains('motion') || !gsap || !ScrollTrigger || !SplitText) {
  root.classList.remove('motion');
} else {
  document.fonts.ready.then(initMotion);
}

function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const ease = 'expo.out';
  const visible = { opacity: 1, y: 0, x: 0 };
  const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true });

  // Rolagem com inércia apenas com mouse/trackpad; toque e teclado continuam nativos.
  if (window.Lenis && matchMedia('(pointer: fine)').matches) {
    lenis = new window.Lenis({ lerp: 0.09, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Títulos: linhas sobem de dentro de uma máscara; o split é desfeito ao final (não corta descendentes).
  const splitIn = (h, vars = {}) => {
    const split = SplitText.create(h, { type: 'lines', mask: 'lines' });
    gsap.set(h, { autoAlpha: 1 });
    return gsap.from(split.lines, { yPercent: 110, duration: 1.3, ease, stagger: 0.1, ...vars, onComplete: () => split.revert() });
  };

  // ---- Hero: sem animação de abertura; só parallax de saída ----
  const hero = $('.hero');
  if (hero) {
    const bg = $('[data-hero-bg]', hero);
    // Saída: a foto ganha profundidade e o texto se afasta enquanto a página rola.
    gsap.to($('picture', bg), { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to($('[data-hero-content]', hero), { y: -90, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 25%', scrub: true } });
  }

  // Títulos de seção.
  $$('[data-split]').filter((h) => !h.closest('.hero')).forEach((h) => splitIn(h, { scrollTrigger: once(h) }));

  // ---- Antes e depois: a cortina acompanha a rolagem do card e cada linha troca de "antes" para "depois", uma por vez ----
  const ba = $('[data-ba]');
  if (ba) {
    const frame = $('.ba__frame', ba);
    const edge = $('[data-ba-edge]', ba);
    const soft = 'power2.inOut';
    const tl = gsap.timeline({ defaults: { ease: soft }, scrollTrigger: { trigger: frame, start: 'top 80%', end: 'bottom 60%', scrub: 1.5, invalidateOnRefresh: true } })
      .fromTo('[data-ba-after]', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, 0)
      .fromTo(edge, { x: () => frame.clientWidth }, { x: 0, ease: 'none', duration: 1 }, 0)
      .to('[data-ba-tag-before]', { opacity: 0, duration: 0.08 }, 0.04)
      .fromTo('[data-ba-tag-after]', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.1);
    $$('.ba__row', ba).forEach((row, i) => {
      const at = 0.16 + i * 0.19;
      tl.to($('.ba__item--before', row), { opacity: 0, y: -10, duration: 0.1 }, at)
        .fromTo($('.ba__item--after', row), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.12 }, at + 0.05);
    });
    tl.fromTo('[data-ba-cta]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.1 }, 0.9)
      .to(edge, { opacity: 0, duration: 0.05 }, 0.95);
  }

  // ---- Etapas empilhadas: cada card fica preso no topo e recua quando o próximo chega ----
  const stack = $$('[data-stack]');
  stack.forEach((card, i) => {
    gsap.from(card, { y: 90, opacity: 0, duration: 1.2, ease, scrollTrigger: once(card, 'top 95%') });
    const next = stack[i + 1];
    // Recuo só onde os cards ficam presos (tablet e desktop).
    if (next) gsap.matchMedia().add('(min-width: 48rem)', () => gsap.to(card, { scale: 0.92 + i * 0.015, '--shade': 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 30%', scrub: true } }));
  });

  // ---- Faixa de segmentos: loop contínuo que acelera e inverte com a rolagem ----
  const mq = $('[data-marquee]');
  if (mq) {
    const loop = gsap.to(mq, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    loop.totalTime(loop.duration() * 50); // permite tocar ao contrário sem chegar ao início
    ScrollTrigger.create({
      trigger: mq, start: 'top bottom', end: 'bottom top',
      onToggle: (s) => (s.isActive ? loop.resume() : loop.pause()),
      onUpdate: (s) => {
        const dir = s.direction;
        const boost = 1 + Math.min(Math.abs(s.getVelocity()) / 350, 5);
        gsap.to(loop, { timeScale: dir * boost, duration: 0.25, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: dir, duration: 1.2 }) });
      },
    });
  }

  // ---- Imagens com recorte: abrem de baixo para cima; a foto interna faz parallax ----
  $$('[data-fade]').forEach((m) => gsap.from(m, { opacity: 0, scale: 1.03, duration: 1.4, ease: 'power2.out', scrollTrigger: once(m, 'top 85%') }));
  $$('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Barras douradas crescem com a rolagem; cartões flutuantes andam em outro plano.
  $$('[data-bar]').forEach((bar) => {
    gsap.fromTo(bar, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: bar.parentElement, start: 'top 80%', end: 'center 45%', scrub: true } });
  });
  $$('[data-float]').forEach((el) => {
    gsap.fromTo(el, { y: 70, opacity: 0 }, { y: -12, opacity: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top 85%', end: 'bottom 60%', scrub: true } });
  });

  // ---- Grupos de cards: entram em lote com o ícone em destaque ----
  const cardBatch = (sel, extra) => ScrollTrigger.batch(sel, {
    start: 'top 88%', once: true,
    onEnter: (els) => {
      gsap.fromTo(els, { opacity: 0, y: 56 }, { ...visible, duration: 1.2, ease, stagger: 0.1 });
      extra?.(els);
    },
  });
  gsap.set('.area, .review, [data-faq]', { opacity: 0 });
  cardBatch('.area', (els) => gsap.from(els.map((el) => $('.area__btn', el)), { scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.06, delay: 0.2 }));
  cardBatch('.review');
  cardBatch('[data-faq]');
  // Painel de imagem das áreas entra em fade.
  const visual = $('.areas__visual');
  if (visual) gsap.from(visual, { opacity: 0, duration: 1.4, ease: 'power2.out', scrollTrigger: once(visual, 'top 85%') });

  // ---- Card de chamada: abre do centro para as bordas ----
  $$('[data-cta-card]').forEach((c) => {
    gsap.timeline({ scrollTrigger: once(c, 'top 85%') })
      .from(c, { opacity: 0, y: 30, duration: 1.2, ease: 'power2.out' })
      .from(c.children, { opacity: 0, y: 18, duration: 0.9, ease, stagger: 0.1 }, 0.7);
  });

  // ---- Faixa editorial: fixada no desktop enquanto a foto assenta e os diferenciais entram ----
  const ed = $('[data-editorial]');
  const mm = gsap.matchMedia();
  if (ed) {
    mm.add('(min-width: 64rem)', () => {
      gsap.timeline({ scrollTrigger: { trigger: ed, start: 'top top', end: '+=90%', pin: true, scrub: 1 } })
        .fromTo($('img', ed), { scale: 1.28 }, { scale: 1, ease: 'none' }, 0)
        .from($$('[data-diff]', ed), { opacity: 0, y: 70, stagger: 0.18, ease: 'power2.out' }, 0.15);
    });
    mm.add('(max-width: 63.99rem)', () => {
      gsap.fromTo($('img', ed), { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.12, ease: 'none', scrollTrigger: { trigger: ed, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from($$('[data-diff]', ed), { opacity: 0, y: 30, duration: 1, ease, stagger: 0.12, scrollTrigger: once(ed, 'top 60%') });
    });
  }

  // ---- Chamada final e rodapé ----
  const fin = $('[data-final]');
  if (fin) gsap.fromTo($('.final__grid', fin), { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: fin, start: 'top bottom', end: 'center center', scrub: true } });
  const wm = $('[data-watermark]');
  if (wm) gsap.fromTo(wm, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: wm.parentElement, start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // ---- Elementos de apoio (eyebrows, parágrafos, botões) ----
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { ...visible, duration: 1, ease, stagger: 0.08 }),
  });

  // Foco pelo teclado num bloco ainda não revelado: mostra na hora.
  document.addEventListener('focusin', (e) => {
    const el = e.target.closest('[data-reveal], [data-hero], [data-ba-cta], .area, .review, [data-faq]');
    if (el && getComputedStyle(el).opacity === '0') gsap.set(el, visible);
  });

  // Recalcula posições depois que imagens tardias carregam.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

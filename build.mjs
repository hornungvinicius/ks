// Build estático sem dependências: `node build.mjs` gera ./dist.
// Páginas em src/pages/*.html começam com um bloco JSON entre linhas `---`.
import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

// Domínio: SITE_URL explícito ou, na Vercel, o domínio de produção do projeto. Sem nenhum, canonical/og:url/sitemap são omitidos.
const VERCEL_PROD = process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
const SITE_URL = (process.env.SITE_URL || VERCEL_PROD || '').replace(/\/$/, '');

const C = {
  phone: '5542999601379',
  phoneLabel: '(42) 99960-1379',
  email: 'karolemssadv@gmail.com',
  address: 'Rua Nestor Guimarães, 111, Bairro Estrela, Ponta Grossa - PR',
};
const gmaps = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
// Perfil do Google: troque pela URL oficial do perfil (GOOGLE_PROFILE_URL) quando a cliente informar.
const GOOGLE = process.env.GOOGLE_PROFILE_URL || gmaps('KS Advocacia Empresarial, Ponta Grossa - PR');

const attr = (s) => s.replaceAll('&', '&amp;');
const TOKENS = {
  wa: (t) => attr(`https://wa.me/${C.phone}` + (t ? `?text=${encodeURIComponent(t)}` : '')),
  tel: () => `tel:+${C.phone}`,
  phone: () => C.phoneLabel,
  mail: (subject) => `mailto:${C.email}` + (subject ? `?subject=${encodeURIComponent(subject)}` : ''),
  email: () => C.email,
  waNumber: () => C.phone,
  maps: () => attr(gmaps(C.address)),
  google: () => attr(GOOGLE),
  year: () => String(new Date().getFullYear()),
};
const fill = (s) => s.replace(/\{\{(\w+)(?::([^}]*))?\}\}/g, (m, k, arg) => {
  if (!TOKENS[k]) throw new Error(`Token desconhecido: ${m}`);
  return TOKENS[k](arg);
});

const SRC = 'src', OUT = 'dist';
await rm(OUT, { recursive: true, force: true });
await cp(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true, filter: (p) => !p.endsWith('desktop.ini') });

const layout = (await readFile(join(SRC, 'layout.html'), 'utf8')).replace('%ICONS%', await readFile(join(SRC, 'icons.svg'), 'utf8'));
const pages = [];
for (const file of (await readdir(join(SRC, 'pages'))).filter((f) => f.endsWith('.html'))) {
  const raw = await readFile(join(SRC, 'pages', file), 'utf8');
  const [, json, body] = raw.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/) || [];
  if (!json) throw new Error(`${file}: bloco --- {json} --- ausente`);
  const meta = JSON.parse(json);
  const url = SITE_URL && SITE_URL + meta.path;
  const head = url
    ? `<link rel="canonical" href="${url}">\n  <meta property="og:url" content="${url}">\n  <meta property="og:image" content="${SITE_URL}/assets/img/og-ks.jpg">`
    : '';
  let html = layout
    .replace('%TITLE%', meta.title)
    .replaceAll('%DESC%', meta.description)
    .replace('%HEAD%', head + (meta.noindex ? '\n  <meta name="robots" content="noindex">' : ''))
    .replace('%JSONLD%', meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld(body))}</script>` : '')
    .replace('%CONTENT%', body)
    .replaceAll(`data-nav href="${meta.path}"`, `aria-current="page" href="${meta.path}"`);
  html = fill(html);
  const dest = meta.path.endsWith('/') ? join(OUT, meta.path, 'index.html') : join(OUT, meta.path);
  await mkdir(join(dest, '..'), { recursive: true });
  await writeFile(dest, html);
  pages.push(meta);
  // /v2/: a mesma home com títulos em sans serif (classe .v2 no CSS). Fica fora do índice e aponta o canonical para a home.
  if (meta.path === '/') {
    await mkdir(join(OUT, 'v2'), { recursive: true });
    await writeFile(join(OUT, 'v2', 'index.html'), html
      .replace('<html lang="pt-BR">', '<html lang="pt-BR" class="v2">')
      .replace('<meta name="description"', '<meta name="robots" content="noindex">\n  <link rel="preload" href="/assets/fonts/general-sans.woff2" as="font" type="font/woff2" crossorigin>\n  <meta name="description"'));
  }
}

// Dados estruturados apenas com informações confirmadas no briefing; o FAQ é lido do próprio HTML da página.
function text(s) { return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function jsonld(body) {
  const faq = [...body.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="faq__a">([\s\S]*?)<\/div>/g)]
    .map(([, q, a]) => ({ '@type': 'Question', name: text(q).replace(/^\d+\.\s*/, ''), acceptedAnswer: { '@type': 'Answer', text: text(a) } }));
  const firm = {
    '@type': 'LegalService',
    name: 'KS Advocacia Empresarial',
    description: 'Consultoria jurídica empresarial mensal, preventiva e estratégica.',
    telephone: '+' + C.phone,
    email: C.email,
    address: { '@type': 'PostalAddress', streetAddress: 'Rua Nestor Guimarães, 111, Bairro Estrela', addressLocality: 'Ponta Grossa', addressRegion: 'PR', addressCountry: 'BR' },
    areaServed: ['Ponta Grossa', 'Curitiba', 'Campos Gerais', 'Paraná', 'Maranhão', 'Brasil'],
    employee: { '@type': 'Person', name: 'Karolem Sousa Silva', jobTitle: 'Advogada (OAB/PR 132.409, OAB/MA 27.961)' },
    ...(SITE_URL && { url: SITE_URL + '/', image: SITE_URL + '/assets/img/og-ks.jpg' }),
  };
  return { '@context': 'https://schema.org', '@graph': [firm, ...(faq.length ? [{ '@type': 'FAQPage', mainEntity: faq }] : [])] };
}

const indexable = pages.filter((p) => !p.noindex);
if (SITE_URL) {
  await writeFile(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc></url>`).join('\n')}\n</urlset>\n`);
} else {
  console.warn('SITE_URL não definido: canonical, og:url e sitemap.xml foram omitidos.');
}
await writeFile(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n${SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml\n` : ''}`);
console.log(`ok: ${pages.length} páginas em ./${OUT}`);

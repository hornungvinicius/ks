// Guia do Viajante (KS Advocacia + agência de viagens): gera index.html com as 16 páginas em A5.
// node ebook/manual-do-viajante/build.mjs  →  ebook/manual-do-viajante/index.html
// O conteúdo fica nos objetos abaixo; o HTML é só montagem. Textos marcados como provisórios
// no README desta pasta precisam da revisão da Dra. Karolem antes da impressão.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// ---------- Ícones (Phosphor Fill, MIT): os do site + aviso e check em círculo ----------
const siteIcons = readFileSync(join(here, '../../src/icons.svg'), 'utf8');
const pick = (id) => siteIcons.match(new RegExp(`<symbol id="${id}"[\\s\\S]*?</symbol>`))[0];
const icons = ['i-file', 'i-scales', 'i-phone', 'i-mail', 'i-whatsapp'].map(pick).join('\n') + `
<symbol id="i-warning" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/></symbol>
<symbol id="i-check-circle" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></symbol>`;
const icon = (id) => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;

// ---------- Guilloché: linhas onduladas entrelaçadas, como nas páginas de visto ----------
function guilloche({ w = 560, h = 64, lines = 22, color, stroke = 0.45 }) {
  const paths = [];
  for (let family = 0; family < 2; family++) {
    for (let k = 0; k < lines; k++) {
      const phase = (k / lines) * Math.PI * 2 + family * Math.PI;
      let d = '';
      for (let x = 0; x <= w; x += 4) {
        const y = h / 2 + Math.sin(x / 38 + phase) * (h * 0.32) + Math.sin(x / 11 + phase * 2) * (h * 0.06);
        d += `${x ? 'L' : 'M'}${x},${y.toFixed(2)}`;
      }
      paths.push(`<path d="${d}"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><g fill="none" stroke="${color}" stroke-width="${stroke}">${paths.join('')}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// ---------- Linha de leitura do passaporte (rodapé) ----------
const MRZ_LEN = 44;
const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '<');
const mrz = (label) => ('P<BRA<GUIA<DO<VIAJANTE<<' + plain(label)).padEnd(MRZ_LEN, '<').slice(0, MRZ_LEN);

// ---------- Carimbo de capítulo ----------
function stamp(n, id) {
  return `<svg class="stamp" viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="arc-${id}" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
    <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" stroke-width="1"/>
    <text class="stamp__arc"><textPath href="#arc-${id}" textLength="268" lengthAdjust="spacing">GUIA DO VIAJANTE · CAPÍTULO ${n} · BOA VIAGEM ·</textPath></text>
    <text class="stamp__n" x="60" y="61" text-anchor="middle" dominant-baseline="central">${n}</text>
  </svg>`;
}

// ---------- Cards ----------
const CARDS = {
  atencao: { label: 'Atenção', icon: 'i-warning' },
  faca: { label: 'Faça isso', icon: 'i-check-circle' },
  guarde: { label: 'Guarde', icon: 'i-file' },
  direitos: { label: 'Seus direitos', icon: 'i-scales' },
};
const card = (type, text) => `<aside class="card card--${type}">${icon(CARDS[type].icon)}<div><p class="card__label">${CARDS[type].label}</p><p>${text}</p></div></aside>`;

// ---------- Conteúdo ----------
const chapters = [
  {
    n: 1, ink: 'c1', title: 'Antes de viajar', sub: 'planejamento', lede: 'Planejamento é o primeiro passo de uma viagem tranquila.',
    photo: { src: 'cap1-mapa-passaporte.jpg', pos: '50% 55%', alt: 'Passaporte sobre um mapa, com relógio, óculos de sol e notas de dinheiro.' },
    topics: [
      ['Documentos necessários', 'Documento oficial com foto, dentro da validade e em bom estado.'],
      ['Passaporte, vistos e autorizações', 'Confira a validade do passaporte e as exigências do destino e das escalas com antecedência.'],
      ['Seguro viagem', 'Em alguns destinos ele é obrigatório. Leia o que a apólice cobre e salve os contatos de atendimento.'],
      ['Cuidados com documentos e informações pessoais', 'Guarde cópias digitais em local seguro e não publique fotos de documentos ou do cartão de embarque.'],
      ['Organização da viagem', 'Reúna reservas, horários e endereços em um só lugar, no celular e em papel.'],
      ['Checklist pré-viagem', 'Use a lista do capítulo 7 para não esquecer nada.'],
    ],
    cards: [['faca', 'Tire fotos dos documentos e guarde uma cópia longe dos originais.']],
  },
  {
    n: 2, ink: 'c2', title: 'Aeroporto e embarque', lede: 'Chegue com antecedência e evite contratempos.',
    photo: { src: 'cap2-terminal.jpg', pos: '50% 60%', alt: 'Passageiros com malas em um terminal de aeroporto ao entardecer.' },
    topics: [
      ['Quando chegar ao aeroporto', 'Siga o horário indicado pela companhia aérea. Em voos internacionais, a antecedência costuma ser maior.'],
      ['Check-in', 'Faça on-line quando possível e confira nome, voo e horário no cartão de embarque.'],
      ['Controle de segurança', 'Deixe eletrônicos e líquidos fáceis de retirar para agilizar a inspeção.'],
      ['Objetos proibidos ou restritos', 'Itens cortantes, inflamáveis e baterias têm regras próprias. Consulte a companhia antes de arrumar a mala.'],
      ['Transporte de líquidos', 'Em voos internacionais, frascos de até 100 ml, em uma embalagem plástica transparente de até 1 litro.'],
    ],
    cards: [['atencao', 'O portão de embarque pode mudar. Acompanhe os painéis e os avisos da companhia até a hora de embarcar.']],
  },
  {
    n: 3, ink: 'c3', title: 'Bagagem', lede: 'O que você precisa saber antes de despachar sua mala.',
    photo: { src: 'cap3-esteira.jpg', pos: '50% 50%', alt: 'Passageira retirando uma mala vermelha da esteira de bagagens.' },
    topics: [
      ['Bagagem de mão', 'Confira o peso e as medidas da sua tarifa. Leve nela remédios, documentos e objetos de valor.'],
      ['Bagagem despachada', 'Identifique a mala por dentro e por fora e guarde o comprovante de despacho.'],
      ['Excesso de bagagem', 'Pesar a mala em casa evita cobranças inesperadas no balcão.'],
      ['Bagagens especiais', 'Instrumentos, equipamentos esportivos e cadeiras de rodas pedem aviso prévio à companhia.'],
      ['Objetos de valor', 'Não despache joias, eletrônicos e dinheiro. Mantenha esses itens com você.'],
    ],
    cards: [['faca', 'Fotografe sua mala antes do despacho.'], ['guarde', 'Cartão de embarque, comprovante de despacho e protocolo de atendimento.']],
  },
  {
    n: 4, ink: 'c4', title: 'Quando algo dá errado', lede: 'Saber o que fazer evita dor de cabeça.', two: true,
    photo: { src: 'cap4-imprevisto.jpg', pos: '50% 62%', alt: 'Passageira sentada no chão, preocupada, ao lado da esteira de bagagens vazia.' },
    topics: [
      ['Perdi meu voo. E agora?', 'Procure a companhia o quanto antes e pergunte sobre remarcação e as regras da sua tarifa.'],
      ['Meu voo foi atrasado ou cancelado. O que faço?', 'Peça a informação por escrito e pergunte sobre assistência, reacomodação ou reembolso.'],
      ['Minha bagagem não chegou.', 'Registre a ocorrência antes de sair do desembarque. O passo a passo está na próxima página.'],
      ['Minha bagagem foi danificada.', 'Fotografe o dano ainda no aeroporto e registre a reclamação na companhia.'],
      ['Perdi uma conexão.', 'Procure o balcão da companhia na escala e peça a reacomodação.'],
      ['Fui impedido de embarcar (overbooking).', 'Não saia do balcão sem uma solução registrada: novo voo, assistência ou reembolso.'],
      ['Tive um problema durante a viagem.', 'Anote data, hora e nomes, e guarde tudo o que comprove o que aconteceu.'],
      ['Perdi meus documentos.', 'Registre a ocorrência na polícia. No exterior, procure o consulado brasileiro.'],
      ['Fui vítima de furto ou golpe.', 'Bloqueie cartões e contas, registre a ocorrência e avise a agência.'],
      ['Tive uma emergência durante a viagem.', 'Acione primeiro o seguro viagem: ele indica onde você será atendido.'],
    ],
  },
  {
    n: 5, ink: 'c5', title: 'Direitos do viajante', lede: 'Você tem direitos e pode exercê-los.',
    topics: [
      ['Quando procurar orientação jurídica', 'Quando a companhia não resolve o problema, o prejuízo é relevante ou você não sabe se um direito foi desrespeitado.'],
      ['Como preservar seus direitos', 'Registre tudo por escrito, guarde os comprovantes e não aceite soluções apenas verbais.'],
    ],
  },
  {
    n: 6, ink: 'c6', title: 'Como produzir provas', sub: 'durante uma viagem', lede: 'Registros simples fazem diferença se algo der errado.', two: true,
    photo: { src: 'cap6-provas.jpg', pos: '50% 42%', alt: 'Mão segurando o celular para fotografar objetos sobre a mesa.' },
    topics: [
      ['Fotografias e vídeos', 'Registre a mala antes do despacho e qualquer dano assim que perceber.'],
      ['E-mails e mensagens', 'Prefira canais escritos e não apague conversas com a companhia ou a agência.'],
      ['Protocolos de atendimento', 'Anote o número, a data e o nome de quem atendeu.'],
      ['Comprovantes de despesas', 'Alimentação, transporte e hospedagem extras podem ser cobrados depois.'],
      ['Bilhetes e cartões de embarque', 'Guarde até o fim de qualquer reclamação, inclusive os digitais.'],
      ['Notas fiscais e recibos', 'Peça a nota no nome do passageiro sempre que possível.'],
      ['Testemunhas', 'Anote o nome e o contato de quem presenciou o problema.'],
      ['Por que guardar todos os documentos', 'Sem prova, fica mais difícil pedir reembolso ou indenização.'],
    ],
  },
  { n: 7, ink: 'c7', title: 'Checklist do viajante', lede: 'Imprima ou salve no celular.' },
  { n: 8, ink: 'c8', title: 'Canais e contatos úteis', lede: 'Para ter à mão quando precisar.' },
];

const checklist = [
  ['Antes da viagem', ['Documentos válidos e conferidos', 'Vistos e autorizações, se exigidos', 'Seguro viagem contratado', 'Reservas salvas no celular e impressas', 'Cópias digitais dos documentos']],
  ['No dia da viagem', ['Documento com foto na bolsa', 'Cartão de embarque', 'Remédios na bagagem de mão', 'Carregador e bateria externa', 'Mala pesada e identificada']],
  ['No aeroporto', ['Chegar com a antecedência indicada', 'Fotografar a mala antes do despacho', 'Guardar o comprovante de despacho', 'Conferir portão e horário no painel']],
  ['Durante a viagem', ['Guardar notas e recibos', 'Documentos em local seguro', 'Contatos de emergência à mão']],
  ['Antes do retorno', ['Confirmar o horário do voo', 'Conferir as regras de bagagem da volta', 'Guardar compras e notas fiscais juntas']],
  ['Depois da viagem', ['Conferir a mala ao desembarcar', 'Registrar qualquer problema na hora', 'Guardar os comprovantes até tudo se resolver']],
];

const contacts = [
  ['Companhia aérea', null],
  ['Aeroporto', null],
  ['ANAC', 'Telefone 163<br>anac.gov.br'],
  ['Consumidor.gov.br', 'consumidor.gov.br'],
  ['Autoridades policiais', 'No Brasil, 190'],
  ['Consulado ou embaixada', null],
  ['Seguro viagem', null],
  ['Agência de viagens', 'Laura Lamounier<br><span class="todo">telefone e e-mail da agência</span>'],
  ['Orientação jurídica', 'KS Advocacia Empresarial<br>Dra. Karolem Silva<br>(42) 99960-1379<br>karolemssadv@gmail.com'],
];

// ---------- Montagem ----------
let folio = 0;
const pages = [];
const page = (cls, inner, { label, ink } = {}) => {
  folio += 1;
  const style = ink ? ` style="--ink: var(--${ink})"` : '';
  const foot = label ? `<footer class="mrz" aria-hidden="true"><span>${esc(mrz(label))}</span><span class="mrz__folio">${String(folio).padStart(2, '0')}</span></footer>` : '';
  pages.push(`<section class="page ${cls}"${style} data-page="${folio}">${inner}${foot}</section>`);
};
const tocEntries = [];

const logos = (variant) => `<div class="logos logos--${variant}">
  <img src="img/ks-logo.png" alt="KS Advocacia Empresarial, Dra. Karolem Silva" class="logos__ks">
  <span class="logos__rule" aria-hidden="true"></span>
  <p class="logos__agency">Laura Lamounier<span>Agência de viagens</span></p>
</div>`;

// 1. Capa
page('page--cover', `
  <div class="cover__frame" aria-hidden="true"></div>
  <figure class="cover__window"><img src="img/capa-asa-litoral.jpg" alt="Vista da janela do avião: a asa sobre o litoral, ao entardecer."></figure>
  <div class="cover__text">
    <h1 class="cover__title">Guia do<br>Viajante</h1>
    <p class="cover__lede">Informação para viajar melhor.</p>
  </div>
  ${logos('cover')}`);

// 2. Boas-vindas
page('page--paper page--intro', `
  <div class="guil" aria-hidden="true"></div>
  <p class="intro__quote">Informação também faz parte da sua bagagem.</p>
  <div class="intro__body">
    <p>Viajar exige planejamento, mas imprevistos podem acontecer. Este Guia do Viajante reúne informações e orientações práticas para ajudar você a se preparar antes, durante e depois da viagem, abordando temas como documentação, aeroporto, bagagem, conexões, viagens internacionais e direitos dos passageiros.</p>
    <p>Além de apresentar seus principais direitos, o guia explica como agir diante de situações inesperadas, quais documentos guardar e quais providências adotar para proteger seus interesses.</p>
    <p>Nosso objetivo é tornar sua viagem mais segura e tranquila, por meio da informação e da prevenção.</p>
    <p>Consulte o guia antes e durante a sua viagem.</p>
  </div>
  <p class="intro__sign">Boa viagem!</p>
  <p class="intro__credits">Um guia criado por Karolem Silva e Laura Lamounier.</p>`, { label: 'Boas vindas' });

// 3. Sumário (preenchido depois, quando as páginas dos capítulos forem conhecidas)
const tocIndex = pages.length; page('page--paper page--toc', '', { label: 'Sumario' });

// 4. Como usar
page('page--paper page--howto', `
  <div class="guil" aria-hidden="true"></div>
  <h1 class="plain__title">Como usar este guia</h1>
  <p class="plain__lede">Cada capítulo traz os temas em blocos curtos. Os quadros coloridos destacam o que não pode ficar para depois.</p>
  <div class="howto">
    ${card('atencao', 'Um cuidado que evita prejuízo. Leia antes de agir.')}
    ${card('faca', 'Uma atitude simples que protege você e a sua bagagem.')}
    ${card('guarde', 'Documentos e comprovantes que podem ser pedidos depois.')}
    ${card('direitos', 'O que o passageiro pode pedir em determinadas situações.')}
  </div>
  <p class="howto__note">Os números dos capítulos e dos temas seguem o sumário. Use o carimbo colorido de cada abertura para encontrar o capítulo com rapidez.</p>`, { label: 'Como usar' });

// Capítulos
const chapterHead = (c) => `
  <header class="ch-head">
    ${stamp(c.n, c.n)}
    <div class="ch-head__text">
      <h1 class="ch-title">${c.title}${c.sub ? `<span>${c.sub}</span>` : ''}</h1>
      <p class="ch-lede">${c.lede}</p>
    </div>
  </header>`;
const topicList = (c) => `<ol class="topics${c.two ? ' topics--two' : ''}" role="list">${c.topics.map(([t, d], i) => `
    <li><span class="topics__n">${c.n}.${i + 1}</span><div><h2>${t}</h2><p>${d}</p></div></li>`).join('')}
  </ol>`;
const photo = (p, cls = '') => `<figure class="ch-photo ${cls}"><img src="img/${p.src}" alt="${p.alt}" style="object-position: ${p.pos}"></figure>`;

for (const c of chapters) {
  tocEntries.push({ n: c.n, title: c.title + (c.sub ? (c.n === 1 ? `: ${c.sub}` : ` ${c.sub}`) : ''), ink: c.ink, page: folio + 1 });
  const label = c.title;
  if (c.n <= 3 || c.n === 6) {
    page(`page--paper page--chapter${c.n === 6 ? ' page--dense' : ''}`, `
      <div class="guil" aria-hidden="true"></div>${chapterHead(c)}${photo(c.photo)}${topicList(c)}
      ${(c.cards || []).length ? `<div class="cards">${c.cards.map(([t, x]) => card(t, x)).join('')}</div>` : ''}`, { label, ink: c.ink });
  } else if (c.n === 4) {
    page('page--paper page--chapter page--dense', `
      <div class="guil" aria-hidden="true"></div>${chapterHead(c)}${photo(c.photo, 'ch-photo--short')}${topicList(c)}`, { label, ink: c.ink });
    page('page--paper page--steps', `
      <div class="guil" aria-hidden="true"></div>
      <p class="steps__kicker">${c.n}.3 · Minha bagagem não chegou</p>
      <h1 class="plain__title">Bagagem extraviada: o que fazer?</h1>
      <ol class="steps" role="list">
        <li>Procure imediatamente o atendimento da companhia aérea.</li>
        <li>Registre a ocorrência.</li>
        <li>Guarde o comprovante.</li>
        <li>Informe seus dados de contato.</li>
        <li>Guarde os comprovantes das despesas realizadas.</li>
      </ol>
      <div class="cards">
        ${card('atencao', 'Não deixe o aeroporto sem registrar formalmente o problema com sua bagagem.')}
        ${card('faca', 'Fotografe sua mala antes do despacho.')}
        ${card('guarde', 'Cartão de embarque, comprovante de despacho e protocolo de atendimento.')}
        ${card('direitos', 'Em determinadas situações, o passageiro pode ter direito à assistência, reacomodação ou reembolso.')}
      </div>`, { label: 'Bagagem extraviada', ink: c.ink });
  } else if (c.n === 5) {
    page('page--paper page--chapter page--rights', `
      <div class="guil" aria-hidden="true"></div>${chapterHead(c)}
      ${topicList(c)}
      <div class="cards">${card('direitos', 'Em determinadas situações, o passageiro pode ter direito à assistência, reacomodação ou reembolso.')}</div>
      <div class="lawyer">
        <img src="img/ks-monograma.png" alt="" class="lawyer__mark">
        <div>
          <p class="lawyer__name">Orientação jurídica</p>
          <p>KS Advocacia Empresarial<br>Dra. Karolem Silva, OAB/PR 132.409</p>
          <p class="lawyer__contact">${icon('i-whatsapp')}(42) 99960-1379</p>
        </div>
      </div>`, { label, ink: c.ink });
  } else if (c.n === 7) {
    const block = (list, start) => list.map(([t, items], i) => `
      <div class="check">
        <h2><span class="topics__n">7.${start + i + 1}</span>${t}</h2>
        <ul role="list">${items.map((x) => `<li><span class="box" aria-hidden="true"></span>${x}</li>`).join('')}</ul>
      </div>`).join('');
    page('page--paper page--checklist', `
      <div class="guil" aria-hidden="true"></div>${chapterHead(c)}<div class="checks">${block(checklist.slice(0, 3), 0)}</div>`, { label, ink: c.ink });
    page('page--paper page--checklist page--checklist-cont', `
      <div class="guil" aria-hidden="true"></div>
      <p class="steps__kicker">7 · Checklist do viajante, continuação</p>
      <div class="checks">${block(checklist.slice(3), 3)}</div>
      <p class="check__foot">Marque cada item à medida que resolver. Leve esta página impressa ou salve uma foto no celular.</p>`, { label: 'Checklist', ink: c.ink });
  } else if (c.n === 8) {
    page('page--paper page--contacts', `
      <div class="guil" aria-hidden="true"></div>${chapterHead(c)}
      <dl class="contacts">${contacts.map(([t, v], i) => `
        <div class="contact${v ? '' : ' contact--blank'}"><dt><span class="topics__n">8.${i + 1}</span>${t}</dt><dd>${v || '<span class="fill" aria-label="Espaço para anotar"></span><span class="fill"></span>'}</dd></div>`).join('')}
      </dl>`, { label, ink: c.ink });
  }
}

// 15. Anotações
page('page--paper page--notes', `
  <div class="guil" aria-hidden="true"></div>
  <h1 class="plain__title">Anotações da viagem</h1>
  <dl class="notes__fields">
    ${['Voo e localizador', 'Hotel', 'Apólice do seguro', 'Protocolos'].map((t) => `<div><dt>${t}</dt><dd><span class="fill"></span></dd></div>`).join('')}
  </dl>
  <div class="notes__lines" aria-hidden="true">${'<span></span>'.repeat(13)}</div>`, { label: 'Anotacoes' });

// 16. Contracapa
page('page--back', `
  <figure class="back__photo"><img src="img/contracapa-asa.jpg" alt="Asa do avião sobre um céu azul sem nuvens."></figure>
  <p class="back__quote">Informação também faz parte da sua bagagem.</p>
  <p class="back__credits">Um guia criado por Karolem Silva e Laura Lamounier.</p>
  ${logos('back')}`);

// Sumário com as páginas reais
pages[tocIndex] = pages[tocIndex].replace('</section>', '').replace(/(<section[^>]*>)/, `$1
  <div class="guil" aria-hidden="true"></div>
  <h1 class="plain__title">Sumário</h1>
  <ol class="toc" role="list">${tocEntries.map((e) => `
    <li style="--ink: var(--${e.ink})"><span class="toc__n">${e.n}</span><span class="toc__t">${e.title}</span><span class="toc__p">${String(e.page).padStart(2, '0')}</span></li>`).join('')}
  </ol>`) + '</section>';

const css = readFileSync(join(here, 'ebook.css'), 'utf8')
  .replace('%GUIL_PAPER%', guilloche({ color: '#B9CCC3', stroke: 0.4 }))
  .replace('%GUIL_NAVY%', guilloche({ h: 120, lines: 30, color: '#2A4170', stroke: 0.5 }));

writeFileSync(join(here, 'index.html'), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guia do Viajante</title>
<link rel="stylesheet" href="https://use.typekit.net/cec7ccc.css">
<style>
${css}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${icons}</svg>
<main class="book">
${pages.join('\n')}
</main>
</body>
</html>
`);
console.log(`ok: ${pages.length} páginas em index.html`);

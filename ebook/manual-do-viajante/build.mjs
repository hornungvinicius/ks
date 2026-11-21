// Guia do Viajante: gera index.html (16 páginas A5) a partir do conteúdo do DOCX "MANUAL DO VIAJANTE".
//   node ebook/manual-do-viajante/build.mjs
//
// Regra de conteúdo: todo texto informativo vem do DOCX, sem resumo e sem acréscimo.
// A numeração foi refeita em sequência (pedido da cliente: "precisa só ver a questão da numeração").
// Os únicos textos que não estão no DOCX são de navegação e de formulário (rótulos de campos,
// "Sumário", "Como usar este guia", títulos de página), listados no README.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// ---------- Conteúdo do DOCX ----------
const DOC = {
  titulo: 'Guia do Viajante',
  subtitulo: 'Informação para viajar melhor.',
  creditos: 'Produto criado por Karolem Silva e Laura Lamounier',
  introducao: [
    'Viajar exige planejamento, mas imprevistos podem acontecer. Este Guia do Viajante reúne informações e orientações práticas para ajudar você a se preparar antes, durante e depois da viagem, abordando temas como documentação, aeroporto, bagagem, conexões, viagens internacionais e direitos dos passageiros.',
    'Além de apresentar seus principais direitos, o guia explica como agir diante de situações inesperadas, quais documentos guardar e quais providências adotar para proteger seus interesses.',
    'Nosso objetivo é tornar sua viagem mais segura e tranquila, por meio da informação e da prevenção. Afinal, informação também faz parte da sua bagagem.',
    'Consulte o guia antes e durante a sua viagem. Informação também faz parte da sua bagagem.',
  ],
  despedida: 'Boa viagem!',
  bagagemLede: 'O que você precisa saber antes de despachar sua mala.',
  extraviada: {
    titulo: 'Bagagem extraviada',
    pergunta: 'O que fazer?',
    passos: [
      'Procure imediatamente o atendimento da companhia aérea.',
      'Registre a ocorrência.',
      'Guarde o comprovante.',
      'Informe seus dados de contato.',
      'Guarde os comprovantes das despesas realizadas.',
    ],
  },
  avisos: {
    atencao: 'Não deixe o aeroporto sem registrar formalmente o problema com sua bagagem.',
    faca: 'Fotografe sua mala antes do despacho.',
    guarde: 'Cartão de embarque, comprovante de despacho e protocolo de atendimento.',
    direitos: 'Em determinadas situações, o passageiro pode ter direito à assistência, reacomodação ou reembolso.',
  },
  // Índice já renumerado; "old" guarda o número do capítulo no DOCX (tabela no README).
  capitulos: [
    { n: 1, old: 1, titulo: 'Antes de viajar', sub: 'planejamento', itens: ['Documentos necessários', 'Passaporte, vistos e autorizações', 'Seguro viagem', 'Cuidados com documentos e informações pessoais', 'Organização da viagem', 'Checklist pré-viagem'] },
    { n: 2, old: 2, titulo: 'Aeroporto e embarque', itens: ['Quando chegar ao aeroporto', 'Check-in', 'Controle de segurança', 'Objetos proibidos ou restritos', 'Transporte de líquidos'] },
    { n: 3, old: 3, titulo: 'Bagagem', itens: ['Bagagem de mão', 'Bagagem despachada', 'Excesso de bagagem', 'Bagagens especiais', 'Objetos de valor'] },
    { n: 4, old: 11, titulo: 'Quando algo dá errado', itens: ['Perdi meu voo. E agora?', 'Meu voo foi atrasado/cancelado. O que faço?', 'Minha bagagem não chegou.', 'Minha bagagem foi danificada.', 'Perdi uma conexão.', 'Fui impedido de embarcar/overbooking', 'Tive um problema durante a viagem.', 'Perdi meus documentos.', 'Fui vítima de furto ou golpe.', 'Tive uma emergência durante a viagem.'] },
    // O DOCX não traz o título deste capítulo (só os itens 12.9 e 12.10). "Direitos do viajante" vem da imagem de referência.
    { n: 5, old: 12, titulo: 'Direitos do viajante', itens: ['Quando procurar orientação jurídica', 'Como preservar seus direitos'] },
    { n: 6, old: 13, titulo: 'Como produzir provas', sub: 'durante uma viagem', itens: ['Fotografias e vídeos', 'E-mails e mensagens', 'Protocolos de atendimento', 'Comprovantes de despesas', 'Bilhetes e cartões de embarque', 'Notas fiscais e recibos', 'Testemunhas', 'Por que guardar todos os documentos'] },
    { n: 7, old: 15, titulo: 'Checklist do viajante', itens: ['Antes da viagem', 'No dia da viagem', 'No aeroporto', 'Durante a viagem', 'Antes do retorno', 'Depois da viagem'] },
    { n: 8, old: 16, titulo: 'Canais e contatos úteis', itens: ['Companhia aérea', 'Aeroporto', 'ANAC', 'Consumidor.gov.br', 'Autoridades policiais', 'Consulado ou embaixada', 'Seguro viagem', 'Contatos da agência de viagens', 'Contatos para orientação jurídica'] },
  ],
};
const C = Object.fromEntries(DOC.capitulos.map((c) => [c.n, c]));

// ---------- Utilidades ----------
let folio = 0;
const pages = [];
const pageNo = {};                         // capítulo → página de abertura
const page = (cls, inner, { foot } = {}) => {
  folio += 1;
  const side = folio % 2 ? 'odd' : 'even';  // ímpar = página da direita
  const f = foot ? `<footer class="folio"><span class="folio__n">${folio}</span><span class="folio__t">${foot}</span></footer>` : '';
  pages.push(`<section class="page page--${side} ${cls}" data-page="${folio}">${inner}${f}</section>`);
};
const titleOf = (c) => c.titulo + (c.sub ? (c.n === 1 ? ': ' : ' ') + c.sub : '');
const idx = (c, cls = '') => `<ol class="idx ${cls}" role="list">${c.itens.map((t, i) => `<li><span class="idx__n">${c.n}.${i + 1}</span><span class="idx__t">${t}</span></li>`).join('')}</ol>`;
const LABEL = { atencao: 'Atenção', faca: 'Faça isso', guarde: 'Guarde', direitos: 'Seus direitos' };
const note = (type, text, cls = '') => `<div class="note note--${type} ${cls}"><p class="note__label">${LABEL[type]}</p><p class="note__text">${text}</p></div>`;

const logos = (variant) => `<div class="logos logos--${variant}">
  <img class="logos__ks" src="img/${variant === 'dark' ? 'ks-logo.png' : 'ks-logo-azul.png'}" alt="KS Advocacia Empresarial, Dra. Karolem Silva">
  <p class="logos__agency">Laura Lamounier<span>Agência de viagens</span></p>
</div>`;

// ---------- 1. Capa ----------
page('p-cover', `
  <figure class="cover__photo"><img src="img/capa-asa-litoral.jpg" alt="Asa do avião sobre o litoral, vista pela janela."></figure>
  <div class="cover__type">
    <h1 class="cover__title">Guia do<br>Viajante</h1>
    <p class="cover__sub">${DOC.subtitulo}</p>
  </div>
  ${logos('light')}`);

// ---------- 2. Introdução ----------
page('p-intro', `
  <h1 class="intro__h">Introdução</h1>
  <div class="intro__text">${DOC.introducao.map((p) => `<p>${p}</p>`).join('')}
    <p class="intro__bye">${DOC.despedida}</p>
  </div>
  <p class="intro__credit">${DOC.creditos}</p>`, { foot: 'Introdução' });

// ---------- 3. Sumário (as páginas entram no fim) ----------
const tocAt = pages.length; page('p-toc', '', { foot: 'Sumário' });

// ---------- 4. Como usar ----------
page('p-howto', `
  <h1 class="page__h">Como usar este guia</h1>
  <p class="howto__lead">Consulte o guia antes e durante a sua viagem.</p>
  <div class="howto__grid">
    <section class="howto__block">
      <h2 class="howto__k">Numeração</h2>
      <p>Os temas seguem a numeração do sumário: o item <b>3.2</b> é o segundo tema do capítulo 3.</p>
    </section>
    <section class="howto__block">
      <h2 class="howto__k">Destaques</h2>
      <p>Ao longo do guia, quatro marcações indicam o tipo de informação.</p>
      <dl class="legend">
        <div class="note note--atencao"><dt class="note__label">Atenção</dt><dd class="note__text">o que não pode deixar de ser feito.</dd></div>
        <div class="note note--faca"><dt class="note__label">Faça isso</dt><dd class="note__text">uma providência prática.</dd></div>
        <div class="note note--guarde"><dt class="note__label">Guarde</dt><dd class="note__text">documentos e comprovantes a manter com você.</dd></div>
        <div class="note note--direitos"><dt class="note__label">Seus direitos</dt><dd class="note__text">o que o passageiro pode solicitar.</dd></div>
      </dl>
    </section>
    <section class="howto__block">
      <h2 class="howto__k">Páginas para preencher</h2>
      <p>O checklist, os contatos úteis e as anotações foram feitos para escrever à mão, no papel impresso.</p>
    </section>
  </div>`, { foot: 'Como usar' });

// ---------- 5. Capítulo 1: tipográfico, com o numeral como imagem ----------
pageNo[1] = folio + 1;
page('p-ch p-ch1', `
  <header class="ch1__head"><span class="bignum" aria-hidden="true">1</span>
    <div><p class="kicker">Capítulo 1</p><h1 class="ch__title">Antes de viajar<span class="sub">planejamento</span></h1></div>
  </header>
  ${idx(C[1], 'idx--large')}`, { foot: 'Antes de viajar' });

// ---------- 6. Capítulo 2: foto em pé na metade externa ----------
pageNo[2] = folio + 1;
page('p-ch p-ch2', `
  <figure class="ch2__photo"><img src="img/cap2-portoes.jpg" alt="Placas dos portões de embarque H18 e H16 no terminal."></figure>
  <div class="ch2__text">
    <p class="kicker">Capítulo 2</p>
    <h1 class="ch__title">Aeroporto e embarque</h1>
    ${idx(C[2])}
  </div>`, { foot: 'Aeroporto e embarque' });

// ---------- 7. Capítulo 3: abertura no formato do DOCX ("03 | BAGAGEM") ----------
pageNo[3] = folio + 1;
page('p-ch p-ch3', `
  <figure class="ch3__photo"><img src="img/cap3-esteira-3.jpg" alt="Esteira de bagagens vazia, com a placa amarela de número 3."></figure>
  <header class="ch3__head">
    <h1 class="ch3__label"><span>03</span>Bagagem</h1>
    <p class="ch3__lede">${DOC.bagagemLede}</p>
  </header>
  ${idx(C[3], 'idx--cols')}`, { foot: 'Bagagem' });

// ---------- 8. Bagagem extraviada: procedimento ----------
const extraviadaPage = folio + 1;
page('p-steps', `
  <p class="kicker">Capítulo 3, Bagagem</p>
  <h1 class="steps__h">${DOC.extraviada.titulo}<span>${DOC.extraviada.pergunta}</span></h1>
  <ol class="steps" role="list">${DOC.extraviada.passos.map((s) => `<li>${s}</li>`).join('')}</ol>
  <div class="steps__notes">
    ${note('atencao', DOC.avisos.atencao, 'note--strong')}
    ${note('faca', DOC.avisos.faca)}
    ${note('guarde', DOC.avisos.guarde)}
    ${note('direitos', DOC.avisos.direitos, 'note--wide')}
  </div>`, { foot: 'Bagagem' });

// ---------- 9. Capítulo 4: página escura de consulta ----------
pageNo[4] = folio + 1;
page('p-ch p-ch4 p-dark', `
  <figure class="ch4__photo"><img src="img/cap4-painel.jpg" alt="Painel de partidas no saguão do aeroporto."></figure>
  <div class="ch4__body">
    <p class="kicker">Capítulo 4</p>
    <h1 class="ch__title">Quando algo dá errado</h1>
    <ol class="problems" role="list">${C[4].itens.map((t, i) => `<li><span class="idx__n">4.${i + 1}</span><span class="problems__t">${t}${i === 2 ? `<span class="xref">Bagagem extraviada, página ${extraviadaPage}</span>` : ''}</span></li>`).join('')}</ol>
  </div>`, { foot: 'Quando algo dá errado' });

// ---------- 10. Capítulo 5: direitos, tipográfico ----------
pageNo[5] = folio + 1;
page('p-ch p-ch5', `
  <p class="kicker">Capítulo 5</p>
  <h1 class="ch__title">${C[5].titulo}</h1>
  <blockquote class="statement"><p class="note__label">Seus direitos</p><p>${DOC.avisos.direitos}</p></blockquote>
  ${idx(C[5], 'idx--large')}
  <div class="ch5__sign"><img src="img/ks-monograma-azul.png" alt=""><p>KS Advocacia Empresarial<span>Dra. Karolem Silva</span></p></div>`, { foot: 'Direitos do viajante' });

// ---------- 11. Capítulo 6: provas, em dois grupos ----------
pageNo[6] = folio + 1;
const it6 = C[6].itens.map((t, i) => ({ n: `6.${i + 1}`, t }));
const row6 = (x) => `<li><span class="box" aria-hidden="true"></span><span class="idx__n">${x.n}</span><span class="idx__t">${x.t}</span></li>`;
page('p-ch p-ch6', `
  <p class="kicker">Capítulo 6</p>
  <h1 class="ch__title">Como produzir provas<span class="sub">durante uma viagem</span></h1>
  <div class="proofs">
    <section><h2 class="proofs__k">Registros que você produz</h2><ol class="proofs__list" role="list">${[0, 1, 6].map((i) => row6(it6[i])).join('')}</ol></section>
    <section><h2 class="proofs__k">Documentos que você guarda</h2><ol class="proofs__list" role="list">${[2, 3, 4, 5].map((i) => row6(it6[i])).join('')}</ol></section>
  </div>
  <p class="proofs__why"><span class="idx__n">6.8</span><span>${it6[7].t}</span></p>`, { foot: 'Como produzir provas' });

// ---------- 12–13. Capítulo 7: checklist para preencher ----------
pageNo[7] = folio + 1;
const phase = (t, i, n = 6) => `<section class="phase"><h2><span class="idx__n">7.${i + 1}</span>${t}</h2><ul role="list">${'<li><span class="box" aria-hidden="true"></span><span class="line"></span></li>'.repeat(n)}</ul></section>`;
page('p-ch p-check', `
  <p class="kicker">Capítulo 7</p>
  <h1 class="ch__title">Checklist do viajante</h1>
  <div class="phases">${C[7].itens.slice(0, 3).map((t, i) => phase(t, i, 5)).join('')}</div>`, { foot: 'Checklist do viajante' });
page('p-check p-check--cont', `
  <div class="phases">${C[7].itens.slice(3).map((t, i) => phase(t, i + 3, 6)).join('')}</div>`, { foot: 'Checklist do viajante' });

// ---------- 14. Capítulo 8: contatos para preencher ----------
pageNo[8] = folio + 1;
page('p-ch p-contacts', `
  <p class="kicker">Capítulo 8</p>
  <h1 class="ch__title">Canais e contatos úteis</h1>
  <table class="contacts">
    <thead><tr><th scope="col"><span class="sr">Canal</span></th><th scope="col">Telefone</th><th scope="col">E-mail ou site</th></tr></thead>
    <tbody>${C[8].itens.map((t, i) => `<tr><th scope="row"><span class="idx__n">8.${i + 1}</span><span>${t}</span></th><td></td><td></td></tr>`).join('')}</tbody>
  </table>`, { foot: 'Canais e contatos úteis' });

// ---------- 15. Anotações ----------
page('p-notes', `
  <h1 class="page__h">Anotações</h1>
  <dl class="fields">${['Destino', 'Datas', 'Voo e localizador', 'Hospedagem', 'Seguro viagem', 'Contato de emergência'].map((t) => `<div><dt>${t}</dt><dd></dd></div>`).join('')}</dl>
  <div class="lines" aria-hidden="true">${'<span></span>'.repeat(11)}</div>`, { foot: 'Anotações' });

// ---------- 16. Encerramento ----------
page('p-back', `
  <div class="back__type">
    <p class="back__quote">Informação também faz parte da sua bagagem.</p>
    <p class="back__bye">${DOC.despedida}</p>
  </div>
  <figure class="back__photo"><img src="img/contracapa-asa.jpg" alt="Asa do avião sobre um céu azul."></figure>
  <div class="back__foot">${logos('dark')}<p class="back__credit">${DOC.creditos}</p></div>`);

// ---------- Sumário ----------
const toc = DOC.capitulos.map((c) => `
  <li class="toc__ch">
    <p class="toc__head"><span class="toc__n">${c.n}</span><span class="toc__t">${titleOf(c)}</span><span class="toc__p">${pageNo[c.n]}</span></p>
    <ol class="toc__items" role="list">${c.itens.map((t, i) => `<li><span class="idx__n">${c.n}.${i + 1}</span>${t}</li>`).join('')}</ol>
  </li>`).join('');
pages[tocAt] = pages[tocAt].replace(/(<section[^>]*>)/, `$1<h1 class="page__h">Sumário</h1><ol class="toc" role="list">${toc}</ol>`);

writeFileSync(join(here, 'index.html'), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${DOC.titulo}</title>
<link rel="stylesheet" href="https://use.typekit.net/cec7ccc.css">
<style>
${readFileSync(join(here, 'ebook.css'), 'utf8')}
</style>
</head>
<body>
<main class="book">
${pages.join('\n')}
</main>
</body>
</html>
`);
console.log(`ok: ${pages.length} páginas; capítulos nas páginas ${JSON.stringify(pageNo)}`);

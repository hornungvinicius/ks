# Guia do Viajante

Ebook da Dra. Karolem Silva (KS Advocacia Empresarial) com Laura Lamounier (agência de viagens). A5 (148 × 210 mm), 16 páginas, para impressão e PDF.

Material de origem (Drive): `MANUAL DO VIAJANTE.docx`, com o conceito visual, a introdução e o índice; uma imagem de referência; e o áudio do briefing.

## Gerar

```bash
node ebook/manual-do-viajante/build.mjs
```

Gera `index.html`. Para ver no navegador, sirva a pasta (`python3 -m http.server -d ebook/manual-do-viajante`). O PDF `guia-do-viajante.pdf` sai do mesmo HTML pelo Chromium, com `page.pdf({ preferCSSPageSize: true, printBackground: true })`.

Os textos ficam no início de `build.mjs` e o visual em `ebook.css`.

## Visual

Segue a landing page da KS (`DESIGN.md` na raiz do repositório). A primeira versão, com textura de passaporte e carimbos, foi descartada.

- Azul quase preto `#0B1119` na capa, na página de boas-vindas e na contracapa; miolo em branco, como as seções claras do site.
- Dourado só em eyebrows (com o filete à esquerda), números, ícones e na palavra de destaque dos títulos.
- Capítulos abrem com uma faixa escura com foto e a mesma máscara do topo das páginas internas do site.
- Quadros como os cards do site: borda fina, raio, caixa de ícone dourada. "Atenção" é o card escuro, como o card de chamada do site.
- Univers Next Pro nos títulos (kit Adobe Fonts `cec7ccc`) e Montserrat no texto (`fonts/montserrat.woff2`, a mesma do site).

## Numeração

O índice do Word pulava números, porque a cliente retirou alguns itens. A numeração foi refeita em sequência:

| Word | Guia |
|---|---|
| 1. Antes de viajar (1.1, 1.3, 1.5–1.8) | 1 (1.1–1.6) |
| 2. Aeroporto e embarque (2.1–2.3, 2.6, 2.7) | 2 (2.1–2.5) |
| 3. Bagagem | 3 |
| 11. Quando algo dá errado | 4 |
| 12.9 e 12.10 (capítulo sem título) | 5. Direitos do viajante (5.1, 5.2) |
| 13. Como produzir provas | 6 |
| 15. Checklist do viajante | 7 |
| 16. Canais e contatos úteis | 8 |

## Pendências antes de imprimir

1. **Textos para revisão da Dra. Karolem.** O Word traz só os títulos dos temas. A frase curta de cada tema, os quadros (exceto os que vieram no Word), os itens do checklist e os textos de "Como usar este guia" foram escritos para a diagramação. Todos são orientações gerais, sem prazos nem valores, e precisam de revisão jurídica.
2. **Título do capítulo 5.** O Word não traz título para os itens 12.9 e 12.10. "Direitos do viajante" veio da imagem de referência.
3. **Nome do material.** O arquivo se chama "Manual do Viajante", mas o conceito e a introdução usam "Guia do Viajante", que é o nome adotado na capa.
4. **Agência.** Faltam o logo de Laura Lamounier (hoje composto em texto) e o telefone e o e-mail da agência. Na página de contatos, o espaço está marcado em vermelho.
5. **Gráfica.** O PDF atual é digital: A5 exato, sem sangria, cores em RGB e fontes como Type 3. Para a gráfica, gerar uma versão com 3 mm de sangria e marcas de corte, conferir a conversão para CMYK e combinar com a gráfica o tipo de PDF.
6. **Figma.** Para que o texto continue editável, a Univers Next Pro precisa estar ativa no Figma de quem for editar.

## Fotos

Fotos reais do Freepik (sem IA), baixadas pela conta Premium via Magnific:

| Arquivo | Foto |
|---|---|
| `capa-asa-litoral.jpg` | Wing through the window of airplane in amazing sky at sunset (28006517) |
| `cap1-mapa-passaporte.jpg` | View of world travel map with passport (28478767) |
| `cap2-terminal.jpg` | Airport terminal with people moving silhouettes and sunray (28576568) |
| `cap3-esteira.jpg` | Woman waiting at a conveyor luggage airport (28576642) |
| `cap4-imprevisto.jpg` | Frustrated woman lost baggage in airport (27782932) |
| `cap6-provas.jpg` | High angle hand taking photos (28476669) |
| `contracapa-asa.jpg` | Airplane wing and blue sky (4695509) |
| `cap5-escritorio.webp`, `cap8-sala.webp` | As mesmas do site (`biblioteca-*` e `sala-reuniao-*`, ver `DESIGN.md`) |

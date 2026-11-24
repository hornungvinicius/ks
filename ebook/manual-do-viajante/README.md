# Guia do Viajante

Ebook da Dra. Karolem Silva (KS Advocacia Empresarial) com Laura Lamounier (agência de viagens). A5 (148 × 210 mm), 16 páginas, para impressão em caderno e PDF.

A fonte oficial do conteúdo é o `MANUAL DO VIAJANTE.docx`, que está no Drive.

## Gerar

```bash
node ebook/manual-do-viajante/build.mjs
```

O comando gera `index.html`. Para ver no navegador, sirva a pasta com `python3 -m http.server -d ebook/manual-do-viajante`. O arquivo `guia-do-viajante.pdf` sai do mesmo HTML pelo Chromium, com `page.pdf({ preferCSSPageSize: true, printBackground: true })`.

Todo o texto fica no objeto `DOC`, no início de `build.mjs`. O visual fica em `ebook.css`.

## Fidelidade ao DOCX

O texto informativo é o do DOCX, sem resumo e sem acréscimo. Foram conferidos por script 78 trechos: a introdução completa, todos os títulos do índice, o subtítulo de Bagagem, os cinco passos de "Bagagem extraviada", os quatro avisos e os créditos. Todos aparecem no PDF.

A versão anterior trazia textos que não estão no DOCX. Todos foram retirados:

- uma frase explicativa por tema;
- os subtítulos dos capítulos;
- os itens do checklist;
- telefones e sites de contato;
- quadros extras;
- os textos de capa e de contracapa.

Ela também omitia duas frases da introdução e alterava quatro títulos do índice, que voltaram ao original.

**Textos que não vêm do DOCX.** São só de navegação e de formulário:

- "Sumário", "Como usar este guia" e "Anotações";
- "Capítulo N" e os nomes de seção no rodapé;
- a página "Como usar este guia" inteira: numeração, legenda das quatro marcações e a explicação das páginas para preencher. A frase de abertura dessa página, "Consulte o guia antes e durante a sua viagem.", é do DOCX;
- os grupos "Registros que você produz" e "Documentos que você guarda" do capítulo 6, que só agrupam os itens do DOCX;
- as colunas "Telefone" e "E-mail ou site" dos contatos;
- os campos das anotações: Destino, Datas, Voo e localizador, Hospedagem, Seguro viagem e Contato de emergência;
- a remissão "Bagagem extraviada, página 8" no item 4.3.

## Numeração

A nota da cliente pedia para "ver a questão da numeração". O índice do DOCX pulava números, e a numeração foi refeita em sequência:

| DOCX | Guia |
|---|---|
| 1. Antes de viajar: planejamento (1.1, 1.3, 1.5–1.8) | 1 (1.1–1.6) |
| 2. Aeroporto e embarque (2.1–2.3, 2.6, 2.7) | 2 (2.1–2.5) |
| 3. Bagagem | 3 |
| 11. Quando algo dá errado | 4 |
| 12.9 e 12.10 (sem título de capítulo) | 5. Direitos do viajante |
| 13. Como produzir provas durante uma viagem | 6 |
| 15. Checklist do viajante | 7 |
| 16. Canais e contatos úteis | 8 |

## Direção de arte

- **Tipografia.** Duas famílias com funções distintas:
  - Newsreader (OFL, em `fonts/`) para títulos e leitura. É uma serifada editorial com tamanho óptico, então o desenho muda entre o texto e os títulos grandes.
  - Univers Next Pro, a fonte da marca, carregada do kit Adobe Fonts `cec7ccc`, só para navegação: números, rótulos e fólio.
- **Grade.** Margens espelhadas, com 16 mm na lombada e 12 mm do lado de fora. O fólio fica no canto externo, junto ao nome da seção.
- **Cor.** Papel branco e tinta azul-marinho `#15233F`. O vermelho aparece só no aviso "Atenção", e o dourado só no logo, na página escura e em "Seus direitos".
- **Avisos.** Os quatro avisos do DOCX viram marcações de texto: um rótulo e um filete em cima. Não há caixas nem ícones. Só o "Atenção" tem fundo, porque é o mais importante.
- **Ritmo.** Cada página tem uma composição própria:
  - capítulo 1, só tipografia, com o numeral grande;
  - capítulo 2, foto em pé na metade externa;
  - capítulo 3, abertura no formato pedido no DOCX ("03 | Bagagem");
  - capítulo 4, página escura de consulta, com os problemas numerados;
  - capítulo 5, só tipografia, com o aviso de direitos em destaque;
  - capítulo 6, os itens em dois grupos;
  - capítulos 7 e 8 e anotações, páginas para preencher.
- **Fotografia.** Cinco fotos reais de aeroporto, sem gente posando e sem máscara escura por cima. Cada uma tem relação direta com o capítulo; na de Bagagem, a placa da esteira traz o número 3.

## Pendências

1. **Textos dos temas.** O DOCX traz só os títulos dos 46 temas. O guia está completo em relação ao DOCX, mas os temas ainda não têm explicação. Para o guia orientar o leitor, a cliente precisa enviar esses textos ou autorizar uma redação que passe pela revisão jurídica.
2. **Título do capítulo 5.** "Direitos do viajante" vem da imagem de referência do Drive. Os itens 12.9 e 12.10 do DOCX não trazem título.
3. **Nome do material.** O arquivo se chama "Manual do Viajante". O DOCX propõe "Guia do Viajante" para a capa e usa esse nome na introdução, por isso ele foi mantido.
4. **Agência.** Falta o logo de Laura Lamounier, que hoje aparece composto em texto.
5. **Contatos.** Os campos estão em branco, porque o DOCX não traz dados. Se a cliente quiser, é possível preencher os da agência e os da KS.
6. **Gráfica.** O PDF atual é digital: A5 exato, sem sangria e com cores em RGB. Para imprimir, falta uma versão com 3 mm de sangria e marcas de corte, e conferir a cor com a gráfica.
7. **Figma.** Para o texto continuar editável, Newsreader (gratuita) e Univers Next Pro precisam estar ativas no Figma.

## Fotos

As fotos são reais (não geradas por IA), do Freepik, licenciadas pela conta Premium por meio do Magnific:

| Arquivo | Foto |
|---|---|
| `capa-asa-litoral.jpg` | Wing through the window of airplane in amazing sky at sunset (28006517) |
| `cap2-portoes.jpg` | Airport terminal gate number (28576624) |
| `cap3-esteira-3.jpg` | Baggage carousel at a airport terminal (28006080) |
| `cap4-painel.jpg` | Airport timetable display (27783093) |
| `contracapa-asa.jpg` | Airplane wing and blue sky (4695509) |

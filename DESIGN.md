---
name: KS Advocacia Empresarial
version: 2.0 (dark premium)
description: Experiência escura em azul quase preto (#0B1119) com seções off-white intercaladas, dourado do monograma KS como acento, cards de vidro discretos, Robelia em todos os títulos e destaques e Satoshi no texto.
colors:
  bg:       "#0B1119"   # base da página
  bg-2:     "#0F1722"   # seção alternada
  light:    "#F3F3EF"   # seção clara (off-white), com tokens próprios
  glass:    "linear-gradient(150deg, rgba(255,255,255,.075), rgba(255,255,255,.025)) + borda rgba(255,255,255,.09) + blur 18px (>= 48rem)"
  gold:     "#D6AA59"   # acento (rampa do monograma: #C8933F → #D6AA59 → #E8C27C)
  gold-hi:  "#E8C27C"
  gold-lo:  "#C8933F"
  text:     "#EEF2F7"
  muted:    "#A9B6C8"
  dim:      "#8E9DB2"
  error:    "#F08A8A"
  success:  "#7FC8A0"
typography:
  display: "Robelia (regular, sem itálico): H1, H2, H3, títulos de card, FAQ, listas de destaque, marca d'água; ã/õ refeitos com o til da própria fonte"
  sans: "Satoshi variável (Fontshare, licença ITF FFL), corpo, interface, rótulos e numerais grandes"
radius: { card: 16px, button: 6px, small: 10px, pill: 999px }
---

# KS Advocacia Empresarial · Sistema de design

## 1. Direção

Referência principal: a página da Brenda Prinsk (pasta REFERENCIAS), com hero fotográfico escuro, seções em cards, eyebrow dourado acima de cada título, FAQ numerado, chamada final e rodapé com marca d'água. Ajustes da cliente (PDF "KS ADVOCACIA"):

- Hero com o texto à direita, como na referência da Moirū.
- Antes e depois com cortina na rolagem, como na referência da Hocta.
- Etapas em cards empilhados, como na referência da Sidesc.
- Áreas de atuação em cards que se expandem e trocam a imagem ao lado.
- Avaliações reais do Google em carrossel automático.

Princípios:

1. **Escuro em camadas, não preto chapado.** Profundidade vem da variação entre `bg`, `bg-2`, `card` e `card-2`, da fotografia e de linhas finas, nunca de blocos claros.
2. **Dourado com função.** Eyebrows, palavra em itálico no título, CTA principal, ícones e estados ativos. Nunca em parágrafos.
3. **Cards para ler sem esforço.** Cada informação agrupada num card com borda `line`; hover destaca a borda em dourado.
4. **Quebra de linha controlada.** Títulos com `text-wrap: balance` e largura máxima em `ch`; parágrafos com `text-wrap: pretty` e no máximo ~52ch.
5. **Fotografia é protagonista**, sempre com máscara de leitura (gradiente funcional) e sem pessoas identificáveis enquanto não houver o ensaio real da advogada.

## 2. Contraste (WCAG 2.2, medido)

| Combinação | Razão |
|---|---|
| text sobre bg | 16,0:1 |
| muted sobre bg / card | 8,8:1 / 7,0:1 |
| dim sobre card | 5,2:1 |
| gold sobre bg / card | 8,4:1 / 6,7:1 |
| bg sobre botão dourado (pior ponto do gradiente) | 6,6:1 |
| error sobre card | 6,0:1 |

## 3. Tipografia

| Token | Tamanho fluido | Uso |
|---|---|---|
| `--t-hero` | 2.5rem → 4.6rem | H1 do hero |
| `--t-h1` | 2.3rem → 3.8rem | H1 das páginas internas |
| `--t-h2` | 2rem → 3.1rem | títulos de seção |
| `--t-h3` | 1.35rem → 1.6rem | títulos de card |
| `--t-lead` | 1rem → 1.125rem | apoio do título |
| `--t-eyebrow` | .72rem, caixa alta, tracking .22em | eyebrow, rótulos, botões |

## 4. Espaço e grid

Escala 4/8 (`--s-1`…`--s-9`), seção `clamp(5rem, 3.5rem + 6vw, 8.5rem)`, gutter `clamp(1rem, .5rem + 2.5vw, 2.5rem)` (16px no celular), largura máxima 76rem. Breakpoints 48rem e 64rem; abaixo de 64rem tudo vira coluna única na ordem de leitura.

## 5. Componentes

- **Botões**: dourado com gradiente e brilho que atravessa no hover; ghost com borda clara; quadrado para ação secundária de ícone. Altura mínima 52px.
- **Card** (`.card`): `card` + borda `line` + raio 16px; `icon-box` dourado que preenche no hover.
- **Antes e depois** (`.ba`): card com a foto num quadro 4:3 e as listas ao lado (embaixo no celular). A foto do "depois" cobre a do "antes" acompanhando a rolagem do card, sem fixar a tela; a lista troca no meio da cortina. Sem motion, o quadro mostra metade antes e metade depois e as duas listas aparecem.
- **Cards empilhados** (`.stack`): `position: sticky` com deslocamento por índice; o card anterior recua (escala) e escurece (`--shade`) quando o próximo chega.
- **Áreas** (`.areas`): `<details name="areas">` nativo (um aberto por vez); painel de imagem fixo à direita no desktop, imagem dentro do card no celular.
- **Avaliações** (`.reviews`): trilho com rolagem nativa e scroll-snap; avanço automático a cada 4,5s, pausa com hover, foco, fora da tela, aba oculta ou pelo botão de pausa; sem autoplay com movimento reduzido.
- **Abas** (`.tabs`, página de áreas): lista de abas à esquerda no desktop e faixa fixa com rolagem lateral no celular; painel com foto da área, descrição, áreas do briefing, serviços em cards e CTA. Padrão WAI-ARIA (setas, Home/End), `#id` no endereço abre a aba, troca com fade suave. Sem JS, todos os painéis aparecem em sequência.
- **FAQ**: `<details>` numerado com abertura animada por CSS.
- **Cabeçalho**: fixo, transparente no topo e com fundo após rolar; menu mobile em `<dialog>`.

## 6. Movimento (GSAP 3.15 + ScrollTrigger + SplitText + Lenis, todos locais)

| Momento | Técnica |
|---|---|
| Entrada | sem animação de abertura no hero (decisão da cliente); imagens entram sempre em fade |
| Saída do hero | foto aprofunda (parallax + escala) e o texto se afasta |
| Antes e depois | cortina dentro do card ligada à rolagem (scrub), filete dourado e troca das listas |
| Etapas | cards presos no topo, recuo e sombreamento na rolagem |
| Áreas | troca de imagem com fade e escala; botões "+" giram na entrada |
| Forma de trabalho | seção fixada no desktop; foto assenta e os diferenciais entram |
| Faixa de segmentos | loop que acelera e inverte com a velocidade da rolagem |
| Rodapé | marca d'água sobe com a rolagem |

Regras: no celular a linha do tempo global do GSAP roda a 60% da velocidade; imagens nunca abrem por recorte, só fade; textos decorativos ("Antes", "Depois", marca d'água do rodapé) usam preenchimento, nunca contorno; ícones apenas na variante preenchida do Phosphor. Lenis só com ponteiro fino (mouse/trackpad), parado quando o menu abre; `prefers-reduced-motion` desliga tudo e deixa o conteúdo visível; estados iniciais usam `opacity` (não `visibility`) para manter a ordem de foco; foco num bloco ainda oculto o revela; `gsap.matchMedia()` separa efeitos de desktop e mobile; nenhum listener de `scroll`.

## 7. Imagens

Geradas com Magnific (Nano Banana 2, 2K) e convertidas para WebP em duas larguras. Paleta azul-marinho com luz dourada pontual; sem pessoas identificáveis, sem martelos, balanças ou colunas. O retrato da advogada é a foto enviada pela cliente, tratada com Nano Banana 2.1 apenas para remover textos e logos e aumentar a resolução, sem alterar a pessoa. O hero usa um close de martelo a pedido da cliente.

# Site KS Advocacia Empresarial

Site estático sem dependências de build: HTML + CSS + JS, com GSAP, ScrollTrigger, SplitText e Lenis servidos localmente.

## Rodar

```bash
node build.mjs                       # gera ./dist
python -m http.server 4321 -d dist   # abre em http://localhost:4321
```

Para publicar, defina o domínio (gera canonical, og:url e sitemap.xml) e, quando houver, o link oficial do perfil no Google:

```bash
SITE_URL=https://dominio-da-ks.com.br GOOGLE_PROFILE_URL=https://g.page/... node build.mjs
```

## Deploy na Vercel

1. Em vercel.com, **Add New → Project** e importe o repositório `hornungvinicius/ks`.
2. Preset **Other**. Build, saída e headers já vêm do `vercel.json` (`node build.mjs` → `dist`).
3. Deploy. O domínio de produção da Vercel é usado automaticamente para canonical, og:url e sitemap. Ao ligar o domínio próprio, defina `SITE_URL` (e `GOOGLE_PROFILE_URL`, quando houver) em **Settings → Environment Variables** e faça um novo deploy.

A página 404 (`404.html`) é servida automaticamente.

## Estrutura

- `src/pages/*.html`: páginas (bloco JSON com título, descrição e caminho no topo).
- `src/layout.html`: cabeçalho, menu, rodapé e metadados compartilhados.
- `src/icons.svg`: ícones Phosphor e WhatsApp (Simple Icons).
- `src/assets/css/site.css`: tokens e componentes (ver `DESIGN.md`).
- `src/assets/js/main.js`: menu, formulário, carrossel, áreas e motion.
- Tokens nos HTMLs: `{{wa:mensagem}}`, `{{tel}}`, `{{mail}}`, `{{maps}}`, `{{google}}`, `{{phone}}`, `{{email}}`, `{{year}}`.

## Testes

```bash
NODE_PATH="$(npm root -g)" node tests/check.cjs [pasta-para-screenshots]
```

O script verifica:

- overflow horizontal em 320, 360, 375, 390, 430, 768, 1024, 1280 e 1440 px;
- erros de console e de rede;
- links internos e âncoras;
- menu mobile e FAQ;
- validação do formulário e a mensagem gerada para o WhatsApp;
- movimento reduzido e a página 404.

## Pendências da cliente

1. **Retrato**: a versão atual veio de uma arte de divulgação (tratada com IA para remover textos). Se houver o arquivo original do ensaio, ele deve substituir `src/assets/img/karolem-*.webp`.
2. **Biografia**: formação, comissões da OAB e texto de apresentação entraram com o material de 15/10/2026. Ainda faltam o capítulo do BNI e outras referências que a cliente disse que enviará.
3. **Domínio** de produção (`SITE_URL`).
4. **Link oficial do perfil no Google** (`GOOGLE_PROFILE_URL`). Hoje o botão abre a busca do Google Maps pelo escritório.
5. **Avaliações**:
   - autor da primeira ("Ótima profissional!…"), que não aparece no PDF e foi exibido como "Cliente no Google";
   - confirmar que todas são de 5 estrelas.
6. **Consultoria mensal**: a cliente substituiu o fluxo em quatro etapas pela explicação e pela lista de serviços enviadas em 15/10/2026. O nome público deixou de ser "assessoria continuada".
7. **Canal de denúncias**: o briefing só tem o título; o texto atual descreve a solução de forma genérica.

## Revisão jurídica antes de publicar

- Política de Privacidade (inclui a seção Cookies) e Termos de Uso são versões-base, escritas a partir do funcionamento real do site: sem cookies, sem analytics, formulário que não armazena dados. A responsável deve revisar antes da publicação.
- Exibição de avaliações: segundo a orientação da OAB/SP sobre o Provimento 205/2021, depoimentos só podem ser divulgados compartilhando o texto que o próprio cliente escreveu de forma espontânea, com a origem preservada. Os textos estão transcritos sem edição, com a indicação "Avaliação no Google". Mesmo assim, a advogada deve confirmar se a exibição está adequada ao entendimento da seccional.

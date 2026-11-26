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

## Deploy na HostGator (produção)

O site oficial (`https://ksadvocaciaempresarial.com.br`) fica na hospedagem da HostGator. A publicação é automática: cada push na `main` roda o workflow `.github/workflows/deploy.yml`, que gera o `dist/`, roda os testes e envia por FTP (FTPS) só os arquivos alterados para a `public_html`. Se os testes falharem, nada é publicado. Também dá para publicar à mão em **Actions → Deploy HostGator → Run workflow**.

Configuração, feita uma vez em **Settings → Secrets and variables → Actions** do repositório:

- Secrets: `FTP_SERVER` (`192.185.176.127`), `FTP_USERNAME` (`deploy@ksadvocaciaempresarial.com.br`) e `FTP_PASSWORD`. A conta FTP `deploy` é criada no cPanel com o diretório `public_html` (`/home1/karole74/public_html`), que é a raiz do domínio primário.
- Variables: `SITE_URL` (`https://ksadvocaciaempresarial.com.br`); opcionais `GOOGLE_PROFILE_URL` e `FTP_DIR` (pasta de destino dentro da conta FTP; padrão `./`).

O `src/.htaccess` vai junto no build e faz no Apache o que o `vercel.json` faz na Vercel: HTTPS e domínio sem "www", página 404, cabeçalhos de segurança e cache de imagens e fontes.

## Segurança e privacidade

O site é estático: não tem backend, banco de dados, login, cookies nem rastreamento. O formulário de contato não envia nada a servidor; ele só monta a mensagem no navegador e abre o WhatsApp ou o e-mail da pessoa. Com isso, injeção de SQL, CSRF, CORS, sessões e rate limiting não se aplicam.

O que está em vigor (regras em `src/.htaccess`, gerado em `dist/` pelo build):

- **CSP**: só aceita scripts do próprio site. O único script inline entra por hash, calculado no build. Também libera a fonte dos títulos (Adobe Fonts) e o iframe do Google Maps, que só carrega depois do clique.
  - `style-src-attr 'unsafe-inline'` é aceito porque o HTML usa variáveis CSS em `style` e o GSAP ScrollTrigger grava `style` no pin.
- **Cabeçalhos**:
  - HSTS de 1 ano, sem `includeSubDomains` e sem `preload`, porque `mail`, `ftp` e `cpanel` também apontam para o domínio;
  - `X-Content-Type-Options`, `X-Frame-Options` e `frame-ancestors 'none'`;
  - `Referrer-Policy`, `Permissions-Policy` e `Cross-Origin-Opener-Policy`.
- **Acesso a arquivos**:
  - HTTPS obrigatório e domínio sem "www";
  - listagem de pastas desligada;
  - arquivos ocultos (como o estado do deploy por FTP) devolvem 404.
- **Formulário**: `method="post"`, para que, sem JavaScript, os dados não apareçam na URL nem nos logs do servidor.
- **Deploy**:
  - actions do GitHub fixadas por hash de commit e token com permissão só de leitura;
  - Playwright instalado sem scripts de instalação;
  - credenciais só em secrets do GitHub.
- **Testes** (`tests/check.cjs`):
  - rodam com a mesma CSP de produção, então qualquer violação reprova o deploy;
  - conferem que todo script inline está na CSP, que todo link `_blank` tem `noopener` e que não há atributos de evento inline nem padrões de segredo nos arquivos públicos;
  - conferem que o mapa não carrega antes do clique.

A Vercel serve só prévias, com `X-Robots-Tag: noindex` para não concorrer com o domínio no Google.

## Google (indexação)

O site já publica `robots.txt`, `sitemap.xml`, canonical, Open Graph e dados estruturados (`LegalService` e `FAQPage`). Para indexar:

1. No Google Search Console, adicione a propriedade **Prefixo do URL** `https://ksadvocaciaempresarial.com.br/` e escolha a verificação por **Tag HTML**.
2. Copie só o código do `content` e salve na variável `GOOGLE_SITE_VERIFICATION` em **Settings → Secrets and variables → Actions → Variables**. Depois rode **Actions → Deploy HostGator → Run workflow**.
3. Clique em **Verificar**. Em **Sitemaps**, envie `sitemap.xml`. Em **Inspeção de URL**, peça a indexação da página inicial.

## Deploy na Vercel (prévias)

1. Em vercel.com, **Add New → Project** e importe o repositório `hornungvinicius/ks`.
2. Preset **Other**. Build, saída e headers já vêm do `vercel.json` (`node build.mjs` → `dist`).
3. Deploy. O domínio de produção da Vercel é usado automaticamente para canonical, og:url e sitemap. Ao ligar o domínio próprio, defina `SITE_URL` (e `GOOGLE_PROFILE_URL`, quando houver) em **Settings → Environment Variables** e faça um novo deploy.

A página 404 (`404.html`) é servida automaticamente.

## Fonte dos títulos

Univers Next Pro vem do kit Adobe Fonts `cec7ccc` (`src/layout.html`). O kit só entrega a fonte nos domínios cadastrados nele: ao ligar o domínio próprio, adicione-o em fonts.adobe.com → Web Projects.

## Estrutura

- `src/pages/*.html`: páginas (bloco JSON com título, descrição e caminho no topo).
- `src/layout.html`: cabeçalho, menu, rodapé e metadados compartilhados.
- `src/partials/*.html`: trechos repetidos entre páginas, incluídos com `{{partial:nome}}` (hoje, o mapa).
- `src/icons.svg`: ícones Phosphor e WhatsApp (Simple Icons).
- `src/assets/css/site.css`: tokens e componentes (ver `DESIGN.md`).
- `src/assets/js/main.js`: menu, formulário, mapa, avaliações, abas e motion.
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

1. **Retrato**: desde 24/11/2026 o hero (`hero-karolem-*`) e a seção da advogada (`karolem-sobre-*`) usam as fotos enviadas pela cliente. O retrato antigo (`karolem-*.webp`) continua no repositório.
2. **Biografia**: formação, comissões da OAB e texto de apresentação entraram com o material de 15/10/2026. Ainda faltam o capítulo do BNI e outras referências que a cliente disse que enviará.
3. **Domínio** de produção: `ksadvocaciaempresarial.com.br`, na HostGator. Falta cadastrar `SITE_URL` e os dados de FTP no GitHub (seção "Deploy na HostGator").
4. **Link oficial do perfil no Google** (`GOOGLE_PROFILE_URL`). Hoje o botão abre a busca do Google Maps pelo escritório.
5. **Avaliações**:
   - autor da primeira ("Ótima profissional!…"), que não aparece no PDF e foi exibido como "Cliente no Google";
   - confirmar que todas são de 5 estrelas.
6. **Consultoria mensal**: a cliente substituiu o fluxo em quatro etapas pela explicação e pela lista de serviços enviadas em 15/10/2026. O nome público deixou de ser "assessoria continuada".
7. **Fotos do escritório**: as fotos enviadas em 15/10/2026 ficam de fora. As imagens geradas por IA foram trocadas por fotos reais do Freepik (lista em `DESIGN.md`, seção 7).
8. **Canal de denúncias**: o briefing só tem o título; o texto atual descreve a solução de forma genérica.

## Revisão jurídica antes de publicar

- Política de Privacidade (inclui a seção Cookies) e Termos de Uso são versões-base, escritas a partir do funcionamento real do site: sem cookies, sem analytics, formulário que não armazena dados. A responsável deve revisar antes da publicação.
- Exibição de avaliações: segundo a orientação da OAB/SP sobre o Provimento 205/2021, depoimentos só podem ser divulgados compartilhando o texto que o próprio cliente escreveu de forma espontânea, com a origem preservada. Os textos estão transcritos sem edição, com a indicação "Avaliação no Google". Mesmo assim, a advogada deve confirmar se a exibição está adequada ao entendimento da seccional.

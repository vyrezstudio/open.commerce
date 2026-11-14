# OpenCommerce

<p align="center">
  <img src="assets/img/logo-mark.png" width="96" height="96" alt="OpenCommerce">
</p>

<p align="center">
  <strong>Crie uma loja virtual completa descrevendo o negócio. A IA monta o catálogo, os textos, o visual e o checkout PIX.</strong><br>
  100% estático, open source, sem mensalidade e sem backend.
</p>

<p align="center">
  <a href="#-começar">Começar</a> ·
  <a href="#-recursos">Recursos</a> ·
  <a href="#-inteligência-artificial-byok">IA (BYOK)</a> ·
  <a href="#-pagamentos">Pagamentos</a> ·
  <a href="#-publicar-no-github-pages">Publicar</a>
</p>

---

## ✨ O que é

O **OpenCommerce** é um construtor de e-commerce que roda inteiramente no navegador.
Você descreve o seu negócio em linguagem natural e a IA gera uma loja pronta:

- nome, posicionamento e textos de venda;
- catálogo com produtos, preços, ofertas e categorias;
- identidade visual (temas, cores e tipografia);
- seções de benefícios, sobre, depoimentos e FAQ;
- checkout com **PIX manual** (QR Code + copia-e-cola) e gateways opcionais;
- exportação em **um único `index.html`** para publicar no GitHub Pages.

Não existe servidor, banco de dados ou conta obrigatória. Tudo fica no `localStorage` do seu navegador.

> **Demonstração:** abra o painel, clique em **Minhas lojas → Abrir demonstração** e veja uma loja completa funcionando.

---

## 🚀 Começar

### Requisitos

- Um navegador moderno (Chrome, Edge, Firefox ou Safari);
- [Node.js](https://nodejs.org/) 18+ **apenas** para rodar o servidor local de desenvolvimento.

### Windows

Dê um duplo clique em **`iniciar.bat`**.
O servidor sobe em `http://127.0.0.1:4173/` e o navegador abre automaticamente.

### Qualquer sistema

```bash
npm start
# ou: node server.js --open
```

Depois acesse **http://127.0.0.1:4173/**.

> O servidor local é necessário porque os módulos usam ES Modules. Para publicar,
> o GitHub Pages já serve os arquivos por HTTP — não precisa de build.

---

## 🧩 Recursos

| Área | O que está incluído |
| --- | --- |
| **Criação com IA** | Geração completa a partir de uma descrição; editor que muda qualquer parte da loja; campo de site de referência; sugestões prontas; fallback local sem chave de IA |
| **Catálogo** | Produtos físicos e digitais, preços, preço antigo, selos, estoque, categorias, busca, imagens por upload/URL e capas geradas |
| **Pedidos** | Checkout na prévia, captura automática de pedidos, status (aguardando/pago/enviado/entregue/cancelado), receita e exportação CSV |
| **Pagamentos** | PIX manual com **chat de atendimento no checkout** (a loja entrega a chave e o cliente confirma), BR Code válido (EMV + CRC16), QR Code, copia-e-cola e validade; Mercado Pago, Asaas, Pagar.me, EFI e API própria com webhook |
| **Cupons** | Cupons percentuais ou de valor fixo, com mínimo de compra e validade |
| **Frete** | Frete fixo, grátis acima de um valor e prazo estimado |
| **Aparência** | 14 modelos prontos, 8 paletas rápidas, 14 temas base, cores, fontes, estilo dos cards, layout do herói, seções ligáveis e logo próprio |
| **Integrações** | Google Analytics 4, Meta Pixel, webhook de pedidos e código personalizado (head/CSS/JS) |
| **Publicação** | ZIP com `index.html`, `.nojekyll`, `README.md` e `produtos.json`; download avulso do `index.html` |
| **Privacidade** | Sem conta, sem telemetria e sem servidor próprio; chaves de IA e dados ficam no navegador (ou no proxy, se você publicar) |

---

## 🤖 Inteligência artificial (BYOK)

O OpenCommerce não cobra IA e não intermedia chamadas. Você conecta a **sua chave**
em **Configurações → Inteligência artificial**. A chave fica apenas no `localStorage`
do seu navegador e é enviada direto ao provedor escolhido.

Provedores suportados:

- OpenAI
- Google Gemini
- OpenRouter
- Groq
- DeepSeek
- Anthropic (Claude)
- Ollama (local)
- Qualquer API compatível com OpenAI (base URL + modelo personalizados)

**Sem chave?** O gerador local cria uma loja completa a partir do nicho e do briefing.
Você pode editar tudo manualmente e conectar a IA depois.

### IA segura em site público (recomendado)

Um site estático não consegue esconder uma chave. Por isso o projeto inclui o proxy
[`serverless/api/ai.js`](serverless/api/ai.js): a chave fica em `AI_API_KEY` na Vercel
e o navegador só conhece a URL do proxy.

1. Publique a pasta `serverless/` na Vercel.
2. Configure `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` e `ALLOWED_ORIGIN`.
3. Em **Configurações → Inteligência artificial**, ative **usar proxy seguro** e cole
   `https://seu-projeto.vercel.app/api/ai`.

O proxy aceita qualquer provedor compatível com OpenAI, tem CORS restrito, limite de
requisições por IP e health check em `GET`.

### Editor que muda qualquer coisa

O assistente recebe a loja inteira e devolve um patch. Ele consegue trocar:

- textos, produtos, preços, cupons e frete;
- tema, cores, fontes, cantos, estilo do hero e dos cards;
- layout do catálogo, seções ligadas/desligadas e ordem visual;
- SEO, contato, checkout e avisos.

Também há um campo **Site de referência**: cole um link ou descreva o estilo
(“escuro, tipografia grande, cantos retos”). A IA interpreta e aplica o visual no
esquema da loja sem copiar logotipos, textos autorais ou imagens da marca.

> **Segurança:** chamadas feitas diretamente do navegador expõem a chave a quem tiver
> acesso ao dispositivo. Para uso profissional, use o proxy acima. Para gateways de
> pagamento, use sempre o endpoint no servidor.

---

## 💳 Pagamentos

### PIX manual com chat (padrão)

1. Em **Pagamentos**, informe sua chave PIX (CPF/CNPJ, e-mail, telefone ou aleatória),
   o nome do recebedor e a cidade.
2. Mantenha ativado **Atendimento por chat antes do PIX**.
3. No checkout, depois dos dados do cliente, abre-se uma conversa com a loja:
   o pedido é reservado e a chave PIX é entregue na conversa.
4. O cliente copia a chave, pode abrir o **QR Code/copia-e-cola**, conversar por
   aqui ou continuar no **WhatsApp** com o resumo do pedido.
5. Ele clica em **Já fiz o PIX · confirmar pedido** e o pedido aparece em **Pedidos**
   (na prévia do painel, em tempo real).
6. Você confere o comprovante e muda o status para pago/enviado.

> Em um site estático não existe servidor de chat. A conversa do checkout é local
> e entrega a chave automaticamente; o atendimento em tempo real acontece pelo
> WhatsApp configurado em **Configurações**. Sem WhatsApp, a chave e o QR ficam
> disponíveis na própria conversa.

O PIX é gerado no próprio navegador, com CRC16 correto. Nenhum valor passa por
servidores do OpenCommerce.

### Gateways opcionais

Em **Pagamentos → Gateway automático**, escolha:

- Mercado Pago, Asaas, Pagar.me, EFI ou **API própria / webhook**;
- todos passam pelo endpoint serverless (nenhuma chave no navegador).

Publique o endpoint pronto em [`serverless/api/gateway.js`](serverless/api/gateway.js)
e o webhook em [`serverless/api/webhook.js`](serverless/api/webhook.js). O passo a
passo, variáveis de ambiente e contrato estão no
[`serverless/README.md`](serverless/README.md).

Contrato do endpoint:

```http
POST https://sua-api.vercel.app/api/gateway
Content-Type: application/json

{
  "provider": "mercadopago",
  "storeId": "store_abc123",
  "store": { "name": "Minha Loja", "slug": "minha-loja" },
  "env": "prod",
  "order": { "id": "OC123", "total": 14990, "items": [], "customer": {} }
}
```

Resposta esperada:

```json
{
  "payment": {
    "provider": "mercadopago",
    "payload": "000201...",
    "qr": "data:image/png;base64,...",
    "url": "https://..."
  }
}
```

O checkout aceita `payload`, `qr` ou `url`, em qualquer combinação. Erros devem
voltar como `{ "error": "mensagem" }` com status 4xx/5xx.

#### API própria

Com o provedor **API própria**, o endpoint encaminha o pedido para
`CUSTOM_GATEWAY_URL` usando `CUSTOM_GATEWAY_TOKEN`. Sua API pode devolver o PIX em
`{ payment: { payload, qr, url, transactionId } }`, `{ data: { pix_copy_paste, qr_code } }`
ou `{ pixCopiaECola, qrcode }`.

#### Webhook de confirmação

Cadastre no gateway:

```text
https://seu-projeto.vercel.app/api/webhook?secret=SEU_SEGREDO
```

O webhook valida `WEBHOOK_SECRET`, normaliza o evento (`payment.paid`,
`payment.pending`, `payment.failed`) e encaminha para `ORDER_WEBHOOK_URL` se você
quiser gravar em planilha, Supabase, Make ou n8n. Ele também expõe um health check
em `GET`.

#### Receber e sacar

O dinheiro cai na conta do **gateway**, não no OpenCommerce. Em **Pagamentos →
Recebimento e saque** existe um checklist com o que o gateway vai pedir (KYC,
titular, banco, agência, conta e chave PIX). Esses dados ficam só no seu navegador
e **não são publicados**. O saque é solicitado no painel/app do gateway (PIX ou TED);
nenhuma API de checkout faz saque automático.

---

## 📦 Publicar no GitHub Pages

### Opção 1 — Upload direto (mais simples)

1. Crie um repositório público no GitHub.
2. No painel, abra a loja → **Publicar → Baixar loja completa (ZIP)**.
3. Descompacte e envie **`index.html`** e **`.nojekyll`** para a raiz do repositório.
4. Vá em **Settings → Pages**.
5. Em *Source*, escolha **Deploy from a branch**, branch **`main`** e pasta **`/ (root)`**.
6. Salve e aguarde 1–2 minutos. Sua loja estará em:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

### Opção 2 — GitHub Actions

O repositório já inclui `.github/workflows/pages.yml`. Basta enviar o projeto para
o GitHub e ativar **Settings → Pages → Source: GitHub Actions**.

### Domínio próprio

Em **Settings → Pages → Custom domain**, informe o domínio e configure o DNS
conforme as instruções do GitHub.

---

## 🗂 Estrutura do projeto

```text
OpenCommerce/
├─ index.html                 # shell do painel
├─ server.js                  # servidor estático local (zero dependências)
├─ iniciar.bat                # atalho para Windows
├─ assets/
│  ├─ css/app.css             # design system do painel e da landing
│  ├─ img/                    # marca, favicons e imagens
│  ├─ js/
│  │  ├─ app.js               # roteador SPA
│  │  ├─ ai.js                # provedores BYOK
│  │  ├─ builder.js           # criação/refino com IA
│  │  ├─ dashboard.js         # shell do painel + prévia
│  │  ├─ db.js                # persistência em localStorage
│  │  ├─ editors.js           # editores de loja
│  │  ├─ landing.js           # página inicial
│  │  ├─ pix.js               # BR Code, validação e QR
│  │  ├─ prompts.js           # prompts + gerador local
│  │  ├─ schema.js            # modelo de dados e temas
│  │  ├─ setup.js             # wizard, lista de lojas e exportação
│  │  ├─ storefront.js        # template + runtime da loja exportada
│  │  ├─ ui.js                # componentes e modais
│  │  ├─ util.js              # helpers
│  │  └─ zip.js               # gerador de ZIP sem dependências
│  └─ vendor/qrcode.js        # biblioteca MIT de QR Code
├─ serverless/
│  ├─ api/ai.js              # proxy de IA (chave no servidor)
│  ├─ api/gateway.js         # Mercado Pago, Asaas, Pagar.me e API própria
│  ├─ api/webhook.js         # confirmação de pagamento + encaminhamento
│  ├─ package.json
│  └─ README.md              # deploy e variáveis de ambiente
└─ .github/workflows/pages.yml
```

---

## 🛠 Personalizar a marca

Edite **`assets/js/config.js`**:

```js
export const BRAND = {
  name: 'OpenCommerce',
  github: 'https://github.com/seu-usuario/opencommerce',
  // ...
};
```

Troque `assets/img/logo-mark.png` e os favicons para usar a sua marca.
Os textos da landing e os planos também ficam nesse arquivo.

---

## 🔒 Privacidade e limitações

- Os dados das lojas ficam no navegador. **Limpar os dados do site apaga as lojas.**
  Use **Configurações → Backup** para exportar/importar um JSON.
- A prévia do painel usa um `iframe` com `allow-same-origin` para compartilhar o carrinho
  e capturar pedidos de teste. Código personalizado (`customJs`) roda nesse contexto —
  use apenas código em que você confia.
- Pedidos feitos no site publicado **não chegam automaticamente ao painel** de outro
  domínio. Use webhook, WhatsApp ou um gateway com confirmação.
- O PIX manual depende de conferência humana. Para confirmação automática, configure
  um gateway e cadastre o webhook `serverless/api/webhook.js`.
- O HTML publicado é público. Nunca coloque chaves de IA ou de gateway nele: use o
  proxy de IA e o endpoint de gateway com variáveis de ambiente.

---

## 🤝 Contribuir

Contribuições são bem-vindas. Abra uma issue descrevendo o problema ou envie um pull
request com mudanças pequenas e focadas.

1. Faça um fork;
2. Crie uma branch: `git checkout -b minha-melhoria`;
3. Commit: `git commit -m "minha melhoria"`;
4. Push: `git push origin minha-melhoria`;
5. Abra um pull request.

---

## 📄 Licença

[MIT](LICENSE) © OpenCommerce contributors.

Feito no Brasil. PIX, IA e GitHub Pages. 🇧🇷

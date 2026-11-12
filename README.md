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
| **Criação com IA** | Geração completa a partir de uma descrição; refinamento por conversa; sugestões prontas; fallback local sem chave de IA |
| **Catálogo** | Produtos físicos e digitais, preços, preço antigo, selos, estoque, categorias, busca, imagens por upload/URL e capas geradas |
| **Pedidos** | Checkout na prévia, captura automática de pedidos, status (aguardando/pago/enviado/entregue/cancelado), receita e exportação CSV |
| **Pagamentos** | PIX manual com BR Code válido (EMV + CRC16), QR Code, copia-e-cola, validade; Mercado Pago, Asaas, EFI, Pagar.me e endpoint próprio |
| **Cupons** | Cupons percentuais ou de valor fixo, com mínimo de compra e validade |
| **Frete** | Frete fixo, grátis acima de um valor e prazo estimado |
| **Aparência** | 6 temas, cores, fontes, estilo dos cards, layout do herói, seções ligáveis e logo próprio |
| **Integrações** | Google Analytics 4, Meta Pixel, webhook de pedidos e código personalizado (head/CSS/JS) |
| **Publicação** | ZIP com `index.html`, `.nojekyll`, `README.md` e `produtos.json`; download avulso do `index.html` |
| **Privacidade** | Sem conta, sem telemetria e sem servidor próprio; chaves de IA e dados ficam no navegador |

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

> **Segurança:** chamadas feitas diretamente do navegador expõem a chave a quem tiver
> acesso ao dispositivo. Para uso profissional, prefira uma chave com limite de gastos
> ou um proxy próprio. Para gateways de pagamento, use o endpoint no seu servidor.

---

## 💳 Pagamentos

### PIX manual (padrão)

1. Em **Pagamentos**, informe sua chave PIX (CPF/CNPJ, e-mail, telefone ou aleatória),
   o nome do recebedor e a cidade.
2. O checkout gera o **BR Code** e o **QR Code** no navegador do cliente.
3. O cliente paga no app do banco e envia o comprovante.
4. Você confirma o pedido em **Pedidos**.

O PIX é gerado no próprio navegador, com CRC16 correto. Nenhum valor passa por
servidores do OpenCommerce.

### Gateways opcionais

Em **Pagamentos → Gateway automático**, escolha:

- Mercado Pago (chamada direta do navegador);
- Asaas, EFI, Pagar.me ou API própria (via endpoint).

Contrato do endpoint próprio:

```http
POST https://sua-api.com/pix
Content-Type: application/json

{
  "storeId": "store_abc123",
  "order": { "...": "pedido completo" },
  "provider": "custom"
}
```

Resposta esperada:

```json
{
  "payment": {
    "payload": "000201...",
    "qr": "data:image/png;base64,...",
    "url": "https://..."
  }
}
```

> Para produção, mantenha segredos no seu servidor. Chaves salvas no painel ficam
> no navegador do lojista.

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
  um gateway ou um endpoint próprio.

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

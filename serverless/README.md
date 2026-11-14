# Backend serverless do OpenCommerce

Três funções prontas para Vercel (ou qualquer runtime Node que aceite `req`/`res`):

| Endpoint | Para quê |
| --- | --- |
| `api/ai.js` | Proxy de IA OpenAI-compatível. Mantém a chave no servidor. |
| `api/gateway.js` | Cria cobranças PIX (Mercado Pago, Asaas, Pagar.me ou API própria). |
| `api/webhook.js` | Recebe a confirmação do gateway e encaminha o pedido pago. |

> A loja continua funcionando sem isto: o modo padrão é **PIX manual com chat**.

## Deploy na Vercel

1. Crie um projeto em [vercel.com](https://vercel.com) e envie **esta pasta `serverless/`**.
2. Em **Settings → Environment Variables**, cadastre as variáveis que for usar. Use [`.env.example`](.env.example) como referência.
3. Faça o deploy. O `vercel.json` já define limites de tempo para `ai`, `gateway` e `webhook`.
3. Faça o deploy. As URLs ficam assim:
   - `https://seu-projeto.vercel.app/api/ai`
   - `https://seu-projeto.vercel.app/api/gateway`
   - `https://seu-projeto.vercel.app/api/webhook`
4. No OpenCommerce:
   - **Configurações → Inteligência Artificial**: ative o proxy seguro e cole `/api/ai`.
   - **Pagamentos → Gateway**: escolha o provedor, cole `/api/gateway` e o webhook.
5. Faça uma compra de teste e confirme o recebimento antes de divulgar a loja.

## IA segura (`api/ai.js`)

Variáveis:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `AI_API_KEY` | sim | Chave do provedor (OpenAI, Groq, Gemini compatível, OpenRouter…) |
| `AI_BASE_URL` | não | Padrão `https://api.openai.com/v1` |
| `AI_MODEL` | não | Padrão `gpt-4.1-mini` |
| `ALLOWED_ORIGIN` | não | Domínio(s) liberados no CORS, separados por vírgula |
| `AI_RATE_LIMIT` | não | Requisições por IP a cada 10 minutos (padrão 30) |

Contrato: `POST { system?, user?, messages?, model?, temperature?, max_tokens?, json? }` → `{ text, model, usage }`.
`GET` devolve um health check com `{ ok, configured, model }`.

**Nunca** coloque a chave no JavaScript da loja: o HTML publicado é público e qualquer visitante consegue ler.

## Gateway (`api/gateway.js`)

Variáveis por provedor:

| Provedor | Variáveis | Onde obter |
| --- | --- | --- |
| Mercado Pago | `MP_ACCESS_TOKEN` | [Credenciais](https://www.mercadopago.com.br/developers/panel/app) |
| Asaas | `ASAAS_API_KEY`, opcional `ASAAS_BASE` | [Chave de API](https://docs.asaas.com/docs/autenticacao) |
| Pagar.me | `PAGARME_SECRET_KEY`, opcional `PAGARME_BASE` | [Dashboard](https://dashboard.pagar.me/) |
| API própria | `CUSTOM_GATEWAY_URL`, opcional `CUSTOM_GATEWAY_TOKEN` | Sua API de cobrança |
| CORS | `ALLOWED_ORIGIN` | Ex.: `https://minhaloja.com.br` |

`ASAAS_BASE` padrão:
- sandbox: `https://sandbox.asaas.com/api/v3`
- produção: `https://api.asaas.com/v3`

### Requisição do checkout

```http
POST https://seu-projeto.vercel.app/api/gateway
Content-Type: application/json

{
  "provider": "mercadopago",
  "storeId": "store_abc123",
  "store": { "name": "Minha Loja", "slug": "minha-loja" },
  "env": "prod",
  "order": {
    "id": "OC123ABC",
    "description": "Pedido OC123ABC",
    "total": 14990,
    "items": [{ "id": "p1", "name": "Camiseta", "price": 14990, "qty": 1 }],
    "customer": { "name": "Maria Silva", "email": "maria@email.com", "phone": "11999999999", "document": "12345678909" }
  }
}
```

`total` e `price` são em **centavos**.

### Resposta esperada

```json
{
  "payment": {
    "provider": "mercadopago",
    "payload": "00020126580014BR.GOV.BCB.PIX...",
    "qr": "data:image/png;base64,iVBORw0KG...",
    "url": "https://www.mercadopago.com.br/payments/..."
  }
}
```

O checkout aceita qualquer combinação de `payload` (copia-e-cola), `qr` (imagem
`data:` ou URL) e `url` (link do gateway). Em erro, devolva
`{ "error": "mensagem" }` com HTTP 4xx/5xx.

### API própria (provider `custom`)

Quando o provedor é `custom`, o endpoint encaminha o pedido para
`CUSTOM_GATEWAY_URL`:

```http
POST https://sua-api.com/cobrancas
Authorization: Bearer $CUSTOM_GATEWAY_TOKEN

{ "action": "charge", "provider": "custom", "storeId": "...", "store": {...}, "order": {...}, "env": "prod" }
```

Sua API deve responder com o PIX em qualquer um destes formatos:

```json
{ "payment": { "payload": "...", "qr": "...", "url": "...", "transactionId": "..." } }
{ "data": { "pix_copy_paste": "...", "qr_code": "..." } }
{ "pixCopiaECola": "...", "qrcode": "..." }
```

## Webhook (`api/webhook.js`)

Variáveis:

| Variável | Descrição |
| --- | --- |
| `WEBHOOK_SECRET` | Segredo compartilhado. Vai na URL (`?secret=`) ou no header `x-opencommerce-secret`. |
| `ORDER_WEBHOOK_URL` | Para onde encaminhar o evento normalizado (planilha, Supabase, Make, n8n…). |
| `ORDER_WEBHOOK_TOKEN` | Opcional. Bearer enviado ao `ORDER_WEBHOOK_URL`. |
| `MP_ACCESS_TOKEN` | Opcional. Consulta os detalhes do pagamento no Mercado Pago. |

Cadastre no painel do gateway:

```
https://seu-projeto.vercel.app/api/webhook?secret=SEU_SEGREDO
```

O evento normalizado é:

```json
{
  "event": "payment.paid",
  "provider": "mercadopago",
  "orderId": "OC123ABC",
  "paymentId": "123456789",
  "status": "approved",
  "amount": 149.9,
  "raw": { },
  "receivedAt": "2026-01-01T12:00:00.000Z"
}
```

`GET /api/webhook` devolve um health check.

## Recebimento e saque

O dinheiro cai na conta do **gateway**, não no OpenCommerce. Para sacar:

1. Conclua o KYC no painel do gateway (documento, selfie, comprovante).
2. Cadastre a conta bancária de mesmo titular.
3. Solicite o saque pelo painel/app do gateway (PIX ou TED).
4. Confira prazo e taxa no próprio gateway.

O checkout não faz saque: isso é uma operação da conta do gateway. O bloco
**Recebimento e saque** em Pagamentos serve como checklist e guarda os dados
apenas no navegador do lojista.

## Segurança

- Nunca exponha `MP_ACCESS_TOKEN`, `ASAAS_API_KEY`, `PAGARME_SECRET_KEY`,
  `CUSTOM_GATEWAY_TOKEN` ou `AI_API_KEY` no código da loja, no `localStorage`
  público ou em repositórios.
- O HTML publicado é público. O OpenCommerce remove chaves de gateway antes de
  gerar o arquivo final, mas a regra continua: segredo só no servidor.
- Restrinja `ALLOWED_ORIGIN` ao domínio da loja em produção.
- Troque `WEBHOOK_SECRET` se a URL vazar.
- Use sandbox até validar o fluxo inteiro.

## EFI (Gerencianet)

A API da EFI exige **certificado mTLS (.p12)**, que não funciona com `fetch`
padrão na Vercel. Rode um servidor Node com `https.Agent`, use Mercado Pago,
Asaas ou Pagar.me, ou fique no PIX manual com chat.

## Cloudflare Workers

Os arquivos usam a assinatura Node (`req`, `res`). Para Workers, adapte o final
para `export default { async fetch(request, env) { ... } }` e devolva
`new Response(JSON.stringify(...), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })`.
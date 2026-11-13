# Gateway PIX serverless

Endpoint opcional para o **OpenCommerce** criar cobranças PIX automáticas no
Mercado Pago, Asaas ou Pagar.me. As chaves secretas ficam **somente nas variáveis
de ambiente** — nunca no navegador do lojista.

> A loja continua funcionando sem isto: o modo padrão é **PIX manual com chat**.

## Deploy na Vercel (recomendado)

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Crie um projeto e envie **esta pasta `serverless/`** (ou copie `api/gateway.js`
   e `package.json` para a raiz de um repositório novo).
3. Em **Settings → Environment Variables**, cadastre as variáveis do provedor
   escolhido (tabela abaixo).
4. Faça o deploy. A URL ficará parecida com:
   `https://seu-projeto.vercel.app/api/gateway`
5. No OpenCommerce, abra **Pagamentos → Gateway automático**, escolha o provedor,
   cole a URL no campo **Endpoint do gateway** e salve.
6. Faça uma compra de teste e confira o QR Code no checkout.

### Variáveis de ambiente

| Provedor | Variáveis | Onde obter |
| --- | --- | --- |
| **Mercado Pago** | `MP_ACCESS_TOKEN` | [Suas credenciais](https://www.mercadopago.com.br/developers/panel/app) → Credenciais de produção |
| **Asaas** | `ASAAS_API_KEY` e, opcionalmente, `ASAAS_BASE` | [Integrações → Chave de API](https://docs.asaas.com/docs/autenticacao) |
| **Pagar.me** | `PAGARME_SECRET_KEY` e, opcionalmente, `PAGARME_BASE` | [Dashboard → Chaves](https://dashboard.pagar.me/) |
| **CORS** | `ALLOWED_ORIGIN` (opcional) | Ex.: `https://minhaloja.com.br`. Sem isso, o endpoint aceita a origem da requisição. |

`ASAAS_BASE` padrão:
- sandbox: `https://sandbox.asaas.com/api/v3`
- produção: `https://api.asaas.com/v3`

## Contrato

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
    "items": [
      { "id": "p1", "name": "Camiseta", "price": 14990, "qty": 1 }
    ],
    "customer": {
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "11999999999",
      "document": "12345678909"
    }
  }
}
```

`total` e `price` são em **centavos**, como no restante do OpenCommerce.

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

O checkout da loja aceita qualquer combinação de:

- `payload` — PIX copia-e-cola (preferencial);
- `qr` — imagem em `data:` URI ou URL;
- `url` — link para finalizar no gateway.

Em caso de erro, devolva `{ "error": "mensagem" }` com status HTTP 4xx/5xx.
O checkout mostra a mensagem ao cliente.

## Cloudflare Workers

O arquivo usa a assinatura Node (`req`, `res`). Para Workers, adapte o final:

```js
export default {
  async fetch(request, env) {
    // use request.json(), env.MP_ACCESS_TOKEN, etc.
    // e devolva new Response(JSON.stringify({ payment }), {
    //   headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    // })
  },
};
```

## EFI (Gerencianet)

A API da EFI exige **certificado mTLS (.p12)** na conexão. Isso não funciona com
`fetch` padrão na Vercel. Opções:

1. Rode um pequeno servidor Node (VPS, Render, Railway) usando `https.Agent` com
   o certificado e aponte o endpoint para ele.
2. Use Mercado Pago, Asaas ou Pagar.me, que funcionam via HTTPS + token.
3. Use o **PIX manual com chat**, que não depende de gateway.

## Segurança

- Nunca exponha `MP_ACCESS_TOKEN`, `ASAAS_API_KEY` ou `PAGARME_SECRET_KEY` no
  código da loja, no `localStorage` ou em repositórios públicos.
- Restrinja `ALLOWED_ORIGIN` ao domínio da sua loja em produção.
- O endpoint não confirma pagamentos sozinho. Para confirmação automática,
  configure o webhook do gateway para atualizar o pedido no seu backend.
- O OpenCommerce não intermedia valores. O dinheiro cai direto na sua conta do
  gateway.
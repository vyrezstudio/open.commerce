/**
 * OpenCommerce · gateway PIX (Mercado Pago, Asaas e Pagar.me)
 *
 * Função serverless pronta para Vercel. Também funciona em qualquer runtime
 * Node/Edge que exponha Request/Response (veja o README para Cloudflare).
 *
 * Contrato recebido do checkout da loja:
 *   POST { provider, storeId, store: { name, slug }, order, env }
 *
 * Contrato devolvido:
 *   { payment: { provider, payload, qr, url } }
 *
 * Segredos ficam SOMENTE nas variáveis de ambiente. Nunca no navegador.
 */

const MP_API = 'https://api.mercadopago.com';

const money = (order) => Number((Number(order?.total || 0) / 100).toFixed(2));

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function setCors(req, res) {
  const configured = String(process.env.ALLOWED_ORIGIN || '').trim();
  const origin = req.headers.origin || '';
  let allowed = '*';
  if (configured) {
    const list = configured.split(',').map((item) => item.trim()).filter(Boolean);
    if (list.includes('*')) allowed = '*';
    else if (list.includes(origin)) allowed = origin;
    else allowed = list[0] || '*';
  } else if (origin) {
    allowed = origin;
  }
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Corpo da requisição inválido: envie JSON.');
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error('Variável de ambiente ausente: ' + name);
  return value;
}

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function customerName(order) {
  return String(order?.customer?.name || 'Cliente').trim().slice(0, 80) || 'Cliente';
}

function firstAndLast(name) {
  const parts = name.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(' ') || 'Silva' };
}

function itemList(order) {
  return (order.items || []).map((item) => ({
    item_id: String(item.id || 'item'),
    item_name: String(item.name || 'Produto').slice(0, 120),
    price: Number((Number(item.price || 0) / 100).toFixed(2)),
    quantity: Number(item.qty || 1),
  }));
}

/* ------------------------------------------------------------------ */
/* Mercado Pago                                                        */
/* ------------------------------------------------------------------ */

async function createMercadoPago(order) {
  const token = requireEnv('MP_ACCESS_TOKEN');
  const name = customerName(order);
  const person = firstAndLast(name);

  const res = await fetch(MP_API + '/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      'X-Idempotency-Key': order.id || String(Date.now()),
    },
    body: JSON.stringify({
      transaction_amount: money(order),
      description: order.description || 'Pedido ' + (order.id || ''),
      payment_method_id: 'pix',
      external_reference: order.id || '',
      payer: {
        email: order.customer?.email || 'comprador@opencommerce.app',
        first_name: person.first,
        last_name: person.last,
        ...(order.customer?.document ? { identification: { type: 'CPF', number: String(order.customer.document).replace(/\D/g, '') } } : {}),
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const cause = Array.isArray(data.cause) && data.cause[0] ? data.cause[0].description : '';
    throw new Error('Mercado Pago: ' + (data.message || cause || 'HTTP ' + res.status));
  }

  const tx = data.point_of_interaction?.transaction_data || {};
  return {
    provider: 'mercadopago',
    payload: tx.qr_code || '',
    qr: tx.qr_code_base64 ? 'data:image/png;base64,' + tx.qr_code_base64 : '',
    url: tx.ticket_url || '',
  };
}

/* ------------------------------------------------------------------ */
/* Asaas                                                               */
/* ------------------------------------------------------------------ */

async function createAsaas(order, env) {
  const apiKey = requireEnv('ASAAS_API_KEY');
  const base = process.env.ASAAS_BASE || (env === 'prod' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3');
  const headers = { 'Content-Type': 'application/json', access_token: apiKey };
  const name = customerName(order);
  const document = String(order.customer?.document || '').replace(/\D/g, '');

  // O Asaas exige um cliente antes da cobrança.
  const customerRes = await fetch(base + '/customers', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      email: order.customer?.email || '',
      phone: String(order.customer?.phone || '').replace(/\D/g, '') || undefined,
      cpfCnpj: document || undefined,
      externalReference: order.id || '',
    }),
  });
  const customer = await customerRes.json().catch(() => ({}));
  if (!customerRes.ok) {
    const message = customer.errors?.[0]?.description || customer.message || 'HTTP ' + customerRes.status;
    throw new Error('Asaas (cliente): ' + message);
  }

  const paymentRes = await fetch(base + '/payments', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: customer.id,
      billingType: 'PIX',
      value: money(order),
      dueDate: todayPlus(1),
      description: (order.description || 'Pedido ' + order.id).slice(0, 140),
      externalReference: order.id || '',
    }),
  });
  const payment = await paymentRes.json().catch(() => ({}));
  if (!paymentRes.ok) {
    const message = payment.errors?.[0]?.description || payment.message || 'HTTP ' + paymentRes.status;
    throw new Error('Asaas (cobrança): ' + message);
  }

  const qrRes = await fetch(base + '/payments/' + encodeURIComponent(payment.id) + '/pixQrCode', { headers });
  const qr = await qrRes.json().catch(() => ({}));
  if (!qrRes.ok) {
    const message = qr.errors?.[0]?.description || qr.message || 'HTTP ' + qrRes.status;
    throw new Error('Asaas (QR Code): ' + message);
  }

  return {
    provider: 'asaas',
    payload: qr.payload || payment.pixTransaction?.qrCode || '',
    qr: qr.encodedImage ? 'data:image/png;base64,' + qr.encodedImage : '',
    url: payment.invoiceUrl || '',
  };
}

/* ------------------------------------------------------------------ */
/* Pagar.me                                                            */
/* ------------------------------------------------------------------ */

async function createPagarme(order) {
  const secret = requireEnv('PAGARME_SECRET_KEY');
  const base = process.env.PAGARME_BASE || 'https://api.pagar.me/core/v5';
  const name = customerName(order);
  const document = String(order.customer?.document || '').replace(/\D/g, '');
  const phone = String(order.customer?.phone || '').replace(/\D/g, '');
  const items = itemList(order);

  const body = {
    items: items.length
      ? items.map((item) => ({ ...item, amount: Math.round(item.price * 100) }))
      : [{ item_id: 'pedido', item_name: 'Pedido ' + order.id, price: money(order), quantity: 1, amount: Math.round(money(order) * 100) }],
    customer: {
      name,
      email: order.customer?.email || 'comprador@opencommerce.app',
      type: 'individual',
      ...(document.length === 11 ? { document, document_type: 'CPF' } : {}),
      ...(phone.length >= 10 ? { phones: { mobile_phone: { country_code: '55', area_code: phone.slice(0, 2), number: phone.slice(2) } } } : {}),
    },
    payments: [{ payment_method: 'pix', pix: { expires_in: 3600 } }],
    closed: true,
    metadata: { order_id: order.id || '' },
  };

  const res = await fetch(base + '/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(secret + ':').toString('base64') },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Pagar.me: ' + (data.message || 'HTTP ' + res.status));

  const charge = Array.isArray(data.charges) ? data.charges[0] : null;
  const tx = charge?.last_transaction || {};
  return {
    provider: 'pagarme',
    payload: tx.qr_code || '',
    qr: tx.qr_code_url || '',
    url: charge?.transaction_url || '',
  };
}

/* ------------------------------------------------------------------ */
/* Gateway próprio / API personalizada                                 */
/* ------------------------------------------------------------------ */

const pickValue = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return '';
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return '';
};

function normalizeQr(value) {
  const v = String(value || '');
  if (!v) return '';
  if (/^data:image\//.test(v) || /^https?:\/\//.test(v)) return v;
  if (/^[A-Za-z0-9+/=\r\n]+$/.test(v) && v.length > 120) return 'data:image/png;base64,' + v.replace(/\s+/g, '');
  return '';
}

async function createCustom(order, env, store) {
  const url = requireEnv('CUSTOM_GATEWAY_URL');
  const token = process.env.CUSTOM_GATEWAY_TOKEN || '';
  const secret = process.env.WEBHOOK_SECRET || '';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(secret ? { 'X-OpenCommerce-Secret': secret } : {}),
    },
    body: JSON.stringify({
      action: 'charge',
      provider: 'custom',
      storeId: order.storeId || store?.id || '',
      store: store || null,
      order,
      env: env || 'sandbox',
    }),
  });

  const raw = await res.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
  if (!res.ok) {
    const detail = data.message || data.error || data.detail || raw.slice(0, 220) || ('HTTP ' + res.status);
    throw new Error('Gateway personalizado: ' + detail);
  }

  const payment = data.payment || data.data || data.pix || data;
  return {
    provider: 'custom',
    payload: String(pickValue(payment, ['payload', 'pix_copy_paste', 'pixCopiaECola', 'pix_copia_e_cola', 'brCode', 'brcode', 'emv', 'code']) || ''),
    qr: normalizeQr(pickValue(payment, ['qr', 'qrCode', 'qr_code', 'qr_code_base64', 'encodedImage', 'imagemQrcode', 'qrcode'])),
    url: String(pickValue(payment, ['url', 'ticket_url', 'init_point', 'checkoutUrl', 'checkout_url', 'invoiceUrl', 'link', 'paymentLink']) || ''),
    transactionId: String(pickValue(payment, ['id', 'transactionId', 'transaction_id', 'paymentId', 'payment_id']) || ''),
  };
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      service: 'opencommerce-gateway',
      providers: ['mercadopago', 'asaas', 'pagarme', 'custom'],
      custom: !!process.env.CUSTOM_GATEWAY_URL,
      webhook: !!process.env.WEBHOOK_SECRET,
      note: 'EFI exige certificado mTLS e deve ser executada em um servidor compatível.',
    });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });

  try {
    const body = await readBody(req);
    const { provider, order, env, store } = body || {};

    if (!provider) return json(res, 400, { error: 'Informe o provider.' });
    if (!order || !order.id) return json(res, 400, { error: 'Pedido inválido.' });
    if (!(Number(order.total) > 0)) return json(res, 400, { error: 'O pedido precisa ter valor maior que zero.' });
    if (!Array.isArray(order.items) || !order.items.length) return json(res, 400, { error: 'O pedido precisa ter itens.' });

    let payment;
    if (provider === 'mercadopago') payment = await createMercadoPago(order);
    else if (provider === 'asaas') payment = await createAsaas(order, env);
    else if (provider === 'pagarme') payment = await createPagarme(order);
    else if (provider === 'custom') payment = await createCustom(order, env, store);
    else if (provider === 'efi') {
      return json(res, 501, {
        error: 'EFI (Gerencianet) exige certificado mTLS. Rode este endpoint em um servidor Node com https.Agent e o certificado .p12, ou use Mercado Pago/Asaas/Pagar.me.',
      });
    } else {
      return json(res, 400, { error: 'Provider não suportado por este endpoint: ' + provider });
    }

    return json(res, 200, { payment });
  } catch (err) {
    return json(res, 500, { error: err?.message || 'Erro ao criar a cobrança.' });
  }
}
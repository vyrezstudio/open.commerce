/**
 * OpenCommerce · webhook de pagamentos
 *
 * Recebe a confirmação do gateway (Mercado Pago, Asaas, Pagar.me ou API
 * personalizada), valida o segredo compartilhado e encaminha um evento
 * normalizado para o seu sistema (planilha, Supabase, Make, n8n, etc.).
 *
 * Variáveis de ambiente:
 *   WEBHOOK_SECRET     (recomendado) segredo compartilhado com o gateway
 *   ORDER_WEBHOOK_URL  (opcional)    para onde encaminhar o evento normalizado
 *   ORDER_WEBHOOK_TOKEN(opcional)    Bearer enviado ao ORDER_WEBHOOK_URL
 *   MP_ACCESS_TOKEN    (opcional)    consulta detalhes do pagamento no MP
 *
 * Configure no painel do gateway a URL:
 *   https://SEU-PROJETO.vercel.app/api/webhook?secret=SEU_SEGREDO
 *
 * Evento normalizado enviado adiante:
 *   {
 *     event: 'payment.paid' | 'payment.pending' | 'payment.failed' | string,
 *     provider, orderId, paymentId, status, amount, raw
 *   }
 */

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (raw.length > 500_000) throw new Error('Corpo muito grande.');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

function headerSecret(req) {
  const auth = String(req.headers.authorization || '');
  return String(
    req.headers['x-opencommerce-secret']
    || req.headers['x-webhook-secret']
    || req.headers['x-webhook-token']
    || (auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '')
    || ''
  ).trim();
}

function querySecret(req) {
  const url = String(req.url || '');
  const match = url.match(/[?&](?:secret|token|key)=([^&]+)/i);
  return match ? decodeURIComponent(match[1]) : '';
}

function secretOk(req) {
  const expected = String(process.env.WEBHOOK_SECRET || '').trim();
  if (!expected) return true; // sem segredo configurado: aceita (não recomendado)
  const provided = headerSecret(req) || querySecret(req);
  return provided && provided === expected;
}

/** Mapeia status de cada provedor para um evento comum. */
function normalizeStatus(status = '', event = '') {
  const s = String(status || event || '').toLowerCase();
  if (/(approved|paid|received|confirmed|succeeded|completed|pago|aprovad)/.test(s)) return 'payment.paid';
  if (/(pending|waiting|processing|created|aguardando|pendente)/.test(s)) return 'payment.pending';
  if (/(rejected|failed|canceled|cancelled|refunded|chargeback|recusad|cancelad|estornad)/.test(s)) return 'payment.failed';
  return s || 'payment.updated';
}

async function enrichMercadoPago(body) {
  const paymentId = body?.data?.id || body?.id;
  if (!paymentId) return {};
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { paymentId };
  try {
    const res = await fetch('https://api.mercadopago.com/v1/payments/' + encodeURIComponent(paymentId), {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) return { paymentId };
    const data = await res.json();
    return {
      paymentId: String(data.id || paymentId),
      orderId: String(data.external_reference || ''),
      status: data.status,
      amount: Number(data.transaction_amount || 0),
    };
  } catch {
    return { paymentId };
  }
}

async function normalize(body, req) {
  // API personalizada / formato OpenCommerce
  if (body?.event && (body?.orderId || body?.order_id || body?.payment)) {
    const payment = body.payment || {};
    return {
      provider: body.provider || req.headers['x-opencommerce-provider'] || 'custom',
      event: normalizeStatus(body.status || payment.status, body.event),
      orderId: String(body.orderId || body.order_id || payment.orderId || payment.order_id || ''),
      paymentId: String(body.paymentId || body.payment_id || payment.id || ''),
      status: String(body.status || payment.status || ''),
      amount: Number(body.amount || payment.amount || 0),
    };
  }

  // Mercado Pago
  if (body?.type === 'payment' || body?.action?.startsWith('payment.')) {
    const info = await enrichMercadoPago(body);
    return {
      provider: 'mercadopago',
      event: normalizeStatus(info.status, body.action),
      orderId: String(info.orderId || ''),
      paymentId: String(info.paymentId || ''),
      status: String(info.status || body.action || ''),
      amount: Number(info.amount || 0),
    };
  }

  // Asaas
  if (body?.payment || String(body?.event || '').startsWith('PAYMENT_')) {
    const p = body.payment || body;
    return {
      provider: 'asaas',
      event: normalizeStatus(p.status, body.event),
      orderId: String(p.externalReference || p.external_reference || ''),
      paymentId: String(p.id || ''),
      status: String(p.status || ''),
      amount: Number(p.value || 0),
    };
  }

  // Pagar.me
  if (body?.type || body?.data) {
    const data = body.data || body;
    const charge = Array.isArray(data.charges) ? data.charges[0] : data.charge || data;
    const tx = charge?.last_transaction || {};
    return {
      provider: 'pagarme',
      event: normalizeStatus(charge?.status || tx.status, body.type),
      orderId: String(data.metadata?.order_id || data.code || ''),
      paymentId: String(data.id || charge?.id || ''),
      status: String(charge?.status || tx.status || ''),
      amount: Number(tx.amount || charge?.amount || 0) / 100,
    };
  }

  return {
    provider: 'custom',
    event: 'payment.updated',
    orderId: String(body?.orderId || body?.order_id || ''),
    paymentId: String(body?.paymentId || body?.id || ''),
    status: String(body?.status || ''),
    amount: Number(body?.amount || 0),
  };
}

async function forward(event, raw) {
  const url = String(process.env.ORDER_WEBHOOK_URL || '').trim();
  if (!url) return { forwarded: false, reason: 'ORDER_WEBHOOK_URL não configurada' };
  const token = String(process.env.ORDER_WEBHOOK_TOKEN || '').trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        'X-OpenCommerce-Event': event.event,
      },
      body: JSON.stringify({ ...event, raw, receivedAt: new Date().toISOString() }),
      signal: controller.signal,
    });
    return { forwarded: true, status: res.status };
  } catch (err) {
    return { forwarded: false, reason: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      service: 'opencommerce-webhook',
      secret: !!process.env.WEBHOOK_SECRET,
      forward: !!process.env.ORDER_WEBHOOK_URL,
      hint: 'Cadastre https://SEU-PROJETO.vercel.app/api/webhook?secret=SEU_SEGREDO no gateway.',
    });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });

  if (!secretOk(req)) {
    return json(res, 401, { error: 'Segredo do webhook inválido. Confira WEBHOOK_SECRET e a URL cadastrada no gateway.' });
  }

  try {
    const body = await readBody(req);
    const event = await normalize(body, req);
    const result = await forward(event, body);
    return json(res, 200, { ok: true, event, ...result });
  } catch (err) {
    return json(res, 400, { error: err?.message || 'Não foi possível processar o webhook.' });
  }
}
/**
 * OpenCommerce · proxy de IA (OpenAI-compatível)
 *
 * Mantém a chave do provedor SOMENTE no servidor. O navegador chama este
 * endpoint sem conhecer a chave. Funciona na Vercel e em runtimes Node.
 *
 * Variáveis de ambiente:
 *   AI_API_KEY      (obrigatória) chave do provedor
 *   AI_BASE_URL     (opcional)    padrão https://api.openai.com/v1
 *   AI_MODEL        (opcional)    padrão gpt-4.1-mini
 *   ALLOWED_ORIGIN  (opcional)    ex.: https://vyrezstudio.github.io
 *   AI_RATE_LIMIT   (opcional)    requisições por IP a cada 10 min (padrão 30)
 *
 * Contrato:
 *   POST { system?, user?, messages?, model?, temperature?, max_tokens?, json? }
 *   => { text, model, usage? }
 */

const DEFAULT_BASE = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4.1-mini';
const WINDOW_MS = 10 * 60 * 1000;
const buckets = new Map();

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function allowedOrigin(req) {
  const configured = String(process.env.ALLOWED_ORIGIN || '').trim();
  if (!configured) return req.headers.origin || '*';
  const list = configured.split(',').map((item) => item.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  if (list.includes('*')) return '*';
  if (list.includes(origin)) return origin;
  return list[0] || '*';
}

function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin(req));
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (raw.length > 200_000) throw new Error('Pedido muito grande.');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Corpo inválido: envie JSON.');
  }
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(req) {
  const limit = Math.max(1, Number(process.env.AI_RATE_LIMIT) || 30);
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = buckets.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + WINDOW_MS;
  }
  bucket.count += 1;
  buckets.set(ip, bucket);
  return { limited: bucket.count > limit, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
}

function cleanMessages(body) {
  if (Array.isArray(body.messages)) {
    return body.messages
      .filter((m) => m && (m.role === 'system' || m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 60_000) }))
      .slice(-20);
  }
  const messages = [];
  if (body.system) messages.push({ role: 'system', content: String(body.system).slice(0, 30_000) });
  if (body.user) messages.push({ role: 'user', content: String(body.user).slice(0, 60_000) });
  return messages;
}

async function callProvider({ messages, model, temperature, maxTokens, jsonMode }) {
  const key = process.env.AI_API_KEY;
  if (!key) throw Object.assign(new Error('AI_API_KEY não configurada no servidor.'), { status: 500 });

  const base = String(process.env.AI_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
  const body = {
    model: model || process.env.AI_MODEL || DEFAULT_MODEL,
    messages,
    temperature: typeof temperature === 'number' ? Math.min(1.5, Math.max(0, temperature)) : 0.7,
    max_tokens: Math.min(16_000, Math.max(16, Number(maxTokens) || 4096)),
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    let res = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // Alguns provedores não aceitam response_format. Tenta de novo sem ele.
    if (!res.ok && jsonMode && [400, 422].includes(res.status)) {
      delete body.response_format;
      res = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    }

    const raw = await res.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
    if (!res.ok) {
      const detail = data.error?.message || data.message || raw.slice(0, 220) || ('HTTP ' + res.status);
      throw Object.assign(new Error('Provedor de IA: ' + detail), { status: res.status });
    }

    const text = data.choices?.[0]?.message?.content
      || data.choices?.[0]?.text
      || data.output_text
      || '';
    if (!text) throw Object.assign(new Error('O provedor respondeu sem texto.'), { status: 502 });
    return { text, model: data.model || body.model, usage: data.usage || null };
  } catch (err) {
    if (err.name === 'AbortError') throw Object.assign(new Error('A IA demorou demais para responder.'), { status: 504 });
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

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
      service: 'opencommerce-ai',
      model: process.env.AI_MODEL || DEFAULT_MODEL,
      configured: !!process.env.AI_API_KEY,
    });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });

  const limit = rateLimited(req);
  if (limit.limited) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return json(res, 429, { error: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.' });
  }

  try {
    const body = await readBody(req);
    const messages = cleanMessages(body);
    if (!messages.length) return json(res, 400, { error: 'Envie system/user ou messages.' });
    const result = await callProvider({
      messages,
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.max_tokens,
      jsonMode: body.json !== false,
    });
    return json(res, 200, result);
  } catch (err) {
    return json(res, Number(err?.status) || 500, { error: err?.message || 'Erro ao chamar a IA.' });
  }
}
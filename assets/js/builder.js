/* OpenCommerce · orquestrador da IA (criar / refinar / aplicar patch) */

import { callAI, hasAI, getAIConfig } from './ai.js';
import {
  SYSTEM_BUILDER,
  SYSTEM_EDITOR,
  buildCreatePrompt,
  buildRefinePrompt,
  localGenerate,
} from './prompts.js';
import { normalizeStore, mergeDeep } from './schema.js';

/** Extrai e repara JSON vindo de modelos. */
export function parseAIJSON(text = '') {
  let raw = String(text).trim();
  if (!raw) throw new Error('A IA respondeu vazio. Tente novamente.');

  raw = raw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) raw = raw.slice(first, last + 1);

  const attempts = [
    raw,
    raw.replace(/,\s*([}\]])/g, '$1'),
    raw.replace(/[""]/g, '"').replace(/['']/g, "'").replace(/,\s*([}\]])/g, '$1'),
  ];

  for (const attempt of attempts) {
    try { return JSON.parse(attempt); } catch { /* next */ }
  }
  throw new Error('Não consegui interpretar a resposta da IA. Tente reformular o pedido.');
}

function pickResult(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Resposta da IA inválida.');
  const store = parsed.store || parsed.loja || parsed.data || (parsed.name ? parsed : null);
  if (!store || typeof store !== 'object') throw new Error('A IA não retornou uma loja. Tente novamente.');
  return {
    store,
    message: String(parsed.message || parsed.mensagem || 'Loja atualizada.').trim(),
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.filter(Boolean).slice(0, 4).map(String) : [],
  };
}

/**
 * Cria uma loja a partir de um briefing.
 * Usa IA quando configurada; cai para o gerador local quando não há chave.
 */
export async function createFromBrief(brief, meta = {}) {
  if (!brief || brief.trim().length < 8) {
    throw new Error('Descreva um pouco mais o seu negócio (mínimo 8 caracteres).');
  }

  if (!hasAI()) {
    const local = localGenerate(brief, meta);
    return { ...local, usedAI: false };
  }

  const text = await callAI({
    system: SYSTEM_BUILDER,
    user: buildCreatePrompt(brief, meta),
    json: true,
    maxTokens: 6000,
    temperature: 0.8,
  });

  const result = pickResult(parseAIJSON(text));
  return { ...result, usedAI: true };
}

/** Refina uma loja existente com um pedido em linguagem natural. */
export async function refineStore(store, message) {
  if (!hasAI()) {
    throw new Error('Para editar com IA, configure sua chave em Configurações › Inteligência Artificial. Você ainda pode editar tudo manualmente.');
  }
  const text = await callAI({
    system: SYSTEM_EDITOR,
    user: buildRefinePrompt(message, store),
    json: true,
    maxTokens: 6000,
    temperature: 0.7,
  });
  const result = pickResult(parseAIJSON(text));
  return { ...result, usedAI: true };
}

/** Aplica o patch retornado pela IA à loja atual. */
export function applyPatch(store, patch) {
  if (!patch || typeof patch !== 'object') return store;
  const base = JSON.parse(JSON.stringify(store));
  const merged = mergeDeep(base, patch);

  // protege campos estruturais
  merged.id = store.id;
  merged.createdAt = store.createdAt;
  merged.published = store.published;
  merged.payment = merged.payment || store.payment;
  merged.payment.pixKey = store.payment?.pixKey || merged.payment.pixKey || '';
  merged.payment.gateway = {
    ...(store.payment?.gateway || {}),
    ...(merged.payment.gateway || {}),
    apiKey: store.payment?.gateway?.apiKey || '',
    publicKey: store.payment?.gateway?.publicKey || '',
    endpoint: store.payment?.gateway?.endpoint || '',
  };
  merged.contact = { ...(store.contact || {}), ...(merged.contact || {}) };
  if (!merged.contact.whatsapp) merged.contact.whatsapp = store.contact?.whatsapp || '';
  merged.integrations = { ...(store.integrations || {}), ...(merged.integrations || {}) };
  merged.integrations.customCss = store.integrations?.customCss || '';
  merged.integrations.customJs = store.integrations?.customJs || '';
  merged.integrations.customHead = store.integrations?.customHead || '';

  return normalizeStore(merged);
}

/** Cria uma loja do zero sem IA (usado pelo wizard). */
export function createLocal(brief, meta) {
  return localGenerate(brief, meta);
}

/* OpenCommerce · camada de IA (chave própria / BYOK) */

import { storage } from './util.js';

const CONFIG_KEY = 'oc_ai_config_v1';

export const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    kind: 'openai',
    base: 'https://api.openai.com/v1',
    models: ['gpt-4.1-mini', 'gpt-4o-mini', 'gpt-4.1', 'o4-mini'],
    keyHint: 'sk-...',
    docs: 'https://platform.openai.com/api-keys',
    note: 'Recomendado: gpt-4.1-mini (bom custo-benefício).',
  },
  gemini: {
    label: 'Google Gemini',
    kind: 'gemini',
    base: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'],
    keyHint: 'AIza...',
    docs: 'https://aistudio.google.com/app/apikey',
    note: 'Tem plano gratuito generoso. Ótimo para começar.',
  },
  openrouter: {
    label: 'OpenRouter',
    kind: 'openai',
    base: 'https://openrouter.ai/api/v1',
    models: ['google/gemini-2.5-flash', 'openai/gpt-4.1-mini', 'anthropic/claude-sonnet-4.5', 'meta-llama/llama-3.3-70b-instruct'],
    keyHint: 'sk-or-...',
    docs: 'https://openrouter.ai/keys',
    note: 'Acesso a vários modelos com uma chave só.',
  },
  groq: {
    label: 'Groq',
    kind: 'openai',
    base: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    keyHint: 'gsk_...',
    docs: 'https://console.groq.com/keys',
    note: 'Muito rápido e com plano gratuito.',
  },
  deepseek: {
    label: 'DeepSeek',
    kind: 'openai',
    base: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat'],
    keyHint: 'sk-...',
    docs: 'https://platform.deepseek.com/api_keys',
    note: 'Custo baixo, bom em português.',
  },
  anthropic: {
    label: 'Anthropic (Claude)',
    kind: 'anthropic',
    base: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-5-haiku-latest'],
    keyHint: 'sk-ant-...',
    docs: 'https://console.anthropic.com/settings/keys',
    note: 'Chamada direta do navegador habilitada via header oficial.',
  },
  ollama: {
    label: 'Ollama (local)',
    kind: 'openai',
    base: 'http://localhost:11434/v1',
    models: ['llama3.1', 'qwen2.5'],
    keyHint: 'ollama',
    docs: 'https://ollama.com',
    note: 'Rode com OLLAMA_ORIGINS=* para liberar o navegador.',
  },
  custom: {
    label: 'API compatível (personalizada)',
    kind: 'openai',
    base: '',
    models: [],
    keyHint: 'sua chave',
    docs: '',
    note: 'Qualquer endpoint compatível com /chat/completions (proxy próprio, LM Studio etc).',
  },
};

export const DEFAULT_AI_CONFIG = {
  provider: 'openai',
  model: 'gpt-4.1-mini',
  keys: {},
  baseUrl: '',
  temperature: 0.75,
};

export function getAIConfig() {
  const saved = storage.get(CONFIG_KEY, null) || {};
  return {
    ...DEFAULT_AI_CONFIG,
    ...saved,
    keys: { ...(saved.keys || {}) },
  };
}

export function saveAIConfig(patch) {
  const next = { ...getAIConfig(), ...patch };
  if (patch && patch.keys) next.keys = { ...getAIConfig().keys, ...patch.keys };
  storage.set(CONFIG_KEY, next);
  return next;
}

export function providerInfo(providerId) {
  return PROVIDERS[providerId] || PROVIDERS.openai;
}

export function getApiKey(config = getAIConfig()) {
  return (config.keys && config.keys[config.provider]) || '';
}

export function hasAI(config = getAIConfig()) {
  if (config.provider === 'ollama') return true;
  return !!getApiKey(config);
}

function baseUrl(config) {
  const info = providerInfo(config.provider);
  if (config.provider === 'custom') return (config.baseUrl || '').replace(/\/+$/, '');
  if (config.baseUrl) return config.baseUrl.replace(/\/+$/, '');
  return info.base;
}

function friendlyError(status, body, provider) {
  const detail = (() => {
    try {
      const json = typeof body === 'string' ? JSON.parse(body) : body;
      return json?.error?.message || json?.message || json?.error?.type || '';
    } catch {
      return typeof body === 'string' ? body.slice(0, 240) : '';
    }
  })();
  const name = providerInfo(provider).label;
  if (status === 401 || status === 403) return `${name}: chave inválida ou sem permissão. Confira em Configurações › IA.`;
  if (status === 404) return `${name}: modelo "${detail || 'selecionado'}" não encontrado. Escolha outro modelo.`;
  if (status === 429) return `${name}: limite de uso atingido. Aguarde alguns segundos ou troque de modelo.`;
  if (status >= 500) return `${name}: instabilidade no provedor. Tente novamente.`;
  return `${name}: ${detail || 'erro ' + status}`;
}

async function request(url, options, timeoutMs = 120000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Chamada unificada de IA.
 * @param {{system?:string,user:string,json?:boolean,temperature?:number,maxTokens?:number,config?:object}} opts
 * @returns {Promise<string>} texto bruto da resposta
 */
export async function callAI({ system = '', user, json = true, temperature, maxTokens = 4096, config = getAIConfig() } = {}) {
  const info = providerInfo(config.provider);
  const key = getApiKey(config);
  const temp = typeof temperature === 'number' ? temperature : (typeof config.temperature === 'number' ? config.temperature : 0.75);
  const model = config.model || info.models[0];

  if (config.provider !== 'ollama' && !key) {
    throw new Error('Nenhuma chave de IA configurada. Vá em Configurações › Inteligência Artificial.');
  }
  if (!model) throw new Error('Selecione um modelo de IA.');
  if (config.provider === 'custom' && !baseUrl(config)) throw new Error('Informe a URL base da sua API compatível.');

  let url = '';
  let body = {};
  let headers = { 'Content-Type': 'application/json' };

  if (info.kind === 'openai') {
    url = baseUrl(config) + '/chat/completions';
    headers.Authorization = `Bearer ${key || 'ollama'}`;
    if (config.provider === 'openrouter') {
      headers['HTTP-Referer'] = location.origin;
      headers['X-Title'] = 'OpenCommerce';
    }
    body = {
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user },
      ],
      temperature: temp,
      max_tokens: maxTokens,
    };
    if (json) {
      if (config.provider === 'deepseek') body.response_format = { type: 'json_object' };
      else if (config.provider !== 'ollama') body.response_format = { type: 'json_object' };
    }
  } else if (info.kind === 'gemini') {
    url = `${baseUrl(config)}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    body = {
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: temp,
        maxOutputTokens: maxTokens,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
  } else if (info.kind === 'anthropic') {
    url = baseUrl(config) + '/messages';
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
    body = {
      model,
      max_tokens: maxTokens,
      temperature: temp,
      messages: [{ role: 'user', content: user }],
      ...(system ? { system } : {}),
    };
  }

  let res;
  try {
    res = await request(url, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('A IA demorou demais para responder. Tente novamente com um pedido menor.');
    if (String(err.message).includes('Failed to fetch')) {
      throw new Error('Não foi possível conectar ao provedor. Verifique sua internet, a URL base e se o provedor permite chamadas do navegador (CORS).');
    }
    throw err;
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    throw new Error(friendlyError(res.status, raw, config.provider));
  }

  const data = await res.json();
  if (info.kind === 'openai') {
    return data?.choices?.[0]?.message?.content || '';
  }
  if (info.kind === 'gemini') {
    return (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  }
  if (info.kind === 'anthropic') {
    return (data?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  }
  return '';
}

export async function testAI(config = getAIConfig()) {
  const text = await callAI({
    system: 'Você é um assistente de teste. Responda de forma muito curta.',
    user: 'Responda apenas com a palavra OK.',
    json: false,
    maxTokens: 20,
    temperature: 0,
    config,
  });
  return String(text).trim();
}

export async function listModels(config = getAIConfig()) {
  const info = providerInfo(config.provider);
  const key = getApiKey(config);
  if (info.kind === 'anthropic') return info.models;
  if (config.provider === 'ollama') {
    const res = await request(baseUrl(config) + '/models', { headers: { Authorization: 'Bearer ollama' } }, 8000);
    if (!res.ok) throw new Error('Não foi possível listar os modelos do Ollama.');
    const data = await res.json();
    return (data.models || []).map((m) => m.name);
  }
  if (info.kind === 'gemini') {
    const res = await request(`${baseUrl(config)}/models?key=${encodeURIComponent(key)}`, {}, 20000);
    if (!res.ok) throw new Error(friendlyError(res.status, await res.text().catch(() => ''), config.provider));
    const data = await res.json();
    return (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => String(m.name).replace(/^models\//, ''));
  }
  const res = await request(baseUrl(config) + '/models', { headers: { Authorization: `Bearer ${key}` } }, 20000);
  if (!res.ok) throw new Error(friendlyError(res.status, await res.text().catch(() => ''), config.provider));
  const data = await res.json();
  const list = (data.data || data.models || []).map((m) => m.id || m.name).filter(Boolean);
  return list.sort();
}

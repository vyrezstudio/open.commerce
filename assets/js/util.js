/* OpenCommerce · utilitários base */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const uid = (prefix = 'id') =>
  prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

export function brl(cents = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100);
}

/** Aceita "1.234,56", "1234.56", "R$ 49,90" e devolve centavos. */
export function parseMoney(input) {
  if (typeof input === 'number') return Math.max(0, Math.round(input));
  if (!input) return 0;
  let s = String(input).replace(/[^\d.,-]/g, '').trim();
  if (!s) return 0;
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (hasComma) {
    s = s.replace(',', '.');
  } else if (hasDot) {
    const parts = s.split('.');
    if (parts.length > 2) s = parts.slice(0, -1).join('') + '.' + parts.at(-1);
    else if (parts[1].length === 3 && Number(parts[0]) > 0) s = parts.join('');
  }
  const n = Number(s);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}

export const slugify = (text = '') =>
  String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'loja';

export function debounce(fn, wait = 300) {
  let t;
  const wrapped = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(t);
  return wrapped;
}

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn('Storage cheio ou indisponível', err);
      return false;
    }
  },
  del(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

export function fmtDate(iso, opts = {}) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
  } catch {
    return '—';
  }
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d`;
  return fmtDate(iso);
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const onlyDigits = (s = '') => String(s).replace(/\D+/g, '');

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export const bytes = (n = 0) => {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
};

export function safeUrl(url = '') {
  const s = String(url).trim();
  if (/^(https?:|data:image\/|mailto:|tel:)/i.test(s)) return s;
  return '';
}

export function truncate(text = '', max = 120) {
  const s = String(text).replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export const groupBy = (arr, fn) =>
  arr.reduce((acc, item) => {
    const k = fn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});

export function sortBy(arr, fn) {
  return [...arr].sort((a, b) => {
    const va = fn(a), vb = fn(b);
    return va < vb ? -1 : va > vb ? 1 : 0;
  });
}

/** Lê um arquivo de imagem e devolve dataURL redimensionada. */
export function readImage(file, maxSide = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Selecione um arquivo de imagem.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const type = file.type === 'image/png' && file.size < 400 * 1024 ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Baixa um JSON como arquivo. */
export function downloadJson(data, filename) {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = () => {
      try { resolve(JSON.parse(String(reader.result))); }
      catch { reject(new Error('JSON inválido.')); }
    };
    reader.readAsText(file);
  });
}

export const nowIso = () => new Date().toISOString();

export function normalizeUrl(url = '') {
  const s = String(url).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return 'https://' + s.replace(/^\/+/, '');
}

/** Abrevia número de WhatsApp para link. */
export function waLink(phone = '', text = '') {
  const digits = onlyDigits(phone);
  if (!digits) return '';
  const full = digits.startsWith('55') ? digits : '55' + digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

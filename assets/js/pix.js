/* OpenCommerce · PIX (BR Code / EMV-MPM) — geração local, sem servidor. */

/** CRC16/CCITT-FALSE, polinômio 0x1021, init 0xFFFF. */
export function crc16(payload = '') {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const tlv = (id, value) => {
  const v = String(value ?? '');
  return id + String(v.length).padStart(2, '0') + v;
};

/** Remove acentos e caracteres não suportados, respeitando o limite do campo. */
export function sanitizePixText(value = '', max = 25) {
  return String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, max);
}

export function detectPixKeyType(key = '') {
  const value = String(key).trim();
  if (!value) return 'vazia';
  if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(value)) return 'email';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return 'aleatoria';
  if (value.startsWith('+')) return 'telefone';
  const d = value.replace(/\D+/g, '');
  if (d.length === 14) return 'cnpj';
  if (d.length === 11) return validCpf(d) ? 'cpf' : 'telefone';
  if (d.length === 10 || d.length === 12 || d.length === 13) return 'telefone';
  return 'chave';
}

/** Ajusta a chave para o formato que o BR Code espera (telefone com +55, CPF/CNPJ só dígitos). */
export function normalizePixKey(key = '', type = 'auto') {
  const raw = String(key).trim();
  const kind = type && type !== 'auto' ? type : detectPixKeyType(raw);
  if (kind === 'telefone') {
    let d = raw.replace(/\D+/g, '');
    if (raw.startsWith('+')) return '+' + d;
    if (d.length === 10 || d.length === 11) return '+55' + d;
    if (d.length === 12 || d.length === 13) return '+' + d;
    return raw;
  }
  if (kind === 'cpf' || kind === 'cnpj') return raw.replace(/\D+/g, '');
  return raw;
}

export function validatePixKey(key = '', declaredType = 'auto') {
  const type = declaredType && declaredType !== 'auto' ? declaredType : detectPixKeyType(key);
  const d = String(key).replace(/\D+/g, '');
  if (!String(key).trim()) return { ok: false, type, message: 'Informe a chave PIX da loja.' };
  if (type === 'cpf' && (!validCpf(d))) return { ok: false, type, message: 'CPF inválido — confira os números.' };
  if (type === 'cnpj' && (!validCnpj(d))) return { ok: false, type, message: 'CNPJ inválido — confira os números.' };
  if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(key)) return { ok: false, type, message: 'E-mail inválido.' };
  if (type === 'telefone' && (d.length < 10 || d.length > 13)) return { ok: false, type, message: 'Telefone inválido — use DDD + número.' };
  return { ok: true, type, message: '' };
}

export function formatPixKey(key = '') {
  const type = detectPixKeyType(key);
  const d = String(key).replace(/\D+/g, '');
  if (type === 'cpf' && d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (type === 'cnpj' && d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  if (type === 'telefone') {
    const local = d.startsWith('55') ? d.slice(2) : d;
    if (local.length === 11) return `+55 (${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
    if (local.length === 10) return `+55 (${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return String(key);
}

function validCpf(cpf = '') {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

function validCnpj(cnpj = '') {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (base, weights) => {
    const sum = base.split('').reduce((acc, n, i) => acc + Number(n) * weights[i], 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d1 !== Number(cnpj[12])) return false;
  const d2 = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d2 === Number(cnpj[13]);
}

/**
 * Monta o payload PIX "copia e cola".
 * @param {{key:string,name?:string,city?:string,amount?:number|string,txid?:string,description?:string}} opts
 * amount em reais (ex.: 149.9) — string também é aceita.
 */
export function buildPixPayload({ key, type = 'auto', name = 'LOJA', city = 'SAO PAULO', amount = 0, txid = '***', description = '' } = {}) {
  const cleanKey = normalizePixKey(key, type);
  if (!cleanKey) throw new Error('Chave PIX ausente.');

  const merchantAccount =
    tlv('00', 'br.gov.bcb.pix') +
    tlv('01', cleanKey) +
    (description ? tlv('02', sanitizePixText(description, 40)) : '');

  const amountNumber = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(',', '.'));
  const txidClean = String(txid || '***').replace(/[^a-zA-Z0-9*]/g, '').slice(0, 25) || '***';

  let payload =
    tlv('00', '01') +
    tlv('26', merchantAccount) +
    tlv('52', '0000') +
    tlv('53', '986');

  if (Number.isFinite(amountNumber) && amountNumber > 0) {
    payload += tlv('54', amountNumber.toFixed(2));
  }

  payload +=
    tlv('58', 'BR') +
    tlv('59', sanitizePixText(name, 25) || 'LOJA') +
    tlv('60', sanitizePixText(city, 15) || 'BRASIL') +
    tlv('62', tlv('05', txidClean)) +
    '6304';

  return payload + crc16(payload);
}

/** Gera SVG do QR Code. Usa window.qrcode (vendor/qrcode.js). */
export function qrSvg(payload, { size = 260, margin = 4, dark = '#000000', light = '#ffffff' } = {}) {
  const lib = window.qrcode;
  if (typeof lib !== 'function') {
    throw new Error('Biblioteca de QR Code não carregada.');
  }
  if (typeof lib.stringToBytesFuncs?.['UTF-8'] === 'function') {
    lib.stringToBytes = lib.stringToBytesFuncs['UTF-8'];
  }
  const qr = lib(0, 'M');
  qr.addData(payload);
  qr.make();

  const count = qr.getModuleCount();
  const cell = (size - margin * 2) / count;
  let path = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        const x = (margin + col * cell).toFixed(2);
        const y = (margin + row * cell).toFixed(2);
        path += `M${x},${y}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR Code PIX"><rect width="${size}" height="${size}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}

/** Data URL do QR (para exportar/imprimir). */
export function qrDataUrl(payload, opts = {}) {
  const svg = qrSvg(payload, opts);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const PIX_KEY_TYPES = [
  { value: 'auto', label: 'Detectar automaticamente' },
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'aleatoria', label: 'Chave aleatória' },
];

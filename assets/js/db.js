/* OpenCommerce · persistência local (localStorage) */

import { storage, uid, nowIso } from './util.js';
import { normalizeStore, normalizeOrder, demoStore, defaultStore } from './schema.js';

const K = {
  stores: 'oc_stores_v1',
  orders: 'oc_orders_v1',
  settings: 'oc_settings_v1',
  chat: 'oc_chat_v1',
  cart: (id) => 'oc_cart_' + id,
};

export const KEYS = K;

/* ---------------- lojas ---------------- */

export function listStores() {
  const raw = storage.get(K.stores, []);
  return Array.isArray(raw) ? raw : [];
}

export function getStore(id) {
  return listStores().find((s) => s.id === id) || null;
}

export function saveStore(store) {
  const list = listStores();
  const normalized = normalizeStore({ ...store, updatedAt: nowIso() });
  const idx = list.findIndex((s) => s.id === normalized.id);
  if (idx >= 0) list[idx] = normalized;
  else list.unshift(normalized);
  const ok = storage.set(K.stores, list);
  if (!ok) {
    throw new Error('Armazenamento cheio. Use imagens por URL (https) em vez de upload para liberar espaço.');
  }
  return normalized;
}

export function createStore(partial = {}) {
  const store = defaultStore(partial);
  const list = listStores();
  // id único
  let id = store.id;
  while (list.some((s) => s.id === id)) id = 'store_' + uid().replace('id_', '');
  store.id = id;
  const ok = storage.set(K.stores, [store, ...list]);
  if (!ok) throw new Error('Não foi possível salvar. O armazenamento do navegador pode estar cheio.');
  return store;
}

export function deleteStore(id) {
  const list = listStores().filter((s) => s.id !== id);
  storage.set(K.stores, list);
  storage.del(K.chat + '_' + id);
  const orders = listOrders().filter((o) => o.storeId !== id);
  storage.set(K.orders, orders);
}

export function duplicateStore(id) {
  const original = getStore(id);
  if (!original) throw new Error('Loja não encontrada.');
  const copy = JSON.parse(JSON.stringify(original));
  copy.id = 'store_' + Math.random().toString(36).slice(2, 10);
  copy.name = (original.name + ' (cópia)').slice(0, 60);
  copy.slug = original.slug + '-copia';
  copy.published = { url: '', at: '' };
  copy.createdAt = nowIso();
  copy.updatedAt = nowIso();
  const list = listStores();
  storage.set(K.stores, [copy, ...list]);
  return copy;
}

export function ensureDemoStore() {
  const list = listStores();
  const existing = list.find((s) => s.slug === 'mono-studio-demo');
  if (existing) return existing;
  const demo = demoStore();
  demo.id = 'store_' + Math.random().toString(36).slice(2, 10);
  demo.slug = 'mono-studio-demo';
  demo.name = demo.name + ' (demo)';
  storage.set(K.stores, [demo, ...list]);
  return demo;
}

/* ---------------- pedidos ---------------- */

export function listOrders(storeId = null) {
  const raw = storage.get(K.orders, []);
  const list = Array.isArray(raw) ? raw.map(normalizeOrder) : [];
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return storeId ? list.filter((o) => o.storeId === storeId) : list;
}

export function addOrder(order) {
  const list = storage.get(K.orders, []);
  const arr = Array.isArray(list) ? list : [];
  if (arr.some((o) => o.id === order.id)) return normalizeOrder(order);
  const normalized = normalizeOrder(order);
  arr.unshift(normalized);
  storage.set(K.orders, arr.slice(0, 1000));
  return normalized;
}

export function updateOrder(id, patch) {
  const arr = Array.isArray(storage.get(K.orders, [])) ? storage.get(K.orders, []) : [];
  const idx = arr.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  arr[idx] = { ...arr[idx], ...patch };
  storage.set(K.orders, arr);
  return normalizeOrder(arr[idx]);
}

export function deleteOrder(id) {
  const arr = (storage.get(K.orders, []) || []).filter((o) => o.id !== id);
  storage.set(K.orders, arr);
}

/* ---------------- conversa ---------------- */

export function getChat(storeId) {
  return storage.get(K.chat + '_' + storeId, []);
}

export function saveChat(storeId, messages) {
  storage.set(K.chat + '_' + storeId, messages.slice(-40));
}

export function clearChat(storeId) {
  storage.del(K.chat + '_' + storeId);
}

/* ---------------- configurações gerais ---------------- */

const DEFAULT_SETTINGS = {
  onboardingDone: false,
  lastStoreId: '',
  previewDevice: 'desktop',
  showPreview: true,
  currency: 'BRL',
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(storage.get(K.settings, {}) || {}) };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  storage.set(K.settings, next);
  return next;
}

/* ---------------- backup ---------------- */

export function exportBackup() {
  return {
    app: 'OpenCommerce',
    version: 1,
    exportedAt: nowIso(),
    stores: listStores(),
    orders: listOrders(),
  };
}

export function importBackup(data, { merge = true } = {}) {
  if (!data || !Array.isArray(data.stores)) throw new Error('Backup inválido.');
  const current = listStores();
  const incomingIds = new Set(data.stores.map((s) => s.id));
  const base = merge ? current.filter((s) => !incomingIds.has(s.id)) : [];
  const stores = [...data.stores, ...base].map((s) => normalizeStore(s));
  storage.set(K.stores, stores);
  if (Array.isArray(data.orders)) {
    const currentOrders = merge ? listOrders() : [];
    const ids = new Set(data.orders.map((o) => o.id));
    storage.set(K.orders, [...data.orders, ...currentOrders.filter((o) => !ids.has(o.id))].map(normalizeOrder));
  }
  return stores.length;
}

export function storageUsage() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('oc_')) total += (localStorage.getItem(key) || '').length * 2;
    }
  } catch { /* ignore */ }
  return total;
}

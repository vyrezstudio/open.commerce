/* OpenCommerce · painel da loja (shell, visão geral, IA e prévia) */

import { esc, brl, fmtDateTime, timeAgo, debounce, copyText } from './util.js';
import { icon, toast, toastError, mdLite, badge, openModal, spinner, confirmDialog } from './ui.js';
import { BRAND } from './config.js';
import { getStore, saveStore, listOrders, addOrder, getChat, saveChat, clearChat, updateOrder, deleteOrder } from './db.js';
import { buildStoreHTML } from './storefront.js';
import { hasAI, getAIConfig, providerInfo } from './ai.js';
import { refineStore, applyPatch } from './builder.js';
import { renderOverview } from './editors.js';
import { renderProducts } from './editors.js';
import { renderAppearance } from './editors.js';
import { renderPayments } from './editors.js';
import { renderShipping } from './editors.js';
import { renderOrders } from './editors.js';
import { renderIntegrations } from './editors.js';
import { renderPublish } from './editors.js';
import { exportStoreZip } from './setup.js';

export const TABS = [
  { id: 'inicio', label: 'Visão geral', icon: 'grid', group: 'Loja' },
  { id: 'ia', label: 'Assistente IA', icon: 'sparkles', group: 'Loja', tag: 'IA' },
  { id: 'produtos', label: 'Produtos', icon: 'box', group: 'Loja', count: 'products' },
  { id: 'aparencia', label: 'Aparência', icon: 'palette', group: 'Loja' },
  { id: 'pagamentos', label: 'Pagamentos', icon: 'card', group: 'Vendas' },
  { id: 'entrega', label: 'Frete e checkout', icon: 'truck', group: 'Vendas' },
  { id: 'pedidos', label: 'Pedidos', icon: 'receipt', group: 'Vendas', count: 'orders' },
  { id: 'integracoes', label: 'Integrações', icon: 'plug', group: 'Avançado' },
  { id: 'publicar', label: 'Publicar', icon: 'upload', group: 'Avançado' },
];

let currentStore = null;
let activeTab = 'inicio';

export function renderDashboard(root, storeId, tab = 'inicio') {
  const store = getStore(storeId);
  if (!store) {
    toast('Loja não encontrada.', 'error');
    location.hash = '#/lojas';
    return;
  }
  currentStore = store;
  activeTab = TABS.some((t) => t.id === tab) ? tab : 'inicio';
  const ai = hasAI();
  const cfg = getAIConfig();

  document.body.classList.toggle('no-preview', localStorage.getItem('oc_hide_preview') === '1');

  root.innerHTML = `
<div class="app">
  <aside class="sidebar">
    <div class="side-brand">
      <a class="logo" href="#/"><img class="logo-mark" src="assets/img/logo-mark.png" alt=""><span>${BRAND.name}</span></a>
    </div>
    <a class="side-store" href="#/lojas" title="Trocar de loja">
      <span class="store-avatar">${store.logoImage ? `<img src="${esc(store.logoImage)}" alt="">` : esc((store.logoText || store.name).slice(0, 2).toUpperCase())}</span>
      <span class="meta"><b>${esc(store.name)}</b><span><i class="dot" style="width:5px;height:5px;border-radius:99px;background:${store.payment?.pixKey ? 'var(--green)' : 'var(--amber)'};display:inline-block"></i>${store.payment?.pixKey ? 'PIX ativo' : 'PIX pendente'}</span></span>
      ${icon('chevronDown', 14)}
    </a>
    <nav class="side-nav" aria-label="Menu da loja">
      ${navHtml(TABS, store)}
    </nav>
    <div class="side-bottom">
      <a class="side-link ${activeTab === 'config' ? 'active' : ''}" href="#/config" title="Configurações">${icon('settings', 17)}<span>Configurações</span></a>
      <a class="side-link" href="#/lojas" title="Todas as lojas">${icon('store', 17)}<span>Minhas lojas</span></a>
      <div class="side-note"><b>${ai ? 'IA conectada' : 'Conecte sua IA'}</b>${ai ? esc(providerInfo(cfg.provider).label + ' · ' + cfg.model) : 'Use OpenAI, Gemini, Groq ou outra chave para editar por conversa.'}<br><a href="#/config" style="color:#ffb199;font-weight:600">${ai ? 'Gerenciar' : 'Configurar'} →</a></div>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
      <button class="icon-btn" data-mobile-nav aria-label="Menu">${icon('menu', 18)}</button>
      <div class="crumb">
        <span class="hide">${esc(store.name)}</span>
        ${icon('chevron', 12)}
        <b id="crumbTab">${esc(TABS.find((t) => t.id === activeTab)?.label || 'Visão geral')}</b>
      </div>
      <div class="topbar-actions">
        <span class="save-state" id="saveState"><span class="dot"></span> Salvo</span>
        <div class="device-toggle">
          <button data-device="desktop" class="on" title="Desktop">${icon('monitor', 15)}</button>
          <button data-device="mobile" title="Celular">${icon('phone', 15)}</button>
        </div>
        <button class="btn btn-ghost btn-sm" data-toggle-preview title="Mostrar/ocultar prévia">${icon('eye', 15)} <span class="hide-sm">Prévia</span></button>
        <button class="btn btn-ghost btn-sm" data-open-store>${icon('external', 15)} <span class="hide-sm">Ver loja</span></button>
        <button class="btn btn-primary btn-sm" data-publish>${icon('upload', 15)} Publicar</button>
      </div>
    </header>

    <div class="work">
      <section class="editor-col" id="editorPane"></section>
      <aside class="preview-col">
        <div class="preview-head">
          <div class="url">${icon('lock', 11)} ${esc(store.slug)}.opencommerce.site</div>
          <button class="icon-btn sm" data-refresh-preview title="Recarregar">${icon('refresh', 15)}</button>
        </div>
        <div class="preview-frame-wrap" style="position:relative">
          <div class="preview-frame" id="previewFrame">
            <iframe id="storeFrame" title="Prévia da loja" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"></iframe>
          </div>
          <div class="preview-loading" id="previewLoading">${spinner('Montando prévia…')}</div>
        </div>
      </aside>
    </div>
  </div>
</div>`;

  // navegação
  root.querySelectorAll('[data-tab]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      location.hash = `#/loja/${store.id}/${a.getAttribute('data-tab')}`;
    });
  });

  root.querySelector('[data-mobile-nav]')?.addEventListener('click', () => {
    const m = openModal({
      title: 'Menu da loja',
      size: 'sm',
      body: `<div class="side-nav">${navHtml(TABS, store)}<a class="side-link" href="#/lojas">${icon('store', 17)}<span>Minhas lojas</span></a><a class="side-link" href="#/config">${icon('settings', 17)}<span>Configurações</span></a></div>`,
    });
    m.root.querySelectorAll('[data-tab]').forEach((a) => a.addEventListener('click', () => {
      m.close();
      location.hash = `#/loja/${store.id}/${a.getAttribute('data-tab')}`;
    }));
  });

  // díspositivo
  root.querySelectorAll('[data-device]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const frame = root.querySelector('#previewFrame');
      const mobile = btn.getAttribute('data-device') === 'mobile';
      frame.classList.toggle('mobile', mobile);
      root.querySelectorAll('[data-device]').forEach((b) => b.classList.toggle('on', b === btn));
      localStorage.setItem('oc_preview_device', mobile ? 'mobile' : 'desktop');
    });
  });
  if (localStorage.getItem('oc_preview_device') === 'mobile') {
    root.querySelector('#previewFrame')?.classList.add('mobile');
    root.querySelectorAll('[data-device]').forEach((b) => b.classList.toggle('on', b.getAttribute('data-device') === 'mobile'));
  }

  root.querySelector('[data-toggle-preview]')?.addEventListener('click', () => {
    document.body.classList.toggle('no-preview');
    localStorage.setItem('oc_hide_preview', document.body.classList.contains('no-preview') ? '1' : '0');
    if (window.innerWidth <= 900) document.body.classList.toggle('preview-open');
  });

  root.querySelector('[data-refresh-preview]')?.addEventListener('click', () => updatePreview(true));
  root.querySelector('[data-open-store]')?.addEventListener('click', openStoreInTab);
  root.querySelector('[data-publish]')?.addEventListener('click', () => { location.hash = `#/loja/${store.id}/publicar`; });

  // ordem (prévia)
  window.onmessage = (ev) => {
    if (ev.data && ev.data.type === 'oc:order' && ev.data.order) {
      addOrder(ev.data.order);
      updateSidebarCounts();
      toast(`Novo pedido de ${ev.data.order.customer?.name || 'cliente'} — ${brl(ev.data.order.total)}`);
      if (activeTab === 'inicio' || activeTab === 'pedidos') renderTab();
    }
  };

  renderTab();
  updatePreview();
}

function navHtml(tabs, store) {
  const groups = ['Loja', 'Vendas', 'Avançado'];
  return groups.map((group) => `
    <div class="side-group">${group}</div>
    ${tabs.filter((t) => t.group === group).map((t) => {
      const count = t.count === 'products' ? (store.products?.length || 0) : t.count === 'orders' ? listOrders(store.id).filter((o) => o.status === 'pendente').length : 0;
      return `<a class="side-link ${activeTab === t.id ? 'active' : ''}" href="#/loja/${store.id}/${t.id}" data-tab="${t.id}">
        ${icon(t.icon, 17)}<span>${t.label}</span>
        ${t.tag ? `<i class="tag">${t.tag}</i>` : ''}
        ${count ? `<i class="count" data-count="${t.count}">${count}</i>` : (t.count ? `<i class="count" data-count="${t.count}" style="display:none">0</i>` : '')}
      </a>`;
    }).join('')}`).join('');
}

function updateSidebarCounts() {
  if (!currentStore) return;
  const store = getStore(currentStore.id) || currentStore;
  const prod = document.querySelector('[data-count="products"]');
  const orders = document.querySelector('[data-count="orders"]');
  if (prod) { prod.textContent = store.products?.length || 0; prod.style.display = store.products?.length ? 'inline-block' : 'none'; }
  if (orders) { const n = listOrders(store.id).filter((o) => o.status === 'pendente').length; orders.textContent = n; orders.style.display = n ? 'inline-block' : 'none'; }
}

/* ---------------- API para os editores ---------------- */

function makeApi() {
  return {
    get store() { return getStore(currentStore.id) || currentStore; },
    save(next, { rerender = false, silent = true } = {}) {
      try {
        const saved = saveStore({ ...next, id: currentStore.id });
        currentStore = saved;
        setSaveState('saving');
        schedulePreview();
        setTimeout(() => setSaveState('saved'), 700);
        if (!silent) toast('Alterações salvas.');
        if (rerender) renderTab();
        updateSidebarCounts();
        return saved;
      } catch (err) {
        toastError(err.message);
        return currentStore;
      }
    },
    refresh: () => { renderTab(); updateSidebarCounts(); },
    go: (tab) => { location.hash = `#/loja/${currentStore.id}/${tab}`; },
    toast,
    toastError,
  };
}

function setSaveState(state) {
  const el = document.getElementById('saveState');
  if (!el) return;
  el.classList.toggle('saving', state === 'saving');
  el.innerHTML = `<span class="dot"></span> ${state === 'saving' ? 'Salvando…' : 'Salvo'}`;
}

/* ---------------- tabs ---------------- */

function renderTab() {
  const pane = document.getElementById('editorPane');
  if (!pane) return;
  const api = makeApi();
  const store = api.store;
  const crumb = document.getElementById('crumbTab');
  if (crumb) crumb.textContent = TABS.find((t) => t.id === activeTab)?.label || '';

  if (activeTab === 'inicio') renderOverview(pane, store, api);
  else if (activeTab === 'ia') renderChat(pane, store, api);
  else if (activeTab === 'produtos') renderProducts(pane, store, api);
  else if (activeTab === 'aparencia') renderAppearance(pane, store, api);
  else if (activeTab === 'pagamentos') renderPayments(pane, store, api);
  else if (activeTab === 'entrega') renderShipping(pane, store, api);
  else if (activeTab === 'pedidos') renderOrders(pane, store, api);
  else if (activeTab === 'integracoes') renderIntegrations(pane, store, api);
  else if (activeTab === 'publicar') renderPublish(pane, store, api);
}

/* ---------------- prévia ---------------- */

const updatePreview = async (force = false) => {
  const frame = document.getElementById('storeFrame');
  const loading = document.getElementById('previewLoading');
  if (!frame) return;
  if (!currentStore) return;
  if (loading) loading.style.display = 'grid';
  try {
    const store = getStore(currentStore.id) || currentStore;
    const html = await buildStoreHTML(store, { preview: true });
    frame.srcdoc = html;
  } catch (err) {
    console.error(err);
    if (loading) loading.innerHTML = `<div style="padding:20px;text-align:center;color:var(--red);font-size:11px">${esc(err.message)}</div>`;
  } finally {
    setTimeout(() => { if (loading) loading.style.display = 'none'; }, force ? 900 : 500);
  }
};

const schedulePreview = debounce(() => updatePreview(), 420);

async function openStoreInTab() {
  try {
    toast('Abrindo loja…', 'info');
    const store = getStore(currentStore.id) || currentStore;
    const html = await buildStoreHTML(store, { preview: false });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    toastError(err.message);
  }
}

/* ---------------- chat de IA ---------------- */

function renderChat(pane, store, api) {
  const ai = hasAI();
  const cfg = getAIConfig();
  let messages = getChat(store.id);
  if (!messages.length) {
    messages = [{
      role: 'assistant',
      content: `Olá! Eu sou o assistente do **OpenCommerce**. Já montei a base da loja **${store.name}**.\n\nVocê pode pedir mudanças em português, por exemplo:\n- “deixe o visual mais premium e escuro”\n- “crie 4 produtos de skincare entre R$ 79 e R$ 199”\n- “escreva um FAQ com 6 perguntas”\n- “mude o título do hero para algo mais direto”`,
      ts: Date.now(),
      suggestions: ['Melhorar os textos', 'Criar mais 4 produtos', 'Trocar o visual', 'Criar uma oferta'],
    }];
    saveChat(store.id, messages);
  }

  pane.innerHTML = `
<div class="page-head" style="margin-bottom:14px">
  <div><h1>Assistente IA</h1><p>Descreva o que quer mudar. A loja é atualizada na hora, com prévia ao vivo.</p></div>
  <div class="actions">
    <button class="btn btn-ghost btn-sm" data-clear-chat>${icon('trash', 14)} Limpar</button>
  </div>
</div>

${ai ? '' : `<div class="alert alert-warn mb-16">${icon('alert', 16)}<span><b>Sua IA ainda não está conectada.</b> Você pode editar tudo manualmente, ou <a href="#/config" style="color:#fcd34d;text-decoration:underline">adicionar uma chave</a> para conversar com o assistente (Gemini e Groq têm plano gratuito).</span></div>`}

<div class="ai-shell">
  <div class="ai-top">
    <div class="ai-avatar">${icon('sparkles', 17)}</div>
    <div>
      <b>Construtor de lojas</b>
      <span>${ai ? `<i class="dot"></i> ${esc(providerInfo(cfg.provider).label)} · ${esc(cfg.model)}` : 'modo manual'}</span>
    </div>
    <div class="right">
      <a class="btn btn-ghost btn-sm" href="#/config">${icon('settings', 14)} Ajustes</a>
    </div>
  </div>

  <div class="chat-scroll" id="chatScroll">
    ${messages.map(msgHtml).join('')}
    <div id="thinking"></div>
  </div>

  <div class="ai-compose">
    <div class="ai-quick" id="quickActions">
      ${[
        ['copy', 'Melhorar textos', 'Reescreva os textos da loja (hero, benefícios, sobre, FAQ) com copy mais persuasivo e específico, mantendo o posicionamento.'],
        ['box', 'Criar produtos', 'Adicione mais 4 produtos coerentes com o nicho. Mantenha os existentes e devolva a lista completa.'],
        ['palette', 'Trocar visual', 'Proponha um visual diferente e mais premium: ajuste theme, cores e fontes mantendo os textos.'],
        ['shield', 'Reforçar confiança', 'Melhore depoimentos, FAQ e benefícios para reduzir objeções de compra.'],
        ['search', 'SEO', 'Otimize título, descrição e keywords da loja.'],
        ['tag', 'Criar oferta', 'Crie uma oferta com cupom, badges e announcement de urgência.'],
      ].map(([ic, label, prompt]) => `<button class="quick-chip" data-quick="${esc(prompt)}">${icon(ic, 13)} ${label}</button>`).join('')}
    </div>
    <div class="compose-box">
      <textarea id="chatInput" rows="1" placeholder="${ai ? 'Ex.: deixe o visual mais premium e adicione 3 produtos de skincare…' : 'Conecte sua IA para conversar…'}" ${ai ? '' : 'disabled'}></textarea>
      <button class="send-btn" id="sendMsg" ${ai ? '' : 'disabled'} aria-label="Enviar">${icon('arrowRight', 16)}</button>
    </div>
    <div class="compose-hint"><span>Enter envia · Shift+Enter quebra linha</span><span>${ai ? 'A prévia atualiza automaticamente' : 'Modo manual ativo'}</span></div>
  </div>
</div>`;

  const scroll = pane.querySelector('#chatScroll');
  const input = pane.querySelector('#chatInput');
  const sendBtn = pane.querySelector('#sendMsg');
  const thinking = pane.querySelector('#thinking');

  const scrollBottom = () => { if (scroll) scroll.scrollTop = scroll.scrollHeight; };
  scrollBottom();

  input?.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(120, input.scrollHeight) + 'px';
  });
  input?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); send(); }
  });
  sendBtn?.addEventListener('click', send);

  pane.querySelectorAll('[data-quick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!ai) { toast('Conecte sua IA para usar este atalho.', 'error'); return; }
      input.value = btn.getAttribute('data-quick');
      input.focus();
      input.dispatchEvent(new Event('input'));
    });
  });

  scroll?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-suggestion]');
    if (!btn || !ai) return;
    ev.preventDefault();
    input.value = btn.getAttribute('data-suggestion');
    input.focus();
    input.dispatchEvent(new Event('input'));
  });

  pane.querySelector('[data-clear-chat]')?.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Limpar conversa', text: 'O histórico do chat será apagado. A loja não muda.', confirmLabel: 'Limpar' });
    if (!ok) return;
    clearChat(store.id);
    renderTab();
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    if (!ai) { toast('Configure sua chave de IA em Configurações.', 'error'); return; }
    input.value = '';
    input.style.height = 'auto';
    input.disabled = true;
    sendBtn.disabled = true;

    messages.push({ role: 'user', content: text, ts: Date.now() });
    saveChat(store.id, messages);
    scroll.insertAdjacentHTML('beforeend', msgHtml(messages.at(-1)));
    scrollBottom();

    thinking.innerHTML = `<div class="msg bot"><span class="av">OC</span><div class="bubble"><span class="thinking"><i></i><i></i><i></i></span> <span class="dim" style="font-size:11px">pensando…</span></div></div>`;
    scrollBottom();

    try {
      const current = api.store;
      const result = await refineStore(current, text);
      const next = applyPatch(current, result.store);
      api.save(next);
      messages.push({
        role: 'assistant',
        content: result.message || 'Pronto! Atualizei a loja e você já pode ver o resultado na prévia.',
        ts: Date.now(),
        suggestions: result.suggestions,
      });
      saveChat(store.id, messages);
      thinking.innerHTML = '';
      scroll.insertAdjacentHTML('beforeend', msgHtml(messages.at(-1)));
      scrollBottom();
      setTimeout(() => updatePreview(true), 250);
    } catch (err) {
      thinking.innerHTML = '';
      messages.push({ role: 'assistant', content: `Não consegui aplicar: ${err.message}`, ts: Date.now(), error: true });
      saveChat(store.id, messages);
      scroll.insertAdjacentHTML('beforeend', msgHtml(messages.at(-1)));
      scrollBottom();
      toastError(err.message);
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }
}

function msgHtml(m) {
  const isUser = m.role === 'user';
  return `<div class="msg ${isUser ? 'user' : 'bot'}">
    <span class="av">${isUser ? 'VC' : 'OC'}</span>
    <div>
      <div class="bubble" style="${m.error ? 'border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.07)' : ''}">${mdLite(m.content)}</div>
      ${m.suggestions?.length ? `<div class="ai-quick" style="margin-top:6px">${m.suggestions.map((s) => `<button class="quick-chip" data-suggestion="${esc(s)}">${icon('arrowRight', 12)} ${esc(s)}</button>`).join('')}</div>` : ''}
      <div class="meta">${m.ts ? timeAgo(new Date(m.ts).toISOString()) : ''}</div>
    </div>
  </div>`;
}

/* OpenCommerce · roteador da aplicação */

import { renderLanding } from './landing.js';
import { renderWizard, renderStores, renderSettings } from './setup.js';
import { renderDashboard } from './dashboard.js';
import { copyText } from './util.js';
import { toast, toastError } from './ui.js';

const root = document.getElementById('root');
let currentRoute = '';

const ROUTES = {
  '': 'landing',
  '/': 'landing',
  '/nova': 'wizard',
  '/lojas': 'stores',
  '/config': 'settings',
};

/* ---------------- utilidades ---------------- */

function resetChrome() {
  // evita vazamento de estado entre páginas
  window.onmessage = null;
  document.body.classList.remove('no-preview', 'preview-open', 'modal-open', 'nav-open');
  const modals = document.getElementById('modalRoot');
  if (modals) modals.innerHTML = '';
  const head = document.querySelector('.site-head');
  if (head) head.classList.remove('nav-open');
}

function scrollToAnchor(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function parseRoute() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw || raw === '/') return { page: 'landing', hash: raw };
  // âncoras do site (ex.: #recursos) não são rotas
  if (!raw.startsWith('/')) return { page: 'anchor', id: raw.replace(/^#/, '') };

  const [path, ...rest] = raw.split('?');
  const parts = path.slice(1).split('/').filter(Boolean);

  if (parts[0] === 'loja' && parts[1]) {
    return { page: 'dashboard', id: decodeURIComponent(parts[1]), tab: parts[2] ? decodeURIComponent(parts[2]) : 'inicio' };
  }

  return { page: ROUTES['/' + parts.join('/')] || 'notfound', parts };
}

/* ---------------- render ---------------- */

function render(route, { keepScroll = false } = {}) {
  resetChrome();
  root.innerHTML = '';

  if (route.page === 'landing') {
    renderLanding(root);
    document.title = 'OpenCommerce — lojas virtuais com IA, PIX e zero mensalidade';
  } else if (route.page === 'wizard') {
    renderWizard(root);
    document.title = 'Nova loja · OpenCommerce';
  } else if (route.page === 'stores') {
    renderStores(root);
    document.title = 'Minhas lojas · OpenCommerce';
  } else if (route.page === 'settings') {
    renderSettings(root);
    document.title = 'Configurações · OpenCommerce';
  } else if (route.page === 'dashboard') {
    renderDashboard(root, route.id, route.tab);
    const storeName = (() => {
      try {
        const stores = JSON.parse(localStorage.getItem('oc_stores_v1') || '[]');
        return stores.find((s) => s.id === route.id)?.name || 'Loja';
      } catch { return 'Loja'; }
    })();
    document.title = `${storeName} · OpenCommerce`;
  } else {
    root.innerHTML = `<main class="wrap-md" style="padding:16vh 0;text-align:center">
      <div class="empty-state">
        <div class="empty-ic">?</div>
        <h3>Página não encontrada</h3>
        <p>O endereço <code>${escapeHtml(location.hash)}</code> não existe.</p>
        <a class="btn btn-primary" href="#/">Voltar para o início</a>
      </div>
    </main>`;
    document.title = 'Página não encontrada · OpenCommerce';
  }

  if (!keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
  window.scrollTo(0, 0);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------- navegação ---------------- */

function route() {
  const parsed = parseRoute();

  if (parsed.page === 'anchor') {
    // Se veio de outro lugar do app, garante que a landing esteja montada.
    if (currentRoute !== 'landing') {
      currentRoute = 'landing';
      render({ page: 'landing' });
    }
    setTimeout(() => scrollToAnchor(parsed.id), 60);
    return;
  }

  const key = parsed.page === 'dashboard' ? `dashboard:${parsed.id}:${parsed.tab}` : parsed.page;
  if (key === currentRoute) return;
  currentRoute = key;
  render(parsed);
}

/* ---------------- eventos globais ---------------- */

document.addEventListener('click', async (ev) => {
  const copyBtn = ev.target.closest('[data-copy]');
  if (copyBtn) {
    ev.preventDefault();
    const ok = await copyText(copyBtn.getAttribute('data-copy') || '');
    toast(ok ? 'Copiado!' : 'Não foi possível copiar', ok ? 'success' : 'error');
    return;
  }

  const menuBtn = ev.target.closest('[data-menu]');
  if (menuBtn) {
    ev.preventDefault();
    const head = menuBtn.closest('.site-head');
    if (head) head.classList.toggle('nav-open');
    return;
  }

  // fecha menu mobile ao clicar em um link
  const link = ev.target.closest('.site-head.nav-open .site-nav a, .site-head.nav-open .site-actions a');
  if (link) {
    const head = link.closest('.site-head');
    if (head) head.classList.remove('nav-open');
  }
});

window.addEventListener('hashchange', route);

window.addEventListener('error', (ev) => {
  console.error('[OpenCommerce]', ev.error || ev.message);
});

window.addEventListener('unhandledrejection', (ev) => {
  console.error('[OpenCommerce] promise rejeitada', ev.reason);
  const msg = ev.reason && ev.reason.message;
  if (msg && !/failed to fetch|networkerror|load failed/i.test(msg)) toastError(msg);
});

/* ---------------- start ---------------- */

if (!location.hash) {
  history.replaceState(null, '', '#/');
}
route();

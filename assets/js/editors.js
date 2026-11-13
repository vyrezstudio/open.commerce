/* OpenCommerce · editores: visão geral, produtos, aparência, pagamentos, entrega, pedidos, integrações e publicação */

import {
  esc, brl, parseMoney, downloadBlob, downloadJson, readImage, copyText, waLink, onlyDigits, fmtDateTime, fmtDate, bytes,
} from './util.js';
import {
  icon, toast, toastError, openModal, confirmDialog, toggle, badge, spinner, emptyState, mdLite, copyWithToast,
} from './ui.js';
import { THEMES, FONTS, GATEWAYS, generatedCover } from './schema.js';
import { listOrders, updateOrder, deleteOrder, saveStore, duplicateStore } from './db.js';
import { buildPixPayload, qrSvg, validatePixKey, detectPixKeyType, formatPixKey, normalizePixKey } from './pix.js';
import { buildStoreHTML } from './storefront.js';
import { exportStoreZip } from './setup.js';
import { BRAND } from './config.js';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const clone = (o) => JSON.parse(JSON.stringify(o));

function setPath(obj, path, value) {
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] === undefined || cur[key] === null) cur[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cur = cur[key];
  }
  cur[parts.at(-1)] = value;
  return obj;
}

function getPath(obj, path) {
  return String(path).split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

const moneyInput = (cents) => (Number(cents || 0) / 100).toFixed(2).replace('.', ',');

function bindLive(container, api, onChange) {
  container.querySelectorAll('[data-bind]').forEach((el) => {
    const path = el.getAttribute('data-bind');
    const type = el.getAttribute('data-type') || '';
    const apply = () => {
      const store = clone(api.store);
      let value;
      if (type === 'checkbox') value = el.checked;
      else if (type === 'number' || el.type === 'range') value = el.value === '' ? 0 : Number(el.value);
      else if (type === 'money') value = parseMoney(el.value);
      else if (type === 'lines') value = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
      else value = el.value;
      setPath(store, path, value);
      api.save(store);
      if (el.type === 'range') {
        const lbl = container.querySelector(`[data-label="${path}"]`);
        if (lbl) lbl.textContent = el.value;
      }
      if (el.type === 'color') {
        const txt = container.querySelector(`[data-color-text="${path}"]`);
        if (txt) txt.value = el.value;
      } else if (el.hasAttribute('data-color-text')) {
        const picker = container.querySelector(`input[type=color][data-bind="${path}"]`);
        if (picker && /^#[0-9a-f]{6}$/i.test(el.value)) picker.value = el.value;
      }
      if (onChange) onChange(store, path, el);
    };
    const debounced = debounce(apply, 220);
    el.addEventListener('input', debounced);
    el.addEventListener('change', () => { debounced.cancel(); apply(); });
  });
}

function debounce(fn, ms) {
  let t;
  const w = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  w.cancel = () => clearTimeout(t);
  return w;
}

function bindImages(container, api, { rerender = false } = {}) {
  container.querySelectorAll('[data-img-file]').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      const path = input.getAttribute('data-img-file');
      try {
        const dataUrl = await readImage(file, 1100, 0.8);
        const store = clone(api.store);
        setPath(store, path, dataUrl);
        api.save(store, { rerender });
        const prev = container.querySelector(`[data-img-prev="${path}"]`);
        if (prev) prev.src = dataUrl;
        const urlInput = container.querySelector(`[data-bind="${path}"]`);
        if (urlInput) urlInput.value = '';
        toast('Imagem carregada.');
      } catch (err) {
        toastError(err.message);
      }
      input.value = '';
    });
  });
}

function imgField({ path, label, value, hint = 'JPG/PNG até 2 MB. Prefira 1200px.' }) {
  return `<div class="field">
    <span class="field-label">${esc(label)}</span>
    <label class="img-drop">
      <img data-img-prev="${path}" src="${esc(value || '')}" alt="" onerror="this.style.visibility='hidden'">
      <span class="txt"><b>Enviar imagem</b><small>${esc(hint)}</small></span>
      <span class="ico">${icon('upload', 15)}</span>
      <input type="file" accept="image/*" data-img-file="${path}">
    </label>
    <div class="input-group mt-8">
      <input class="input" data-bind="${path}" value="${esc(value && value.startsWith('data:') ? '' : value || '')}" placeholder="ou cole uma URL https://…">
      ${value ? `<button class="btn btn-ghost btn-sm" data-clear-img="${path}" title="Remover">${icon('x', 14)}</button>` : ''}
    </div>
  </div>`;
}

function bindClearImages(container, api) {
  container.querySelectorAll('[data-clear-img]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const store = clone(api.store);
      setPath(store, btn.getAttribute('data-clear-img'), '');
      api.save(store, { rerender: true });
    });
  });
}

function pageHead(title, desc, actions = '') {
  return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${desc}</p></div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
}

/* ------------------------------------------------------------------ */
/* visão geral                                                         */
/* ------------------------------------------------------------------ */

export function renderOverview(pane, store, api) {
  const orders = listOrders(store.id);
  const paid = orders.filter((o) => ['pago', 'enviado', 'entregue'].includes(o.status));
  const pending = orders.filter((o) => o.status === 'pendente');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const active = (store.products || []).filter((p) => p.active !== false).length;

  const checklist = [
    { done: !!store.name && store.name !== 'Minha Loja', label: 'Definir nome e identidade', href: 'aparencia', ic: 'palette' },
    { done: (store.products || []).length > 0, label: 'Adicionar produtos', href: 'produtos', ic: 'box' },
    { done: !!store.payment?.pixKey, label: 'Configurar a chave PIX', href: 'pagamentos', ic: 'qr' },
    { done: !!store.contact?.whatsapp, label: 'Informar WhatsApp de atendimento', href: 'aparencia', ic: 'whatsapp' },
    { done: !!store.published?.url, label: 'Publicar a loja', href: 'publicar', ic: 'upload' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const pct = Math.round((doneCount / checklist.length) * 100);

  pane.innerHTML = `
${pageHead(`${greeting()}, tudo certo?`, 'Este é o painel da sua loja. A prévia ao lado atualiza em tempo real.',
    `<a class="btn btn-ghost" href="#/loja/${store.id}/ia">${icon('sparkles', 15)} Pedir à IA</a>
     <a class="btn btn-primary" href="#/loja/${store.id}/publicar">${icon('upload', 15)} Publicar loja</a>`)}

<div class="stats-grid">
  <div class="stat"><div class="lbl">${icon('receipt', 12)} Receita confirmada</div><div class="val">${brl(revenue)}</div><div class="sub">${paid.length} pedido(s) pago(s)</div></div>
  <div class="stat"><div class="lbl">${icon('bag', 12)} Pedidos</div><div class="val">${orders.length}</div><div class="sub">${pending.length} aguardando confirmação</div></div>
  <div class="stat"><div class="lbl">${icon('box', 12)} Produtos ativos</div><div class="val">${active}</div><div class="sub">${(store.products || []).length} no total</div></div>
  <div class="stat"><div class="lbl">${icon('tag', 12)} Ticket médio</div><div class="val">${brl(paid.length ? Math.round(revenue / paid.length) : 0)}</div><div class="sub">pedidos confirmados</div></div>
</div>

<div class="grid-2" style="grid-template-columns:1.18fr .82fr;align-items:start">
  <div>
    <div class="card-block">
      <div class="block-head">
        <span class="bi">${icon('check', 16)}</span>
        <div><h3>Prepare a loja para vender</h3><p>${doneCount} de ${checklist.length} concluídos</p></div>
        <div class="right"><span class="pill ${pct === 100 ? 'pill-green' : 'pill-brand'}">${pct}%</span></div>
      </div>
      <div style="height:5px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-bottom:14px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--brand),#ff8b4d);border-radius:99px;transition:width .4s"></div>
      </div>
      <div class="list-editor">
        ${checklist.map((c) => `<a class="list-item" href="#/loja/${store.id}/${c.href}" style="text-decoration:none;align-items:center">
          <span style="width:24px;height:24px;border-radius:99px;display:grid;place-items:center;flex:none;background:${c.done ? 'rgba(52,211,153,.14)' : 'rgba(255,255,255,.05)'};color:${c.done ? '#6ee7b7' : 'var(--dim)'}">${icon(c.done ? 'check' : c.ic, 13)}</span>
          <span class="grow"><b style="font-size:12.5px;color:${c.done ? 'var(--muted)' : 'var(--text)'};text-decoration:${c.done ? 'line-through' : 'none'}">${esc(c.label)}</b></span>
          ${icon('chevron', 14)}
        </a>`).join('')}
      </div>
    </div>

    <div class="card-block">
      <div class="block-head">
        <span class="bi">${icon('receipt', 16)}</span>
        <div><h3>Pedidos recentes</h3><p>Atualizados a cada nova compra na prévia</p></div>
        <div class="right"><a class="btn btn-ghost btn-sm" href="#/loja/${store.id}/pedidos">Ver todos ${icon('chevron', 13)}</a></div>
      </div>
      ${orders.length ? `<div style="overflow-x:auto"><table class="tbl">
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${orders.slice(0, 5).map((o) => `<tr>
          <td><b class="mono" style="font-size:11px">${esc(o.id)}</b><br><span class="tiny dim">${esc(fmtDateTime(o.createdAt))}</span></td>
          <td>${esc(o.customer?.name || '—')}<br><span class="tiny dim">${esc(o.customer?.phone || o.customer?.email || '')}</span></td>
          <td class="num"><b>${brl(o.total)}</b></td>
          <td>${statusPill(o.status)}</td>
          <td><a class="icon-btn sm" href="#/loja/${store.id}/pedidos" title="Abrir">${icon('chevron', 14)}</a></td>
        </tr>`).join('')}</tbody></table></div>`
      : emptyState('receipt', 'Nenhum pedido ainda', 'Abra a prévia, adicione um produto ao carrinho e finalize um pedido de teste. Ele aparece aqui na hora.')}
    </div>
  </div>

  <div>
    <div class="card-block">
      <div class="block-head">
        <span class="bi" style="background:${esc(store.theme?.primary || '#FF5C35')}22;color:${esc(store.theme?.primary || '#FF5C35')}">${icon('store', 16)}</span>
        <div><h3>Sua loja</h3><p>${esc(store.theme?.name || 'Aurora')} · ${esc(store.theme?.font || 'Sora')}</p></div>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:12px">
        ${[store.theme?.primary, store.theme?.accent, store.theme?.bg, store.theme?.surface, store.theme?.text].filter(Boolean).map((c) => `<span style="flex:1;height:26px;border-radius:6px;background:${esc(c)};border:1px solid rgba(255,255,255,.1)"></span>`).join('')}
      </div>
      <div class="line"><span>Produtos</span><strong>${active}</strong></div>
      <div class="line"><span>Chave PIX</span><strong>${store.payment?.pixKey ? 'configurada' : 'pendente'}</strong></div>
      <div class="line"><span>WhatsApp</span><strong>${store.contact?.whatsapp ? 'ativo' : 'não informado'}</strong></div>
      <div class="line"><span>Publicação</span><strong>${store.published?.url ? 'no ar' : 'não publicada'}</strong></div>
      <div class="grid-2 mt-12">
        <a class="btn btn-ghost btn-sm" href="#/loja/${store.id}/aparencia">${icon('palette', 14)} Editar</a>
        <button class="btn btn-ghost btn-sm" data-open-preview>${icon('external', 14)} Ver loja</button>
      </div>
    </div>

    <div class="card-block" style="background:radial-gradient(120% 120% at 90% 0%,rgba(255,92,53,.13),transparent 60%),linear-gradient(175deg,rgba(255,255,255,.03),rgba(255,255,255,.008))">
      <div class="block-head"><span class="bi" style="background:var(--brand-soft);color:var(--brand)">${icon('sparkles', 16)}</span><div><h3>Dica do assistente</h3></div></div>
      <p class="tiny muted" style="line-height:1.65">${esc(tipFor(store))}</p>
      <a class="btn btn-soft btn-sm btn-block mt-12" href="#/loja/${store.id}/ia">Conversar com a IA ${icon('chevron', 13)}</a>
    </div>

    <div class="card-block">
      <div class="block-head"><span class="bi">${icon('qr', 16)}</span><div><h3>Recebimento</h3><p>PIX manual + gateways opcionais</p></div></div>
      <p class="tiny dim" style="line-height:1.6">O checkout gera QR e copia-e-cola com a sua chave. O dinheiro cai direto na sua conta — o OpenCommerce não intermedia nada.</p>
      <a class="btn btn-ghost btn-sm btn-block mt-12" href="#/loja/${store.id}/pagamentos">${icon('card', 14)} Configurar pagamentos</a>
    </div>
  </div>
</div>`;

  pane.querySelector('[data-open-preview]')?.addEventListener('click', async () => {
    const html = await buildStoreHTML(store, { preview: false });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function tipFor(store) {
  if (!store.payment?.pixKey) return 'Primeiro passo: adicione sua chave PIX em Pagamentos. Sem ela, o checkout não consegue gerar o QR Code.';
  if (!store.contact?.whatsapp) return 'Adicione um WhatsApp em Aparência › Contato. É por ele que o cliente envia o comprovante e tira dúvidas.';
  if (!store.products?.length) return 'Sua loja ainda não tem produtos. Peça ao assistente: “crie 6 produtos para o meu nicho”.';
  if (!store.published?.url) return 'Sua loja está pronta. Exporte o ZIP e publique no GitHub Pages para receber visitas de verdade.';
  return 'Dica: peça à IA para criar uma oferta com cupom e badge nos produtos mais caros. Isso costuma aumentar a conversão.';
}

function statusPill(status) {
  const map = {
    pendente: ['Aguardando', 'amber'],
    pago: ['Pago', 'green'],
    enviado: ['Enviado', 'blue'],
    entregue: ['Entregue', 'green'],
    cancelado: ['Cancelado', 'red'],
  };
  const [label, tone] = map[status] || ['—', 'neutral'];
  return `<span class="pill pill-${tone}"><i class="dot"></i>${label}</span>`;
}

/* ------------------------------------------------------------------ */
/* produtos                                                            */
/* ------------------------------------------------------------------ */

export function renderProducts(pane, store, api) {
  pane.innerHTML = `
${pageHead('Produtos', 'Gerencie o catálogo, preços, imagens e estoque.',
    `<button class="btn btn-ghost btn-sm" data-ai-products>${icon('sparkles', 14)} Gerar com IA</button>
     <button class="btn btn-primary" data-new-product>${icon('plus', 15)} Novo produto</button>`)}

<div class="row-between mb-16">
  <label class="search" style="display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:9px;padding:8px 12px;background:rgba(255,255,255,.03);min-width:240px">
    ${icon('search', 15)}
    <input id="prodSearch" placeholder="Buscar produto…" style="border:0;background:none;outline:none;color:var(--text);font-size:12.5px;width:100%">
  </label>
  <div class="flex gap-8 items-center">
    <span class="tiny dim">${store.products.length} produto(s)</span>
    <a class="btn btn-ghost btn-sm" href="#/loja/${store.id}/aparencia">${icon('palette', 14)} Editar visual</a>
  </div>
</div>

${store.products.length ? `<div class="prod-grid" id="prodGrid">
  ${store.products.map((p) => productCard(p)).join('')}
</div>` : emptyState('box', 'Nenhum produto cadastrado', 'Crie o primeiro produto ou peça ao assistente para gerar um catálogo completo com preços e descrições.',
  `<button class="btn btn-primary" data-new-product>${icon('plus', 15)} Criar produto</button>`)}
`;

  const grid = pane.querySelector('#prodGrid');
  pane.querySelector('#prodSearch')?.addEventListener('input', (ev) => {
    const q = ev.target.value.toLowerCase().trim();
    grid?.querySelectorAll('.prod-card').forEach((card) => {
      const text = card.getAttribute('data-search') || '';
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });

  pane.querySelectorAll('[data-new-product]').forEach((b) => b.addEventListener('click', () => openProductForm(store, api, null)));

  pane.querySelector('[data-ai-products]')?.addEventListener('click', () => {
    const hasKey = !!localStorage.getItem('oc_ai_config_v1');
    if (!hasKey) { toast('Conecte sua IA para gerar produtos automaticamente.', 'error'); return; }
    location.hash = `#/loja/${store.id}/ia`;
  });

  pane.querySelectorAll('[data-edit-prod]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = api.store.products.find((x) => x.id === btn.getAttribute('data-edit-prod'));
      if (p) openProductForm(api.store, api, p);
    });
  });

  pane.querySelectorAll('[data-dup-prod]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const base = clone(api.store);
      const p = base.products.find((x) => x.id === btn.getAttribute('data-dup-prod'));
      if (!p) return;
      const copy = { ...clone(p), id: 'prod_' + Math.random().toString(36).slice(2, 9), name: p.name + ' (cópia)' };
      base.products.unshift(copy);
      api.save(base, { rerender: true });
      toast('Produto duplicado.');
    });
  });

  pane.querySelectorAll('[data-del-prod]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del-prod');
      const p = api.store.products.find((x) => x.id === id);
      const ok = await confirmDialog({ title: 'Excluir produto', text: `Remover <b>${esc(p?.name || 'produto')}</b> do catálogo?`, confirmLabel: 'Excluir', danger: true });
      if (!ok) return;
      const base = clone(api.store);
      base.products = base.products.filter((x) => x.id !== id);
      api.save(base, { rerender: true });
      toast('Produto removido.');
    });
  });

  pane.querySelectorAll('[data-toggle-prod]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const base = clone(api.store);
      const p = base.products.find((x) => x.id === btn.getAttribute('data-toggle-prod'));
      if (!p) return;
      p.active = p.active === false;
      api.save(base, { rerender: true });
      toast(p.active ? 'Produto publicado na loja.' : 'Produto oculto na loja.');
    });
  });
}

function productCard(p) {
  const search = (p.name + ' ' + p.category + ' ' + (p.short || '')).toLowerCase();
  return `<article class="prod-card ${p.active === false ? 'off' : ''}" data-search="${esc(search)}">
    <figure class="img" style="margin:0">
      <img src="${esc(p.image || generatedCover(p.name, 20, 300))}" alt="${esc(p.name)}" loading="lazy">
      ${p.badge ? `<span class="flag">${badge(p.badge, 'brand')}</span>` : ''}
      <div class="tools">
        <button data-edit-prod="${esc(p.id)}" title="Editar">${icon('edit', 13)}</button>
        <button data-dup-prod="${esc(p.id)}" title="Duplicar">${icon('copy', 13)}</button>
        <button data-toggle-prod="${esc(p.id)}" title="${p.active === false ? 'Publicar' : 'Ocultar'}">${icon(p.active === false ? 'eye' : 'eye', 13)}</button>
        <button data-del-prod="${esc(p.id)}" title="Excluir" style="color:#fca5a5">${icon('trash', 13)}</button>
      </div>
    </figure>
    <div class="body">
      <span class="cat">${esc(p.category || 'Geral')} · ${p.type === 'fisico' ? 'físico' : 'digital'}</span>
      <b>${esc(p.name)}</b>
      <div class="row-between" style="gap:6px">
        <span class="pr">${brl(p.price)}</span>
        ${p.compareAt > p.price ? `<s class="tiny dim">${brl(p.compareAt)}</s>` : ''}
      </div>
      <div class="row-between" style="margin-top:6px">
        <span class="tiny dim">${p.stock === null || p.stock === undefined ? 'ilimitado' : p.stock + ' un.'}</span>
        ${p.active === false ? badge('oculto', 'neutral') : badge('ativo', 'green')}
      </div>
    </div>
  </article>`;
}

function openProductForm(store, api, product) {
  const isNew = !product;
  const defaultType = store.niche === 'digital' || store.niche === 'servicos' ? 'digital' : 'fisico';
  const p = product || {
    id: 'prod_' + Math.random().toString(36).slice(2, 9),
    name: '', price: 0, compareAt: 0, category: 'Geral', type: defaultType,
    stock: null, badge: '', short: '', description: '', image: '', gallery: [],
    deliveryText: '', fileUrl: '', active: true, featured: false,
  };

  const body = `
    <div class="grid-2">
      <label class="field" style="grid-column:1/-1"><span class="field-label">Nome do produto <b>*</b></span><input id="pName" value="${esc(p.name)}" placeholder="Ex.: Kit Identidade Visual"></label>
      <label class="field"><span class="field-label">Preço (R$) <b>*</b></span><input id="pPrice" value="${p.price ? moneyInput(p.price) : ''}" placeholder="97,00" inputmode="decimal"></label>
      <label class="field"><span class="field-label">Preço antigo (R$)</span><input id="pCompare" value="${p.compareAt ? moneyInput(p.compareAt) : ''}" placeholder="129,00" inputmode="decimal"><span class="hint">Opcional — aparece riscado.</span></label>
      <label class="field"><span class="field-label">Categoria</span><input id="pCategory" value="${esc(p.category)}" placeholder="Design"><span class="hint">Agrupa os filtros da loja.</span></label>
      <label class="field"><span class="field-label">Tipo</span><select id="pType">
        <option value="digital" ${p.type === 'digital' ? 'selected' : ''}>Digital (entrega online)</option>
        <option value="fisico" ${p.type === 'fisico' ? 'selected' : ''}>Físico (envio)</option>
      </select></label>
      <label class="field"><span class="field-label">Estoque</span><input id="pStock" type="number" min="0" value="${p.stock ?? ''}" placeholder="Ilimitado"><span class="hint">Deixe vazio para ilimitado.</span></label>
      <label class="field"><span class="field-label">Selo / badge</span><input id="pBadge" value="${esc(p.badge || '')}" placeholder="Mais vendido"></label>
      <label class="field" style="grid-column:1/-1"><span class="field-label">Resumo curto</span><input id="pShort" value="${esc(p.short)}" placeholder="Uma frase que resume o benefício." maxlength="160"></label>
      <label class="field" style="grid-column:1/-1"><span class="field-label">Descrição</span><textarea id="pDesc" rows="5" placeholder="O que está incluído, formato de entrega, detalhes…">${esc(p.description)}</textarea></label>
      <div class="field" style="grid-column:1/-1">
        <span class="field-label">Imagem principal</span>
        <label class="img-drop">
          <img id="pImgPrev" src="${esc(p.image || generatedCover(p.name || 'Produto', 20, 300))}" alt="">
          <span class="txt"><b>Enviar imagem</b><small>JPG/PNG até 2 MB</small></span>
          <span class="ico">${icon('upload', 15)}</span>
          <input type="file" id="pImgFile" accept="image/*">
        </label>
        <input class="input mt-8" id="pImgUrl" value="${esc(p.image && p.image.startsWith('data:') ? '' : p.image || '')}" placeholder="ou cole uma URL https://…">
      </div>
      <label class="field"><span class="field-label">Texto de entrega</span><input id="pDelivery" value="${esc(p.deliveryText || '')}" placeholder="${defaultType === 'digital' ? 'Acesso imediato' : 'Envio em até 24h'}"><span class="hint">Aparece no card e no checkout.</span></label>
      <label class="field"><span class="field-label">Link do arquivo (digital)</span><input id="pFile" value="${esc(p.fileUrl || '')}" placeholder="https://drive.google.com/…"><span class="hint">Aparece na tela de sucesso.</span></label>
    </div>
    <div class="mt-12">
      ${toggle({ label: 'Produto ativo', name: 'pActive', checked: p.active !== false, hint: 'Desative para esconder da loja sem excluir.' })}
    </div>`;

  const modal = openModal({
    title: isNew ? 'Novo produto' : 'Editar produto',
    size: 'lg',
    body,
    footer: `<button class="btn btn-ghost" data-cancel>Cancelar</button><button class="btn btn-primary" data-save>${icon('save', 15)} Salvar produto</button>`,
  });

  let imageData = p.image || '';
  modal.root.querySelector('#pImgFile').addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      imageData = await readImage(file, 1100, 0.8);
      modal.root.querySelector('#pImgPrev').src = imageData;
      modal.root.querySelector('#pImgUrl').value = '';
    } catch (err) { toastError(err.message); }
  });
  modal.root.querySelector('#pImgUrl').addEventListener('input', (ev) => {
    const url = ev.target.value.trim();
    imageData = url;
    if (url) modal.root.querySelector('#pImgPrev').src = url;
  });
  modal.root.querySelector('#pName').addEventListener('input', (ev) => {
    if (!imageData) modal.root.querySelector('#pImgPrev').src = generatedCover(ev.target.value || 'Produto', 20, 300);
  });

  modal.root.querySelector('[data-cancel]').addEventListener('click', modal.close);
  modal.root.querySelector('[data-save]').addEventListener('click', () => {
    const name = modal.root.querySelector('#pName').value.trim();
    const price = parseMoney(modal.root.querySelector('#pPrice').value);
    if (!name) { toast('Informe o nome do produto.', 'error'); return; }
    if (!price) { toast('Informe um preço válido.', 'error'); return; }

    const stockVal = modal.root.querySelector('#pStock').value.trim();
    const next = clone(api.store);
    const item = {
      ...p,
      name,
      price,
      compareAt: parseMoney(modal.root.querySelector('#pCompare').value),
      category: modal.root.querySelector('#pCategory').value.trim() || 'Geral',
      type: modal.root.querySelector('#pType').value,
      stock: stockVal === '' ? null : Math.max(0, Number(stockVal) || 0),
      badge: modal.root.querySelector('#pBadge').value.trim(),
      short: modal.root.querySelector('#pShort').value.trim(),
      description: modal.root.querySelector('#pDesc').value,
      image: imageData || generatedCover(name, 20, 300),
      deliveryText: modal.root.querySelector('#pDelivery').value.trim(),
      fileUrl: modal.root.querySelector('#pFile').value.trim(),
      active: modal.root.querySelector('input[name="pActive"]').checked,
    };
    if (isNew) next.products.unshift(item);
    else next.products = next.products.map((x) => (x.id === item.id ? item : x));
    api.save(next, { rerender: true });
    modal.close();
    toast(isNew ? 'Produto criado.' : 'Produto atualizado.');
  });
}

/* ------------------------------------------------------------------ */
/* aparência                                                           */
/* ------------------------------------------------------------------ */

export function renderAppearance(pane, store, api) {
  const t = store.theme || {};
  pane.innerHTML = `
${pageHead('Aparência', 'Mude cores, fontes, textos e seções. A prévia ao lado mostra tudo em tempo real.',
  `<button class="btn btn-ghost btn-sm" data-copy-store>${icon('copy', 14)} Duplicar loja</button>`)}

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('palette', 16)}</span><div><h3>Tema</h3><p>Um ponto de partida pronto. Depois refine as cores.</p></div></div>
  <div class="theme-grid">
    ${THEMES.map((th) => `<button class="theme-card ${t.id === th.id ? 'on' : ''}" data-theme="${th.id}">
      <div class="theme-prev" style="background:${th.bg};color:${th.text}">
        <div class="bar" style="background:${th.primary}"></div>
        <div class="bar b2" style="background:${th.text}"></div>
        <div class="dots"><i style="background:${th.primary}"></i><i style="background:${th.accent}"></i><i style="background:${th.surface2}"></i></div>
      </div>
      <b>${esc(th.name)}</b><span>${th.mode} · ${esc(th.font)}</span>
    </button>`).join('')}
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('pen', 16)}</span><div><h3>Identidade</h3><p>Nome, logo e assinatura da marca.</p></div></div>
  <div class="grid-2">
    <label class="field"><span class="field-label">Nome da loja</span><input data-bind="name" value="${esc(store.name)}" maxlength="60"></label>
    <label class="field"><span class="field-label">Texto do logo</span><input data-bind="logoText" value="${esc(store.logoText)}" placeholder="MONO" maxlength="24"><span class="hint">Usado quando não há imagem de logo.</span></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Tagline</span><input data-bind="tagline" value="${esc(store.tagline)}" maxlength="80"></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Descrição</span><textarea data-bind="description" rows="2">${esc(store.description)}</textarea></label>
    ${imgField({ path: 'logoImage', label: 'Logo (imagem)', value: store.logoImage, hint: 'PNG transparente, até 400px de altura.' })}
    <div class="field"><span class="field-label">Nicho</span>
      <select data-bind="niche">
        ${['digital', 'moda', 'beleza', 'casa', 'tech', 'alimentos', 'servicos', 'outro'].map((n) => `<option value="${n}" ${store.niche === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </div>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('palette', 16)}</span><div><h3>Cores e forma</h3><p>Ajuste fino da paleta.</p></div></div>
  <div class="grid-2">
    ${colorField('Cor principal', 'theme.primary', t.primary)}
    ${colorField('Cor de destaque', 'theme.accent', t.accent)}
    ${colorField('Fundo', 'theme.bg', t.bg)}
    ${colorField('Superfície (cards)', 'theme.surface', t.surface)}
    ${colorField('Texto', 'theme.text', t.text)}
    ${colorField('Texto suave', 'theme.muted', t.muted)}
  </div>
  <div class="grid-2 mt-12">
    <label class="field"><span class="field-label">Arredondamento: <b data-label="theme.radius">${t.radius || 20}</b>px</span>
      <input type="range" min="0" max="32" step="1" data-bind="theme.radius" data-type="number" value="${t.radius || 20}" style="padding:0;border:0;background:none">
    </label>
    <label class="field"><span class="field-label">Estilo dos cards</span>
      <select data-bind="theme.cardStyle">
        <option value="glow" ${t.cardStyle === 'glow' ? 'selected' : ''}>Brilho (glow)</option>
        <option value="outline" ${t.cardStyle === 'outline' ? 'selected' : ''}>Contorno</option>
        <option value="soft" ${t.cardStyle === 'soft' ? 'selected' : ''}>Suave</option>
      </select>
    </label>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('layers', 16)}</span><div><h3>Tipografia e layout</h3></div></div>
  <div class="grid-2">
    <label class="field"><span class="field-label">Fonte dos textos</span>
      <select data-bind="theme.font">${FONTS.map((f) => `<option value="${f.id}" ${t.font === f.id ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>
    </label>
    <label class="field"><span class="field-label">Fonte dos títulos</span>
      <select data-bind="theme.heading">${FONTS.map((f) => `<option value="${f.id}" ${t.heading === f.id ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>
    </label>
    <label class="field"><span class="field-label">Estilo do hero</span>
      <select data-bind="theme.heroStyle">
        <option value="split" ${t.heroStyle === 'split' ? 'selected' : ''}>Dividido (texto + imagem)</option>
        <option value="centered" ${t.heroStyle === 'centered' ? 'selected' : ''}>Centralizado</option>
        <option value="image" ${t.heroStyle === 'image' ? 'selected' : ''}>Imagem de fundo</option>
      </select>
    </label>
    <label class="field"><span class="field-label">Produtos por linha</span>
      <select data-bind="catalog.itemsPerRow" data-type="number">
        ${[2, 3, 4].map((n) => `<option value="${n}" ${Number(store.catalog?.itemsPerRow) === n ? 'selected' : ''}>${n} colunas</option>`).join('')}
      </select>
    </label>
  </div>
</div>

<details class="card-block" open>
  <summary class="block-head" style="cursor:pointer;list-style:none;margin:0"><span class="bi">${icon('sparkles', 16)}</span><div><h3>Hero (topo da loja)</h3><p>O primeiro impacto.</p></div><div class="right">${icon('chevronDown', 15)}</div></summary>
  <div class="grid-2 mt-16">
    <label class="field"><span class="field-label">Selo acima do título</span><input data-bind="hero.badge" value="${esc(store.hero?.badge)}" placeholder="Novo drop · Coleção Norte"></label>
    <label class="field"><span class="field-label">Palavra em destaque</span><input data-bind="hero.highlight" value="${esc(store.hero?.highlight)}" placeholder="entregue na hora"><span class="hint">Precisa existir no título.</span></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Título</span><input data-bind="hero.title" value="${esc(store.hero?.title)}"></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Subtítulo</span><textarea data-bind="hero.subtitle" rows="2">${esc(store.hero?.subtitle)}</textarea></label>
    <label class="field"><span class="field-label">Texto do botão</span><input data-bind="hero.ctaLabel" value="${esc(store.hero?.ctaLabel)}"></label>
    <label class="field"><span class="field-label">Botão secundário (WhatsApp)</span><input data-bind="hero.ctaSecondaryLabel" value="${esc(store.hero?.ctaSecondaryLabel)}" placeholder="Falar no WhatsApp"></label>
    ${imgField({ path: 'hero.image', label: 'Imagem do hero', value: store.hero?.image, hint: 'Quadrada ou retrato, 1200px.' })}
    <div class="field"><span class="field-label">Números de prova</span>
      <div class="stack">
        ${(store.hero?.stats || []).map((s, i) => `<div class="input-group">
          <input class="input" data-bind="hero.stats.${i}.value" value="${esc(s.value)}" placeholder="+3.000">
          <input class="input" data-bind="hero.stats.${i}.label" value="${esc(s.label)}" placeholder="clientes">
          <button class="btn btn-ghost btn-sm" data-remove-stat="${i}">${icon('x', 13)}</button>
        </div>`).join('')}
        <button class="btn btn-ghost btn-sm" data-add-stat>${icon('plus', 13)} Adicionar número</button>
      </div>
    </div>
  </div>
</details>

<details class="card-block">
  <summary class="block-head" style="cursor:pointer;list-style:none;margin:0"><span class="bi">${icon('bolt', 16)}</span><div><h3>Barra de aviso e benefícios</h3></div><div class="right">${icon('chevronDown', 15)}</div></summary>
  <div class="mt-16">
    ${toggle({ label: 'Mostrar barra de aviso', name: 'announceOn', checked: store.announcement?.enabled, hint: 'Uma faixa colorida no topo.' })}
    <label class="field mt-12"><span class="field-label">Texto da barra</span><input data-bind="announcement.text" value="${esc(store.announcement?.text)}" placeholder="Frete grátis acima de R$ 199"></label>
  </div>
  <div class="divider"></div>
  <div class="stack">
    ${(store.benefits || []).map((b, i) => `<div class="list-item">
      <span class="bi" style="width:28px;height:28px;border-radius:8px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;flex:none">${icon('check', 14)}</span>
      <div class="grow grid-2" style="gap:8px">
        <input class="input" data-bind="benefits.${i}.title" value="${esc(b.title)}" placeholder="Título">
        <input class="input" data-bind="benefits.${i}.text" value="${esc(b.text)}" placeholder="Descrição">
      </div>
      <button class="icon-btn danger" data-remove-benefit="${i}">${icon('trash', 14)}</button>
    </div>`).join('')}
    <button class="btn btn-ghost btn-sm" data-add-benefit>${icon('plus', 13)} Adicionar benefício</button>
  </div>
</details>

<details class="card-block">
  <summary class="block-head" style="cursor:pointer;list-style:none;margin:0"><span class="bi">${icon('layers', 16)}</span><div><h3>Catálogo e seções</h3></div><div class="right">${icon('chevronDown', 15)}</div></summary>
  <div class="grid-2 mt-16">
    <label class="field"><span class="field-label">Título do catálogo</span><input data-bind="catalog.title" value="${esc(store.catalog?.title)}"></label>
    <label class="field"><span class="field-label">Subtítulo</span><input data-bind="catalog.subtitle" value="${esc(store.catalog?.subtitle)}"></label>
  </div>
  <div class="grid-2 mt-8">
    ${toggle({ label: 'Busca no catálogo', name: 'catSearch', checked: store.catalog?.showSearch })}
    ${toggle({ label: 'Filtros por categoria', name: 'catCats', checked: store.catalog?.showCategories })}
  </div>
  <div class="divider"></div>
  ${toggle({ label: 'Seção "Sobre"', name: 'aboutOn', checked: store.about?.enabled })}
  <div class="grid-2 mt-12">
    <label class="field"><span class="field-label">Título</span><input data-bind="about.title" value="${esc(store.about?.title)}"></label>
    <label class="field"><span class="field-label">Destaques (um por linha)</span><textarea data-bind="about.bulletPoints" data-type="lines" rows="3">${esc((store.about?.bulletPoints || []).join('\n'))}</textarea></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Texto</span><textarea data-bind="about.text" rows="3">${esc(store.about?.text)}</textarea></label>
    ${imgField({ path: 'about.image', label: 'Imagem da seção', value: store.about?.image })}
  </div>
</details>

<details class="card-block">
  <summary class="block-head" style="cursor:pointer;list-style:none;margin:0"><span class="bi">${icon('users', 16)}</span><div><h3>Depoimentos</h3></div><div class="right">${icon('chevronDown', 15)}</div></summary>
  <div class="mt-16">
    ${toggle({ label: 'Mostrar depoimentos', name: 'testOn', checked: store.testimonials?.enabled })}
    <label class="field mt-12"><span class="field-label">Título</span><input data-bind="testimonials.title" value="${esc(store.testimonials?.title)}"></label>
    <div class="stack mt-12">
      ${(store.testimonials?.items || []).map((item, i) => `<div class="list-item">
        <div class="grow">
          <div class="grid-2" style="gap:8px">
            <input class="input" data-bind="testimonials.items.${i}.name" value="${esc(item.name)}" placeholder="Nome">
            <input class="input" data-bind="testimonials.items.${i}.role" value="${esc(item.role || '')}" placeholder="Cidade / cargo">
          </div>
          <textarea class="input mt-8" data-bind="testimonials.items.${i}.text" rows="2" placeholder="Depoimento">${esc(item.text)}</textarea>
        </div>
        <button class="icon-btn danger" data-remove-test="${i}">${icon('trash', 14)}</button>
      </div>`).join('')}
      <button class="btn btn-ghost btn-sm" data-add-test>${icon('plus', 13)} Adicionar depoimento</button>
    </div>
  </div>
</details>

<details class="card-block">
  <summary class="block-head" style="cursor:pointer;list-style:none;margin:0"><span class="bi">${icon('info', 16)}</span><div><h3>FAQ</h3></div><div class="right">${icon('chevronDown', 15)}</div></summary>
  <div class="mt-16">
    ${toggle({ label: 'Mostrar perguntas frequentes', name: 'faqOn', checked: store.faq?.enabled })}
    <label class="field mt-12"><span class="field-label">Título</span><input data-bind="faq.title" value="${esc(store.faq?.title)}"></label>
    <div class="stack mt-12">
      ${(store.faq?.items || []).map((item, i) => `<div class="list-item">
        <div class="grow">
          <input class="input" data-bind="faq.items.${i}.q" value="${esc(item.q)}" placeholder="Pergunta">
          <textarea class="input mt-8" data-bind="faq.items.${i}.a" rows="2" placeholder="Resposta">${esc(item.a)}</textarea>
        </div>
        <button class="icon-btn danger" data-remove-faq="${i}">${icon('trash', 14)}</button>
      </div>`).join('')}
      <button class="btn btn-ghost btn-sm" data-add-faq>${icon('plus', 13)} Adicionar pergunta</button>
    </div>
  </div>
</details>

<details class="card-block">
  <summary class="block-head" style="cursor:pointer;list-style:none;margin:0"><span class="bi">${icon('tag', 16)}</span><div><h3>Chamada final, contato e SEO</h3></div><div class="right">${icon('chevronDown', 15)}</div></summary>
  <div class="grid-2 mt-16">
    <label class="field"><span class="field-label">Título da chamada final</span><input data-bind="cta.title" value="${esc(store.cta?.title)}"></label>
    <label class="field"><span class="field-label">Texto</span><input data-bind="cta.text" value="${esc(store.cta?.text)}"></label>
  </div>
  <div class="divider"></div>
  <div class="grid-2">
    <label class="field"><span class="field-label">WhatsApp</span><input data-bind="contact.whatsapp" value="${esc(store.contact?.whatsapp)}" placeholder="11999999999"><span class="hint">Só números, com DDD.</span></label>
    <label class="field"><span class="field-label">E-mail</span><input data-bind="contact.email" value="${esc(store.contact?.email)}" placeholder="oi@sualoja.com"></label>
    <label class="field"><span class="field-label">Instagram</span><input data-bind="contact.instagram" value="${esc(store.contact?.instagram)}" placeholder="sualoja"></label>
    <label class="field"><span class="field-label">Endereço / cidade</span><input data-bind="contact.address" value="${esc(store.contact?.address)}" placeholder="São Paulo, SP"></label>
    <label class="field"><span class="field-label">CNPJ (opcional)</span><input data-bind="contact.cnpj" value="${esc(store.contact?.cnpj)}"></label>
  </div>
  <div class="divider"></div>
  <div class="grid-2">
    <label class="field"><span class="field-label">SEO · título</span><input data-bind="seo.title" value="${esc(store.seo?.title)}" maxlength="60"><span class="hint">Até 60 caracteres.</span></label>
    <label class="field"><span class="field-label">SEO · keywords</span><input data-bind="seo.keywords" value="${esc(store.seo?.keywords)}" placeholder="design, presets, kits"></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">SEO · descrição</span><textarea data-bind="seo.description" rows="2" maxlength="160">${esc(store.seo?.description)}</textarea></label>
  </div>
</details>`;

  // temas
  pane.querySelectorAll('[data-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = THEMES.find((x) => x.id === btn.getAttribute('data-theme'));
      if (!theme) return;
      const next = clone(api.store);
      next.theme = { ...theme };
      api.save(next, { rerender: true });
      toast(`Tema ${theme.name} aplicado.`);
    });
  });

  bindLive(pane, api);
  bindImages(pane, api);
  bindClearImages(pane, api);

  // toggles que não são data-bind direto
  const bindToggle = (selector, path) => {
    const el = pane.querySelector(selector);
    if (!el) return;
    el.addEventListener('change', () => {
      const next = clone(api.store);
      setPath(next, path, el.checked);
      api.save(next);
    });
  };
  bindToggle('input[name="announceOn"]', 'announcement.enabled');
  bindToggle('input[name="aboutOn"]', 'about.enabled');
  bindToggle('input[name="testOn"]', 'testimonials.enabled');
  bindToggle('input[name="faqOn"]', 'faq.enabled');
  bindToggle('input[name="catSearch"]', 'catalog.showSearch');
  bindToggle('input[name="catCats"]', 'catalog.showCategories');

  // listas
  const mutate = (fn) => { const next = clone(api.store); fn(next); api.save(next, { rerender: true, silent: false }); };

  pane.querySelector('[data-add-benefit]')?.addEventListener('click', () => mutate((s) => s.benefits.push({ icon: 'shield', title: 'Novo benefício', text: 'Descrição curta do benefício.' })));
  pane.querySelectorAll('[data-remove-benefit]').forEach((b) => b.addEventListener('click', () => mutate((s) => s.benefits.splice(Number(b.getAttribute('data-remove-benefit')), 1))));
  pane.querySelector('[data-add-faq]')?.addEventListener('click', () => mutate((s) => s.faq.items.push({ q: 'Nova pergunta?', a: 'Resposta objetiva.' })));
  pane.querySelectorAll('[data-remove-faq]').forEach((b) => b.addEventListener('click', () => mutate((s) => s.faq.items.splice(Number(b.getAttribute('data-remove-faq')), 1))));
  pane.querySelector('[data-add-test]')?.addEventListener('click', () => mutate((s) => s.testimonials.items.push({ name: 'Cliente', role: 'Cidade', text: 'Ótima experiência, recomendo.', avatar: '' })));
  pane.querySelectorAll('[data-remove-test]').forEach((b) => b.addEventListener('click', () => mutate((s) => s.testimonials.items.splice(Number(b.getAttribute('data-remove-test')), 1))));
  pane.querySelector('[data-add-stat]')?.addEventListener('click', () => mutate((s) => (s.hero.stats ||= []).push({ value: '+100', label: 'clientes' })));
  pane.querySelectorAll('[data-remove-stat]').forEach((b) => b.addEventListener('click', () => mutate((s) => s.hero.stats.splice(Number(b.getAttribute('data-remove-stat')), 1))));

  pane.querySelector('[data-copy-store]')?.addEventListener('click', () => {
    const copy = duplicateStore(api.store.id);
    if (copy) {
      toast('Loja duplicada.');
      location.hash = `#/loja/${copy.id}/inicio`;
    }
  });
}

function colorField(label, path, value) {
  return `<div class="field"><span class="field-label">${esc(label)}</span>
    <div class="color-row">
      <input type="color" data-bind="${path}" value="${esc(toHex(value) || '#000000')}">
      <input class="input" data-bind="${path}" data-color-text="${path}" value="${esc(value || '')}">
    </div>
  </div>`;
}

function toHex(value) {
  if (!value) return '';
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) return '#' + value.slice(1).split('').map((c) => c + c).join('');
  return '';
}

/* ------------------------------------------------------------------ */
/* pagamentos                                                          */
/* ------------------------------------------------------------------ */

export function renderPayments(pane, store, api) {
  const p = store.payment || {};
  const keyInfo = validatePixKey(p.pixKey || '', p.pixKeyType);
  const gateway = p.gateway || { provider: 'manual', apiKey: '', publicKey: '', env: 'sandbox', endpoint: '' };

  pane.innerHTML = `
${pageHead('Pagamentos', 'Receba por PIX na sua conta. Manual por padrão, automático se você configurar um gateway.')}

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('qr', 16)}</span><div><h3>PIX</h3><p>A chave usada para gerar o QR Code e o copia-e-cola.</p></div><div class="right">${p.pixKey ? badge(keyInfo.ok ? 'válida' : 'revisar', keyInfo.ok ? 'green' : 'amber') : badge('pendente', 'amber')}</div></div>

  <div class="grid-2">
    <label class="field"><span class="field-label">Chave PIX <b>*</b></span>
      <input data-bind="payment.pixKey" data-pix-live value="${esc(p.pixKey || '')}" placeholder="E-mail, CPF/CNPJ, telefone ou chave aleatória">
      <span class="hint">${p.pixKey ? esc(keyInfo.message || formatPixKey(p.pixKey)) : 'Use a mesma chave cadastrada no seu banco.'}</span>
    </label>
    <label class="field"><span class="field-label">Tipo de chave</span>
      <select data-bind="payment.pixKeyType">
        ${[['auto', 'Detectar automaticamente'], ['cpf', 'CPF'], ['cnpj', 'CNPJ'], ['email', 'E-mail'], ['telefone', 'Telefone'], ['aleatoria', 'Aleatória']].map(([v, l]) => `<option value="${v}" ${p.pixKeyType === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <span class="hint">Detectado: <b>${esc(keyInfo.type || detectPixKeyType(p.pixKey || ''))}</b></span>
    </label>
    <label class="field"><span class="field-label">Nome do recebedor</span><input data-bind="payment.holderName" data-pix-live value="${esc(p.holderName || '')}" placeholder="Como aparece no extrato" maxlength="25"><span class="hint">Sem acentos e até 25 caracteres.</span></label>
    <label class="field"><span class="field-label">Cidade</span><input data-bind="payment.city" data-pix-live value="${esc(p.city || '')}" placeholder="SAO PAULO" maxlength="15"></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Instruções para o cliente</span><textarea data-bind="payment.instructions" rows="2" placeholder="Após pagar, envie o comprovante no WhatsApp.">${esc(p.instructions || '')}</textarea></label>
  </div>

  <div class="grid-2 mt-8">
    <label class="field"><span class="field-label">Validade do PIX (minutos)</span><input type="number" min="0" max="1440" data-bind="payment.pixExpiration" data-type="number" value="${Number(p.pixExpiration) || 0}"></label>
    <div class="field"><span class="field-label">Prévia</span>
      <div class="pix-preview">
        <div class="qr" id="pixQr">${renderQrPreview(store)}</div>
        <div class="code"><code id="pixCodePrev">${esc(previewPayload(store))}</code>
          <button class="btn btn-ghost btn-sm" data-copy-pix>${icon('copy', 13)} Copiar código</button>
        </div>
      </div>
    </div>
  </div>

  <div class="divider"></div>
  ${toggle({ label: 'Atendimento por chat antes do PIX', name: 'manualChat', checked: p.manualChat !== false, hint: 'No checkout manual, o cliente abre uma conversa com o vendedor. O vendedor envia a chave PIX e o cliente paga.' })}
  ${toggle({ label: 'Enviar pedido pelo WhatsApp', name: 'waCheckout', checked: p.whatsappCheckout !== false, hint: 'O cliente pode continuar a conversa no WhatsApp com o pedido já preenchido.' })}
  <label class="field mt-12"><span class="field-label">Webhook de pedidos (opcional)</span><input data-bind="payment.webhookUrl" value="${esc(p.webhookUrl || '')}" placeholder="https://hook.seu-servidor.com/opencommerce"><span class="hint">Recebe um POST em JSON a cada pedido. Funciona com Google Apps Script, Make, n8n, Supabase, etc.</span></label>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('card', 16)}</span><div><h3>Gateway automático</h3><p>Cobrança PIX gerada e confirmada pelo gateway. Opcional.</p></div><div class="right">${gateway.provider !== 'manual' ? badge(GATEWAYS.find((g) => g.id === gateway.provider)?.label || gateway.provider, 'blue') : badge('manual', 'neutral')}</div></div>
  <div class="gateway-list">
    ${GATEWAYS.map((g) => `<button class="gateway-card ${gateway.provider === g.id ? 'on' : ''}" data-gateway="${g.id}">
      <b>${esc(g.label)}</b><span>${esc(g.desc)}</span>
      ${g.id === 'manual' ? '<span class="tag">recomendado</span>' : ''}
    </button>`).join('')}
  </div>

  ${gateway.provider !== 'manual' ? `
    <div class="divider"></div>
    <div class="grid-2">
      <label class="field"><span class="field-label">Ambiente</span><select data-bind="payment.gateway.env">
        <option value="sandbox" ${gateway.env === 'sandbox' ? 'selected' : ''}>Teste (sandbox)</option>
        <option value="prod" ${gateway.env === 'prod' ? 'selected' : ''}>Produção</option>
      </select><span class="hint">Use sandbox até validar o fluxo completo.</span></label>
      <label class="field"><span class="field-label">Endpoint do gateway <b>*</b></span><input data-bind="payment.gateway.endpoint" value="${esc(gateway.endpoint || '')}" placeholder="https://sua-api.vercel.app/api/gateway"><span class="hint">Sua função serverless cria a cobrança e devolve o QR. O modelo pronto está em <code>serverless/api/gateway.js</code>.</span></label>
      ${gateway.provider === 'mercadopago' ? `<label class="field" style="grid-column:1/-1"><span class="field-label">Access token do Mercado Pago (modo direto)</span><input type="password" data-bind="payment.gateway.apiKey" value="${esc(gateway.apiKey || '')}" placeholder="APP_USR-..."><span class="hint">Opcional. Só funciona se o navegador permitir CORS. Para produção, prefira o endpoint.</span></label>` : ''}
    </div>

    <div class="gateway-hint">
      <span class="bi">${icon('shield', 16)}</span>
      <div>
        <b>${gateway.endpoint ? 'Endpoint configurado' : 'Falta configurar o endpoint'}</b>
        <p>${gateway.endpoint ? 'O checkout vai chamar a sua função e exibir o QR/checkout retornado pelo gateway.' : 'Asaas, EFI, Pagar.me e Mercado Pago exigem segredo no servidor. Publique o modelo <code>serverless/api/gateway.js</code> no Vercel/Cloudflare e cole a URL acima.'}</p>
        ${GATEWAYS.find((g) => g.id === gateway.provider)?.docs ? `<a href="${esc(GATEWAYS.find((g) => g.id === gateway.provider).docs)}" target="_blank" rel="noopener">Documentação do ${esc(GATEWAYS.find((g) => g.id === gateway.provider).label)} ${icon('external', 12)}</a>` : ''}
      </div>
    </div>

    <div class="alert alert-warn mt-12">${icon('alert', 16)}<span><b>Chaves ficam no servidor.</b> Nunca coloque a chave secreta do gateway no código da loja. O endpoint recebe <code>{ provider, storeId, order, env }</code> e devolve <code>{ payment: { payload, qr, url } }</code>.</span></div>
  ` : `<p class="tiny dim mt-12">Modo manual: o cliente paga no app do banco e você confirma o pedido em <b>Pedidos</b>. Sem taxas e sem depender de aprovação de conta.</p>`}
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('receipt', 16)}</span><div><h3>Teste de recebimento</h3><p>Confira se o QR Code abre corretamente no app do seu banco.</p></div></div>
  <p class="tiny dim">Valor de teste: <b>${brl(store.products?.[0]?.price || 4990)}</b> (primeiro produto). Pague um valor simbólico para validar a chave antes de divulgar a loja.</p>
  <div class="flex gap-8 mt-12">
    <button class="btn btn-ghost btn-sm" data-copy-pix>${icon('copy', 14)} Copiar PIX de teste</button>
    <button class="btn btn-ghost btn-sm" data-open-preview-pay>${icon('external', 14)} Abrir loja</button>
  </div>
</div>`;

  bindLive(pane, api, (store, path) => {
    if (path && path.startsWith('payment.')) refreshPixPreview(pane, store);
  });

  pane.querySelectorAll('[data-pix-live]').forEach((el) => {
    el.addEventListener('input', () => {
      const qr = pane.querySelector('#pixQr');
      const code = pane.querySelector('#pixCodePrev');
      const s = api.store;
      if (qr) qr.innerHTML = renderQrPreview(s);
      if (code) code.textContent = previewPayload(s);
    });
  });

  const waToggle = pane.querySelector('input[name="waCheckout"]');
  waToggle?.addEventListener('change', () => {
    const next = clone(api.store);
    next.payment.whatsappCheckout = waToggle.checked;
    api.save(next);
  });

  const chatToggle = pane.querySelector('input[name="manualChat"]');
  chatToggle?.addEventListener('change', () => {
    const next = clone(api.store);
    next.payment.manualChat = chatToggle.checked;
    api.save(next);
  });

  pane.querySelectorAll('[data-gateway]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = clone(api.store);
      next.payment.gateway.provider = btn.getAttribute('data-gateway');
      next.payment.mode = btn.getAttribute('data-gateway') === 'manual' ? 'manual' : 'gateway';
      api.save(next, { rerender: true });
    });
  });

  pane.querySelectorAll('[data-copy-pix]').forEach((b) => b.addEventListener('click', () => copyWithToast(previewPayload(api.store), 'Código PIX copiado')));

  pane.querySelector('[data-open-preview-pay]')?.addEventListener('click', async () => {
    const html = await buildStoreHTML(store, { preview: false });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
}

function previewPayload(store) {
  try {
    const p = store.payment || {};
    if (!p.pixKey) return 'Configure a chave PIX para ver o código aqui.';
    return buildPixPayload({
      key: normalizePixKey(p.pixKey, p.pixKeyType),
      type: p.pixKeyType,
      name: p.holderName || store.name,
      city: p.city || 'SAO PAULO',
      amount: (store.products?.[0]?.price || 4990) / 100,
      txid: 'TESTE' + Date.now().toString(36).toUpperCase().slice(-5),
      description: store.name,
    });
  } catch (err) {
    return err.message;
  }
}

function renderQrPreview(store) {
  try {
    const payload = previewPayload(store);
    if (!payload || payload.startsWith('Configure')) return `<span class="tiny dim" style="padding:10px;display:block;color:#333">QR Code</span>`;
    return qrSvg(payload, { size: 130, margin: 2 });
  } catch {
    return '';
  }
}

function refreshPixPreview(pane, store) {
  const qr = pane.querySelector('#pixQr');
  const code = pane.querySelector('#pixCodePrev');
  if (qr) qr.innerHTML = renderQrPreview(store);
  if (code) code.textContent = previewPayload(store);
}

/* ------------------------------------------------------------------ */
/* frete e checkout                                                    */
/* ------------------------------------------------------------------ */

export function renderShipping(pane, store, api) {
  const s = store.shipping || {};
  const c = store.checkout || {};
  pane.innerHTML = `
${pageHead('Frete e checkout', 'Defina a entrega, os campos do formulário e a mensagem de sucesso.')}

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('truck', 16)}</span><div><h3>Frete</h3><p>Para produtos físicos. Produtos digitais ignoram o frete.</p></div></div>
  ${toggle({ label: 'Cobrar frete', name: 'shipOn', checked: s.enabled, hint: 'Ative se você vende produtos físicos.' })}
  <div class="grid-2 mt-12">
    <label class="field"><span class="field-label">Modo</span><select data-bind="shipping.mode">
      <option value="free" ${s.mode === 'free' ? 'selected' : ''}>Grátis</option>
      <option value="fixed" ${s.mode === 'fixed' ? 'selected' : ''}>Valor fixo</option>
      <option value="on_request" ${s.mode === 'on_request' ? 'selected' : ''}>Combinar no WhatsApp</option>
    </select></label>
    <label class="field"><span class="field-label">Valor do frete (R$)</span><input data-bind="shipping.flatRate" data-type="money" value="${moneyInput(s.flatRate)}"></label>
    <label class="field"><span class="field-label">Frete grátis a partir de (R$)</span><input data-bind="shipping.freeAbove" data-type="money" value="${moneyInput(s.freeAbove)}"><span class="hint">0 = sem frete grátis.</span></label>
    <label class="field"><span class="field-label">Prazo de entrega</span><input data-bind="shipping.deliveryTime" value="${esc(s.deliveryTime || '')}" placeholder="3 a 7 dias úteis"></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Observação no rodapé</span><input data-bind="shipping.note" value="${esc(s.note || '')}" placeholder="Enviamos para todo o Brasil."></label>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('receipt', 16)}</span><div><h3>Formulário de checkout</h3><p>Peça apenas o necessário para reduzir abandono.</p></div></div>
  <div class="grid-2">
    ${toggle({ label: 'E-mail', name: 'fEmail', checked: c.fields?.email !== false, hint: 'Necessário para enviar o acesso digital.' })}
    ${toggle({ label: 'WhatsApp', name: 'fPhone', checked: c.fields?.phone !== false, hint: 'Recomendado para enviar o comprovante.' })}
    ${toggle({ label: 'Endereço', name: 'fAddr', checked: !!c.fields?.address, hint: 'Obrigatório para produtos físicos.' })}
    ${toggle({ label: 'CPF/CNPJ', name: 'fDoc', checked: !!c.fields?.document })}
    ${toggle({ label: 'Observações', name: 'fNotes', checked: c.fields?.notes !== false })}
    ${toggle({ label: 'Exigir endereço', name: 'reqAddr', checked: !!c.requireAddress })}
  </div>
  <div class="grid-2 mt-16">
    <label class="field"><span class="field-label">Título da tela de sucesso</span><input data-bind="checkout.successTitle" value="${esc(c.successTitle || '')}"></label>
    <label class="field"><span class="field-label">Pedido mínimo (R$)</span><input data-bind="checkout.minOrder" data-type="money" value="${moneyInput(c.minOrder)}"><span class="hint">0 = sem mínimo.</span></label>
    <label class="field" style="grid-column:1/-1"><span class="field-label">Texto da tela de sucesso</span><textarea data-bind="checkout.successText" rows="2">${esc(c.successText || '')}</textarea></label>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('tag', 16)}</span><div><h3>Cupons</h3><p>Descontos aplicados no carrinho.</p></div><div class="right"><button class="btn btn-ghost btn-sm" data-add-coupon>${icon('plus', 13)} Novo cupom</button></div></div>
  ${(store.coupons || []).length ? `<div class="stack">
    ${store.coupons.map((cup, i) => `<div class="list-item" style="align-items:center">
      <input class="input" style="max-width:150px;text-transform:uppercase" data-bind="coupons.${i}.code" value="${esc(cup.code)}" placeholder="CUPOM">
      <div class="input-suffix" style="width:110px"><span class="sfx">%</span><input class="input" data-bind="coupons.${i}.percent" data-type="number" value="${Number(cup.percent) || 0}"></div>
      <span class="grow tiny dim">${cup.active !== false ? 'ativo' : 'inativo'}</span>
      <button class="icon-btn danger" data-del-coupon="${i}">${icon('trash', 14)}</button>
    </div>`).join('')}
  </div>` : `<p class="tiny dim">Nenhum cupom. Crie um para a primeira compra — costuma aumentar a conversão.</p>`}
</div>`;

  bindLive(pane, api);

  const bt = (sel, path) => {
    const el = pane.querySelector(sel);
    if (!el) return;
    el.addEventListener('change', () => {
      const next = clone(api.store);
      setPath(next, path, el.checked);
      if (path === 'checkout.fields.address' && el.checked) next.checkout.requireAddress = true;
      api.save(next);
    });
  };
  bt('input[name="shipOn"]', 'shipping.enabled');
  bt('input[name="fEmail"]', 'checkout.fields.email');
  bt('input[name="fPhone"]', 'checkout.fields.phone');
  bt('input[name="fAddr"]', 'checkout.fields.address');
  bt('input[name="fDoc"]', 'checkout.fields.document');
  bt('input[name="fNotes"]', 'checkout.fields.notes');
  bt('input[name="reqAddr"]', 'checkout.requireAddress');

  pane.querySelector('[data-add-coupon]')?.addEventListener('click', () => {
    const next = clone(api.store);
    next.coupons.push({ code: 'CUPOM' + Math.floor(Math.random() * 90 + 10), percent: 10, active: true });
    api.save(next, { rerender: true });
  });
  pane.querySelectorAll('[data-del-coupon]').forEach((b) => b.addEventListener('click', () => {
    const next = clone(api.store);
    next.coupons.splice(Number(b.getAttribute('data-del-coupon')), 1);
    api.save(next, { rerender: true });
  }));
}

/* ------------------------------------------------------------------ */
/* pedidos                                                             */
/* ------------------------------------------------------------------ */

export function renderOrders(pane, store, api) {
  const orders = listOrders(store.id);
  const pending = orders.filter((o) => o.status === 'pendente');
  const paid = orders.filter((o) => ['pago', 'enviado', 'entregue'].includes(o.status));

  pane.innerHTML = `
${pageHead('Pedidos', 'Confirme pagamentos, acompanhe entregas e fale com o cliente.',
    `<button class="btn btn-ghost btn-sm" data-refresh-orders>${icon('refresh', 14)} Atualizar</button>
     <button class="btn btn-ghost btn-sm" data-export-orders>${icon('download', 14)} Exportar CSV</button>`)}

<div class="stats-grid">
  <div class="stat"><div class="lbl">${icon('bag', 12)} Total</div><div class="val">${orders.length}</div><div class="sub">pedidos registrados</div></div>
  <div class="stat"><div class="lbl">${icon('alert', 12)} Aguardando</div><div class="val">${pending.length}</div><div class="sub">confirme o PIX</div></div>
  <div class="stat"><div class="lbl">${icon('check', 12)} Confirmados</div><div class="val">${paid.length}</div><div class="sub">pagos ou entregues</div></div>
  <div class="stat"><div class="lbl">${icon('receipt', 12)} Receita</div><div class="val">${brl(paid.reduce((s, o) => s + o.total, 0))}</div><div class="sub">pedidos confirmados</div></div>
</div>

<div class="card-block">
  <div class="block-head">
    <span class="bi">${icon('receipt', 16)}</span>
    <div><h3>Lista de pedidos</h3><p>Pedidos feitos na prévia aparecem aqui automaticamente.</p></div>
    <div class="right">
      <select id="orderFilter" class="input" style="width:150px;padding:7px 10px;font-size:12px">
        <option value="all">Todos os status</option>
        <option value="pendente">Aguardando</option>
        <option value="pago">Pagos</option>
        <option value="enviado">Enviados</option>
        <option value="entregue">Entregues</option>
        <option value="cancelado">Cancelados</option>
      </select>
    </div>
  </div>

  ${orders.length ? `<div style="overflow-x:auto"><table class="tbl" id="ordersTbl">
    <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th></th></tr></thead>
    <tbody>
      ${orders.map((o) => `<tr data-status="${esc(o.status)}">
        <td><b class="mono" style="font-size:11px">${esc(o.id)}</b><br><span class="tiny dim">${esc(fmtDateTime(o.createdAt))}</span></td>
        <td>${esc(o.customer?.name || '—')}<br><span class="tiny dim">${esc(o.customer?.phone || o.customer?.email || '')}</span></td>
        <td class="tiny dim">${(o.items || []).map((i) => `${i.qty}× ${esc(i.name)}`).join('<br>') || '—'}</td>
        <td class="num"><b>${brl(o.total)}</b></td>
        <td><select class="input" data-order-status="${esc(o.id)}" style="width:132px;padding:6px 8px;font-size:11.5px">
          ${['pendente', 'pago', 'enviado', 'entregue', 'cancelado'].map((st) => `<option value="${st}" ${o.status === st ? 'selected' : ''}>${statusLabel(st)}</option>`).join('')}
        </select></td>
        <td><div class="flex gap-8">
          <button class="icon-btn sm" data-view-order="${esc(o.id)}" title="Detalhes">${icon('eye', 14)}</button>
          ${o.customer?.phone ? `<a class="icon-btn sm" href="${esc(waLink(o.customer.phone, 'Olá ' + (o.customer.name || '') + '! Sobre o seu pedido ' + o.id + ' na ' + store.name + '.'))}" target="_blank" rel="noopener" title="WhatsApp">${icon('whatsapp', 14)}</a>` : ''}
          <button class="icon-btn sm danger" data-del-order="${esc(o.id)}" title="Excluir">${icon('trash', 14)}</button>
        </div></td>
      </tr>`).join('')}
    </tbody>
  </table></div>` : emptyState('receipt', 'Nenhum pedido ainda', 'Faça um pedido de teste abrindo a prévia ao lado: adicione ao carrinho, preencha seus dados e clique em “Já paguei”. Ele aparece aqui na hora.')}
</div>

<div class="alert alert-info">${icon('info', 16)}<span><b>Como funciona:</b> o pedido é salvo no navegador do cliente e enviado para o seu WhatsApp/webhook. Na prévia (mesma origem), ele também cai aqui. No site publicado em outro domínio, use o webhook para centralizar os pedidos.</span></div>`;

  pane.querySelector('#orderFilter')?.addEventListener('change', (ev) => {
    const v = ev.target.value;
    pane.querySelectorAll('#ordersTbl tbody tr').forEach((tr) => {
      tr.style.display = v === 'all' || tr.getAttribute('data-status') === v ? '' : 'none';
    });
  });

  pane.querySelectorAll('[data-order-status]').forEach((sel) => {
    sel.addEventListener('change', () => {
      updateOrder(sel.getAttribute('data-order-status'), { status: sel.value });
      toast('Status atualizado.');
      const tr = sel.closest('tr');
      if (tr) tr.setAttribute('data-status', sel.value);
      api.refresh();
    });
  });

  pane.querySelectorAll('[data-view-order]').forEach((b) => b.addEventListener('click', () => {
    const o = listOrders(store.id).find((x) => x.id === b.getAttribute('data-view-order'));
    if (!o) return;
    openOrderModal(o, api);
  }));

  pane.querySelectorAll('[data-del-order]').forEach((b) => b.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Excluir pedido', text: 'Remover este pedido do histórico?', confirmLabel: 'Excluir', danger: true });
    if (!ok) return;
    deleteOrder(b.getAttribute('data-del-order'));
    api.refresh();
    toast('Pedido removido.');
  }));

  pane.querySelector('[data-refresh-orders]')?.addEventListener('click', () => { api.refresh(); toast('Pedidos atualizados.'); });

  pane.querySelector('[data-export-orders]')?.addEventListener('click', () => {
    const rows = [['Pedido', 'Data', 'Cliente', 'Email', 'Telefone', 'Itens', 'Total', 'Status', 'Cupom']];
    listOrders(store.id).forEach((o) => rows.push([
      o.id, new Date(o.createdAt).toLocaleString('pt-BR'), o.customer.name, o.customer.email, o.customer.phone,
      o.items.map((i) => `${i.qty}x ${i.name}`).join(' | '), (o.total / 100).toFixed(2).replace('.', ','), o.status, o.coupon,
    ]));
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `pedidos-${store.slug}-${new Date().toISOString().slice(0, 10)}.csv`);
    toast('CSV exportado.');
  });
}

function statusLabel(st) {
  return { pendente: 'Aguardando', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' }[st] || st;
}

function openOrderModal(o, api) {
  const modal = openModal({
    title: `Pedido ${o.id}`,
    size: 'md',
    body: `
      <div class="row-between mb-12">
        <div><span class="tiny dim">Cliente</span><b style="display:block;font-size:14px">${esc(o.customer.name || '—')}</b></div>
        <div>${statusPill(o.status)}</div>
      </div>
      <div class="grid-2 mb-12">
        <div><span class="tiny dim">E-mail</span><p style="font-size:12.5px">${esc(o.customer.email || '—')}</p></div>
        <div><span class="tiny dim">WhatsApp</span><p style="font-size:12.5px">${esc(o.customer.phone || '—')}</p></div>
        <div><span class="tiny dim">Data</span><p style="font-size:12.5px">${esc(fmtDateTime(o.createdAt))}</p></div>
        <div><span class="tiny dim">Cupom</span><p style="font-size:12.5px">${esc(o.coupon || '—')}</p></div>
      </div>
      ${o.customer.address ? `<div class="mb-12"><span class="tiny dim">Endereço</span><p style="font-size:12.5px">${esc(o.customer.address)}</p></div>` : ''}
      <div class="divider"></div>
      <div class="stack">
        ${o.items.map((i) => `<div class="row-between"><span style="font-size:12.5px">${i.qty}× ${esc(i.name)}</span><b>${brl(i.price * i.qty)}</b></div>`).join('')}
        ${o.shipping ? `<div class="row-between"><span class="tiny dim">Frete</span><span>${brl(o.shipping)}</span></div>` : ''}
        ${o.discount ? `<div class="row-between"><span class="tiny dim">Desconto</span><span>− ${brl(o.discount)}</span></div>` : ''}
        <div class="row-between" style="border-top:1px solid var(--line);padding-top:10px"><b>Total</b><b style="font-size:16px">${brl(o.total)}</b></div>
      </div>
      ${o.pix ? `<div class="mt-16"><span class="tiny dim">PIX copia-e-cola</span><div class="code-block" style="white-space:pre-wrap;word-break:break-all;font-size:10px">${esc(o.pix)}</div><button class="btn btn-ghost btn-sm mt-8" data-copy-order-pix>${icon('copy', 13)} Copiar PIX</button></div>` : ''}
      ${o.customer.notes ? `<div class="alert alert-info mt-16">${icon('info', 15)}<span><b>Observação:</b> ${esc(o.customer.notes)}</span></div>` : ''}
    `,
    footer: `<button class="btn btn-ghost" data-modal-close>Fechar</button>${o.customer.phone ? `<a class="btn btn-primary" href="${esc(waLink(o.customer.phone, 'Olá ' + (o.customer.name || '') + '! Recebemos o seu pedido ' + o.id + '.'))}" target="_blank" rel="noopener">${icon('whatsapp', 15)} Falar no WhatsApp</a>` : ''}`,
  });
  modal.root.querySelector('[data-copy-order-pix]')?.addEventListener('click', () => copyWithToast(o.pix, 'PIX copiado'));
}

/* ------------------------------------------------------------------ */
/* integrações                                                         */
/* ------------------------------------------------------------------ */

export function renderIntegrations(pane, store, api) {
  const i = store.integrations || {};
  pane.innerHTML = `
${pageHead('Integrações', 'Analytics, pixels e código personalizado. Tudo opcional.')}

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('plug', 16)}</span><div><h3>Rastreamento</h3><p>Meça visitas e conversões (opcional).</p></div></div>
  <div class="grid-2">
    <label class="field"><span class="field-label">Google Analytics 4 · ID</span><input data-bind="integrations.ga4" value="${esc(i.ga4 || '')}" placeholder="G-XXXXXXXXXX"><span class="hint">Encontre em Administrador › Fluxos de dados.</span></label>
    <label class="field"><span class="field-label">Meta Pixel · ID</span><input data-bind="integrations.metaPixel" value="${esc(i.metaPixel || '')}" placeholder="123456789012345"><span class="hint">Gerenciador de Eventos do Facebook.</span></label>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('whatsapp', 16)}</span><div><h3>WhatsApp e atendimento</h3><p>O botão de dúvidas usa o número do contato.</p></div></div>
  <div class="grid-2">
    <label class="field"><span class="field-label">WhatsApp</span><input data-bind="contact.whatsapp" value="${esc(store.contact?.whatsapp || '')}" placeholder="11999999999"><span class="hint">Só números com DDD (55 é adicionado automaticamente).</span></label>
    <label class="field"><span class="field-label">Instagram</span><input data-bind="contact.instagram" value="${esc(store.contact?.instagram || '')}" placeholder="sualoja"></label>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('code', 16)}</span><div><h3>Código personalizado</h3><p>Para quem quer ir além. Use com cuidado.</p></div></div>
  <label class="field"><span class="field-label">Head (HTML)</span><textarea data-bind="integrations.customHead" rows="3" placeholder="<meta> ou script no &lt;head&gt;">${esc(i.customHead || '')}</textarea><span class="hint">Injetado antes do fechamento de &lt;head&gt;.</span></label>
  <label class="field mt-12"><span class="field-label">CSS extra</span><textarea data-bind="integrations.customCss" rows="5" style="font-family:ui-monospace,monospace;font-size:11.5px" placeholder=".hero { background: #000; }">${esc(i.customCss || '')}</textarea></label>
  <label class="field mt-12"><span class="field-label">JavaScript extra</span><textarea data-bind="integrations.customJs" rows="5" style="font-family:ui-monospace,monospace;font-size:11.5px" placeholder="console.log('minha loja');">${esc(i.customJs || '')}</textarea></label>
  ${toggle({ label: 'Ocultar selo “OpenCommerce” no rodapé', name: 'hideBranding', checked: !!i.hideBranding, hint: 'Use se for entregar a loja como projeto próprio.' })}
</div>

<div class="alert alert-warn">${icon('alert', 16)}<span>Código personalizado roda no navegador do visitante. Só cole scripts em que você confia. Erros de JavaScript podem quebrar o carrinho.</span></div>`;

  bindLive(pane, api);
  const hb = pane.querySelector('input[name="hideBranding"]');
  hb?.addEventListener('change', () => {
    const next = clone(api.store);
    next.integrations.hideBranding = hb.checked;
    api.save(next);
  });
}

/* ------------------------------------------------------------------ */
/* publicar                                                            */
/* ------------------------------------------------------------------ */

export function renderPublish(pane, store, api) {
  const zipName = `${store.slug || 'loja'}.zip`;
  const checks = [
    { done: !!store.name, label: 'Nome da loja definido' },
    { done: (store.products || []).length > 0, label: 'Pelo menos 1 produto' },
    { done: !!store.payment?.pixKey, label: 'Chave PIX configurada' },
    { done: !!store.contact?.whatsapp, label: 'WhatsApp de atendimento' },
    { done: !!store.seo?.description, label: 'Descrição para o Google' },
  ];
  const ready = checks.every((c) => c.done);

  pane.innerHTML = `
${pageHead('Publicar', 'Sua loja é um arquivo estático. Baixe, suba no GitHub e ative o Pages.',
    `<button class="btn btn-ghost btn-sm" data-preview-publish>${icon('external', 14)} Ver loja</button>
     <button class="btn btn-primary" data-download-zip>${icon('download', 15)} Baixar ZIP</button>`)}

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('check', 16)}</span><div><h3>Pronto para publicar?</h3><p>${ready ? 'Tudo certo. Você pode subir agora.' : 'Resolva os itens abaixo para evitar problemas.'}</p></div><div class="right">${ready ? badge('tudo pronto', 'green') : badge('revisar', 'amber')}</div></div>
  <ul class="check-list">
    ${checks.map((c) => `<li>${icon(c.done ? 'check' : 'x', 14)}<span style="color:${c.done ? '' : '#f6d78a'}">${esc(c.label)}</span></li>`).join('')}
  </ul>
  <div class="grid-3 mt-16">
    <label class="field"><span class="field-label">Slug / nome da pasta</span><input data-bind="slug" value="${esc(store.slug)}" placeholder="minha-loja"><span class="hint">Vira parte da URL.</span></label>
    <label class="field"><span class="field-label">URL publicada (opcional)</span><input data-bind="published.url" value="${esc(store.published?.url || '')}" placeholder="https://usuario.github.io/loja"></label>
    <div class="field"><span class="field-label">Arquivo</span><div class="input" style="display:flex;align-items:center;gap:6px;color:var(--muted)">${icon('box', 14)} ${esc(zipName)}</div></div>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('upload', 16)}</span><div><h3>Exportar</h3><p>ZIP com index.html, .nojekyll, README e produtos.json.</p></div></div>
  <div class="grid-2">
    <button class="btn btn-primary btn-lg" data-download-zip>${icon('download', 17)} Baixar loja completa (ZIP)</button>
    <button class="btn btn-ghost btn-lg" data-download-html>${icon('code', 17)} Baixar só o index.html</button>
  </div>
  <div class="alert alert-info mt-16">${icon('info', 16)}<span>O ZIP é autocontido: imagens enviadas, produtos, textos e configuração PIX já vão embutidos. Funciona offline depois de carregado.</span></div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('github', 16)}</span><div><h3>Publicar no GitHub Pages</h3><p>Grátis, com HTTPS e domínio próprio.</p></div></div>
  <div class="publish-list">
    <div class="publish-step"><span class="n">1</span><div><b>Crie um repositório</b><p>No GitHub, clique em <b>New repository</b>, dê um nome (ex.: <code>${esc(store.slug)}</code>) e deixe público.</p></div></div>
    <div class="publish-step"><span class="n">2</span><div><b>Envie os arquivos</b><p>Descompacte o ZIP e envie <code>index.html</code> e <code>.nojekyll</code> para a raiz do repositório. Pelo site do GitHub, use <b>Add file → Upload files</b>.</p>
      <div class="code-block mt-8">git init
git add .
git commit -m "minha loja"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/${esc(store.slug)}.git
git push -u origin main</div>
    </div></div>
    <div class="publish-step"><span class="n">3</span><div><b>Ative o Pages</b><p>Vá em <b>Settings → Pages</b>. Em <i>Source</i>, escolha <b>Deploy from a branch</b>, branch <code>main</code> e pasta <code>/ (root)</code>. Salve e aguarde 1–2 minutos.</p></div></div>
    <div class="publish-step"><span class="n">4</span><div><b>Divulgue</b><p>Sua loja estará em <code>https://SEU-USUARIO.github.io/${esc(store.slug)}/</code>. Cole essa URL no campo acima e clique em “Salvar URL”.</p></div></div>
  </div>
  <div class="form-actions">
    <button class="btn btn-ghost btn-sm" data-save-url>${icon('save', 14)} Salvar URL publicada</button>
    <a class="btn btn-ghost btn-sm" href="https://pages.github.com/" target="_blank" rel="noopener">${icon('external', 14)} Documentação do Pages</a>
  </div>
</div>

<div class="card-block">
  <div class="block-head"><span class="bi">${icon('link', 16)}</span><div><h3>Domínio próprio</h3><p>Opcional, mas passa mais confiança.</p></div></div>
  <div class="publish-list">
    <div class="publish-step"><span class="n">1</span><div><b>Compre o domínio</b><p>Registre em qualquer registrador (Registro.br, Namecheap, Cloudflare).</p></div></div>
    <div class="publish-step"><span class="n">2</span><div><b>Aponte o DNS</b><p>Crie um registro <code>CNAME</code> para <code>www</code> apontando para <code>SEU-USUARIO.github.io</code> e quatro registros <code>A</code> para o apex conforme a documentação do GitHub.</p></div></div>
    <div class="publish-step"><span class="n">3</span><div><b>Configure no repositório</b><p>Em <b>Settings → Pages → Custom domain</b>, informe o domínio e marque <b>Enforce HTTPS</b>.</p></div></div>
  </div>
</div>`;

  bindLive(pane, api);

  pane.querySelectorAll('[data-download-zip]').forEach((b) => b.addEventListener('click', () => exportStoreZip(api.store)));
  pane.querySelector('[data-download-html]')?.addEventListener('click', async () => {
    try {
      const html = await buildStoreHTML(api.store, { preview: false });
      downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${api.store.slug || 'loja'}.html`);
      toast('index.html gerado.');
    } catch (err) { toastError(err.message); }
  });
  pane.querySelector('[data-preview-publish]')?.addEventListener('click', async () => {
    const html = await buildStoreHTML(api.store, { preview: false });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
  pane.querySelector('[data-save-url]')?.addEventListener('click', () => {
    const next = clone(api.store);
    next.published = { url: next.published?.url || '', at: new Date().toISOString() };
    api.save(next);
    toast('URL salva.');
  });
}

/* OpenCommerce · onboarding, lista de lojas e configurações globais */

import { icon, toast, toastError, spinner, openModal, confirmDialog, field, badge } from './ui.js';
import { esc, slugify, bytes, downloadJson, readJsonFile, downloadBlob, fmtDate } from './util.js';
import { BRAND } from './config.js';
import { NICHE_PRESETS, defaultStore } from './schema.js';
import { createFromBrief, applyPatch } from './builder.js';
import { hasAI, getAIConfig, saveAIConfig, PROVIDERS, providerInfo, testAI, listModels } from './ai.js';
import {
  listStores, getStore, saveStore, deleteStore, duplicateStore, ensureDemoStore,
  exportBackup, importBackup, storageUsage,
} from './db.js';
import { createZip } from './zip.js';
import { buildStoreHTML } from './storefront.js';

/* ---------------- shell simples ---------------- */

function simpleHead(active = '') {
  return `<header class="site-head">
    <div class="site-head-in">
      <a class="logo" href="#/"><img class="logo-mark" src="assets/img/logo-mark.png" alt=""><span>${BRAND.name}</span></a>
      <nav class="site-nav">
        <a href="#/lojas" class="${active === 'lojas' ? 'on' : ''}">Minhas lojas</a>
        <a href="#/nova">Nova loja</a>
        <a href="#/config" class="${active === 'config' ? 'on' : ''}">Configurações</a>
      </nav>
      <div class="site-actions">
        <a class="btn btn-primary btn-sm" href="#/nova">${icon('plus', 14)} Nova loja</a>
      </div>
    </div>
  </header>`;
}

/* ---------------- wizard ---------------- */

export function renderWizard(root) {
  const aiReady = hasAI();
  const cfg = getAIConfig();
  let niche = '';

  root.innerHTML = `
${simpleHead()}
<main class="wrap-md">
  <div class="wizard">
    <div class="wizard-head">
      <span class="kicker">Nova loja</span>
      <h1>Conte o que você vende.<br>A IA monta o resto.</h1>
      <p>Quanto mais detalhes, melhor o resultado. Você pode ajustar tudo depois.</p>
    </div>

    <div class="wizard-card">
      <h2>1. Qual é o seu negócio?</h2>
      <p class="sub">Escolha o nicho para direcionar o modelo.</p>
      <div class="niche-grid" id="nicheGrid">
        ${NICHE_PRESETS.map((n) => `<button type="button" class="niche-card ${n.id === niche ? 'on' : ''}" data-niche="${n.id}"><b>${n.label}</b><span>${n.hint || 'personalizado'}</span></button>`).join('')}
      </div>

      <div class="grid-2 mt-24">
        <label class="field">
          <span class="field-label">Nome da loja</span>
          <input id="wName" placeholder="Ex.: MONO Studio" autocomplete="organization">
          <span class="hint">Deixe vazio para a IA sugerir.</span>
        </label>
        <label class="field">
          <span class="field-label">Tom de voz</span>
          <select id="wTone">
            <option value="profissional, direto e confiável">Profissional e direto</option>
            <option value="próximo, caloroso e humano">Próximo e humano</option>
            <option value="premium, sofisticado e minimalista">Premium e minimalista</option>
            <option value="jovem, descontraído e criativo">Jovem e criativo</option>
            <option value="técnico, especialista e seguro">Técnico e especialista</option>
          </select>
        </label>
      </div>

      <label class="field mt-12">
        <span class="field-label">2. Descreva a loja e o que você vende <b>*</b></span>
        <textarea id="wBrief" class="prompt-area" placeholder="Ex.: Vendo kits de identidade visual e presets para designers freelancers. Quero um visual escuro e premium, com entrega imediata por e-mail, 6 produtos entre R$ 39 e R$ 197 e um cupom de 10% na primeira compra."></textarea>
        <span class="hint">Fale de produtos, público, diferenciais, faixa de preço e estilo visual.</span>
      </label>

      <div class="mt-16">
        <div class="list-item" style="align-items:center">
          <span class="bi" style="width:30px;height:30px;border-radius:8px;background:${aiReady ? 'rgba(52,211,153,.12)' : 'rgba(251,191,36,.1)'};color:${aiReady ? '#6ee7b7' : '#fcd34d'};display:grid;place-items:center">${icon(aiReady ? 'sparkles' : 'key', 16)}</span>
          <div class="grow">
            <b>${aiReady ? 'IA conectada' : 'IA não configurada'}</b>
            <p>${aiReady ? `${esc(providerInfo(cfg.provider).label)} · ${esc(cfg.model)} — pronto para gerar a loja completa.` : 'Sem chave, usamos o gerador local de modelos. Você pode conectar sua IA depois em Configurações.'}</p>
          </div>
          <a class="btn btn-ghost btn-sm" href="#/config">${aiReady ? 'Trocar' : 'Conectar IA'}</a>
        </div>
      </div>

      <div class="form-actions" style="justify-content:space-between;align-items:center">
        <a class="btn btn-link" href="#/lojas">${icon('arrowLeft', 14)} Já tenho lojas</a>
        <button class="btn btn-primary btn-lg" id="wCreate">${icon('wand', 17)} ${aiReady ? 'Gerar loja com IA' : 'Gerar loja'}</button>
      </div>
      <p class="tiny dim center mt-12">Nada é enviado para servidores nossos. A geração roda no seu navegador com a sua chave.</p>
    </div>
  </div>
</main>`;

  root.querySelectorAll('[data-niche]').forEach((btn) => {
    btn.addEventListener('click', () => {
      niche = btn.getAttribute('data-niche');
      root.querySelectorAll('[data-niche]').forEach((b) => b.classList.toggle('on', b === btn));
    });
  });

  const createBtn = root.querySelector('#wCreate');
  createBtn.addEventListener('click', async () => {
    const brief = root.querySelector('#wBrief').value.trim();
    const name = root.querySelector('#wName').value.trim();
    const tone = root.querySelector('#wTone').value;
    if (brief.length < 8) {
      toast('Descreva um pouco mais o seu negócio.', 'error');
      root.querySelector('#wBrief').focus();
      return;
    }
    createBtn.disabled = true;
    const overlay = showProgress(aiReady);
    try {
      const result = await createFromBrief(brief, { niche, tone, name, audience: '', theme: '' });
      let store = defaultStore({});
      store = applyPatch(store, result.store);
      store.id = 'store_' + Math.random().toString(36).slice(2, 10);
      store.slug = slugify(name || store.name);
      store.name = (name || store.name).slice(0, 60);
      if (!store.payment.pixKey) store.payment.pixKey = '';
      const saved = saveStore(store);
      overlay.close();
      toast(result.usedAI ? 'Loja criada com IA!' : 'Loja criada! Personalize à vontade.');
      location.hash = `#/loja/${saved.id}/ia`;
    } catch (err) {
      overlay.close();
      createBtn.disabled = false;
      toastError(err.message || 'Não foi possível criar a loja.');
    }
  });
}

function showProgress(ai) {
  const steps = ai
    ? ['Analisando o briefing…', 'Definindo posicionamento e tom…', 'Escrevendo textos e ofertas…', 'Criando produtos e preços…', 'Escolhendo paleta e tipografia…', 'Montando a vitrine…']
    : ['Interpretando o briefing…', 'Selecionando o modelo ideal…', 'Criando produtos e textos base…', 'Montando a vitrine…'];
  const modal = openModal({
    title: 'Criando sua loja',
    size: 'sm',
    body: `<div class="center" style="padding:14px 0">
      <div class="ai-avatar" style="margin:0 auto 16px;width:46px;height:46px;border-radius:14px">${icon('sparkles', 22)}</div>
      <p id="progStep" style="font-size:13px;color:var(--muted);min-height:22px">${steps[0]}</p>
      <div style="height:4px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-top:18px"><div id="progBar" style="height:100%;width:8%;background:linear-gradient(90deg,var(--brand),#ff8b4d);border-radius:99px;transition:width .6s ease"></div></div>
      <p class="tiny dim mt-12">Isso pode levar de 10 a 40 segundos.</p>
    </div>`,
    closeOnBackdrop: false,
  });
  let i = 0;
  const timer = setInterval(() => {
    i = Math.min(i + 1, steps.length - 1);
    const el = modal.root.querySelector('#progStep');
    const bar = modal.root.querySelector('#progBar');
    if (el) el.textContent = steps[i];
    if (bar) bar.style.width = Math.min(92, 8 + ((i + 1) / steps.length) * 84) + '%';
  }, 1700);
  return {
    close() {
      clearInterval(timer);
      modal.close();
    },
  };
}

/* ---------------- lista de lojas ---------------- */

export function renderStores(root) {
  const stores = listStores();
  root.innerHTML = `
${simpleHead('lojas')}
<main class="wrap-xl" style="padding:34px 0 70px">
  <div class="page-head">
    <div>
      <h1>Minhas lojas</h1>
      <p>${stores.length ? `${stores.length} projeto${stores.length > 1 ? 's' : ''} salvo${stores.length > 1 ? 's' : ''} neste navegador.` : 'Nenhuma loja ainda. Crie a primeira ou explore a demonstração.'}</p>
    </div>
    <div class="actions">
      ${stores.length ? `<button class="btn btn-ghost" data-demo>${icon('play', 15)} Ver demonstração</button>` : `<button class="btn btn-ghost" data-demo>${icon('play', 15)} Abrir demonstração</button>`}
      <a class="btn btn-primary" href="#/nova">${icon('plus', 15)} Nova loja</a>
    </div>
  </div>

  ${stores.length ? `<div class="stores-grid">${stores.map(storeCard).join('')}</div>` : `
    <div class="empty-state" style="padding:70px 20px">
      <div class="empty-ic">${icon('store', 22)}</div>
      <h3>Comece pela sua primeira loja</h3>
      <p>Descreva o negócio em uma frase e a IA cria catálogo, textos e visual. Sem cadastro, sem mensalidade.</p>
      <div class="flex gap-8" style="justify-content:center;flex-wrap:wrap">
        <a class="btn btn-primary" href="#/nova">${icon('wand', 15)} Criar com IA</a>
        <button class="btn btn-ghost" data-demo>${icon('play', 15)} Ver demonstração</button>
      </div>
    </div>`}

  <div class="card-block mt-24">
    <div class="block-head">
      <span class="bi">${icon('upload', 16)}</span>
      <div><h3>Backup e restauração</h3><p>Leve seus projetos de um navegador para outro.</p></div>
      <div class="right">
        <button class="btn btn-ghost btn-sm" data-backup>${icon('download', 14)} Exportar</button>
        <button class="btn btn-ghost btn-sm" data-restore>${icon('upload', 14)} Importar</button>
        <input type="file" id="restoreFile" accept="application/json" hidden>
      </div>
    </div>
    <p class="tiny dim">Os dados ficam no seu navegador. Limpar o cache ou usar outro computador sem backup significa perder os projetos. Espaço usado: <b>${bytes(storageUsage())}</b>.</p>
  </div>
</main>`;

  root.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-tool]')) return;
      location.hash = `#/loja/${el.getAttribute('data-open')}`;
    });
  });

  root.querySelectorAll('[data-tool]').forEach((btn) => {
    btn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const id = btn.getAttribute('data-id');
      const tool = btn.getAttribute('data-tool');
      const store = getStore(id);
      if (!store) return;
      if (tool === 'duplicate') {
        const copy = duplicateStore(id);
        toast('Loja duplicada.');
        location.hash = `#/loja/${copy.id}`;
      } else if (tool === 'zip') {
        await exportStoreZip(store);
      } else if (tool === 'delete') {
        const ok = await confirmDialog({ title: 'Excluir loja', text: `Tem certeza que deseja excluir <b>${esc(store.name)}</b>? Os pedidos vinculados também serão removidos. Essa ação não pode ser desfeita.`, confirmLabel: 'Excluir', danger: true });
        if (ok) { deleteStore(id); toast('Loja excluída.'); renderStores(root); }
      }
    });
  });

  const demoBtn = root.querySelector('[data-demo]');
  if (demoBtn) demoBtn.addEventListener('click', () => {
    const demo = ensureDemoStore();
    toast('Demonstração criada. Explore à vontade!', 'info');
    location.hash = `#/loja/${demo.id}`;
  });

  root.querySelector('[data-backup]')?.addEventListener('click', () => {
    downloadJson(exportBackup(), `opencommerce-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast('Backup exportado.');
  });

  const restoreInput = root.querySelector('#restoreFile');
  root.querySelector('[data-restore]')?.addEventListener('click', () => restoreInput.click());
  restoreInput?.addEventListener('change', async () => {
    const file = restoreInput.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      const total = importBackup(data, { merge: true });
      toast(`Backup importado: ${total} loja(s).`);
      renderStores(root);
    } catch (err) {
      toastError(err.message || 'Arquivo inválido.');
    }
    restoreInput.value = '';
  });
}

function storeCard(s) {
  const products = s.products?.length || 0;
  return `<article class="store-card" data-open="${esc(s.id)}">
    <div class="store-cover">
      ${s.hero?.image ? `<img src="${esc(s.hero.image)}" alt="">` : ''}
      <div class="mini-logo"><i>${esc((s.logoText || s.name).slice(0, 2).toUpperCase())}</i> ${esc(s.name)}</div>
    </div>
    <div class="store-body">
      <div class="top">
        <div>
          <h3>${esc(s.name)}</h3>
          <span class="meta">${products} produto${products === 1 ? '' : 's'} · ${esc(s.niche || 'loja')}</span>
        </div>
        ${s.payment?.pixKey ? badge('PIX ok', 'green') : badge('sem PIX', 'amber')}
      </div>
      <span class="meta">Editada ${esc(fmtDate(s.updatedAt))}</span>
      <div class="foot">
        <a class="btn btn-primary btn-sm" href="#/loja/${esc(s.id)}">Abrir painel ${icon('chevron', 13)}</a>
        <button class="icon-btn" data-tool="duplicate" data-id="${esc(s.id)}" title="Duplicar">${icon('copy', 15)}</button>
        <button class="icon-btn" data-tool="zip" data-id="${esc(s.id)}" title="Baixar loja">${icon('download', 15)}</button>
        <button class="icon-btn danger" data-tool="delete" data-id="${esc(s.id)}" title="Excluir">${icon('trash', 15)}</button>
      </div>
    </div>
  </article>`;
}

export async function exportStoreZip(store) {
  try {
    toast('Preparando arquivos…', 'info');
    const html = await buildStoreHTML(store, { preview: false });
    const readme = buildExportReadme(store);
    const blob = createZip([
      { name: 'index.html', data: html },
      { name: '.nojekyll', data: '' },
      { name: 'README.md', data: readme },
      { name: 'produtos.json', data: JSON.stringify(store.products, null, 2) },
    ]);
    downloadBlob(blob, `${store.slug || 'loja'}.zip`);
    toast('ZIP gerado! Siga o README para publicar.');
  } catch (err) {
    toastError(err.message || 'Falha ao gerar o ZIP.');
  }
}

function buildExportReadme(store) {
  return `# ${store.name}

Loja gerada com [OpenCommerce](${BRAND.github}).

## Como publicar no GitHub Pages (grátis)

1. Crie um repositório novo no GitHub (ex.: \`${store.slug}\`).
2. Envie o conteúdo deste ZIP (o \`index.html\` deve ficar na raiz).
3. No repositório, vá em **Settings → Pages**.
4. Em *Source*, escolha **Deploy from a branch** → branch \`main\` → pasta \`/ (root)\` → **Save**.
5. Aguarde 1 a 2 minutos. O endereço será:
   \`https://SEU-USUARIO.github.io/${store.slug}/\`

O arquivo \`.nojekyll\` já está incluído (ele evita que o GitHub ignore arquivos).

## Domínio próprio

Em **Settings → Pages → Custom domain**, informe o seu domínio e crie o registro DNS indicado pelo GitHub.

## Pagamento

- Chave PIX configurada: ${store.payment?.pixKey ? 'sim' : 'NÃO — configure no painel do OpenCommerce antes de divulgar'}
- Recebedor: ${store.payment?.holderName || '(não informado)'}
- Cidade: ${store.payment?.city || '(não informada)'}

O checkout gera o QR Code e o código copia-e-cola no navegador do cliente.
A confirmação é manual, a menos que você configure um gateway no painel.

## Suporte

${BRAND.github}
`;
}

/* ---------------- configurações globais ---------------- */

export function renderSettings(root) {
  const cfg = getAIConfig();
  const info = providerInfo(cfg.provider);
  const key = cfg.keys?.[cfg.provider] || '';
  const stores = listStores();

  root.innerHTML = `
${simpleHead('config')}
<main class="wrap-md" style="padding:34px 0 70px">
  <div class="page-head">
    <div><h1>Configurações</h1><p>Conecte sua IA, faça backup e ajuste o OpenCommerce.</p></div>
    <div class="actions"><a class="btn btn-ghost" href="#/lojas">${icon('arrowLeft', 15)} Minhas lojas</a></div>
  </div>

  <div class="card-block">
    <div class="block-head">
      <span class="bi">${icon('sparkles', 16)}</span>
      <div><h3>Inteligência artificial</h3><p>Sua chave fica apenas neste navegador. Nada passa por nós.</p></div>
      <div class="right">${hasAI() ? badge('conectada', 'green') : badge('não configurada', 'amber')}</div>
    </div>

    <div class="grid-2">
      <label class="field">
        <span class="field-label">Provedor</span>
        <select id="aiProvider">
          ${Object.entries(PROVIDERS).map(([id, p]) => `<option value="${id}" ${id === cfg.provider ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">Modelo</span>
        <input id="aiModel" list="modelList" value="${esc(cfg.model)}" placeholder="Escolha ou digite">
        <datalist id="modelList">${(info.models || []).map((m) => `<option value="${esc(m)}">`).join('')}</datalist>
        <span class="hint">Modelos menores são mais baratos e suficientes para gerar a loja.</span>
      </label>
    </div>

    <label class="field mt-12">
      <span class="field-label">Chave de API ${cfg.provider === 'ollama' ? '(opcional)' : ''}</span>
      <div class="input-group">
        <input id="aiKey" type="password" value="${esc(key)}" placeholder="${esc(info.keyHint || 'sua chave')}" autocomplete="off" spellcheck="false">
        <button class="btn btn-ghost" id="toggleKey" type="button">${icon('eye', 15)}</button>
      </div>
      <span class="hint">${info.docs ? `Obtenha sua chave em <a href="${info.docs}" target="_blank" rel="noopener">${esc(new URL(info.docs).hostname)}</a>. ` : ''}${esc(info.note || '')}</span>
    </label>

    <div id="customBaseWrap" class="${cfg.provider === 'custom' ? '' : 'hidden'} mt-12">
      <label class="field">
        <span class="field-label">URL base da API (compatível com OpenAI)</span>
        <input id="aiBase" value="${esc(cfg.baseUrl || '')}" placeholder="https://sua-api.com/v1">
        <span class="hint">Precisa expor <code>/chat/completions</code>. Ex.: proxy próprio, LM Studio ou OpenRouter.</span>
      </label>
    </div>

    <div class="grid-2 mt-12">
      <label class="field">
        <span class="field-label">Criatividade (temperatura): <b id="tempVal">${Number(cfg.temperature).toFixed(2)}</b></span>
        <input type="range" id="aiTemp" min="0" max="1" step="0.05" value="${Number(cfg.temperature)}" style="padding:0;border:0;background:none">
        <span class="hint">0 = mais previsível · 1 = mais criativo</span>
      </label>
      <div class="field">
        <span class="field-label">Ações</span>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" id="testAI">${icon('plug', 14)} Testar</button>
          <button class="btn btn-ghost btn-sm" id="fetchModels">${icon('refresh', 14)} Buscar modelos</button>
        </div>
        <span class="hint" id="aiStatus">${hasAI() ? 'Pronto para usar.' : 'Configure a chave e clique em testar.'}</span>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" id="saveAI">${icon('save', 15)} Salvar configuração</button>
    </div>

    <div class="alert alert-info mt-16">${icon('info', 16)}<span><b>Chamadas diretas do navegador:</b> OpenAI, Gemini, OpenRouter, Groq, DeepSeek e Claude aceitam esse tipo de chamada. Se algum provedor bloquear por CORS, use um proxy (Cloudflare Worker/Vercel) e selecione “API compatível”.</span></div>
  </div>

  <div class="card-block">
    <div class="block-head">
      <span class="bi">${icon('lock', 16)}</span>
      <div><h3>Privacidade e dados</h3><p>O OpenCommerce não tem servidor. Tudo fica no seu navegador.</p></div>
    </div>
    <div class="row-between" style="padding:8px 0">
      <div><b style="font-size:12.5px">Projetos salvos</b><p class="tiny dim">${stores.length} loja(s) · ${bytes(storageUsage())} usados</p></div>
      <div class="flex gap-8">
        <button class="btn btn-ghost btn-sm" id="backupAll">${icon('download', 14)} Backup</button>
        <button class="btn btn-ghost btn-sm" id="restoreAll">${icon('upload', 14)} Restaurar</button>
        <input type="file" id="restoreAllFile" accept="application/json" hidden>
      </div>
    </div>
    <div class="divider"></div>
    <div class="row-between" style="padding:8px 0">
      <div><b style="font-size:12.5px">Limpar dados locais</b><p class="tiny dim">Remove lojas, pedidos e conversas deste navegador.</p></div>
      <button class="btn btn-danger btn-sm" id="wipe">${icon('trash', 14)} Limpar tudo</button>
    </div>
  </div>

  <div class="card-block">
    <div class="block-head">
      <span class="bi">${icon('github', 16)}</span>
      <div><h3>Publicação e marca</h3><p>Personalize o nome, os links e o repositório em <code>assets/js/config.js</code>.</p></div>
    </div>
    <ul class="check-list">
      <li>${icon('check', 14)} GitHub Pages: suba os arquivos e ative em Settings → Pages.</li>
      <li>${icon('check', 14)} Cada loja é exportada como um ZIP independente.</li>
      <li>${icon('check', 14)} Você pode hospedar o painel e as lojas no mesmo repositório.</li>
    </ul>
    <div class="form-actions">
      <a class="btn btn-ghost btn-sm" href="${BRAND.github}" target="_blank" rel="noopener">${icon('external', 14)} Abrir repositório</a>
    </div>
  </div>
</main>`;

  const providerSel = root.querySelector('#aiProvider');
  const modelInput = root.querySelector('#aiModel');
  const keyInput = root.querySelector('#aiKey');
  const tempInput = root.querySelector('#aiTemp');
  const baseWrap = root.querySelector('#customBaseWrap');
  const baseInput = root.querySelector('#aiBase');
  const status = root.querySelector('#aiStatus');

  const persist = () => {
    saveAIConfig({
      provider: providerSel.value,
      model: modelInput.value.trim(),
      baseUrl: baseInput.value.trim(),
      temperature: Number(tempInput.value),
      keys: { [providerSel.value]: keyInput.value.trim() },
    });
  };

  providerSel.addEventListener('change', () => {
    const p = providerInfo(providerSel.value);
    const current = getAIConfig();
    const saved = current.keys?.[providerSel.value] || '';
    keyInput.value = saved;
    keyInput.placeholder = p.keyHint || 'sua chave';
    baseWrap.classList.toggle('hidden', providerSel.value !== 'custom');
    baseInput.value = providerSel.value === 'custom' ? (current.baseUrl || '') : '';
    modelInput.value = p.models[0] || '';
    root.querySelector('#modelList').innerHTML = (p.models || []).map((m) => `<option value="${esc(m)}">`).join('');
    root.querySelector('#modelList').closest?.('.field');
    persist();
    status.textContent = 'Provedor alterado. Clique em testar.';
  });

  tempInput.addEventListener('input', () => { root.querySelector('#tempVal').textContent = Number(tempInput.value).toFixed(2); });
  root.querySelector('#toggleKey').addEventListener('click', () => {
    keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
  });

  root.querySelector('#saveAI').addEventListener('click', () => {
    persist();
    toast('Configuração salva.');
    status.textContent = 'Configuração salva.';
  });

  root.querySelector('#testAI').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    persist();
    btn.disabled = true;
    status.innerHTML = spinner('Testando…');
    try {
      const reply = await testAI(getAIConfig());
      status.innerHTML = `<span style="color:var(--green)">Conexão ok — resposta: “${esc(reply.slice(0, 40))}”</span>`;
      toast('IA conectada com sucesso!');
    } catch (err) {
      status.innerHTML = `<span style="color:var(--red)">${esc(err.message)}</span>`;
      toastError(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  root.querySelector('#fetchModels').addEventListener('click', async (ev) => {
    const btn = ev.currentTarget;
    persist();
    btn.disabled = true;
    status.innerHTML = spinner('Buscando modelos…');
    try {
      const models = await listModels(getAIConfig());
      const list = root.querySelector('#modelList');
      list.innerHTML = models.map((m) => `<option value="${esc(m)}">`).join('');
      status.innerHTML = `${models.length} modelos encontrados. Digite ou selecione acima.`;
      toast('Lista de modelos atualizada.');
    } catch (err) {
      status.innerHTML = `<span style="color:var(--red)">${esc(err.message)}</span>`;
    } finally {
      btn.disabled = false;
    }
  });

  root.querySelector('#backupAll').addEventListener('click', () => {
    downloadJson(exportBackup(), `opencommerce-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast('Backup exportado.');
  });

  const restoreFile = root.querySelector('#restoreAllFile');
  root.querySelector('#restoreAll').addEventListener('click', () => restoreFile.click());
  restoreFile.addEventListener('change', async () => {
    const file = restoreFile.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      const total = importBackup(data, { merge: true });
      toast(`${total} loja(s) restaurada(s).`);
      renderSettings(root);
    } catch (err) {
      toastError(err.message || 'Backup inválido.');
    }
    restoreFile.value = '';
  });

  root.querySelector('#wipe').addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Limpar tudo', text: 'Isso remove <b>todas as lojas, pedidos e conversas</b> deste navegador. Exporte um backup antes se precisar. Continuar?', confirmLabel: 'Limpar tudo', danger: true });
    if (!ok) return;
    Object.keys(localStorage).filter((k) => k.startsWith('oc_') && k !== 'oc_ai_config_v1').forEach((k) => localStorage.removeItem(k));
    toast('Dados removidos.');
    location.hash = '#/';
  });
}

/* OpenCommerce · landing page */

import { icon } from './ui.js';
import { BRAND, PLANS } from './config.js';

const feature = (ic, title, text, cls = 'span-2') =>
  `<article class="bento-card ${cls}"><div class="bi">${icon(ic, 19)}</div><h3>${title}</h3><p>${text}</p></article>`;

export function renderLanding(root) {
  root.innerHTML = `
<header class="site-head">
  <div class="site-head-in">
    <a class="logo" href="#/"><img class="logo-mark" src="assets/img/logo-mark.png" alt=""><span>${BRAND.name}</span></a>
    <nav class="site-nav">
      <a href="#recursos">Recursos</a>
      <a href="#como-funciona">Como funciona</a>
      <a href="#precos">Preços</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div class="site-actions">
      <a class="btn btn-ghost btn-sm" href="#/lojas">Minhas lojas</a>
      <a class="btn btn-primary btn-sm" href="#/nova">${icon('sparkles', 15)} Criar loja grátis</a>
      <button class="icon-btn menu-btn" data-menu aria-label="Menu">${icon('menu', 18)}</button>
    </div>
  </div>
</header>

<main>
  <section class="hero-land">
    <div class="wrap-xl hero-land-in">
      <div>
        <span class="badge-pill"><b>NOVO</b> IA que monta a loja inteira por você</span>
        <h1>Sua loja no ar<br>em minutos. <span class="grad">A IA faz o site,<br>você faz a venda.</span></h1>
        <p class="lead">Descreva o seu negócio em uma frase. O OpenCommerce cria catálogo, textos, visual e checkout PIX — pronto para publicar no GitHub Pages, sem mensalidade e sem depender de plataforma.</p>
        <div class="hero-cta">
          <a class="btn btn-primary btn-lg" href="#/nova">${icon('wand', 17)} Criar minha loja agora</a>
          <a class="btn btn-ghost btn-lg" href="#/lojas">Ver demonstração ${icon('chevron', 15)}</a>
        </div>
        <div class="hero-trust">
          <span>${icon('check', 14)} Sem cartão de crédito</span>
          <span>${icon('check', 14)} Sem mensalidade</span>
          <span>${icon('check', 14)} Código 100% seu</span>
        </div>
      </div>
      <div style="position:relative">
        <div class="mock-shell" aria-hidden="true">
          <div class="mock-bar"><i class="mock-dot"></i><i class="mock-dot"></i><i class="mock-dot"></i><span class="mock-url">opencommerce.app/loja/mono-studio</span></div>
          <div class="mock-body">
            <div class="mock-side">
              <div class="mock-logo"><img src="assets/img/logo-mark.png" alt=""> OpenCommerce</div>
              <div class="mock-nav"><span class="on"></span><span></span><span></span><span></span><span></span><span></span></div>
            </div>
            <div class="mock-main">
              <div class="mock-row">
                <div class="mock-card">
                  <div class="mock-label">Assistente de IA</div>
                  <div class="mock-title">Crie uma loja de kits de design para criativos</div>
                  <div class="mock-sub">6 produtos · tema Aurora · PIX configurado</div>
                  <div class="mock-btn"></div>
                </div>
                <div class="mock-preview">
                  <div class="ph"></div><div class="mock-line"></div><div class="mock-line s"></div><div class="mock-line s"></div>
                </div>
              </div>
              <div class="mock-row">
                <div class="mock-card"><div class="mock-label">Pedidos hoje</div><div class="mock-title">R$ 2.480,00</div><div class="mock-sub">12 pedidos · 100% PIX</div></div>
                <div class="mock-card"><div class="mock-label">Visitas</div><div class="mock-title">1.284</div><div class="mock-sub">+18% vs ontem</div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mock-chat" aria-hidden="true">
          <div class="who"><i>OC</i> Assistente OpenCommerce</div>
          <p>“Troque o visual para algo mais premium e crie 4 produtos de skincare.”</p>
          <div class="ok">${icon('check', 11)} Tema Lux aplicado · 4 produtos criados</div>
        </div>
      </div>
    </div>
  </section>

  <div class="strip">
    <div class="wrap-xl strip-in">
      <p>Tudo em um só lugar</p>
      <ul>
        <li>IA integrada</li><li>PIX</li><li>Temas</li><li>Produtos</li><li>Pedidos</li><li>GitHub Pages</li>
      </ul>
    </div>
  </div>

  <section class="land-sec" id="recursos">
    <div class="wrap-xl">
      <div class="land-sec-head">
        <span class="kicker">Recursos</span>
        <h2>O essencial para vender,<br>sem o peso de uma plataforma.</h2>
        <p class="sub">Você não precisa montar servidor, banco de dados ou integrar cinco ferramentas. O OpenCommerce gera uma loja estática, rápida e segura — com a IA cuidando da parte chata.</p>
      </div>
      <div class="bento">
        <article class="bento-card span-4 feat">
          <div class="bi">${icon('sparkles', 19)}</div>
          <h3>Assistente que constrói a loja de verdade</h3>
          <p>Escreva “loja de cafés especiais com assinatura mensal, visual acolhedor e entrega em São Paulo”. A IA gera nome, textos, produtos, preços, FAQ, depoimentos e o tema completo. Depois, é só pedir ajustes em português.</p>
          <div class="mini-window">
            <div class="top"><i></i><i></i><i></i></div>
            <div class="txt"><b>você</b> · Deixe o visual mais premium, com verde profundo e dourado.<br><b>IA</b> · Tema ajustado. Também reescrevi o hero e criei 2 produtos de assinatura. <span class="g">✓ aplicado</span></div>
          </div>
        </article>
        ${feature('qr', 'PIX de verdade, sem gateway', 'Gera o QR Code e o copia-e-cola com CRC16 no próprio navegador. O cliente paga no app do banco e você confirma o pedido. Quer automatizar? Conecte Mercado Pago, Asaas, EFI, Pagar.me ou sua própria API.', 'span-2')}
        ${feature('palette', '6 temas prontos e editáveis', 'Aurora, Neon, Ocean, Papel, Clean e Lux. Troque cores, fontes, cantos e estilo do hero sem tocar em código.', 'span-2')}
        ${feature('box', 'Produtos, pedidos e cupons', 'Catálogo com categorias, busca, estoque, ofertas e galeria. Pedidos chegam por WhatsApp, webhook ou ficam salvos no painel.', 'span-2')}
        ${feature('upload', 'Publicação em 1 clique', 'Exporte um ZIP com a loja pronta (1 arquivo HTML + .nojekyll). Suba no GitHub, ative o Pages e pronto: HTTPS e domínio próprio de graça.', 'span-2')}
        ${feature('code', 'Seu código, suas regras', 'Sem build, sem dependências, sem lock-in. HTML, CSS e JavaScript puros. Edite o que quiser, hospede onde quiser, venda para sempre.', 'span-2')}
      </div>
    </div>
  </section>

  <section class="land-sec" id="como-funciona">
    <div class="wrap-xl">
      <div class="land-sec-head">
        <span class="kicker">Como funciona</span>
        <h2>De uma ideia a uma loja publicada<br>em três passos.</h2>
      </div>
      <div class="steps">
        <article class="step-card"><h3>Descreva o negócio</h3><p>Conte o que você vende, para quem e qual é o clima da marca. Se tiver uma chave de IA, o assistente cria tudo. Se não tiver, o gerador de modelos monta uma base completa para você editar.</p></article>
        <article class="step-card"><h3>Ajuste e dê o seu toque</h3><p>Troque produtos, preços, fotos, cores e textos no painel com prévia ao vivo. Peça mudanças para a IA ou edite campo por campo. Tudo salva no navegador automaticamente.</p></article>
        <article class="step-card"><h3>Publique e venda</h3><p>Coloque sua chave PIX, exporte o ZIP e suba no GitHub Pages. Compartilhe o link, receba os pedidos pelo WhatsApp e confirme o pagamento no extrato.</p></article>
      </div>
    </div>
  </section>

  <section class="land-sec">
    <div class="wrap-xl">
      <div class="bento" style="grid-template-columns:1fr 1fr">
        <article class="bento-card" style="grid-column:auto">
          <div class="bi">${icon('shield', 19)}</div>
          <h3>Pagamento que combina com o Brasil</h3>
          <p>O checkout gera um BR Code válido, com valor, nome do recebedor e identificador do pedido. Funciona em qualquer banco. A confirmação é manual por padrão — e você pode ligar um gateway quando quiser.</p>
          <ul class="check-list mt-16">
            <li>${icon('check', 14)} QR Code + copia-e-cola</li>
            <li>${icon('check', 14)} Sem taxa por venda</li>
            <li>${icon('check', 14)} Chave fica só no seu navegador</li>
          </ul>
        </article>
        <article class="bento-card" style="grid-column:auto">
          <div class="bi">${icon('users', 19)}</div>
          <h3>Feito para quem entrega lojas</h3>
          <p>Gerencie várias lojas no mesmo painel, duplique um projeto para outro cliente e exporte cada uma com a sua configuração. Ideal para freelancers, agências e criadores que revendem sites.</p>
          <ul class="check-list mt-16">
            <li>${icon('check', 14)} Multi-loja com duplicação</li>
            <li>${icon('check', 14)} Backup e restauração em JSON</li>
            <li>${icon('check', 14)} Marca personalizável</li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <section class="land-sec" id="precos">
    <div class="wrap-xl">
      <div class="land-sec-head">
        <span class="kicker">Preços</span>
        <h2>Sem mensalidade. Sem taxa por venda.</h2>
        <p class="sub">O OpenCommerce é seu. Você paga apenas o que a IA consumir, direto na sua chave — ou usa o gerador local, que é grátis.</p>
      </div>
      <div class="bento" style="grid-template-columns:1fr 1fr">
        ${PLANS.map((p) => `
          <article class="bento-card" style="grid-column:auto;${p.highlight ? 'border-color:rgba(255,92,53,.35);background:radial-gradient(120% 120% at 80% -20%,rgba(255,92,53,.18),transparent 55%),linear-gradient(170deg,rgba(255,255,255,.04),rgba(255,255,255,.012))' : ''}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
              <h3 style="font-size:18px">${p.name}</h3>
              ${p.highlight ? '<span class="pill pill-brand">Padrão</span>' : '<span class="pill pill-neutral">Agências</span>'}
            </div>
            <div style="font-family:var(--display);font-size:42px;letter-spacing:-.05em;margin:14px 0 2px">${p.price}<small style="font-size:12px;color:var(--dim);letter-spacing:0;font-family:var(--font);font-weight:500"> / ${p.period}</small></div>
            <p style="margin-bottom:16px">${p.desc}</p>
            <ul class="check-list">
              ${p.features.map((f) => `<li>${icon('check', 14)} ${f}</li>`).join('')}
            </ul>
            <a class="btn ${p.highlight ? 'btn-primary' : 'btn-ghost'} btn-block" style="margin-top:20px" href="${p.href}">${p.cta}</a>
          </article>`).join('')}
      </div>
      <div class="alert alert-info mt-16">${icon('info', 16)}<span><b>Sobre a IA:</b> você conecta a sua própria chave (OpenAI, Gemini, OpenRouter, Groq, DeepSeek, Claude ou Ollama local). Nada passa por servidores nossos — a chave fica no seu navegador.</span></div>
    </div>
  </section>

  <section class="land-sec" id="faq">
    <div class="wrap-md">
      <div class="land-sec-head" style="text-align:center;margin-inline:auto">
        <span class="kicker">FAQ</span>
        <h2>Perguntas frequentes</h2>
      </div>
      <div class="faq-land">
        ${[
          ['Preciso saber programar?', 'Não. Você descreve a loja, ajusta o que quiser no painel e baixa o arquivo pronto. Se souber HTML/CSS, pode personalizar tudo depois — o código é limpo e sem build.'],
          ['Onde a loja fica hospedada?', 'Onde você quiser. O caminho mais simples é o GitHub Pages: é gratuito, tem HTTPS e aceita domínio próprio. Também funciona em Netlify, Vercel, Cloudflare Pages ou qualquer hospedagem estática.'],
          ['Como recebo os pagamentos?', 'Por PIX, direto na sua conta. O checkout gera o código com a sua chave. A confirmação é manual (você confere no banco) ou automática se você configurar um gateway. O dinheiro nunca passa pelo OpenCommerce.'],
          ['A IA é gratuita?', 'O OpenCommerce não cobra nada. A IA usa a sua chave: Gemini e Groq têm planos gratuitos, e modelos pagos custam centavos por loja. Sem chave, o gerador local cria a estrutura para você editar.'],
          ['Meus dados ficam salvos onde?', 'No seu navegador (localStorage). Nada é enviado para nós. Faça backup em Configurações › Backup para não perder os projetos ao limpar o navegador.'],
          ['Posso usar para clientes?', 'Sim — foi feito para isso. Crie quantas lojas quiser, duplique projetos e entregue o ZIP com a configuração de cada cliente.'],
        ].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </div>
    </div>
  </section>

  <section class="land-sec" style="padding-top:20px">
    <div class="wrap-xl">
      <div class="cta-land">
        <span class="kicker">Bora começar</span>
        <h2>Crie a sua primeira loja<br>em menos de 5 minutos.</h2>
        <p>Sem cadastro, sem cartão, sem instalação. Tudo roda no seu navegador.</p>
        <a class="btn btn-primary btn-lg" href="#/nova">${icon('wand', 17)} Criar loja grátis</a>
        <div class="hero-trust" style="justify-content:center;margin-top:22px">
          <span>${icon('check', 14)} Open source</span>
          <span>${icon('check', 14)} PIX nativo</span>
          <span>${icon('check', 14)} Publica no GitHub</span>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="site-foot">
  <div class="wrap-xl">
    <div class="site-foot-in">
      <div>
        <a class="logo" href="#/"><img class="logo-mark" src="assets/img/logo-mark.png" alt=""><span>${BRAND.name}</span></a>
        <p>${BRAND.description}</p>
      </div>
      <div class="foot-links">
        <a href="#recursos">Recursos</a>
        <a href="#precos">Preços</a>
        <a href="#faq">FAQ</a>
        <a href="${BRAND.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="#/config">Configurações</a>
      </div>
    </div>
    <div class="foot-bottom-land">
      <span>© ${BRAND.year} ${BRAND.name}. Feito no Brasil.</span>
      <span>PIX · IA · GitHub Pages</span>
    </div>
  </div>
</footer>`;
}

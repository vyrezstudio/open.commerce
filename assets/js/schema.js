/* OpenCommerce · modelo de dados da loja, temas e normalização */

import { uid, parseMoney, slugify, nowIso, clamp, esc } from './util.js';

export const APP_VERSION = 1;

export const FONTS = [
  { id: 'Sora', label: 'Sora (moderna)', google: 'Sora:wght@300;400;500;600;700;800' },
  { id: 'Inter', label: 'Inter (neutra)', google: 'Inter:wght@300;400;500;600;700;800' },
  { id: 'Manrope', label: 'Manrope (amigável)', google: 'Manrope:wght@300;400;500;600;700;800' },
  { id: 'Space Grotesk', label: 'Space Grotesk (tech)', google: 'Space+Grotesk:wght@300;400;500;600;700' },
  { id: 'Outfit', label: 'Outfit (geométrica)', google: 'Outfit:wght@300;400;500;600;700;800' },
  { id: 'DM Sans', label: 'DM Sans (limpa)', google: 'DM+Sans:wght@300;400;500;600;700;800' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta (premium)', google: 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800' },
  { id: 'Bricolage Grotesque', label: 'Bricolage (editorial)', google: 'Bricolage+Grotesque:wght@300;400;500;600;700;800' },
  { id: 'Playfair Display', label: 'Playfair (clássica)', google: 'Playfair+Display:wght@400;500;600;700;800' },
];

export const THEMES = [
  {
    id: 'aurora',
    name: 'Aurora',
    mode: 'dark',
    primary: '#FF5C35',
    primarySoft: 'rgba(255,92,53,.14)',
    accent: '#34D399',
    bg: '#07080B',
    surface: '#0F1218',
    surface2: '#161A23',
    text: '#F4F6FB',
    muted: '#9AA3B8',
    line: 'rgba(255,255,255,.09)',
    font: 'Sora',
    heading: 'Sora',
    radius: 20,
    heroStyle: 'split',
    cardStyle: 'glow',
  },
  {
    id: 'neon',
    name: 'Neon',
    mode: 'dark',
    primary: '#C8FF4D',
    primarySoft: 'rgba(200,255,77,.12)',
    accent: '#A78BFA',
    bg: '#08090A',
    surface: '#101214',
    surface2: '#171A1D',
    text: '#F7F9F2',
    muted: '#98A29A',
    line: 'rgba(255,255,255,.10)',
    font: 'Space Grotesk',
    heading: 'Space Grotesk',
    radius: 14,
    heroStyle: 'centered',
    cardStyle: 'outline',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    mode: 'dark',
    primary: '#38BDF8',
    primarySoft: 'rgba(56,189,248,.13)',
    accent: '#818CF8',
    bg: '#050A12',
    surface: '#0B1420',
    surface2: '#122031',
    text: '#EFF7FF',
    muted: '#8FA6BD',
    line: 'rgba(255,255,255,.09)',
    font: 'Manrope',
    heading: 'Manrope',
    radius: 18,
    heroStyle: 'image',
    cardStyle: 'glow',
  },
  {
    id: 'papel',
    name: 'Papel',
    mode: 'light',
    primary: '#E4572E',
    primarySoft: 'rgba(228,87,46,.10)',
    accent: '#2F6D5A',
    bg: '#FBF6EE',
    surface: '#FFFFFF',
    surface2: '#F3ECE1',
    text: '#1B1A17',
    muted: '#77726A',
    line: 'rgba(27,26,23,.12)',
    font: 'DM Sans',
    heading: 'Playfair Display',
    radius: 10,
    heroStyle: 'split',
    cardStyle: 'soft',
  },
  {
    id: 'clean',
    name: 'Clean',
    mode: 'light',
    primary: '#4F46E5',
    primarySoft: 'rgba(79,70,229,.09)',
    accent: '#0EA5E9',
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    surface2: '#EEF2F7',
    text: '#0B1220',
    muted: '#64748B',
    line: 'rgba(11,18,32,.10)',
    font: 'Inter',
    heading: 'Plus Jakarta Sans',
    radius: 16,
    heroStyle: 'split',
    cardStyle: 'outline',
  },
  {
    id: 'lux',
    name: 'Lux',
    mode: 'dark',
    primary: '#E6C37A',
    primarySoft: 'rgba(230,195,122,.12)',
    accent: '#D6A5FF',
    bg: '#0A0710',
    surface: '#130E19',
    surface2: '#1C1424',
    text: '#F8F3EC',
    muted: '#A79BAE',
    line: 'rgba(255,255,255,.10)',
    font: 'Bricolage Grotesque',
    heading: 'Bricolage Grotesque',
    radius: 8,
    heroStyle: 'centered',
    cardStyle: 'soft',
  },
];

export const GATEWAYS = [
  { id: 'manual', label: 'PIX manual (padrão)', desc: 'Gera o copia-e-cola/QR e você confirma o recebimento.' },
  { id: 'mercadopago', label: 'Mercado Pago', desc: 'PIX automático via API do Mercado Pago.', docs: 'https://www.mercadopago.com.br/developers' },
  { id: 'asaas', label: 'Asaas', desc: 'Cobranças PIX automáticas.', docs: 'https://docs.asaas.com/' },
  { id: 'efi', label: 'EFI (Gerencianet)', desc: 'PIX via API EFI.', docs: 'https://dev.efipay.com.br/' },
  { id: 'pagarme', label: 'Pagar.me', desc: 'PIX via API Pagar.me.', docs: 'https://docs.pagar.me/' },
  { id: 'custom', label: 'API própria / webhook', desc: 'Envie o pedido para sua URL e receba o retorno.', docs: '' },
];

export const NICHE_PRESETS = [
  { id: '', label: 'Detectar automaticamente', hint: 'a IA escolhe pelo seu texto' },
  { id: 'digital', label: 'Produtos digitais', hint: 'cursos, e-books, presets, packs' },
  { id: 'moda', label: 'Moda e acessórios', hint: 'roupas, calçados, joias' },
  { id: 'beleza', label: 'Beleza e cosméticos', hint: 'skincare, maquiagem' },
  { id: 'casa', label: 'Casa e decoração', hint: 'móveis, velas, cerâmica' },
  { id: 'tech', label: 'Eletrônicos e tech', hint: 'gadgets, periféricos' },
  { id: 'alimentos', label: 'Alimentos e bebidas', hint: 'cafés, doces, gourmet' },
  { id: 'servicos', label: 'Serviços e consultoria', hint: 'mentorias, freelas' },
  { id: 'outro', label: 'Outro / personalizado', hint: '' },
];

/* ------------------------------------------------------------------ */
/* Covers geradas (SVG) — mantém a demo bonita sem depender de imagens */
/* ------------------------------------------------------------------ */

export function generatedCover(label = 'Produto', hue = 20, hue2 = 320) {
  const safe = esc(label).slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 85% 62%)"/>
      <stop offset="1" stop-color="hsl(${hue2} 70% 38%)"/>
    </linearGradient>
    <radialGradient id="r" cx=".25" cy=".15" r=".9">
      <stop offset="0" stop-color="rgba(255,255,255,.55)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feBlend in="SourceGraphic" mode="overlay"/></filter>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <rect width="800" height="800" fill="url(#r)"/>
  <g fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5">
    <circle cx="620" cy="170" r="160"/><circle cx="620" cy="170" r="220"/><circle cx="150" cy="650" r="180"/>
  </g>
  <g filter="url(#n)"><rect width="800" height="800"/></g>
  <text x="60" y="700" fill="rgba(255,255,255,.94)" font-family="Inter, Arial" font-size="46" font-weight="700">${safe}</text>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ------------------------------------------------------------------ */
/* Loja padrão                                                         */
/* ------------------------------------------------------------------ */

export function defaultStore(overrides = {}) {
  const theme = THEMES[0];
  const base = {
    version: APP_VERSION,
    id: 'store_' + Math.random().toString(36).slice(2, 9),
    name: 'Minha Loja',
    slug: 'minha-loja',
    tagline: 'Sua nova loja',
    description: '',
    logoText: '',
    logoImage: '',
    niche: 'digital',
    theme: { ...theme },
    contact: { whatsapp: '', email: '', instagram: '', discord: '', address: '', cnpj: '' },
    hero: {
      badge: 'Novidades toda semana',
      title: 'Seu próximo favorito está aqui',
      highlight: 'favorito',
      subtitle: 'Produtos selecionados, entrega rápida e pagamento via PIX. Simples assim.',
      ctaLabel: 'Ver produtos',
      ctaLink: '#catalogo',
      ctaSecondaryLabel: '',
      image: generatedCover('Coleção', 18, 320),
      stats: [
        { value: '+2.400', label: 'clientes' },
        { value: '4,9/5', label: 'avaliação' },
        { value: '24h', label: 'entrega' },
      ],
    },
    announcement: { enabled: true, text: 'PIX aprovado na hora · envio em até 24h' },
    benefits: [
      { icon: 'shield', title: 'Compra segura', text: 'Pagamento protegido e dados criptografados.' },
      { icon: 'zap', title: 'Entrega rápida', text: 'Pedidos processados no mesmo dia.' },
      { icon: 'chat', title: 'Suporte humano', text: 'Fale com a gente pelo WhatsApp.' },
      { icon: 'refresh', title: 'Troca fácil', text: '7 dias para trocar sem burocracia.' },
    ],
    about: {
      enabled: true,
      title: 'Feito com cuidado, do começo ao fim',
      text: 'Somos um estúdio independente que cria produtos com atenção a cada detalhe. Cada item é pensado para durar, funcionar bem e deixar o seu dia melhor.',
      image: generatedCover('Nosso estúdio', 200, 30),
      bulletPoints: ['Curadoria própria', 'Materiais de qualidade', 'Atendimento próximo'],
    },
    faq: {
      enabled: true,
      title: 'Perguntas frequentes',
      items: [
        { q: 'Como funciona o pagamento via PIX?', a: 'Ao finalizar o pedido, geramos um QR Code e um código copia-e-cola. Você paga pelo app do seu banco e o pedido é confirmado automaticamente após a conferência.' },
        { q: 'Qual o prazo de entrega?', a: 'Produtos digitais são liberados na hora. Produtos físicos são enviados em até 24h úteis após a confirmação do pagamento.' },
        { q: 'Posso pedir pelo WhatsApp?', a: 'Sim! Ao finalizar, você pode enviar o resumo do pedido direto para o nosso WhatsApp.' },
        { q: 'Tem garantia?', a: 'Todos os produtos têm garantia de 7 dias. Basta falar com a gente.' },
      ],
    },
    testimonials: {
      enabled: true,
      title: 'Quem compra, recomenda',
      items: [
        { name: 'Marina L.', role: 'Cliente desde 2023', text: 'Chegou antes do prazo e a qualidade é ainda melhor do que nas fotos. Comprarei de novo com certeza.', avatar: '' },
        { name: 'Rafael T.', role: 'São Paulo', text: 'Atendimento rápido no WhatsApp e o PIX caiu na hora. Processo muito simples.', avatar: '' },
        { name: 'Camila S.', role: 'Belo Horizonte', text: 'A embalagem é um espetáculo à parte. Dá pra ver o cuidado em cada detalhe.', avatar: '' },
      ],
    },
    catalog: {
      enabled: true,
      title: 'Produtos',
      subtitle: 'Escolha o seu e finalize em menos de 2 minutos.',
      showSearch: true,
      showCategories: true,
      layout: 'grid',
      itemsPerRow: 3,
    },
    cta: {
      enabled: true,
      title: 'Pronto para começar?',
      text: 'Garanta o seu com PIX e receba o acesso imediatamente.',
      button: 'Ver produtos',
    },
    products: [],
    coupons: [{ code: 'BEMVINDO10', percent: 10, active: true }],
    payment: {
      mode: 'manual',
      pixKey: '',
      pixKeyType: 'auto',
      holderName: '',
      city: 'SAO PAULO',
      instructions: 'Após o pagamento, envie o comprovante no WhatsApp para agilizar a confirmação.',
      whatsappCheckout: true,
      pixExpiration: 30,
      webhookUrl: '',
      gateway: { provider: 'manual', apiKey: '', publicKey: '', env: 'sandbox', endpoint: '' },
      installments: false,
      cardEnabled: false,
    },
    shipping: {
      enabled: false,
      mode: 'on_request',
      flatRate: 0,
      freeAbove: 0,
      deliveryTime: '3 a 7 dias úteis',
      note: 'Enviamos para todo o Brasil.',
    },
    checkout: {
      requireAddress: false,
      requirePhone: true,
      requireEmail: true,
      askDocument: false,
      fields: { name: true, email: true, phone: true, address: false, document: false, notes: true },
      successTitle: 'Pedido recebido!',
      successText: 'Obrigado pela compra. Enviamos os próximos passos para o seu WhatsApp.',
      minOrder: 0,
    },
    seo: {
      title: '',
      description: '',
      keywords: '',
      favicon: '',
      ogImage: '',
    },
    integrations: {
      ga4: '',
      metaPixel: '',
      customHead: '',
      customCss: '',
      customJs: '',
      hideBranding: false,
    },
    published: { url: '', at: '' },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return normalizeStore(mergeDeep(base, overrides));
}

/* ------------------------------------------------------------------ */
/* Normalização (aceita saída de IA sem quebrar)                       */
/* ------------------------------------------------------------------ */

const str = (v, fallback = '') => (v === null || v === undefined ? fallback : String(v));

export function normalizePrice(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return 0;
    // IA costuma devolver centavos; humanos digitam reais.
    return Math.round(value);
  }
  return parseMoney(value);
}

export function normalizeProduct(raw = {}) {
  const price = normalizePrice(raw.price ?? raw.preco ?? 0);
  const compareAt = normalizePrice(raw.compareAt ?? raw.compare_at ?? raw.oldPrice ?? 0);
  const gallery = Array.isArray(raw.gallery) ? raw.gallery.filter(Boolean).map(String).slice(0, 6) : [];
  const image = str(raw.image || raw.imageUrl || raw.imagem || gallery[0] || '') ||
    generatedCover(str(raw.name || raw.title || 'Produto'), 20, 300);
  const stockRaw = raw.stock;
  const stock = stockRaw === '' || stockRaw === null || stockRaw === undefined ? null : clamp(Number(stockRaw) || 0, 0, 999999);
  return {
    id: str(raw.id) || uid('prod'),
    name: str(raw.name || raw.title || raw.nome || 'Produto sem nome').slice(0, 120),
    price,
    compareAt: compareAt > price ? compareAt : 0,
    image,
    gallery,
    short: str(raw.short || raw.subtitle || raw.resumo || '').slice(0, 220),
    description: str(raw.description || raw.descricao || ''),
    category: str(raw.category || raw.categoria || 'Geral').slice(0, 40),
    type: raw.type === 'fisico' || raw.type === 'physical' ? 'fisico' : 'digital',
    badge: str(raw.badge || raw.tag || '').slice(0, 24),
    stock: raw.type === 'digital' && stockRaw === undefined ? null : stock,
    active: raw.active !== false,
    featured: !!raw.featured,
    deliveryText: str(raw.deliveryText || raw.entrega || ''),
    fileUrl: str(raw.fileUrl || raw.arquivo || ''),
    weight: Number(raw.weight) || 0,
    createdAt: str(raw.createdAt) || nowIso(),
  };
}

function mergeDeep(target, source) {
  if (Array.isArray(source)) return source.map((v) => (v && typeof v === 'object' && !Array.isArray(v) ? mergeDeep({}, v) : v));
  if (!source || typeof source !== 'object') return source === undefined ? target : source;
  const out = { ...(target && typeof target === 'object' && !Array.isArray(target) ? target : {}) };
  for (const [k, v] of Object.entries(source)) {
    if (v === undefined) continue;
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? mergeDeep(out[k], v) : v;
  }
  return out;
}

export { mergeDeep };

export function normalizeStore(raw = {}) {
  const base = raw.__base || defaultStoreRaw();
  const merged = mergeDeep(base, raw);
  delete merged.__base;

  merged.id = str(merged.id) || 'store_' + Math.random().toString(36).slice(2, 9);
  merged.name = str(merged.name, 'Minha Loja').slice(0, 60) || 'Minha Loja';
  merged.slug = slugify(merged.slug || merged.name);
  merged.theme = { ...(THEMES.find((t) => t.id === merged.theme?.id) || THEMES[0]), ...(merged.theme || {}) };
  merged.products = (Array.isArray(merged.products) ? merged.products : []).map(normalizeProduct).slice(0, 200);
  merged.benefits = (Array.isArray(merged.benefits) ? merged.benefits : []).slice(0, 6);
  merged.faq.items = (Array.isArray(merged.faq.items) ? merged.faq.items : []).slice(0, 14);
  merged.testimonials.items = (Array.isArray(merged.testimonials.items) ? merged.testimonials.items : []).slice(0, 10);
  merged.hero.stats = (Array.isArray(merged.hero.stats) ? merged.hero.stats : []).slice(0, 4);
  merged.coupons = (Array.isArray(merged.coupons) ? merged.coupons : []).slice(0, 20);
  merged.checkout.fields = { name: true, email: true, phone: true, address: false, document: false, notes: true, ...(merged.checkout.fields || {}) };
  merged.updatedAt = nowIso();
  return merged;
}

/** Base sem recursão (usada por normalizeStore). */
function defaultStoreRaw() {
  return {
    version: APP_VERSION,
    id: '',
    name: 'Minha Loja',
    slug: 'minha-loja',
    tagline: 'Sua nova loja',
    description: '',
    logoText: '',
    logoImage: '',
    niche: 'digital',
    theme: { ...THEMES[0] },
    contact: { whatsapp: '', email: '', instagram: '', discord: '', address: '', cnpj: '' },
    hero: {
      badge: 'Novidades toda semana',
      title: 'Seu próximo favorito está aqui',
      highlight: '',
      subtitle: 'Produtos selecionados, entrega rápida e pagamento via PIX.',
      ctaLabel: 'Ver produtos',
      ctaLink: '#catalogo',
      ctaSecondaryLabel: '',
      image: '',
      stats: [],
    },
    announcement: { enabled: true, text: '' },
    benefits: [],
    about: { enabled: true, title: '', text: '', image: '', bulletPoints: [] },
    faq: { enabled: true, title: 'Perguntas frequentes', items: [] },
    testimonials: { enabled: true, title: 'Depoimentos', items: [] },
    catalog: { enabled: true, title: 'Produtos', subtitle: '', showSearch: true, showCategories: true, layout: 'grid', itemsPerRow: 3 },
    cta: { enabled: true, title: '', text: '', button: 'Ver produtos' },
    products: [],
    coupons: [],
    payment: {
      mode: 'manual',
      pixKey: '',
      pixKeyType: 'auto',
      holderName: '',
      city: 'SAO PAULO',
      instructions: '',
      whatsappCheckout: true,
      pixExpiration: 30,
      webhookUrl: '',
      gateway: { provider: 'manual', apiKey: '', publicKey: '', env: 'sandbox', endpoint: '' },
      installments: false,
      cardEnabled: false,
    },
    shipping: { enabled: false, mode: 'on_request', flatRate: 0, freeAbove: 0, deliveryTime: '', note: '' },
    checkout: {
      requireAddress: false, requirePhone: true, requireEmail: true, askDocument: false,
      fields: { name: true, email: true, phone: true, address: false, document: false, notes: true },
      successTitle: 'Pedido recebido!', successText: '', minOrder: 0,
    },
    seo: { title: '', description: '', keywords: '', favicon: '', ogImage: '' },
    integrations: { ga4: '', metaPixel: '', customHead: '', customCss: '', customJs: '', hideBranding: false },
    published: { url: '', at: '' },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/* ------------------------------------------------------------------ */
/* Loja de demonstração                                                */
/* ------------------------------------------------------------------ */

export function demoStore() {
  const products = [
    normalizeProduct({
      name: 'Kit Identidade Visual — Studio',
      price: 14900,
      compareAt: 21900,
      short: 'Arquivos editáveis no Figma para montar sua marca em um dia.',
      description: 'Um sistema completo de identidade visual com 32 layouts editáveis, paletas prontas, tipografia selecionada e guia de aplicação. Inclui versões para Instagram, apresentações e materiais impressos.\n\nEntrega imediata por e-mail após a confirmação do PIX. Arquivos em Figma + PDF.',
      category: 'Design',
      type: 'digital',
      badge: 'Mais vendido',
      featured: true,
      image: generatedCover('Identidade Visual', 14, 330),
      deliveryText: 'Acesso imediato',
    }),
    normalizeProduct({
      name: 'Pack de Ícones — 1.200 vetores',
      price: 6900,
      short: 'Ícones em linha e preenchidos, prontos para web e app.',
      description: 'Biblioteca com 1.200 ícones desenhados em grid de 24px, em SVG e fonte de ícones. Licença comercial vitalícia para usar em projetos de clientes.',
      category: 'Design',
      type: 'digital',
      image: generatedCover('1.200 Ícones', 190, 20),
      deliveryText: 'Download imediato',
    }),
    normalizeProduct({
      name: 'Presets de Cor — Coleção Norte',
      price: 3900,
      compareAt: 5900,
      short: '24 paletas harmônicas para fotografia e social media.',
      description: 'Presets para Lightroom Mobile e Desktop com 24 combinações de cor inspiradas na luz do fim da tarde. Funciona em fotos de celular e câmera.',
      category: 'Fotografia',
      type: 'digital',
      badge: 'Novo',
      image: generatedCover('Presets Norte', 30, 260),
      deliveryText: 'Acesso imediato',
    }),
    normalizeProduct({
      name: 'E-book — Vender com PIX',
      price: 2900,
      short: 'O guia prático para tirar a primeira venda sem complicação.',
      description: '48 páginas sobre como estruturar uma loja enxuta, escolher preço, escrever ofertas e receber por PIX sem depender de plataformas caras.',
      category: 'Negócios',
      type: 'digital',
      image: generatedCover('Vender com PIX', 140, 300),
      deliveryText: 'Download imediato',
    }),
    normalizeProduct({
      name: 'Mentoria em grupo — 4 encontros',
      price: 49700,
      compareAt: 69700,
      short: 'Quatro encontros ao vivo para destravar o seu projeto.',
      description: 'Turma pequena, encontros de 90 minutos, gravações e grupo de acompanhamento por 30 dias. Vagas limitadas.',
      category: 'Mentoria',
      type: 'digital',
      badge: 'Vagas abertas',
      image: generatedCover('Mentoria', 250, 10),
      deliveryText: 'Convite por e-mail em até 24h',
    }),
    normalizeProduct({
      name: 'Caderno de Planejamento (físico)',
      price: 8900,
      short: 'Capa dura, 160 páginas, envio para todo o Brasil.',
      description: 'Caderno A5 com capa dura texturizada, papel 90g e miolo pontilhado. Acompanha marcador e adesivos.',
      category: 'Papelaria',
      type: 'fisico',
      stock: 18,
      image: generatedCover('Caderno A5', 90, 200),
      deliveryText: 'Envio em 24h',
    }),
  ];

  const store = defaultStore({
    name: 'MONO Studio',
    slug: 'mono-studio',
    tagline: 'Design que resolve',
    description: 'Kits de design, presets e materiais para quem cria. Entrega imediata e pagamento por PIX.',
    niche: 'digital',
    theme: { ...THEMES[0], id: 'aurora' },
    logoText: 'MONO',
    contact: {
      whatsapp: '11999999999',
      email: 'oi@monostudio.com.br',
      instagram: 'mono.studio',
      cnpj: '',
      address: 'São Paulo, SP',
    },
    hero: {
      badge: 'Novo drop · Coleção Norte',
      title: 'Design que resolve,',
      highlight: 'entregue na hora',
      subtitle: 'Kits, presets e materiais prontos para elevar o nível do seu projeto. Compre no PIX e receba o acesso em segundos.',
      ctaLabel: 'Explorar produtos',
      ctaSecondaryLabel: 'Falar no WhatsApp',
      image: generatedCover('Coleção Norte', 16, 320),
      stats: [
        { value: '+3.100', label: 'downloads' },
        { value: '4,9/5', label: 'avaliação' },
        { value: '2 min', label: 'para receber' },
      ],
    },
    announcement: { enabled: true, text: '10% OFF na primeira compra com o cupom BEMVINDO10' },
    products,
    benefits: [
      { icon: 'zap', title: 'Acesso imediato', text: 'Liberação automática após o PIX.' },
      { icon: 'shield', title: 'Licença comercial', text: 'Use nos seus projetos e dos seus clientes.' },
      { icon: 'refresh', title: 'Atualizações grátis', text: 'Novas versões sem pagar de novo.' },
      { icon: 'chat', title: 'Suporte real', text: 'Resposta em até 1 dia útil.' },
    ],
    about: {
      enabled: true,
      title: 'Um estúdio pequeno, com padrão alto',
      text: 'A MONO é um estúdio independente de design. Criamos ferramentas que economizam o seu tempo: arquivos bem organizados, tipografia consistente e nada de excesso. Já somos mais de 3 mil downloads em 14 países.',
      image: generatedCover('MONO Studio', 210, 40),
      bulletPoints: ['Arquivos organizados', 'Licença comercial', 'Atualizações vitalícias'],
    },
    faq: {
      enabled: true,
      title: 'Dúvidas frequentes',
      items: [
        { q: 'Como recebo o produto?', a: 'Assim que o PIX é confirmado, o link de acesso é enviado para o e-mail informado no pedido. Também fica disponível na tela de confirmação.' },
        { q: 'O pagamento é seguro?', a: 'Sim. O PIX é gerado com a chave oficial da loja e você paga dentro do app do seu banco, sem compartilhar dados com terceiros.' },
        { q: 'Posso usar em projetos de clientes?', a: 'Sim, a licença comercial cobre projetos próprios e de clientes. Não é permitido revender os arquivos originais.' },
        { q: 'E se eu precisar de ajuda?', a: 'Fale com a gente pelo WhatsApp. Respondemos em até 1 dia útil.' },
      ],
    },
    testimonials: {
      enabled: true,
      title: 'O que dizem por aí',
      items: [
        { name: 'Bianca R.', role: 'Designer freelancer', text: 'Usei o kit em três projetos na mesma semana. Economizei horas de trabalho e o resultado ficou impecável.', avatar: '' },
        { name: 'Diego M.', role: 'Social media', text: 'Os presets salvaram meu feed. A entrega foi instantânea, em menos de um minuto já estava baixando.', avatar: '' },
        { name: 'Aline P.', role: 'Fundadora da Casa Flora', text: 'Comprei a mentoria e saí com o plano de lançamento pronto. Vale cada centavo.', avatar: '' },
      ],
    },
    coupons: [{ code: 'BEMVINDO10', percent: 10, active: true }],
    payment: {
      mode: 'manual',
      pixKey: 'oi@monostudio.com.br',
      pixKeyType: 'email',
      holderName: 'MONO STUDIO DESIGN',
      city: 'SAO PAULO',
      instructions: 'Pague o QR Code abaixo e envie o comprovante no WhatsApp. O acesso é liberado em até 10 minutos.',
      whatsappCheckout: true,
      pixExpiration: 30,
      webhookUrl: '',
      gateway: { provider: 'manual', apiKey: '', publicKey: '', env: 'sandbox', endpoint: '' },
    },
    shipping: {
      enabled: true,
      mode: 'fixed',
      flatRate: 1900,
      freeAbove: 25000,
      deliveryTime: '3 a 7 dias úteis',
      note: 'Enviamos para todo o Brasil pelos Correios.',
    },
    checkout: {
      requireAddress: false,
      requirePhone: true,
      requireEmail: true,
      askDocument: false,
      fields: { name: true, email: true, phone: true, address: false, document: false, notes: true },
      successTitle: 'Pedido recebido!',
      successText: 'Obrigado pela compra. Se o PIX ainda não foi pago, use o código acima no app do seu banco.',
      minOrder: 0,
    },
    published: { url: '', at: '' },
  });

  store.products = products;
  store.seo = {
    title: 'MONO Studio — kits de design, presets e materiais',
    description: 'Kits de design, presets e materiais para criativos. Entrega imediata e pagamento por PIX.',
    keywords: 'design, presets, kits, figma, identidade visual',
    favicon: '',
    ogImage: '',
  };
  return store;
}

/* ------------------------------------------------------------------ */
/* Pedidos                                                             */
/* ------------------------------------------------------------------ */

export function normalizeOrder(raw = {}) {
  const items = (Array.isArray(raw.items) ? raw.items : []).map((it) => ({
    id: str(it.id),
    name: str(it.name),
    price: Number(it.price) || 0,
    qty: clamp(Number(it.qty) || 1, 1, 999),
    type: it.type === 'fisico' ? 'fisico' : 'digital',
    image: str(it.image || ''),
  }));
  const total = Number.isFinite(Number(raw.total)) ? Number(raw.total) : items.reduce((s, i) => s + i.price * i.qty, 0);
  return {
    id: str(raw.id) || 'OC-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
    storeId: str(raw.storeId),
    createdAt: str(raw.createdAt) || nowIso(),
    customer: {
      name: str(raw.customer?.name),
      email: str(raw.customer?.email),
      phone: str(raw.customer?.phone),
      document: str(raw.customer?.document),
      address: str(raw.customer?.address),
      notes: str(raw.customer?.notes),
    },
    items,
    subtotal: Number(raw.subtotal) || total,
    shipping: Number(raw.shipping) || 0,
    discount: Number(raw.discount) || 0,
    total,
    coupon: str(raw.coupon || ''),
    payment: str(raw.payment || 'pix'),
    status: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'].includes(raw.status) ? raw.status : 'pendente',
    pix: str(raw.pix?.payload || raw.pix || ''),
    source: str(raw.source || 'loja'),
    note: str(raw.note || ''),
  };
}

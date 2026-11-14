/* OpenCommerce · prompts da IA (PT-BR) */

export const SYSTEM_BUILDER = `Você é o motor de criação de lojas do OpenCommerce, um construtor de e-commerce brasileiro.
Sua função é transformar a descrição do negócio do usuário em uma loja online completa, pronta para vender, com textos persuasivos e originais em português do Brasil.

REGRAS
- Responda SOMENTE com um objeto JSON válido. Sem markdown, sem comentários, sem texto fora do JSON.
- Nunca invente dados sensíveis (chaves PIX, senhas, tokens). Deixe campos de pagamento vazios.
- Preços sempre em CENTAVOS (inteiro). Ex.: R$ 97,00 => 9700.
- Escreva como um copywriter brasileiro experiente: claro, específico, sem clichês vazios ("qualidade e preço" etc).
- Nada de promessas ilegais, curas, garantias absolutas ou comparações com concorrentes.
- Preserve o que o usuário já definiu. Ao alterar, mude apenas o necessário.
- Todo texto deve estar em PT-BR, com acentuação correta.
- Imagens: use URLs públicas (https). Se não houver, use string vazia e o sistema gera uma capa.

FORMATO DE RESPOSTA
{
  "message": "resposta curta ao usuário, 1-3 frases, explicando o que foi feito",
  "suggestions": ["próximo passo sugerido", "outro próximo passo"],
  "store": { ...alterações parciais da loja... }
}

O campo "store" é mesclado na loja atual. Objetos são combinados; arrays (products, benefits, faq.items, testimonials.items, hero.stats, coupons) SUBSTITUEM o valor anterior. Para adicionar um produto, envie a lista completa de produtos.

ESQUEMA DA LOJA (todas as chaves são opcionais no patch)
{
  "name": "string (máx 60)",
  "tagline": "string curta",
  "description": "string (1-2 frases)",
  "logoText": "string curta (ex.: MONO)",
  "niche": "digital|moda|beleza|casa|tech|alimentos|servicos|outro",
  "theme": {
    "id": "aurora|neon|ocean|papel|clean|lux|sharp|midnight|citrus|sage|editorial|boutique|tech|candy",
    "primary": "#hex", "accent": "#hex", "bg": "#hex", "surface": "#hex",
    "surface2": "#hex", "text": "#hex", "muted": "#hex", "line": "rgba(...)",
    "font": "Sora|Inter|Manrope|Space Grotesk|Outfit|DM Sans|Plus Jakarta Sans|Bricolage Grotesque|Playfair Display",
    "heading": "idem font",
    "radius": 0-32,
    "heroStyle": "split|centered|image",
    "cardStyle": "glow|outline|soft"
  },
  "contact": { "whatsapp": "somente números com DDD", "email": "", "instagram": "", "discord": "", "address": "", "cnpj": "" },
  "announcement": { "enabled": true, "text": "barra superior" },
  "hero": {
    "badge": "string curta", "title": "título forte", "highlight": "palavra do título para destacar",
    "subtitle": "1-2 frases", "ctaLabel": "Ver produtos", "ctaSecondaryLabel": "",
    "image": "https://...", "stats": [{"value":"+3.000","label":"clientes"}]
  },
  "benefits": [{"icon":"zap|shield|chat|refresh|truck|lock|gift|headset","title":"...","text":"..."}] (4 itens),
  "about": {"enabled":true,"title":"...","text":"2-3 frases","image":"https://...","bulletPoints":["...","...","..."]},
  "catalog": {"enabled":true,"title":"Produtos","subtitle":"...","showSearch":true,"showCategories":true,"itemsPerRow":3},
  "products": [{
    "name":"...","price":9700,"compareAt":12900,"short":"1 frase","description":"2 parágrafos separados por \\n\\n",
    "category":"...","type":"digital|fisico","badge":"","stock":null,"image":"https://...",
    "gallery":[],"deliveryText":"Acesso imediato","fileUrl":"","featured":false
  }],
  "testimonials": {"enabled":true,"title":"...","items":[{"name":"...","role":"...","text":"...","avatar":""}]},
  "faq": {"enabled":true,"title":"Perguntas frequentes","items":[{"q":"...","a":"..."}]},
  "cta": {"enabled":true,"title":"...","text":"...","button":"Ver produtos"},
  "coupons": [{"code":"BEMVINDO10","percent":10,"active":true}],
  "shipping": {"enabled":false,"mode":"free|fixed|on_request","flatRate":0,"freeAbove":0,"deliveryTime":"3 a 7 dias úteis","note":"..."},
  "checkout": {"fields":{"name":true,"email":true,"phone":true,"address":false,"document":false,"notes":true},"successTitle":"...","successText":"..."},
  "seo": {"title":"...","description":"...","keywords":"..."}
}

BOAS PRÁTICAS DE CONTEÚDO
- Hero: título de 3 a 8 palavras, com benefício concreto. Subtítulo com prova/oferta.
- Produtos: 4 a 8 itens, nomes específicos, preços coerentes com o nicho, pelo menos 2 com compareAt (oferta) e 1 com badge.
- Benefícios: respostas a objeções reais (prazo, segurança, suporte, troca).
- FAQ: 4 perguntas que um comprador realmente faria (pagamento, prazo, troca, entrega).
- Depoimentos: 3 depoimentos plausíveis e específicos, sem exageros.
- SEO: title até 60 caracteres; description até 155.
- Se o cliente vende produtos físicos, ative shipping.enabled e checkout.fields.address.
- Se for digital, tipo "digital", deliveryText com o formato de entrega.`;

export const SYSTEM_EDITOR = `Você é o editor de lojas do OpenCommerce. O cliente conversa com você em português e espera que você mude qualquer parte da loja, não só textos.

O QUE VOCÊ PODE ALTERAR (tudo é permitido, desde que exista no esquema)
- Marca: name, tagline, description, logoText, niche, logoImage.
- Visual completo: theme (id, primary, accent, bg, surface, surface2, text, muted, line, primarySoft, font, heading, radius, heroStyle, cardStyle).
- Layout: theme.heroStyle (split|centered|image), theme.cardStyle (glow|outline|soft), theme.radius, catalog.itemsPerRow (2-4), catálogo com/sem busca e filtros, seções ativadas/desativadas (about, testimonials, faq, cta, announcement).
- Conteúdo: hero, benefits, about, products, testimonials, faq, cta, coupons, shipping, checkout, seo, contact, announcement.
- Ofertas e urgência: announcement, badges, compareAt, cupons.
- Textos de qualquer seção, incluindo reescrever tudo em outro tom (premium, jovem, técnico, minimalista).

REGRAS
- Responda SOMENTE com JSON válido no formato {"message","suggestions","store"}.
- "store" é um PATCH: envie apenas o que muda. Objetos são mesclados; arrays são SUBSTITUÍDOS por inteiro.
- Se o pedido for amplo ("deixe tudo premium"), mude o conjunto inteiro: theme, hero, benefícios, catálogo, depoimentos e SEO de forma coerente.
- Nunca invente chaves PIX, tokens, senhas ou dados de pagamento. Preserve payment, integrations e contact sem inventar.
- Preços em CENTAVOS (inteiro). Mantenha coerência de preço e margem.
- Use somente chaves e valores válidos do esquema. Não crie campos novos.
- Escreva em PT-BR com acentuação correta. Nada de promessas ilegais ou garantias absolutas.
- Na "message", diga em 1-3 frases o que mudou e o que o cliente pode ajustar em seguida.

TEMAS DISPONÍVEIS (theme.id)
aurora, neon, ocean, papel, clean, lux, sharp, midnight, citrus, sage, editorial, boutique, tech, candy.

FONTES VÁLIDAS
Sora, Inter, Manrope, Space Grotesk, Outfit, DM Sans, Plus Jakarta Sans, Bricolage Grotesque, Playfair Display.

QUANDO O CLIENTE PEDIR "FAÇA IGUAL A ESTE SITE" / ENVIAR UMA REFERÊNCIA
- Você não tem acesso à internet. Use o que já sabe sobre a marca citada e, principalmente, o que o cliente descrever (cores, tipo de letra, cantos, densidade, estilo do hero, tom).
- Se a referência for desconhecida, aplique uma direção premium coerente com o segmento e explique na "message" o que foi interpretado. Peça uma descrição rápida apenas se faltar informação essencial.
- Traduza o estilo para o nosso esquema: escolha um theme.id próximo, ajuste primary/accent/fundos, fontes, radius, heroStyle e cardStyle. NÃO copie logotipos, textos autorais nem imagens da marca.
- Nunca diga que visitou o site. Seja transparente: "interpretei o estilo como...".

EXEMPLOS DE INTERPRETAÇÃO
- Estilo Apple/Linear/Vercel: fundo escuro ou branco puro, muito espaço, tipografia grande, radius pequeno, hero centered, cards outline.
- Estilo Nubank/Stripe: gradientes suaves, roxo/azul, cards arredondados, hero split, tom próximo.
- Estilo boutique/luxo: fundo escuro ou creme, serifada nos títulos, dourado/rosé, radius médio, hero split.
- Estilo streetwear/drop: preto, cor neon, tipografia grotesca, radius baixo, hero image.
- Estilo editorial/revista: contraste alto, serifada, muito texto, cards soft, radius baixo.
- Estilo infantil/doceria: cores claras, radius alto, fontes arredondadas, cards soft.`;

export const QUICK_ACTIONS = [
  {
    id: 'copy',
    label: 'Melhorar os textos',
    icon: 'pen',
    prompt: 'Reescreva os textos da loja (hero, benefícios, sobre, FAQ) com copy mais persuasivo, específico e humano, mantendo o mesmo posicionamento. Não altere preços nem produtos.',
  },
  {
    id: 'products',
    label: 'Criar mais produtos',
    icon: 'box',
    prompt: 'Adicione mais 4 produtos coerentes com o nicho da loja. Mantenha os existentes e devolva a lista completa. Varie categorias, preços e badges.',
  },
  {
    id: 'theme',
    label: 'Trocar o visual',
    icon: 'palette',
    prompt: 'Proponha um visual diferente e mais premium para a loja: escolha um theme.id adequado ao nicho, ajuste primary/accent e fontes. Mantenha os textos.',
  },
  {
    id: 'faq',
    label: 'Reforçar a confiança',
    icon: 'shield',
    prompt: 'Adicione ou melhore depoimentos, FAQ e benefícios para reduzir objeções de compra (prazo, segurança, troca, suporte).',
  },
  {
    id: 'seo',
    label: 'Otimizar SEO',
    icon: 'search',
    prompt: 'Otimize o SEO da loja: título e descrição da página, keywords e descrição geral. Seja específico e natural, sem keyword stuffing.',
  },
  {
    id: 'offer',
    label: 'Criar uma oferta',
    icon: 'tag',
    prompt: 'Crie uma oferta clara na loja: cupom de primeira compra, badge nos produtos e um texto de urgência no announcement. Ajuste compareAt dos produtos para mostrar desconto real.',
  },
];

/** Remove segredos antes de enviar a loja para a IA. */
export function sanitizeStoreForAI(store) {
  const copy = JSON.parse(JSON.stringify(store));
  if (copy.payment) {
    copy.payment.pixKey = copy.payment.pixKey ? '[configurada]' : '';
    copy.payment.webhookUrl = copy.payment.webhookUrl ? '[configurado]' : '';
    if (copy.payment.gateway) {
      copy.payment.gateway.apiKey = '';
      copy.payment.gateway.publicKey = '';
      copy.payment.gateway.endpoint = '';
    }
  }
  if (copy.integrations) {
    copy.integrations.customHead = '';
    copy.integrations.customJs = '';
  }
  copy.products = (copy.products || []).map((p) => ({ ...p, description: String(p.description || '').slice(0, 600) }));
  return copy;
}

export function buildCreatePrompt(brief, meta = {}) {
  const lines = [
    'Crie uma loja online completa com base nas informações abaixo.',
    '',
    '--- BRIEFING DO CLIENTE ---',
    brief.trim(),
    '',
    '--- PREFERÊNCIAS ---',
    `Nicho: ${meta.niche || 'detectar pelo briefing'}`,
    `Tom de voz: ${meta.tone || 'profissional, próximo e confiante'}`,
    `Público: ${meta.audience || 'detectar pelo briefing'}`,
    meta.theme ? `Tema desejado: ${meta.theme}` : 'Tema: escolha o que melhor representa a marca',
    '',
    'Gere de 4 a 8 produtos com preços realistas em centavos. Preencha hero, benefícios, sobre, depoimentos, FAQ, CTA, SEO e cupom.',
    'Deixe "payment" e "contact" com os dados que o cliente informou (se informou). Não invente telefone nem e-mail.',
  ];
  return lines.join('\n');
}

export function buildRefinePrompt(message, store) {
  return [
    'PEDIDO DO USUÁRIO:',
    message.trim(),
    '',
    'LOJA ATUAL (JSON):',
    JSON.stringify(sanitizeStoreForAI(store)),
    '',
    'Devolva o patch JSON com as alterações.',
  ].join('\n');
}

export function buildFieldPrompt(instruction, store) {
  return [
    'INSTRUÇÃO:', instruction,
    '',
    'CONTEXTO DA LOJA:',
    JSON.stringify(sanitizeStoreForAI(store)),
    '',
    'Devolva o patch JSON.',
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* Gerador local (funciona sem IA)                                     */
/* ------------------------------------------------------------------ */

const NICHE_COPY = {
  digital: {
    theme: 'aurora',
    tagline: 'Conhecimento que vira resultado',
    subtitle: 'Cursos, templates e materiais prontos para aplicar hoje — acesso imediato após o pagamento.',
    labels: ['Kit Completo', 'Pacote Premium', 'Guia Prático', 'Template Editável', 'Curso Gravado', 'Mentoria em Grupo'],
    categories: ['Curso', 'Template', 'E-book', 'Mentoria'],
    benefit: ['Acesso imediato', 'Atualizações incluídas', 'Suporte direto', 'Garantia de 7 dias'],
  },
  moda: {
    theme: 'papel',
    tagline: 'Peças que vestem a sua personalidade',
    subtitle: 'Curadoria de roupas e acessórios com tecidos selecionados, troca fácil e envio em até 24h.',
    labels: ['Camisa Linho', 'Bolsa Couro', 'Óculos Solar', 'Tênis Casual', 'Vestido Midi', 'Cinto Trançado'],
    categories: ['Roupas', 'Acessórios', 'Calçados'],
    benefit: ['Frete grátis acima de R$ 199', 'Troca em 7 dias', 'Tecidos selecionados', 'Envio em 24h'],
  },
  beleza: {
    theme: 'lux',
    tagline: 'Cuidado real para a sua pele',
    subtitle: 'Fórmulas pensadas para a rotina brasileira, com textura leve e resultado visível.',
    labels: ['Sérum Vitamina C', 'Hidratante Facial', 'Kit Skincare', 'Óleo Corporal', 'Máscara Facial', 'Balm Labial'],
    categories: ['Skincare', 'Corpo', 'Kits'],
    benefit: ['Fórmulas veganas', 'Dermatologicamente testado', 'Frete grátis acima de R$ 149', 'Amostra grátis'],
  },
  casa: {
    theme: 'papel',
    tagline: 'Sua casa com mais personalidade',
    subtitle: 'Peças artesanais e objetos de design para transformar os detalhes do seu dia a dia.',
    labels: ['Vela Aromática', 'Jogo de Xícaras', 'Manta Algodão', 'Vaso Cerâmica', 'Difusor de Ambiente', 'Bandeja Madeira'],
    categories: ['Decoração', 'Cozinha', 'Aromas'],
    benefit: ['Feito à mão', 'Frete grátis acima de R$ 249', 'Embalagem para presente', 'Envio em 24h'],
  },
  tech: {
    theme: 'ocean',
    tagline: 'Tecnologia que simplifica',
    subtitle: 'Gadgets e periféricos selecionados para trabalhar melhor e aproveitar mais.',
    labels: ['Fone Bluetooth', 'Teclado Mecânico', 'Hub USB-C', 'Mouse Sem Fio', 'Suporte Notebook', 'Carregador Turbo'],
    categories: ['Áudio', 'Periféricos', 'Acessórios'],
    benefit: ['Garantia de 12 meses', 'Envio em 24h', 'Nota fiscal', 'Suporte técnico'],
  },
  alimentos: {
    theme: 'papel',
    tagline: 'Sabor de verdade, direto da origem',
    subtitle: 'Cafés, doces e produtos artesanais escolhidos a dedo para quem valoriza cada detalhe.',
    labels: ['Café Especial 250g', 'Kit Degustação', 'Doce Artesanal', 'Mel Puro', 'Granola Premium', 'Chocolate 70%'],
    categories: ['Cafés', 'Doces', 'Kits'],
    benefit: ['Produção artesanal', 'Frete grátis acima de R$ 149', 'Ingredientes selecionados', 'Envio em 24h'],
  },
  servicos: {
    theme: 'clean',
    tagline: 'Estratégia sob medida para o seu negócio',
    subtitle: 'Consultoria e mentorias com método claro, agenda flexível e foco em resultado.',
    labels: ['Consultoria Individual', 'Sessão Estratégica', 'Pacote Mensal', 'Diagnóstico Completo', 'Workshop', 'Mentoria 1:1'],
    categories: ['Consultoria', 'Mentoria', 'Pacotes'],
    benefit: ['Atendimento personalizado', 'Agenda flexível', 'Material de apoio', 'Garantia de satisfação'],
  },
  outro: {
    theme: 'clean',
    tagline: 'Produtos escolhidos com cuidado',
    subtitle: 'Uma seleção especial de produtos com entrega rápida e pagamento via PIX.',
    labels: ['Produto Essencial', 'Kit Completo', 'Edição Especial', 'Pacote Premium', 'Seleção da Casa', 'Lançamento'],
    categories: ['Geral', 'Kits', 'Lançamentos'],
    benefit: ['Compra segura', 'Envio rápido', 'Suporte humano', 'Troca fácil'],
  },
};

const BRAND_GUESSES = {
  digital: ['Studio Mono', 'Nova Studio', 'Ateliê Pixel'],
  moda: ['Aura Wear', 'Casa Vela', 'Linha Nobre'],
  beleza: ['Aurora Skin', 'Flora Beauty', 'Lume Cosmética'],
  casa: ['Casa Nativa', 'Lume Casa', 'Terra Viva'],
  tech: ['Nexo Tech', 'Pulso Lab', 'Órbita'],
  alimentos: ['Grão & Gema', 'Casa do Café', 'Doce Ponto'],
  servicos: ['Ponte Studio', 'Norte Consultoria', 'Ateliê de Ideias'],
  outro: ['Ateliê Nova', 'Casa Nova', 'Ponto Norte'],
};

function guessBrand(brief, niche, fallback = 'Ateliê Nova') {
  const firstLine = String(brief).split(/\n|\.|,/).map((s) => s.trim()).filter(Boolean)[0] || '';
  const stop = /^(vendo|quero|crio|faço|tenho|somos|ofereço|trabalho|loja|minha|meu|uma|um|a|o|para|com|de|do|da)$/i;
  const match = firstLine.match(/^(?:a|o|minha|meu)?\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ&'-]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ&'-]+)?)/);
  const candidate = match && match[1] ? match[1].trim() : '';
  if (candidate && !stop.test(candidate)) return candidate;
  const pool = BRAND_GUESSES[niche] || BRAND_GUESSES.outro;
  const seed = String(brief).split('').reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 997, 0);
  return pool[seed % pool.length] || fallback;
}

export function localGenerate(brief = '', meta = {}) {
  const niche = meta.niche && NICHE_COPY[meta.niche] ? meta.niche : detectNiche(brief);
  const preset = NICHE_COPY[niche];
  const nameGuess = meta.name || guessBrand(brief, niche);
  const name = String(nameGuess).slice(0, 40);
  const products = preset.labels.map((label, i) => {
    const price = [6900, 8900, 12900, 14900, 19700, 24900][i % 6];
    return {
      name: label,
      price,
      compareAt: i % 3 === 0 ? Math.round(price * 1.35 / 100) * 100 : 0,
      short: niche === 'servicos'
        ? `${label} com atendimento próximo e foco no que realmente importa para o seu negócio.`
        : niche === 'digital'
          ? `${label} com conteúdo direto ao ponto, acesso imediato e atualizações incluídas.`
          : `${label} com acabamento cuidado, pensado para o dia a dia.`,
      description: `${label} da ${name}. ${preset.subtitle}\n\nPagamento via PIX com confirmação ágil e atendimento próximo. Qualquer dúvida, fale com a gente pelo WhatsApp.`,
      category: preset.categories[i % preset.categories.length],
      type: niche === 'digital' || niche === 'servicos' ? 'digital' : 'fisico',
      badge: i === 0 ? 'Mais vendido' : i === 2 ? 'Novo' : '',
      stock: niche === 'digital' || niche === 'servicos' ? null : 25,
      image: '',
      deliveryText: niche === 'digital' ? 'Acesso imediato' : 'Envio em até 24h',
    };
  });

  return {
    message: 'Loja criada com o modelo OpenCommerce. Agora você pode ajustar textos, produtos e visual — ou pedir mudanças para a IA.',
    suggestions: ['Peça para a IA melhorar os textos', 'Ajuste as cores em Aparência', 'Configure sua chave PIX'],
    store: {
      name,
      tagline: meta.tagline || preset.tagline,
      description: `${name} — ${preset.subtitle}`,
      niche,
      theme: { id: preset.theme },
      announcement: { enabled: true, text: preset.benefit[0] },
      hero: {
        badge: meta.badge || preset.benefit[0],
        title: meta.title || `Bem-vindo à ${name}`,
        highlight: name.split(' ')[0],
        subtitle: meta.subtitle || preset.subtitle,
        ctaLabel: 'Ver produtos',
        ctaSecondaryLabel: '',
        stats: [
          { value: '+500', label: 'clientes' },
          { value: '4,9/5', label: 'avaliação' },
          { value: '24h', label: 'envio' },
        ],
      },
      benefits: preset.benefit.map((title, i) => ({
        icon: ['zap', 'shield', 'chat', 'refresh'][i % 4],
        title,
        text: ['Sem burocracia, do jeito que deve ser.', 'Seus dados e seu pagamento protegidos.', 'Atendimento de gente para gente.', 'Sem risco: resolvemos rapidinho.'][i % 4],
      })),
      about: {
        enabled: true,
        title: `Sobre a ${name}`,
        text: `A ${name} nasceu para oferecer ${niche === 'servicos' ? 'estratégia e acompanhamento de verdade' : niche === 'digital' ? 'materiais digitais bem feitos' : 'produtos que valem o investimento'}. Trabalhamos com curadoria, atenção ao detalhe e atendimento próximo.`,
        bulletPoints: preset.benefit.slice(0, 3),
      },
      faq: {
        enabled: true,
        title: 'Perguntas frequentes',
        items: [
          { q: 'Como funciona o pagamento?', a: 'O pagamento é via PIX. Ao finalizar o pedido, você recebe um QR Code e o código copia-e-cola para pagar no app do seu banco.' },
          { q: 'Qual o prazo de entrega?', a: niche === 'digital' || niche === 'servicos' ? 'O acesso é liberado logo após a confirmação do pagamento.' : 'Enviamos em até 24h úteis após a confirmação. O prazo de transporte varia de 3 a 7 dias úteis.' },
          { q: 'Posso trocar ou devolver?', a: 'Sim. Você tem 7 dias para solicitar troca ou devolução, sem burocracia.' },
          { q: 'Como falo com a loja?', a: 'Pelo WhatsApp. O link está no rodapé e na tela de confirmação do pedido.' },
        ],
      },
      testimonials: {
        enabled: true,
        title: 'Quem compra, recomenda',
        items: [
          { name: 'Marina L.', role: 'Cliente', text: 'Chegou rápido e superou a expectativa. Atendimento impecável do começo ao fim.', avatar: '' },
          { name: 'Rafael T.', role: 'Cliente', text: 'Pagamento no PIX foi simples e a confirmação veio em minutos. Recomendo.', avatar: '' },
          { name: 'Camila S.', role: 'Cliente', text: 'Dá para ver o cuidado em cada detalhe. Já é minha loja favorita.', avatar: '' },
        ],
      },
      products,
      shipping: {
        enabled: niche !== 'digital' && niche !== 'servicos',
        mode: 'fixed',
        flatRate: 1900,
        freeAbove: 19900,
        deliveryTime: '3 a 7 dias úteis',
        note: 'Enviamos para todo o Brasil.',
      },
      checkout: {
        fields: { name: true, email: true, phone: true, address: niche !== 'digital' && niche !== 'servicos', document: false, notes: true },
        successTitle: 'Pedido recebido!',
        successText: 'Obrigado pela compra. Se ainda não pagou o PIX, use o código na tela anterior.',
      },
      seo: {
        title: `${name} — ${meta.tagline || preset.tagline}`.slice(0, 60),
        description: `${name}: ${preset.subtitle}`.slice(0, 155),
        keywords: `${niche}, ${name}, comprar online, pix`,
      },
    },
  };
}

function detectNiche(text = '') {
  const t = String(text).toLowerCase();
  // Cada nicho tem palavras-chave com pesos diferentes: termos específicos
  // (ex.: "café", "decoração") valem mais que termos genéricos (ex.: "casa").
  const map = [
    ['digital', [
      [/curso|ebook|e-book|template|preset|planilha|infoproduto/, 3],
      [/arquivo|pdf|aula|método|apostila/, 2],
      [/design|digital|online/, 1],
    ]],
    ['moda', [
      [/roupa|vestido|camisa|calça|bolsa|sapato|tênis|joia|coleção/, 3],
      [/moda|acessório|tecido|malha|alfaiataria/, 2],
    ]],
    ['beleza', [
      [/skincare|maquiagem|cosmético|perfume|sérum/, 3],
      [/beleza|creme|cabelo|pele|batom|hidratante/, 2],
    ]],
    ['casa', [
      [/decoração|móvel|vela|cerâmica|enxoval|utensílio|jardim/, 3],
      [/cozinha|sala|quarto|lar|ambiente/, 1],
    ]],
    ['tech', [
      [/eletrônico|fone|notebook|gadget|computador|periférico|smartwatch/, 3],
      [/celular|tech|software|app|hardware/, 2],
    ]],
    ['alimentos', [
      [/café|doce|chocolate|padaria|gourmet|queijo|cesta/, 3],
      [/comida|alimento|bebida|grão|tempero|vinho|cerveja/, 2],
    ]],
    ['servicos', [
      [/consultoria|assessoria|freelancer|agência/, 3],
      [/serviço|mentoria|sessão|atendimento|estratégia/, 2],
    ]],
  ];

  let best = 'outro';
  let bestScore = 0;
  for (const [niche, rules] of map) {
    let score = 0;
    for (const [re, weight] of rules) {
      const hits = t.match(new RegExp(re.source, 'g'));
      if (hits) score += hits.length * weight;
    }
    if (score > bestScore) {
      best = niche;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : 'outro';
}

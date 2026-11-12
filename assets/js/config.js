/* OpenCommerce · marca e links (edite aqui para personalizar) */

export const BRAND = {
  name: 'OpenCommerce',
  short: 'OC',
  tagline: 'Crie lojas virtuais completas com IA, PIX e zero mensalidade.',
  description: 'Construtor de e-commerce com inteligência artificial integrada. Descreva o negócio, a IA monta a loja, você publica no GitHub Pages e recebe por PIX.',
  github: 'https://github.com/seu-usuario/opencommerce',
  docs: 'https://github.com/seu-usuario/opencommerce#readme',
  whatsapp: '',
  email: '',
  priceLabel: 'Grátis, open source',
  year: new Date().getFullYear(),
};

export const PLANS = [
  {
    id: 'free',
    name: 'Self-hosted',
    price: 'R$ 0',
    period: 'para sempre',
    highlight: true,
    desc: 'Você hospeda no seu GitHub e usa a sua própria chave de IA.',
    features: [
      'Lojas ilimitadas no mesmo painel',
      'IA integrada (OpenAI, Gemini, Groq, Claude…)',
      'Checkout PIX manual + gateways',
      'Temas, produtos, pedidos e cupons',
      'Exportação em 1 arquivo HTML',
      'Código aberto, sem mensalidade',
    ],
    cta: 'Começar agora',
    href: '#/nova',
  },
  {
    id: 'agency',
    name: 'Para agências',
    price: 'Seu preço',
    period: 'por projeto',
    highlight: false,
    desc: 'Use o OpenCommerce para entregar lojas prontas aos seus clientes.',
    features: [
      'Painel multi-loja',
      'Duplicar loja em 1 clique',
      'Backup e restauração em JSON',
      'Personalize a marca no arquivo de config',
      'Sem taxa por venda',
      'Suporte via comunidade',
    ],
    cta: 'Criar primeira loja',
    href: '#/nova',
  },
];

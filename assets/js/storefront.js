/* OpenCommerce · storefront: gera uma loja completa em um único HTML autocontido. */

import { esc, brl, onlyDigits, waLink } from './util.js';
import { BRAND } from './config.js';

/* ------------------------------------------------------------------ */
/* CSS da loja                                                         */
/* ------------------------------------------------------------------ */

export const STORE_CSS = String.raw`
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font),ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0}
::selection{background:var(--brand);color:var(--brand-ink)}
h1,h2,h3,h4{font-family:var(--heading),var(--font),sans-serif;line-height:1.05;letter-spacing:-.03em;margin:0;font-weight:700}
h1{font-size:clamp(2.5rem,6vw,4.6rem)}
h2{font-size:clamp(1.8rem,3.6vw,2.9rem)}
h3{font-size:clamp(1.1rem,1.6vw,1.35rem);letter-spacing:-.02em}
p{margin:0}
.wrap{width:min(1180px,calc(100% - 40px));margin-inline:auto}
.skip{position:absolute;left:-999px;background:var(--brand);color:var(--brand-ink);padding:12px 18px;z-index:999;border-radius:0 0 12px 0}
.skip:focus{left:0}
:focus-visible{outline:2px solid var(--brand);outline-offset:3px;border-radius:6px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.section{padding:clamp(56px,8vw,104px) 0;position:relative}
.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:clamp(28px,4vw,52px);flex-wrap:wrap}
.section-head p{color:var(--muted);max-width:52ch;margin-top:10px}
.muted{color:var(--muted)}
.tiny{font-size:.8rem}
.center{text-align:center}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* announcement */
.announce{background:var(--brand);color:var(--brand-ink);font-size:.82rem;font-weight:600;text-align:center;padding:9px 16px;letter-spacing:.01em}

/* nav */
.nav{position:sticky;top:0;z-index:60;backdrop-filter:blur(18px);background:color-mix(in srgb,var(--bg) 82%,transparent);border-bottom:1px solid var(--line)}
.nav-in{display:flex;align-items:center;gap:28px;height:70px}
.brand{display:flex;align-items:center;gap:10px;font-family:var(--heading),sans-serif;font-weight:800;letter-spacing:.02em;font-size:1.15rem}
.brand img{height:34px;width:auto;border-radius:8px;object-fit:contain}
.brand .dot{width:9px;height:9px;border-radius:99px;background:var(--brand);box-shadow:0 0 18px var(--brand)}
.nav-links{display:flex;gap:26px;margin-left:auto;font-size:.9rem;font-weight:500;color:var(--muted)}
.nav-links a:hover{color:var(--text)}
.nav-actions{display:flex;align-items:center;gap:10px}
.icon-btn{width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;border:1px solid var(--line);background:var(--surface);transition:.2s;position:relative}
.icon-btn:hover{border-color:color-mix(in srgb,var(--brand) 55%,var(--line));transform:translateY(-1px)}
.cart-count{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:99px;background:var(--brand);color:var(--brand-ink);font-size:.68rem;font-weight:800;display:grid;place-items:center;border:2px solid var(--bg)}
.menu-toggle{display:none}
.mobile-menu{display:none;border-top:1px solid var(--line);padding:16px 0 22px}
.mobile-menu a{display:block;padding:12px 0;border-bottom:1px solid var(--line);font-weight:600}
.mobile-menu a:last-child{border:0}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:14px 24px;border-radius:calc(var(--radius) * .75);font-weight:700;font-size:.95rem;transition:transform .18s,box-shadow .18s,background .18s,border-color .18s;border:1px solid transparent;white-space:nowrap}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:var(--brand);color:var(--brand-ink);box-shadow:0 12px 30px -12px color-mix(in srgb,var(--brand) 75%,transparent)}
.btn-primary:hover{box-shadow:0 18px 38px -12px color-mix(in srgb,var(--brand) 85%,transparent)}
.btn-ghost{border-color:var(--line);background:color-mix(in srgb,var(--surface) 60%,transparent);color:var(--text)}
.btn-ghost:hover{border-color:var(--brand)}
.btn-sm{padding:10px 16px;font-size:.85rem;border-radius:12px}
.btn-block{width:100%}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* hero */
.hero{position:relative;padding:clamp(40px,6vw,84px) 0 clamp(52px,7vw,96px);overflow:hidden}
.hero::before{content:"";position:absolute;inset:-30% -10% auto;height:120%;background:radial-gradient(50% 55% at 22% 22%,color-mix(in srgb,var(--brand) 26%,transparent),transparent 70%),radial-gradient(40% 45% at 82% 12%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%);filter:blur(20px);pointer-events:none}
.hero-grid{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,5vw,70px);align-items:center}
.hero-copy .eyebrow{color:var(--brand)}
.hero-copy h1{margin:18px 0 20px}
.hero-copy h1 .hl{color:var(--brand);position:relative;white-space:nowrap}
.hero-copy h1 .hl::after{content:"";position:absolute;left:0;right:0;bottom:.08em;height:.12em;background:var(--brand);opacity:.25;border-radius:99px}
.hero-sub{color:var(--muted);font-size:clamp(1rem,1.4vw,1.14rem);max-width:52ch}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.hero-stats{display:flex;gap:clamp(22px,4vw,46px);margin-top:38px;padding-top:26px;border-top:1px solid var(--line);flex-wrap:wrap}
.hero-stats strong{display:block;font-family:var(--heading),sans-serif;font-size:1.5rem;letter-spacing:-.02em}
.hero-stats span{font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.hero-media{position:relative}
.hero-frame{position:relative;border-radius:calc(var(--radius) * 1.3);overflow:hidden;border:1px solid var(--line);aspect-ratio:1/1.04;background:var(--surface);box-shadow:0 40px 90px -40px rgba(0,0,0,.7)}
.hero-frame img{width:100%;height:100%;object-fit:cover}
.hero-float{position:absolute;display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:16px;background:color-mix(in srgb,var(--surface) 92%,transparent);border:1px solid var(--line);backdrop-filter:blur(14px);box-shadow:0 20px 40px -20px rgba(0,0,0,.6);font-size:.8rem;font-weight:600;animation:float 6s ease-in-out infinite}
.hero-float small{display:block;font-weight:500;color:var(--muted);font-size:.72rem}
.hero-float .pill{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand);flex:none}
.f1{left:-22px;bottom:16%}
.f2{right:-14px;top:10%;animation-delay:-3s}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero.centered .hero-grid{grid-template-columns:1fr;text-align:center;gap:40px}
.hero.centered .hero-copy{max-width:820px;margin-inline:auto}
.hero.centered .hero-sub{margin-inline:auto}
.hero.centered .hero-actions,.hero.centered .hero-stats{justify-content:center}
.hero.centered .hero-frame{aspect-ratio:16/8;max-width:960px;margin-inline:auto}
.hero.image{padding-top:0}
.hero.image .hero-bg{position:absolute;inset:0;z-index:0}
.hero.image .hero-bg img{width:100%;height:100%;object-fit:cover}
.hero.image .hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--bg) 55%,transparent),var(--bg) 92%)}
.hero.image .hero-grid{grid-template-columns:1fr;position:relative;z-index:1;padding-top:clamp(60px,10vw,120px);text-align:center}
.hero.image .hero-copy{max-width:780px;margin-inline:auto}
.hero.image .hero-media{display:none}
.hero.image .hero-actions{justify-content:center}

/* benefits */
.benefits{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:26px 0}
.benefit{display:flex;gap:13px;padding:6px 14px}
.benefit + .benefit{border-left:1px solid var(--line)}
.benefit .bi{width:38px;height:38px;border-radius:11px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;flex:none}
.benefit strong{display:block;font-size:.9rem;margin-bottom:2px}
.benefit p{font-size:.8rem;color:var(--muted);line-height:1.45}

/* catalog */
.catalog-tools{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:30px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{padding:8px 15px;border-radius:99px;border:1px solid var(--line);font-size:.82rem;font-weight:600;color:var(--muted);transition:.18s;background:transparent}
.chip:hover{color:var(--text);border-color:var(--muted)}
.chip.active{background:var(--text);color:var(--bg);border-color:var(--text)}
.search{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:99px;padding:9px 16px;background:var(--surface);margin-left:auto;min-width:230px;color:var(--muted)}
.search input{border:0;background:none;outline:none;width:100%;color:var(--text);font-size:.85rem}
.search input::placeholder{color:var(--muted)}
.grid-products{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:clamp(14px,2.2vw,26px)}
.card{position:relative;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);overflow:hidden;transition:transform .25s,box-shadow .25s,border-color .25s;display:flex;flex-direction:column}
.cards-glow .card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--brand) 40%,var(--line));box-shadow:0 30px 60px -30px color-mix(in srgb,var(--brand) 35%,transparent)}
.cards-outline .card{background:transparent}
.cards-outline .card:hover{border-color:var(--brand);transform:translateY(-4px)}
.cards-soft .card{box-shadow:0 18px 44px -30px rgba(0,0,0,.5)}
.cards-soft .card:hover{transform:translateY(-4px);box-shadow:0 26px 50px -28px rgba(0,0,0,.55)}
.card-media{position:relative;aspect-ratio:4/4.6;overflow:hidden;background:var(--surface2)}
.card-media img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.card:hover .card-media img{transform:scale(1.055)}
.badge{position:absolute;top:12px;left:12px;z-index:2;padding:5px 10px;border-radius:99px;background:var(--bg);color:var(--text);font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border:1px solid var(--line);backdrop-filter:blur(8px)}
.badge.hot{background:var(--brand);color:var(--brand-ink);border-color:transparent}
.card-body{padding:18px 18px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.card-cat{font-size:.66rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);font-weight:700}
.card-name{font-size:1.02rem;font-weight:700;letter-spacing:-.015em;line-height:1.3}
.card-short{font-size:.82rem;color:var(--muted);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:14px}
.price{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.price strong{font-size:1.12rem;letter-spacing:-.02em}
.price s{color:var(--muted);font-size:.8rem;opacity:.8}
.price .pix{font-size:.66rem;color:var(--accent);font-weight:700;display:block;letter-spacing:.02em}
.soldout{position:absolute;inset:0;display:grid;place-items:center;background:color-mix(in srgb,var(--bg) 62%,transparent);backdrop-filter:blur(3px);font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-size:.8rem;z-index:3}

/* about */
.about{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,72px);align-items:center}
.about-media{border-radius:calc(var(--radius) * 1.2);overflow:hidden;border:1px solid var(--line);aspect-ratio:4/3.4;background:var(--surface)}
.about-media img{width:100%;height:100%;object-fit:cover}
.about p{color:var(--muted);margin-top:16px;max-width:52ch}
.about ul{list-style:none;padding:0;margin:26px 0 0;display:grid;gap:11px}
.about li{display:flex;gap:10px;align-items:center;font-size:.9rem;font-weight:600}
.about li::before{content:"";width:18px;height:18px;border-radius:99px;background:var(--brand-soft);border:1px solid color-mix(in srgb,var(--brand) 45%,transparent);flex:none}
.about li::after{content:"";position:absolute;margin-left:5px;width:7px;height:11px;border:2px solid var(--brand);border-top:0;border-left:0;transform:rotate(42deg) translateY(-1px)}
.about li{position:relative}

/* testimonials */
.quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.quote{padding:26px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);display:flex;flex-direction:column;gap:14px}
.stars{color:var(--brand);letter-spacing:2px;font-size:.85rem}
.quote p{font-size:.93rem;line-height:1.6}
.who{display:flex;align-items:center;gap:11px;margin-top:auto}
.avatar{width:38px;height:38px;border-radius:99px;background:var(--surface2);display:grid;place-items:center;font-weight:800;font-size:.8rem;color:var(--brand);border:1px solid var(--line);overflow:hidden}
.avatar img{width:100%;height:100%;object-fit:cover}
.who strong{display:block;font-size:.84rem}
.who span{font-size:.74rem;color:var(--muted)}

/* faq */
.faq{max-width:820px;margin-inline:auto}
.faq details{border-bottom:1px solid var(--line);padding:20px 0}
.faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;font-weight:700;font-size:1rem}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:1.4rem;font-weight:400;color:var(--brand);transition:.2s;line-height:1}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{color:var(--muted);margin-top:12px;font-size:.92rem;max-width:70ch}

/* cta */
.cta{position:relative;border-radius:calc(var(--radius) * 1.4);padding:clamp(38px,6vw,70px);text-align:center;overflow:hidden;border:1px solid var(--line);background:radial-gradient(120% 130% at 50% -20%,color-mix(in srgb,var(--brand) 30%,transparent),transparent 62%),var(--surface)}
.cta p{color:var(--muted);max-width:52ch;margin:14px auto 28px}

/* footer */
footer{border-top:1px solid var(--line);padding:56px 0 30px;margin-top:20px}
.foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr;gap:32px}
.foot-brand p{color:var(--muted);font-size:.86rem;margin-top:14px;max-width:34ch}
.foot-col h4{font-size:.74rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:14px;font-family:var(--font),sans-serif;font-weight:700}
.foot-col a,.foot-col p{display:block;font-size:.86rem;color:var(--muted);padding:5px 0}
.foot-col a:hover{color:var(--text)}
.pay-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.pay-badge{font-size:.66rem;font-weight:800;letter-spacing:.04em;padding:5px 9px;border:1px solid var(--line);border-radius:7px;color:var(--muted)}
.foot-bottom{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--line);margin-top:44px;padding-top:20px;font-size:.76rem;color:var(--muted)}

/* drawer / modal */
.overlay{position:fixed;inset:0;background:rgba(3,4,6,.6);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .25s;z-index:80}
.overlay.open{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(430px,100%);background:var(--bg);border-left:1px solid var(--line);z-index:90;display:flex;flex-direction:column;transform:translateX(102%);transition:transform .32s cubic-bezier(.3,.8,.2,1);box-shadow:-30px 0 80px rgba(0,0,0,.4)}
.drawer.open{transform:none}
.drawer-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--line)}
.drawer-head h3{font-size:1.05rem}
.drawer-body{flex:1;overflow:auto;padding:18px 22px;display:flex;flex-direction:column;gap:14px}
.drawer-foot{border-top:1px solid var(--line);padding:18px 22px 22px;background:var(--surface)}
.cart-item{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:start}
.cart-item img{width:64px;height:76px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
.cart-item .nm{font-size:.88rem;font-weight:700;line-height:1.3}
.cart-item .pr{font-size:.82rem;color:var(--muted);margin-top:4px}
.qty{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:9px;overflow:hidden;margin-top:8px}
.qty button{width:26px;height:26px;display:grid;place-items:center;font-size:1rem;line-height:1;color:var(--muted)}
.qty button:hover{color:var(--text);background:var(--surface2)}
.qty span{min-width:26px;text-align:center;font-size:.78rem;font-weight:700}
.rm{font-size:.7rem;color:var(--muted);text-decoration:underline;margin-left:8px}
.rm:hover{color:var(--brand)}
.line{display:flex;justify-content:space-between;gap:12px;font-size:.85rem;color:var(--muted);padding:4px 0}
.line strong{color:var(--text)}
.line.total{font-size:1.05rem;color:var(--text);border-top:1px solid var(--line);margin-top:8px;padding-top:12px}
.line.total strong{font-size:1.2rem}
.coupon{display:flex;gap:8px;margin:6px 0}
.coupon input{flex:1;min-width:0;background:var(--surface2);border:1px solid var(--line);border-radius:9px;padding:9px 12px;font-size:.82rem;outline:none}
.coupon input:focus{border-color:var(--brand)}
.empty{text-align:center;color:var(--muted);padding:50px 10px;font-size:.9rem}
.empty b{display:block;color:var(--text);margin-bottom:6px;font-size:1rem}

.modal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .22s}
.modal.open{opacity:1;pointer-events:auto}
.modal-card{position:relative;width:min(980px,100%);max-height:calc(100vh - 40px);overflow:auto;background:var(--bg);border:1px solid var(--line);border-radius:calc(var(--radius) * 1.2);box-shadow:0 60px 120px -40px rgba(0,0,0,.8);transform:translateY(14px) scale(.99);transition:transform .25s}
.modal.open .modal-card{transform:none}
.modal-close{position:absolute;top:14px;right:14px;z-index:3;width:36px;height:36px;border-radius:99px;background:color-mix(in srgb,var(--bg) 75%,transparent);border:1px solid var(--line);display:grid;place-items:center;backdrop-filter:blur(10px)}
.product-view{display:grid;grid-template-columns:1.05fr 1fr}
.pv-media{background:var(--surface2);position:relative;min-height:320px}
.pv-media img{width:100%;height:100%;object-fit:cover;aspect-ratio:1/1.1}
.pv-thumbs{position:absolute;left:14px;bottom:14px;display:flex;gap:7px}
.pv-thumbs button{width:46px;height:46px;border-radius:8px;overflow:hidden;border:1px solid var(--line);opacity:.7}
.pv-thumbs button.active{opacity:1;border-color:var(--brand)}
.pv-thumbs img{width:100%;height:100%;object-fit:cover}
.pv-body{padding:clamp(22px,3vw,38px);display:flex;flex-direction:column;gap:14px}
.pv-body h2{font-size:clamp(1.5rem,2.4vw,2rem)}
.pv-body .desc{color:var(--muted);font-size:.91rem;white-space:pre-line;line-height:1.65}
.pv-price{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.pv-price strong{font-size:1.7rem;letter-spacing:-.03em}
.pv-price s{color:var(--muted)}
.pv-note{font-size:.78rem;color:var(--muted);display:flex;gap:6px;align-items:center}
.pv-actions{display:flex;gap:10px;margin-top:6px;flex-wrap:wrap}

.modal-checkout .modal-card{width:min(560px,100%)}
.co-head{padding:24px 26px 0}
.co-steps{display:flex;gap:8px;margin-top:16px}
.co-steps div{height:3px;flex:1;background:var(--line);border-radius:99px;overflow:hidden}
.co-steps div.on{background:var(--brand)}
.co-body{padding:22px 26px 26px}
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:13px}
.field label{font-size:.76rem;font-weight:700;color:var(--muted);letter-spacing:.03em}
.field input,.field textarea,.field select{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:11px 13px;font-size:.88rem;outline:none;transition:.16s;width:100%}
.field input:focus,.field textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-soft)}
.field textarea{resize:vertical;min-height:70px}
.field .err{color:#F87171;font-size:.72rem;display:none}
.field.invalid input{border-color:#F87171}
.field.invalid .err{display:block}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.co-review{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:16px}
.co-review .line{padding:2px 0}
.pix-box{text-align:center;padding:4px 0 8px}
.pix-qr{background:#fff;padding:12px;border-radius:14px;display:inline-block;line-height:0;margin:4px auto 14px;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.pix-qr svg{width:216px;height:216px;display:block}
.copybox{display:flex;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 8px 8px 12px;align-items:center}
.copybox code{flex:1;font-size:.7rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,monospace}
.timer{font-size:.76rem;color:var(--muted);margin:12px 0 4px}
.timer b{color:var(--brand)}
.trustline{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:.7rem;color:var(--muted);margin-top:16px}
.trustline span{display:flex;gap:5px;align-items:center}
.step-title{font-size:1.25rem;font-weight:800;letter-spacing:-.02em;margin-bottom:4px}
.step-sub{font-size:.82rem;color:var(--muted);margin-bottom:20px}
.success-ico{width:62px;height:62px;border-radius:99px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;margin:8px auto 18px}
.success-ico svg{width:30px;height:30px}
.order-id{font-family:ui-monospace,monospace;font-size:.8rem;background:var(--surface);border:1px dashed var(--line);padding:8px 12px;border-radius:8px;display:inline-block;margin:6px 0 16px}
.dl-list{display:grid;gap:8px;margin:16px 0}
.dl-list a{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;border:1px solid var(--line);border-radius:10px;font-size:.82rem;font-weight:600;background:var(--surface)}
.dl-list a:hover{border-color:var(--brand)}

/* extras: progresso, marquee, fab, chat */
.scroll-bar{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,var(--brand),var(--accent));z-index:75;transition:width .1s linear;pointer-events:none}
.announce{overflow:hidden;position:relative}
.announce.marquee{padding:0}
.announce.marquee .announce-track{display:inline-flex;gap:64px;white-space:nowrap;padding:9px 0;animation:marquee 28s linear infinite;will-change:transform}
.announce.marquee .announce-track span{padding-right:64px}
.announce.marquee:hover .announce-track{animation-play-state:paused}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.fab-stack{position:fixed;right:18px;bottom:20px;z-index:76;display:flex;flex-direction:column;gap:10px;align-items:flex-end}
.fab{display:inline-flex;align-items:center;gap:9px;border-radius:99px;font-weight:800;font-size:.8rem;transition:.2s;backdrop-filter:blur(12px)}
.fab-wa{padding:12px 17px;background:#25D366;color:#03150a;box-shadow:0 16px 34px -14px rgba(37,211,102,.75)}
.fab-wa:hover{transform:translateY(-2px);box-shadow:0 20px 40px -14px rgba(37,211,102,.85)}
.fab-wa svg{width:20px;height:20px}
.fab-top{width:42px;height:42px;justify-content:center;background:color-mix(in srgb,var(--surface) 88%,transparent);border:1px solid var(--line);color:var(--text);opacity:0;pointer-events:none;transform:translateY(8px)}
.fab-top.show{opacity:1;pointer-events:auto;transform:none}
.fab-top:hover{border-color:var(--brand)}
.card-media::after{content:"";position:absolute;inset:-20%;background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.14) 49%,transparent 60%);transform:translateX(-110%);transition:transform .85s cubic-bezier(.2,.7,.2,1);pointer-events:none;z-index:1}
.card:hover .card-media::after{transform:translateX(110%)}
.card-quick{position:absolute;top:10px;right:10px;z-index:2;width:34px;height:34px;border-radius:99px;background:color-mix(in srgb,var(--bg) 72%,transparent);border:1px solid var(--line);display:grid;place-items:center;backdrop-filter:blur(8px);opacity:0;transform:translateY(-4px);transition:.2s;color:var(--text)}
.card:hover .card-quick,.card:focus-within .card-quick{opacity:1;transform:none}
.card-quick:hover{background:var(--brand);color:var(--brand-ink);border-color:transparent}
.card-quick svg{width:16px;height:16px}
@media (hover:none){.card-quick{opacity:1;transform:none}}
.ship-goal{margin:4px 0 2px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface2)}
.ship-goal.done{border-color:color-mix(in srgb,var(--accent) 45%,var(--line));background:color-mix(in srgb,var(--accent) 8%,var(--surface))}
.ship-goal-top{font-size:.73rem;color:var(--muted);margin-bottom:7px;line-height:1.45}
.ship-goal-top b{color:var(--text)}
.ship-bar{height:5px;border-radius:99px;background:var(--line);overflow:hidden}
.ship-bar span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--brand),var(--accent));transition:width .35s}
.chat-head{display:flex;align-items:center;gap:11px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);margin-bottom:12px}
.chat-avatar{width:40px;height:40px;border-radius:99px;background:var(--brand-soft);border:1px solid color-mix(in srgb,var(--brand) 40%,var(--line));display:grid;place-items:center;color:var(--brand);font-weight:800;font-size:.95rem;overflow:hidden;flex:none}
.chat-avatar img{width:100%;height:100%;object-fit:cover}
.chat-head strong{display:block;font-size:.9rem;line-height:1.25}
.chat-head .online{display:flex;align-items:center;gap:5px;font-size:.7rem;color:var(--accent);margin-top:2px}
.chat-head .online::before{content:"";width:7px;height:7px;border-radius:99px;background:var(--accent);box-shadow:0 0 8px var(--accent)}
.chat-head .secure{margin-left:auto;font-size:.64rem;color:var(--muted);display:flex;align-items:center;gap:4px;white-space:nowrap}
.chat-thread{max-height:270px;overflow:auto;display:flex;flex-direction:column;gap:9px;padding:3px 2px 6px}
.chat-msg{max-width:88%;padding:10px 13px;border-radius:14px;font-size:.84rem;line-height:1.5;white-space:pre-line;word-break:break-word}
.chat-msg.seller{align-self:flex-start;background:var(--surface);border:1px solid var(--line);border-bottom-left-radius:4px}
.chat-msg.customer{align-self:flex-end;background:var(--brand);color:var(--brand-ink);border-bottom-right-radius:4px}
.chat-msg.system{align-self:center;background:transparent;color:var(--muted);font-size:.68rem;text-align:center;padding:3px 10px;max-width:100%}
.chat-msg .msg-time{display:block;font-size:.6rem;opacity:.62;margin-top:4px}
.chat-pix-card{margin-top:9px;padding:9px 11px;border:1px dashed color-mix(in srgb,var(--brand) 55%,var(--line));border-radius:10px;background:color-mix(in srgb,var(--bg) 55%,transparent)}
.chat-pix-card small{display:block;font-size:.6rem;text-transform:uppercase;letter-spacing:.11em;color:var(--muted);margin-bottom:3px}
.chat-pix-card code{display:block;font-size:.73rem;font-family:ui-monospace,monospace;word-break:break-all;color:var(--text)}
.chat-pix-card button{margin-top:7px;font-size:.68rem;font-weight:800;color:var(--brand);text-decoration:underline}
.chat-typing{display:inline-flex;gap:4px;padding:12px 15px;align-self:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;border-bottom-left-radius:4px}
.chat-typing i{width:5px;height:5px;border-radius:99px;background:var(--muted);animation:typing 1s infinite}
.chat-typing i:nth-child(2){animation-delay:.15s}
.chat-typing i:nth-child(3){animation-delay:.3s}
@keyframes typing{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}
.chat-input{display:flex;gap:8px;margin-top:10px}
.chat-input input{flex:1;min-width:0;background:var(--surface);border:1px solid var(--line);border-radius:99px;padding:11px 16px;font-size:.84rem;outline:none;transition:.16s}
.chat-input input:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-soft)}
.chat-send{width:42px;height:42px;border-radius:99px;background:var(--brand);color:var(--brand-ink);display:grid;place-items:center;flex:none;transition:.18s}
.chat-send:hover{transform:translateY(-1px)}
.chat-send svg{width:17px;height:17px}
.chat-note{font-size:.67rem;color:var(--muted);margin-top:8px;line-height:1.55}
.chat-note a{color:var(--brand);text-decoration:underline;font-weight:700}
.chat-quick{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
.chat-quick button{font-size:.69rem;padding:6px 10px;border:1px solid var(--line);border-radius:99px;color:var(--muted);background:transparent;transition:.16s}
.chat-quick button:hover{border-color:var(--brand);color:var(--text)}
.chat-actions{display:grid;gap:8px;margin-top:14px}
.pix-reveal{margin-top:14px;border-top:1px dashed var(--line);padding-top:14px}
.gateway-open{display:inline-flex;margin-top:8px}
.share-btn{display:inline-flex}

.toast{position:fixed;bottom:24px;left:50%;transform:translate(-50%,120%);background:var(--text);color:var(--bg);padding:12px 20px;border-radius:12px;font-size:.84rem;font-weight:700;z-index:200;transition:transform .3s cubic-bezier(.2,.8,.2,1);box-shadow:0 20px 40px rgba(0,0,0,.3);max-width:calc(100% - 32px);text-align:center}
.toast.show{transform:translate(-50%,0)}

[data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
[data-reveal].in{opacity:1;transform:none}

@media (max-width:1024px){
  .hero-grid{grid-template-columns:1fr;gap:44px}
  .hero-media{max-width:520px}
  .f1{left:6px}.f2{right:6px}
  .benefits{grid-template-columns:1fr 1fr}
  .benefit:nth-child(3){border-left:0}
  .benefit{padding:12px 8px}
  .quotes{grid-template-columns:1fr}
  .foot-grid{grid-template-columns:1fr 1fr}
  .about{grid-template-columns:1fr}
  .about-media{order:-1}
  .product-view{grid-template-columns:1fr}
  .pv-media img{aspect-ratio:16/10}
  .grid-products{--cols:min(var(--cols),3)}
}
@media (max-width:820px){
  .nav-links{display:none}
  .menu-toggle{display:inline-flex}
  .mobile-menu.open{display:block}
  .grid-products{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cards-outline .card{background:var(--surface)}
  .search{margin-left:0;width:100%;min-width:0}
  .catalog-tools{gap:10px}
  .hero-stats{gap:22px}
  .section-head{margin-bottom:26px}
}
@media (max-width:560px){
  .wrap{width:calc(100% - 32px)}
  .benefits{grid-template-columns:1fr}
  .benefit{border-left:0!important;border-top:1px solid var(--line);padding:14px 2px}
  .benefit:first-child{border-top:0}
  .grid-products{grid-template-columns:1fr}
  .card-media{aspect-ratio:4/3.6}
  .foot-grid{grid-template-columns:1fr;gap:22px}
  .row2{grid-template-columns:1fr}
  .modal{padding:0}
  .modal-card{max-height:100vh;border-radius:0;min-height:100%}
  .hero-actions .btn{width:100%}
  .hero-float{display:none}
  .drawer{width:100%}
  .fab-stack{right:12px;bottom:12px}
  .fab-wa{padding:12px}
  .fab-wa span{display:none}
  .chat-thread{max-height:230px}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  [data-reveal]{opacity:1;transform:none}
}
`;

/* ------------------------------------------------------------------ */
/* Runtime da loja (injetado no HTML final)                            */
/* ------------------------------------------------------------------ */

function storefrontRuntime() {
  'use strict';
  const S = window.OC_STORE || {};
  const PREVIEW = !!window.OC_PREVIEW;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const money = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100);
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const digits = (s) => String(s || '').replace(/\D+/g, '');
  function validCpf(cpf) {
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
  function pixKeyValue(raw, type) {
    const key = String(raw || '').trim();
    if (!key) return '';
    const d = digits(key);
    let kind = type && type !== 'auto' ? type : '';
    if (!kind) {
      if (key.includes('@')) kind = 'email';
      else if (key.startsWith('+')) kind = 'telefone';
      else if (d.length === 14) kind = 'cnpj';
      else if (d.length === 11) kind = validCpf(d) ? 'cpf' : 'telefone';
      else if (d.length === 10 || d.length === 12 || d.length === 13) kind = 'telefone';
    }
    if (kind === 'telefone') {
      if (key.startsWith('+')) return '+' + d;
      if (d.length === 10 || d.length === 11) return '+55' + d;
      return '+' + d;
    }
    if (kind === 'cpf' || kind === 'cnpj') return d;
    return key;
  }
  const CART_KEY = 'oc_cart_' + (S.id || 'loja');
  const ORDER_KEY = 'oc_orders_v1';
  const PRODUCTS = (S.products || []).filter((p) => p.active !== false);

  const state = {
    cart: readCart(),
    coupon: null,
    step: 1,
    order: null,
    lastProduct: null,
    gatewayPayment: null,
    filter: 'all',
    search: '',
    chat: [],
    chatRevealed: false,
    chatReplied: false,
    pixDeadline: 0,
  };

  function readCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter((it) => it && it.id && it.qty > 0) : [];
    } catch { return []; }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch { /* ignore */ }
  }

  function cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); }

  function cartSubtotal() {
    return state.cart.reduce((sum, item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      return sum + (p ? p.price : 0) * item.qty;
    }, 0);
  }

  function discount() {
    if (!state.coupon) return 0;
    return Math.round(cartSubtotal() * (state.coupon.percent / 100));
  }

  function hasPhysical() {
    return state.cart.some((item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      return p && p.type === 'fisico';
    });
  }

  function shippingCost() {
    const sh = S.shipping || {};
    if (!sh.enabled || !hasPhysical()) return 0;
    if (sh.freeAbove > 0 && cartSubtotal() >= sh.freeAbove) return 0;
    if (sh.mode === 'free') return 0;
    if (sh.mode === 'fixed') return Number(sh.flatRate) || 0;
    return 0;
  }

  function orderTotal() {
    return Math.max(0, cartSubtotal() - discount() + shippingCost());
  }

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 3200);
  }

  /* ---------------- cart UI ---------------- */

  function renderCart() {
    const body = $('#cartBody');
    const foot = $('#cartFoot');
    const count = $('#cartCount');
    if (count) {
      count.textContent = String(cartCount());
      count.style.display = cartCount() ? 'grid' : 'none';
    }
    if (!body) return;

    if (!state.cart.length) {
      body.innerHTML = '<div class="empty"><b>Seu carrinho está vazio</b>Explore os produtos e adicione o que você gostar.</div>';
      if (foot) foot.innerHTML = '<button class="btn btn-primary btn-block" data-close-cart>Ver produtos</button>';
      return;
    }

    body.innerHTML = state.cart.map((item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      if (!p) return '';
      return '<div class="cart-item">' +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        '<div><div class="nm">' + esc(p.name) + '</div>' +
        '<div class="pr">' + money(p.price) + '</div>' +
        '<div class="qty"><button data-qty="-" data-id="' + esc(p.id) + '" aria-label="Diminuir">−</button><span>' + item.qty + '</span><button data-qty="+" data-id="' + esc(p.id) + '" aria-label="Aumentar">+</button></div>' +
        '<button class="rm" data-remove="' + esc(p.id) + '">remover</button></div>' +
        '<strong style="font-size:.86rem">' + money(p.price * item.qty) + '</strong>' +
        '</div>';
    }).join('');

    if (!foot) return;
    const sub = cartSubtotal();
    const ship = shippingCost();
    const disc = discount();
    const total = orderTotal();
    const freeAbove = Number(S.shipping?.freeAbove) || 0;
    const goalPct = freeAbove > 0 ? Math.min(100, Math.round((sub / freeAbove) * 100)) : 0;
    const shipGoal = S.shipping?.enabled && hasPhysical() && freeAbove > 0
      ? '<div class="ship-goal' + (sub >= freeAbove ? ' done' : '') + '">' +
        '<div class="ship-goal-top">' + (sub >= freeAbove ? '🎉 Você ganhou <b>frete grátis</b>!' : 'Faltam <b>' + money(freeAbove - sub) + '</b> para o frete grátis') + '</div>' +
        '<div class="ship-bar"><span style="width:' + goalPct + '%"></span></div></div>'
      : '';
    foot.innerHTML =
      (S.coupons && S.coupons.length
        ? '<div class="coupon"><input id="couponInput" placeholder="Cupom de desconto" value="' + esc(state.coupon ? state.coupon.code : '') + '"><button class="btn btn-ghost btn-sm" data-apply-coupon>Aplicar</button></div>'
        : '') +
      shipGoal +
      '<div class="line"><span>Subtotal</span><strong>' + money(sub) + '</strong></div>' +
      (ship ? '<div class="line"><span>Frete</span><strong>' + money(ship) + '</strong></div>' : (hasPhysical() && freeAbove ? '<div class="line"><span>Frete</span><strong style="color:var(--accent)">Grátis</strong></div>' : '')) +
      (disc ? '<div class="line"><span>Desconto (' + esc(state.coupon.code) + ')</span><strong style="color:var(--accent)">− ' + money(disc) + '</strong></div>' : '') +
      '<div class="line total"><span>Total</span><strong>' + money(total) + '</strong></div>' +
      '<button class="btn btn-primary btn-block" style="margin-top:14px" data-checkout>Finalizar compra</button>' +
      '<div class="trustline"><span>🔒 PIX seguro</span><span>⚡ Confirmação rápida</span></div>';
  }

  function addToCart(id, qty) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    if (p.stock !== null && p.stock <= 0) { toast('Produto esgotado'); return; }
    const existing = state.cart.find((i) => i.id === id);
    const wanted = (existing ? existing.qty : 0) + (qty || 1);
    if (p.stock !== null && wanted > p.stock) { toast('Só temos ' + p.stock + ' unidade(s)'); return; }
    if (existing) existing.qty = wanted;
    else state.cart.push({ id, qty: qty || 1 });
    saveCart();
    renderCart();
    toast('Adicionado ao carrinho');
  }

  function changeQty(id, delta) {
    const item = state.cart.find((i) => i.id === id);
    if (!item) return;
    const p = PRODUCTS.find((x) => x.id === id);
    const next = item.qty + delta;
    if (next <= 0) { state.cart = state.cart.filter((i) => i.id !== id); }
    else if (p && p.stock !== null && next > p.stock) { toast('Estoque máximo atingido'); return; }
    else item.qty = next;
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    state.cart = state.cart.filter((i) => i.id !== id);
    saveCart();
    renderCart();
  }

  /* ---------------- overlays ---------------- */

  function openOverlay(id) {
    const ov = $('#overlay');
    if (ov) ov.classList.add('open');
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlays() {
    const ov = $('#overlay');
    if (ov) ov.classList.remove('open');
    $$('.drawer.open,.modal.open').forEach((el) => el.classList.remove('open'));
    document.body.style.overflow = '';
  }

  /* ---------------- product modal ---------------- */

  function openProduct(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    state.lastProduct = p;
    const gallery = [p.image].concat(p.gallery || []).filter(Boolean);
    const view = $('#productView');
    if (!view) return;
    view.innerHTML =
      '<div class="pv-media"><img id="pvMain" src="' + esc(gallery[0]) + '" alt="' + esc(p.name) + '">' +
      (gallery.length > 1 ? '<div class="pv-thumbs">' + gallery.map((g, i) => '<button class="' + (i === 0 ? 'active' : '') + '" data-thumb="' + esc(g) + '"><img src="' + esc(g) + '" alt=""></button>').join('') + '</div>' : '') +
      '</div>' +
      '<div class="pv-body"><span class="card-cat">' + esc(p.category || 'Produto') + '</span>' +
      '<h2>' + esc(p.name) + '</h2>' +
      (p.short ? '<p class="muted" style="font-size:.9rem">' + esc(p.short) + '</p>' : '') +
      '<div class="pv-price"><strong>' + money(p.price) + '</strong>' + (p.compareAt > p.price ? '<s>' + money(p.compareAt) + '</s>' : '') + '</div>' +
      '<p class="pv-note"><span style="color:var(--accent)">●</span> ' + esc(p.type === 'digital' ? (p.deliveryText || 'Acesso imediato após o pagamento') : (p.deliveryText || 'Envio para todo o Brasil')) + '</p>' +
      (p.description ? '<p class="desc">' + esc(p.description) + '</p>' : '') +
      (p.stock !== null ? '<p class="pv-note">' + (p.stock > 0 ? p.stock + ' disponível(is) em estoque' : 'Produto esgotado') + '</p>' : '') +
      '<div class="pv-actions"><button class="btn btn-primary" style="flex:1" data-add="' + esc(p.id) + '" ' + (p.stock === 0 ? 'disabled' : '') + '>Adicionar ao carrinho</button>' +
      (S.contact && S.contact.whatsapp ? '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + esc(waHref("Olá! Tenho uma dúvida sobre " + p.name)) + '">Dúvida</a>' : '') +
      '<button class="btn btn-ghost share-btn" data-share="' + esc(p.id) + '" aria-label="Compartilhar produto" style="padding:14px 16px"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4.2M8.6 13.4l6.8 4.2"/></svg></button>' +
      '</div>' +
      '<div class="trustline"><span>🔒 Ambiente seguro</span><span>↩ 7 dias de garantia</span></div>' +
      '</div>';
    openOverlay('productModal');
  }

  function waHref(text) {
    const phone = digits(S.contact && S.contact.whatsapp);
    if (!phone) return '#';
    const full = phone.startsWith('55') ? phone : '55' + phone;
    return 'https://wa.me/' + full + '?text=' + encodeURIComponent(text);
  }

  /* ---------------- PIX ---------------- */

  function crc16(payload) {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function tlv(id, value) {
    const v = String(value == null ? '' : value);
    return id + String(v.length).padStart(2, '0') + v;
  }

  function cleanText(value, max) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim().toUpperCase().slice(0, max);
  }

  function pixPayload(amount, txid, description) {
    const p = S.payment || {};
    const key = pixKeyValue(p.pixKey, p.pixKeyType);
    if (!key) return '';
    const account = tlv('00', 'br.gov.bcb.pix') + tlv('01', key) + (description ? tlv('02', cleanText(description, 40)) : '');
    let payload = tlv('00', '01') + tlv('26', account) + tlv('52', '0000') + tlv('53', '986');
    if (amount > 0) payload += tlv('54', (amount / 100).toFixed(2));
    payload += tlv('58', 'BR') + tlv('59', cleanText(p.holderName || S.name, 25) || 'LOJA') +
      tlv('60', cleanText(p.city || 'SAO PAULO', 15) || 'BRASIL') +
      tlv('62', tlv('05', String(txid || '***').replace(/[^a-zA-Z0-9*]/g, '').slice(0, 25) || '***')) + '6304';
    return payload + crc16(payload);
  }

  function qrMarkup(payload) {
    const lib = window.qrcode;
    if (typeof lib !== 'function' || !payload) return '';
    try {
      if (lib.stringToBytesFuncs && lib.stringToBytesFuncs['UTF-8']) lib.stringToBytes = lib.stringToBytesFuncs['UTF-8'];
      const qr = lib(0, 'M');
      qr.addData(payload);
      qr.make();
      const count = qr.getModuleCount();
      const size = 216, margin = 4;
      const cell = (size - margin * 2) / count;
      let d = '';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (qr.isDark(r, c)) d += 'M' + (margin + c * cell).toFixed(2) + ',' + (margin + r * cell).toFixed(2) + 'h' + cell.toFixed(2) + 'v' + cell.toFixed(2) + 'h-' + cell.toFixed(2) + 'z';
        }
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" width="216" height="216" viewBox="0 0 216 216" role="img" aria-label="QR Code PIX"><rect width="216" height="216" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
    } catch (err) {
      return '';
    }
  }

  /* ---------------- checkout ---------------- */

  function cartPayload() {
    return state.cart.map((item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      return p ? { id: p.id, name: p.name, price: p.price, qty: item.qty, type: p.type, image: p.image, fileUrl: p.fileUrl } : null;
    }).filter(Boolean);
  }

  function openCheckout() {
    if (!state.cart.length) { toast('Adicione um produto primeiro'); return; }
    const min = Number(S.checkout && S.checkout.minOrder) || 0;
    if (min && orderTotal() < min) { toast('Pedido mínimo de ' + money(min)); return; }
    state.step = 1;
    renderCheckout();
    openOverlay('checkoutModal');
  }

  function goStep(n) {
    state.step = n;
    renderCheckout();
  }

  function discountInfo() {
    return { value: discount(), code: state.coupon ? state.coupon.code : '' };
  }

  function gatewayInfo() {
    const g = (S.payment && S.payment.gateway) || {};
    const manual = !g.provider || g.provider === 'manual';
    const configured = !manual && (!!g.endpoint || (g.provider === 'mercadopago' && !!g.apiKey));
    return { ...g, manual, configured };
  }

  function manualChatMode() {
    const p = S.payment || {};
    const g = gatewayInfo();
    return p.manualChat !== false && (g.manual || !g.configured);
  }

  function nowTime() {
    try { return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    catch (err) { return ''; }
  }

  function pushChat(from, text, extra) {
    state.chat.push(Object.assign({ from, text, time: nowTime() }, extra || {}));
  }

  function scrollChat() {
    const el = $('#chatThread');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function chatPixCard() {
    const key = (S.payment && S.payment.pixKey) || '';
    if (!key) return '';
    return '<div class="chat-pix-card"><small>Chave PIX para pagamento</small><code>' + esc(key) + '</code>' +
      '<button type="button" data-copy-key="' + esc(key) + '">Copiar chave</button></div>';
  }

  function seedChat(order) {
    const first = String(order.customer?.name || '').trim().split(/\s+/)[0] || 'tudo bem';
    const p = S.payment || {};
    pushChat('seller', 'Olá, ' + first + '! 👋\nSeu pedido ' + order.id + ' foi reservado no valor de ' + money(order.total) + '.');
    pushChat(
      'seller',
      p.pixKey
        ? 'Para pagar, faça um PIX de ' + money(order.total) + ' para a chave abaixo e envie o comprovante por aqui.'
        : 'O vendedor ainda não cadastrou a chave PIX. Me chame no WhatsApp para receber os dados de pagamento.',
      p.pixKey ? { pix: true } : null
    );
    pushChat('system', 'Pagamento manual · o vendedor confirma o recebimento');
    if (p.instructions) pushChat('system', p.instructions);
  }

  function chatTranscript() {
    return state.chat
      .filter((m) => m.from !== 'system')
      .map((m) => (m.from === 'customer' ? 'Cliente: ' : 'Loja: ') + m.text)
      .join('\n');
  }

  function chatWhatsAppText(order) {
    return orderWhatsAppText(order) + '\n\nConversa:\n' + chatTranscript();
  }

  function chatBubble(m) {
    if (m.from === 'system') return '<div class="chat-msg system">' + esc(m.text) + '</div>';
    return '<div class="chat-msg ' + m.from + '">' + esc(m.text).replace(/\n/g, '<br>') +
      (m.pix ? chatPixCard() : '') +
      '<span class="msg-time">' + esc(m.time) + '</span></div>';
  }

  function chatReveal(order) {
    if (!order.pix) {
      return '<div class="pix-reveal"><div class="co-review" style="margin:0;text-align:center;font-size:.8rem;color:var(--muted)">A chave PIX ainda não foi cadastrada pela loja. Combine o pagamento pelo WhatsApp.</div></div>';
    }
    const qr = qrMarkup(order.pix);
    return '<div class="pix-reveal">' +
      '<div class="pix-box">' +
      (qr ? '<div class="pix-qr">' + qr + '</div>' : '') +
      '<div class="copybox"><code id="pixCode">' + esc(order.pix) + '</code><button class="btn btn-ghost btn-sm" data-copy-pix>Copiar</button></div>' +
      '<div class="timer">Valor: <b>' + money(order.total) + '</b>' + (S.payment && S.payment.pixExpiration ? ' · expira em <b id="pixTimer">' + pad(S.payment.pixExpiration) + ':00</b>' : '') + '</div>' +
      '</div></div>';
  }

  function renderChatCheckout(order, body) {
    const wa = S.contact && S.contact.whatsapp;
    const revealed = state.chatRevealed && !!order.pix;
    const logo = S.logoImage
      ? '<img src="' + esc(S.logoImage) + '" alt="">'
      : esc((S.name || 'L').slice(0, 1).toUpperCase());
    body.innerHTML =
      '<div class="step-title">Fale com o vendedor</div>' +
      '<p class="step-sub">Seu pedido foi reservado. O vendedor envia a chave PIX nesta conversa.</p>' +
      '<div class="chat-head">' +
        '<span class="chat-avatar">' + logo + '</span>' +
        '<div><strong>' + esc(S.name || 'Loja') + '</strong><span class="online">online agora</span></div>' +
        '<span class="secure">🔒 ambiente seguro</span>' +
      '</div>' +
      '<div class="chat-thread" id="chatThread">' + state.chat.map(chatBubble).join('') + '</div>' +
      '<div class="chat-quick">' +
        '<button type="button" data-quick-chat="Qual o prazo de entrega?">Prazo de entrega</button>' +
        '<button type="button" data-quick-chat="Posso pagar agora?">Posso pagar agora?</button>' +
        '<button type="button" data-quick-chat="Preciso de ajuda com o PIX">Ajuda com o PIX</button>' +
      '</div>' +
      '<form class="chat-input" id="chatForm" autocomplete="off">' +
        '<input id="chatInput" maxlength="500" placeholder="Escreva para o vendedor…" aria-label="Mensagem para o vendedor">' +
        '<button class="chat-send" type="submit" aria-label="Enviar mensagem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>' +
      '</form>' +
      '<div class="chat-note">' +
        (wa
          ? 'A conversa fica salva neste dispositivo. Para resposta em tempo real, <a href="' + esc(waHref(chatWhatsAppText(order))) + '" target="_blank" rel="noopener">continue no WhatsApp</a>.'
          : 'O vendedor confirma o pagamento manualmente. Guarde o comprovante do PIX.') +
      '</div>' +
      (revealed ? chatReveal(order) : '') +
      '<div class="chat-actions">' +
        (!revealed ? '<button class="btn btn-ghost btn-block" data-reveal-pix>Ver QR Code e copia-e-cola</button>' : '') +
        '<button class="btn btn-primary btn-block" data-confirm-order>Já fiz o PIX · confirmar pedido</button>' +
        (wa ? '<a class="btn btn-ghost btn-block" href="' + esc(waHref(chatWhatsAppText(order))) + '" target="_blank" rel="noopener">Continuar no WhatsApp</a>' : '') +
        '<button class="btn btn-block" style="color:var(--muted);font-size:.8rem" data-back-step>Voltar</button>' +
      '</div>' +
      '<div class="trustline"><span>💬 Atendimento direto</span><span>🔒 PIX oficial</span></div>';
    if (revealed) startTimer();
    setTimeout(scrollChat, 40);
  }

  function sendChatMessage(text) {
    const value = String(text || '').trim();
    if (!value) return;
    pushChat('customer', value);
    renderCheckout();
    setTimeout(scrollChat, 30);
    if (!state.chatReplied) {
      state.chatReplied = true;
      setTimeout(() => {
        pushChat('seller', 'Anotado! Já registrei sua mensagem. Assim que o PIX cair eu confirmo o pedido. Se precisar de algo, é só chamar. ✅');
        if (state.step === 2) {
          renderCheckout();
          setTimeout(scrollChat, 30);
        }
      }, 900);
    }
  }

  function renderReview() {
    return '<div class="co-review">' +
      cartPayload().map((it) => '<div class="line"><span>' + it.qty + '× ' + esc(it.name) + '</span><strong>' + money(it.price * it.qty) + '</strong></div>').join('') +
      '<div class="line" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px"><span>Total</span><strong>' + money(orderTotal()) + '</strong></div>' +
      '</div>';
  }

  function renderCheckout() {
    const body = $('#coBody');
    const head = $('#coHead');
    if (!body) return;
    if (head) {
      head.innerHTML = '<h3 style="font-size:1.05rem">Finalizar compra</h3><div class="co-steps"><div class="' + (state.step >= 1 ? 'on' : '') + '"></div><div class="' + (state.step >= 2 ? 'on' : '') + '"></div><div class="' + (state.step >= 3 ? 'on' : '') + '"></div></div>';
    }

    if (state.step === 1) {
      const c = S.checkout || {};
      const f = c.fields || {};
      body.innerHTML =
        '<div class="step-title">Seus dados</div><p class="step-sub">Precisamos apenas do essencial para enviar o pedido.</p>' +
        renderReview() +
        '<form id="buyerForm" novalidate>' +
        '<div class="field"><label for="fName">Nome completo *</label><input id="fName" name="name" autocomplete="name" placeholder="Como podemos te chamar?"><span class="err">Informe seu nome.</span></div>' +
        (f.email !== false ? '<div class="field"><label for="fEmail">E-mail' + (c.requireEmail ? ' *' : '') + '</label><input id="fEmail" name="email" type="email" autocomplete="email" placeholder="voce@email.com"><span class="err">Informe um e-mail válido.</span></div>' : '') +
        (f.phone !== false ? '<div class="field"><label for="fPhone">WhatsApp' + (c.requirePhone ? ' *' : '') + '</label><input id="fPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999"><span class="err">Informe um WhatsApp válido.</span></div>' : '') +
        (f.document ? '<div class="field"><label for="fDoc">CPF/CNPJ</label><input id="fDoc" name="document" inputmode="numeric" placeholder="Somente números"></div>' : '') +
        (f.address ? '<div class="field"><label for="fAddr">Endereço de entrega' + (c.requireAddress ? ' *' : '') + '</label><textarea id="fAddr" name="address" placeholder="Rua, número, bairro, cidade e CEP"></textarea><span class="err">Informe o endereço.</span></div>' : '') +
        (f.notes ? '<div class="field"><label for="fNotes">Observações (opcional)</label><textarea id="fNotes" name="notes" placeholder="Alguma informação para a loja?"></textarea></div>' : '') +
        '<button class="btn btn-primary btn-block" type="submit" style="margin-top:8px">Continuar para o pagamento</button>' +
        '</form>' +
        '<div class="trustline"><span>🔒 Seus dados ficam com a loja</span></div>';
      const form = $('#buyerForm');
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        if (validateBuyer(form)) startPayment(new FormData(form));
      });
    }

    if (state.step === 2) {
      const order = state.pendingOrder || buildOrder(state.buyer || {});
      if (manualChatMode()) { renderChatCheckout(order, body); return; }
      const g = gatewayInfo();
      const gp = state.gatewayPayment;
      const payload = (gp && gp.payload) || order.pix || '';
      const qr = gp && gp.qr
        ? '<div class="pix-qr"><img src="' + esc(gp.qr) + '" alt="QR Code PIX" style="width:216px;height:216px;display:block"></div>'
        : qrMarkup(payload);
      const link = (gp && gp.url) || '';
      const wa = S.contact && S.contact.whatsapp;
      body.innerHTML =
        '<div class="step-title">Pague com PIX</div><p class="step-sub">' +
          (g.configured ? 'A cobrança é gerada e confirmada automaticamente pelo gateway da loja.' : 'Escaneie o QR Code ou copie o código no app do seu banco.') +
        '</p>' +
        (payload || qr
          ? '<div class="pix-box">' + (qr || '') +
            (payload ? '<div class="copybox"><code id="pixCode">' + esc(payload) + '</code><button class="btn btn-ghost btn-sm" data-copy-pix>Copiar</button></div>' : '') +
            '<div class="timer">Valor: <b>' + money(order.total) + '</b>' + (S.payment && S.payment.pixExpiration ? ' · expira em <b id="pixTimer">' + pad(S.payment.pixExpiration) + ':00</b>' : '') + '</div>' +
            '<div class="line total" style="justify-content:center;gap:10px"><span style="color:var(--muted);font-size:.8rem">Pedido</span><strong style="font-size:.95rem">' + esc(order.id) + '</strong></div>' +
            '</div>'
          : '<div class="co-review" style="margin-bottom:12px"><div class="line" style="display:block;line-height:1.6"><strong>Pagamento combinado com a loja</strong><br><span style="color:var(--muted);font-size:.82rem">A loja ainda não cadastrou a chave PIX. ' + (wa ? 'Fale no WhatsApp para receber os dados.' : 'Entre em contato para finalizar o pagamento.') + '</span></div>' +
            (wa ? '<a class="btn btn-ghost btn-sm" style="margin-top:10px" href="' + esc(waHref(orderWhatsAppText(order))) + '" target="_blank" rel="noopener">Falar com a loja</a>' : '') +
            '</div>') +
        (link ? '<a class="btn btn-primary btn-block gateway-open" href="' + esc(link) + '" target="_blank" rel="noopener">Abrir checkout do gateway</a>' : '') +
        (g.configured ? '<button class="btn btn-ghost btn-block" data-gateway style="margin:10px 0">' + (gp ? 'Gerar nova cobrança' : 'Gerar cobrança automática') + '</button>' : '') +
        '<button class="btn btn-primary btn-block" data-confirm-order>Já paguei · enviar pedido</button>' +
        '<button class="btn btn-block" style="margin-top:8px;color:var(--muted);font-size:.8rem" data-back-step>Voltar</button>' +
        '<div class="trustline"><span>⚡ Confirmação após o pagamento</span><span>🔒 PIX oficial</span></div>';
      startTimer();
    }

    if (state.step === 3) {
      const order = state.order || {};
      const downloads = (order.items || []).filter((i) => i.type === 'digital' && i.fileUrl);
      body.innerHTML =
        '<div class="center">' +
        '<div class="success-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        '<h3 style="font-size:1.5rem">' + esc((S.checkout && S.checkout.successTitle) || 'Pedido recebido!') + '</h3>' +
        '<p class="step-sub">' + esc((S.checkout && S.checkout.successText) || 'Obrigado pela compra. Enviamos os próximos passos para o seu WhatsApp.') + '</p>' +
        '<div class="order-id">Pedido ' + esc(order.id || '') + '</div>' +
        (order.pix && manualChatMode() ? '<details style="margin:0 0 16px;text-align:left"><summary style="cursor:pointer;font-size:.78rem;color:var(--muted);text-align:center">Ver código PIX do pedido</summary><div class="copybox" style="margin-top:8px"><code>' + esc(order.pix) + '</code><button class="btn btn-ghost btn-sm" data-copy-key="' + esc(order.pix) + '">Copiar</button></div></details>' : '') +
        (downloads.length ? '<div class="dl-list">' + downloads.map((d) => '<a href="' + esc(d.fileUrl) + '" target="_blank" rel="noopener"><span>Baixar ' + esc(d.name) + '</span><span>↓</span></a>').join('') + '</div>' : '') +
        (S.contact && S.contact.whatsapp ? '<a class="btn btn-primary btn-block" style="margin-top:6px" target="_blank" rel="noopener" href="' + esc(waHref(manualChatMode() ? chatWhatsAppText(order) : orderWhatsAppText(order))) + '">Enviar comprovante no WhatsApp</a>' : '') +
        '<button class="btn btn-block" style="margin-top:10px;color:var(--muted);font-size:.82rem" data-close-cart>Continuar comprando</button>' +
        '</div>';
    }
  }

  function validateBuyer(form) {
    let ok = true;
    const c = S.checkout || {};
    const f = c.fields || {};
    const setErr = (name, bad) => {
      const input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      const field = input.closest('.field');
      field.classList.toggle('invalid', bad);
      if (bad) ok = false;
    };
    const name = form.querySelector('[name="name"]').value.trim();
    setErr('name', name.length < 2);
    const emailEl = form.querySelector('[name="email"]');
    if (emailEl) setErr('email', (c.requireEmail && !emailEl.value.trim()) || (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value)));
    const phoneEl = form.querySelector('[name="phone"]');
    if (phoneEl) setErr('phone', (c.requirePhone && digits(phoneEl.value).length < 10) || (phoneEl.value && digits(phoneEl.value).length < 10));
    const addrEl = form.querySelector('[name="address"]');
    if (addrEl && f.address) setErr('address', c.requireAddress && addrEl.value.trim().length < 8);
    if (!ok) { const bad = form.querySelector('.field.invalid input,.field.invalid textarea'); if (bad) bad.focus(); }
    return ok;
  }

  function buildOrder(buyer) {
    const items = cartPayload();
    const total = orderTotal();
    const id = 'OC' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
    const description = items.length === 1 ? items[0].name : S.name + ' · ' + items.length + ' itens';
    return {
      id,
      storeId: S.id,
      storeName: S.name,
      createdAt: new Date().toISOString(),
      customer: {
        name: buyer.name || '',
        email: buyer.email || '',
        phone: buyer.phone || '',
        document: buyer.document || '',
        address: buyer.address || '',
        notes: buyer.notes || '',
      },
      items: items.map((it) => ({ ...it })),
      subtotal: cartSubtotal(),
      shipping: shippingCost(),
      discount: discount(),
      total,
      coupon: state.coupon ? state.coupon.code : '',
      payment: 'pix',
      status: 'pendente',
      pix: pixPayload(total, id, description),
      description,
      source: 'loja',
    };
  }

  function startPayment(formData) {
    const buyer = {};
    for (const [k, v] of formData.entries()) buyer[k] = String(v).trim();
    state.buyer = buyer;
    state.order = buildOrder(buyer);
    state.pendingOrder = state.order;
    state.chat = [];
    state.chatRevealed = false;
    state.chatReplied = false;
    state.gatewayPayment = null;
    state.pixDeadline = 0;
    if (manualChatMode()) seedChat(state.order);
    persistOrder(state.order, 'order.created');
    state.step = 2;
    renderCheckout();
  }

  let timerHandle = null;
  function startTimer() {
    clearInterval(timerHandle);
    const el = $('#pixTimer');
    if (!el) return;
    const minutes = Number(S.payment && S.payment.pixExpiration) || 0;
    if (!minutes) return;
    if (!state.pixDeadline) state.pixDeadline = Date.now() + minutes * 60000;
    const tick = () => {
      const left = Math.max(0, Math.round((state.pixDeadline - Date.now()) / 1000));
      if (left <= 0) {
        clearInterval(timerHandle);
        if (el.isConnected) el.textContent = 'expirado';
        return;
      }
      if (el.isConnected) el.textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60);
    };
    tick();
    timerHandle = setInterval(tick, 1000);
  }

  function orderWhatsAppText(order) {
    const items = (order.items || []).map((i) => i.qty + 'x ' + i.name + ' — ' + money(i.price * i.qty)).join('\n');
    return 'Olá! Acabei de fazer o pedido ' + order.id + ' na ' + S.name + '.\n\n' + items + '\n\nTotal: ' + money(order.total) + '\nPagamento: PIX' + (order.pix ? '\n\nPIX copia e cola:\n' + order.pix : '');
  }

  function persistOrder(order, event) {
    const evt = event || 'order.updated';
    try {
      const all = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
      const list = Array.isArray(all) ? all : [];
      const snapshot = JSON.parse(JSON.stringify(order));
      const idx = list.findIndex((o) => o && o.id === order.id);
      if (idx >= 0) list[idx] = snapshot;
      else list.unshift(snapshot);
      localStorage.setItem(ORDER_KEY, JSON.stringify(list.slice(0, 500)));
    } catch (err) { /* storage cheio */ }

    if (PREVIEW && window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'oc:order', order, event: evt }, '*'); } catch (err) { /* ignore */ }
    }

    // webhook opcional
    const url = S.payment && S.payment.webhookUrl;
    if (url) {
      const body = JSON.stringify({ event: evt, storeId: S.id, storeName: S.name, order });
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
        .catch(() => {
          try {
            fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body });
          } catch (err) { /* ignore */ }
        });
    }
  }

  function pickValue(source, keys) {
    for (const key of keys) {
      const value = source && source[key];
      if (value != null && value !== '') return value;
    }
    return '';
  }

  function normalizeQr(value) {
    const v = String(value || '').trim();
    if (!v) return '';
    if (/^data:image\//i.test(v) || /^https?:\/\//i.test(v)) return v;
    if (v.startsWith('000201')) return '';
    if (/^[A-Za-z0-9+/=\r\n]+$/.test(v) && v.length > 120) return 'data:image/png;base64,' + v.replace(/\s+/g, '');
    return '';
  }

  function mapGatewayPayment(payment) {
    const payload = String(pickValue(payment, ['payload', 'pix_copy_paste', 'pixCopiaECola', 'pix_copia_e_cola', 'brCode', 'brcode', 'emv', 'code']) || '');
    const qr = normalizeQr(pickValue(payment, ['qr', 'qrCode', 'qr_code', 'qr_code_base64', 'encodedImage', 'imagemQrcode', 'qrcode']));
    const url = String(pickValue(payment, ['url', 'ticket_url', 'init_point', 'checkoutUrl', 'checkout_url', 'invoiceUrl', 'link', 'paymentLink']) || '');
    return { payload, qr, url };
  }

  async function apiCharge(order) {
    const g = (S.payment && S.payment.gateway) || {};
    if (!g.provider || g.provider === 'manual') return null;

    if (g.endpoint) {
      let res;
      try {
        res = await fetch(g.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: g.provider,
            storeId: S.id,
            store: { name: S.name, slug: S.slug || '' },
            order,
            env: g.env || 'sandbox',
          }),
        });
      } catch (err) {
        throw new Error('Não foi possível conectar ao endpoint do gateway. Verifique a URL e o CORS.');
      }
      const raw = await res.text();
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch (err) { data = {}; }
      if (!res.ok) {
        const firstError = Array.isArray(data.errors) ? data.errors[0] : null;
        const message = data.message || data.error || data.detail || (firstError && (firstError.description || firstError.message)) || ('HTTP ' + res.status);
        throw new Error(String(message));
      }
      const payment = data.payment || data.data || data.pix || data;
      const mapped = mapGatewayPayment(payment);
      if (!mapped.payload && !mapped.qr && !mapped.url) throw new Error('O gateway respondeu sem QR Code ou link de pagamento.');
      return mapped;
    }

    if (g.provider === 'mercadopago' && g.apiKey) {
      let res;
      try {
        res = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + g.apiKey, 'X-Idempotency-Key': order.id },
          body: JSON.stringify({
            transaction_amount: Number((order.total / 100).toFixed(2)),
            description: order.description || ('Pedido ' + order.id),
            payment_method_id: 'pix',
            external_reference: order.id,
            payer: { email: order.customer.email || 'cliente@' + (location.hostname || 'loja.com'), first_name: String(order.customer.name || 'Cliente').split(' ')[0] },
          }),
        });
      } catch (err) {
        throw new Error('O Mercado Pago bloqueou a chamada direta (CORS). Use o endpoint serverless em Pagamentos.');
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const cause = Array.isArray(data.cause) && data.cause[0] ? data.cause[0].description || data.cause[0].code : '';
        throw new Error('Mercado Pago: ' + (data.message || cause || res.status));
      }
      const tx = (data.point_of_interaction && data.point_of_interaction.transaction_data) || {};
      return {
        payload: tx.qr_code || '',
        qr: tx.qr_code_base64 ? 'data:image/png;base64,' + tx.qr_code_base64 : '',
        url: tx.ticket_url || '',
      };
    }

    throw new Error('Configure o endpoint do gateway em Pagamentos para usar ' + (g.provider || 'esta opção') + '.');
  }

  function confirmOrder() {
    const order = state.order;
    if (!order) return;
    order.status = 'pendente';
    order.payment = 'pix';
    order.updatedAt = new Date().toISOString();
    if (state.gatewayPayment) order.gateway = { provider: gatewayInfo().provider, url: state.gatewayPayment.url || '', qr: state.gatewayPayment.qr || '' };
    persistOrder(order, 'order.updated');
    try {
      const value = order.total / 100;
      const items = (order.items || []).map((i) => ({ item_id: i.id, item_name: i.name, price: i.price / 100, quantity: i.qty }));
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'purchase', { transaction_id: order.id, value, currency: 'BRL', items });
      }
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', { value, currency: 'BRL', content_ids: (order.items || []).map((i) => i.id), content_type: 'product' });
      }
    } catch (err) { /* analytics é opcional */ }
    state.step = 3;
    state.cart = [];
    saveCart();
    renderCart();
    renderCheckout();
  }

  function applyCoupon() {
    const input = $('#couponInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) { state.coupon = null; renderCart(); return; }
    const found = (S.coupons || []).find((c) => c.active !== false && String(c.code).toUpperCase() === code);
    if (!found) { toast('Cupom inválido'); return; }
    state.coupon = { code: found.code, percent: Number(found.percent) || 0 };
    renderCart();
    toast('Cupom aplicado: ' + found.percent + '% OFF');
  }

  /* ---------------- init ---------------- */

  function init() {
    renderCart();

    const menu = $('#menuToggle');
    if (menu) menu.addEventListener('click', () => $('#mobileMenu').classList.toggle('open'));

    const search = $('#storeSearch');
    if (search) {
      search.addEventListener('input', () => {
        state.search = search.value.toLowerCase().trim();
        applyFilters();
      });
    }

    document.addEventListener('click', (ev) => {
      const t = ev.target;
      const openP = t.closest('[data-open-product]');
      if (openP) { ev.preventDefault(); openProduct(openP.getAttribute('data-open-product')); return; }
      const add = t.closest('[data-add]');
      if (add) { ev.preventDefault(); addToCart(add.getAttribute('data-add'), Number(add.getAttribute('data-qty') || 1)); return; }
      if (t.closest('[data-open-cart]')) { ev.preventDefault(); renderCart(); openOverlay('cartDrawer'); return; }
      if (t.closest('[data-close-cart]')) { ev.preventDefault(); closeOverlays(); return; }
      if (t.closest('[data-close]')) { ev.preventDefault(); closeOverlays(); return; }
      if (t.closest('#overlay')) { closeOverlays(); return; }
      if (t.closest('[data-checkout]')) { ev.preventDefault(); closeOverlays(); setTimeout(openCheckout, 160); return; }
      const qty = t.closest('[data-qty]');
      if (qty) { ev.preventDefault(); changeQty(qty.getAttribute('data-id'), qty.getAttribute('data-qty') === '+' ? 1 : -1); return; }
      const rm = t.closest('[data-remove]');
      if (rm) { ev.preventDefault(); removeItem(rm.getAttribute('data-remove')); return; }
      if (t.closest('[data-apply-coupon]')) { ev.preventDefault(); applyCoupon(); return; }
      const chip = t.closest('[data-filter]');
      if (chip) {
        ev.preventDefault();
        state.filter = chip.getAttribute('data-filter');
        $$('.chip').forEach((c) => c.classList.toggle('active', c === chip));
        applyFilters();
        return;
      }
      if (t.closest('[data-copy-pix]')) {
        ev.preventDefault();
        const code = $('#pixCode');
        if (!code) return;
        const text = code.textContent;
        const done = () => toast('Código PIX copiado');
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(done);
        else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }
        return;
      }
      if (t.closest('[data-reveal-pix]')) {
        ev.preventDefault();
        state.chatRevealed = true;
        renderCheckout();
        return;
      }
      const copyKey = t.closest('[data-copy-key]');
      if (copyKey) {
        ev.preventDefault();
        const value = copyKey.getAttribute('data-copy-key') || '';
        const done = () => toast('Chave PIX copiada');
        if (navigator.clipboard) navigator.clipboard.writeText(value).then(done).catch(done);
        else { const ta = document.createElement('textarea'); ta.value = value; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }
        return;
      }
      const quick = t.closest('[data-quick-chat]');
      if (quick) { ev.preventDefault(); sendChatMessage(quick.getAttribute('data-quick-chat')); return; }
      if (t.closest('[data-confirm-order]')) { ev.preventDefault(); confirmOrder(); return; }
      if (t.closest('[data-back-step]')) { ev.preventDefault(); goStep(1); return; }
      if (t.closest('[data-gateway]')) {
        ev.preventDefault();
        const btn = t.closest('[data-gateway]');
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Gerando cobrança…';
        apiCharge(state.order).then((res) => {
          if (!res || (!res.payload && !res.qr && !res.url)) throw new Error('O gateway não retornou dados de pagamento.');
          state.gatewayPayment = res;
          if (res.payload) state.order.pix = res.payload;
          state.order.status = 'pendente';
          state.order.payment = 'pix';
          state.order.gateway = { provider: gatewayInfo().provider, url: res.url || '', qr: res.qr || '' };
          state.order.updatedAt = new Date().toISOString();
          persistOrder(state.order, 'order.updated');
          toast('Cobrança automática gerada');
          renderCheckout();
        }).catch((err) => {
          toast(err && err.message ? err.message : 'Não foi possível gerar a cobrança.');
          btn.disabled = false;
          btn.textContent = original;
        });
        return;
      }
      if (t.closest('[data-share]')) {
        ev.preventDefault();
        const id = t.closest('[data-share]').getAttribute('data-share');
        const p = PRODUCTS.find((x) => x.id === id);
        const url = location.origin + location.pathname + '#produto=' + encodeURIComponent(id);
        const title = p ? p.name + ' · ' + S.name : S.name;
        if (navigator.share) navigator.share({ title, text: p ? p.short || p.name : S.name, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Link do produto copiado'));
        else toast(url);
        return;
      }
      if (t.closest('#toTop')) {
        ev.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const thumb = t.closest('[data-thumb]');
      if (thumb) {
        const main = $('#pvMain');
        if (main) main.src = thumb.getAttribute('data-thumb');
        $$('.pv-thumbs button').forEach((b) => b.classList.toggle('active', b === thumb));
        return;
      }
      if (t.closest('[data-copy-link]')) {
        ev.preventDefault();
        const link = location.href;
        if (navigator.clipboard) navigator.clipboard.writeText(link).then(() => toast('Link copiado'));
        return;
      }
    });

    document.addEventListener('submit', (ev) => {
      const form = ev.target;
      if (form && form.id === 'chatForm') {
        ev.preventDefault();
        const input = $('#chatInput');
        sendChatMessage(input ? input.value : '');
      }
    });

    const bar = $('#scrollBar');
    const topBtn = $('#toTop');
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      if (bar) bar.style.width = pct + '%';
      if (topBtn) topBtn.classList.toggle('show', window.scrollY > 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') closeOverlays();
    });

    // reveal
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      $$('[data-reveal]').forEach((el) => io.observe(el));
    } else {
      $$('[data-reveal]').forEach((el) => el.classList.add('in'));
    }

    // deep link para produto: #produto=id
    const match = location.hash.match(/produto=([\w-]+)/);
    if (match) setTimeout(() => openProduct(match[1]), 300);
  }

  function applyFilters() {
    const cards = $$('#productGrid .card');
    let visible = 0;
    cards.forEach((card) => {
      const id = card.getAttribute('data-id');
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return;
      const catOk = state.filter === 'all' || p.category === state.filter;
      const searchOk = !state.search || (p.name + ' ' + (p.short || '') + ' ' + p.category).toLowerCase().includes(state.search);
      const show = catOk && searchOk;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    const empty = $('#noResults');
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}

/* ------------------------------------------------------------------ */
/* Geração do HTML                                                     */
/* ------------------------------------------------------------------ */

let qrSourceCache = null;

export async function getQrLibSource() {
  if (qrSourceCache) return qrSourceCache;
  try {
    const res = await fetch(new URL('../vendor/qrcode.js', import.meta.url));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    qrSourceCache = await res.text();
    return qrSourceCache;
  } catch (err) {
    console.warn('QR lib não carregada:', err);
    return '/* qrcode indisponível */';
  }
}

const iconSet = {
  zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  truck: '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  headset: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 14h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-6ZM3 14h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3v-6Z"/>',
};

function benefitIcon(name) {
  const path = iconSet[name] || iconSet.zap;
  return '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

function highlightTitle(title, word) {
  const safeTitle = esc(title);
  if (!word) return safeTitle;
  const idx = safeTitle.toLowerCase().indexOf(esc(word).toLowerCase());
  if (idx < 0) return safeTitle;
  const before = safeTitle.slice(0, idx);
  const match = safeTitle.slice(idx, idx + esc(word).length);
  return before + '<span class="hl">' + match + '</span>' + safeTitle.slice(idx + esc(word).length);
}

function googleFontsUrl(store) {
  const families = new Set([store.theme.font, store.theme.heading].filter(Boolean));
  const params = [];
  for (const name of families) {
    const font = FONT_MAP[name] || FONT_MAP.Sora;
    params.push('family=' + font);
  }
  return params.length ? 'https://fonts.googleapis.com/css2?' + params.map((p) => p + '&display=swap').join('&') : '';
}

function analyticsHead(store) {
  const out = [];
  const ga = String(store.integrations?.ga4 || '').trim();
  if (/^G-[A-Z0-9]{4,}$/i.test(ga)) {
    out.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"></script>`);
    out.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');</script>`);
  }
  const pixel = String(store.integrations?.metaPixel || '').trim();
  if (/^\d{6,20}$/.test(pixel)) {
    out.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');</script>`);
    out.push(`<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1" alt=""></noscript>`);
  }
  return out.join('\n');
}

const FONT_MAP = {
  'Sora': 'Sora:wght@300;400;500;600;700;800',
  'Inter': 'Inter:wght@300;400;500;600;700;800',
  'Manrope': 'Manrope:wght@300;400;500;600;700;800',
  'Space Grotesk': 'Space+Grotesk:wght@300;400;500;600;700',
  'Outfit': 'Outfit:wght@300;400;500;600;700;800',
  'DM Sans': 'DM+Sans:wght@300;400;500;600;700;800',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800',
  'Bricolage Grotesque': 'Bricolage+Grotesque:wght@300;400;500;600;700;800',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700;800',
};

function contrastInk(hex) {
  const h = String(hex || '#FF5C35').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#0A0B0F' : '#FFFFFF';
}

export function themeVars(theme = {}) {
  return [
    `--brand:${theme.primary || '#FF5C35'}`,
    `--brand-ink:${contrastInk(theme.primary || '#FF5C35')}`,
    `--brand-soft:${theme.primarySoft || 'rgba(255,92,53,.14)'}`,
    `--accent:${theme.accent || '#34D399'}`,
    `--bg:${theme.bg || '#07080B'}`,
    `--surface:${theme.surface || '#0F1218'}`,
    `--surface2:${theme.surface2 || '#161A23'}`,
    `--text:${theme.text || '#F4F6FB'}`,
    `--muted:${theme.muted || '#9AA3B8'}`,
    `--line:${theme.line || 'rgba(255,255,255,.09)'}`,
    `--radius:${theme.radius || 20}px`,
    `--font:'${theme.font || 'Sora'}'`,
    `--heading:'${theme.heading || theme.font || 'Sora'}'`,
  ].join(';');
}

/**
 * Monta o HTML completo da loja.
 * @param {object} store loja normalizada
 * @param {{preview?:boolean}} opts
 */
export async function buildStoreHTML(store, opts = {}) {
  const preview = !!opts.preview;
  const s = store;
  const theme = s.theme || {};
  const products = (s.products || []).filter((p) => p.active !== false);
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const cols = Math.min(4, Math.max(1, Number(s.catalog?.itemsPerRow) || 3));
  const heroClass = theme.heroStyle || 'split';
  const cardStyle = theme.cardStyle || 'glow';
  const hasPhysical = products.some((p) => (p.type || 'fisico') === 'fisico');
  const hasDigital = products.some((p) => (p.type || 'fisico') === 'digital');
  const physicalProduct = products.find((p) => (p.type || 'fisico') === 'fisico');
  const floatTitle = physicalProduct
    ? physicalProduct.deliveryText || 'Envio em até 24h'
    : products[0]?.deliveryText || 'Acesso imediato';
  const floatSub = physicalProduct
    ? hasDigital ? 'digital e para todo o Brasil' : 'para todo o Brasil'
    : 'direto no seu e-mail';
  const payBadges = ['PIX', ...(s.payment?.cardEnabled ? ['VISA', 'MASTER'] : [])]
    .map((b) => `<span class="pay-badge">${b}</span>`)
    .join('');
  const seoTitle = s.seo?.title || `${s.name} — ${s.tagline || 'Loja online'}`;
  const seoDesc = s.seo?.description || s.description || s.hero?.subtitle || '';
  const wa = s.contact?.whatsapp || '';
  const fontsUrl = googleFontsUrl(s);

  const productCards = products.map((p) => {
    const soldOut = p.stock !== null && p.stock <= 0;
    return `<article class="card" data-id="${esc(p.id)}" data-reveal>
      <div class="card-media">
        ${p.badge ? `<span class="badge ${p.badge.toLowerCase().includes('mais') || p.badge.toLowerCase().includes('novo') ? 'hot' : ''}">${esc(p.badge)}</span>` : ''}
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="800" height="920">
        ${soldOut ? '<div class="soldout">Esgotado</div>' : `<button class="card-quick" data-add="${esc(p.id)}" aria-label="Adicionar ${esc(p.name)} ao carrinho"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>`}
      </div>
      <div class="card-body">
        <span class="card-cat">${esc(p.category || 'Produto')}</span>
        <h3 class="card-name">${esc(p.name)}</h3>
        ${p.short ? `<p class="card-short">${esc(p.short)}</p>` : ''}
        <div class="card-foot">
          <div class="price">
            <strong>${brl(p.price)}</strong>
            ${p.compareAt > p.price ? `<s>${brl(p.compareAt)}</s>` : ''}
            <span class="pix" style="flex-basis:100%">à vista no PIX</span>
          </div>
          <button class="btn btn-primary btn-sm" data-open-product="${esc(p.id)}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Esgotado' : 'Comprar'}</button>
        </div>
      </div>
    </article>`;
  }).join('');

  const benefitsHtml = (s.benefits || []).map((b, i) => `<div class="benefit" data-reveal style="transition-delay:${i * 50}ms">
      <span class="bi">${benefitIcon(b.icon)}</span>
      <div><strong>${esc(b.title)}</strong><p>${esc(b.text)}</p></div>
    </div>`).join('');

  const quotesHtml = (s.testimonials?.items || []).map((t, i) => `<div class="quote" data-reveal style="transition-delay:${i * 70}ms">
      <div class="stars">★★★★★</div>
      <p>“${esc(t.text)}”</p>
      <div class="who">
        <span class="avatar">${t.avatar ? `<img src="${esc(t.avatar)}" alt="">` : esc((t.name || '?').slice(0, 1).toUpperCase())}</span>
        <div><strong>${esc(t.name)}</strong><span>${esc(t.role || 'Cliente')}</span></div>
      </div>
    </div>`).join('');

  const faqHtml = (s.faq?.items || []).map((item, i) => `<details ${i === 0 ? 'open' : ''}>
      <summary>${esc(item.q)}</summary>
      <p>${esc(item.a)}</p>
    </details>`).join('');

  const statsHtml = (s.hero?.stats || []).map((st) => `<div><strong>${esc(st.value)}</strong><span>${esc(st.label)}</span></div>`).join('');
  const aboutBullets = (s.about?.bulletPoints || []).map((b) => `<li>${esc(b)}</li>`).join('');

  const whatsappHref = wa ? `https://wa.me/${(onlyDigits(wa).startsWith('55') ? onlyDigits(wa) : '55' + onlyDigits(wa))}?text=${encodeURIComponent('Olá! Vim pelo site da ' + s.name + ' e quero saber mais.')}` : '';

  const announceText = s.announcement?.enabled ? String(s.announcement.text || '').trim() : '';
  const announceHtml = announceText
    ? announceText.length > 70
      ? `<div class="announce marquee" aria-label="${esc(announceText)}"><div class="announce-track"><span>${esc(announceText)}</span><span aria-hidden="true">${esc(announceText)}</span></div></div>`
      : `<div class="announce">${esc(announceText)}</div>`
    : '';
  const fabHtml = `<div class="fab-stack">
    ${whatsappHref ? `<a class="fab fab-wa" href="${esc(whatsappHref)}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.3-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg><span>Fale conosco</span></a>` : ''}
    <button class="fab fab-top" id="toTop" aria-label="Voltar ao topo"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
  </div>`;

  const navLinks = [
    products.length ? '<a href="#catalogo">Produtos</a>' : '',
    s.about?.enabled ? '<a href="#sobre">Sobre</a>' : '',
    s.testimonials?.enabled && s.testimonials.items.length ? '<a href="#depoimentos">Depoimentos</a>' : '',
    s.faq?.enabled && s.faq.items.length ? '<a href="#faq">FAQ</a>' : '',
  ].filter(Boolean).join('');

  const logo = s.logoImage
    ? `<img src="${esc(s.logoImage)}" alt="${esc(s.name)}">`
    : `<span class="dot"></span><span>${esc(s.logoText || s.name)}</span>`;

  const favicon = s.seo?.favicon ? `<link rel="icon" href="${esc(s.seo.favicon)}">` : '';
  const customHead = s.integrations?.customHead || '';

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seoTitle)}</title>
<meta name="description" content="${esc(seoDesc).slice(0, 300)}">
${s.seo?.keywords ? `<meta name="keywords" content="${esc(String(s.seo.keywords)).slice(0, 300)}">` : ''}
<meta name="theme-color" content="${esc(theme.bg || '#07080B')}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(seoTitle)}">
<meta property="og:description" content="${esc(seoDesc).slice(0, 300)}">
${s.seo?.ogImage || s.hero?.image ? `<meta property="og:image" content="${esc(s.seo?.ogImage || s.hero?.image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
${favicon}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontsUrl ? `<link href="${fontsUrl}" rel="stylesheet">` : ''}
<style>
:root{${themeVars(theme)}}
${STORE_CSS}
${s.integrations?.customCss || ''}
</style>
${analyticsHead(s)}
${customHead}
</head>
<body class="cards-${esc(cardStyle)}">
<div class="scroll-bar" id="scrollBar" aria-hidden="true"></div>
<a class="skip" href="#catalogo">Ir para os produtos</a>
${announceHtml}
<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="#" aria-label="${esc(s.name)}">${logo}</a>
    <nav class="nav-links" aria-label="Navegação">${navLinks}</nav>
    <div class="nav-actions">
      ${whatsappHref ? `<a class="btn btn-ghost btn-sm" href="${esc(whatsappHref)}" target="_blank" rel="noopener" style="display:none" id="waTop">WhatsApp</a>` : ''}
      <button class="icon-btn" data-open-cart aria-label="Abrir carrinho">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-count" id="cartCount" style="display:none">0</span>
      </button>
      <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Menu">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu"><div class="wrap">${navLinks}</div></div>
</header>

<main>
  <section class="hero ${esc(heroClass)}">
    ${heroClass === 'image' && s.hero?.image ? `<div class="hero-bg"><img src="${esc(s.hero.image)}" alt=""></div>` : ''}
    <div class="wrap hero-grid">
      <div class="hero-copy">
        ${s.hero?.badge ? `<span class="eyebrow">✦ ${esc(s.hero.badge)}</span>` : ''}
        <h1>${highlightTitle(s.hero?.title || s.name, s.hero?.highlight)}</h1>
        <p class="hero-sub">${esc(s.hero?.subtitle || s.tagline)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#catalogo">${esc(s.hero?.ctaLabel || 'Ver produtos')}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          ${s.hero?.ctaSecondaryLabel && whatsappHref ? `<a class="btn btn-ghost" href="${esc(whatsappHref)}" target="_blank" rel="noopener">${esc(s.hero.ctaSecondaryLabel)}</a>` : ''}
        </div>
        ${statsHtml ? `<div class="hero-stats">${statsHtml}</div>` : ''}
      </div>
      ${heroClass !== 'image' ? `<div class="hero-media">
        <div class="hero-frame"><img src="${esc(s.hero?.image || '')}" alt="${esc(s.name)}"></div>
        <div class="hero-float f1"><span class="pill">🔒</span><div>Pagamento seguro<small>PIX · aprovação rápida</small></div></div>
        <div class="hero-float f2"><span class="pill">${hasPhysical ? '📦' : '⚡'}</span><div>${esc(floatTitle)}<small>${esc(floatSub)}</small></div></div>
      </div>` : ''}
    </div>
  </section>

  ${benefitsHtml ? `<section class="wrap"><div class="benefits">${benefitsHtml}</div></section>` : ''}

  ${s.catalog?.enabled ? `<section class="section" id="catalogo">
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="eyebrow">Loja</span>
          <h2 style="margin-top:10px">${esc(s.catalog.title || 'Produtos')}</h2>
          ${s.catalog.subtitle ? `<p>${esc(s.catalog.subtitle)}</p>` : ''}
        </div>
      </div>
      ${products.length ? `<div class="catalog-tools">
        ${s.catalog.showCategories && categories.length > 1 ? `<div class="chips">
          <button class="chip active" data-filter="all">Todos</button>
          ${categories.map((c) => `<button class="chip" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
        </div>` : ''}
        ${s.catalog.showSearch ? `<label class="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="storeSearch" type="search" placeholder="Buscar produtos…" aria-label="Buscar produtos">
        </label>` : ''}
      </div>
      <div class="grid-products" id="productGrid" style="--cols:${cols}">${productCards}</div>
      <div id="noResults" style="display:none" class="empty"><b>Nenhum produto encontrado</b>Tente outra busca ou categoria.</div>`
      : `<div class="empty"><b>Sua loja está pronta para receber produtos</b>Adicione o primeiro produto no painel do OpenCommerce.</div>`}
    </div>
  </section>` : ''}

  ${s.about?.enabled && s.about.text ? `<section class="section" id="sobre">
    <div class="wrap about">
      <div data-reveal>
        <span class="eyebrow">Sobre</span>
        <h2 style="margin-top:12px">${esc(s.about.title || 'Nossa história')}</h2>
        <p>${esc(s.about.text)}</p>
        ${aboutBullets ? `<ul>${aboutBullets}</ul>` : ''}
      </div>
      <div class="about-media" data-reveal>${s.about.image ? `<img src="${esc(s.about.image)}" alt="${esc(s.about.title || s.name)}" loading="lazy">` : ''}</div>
    </div>
  </section>` : ''}

  ${s.testimonials?.enabled && s.testimonials.items.length ? `<section class="section" id="depoimentos">
    <div class="wrap">
      <div class="section-head">
        <div><span class="eyebrow">Depoimentos</span><h2 style="margin-top:10px">${esc(s.testimonials.title)}</h2></div>
      </div>
      <div class="quotes">${quotesHtml}</div>
    </div>
  </section>` : ''}

  ${s.faq?.enabled && s.faq.items.length ? `<section class="section" id="faq">
    <div class="wrap">
      <div class="section-head" style="justify-content:center;text-align:center">
        <div><span class="eyebrow">Ajuda</span><h2 style="margin-top:10px">${esc(s.faq.title)}</h2></div>
      </div>
      <div class="faq">${faqHtml}</div>
    </div>
  </section>` : ''}

  ${s.cta?.enabled && s.cta.title ? `<section class="section"><div class="wrap"><div class="cta" data-reveal>
    <h2>${esc(s.cta.title)}</h2>
    <p>${esc(s.cta.text)}</p>
    <a class="btn btn-primary" href="#catalogo">${esc(s.cta.button || 'Ver produtos')}</a>
  </div></div></section>` : ''}
</main>

<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="#">${logo}</a>
        <p>${esc(s.description || s.tagline || '')}</p>
        <div class="pay-badges">${payBadges}</div>
      </div>
      <div class="foot-col">
        <h4>Loja</h4>
        <a href="#catalogo">Produtos</a>
        ${s.about?.enabled ? '<a href="#sobre">Sobre</a>' : ''}
        ${s.faq?.enabled ? '<a href="#faq">Dúvidas</a>' : ''}
        ${s.testimonials?.enabled ? '<a href="#depoimentos">Depoimentos</a>' : ''}
      </div>
      <div class="foot-col">
        <h4>Atendimento</h4>
        ${whatsappHref ? `<a href="${esc(whatsappHref)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        ${s.contact?.email ? `<a href="mailto:${esc(s.contact.email)}">${esc(s.contact.email)}</a>` : ''}
        ${s.contact?.instagram ? `<a href="https://instagram.com/${esc(String(s.contact.instagram).replace('@', ''))}" target="_blank" rel="noopener">@${esc(String(s.contact.instagram).replace('@', ''))}</a>` : ''}
        ${s.contact?.address ? `<p>${esc(s.contact.address)}</p>` : ''}
      </div>
      <div class="foot-col">
        <h4>Pagamento</h4>
        <p>PIX com aprovação rápida.</p>
        ${s.contact?.cnpj ? `<p>CNPJ ${esc(s.contact.cnpj)}</p>` : ''}
        ${s.shipping?.enabled ? `<p>${esc(s.shipping.note || '')}</p>` : ''}
      </div>
    </div>
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} ${esc(s.name)}. Todos os direitos reservados.</span>
      ${s.integrations?.hideBranding ? '' : `<span>Loja criada com <a href="${esc(BRAND.github)}" target="_blank" rel="noopener" style="color:var(--text);font-weight:700">OpenCommerce</a></span>`}
    </div>
  </div>
</footer>

${fabHtml}

<div class="overlay" id="overlay"></div>

<aside class="drawer" id="cartDrawer" aria-label="Carrinho">
  <div class="drawer-head">
    <h3>Seu carrinho</h3>
    <button class="icon-btn" data-close-cart aria-label="Fechar" style="width:34px;height:34px">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="drawer-body" id="cartBody"></div>
  <div class="drawer-foot" id="cartFoot"></div>
</aside>

<div class="modal" id="productModal" role="dialog" aria-modal="true">
  <div class="modal-card">
    <button class="modal-close" data-close aria-label="Fechar">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="product-view" id="productView"></div>
  </div>
</div>

<div class="modal modal-checkout" id="checkoutModal" role="dialog" aria-modal="true">
  <div class="modal-card">
    <button class="modal-close" data-close aria-label="Fechar">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="co-head" id="coHead"></div>
    <div class="co-body" id="coBody"></div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
window.OC_PREVIEW = ${preview ? 'true' : 'false'};
window.OC_STORE = ${JSON.stringify(s).replace(/</g, '\\u003c')};
${await getQrLibSource()}
(${storefrontRuntime.toString()})();
${s.integrations?.customJs || ''}
</script>
</body>
</html>`;

  return html;
}

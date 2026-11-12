/* OpenCommerce · servidor estático local (sem dependências) */
/* Uso: node server.js [--open] · ou npm start                    */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.map': 'application/json; charset=utf-8',
};

function safePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const cleaned = normalize(decoded).replace(/^([/\\])+/, '');
  const full = join(ROOT, cleaned || 'index.html');
  // impede sair da pasta do projeto
  if (full !== ROOT && !full.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) return null;
  return full;
}

async function resolveFile(full) {
  try {
    const info = await stat(full);
    if (info.isDirectory()) {
      const index = join(full, 'index.html');
      const indexInfo = await stat(index).catch(() => null);
      return indexInfo?.isFile() ? index : null;
    }
    return info.isFile() ? full : null;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Método não permitido');
    return;
  }

  const full = safePath(req.url || '/');
  if (!full) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Caminho inválido');
    return;
  }

  let file = await resolveFile(full);

  // fallback para SPA quando o caminho não tem extensão
  if (!file && !extname(full)) {
    file = await resolveFile(join(ROOT, 'index.html'));
  }

  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><meta charset="utf-8"><title>404</title>
      <body style="font-family:system-ui;background:#07080b;color:#f3f5fa;padding:10vh 24px;text-align:center">
      <h1 style="font-size:28px">404 — arquivo não encontrado</h1>
      <p style="color:#98a1b3">${String(req.url || '').replace(/[<>&"]/g, '')}</p>
      <a href="/" style="color:#ff5c35">Voltar ao início</a></body>`);
    return;
  }

  try {
    const data = await readFile(file);
    const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': data.length,
      'Cache-Control': 'no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') res.end();
    else res.end(data);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erro interno ao ler o arquivo.');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Porta ${PORT} já está em uso. Rode com outra porta:`);
    console.error(`  PORT=4321 npm start\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log('\n  OpenCommerce rodando em ' + url);
  console.log('  Pressione Ctrl+C para encerrar.\n');
  if (process.argv.includes('--open')) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => {});
  }
});

// proxy.js — rode com: node proxy.js
// Requer Node.js >= 18 (usa fetch nativo) ou npm install node-fetch
// Acesse o app em: http://localhost:3000

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const HTML_FILE = path.join(__dirname, 'squad-logwork.html');

// ─── helper: faz a requisição ao Jira e devolve { status, headers, body } ────
function proxyRequest(jiraUrl, method, authHeader, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(jiraUrl);
    const isHttps = parsed.protocol === 'https:';
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      rejectUnauthorized: false, // aceita certificados self-signed (comum em Jira on-premise)
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

    const lib = isHttps ? https : http;
    const req = lib.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks),
      }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── servidor ────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS para o browser local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Jira-Url');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve o HTML principal
  if (pathname === '/' || pathname === '/index.html') {
    try {
      const html = fs.readFileSync(HTML_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(404); res.end('squad-logwork.html não encontrado na mesma pasta.');
    }
    return;
  }

  // Lista arquivos da pasta dedoduro: GET /dedoduro/_list
  if (pathname === '/dedoduro/_list') {
    const ddDir = path.join(__dirname, 'dedoduro');
    try {
      const files = fs.readdirSync(ddDir).filter(f => f.endsWith('.json'));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ files }));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ files: [] }));
    }
    return;
  }

  // Serve arquivos JSON da pasta dedoduro: GET /dedoduro/<arquivo>.json
  if (pathname.startsWith('/dedoduro/') && pathname.endsWith('.json')) {
    const fileName = path.basename(pathname); // evita path traversal
    const filePath = path.join(__dirname, 'dedoduro', fileName);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(content);
    } catch {
      res.writeHead(404); res.end('Arquivo não encontrado');
    }
    return;
  }

  // Proxy: /proxy?url=<jira-url-completa>
  if (pathname === '/proxy') {
    // A URL do Jira vem encodada com encodeURIComponent no cliente.
    // Como é o único parâmetro da query, pegamos tudo após "url=" e decodamos.
    const rawQuery = req.url.slice(req.url.indexOf('?') + 1);
    const urlMatch = rawQuery.match(/^url=(.+)$/);
    const jiraUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : null;

    // Log para diagnóstico
    console.log(`[proxy] ${req.method} ${jiraUrl ? jiraUrl.slice(0,300) : 'URL inválida'}`);

    if (!jiraUrl) { res.writeHead(400); res.end('Parâmetro ?url= obrigatório'); return; }

    const authHeader = req.headers['authorization'] || '';

    let body = null;
    if (req.method === 'POST' || req.method === 'PUT') {
      body = await new Promise(resolve => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString()));
      });
    }

    try {
      const result = await proxyRequest(jiraUrl, req.method, authHeader, body);
      console.log(`[proxy] → ${result.status} (${result.body.length} bytes)`);
      res.writeHead(result.status, {
        'Content-Type': result.headers['content-type'] || 'application/json',
      });
      res.end(result.body);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n✅ Squad Logwork proxy rodando em http://localhost:${PORT}`);
  console.log(`   Abra http://localhost:${PORT} no browser (com VPN ativa)\n`);
});

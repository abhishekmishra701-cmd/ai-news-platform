const http = require('http');
const fs = require('fs');
const path = require('path');

const categories = {
  India: ['India policy and economy update'], World: ['World leaders discuss global affairs'], Geopolitics: ['Geopolitical border and military developments'], 'International Relations': ['Diplomatic summit advances foreign relations'], Business: ['Business market and investment update'], Technology: ['AI chip and software technology update'], Entertainment: ['Film and music streaming entertainment news'], Sports: ['Cricket and football match sports update'], Science: ['NASA space science research discovery'], Climate: ['Climate warming carbon and renewable energy update']
};
const stories = Object.entries(categories).map(([category, [headline]], i) => ({
  id: `e2e-${i + 1}`, headline, summary: `${headline}.`, category, country: 'Global', verification_status: 'verified', source_count: 1, published_at: '2026-08-22T00:00:00.000Z'
}));
const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/news') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(stories));
  }
  let file = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const target = path.resolve(root, file);
  if (!target.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': types[path.extname(target)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('E2E mock server listening on 4173'));

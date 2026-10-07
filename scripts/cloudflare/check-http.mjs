import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const base = new URL(process.argv[2] || 'http://127.0.0.1:4182/');
const mode = process.argv[3] || 'preview';
const output = process.argv[4];
const dist = path.join(root, 'dist');
const contract = JSON.parse(await fs.readFile(path.join(root, 'scripts/migration-contract.json'), 'utf8'));
const checks = [];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function request(route, expectedFile, method = 'GET', navigate = false) {
  const r = await fetch(new URL(route, base), { method, redirect: 'manual', headers: navigate ? { 'Sec-Fetch-Mode': 'navigate' } : {}, signal: AbortSignal.timeout(30000) });
  const body = Buffer.from(await r.arrayBuffer());
  const expected = expectedFile && await fs.readFile(path.join(dist, expectedFile));
  const noindex = /noindex/.test(r.headers.get('x-robots-tag') || '');
  const passed = r.status === (expectedFile ? 200 : 404) && !r.headers.has('location') && (mode === 'preview' ? noindex : !noindex || expectedFile === 'privacy.html') && (!expectedFile || method === 'HEAD' || hash(body) === hash(expected)) && (method !== 'HEAD' || body.length === 0);
  checks.push({ route, method, navigate, status: r.status, noindex, location: r.headers.get('location'), identicalBytes: expectedFile && method !== 'HEAD' ? hash(body) === hash(expected) : null, passed });
}
for (const page of contract.pages) {
  await request(page.route, page.file);
  await request(page.route, page.file, 'HEAD');
  await request(page.route + '?cf-preview-check=1', page.file, 'GET', true);
}
await request('/index.html', 'index.html');
await request('/index.html?check=1', 'index.html', 'GET', true);
async function files(dir, prefix = '') {
  const list = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) list.push(...await files(path.join(dir, entry.name), prefix + entry.name + '/'));
    else list.push(prefix + entry.name);
  }
  return list;
}
const assets = (await files(dist)).filter(file => !file.endsWith('.html'));
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => { while (next < assets.length) { const file = assets[next++]; await request('/' + file, file); } }));
for (const missing of ['/not-a-page', '/about', '/about/', '/private-draft.html', '/src/pages/index.astro', '/cloudflare-status.json', '/_headers', '/_redirects']) await request(missing, null);
const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8');
checks.push({ name: 'five sitemap URLs', passed: (sitemap.match(/<loc>/g) || []).length === 5 });
for (const [file, sha] of Object.entries(contract.publicAliasHashes)) checks.push({ name: `historic:${file}`, passed: hash(await fs.readFile(path.join(dist, file))) === sha });
const report = { checkedAt: new Date().toISOString(), base: String(base), mode, passed: checks.every(check => check.passed), checks };
if (output) await fs.writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.passed, checks: checks.length, assets: assets.length, failures: checks.filter(check => !check.passed) }));
if (!report.passed) process.exitCode = 1;

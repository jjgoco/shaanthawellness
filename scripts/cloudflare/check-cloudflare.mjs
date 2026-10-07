import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceDigest } from '../source-digest.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode = process.argv[2];
if (!['preview', 'production'].includes(mode)) throw new Error('Specify preview or production');
const status = JSON.parse(fs.readFileSync(path.join(root, 'cloudflare-status.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(root, `wrangler-${mode}.json`), 'utf8'));
const staging = path.join(root, `.cf-${mode}`);
const issues = [];
if (config.name !== (mode === 'preview' ? 'shaantha-preview' : 'shaantha-wellness') || config.workers_dev !== (mode === 'preview') || config.preview_urls !== false) issues.push('worker identity and preview exposure');
if (path.resolve(root, config.assets.directory) !== staging) issues.push('staging directory');
if (status.previewAuthorized !== true || status.providerReviewed !== true) issues.push('preview authorization/provider review');
if (config.main || config.assets.run_worker_first || config.assets.html_handling !== 'none' || config.assets.not_found_handling !== 'none') issues.push('static exact-path routing');
if (config.routes?.length || config.observability.enabled !== false) issues.push('unapproved domains or optional logs');
if (fs.readFileSync(path.join(staging, '_redirects'), 'utf8') !== '/ /index.html 200\n') issues.push('root proxy rule');
const headers = fs.readFileSync(path.join(staging, '_headers'), 'utf8');
if (mode === 'preview' && (!headers.startsWith('/*\n  X-Robots-Tag: noindex, nofollow\n') || !headers.includes("script-src 'self' 'sha256-"))) issues.push('global preview protection/own inline script hashes');
if (mode === 'production') {
  if (status.productionApproved !== true || !status.approvedAt || status.approvedSourceSha256 !== sourceDigest()) issues.push('approval of exact production source');
  if (headers.includes('noindex')) issues.push('preview header leaked into production');
  const policy = fs.readFileSync(path.join(staging, 'privacy.html'), 'utf8');
  if (policy.includes('This test version') || policy.includes('remains hosted on GitHub Pages')) issues.push('preview policy not finalized');
}
if (issues.length) { console.error(`Cloudflare ${mode} blocked: ${issues.join(', ')}`); process.exitCode = 1; }
else console.log(`Cloudflare ${mode} preparation checks passed; source ${sourceDigest()}.`);

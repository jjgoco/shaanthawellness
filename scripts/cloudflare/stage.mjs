import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode = process.argv[2];
if (!['preview', 'production'].includes(mode)) throw new Error('Specify preview or production');
const dist = path.join(root, 'dist');
const target = path.join(root, `.cf-${mode}`);
async function files(directory, prefix = '') {
  const list = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not publishable');
    if (entry.isDirectory()) list.push(...await files(path.join(directory, entry.name), prefix + entry.name + '/'));
    else list.push(prefix + entry.name);
  }
  return list.sort();
}
const inputFiles = await files(dist);
if (inputFiles.some(file => /(?:\.bak|\.astro|\.md|package(?:-lock)?\.json)$|^(?:src|scripts|knowledge|node_modules|\.github)\//.test(file))) throw new Error('Internal files in artifact');
await fs.mkdir(target, { recursive: true });
await fs.cp(dist, target, { recursive: true });
await fs.writeFile(path.join(target, '_redirects'), '/ /index.html 200\n');
// Preview has a separate directory. Production never inherits these headers.
const scriptHashes = new Set();
for (const file of inputFiles.filter(file => file.endsWith('.html'))) {
  const html = await fs.readFile(path.join(dist, file), 'utf8');
  for (const [, attributes, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|application\/ld\+json|application\/json/i.test(attributes)) continue;
    if (script.trim()) scriptHashes.add(`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
  }
}
const previewHeaders = `/*\n  X-Robots-Tag: noindex, nofollow\n  Content-Security-Policy: script-src 'self' ${[...scriptHashes].sort().join(' ')}\n`;
if (previewHeaders.length > 2000) throw new Error('Preview CSP exceeds header budget');
await fs.writeFile(path.join(target, '_headers'), mode === 'preview' ? previewHeaders : '');
const outputFiles = await files(target);
if (JSON.stringify(outputFiles) !== JSON.stringify([...inputFiles, '_headers', '_redirects'].sort())) throw new Error('Stale or unexpected staged file; inspect generated staging directory');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
for (const file of inputFiles) {
  if (sha(await fs.readFile(path.join(dist, file))) !== sha(await fs.readFile(path.join(target, file)))) throw new Error(`Staging changed ${file}`);
}
console.log(JSON.stringify({ mode, inputFiles: inputFiles.length, outputFiles: outputFiles.length, stagedHtmlUnchanged: true, previewNoindex: mode === 'preview' }));

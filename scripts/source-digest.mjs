import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function sourceDigest() {
  const files = ['package.json', 'package-lock.json', 'astro.config.mjs', '.nvmrc', '.gitattributes'];
  const walk = (directory, prefix) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = `${prefix}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Release inputs cannot be symlinks: ${relative}`);
      if (entry.isDirectory()) walk(path.join(directory, entry.name), relative);
      else files.push(relative);
    }
  };
  for (const directory of ['src', 'public', 'scripts', '.github']) walk(path.join(project, directory), directory);
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    let data = fs.readFileSync(path.join(project, file));
    // Git may check text out as CRLF on Windows and LF on CI. Normalize only text.
    if (/\.(?:astro|css|js|mjs|json|xml|txt|yml|svg)$/.test(file) || ['.nvmrc','.gitattributes','public/CNAME','public/.nojekyll'].includes(file)) data = Buffer.from(data.toString('utf8').replace(/\r\n/g, '\n'));
    hash.update(file).update('\0').update(String(data.length)).update('\0').update(data).update('\0');
  }
  return hash.digest('hex');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(sourceDigest());

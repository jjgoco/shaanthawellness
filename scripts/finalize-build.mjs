import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = fs.realpathSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const directory = path.join(project, 'dist', '_astro');
const resolved = fs.realpathSync(directory);
if (!resolved.startsWith(project + path.sep) || resolved !== directory) throw new Error('Unsafe generated asset directory');
let removed = 0;
for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
  // Astro emits imported JPEG originals alongside transformed images. They are
  // build-generated and unused: page fallbacks are WebP; social aliases live in public/photos.
  if (entry.isFile() && (/\.(?:jpg|jpeg)$/i.test(entry.name) || /^mandala-location\..*\.png$/i.test(entry.name))) {
    fs.unlinkSync(path.join(directory, entry.name));
    removed++;
  }
}
console.log(`Finalized dist: removed ${removed} unused generated raster originals.`);

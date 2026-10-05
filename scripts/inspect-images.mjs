import fs from 'node:fs';
import sharp from 'sharp';
const html = fs.readFileSync('dist/index.html', 'utf8');
const pictures = [...html.matchAll(/<picture\b.*?<\/picture>/gs)];
for (const match of pictures.slice(0, 1)) {
  const sources = [...match[0].matchAll(/srcset="([^"]+)"/g)];
  console.log('hero srcset', sources[0]?.[1]);
  for (const candidate of sources[0][1].split(', ')) {
    const [file, descriptor] = candidate.split(' ');
    const metadata = await sharp(`dist${file}`).metadata();
    console.log(JSON.stringify({ descriptor, bytes: fs.statSync(`dist${file}`).size, width: metadata.width, height: metadata.height }));
  }
}
const original = await sharp('src/assets/photos/hero.jpg').metadata();
console.log('Original', { width: original.width, height: original.height, orientation: original.orientation });

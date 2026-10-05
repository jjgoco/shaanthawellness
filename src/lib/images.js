import { getImage } from 'astro:assets';
const photographs = import.meta.glob('../assets/photos/*.jpg', { eager: true, import: 'default' });
const generated = new Map();
export const heroSizes = '(max-width: 720px) calc(100vw - 40px), (max-width: 1200px) 40vw, 440px';
export function responsiveImage(name) {
  if (!generated.has(name)) generated.set(name, generate(name));
  return generated.get(name);
}
async function generate(name) {
  const source = photographs[`../assets/photos/${name}.jpg`];
  if (!source) throw new Error(`Unknown photograph: ${name}`);
  const maxWidth = Math.min(source.width, name === 'hero' ? 960 : 1280);
  const widths = [...new Set([240, 360, 480, 640, 720, 960, 1280, maxWidth].filter(w => w <= maxWidth))].sort((a,b) => a-b);
  const encode = format => Promise.all(widths.map(width => getImage({ src: source, width, format, quality: format === 'avif' ? 52 : 70 })));
  const [avif, webp] = await Promise.all([encode('avif'), encode('webp')]);
  const srcset = images => images.map((image, i) => `${image.src} ${widths[i]}w`).join(', ');
  return { avifSrcset: srcset(avif), webpSrcset: srcset(webp), fallback: (webp.find((_, i) => widths[i] >= 640) || webp.at(-1)).src };
}

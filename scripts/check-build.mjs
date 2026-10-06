import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// Validate the deployable files, without a dependency on the source framework.
// JSON-LD is data, and data-src is intentionally not a browser fetch attribute.
const scriptRoot = dirname(fileURLToPath(import.meta.url));
const buildRoot = resolve(process.argv[2] ?? resolve(scriptRoot, '../dist'));
const contractPath = resolve(scriptRoot, 'migration-contract.json');
const errors = [];
const report = { passed: false, buildRoot, pages: [], files: 0, violations: errors };
const fail = (code, message, page) => errors.push({ code, ...(page ? { page } : {}), message });
const compressSize = (data) => gzipSync(data, { level: 9 }).byteLength;
const hash = (text) => createHash('sha256').update(text).digest('hex');
const normalizedText = (text) => decodeEntities(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function decodeEntities(text = '') {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…', euro: '€', times: '×', copy: '©' };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (raw, entity) => {
    if (entity[0] !== '#') return named[entity] ?? raw;
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : raw;
  });
}

function attributes(source = '') {
  const attrs = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s'"=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  return attrs;
}

function tags(html) {
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
  return [...markup.matchAll(/<([a-z][\da-z:-]*)(?=\s|\/?>)((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)]
    .map((match) => ({ name: match[1].toLowerCase(), attrs: attributes(match[2]) }));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
const equal = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));

async function walk(root, prefix = '') {
  const files = [];
  for (const entry of await readdir(resolve(root, prefix), { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    if (entry.isSymbolicLink()) fail('symlink', `Build must not contain a symbolic link: ${name}`);
    else if (entry.isDirectory()) files.push(...await walk(root, `${name}/`));
    else files.push(name);
  }
  return files;
}

function sourceSetUrls(value) {
  // Generated photo sources are ordinary paths with width descriptors.
  return value.split(',').map((entry) => entry.trim().split(/\s+/)[0]).filter(Boolean);
}

async function run() {
  const contract = JSON.parse(await readFile(contractPath, 'utf8'));
  const site = new URL(contract.site);
  const files = await walk(buildRoot);
  const fileSet = new Set(files);
  report.files = files.length;
  report.sourceCommit = contract.sourceCommit;
  report.budgets = contract.budgets;
  const referenced = new Set();
  const documentCache = new Map();
  const readText = async (name) => {
    if (!documentCache.has(name)) documentCache.set(name, await readFile(resolve(buildRoot, name), 'utf8'));
    return documentCache.get(name);
  };

  function localTarget(value, source) {
    if (!value || /^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(value)) return null;
    let url;
    try { url = new URL(value, new URL(source, site)); }
    catch { fail('url', `Malformed URL: ${value}`, source); return null; }
    if (url.origin !== site.origin) return null;
    let path;
    try { path = decodeURIComponent(url.pathname).replace(/^\/+/, ''); }
    catch { fail('url', `Malformed URL escaping: ${value}`, source); return null; }
    if (!path) path = 'index.html';
    else if (path.endsWith('/')) path += 'index.html';
    const absolute = resolve(buildRoot, path);
    if (absolute !== buildRoot && !absolute.startsWith(buildRoot + sep)) {
      fail('path', `URL escapes the build: ${value}`, source);
      return null;
    }
    return { path, fragment: url.hash.slice(1) };
  }

  async function checkReference(value, source, checkFragment = false) {
    const target = localTarget(value, source);
    if (!target) return null;
    referenced.add(target.path);
    if (!fileSet.has(target.path)) {
      fail('missing-target', `${value} resolves to missing ${target.path}`, source);
      return null;
    }
    if (checkFragment && target.fragment && target.path.endsWith('.html')) {
      const targetTags = tags(await readText(target.path));
      let fragment = target.fragment;
      try { fragment = decodeURIComponent(fragment); } catch { /* Malformed IDs simply do not match. */ }
      if (!targetTags.some(({ attrs }) => attrs.id === fragment || attrs.name === fragment)) {
        fail('missing-fragment', `${value} points to an absent fragment`, source);
      }
    }
    return target.path;
  }

  async function checkFetchedReference(value, source) {
    const target = await checkReference(value, source);
    if (!value || /^(?:data:|blob:)/i.test(value)) return target;
    try {
      const url = new URL(value, new URL(source, site));
      if (url.origin !== site.origin) fail('initial-third-party', `Initial external resource is forbidden: ${url.origin}`, source);
    } catch { /* checkReference has already recorded malformed URLs. */ }
    return target;
  }

  async function checkStructuredResources(value, source, key = '') {
    if (Array.isArray(value)) for (const item of value) await checkStructuredResources(item, source, key);
    else if (value && typeof value === 'object') for (const [childKey, child] of Object.entries(value)) await checkStructuredResources(child, source, childKey);
    else if (typeof value === 'string' && ['image', 'logo', 'contentUrl', 'thumbnailUrl'].includes(key)) await checkReference(value, source);
  }

  function metaMap(pageTags) {
    const values = {};
    for (const { name, attrs } of pageTags) {
      if (name !== 'meta') continue;
      const key = attrs.name ? `name:${attrs.name}` : attrs.property ? `property:${attrs.property}` : attrs.charset ? 'charset' : attrs['http-equiv'] ? `http-equiv:${attrs['http-equiv']}` : null;
      if (key && Object.hasOwn(values, key)) fail('duplicate-meta', `Duplicate meta ${key}`);
      if (key) values[key] = key === 'charset' ? attrs.charset.toLowerCase() : attrs.content ?? '';
    }
    return values;
  }

  async function collectCss(name, seen) {
    if (seen.has(name)) return [];
    seen.add(name);
    const css = await readText(name);
    const payload = [css];
    for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi)) {
      const target = await checkFetchedReference(match[1] ?? match[2] ?? match[3], name);
      if (target?.endsWith('.css')) payload.push(...await collectCss(target, seen));
    }
    for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi)) {
      const target = await checkFetchedReference(match[1], name);
      if (target?.endsWith('.css')) payload.push(...await collectCss(target, seen));
    }
    return payload;
  }

  async function collectJs(name, seen) {
    if (seen.has(name)) return [];
    seen.add(name);
    const js = await readText(name);
    const payload = [js];
    const importPatterns = [/(?:import|export)\s+[^;]*?\bfrom\s*["']([^"']+)["']/g, /\bimport\s*(?:\(\s*)?["']([^"']+)["']/g];
    for (const pattern of importPatterns) for (const match of js.matchAll(pattern)) {
      const target = await checkReference(match[1], name);
      if (target?.endsWith('.js') || target?.endsWith('.mjs')) payload.push(...await collectJs(target, seen));
    }
    return payload;
  }

  const htmlFiles = files.filter((name) => name.endsWith('.html')).sort();
  if (!equal(htmlFiles, contract.pages.map((page) => page.file).sort())) fail('routes', `Expected exactly ${contract.pages.map((page) => page.file).join(', ')}; received ${htmlFiles.join(', ')}`);

  for (const page of contract.pages) {
    const pageReport = { route: page.route, file: page.file, htmlBytes: 0, ownJsGzipBytes: 0, cssGzipBytes: 0, photos: 0 };
    report.pages.push(pageReport);
    referenced.add(page.file);
    if (!fileSet.has(page.file)) { fail('page', 'Required published page is missing', page.file); continue; }
    const html = await readText(page.file);
    const pageTags = tags(html);
    pageReport.htmlBytes = Buffer.byteLength(html);
    const title = decodeEntities(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
    if (title !== page.title) fail('title', 'Published title changed', page.file);
    const canonicals = pageTags.filter(({ name, attrs }) => name === 'link' && (attrs.rel ?? '').split(/\s+/).includes('canonical'));
    if (canonicals.length !== 1 || canonicals[0].attrs.href !== page.canonical) fail('canonical', 'Expected one unchanged published canonical', page.file);
    const lang = pageTags.find(({ name }) => name === 'html')?.attrs.lang;
    if (lang !== page.lang) fail('language', `Expected lang=${page.lang}`, page.file);
    const metas = metaMap(pageTags);
    for (const [key, expected] of Object.entries(page.metas)) if (metas[key] !== expected) fail('meta', `Published ${key} changed or missing`, page.file);
    if (page.route !== '/privacy.html' && /(?:noindex|none)/i.test(metas['name:robots'] ?? '')) fail('indexability', 'A published indexable route now declares noindex', page.file);
    for (const [key, value] of Object.entries(metas)) if (/^(?:property:og:image|name:twitter:image)$/.test(key)) await checkReference(value, page.file);

    const jsonld = [];
    const ownScripts = [];
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attrs = attributes(match[1]);
      if (attrs.type?.toLowerCase() === 'application/ld+json') {
        try { const data = JSON.parse(match[2]); jsonld.push(data); await checkStructuredResources(data, page.file); }
        catch { fail('jsonld-syntax', 'Invalid structured JSON-LD', page.file); }
      } else if (!attrs.src) ownScripts.push(match[2]);
    }
    if (!equal(jsonld, page.jsonld)) fail('jsonld', 'Published structured data changed', page.file);

    const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => normalizedText(match[1]));
    if (!equal(h1, page.h1)) fail('heading', 'Expected the unchanged single published H1', page.file);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
    if (page.mainTextSha256 && hash(normalizedText(main)) !== page.mainTextSha256) fail('content', 'Published article main text changed', page.file);
    const paragraphs = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => normalizedText(match[1]));
    let paragraphIndex = 0;
    for (const text of page.preservedParagraphs ?? []) {
      const found = paragraphs.indexOf(text, paragraphIndex);
      if (found < 0) fail('content', `Published paragraph changed or missing: ${text.slice(0, 80)}`, page.file);
      else paragraphIndex = found + 1;
    }
    for (const id of page.preservedIds) if (!pageTags.some(({ attrs }) => attrs.id === id)) fail('anchor', `Published anchor/control #${id} changed or missing`, page.file);
    const pageLinks = pageTags.filter(({ name, attrs }) => name === 'a' && attrs.href).map(({ attrs }) => {
      try { return new URL(attrs.href, new URL(page.file, site)).href; }
      catch { return attrs.href; }
    });
    for (const link of page.preservedLinks) if (!pageLinks.includes(link)) fail('link-contract', `Published navigation/booking link changed: ${link}`, page.file);

    const cssPayload = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
    // Inline declarations are CSS too, even though transported in the HTML.
    cssPayload.push(pageTags.map(({ attrs }) => attrs.style ?? '').join('\n'));
    for (const css of cssPayload) for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi)) await checkFetchedReference(match[1] ?? match[2] ?? match[3], page.file);
    const cssSeen = new Set();
    const jsSeen = new Set();
    for (const { name, attrs } of pageTags) {
      if (name === 'iframe' && Object.hasOwn(attrs, 'src')) fail('initial-iframe', 'iframe[src] would contact the map before a click', page.file);
      if (name === 'script' && attrs.src) {
        const url = new URL(attrs.src, new URL(page.file, site));
        if (url.origin !== site.origin) fail('initial-script', `Initial external script is forbidden: ${url.origin}`, page.file);
        const target = await checkReference(attrs.src, page.file);
        if (target) ownScripts.push(...await collectJs(target, jsSeen));
      }
      if (name === 'link' && attrs.href) {
        const rel = (attrs.rel ?? '').toLowerCase().split(/\s+/);
        const target = await checkReference(attrs.href, page.file);
        if (rel.includes('stylesheet') && target) cssPayload.push(...await collectCss(target, cssSeen));
        if ((rel.includes('modulepreload') || (rel.includes('preload') && attrs.as === 'script')) && target) ownScripts.push(...await collectJs(target, jsSeen));
        if (rel.some((role) => ['stylesheet', 'preload', 'modulepreload', 'preconnect', 'dns-prefetch'].includes(role))) {
          const url = new URL(attrs.href, new URL(page.file, site));
          if (url.origin !== site.origin) fail('initial-third-party', `Initial external ${rel.join(' ')} is forbidden: ${url.origin}`, page.file);
        }
      }
      if (attrs.href && name === 'a') await checkReference(attrs.href, page.file, true);
      if (attrs.src && name !== 'script' && name !== 'iframe') {
        await checkFetchedReference(attrs.src, page.file);
      }
      if (attrs.poster) await checkFetchedReference(attrs.poster, page.file);
      if (attrs.srcset) for (const url of sourceSetUrls(attrs.srcset)) await checkFetchedReference(url, page.file);
      if (name === 'img') {
        if (!Number.isFinite(Number(attrs.width)) || Number(attrs.width) <= 0 || !Number.isFinite(Number(attrs.height)) || Number(attrs.height) <= 0) fail('image-dimensions', `Image needs explicit positive width and height: ${attrs.src}`, page.file);
        if (!Object.hasOwn(attrs, 'alt')) fail('image-alt', `Image alt attribute is missing: ${attrs.src}`, page.file);
        if (!/\.svg(?:[?#]|$)/i.test(attrs.src ?? '')) {
          pageReport.photos++;
          if (!attrs.srcset || !attrs.sizes) fail('responsive-image', `Photo needs srcset and sizes: ${attrs.src}`, page.file);
        }
      }
    }

    const pictures = [...html.matchAll(/<picture\b[^>]*>([\s\S]*?)<\/picture>/gi)];
    let picturePhotos = 0;
    for (const [, picture] of pictures) {
      const childTags = tags(picture);
      const image = childTags.find(({ name }) => name === 'img');
      if (!image || /\.svg(?:[?#]|$)/i.test(image.attrs.src ?? '')) continue;
      picturePhotos++;
      const formats = new Set(childTags.filter(({ name }) => name === 'source').map(({ attrs }) => attrs.type?.toLowerCase()));
      if (/\.webp(?:[?#]|$)/i.test(image.attrs.src ?? '')) formats.add('image/webp');
      if (!formats.has('image/avif') || !formats.has('image/webp')) fail('picture-formats', `Photo needs AVIF and WebP in picture: ${image.attrs.src}`, page.file);
      for (const source of childTags.filter(({ name }) => name === 'source')) {
        if (!source.attrs.srcset || !source.attrs.sizes) fail('picture-responsive', `Picture source needs srcset and sizes: ${image.attrs.src}`, page.file);
        const extension = source.attrs.type === 'image/avif' ? /\.avif(?:[?#]|$)/i : source.attrs.type === 'image/webp' ? /\.webp(?:[?#]|$)/i : null;
        if (extension && sourceSetUrls(source.attrs.srcset ?? '').some((url) => !extension.test(url))) fail('picture-format-url', `Source format and photo URL disagree: ${image.attrs.src}`, page.file);
      }
    }
    if (picturePhotos !== pageReport.photos || pageReport.photos !== page.photoCount) fail('picture-count', `Expected ${page.photoCount} preserved photos, all wrapped in picture; received ${pageReport.photos} photos/${picturePhotos} pictures`, page.file);
    pageReport.ownJsGzipBytes = ownScripts.reduce((sum, js) => sum + (js.trim() ? compressSize(js) : 0), 0);
    pageReport.cssGzipBytes = cssPayload.reduce((sum, css) => sum + (css.trim() ? compressSize(css) : 0), 0);
    if (pageReport.ownJsGzipBytes > contract.budgets.ownJsGzipBytes) fail('js-budget', `Own JS ${pageReport.ownJsGzipBytes} B exceeds ${contract.budgets.ownJsGzipBytes} B gzip`, page.file);
    if (pageReport.cssGzipBytes > contract.budgets.cssGzipBytes) fail('css-budget', `CSS ${pageReport.cssGzipBytes} B exceeds ${contract.budgets.cssGzipBytes} B gzip`, page.file);
  }

  for (const alias of contract.publicAliases) {
    referenced.add(alias);
    if (!fileSet.has(alias)) fail('public-alias', `Published social/structured-data asset is missing: ${alias}`);
    else if (!(await stat(resolve(buildRoot, alias))).size) fail('public-alias', `Published asset is empty: ${alias}`);
    else if (contract.publicAliasHashes?.[alias] && hash(await readFile(resolve(buildRoot, alias))) !== contract.publicAliasHashes[alias]) fail('public-alias-content', `Historical asset bytes changed: ${alias}`);
  }
  for (const name of ['CNAME', 'robots.txt', 'sitemap.xml']) referenced.add(name);
  if (!fileSet.has('CNAME') || (await readText('CNAME')).trim() !== site.hostname) fail('domain', 'CNAME must retain the current custom domain');
  if (!fileSet.has('robots.txt') || (await readText('robots.txt')).replace(/\r/g, '').trim() !== contract.robots.trim()) fail('robots', 'Published robots.txt changed');
  const sitemap = fileSet.has('sitemap.xml') ? await readText('sitemap.xml') : '';
  const locations = [...sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].map((match) => decodeEntities(match[1].trim()));
  if (!equal(locations.slice().sort(), contract.sitemap.slice().sort())) fail('sitemap', 'Sitemap must contain exactly the four existing public URLs');
  for (const location of locations) await checkReference(location, 'sitemap.xml');

  const permittedRootFiles = new Set([...contract.pages.map((page) => page.file), 'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'favicon.svg']);
  for (const name of files) {
    const basename = name.split('/').at(-1);
    if (!name.includes('/') && !permittedRootFiles.has(name)) fail('unapproved-file', `Unexpected public root file: ${name}`);
    if (/(?:^|\/)(?:drafts?|legacy|knowledge|migration-review|scripts|src|node_modules|_backup[^/]*|\.git|\.claude|\.codex)(?:\/|$)/i.test(name) || /(?:\.bak|\.map|\.md|\.docx?|\.pdf|\.zip|\.json|\.astro|\.ts|\.yml|\.yaml)$/i.test(name)) fail('private-file', `Internal/document/backup file must not be deployed: ${name}`);
    if (/\.(?:jpg|jpeg|tiff|psd)$/i.test(name) && !contract.publicAliases.includes(name)) fail('unused-original', `Unneeded original photo must not be deployed: ${name}`);
    if (/caprasimo|figtree|components\.js|dc-runtime\.js|ds-namespace\.js/i.test(name)) fail('obsolete-resource', `Unused legacy resource must not be deployed: ${name}`);
    if (name !== '.nojekyll' && name !== 'favicon.svg' && !referenced.has(name)) fail('orphan-resource', `Unreferenced public asset: ${name}`);
  }
  report.passed = errors.length === 0;
  report.checks = { routes: contract.pages.length, sitemapUrls: locations.length, aliases: contract.publicAliases.length, initialThirdPartyRequests: 'static markup checked; consent behavior requires browser tests' };
}

try { await run(); }
catch (error) { fail('validation-error', error instanceof Error ? error.message : String(error)); }
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
if (!report.passed) process.exitCode = 1;

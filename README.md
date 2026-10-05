# Shaantha Wellness · Astro migration

Static Astro build preserving the published domain and `.html` routes. Node 24 required.

```sh
npm ci
npm test
npm run dev
npm run preview
```

The source of the new site is `src/`; `public/` is an explicit allowlist of compatibility and brand assets. The original root HTML, assets and photos remain as the legacy reference; Astro does not publish them. Production must deploy **only `dist/`**.

`src/data/pages.json` defines titles, meta tags, canonicals, JSON-LD and page-specific footer links. Home and article layouts preserve their existing visual differences. Photos in `src/assets/photos` generate responsive AVIF/WebP at build time. Only established social/schema JPG URLs are copied directly into public output.

## Preview and release gate

This branch is for local review. No deployment runs on push. `release-status.json` is deliberately unapproved. `npm run check:release` must fail until the owner has confirmed legal facts and the exact visual/legal/publication result is approved. Privacy remains noindex and excluded from the sitemap.

Worktree baseline: `ea296005b9c9add8991d1f6e4b421185628e98f1`. Unpublished local home/sitemap edits and the accommodation page are preserved outside this worktree under the parent project's `migration-review/pending`; they are not published or part of this migration.

## Publish after approval

1. Confirm policy fields, GA account/provider settings and owner declarations in the parent project's `migration-review/legal` dossier; apply the final policy and rerun tests.
2. Review the exact revision's visual and performance reports; set `release-status.json` approvals only on explicit human confirmation, with a date and the result of `node scripts/source-digest.mjs` in `approvedSourceSha256`. Any change to source, assets, dependencies, checks or workflows invalidates that approval. The status file itself is excluded to avoid a self-referential digest.
3. Merge the reviewed branch into main, retaining current CNAME and DNS. Set GitHub Pages source to GitHub Actions and retain the existing custom domain and HTTPS.
4. Run the manual **Publish approved Astro site** workflow on main with approval checked. It tests the build and release gate before uploading dist.
5. Verify the five URLs, HTTP status, canonical/noindex/sitemap, assets, consent, Google Maps and WhatsApp in production. Confirm existing Search Console verification and inspect coverage/errors if access is available.

## Restore the previous static site

The parent project's `migration-review/baseline/published-ea29600.zip` is the identified snapshot. The manual **Restore published static baseline** workflow checks out that fixed commit and uploads it directly to Pages, retaining CNAME. It runs only from main with explicit approval. Alternatively restore the ZIP to a separate directory, verify it and upload it using a manual Pages artifact deployment. Do not hard-reset the original local worktree or discard its unpublished changes. Restoration changes publication and requires explicit authorization.

## Cloudflare later

The same dist is portable. Preserve all current URLs (including .html), custom domain, social image aliases, noindex, robots and four sitemap entries. Hosting/DNS, HTML URL handling and response headers must be configured and tested in that second migration. GitHub Pages headers cannot be established by adding an arbitrary `_headers` file here.

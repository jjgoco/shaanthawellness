# Shaantha Wellness · Astro migration

Static Astro build preserving the published domain and `.html` routes. Node 24 required.

```sh
npm ci
npm test
npm run dev
npm run preview
```

The source of the new site is `src/`; `public/` is an explicit allowlist of compatibility and brand assets. The original root HTML, assets and photos remain as the legacy reference; Astro does not publish them. Production must deploy **only `dist/`**.

Readability revision (2026-10-06): reading text 18 px, card text 17 px and controls 16 px; display headings unchanged. The location map is a local screenshot, fully shown with Google attribution nearby and an external link. Its capture/provenance is recorded in `src/assets/location/README.md`. The page has no Maps iframe or Maps loading script; analytics consent remains required.

`src/data/pages.json` defines titles, meta tags, canonicals, JSON-LD and page-specific footer links. Home and article layouts preserve their existing visual differences. Photos in `src/assets/photos` generate responsive AVIF/WebP at build time. All 18 historical /photos/ JPG, WebP, PNG and SVG URLs are preserved byte-for-byte for existing image links and indexing. Pages continue to load the responsive optimized assets; retaining historical files does not add them to the initial page requests. scripts/migration-contract.json lists and hashes these compatibility assets.

## Preview and release gate

This branch is for local review. No deployment runs on push. Visual and privacy text approvals are recorded; publication remains unapproved in `release-status.json`. `npm run check:release` must fail until the owner has confirmed legal facts and the exact visual/legal/publication result is approved. Privacy remains noindex and excluded from the sitemap.

Worktree baseline: `ea296005b9c9add8991d1f6e4b421185628e98f1`. Unpublished local home/sitemap edits and the accommodation page are preserved outside this worktree under the parent project's `migration-review/pending`; they are not published or part of this migration.

## Publish after approval

1. Confirm policy fields, GA account/provider settings and owner declarations in the parent project's `migration-review/legal` dossier; apply the final policy and rerun tests.
2. Review the exact revision's visual and performance reports; set `release-status.json` approvals only on explicit human confirmation, with a date and the result of `node scripts/source-digest.mjs` in `approvedSourceSha256`. Any change to source, assets, dependencies, checks or workflows invalidates that approval. The status file itself is excluded to avoid a self-referential digest.
3. Merge the reviewed branch into main, retaining current CNAME and DNS. Set GitHub Pages source to GitHub Actions and retain the existing custom domain and HTTPS.
4. Run the manual **Publish approved Astro site** workflow on main with approval checked. It tests the build and release gate before uploading dist.
5. Verify the five URLs, HTTP status, canonical/noindex/sitemap, assets, consent, Google Maps and WhatsApp in production. Compare coverage/errors with the saved Search Console baseline in the parent project (search-console-baseline-20261006). Domain ownership is verified through DNS; retain that verification.

## Restore the previous static site

The parent project's `migration-review/baseline/published-ea29600.zip` is the identified snapshot. The manual **Restore published static baseline** workflow checks out that fixed commit and uploads it directly to Pages, retaining CNAME. It runs only from main with explicit approval. Alternatively restore the ZIP to a separate directory, verify it and upload it using a manual Pages artifact deployment. Do not hard-reset the original local worktree or discard its unpublished changes. Restoration changes publication and requires explicit authorization.

## Cloudflare later

The same dist is portable. Preserve all current URLs (including .html), custom domain, social image aliases, noindex, robots and four sitemap entries. Hosting/DNS, HTML URL handling and response headers must be configured and tested in that second migration. GitHub Pages headers cannot be established by adding an arbitrary `_headers` file here.

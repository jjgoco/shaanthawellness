import fs from 'node:fs';
import { sourceDigest } from './source-digest.mjs';
import { releaseProblems } from './release-policy.mjs';
const status = JSON.parse(fs.readFileSync(new URL('../release-status.json', import.meta.url), 'utf8'));
const privacy = fs.readFileSync(new URL('../dist/privacy.html', import.meta.url), 'utf8');
const missing = releaseProblems(status, privacy, sourceDigest());
if (missing.length) {
  console.error(`Publication blocked: ${missing.join(', ')}. Complete owner review and explicit publication approval first.`);
  process.exitCode = 1;
} else console.log(`Release approved on ${status.approvedAt}.`);

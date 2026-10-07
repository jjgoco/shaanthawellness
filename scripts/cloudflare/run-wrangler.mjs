import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = path.join(root, '.wrangler-runtime');
const args = process.argv.slice(2);
if (args[0] === 'deploy' || args[0] === 'versions') {
  if (args[0] !== 'deploy') throw new Error('Use the guarded deploy command');
  const config = args[args.indexOf('--config') + 1];
  const match = /^wrangler-(preview|production)\.json$/.exec(config || '');
  if (!match || args.length !== 3) throw new Error('Deploy requires the exact approved config and no overrides');
  const check = spawnSync(process.execPath, [path.join(root, 'scripts/cloudflare/check-cloudflare.mjs'), match[1]], { cwd: root, stdio: 'inherit' });
  if (check.status !== 0) process.exit(check.status ?? 1);
}
fs.mkdirSync(runtime, { recursive: true });
const child = spawn(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), ...args], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, XDG_CONFIG_HOME: runtime, WRANGLER_LOG_PATH: path.join(runtime, 'logs'), WRANGLER_SEND_METRICS: 'false' },
});
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });

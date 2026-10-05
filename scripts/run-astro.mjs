// Cross-platform entry point: avoids Windows .cmd shims in a path containing '&'.
// Keep Astro's optional telemetry from writing to the user's global config.
process.env.ASTRO_TELEMETRY_DISABLED = '1';
process.env.NODE_DISABLE_COMPILE_CACHE = '1';
await import(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

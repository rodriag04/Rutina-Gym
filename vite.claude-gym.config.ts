import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Versión de la rutina que vive dentro de Claude (artifact): un solo JS y un solo CSS, sin service
// worker, con el chat. `npm run build:claude-gym` la deja en dist-claude-gym/rutina-de-rodrigo.html.
const raiz = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const pkg = JSON.parse(readFileSync(raiz('./package.json'), 'utf8')) as { version: string };

export default defineConfig({
  base: './',
  define: { __VERSION__: JSON.stringify(pkg.version), __CLAUDE__: 'true', __VERSION_DIETA__: '"-"' },
  resolve: { alias: { '@perfil': raiz('./src/perfiles/rodrigo/index.ts') } },
  build: {
    outDir: raiz('./dist-claude-gym'),
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { input: raiz('./claude.html'), output: { inlineDynamicImports: true } }
  },
  plugins: [preact()]
});

import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Versión de la app de comidas que vive dentro de Claude (artifact): un solo JS y un solo CSS,
// sin service worker. `npm run build:claude` la deja lista en dist-claude/comidas-de-rodri.html.
const raiz = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const pkg = JSON.parse(readFileSync(raiz('./dieta/package-info.json'), 'utf8')) as { version: string };

export default defineConfig({
  root: raiz('./dieta'),
  base: './',
  define: { __VERSION_DIETA__: JSON.stringify(pkg.version), __CLAUDE__: 'true' },
  build: {
    outDir: raiz('./dist-claude'),
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { input: raiz('./dieta/claude.html'), output: { inlineDynamicImports: true } }
  },
  plugins: [preact()]
});

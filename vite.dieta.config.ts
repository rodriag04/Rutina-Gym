import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// App de comidas: carpeta dieta/. En GitHub Pages vive en /Rutina-Gym/dieta/.
const raiz = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const pkg = JSON.parse(readFileSync(raiz('./dieta/package-info.json'), 'utf8')) as { version: string };
const base = process.env.BASE || '/';

export default defineConfig({
  root: raiz('./dieta'),
  base,
  define: { __VERSION_DIETA__: JSON.stringify(pkg.version), __CLAUDE__: 'false' },
  build: {
    outDir: process.env.OUT_DIR ? raiz(process.env.OUT_DIR) : raiz('./dist-dieta'),
    emptyOutDir: true
  },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['iconos/apple-touch-icon.png', 'iconos/favicon.svg'],
      manifest: {
        id: './',
        name: 'Comidas · Rodri',
        short_name: 'Comidas',
        description: 'Plan de comidas, compra y progreso de Rodri.',
        lang: 'es-ES',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f3a28',
        theme_color: '#0f3a28',
        icons: [
          { src: 'iconos/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'iconos/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'iconos/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
});

import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// En GitHub Pages la app vive en /Rutina-Gym/; en Netlify o Vercel, en la raíz.
const base = process.env.BASE || '/';

export default defineConfig({
  base,
  define: { __VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['iconos/apple-touch-icon.png', 'iconos/favicon.svg'],
      manifest: {
        name: 'Rutina · Rodrigo',
        short_name: 'Rutina',
        description: 'Registro de entrenamiento y progresión.',
        lang: 'es-ES',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121315',
        theme_color: '#121315',
        icons: [
          { src: 'iconos/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'iconos/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'iconos/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ],
  test: {
    environment: 'node'
  }
});

import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const pkg = JSON.parse(readFileSync(raiz('./package.json'), 'utf8'));

// Una app por persona: PERFIL=rodrigo (por defecto) o PERFIL=maricarmen. Ver src/perfiles/.
const perfil = process.env.PERFIL || 'rodrigo';
const app = JSON.parse(readFileSync(raiz(`./src/perfiles/${perfil}/app.json`), 'utf8')) as {
  nombre: string;
  corto: string;
  descripcion: string;
  iconos: string;
};
const otros = readdirSync(raiz('./src/perfiles')).filter((p) => p !== perfil && p !== 'rodrigo');

// En GitHub Pages: /Rutina-Gym/ (Rodrigo) y /Rutina-Gym/<perfil>/ (los demás). En Netlify o Vercel, la raíz.
const base = process.env.BASE || '/';

export default defineConfig({
  base,
  define: { __VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { '@perfil': raiz(`./src/perfiles/${perfil}/index.ts`) } },
  plugins: [
    preact(),
    {
      name: 'html-perfil',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) =>
          html
            .replaceAll('%APP_NOMBRE%', app.nombre)
            .replaceAll('%APP_CORTO%', app.corto)
            .replaceAll('%APP_DESCRIPCION%', app.descripcion)
            .replaceAll('%APP_ICONOS%', app.iconos)
      }
    },
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [`${app.iconos}/apple-touch-icon.png`, `${app.iconos}/favicon.svg`],
      manifest: {
        ...(perfil === 'rodrigo' ? {} : { id: `./?app=${perfil}` }),
        name: app.nombre,
        short_name: app.corto,
        description: app.descripcion,
        lang: 'es-ES',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121315',
        theme_color: '#121315',
        icons: [
          { src: `${app.iconos}/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${app.iconos}/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${app.iconos}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        globIgnores: otros.map((p) => `**/iconos/${p}/**`),
        navigateFallback: 'index.html',
        // La app de Rodrigo vive en la carpeta padre: no debe responder por las de los demás.
        // La app de comidas (/dieta/) tampoco: tiene su propio service worker.
        navigateFallbackDenylist: [...otros.map((p) => new RegExp(`/${p}/`)), /\/dieta\//],
        cleanupOutdatedCaches: true
      }
    })
  ],
  test: {
    environment: 'node'
  }
});

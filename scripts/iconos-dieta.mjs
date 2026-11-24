// Genera los PNG de la app de comidas a partir de dieta/public/iconos/favicon.svg (requiere Playwright).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = new URL('../dieta/public/iconos/', import.meta.url);
const svg = readFileSync(new URL('favicon.svg', dir), 'utf8');
const FONDO = '#0F3A28';
const salidas = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['apple-touch-icon.png', 180, true],
  ['icon-maskable-512.png', 512, true]
];
const b = await chromium.launch();
const p = await b.newPage();
for (const [nombre, t, completo] of salidas) {
  const sin = svg.replace(/<rect[^>]*\/>/, '');
  const html = completo
    ? `<body style="margin:0;background:${FONDO}"><div style="width:${t}px;height:${t}px;display:grid;place-items:center">${sin.replace('<svg ', `<svg width="${t * 0.84}" height="${t * 0.84}" `)}</div></body>`
    : `<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${t}" height="${t}" `)}</body>`;
  await p.setViewportSize({ width: t, height: t });
  await p.setContent(html);
  await p.screenshot({ path: new URL(nombre, dir).pathname, omitBackground: !completo });
  console.log('ok', nombre);
}
await b.close();

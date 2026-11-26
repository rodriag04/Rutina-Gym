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
// Portada para la versión de Claude (galería y enlaces): 1200×630 con el icono y el nombre.
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap">
<body style="margin:0;width:1200px;height:630px;background:#17432f;display:flex;align-items:center;justify-content:center;gap:56px">
${svg.replace('<svg ', '<svg width="360" height="360" ')}
<div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;line-height:1">
<div style="font-size:140px;color:#eef7ef;letter-spacing:-3px">Dieta</div>
<div style="font-size:44px;color:#C9EC6A;margin-top:14px">Comidas con Claude</div></div></body>`);
await p.waitForTimeout(800);
await p.screenshot({ path: new URL('portada.png', dir).pathname });
console.log('ok portada.png');
await b.close();

// Genera los PNG de iconos a partir de public/<carpeta>/favicon.svg (requiere Playwright).
// Uso: node scripts/iconos.mjs [carpeta]   (por defecto "iconos"; Mari Carmen: "iconos/maricarmen")
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const carpeta = process.argv[2] || 'iconos';
const svg = readFileSync(new URL(`../public/${carpeta}/favicon.svg`, import.meta.url), 'utf8');
const salidas = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['apple-touch-icon.png', 180, true],
  ['icon-maskable-512.png', 512, true]
];
const b = await chromium.launch();
const p = await b.newPage();
for (const [nombre, t, completo] of salidas) {
  // Maskable y Apple: fondo a sangre (sin esquinas) y el disco algo más pequeño.
  const html = completo
    ? `<body style="margin:0;background:#121315"><div style="width:${t}px;height:${t}px;display:grid;place-items:center">${svg.replace('<rect width="512" height="512" rx="112" fill="#121315"/>', '').replace('<svg ', `<svg width="${t * 0.78}" height="${t * 0.78}" `)}</div></body>`
    : `<body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${t}" height="${t}" `)}</body>`;
  await p.setViewportSize({ width: t, height: t });
  await p.setContent(html);
  await p.screenshot({ path: new URL(`../public/${carpeta}/${nombre}`, import.meta.url).pathname, omitBackground: !completo });
  console.log('ok', nombre);
}
await b.close();

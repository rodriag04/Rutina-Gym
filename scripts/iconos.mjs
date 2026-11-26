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
// Portada para la versión de Claude (galería y enlaces): 1200×630 con el icono y el nombre.
if (carpeta === 'iconos') {
  await p.setViewportSize({ width: 1200, height: 630 });
  await p.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&display=swap">
<body style="margin:0;width:1200px;height:630px;background:#1f2226;display:flex;align-items:center;justify-content:center;gap:56px">
${svg.replace('<svg ', '<svg width="360" height="360" ')}
<div style="font-family:'Barlow Condensed',sans-serif;color:#f1f2f3;line-height:1">
<div style="font-size:150px;font-weight:600">Rutina</div>
<div style="font-size:44px;font-weight:600;color:#ff7a1a;margin-top:10px">Entreno con Claude</div></div></body>`);
  await p.waitForTimeout(800);
  await p.screenshot({ path: new URL(`../public/${carpeta}/portada.png`, import.meta.url).pathname });
  console.log('ok portada.png');
}
await b.close();

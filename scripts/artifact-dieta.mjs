// Junta la compilación de la versión de Claude en una sola página para publicarla como artifact.
// Uso: npm run build:claude  →  dist-claude/comidas-de-rodri.html
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const dir = new URL('../dist-claude/', import.meta.url);
const assets = readdirSync(new URL('assets/', dir));
const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));
if (js.length !== 1 || css.length !== 1) throw new Error(`Se esperaba 1 JS y 1 CSS: ${assets.join(', ')}`);
const leer = (f) => readFileSync(new URL(`assets/${f}`, dir), 'utf8');
const codigo = leer(js[0]).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const estilos = leer(css[0]).replace(/<\/style/gi, '<\\/style');
const fuentes =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap';
const pagina = `<title>Comidas de Rodri</title>
<link rel="stylesheet" href="${fuentes}">
<style>${estilos}
:root{--safe-t:0px}</style>
<div id="app"></div>
<script type="module">${codigo}</script>
`;
writeFileSync(new URL('comidas-de-rodri.html', dir), pagina);
console.log(`dist-claude/comidas-de-rodri.html · ${(pagina.length / 1024).toFixed(0)} KB`);

// Junta una compilación de la versión de Claude en una sola página para publicarla como artifact.
// Uso: node scripts/artifact.mjs dieta|gym  (lo llaman npm run build:claude y build:claude-gym)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const APPS = {
  dieta: {
    dir: '../dist-claude/',
    salida: 'comidas-de-rodri.html',
    titulo: 'Comidas de Rodri',
    fuentes:
      'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap'
  },
  gym: {
    dir: '../dist-claude-gym/',
    salida: 'rutina-de-rodrigo.html',
    titulo: 'Rutina de Rodrigo',
    fuentes: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&display=swap'
  }
};

const app = APPS[process.argv[2]];
if (!app) throw new Error(`Uso: node scripts/artifact.mjs ${Object.keys(APPS).join('|')}`);
const dir = new URL(app.dir, import.meta.url);
const assets = readdirSync(new URL('assets/', dir));
const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));
if (js.length !== 1 || css.length !== 1) throw new Error(`Se esperaba 1 JS y 1 CSS: ${assets.join(', ')}`);
const leer = (f) => readFileSync(new URL(`assets/${f}`, dir), 'utf8');
const codigo = leer(js[0]).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const estilos = leer(css[0]).replace(/<\/style/gi, '<\\/style');
// Dentro de Claude la cabecera la pone el visor: sin hueco arriba.
const pagina = `<title>${app.titulo}</title>
<link rel="stylesheet" href="${app.fuentes}">
<style>${estilos}
:root{--safe-t:0px}</style>
<div id="app"></div>
<script type="module">${codigo}</script>
`;
writeFileSync(new URL(app.salida, dir), pagina);
console.log(`${app.dir.replace('../', '')}${app.salida} · ${(pagina.length / 1024).toFixed(0)} KB`);

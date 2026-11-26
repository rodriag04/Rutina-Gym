import { render } from 'preact';
import './styles/base.css';
import './styles/figuras.css';
import './styles/app.css';
import { App } from './app';
import { errorGuardado } from './lib/db';
import { iniciar } from './lib/estado';
import { conectarNube, volverALocal } from './lib/nube';

// Dentro de Claude: sin service worker; datos en la base de datos del artifact;
// las fuentes llegan de Google Fonts (las pone la página).
render(<App />, document.getElementById('app')!);

(async () => {
  const nube = await conectarNube();
  try {
    await iniciar();
  } catch (e) {
    if (!nube) throw e;
    volverALocal();
    errorGuardado.value = 'Claude no ha respondido al cargar tus datos: ves los de este navegador y lo que apuntes se queda aquí. Recarga para reintentar.';
    await iniciar();
  }
})();

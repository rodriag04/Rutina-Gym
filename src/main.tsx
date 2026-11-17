import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import './styles/base.css';
import './styles/figuras.css';
import './styles/app.css';
import { App } from './app';
import { ajustes, borrador, iniciar, seriesHechas } from './lib/estado';
import { mantenerPantalla } from './lib/sonido';

let actualizarSW: ((recargar?: boolean) => Promise<void>) | undefined;
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  actualizarSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      const aviso = document.createElement('button');
      aviso.className = 'aviso-version';
      aviso.textContent = 'Hay una versión nueva. Toca para actualizar.';
      aviso.onclick = () => actualizarSW?.(true);
      document.body.appendChild(aviso);
    }
  });
}

iniciar();

// iOS suelta el bloqueo de pantalla al salir de la app: se pide otra vez al volver si hay sesión en curso.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && ajustes.value.pantallaEncendida && seriesHechas(borrador.value) > 0) mantenerPantalla(true);
});
render(<App actualizar={actualizarSW ? () => actualizarSW?.(true) : undefined} />, document.getElementById('app')!);

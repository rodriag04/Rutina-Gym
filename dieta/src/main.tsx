import { render } from 'preact';
import { signal } from '@preact/signals';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import { cargar } from './lib/estado';
import './styles/app.css';

const actualizar = signal<(() => void) | undefined>(undefined);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const update = registerSW({
    onNeedRefresh() {
      actualizar.value = () => update(true);
    }
  });
}

const Raiz = () => <App actualizar={actualizar.value} />;
render(<Raiz />, document.getElementById('app')!);
void cargar();

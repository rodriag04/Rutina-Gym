import { render } from 'preact';
import { App } from './app';
import { cargar } from './lib/estado';
import './styles/app.css';

// Dentro de Claude: sin service worker; las fuentes llegan de Google Fonts (las pone la página).
render(<App />, document.getElementById('app')!);
void cargar();

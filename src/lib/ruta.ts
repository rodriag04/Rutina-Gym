import { signal } from '@preact/signals';

export type Ruta =
  | { v: 'entrenar' }
  | { v: 'historial' }
  | { v: 'progreso' }
  | { v: 'notas' }
  | { v: 'ajustes' }
  | { v: 'claude' }
  | { v: 'ejercicio'; id: string }
  | { v: 'sesion'; id: string };

function leer(): Ruta {
  const [v, id] = location.hash.replace(/^#\/?/, '').split('/');
  if ((v === 'ejercicio' || v === 'sesion') && id) return { v, id: decodeURIComponent(id) };
  if (['historial', 'progreso', 'notas', 'ajustes', 'claude'].includes(v)) return { v } as Ruta;
  return { v: 'entrenar' };
}

export const ruta = signal<Ruta>(leer());
addEventListener('hashchange', () => {
  ruta.value = leer();
  window.scrollTo(0, 0);
});

export function ir(r: Ruta) {
  location.hash = 'id' in r ? `/${r.v}/${encodeURIComponent(r.id)}` : `/${r.v}`;
}
export function volver(defecto: Ruta = { v: 'entrenar' }) {
  if (history.length > 1) history.back();
  else ir(defecto);
}

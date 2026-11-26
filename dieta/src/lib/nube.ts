import { almacenLocal, type Almacen } from './almacen';
import type { Registro } from './tipos';

// Almacén en la nube de Claude (capacidad `db` del artifact).
// - semanas/<lunes>      una semana por documento
// - registros/<AAAA-MM>  lo apuntado, un mes por documento
// - app/<clave>          el resto (objetivos, medidas, notas, chat…)
// Cada documento lleva el valor en `v`. Solo se escribe lo que ha cambiado, y de uno en uno.

interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface DocRef {
  get(): Promise<DocSnap>;
  set(d: Record<string, unknown>): Promise<void>;
}
interface ColRef {
  get(): Promise<{ docs: DocSnap[]; empty: boolean }>;
}
export interface DbClaude {
  doc(path: string): DocRef;
  collection(path: string): ColRef;
}
interface Assets {
  upload(b: Blob): Promise<{ id: string; url: string }>;
}

const ASSET = /^[0-9a-f]{32}$/;
const MAX_ESPERA = 10000;

function conTiempo<T>(p: Promise<T>): Promise<T> {
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error('Claude no responde')), MAX_ESPERA);
    p.then(
      (v) => (clearTimeout(t), ok(v)),
      (e) => (clearTimeout(t), ko(e))
    );
  });
}

export function crearNube(cdb: DbClaude, assets: Assets | null): Almacen {
  const ultimo = new Map<string, string>();
  const colas = new Map<string, Promise<void>>();

  const escribir = (path: string, v: unknown) => {
    const json = JSON.stringify(v ?? null);
    if (ultimo.get(path) === json) return Promise.resolve();
    ultimo.set(path, json);
    const p = (colas.get(path) ?? Promise.resolve())
      .then(() => cdb.doc(path).set({ v: JSON.parse(json) }))
      .catch((e) => {
        ultimo.delete(path);
        console.warn('No se pudo guardar', path, e);
      });
    colas.set(path, p);
    return p;
  };

  const leerColeccion = async (col: string) => {
    const s = await conTiempo(cdb.collection(col).get());
    const out: [string, unknown][] = [];
    for (const d of s.docs) {
      const v = d.data()?.v;
      if (v === undefined) continue;
      ultimo.set(`${col}/${d.id}`, JSON.stringify(v));
      out.push([d.id, v]);
    }
    return out;
  };

  return {
    nube: true,
    async get<T>(clave: string) {
      if (clave === 'semanas') {
        const xs = await leerColeccion('semanas');
        return (xs.length ? Object.fromEntries(xs) : undefined) as T | undefined;
      }
      if (clave === 'registros') {
        const xs = await leerColeccion('registros');
        return (xs.length ? xs.flatMap(([, v]) => v as Registro[]) : undefined) as T | undefined;
      }
      const d = await conTiempo(cdb.doc(`app/${clave}`).get());
      if (!d.exists) return undefined;
      const v = d.data()?.v;
      ultimo.set(`app/${clave}`, JSON.stringify(v ?? null));
      return v as T | undefined;
    },
    async set(clave, valor) {
      if (clave === 'semanas') {
        await Promise.all(Object.entries((valor ?? {}) as Record<string, unknown>).map(([k, v]) => escribir(`semanas/${k}`, v)));
        return;
      }
      if (clave === 'registros') {
        const meses = new Map<string, Registro[]>();
        for (const r of (valor ?? []) as Registro[]) {
          const m = r.fecha.slice(0, 7);
          if (!meses.has(m)) meses.set(m, []);
          meses.get(m)!.push(r);
        }
        // Un mes que se queda vacío se guarda vacío (no se borra lo de otros meses).
        for (const path of ultimo.keys()) if (path.startsWith('registros/') && !meses.has(path.slice(10))) meses.set(path.slice(10), []);
        await Promise.all([...meses].map(([m, rs]) => escribir(`registros/${m}`, rs)));
        return;
      }
      await escribir(`app/${clave}`, valor);
    },
    async subirFoto(blob) {
      if (!assets) return almacenLocal.subirFoto(blob);
      const r = await assets.upload(blob);
      return r.id;
    },
    async urlFoto(id) {
      return ASSET.test(id) ? `/_blob/${id}` : almacenLocal.urlFoto(id);
    },
    todasFotos: async () => []
  };
}

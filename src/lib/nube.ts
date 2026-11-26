import { dbLocal, errorGuardado, fijarAlmacen, type Almacen } from './db';
import type { Sesion } from './tipos';

// Almacén en la nube de Claude (capacidad `db` del artifact), solo en la versión de Claude.
// - sesiones/<id>  una sesión por documento
// - app/<clave>    ajustes, medidas, notas, borrador, chat…
// Cada documento lleva el valor en `v`. Solo se escribe lo que cambia, y de uno en uno por documento.

interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface DocRef {
  get(): Promise<DocSnap>;
  set(d: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
}
interface ColRef {
  get(): Promise<{ docs: DocSnap[] }>;
}
export interface DbClaude {
  doc(path: string): DocRef;
  collection(path: string): ColRef;
}

const MAX_ESPERA = 10000;
const idDoc = (id: string) => id.replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');

function conTiempo<T>(p: Promise<T>): Promise<T> {
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error('Claude no responde')), MAX_ESPERA);
    p.then(
      (v) => (clearTimeout(t), ok(v)),
      (e) => (clearTimeout(t), ko(e))
    );
  });
}

export function crearNube(cdb: DbClaude): Almacen {
  const ultimo = new Map<string, string>();
  const colas = new Map<string, Promise<void>>();

  const enCola = (path: string, f: () => Promise<void>) => {
    const p = (colas.get(path) ?? Promise.resolve()).then(f).catch((e) => {
      ultimo.delete(path);
      errorGuardado.value = 'No se ha podido guardar en Claude. Revisa la conexión; se reintenta con el próximo cambio.';
      console.warn('No se pudo guardar', path, e);
    });
    colas.set(path, p);
    return p;
  };
  const escribir = (path: string, v: unknown) => {
    const json = JSON.stringify(v ?? null);
    if (ultimo.get(path) === json) return Promise.resolve();
    ultimo.set(path, json);
    return enCola(path, async () => {
      await cdb.doc(path).set({ v: JSON.parse(json) });
      errorGuardado.value = null;
    });
  };
  const borrar = (path: string) => {
    ultimo.delete(path);
    return enCola(path, () => cdb.doc(path).delete());
  };
  const leerColeccion = async (col: string) => {
    const s = await conTiempo(cdb.collection(col).get());
    return s.docs.map((d) => ({ path: `${col}/${d.id}`, v: d.data()?.v }));
  };

  return {
    nube: true,
    async sesiones() {
      const xs = await leerColeccion('sesiones');
      const out: Sesion[] = [];
      for (const { path, v } of xs) {
        if (!v) continue;
        ultimo.set(path, JSON.stringify(v));
        out.push(v as Sesion);
      }
      return out;
    },
    async guardarSesiones(lista) {
      await Promise.all(lista.map((s) => escribir(`sesiones/${idDoc(s.id)}`, s)));
    },
    borrarSesion: (id) => borrar(`sesiones/${idDoc(id)}`),
    async get<T>(clave: string) {
      const d = await conTiempo(cdb.doc(`app/${clave}`).get());
      if (!d.exists) return undefined;
      const v = d.data()?.v;
      ultimo.set(`app/${clave}`, JSON.stringify(v ?? null));
      return (v ?? undefined) as T | undefined;
    },
    set: (clave, valor) => escribir(`app/${clave}`, valor),
    async borrarTodo() {
      const [ss, app] = await Promise.all([leerColeccion('sesiones'), leerColeccion('app')]);
      await Promise.all([...ss, ...app].map((x) => borrar(x.path)));
    }
  };
}

type Usar = (nombre: string) => Promise<unknown>;

/** Capacidad de Claude, o null fuera de Claude. */
export async function capacidad<T>(nombre: string): Promise<T | null> {
  if (!__CLAUDE__) return null;
  const claude = (window as unknown as { claude?: { use?: Usar } }).claude;
  if (!claude?.use) return null;
  try {
    return ((await claude.use(nombre)) as T) ?? null;
  } catch {
    return null;
  }
}

/** Dentro de Claude pasa los datos a la nube. Devuelve true si lo consigue. */
export async function conectarNube(): Promise<boolean> {
  const cdb = await capacidad<DbClaude>('db');
  if (!cdb) return false;
  fijarAlmacen(crearNube(cdb));
  return true;
}

/** Si la nube no responde al arrancar, la app sigue con los datos del navegador. */
export const volverALocal = () => fijarAlmacen(dbLocal);

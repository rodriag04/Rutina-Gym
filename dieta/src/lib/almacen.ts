import { db as local } from './db';

// Dónde se guardan los datos. En el iPhone (PWA): IndexedDB. Dentro de Claude: el `db` del
// artifact (y las fotos en `assets`), con la misma interfaz para el resto de la app.

export interface Almacen {
  /** true dentro de Claude: los datos están en la nube de Claude. */
  nube: boolean;
  get<T>(clave: string): Promise<T | undefined>;
  set(clave: string, valor: unknown): Promise<void>;
  /** Guarda una foto y devuelve su id. */
  subirFoto(blob: Blob): Promise<string>;
  urlFoto(id: string): Promise<string | undefined>;
  /** Para la copia de seguridad con fotos (solo en el móvil). */
  todasFotos(): Promise<[string, Blob][]>;
}

const nuevoId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const almacenLocal: Almacen = {
  nube: false,
  get: (k) => local.get(k),
  set: (k, v) => local.set(k, v),
  async subirFoto(blob) {
    const id = nuevoId();
    await local.guardarFoto(id, blob);
    return id;
  },
  async urlFoto(id) {
    const b = await local.foto(id);
    return b ? URL.createObjectURL(b) : undefined;
  },
  todasFotos: () => local.todasFotos()
};

export let almacen: Almacen = almacenLocal;
export const fijarAlmacen = (a: Almacen) => {
  almacen = a;
};

type Usar = (nombre: string) => Promise<unknown>;

/** Dentro de Claude, pasa a la nube. Fuera (o si Claude no responde), se queda en el móvil. */
export async function iniciarAlmacen(): Promise<void> {
  if (!__CLAUDE__) return;
  const claude = (window as unknown as { claude?: { use?: Usar } }).claude;
  if (!claude?.use) return;
  const [cdb, assets] = await Promise.all([claude.use('db'), claude.use('assets')]);
  if (!cdb) return;
  const { crearNube } = await import('./nube');
  almacen = crearNube(cdb as never, assets as never);
}

/** Capacidad de Claude (o null fuera de Claude). */
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

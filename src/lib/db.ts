// Almacenamiento local: IndexedDB (con copia mínima en localStorage si IndexedDB falla).
import { PERFIL } from '../data/rutina';
import type { Sesion } from './tipos';

// Una base de datos por persona: las dos apps comparten dominio (github.io).
const NOMBRE = `rutina-${PERFIL.id}`;
const VERSION = 1;
let dbp: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((ok, ko) => {
    if (typeof indexedDB === 'undefined') return ko(new Error('sin IndexedDB'));
    const r = indexedDB.open(NOMBRE, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('sesiones')) db.createObjectStore('sesiones', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
  return dbp;
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((ok, ko) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}

async function tienda(nombre: 'sesiones' | 'kv', modo: IDBTransactionMode) {
  const db = await abrir();
  return db.transaction(nombre, modo).objectStore(nombre);
}

const LS = PERFIL.id === 'rodrigo' ? 'rutina-respaldo:' : `rutina-respaldo-${PERFIL.id}:`;
const lsGet = <T>(k: string): T | undefined => {
  try {
    const v = localStorage.getItem(LS + k);
    return v ? (JSON.parse(v) as T) : undefined;
  } catch {
    return undefined;
  }
};
const lsSet = (k: string, v: unknown) => {
  try {
    localStorage.setItem(LS + k, JSON.stringify(v));
  } catch {
    /* sin espacio o modo privado */
  }
};

export const db = {
  async sesiones(): Promise<Sesion[]> {
    try {
      return await req((await tienda('sesiones', 'readonly')).getAll() as IDBRequest<Sesion[]>);
    } catch {
      return lsGet<Sesion[]>('sesiones') ?? [];
    }
  },
  async guardarSesiones(lista: Sesion[]) {
    try {
      const t = await tienda('sesiones', 'readwrite');
      await Promise.all(lista.map((s) => req(t.put(s))));
    } catch {
      const todas = new Map((lsGet<Sesion[]>('sesiones') ?? []).map((s) => [s.id, s]));
      lista.forEach((s) => todas.set(s.id, s));
      lsSet('sesiones', [...todas.values()]);
    }
  },
  async borrarSesion(id: string) {
    try {
      await req((await tienda('sesiones', 'readwrite')).delete(id));
    } catch {
      lsSet('sesiones', (lsGet<Sesion[]>('sesiones') ?? []).filter((s) => s.id !== id));
    }
  },
  async get<T>(clave: string): Promise<T | undefined> {
    try {
      return (await req((await tienda('kv', 'readonly')).get(clave))) as T | undefined;
    } catch {
      return lsGet<T>(clave);
    }
  },
  async set(clave: string, valor: unknown) {
    try {
      await req((await tienda('kv', 'readwrite')).put(valor, clave));
    } catch {
      lsSet(clave, valor);
    }
  },
  async borrarTodo() {
    try {
      const db = await abrir();
      const t = db.transaction(['sesiones', 'kv'], 'readwrite');
      t.objectStore('sesiones').clear();
      t.objectStore('kv').clear();
      await new Promise((ok) => (t.oncomplete = ok));
    } catch {
      Object.keys(localStorage).filter((k) => k.startsWith(LS)).forEach((k) => localStorage.removeItem(k));
    }
  }
};

/** Pide al navegador que no borre los datos (Safari los puede purgar si no). */
export async function pedirPersistencia() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* no soportado */
  }
}

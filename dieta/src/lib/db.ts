// Almacenamiento en el iPhone: IndexedDB (datos y fotos) + copia mínima en localStorage.

const NOMBRE = 'comidas-rodri';
const VERSION = 1;
let dbp: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((ok, ko) => {
    if (typeof indexedDB === 'undefined') return ko(new Error('sin IndexedDB'));
    const r = indexedDB.open(NOMBRE, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('fotos')) db.createObjectStore('fotos');
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

async function tienda(nombre: 'kv' | 'fotos', modo: IDBTransactionMode) {
  const db = await abrir();
  return db.transaction(nombre, modo).objectStore(nombre);
}

const LS = 'comidas-respaldo:';

export const db = {
  async get<T>(clave: string): Promise<T | undefined> {
    try {
      const v = await req((await tienda('kv', 'readonly')).get(clave));
      if (v !== undefined) return v as T;
    } catch {
      /* cae a localStorage */
    }
    try {
      const v = localStorage.getItem(LS + clave);
      return v ? (JSON.parse(v) as T) : undefined;
    } catch {
      return undefined;
    }
  },
  async set(clave: string, valor: unknown) {
    try {
      await req((await tienda('kv', 'readwrite')).put(valor, clave));
    } catch {
      /* sigue con la copia */
    }
    try {
      localStorage.setItem(LS + clave, JSON.stringify(valor));
    } catch {
      /* sin espacio */
    }
  },
  async guardarFoto(id: string, blob: Blob) {
    await req((await tienda('fotos', 'readwrite')).put(blob, id));
  },
  async foto(id: string): Promise<Blob | undefined> {
    try {
      return (await req((await tienda('fotos', 'readonly')).get(id))) as Blob | undefined;
    } catch {
      return undefined;
    }
  },
  async borrarFoto(id: string) {
    try {
      await req((await tienda('fotos', 'readwrite')).delete(id));
    } catch {
      /* nada */
    }
  },
  async todasFotos(): Promise<[string, Blob][]> {
    const t = await tienda('fotos', 'readonly');
    const claves = (await req(t.getAllKeys())) as string[];
    const t2 = await tienda('fotos', 'readonly');
    const vals = (await req(t2.getAll())) as Blob[];
    return claves.map((k, i) => [k, vals[i]]);
  }
};

export async function pedirPersistencia() {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {
    /* Safari antiguo */
  }
}

/** Reduce la foto a 900 px de lado y JPEG 0,78 (≈100 KB). */
export async function comprimir(f: File | Blob, lado = 900): Promise<Blob> {
  const url = URL.createObjectURL(f);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = ko;
      i.src = url;
    });
    const k = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b ?? f), 'image/jpeg', 0.78));
  } finally {
    URL.revokeObjectURL(url);
  }
}

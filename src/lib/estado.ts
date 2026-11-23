import { computed, signal } from '@preact/signals';
import { EJERCICIOS, PERFIL, type DiaId } from '../data/rutina';
import { ESCALONES_POR_DEFECTO, Escalera } from './cargas';
import { semanaSuave } from './analisis';
import { db, pedirPersistencia } from './db';
import { hoyISO } from './formato';
import type { Carga } from '../data/rutina';
import type { Ajustes, EntradaDiario, Medida, Serie, Sesion } from './tipos';

export const HISTORIAL_ORIGINAL: Sesion[] = PERFIL.historial;

export const AJUSTES_POR_DEFECTO: Ajustes = {
  gimnasios: PERFIL.gimnasios,
  gymPorDefecto: PERFIL.gymPorDefecto,
  pesoCorporal: PERFIL.pesoCorporal,
  sonido: true,
  pantallaEncendida: true,
  descarga: false,
  escalones: { ...ESCALONES_POR_DEFECTO, ...PERFIL.escalones }
};

/** Sesión en curso (se guarda en cada toque por si iOS cierra la app). */
export interface Borrador {
  dia: DiaId;
  fecha: string;
  gym: string;
  inicio: string;
  ex: Record<string, (Serie | null)[]>;
  /** Peso elegido por serie pendiente (antes de marcarla). */
  pesos: Record<string, number[]>;
  extra: Record<string, number>;
  exNotas: Record<string, string>;
  descanso?: { hasta: number; total: number; exId: string; texto: string };
  /** Id de la sesión guardada que se está editando. */
  editando?: string;
  notas?: string;
  sensacion?: { energia?: number; molestias?: string[] };
  descarga?: boolean;
}

export const cargado = signal(false);
export const sesiones = signal<Sesion[]>([]);
export const ajustes = signal<Ajustes>(AJUSTES_POR_DEFECTO);
export const diario = signal<EntradaDiario[]>([]);
export const medidas = signal<Medida[]>([]);
export const notasEjercicio = signal<Record<string, string>>({});
export const borrador = signal<Borrador | null>(null);
export const verificacion = signal<{ sesiones: number; series: number } | null>(null);

export const escalera = (c: Carga) => new Escalera(ajustes.value.escalones[c] ?? PERFIL.escalones?.[c] ?? ESCALONES_POR_DEFECTO[c]);
export const pesoCorporal = computed(() => {
  const conPeso = [...medidas.value].filter((m) => m.peso).sort((a, b) => a.fecha.localeCompare(b.fecha));
  return conPeso.at(-1)?.peso ?? ajustes.value.pesoCorporal;
});

export const contarSeries = (ss: Sesion[]) => ss.reduce((a, s) => a + Object.values(s.ex).reduce((b, x) => b + x.length, 0), 0);

/** Notas iniciales de corrección (del contexto) para cada ejercicio. */
function notasIniciales(): Record<string, string> {
  const o: Record<string, string> = {};
  for (const e of EJERCICIOS) if (e.notaInicial) o[e.id] = e.notaInicial;
  return o;
}

export async function iniciar() {
  pedirPersistencia();
  let lista = await db.sesiones();
  const meta = await db.get<{ importado?: string }>('meta');
  if (!meta?.importado) {
    // Primer arranque: importa el historial completo y lo verifica.
    const existentes = new Set(lista.map((s) => s.id));
    const nuevas = HISTORIAL_ORIGINAL.filter((s) => !existentes.has(s.id));
    await db.guardarSesiones(nuevas);
    lista = await db.sesiones();
    await db.set('meta', { importado: new Date().toISOString() });
  }
  if (HISTORIAL_ORIGINAL.length) {
    const ids = new Set(HISTORIAL_ORIGINAL.map((s) => s.id));
    const imp = lista.filter((s) => ids.has(s.id));
    verificacion.value = { sesiones: imp.length, series: contarSeries(imp) };
  }

  sesiones.value = lista;
  ajustes.value = { ...AJUSTES_POR_DEFECTO, ...((await db.get<Ajustes>('ajustes')) ?? {}) };
  diario.value = (await db.get<EntradaDiario[]>('diario')) ?? [];
  medidas.value = (await db.get<Medida[]>('medidas')) ?? PERFIL.medidasIniciales;
  notasEjercicio.value = (await db.get<Record<string, string>>('notasEjercicio')) ?? notasIniciales();
  borrador.value = (await db.get<Borrador>('borrador')) ?? null;
  cargado.value = true;
}

export async function guardarSesion(s: Sesion) {
  await db.guardarSesiones([s]);
  sesiones.value = [...sesiones.value.filter((x) => x.id !== s.id), s];
}
export async function borrarSesion(id: string) {
  await db.borrarSesion(id);
  sesiones.value = sesiones.value.filter((x) => x.id !== id);
}
export async function setAjustes(p: Partial<Ajustes>) {
  ajustes.value = { ...ajustes.value, ...p };
  await db.set('ajustes', ajustes.value);
}
export async function setDiario(l: EntradaDiario[]) {
  diario.value = l;
  await db.set('diario', l);
}
export async function setMedidas(l: Medida[]) {
  medidas.value = l;
  await db.set('medidas', l);
}
export async function setNota(exId: string, texto: string) {
  notasEjercicio.value = { ...notasEjercicio.value, [exId]: texto };
  await db.set('notasEjercicio', notasEjercicio.value);
}
export async function setBorrador(b: Borrador | null) {
  borrador.value = b;
  await db.set('borrador', b);
}

export function nuevoBorrador(dia: DiaId, gym?: string): Borrador {
  return {
    dia,
    fecha: hoyISO(),
    gym: gym ?? ajustes.value.gymPorDefecto,
    inicio: new Date().toISOString(),
    ex: {},
    pesos: {},
    extra: {},
    exNotas: {},
    descarga: descargaActiva()
  };
}

/** Descarga manual (Ajustes) o semana suave fija del perfil. */
export function descargaActiva(): boolean {
  return ajustes.value.descarga || (!!PERFIL.descargaCada && semanaSuave(sesiones.value, hoyISO(), PERFIL.descargaCada));
}

/** Abre una sesión guardada para editarla con la misma pantalla de entrenar. */
export function borradorDesde(s: Sesion): Borrador {
  return {
    dia: s.dia,
    fecha: s.fecha,
    gym: s.gym ?? ajustes.value.gymPorDefecto,
    inicio: s.guardado,
    ex: Object.fromEntries(Object.entries(s.ex).map(([k, v]) => [k, v.map((x) => ({ ...x }))])),
    pesos: {},
    extra: {},
    exNotas: { ...(s.exNotas ?? {}) },
    editando: s.id,
    notas: s.notas,
    sensacion: s.sensacion,
    descarga: s.descarga
  };
}

export const seriesHechas = (b: Borrador | null) =>
  b ? Object.values(b.ex).reduce((a, l) => a + l.filter(Boolean).length, 0) : 0;

/** Importa una copia (JSON exportado). Combina por id: lo de la copia gana. */
export async function importarCopia(datos: {
  sesiones?: Sesion[];
  diario?: EntradaDiario[];
  medidas?: Medida[];
  notasEjercicio?: Record<string, string>;
  ajustes?: Ajustes;
}) {
  if (datos.sesiones?.length) await db.guardarSesiones(datos.sesiones);
  sesiones.value = await db.sesiones();
  if (datos.diario) {
    const m = new Map(diario.value.map((d) => [d.id, d]));
    datos.diario.forEach((d) => m.set(d.id, d));
    await setDiario([...m.values()]);
  }
  if (datos.medidas) {
    const m = new Map(medidas.value.map((d) => [d.fecha, d]));
    datos.medidas.forEach((d) => m.set(d.fecha, d));
    await setMedidas([...m.values()]);
  }
  if (datos.notasEjercicio) {
    notasEjercicio.value = { ...notasEjercicio.value, ...datos.notasEjercicio };
    await db.set('notasEjercicio', notasEjercicio.value);
  }
  if (datos.ajustes) await setAjustes(datos.ajustes);
}

export async function restaurarOriginal() {
  await db.guardarSesiones(HISTORIAL_ORIGINAL);
  sesiones.value = await db.sesiones();
  const ids = new Set(HISTORIAL_ORIGINAL.map((s) => s.id));
  const imp = sesiones.value.filter((s) => ids.has(s.id));
  verificacion.value = { sesiones: imp.length, series: contarSeries(imp) };
}

export async function borrarTodo() {
  await db.borrarTodo();
  location.reload();
}

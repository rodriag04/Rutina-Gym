import { computed, effect, signal } from '@preact/signals';
import { ALIMENTOS, registrarAlimentosExtra } from '../data/alimentos';
import { RECETA, registrarRecetasExtra } from '../data/recetas';
import { leerCodigo } from './claude';
import { db, pedirPersistencia } from './db';
import { ahoraHora, diaSemana, hoyISO, lunesDe, sumarDias } from './fechas';
import { cfgDia, configPorDefecto, generarSemana, reparar } from './generador';
import { HORAS, type Horas } from './horario';
import type { Accion } from './notas';
import { fijarCorrecciones } from './nutricion';
import { calcularDia, OBJETIVOS } from './plan';
import type { Ajuste, Alimento, ConfigDia, ConfigSemana, EstadoRegistro, Macro, Medida, Nota, Objetivos, Receta, Registro, Semana, Slot } from './tipos';

export interface Prefs {
  tema: 'auto' | 'claro' | 'oscuro';
  pierdeFuerza: boolean;
  ultimaCopia?: string;
  bienvenida?: boolean;
}

export const cargado = signal(false);
export const hoy = signal(hoyISO());
export const ahora = signal(ahoraHora());
export const semanas = signal<Record<string, Semana>>({});
export const registros = signal<Registro[]>([]);
export const notas = signal<Nota[]>([]);
export const medidas = signal<Medida[]>([]);
export const objetivos = signal<Objetivos>(OBJETIVOS);
export const ajustesLog = signal<Ajuste[]>([]);
export const horas = signal<Horas>(HORAS);
export const correcciones = signal<Record<string, Partial<Alimento>>>({});
export const fotosReceta = signal<Record<string, string>>({});
export const compraHecha = signal<Record<string, string[]>>({});
export const tareasHechas = signal<string[]>([]);
export const prefs = signal<Prefs>({ tema: 'auto', pierdeFuerza: false });
/** Lo que ha añadido Claude desde fotos: alimentos y recetas nuevas. */
export const alimentosExtra = signal<Alimento[]>([]);
export const recetasExtra = signal<Receta[]>([]);

/** Lo que se guarda: clave en IndexedDB → señal. */
const PERSISTIDO = {
  semanas,
  registros,
  notas,
  medidas,
  objetivos,
  ajustesLog,
  horas,
  correcciones,
  fotosReceta,
  compraHecha,
  tareasHechas,
  prefs,
  alimentosExtra,
  recetasExtra
} as const;

export const semanaDe = (fecha: string) => semanas.value[lunesDe(fecha)];
export const semanaActual = computed(() => semanaDe(hoy.value));

export function diaCalculado(fecha: string) {
  const sem = semanaDe(fecha);
  if (!sem) return null;
  const i = sem.config.dias.findIndex((d) => d.fecha === fecha);
  if (i < 0) return null;
  const cfg = cfgDia(sem.config, i);
  return calcularDia(fecha, cfg, sem.menu[fecha] ?? [], registros.value, objetivos.value, horas.value);
}

export async function cargar() {
  for (const [clave, sig] of Object.entries(PERSISTIDO)) {
    const v = await db.get(clave);
    if (v !== undefined) (sig as { value: unknown }).value = v;
  }
  fijarCorrecciones(correcciones.value);
  registrarExtras();
  // Guardar cada cambio (también la semana que se genera o se repara justo abajo).
  for (const [clave, sig] of Object.entries(PERSISTIDO)) {
    let primero = true;
    effect(() => {
      const v = (sig as { value: unknown }).value;
      if (primero) {
        primero = false;
        return;
      }
      void db.set(clave, v);
    });
  }
  migrarRecetas();
  // Primera vez (o semana nueva sin plan): genera la de esta semana con lo habitual.
  asegurarSemana(lunesDe(hoy.value));
  cargado.value = true;
  effect(() => fijarCorrecciones(correcciones.value));
  void pedirPersistencia();
  setInterval(() => {
    hoy.value = hoyISO();
    ahora.value = ahoraHora();
    if (diaSemana(hoy.value) < 5) asegurarSemana(lunesDe(hoy.value));
  }, 30000);
}

/** Si una semana guardada usa un plato que ya no existe, se cambia por otro que cumpla las reglas. */
function migrarRecetas() {
  let cambio = false;
  const out: Record<string, Semana> = {};
  for (const [k, sem] of Object.entries(semanas.value)) {
    const malas = Object.values(sem.menu).some((els) => els.some((e) => !RECETA[e.receta]));
    if (!malas) {
      out[k] = sem;
      continue;
    }
    cambio = true;
    const menu = Object.fromEntries(Object.entries(sem.menu).map(([f, els]) => [f, els.filter((e) => RECETA[e.receta])]));
    out[k] = reparar({ ...sem, menu }, horas.value);
  }
  if (cambio) semanas.value = out;
}

export function asegurarSemana(lunes: string) {
  if (semanas.value[lunes]) return semanas.value[lunes];
  const sem = generarSemana(configPorDefecto(lunes), objetivos.value, Date.now() % 100000, horas.value);
  semanas.value = { ...semanas.value, [lunes]: sem };
  return sem;
}

/** Genera (o regenera) una semana. Los días ya pasados conservan su menú. */
export function generar(config: ConfigSemana, semilla: number) {
  const prev = semanas.value[config.lunes];
  const fijas: Record<string, Semana['menu'][string]> = {};
  if (prev) for (const [f, m] of Object.entries(prev.menu)) if (f < hoy.value) fijas[f] = m;
  const sem = generarSemana(config, objetivos.value, semilla, horas.value, fijas);
  semanas.value = { ...semanas.value, [config.lunes]: sem };
  return sem;
}

function guardarSemana(sem: Semana) {
  semanas.value = { ...semanas.value, [sem.id]: sem };
}

/** Cambia la configuración de un día y recoloca solo lo que no encaja. */
export function actualizarDia(fecha: string, cambios: Partial<ConfigDia>) {
  const sem = semanaDe(fecha) ?? asegurarSemana(lunesDe(fecha));
  const dias = sem.config.dias.map((d) => (d.fecha === fecha ? limpiarDia({ ...d, ...cambios }) : d));
  const viernes = dias[4];
  const config: ConfigSemana = { ...sem.config, dias, cabraViernes: viernes ? !!viernes.cabra : sem.config.cabraViernes };
  guardarSemana(reparar({ ...sem, config }, horas.value));
}

export function actualizarSemana(lunes: string, cambios: Partial<ConfigSemana>) {
  const sem = semanas.value[lunes] ?? asegurarSemana(lunes);
  const config = { ...sem.config, ...cambios };
  if (cambios.cabraViernes !== undefined && config.dias[4]) config.dias = config.dias.map((d, i) => (i === 4 ? { ...d, cabra: cambios.cabraViernes } : d));
  guardarSemana(reparar({ ...sem, config }, horas.value));
}

const limpiarDia = (d: ConfigDia): ConfigDia => {
  const o = { ...d };
  (Object.keys(o) as (keyof ConfigDia)[]).forEach((k) => o[k] === undefined && delete o[k]);
  return o;
};

export function cambiarPlato(fecha: string, slot: Slot, receta: string) {
  const sem = semanaDe(fecha);
  if (!sem) return;
  const menu = { ...sem.menu };
  const el = (menu[fecha] ?? []).filter((e) => e.slot !== slot);
  menu[fecha] = [...el, { slot, receta }];
  guardarSemana({ ...sem, menu });
}

export function registrar(fecha: string, slot: Slot, estado: EstadoRegistro, macro: Macro, extra: { texto?: string; foto?: string } = {}) {
  const r: Registro = { fecha, slot, estado, macro: redondear(macro), hora: ahoraHora(), ...extra };
  registros.value = [...registros.value.filter((x) => !(x.fecha === fecha && x.slot === slot)), r];
}

export function borrarRegistro(fecha: string, slot: Slot) {
  registros.value = registros.value.filter((x) => !(x.fecha === fecha && x.slot === slot));
}

const redondear = (m: Macro): Macro => ({ kcal: Math.round(m.kcal), p: Math.round(m.p), c: Math.round(m.c), g: Math.round(m.g) });

export function guardarMedida(fecha: string, m: Partial<Medida>) {
  const prev = medidas.value.find((x) => x.fecha === fecha) ?? { fecha };
  const nueva = { ...prev, ...m };
  medidas.value = [...medidas.value.filter((x) => x.fecha !== fecha), nueva].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function aplicarObjetivos(nuevos: Objetivos, texto: string) {
  ajustesLog.value = [...ajustesLog.value, { fecha: hoy.value, texto, antes: objetivos.value, despues: nuevos }];
  objetivos.value = nuevos;
}

/** Foto de un registro o de una receta. */
export const fotoId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export interface Instantanea {
  semanas: Record<string, Semana>;
  registros: Registro[];
  medidas: Medida[];
}

const instantanea = (): Instantanea => ({ semanas: semanas.value, registros: registros.value, medidas: medidas.value });

export function restaurar(s: Instantanea) {
  semanas.value = s.semanas;
  registros.value = s.registros;
  medidas.value = s.medidas;
}

/** Aplica lo entendido en una nota. Devuelve el estado anterior para deshacer. */
export function aplicarAcciones(acciones: Accion[], texto: string, resumen: string[]): Instantanea {
  const antes = instantanea();
  for (const a of acciones) {
    switch (a.t) {
      case 'gym': {
        const sem = semanaDe(a.fecha);
        const prev = sem?.config.dias.find((d) => d.fecha === a.fecha)?.gym;
        actualizarDia(a.fecha, { gym: { hora: a.hora, dur: a.dur ?? prev?.dur ?? 65, tipo: prev?.tipo } });
        break;
      }
      case 'sinGym':
        actualizarDia(a.fecha, { gym: undefined });
        break;
      case 'futbol':
        actualizarDia(a.fecha, { futbol: { hora: a.hora } });
        break;
      case 'sinFutbol':
        actualizarDia(a.fecha, { futbol: undefined });
        break;
      case 'cenaLibre':
        actualizarDia(a.fecha, { cenaLibre: a.valor });
        break;
      case 'comidaLibre':
        actualizarDia(a.fecha, { comidaLibre: a.valor });
        break;
      case 'taper':
        actualizarSemana(lunesDe(hoy.value), { taper: a.valor });
        break;
      case 'cabra':
        actualizarDia(a.fecha, { cabra: true });
        break;
      case 'desayunoCasa':
        actualizarDia(a.fecha, { desayunoCasa: a.valor });
        break;
      case 'peso':
        guardarMedida(a.fecha, { peso: a.kg });
        break;
      case 'cintura':
        guardarMedida(a.fecha, { cintura: a.cm });
        break;
      case 'saltada':
        registrar(a.fecha, a.slot, 'saltada', { kcal: 0, p: 0, c: 0, g: 0 });
        break;
    }
  }
  notas.value = [...notas.value, { id: fotoId(), fecha: hoy.value, hora: ahoraHora(), texto, aplicado: resumen }];
  return antes;
}

export const proximoLunes = () => sumarDias(lunesDe(hoy.value), 7);

/** Exporta todo menos las fotos. */
export function exportar() {
  const datos: Record<string, unknown> = { app: 'comidas-rodri', version: 1, fecha: new Date().toISOString() };
  for (const [k, s] of Object.entries(PERSISTIDO)) datos[k] = (s as { value: unknown }).value;
  return datos;
}

export function importar(datos: Record<string, unknown>) {
  if (datos.app !== 'comidas-rodri') throw new Error('No es una copia de esta app');
  for (const [k, s] of Object.entries(PERSISTIDO)) if (datos[k] !== undefined) (s as { value: unknown }).value = datos[k];
  registrarExtras();
}

function registrarExtras() {
  registrarAlimentosExtra(alimentosExtra.value);
  registrarRecetasExtra(recetasExtra.value);
}

// ───────── Códigos de Claude ─────────

export type ResultadoCodigo = { ok: true; lineas: string[]; deshacer: Instantanea; semana?: string } | { ok: false; error: string };

/** Pega la respuesta de Claude: una comida (se apunta) o una semana (se monta). */
export function aplicarCodigo(texto: string, slotPorDefecto?: Slot): ResultadoCodigo {
  const r = leerCodigo(texto, { alimentos: new Set(ALIMENTOS.map((a) => a.id)), recetas: new Set(Object.keys(RECETA)) });
  if (!r.ok) return r;
  const antes = instantanea();
  const c = r.codigo;
  if (c.tipo === 'comida') {
    const d = diaCalculado(hoy.value);
    const slot = c.slot ?? slotPorDefecto ?? d?.comidas.find((x) => !x.registro && !x.hueco.libre && x.hueco.slot !== 'pre')?.hueco.slot ?? 'comida';
    registrar(hoy.value, slot, 'otro', c.macro, { texto: c.texto });
    return { ok: true, deshacer: antes, lineas: [`${c.texto}: ${Math.round(c.macro.kcal)} kcal, ${Math.round(c.macro.p)} g de proteína (${slot}).`, 'El resto del día se ha reajustado.'] };
  }
  // Semana
  if (c.alimentos.length) {
    alimentosExtra.value = [...alimentosExtra.value.filter((a) => !c.alimentos.some((n) => n.id === a.id)), ...c.alimentos];
    registrarAlimentosExtra(c.alimentos);
  }
  if (c.recetas.length) {
    recetasExtra.value = [...recetasExtra.value.filter((x) => !c.recetas.some((n) => n.id === x.id)), ...c.recetas];
    registrarRecetasExtra(c.recetas);
  }
  const prev = semanas.value[c.lunes];
  const config: ConfigSemana = { ...(prev?.config ?? configPorDefecto(c.lunes)), ...(c.enCasa ? { enCasa: c.enCasa } : {}) };
  const menu: Semana['menu'] = {};
  for (const d of config.dias) {
    // Los días ya pasados conservan lo que había.
    if (prev && d.fecha < hoy.value) {
      menu[d.fecha] = prev.menu[d.fecha] ?? [];
      continue;
    }
    // Lo que manda Claude sustituye a esos huecos; lo que no toca, se queda como estaba.
    const deClaude = Object.entries(c.menu[d.fecha] ?? {}).map(([slot, receta]) => ({ slot: slot as Slot, receta: receta! }));
    const antes = (prev?.menu[d.fecha] ?? []).filter((e) => !deClaude.some((x) => x.slot === e.slot));
    menu[d.fecha] = [...antes, ...deClaude];
  }
  const sem = reparar({ id: c.lunes, config, menu, semilla: Math.floor(Math.random() * 1e6), creada: new Date().toISOString(), origen: 'claude', nota: c.nota }, horas.value);
  semanas.value = { ...semanas.value, [c.lunes]: sem };
  const platos = Object.values(c.menu).reduce((t, x) => t + Object.keys(x).length, 0);
  return {
    ok: true,
    deshacer: antes,
    semana: c.lunes,
    lineas: [
      `Semana del ${c.lunes.slice(8)}/${c.lunes.slice(5, 7)} montada con ${platos} ${platos === 1 ? 'plato' : 'platos'} de Claude.`,
      ...(c.recetas.length ? [`Recetas nuevas: ${c.recetas.map((x) => x.titulo).join(', ')}.`] : []),
      ...(c.alimentos.length ? [`Alimentos nuevos: ${c.alimentos.map((x) => x.nombre).join(', ')}.`] : []),
      'Las cantidades las ha ajustado la app a tus kcal y proteína.',
      ...c.avisos.slice(0, 4)
    ]
  };
}

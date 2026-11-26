import { DIAS, PERFIL, dia as getDia, ejercicio, type DiaId, type Ejercicio } from '../data/rutina';
import { diaSugerido, textoSeries } from './analisis';
import {
  ajustes,
  borrador,
  descargaActiva,
  diario,
  escalera,
  guardarSesion,
  borrarSesion,
  medidas,
  notasEjercicio,
  nuevoBorrador,
  pesoCorporal,
  seriesHechas,
  sesiones,
  setBorrador,
  setDiario,
  setMedidas,
  setNota,
  type Borrador
} from './estado';
import { db } from './db';
import { informeClaude } from './exportar';
import { fechaLarga, hoyISO, kg as fkg, uid } from './formato';
import { capacidad } from './nube';
import { ordenarSesiones, planificar, type Plan } from './progresion';
import type { EntradaDiario, Medida, Serie, Sesion } from './tipos';
import { comoVariante, esVariante, nombreSustituto, planVariante, sesionesVariante } from './variantes';

// El entrenador dentro de la app (solo en la versión de Claude): Claude recibe el estado de la
// app en el mensaje y puede cambiarla con funciones de la página (capacidad `sample`).

export interface Turno {
  role: 'user' | 'assistant';
  content: string;
}
export interface Herramienta {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute(input: Record<string, unknown>): unknown;
}
export type Sample = ((
  input: string | Turno[],
  opts?: { onText?: (u: { text: string }) => void; signal?: AbortSignal; tools?: Herramienta[]; images?: Blob[]; cache?: boolean }
) => Promise<{ text: string; truncated: boolean }>) & {
  limits(): Promise<{ images?: unknown; tools?: unknown }>;
};
export interface ErrorSample {
  code: string;
  message: string;
  text?: string;
  reason?: string;
}

export const usarSample = () => capacidad<Sample>('sample');

const ahoraHora = () => new Date().toTimeString().slice(0, 5);
const seriesTxt = (l: { kg: number; reps: number }[]) => l.map((s) => `${fkg(s.kg)}×${s.reps}`).join(' · ');

/** Plan de hoy de un ejercicio, con su variante si toca. */
function planDe(ex: Ejercicio, b: Borrador | null): { plan: Plan; ex: Ejercicio } {
  const base = sesiones.value.filter((s) => s.id !== b?.editando && (!b || s.fecha <= b.fecha));
  const ctx = { sesiones: base, gym: b?.gym ?? ajustes.value.gymPorDefecto, escalera: escalera(ex.carga), pesoCorporal: pesoCorporal.value, descarga: b?.descarga ?? descargaActiva() };
  if (ex.variante && esVariante(ex.id, b?.sustituto?.[ex.id])) {
    return { plan: planVariante(ex, { ...ctx, escaleraDe: (e) => escalera(e.carga) }), ex: comoVariante(ex) };
  }
  return { plan: planificar(ex, ctx), ex };
}

function estadoDia(d: DiaId, b: Borrador | null): string[] {
  const out: string[] = [];
  for (const id of getDia(d).bloques.flat()) {
    const principal = ejercicio(id)!;
    const { plan, ex } = planDe(principal, b);
    const sus = b?.sustituto?.[id];
    const hechas = (b?.ex[id] ?? []).filter((x): x is Serie => !!x);
    const partes = [
      `- ${id} · ${ex.nombre}${ex !== principal ? ` (variante de ${principal.corto})` : ''}${sus && ex === principal ? ` [hecho en su lugar: ${sus}]` : ''}`,
      `toca ${plan.decision === 'nuevo' ? `elegir peso, ${ex.min}-${ex.max} reps` : seriesTxt(plan.series)} (${plan.decision})`
    ];
    if (hechas.length) partes.push(`apuntado: ${textoSeries(hechas)}`);
    if (b?.exNotas[id]) partes.push(`nota de hoy: ${b.exNotas[id]}`);
    out.push(partes.join(' · '));
  }
  return out;
}

function rutina(): string[] {
  const out: string[] = [];
  for (const d of DIAS) {
    out.push(`${d.nombre} (${d.id}) · ${d.titulo}`);
    for (const id of d.bloques.flat()) {
      const e = ejercicio(id)!;
      out.push(`- ${id} · ${e.nombre} · ${e.series}×${e.min}-${e.max} RIR ${e.rir}${e.variante ? ` · variante: ${e.variante.nombre}` : ''}`);
    }
  }
  return out;
}

export function instrucciones(): string {
  const hoy = hoyISO();
  const b = borrador.value;
  const gyms = ajustes.value.gimnasios.map((g) => `${g.id} = ${g.nombre}`).join(', ');
  const sesion = b
    ? [
        `SESIÓN EN CURSO (sin guardar): ${getDia(b.dia).nombre} (${b.dia}), ${fechaLarga(b.fecha)}, gimnasio ${b.gym}${b.descarga ? ', semana de descarga' : ''}, ${seriesHechas(b)} series apuntadas.`,
        ...estadoDia(b.dia, b),
        b.notas ? `Notas de la sesión: ${b.notas}` : ''
      ]
    : [`No hay sesión en curso. Día que toca según la semana: ${getDia(diaSugerido(sesiones.value, hoy)).nombre}.`, ...estadoDia(diaSugerido(sesiones.value, hoy), null)];
  return [
    `Eres el entrenador de Rodrigo dentro de su app de rutina del gimnasio. Hoy es ${fechaLarga(hoy)} (${hoy}), son las ${ahoraHora()}.`,
    '',
    'Cómo hablarle: español de España, frases cortas, al grano, datos concretos antes que adjetivos. Si pide una decisión, una sola recomendación. Nada de lenguaje de anuncio. Sin tablas: el móvil es estrecho. Actúa como entrenador con experiencia: si algo afecta a la rutina (orden, fatiga, molestias, músculos sin trabajar), dilo con el motivo en una línea.',
    '',
    'Quién es: 21 años, 1,81 m, ~72 kg, casi 3 años entrenando. Gimnasio principal Basic-Fit Sevilla. Objetivo: músculo y fuerza; prioridad brazos. 4 días (lunes, martes, jueves, domingo), ~1h15. El alternativo sustituye al domingo cuando hay partido.',
    'Reglas fijas (no las cambies ni propongas cambiarlas sin que lo pida): el press inclinado con mancuernas y el jalón al pecho se quedan siempre; press de banca solo en máquina y plano; nada de sentadillas, peso muerto ni hiperextensiones (bisagra de cadera vetada); muñeca izquierda regular, con muñequera va bien. La alimentación va en su otra app (Comidas): aquí no.',
    `Reglas de progresión de la app: ${PERFIL.reglas.join(' ')}`,
    'Pesos en poleas y máquinas: no son comparables entre gimnasios ni entre máquinas distintas.',
    '',
    'Qué hacer con lo que te diga:',
    '- Si dice que ha hecho (o va a hacer) un ejercicio en otra máquina o lo ha cambiado por otro: usa cambiar_ejercicio. Si es la variante que tiene la app (o equivale), pon por="variante"; si no, el nombre de lo que hizo. Esas series no cuentan para la progresión del de la rutina. Dile en una frase qué peso le toca si es la variante.',
    '- Si te da series ("3 de 50 a 10, 9 y 8"), apúntalas con apuntar_series. Si no dice el ejercicio y no está claro, pregunta.',
    '- Molestias, sensaciones o correcciones: nota (de hoy o fija) o anotar_diario. Medidas (peso, brazo, cintura): guardar_medida.',
    '- Si cambia de gimnasio: cambiar_gimnasio. Si quiere empezar otro día de la rutina: empezar_dia.',
    '- Preguntas: contesta con los datos de abajo; para el historial de un ejercicio, ver_ejercicio. No inventes pesos ni registros.',
    '- La sesión la guarda él con "Terminar" en la pestaña Entrenar. Tú no cambias la rutina (ejercicios, series, rangos): si hace falta, recomiéndalo y dile que lo pida en Claude Code.',
    '- Ids de ejercicio: solo los de la lista. Fechas en formato AAAA-MM-DD.',
    '',
    `Gimnasios: ${gyms}.`,
    '',
    ...sesion.filter(Boolean),
    '',
    'RUTINA (id · ejercicio · series × reps · variante)',
    ...rutina(),
    '',
    'INFORME DE LA APP',
    informeClaude({ sesiones: sesiones.value, diario: diario.value, medidas: medidas.value, notasEjercicio: notasEjercicio.value, ajustes: ajustes.value }).replace(/\n¿Qué cambiarías\?$/, '')
  ].join('\n');
}

// ── Deshacer ──
export interface Deshacer {
  borrador: Borrador | null;
  sesiones: Sesion[];
  notas: Record<string, string>;
  medidas: Medida[];
  diario: EntradaDiario[];
}
export const foto = (): Deshacer => ({ borrador: borrador.value, sesiones: sesiones.value, notas: notasEjercicio.value, medidas: medidas.value, diario: diario.value });
export async function deshacer(d: Deshacer) {
  await setBorrador(d.borrador);
  const antes = new Map(d.sesiones.map((s) => [s.id, s]));
  for (const s of sesiones.value) {
    const a = antes.get(s.id);
    if (!a) await borrarSesion(s.id);
    else if (a !== s) await guardarSesion(a);
  }
  if (d.notas !== notasEjercicio.value) {
    notasEjercicio.value = d.notas;
    await db.set('notasEjercicio', d.notas);
  }
  if (d.medidas !== medidas.value) await setMedidas(d.medidas);
  if (d.diario !== diario.value) await setDiario(d.diario);
}

// ── Herramientas ──
const fechaArg = (x: unknown): string | undefined => {
  const s = String(x ?? '').trim();
  if (!s) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('fecha con formato AAAA-MM-DD');
  return s;
};
const num = (x: unknown) => (typeof x === 'number' ? x : Number(String(x ?? '').replace(',', '.')));
const cuando = (f: string) => (f === hoyISO() ? 'hoy' : `el ${fechaLarga(f).toLowerCase()}`);

function exDe(x: unknown): Ejercicio {
  const id = String(x ?? '').trim();
  const e = ejercicio(id);
  if (!e || e.retirado) throw new Error(`No existe el ejercicio "${id}" en la rutina actual. Usa un id de la lista.`);
  return e;
}

const enDia = (d: DiaId, id: string) => getDia(d).bloques.flat().includes(id);

type Destino = { tipo: 'borrador'; b: Borrador; fecha: string } | { tipo: 'sesion'; s: Sesion; fecha: string };

/** Dónde se aplica un cambio: la sesión en curso, una guardada de esa fecha, o una nueva de hoy. */
function destino(ex: Ejercicio, fArg: unknown): Destino {
  const f = fechaArg(fArg);
  const b = borrador.value;
  if (b && (!f || f === b.fecha) && enDia(b.dia, ex.id)) return { tipo: 'borrador', b, fecha: b.fecha };
  const fecha = f ?? hoyISO();
  const s = [...ordenarSesiones(sesiones.value)].reverse().find((x) => x.fecha === fecha && enDia(x.dia, ex.id));
  if (s) return { tipo: 'sesion', s, fecha };
  if (b && (!f || f === b.fecha)) throw new Error(`La sesión en curso es del ${getDia(b.dia).nombre.toLowerCase()} y ${ex.corto} no está en ese día.`);
  if (fecha !== hoyISO()) throw new Error(`No hay ninguna sesión guardada el ${fecha} con ${ex.corto}.`);
  return { tipo: 'borrador', b: nuevoBorrador(ex.dia), fecha };
}

/** Sesión entera (sin ejercicio concreto): la que está en curso o la última guardada de esa fecha. */
function destinoSesion(fArg: unknown): Destino {
  const f = fechaArg(fArg);
  const b = borrador.value;
  if (b && (!f || f === b.fecha)) return { tipo: 'borrador', b, fecha: b.fecha };
  const fecha = f ?? hoyISO();
  const s = [...ordenarSesiones(sesiones.value)].reverse().find((x) => x.fecha === fecha);
  if (s) return { tipo: 'sesion', s, fecha };
  throw new Error(`No hay sesión en curso ni guardada el ${fecha}.`);
}

async function guardarDestino(d: Destino, cambio: (x: Borrador | Sesion) => void) {
  if (d.tipo === 'borrador') {
    const nb: Borrador = { ...d.b, ex: { ...d.b.ex }, pesos: { ...d.b.pesos }, exNotas: { ...d.b.exNotas }, sustituto: d.b.sustituto ? { ...d.b.sustituto } : undefined };
    cambio(nb);
    if (nb.sustituto && !Object.keys(nb.sustituto).length) nb.sustituto = undefined;
    await setBorrador(nb);
  } else {
    const ns: Sesion = { ...d.s, ex: { ...d.s.ex }, exNotas: d.s.exNotas ? { ...d.s.exNotas } : undefined, sustituto: d.s.sustituto ? { ...d.s.sustituto } : undefined };
    cambio(ns);
    if (ns.sustituto && !Object.keys(ns.sustituto).length) ns.sustituto = undefined;
    if (ns.exNotas && !Object.keys(ns.exNotas).length) ns.exNotas = undefined;
    await guardarSesion(ns);
  }
}

/** Funciones que Claude puede usar. Cada cambio se anota en `cambios` para enseñarlo en el chat. */
export function herramientas(cambios: string[], alCambiar: () => void): Herramienta[] {
  const hecho = (t: string, extra = '') => {
    cambios.push(t);
    alCambiar();
    return `Hecho: ${t}.${extra ? ` ${extra}` : ''}`;
  };
  return [
    {
      name: 'cambiar_ejercicio',
      description:
        'Marca que un ejercicio de la rutina se hizo (o se va a hacer) con otra máquina u otro ejercicio. por="variante" usa la variante de la app (con su propio peso calculado); por="rutina" vuelve al ejercicio de la rutina; cualquier otro texto es el nombre de lo que hizo. Las series ya apuntadas se quedan y dejan de contar para la progresión del de la rutina. Sin fecha: la sesión en curso, o la de hoy.',
      inputSchema: {
        type: 'object',
        properties: {
          ejercicio: { type: 'string', description: 'id del ejercicio de la rutina, p. ej. mar-1' },
          por: { type: 'string', description: '"variante", "rutina" o el nombre de lo que hizo' },
          fecha: { type: 'string', description: 'AAAA-MM-DD si es una sesión ya guardada de otro día' }
        },
        required: ['ejercicio', 'por']
      },
      async execute(i) {
        const ex = exDe(i.ejercicio);
        const por = String(i.por ?? '').trim();
        if (!por) throw new Error('Falta "por".');
        let valor: string | null;
        if (/^(variante|la variante)$/i.test(por) || (ex.variante && (por === ex.variante.id || por.toLowerCase() === ex.variante.nombre.toLowerCase()))) {
          if (!ex.variante) throw new Error(`${ex.corto} no tiene variante en la app: pon el nombre de lo que hizo.`);
          valor = ex.variante.id;
        } else if (/^(rutina|original|el de la rutina|quitar|ninguno)$/i.test(por)) valor = null;
        else valor = por.slice(0, 60);
        const d = destino(ex, i.fecha);
        await guardarDestino(d, (x) => {
          x.sustituto = { ...(x.sustituto ?? {}) };
          if (valor) x.sustituto[ex.id] = valor;
          else delete x.sustituto[ex.id];
          if ('pesos' in x) delete x.pesos[ex.id];
        });
        const nombre = valor ? nombreSustituto(ex.id, valor) : ex.nombre;
        let extra = '';
        if (d.tipo === 'borrador' && valor && esVariante(ex.id, valor)) {
          const { plan } = planDe(ex, borrador.value);
          extra = plan.decision === 'nuevo' ? 'Sin datos para calcular el peso: que elija uno.' : `Le toca ${seriesTxt(plan.series)} (${plan.motivo})`;
        }
        return hecho(valor ? `${ex.corto} → ${nombre} ${cuando(d.fecha)}` : `${ex.corto}: vuelve al de la rutina ${cuando(d.fecha)}`, extra);
      }
    },
    {
      name: 'apuntar_series',
      description:
        'Apunta las series de un ejercicio (kg y reps; bajada opcional). Por defecto sustituye las que hubiera; con añadir=true las suma al final. series=[] borra las de ese ejercicio. Sin fecha: la sesión en curso, la guardada de hoy o una nueva de hoy.',
      inputSchema: {
        type: 'object',
        properties: {
          ejercicio: { type: 'string' },
          series: {
            type: 'array',
            items: { type: 'object', properties: { kg: { type: 'number' }, reps: { type: 'number' }, bajada_kg: { type: 'number' }, bajada_reps: { type: 'number' } }, required: ['kg', 'reps'] }
          },
          anadir: { type: 'boolean' },
          fecha: { type: 'string' }
        },
        required: ['ejercicio', 'series']
      },
      async execute(i) {
        const ex = exDe(i.ejercicio);
        if (!Array.isArray(i.series)) throw new Error('series debe ser una lista.');
        const nuevas: Serie[] = (i.series as Record<string, unknown>[]).map((x) => {
          const kg = num(x.kg);
          const reps = Math.round(num(x.reps));
          if (!(kg >= 0 && kg <= 300) || !(reps >= 1 && reps <= 50)) throw new Error('kg (0-300) o reps (1-50) fuera de rango.');
          const s: Serie = { kg, reps };
          if (num(x.bajada_kg) > 0 && num(x.bajada_reps) > 0) s.drop = { kg: num(x.bajada_kg), reps: Math.round(num(x.bajada_reps)) };
          return s;
        });
        const d = destino(ex, i.fecha);
        await guardarDestino(d, (x) => {
          const prev = ((x.ex[ex.id] ?? []) as (Serie | null)[]).filter((s): s is Serie => !!s);
          const lista = i.anadir ? [...prev, ...nuevas] : nuevas;
          if (lista.length) x.ex[ex.id] = lista;
          else delete x.ex[ex.id];
        });
        const sus = (d.tipo === 'borrador' ? borrador.value?.sustituto : sesiones.value.find((s) => s.id === d.s.id)?.sustituto)?.[ex.id];
        const nombre = sus ? nombreSustituto(ex.id, sus) : ex.corto;
        return hecho(nuevas.length ? `${nombre} ${cuando(d.fecha)}: ${textoSeries(nuevas)}${i.anadir ? ' (añadidas)' : ''}` : `${nombre} ${cuando(d.fecha)}: series borradas`);
      }
    },
    {
      name: 'nota',
      description:
        'Guarda una nota. tipo="hoy": nota de un ejercicio en la sesión (en curso o de esa fecha). tipo="fija": corrección del ejercicio que la app enseña cada vez que toca (texto vacío la borra). tipo="sesion": nota general de la sesión (se añade a la que haya).',
      inputSchema: {
        type: 'object',
        properties: { tipo: { type: 'string', enum: ['hoy', 'fija', 'sesion'] }, ejercicio: { type: 'string' }, texto: { type: 'string' }, fecha: { type: 'string' } },
        required: ['tipo', 'texto']
      },
      async execute(i) {
        const texto = String(i.texto ?? '').trim().slice(0, 300);
        const tipo = String(i.tipo);
        if (tipo === 'fija') {
          const ex = exDe(i.ejercicio);
          await setNota(ex.id, texto);
          return hecho(texto ? `corrección fija de ${ex.corto}: ${texto}` : `corrección de ${ex.corto} borrada`);
        }
        if (!texto) throw new Error('Falta el texto.');
        if (tipo === 'hoy') {
          const ex = exDe(i.ejercicio);
          const d = destino(ex, i.fecha);
          await guardarDestino(d, (x) => {
            x.exNotas = { ...(x.exNotas ?? {}), [ex.id]: texto };
          });
          return hecho(`nota de ${ex.corto} ${cuando(d.fecha)}: ${texto}`);
        }
        if (tipo === 'sesion') {
          const d = destinoSesion(i.fecha);
          await guardarDestino(d, (x) => {
            x.notas = x.notas ? `${x.notas.replace(/\.?\s*$/, '.')} ${texto}` : texto;
          });
          return hecho(`nota de la sesión ${cuando(d.fecha)}: ${texto}`);
        }
        throw new Error('tipo debe ser hoy, fija o sesion.');
      }
    },
    {
      name: 'ver_ejercicio',
      description: 'Devuelve el historial de un ejercicio (últimas 6 sesiones, también las de su variante), lo que toca hoy y su corrección fija.',
      inputSchema: { type: 'object', properties: { ejercicio: { type: 'string' } }, required: ['ejercicio'] },
      execute(i) {
        const ex = exDe(i.ejercicio);
        const gyms = new Map(ajustes.value.gimnasios.map((g) => [g.id, g.nombre]));
        const ss = [...ordenarSesiones(sesiones.value)].reverse().filter((s) => s.ex[ex.id]?.length).slice(0, 6);
        const l = [`${ex.nombre} (${ex.id}) · ${ex.series}×${ex.min}-${ex.max} RIR ${ex.rir} · carga: ${ex.carga}`];
        for (const s of ss) {
          const sus = s.sustituto?.[ex.id];
          l.push(`${s.fecha} · ${s.gym ? gyms.get(s.gym) ?? s.gym : 'gym sin confirmar'}${sus ? ` · hecho en su lugar: ${nombreSustituto(ex.id, sus)}` : ''}: ${textoSeries(s.ex[ex.id])}`);
        }
        if (!ss.length) l.push('Sin registros.');
        const b = borrador.value;
        const { plan } = planDe(ex, b && enDia(b.dia, ex.id) ? { ...b, sustituto: undefined } : null);
        l.push(`Hoy toca: ${plan.decision === 'nuevo' ? 'elegir peso' : seriesTxt(plan.series)} (${plan.motivo})`);
        if (ex.variante) {
          const pv = planVariante(ex, {
            sesiones: sesiones.value,
            gym: borrador.value?.gym ?? ajustes.value.gymPorDefecto,
            escalera: escalera(ex.variante.carga),
            pesoCorporal: pesoCorporal.value,
            descarga: false,
            escaleraDe: (e) => escalera(e.carga)
          });
          l.push(`Variante: ${ex.variante.nombre} (${ex.variante.cuando}). Le tocaría ${pv.decision === 'nuevo' ? 'elegir peso' : seriesTxt(pv.series)}. Veces hecha: ${sesionesVariante(ex, sesiones.value).length}.`);
        }
        if (notasEjercicio.value[ex.id]) l.push(`Corrección fija: ${notasEjercicio.value[ex.id]}`);
        return l.join('\n');
      }
    },
    {
      name: 'cambiar_gimnasio',
      description: 'Cambia el gimnasio de la sesión en curso o de las sesiones guardadas de una fecha.',
      inputSchema: { type: 'object', properties: { gym: { type: 'string', description: 'id del gimnasio' }, fecha: { type: 'string' } }, required: ['gym'] },
      async execute(i) {
        const g = ajustes.value.gimnasios.find((x) => x.id === String(i.gym));
        if (!g) throw new Error(`Gimnasio desconocido. Ids: ${ajustes.value.gimnasios.map((x) => x.id).join(', ')}.`);
        const d = destinoSesion(i.fecha);
        await guardarDestino(d, (x) => {
          x.gym = g.id;
          if (d.tipo === 'sesion') (x as Sesion).gymConfirmado = true;
        });
        return hecho(`gimnasio ${cuando(d.fecha)}: ${g.nombre}`);
      }
    },
    {
      name: 'guardar_medida',
      description: 'Guarda peso (kg, en ayunas), brazo contraído (cm) y/o cintura a la altura del ombligo (cm).',
      inputSchema: { type: 'object', properties: { fecha: { type: 'string' }, peso: { type: 'number' }, brazo: { type: 'number' }, cintura: { type: 'number' } } },
      async execute(i) {
        const fecha = fechaArg(i.fecha) ?? hoyISO();
        const m: Medida = { fecha };
        if (num(i.peso) >= 40 && num(i.peso) <= 150) m.peso = num(i.peso);
        if (num(i.brazo) >= 20 && num(i.brazo) <= 60) m.brazo = num(i.brazo);
        if (num(i.cintura) >= 50 && num(i.cintura) <= 140) m.cintura = num(i.cintura);
        if (!m.peso && !m.brazo && !m.cintura) throw new Error('Medidas fuera de rango.');
        const prev = medidas.value.find((x) => x.fecha === fecha);
        await setMedidas([...medidas.value.filter((x) => x.fecha !== fecha), { ...prev, ...m }]);
        const t = [m.peso && `peso ${fkg(m.peso)} kg`, m.brazo && `brazo ${fkg(m.brazo)} cm`, m.cintura && `cintura ${fkg(m.cintura)} cm`].filter(Boolean).join(', ');
        return hecho(`${t} (${cuando(fecha)})`);
      }
    },
    {
      name: 'anotar_diario',
      description: 'Apunta en el diario de Notas una sensación, una corrección de técnica o una molestia (para revisarlas luego).',
      inputSchema: { type: 'object', properties: { tipo: { type: 'string', enum: ['sensacion', 'correccion', 'molestia'] }, texto: { type: 'string' } }, required: ['tipo', 'texto'] },
      async execute(i) {
        const tipo = String(i.tipo) as EntradaDiario['tipo'];
        if (!['sensacion', 'correccion', 'molestia'].includes(tipo)) throw new Error('tipo: sensacion, correccion o molestia.');
        const texto = String(i.texto ?? '').trim().slice(0, 300);
        if (!texto) throw new Error('Falta el texto.');
        await setDiario([...diario.value, { id: uid(), fecha: hoyISO(), tipo, texto }]);
        return hecho(`${tipo === 'molestia' ? 'molestia' : tipo === 'correccion' ? 'corrección' : 'sensación'} en el diario: ${texto}`);
      }
    },
    {
      name: 'empezar_dia',
      description: 'Empieza la sesión de otro día de la rutina hoy (p. ej. el alternativo por partido). Solo si no hay series apuntadas en la sesión en curso.',
      inputSchema: { type: 'object', properties: { dia: { type: 'string', enum: DIAS.map((d) => d.id) } }, required: ['dia'] },
      async execute(i) {
        const d = DIAS.find((x) => x.id === String(i.dia));
        if (!d) throw new Error('Día desconocido.');
        const b = borrador.value;
        if (b && seriesHechas(b) > 0) throw new Error(`Hay ${seriesHechas(b)} series apuntadas del ${getDia(b.dia).nombre.toLowerCase()}. Que las guarde o descarte en Entrenar.`);
        await setBorrador(nuevoBorrador(d.id, b?.gym));
        return hecho(`sesión de ${d.nombre.toLowerCase()} empezada`);
      }
    }
  ];
}

export const SUGERENCIAS = [
  'Hoy he hecho el jalón en otra máquina',
  'La prensa está ocupada, ¿qué hago?',
  '¿Qué me toca hoy en el press inclinado?',
  'Me molesta la muñeca izquierda',
  '¿Cómo voy en brazos?'
];

export function mensajeError(e: ErrorSample): string {
  switch (e.code) {
    case 'not_granted':
      return 'No has dado permiso a la app para usar Claude. Ciérrala y vuelve a abrirla para que te lo pregunte.';
    case 'rate_limited':
      return e.reason === 'usage_limit' ? 'Has llegado al límite de uso de tu plan de Claude. Prueba más tarde.' : 'Demasiados mensajes seguidos. Espera un momento y vuelve a enviarlo.';
    case 'session_expired':
      return 'Tienes que volver a iniciar sesión en Claude.';
    case 'image_rejected':
      return 'No he podido leer la foto. Prueba con otra (JPG o PNG).';
    case 'prompt_too_large':
      return 'La conversación es muy larga. Borra el chat y vuelve a preguntar.';
    case 'refused':
      return 'Claude no ha querido responder a eso. Prueba a decirlo de otra forma.';
    case 'cancelled':
      return 'Parado.';
    default:
      return 'No ha llegado la respuesta. Vuelve a enviarlo.';
  }
}

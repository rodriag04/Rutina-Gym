import { ejercicio, type Ejercicio, type Variante } from '../data/rutina';
import { conPesoCorporal, type Escalera } from './cargas';
import { kg as fkg } from './formato';
import { e1rm, planificar, repsCon, type ContextoPlan, type Plan } from './progresion';
import type { Sesion } from './tipos';

/*
  Variantes: otro ejercicio para los mismos músculos.
  Sus series se guardan con el id del principal y `sustituto[id] = variante.id`.
  Peso de la variante, por orden:
  1. Si ya la has hecho: sus propias sesiones, con las reglas de siempre.
  2. Si no: se calcula del plan de hoy de la fuente (el principal u otro ejercicio de la rutina
     con el mismo músculo): 1RM estimado × factor, y se elige el peso más alto de tu escalera
     con el que todas las series quedan dentro del rango dejando las reps en recámara.
*/

/** El ejercicio tal y como se hace con la variante (mismo id, para guardar las series). */
export function comoVariante(ex: Ejercicio): Ejercicio {
  const v = ex.variante;
  if (!v) return ex;
  return {
    ...ex,
    nombre: v.nombre,
    corto: v.corto,
    carga: v.carga,
    series: v.series ?? ex.series,
    min: v.min ?? ex.min,
    max: v.max ?? ex.max,
    rir: v.rir ?? ex.rir,
    rirMin: v.rirMin ?? ex.rirMin,
    esquema: undefined,
    tecnica: v.tecnica,
    claves: [],
    error: '',
    porLado: v.porLado,
    refInicial: undefined,
    referencia: undefined,
    notaInicial: undefined
  };
}

/** Nombre de lo que se hizo en lugar de un ejercicio (variante de la app o texto libre). */
export function nombreSustituto(exId: string, valor: string): string {
  const v = ejercicio(exId)?.variante;
  return v && v.id === valor ? v.nombre : valor;
}

export const esVariante = (exId: string, valor: string | undefined) => !!valor && ejercicio(exId)?.variante?.id === valor;

/** Sesiones en las que hiciste la variante, como si fueran del ejercicio (para el motor de siempre). */
export function sesionesVariante(ex: Ejercicio, sesiones: Sesion[]): Sesion[] {
  const v = ex.variante;
  if (!v) return [];
  return sesiones
    .filter((s) => s.sustituto?.[ex.id] === v.id && s.ex[ex.id]?.length)
    .map((s) => ({ ...s, sustituto: undefined }));
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** Convierte el plan de un ejercicio en el de otro (1RM × factor). */
export function convertir(
  fuente: Ejercicio,
  pf: Plan,
  exV: Ejercicio,
  factor: number,
  esc: Escalera,
  pc: number
): { kg: number; reps: number }[] {
  const cf = (k: number) => (conPesoCorporal(fuente.carga) ? pc + k : k);
  const cv = (k: number) => (conPesoCorporal(exV.carga) ? pc + k : k);
  // Las reps previstas van con reps en recámara: el 1RM se estima con las que podrías hacer.
  const rms = pf.series.map((s) => e1rm(cf(s.kg), s.reps + fuente.rirMin) * factor);
  const rm = (i: number) => rms[Math.min(i, rms.length - 1)];
  const n = exV.series;
  const objetivo = Math.min(exV.max, exV.min + 2);
  const bruto = rm(0) / (1 + (objetivo + exV.rirMin) / 30);
  const estimado = esc.ajustar(conPesoCorporal(exV.carga) ? Math.max(0, bruto - pc) : bruto);
  const pred = (kg: number) => Array.from({ length: n }, (_, i) => Math.floor(repsCon(rm(i), cv(kg)) + 1e-6) - exV.rirMin);
  // El peso que deja más series dentro del rango (quedarse corto cuenta el doble que pasarse);
  // a igualdad, el que pone la 1.ª serie más cerca de mínimo+2.
  const fuera = (kg: number) => {
    const p = pred(kg);
    return p.reduce((a, r) => a + Math.max(0, r - exV.max) + 2 * Math.max(0, exV.min - r), 0) + 0.1 * Math.abs(p[0] - objetivo);
  };
  let kg = estimado;
  let mejor = Infinity;
  for (const k of esc.alrededor(estimado, 4).sort((a, b) => b - a)) {
    const f = fuera(k);
    if (f < mejor) [kg, mejor] = [k, f];
  }
  return pred(kg).map((r) => ({ kg, reps: clamp(r, exV.min, exV.max) }));
}

export function planVariante(ex: Ejercicio, ctx: ContextoPlan & { escaleraDe: (e: Ejercicio) => Escalera }): Plan {
  const v = ex.variante as Variante;
  const exV = comoVariante(ex);
  const esc = ctx.escaleraDe(exV);

  // 1. Ya la has hecho: sus sesiones mandan.
  const propias = sesionesVariante(ex, ctx.sesiones);
  if (propias.length) return planificar(exV, { ...ctx, sesiones: propias, escalera: esc });

  // 2. Primera vez: desde la fuente.
  const fuente = (v.fuente && ejercicio(v.fuente)) || ex;
  const pf = planificar(fuente, { ...ctx, descarga: false, escalera: ctx.escaleraDe(fuente) });
  if (pf.decision === 'nuevo' || !pf.series.length) {
    return {
      series: Array.from({ length: exV.series }, () => ({ kg: 0, reps: Math.round((exV.min + exV.max) / 2) })),
      decision: 'nuevo',
      motivo: `Sin registros de ${fuente.corto} para calcularla. Elige un peso con el que hagas ${exV.min}-${exV.max} dejando ${exV.rir} en recámara.`
    };
  }
  let series = convertir(fuente, pf, exV, v.factor ?? 1, esc, ctx.pesoCorporal);
  const desde = pf.series[0];
  const desdeTxt = conPesoCorporal(fuente.carga) && desde.kg === 0 ? `tu peso × ${desde.reps}` : `${fkg(desde.kg)} kg × ${desde.reps}`;
  let motivo =
    fuente.id === ex.id
      ? `Calculado desde tu ${fuente.corto} de hoy (${desdeTxt}). Primera vez: si la 1.ª serie no cuadra, ajusta el peso y la app aprende.`
      : `Calculado desde tu ${fuente.corto} (${desdeTxt}), que trabaja lo mismo. Primera vez: ajusta en la 1.ª serie si no cuadra.`;
  let decision: Plan['decision'] = 'estimado';
  if (ctx.descarga) {
    series = series.slice(0, Math.ceil(series.length / 2)).map((s) => ({ ...s, reps: Math.max(1, s.reps - 2) }));
    decision = 'descarga';
    motivo = `Descarga. ${motivo}`;
  }
  return { series, decision, motivo, ref: pf.ref, fuente: fuente.corto, otroGym: pf.otroGym };
}

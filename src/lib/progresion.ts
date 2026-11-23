import type { Ejercicio } from '../data/rutina';
import { conPesoCorporal, Escalera } from './cargas';
import { kg as fkg } from './formato';
import type { Serie, Sesion } from './tipos';

/*
  Motor de progresión. Reglas (las tuyas, con dos mejoras):
  1. Series rectas: un solo peso. Se ignoran calentamientos (< 75 % del máximo) y bajadas.
  2. Subes el escalón mínimo cuando la 1.ª serie llega al máximo del rango y la 2.ª se queda a 1.
     (Mejora: antes bastaba con la 1.ª y luego te hundías en la 2.ª y 3.ª.)
  3. Mejora: si el siguiente peso es un salto grande y con él no llegarías al mínimo,
     primero subes reps hasta 3 por encima del rango.
  4. Si la 1.ª queda 3 o más por debajo del mínimo, bajas un escalón.
  5. Si no, mismo peso y una rep más por serie.
  Press inclinado: esquema de serie pesada (T) + series a T−2.
  Las reps se estiman con Epley (1RM = kg × (1 + reps/30)) cuando cambia el peso.
*/

export const e1rm = (kg: number, reps: number) => kg * (1 + Math.min(reps, 20) / 30);
export const repsCon = (rm: number, kg: number) => (kg <= 0 ? 0 : 30 * (rm / kg - 1));

export interface ContextoPlan {
  sesiones: Sesion[];
  gym: string | null;
  escalera: Escalera;
  pesoCorporal: number;
  descarga: boolean;
}

export interface SeriePlan {
  kg: number;
  reps: number;
  /** Alternativa condicionada (press inclinado: 2.ª serie). */
  alt?: { kg: number; reps: number; si: string };
}

export type Decision = 'subir' | 'mantener' | 'bajar' | 'nuevo' | 'descarga';

export interface Plan {
  series: SeriePlan[];
  decision: Decision;
  motivo: string;
  ref?: { fecha: string; gym: string | null; series: Serie[]; inicial?: boolean };
  otroGym?: boolean;
  calentamiento?: { kg: number; reps: number }[];
  bajoRango?: boolean;
}

export const gymCompatible = (s: Sesion, gym: string | null) => !gym || s.gym == null || s.gym === gym;

/** Series válidas para calcular: sin calentamientos ni series < 75 % del peso máximo. */
export function limpias(series: Serie[], ex?: Pick<Ejercicio, 'carga'>): Serie[] {
  const v = series.filter((s) => !s.calentamiento && s.reps > 0);
  if ((ex && conPesoCorporal(ex.carga)) || v.length === 0) return v;
  const max = Math.max(...v.map((s) => s.kg));
  return v.filter((s) => s.kg >= 0.75 * max);
}

export const ordenarSesiones = (ss: Sesion[]) =>
  [...ss].sort((a, b) => (a.fecha === b.fecha ? a.guardado.localeCompare(b.guardado) : a.fecha.localeCompare(b.fecha)));

/** Sesiones válidas de un ejercicio (más reciente primero). */
export function sesionesDe(exId: string, sesiones: Sesion[]): Sesion[] {
  return ordenarSesiones(sesiones)
    .reverse()
    .filter((s) => (s.ex[exId]?.length ?? 0) > 0 && !s.sustituto?.[exId]);
}

export function referencia(ex: Ejercicio, ctx: ContextoPlan): { s: Sesion; otroGym: boolean } | undefined {
  const lista = sesionesDe(ex.id, ctx.sesiones).filter((s) => !s.descarga && limpias(s.ex[ex.id], ex).length);
  const mismo = lista.find((s) => gymCompatible(s, ctx.gym));
  if (mismo) return { s: mismo, otroGym: false };
  if (lista[0]) return { s: lista[0], otroGym: true };
  return undefined;
}

function pesoModa(series: Serie[]): number {
  const cuenta = new Map<number, number>();
  for (const s of series) cuenta.set(s.kg, (cuenta.get(s.kg) ?? 0) + 1);
  let mejor = series[0].kg;
  for (const [k, n] of cuenta) {
    const nm = cuenta.get(mejor)!;
    if (n > nm || (n === nm && k > mejor)) mejor = k;
  }
  return mejor;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function planificar(ex: Ejercicio, ctx: ContextoPlan): Plan {
  const carga = (k: number) => (conPesoCorporal(ex.carga) ? ctx.pesoCorporal + k : k);
  const rmDe = (s: Serie) => e1rm(carga(s.kg), s.reps);
  /** Reps equivalentes de una serie si se hubiera hecho con otro peso. */
  const equiv = (s: Serie, k: number) => (Math.abs(s.kg - k) < 0.01 ? s.reps : Math.floor(repsCon(rmDe(s), carga(k))));

  const r = referencia(ex, ctx);
  let refSeries: Serie[] | undefined;
  let refInfo: Plan['ref'];
  if (r) {
    refSeries = limpias(r.s.ex[ex.id], ex);
    refInfo = { fecha: r.s.fecha, gym: r.s.gym, series: r.s.ex[ex.id] };
  } else if (ex.refInicial) {
    // Registros que solo constan en notas (dominadas del 8 nov).
    refSeries = ex.refInicial.series;
    refInfo = { fecha: ex.refInicial.fecha, gym: null, series: refSeries, inicial: true };
  }

  if (!refSeries || !refSeries.length) {
    return {
      series: Array.from({ length: ex.series }, () => ({ kg: 0, reps: Math.round((ex.min + ex.max) / 2) })),
      decision: 'nuevo',
      motivo: `Sin registros. Elige un peso con el que hagas ${ex.min}-${ex.max} dejando ${ex.rir} en recámara; la próxima vez ya calcula la app.`
    };
  }

  const base: Omit<Plan, 'series' | 'decision' | 'motivo'> = { ref: refInfo, otroGym: r?.otroGym };
  const esc = ctx.escalera;
  const C = refSeries;

  // ── Semana de descarga ──
  if (ctx.descarga) {
    const W = pesoModa(C);
    const n = Math.ceil(ex.series / 2);
    return {
      ...base,
      decision: 'descarga',
      motivo: 'Descarga: mismo peso, la mitad de series y 2-3 reps en recámara.',
      series: Array.from({ length: n }, (_, i) => ({ kg: W, reps: Math.max(1, equiv(C[Math.min(i, C.length - 1)], W) - 2) }))
    };
  }

  // ── Press inclinado: serie pesada + series a T−2 ──
  if (ex.esquema === 'topset') return planTopset(ex, C, base, esc, equiv);

  // ── Series rectas ──
  const W0 = pesoModa(C);
  // Series con más peso que W0 se convierten (son un mínimo fiable); las de menos peso se ignoran
  // (pueden no haber ido cerca del fallo).
  const validas = C.filter((s) => s.kg >= W0 - 0.01);
  const q = validas.map((s) => Math.max(0, equiv(s, W0)));
  for (let i = q.length - 2; i >= 0; i--) if (validas[i].kg > W0 + 0.01) q[i] = Math.max(q[i], q[i + 1]);
  const n = ex.series;
  const sig = esc.siguiente(W0);
  const ant = esc.anterior(W0);
  const rm1 = e1rm(carga(W0), q[0]);
  const predSig = Math.floor(repsCon(rm1, carga(sig)));
  const extendido = ex.max + 3;

  const relleno = (t: number[]) => {
    while (t.length < n) t.push(t[t.length - 1]);
    return t.slice(0, n);
  };

  // Bajar
  if (q[0] <= ex.min - 3 && ant < W0) {
    const t1 = clamp(Math.floor(repsCon(rm1, carga(ant))), ex.min, ex.min + 2);
    const t = [t1];
    for (let i = 1; i < n; i++) t.push(Math.max(ex.min, t[i - 1] - 1));
    return {
      ...base,
      decision: 'bajar',
      motivo: `La 1.ª serie se quedó en ${q[0]}, 3 o más por debajo de ${ex.min}. Baja a ${fkg(ant)} kg.`,
      series: t.map((reps) => ({ kg: ant, reps }))
    };
  }

  const listo = q[0] >= ex.max && (q.length < 2 || q[1] >= ex.max - 1);
  if (listo && sig > W0) {
    // Salto grande = más del 10 %: solo entonces se exige llegar al mínimo con el peso nuevo.
    const grande = (sig - W0) / W0 > 0.1;
    if (!grande || predSig >= ex.min || q[0] >= extendido) {
      const t1 = clamp(predSig, ex.min, ex.min + 2);
      const t = [t1];
      for (let i = 1; i < n; i++) t.push(Math.max(ex.min, t[i - 1] - 1));
      return {
        ...base,
        decision: 'subir',
        motivo:
          validas[0].kg > W0 + 0.01
            ? `${fkg(validas[0].kg)}×${validas[0].reps} en la 1.ª y ${q[1] ?? q[0]} con ${fkg(W0)} kg: ${fkg(W0)} se te queda corto. Sube a ${fkg(sig)} kg.`
            : `${q[0]} y ${q[1] ?? q[0]} reps con ${fkg(W0)} kg: rango superado. Sube a ${fkg(sig)} kg.`,
        series: t.map((reps) => ({ kg: sig, reps }))
      };
    }
    const salto = Math.round(((sig - W0) / W0) * 100);
    return {
      ...base,
      decision: 'mantener',
      motivo: `Salto grande (${fkg(W0)} → ${fkg(sig)} kg, +${salto} %): con ${fkg(sig)} harías unas ${Math.max(predSig, 0)}. Antes sube reps hasta ${extendido}.`,
      series: relleno(q.map((x) => Math.min(extendido, x + 1))).map((reps) => ({ kg: W0, reps }))
    };
  }

  const t = relleno(q.map((x) => Math.min(ex.max, x + 1)));
  const bajoRango = t.some((x) => x < ex.min);
  let motivo = 'Mismo peso: busca una rep más en cada serie.';
  if (q[0] >= ex.max && q.length > 1) motivo = `La 1.ª ya llega a ${ex.max}. Cuando la 2.ª haga ${ex.max - 1}, subes.`;
  if (bajoRango) motivo += ' Alguna serie se queda corta: descansa el tiempo completo.';
  if (new Set(C.map((s) => s.kg)).size > 1) motivo += ` La última vez cambiaste de peso; hoy todas con ${fkg(W0)} kg.`;
  return { ...base, decision: 'mantener', motivo, bajoRango, series: t.map((reps) => ({ kg: W0, reps })) };
}

function planTopset(
  ex: Ejercicio,
  C: Serie[],
  base: Omit<Plan, 'series' | 'decision' | 'motivo'>,
  esc: Escalera,
  equiv: (s: Serie, k: number) => number
): Plan {
  const T = Math.max(...C.map((s) => s.kg));
  const s1 = C.find((s) => s.kg === T)!;
  const r1 = s1.reps;
  let Tn = T;
  let t1 = Math.min(ex.max, r1 + 1);
  let decision: Decision = 'mantener';
  let motivo = `Serie pesada: ${fkg(T)} kg. Busca ${t1} limpias en la 1.ª.`;
  if (r1 >= ex.max) {
    Tn = esc.siguiente(T);
    t1 = clamp(Math.floor(repsCon(e1rm(T, r1), Tn)), ex.min, ex.min + 2);
    decision = 'subir';
    motivo = `${r1} limpias con ${fkg(T)}: la serie pesada sube a ${fkg(Tn)} kg.`;
  } else if (r1 <= ex.min - 3) {
    Tn = esc.anterior(T);
    t1 = clamp(Math.floor(repsCon(e1rm(T, r1), Tn)), ex.min, ex.min + 2);
    decision = 'bajar';
    motivo = `La serie pesada se quedó en ${r1}. Baja a ${fkg(Tn)} kg.`;
  }
  const B = esc.anterior(Tn);
  const objetivo = (i: number, k: number) => {
    const ref = C[i];
    if (!ref) return Math.max(ex.min, t1 - i);
    return clamp(equiv(ref, k) + (Math.abs(ref.kg - k) < 0.01 ? 1 : 0), 1, ex.max);
  };
  const series: SeriePlan[] = [{ kg: Tn, reps: t1 }];
  for (let i = 1; i < ex.series; i++) {
    if (i === 1) {
      series.push({ kg: Tn, reps: objetivo(1, Tn), alt: { kg: B, reps: objetivo(1, B), si: 'si la 1.ª no llega a 8' } });
    } else series.push({ kg: B, reps: objetivo(i, B) });
  }
  const calentamiento = [
    { kg: esc.ajustar(Tn * 0.5), reps: 10 },
    { kg: esc.ajustar(Tn * 0.7), reps: 4 },
    { kg: esc.ajustar(Tn * 0.85), reps: 2 }
  ];
  return { ...base, decision, motivo, series, calentamiento };
}

/** Ajuste en vivo del press inclinado: la 2.ª serie va con T si la 1.ª hizo 8 o más. */
export function resolverAlt(p: SeriePlan, reps1?: number): { kg: number; reps: number } {
  if (!p.alt || reps1 == null) return { kg: p.kg, reps: p.reps };
  return reps1 >= 8 ? { kg: p.kg, reps: p.reps } : { kg: p.alt.kg, reps: p.alt.reps };
}

/** Calentamiento genérico para el primer ejercicio pesado del día. */
export function calentamientoGenerico(kgTrabajo: number, esc: Escalera) {
  if (kgTrabajo <= 0) return [];
  const a = esc.ajustar(kgTrabajo * 0.5);
  const b = esc.ajustar(kgTrabajo * 0.75);
  return a === b ? [{ kg: a, reps: 8 }] : [{ kg: a, reps: 10 }, { kg: b, reps: 4 }];
}

/** Mejor 1RM estimado de una sesión para un ejercicio. */
export function rendimiento(series: Serie[] | undefined, ex: Ejercicio, pesoCorporal = 72): number {
  if (!series?.length) return 0;
  const c = limpias(series, ex);
  if (!c.length) return 0;
  return Math.max(...c.map((s) => e1rm(conPesoCorporal(ex.carga) ? pesoCorporal + s.kg : s.kg, s.reps)));
}

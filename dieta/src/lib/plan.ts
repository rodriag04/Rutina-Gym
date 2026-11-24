import { RECETA } from '../data/recetas';
import { horario, type Evento, type Horas, HORAS, type Hueco } from './horario';
import { aMin } from './fechas';
import { CERO, cantidades, macroPorciones, sumar, type Porcion } from './nutricion';
import type { ConfigDia, Eleccion, Macro, Objetivos, Receta, Registro } from './tipos';

export const OBJETIVOS: Objetivos = { kcalGym: 2325, kcalDescanso: 2125, prot: 160, futbol: 250 };

export const esDiaGym = (cfg: ConfigDia) => !!cfg.gym;

export const objetivoDia = (cfg: ConfigDia, o: Objetivos) => ({
  kcal: (cfg.gym ? o.kcalGym : o.kcalDescanso) + (cfg.futbol ? o.futbol : 0),
  p: o.prot
});

/** Presupuesto de una comida libre (cuenta en el día aunque no esté en el plan). */
export const presupuestoLibre = (slot: 'comida' | 'cena', objetivoKcal: number): Macro =>
  slot === 'cena'
    ? { kcal: Math.round(objetivoKcal * 0.3), p: 40, c: 0, g: 0 }
    : { kcal: Math.round(objetivoKcal * 0.33), p: 45, c: 0, g: 0 };

export interface ComidaDia {
  hueco: Hueco;
  receta?: Receta;
  porciones: Porcion[];
  macro: Macro;
  registro?: Registro;
  /** Planificada pero cambiada para cuadrar el día tras un registro. */
  ajustada?: boolean;
}

export interface DiaCalculado {
  fecha: string;
  cfg: ConfigDia;
  comidas: ComidaDia[];
  eventos: Evento[];
  objetivo: { kcal: number; p: number };
  /** Total previsto (registrado + pendiente). */
  total: Macro;
  /** Ya comido. */
  comido: Macro;
  /** Lo que falta por comer según el plan ajustado. */
  pendiente: Macro;
  /** Merienda y cena en Cabra (presupuesto, regla del plato). */
  fuera?: Macro;
  /** Desvío que el plan no puede corregir con las cantidades. */
  aviso?: string;
  escala: { fp: number; fh: number };
}

const W_KCAL = 1 / 40;
const W_PROT = 1 / 3;

interface Item {
  receta: Receta;
  pesoHc: number;
  topeHc?: number;
}

const factorHc = (fh: number, it: { pesoHc: number; topeHc?: number }) => Math.min(fh * it.pesoHc, it.topeHc ?? 9);

function totalItems(items: Item[], fp: number, fh: number, descanso: boolean, redondear: boolean): Macro {
  return sumar(
    ...items.map((it) => macroPorciones(cantidades(it.receta, { fp, fh: factorHc(fh, it) }, descanso, redondear)))
  );
}

/**
 * Busca factores de proteína (fp) y de hidratos (fh) para que las comidas pendientes
 * lleven el día al objetivo. Gauss-Newton con dos variables y límites.
 */
export function cuadrar(items: Item[], meta: { kcal: number; p: number }, descanso: boolean) {
  let fp = 1;
  let fh = 1;
  const LIM = { fp: [0.6, 1.8], fh: [0.25, 2.6] } as const;
  const f = (a: number, b: number) => totalItems(items, a, b, descanso, false);
  for (let it = 0; it < 12; it++) {
    const m = f(fp, fh);
    const eK = (meta.kcal - m.kcal) * W_KCAL;
    const eP = (meta.p - m.p) * W_PROT;
    if (Math.abs(eK) < 0.3 && Math.abs(eP) < 0.3) break;
    const d = 0.02;
    const mp = f(fp + d, fh);
    const mh = f(fp, fh + d);
    const J = [
      [((mp.kcal - m.kcal) / d) * W_KCAL, ((mh.kcal - m.kcal) / d) * W_KCAL],
      [((mp.p - m.p) / d) * W_PROT, ((mh.p - m.p) / d) * W_PROT]
    ];
    // (JᵀJ + λI) Δ = Jᵀe
    const l = 1e-3;
    const a = J[0][0] ** 2 + J[1][0] ** 2 + l;
    const b = J[0][0] * J[0][1] + J[1][0] * J[1][1];
    const c = J[0][1] ** 2 + J[1][1] ** 2 + l;
    const g1 = J[0][0] * eK + J[1][0] * eP;
    const g2 = J[0][1] * eK + J[1][1] * eP;
    const det = a * c - b * b;
    if (Math.abs(det) < 1e-12) break;
    const dp = (c * g1 - b * g2) / det;
    const dh = (a * g2 - b * g1) / det;
    const nfp = Math.max(LIM.fp[0], Math.min(LIM.fp[1], fp + dp));
    const nfh = Math.max(LIM.fh[0], Math.min(LIM.fh[1], fh + dh));
    if (Math.abs(nfp - fp) < 1e-4 && Math.abs(nfh - fh) < 1e-4) break;
    fp = nfp;
    fh = nfh;
  }
  return { fp, fh };
}

/** Plan del día con lo ya registrado: reajusta lo que queda por comer. */
export function calcularDia(
  fecha: string,
  cfg: ConfigDia,
  menu: Eleccion[],
  registros: Registro[],
  o: Objetivos,
  horas: Horas = HORAS
): DiaCalculado {
  const { huecos, eventos } = horario(cfg, horas);
  const objetivo = objetivoDia(cfg, o);
  const descanso = !cfg.gym;
  const reg = new Map(registros.filter((r) => r.fecha === fecha).map((r) => [r.slot, r]));

  let comido = { ...CERO };
  let fijo = { ...CERO };
  const pendientes: { hueco: Hueco; receta: Receta }[] = [];
  const comidas: ComidaDia[] = [];

  for (const h of huecos) {
    const r = reg.get(h.slot);
    const eleccion = menu.find((e) => e.slot === h.slot);
    const receta = eleccion ? RECETA[eleccion.receta] : undefined;
    if (r) {
      comido = sumar(comido, r.macro);
      comidas.push({ hueco: h, receta, porciones: [], macro: r.macro, registro: r });
    } else if (h.libre) {
      const m = presupuestoLibre(h.slot === 'cena' ? 'cena' : 'comida', objetivo.kcal);
      fijo = sumar(fijo, m);
      comidas.push({ hueco: h, porciones: [], macro: m });
    } else if (receta) {
      pendientes.push({ hueco: h, receta });
      comidas.push({ hueco: h, receta, porciones: [], macro: { ...CERO } });
    }
  }

  // Viernes que se va a Cabra: merienda y cena allí, con un presupuesto.
  let fuera: Macro | undefined;
  if (cfg.cabra) {
    fuera = { kcal: Math.round(objetivo.kcal * 0.45), p: 75, c: 0, g: 0 };
    fijo = sumar(fijo, fuera);
  }

  const meta = { kcal: objetivo.kcal - comido.kcal - fijo.kcal, p: objetivo.p - comido.p - fijo.p };
  const items: Item[] = pendientes.map((x) => ({ receta: x.receta, pesoHc: x.hueco.pesoHc, topeHc: x.hueco.topeHc }));
  const escala = items.length ? cuadrar(items, meta, descanso) : { fp: 1, fh: 1 };
  const huboRegistro = reg.size > 0;

  let pendiente = { ...CERO };
  for (const c of comidas) {
    if (c.registro || !c.receta || c.hueco.libre) continue;
    c.porciones = cantidades(c.receta, { fp: escala.fp, fh: factorHc(escala.fh, c.hueco) }, descanso);
    c.macro = macroPorciones(c.porciones);
    c.ajustada = huboRegistro;
    pendiente = sumar(pendiente, c.macro);
  }

  const total = sumar(comido, fijo, pendiente);
  let aviso: string | undefined;
  const dk = Math.round(total.kcal - objetivo.kcal);
  const dp = Math.round(total.p - objetivo.p);
  if (pendientes.length) {
    if (dk > 120) aviso = `Te pasarás unas ${dk} kcal aunque reduzca los hidratos. No compenses mañana: sigue el plan.`;
    else if (dk < -150) aviso = `Te faltan ${-dk} kcal. Añade pan o un plátano en la siguiente comida.`;
    if (dp < -15) aviso = (aviso ? aviso + ' ' : '') + `Faltan ${-dp} g de proteína: añade un yogur +Proteínas (12 g) o un batido (23 g).`;
  } else if (huboRegistro && dp < -15) {
    aviso = `Hoy te quedas en ${Math.round(total.p)} g de proteína.`;
  }

  comidas.sort((a, b) => aMin(a.hueco.hora) - aMin(b.hueco.hora));
  return { fecha, cfg, comidas, eventos, objetivo, total, comido, pendiente, aviso, escala, fuera };
}

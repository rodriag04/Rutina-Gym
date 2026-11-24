import { ALIMENTO } from '../data/alimentos';
import type { Alimento, Ingrediente, Macro, Receta, Rol } from './tipos';

// Correcciones del usuario a la tabla (Más → Alimentos).
let correcciones: Record<string, Partial<Alimento>> = {};
export const fijarCorrecciones = (c: Record<string, Partial<Alimento>>) => {
  correcciones = c;
};

export const alimento = (id: string): Alimento => {
  const base = ALIMENTO[id];
  if (!base) throw new Error(`Alimento desconocido: ${id}`);
  const c = correcciones[id];
  return c ? { ...base, ...c } : base;
};

export const CERO: Macro = { kcal: 0, p: 0, c: 0, g: 0 };

export const sumar = (...ms: Macro[]): Macro =>
  ms.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { ...CERO });

export const restar = (a: Macro, b: Macro): Macro => ({ kcal: a.kcal - b.kcal, p: a.p - b.p, c: a.c - b.c, g: a.g - b.g });

export const macroDe = (id: string, gramos: number): Macro => {
  const a = alimento(id);
  const f = gramos / 100;
  return { kcal: a.kcal * f, p: a.p * f, c: a.c * f, g: a.g * f };
};

export interface Porcion {
  a: string;
  g: number;
  rol?: Rol;
  nota?: string;
}

export const macroPorciones = (ps: Porcion[]) => sumar(...ps.map((p) => macroDe(p.a, p.g)));

/** Paso de redondeo al escalar. */
export function paso(id: string): number {
  const a = alimento(id);
  if (a.unidad && ['huevo', 'atun', 'pita', 'tortilla', 'platano', 'whey'].includes(id)) return a.unidad.g;
  if (id === 'patata' || id === 'gnocchi') return 25;
  if (id === 'nueces') return 5;
  if (id === 'arroz') return 5;
  return 10;
}

const clamp = (x: number, lo = -Infinity, hi = Infinity) => Math.max(lo, Math.min(hi, x));

export interface Escala {
  /** Factor de la proteína. */
  fp: number;
  /** Factor de los hidratos. */
  fh: number;
}

/** Cantidades de una receta para unos factores. `redondear=false` para el cálculo continuo. */
export function cantidades(r: Receta, e: Escala, descanso: boolean, redondear = true): Porcion[] {
  return r.ing.map((i: Ingrediente) => {
    let g = descanso && i.descanso !== undefined ? i.descanso : i.g;
    const escalable = !r.fija && (i.rol === 'prot' || i.rol === 'hc');
    if (escalable) {
      g = clamp(g * (i.rol === 'prot' ? e.fp : e.fh), i.min, i.max);
      if (redondear) {
        const s = paso(i.a);
        g = clamp(Math.round(g / s) * s, i.min, i.max);
        if (i.min !== undefined && g < i.min) g = Math.ceil(i.min / s) * s;
      }
    }
    return { a: i.a, g, rol: i.rol, nota: i.nota };
  });
}

export const macroReceta = (r: Receta, e: Escala = { fp: 1, fh: 1 }, descanso = false, redondear = true) =>
  macroPorciones(cantidades(r, e, descanso, redondear));

/** Texto de cantidad: "180 g", "2 huevos", "1½ vasitos (190 g)". */
export function textoCantidad(p: Porcion): string {
  if (p.a === 'especias' || p.a === 'limon') return p.nota ?? '';
  const a = alimento(p.a);
  if (p.g === 0) return '';
  const ml = p.a === 'leche' ? `${Math.round(p.g)} ml` : `${Math.round(p.g)} g`;
  if (a.unidad) {
    const n = p.g / a.unidad.g;
    const entero = Math.abs(n - Math.round(n)) < 0.05;
    if (entero && ['huevo', 'atun', 'pita', 'tortilla', 'platano', 'yogur', 'whey', 'chocolate'].includes(p.a)) {
      const k = Math.round(n);
      return `${k} ${k === 1 ? a.unidad.nombre : a.unidad.plural}`;
    }
    if (p.a === 'arroz') return `${ml} · ${fraccion(n)} ${n > 1.05 ? a.unidad.plural : a.unidad.nombre}`;
    if (p.a === 'platano' || p.a === 'yogur' || p.a === 'whey') return `${fraccion(n)} ${n > 1.05 ? a.unidad.plural : a.unidad.nombre}`;
  }
  return ml;
}

/** 0.5 → ½, 1.5 → 1½, 0.75 → ¾… (aproximado a cuartos). */
export function fraccion(n: number): string {
  const q = Math.round(n * 4) / 4;
  const ent = Math.floor(q);
  const resto = q - ent;
  const f = resto === 0.25 ? '¼' : resto === 0.5 ? '½' : resto === 0.75 ? '¾' : '';
  if (ent === 0) return f || '0';
  return `${ent}${f}`;
}

export const redondearMacro = (m: Macro): Macro => ({
  kcal: Math.round(m.kcal),
  p: Math.round(m.p),
  c: Math.round(m.c),
  g: Math.round(m.g)
});

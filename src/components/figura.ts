/*
  Motor de figuras animadas tipo pegatina de máquina de gimnasio.
  Cada ejercicio define dos poses (A = inicio/estiramiento, B = contracción) y el equipo.
  Vista lateral: la figura mira a la derecha. Ángulos absolutos en grados (0 = derecha, 90 = abajo).
  Vista frontal: brazos con ángulo desde la vertical hacia fuera.
*/
export type P = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
export const desde = (p: P, ang: number, l: number): P => [p[0] + Math.cos(rad(ang)) * l, p[1] + Math.sin(rad(ang)) * l];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const len = (v: P) => Math.hypot(v[0], v[1]);

/** Cinemática inversa de 2 huesos: devuelve [codo, mano]. */
export function ik(a: P, objetivo: P, l1: number, l2: number, lado: 1 | -1): [P, P] {
  const v = sub(objetivo, a);
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, len(v)));
  const base = Math.atan2(v[1], v[0]);
  const b = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const ang = base + lado * b;
  const codo: P = [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
  const mano: P = [a[0] + Math.cos(base) * d, a[1] + Math.sin(base) * d];
  return [codo, mano];
}

export const L = { tronco: 50, cuello: 7, cabeza: 9.5, brazo: 29, antebrazo: 26, muslo: 40, pierna: 38, pie: 13 };
export const LF = { tronco: 52, hombros: 19, caderas: 11, brazo: 29, antebrazo: 26, muslo: 42, pierna: 40 };

export type BrazoL = { h: number; c: number } | { mano: P; flex: 1 | -1 } | { codo: P; mano: P };
export type PiernaL = { m: number; t: number; p?: number } | { pie: P; flex: 1 | -1; p?: number };

export interface PoseLado {
  cadera: P;
  tronco: number;
  cabeza?: number;
  brazo: BrazoL;
  brazo2?: BrazoL;
  pierna: PiernaL;
  pierna2?: PiernaL;
}

export type BrazoF = { a: number; c: number } | { mano: P; flex: 1 | -1 } | { codo: P; mano: P };
export interface PoseFrente {
  cx: number;
  cadera: number;
  bi: BrazoF;
  bd?: BrazoF;
  /** Separación de rodillas sentado (frontal) o null de pie. */
  sentado?: { abre: number };
  /** Colgado (dominadas): rodillas dobladas hacia atrás. */
  colgado?: boolean;
  /** De rodillas: las rodillas en el suelo y las espinillas hacia atrás (no se ven). */
  arrodillado?: boolean;
}

export interface Articulaciones {
  cadera: P; hombro: P; cuello: P; cabeza: P;
  codo: P; mano: P; codo2: P; mano2: P;
  rodilla: P; tobillo: P; punta: P;
  rodilla2: P; tobillo2: P; punta2: P;
  angTronco: number; angBrazo: number; angAntebrazo: number; angMuslo: number; angPierna: number;
}

function resolverBrazo(hombro: P, b: BrazoL): { codo: P; mano: P } {
  if ('h' in b) {
    const codo = desde(hombro, b.h, L.brazo);
    return { codo, mano: desde(codo, b.c, L.antebrazo) };
  }
  if ('flex' in b) {
    const [codo, mano] = ik(hombro, b.mano, L.brazo, L.antebrazo, b.flex);
    return { codo, mano };
  }
  return { codo: b.codo, mano: b.mano };
}

function resolverPierna(cadera: P, p: PiernaL): { rodilla: P; tobillo: P; punta: P } {
  let rodilla: P, tobillo: P;
  if ('m' in p) {
    rodilla = desde(cadera, p.m, L.muslo);
    tobillo = desde(rodilla, p.t, L.pierna);
  } else {
    [rodilla, tobillo] = ik(cadera, p.pie, L.muslo, L.pierna, p.flex);
  }
  return { rodilla, tobillo, punta: desde(tobillo, p.p ?? 0, L.pie) };
}

const ang = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

export function resolverLado(p: PoseLado): Articulaciones {
  const hombro = desde(p.cadera, p.tronco, L.tronco);
  const angCabeza = p.tronco + (p.cabeza ?? 0);
  const cuello = desde(hombro, angCabeza, L.cuello);
  const cabeza = desde(cuello, angCabeza, L.cabeza);
  const b1 = resolverBrazo(hombro, p.brazo);
  const b2 = resolverBrazo(hombro, p.brazo2 ?? p.brazo);
  const p1 = resolverPierna(p.cadera, p.pierna);
  const p2 = resolverPierna(p.cadera, p.pierna2 ?? p.pierna);
  return {
    cadera: p.cadera, hombro, cuello, cabeza,
    codo: b1.codo, mano: b1.mano, codo2: b2.codo, mano2: b2.mano,
    rodilla: p1.rodilla, tobillo: p1.tobillo, punta: p1.punta,
    rodilla2: p2.rodilla, tobillo2: p2.tobillo, punta2: p2.punta,
    angTronco: p.tronco, angBrazo: ang(hombro, b1.codo), angAntebrazo: ang(b1.codo, b1.mano),
    angMuslo: ang(p.cadera, p1.rodilla), angPierna: ang(p1.rodilla, p1.tobillo)
  };
}

export interface ArticulacionesF {
  cx: number; hombroI: P; hombroD: P; caderaI: P; caderaD: P; cuello: P; cabeza: P;
  codoI: P; manoI: P; codoD: P; manoD: P;
  rodillaI: P; rodillaD: P; pieI: P; pieD: P;
}

function brazoF(hombro: P, b: BrazoF, signo: 1 | -1): { codo: P; mano: P } {
  if ('a' in b) {
    const codo: P = [hombro[0] + signo * Math.sin(rad(b.a)) * LF.brazo, hombro[1] + Math.cos(rad(b.a)) * LF.brazo];
    const mano: P = [codo[0] + signo * Math.sin(rad(b.c)) * LF.antebrazo, codo[1] + Math.cos(rad(b.c)) * LF.antebrazo];
    return { codo, mano };
  }
  if ('flex' in b) {
    const [codo, mano] = ik(hombro, b.mano, LF.brazo, LF.antebrazo, (b.flex * -signo) as 1 | -1);
    return { codo, mano };
  }
  return { codo: b.codo, mano: b.mano };
}

const espejo = (b: BrazoF, cx: number): BrazoF => {
  if ('a' in b) return b;
  if ('flex' in b) return { mano: [2 * cx - b.mano[0], b.mano[1]], flex: b.flex };
  return { codo: [2 * cx - b.codo[0], b.codo[1]], mano: [2 * cx - b.mano[0], b.mano[1]] };
};

export function resolverFrente(p: PoseFrente): ArticulacionesF {
  const sy = p.cadera - LF.tronco;
  const hombroI: P = [p.cx - LF.hombros, sy];
  const hombroD: P = [p.cx + LF.hombros, sy];
  const caderaI: P = [p.cx - LF.caderas, p.cadera];
  const caderaD: P = [p.cx + LF.caderas, p.cadera];
  const bi = brazoF(hombroI, p.bi, -1);
  const bd = brazoF(hombroD, p.bd ?? espejo(p.bi, p.cx), 1);
  let rodillaI: P, rodillaD: P, pieI: P, pieD: P;
  if (p.sentado) {
    const a = p.sentado.abre;
    rodillaI = [p.cx - LF.caderas - a, p.cadera + 9];
    rodillaD = [p.cx + LF.caderas + a, p.cadera + 9];
    pieI = [rodillaI[0] + 2, rodillaI[1] + LF.pierna];
    pieD = [rodillaD[0] - 2, rodillaD[1] + LF.pierna];
  } else if (p.arrodillado) {
    rodillaI = [caderaI[0] - 1, p.cadera + LF.muslo];
    rodillaD = [caderaD[0] + 1, p.cadera + LF.muslo];
    pieI = [rodillaI[0], rodillaI[1] + 1];
    pieD = [rodillaD[0], rodillaD[1] + 1];
  } else if (p.colgado) {
    rodillaI = [caderaI[0] + 1, p.cadera + LF.muslo];
    rodillaD = [caderaD[0] - 1, p.cadera + LF.muslo];
    pieI = [rodillaI[0] + 3, rodillaI[1] + 18];
    pieD = [rodillaD[0] - 3, rodillaD[1] + 18];
  } else {
    rodillaI = [caderaI[0] - 1, p.cadera + LF.muslo];
    rodillaD = [caderaD[0] + 1, p.cadera + LF.muslo];
    pieI = [rodillaI[0], rodillaI[1] + LF.pierna];
    pieD = [rodillaD[0], rodillaD[1] + LF.pierna];
  }
  const cuello: P = [p.cx, sy - 6];
  const cabeza: P = [p.cx, sy - 16];
  return { cx: p.cx, hombroI, hombroD, caderaI, caderaD, cuello, cabeza, codoI: bi.codo, manoI: bi.mano, codoD: bd.codo, manoD: bd.mano, rodillaI, rodillaD, pieI, pieD };
}

/** Interpola cualquier estructura de números (poses). */
export function mezclar<T>(a: T, b: T, t: number): T {
  if (typeof a === 'number' && typeof b === 'number') return (a + (b - a) * t) as T;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => mezclar(x, b[i], t)) as T;
  if (a && b && typeof a === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(a as object)) {
      const va = (a as Record<string, unknown>)[k];
      const vb = (b as Record<string, unknown>)[k];
      o[k] = vb === undefined ? va : mezclar(va, vb, t);
    }
    return o as T;
  }
  return a;
}

export const suave = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

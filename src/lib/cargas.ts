import type { Carga } from '../data/rutina';

const rango = (desde: number, hasta: number, paso: number) => {
  const r: number[] = [];
  for (let v = desde; v <= hasta + 1e-9; v += paso) r.push(Math.round(v * 10) / 10);
  return r;
};

// Pilas de Basic-Fit Sevilla: placas de 10 lb (~4,5 kg) con placa extra de 5 lb (~2,3 kg).
const PILA_LB = [4.5, 9, 13.5, 18, 23, 27, 32, 36, 41, 45, 50, 54.5, 59, 64, 68, 73, 77, 82, 86, 91, 95, 100, 104, 109, 113];
const conMedias = (base: number[]) =>
  [...new Set([...base, ...base.map((v) => Math.round((v + 2.3) * 2) / 2)])].sort((a, b) => a - b);

export const ESCALONES_POR_DEFECTO: Record<Carga, number[]> = {
  mancuerna: [2, 4, 6, 6.5, 8, 9, 10, 11.5, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42.5, 45, 47.5, 50],
  'polea-lb': conMedias(PILA_LB),
  'polea-kg': rango(2.5, 120, 2.5),
  barra: rango(5, 80, 2.5),
  lastre: rango(0, 40, 2.5)
};

export const NOMBRE_CARGA: Record<Carga, string> = {
  mancuerna: 'Mancuernas',
  'polea-lb': 'Poleas y máquinas de placas (≈4,5 kg + placa de 2,3)',
  'polea-kg': 'Poleas y máquinas en kg (2,5 en 2,5)',
  barra: 'Barras (2,5 en 2,5)',
  lastre: 'Lastre de dominadas'
};

export class Escalera {
  constructor(private v: number[]) {}
  /** Índice del escalón más cercano. */
  indice(kg: number): number {
    let best = 0;
    for (let i = 1; i < this.v.length; i++) if (Math.abs(this.v[i] - kg) < Math.abs(this.v[best] - kg)) best = i;
    return best;
  }
  ajustar(kg: number): number { return this.v[this.indice(kg)]; }
  /** Siguiente escalón estrictamente por encima de kg. */
  siguiente(kg: number): number { return this.v.find((x) => x > kg + 0.6) ?? kg + 2.5; }
  /** Escalón anterior estrictamente por debajo de kg. */
  anterior(kg: number): number {
    for (let i = this.v.length - 1; i >= 0; i--) if (this.v[i] < kg - 0.6) return this.v[i];
    return kg;
  }
  /** Vecinos para el selector rápido. */
  alrededor(kg: number, n = 3): number[] {
    const i = this.indice(kg);
    const lista = this.v.slice(Math.max(0, i - n), i + n + 1);
    if (!lista.some((x) => Math.abs(x - kg) < 0.01)) lista.push(kg);
    return lista.sort((a, b) => a - b);
  }
}

import type { Ejercicio } from './tipos';

/** Duración estimada de un día: 5 min de calentamiento + series × (trabajo + descanso) + cambios de máquina. */
export function duracionBloques(bloques: Ejercicio[][], descarga = false): number {
  let s = 5 * 60;
  for (const exs of bloques) {
    const series = Math.max(...exs.map((e) => (descarga ? Math.ceil(e.series / 2) : e.series)));
    const trabajo = exs.reduce((a, e) => a + (e.porLado ? 80 : 45), 0) + (exs.length - 1) * 20;
    const descanso = exs[exs.length - 1].descanso;
    s += series * (trabajo + descanso) + 90;
    if (exs[0].calentar) s += 4 * 60;
  }
  return Math.round(s / 60);
}

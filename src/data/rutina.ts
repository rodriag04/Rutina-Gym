// Datos de la persona: se eligen al compilar (PERFIL=rodrigo | maricarmen). Ver src/perfiles/.
import { perfil } from '@perfil';
import { duracionBloques } from './tiempo';
import type { Dia, DiaId, Ejercicio } from './tipos';

export type { Carga, Dia, DiaId, Ejercicio, Perfil } from './tipos';

export const PERFIL = perfil;
export const EJERCICIOS = perfil.ejercicios;
export const DIAS = perfil.dias;
export const ORDEN_SEMANA = perfil.ordenSemana;
export const CAMBIOS_RUTINA = perfil.cambios;

const porId = new Map(EJERCICIOS.map((e) => [e.id, e]));
export const ejercicio = (id: string): Ejercicio | undefined => porId.get(id);
export const dia = (id: DiaId): Dia => DIAS.find((d) => d.id === id) ?? DIAS[0];
/** Día al que equivale otro (el alternativo cuenta como domingo). */
export const equivalente = (id: DiaId): DiaId => perfil.equivalencias?.[id] ?? id;

/** Ejercicios activos de un día, en orden. */
export const ejerciciosDia = (id: DiaId): Ejercicio[] => dia(id).bloques.flat().map((x) => porId.get(x)!);

/** Etiqueta de posición: 1, 2, 3a, 3b… calculada del orden real (los ids no cambian). */
export function etiquetas(id: DiaId): Map<string, string> {
  const m = new Map<string, string>();
  dia(id).bloques.forEach((b, i) => {
    b.forEach((ex, j) => m.set(ex, b.length > 1 ? `${i + 1}${'ab'[j]}` : `${i + 1}`));
  });
  return m;
}

/** Bloque (superserie o no) al que pertenece un ejercicio. */
export function bloqueDe(exId: string): string[] | undefined {
  for (const d of DIAS) for (const b of d.bloques) if (b.includes(exId)) return b;
  return undefined;
}

/** Duración estimada del día en minutos. */
export const duracionEstimada = (id: DiaId, descarga = false): number =>
  duracionBloques(dia(id).bloques.map((b) => b.map((x) => porId.get(x)!)), descarga);

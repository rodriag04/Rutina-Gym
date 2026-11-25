import { signal } from '@preact/signals';
import type { Slot } from './tipos';

export type Pestana = 'hoy' | 'semana' | 'compra' | 'progreso' | 'mas';

export type HojaAbierta =
  | { t: 'receta'; fecha?: string; slot?: Slot; id: string }
  | { t: 'registrar'; fecha: string; slot: Slot }
  | { t: 'cambiar'; fecha: string; slot: Slot }
  | { t: 'generador'; lunes: string }
  | { t: 'finde' }
  | { t: 'airfryer' }
  | { t: 'recetario' }
  | { t: 'alimentos' }
  | { t: 'ajustes' }
  | { t: 'notas' }
  | { t: 'copia' }
  | { t: 'metodo' }
  | { t: 'claude'; lunes: string };

export const pestana = signal<Pestana>('hoy');
export const hojas = signal<HojaAbierta[]>([]);
export const abrir = (h: HojaAbierta) => (hojas.value = [...hojas.value, h]);
export const cerrar = () => (hojas.value = hojas.value.slice(0, -1));
export const cerrarTodo = () => (hojas.value = []);

export interface Toast {
  lineas: string[];
  deshacer?: () => void;
}
export const toast = signal<Toast | null>(null);
let t: ReturnType<typeof setTimeout> | undefined;
export function avisar(lineas: string[], deshacer?: () => void, ms = 6000) {
  toast.value = { lineas, deshacer };
  clearTimeout(t);
  t = setTimeout(() => (toast.value = null), ms);
}

export const fmt = (n: number) => {
  const v = Math.round(n);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return v < 0 ? `−${s}` : s;
};

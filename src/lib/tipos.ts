import type { DiaId } from '../data/rutina';

export interface Serie {
  kg: number;
  reps: number;
  drop?: { kg: number; reps: number };
  calentamiento?: boolean;
}

export interface Sesion {
  id: string;
  fecha: string; // YYYY-MM-DD
  dia: DiaId;
  gym: string | null; // null = sin confirmar
  gymConfirmado?: boolean;
  notas: string;
  ex: Record<string, Serie[]>;
  /** Ejercicio que se hizo en lugar del previsto (no cuenta para la progresión). */
  sustituto?: Record<string, string>;
  guardado: string;
  origen?: 'importado' | 'app';
  sensacion?: { energia?: number; molestias?: string[] };
  exNotas?: Record<string, string>;
  descarga?: boolean;
  duracionMin?: number;
}

export interface Gimnasio { id: string; nombre: string; }

export interface EntradaDiario {
  id: string;
  fecha: string;
  tipo: 'sensacion' | 'correccion' | 'molestia';
  texto: string;
  revisada?: boolean;
}

export interface Medida {
  fecha: string;
  peso?: number;
  brazo?: number;
  cintura?: number;
}

export interface Ajustes {
  gimnasios: Gimnasio[];
  gymPorDefecto: string;
  pesoCorporal: number;
  sonido: boolean;
  pantallaEncendida: boolean;
  descarga: boolean;
  escalones: Record<string, number[]>;
  ultimaCopia?: string;
}

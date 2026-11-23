import type { MusculoId } from './musculos';
import type { Gimnasio, Medida, Sesion } from '../lib/tipos';

export type DiaId = string;
export type Carga = 'mancuerna' | 'polea-lb' | 'polea-kg' | 'barra' | 'lastre' | 'corporal';

export interface Ejercicio {
  id: string;
  nombre: string;
  corto: string;
  dia: DiaId;
  series: number;
  min: number;
  max: number;
  rir: string;
  rirMin: number;
  descanso: number; // segundos tras la serie (en superserie: tras la pareja)
  carga: Carga;
  esquema?: 'topset';
  calentar?: boolean;
  musculos: { p: MusculoId[]; s: MusculoId[] };
  foco: string;
  paraTi: string;
  tecnica: string;
  claves: string[];
  error: string;
  tempo: { sube: number; baja: number; pausa?: number };
  anim: string;
  busqueda: string;
  referencia?: string;
  /** Series de referencia cuando no hay registros (p. ej. dominadas apuntadas solo en notas). */
  refInicial?: { fecha: string; series: { kg: number; reps: number }[] };
  notaInicial?: string;
  retirado?: { fecha: string; motivo: string };
  cambio?: string;
  /** Para avisos de saltos: solo cuentan sesiones desde esta fecha. */
  desde?: string;
  /** Se hace primero con un lado y luego con el otro. */
  porLado?: boolean;
}

export interface Dia {
  id: DiaId;
  color: string;
  nombre: string;
  corto: string;
  titulo: string;
  bloques: string[][];
  cuentaSemanal: boolean;
}

/** Todo lo que cambia de una persona a otra. Cada perfil se compila como una app aparte. */
export interface Perfil {
  id: string;
  nombre: string;
  ejercicios: Ejercicio[];
  dias: Dia[];
  /** Orden de la semana para sugerir el día y detectar huecos. */
  ordenSemana: DiaId[];
  /** Días que cuentan como otro (Rodrigo: el alternativo sustituye al domingo). */
  equivalencias?: Record<DiaId, DiaId>;
  cambios: { fecha: string; titulo: string; motivo: string }[];
  reglas: string[];
  historial: Sesion[];
  verificacion?: { sesiones: number; series: number };
  gimnasios: Gimnasio[];
  gymPorDefecto: string;
  pesoCorporal: number;
  escalones?: Partial<Record<Carga, number[]>>;
  /** Peso del que parte el selector la primera vez. */
  pesosIniciales?: Partial<Record<Carga, number>>;
  medidasIniciales: Medida[];
  revisionMedidas?: string;
  textoMedidas: string;
  molestias: string[];
  destacado: { id: string; sub: string };
  grupo: { titulo: string; ids: string[] };
  /** Cabecera del informe para Claude. */
  informe: string;
  /** Regla de Rodrigo: dos lunes bajando en los presses. */
  reglaLunes?: boolean;
  /** Semana suave fija cada N semanas (la N-ésima va con la mitad de series). */
  descargaCada?: number;
  /** Textos sin jerga (RIR → "te sobran"). */
  sencillo?: boolean;
  bienvenida?: string[];
}

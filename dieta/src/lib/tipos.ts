// Tipos de la app de comidas.

export interface Macro {
  kcal: number;
  p: number;
  c: number;
  g: number;
}

export type Grupo = 'proteina' | 'hidratos' | 'fruta-verdura' | 'lacteos' | 'despensa';

export interface Alimento {
  id: string;
  nombre: string;
  /** Nombre corto para resúmenes: "pollo", "pan". */
  corto?: string;
  /** Por 100 g (o 100 ml). */
  kcal: number;
  p: number;
  c: number;
  g: number;
  grupo: Grupo;
  /** Unidad natural (huevo, lata, vasito…). */
  unidad?: { nombre: string; plural: string; g: number };
  /** Envase de compra en Mercadona. */
  envase?: { nombre: string; g: number };
  /** Carne o pescado fresco: 1-2 días en la nevera. */
  fresco?: boolean;
  /** Se compra por unidades sueltas (plátanos). */
  suelto?: boolean;
  /** Solo para la lista de la compra: siempre en casa (aceite, especias). */
  basico?: boolean;
}

/** prot y hc se escalan para cuadrar el día; el resto va fijo. */
export type Rol = 'prot' | 'hc' | 'veg' | 'grasa' | 'extra';

export interface Ingrediente {
  a: string;
  g: number;
  rol?: Rol;
  /** Límites al escalar (gramos). */
  min?: number;
  max?: number;
  /** Gramos en días de descanso (más grasa buena). */
  descanso?: number;
  /** Texto libre: "rallado", "en dados"… */
  nota?: string;
}

export type Slot = 'desayuno' | 'pre' | 'comida' | 'merienda' | 'cena';

export type Familia =
  | 'pollo'
  | 'pavo'
  | 'cerdo'
  | 'ternera'
  | 'salmon'
  | 'lubina'
  | 'atun'
  | 'jamon'
  | 'lomo-emb'
  | 'huevo'
  | 'lacteo'
  | 'fruta';

export type Etiqueta =
  | 'bocadillo'
  | 'casa'
  | 'despensa'
  | 'taper'
  | 'batido'
  | 'airfryer'
  | 'ligera'
  | 'nevera';

export interface Receta {
  id: string;
  titulo: string;
  /** Frase corta para la tarjeta. */
  sub: string;
  slots: Slot[];
  familia: Familia;
  min: number;
  ing: Ingrediente[];
  pasos: string[];
  truco?: string;
  airfryer?: { temp: number; tiempo: string; nota?: string };
  etiquetas?: Etiqueta[];
  /** No se escala (táper de su madre). */
  fija?: boolean;
  /** Clave del dibujo del plato. */
  dibujo: string;
  /** Color de fondo de la ilustración. */
  fondo: string;
}

export interface Gym {
  hora: string;
  /** Minutos. */
  dur: number;
  /** Rutina: pecho, espalda, brazos… */
  tipo?: string;
}

export interface ConfigDia {
  fecha: string;
  gym?: Gym;
  futbol?: { hora: string };
  desayunoCasa?: boolean;
  cenaLibre?: boolean;
  comidaLibre?: boolean;
  /** Se va a Cabra después de comer: el plan acaba en la comida. */
  cabra?: boolean;
  festivo?: boolean;
}

export interface ConfigSemana {
  lunes: string;
  dias: ConfigDia[];
  taper: boolean;
  cabraViernes: boolean;
  enCasa: string[];
  festivoLunes: boolean;
}

/** Comida elegida para un hueco del día. Las cantidades se calculan al vuelo. */
export interface Eleccion {
  slot: Slot;
  receta: string;
}

export interface Semana {
  id: string;
  config: ConfigSemana;
  /** fecha → elecciones */
  menu: Record<string, Eleccion[]>;
  semilla: number;
  creada: string;
}

export type EstadoRegistro = 'hecho' | 'otro' | 'saltada';

export interface Registro {
  fecha: string;
  slot: Slot;
  estado: EstadoRegistro;
  /** Lo que se comió de verdad (hecho: lo del plan en ese momento). */
  macro: Macro;
  texto?: string;
  foto?: string;
  hora: string;
}

export interface Nota {
  id: string;
  fecha: string;
  hora: string;
  texto: string;
  aplicado: string[];
}

export interface Medida {
  fecha: string;
  peso?: number;
  cintura?: number;
}

export interface Objetivos {
  kcalGym: number;
  kcalDescanso: number;
  prot: number;
  /** Kcal extra de hidratos por partido. */
  futbol: number;
}

export interface Ajuste {
  fecha: string;
  texto: string;
  antes: Objetivos;
  despues: Objetivos;
}

// Mapa de músculos: cada id es una zona dibujable del mapa corporal.
export type MusculoId =
  | 'pec-clav' | 'pec-est'
  | 'delt-ant' | 'delt-lat' | 'delt-post'
  | 'bic-larga' | 'bic-corta' | 'braquial' | 'braquiorradial' | 'antebrazo'
  | 'tri-largo' | 'tri-lateral' | 'tri-medial'
  | 'trap-sup' | 'trap-medio' | 'trap-inf' | 'infraespinoso' | 'redondo' | 'dorsal' | 'lumbar'
  | 'abdomen' | 'oblicuos'
  | 'gluteo-mayor' | 'gluteo-medio'
  | 'cuad-rf' | 'cuad-vl' | 'cuad-vm' | 'aductores'
  | 'isq-bf' | 'isq-semi'
  | 'gemelo' | 'soleo' | 'tibial';

export type GrupoId =
  | 'pecho' | 'hombro' | 'biceps' | 'triceps' | 'antebrazo' | 'espalda' | 'core'
  | 'gluteo' | 'cuadriceps' | 'aductores' | 'isquios' | 'gemelos';

export const GRUPOS: Record<GrupoId, string> = {
  pecho: 'Pecho',
  hombro: 'Hombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazo: 'Antebrazo',
  espalda: 'Espalda',
  core: 'Abdomen',
  gluteo: 'Glúteo',
  cuadriceps: 'Cuádriceps',
  aductores: 'Aductores',
  isquios: 'Isquiotibiales',
  gemelos: 'Gemelo'
};

export interface InfoMusculo {
  grupo: GrupoId;
  nombre: string;   // nombre corto de la parte
  detalle: string;  // qué es y qué aporta, en una línea
}

export const MUSCULOS: Record<MusculoId, InfoMusculo> = {
  'pec-clav': { grupo: 'pecho', nombre: 'Porción clavicular', detalle: 'La parte alta del pecho, bajo la clavícula. Llena el escote cuando llevas camiseta.' },
  'pec-est': { grupo: 'pecho', nombre: 'Porción esternal', detalle: 'La parte media y baja, la mayor del pecho. Da el grosor.' },
  'delt-ant': { grupo: 'hombro', nombre: 'Deltoides anterior', detalle: 'Frente del hombro. Ya trabaja mucho en cualquier press.' },
  'delt-lat': { grupo: 'hombro', nombre: 'Deltoides lateral', detalle: 'Lado del hombro. Es lo que ensancha la espalda vista de frente.' },
  'delt-post': { grupo: 'hombro', nombre: 'Deltoides posterior', detalle: 'Parte de atrás del hombro. Equilibra tanto press y protege la articulación.' },
  'bic-larga': { grupo: 'biceps', nombre: 'Cabeza larga', detalle: 'Cara externa del bíceps. Hace el “pico”. Trabaja más con el brazo por detrás del cuerpo.' },
  'bic-corta': { grupo: 'biceps', nombre: 'Cabeza corta', detalle: 'Cara interna del bíceps. Da anchura vista de frente. Trabaja más con el brazo por delante.' },
  'braquial': { grupo: 'biceps', nombre: 'Braquial', detalle: 'Debajo del bíceps. Al crecer lo empuja hacia fuera: más brazo visto de lado.' },
  'braquiorradial': { grupo: 'antebrazo', nombre: 'Braquiorradial', detalle: 'Antebrazo, cara de arriba. Une brazo y antebrazo; se nota mucho en manga corta.' },
  'antebrazo': { grupo: 'antebrazo', nombre: 'Flexores y extensores', detalle: 'Agarre. Trabajan solos en todos los tirones y curls.' },
  'tri-largo': { grupo: 'triceps', nombre: 'Cabeza larga', detalle: 'La mayor del tríceps (cara interna). Solo se estira del todo con el brazo por encima de la cabeza.' },
  'tri-lateral': { grupo: 'triceps', nombre: 'Cabeza lateral', detalle: 'Cara externa: la “herradura” que se ve de lado.' },
  'tri-medial': { grupo: 'triceps', nombre: 'Cabeza medial', detalle: 'Cerca del codo, bajo las otras dos. Trabaja en todas las extensiones.' },
  'trap-sup': { grupo: 'espalda', nombre: 'Trapecio superior', detalle: 'Entre cuello y hombro. Se activa al encoger.' },
  'trap-medio': { grupo: 'espalda', nombre: 'Trapecio medio y romboides', detalle: 'Entre las escápulas. Grosor de la espalda alta y postura.' },
  'trap-inf': { grupo: 'espalda', nombre: 'Trapecio inferior', detalle: 'Baja las escápulas. Estabiliza el hombro en los jalones.' },
  'infraespinoso': { grupo: 'espalda', nombre: 'Infraespinoso', detalle: 'Sobre la escápula. Manguito rotador: rota el hombro hacia fuera.' },
  'redondo': { grupo: 'espalda', nombre: 'Redondo mayor', detalle: 'Bajo la axila. Trabaja junto al dorsal.' },
  'dorsal': { grupo: 'espalda', nombre: 'Dorsal ancho', detalle: 'El músculo más grande de la espalda. Da la forma en V.' },
  'lumbar': { grupo: 'espalda', nombre: 'Erectores lumbares', detalle: 'Zona baja de la espalda. Aquí solo trabaja estabilizando.' },
  'abdomen': { grupo: 'core', nombre: 'Recto abdominal', detalle: 'La tableta. Trabaja estabilizando en casi todo.' },
  'oblicuos': { grupo: 'core', nombre: 'Oblicuos', detalle: 'Laterales del abdomen.' },
  'gluteo-mayor': { grupo: 'gluteo', nombre: 'Glúteo mayor', detalle: 'El grande. Extiende la cadera (empuje en la prensa).' },
  'gluteo-medio': { grupo: 'gluteo', nombre: 'Glúteo medio', detalle: 'Parte alta y lateral. Abre la pierna y estabiliza la cadera.' },
  'cuad-rf': { grupo: 'cuadriceps', nombre: 'Recto femoral', detalle: 'Centro del muslo. El único del cuádriceps que cruza la cadera.' },
  'cuad-vl': { grupo: 'cuadriceps', nombre: 'Vasto lateral', detalle: 'Cara externa del muslo. Da la anchura de la pierna.' },
  'cuad-vm': { grupo: 'cuadriceps', nombre: 'Vasto medial', detalle: 'La “gota” encima de la rodilla, por dentro.' },
  'aductores': { grupo: 'aductores', nombre: 'Aductores', detalle: 'Cara interna del muslo. Cierran la pierna y dan volumen al muslo por dentro.' },
  'isq-bf': { grupo: 'isquios', nombre: 'Bíceps femoral', detalle: 'Isquio externo, parte de atrás del muslo.' },
  'isq-semi': { grupo: 'isquios', nombre: 'Semitendinoso y semimembranoso', detalle: 'Isquios internos.' },
  'gemelo': { grupo: 'gemelos', nombre: 'Gastrocnemio', detalle: 'El gemelo visible. Trabaja con la rodilla estirada.' },
  'soleo': { grupo: 'gemelos', nombre: 'Sóleo', detalle: 'Debajo del gemelo. Trabaja más con la rodilla doblada.' },
  'tibial': { grupo: 'gemelos', nombre: 'Tibial anterior', detalle: 'Delante de la espinilla.' }
};

// Grupos que cuentan para las series semanales y su objetivo (series directas).
export interface ZonaSemanal { id: string; nombre: string; musculos: MusculoId[]; }
export const ZONAS_SEMANALES: ZonaSemanal[] = [
  { id: 'biceps', nombre: 'Bíceps', musculos: ['bic-larga', 'bic-corta', 'braquial'] },
  { id: 'triceps', nombre: 'Tríceps', musculos: ['tri-largo', 'tri-lateral', 'tri-medial'] },
  { id: 'pecho', nombre: 'Pecho', musculos: ['pec-clav', 'pec-est'] },
  { id: 'dorsal', nombre: 'Dorsal', musculos: ['dorsal'] },
  { id: 'espalda-alta', nombre: 'Espalda alta', musculos: ['trap-medio'] },
  { id: 'lateral', nombre: 'Hombro lateral', musculos: ['delt-lat'] },
  { id: 'posterior', nombre: 'Hombro posterior', musculos: ['delt-post'] },
  { id: 'hombro-del', nombre: 'Hombro delantero', musculos: ['delt-ant'] },
  { id: 'gluteo', nombre: 'Glúteo', musculos: ['gluteo-mayor', 'gluteo-medio'] },
  { id: 'cuadriceps', nombre: 'Cuádriceps', musculos: ['cuad-rf', 'cuad-vl', 'cuad-vm'] },
  { id: 'isquios', nombre: 'Isquios', musculos: ['isq-bf', 'isq-semi'] },
  { id: 'gemelos', nombre: 'Gemelo', musculos: ['gemelo'] },
  { id: 'core', nombre: 'Abdomen', musculos: ['abdomen', 'oblicuos'] }
];

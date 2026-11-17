import type { MusculoId } from './musculos';

export type DiaId = 'lun' | 'mar' | 'jue' | 'dom' | 'alt';
export type Carga = 'mancuerna' | 'polea-lb' | 'polea-kg' | 'barra' | 'lastre';

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
  notaInicial?: string;
  retirado?: { fecha: string; motivo: string };
  cambio?: string;
  /** Para avisos de saltos: solo cuentan sesiones desde esta fecha. */
  desde?: string;
}

export interface Dia {
  id: DiaId;
  nombre: string;
  corto: string;
  titulo: string;
  bloques: string[][];
  cuentaSemanal: boolean;
}

const E = (e: Ejercicio) => e;

export const EJERCICIOS: Ejercicio[] = [
  // ───────── LUNES ─────────
  E({
    id: 'lun-1', dia: 'lun', nombre: 'Press inclinado con mancuernas', corto: 'Press inclinado',
    series: 4, min: 6, max: 10, rir: '1-2', rirMin: 1, descanso: 180, carga: 'mancuerna', esquema: 'topset', calentar: true,
    musculos: { p: ['pec-clav'], s: ['delt-ant', 'pec-est', 'tri-lateral', 'tri-medial'] },
    foco: 'Pecho superior · porción clavicular',
    paraTi: 'Tu ejercicio ancla. El pecho alto es lo que más se nota con camiseta.',
    tecnica: 'Banco a 30°, escápulas juntas y abajo; baja hasta la altura del pecho alto y empuja hacia arriba y un poco hacia dentro.',
    claves: ['Codos a 45-60° del cuerpo, no abiertos en cruz.', 'Muñeca recta encima del codo (muñequera en la izquierda).', 'Pies firmes y glúteo pegado al banco.'],
    error: 'Subir el banco a 45° o más: pasa a ser un press de hombro.',
    tempo: { sube: 1, baja: 2 }, anim: 'press-inclinado', busqueda: 'press inclinado con mancuernas técnica',
    notaInicial: 'Subo las mancuernas con las rodillas; si puedo, me ayuda un compañero. Solo cuentan reps limpias.'
  }),
  E({
    id: 'lun-2', dia: 'lun', nombre: 'Press plano en máquina', corto: 'Press plano máquina',
    series: 3, min: 6, max: 10, rir: '1-2', rirMin: 1, descanso: 150, carga: 'polea-lb',
    musculos: { p: ['pec-est'], s: ['pec-clav', 'delt-ant', 'tri-lateral', 'tri-medial'] },
    foco: 'Pecho medio · porción esternal',
    paraTi: 'Volumen de pecho con carga alta y sin depender del equilibrio.',
    tecnica: 'Asas a la altura del pezón; pecho arriba y empuja sin despegar la espalda del respaldo.',
    claves: ['Escápulas atrás todo el recorrido: no adelantes los hombros al final.', 'Baja hasta notar el pecho estirado, sin rebotar.'],
    error: 'Asiento demasiado bajo: el empuje se va a los hombros.',
    tempo: { sube: 1, baja: 2 }, anim: 'press-maquina', busqueda: 'press pecho máquina sentado técnica'
  }),
  E({
    id: 'lun-3', dia: 'lun', nombre: 'Aperturas en máquina', corto: 'Aperturas',
    series: 3, min: 12, max: 15, rir: '0-1', rirMin: 0, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['pec-est', 'pec-clav'], s: ['delt-ant'] },
    foco: 'Pecho completo · en estiramiento',
    paraTi: 'Pecho sin tríceps: suma volumen sin cansar el brazo antes de los ejercicios de tríceps.',
    tecnica: 'Codos un poco flexionados y fijos; abre hasta notar el pecho estirado y cierra apretando, como si abrazaras un árbol.',
    claves: ['El codo no se dobla ni se estira durante la serie.', 'Pausa de 1 s con las manos juntas.'],
    error: 'Abrir demasiado atrás y cargar la parte delantera del hombro.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'aperturas', busqueda: 'aperturas pec deck máquina técnica'
  }),
  E({
    id: 'lun-4', dia: 'lun', nombre: 'Elevaciones laterales con mancuerna', corto: 'Laterales mancuerna',
    series: 4, min: 12, max: 15, rir: '0-1', rirMin: 0, descanso: 75, carga: 'mancuerna',
    musculos: { p: ['delt-lat'], s: ['trap-sup', 'delt-ant'] },
    foco: 'Hombro · deltoides lateral',
    paraTi: 'Anchura de hombros. Con la polea del jueves suman 8 series a la semana.',
    tecnica: 'Torso un poco inclinado hacia delante; sube con los codos por delante de las manos hasta la altura del hombro y baja en 2 s.',
    claves: ['Piensa en llevar las mancuernas lejos, hacia los lados.', 'Sin balanceo: si necesitas impulso, pesa demasiado.'],
    error: 'Encoger los hombros: trabaja el trapecio en vez del deltoides.',
    tempo: { sube: 1, baja: 2 }, anim: 'laterales', busqueda: 'elevaciones laterales mancuerna técnica'
  }),
  E({
    id: 'lun-5', dia: 'lun', nombre: 'Extensión trasnuca en polea con cuerda', corto: 'Trasnuca cuerda',
    series: 3, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['tri-largo'], s: ['tri-lateral', 'tri-medial'] },
    foco: 'Tríceps · cabeza larga',
    paraTi: 'La cabeza larga es la mayor del tríceps y solo se estira del todo con el brazo por encima de la cabeza.',
    tecnica: 'De espaldas a la polea y un pie adelantado; codos junto a la cabeza apuntando al frente, estira hasta bloquear y vuelve hasta notar el estiramiento.',
    claves: ['Los codos no se abren ni bajan: solo se mueve el antebrazo.', 'Abre la cuerda al final para apretar.'],
    error: 'Mover los hombros y convertirlo en un pullover.',
    tempo: { sube: 1, baja: 2 }, anim: 'trasnuca', busqueda: 'extensión tríceps polea cuerda por encima de la cabeza'
  }),
  E({
    id: 'lun-6', dia: 'lun', nombre: 'Extensión de tríceps en polea alta', corto: 'Polea alta tríceps',
    series: 3, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['tri-lateral', 'tri-medial'], s: ['tri-largo'] },
    foco: 'Tríceps · cabezas lateral y medial',
    paraTi: 'La herradura del tríceps: la parte que se ve de lado.',
    tecnica: 'Codos pegados al costado y quietos; empuja hasta estirar del todo y sube hasta 90° sin adelantar los codos.',
    claves: ['Torso un poco inclinado hacia delante y hombros abajo.', 'Bloquea 1 s abajo.'],
    error: 'Echar el peso del cuerpo encima y despegar los codos.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'pushdown', busqueda: 'extensión tríceps polea alta técnica'
  }),

  // ───────── MARTES ─────────
  E({
    id: 'mar-1', dia: 'mar', nombre: 'Jalón al pecho agarre ancho', corto: 'Jalón ancho',
    series: 4, min: 6, max: 10, rir: '1-2', rirMin: 1, descanso: 150, carga: 'polea-lb', calentar: true,
    musculos: { p: ['dorsal', 'redondo'], s: ['bic-larga', 'bic-corta', 'braquial', 'trap-inf', 'delt-post'] },
    foco: 'Espalda · dorsal ancho y redondo mayor',
    paraTi: 'Anchura de espalda (la V). Fijo en tu rutina.',
    tecnica: 'Agarre algo más ancho que los hombros; saca pecho y baja la barra a la parte alta del pecho llevando los codos hacia los bolsillos.',
    claves: ['Primero bajan las escápulas, luego tiran los brazos.', 'Torso apenas inclinado (10-15°), sin balanceo.'],
    error: 'Bajar la barra tras la nuca o tirar solo con los bíceps.',
    tempo: { sube: 1, baja: 2 }, anim: 'jalon', busqueda: 'jalón al pecho agarre ancho técnica'
  }),
  E({
    id: 'mar-2', dia: 'mar', nombre: 'Remo en polea baja con agarre estrecho', corto: 'Remo polea V',
    series: 3, min: 8, max: 12, rir: '1-2', rirMin: 1, descanso: 120, carga: 'polea-lb',
    musculos: { p: ['dorsal', 'trap-medio'], s: ['redondo', 'delt-post', 'bic-larga', 'braquial', 'lumbar'] },
    foco: 'Espalda · dorsal y espalda media',
    paraTi: 'Grosor de espalda. Agarre estrecho y codos pegados: más dorsal.',
    tecnica: 'Espalda recta y pecho arriba; tira del agarre hacia el ombligo con los codos rozando el cuerpo y aguanta 1 s.',
    claves: ['El torso se queda casi vertical: no te eches atrás para tirar.', 'Estira los brazos del todo al volver.'],
    error: 'Balancear el tronco y tirar con la zona lumbar.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'remo-polea', busqueda: 'remo polea baja agarre estrecho técnica',
    notaInicial: 'Si la polea está ocupada: la máquina del ejercicio 3 con las asas verticales.'
  }),
  E({
    id: 'mar-3', dia: 'mar', nombre: 'Remo en máquina con apoyo en el pecho, agarre abierto', corto: 'Remo máquina abierto',
    series: 3, min: 8, max: 12, rir: '1-2', rirMin: 1, descanso: 120, carga: 'polea-lb',
    musculos: { p: ['trap-medio', 'delt-post'], s: ['dorsal', 'infraespinoso', 'braquial'] },
    foco: 'Espalda media · romboides, trapecio medio y hombro posterior',
    paraTi: 'Espalda alta y hombro posterior sin cargar la zona lumbar.',
    tecnica: 'Pecho pegado al apoyo; tira con los codos abiertos a unos 60-70° y junta las escápulas al final.',
    claves: ['El pecho no se despega del apoyo.', 'Pausa de 1 s con las escápulas juntas.'],
    error: 'Encoger los hombros hacia las orejas al tirar.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'remo-maquina', busqueda: 'remo máquina apoyo pecho agarre abierto'
  }),
  E({
    id: 'mar-4', dia: 'mar', nombre: 'Pullover en polea alta', corto: 'Pullover polea',
    series: 3, min: 12, max: 15, rir: '1', rirMin: 1, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['dorsal'], s: ['redondo', 'tri-largo'] },
    foco: 'Espalda · dorsal en estiramiento',
    paraTi: 'Dorsal sin bíceps: termina la espalda aunque los brazos ya estén cansados.',
    tecnica: 'De pie, cadera un poco atrás y brazos casi rectos; lleva la barra o la cuerda desde arriba hasta los muslos en arco.',
    claves: ['Los codos se quedan igual de doblados todo el rato.', 'Arriba, deja que el dorsal se estire del todo.'],
    error: 'Doblar los codos: se convierte en una extensión de tríceps.',
    tempo: { sube: 1, baja: 2 }, anim: 'pullover', busqueda: 'pullover polea alta dorsal técnica'
  }),
  E({
    id: 'mar-5', dia: 'mar', nombre: 'Curl en banco inclinado con mancuernas', corto: 'Curl inclinado',
    series: 3, min: 8, max: 12, rir: '2', rirMin: 2, descanso: 90, carga: 'mancuerna',
    musculos: { p: ['bic-larga'], s: ['bic-corta', 'braquial'] },
    foco: 'Bíceps · cabeza larga',
    paraTi: 'Brazo por detrás del cuerpo: la cabeza larga trabaja estirada. Es la que hace el pico.',
    tecnica: 'Banco a 45-60°, espalda apoyada y brazos colgando; sube girando la palma hacia arriba sin adelantar el codo.',
    claves: ['El codo apunta al suelo todo el recorrido.', 'Baja hasta estirar del todo.', 'Para con 2 reps en recámara: sin bajadas.'],
    error: 'Despegar la cabeza y los hombros del banco para subir.',
    tempo: { sube: 1, baja: 2 }, anim: 'curl-inclinado', busqueda: 'curl inclinado con mancuernas técnica'
  }),
  E({
    id: 'mar-6', dia: 'mar', nombre: 'Curl martillo', corto: 'Curl martillo',
    series: 3, min: 8, max: 12, rir: '2', rirMin: 2, descanso: 90, carga: 'mancuerna',
    musculos: { p: ['braquial', 'braquiorradial'], s: ['bic-larga'] },
    foco: 'Brazo · braquial y braquiorradial',
    paraTi: 'Grosor del brazo visto de lado y antebrazo.',
    tecnica: 'De pie, palmas mirándose; sube sin mover el codo y baja en 2 s.',
    claves: ['Codos pegados al costado.', 'Para con 2 reps en recámara: sin bajadas.'],
    error: 'Balancear el tronco en las últimas reps.',
    tempo: { sube: 1, baja: 2 }, anim: 'curl-martillo', busqueda: 'curl martillo mancuernas técnica'
  }),
  E({
    id: 'mar-7', dia: 'mar', nombre: 'Face pull en polea con cuerda', corto: 'Face pull',
    series: 3, min: 12, max: 15, rir: '1', rirMin: 1, descanso: 75, carga: 'polea-lb',
    musculos: { p: ['delt-post', 'trap-medio'], s: ['infraespinoso', 'trap-inf'] },
    foco: 'Hombro posterior y manguito rotador',
    paraTi: 'Retirado: su trabajo lo hacen los pájaros del jueves y el remo abierto.',
    tecnica: 'Polea a la altura de la cara; tira de la cuerda hacia la frente separando las manos y con los codos altos.',
    claves: ['Codos a la altura de los hombros.', 'Al final, los nudillos miran atrás.'],
    error: 'Tirar con la espalda baja echándose atrás.',
    tempo: { sube: 1, baja: 2 }, anim: 'face-pull', busqueda: 'face pull polea cuerda técnica',
    retirado: { fecha: '2026-11-17', motivo: 'Sin hacer ninguno de los 4 martes. Su volumen pasa a los pájaros del jueves (4.ª serie en superserie, sin tiempo extra).' }
  }),

  // ───────── JUEVES ─────────
  E({
    id: 'jue-1', dia: 'jue', nombre: 'Curl predicador con barra Z', corto: 'Predicador Z',
    series: 4, min: 8, max: 12, rir: '1', rirMin: 1, descanso: 120, carga: 'barra', calentar: true,
    musculos: { p: ['bic-corta'], s: ['braquial', 'bic-larga'] },
    foco: 'Bíceps · cabeza corta',
    paraTi: 'Primero del día de brazo: bíceps fresco y con la máxima carga de la semana.',
    tecnica: 'Axila pegada al borde del banco; baja hasta casi estirar el brazo controlando y sube sin despegar el codo.',
    claves: ['Agarre en la parte ancha de la barra Z.', 'Abajo, sin rebotar: es donde más fácil se lesiona el bíceps.'],
    error: 'Levantar los codos del apoyo para acabar la rep.',
    tempo: { sube: 1, baja: 2 }, anim: 'predicador', busqueda: 'curl predicador barra z técnica',
    notaInicial: 'Muñequera en la izquierda.'
  }),
  E({
    id: 'jue-2', dia: 'jue', nombre: 'Fondos en máquina para tríceps', corto: 'Fondos máquina',
    series: 4, min: 6, max: 10, rir: '1', rirMin: 1, descanso: 120, carga: 'polea-lb',
    musculos: { p: ['tri-lateral', 'tri-medial'], s: ['tri-largo', 'pec-est', 'delt-ant'] },
    foco: 'Tríceps · cabezas lateral y medial',
    paraTi: 'El ejercicio de tríceps con más carga de la semana.',
    tecnica: 'Torso recto y codos pegados apuntando atrás; empuja hasta estirar y sube hasta 90° de codo.',
    claves: ['Hombros abajo, lejos de las orejas.', 'Torso vertical: si te inclinas, trabaja más el pecho.'],
    error: 'Recorrido corto: no llegar a 90° de codo.',
    tempo: { sube: 1, baja: 2 }, anim: 'fondos', busqueda: 'fondos máquina tríceps sentado técnica'
  }),
  E({
    id: 'jue-3a', dia: 'jue', nombre: 'Curl bayesiano en polea', corto: 'Curl bayesiano',
    series: 3, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 30, carga: 'polea-kg',
    musculos: { p: ['bic-larga'], s: ['bic-corta', 'braquial'] },
    foco: 'Bíceps · cabeza larga',
    paraTi: 'Bíceps estirado y con tensión constante en todo el recorrido.',
    tecnica: 'De espaldas a la polea baja y un paso adelante; el brazo queda por detrás del cuerpo y subes sin adelantar el codo.',
    claves: ['Un brazo cada vez; empieza por el izquierdo.', 'Deja que la polea estire el bíceps abajo.'],
    error: 'Adelantar el codo al subir: se pierde el estiramiento.',
    tempo: { sube: 1, baja: 2 }, anim: 'bayesiano', busqueda: 'curl bayesiano polea técnica'
  }),
  E({
    id: 'jue-3b', dia: 'jue', nombre: 'Extensión de tríceps a un brazo por encima de la cabeza', corto: 'Extensión sobre cabeza',
    series: 3, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 90, carga: 'polea-kg',
    musculos: { p: ['tri-largo'], s: ['tri-lateral', 'tri-medial'] },
    foco: 'Tríceps · cabeza larga',
    paraTi: 'Segunda dosis de cabeza larga de la semana, la parte que más volumen da al brazo.',
    tecnica: 'De espaldas a la polea baja, codo junto a la cabeza apuntando arriba; estira el brazo y baja la mano por detrás de la cabeza.',
    claves: ['El codo no se abre hacia fuera.', 'Abajo, estiramiento completo.'],
    error: 'Mover el hombro en vez del codo.',
    tempo: { sube: 1, baja: 2 }, anim: 'extension-cabeza', busqueda: 'extensión tríceps polea un brazo por encima de la cabeza',
    notaInicial: 'El 3 y el 12 nov lo hice a dos manos con cuerda.'
  }),
  E({
    id: 'jue-4a', dia: 'jue', nombre: 'Elevaciones laterales en polea', corto: 'Laterales polea',
    series: 4, min: 12, max: 15, rir: '0-1', rirMin: 0, descanso: 20, carga: 'polea-kg',
    musculos: { p: ['delt-lat'], s: ['trap-sup'] },
    foco: 'Hombro · deltoides lateral',
    paraTi: 'Tensión abajo del todo, donde la mancuerna no da nada.',
    tecnica: 'Polea baja con el cable por delante del cuerpo; sube el brazo hacia el lado hasta la altura del hombro y baja en 2 s.',
    claves: ['Inclínate un poco hacia el lado contrario.', 'Codo un poco flexionado y fijo.'],
    error: 'Subir por encima del hombro y encoger.',
    tempo: { sube: 1, baja: 2 }, anim: 'laterales-polea', busqueda: 'elevación lateral polea un brazo técnica'
  }),
  E({
    id: 'jue-4b', dia: 'jue', nombre: 'Aperturas invertidas en máquina (pájaros)', corto: 'Pájaros',
    series: 4, min: 12, max: 15, rir: '0-1', rirMin: 0, descanso: 75, carga: 'polea-kg',
    musculos: { p: ['delt-post'], s: ['trap-medio', 'infraespinoso'] },
    foco: 'Hombro · deltoides posterior',
    paraTi: 'Hombro de atrás: con el lateral, completa el hombro redondo. Ahora 4 series (recoge las del face pull).',
    tecnica: 'Pecho contra el respaldo y brazos a la altura del hombro; abre en arco hacia atrás sin juntar las escápulas.',
    claves: ['Agarre neutro y codos un poco flexionados.', 'Piensa en empujar hacia los lados, no en apretar la espalda.'],
    error: 'Juntar las escápulas: trabaja la espalda en vez del hombro.',
    tempo: { sube: 1, baja: 2 }, anim: 'pajaros', busqueda: 'aperturas invertidas máquina deltoides posterior',
    cambio: '3 → 4 series (17 nov)', desde: '2026-11-17'
  }),
  E({
    id: 'jue-5', dia: 'jue', nombre: 'Curl femoral sentado (jueves)', corto: 'Femoral jueves',
    series: 3, min: 10, max: 12, rir: '1', rirMin: 1, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['isq-semi', 'isq-bf'], s: ['gemelo'] },
    foco: 'Isquiotibiales',
    paraTi: 'Retirado: el domingo ya lleva 4 series de femoral.',
    tecnica: 'Rodilla alineada con el eje de la máquina; dobla hasta el máximo y vuelve controlando.',
    claves: ['Torso inclinado hacia delante.'],
    error: 'Levantar la cadera del asiento.',
    tempo: { sube: 1, baja: 2 }, anim: 'femoral', busqueda: 'curl femoral sentado técnica',
    retirado: { fecha: '2026-11-17', motivo: 'Sin hacer ningún jueves (0 de 3). El domingo ya lleva 4 series de femoral y el jueves queda solo para brazo y hombro.' }
  }),

  // ───────── DOMINGO ─────────
  E({
    id: 'dom-1a', dia: 'dom', nombre: 'Curl en polea baja con barra Z', corto: 'Curl polea Z',
    series: 3, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 20, carga: 'polea-lb',
    musculos: { p: ['bic-corta', 'bic-larga'], s: ['braquial', 'braquiorradial'] },
    foco: 'Bíceps · las dos cabezas',
    paraTi: 'Tercera sesión de bíceps de la semana, con tensión constante.',
    tecnica: 'De pie cerca de la polea y codos pegados al costado; sube hasta el pecho y baja en 2 s.',
    claves: ['Los codos no se adelantan al subir.', 'Muñequera en la izquierda si molesta.'],
    error: 'Echar el cuerpo atrás para acabar la rep.',
    tempo: { sube: 1, baja: 2 }, anim: 'curl-polea', busqueda: 'curl bíceps polea baja barra z'
  }),
  E({
    id: 'dom-1b', dia: 'dom', nombre: 'Extensión de tríceps en polea alta con barra en V', corto: 'Extensión barra V',
    series: 3, min: 12, max: 15, rir: '2', rirMin: 2, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['tri-lateral', 'tri-medial'], s: ['tri-largo'] },
    foco: 'Tríceps · cabezas lateral y medial',
    paraTi: 'A 2 RIR y nunca al fallo: mañana es lunes de press.',
    tecnica: 'Codos pegados al costado; empuja hasta estirar y sube controlando hasta 90°.',
    claves: ['Para con 2 reps en recámara.', 'Muñecas rectas.'],
    error: 'Ir al fallo: el lunes lo notas en el press.',
    tempo: { sube: 1, baja: 2 }, anim: 'pushdown', busqueda: 'extensión tríceps polea barra v'
  }),
  E({
    id: 'dom-2', dia: 'dom', nombre: 'Prensa de piernas', corto: 'Prensa',
    series: 4, min: 8, max: 12, rir: '1-2', rirMin: 1, descanso: 120, carga: 'polea-lb', calentar: true,
    musculos: { p: ['cuad-vl', 'cuad-vm', 'cuad-rf', 'gluteo-mayor'], s: ['aductores', 'isq-semi'] },
    foco: 'Cuádriceps y glúteo mayor',
    paraTi: 'La base de la pierna sin sentadilla ni peso muerto.',
    tecnica: 'Pies a la anchura de los hombros en el centro de la plataforma; baja hasta 90° o algo más sin despegar la cadera del respaldo.',
    claves: ['Rodillas en la línea de los pies.', 'No bloquees las rodillas arriba.'],
    error: 'Bajar tanto que la zona lumbar se despega del respaldo.',
    tempo: { sube: 1, baja: 2 }, anim: 'prensa', busqueda: 'prensa de piernas técnica'
  }),
  E({
    id: 'dom-6a', dia: 'dom', nombre: 'Gemelos en la prensa', corto: 'Gemelos prensa',
    series: 4, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 120, carga: 'polea-lb',
    musculos: { p: ['gemelo'], s: ['soleo'] },
    foco: 'Gemelo · gastrocnemio',
    paraTi: 'Nada más acabar cada serie de prensa, sin levantarte: no esperas máquina y no te los saltas.',
    tecnica: 'Rodillas estiradas sin bloquear y solo la punta del pie en el borde de la plataforma; baja el talón del todo, pausa 1 s y empuja con los dedos.',
    claves: ['Pausa de 1 s abajo: quita el rebote del tendón.', 'Rango completo antes que más peso.'],
    error: 'Medias repeticiones rápidas.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'gemelos', busqueda: 'gemelos en prensa técnica',
    cambio: 'Antes: gemelos de pie al final del día (nunca apuntados).', desde: '2026-11-17'
  }),
  E({
    id: 'dom-3', dia: 'dom', nombre: 'Curl femoral sentado', corto: 'Femoral sentado',
    series: 4, min: 10, max: 12, rir: '1', rirMin: 1, descanso: 105, carga: 'polea-lb',
    musculos: { p: ['isq-semi', 'isq-bf'], s: ['gemelo'] },
    foco: 'Isquiotibiales · internos y externos',
    paraTi: 'Los isquios de la semana: con la prensa, la pierna queda compensada.',
    tecnica: 'Rodilla alineada con el eje de la máquina y rodillo sobre el tobillo; dobla al máximo y vuelve sin dejar caer el peso.',
    claves: ['Torso inclinado hacia delante: estira más el isquio.', 'Pausa de 1 s con la rodilla doblada.'],
    error: 'Levantar la cadera del asiento.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'femoral', busqueda: 'curl femoral sentado técnica'
  }),
  E({
    id: 'dom-4', dia: 'dom', nombre: 'Extensión de cuádriceps', corto: 'Extensión cuádriceps',
    series: 3, min: 12, max: 15, rir: '0-1', rirMin: 0, descanso: 90, carga: 'polea-lb',
    musculos: { p: ['cuad-rf', 'cuad-vl', 'cuad-vm'], s: [] },
    foco: 'Cuádriceps · recto femoral y vastos',
    paraTi: 'Cuádriceps aislado y sin carga en la espalda.',
    tecnica: 'Rodilla en el eje de la máquina; estira del todo, aprieta 1 s y baja en 2 s.',
    claves: ['Agárrate a las asas y no despegues el glúteo.', 'Respaldo un poco atrás: el recto femoral trabaja más.'],
    error: 'Lanzar el peso con impulso.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'extension-cuadriceps', busqueda: 'extensión de cuádriceps máquina técnica'
  }),
  E({
    id: 'dom-5', dia: 'dom', nombre: 'Aductores en máquina (cerrar piernas)', corto: 'Aductores',
    series: 3, min: 10, max: 15, rir: '1', rirMin: 1, descanso: 20, carga: 'polea-lb',
    musculos: { p: ['aductores'], s: [] },
    foco: 'Aductores · cara interna del muslo',
    paraTi: 'Muslo por dentro. Sustituye al hip thrust (tu decisión del 1 nov).',
    tecnica: 'Espalda apoyada; abre lo que permita la cadera sin dolor y cierra hasta juntar las almohadillas.',
    claves: ['Baja en 2 s: el estiramiento es lo que más trabaja.', 'Si es la misma máquina que la de abductores, cambia el modo y sigue.'],
    error: 'Soltar el peso de golpe al abrir.',
    tempo: { sube: 1, baja: 2 }, anim: 'aductores', busqueda: 'máquina aductores técnica'
  }),
  E({
    id: 'dom-6b', dia: 'dom', nombre: 'Abductores en máquina (abrir piernas)', corto: 'Abductores',
    series: 3, min: 12, max: 15, rir: '0-1', rirMin: 0, descanso: 75, carga: 'polea-lb',
    musculos: { p: ['gluteo-medio'], s: ['gluteo-mayor'] },
    foco: 'Glúteo medio',
    paraTi: 'Glúteo por el lado. Sustituye al crunch (tu decisión del 1 nov).',
    tecnica: 'Torso un poco inclinado hacia delante; abre las rodillas hasta el tope y vuelve sin que choquen las placas.',
    claves: ['Inclinado hacia delante trabaja más el glúteo.', 'Pausa de 1 s abierto.'],
    error: 'Rebotar con las placas en cada rep.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'abductores', busqueda: 'máquina abductores glúteo medio técnica'
  }),

  // ───────── ALTERNATIVO ─────────
  E({
    id: 'alt-1', dia: 'alt', nombre: 'Dominadas', corto: 'Dominadas',
    series: 4, min: 6, max: 10, rir: '1-2', rirMin: 1, descanso: 150, carga: 'lastre',
    musculos: { p: ['dorsal', 'redondo'], s: ['bic-corta', 'bic-larga', 'braquial', 'trap-inf'] },
    foco: 'Espalda · dorsal ancho y redondo mayor',
    paraTi: 'El mejor tirón con tu peso. El kg es el lastre (0 = solo tu peso).',
    tecnica: 'Agarre prono algo más ancho que los hombros; empieza colgado con las escápulas abajo y sube hasta pasar la barbilla.',
    claves: ['Baja hasta estirar los brazos del todo.', 'Sin balanceo ni patadas.'],
    error: 'Medias repeticiones arriba.',
    tempo: { sube: 1, baja: 2 }, anim: 'dominadas', busqueda: 'dominadas técnica correcta',
    referencia: '8 nov: 8, 6 y 7 con tu peso.'
  }),
  E({
    id: 'alt-2', dia: 'alt', nombre: 'Remo en polea baja con barra, agarre supino', corto: 'Remo supino polea',
    series: 4, min: 6, max: 10, rir: '1-2', rirMin: 1, descanso: 120, carga: 'polea-lb',
    musculos: { p: ['dorsal', 'trap-medio'], s: ['bic-corta', 'bic-larga', 'braquial', 'delt-post'] },
    foco: 'Espalda · dorsal y espalda media (+ bíceps)',
    paraTi: 'Mismo tirón con palmas arriba que el remo con barra, sin aguantar la bisagra de cadera con carga.',
    tecnica: 'Sentado y palmas hacia arriba; tira de la barra hacia el ombligo con los codos pegados y aguanta 1 s.',
    claves: ['Torso casi vertical y quieto.', 'Estira los brazos del todo al volver.'],
    error: 'Balancear el tronco.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'remo-polea', busqueda: 'remo polea baja agarre supino barra',
    cambio: 'Antes: remo con barra agarre supino, de pie e inclinado (bisagra con carga, la tienes vetada).'
  }),
  E({
    id: 'alt-3', dia: 'alt', nombre: 'Press militar con mancuernas sentado', corto: 'Press militar',
    series: 3, min: 8, max: 12, rir: '2', rirMin: 2, descanso: 120, carga: 'mancuerna',
    musculos: { p: ['delt-ant'], s: ['delt-lat', 'tri-lateral', 'tri-medial', 'trap-sup'] },
    foco: 'Hombro · deltoides anterior y lateral',
    paraTi: 'Solo en el día alternativo. El resto de la semana el hombro va con laterales.',
    tecnica: 'Respaldo casi vertical y mancuernas a la altura de las orejas; empuja hacia arriba sin chocarlas.',
    claves: ['Codos un poco por delante del cuerpo.', 'Sin arquear la zona lumbar.'],
    error: 'Bajar solo hasta la frente: recorrido a medias.',
    tempo: { sube: 1, baja: 2 }, anim: 'press-militar', busqueda: 'press militar mancuernas sentado técnica'
  }),
  E({
    id: 'alt-4a', dia: 'alt', nombre: 'Curl alterno con mancuernas de pie', corto: 'Curl alterno',
    series: 3, min: 8, max: 12, rir: '2', rirMin: 2, descanso: 20, carga: 'mancuerna',
    musculos: { p: ['bic-corta', 'bic-larga'], s: ['braquial'] },
    foco: 'Bíceps · las dos cabezas',
    paraTi: 'Bíceps con giro de muñeca: trabaja su otra función, la supinación.',
    tecnica: 'De pie, sube una mancuerna girando la palma hacia arriba y baja en 2 s antes de subir la otra.',
    claves: ['Codo quieto junto al costado.', 'Gira el meñique hacia arriba al final.'],
    error: 'Balancear el cuerpo.',
    tempo: { sube: 1, baja: 2 }, anim: 'curl-de-pie', busqueda: 'curl alterno mancuernas supinación'
  }),
  E({
    id: 'alt-4b', dia: 'alt', nombre: 'Press francés con barra Z', corto: 'Press francés',
    series: 3, min: 8, max: 12, rir: '2', rirMin: 2, descanso: 90, carga: 'barra',
    musculos: { p: ['tri-largo', 'tri-medial'], s: ['tri-lateral'] },
    foco: 'Tríceps · cabezas larga y medial',
    paraTi: 'Tríceps con barra libre. 2 RIR: los codos lo agradecen.',
    tecnica: 'Tumbado en banco plano con los brazos un poco inclinados hacia atrás; baja la barra hacia la frente doblando solo el codo.',
    claves: ['Los codos apuntan al techo, sin abrirse.', 'Muñequera en la izquierda.'],
    error: 'Abrir los codos y convertirlo en un press.',
    tempo: { sube: 1, baja: 2 }, anim: 'press-frances', busqueda: 'press francés barra z técnica'
  })
];

export const DIAS: Dia[] = [
  { id: 'lun', nombre: 'Lunes', corto: 'Lun', titulo: 'Pecho · hombro · tríceps', cuentaSemanal: true,
    bloques: [['lun-1'], ['lun-2'], ['lun-3'], ['lun-4'], ['lun-5'], ['lun-6']] },
  { id: 'mar', nombre: 'Martes', corto: 'Mar', titulo: 'Espalda · bíceps', cuentaSemanal: true,
    bloques: [['mar-1'], ['mar-2'], ['mar-3'], ['mar-4'], ['mar-5'], ['mar-6']] },
  { id: 'jue', nombre: 'Jueves', corto: 'Jue', titulo: 'Brazos · hombro', cuentaSemanal: true,
    bloques: [['jue-1'], ['jue-2'], ['jue-3a', 'jue-3b'], ['jue-4a', 'jue-4b']] },
  { id: 'dom', nombre: 'Domingo', corto: 'Dom', titulo: 'Pierna · brazo', cuentaSemanal: true,
    bloques: [['dom-1a', 'dom-1b'], ['dom-2', 'dom-6a'], ['dom-3'], ['dom-4'], ['dom-5', 'dom-6b']] },
  { id: 'alt', nombre: 'Alternativo', corto: 'Alt', titulo: 'Sin pierna · día de partido', cuentaSemanal: false,
    bloques: [['alt-1'], ['alt-2'], ['alt-3'], ['alt-4a', 'alt-4b']] }
];

export const ORDEN_SEMANA: DiaId[] = ['lun', 'mar', 'jue', 'dom'];

const porId = new Map(EJERCICIOS.map((e) => [e.id, e]));
export const ejercicio = (id: string): Ejercicio | undefined => porId.get(id);
export const dia = (id: DiaId): Dia => DIAS.find((d) => d.id === id)!;

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

/** Duración estimada: 5 min de calentamiento + series × (trabajo + descanso). */
export function duracionEstimada(id: DiaId): number {
  let s = 5 * 60;
  for (const b of dia(id).bloques) {
    const exs = b.map((x) => porId.get(x)!);
    const series = Math.max(...exs.map((e) => e.series));
    const trabajo = exs.length * 45 + (exs.length - 1) * 20;
    const descanso = exs[exs.length - 1].descanso;
    s += series * (trabajo + descanso) + 90; // + cambio de máquina
    if (exs[0].calentar) s += 4 * 60;
  }
  return Math.round(s / 60);
}

export const CAMBIOS_RUTINA: { fecha: string; titulo: string; motivo: string }[] = [
  { fecha: '2026-11-17', titulo: 'Fuera el face pull del martes; pájaros del jueves a 4 series',
    motivo: 'No lo hiciste ninguno de los 4 martes. Los pájaros van en superserie con 4 series de laterales: la 4.ª no añade tiempo.' },
  { fecha: '2026-11-17', titulo: 'Fuera el curl femoral del jueves',
    motivo: '0 de 3 jueves. El domingo ya lleva 4 series de femoral y el jueves queda solo para brazo y hombro (~10 min menos).' },
  { fecha: '2026-11-17', titulo: 'Gemelos a la prensa, justo después de cada serie',
    motivo: 'Nunca los apuntaste al final del domingo. En la prensa no esperas máquina y no se quedan para el final.' },
  { fecha: '2026-11-17', titulo: 'Aductores y abductores en superserie',
    motivo: 'Se saltaron el 8 nov. Juntos ahorran unos 5 min; suelen ser la misma máquina con dos modos.' },
  { fecha: '2026-11-17', titulo: 'Alternativo: remo con barra de pie → remo en polea baja supino',
    motivo: 'El remo de pie aguanta la bisagra de cadera con carga, que tienes vetada. Mismo músculo, sentado.' },
  { fecha: '2026-11-17', titulo: 'Sin bajadas en los ejercicios a 2 RIR',
    motivo: 'En martillo y curl inclinado acababas con bajadas. La app ya no las ofrece en los ejercicios a 2 RIR.' },
  { fecha: '2026-11-17', titulo: 'Subidas de peso con control de salto',
    motivo: 'Si el siguiente peso es un salto grande (p. ej. 10 → 12 kg en martillo), primero subes reps hasta 3 por encima del rango. Así no vuelves a quedarte en 6 con bajada.' }
];

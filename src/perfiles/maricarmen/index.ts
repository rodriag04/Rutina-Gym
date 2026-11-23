import type { Dia, Ejercicio, Perfil } from '../../data/tipos';

/*
  Mari Carmen, 53 años. Va 2 días por semana con poco tiempo. Prioridad: piernas y glúteo sin descuidar el resto.
  Base: su tabla "The Natural Way · Liberto (Level I), 3.er mesociclo" (A push+quads, B pull+hams, C full body, 3 días).
  Adaptación: 2 días de cuerpo entero de ~45 min con sus mismas máquinas.
*/

const E = (e: Ejercicio) => e;

const ejercicios: Ejercicio[] = [
  // ───────── DÍA 1: piernas (delante) · pecho y espalda ─────────
  E({
    id: 'd1-1a', dia: 'd1', nombre: 'Prensa 45º', corto: 'Prensa',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 20, carga: 'polea-kg', calentar: true,
    musculos: { p: ['cuad-vl', 'cuad-vm', 'cuad-rf', 'gluteo-mayor'], s: ['aductores', 'isq-semi'] },
    foco: 'Piernas · cuádriceps y glúteo',
    paraTi: 'El ejercicio con más peso del día: fuerza en las piernas y el mejor estímulo para los huesos.',
    tecnica: 'Espalda y cadera pegadas al respaldo, pies a la anchura de los hombros en el centro de la plataforma; baja hasta que las rodillas formen un ángulo recto y empuja con los talones.',
    claves: ['Las rodillas siguen la dirección de los pies, sin irse hacia dentro.', 'Arriba no bloquees las rodillas del todo.', 'Coge aire al bajar y suéltalo al empujar.'],
    error: 'Bajar tanto que la zona lumbar se despega del respaldo.',
    tempo: { sube: 1, baja: 2 }, anim: 'prensa', busqueda: 'prensa 45 grados técnica'
  }),
  E({
    id: 'd1-2a', dia: 'd1', nombre: 'Extensión de cuádriceps', corto: 'Extensión de piernas',
    series: 3, min: 12, max: 15, rir: '1', rirMin: 1, descanso: 20, carga: 'polea-kg',
    musculos: { p: ['cuad-rf', 'cuad-vl', 'cuad-vm'], s: [] },
    foco: 'Piernas · cuádriceps (delante del muslo)',
    paraTi: 'La parte del muslo que sujeta la rodilla al subir escaleras y al levantarte de una silla.',
    tecnica: 'Rodilla alineada con el eje de la máquina y el rodillo sobre el tobillo; estira las piernas del todo, aguanta 1 segundo y baja despacio.',
    claves: ['Agárrate a las asas y no despegues el culo del asiento.', 'Baja en 2 segundos, sin dejar caer el peso.'],
    error: 'Subir el peso dando tirones.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'extension-cuadriceps', busqueda: 'extensión de cuádriceps máquina técnica'
  }),
  E({
    id: 'd1-2b', dia: 'd1', nombre: 'Curl femoral tumbada', corto: 'Curl femoral',
    series: 3, min: 10, max: 12, rir: '1', rirMin: 1, descanso: 60, carga: 'polea-kg',
    musculos: { p: ['isq-semi', 'isq-bf'], s: ['gemelo'] },
    foco: 'Piernas · femoral (detrás del muslo)',
    paraTi: 'Equilibra el trabajo de la parte de delante y protege la rodilla.',
    tecnica: 'Tumbada boca abajo con el rodillo justo encima de los talones; dobla las rodillas llevando los talones hacia el culo y baja despacio.',
    claves: ['La cadera, pegada al banco todo el rato.', 'Sube en 1 segundo y baja en 2.'],
    error: 'Levantar la cadera para ayudarte.',
    tempo: { sube: 1, baja: 2 }, anim: 'femoral-tumbado', busqueda: 'curl femoral tumbado máquina técnica'
  }),
  E({
    id: 'd1-3a', dia: 'd1', nombre: 'Press de pecho en máquina', corto: 'Press de pecho',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 20, carga: 'polea-kg',
    musculos: { p: ['pec-est'], s: ['pec-clav', 'delt-ant', 'tri-lateral', 'tri-medial'] },
    foco: 'Pecho y parte de atrás del brazo (tríceps)',
    paraTi: 'Fuerza para empujar: levantarte del suelo, empujar una puerta o un carro.',
    tecnica: 'Asas a la altura del pecho y espalda pegada al respaldo; empuja hasta casi estirar los brazos y vuelve despacio.',
    claves: ['Hombros abajo y atrás, lejos de las orejas.', 'No bloquees los codos al final.'],
    error: 'Despegar la espalda del respaldo al empujar.',
    tempo: { sube: 1, baja: 2 }, anim: 'press-maquina', busqueda: 'chest press máquina técnica'
  }),
  E({
    id: 'd1-3b', dia: 'd1', nombre: 'Jalón al pecho con palmas hacia ti', corto: 'Jalón',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 75, carga: 'polea-kg',
    musculos: { p: ['dorsal', 'redondo'], s: ['bic-corta', 'bic-larga', 'braquial', 'trap-inf'] },
    foco: 'Espalda y bíceps',
    paraTi: 'Espalda fuerte y postura recta. Con las palmas hacia ti también trabaja el bíceps.',
    tecnica: 'Palmas mirando hacia ti, a la anchura de los hombros; saca pecho y baja la barra hasta la parte alta del pecho llevando los codos hacia abajo.',
    claves: ['Primero baja los hombros, luego tira con los brazos.', 'Sube despacio hasta estirar los brazos.'],
    error: 'Echarse muy atrás o tirar dando tirones.',
    tempo: { sube: 1, baja: 2 }, anim: 'jalon', busqueda: 'jalón al pecho agarre supino técnica'
  }),
  E({
    id: 'd1-1b', dia: 'd1', nombre: 'Gemelos en la prensa', corto: 'Gemelos en prensa',
    series: 3, min: 15, max: 20, rir: '1', rirMin: 1, descanso: 105, carga: 'polea-kg',
    musculos: { p: ['gemelo'], s: ['soleo'] },
    foco: 'Piernas · gemelos',
    paraTi: 'Tobillos más estables y mejor equilibrio al caminar. Se hacen en la misma prensa: no esperas máquina.',
    tecnica: 'Nada más acabar cada serie de prensa, sin levantarte: piernas casi estiradas y solo la punta de los pies en el borde de la plataforma; baja los talones, aguanta 1 segundo y empuja con los dedos.',
    claves: ['Recorrido completo y despacio.', 'Las rodillas no se doblan.'],
    error: 'Rebotar y hacer medio recorrido.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'gemelos', busqueda: 'gemelos en prensa técnica'
  }),
  E({
    id: 'd1-4', dia: 'd1', nombre: 'Crunch abdominal', corto: 'Crunch',
    series: 3, min: 12, max: 15, rir: '1', rirMin: 1, descanso: 45, carga: 'corporal',
    musculos: { p: ['abdomen'], s: ['oblicuos'] },
    foco: 'Abdomen',
    paraTi: 'Un tronco fuerte protege la espalda en el día a día.',
    tecnica: 'Tumbada boca arriba con las rodillas dobladas; despega los hombros del suelo acercando las costillas a la cadera y baja despacio.',
    claves: ['La zona lumbar se queda apoyada en el suelo.', 'Mira al techo: no tires del cuello.', 'Cuando hagas 15 fácil, sujeta un disco en el pecho.'],
    error: 'Tirar de la cabeza con las manos.',
    tempo: { sube: 1, baja: 2 }, anim: 'crunch', busqueda: 'crunch abdominal técnica correcta'
  }),

  // ───────── DÍA 2: glúteo y femoral · espalda y hombro ─────────
  E({
    id: 'd2-1', dia: 'd2', nombre: 'Sentadilla hack en máquina', corto: 'Sentadilla hack',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 105, carga: 'polea-kg', calentar: true,
    musculos: { p: ['cuad-vl', 'cuad-vm', 'cuad-rf', 'gluteo-mayor'], s: ['aductores'] },
    foco: 'Piernas · cuádriceps y glúteo',
    paraTi: 'Como una sentadilla, pero guiada y con la espalda apoyada: más segura para espalda y rodillas.',
    tecnica: 'Espalda pegada al respaldo y pies a la anchura de los hombros, un poco adelantados; baja hasta que los muslos queden paralelos a la plataforma y sube empujando con los talones.',
    claves: ['Las rodillas siguen la línea de los pies.', 'Si molesta la rodilla, baja un poco menos.'],
    error: 'Levantar los talones al bajar.',
    tempo: { sube: 1, baja: 2 }, anim: 'hack', busqueda: 'sentadilla hack máquina técnica'
  }),
  E({
    id: 'd2-2', dia: 'd2', nombre: 'Peso muerto rumano con mancuernas', corto: 'Peso muerto rumano',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 90, carga: 'mancuerna',
    musculos: { p: ['isq-semi', 'isq-bf', 'gluteo-mayor'], s: ['lumbar', 'antebrazo'] },
    foco: 'Glúteo y femoral (detrás del muslo)',
    paraTi: 'Glúteo y femoral fuertes cuidan la espalda al agacharte a coger cosas.',
    tecnica: 'De pie, una mancuerna en cada mano y las rodillas un poco dobladas; echa la cadera hacia atrás con la espalda recta hasta notar que estira detrás del muslo, y vuelve apretando el glúteo.',
    claves: ['Las mancuernas bajan pegadas a las piernas.', 'Baja solo hasta donde mantengas la espalda recta.', 'El kg es el de cada mancuerna.'],
    error: 'Redondear la espalda o doblar mucho las rodillas.',
    tempo: { sube: 1, baja: 2 }, anim: 'rumano', busqueda: 'peso muerto rumano mancuernas técnica'
  }),
  E({
    id: 'd2-4a', dia: 'd2', nombre: 'Hiperextensión 45º para glúteo', corto: 'Hiperextensión',
    series: 3, min: 12, max: 15, rir: '2', rirMin: 2, descanso: 20, carga: 'corporal',
    musculos: { p: ['gluteo-mayor', 'isq-semi'], s: ['lumbar', 'isq-bf'] },
    foco: 'Glúteo y zona lumbar',
    paraTi: 'Glúteo más fuerte y la espalda baja más protegida.',
    tecnica: 'Cadera apoyada en el cojín y pies bien sujetos; baja el tronco despacio y sube apretando el glúteo hasta quedar en línea con las piernas, sin pasarte.',
    claves: ['Arriba no arquees la espalda: para en línea recta.', 'Brazos cruzados en el pecho. Cuando hagas 15 fácil, coge un disco.'],
    error: 'Subir de golpe y echar la cabeza atrás.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'hiperextension', busqueda: 'hiperextensión 45 grados glúteo técnica'
  }),
  E({
    id: 'd2-3a', dia: 'd2', nombre: 'Remo con mancuerna', corto: 'Remo mancuerna',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 20, carga: 'mancuerna', porLado: true,
    musculos: { p: ['dorsal', 'trap-medio'], s: ['delt-post', 'bic-larga', 'braquial'] },
    foco: 'Espalda',
    paraTi: 'Espalda y postura: ayuda a no ir encorvada.',
    tecnica: 'Una rodilla y una mano en el banco y la espalda recta; sube la mancuerna hacia la cadera con el codo pegado al cuerpo y baja despacio.',
    claves: ['Primero todas las repeticiones con un brazo y luego con el otro.', 'No gires el tronco para subirla.'],
    error: 'Tirar encogiendo el hombro hacia la oreja.',
    tempo: { sube: 1, baja: 2 }, anim: 'remo-mancuerna', busqueda: 'remo con mancuerna a una mano técnica'
  }),
  E({
    id: 'd2-3b', dia: 'd2', nombre: 'Press de hombro en máquina', corto: 'Press de hombro',
    series: 3, min: 10, max: 12, rir: '2', rirMin: 2, descanso: 75, carga: 'polea-kg',
    musculos: { p: ['delt-ant'], s: ['delt-lat', 'tri-lateral', 'tri-medial'] },
    foco: 'Hombros y tríceps',
    paraTi: 'Fuerza para subir cosas por encima de la cabeza, como dejar algo en un armario alto.',
    tecnica: 'Espalda pegada al respaldo y asas a la altura de los hombros; empuja hacia arriba sin bloquear los codos y baja despacio.',
    claves: ['No arquees la zona lumbar.', 'Si molesta el hombro, no bajes tanto.'],
    error: 'Encoger los hombros al empujar.',
    tempo: { sube: 1, baja: 2 }, anim: 'press-hombro-maquina', busqueda: 'shoulder press máquina técnica'
  }),
  E({
    id: 'd2-4b', dia: 'd2', nombre: 'Gemelos de pie en máquina', corto: 'Gemelos de pie',
    series: 3, min: 15, max: 20, rir: '1', rirMin: 1, descanso: 60, carga: 'polea-kg',
    musculos: { p: ['gemelo'], s: ['soleo'] },
    foco: 'Piernas · gemelos',
    paraTi: 'Equilibrio y tobillos más fuertes.',
    tecnica: 'Puntas de los pies en el escalón y hombros bajo las almohadillas; baja los talones despacio y sube todo lo que puedas.',
    claves: ['Aguanta 1 segundo arriba y 1 abajo.', 'Piernas estiradas, sin bloquear las rodillas.'],
    error: 'Rebotar abajo.',
    tempo: { sube: 1, baja: 2, pausa: 1 }, anim: 'gemelos-pie', busqueda: 'gemelos de pie máquina técnica'
  })
];

const dias: Dia[] = [
  { id: 'd1', color: 'var(--dom)', nombre: 'Día 1', corto: 'Día 1', titulo: 'Piernas · pecho y espalda', cuentaSemanal: true,
    bloques: [['d1-1a', 'd1-1b'], ['d1-2a', 'd1-2b'], ['d1-3a', 'd1-3b'], ['d1-4']] },
  { id: 'd2', color: 'var(--alt)', nombre: 'Día 2', corto: 'Día 2', titulo: 'Glúteo y femoral · espalda y hombro', cuentaSemanal: true,
    bloques: [['d2-1'], ['d2-2'], ['d2-3a', 'd2-3b'], ['d2-4a', 'd2-4b']] }
];

const cambios: Perfil['cambios'] = [
  { fecha: '2026-11-23', titulo: 'De 3 entrenos (A, B, C) a 2 días de cuerpo entero',
    motivo: 'Vas 2 días por semana. Cada día trabaja piernas, empuje, tirón y abdomen: así nada se queda una semana sin hacer.' },
  { fecha: '2026-11-23', titulo: 'Las piernas, primero y con más series',
    motivo: 'Cada semana: 9 series de cuádriceps, 12 de glúteo, 9 de femoral y 6 de gemelo. Pecho, espalda y hombro, lo justo para ganar fuerza.' },
  { fecha: '2026-11-23', titulo: 'Unos 45-50 minutos por día',
    motivo: 'Ejercicios por parejas (superseries): haces uno y enseguida el otro, y descansas al acabar los dos. Prensa + gemelos en la misma máquina, extensión + femoral, pecho + espalda. Si dos máquinas están lejos u ocupadas, hazlos uno detrás de otro.' },
  { fecha: '2026-11-23', titulo: 'Sin llegar al fallo',
    motivo: 'Tu tabla pide llegar al fallo en algunos ejercicios. Aquí te sobran 1 o 2 repeticiones: casi el mismo resultado y mucho menos riesgo.' },
  { fecha: '2026-11-23', titulo: '10-12 repeticiones en los ejercicios grandes (antes 8-10)',
    motivo: 'Algo menos de peso para el mismo trabajo: más amable con rodillas, hombros y espalda.' },
  { fecha: '2026-11-23', titulo: 'Kettlebell swing → peso muerto rumano con mancuernas',
    motivo: 'Trabaja lo mismo (glúteo y femoral) con un movimiento lento y controlado, sin impulso.' },
  { fecha: '2026-11-23', titulo: 'Sentadilla Frankenstein → sentadilla hack',
    motivo: 'La hack es guiada y con la espalda apoyada: no depende del equilibrio con la barra.' },
  { fecha: '2026-11-23', titulo: 'Fuera por tiempo',
    motivo: 'Press banca multipower, press inclinado, aperturas, elevaciones laterales, remo landmine, vertical traction, pulldown, wood chop, curl con barra y extensiones de tríceps. Brazos, pecho y hombro ya trabajan en lo que queda; el abdomen, en el crunch, el peso muerto y la hiperextensión.' },
  { fecha: '2026-11-23', titulo: 'Semana suave cada 4, como en tu tabla',
    motivo: 'La 4.ª semana, mismos pesos y la mitad de series. La app la pone sola.' }
];

export const perfil: Perfil = {
  id: 'maricarmen',
  nombre: 'Mari Carmen',
  ejercicios,
  dias,
  ordenSemana: ['d1', 'd2'],
  cambios,
  reglas: [
    'Un solo peso para todas las series de un ejercicio.',
    'La primera vez eliges tú el peso. Desde la segunda, la app te dice cuál poner y cuántas repeticiones.',
    'Cuando la 1.ª serie llega al máximo de repeticiones y la 2.ª se queda a 1, la app te sube un poco el peso.',
    'Si te quedas 3 o más repeticiones por debajo del mínimo, te lo baja.',
    'Si no, el mismo peso: intenta una repetición más en cada serie.',
    'Cada 4 semanas, una semana suave: mismos pesos y la mitad de series.'
  ],
  historial: [],
  gimnasios: [{ id: 'principal', nombre: 'Mi gimnasio' }],
  gymPorDefecto: 'principal',
  pesoCorporal: 65,
  escalones: {
    mancuerna: [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24],
    'polea-kg': Array.from({ length: 80 }, (_, i) => (i + 1) * 2.5),
    corporal: [0, 2.5, 5, 7.5, 10, 12.5, 15, 20]
  },
  pesosIniciales: { mancuerna: 4, 'polea-kg': 20, corporal: 0 },
  medidasIniciales: [],
  textoMedidas: 'Mídete una vez al mes, por la mañana y en ayunas: peso y cintura a la altura del ombligo.',
  molestias: ['Rodilla', 'Lumbar', 'Hombro', 'Cervicales', 'Cadera'],
  destacado: { id: 'd1-1a', sub: 'Tu ejercicio principal de piernas' },
  grupo: { titulo: 'Piernas y glúteo', ids: ['d1-1a', 'd2-1', 'd1-2a', 'd1-2b', 'd2-2', 'd2-4a', 'd1-1b', 'd2-4b'] },
  informe: 'Mari Carmen, 53 años. Objetivo: fortalecer piernas y glúteo sin descuidar el resto. 2 días por semana, unos 45 min.',
  descargaCada: 4,
  sencillo: true,
  bienvenida: [
    'Hola, Mari Carmen. Así funciona:',
    '1. Arriba eliges Día 1 o Día 2. La app marca el que toca.',
    '2. La primera vez, toca el peso de cada ejercicio y elige uno con el que hagas las repeticiones y te sobren 2.',
    '3. Al acabar cada serie, toca el círculo. Si hiciste más o menos repeticiones, cámbialas con − y +.',
    '4. Al terminar, pulsa «Terminar» y «Guardar sesión». La próxima vez la app te dirá qué peso poner.',
    'Toca el nombre de un ejercicio para ver cómo se hace.'
  ]
};

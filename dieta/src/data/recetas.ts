import type { Receta } from '../lib/tipos';

// Cantidades base = ración normal. El plan escala la proteína (prot) y los hidratos (hc)
// dentro de [min, max] para cuadrar el día. Verdura: 200 g de la bolsa congelada (R1).
// Postre de las cenas: 1 yogur +Proteínas (YOG).

const R1 = { a: 'verdura', g: 200, rol: 'veg' as const };
const YOG = { a: 'yogur', g: 120, rol: 'extra' as const, nota: 'de postre' };
const ACEITE = (g: number) => ({ a: 'aceite', g, rol: 'grasa' as const });
const VERDURA_PASO = 'Saltea la verdura congelada directamente en la sartén con unas gotas de aceite, fuego medio-alto, 6-7 min (sin descongelar).';

export const RECETAS: Receta[] = [
  // ───────────── Desayunos ─────────────
  {
    id: 'boc-pavo',
    titulo: 'Bocadillo de pavo',
    sub: 'Pan integral, pavo y tomate',
    slots: ['desayuno'],
    familia: 'pavo',
    min: 4,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'pavo-fiambre', g: 100, rol: 'prot', min: 80, max: 130 },
      { a: 'tomate', g: 30, nota: 'rallado' },
      ACEITE(3)
    ],
    pasos: ['Abre el pan y frota o ralla el tomate.', 'Un hilo de aceite y el pavo en lonchas.', 'Envuélvelo en papel de aluminio para clase.'],
    truco: 'Congela el pan en trozos de 80 g. Sácalo la noche antes o tuéstalo 3 min en la airfryer a 180 ºC.',
    dibujo: 'bocadillo-pavo',
    fondo: '#F3D9B1'
  },
  {
    id: 'boc-jamon',
    titulo: 'Bocadillo de jamón',
    sub: 'Pan integral, jamón serrano y tomate',
    slots: ['desayuno'],
    familia: 'jamon',
    min: 4,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'jamon', g: 60, rol: 'prot', min: 50, max: 80 },
      { a: 'tomate', g: 30, nota: 'rallado' },
      ACEITE(3)
    ],
    pasos: ['Ralla el tomate sobre el pan abierto.', 'Aceite y las lonchas de jamón sin amontonar.', 'Envuélvelo y a la mochila.'],
    truco: 'El jamón aguanta toda la semana en la nevera; es tu desayuno del lunes antes de hacer la compra.',
    dibujo: 'bocadillo-jamon',
    fondo: '#F1C9B8'
  },
  {
    id: 'boc-lomo',
    titulo: 'Bocadillo de lomo embuchado',
    sub: 'Pan integral, lomo y tomate',
    slots: ['desayuno'],
    familia: 'lomo-emb',
    min: 4,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'lomo-emb', g: 50, rol: 'prot', min: 40, max: 70 },
      { a: 'tomate', g: 30, nota: 'rallado' },
      ACEITE(3)
    ],
    pasos: ['Tomate rallado sobre el pan.', 'Un hilo de aceite y el lomo en lonchas finas.', 'Envuelto en aluminio aguanta toda la mañana.'],
    truco: 'El lomo embuchado tiene más proteína por gramo que el jamón (38 g por 100 g): 50 g bastan.',
    dibujo: 'bocadillo-lomo',
    fondo: '#EBC3BE'
  },
  {
    id: 'revuelto-jamon',
    titulo: 'Revuelto de huevos con jamón',
    sub: 'Con tostada integral, en casa',
    slots: ['desayuno'],
    familia: 'huevo',
    min: 8,
    etiquetas: ['casa'],
    ing: [
      { a: 'huevo', g: 180, nota: '3 huevos' },
      { a: 'jamon', g: 30, rol: 'prot', min: 20, max: 50, nota: 'en tiras' },
      { a: 'pan', g: 60, rol: 'hc', min: 50, max: 100, nota: 'tostado' },
      ACEITE(3)
    ],
    pasos: [
      'Tuesta el pan (airfryer 180 ºC, 3 min, o tostadora).',
      'Sartén a fuego medio con unas gotas de aceite. Echa el jamón 30 s.',
      'Bate los 3 huevos con una pizca de sal, échalos y remueve sin parar con una espátula.',
      'Apaga el fuego cuando aún estén algo jugosos: terminan de hacerse solos.'
    ],
    truco: 'Fuego medio, no fuerte: así no se secan. Si sale bien a la segunda, ya no es complicado.',
    dibujo: 'revuelto',
    fondo: '#F5E3A3'
  },
  {
    id: 'tostadas-huevo',
    titulo: 'Tostadas con huevo y pavo',
    sub: 'Huevo a la plancha, pavo y tomate',
    slots: ['desayuno'],
    familia: 'huevo',
    min: 7,
    etiquetas: ['casa'],
    ing: [
      { a: 'pan', g: 70, rol: 'hc', min: 60, max: 100, nota: 'tostado' },
      { a: 'huevo', g: 120, nota: '2 huevos' },
      { a: 'pavo-fiambre', g: 50, rol: 'prot', min: 40, max: 80 },
      { a: 'tomate', g: 30, nota: 'en rodajas' },
      ACEITE(3)
    ],
    pasos: [
      'Tuesta el pan.',
      'Huevos a la plancha en sartén antiadherente con unas gotas de aceite, tapados 2-3 min (yema algo líquida).',
      'Monta: tomate, pavo y el huevo encima. Sal y pimienta.'
    ],
    truco: 'Tapar la sartén hace la clara por arriba sin dar la vuelta al huevo.',
    dibujo: 'tostada-huevo',
    fondo: '#F7E6B5'
  },

  // ───────────── Pre-gym ─────────────
  {
    id: 'platano',
    titulo: 'Plátano',
    sub: '30-45 min antes de entrenar',
    slots: ['pre'],
    familia: 'fruta',
    min: 0,
    ing: [{ a: 'platano', g: 120, nota: '1 plátano' }],
    pasos: ['Cómelo 30-45 min antes de empezar. Hidratos rápidos sin pesadez.'],
    dibujo: 'platano',
    fondo: '#F6E7A6'
  },

  // ───────────── Comidas ─────────────
  {
    id: 'taper-mama',
    titulo: 'Táper de mamá',
    sub: 'Pollo a la plancha, patatas y verduras',
    slots: ['comida'],
    familia: 'pollo',
    min: 3,
    fija: true,
    etiquetas: ['taper'],
    ing: [
      { a: 'pollo', g: 200 },
      { a: 'patata', g: 250 },
      { a: 'verdura', g: 200 },
      ACEITE(10)
    ],
    pasos: ['Microondas 2-3 min tapado, remueve y 1 min más.', 'Si la patata está blanda, 5 min en la airfryer a 200 ºC.'],
    truco: 'Del domingo al lunes en la nevera, no en la mochila toda la mañana.',
    dibujo: 'taper',
    fondo: '#D9E4C8'
  },
  {
    id: 'bolonesa',
    titulo: 'Pasta boloñesa con verduras',
    sub: 'Ternera picada, tomate y verdura',
    slots: ['comida', 'cena'],
    familia: 'ternera',
    min: 18,
    ing: [
      { a: 'pasta', g: 100, rol: 'hc', min: 70, max: 150, nota: 'en seco' },
      { a: 'picada', g: 150, rol: 'prot', min: 120, max: 200 },
      { a: 'triturado', g: 150 },
      R1,
      ACEITE(5),
      { a: 'especias', g: 0, nota: 'orégano, ajo en polvo' }
    ],
    pasos: [
      'Pon a hervir agua con sal y cuece la pasta el tiempo del paquete.',
      VERDURA_PASO,
      'Añade la carne picada, sal y ajo en polvo. Deshazla con la espátula 4-5 min.',
      'Tomate triturado y orégano. 5 min a fuego medio.',
      'Escurre la pasta y mézclala con la salsa.'
    ],
    truco: 'Si haces el doble de salsa, la mitad aguanta 3 días en táper (no la repitas al día siguiente).',
    dibujo: 'bolonesa',
    fondo: '#F2C7A5'
  },
  {
    id: 'curry-pollo',
    titulo: 'Pollo al curry con arroz',
    sub: 'Salsa cremosa de cottage, sin nata',
    slots: ['comida'],
    familia: 'pollo',
    min: 15,
    ing: [
      { a: 'pollo', g: 180, rol: 'prot', min: 150, max: 230, nota: 'en dados' },
      { a: 'arroz', g: 190, rol: 'hc', min: 125, max: 300 },
      R1,
      { a: 'cottage', g: 60, nota: 'para la salsa' },
      ACEITE(5),
      { a: 'especias', g: 0, nota: '1 cucharadita de curry' }
    ],
    pasos: [
      VERDURA_PASO,
      'Añade el pollo en dados con sal y el curry. 6-7 min hasta que se dore.',
      'Apaga el fuego y mezcla el cottage: hace de nata (no lo hiervas, se corta).',
      'Arroz: vasitos 1 min al microondas. Sírvelo al lado.'
    ],
    truco: 'El cottage con curry no sabe a cottage: sabe a salsa de curry suave.',
    dibujo: 'curry',
    fondo: '#F4D58D'
  },
  {
    id: 'salmon-patata',
    titulo: 'Salmón con patatas',
    sub: 'Airfryer, patatas doradas y verdura',
    slots: ['comida', 'cena'],
    familia: 'salmon',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'salmon', g: 160, rol: 'prot', min: 140, max: 200 },
      { a: 'patata', g: 250, rol: 'hc', min: 150, max: 400 },
      R1,
      ACEITE(5),
      { a: 'limon', g: 0, nota: 'unas gotas' }
    ],
    pasos: [
      'Patatas al microondas en su bandeja (6-8 min). Pártelas por la mitad.',
      'Airfryer precalentada 3 min a 180 ºC. Salmón con la piel abajo, sal, sin aceite: 9-11 min sin darle la vuelta.',
      'En los últimos 5 min mete las patatas al lado para dorarlas.',
      VERDURA_PASO
    ],
    truco: 'Está hecho cuando se separa en láminas con el tenedor. Si te pasas, se seca.',
    airfryer: { temp: 180, tiempo: '9-11 min', nota: 'piel abajo, sin dar la vuelta' },
    dibujo: 'salmon-patata',
    fondo: '#F6C9A8'
  },
  {
    id: 'gnocchi-pollo',
    titulo: 'Ñoquis gratinados con pollo',
    sub: 'Tomate, verdura y mozzarella',
    slots: ['comida'],
    familia: 'pollo',
    min: 18,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'gnocchi', g: 200, rol: 'hc', min: 150, max: 300 },
      { a: 'pollo', g: 150, rol: 'prot', min: 130, max: 200, nota: 'en dados' },
      { a: 'triturado', g: 120 },
      R1,
      { a: 'mozzarella', g: 25 },
      ACEITE(5)
    ],
    pasos: [
      'Ñoquis en agua hirviendo: cuando suben a la superficie (2 min), escúrrelos.',
      VERDURA_PASO,
      'Añade el pollo en dados 6 min y luego el tomate triturado 3 min.',
      'Mezcla con los ñoquis en un recipiente apto, mozzarella por encima y gratina en la airfryer 200 ºC 4-5 min.'
    ],
    airfryer: { temp: 200, tiempo: '4-5 min', nota: 'gratinar' },
    dibujo: 'gnocchi',
    fondo: '#F3CDB0'
  },
  {
    id: 'solomillo',
    titulo: 'Solomillo con patatas gajo',
    sub: 'Medallones en airfryer y salsa de mostaza',
    slots: ['comida', 'cena'],
    familia: 'cerdo',
    min: 20,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'solomillo', g: 180, rol: 'prot', min: 150, max: 230 },
      { a: 'patata', g: 280, rol: 'hc', min: 150, max: 400, nota: 'en gajos' },
      R1,
      { a: 'cottage', g: 40, nota: 'con 1 cucharadita de mostaza' },
      ACEITE(8)
    ],
    pasos: [
      'Patatas al microondas 6 min, córtalas en gajos y airfryer 200 ºC 8 min con 1 cucharadita de aceite.',
      'Solomillo en medallones de 3 cm, sal y pimienta. Airfryer 200 ºC 8-10 min, vuelta a mitad.',
      VERDURA_PASO,
      'Salsa: cottage + mostaza + pimienta, removido.'
    ],
    truco: 'Punto: 63 ºC dentro, rosado en el centro. Más hecho se seca.',
    airfryer: { temp: 200, tiempo: '8-10 min', nota: 'vuelta a mitad' },
    dibujo: 'solomillo',
    fondo: '#E9C6A6'
  },
  {
    id: 'arroz-wok',
    titulo: 'Arroz salteado con pollo',
    sub: 'Estilo wok: huevo, verdura y soja',
    slots: ['comida', 'cena'],
    familia: 'pollo',
    min: 14,
    ing: [
      { a: 'arroz', g: 250, rol: 'hc', min: 125, max: 375 },
      { a: 'pollo', g: 160, rol: 'prot', min: 130, max: 220, nota: 'en tiras' },
      { a: 'huevo', g: 60, nota: '1 huevo' },
      R1,
      { a: 'soja', g: 10 },
      ACEITE(5)
    ],
    pasos: [
      VERDURA_PASO,
      'Añade el pollo en tiras, 5-6 min.',
      'Haz un hueco, casca el huevo y revuélvelo 1 min.',
      'Arroz de los vasitos (sin calentar antes) y la soja. 2 min a fuego fuerte removiendo.'
    ],
    truco: 'El arroz de vasito va mejor que el recién hecho: está suelto y no se apelmaza.',
    dibujo: 'wok',
    fondo: '#EED9A8'
  },
  {
    id: 'albondigas',
    titulo: 'Albóndigas en salsa de tomate',
    sub: 'Airfryer, con arroz basmati',
    slots: ['comida', 'cena'],
    familia: 'ternera',
    min: 20,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'picada', g: 170, rol: 'prot', min: 140, max: 220 },
      { a: 'arroz', g: 190, rol: 'hc', min: 125, max: 300 },
      { a: 'triturado', g: 150 },
      R1,
      ACEITE(3),
      { a: 'especias', g: 0, nota: 'ajo en polvo, pimentón' }
    ],
    pasos: [
      'Mezcla la carne con sal, ajo en polvo y pimentón. Haz bolas de 3 cm (salen 8-9).',
      'Airfryer 190 ºC 8-10 min, agitando a mitad.',
      VERDURA_PASO,
      'Tomate triturado a la sartén con la verdura, mete las albóndigas y 4 min juntas.',
      'Arroz de vasito al lado.'
    ],
    airfryer: { temp: 190, tiempo: '8-10 min', nota: 'agitar a mitad' },
    dibujo: 'albondigas',
    fondo: '#F0BFA0'
  },
  {
    id: 'lubina-patata',
    titulo: 'Lubina con patatas',
    sub: 'Airfryer, piel crujiente',
    slots: ['comida', 'cena'],
    familia: 'lubina',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'lubina', g: 220, rol: 'prot', min: 180, max: 260 },
      { a: 'patata', g: 280, rol: 'hc', min: 150, max: 400 },
      R1,
      ACEITE(8),
      { a: 'limon', g: 0, nota: 'unas gotas' }
    ],
    pasos: [
      'Patatas al microondas 6-8 min y pártelas.',
      'Airfryer 180 ºC: filetes con la piel abajo sobre papel recortado (que no suba por las paredes), sal. 8-10 min sin dar la vuelta.',
      'Patatas los últimos 5 min al lado.',
      VERDURA_PASO
    ],
    airfryer: { temp: 180, tiempo: '8-10 min', nota: 'piel abajo sobre papel recortado' },
    dibujo: 'lubina',
    fondo: '#CFE0E4'
  },
  {
    id: 'cinta-patata',
    titulo: 'Lomo a la plancha con patatas',
    sub: 'Filetes de cinta en airfryer',
    slots: ['comida', 'cena'],
    familia: 'cerdo',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'cinta', g: 180, rol: 'prot', min: 150, max: 230 },
      { a: 'patata', g: 250, rol: 'hc', min: 150, max: 400 },
      R1,
      ACEITE(5),
      { a: 'especias', g: 0, nota: 'ajo en polvo, pimentón' }
    ],
    pasos: [
      'Patatas al microondas 6-8 min. Airfryer 200 ºC 5-8 min para tostarlas.',
      'Filetes con sal, ajo y pimentón. Airfryer 200 ºC 6-8 min, vuelta a mitad.',
      VERDURA_PASO
    ],
    airfryer: { temp: 200, tiempo: '6-8 min', nota: 'vuelta a mitad' },
    dibujo: 'cinta',
    fondo: '#EDCDB0'
  },
  {
    id: 'pasta-atun',
    titulo: 'Pasta con atún y tomate',
    sub: 'De despensa: sin nada fresco',
    slots: ['comida', 'cena'],
    familia: 'atun',
    min: 14,
    etiquetas: ['despensa'],
    ing: [
      { a: 'pasta', g: 100, rol: 'hc', min: 70, max: 150, nota: 'en seco' },
      { a: 'atun', g: 112, rol: 'prot', min: 112, max: 168, nota: '2 latas' },
      { a: 'triturado', g: 150 },
      R1,
      ACEITE(5),
      { a: 'especias', g: 0, nota: 'orégano' }
    ],
    pasos: ['Cuece la pasta.', VERDURA_PASO, 'Añade el tomate 4 min y el atún escurrido al final (solo calentar).', 'Mezcla con la pasta y orégano.'],
    truco: 'Plato de emergencia: todo aguanta semanas en la despensa y el congelador.',
    dibujo: 'pasta-atun',
    fondo: '#F2D0A8'
  },
  {
    id: 'burger',
    titulo: 'Hamburguesa casera',
    sub: 'En pan integral, con patatas airfryer',
    slots: ['comida', 'cena'],
    familia: 'ternera',
    min: 18,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'picada', g: 170, rol: 'prot', min: 150, max: 210 },
      { a: 'pan', g: 70, rol: 'hc', min: 60, max: 90 },
      { a: 'patata', g: 150, rol: 'hc', min: 100, max: 300, nota: 'en gajos' },
      { a: 'mozzarella', g: 20 },
      { a: 'tomate', g: 40, nota: 'en rodajas' },
      R1,
      ACEITE(3)
    ],
    pasos: [
      'Carne con sal y pimienta. Forma 1 hamburguesa de 1,5 cm con un hoyo en el centro (no se abomba).',
      'Patatas: microondas 5 min, gajos y airfryer 200 ºC 8 min.',
      'Hamburguesa en la airfryer 190 ºC 10-12 min, vuelta a mitad. Mozzarella encima el último minuto.',
      'Pan tostado, tomate y la carne. La verdura salteada al lado.'
    ],
    airfryer: { temp: 190, tiempo: '10-12 min', nota: 'hoyo en el centro, vuelta a mitad' },
    dibujo: 'burger',
    fondo: '#F2CFA0'
  },
  {
    id: 'pollo-gajos',
    titulo: 'Tiras de pollo con gajos',
    sub: 'Airfryer y salsa de yogur con limón',
    slots: ['comida', 'cena'],
    familia: 'pollo',
    min: 16,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'pollo', g: 180, rol: 'prot', min: 150, max: 230, nota: 'en tiras' },
      { a: 'patata', g: 250, rol: 'hc', min: 150, max: 400, nota: 'en gajos' },
      { a: 'yogur', g: 60, nota: '½ yogur para la salsa' },
      R1,
      ACEITE(8),
      { a: 'especias', g: 0, nota: 'pimentón, ajo en polvo' }
    ],
    pasos: [
      'Patatas al microondas 5 min y córtalas en gajos.',
      'Pollo en tiras con sal, pimentón y ajo. Junto a los gajos con 1 cucharadita de aceite.',
      'Airfryer 200 ºC 10-12 min, agitando a mitad.',
      'Salsa: medio yogur + gotas de limón + sal + ajo en polvo.',
      VERDURA_PASO
    ],
    airfryer: { temp: 200, tiempo: '10-12 min', nota: 'una sola capa, agitar a mitad' },
    dibujo: 'pollo-gajos',
    fondo: '#F3DDB0'
  },
  {
    id: 'burrito',
    titulo: 'Burrito de pollo y arroz',
    sub: 'Tortilla integral, verdura y cottage',
    slots: ['comida', 'cena'],
    familia: 'pollo',
    min: 15,
    ing: [
      { a: 'tortilla', g: 72, nota: '2 tortillas' },
      { a: 'pollo', g: 150, rol: 'prot', min: 130, max: 200, nota: 'en tiras' },
      { a: 'arroz', g: 125, rol: 'hc', min: 60, max: 190 },
      R1,
      { a: 'mozzarella', g: 25 },
      { a: 'cottage', g: 40, nota: 'como nata agria' },
      { a: 'especias', g: 0, nota: 'pimentón, comino' }
    ],
    pasos: [
      VERDURA_PASO,
      'Añade el pollo con pimentón, comino y sal. 6 min.',
      'Calienta las tortillas 20 s en el microondas.',
      'Rellena: arroz, pollo con verdura, mozzarella y cottage. Enrolla cerrando los lados.',
      'Opcional: 3 min en la airfryer a 200 ºC para que cruja.'
    ],
    dibujo: 'burrito',
    fondo: '#EFD3A6'
  },
  {
    id: 'pavo-arroz',
    titulo: 'Pavo al pimentón con arroz',
    sub: 'Salteado rápido en sartén',
    slots: ['comida', 'cena'],
    familia: 'pavo',
    min: 12,
    ing: [
      { a: 'pavo', g: 200, rol: 'prot', min: 160, max: 250, nota: 'en dados' },
      { a: 'arroz', g: 190, rol: 'hc', min: 125, max: 300 },
      R1,
      ACEITE(5),
      { a: 'especias', g: 0, nota: 'pimentón, ajo en polvo' }
    ],
    pasos: [VERDURA_PASO, 'Añade el pavo con sal, ajo y pimentón. 6-7 min.', 'Arroz de vasito al microondas 1 min y mézclalo o sírvelo al lado.'],
    truco: 'El pavo se seca antes que el pollo: sácalo en cuanto no esté rosa por dentro.',
    dibujo: 'pavo-arroz',
    fondo: '#F0D9AF'
  },

  // ───────────── Meriendas ─────────────
  {
    id: 'batido-platano',
    titulo: 'Batido, plátano y nueces',
    sub: 'Proteína con leche',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 2,
    etiquetas: ['batido'],
    ing: [
      { a: 'whey', g: 30, nota: '1 cacito' },
      { a: 'leche', g: 200, nota: '200 ml' },
      { a: 'platano', g: 120, rol: 'hc', min: 120, max: 240 },
      { a: 'nueces', g: 10, rol: 'grasa', descanso: 20 }
    ],
    pasos: ['Cacito de proteína en la leche, agita en el bote 15 s.', 'Plátano y las nueces aparte.'],
    dibujo: 'batido',
    fondo: '#E6D2BC'
  },
  {
    id: 'yogur-bowl',
    titulo: 'Bowl de yogur y arándanos',
    sub: 'Dos yogures +Proteínas, fruta y nueces',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 3,
    etiquetas: ['nevera'],
    ing: [
      { a: 'yogur', g: 240, nota: '2 yogures' },
      { a: 'arandanos', g: 80, nota: 'congelados' },
      { a: 'platano', g: 60, rol: 'hc', min: 60, max: 120, nota: '½ plátano' },
      { a: 'nueces', g: 10, rol: 'grasa', descanso: 20 }
    ],
    pasos: ['Arándanos 40 s al microondas: sueltan jugo y hacen de mermelada.', 'Yogures, plátano en rodajas, arándanos y nueces troceadas.'],
    dibujo: 'yogur-bowl',
    fondo: '#D9D6EE'
  },
  {
    id: 'tostada-yogur',
    titulo: 'Tostada de pavo y yogur',
    sub: 'Salado y un yogur +Proteínas',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 4,
    ing: [
      { a: 'pan', g: 60, rol: 'hc', min: 50, max: 100, nota: 'tostado' },
      { a: 'pavo-fiambre', g: 60 },
      { a: 'tomate', g: 20, nota: 'rallado' },
      ACEITE(3),
      { a: 'yogur', g: 120, nota: '1 yogur' },
      { a: 'nueces', g: 0, rol: 'grasa', descanso: 10 }
    ],
    pasos: ['Tuesta el pan, tomate, aceite y pavo.', 'El yogur con las nueces troceadas por encima.'],
    dibujo: 'tostada-yogur',
    fondo: '#F1DDC0'
  },
  {
    id: 'batido-arandanos',
    titulo: 'Batido de arándanos',
    sub: 'Yogur, proteína y fruta en vaso',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 3,
    etiquetas: ['batido'],
    ing: [
      { a: 'yogur', g: 120, nota: '1 yogur' },
      { a: 'whey', g: 20, nota: '⅔ de cacito' },
      { a: 'leche', g: 150, nota: '150 ml' },
      { a: 'arandanos', g: 100 },
      { a: 'platano', g: 60, rol: 'hc', min: 60, max: 120, nota: '½ plátano' },
      { a: 'nueces', g: 10, rol: 'grasa', descanso: 15 }
    ],
    pasos: ['Todo a la batidora o al vaso de la minipimer 30 s (los arándanos congelados lo dejan frío).', 'Las nueces aparte o por encima.'],
    dibujo: 'batido-arandanos',
    fondo: '#D8CDE8'
  },

  // ───────────── Cenas ─────────────
  {
    id: 'pizza-wrap',
    titulo: 'Pizza wrap',
    sub: 'Tortilla integral gratinada en airfryer',
    slots: ['cena'],
    familia: 'pavo',
    min: 10,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'tortilla', g: 72, nota: '2 tortillas' },
      { a: 'triturado', g: 60 },
      { a: 'mozzarella', g: 45 },
      { a: 'pavo-fiambre', g: 90, rol: 'prot', min: 70, max: 130 },
      R1,
      { a: 'especias', g: 0, nota: 'orégano' },
      YOG
    ],
    pasos: [
      VERDURA_PASO,
      'Tortilla, tomate, la mitad de la verdura, pavo troceado y mozzarella. Orégano.',
      'Airfryer 200 ºC 6-8 min, de una en una. Pincha la tortilla si se infla.'
    ],
    airfryer: { temp: 200, tiempo: '6-8 min', nota: 'pinchar la tortilla si se infla' },
    dibujo: 'pizza-wrap',
    fondo: '#F4C9A0'
  },
  {
    id: 'pita-pollo',
    titulo: 'Pita de pollo',
    sub: 'Con verdura y salsa de yogur',
    slots: ['cena'],
    familia: 'pollo',
    min: 14,
    ing: [
      { a: 'pita', g: 120, rol: 'hc', min: 60, max: 120, nota: '2 pitas' },
      { a: 'pollo', g: 160, rol: 'prot', min: 130, max: 210, nota: 'en tiras' },
      R1,
      { a: 'yogur', g: 60, nota: '½ yogur para la salsa' },
      ACEITE(3),
      { a: 'especias', g: 0, nota: 'comino, pimentón, ajo' },
      { a: 'yogur', g: 60, rol: 'extra', nota: 'el otro ½ de postre' }
    ],
    pasos: [
      VERDURA_PASO,
      'Pollo con comino, pimentón y sal. 6 min en la sartén con la verdura.',
      'Pitas 2 min en la airfryer a 180 ºC (o tostadora). Ábrelas.',
      'Rellena y salsa: medio yogur, ajo en polvo, sal y limón.'
    ],
    dibujo: 'pita',
    fondo: '#EFD7B0'
  },
  {
    id: 'poke-salmon',
    titulo: 'Bowl de salmón y arroz',
    sub: 'Poke casero, salmón en dados',
    slots: ['cena', 'comida'],
    familia: 'salmon',
    min: 12,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'salmon', g: 140, rol: 'prot', min: 120, max: 180, nota: 'en dados' },
      { a: 'arroz', g: 125, rol: 'hc', min: 60, max: 250 },
      R1,
      { a: 'soja', g: 10 },
      YOG
    ],
    pasos: [
      'Salmón en dados con soja. Airfryer 180 ºC 7-8 min.',
      VERDURA_PASO,
      'Bowl: arroz caliente, verdura y el salmón encima. Un chorrito de soja.'
    ],
    airfryer: { temp: 180, tiempo: '7-8 min', nota: 'dados' },
    dibujo: 'poke',
    fondo: '#F3C3AE'
  },
  {
    id: 'quesadilla',
    titulo: 'Quesadilla de pollo',
    sub: 'Crujiente, con mozzarella',
    slots: ['cena'],
    familia: 'pollo',
    min: 14,
    ing: [
      { a: 'tortilla', g: 72, nota: '2 tortillas' },
      { a: 'pollo', g: 140, rol: 'prot', min: 120, max: 190, nota: 'en tiras' },
      { a: 'mozzarella', g: 35 },
      R1,
      { a: 'cottage', g: 40, nota: 'para mojar' },
      { a: 'especias', g: 0, nota: 'pimentón, comino' },
      YOG
    ],
    pasos: [
      VERDURA_PASO,
      'Pollo con especias, 6 min con la verdura.',
      'Tortilla, mozzarella, relleno, más mozzarella y la otra tortilla encima.',
      'Sartén sin aceite 2 min por lado (o airfryer 200 ºC 5 min). Corta en triángulos.'
    ],
    dibujo: 'quesadilla',
    fondo: '#F2D49C'
  },
  {
    id: 'tacos',
    titulo: 'Tacos de ternera',
    sub: 'Picada especiada en tortilla integral',
    slots: ['cena'],
    familia: 'ternera',
    min: 14,
    ing: [
      { a: 'tortilla', g: 72, rol: 'hc', min: 72, max: 108, nota: '2-3 tortillas' },
      { a: 'picada', g: 150, rol: 'prot', min: 120, max: 190 },
      R1,
      { a: 'tomate', g: 50, nota: 'en dados' },
      { a: 'cottage', g: 40, nota: 'por encima' },
      { a: 'especias', g: 0, nota: 'pimentón, comino, ajo' },
      YOG
    ],
    pasos: [
      VERDURA_PASO,
      'Añade la carne con pimentón, comino, ajo y sal. 5 min deshaciéndola.',
      'Tortillas calientes, carne, tomate en dados y una cucharada de cottage.'
    ],
    dibujo: 'tacos',
    fondo: '#F0C9A2'
  },
  {
    id: 'patata-rellena',
    titulo: 'Patata rellena de atún',
    sub: 'Gratinada. De despensa',
    slots: ['cena', 'comida'],
    familia: 'atun',
    min: 15,
    etiquetas: ['despensa', 'airfryer'],
    ing: [
      { a: 'patata', g: 300, rol: 'hc', min: 200, max: 450 },
      { a: 'atun', g: 112, rol: 'prot', min: 112, max: 168, nota: '2 latas' },
      { a: 'cottage', g: 50 },
      { a: 'mozzarella', g: 30 },
      R1,
      YOG
    ],
    pasos: [
      'Patatas al microondas 8 min. Ábrelas y chafa el interior con un tenedor.',
      'Mezcla el interior con atún, cottage, sal y pimienta. Rellena.',
      'Mozzarella encima y airfryer 200 ºC 4-5 min.',
      VERDURA_PASO
    ],
    airfryer: { temp: 200, tiempo: '4-5 min', nota: 'gratinar' },
    dibujo: 'patata-rellena',
    fondo: '#EBD3A8'
  },
  {
    id: 'huevos-rotos',
    titulo: 'Huevos rotos con jamón',
    sub: 'Patatas de airfryer y verdura',
    slots: ['cena'],
    familia: 'huevo',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'patata', g: 200, rol: 'hc', min: 150, max: 350 },
      { a: 'huevo', g: 180, nota: '3 huevos' },
      { a: 'jamon', g: 40, rol: 'prot', min: 30, max: 60 },
      R1,
      ACEITE(5),
      YOG
    ],
    pasos: [
      'Patatas al microondas 6 min, en rodajas gruesas y airfryer 200 ºC 8 min con 1 cucharadita de aceite.',
      VERDURA_PASO,
      'Huevos a la plancha tapados 2-3 min (yema líquida).',
      'Plato: patatas, verdura, huevos encima y jamón. Rompe las yemas al servir.'
    ],
    truco: 'Si los huevos te cuestan, hazlos revueltos: misma cuenta.',
    dibujo: 'huevos-rotos',
    fondo: '#F5DFA0'
  }
];

export const RECETA: Record<string, Receta> = Object.fromEntries(RECETAS.map((r) => [r.id, r]));

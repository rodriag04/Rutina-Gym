import type { Receta } from '../lib/tipos';

// Recetas de Rodri (datos/recetas.json y su plan del 16-20 nov), con sus pasos y trucos.
// Las cantidades son la ración normal; el plan escala la proteína (prot) y los hidratos (hc)
// dentro de [min, max] para cuadrar cada día. Lo de "pásalo del congelador la noche antes"
// no va en los pasos: lo pone la agenda del congelador según el día.

const R1 = { a: 'verdura', g: 200, rol: 'veg' as const, nota: '1 ración' };
const YOG = { a: 'yogur', g: 120, rol: 'extra' as const, nota: 'de postre' };
const ONZA = { a: 'chocolate', g: 10, rol: 'extra' as const, nota: 'de postre' };
const NOTA_ACEITE: Record<number, string> = { 3: 'unas gotas', 5: '1 cucharadita', 10: '1 cucharada' };
const ACEITE = (g: number, nota = NOTA_ACEITE[g]) => ({ a: 'aceite', g, rol: 'grasa' as const, nota });
const NUECES = { a: 'nueces', g: 30, rol: 'grasa' as const, descanso: 40 };
const VERDURA = 'Saltea las verduras: sartén a fuego medio-alto con unas gotas de aceite, la verdura directamente congelada, 8-10 min hasta que se evapore el agua y empiece a dorarse. La sal, al final.';

export const RECETAS: Receta[] = [
  // ───────────── Desayunos: bocadillo ─────────────
  {
    id: 'boc-pavo',
    titulo: 'Bocadillo de pavo',
    sub: 'Pan integral y pechuga de pavo',
    slots: ['desayuno'],
    familia: 'pavo',
    min: 3,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'pavo-fiambre', g: 100, rol: 'prot', min: 80, max: 130 }
    ],
    pasos: ['Abre el pan integral por la mitad.', 'Reparte las lonchas de pavo por todo el pan.', 'Envuélvelo en papel de aluminio la noche antes y guárdalo en la nevera.'],
    truco: 'Busca uno con un 90 % de carne o más. Los más baratos llevan menos pavo y más relleno.',
    dibujo: 'bocadillo-pavo',
    fondo: '#F3D9B1'
  },
  {
    id: 'boc-jamon',
    titulo: 'Bocadillo de jamón',
    sub: 'Pan integral y jamón serrano',
    slots: ['desayuno'],
    familia: 'jamon',
    min: 3,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'jamon', g: 80, rol: 'prot', min: 60, max: 100 }
    ],
    pasos: ['Abre el pan integral por la mitad.', 'Reparte las lonchas de jamón por todo el pan. Mira el peso en el sobre para no pasarte.', 'Envuélvelo en papel de aluminio la noche antes.'],
    truco: 'Si le untas un poco de tomate triturado por dentro, queda más jugoso y casi no suma calorías.',
    dibujo: 'bocadillo-jamon',
    fondo: '#F1C9B8'
  },
  {
    id: 'boc-lomo',
    titulo: 'Bocadillo de lomo embuchado',
    sub: 'Pan integral y lomo',
    slots: ['desayuno'],
    familia: 'lomo-emb',
    min: 3,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'lomo-emb', g: 60, rol: 'prot', min: 50, max: 80, nota: '10-12 lonchas finas' }
    ],
    pasos: ['Abre el pan integral por la mitad.', 'Reparte el lomo embuchado en lonchas finas.', 'Envuélvelo en papel de aluminio la noche antes.'],
    truco: 'El lomo embuchado es de los embutidos con más proteína y menos grasa, pero lleva mucha sal. Una vez por semana está bien.',
    dibujo: 'bocadillo-lomo',
    fondo: '#EBC3BE'
  },
  {
    id: 'boc-pollo',
    titulo: 'Bocadillo de pollo asado',
    sub: 'Pan integral y pechuga asada en lonchas',
    slots: ['desayuno'],
    familia: 'pollo',
    min: 3,
    etiquetas: ['bocadillo'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'pollo-asado', g: 120, rol: 'prot', min: 90, max: 150 }
    ],
    pasos: ['Abre el pan integral por la mitad.', 'Reparte las lonchas de pechuga de pollo asada.', 'Envuélvelo en papel de aluminio la noche antes y guárdalo en la nevera.'],
    truco: 'Busca la pechuga asada en lonchas con más del 90 % de carne. Es igual de magra que el pavo y cambia el sabor.',
    dibujo: 'bocadillo-pollo',
    fondo: '#F2DDB4'
  },
  {
    id: 'boc-casa',
    titulo: 'Bocadillo con lo que tengas en casa',
    sub: 'Pavo, jamón o lomo: el del lunes antes de la compra',
    slots: ['desayuno'],
    familia: 'jamon',
    min: 3,
    etiquetas: ['bocadillo', 'despensa'],
    ing: [
      { a: 'pan', g: 80, rol: 'hc', min: 70, max: 100 },
      { a: 'jamon', g: 80, nota: 'o 100 g de pavo, o 60 g de lomo' }
    ],
    pasos: [
      'Usa el pan y el embutido que tengas en casa o que te traigas de Cabra: pavo, jamón o lomo.',
      'Unos 80 g de pan y, de embutido, 100 g si es pavo, 80 g si es jamón o 60 g si es lomo.',
      'Hazlo el domingo por la noche y guárdalo en la nevera envuelto en papel de aluminio.'
    ],
    truco: 'Si no tienes nada en casa, cómprate un bocadillo de pavo o de jamón en la cafetería. Es lo más parecido.',
    dibujo: 'bocadillo-jamon',
    fondo: '#E9D3C0'
  },

  // ───────────── Desayunos en casa ─────────────
  {
    id: 'desayuno-huevos',
    titulo: 'Huevos revueltos con tostada',
    sub: 'Y arándanos. En casa, 2 h antes del gym',
    slots: ['desayuno'],
    familia: 'huevo',
    min: 8,
    etiquetas: ['casa'],
    ing: [
      { a: 'huevo', g: 120, nota: '2 huevos' },
      { a: 'pan', g: 60, rol: 'hc', min: 50, max: 100, nota: 'tostado' },
      { a: 'pavo-fiambre', g: 40, rol: 'prot', min: 30, max: 80, nota: 'en tiras, con los huevos' },
      { a: 'arandanos', g: 100 },
      ACEITE(3)
    ],
    pasos: [
      'Saca los arándanos del congelador al levantarte, o dales 40 segundos de micro.',
      'Bate los huevos con una pizca de sal.',
      'Sartén antiadherente a fuego medio-bajo con unas gotas de aceite. Echa el pavo en tiras 30 s y luego los huevos; remueve con la espátula sin parar 2 minutos. Apágalo cuando aún estén un poco jugosos.',
      'Tuesta el pan y sírvelo todo junto.'
    ],
    truco: 'Desayunando 2 horas antes del gym te da tiempo de sobra a digerir los huevos. El pan es lo que te da energía para entrenar.',
    dibujo: 'desayuno-huevos',
    fondo: '#F5E3A3'
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
      { a: 'huevo', g: 120, nota: '2 huevos' },
      { a: 'jamon', g: 40, rol: 'prot', min: 30, max: 60, nota: 'en tiras' },
      { a: 'pan', g: 60, rol: 'hc', min: 50, max: 100, nota: 'tostado' },
      ACEITE(3)
    ],
    pasos: [
      'Tuesta el pan (airfryer 180 ºC 3 min, o tostadora).',
      'Sartén a fuego medio-bajo con unas gotas de aceite. Echa el jamón 30 s.',
      'Bate los huevos con una pizca de sal, échalos y remueve sin parar con la espátula.',
      'Apaga el fuego cuando aún estén algo jugosos: terminan de hacerse solos.'
    ],
    truco: 'Es la forma más fácil de hacer huevos: no hay que darles la vuelta ni que queden bonitos.',
    dibujo: 'revuelto',
    fondo: '#F5DE96'
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
    min: 1,
    ing: [{ a: 'platano', g: 120, nota: '1 plátano' }],
    pasos: ['Cómetelo entre 30 y 45 minutos antes de entrenar.', 'Si notas pesadez en el gym, prueba con medio.'],
    truco: 'Si un día no tienes plátano: 40 g de pan con 2 lonchas de pavo, o 3 tortitas de maíz con 1 cucharada rasa de miel.',
    dibujo: 'platano',
    fondo: '#F6E7A6'
  },

  // ───────────── Comidas y cenas ─────────────
  {
    id: 'taper-mama',
    titulo: 'Táper de mamá',
    sub: 'Pollo a la plancha, patatas y verduras',
    slots: ['comida'],
    familia: 'pollo',
    min: 3,
    fija: true,
    etiquetas: ['taper'],
    ing: [{ a: 'pollo', g: 200, nota: 'como dos palmas de tu mano' }, { a: 'patata', g: 350 }, R1, ACEITE(5)],
    pasos: [
      'Saca del táper tu ración: unos 200 g de pollo (como dos palmas de tu mano) y unos 350 g de patata.',
      'Caliéntalo 2-3 minutos en el micro, removiendo a la mitad.',
      'Si quieres la patata crujiente, pásala después 5 minutos por la airfryer a 200 ºC.'
    ],
    truco: 'Las calorías del táper son aproximadas porque no sabemos el aceite que lleva. Lo importante es que las raciones de pollo y patata se parezcan a estas.',
    dibujo: 'taper',
    fondo: '#D9E4C8'
  },
  {
    id: 'pollo-patata',
    titulo: 'Pollo en airfryer con patatas',
    sub: 'Pechuga entera, patata y verduras',
    slots: ['cena', 'comida'],
    familia: 'pollo',
    min: 20,
    etiquetas: ['airfryer'],
    ing: [{ a: 'pollo', g: 200, rol: 'prot', min: 160, max: 240 }, { a: 'patata', g: 300, rol: 'hc', min: 150, max: 450 }, R1, ACEITE(5), YOG],
    pasos: [
      'Patatas al micro el tiempo del paquete.',
      'Aplana un poco la pechuga para que tenga el mismo grosor. Sal, pimienta y la cucharadita de aceite por encima.',
      'Airfryer precalentada a 180 ºC, 14-18 minutos, dándole la vuelta a mitad. Déjala reposar 3 minutos antes de cortarla.',
      VERDURA,
      'De postre, el yogur.'
    ],
    truco: 'Es la cena de después del gym: proteína y patata para recuperar.',
    airfryer: { temp: 180, tiempo: '14-18 min', nota: 'vuelta a mitad, reposo 3 min' },
    dibujo: 'pollo-patata',
    fondo: '#F3DDB0'
  },
  {
    id: 'solomillo-arroz',
    titulo: 'Solomillo con arroz',
    sub: 'Medallones en airfryer',
    slots: ['cena', 'comida'],
    familia: 'cerdo',
    min: 20,
    etiquetas: ['airfryer'],
    ing: [{ a: 'solomillo', g: 180, rol: 'prot', min: 150, max: 230 }, { a: 'arroz', g: 190, rol: 'hc', min: 125, max: 310 }, R1, ACEITE(5), YOG],
    pasos: [
      'Corta el solomillo en medallones de 2-3 cm. Sécalos, échales sal y pimienta y píntalos con la cucharadita de aceite.',
      'Precalienta la airfryer 3 minutos a 200 ºC. Medallones en una sola capa, 8-10 minutos, dándoles la vuelta a mitad.',
      'Mientras, calienta el arroz en el micro y saltea las verduras.',
      'Deja reposar la carne 3 minutos antes de cortarla. De postre, el yogur.'
    ],
    truco: 'El solomillo de cerdo es tan magro como la pechuga de pollo. Si por dentro queda un poco rosado, está en su punto (63 ºC) y no se seca.',
    airfryer: { temp: 200, tiempo: '8-10 min', nota: 'vuelta a mitad' },
    dibujo: 'solomillo-arroz',
    fondo: '#EBCDB0'
  },
  {
    id: 'solomillo',
    titulo: 'Solomillo con patatas',
    sub: 'Pimentón, ajo y patatas tostadas',
    slots: ['comida', 'cena'],
    familia: 'cerdo',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [{ a: 'solomillo', g: 180, rol: 'prot', min: 150, max: 230 }, { a: 'patata', g: 300, rol: 'hc', min: 150, max: 450 }, R1, ACEITE(5), { a: 'especias', g: 0, nota: 'pimentón y ajo en polvo' }],
    pasos: [
      'Patatas al micro el tiempo del paquete.',
      'Medallones de 2-3 cm con sal, pimentón, ajo en polvo y la cucharadita de aceite. Airfryer a 200 ºC, 8-10 minutos, vuelta a mitad. Mete las patatas al lado los últimos 5 minutos para que se tuesten.',
      VERDURA
    ],
    truco: 'El pimentón y el ajo en polvo le dan mucho sabor sin sumar calorías. Con poca grasa y mucha patata, 90 minutos antes del gym llegas con energía y sin pesadez.',
    airfryer: { temp: 200, tiempo: '8-10 min', nota: 'patatas al lado los últimos 5 min' },
    dibujo: 'solomillo',
    fondo: '#E9C6A6'
  },
  {
    id: 'bolonesa',
    titulo: 'Pasta boloñesa',
    sub: 'Carne picada, tomate y verdura',
    slots: ['comida', 'cena'],
    familia: 'ternera',
    min: 20,
    ing: [
      { a: 'pasta', g: 110, rol: 'hc', min: 70, max: 150, nota: 'en seco' },
      { a: 'picada', g: 150, rol: 'prot', min: 120, max: 200 },
      { a: 'triturado', g: 100 },
      R1,
      { a: 'especias', g: 0, nota: 'orégano' }
    ],
    pasos: [
      'Pon agua a hervir con sal y cuece la pasta el tiempo del paquete.',
      'En una sartén sin aceite, dora la carne picada 5 minutos deshaciéndola con la cuchara. Si suelta mucha grasa, quítala con papel de cocina.',
      'Añade las verduras y el tomate triturado, con sal, pimienta y orégano. 5 minutos a fuego bajo.',
      'Escurre la pasta y mézclala con la salsa en la misma sartén.'
    ],
    truco: 'Si el tomate queda ácido: 5 minutos más a fuego bajo. Si sigue ácido, una pizca de bicarbonato (lo que cabe en la punta de un cuchillo).',
    dibujo: 'bolonesa',
    fondo: '#F2C7A5'
  },
  {
    id: 'salmon-patata',
    titulo: 'Salmón con patatas',
    sub: 'Airfryer, sin aceite',
    slots: ['cena', 'comida'],
    familia: 'salmon',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [{ a: 'salmon', g: 150, rol: 'prot', min: 130, max: 200 }, { a: 'patata', g: 250, rol: 'hc', min: 150, max: 400 }, R1, YOG],
    pasos: [
      'Patatas al micro el tiempo del paquete.',
      'Seca el salmón y échale sal. Sin aceite: ya tiene su grasa.',
      'Airfryer precalentada a 180 ºC, 9-11 minutos, con la piel hacia abajo y sin darle la vuelta.',
      'Saltea las verduras y emplata. De postre, el yogur.'
    ],
    truco: 'Está hecho cuando se separa en láminas con el tenedor. Si te pasas de tiempo, queda seco.',
    airfryer: { temp: 180, tiempo: '9-11 min', nota: 'piel abajo, sin dar la vuelta, sin aceite' },
    dibujo: 'salmon-patata',
    fondo: '#F6C9A8'
  },
  {
    id: 'poke-salmon',
    titulo: 'Bol de salmón con arroz',
    sub: 'Arroz, verduras y un chorrito de soja',
    slots: ['cena', 'comida'],
    familia: 'salmon',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [{ a: 'salmon', g: 150, rol: 'prot', min: 130, max: 200 }, { a: 'arroz', g: 125, rol: 'hc', min: 90, max: 250 }, R1, { a: 'soja', g: 10 }, ONZA],
    pasos: [
      'Seca el salmón, échale sal y ponlo con la piel hacia abajo. Airfryer precalentada a 180 ºC, 9-11 minutos, sin darle la vuelta.',
      'Calienta el arroz y saltea las verduras.',
      'Monta el bol: arroz, verduras, el salmón en trozos y un chorrito de soja por encima.',
      'De postre, la onza de chocolate.'
    ],
    truco: 'Está hecho cuando se separa en láminas al apretarlo con el tenedor. Si te pasas de tiempo, queda seco.',
    airfryer: { temp: 180, tiempo: '9-11 min', nota: 'piel abajo, sin dar la vuelta' },
    dibujo: 'poke',
    fondo: '#F3C3AE'
  },
  {
    id: 'salmon-teriyaki',
    titulo: 'Salmón teriyaki con arroz',
    sub: 'Soja y miel caramelizadas',
    slots: ['comida', 'cena'],
    familia: 'salmon',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'salmon', g: 150, rol: 'prot', min: 130, max: 200 },
      { a: 'arroz', g: 190, rol: 'hc', min: 125, max: 310 },
      R1,
      { a: 'soja', g: 15, nota: '1 cucharada' },
      { a: 'miel', g: 7, nota: '1 cucharadita' },
      YOG
    ],
    pasos: [
      'Mezcla la cucharada de salsa de soja con la cucharadita de miel.',
      'Seca el salmón y píntalo con la mezcla.',
      'Airfryer precalentada a 180 ºC, 9-11 minutos, con la piel hacia abajo y sin darle la vuelta. A mitad, píntalo otra vez con lo que sobre.',
      'Calienta el arroz y saltea una ración de verduras.',
      'De postre, el yogur.'
    ],
    truco: 'La miel con la soja se carameliza por fuera. Una cucharadita son unas 20 kcal: no cambia nada en tu dieta.',
    airfryer: { temp: 180, tiempo: '9-11 min', nota: 'piel abajo; píntalo otra vez a mitad' },
    dibujo: 'salmon-teriyaki',
    fondo: '#EFC7A0'
  },
  {
    id: 'gnocchi-salmon',
    titulo: 'Gnocchi con salmón y salsa de limón',
    sub: 'Cremoso con cottage, sin nata',
    slots: ['comida'],
    familia: 'salmon',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'gnocchi', g: 200, rol: 'hc', min: 150, max: 300 },
      { a: 'salmon', g: 150, rol: 'prot', min: 130, max: 190, nota: 'en dados' },
      R1,
      { a: 'cottage', g: 30 },
      ACEITE(5),
      { a: 'limon', g: 0, nota: 'unas gotas' }
    ],
    pasos: [
      'Corta el salmón en dados y échale sal y pimienta. Airfryer a 180 ºC, 7-8 minutos.',
      'Mientras, sartén con la cucharadita de aceite a fuego medio-alto. Dora los gnocchi 4-5 minutos. Si el paquete dice que hay que hervirlos, hiérvelos antes 2 minutos.',
      'Añade las verduras, el cottage, un chorrito de agua y unas gotas de limón. Remueve 1 minuto hasta que quede cremoso.',
      'Mezcla con el salmón y listo.'
    ],
    truco: 'El cottage con limón hace de salsa cremosa sin nata.',
    airfryer: { temp: 180, tiempo: '7-8 min', nota: 'salmón en dados' },
    dibujo: 'gnocchi-salmon',
    fondo: '#F4D7BC'
  },
  {
    id: 'gnocchi-atun',
    titulo: 'Gnocchi con atún y tomate',
    sub: 'De despensa',
    slots: ['comida', 'cena'],
    familia: 'atun',
    min: 12,
    etiquetas: ['despensa'],
    ing: [
      { a: 'gnocchi', g: 200, rol: 'hc', min: 150, max: 300 },
      { a: 'atun', g: 112, rol: 'prot', min: 112, max: 168, nota: '2 latas' },
      { a: 'triturado', g: 100 },
      R1,
      ACEITE(10)
    ],
    pasos: [
      'Mira el paquete: si los gnocchi se pueden hacer en sartén, échalos directamente. Si no, hiérvelos hasta que floten (unos 2 minutos) y escúrrelos.',
      'Sartén con la cucharada de aceite a fuego medio-alto. Dora los gnocchi 4-5 minutos, moviéndolos.',
      'Añade las verduras y el tomate triturado. 2 minutos más.',
      'Apaga el fuego, echa el atún escurrido y mézclalo sin romperlo mucho.'
    ],
    truco: 'El atún va al final y con el fuego apagado. Si lo cocinas, se seca.',
    dibujo: 'gnocchi-atun',
    fondo: '#F2CDB0'
  },
  {
    id: 'burger',
    titulo: 'Hamburguesa casera',
    sub: 'Con patatas y salsa de cottage',
    slots: ['comida', 'cena'],
    familia: 'ternera',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'picada', g: 150, rol: 'prot', min: 130, max: 190 },
      { a: 'pan-burger', g: 75, nota: '1 pan' },
      { a: 'patata', g: 200, rol: 'hc', min: 100, max: 350 },
      R1,
      { a: 'cottage', g: 30, nota: 'como salsa' }
    ],
    pasos: [
      'Patatas al micro el tiempo del paquete.',
      'Sal y pimienta a la carne y haz una hamburguesa de 1,5 cm de grosor, un poco más ancha que el pan. Hazle un hoyo con el pulgar en el centro.',
      'Airfryer precalentada a 190 ºC: 10-12 minutos, vuelta a mitad. Mete las patatas al lado los últimos 5 minutos.',
      'Tuesta el pan 1 minuto y monta: pan, hamburguesa, las verduras calientes encima y el cottage como salsa.'
    ],
    truco: 'El hoyo del centro evita que se hinche como una pelota y hace que se cocine igual por todas partes.',
    airfryer: { temp: 190, tiempo: '10-12 min', nota: 'hoyo en el centro, vuelta a mitad' },
    dibujo: 'burger',
    fondo: '#F2CFA0'
  },
  {
    id: 'lubina-arroz',
    titulo: 'Lubina en airfryer con arroz',
    sub: 'Piel crujiente y limón',
    slots: ['cena', 'comida'],
    familia: 'lubina',
    min: 12,
    etiquetas: ['airfryer'],
    ing: [{ a: 'lubina', g: 200, rol: 'prot', min: 170, max: 250 }, { a: 'arroz', g: 125, rol: 'hc', min: 90, max: 250 }, R1, ACEITE(10, '2 cucharaditas'), { a: 'limon', g: 0, nota: 'unas gotas' }, YOG],
    pasos: [
      'Seca bien la lubina, échale sal y una cucharadita de aceite por encima.',
      'Airfryer precalentada a 180 ºC, 8-10 minutos, con la piel hacia abajo sobre un papel recortado a su tamaño. Sin darle la vuelta.',
      'Calienta el arroz y saltea las verduras. Échale al pescado unas gotas de limón y la otra cucharadita de aceite en crudo.',
      'De postre, el yogur.'
    ],
    truco: 'El papel, solo debajo y recortado. Si sube por las paredes, corta el aire y el pescado no se dora.',
    airfryer: { temp: 180, tiempo: '8-10 min', nota: 'piel abajo sobre papel recortado' },
    dibujo: 'lubina-arroz',
    fondo: '#CFE0E4'
  },
  {
    id: 'lubina-patata',
    titulo: 'Lubina con patatas',
    sub: 'Airfryer, piel crujiente',
    slots: ['comida', 'cena'],
    familia: 'lubina',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [{ a: 'lubina', g: 200, rol: 'prot', min: 170, max: 250 }, { a: 'patata', g: 280, rol: 'hc', min: 150, max: 400 }, R1, ACEITE(10, '2 cucharaditas'), { a: 'limon', g: 0, nota: 'unas gotas' }],
    pasos: [
      'Patatas al micro el tiempo del paquete y pártelas.',
      'Seca la lubina, sal y una cucharadita de aceite. Airfryer 180 ºC, 8-10 min, con la piel abajo sobre papel recortado, sin darle la vuelta. Las patatas al lado los últimos 5 min.',
      VERDURA,
      'Unas gotas de limón y la otra cucharadita de aceite en crudo.'
    ],
    truco: 'El papel, solo debajo y recortado. Si sube por las paredes, corta el aire y el pescado no se dora.',
    airfryer: { temp: 180, tiempo: '8-10 min', nota: 'piel abajo sobre papel recortado' },
    dibujo: 'lubina',
    fondo: '#D3E2DF'
  },
  {
    id: 'lomo-arroz',
    titulo: 'Lomo de cerdo en airfryer con arroz',
    sub: 'Filetes de cinta con pimentón',
    slots: ['comida', 'cena'],
    familia: 'cerdo',
    min: 12,
    etiquetas: ['airfryer'],
    ing: [{ a: 'cinta', g: 180, rol: 'prot', min: 150, max: 230 }, { a: 'arroz', g: 125, rol: 'hc', min: 90, max: 250 }, R1, ACEITE(5), ONZA],
    pasos: [
      'Seca los filetes y échales sal, pimentón y la cucharadita de aceite.',
      'Airfryer precalentada a 200 ºC, 6-8 minutos, dándoles la vuelta a mitad.',
      'Calienta el arroz y saltea las verduras. De postre, la onza de chocolate.'
    ],
    truco: 'La cinta de lomo es de lo más magro del cerdo. Si te pasas de tiempo queda seca: mejor un poco rosada por dentro.',
    airfryer: { temp: 200, tiempo: '6-8 min', nota: 'vuelta a mitad' },
    dibujo: 'lomo-arroz',
    fondo: '#EDD3B4'
  },
  {
    id: 'cinta-patata',
    titulo: 'Lomo a la plancha con patatas',
    sub: 'Filetes de cinta y patatas tostadas',
    slots: ['comida', 'cena'],
    familia: 'cerdo',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [{ a: 'cinta', g: 180, rol: 'prot', min: 150, max: 230 }, { a: 'patata', g: 250, rol: 'hc', min: 150, max: 400 }, R1, ACEITE(5), YOG],
    pasos: [
      'Patatas al micro el tiempo del paquete y 5-8 min en la airfryer a 200 ºC para tostarlas.',
      'Filetes con sal, ajo y pimentón. Airfryer 200 ºC 6-8 min, vuelta a mitad.',
      VERDURA,
      'De postre, el yogur.'
    ],
    truco: 'Mejor un poco rosado por dentro: si te pasas, queda seco.',
    airfryer: { temp: 200, tiempo: '6-8 min', nota: 'vuelta a mitad' },
    dibujo: 'cinta',
    fondo: '#EDCDB0'
  },
  {
    id: 'pasta-atun',
    titulo: 'Macarrones con atún gratinados',
    sub: 'De despensa, con mozzarella',
    slots: ['comida', 'cena'],
    familia: 'atun',
    min: 20,
    etiquetas: ['despensa', 'airfryer'],
    ing: [
      { a: 'pasta', g: 100, rol: 'hc', min: 70, max: 150, nota: 'macarrones, en seco' },
      { a: 'atun', g: 112, rol: 'prot', min: 112, max: 168, nota: '2 latas' },
      { a: 'triturado', g: 100 },
      R1,
      { a: 'mozzarella', g: 30 },
      { a: 'especias', g: 0, nota: 'orégano' }
    ],
    pasos: [
      'Cuece los macarrones en agua con sal el tiempo del paquete.',
      'Mientras, saltea en una sartén las verduras con el tomate triturado, 3 minutos, con sal y orégano.',
      'Escurre la pasta, échala a la sartén, apaga el fuego y añade el atún escurrido.',
      'Pásalo a un recipiente que quepa en la airfryer, echa la mozzarella por encima y gratina 4-5 minutos a 200 ºC.'
    ],
    truco: 'Si no tienes recipiente para la airfryer, echa la mozzarella en la sartén, tápala y espera 1 minuto a que se funda.',
    airfryer: { temp: 200, tiempo: '4-5 min', nota: 'gratinar' },
    dibujo: 'macarrones',
    fondo: '#F2D0A8'
  },
  {
    id: 'curry-pollo',
    titulo: 'Pollo al curry con arroz',
    sub: 'El cottage hace de nata',
    slots: ['comida', 'cena'],
    familia: 'pollo',
    min: 15,
    ing: [
      { a: 'pollo', g: 180, rol: 'prot', min: 150, max: 230, nota: 'en dados' },
      { a: 'arroz', g: 190, rol: 'hc', min: 125, max: 310 },
      R1,
      { a: 'cottage', g: 50 },
      ACEITE(10),
      { a: 'especias', g: 0, nota: '1 cucharadita de curry' }
    ],
    pasos: [
      'Corta el pollo en dados y échale sal.',
      'Sartén a fuego alto con la cucharada de aceite. Dora el pollo 5 minutos.',
      'Añade las verduras y la cucharadita de curry en polvo. Remueve 1 minuto.',
      'Baja el fuego, añade el cottage y un chorrito de agua. Remueve 2 minutos hasta que quede una salsa cremosa.',
      'Calienta el arroz y sirve el curry al lado.'
    ],
    truco: 'El cottage hace de nata, pero con mucha más proteína y menos grasa.',
    dibujo: 'curry',
    fondo: '#F4D58D'
  },
  {
    id: 'pizza-wrap',
    titulo: 'Pizzas wrap de pavo',
    sub: 'Tortilla integral gratinada en airfryer',
    slots: ['comida', 'cena'],
    familia: 'pavo',
    min: 12,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'tortilla', g: 72, nota: '2 tortillas' },
      { a: 'triturado', g: 60 },
      { a: 'pavo-fiambre', g: 120, rol: 'prot', min: 90, max: 160, nota: 'en tiras' },
      R1,
      { a: 'mozzarella', g: 50 },
      { a: 'especias', g: 0, nota: 'orégano' }
    ],
    pasos: [
      'Precalienta la airfryer a 200 ºC.',
      'Pon cada tortilla sobre un papel de horno recortado a su tamaño y extiende el tomate, dejando un borde.',
      'Reparte las verduras, el pavo en tiras y la mozzarella.',
      'Airfryer 6-8 minutos, hasta que se funda el queso y el borde quede crujiente. Si no caben las dos, hazlas en dos tandas.'
    ],
    truco: 'Si la tortilla se infla, pínchala un par de veces con un tenedor antes de meterla.',
    airfryer: { temp: 200, tiempo: '6-8 min', nota: 'una tortilla cada vez' },
    dibujo: 'pizza-wrap',
    fondo: '#F4C9A0'
  },
  {
    id: 'albondigas',
    titulo: 'Albóndigas con tomate y arroz',
    sub: 'En airfryer, sin freír',
    slots: ['comida', 'cena'],
    familia: 'ternera',
    min: 25,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'picada', g: 150, rol: 'prot', min: 130, max: 200 },
      { a: 'pan-rallado', g: 8, nota: '1 cucharada' },
      { a: 'arroz', g: 160, rol: 'hc', min: 125, max: 310 },
      { a: 'triturado', g: 100 },
      R1,
      { a: 'especias', g: 0, nota: 'ajo en polvo, orégano' },
      YOG
    ],
    pasos: [
      'Mezcla la carne con sal, pimienta, ajo en polvo y la cucharada de pan rallado. Haz 8-10 bolitas.',
      'Airfryer precalentada a 190 ºC, 8-10 minutos, agitando la cesta a mitad.',
      'Mientras, calienta en una sartén el tomate triturado con la ración de verduras, 5 minutos, con sal y orégano.',
      'Echa las albóndigas a la salsa 2 minutos y sírvelas con el arroz. De postre, el yogur.'
    ],
    truco: 'En la airfryer no hace falta freírlas: sueltan su grasa y quedan doradas por fuera.',
    airfryer: { temp: 190, tiempo: '8-10 min', nota: 'agitar a mitad' },
    dibujo: 'albondigas',
    fondo: '#F0BFA0'
  },
  {
    id: 'kebab',
    titulo: 'Kebab de pollo con patatas',
    sub: 'Pita, salsa de yogur y gajos',
    slots: ['comida', 'cena'],
    familia: 'pollo',
    min: 20,
    etiquetas: ['airfryer'],
    ing: [
      { a: 'pollo', g: 180, rol: 'prot', min: 150, max: 230, nota: 'en tiras' },
      { a: 'pita', g: 110, nota: '2 panes' },
      { a: 'patata', g: 150, rol: 'hc', min: 75, max: 300 },
      R1,
      { a: 'yogur', g: 120, nota: 'para la salsa' },
      ACEITE(5),
      { a: 'especias', g: 0, nota: 'comino, pimentón, ajo, orégano' }
    ],
    pasos: [
      'Corta el pollo en tiras y mézclalo con sal, comino, pimentón, ajo en polvo, orégano y la cucharadita de aceite.',
      'Patatas al micro y córtalas en gajos. Mételas en la airfryer a 200 ºC con el pollo, 10-12 minutos, agitando a mitad.',
      'Salsa: el yogur con ajo en polvo, sal y unas gotas de limón.',
      'Calienta las pitas 1 minuto, ábrelas y rellénalas con el pollo, las verduras y la salsa. Las patatas, al lado.'
    ],
    truco: 'La salsa de yogur sustituye a la salsa blanca del kebab: tiene la mitad de grasa y más proteína.',
    airfryer: { temp: 200, tiempo: '10-12 min', nota: 'pollo y gajos juntos, agitar a mitad' },
    dibujo: 'kebab',
    fondo: '#EFD7B0'
  },
  {
    id: 'burrito-ternera',
    titulo: 'Burritos de ternera',
    sub: 'Con comino y cottage como nata agria',
    slots: ['cena', 'comida'],
    familia: 'ternera',
    min: 12,
    ing: [
      { a: 'tortilla', g: 72, rol: 'hc', min: 72, max: 108, nota: '2 tortillas' },
      { a: 'picada', g: 150, rol: 'prot', min: 120, max: 190 },
      R1,
      { a: 'cottage', g: 30 },
      { a: 'especias', g: 0, nota: 'comino y pimentón' },
      YOG
    ],
    pasos: [
      'Echa la carne en una sartén sin aceite a fuego medio-alto. Deshazla con la cuchara y añade sal, comino y pimentón.',
      'Cuando esté dorada (5 minutos), quita la grasa que haya soltado con papel de cocina.',
      'Añade las verduras y mezcla 2 minutos.',
      'Calienta las tortillas 20 segundos por cada lado en otra sartén sin aceite, rellénalas, pon el cottage encima como si fuera nata agria y enróllalas.'
    ],
    truco: 'El comino es lo que le da el sabor a burrito mexicano.',
    dibujo: 'burrito-ternera',
    fondo: '#F0C9A2'
  },
  {
    id: 'fajitas',
    titulo: 'Fajitas de pollo',
    sub: 'Tiras doradas y cottage',
    slots: ['cena', 'comida'],
    familia: 'pollo',
    min: 15,
    ing: [
      { a: 'tortilla', g: 72, rol: 'hc', min: 72, max: 108, nota: '2 tortillas' },
      { a: 'pollo', g: 160, rol: 'prot', min: 130, max: 210, nota: 'en tiras finas' },
      R1,
      { a: 'cottage', g: 30 },
      ACEITE(5),
      { a: 'especias', g: 0, nota: 'pimentón y una pizca de comino' },
      YOG
    ],
    pasos: [
      'Corta el pollo en tiras finas y échale sal, pimentón y una pizca de comino.',
      'Sartén a fuego alto con la cucharadita de aceite. Haz las tiras 5-6 minutos, moviéndolas, hasta que se doren.',
      'Añade las verduras y saltéalo 2 minutos con el pollo.',
      'Calienta las tortillas 20 segundos por cada lado en una sartén sin aceite, rellénalas, reparte el cottage y enróllalas.'
    ],
    truco: 'El cottage hace de salsa fresca. Con un poco de pimienta o pimentón por encima gana sabor.',
    dibujo: 'fajitas',
    fondo: '#EFD3A6'
  },
  {
    id: 'patatas-atun',
    titulo: 'Patatas con atún y cottage',
    sub: 'De despensa: no se estropea nada',
    slots: ['cena', 'comida'],
    familia: 'atun',
    min: 10,
    etiquetas: ['despensa'],
    ing: [{ a: 'patata', g: 300, rol: 'hc', min: 200, max: 450 }, { a: 'atun', g: 112, rol: 'prot', min: 112, max: 168, nota: '2 latas' }, R1, { a: 'cottage', g: 30 }, ACEITE(10), YOG],
    pasos: [
      'Patatas al micro el tiempo del paquete. Córtalas por la mitad.',
      VERDURA,
      'En el plato, mezcla las patatas con las verduras y el atún bien escurrido.',
      'Pon el cottage encima, echa la cucharada de aceite en crudo, sal, pimienta y orégano.',
      'De postre, el yogur.'
    ],
    truco: 'Todo es de despensa: si al final cenas en Cabra, no se te estropea nada.',
    dibujo: 'patatas-atun',
    fondo: '#EBD3A8'
  },
  {
    id: 'huevos-rotos',
    titulo: 'Huevos rotos con jamón',
    sub: 'Versión ligera: patata en airfryer',
    slots: ['cena'],
    familia: 'huevo',
    min: 15,
    etiquetas: ['airfryer'],
    ing: [{ a: 'patata', g: 250, rol: 'hc', min: 150, max: 400 }, { a: 'huevo', g: 120, nota: '2 huevos' }, { a: 'jamon', g: 40, rol: 'prot', min: 30, max: 60 }, R1, ACEITE(5), YOG],
    pasos: [
      'Patatas al micro el tiempo del paquete. Córtalas en trozos y pásalas 8 minutos por la airfryer a 200 ºC con sal y pimentón, para que se tuesten.',
      'Mientras, saltea las verduras en una sartén.',
      'Haz los huevos en la misma sartén con la cucharadita de aceite, a fuego medio, hasta que cuaje la clara y la yema siga líquida.',
      'Pon las patatas con las verduras, los huevos encima y el jamón en trozos. Rompe las yemas y mézclalo todo. De postre, el yogur.'
    ],
    truco: 'Es la versión ligera de los huevos rotos: patata en la airfryer en vez de frita.',
    airfryer: { temp: 200, tiempo: '8 min', nota: 'patatas ya hechas en el micro' },
    dibujo: 'huevos-rotos',
    fondo: '#F5DFA0'
  },
  {
    id: 'huevos-revuelto',
    titulo: 'Revuelto de huevos con verduras',
    sub: 'Con pan tostado',
    slots: ['cena'],
    familia: 'huevo',
    min: 8,
    ing: [{ a: 'huevo', g: 180, nota: '3 huevos' }, R1, { a: 'pan', g: 60, rol: 'hc', min: 40, max: 100 }, ACEITE(5), YOG],
    pasos: [
      'Calienta en una sartén la ración de verduras con la cucharadita de aceite, 2 minutos.',
      'Bate los huevos con una pizca de sal y échalos encima.',
      'A fuego medio-bajo, remueve con la espátula sin parar 2-3 minutos. Apágalo cuando aún esté un poco jugoso: termina de cuajarse solo.',
      'Tuesta el pan y sírvelo al lado. De postre, el yogur.'
    ],
    truco: 'Es la forma más fácil de hacer huevos: no hay que darles la vuelta ni que queden bonitos.',
    dibujo: 'huevos-revuelto',
    fondo: '#F3E0A0'
  },
  {
    id: 'huevos-patatas',
    titulo: 'Huevos revueltos con patatas',
    sub: 'Para después del gym o del fútbol',
    slots: ['cena'],
    familia: 'huevo',
    min: 12,
    ing: [{ a: 'huevo', g: 180, nota: '3 huevos' }, { a: 'patata', g: 200, rol: 'hc', min: 100, max: 350 }, R1, { a: 'pan', g: 40, nota: 'para acompañar' }, ACEITE(5), YOG],
    pasos: [
      'Patatas al micro el tiempo del paquete. Córtalas en trozos.',
      'Sartén a fuego medio con la cucharadita de aceite. Echa las patatas y la ración de verduras y dóralas 3 minutos.',
      'Bate los huevos con una pizca de sal, échalos encima y remueve con la espátula 2-3 minutos. Apágalo cuando aún esté un poco jugoso.',
      'Sírvelo con el pan. De postre, el yogur, y bebe medio litro de agua con la cena.'
    ],
    truco: 'Después de entrenar o de jugar al fútbol, el músculo necesita hidratos para recargarse. Por eso lleva patata además del pan.',
    dibujo: 'huevos-patatas',
    fondo: '#F2DA9A'
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
      VERDURA,
      'Añade el pollo en tiras, 5-6 minutos.',
      'Haz un hueco, casca el huevo y revuélvelo 1 minuto.',
      'Arroz de los vasitos (sin calentar antes) y la soja. 2 minutos a fuego fuerte removiendo.'
    ],
    truco: 'El arroz de vasito va mejor que el recién hecho: está suelto y no se apelmaza.',
    dibujo: 'wok',
    fondo: '#EED9A8'
  },

  // ───────────── Meriendas ─────────────
  {
    id: 'batido-platano',
    titulo: 'Batido + plátano + nueces',
    sub: 'Proteína con agua',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 2,
    etiquetas: ['batido'],
    ing: [{ a: 'whey', g: 30, nota: '1 cacito, con 300 ml de agua' }, { a: 'platano', g: 120, rol: 'hc', min: 120, max: 240 }, NUECES],
    pasos: ['Echa 300 ml de agua fría en el shaker.', 'Añade el cacito de proteína y agita 20 segundos.', 'Tómate el plátano y las nueces al lado.'],
    truco: 'Si es tu comida de después del gym, tómatela en cuanto llegues a casa.',
    dibujo: 'batido',
    fondo: '#E6D2BC'
  },
  {
    id: 'batido-arandanos',
    titulo: 'Batido de arándanos + nueces',
    sub: 'Proteína y fruta, en batidora',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 3,
    etiquetas: ['batido'],
    ing: [{ a: 'whey', g: 30, nota: '1 cacito, con 250 ml de agua' }, { a: 'arandanos', g: 100, nota: 'congelados' }, NUECES],
    pasos: ['Echa en la batidora 250 ml de agua fría, el cacito de proteína y los arándanos congelados.', 'Bate 30 segundos, hasta que no queden trozos.', 'Las nueces, aparte.'],
    truco: 'Si no tienes batidora, toma el batido en el shaker y los arándanos aparte. Aporta lo mismo.',
    dibujo: 'batido-arandanos',
    fondo: '#D8CDE8'
  },
  {
    id: 'batido-platano-arandanos',
    titulo: 'Batido de plátano y arándanos',
    sub: 'El que más hidratos lleva',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 3,
    etiquetas: ['batido'],
    ing: [{ a: 'whey', g: 30, nota: '1 cacito, con 250 ml de agua' }, { a: 'platano', g: 120, rol: 'hc', min: 120, max: 240 }, { a: 'arandanos', g: 100, nota: 'congelados' }, NUECES],
    pasos: ['Echa en la batidora 250 ml de agua fría, el cacito de proteína, el plátano y los arándanos congelados.', 'Bate 30 segundos.', 'Las nueces, aparte.'],
    truco: 'El plátano le da cuerpo y lo endulza. Es el batido de los días de más entreno.',
    dibujo: 'batido-mix',
    fondo: '#DDCFE3'
  },
  {
    id: 'yogur-arandanos',
    titulo: 'Yogures con arándanos y nueces',
    sub: 'Dos yogures +Proteínas',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 2,
    etiquetas: ['nevera'],
    ing: [{ a: 'yogur', g: 240, nota: '2 yogures' }, { a: 'arandanos', g: 100 }, NUECES],
    pasos: ['Saca los arándanos del congelador la noche antes y déjalos en la nevera. Si se te olvida, 40 segundos en el micro.', 'Echa los 2 yogures en un bol, pon los arándanos encima y las nueces troceadas.'],
    truco: 'Échale canela por encima. Da sabor dulce sin azúcar.',
    dibujo: 'yogur-bowl',
    fondo: '#D9D6EE'
  },
  {
    id: 'yogur-platano',
    titulo: 'Yogures con plátano y nueces',
    sub: 'Dos yogures +Proteínas',
    slots: ['merienda'],
    familia: 'lacteo',
    min: 2,
    etiquetas: ['nevera'],
    ing: [{ a: 'yogur', g: 240, nota: '2 yogures' }, { a: 'platano', g: 120, rol: 'hc', min: 60, max: 120 }, NUECES],
    pasos: ['Echa los 2 yogures en un bol.', 'Corta el plátano en rodajas, ponlo encima y añade las nueces troceadas.'],
    truco: 'Con un poco de canela parece un postre.',
    dibujo: 'yogur-platano',
    fondo: '#F1E4B8'
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
      { a: 'yogur', g: 120, nota: '1 yogur' },
      { a: 'nueces', g: 15, rol: 'grasa', descanso: 25 }
    ],
    pasos: ['Tuesta el pan y pon el pavo encima (un poco de tomate triturado si quieres).', 'El yogur con las nueces troceadas por encima.'],
    dibujo: 'tostada-yogur',
    fondo: '#F1DDC0'
  }
];

/** Receta base de la verdura (no es una comida: va dentro de casi todas). */
export const VERDURAS: Receta = {
  id: 'verduras',
  titulo: 'Verduras de la bolsa congelada',
  sub: '1 ración = 200 g',
  slots: [],
  familia: 'fruta',
  min: 10,
  ing: [{ a: 'verdura', g: 200 }, ACEITE(5)],
  pasos: [
    'Sartén a fuego medio-alto con la cucharadita de aceite.',
    'Echa la verdura directamente congelada.',
    'Saltéala 8-10 minutos, removiendo de vez en cuando, hasta que se evapore el agua y empiece a dorarse. La sal, al final.',
    'Si quieres ahorrar tiempo, haz 3 o 4 raciones de golpe y guárdalas en tápers: aguantan 3 días en la nevera.'
  ],
  truco: 'Si la descongelas antes, suelta agua y queda cocida en vez de salteada. Calcula 200 g por ración: para toda la semana necesitas unos 2 kg.',
  dibujo: 'verduras',
  fondo: '#DDE7C6'
};

export const RECETA: Record<string, Receta> = Object.fromEntries([...RECETAS, VERDURAS].map((r) => [r.id, r]));

/** Recetas nuevas que ha hecho Claude (se guardan en el móvil y entran en el generador). */
export function registrarRecetasExtra(rs: Receta[]) {
  for (const r of rs) {
    const k = RECETAS.findIndex((x) => x.id === r.id);
    if (k >= 0) RECETAS[k] = r;
    else RECETAS.push(r);
    RECETA[r.id] = r;
  }
}

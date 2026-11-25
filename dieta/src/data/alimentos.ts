import type { Alimento } from '../lib/tipos';

// Kcal y proteína: la tabla de Rodri (datos/alimentos.json del proyecto "Dieta Rodrigo"),
// la misma con la que se calcularon todos sus planes. Pasada a valores por 100 g.
// Hidratos y grasa: etiquetas de Mercadona/Hacendado y BEDCA (solo para mostrar).
// Se pueden corregir en Más → Alimentos con la etiqueta del envase.
export const ALIMENTOS: Alimento[] = [
  // Proteína
  { id: 'pollo', corto: 'pollo', nombre: 'Pechuga de pollo', kcal: 110, p: 23, c: 0, g: 1.8, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 500 } },
  { id: 'pollo-asado', corto: 'pollo asado', nombre: 'Pechuga de pollo asada en lonchas', kcal: 110, p: 22, c: 1, g: 2, grupo: 'proteina', envase: { nombre: 'paquete', g: 200 } },
  { id: 'pavo', corto: 'pavo', nombre: 'Pechuga de pavo fresca', kcal: 105, p: 24, c: 0, g: 1, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 400 } },
  { id: 'cinta', corto: 'lomo', nombre: 'Cinta de lomo de cerdo (filetes)', kcal: 140, p: 22, c: 0, g: 5.5, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 450 } },
  { id: 'solomillo', corto: 'solomillo', nombre: 'Solomillo de cerdo', kcal: 120, p: 21, c: 0, g: 4, grupo: 'proteina', fresco: true, envase: { nombre: 'pieza', g: 450 } },
  { id: 'picada', corto: 'carne picada', nombre: 'Carne picada de vacuno', kcal: 200, p: 19, c: 0, g: 14, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 300 } },
  { id: 'salmon', corto: 'salmón', nombre: 'Salmón (lomos)', kcal: 200, p: 20, c: 0, g: 13, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja 2 lomos', g: 250 } },
  { id: 'lubina', corto: 'lubina', nombre: 'Lubina en filetes', kcal: 110, p: 19, c: 0, g: 3.5, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja 2 filetes', g: 220 } },
  { id: 'atun', corto: 'atún', nombre: 'Atún claro al natural (escurrido)', kcal: 111, p: 25, c: 0, g: 1, grupo: 'proteina', unidad: { nombre: 'lata', plural: 'latas', g: 56 }, envase: { nombre: 'pack 3 latas', g: 168 } },
  { id: 'jamon', corto: 'jamón', nombre: 'Jamón serrano', kcal: 240, p: 31, c: 0, g: 13, grupo: 'proteina', envase: { nombre: 'sobre', g: 100 } },
  { id: 'lomo-emb', corto: 'lomo embuchado', nombre: 'Lomo embuchado', kcal: 200, p: 38, c: 1, g: 5, grupo: 'proteina', envase: { nombre: 'sobre', g: 100 } },
  { id: 'pavo-fiambre', corto: 'pavo', nombre: 'Pechuga de pavo en lonchas (92 %)', kcal: 100, p: 19, c: 2, g: 1.5, grupo: 'proteina', envase: { nombre: 'paquete', g: 225 } },
  { id: 'huevo', nombre: 'Huevo L', kcal: 150, p: 13, c: 0.7, g: 10, grupo: 'lacteos', unidad: { nombre: 'huevo', plural: 'huevos', g: 60 }, envase: { nombre: 'docena', g: 720 } },

  // Lácteos
  { id: 'yogur', nombre: 'Yogur +Proteínas natural', kcal: 51, p: 10, c: 3.5, g: 0.4, grupo: 'lacteos', unidad: { nombre: 'yogur', plural: 'yogures', g: 120 }, envase: { nombre: 'pack 4', g: 480 } },
  { id: 'cottage', nombre: 'Queso cottage', kcal: 98, p: 11, c: 3, g: 4.3, grupo: 'lacteos', envase: { nombre: 'tarrina', g: 200 } },
  { id: 'mozzarella', nombre: 'Mozzarella rallada', kcal: 290, p: 20, c: 2, g: 22, grupo: 'lacteos', envase: { nombre: 'bolsa', g: 200 } },
  { id: 'leche', nombre: 'Leche desnatada', kcal: 35, p: 3.4, c: 4.9, g: 0.1, grupo: 'lacteos', envase: { nombre: 'brik 1 L', g: 1000 } },
  { id: 'whey', nombre: 'Proteína en polvo (whey)', kcal: 383, p: 80, c: 8, g: 5, grupo: 'despensa', unidad: { nombre: 'cacito', plural: 'cacitos', g: 30 }, envase: { nombre: 'bote', g: 1000 } },

  // Hidratos
  { id: 'pan', corto: 'pan', nombre: 'Pan 100 % integral', kcal: 250, p: 9, c: 42, g: 3, grupo: 'hidratos', envase: { nombre: 'barra', g: 250 } },
  { id: 'pan-burger', corto: 'pan', nombre: 'Pan de hamburguesa', kcal: 253, p: 10.7, c: 45, g: 4, grupo: 'hidratos', unidad: { nombre: 'pan', plural: 'panes', g: 75 }, envase: { nombre: 'paquete 4', g: 300 } },
  { id: 'pita', corto: 'pita', nombre: 'Pan de pita', kcal: 260, p: 9, c: 50, g: 2, grupo: 'hidratos', unidad: { nombre: 'pita', plural: 'pitas', g: 55 }, envase: { nombre: 'paquete 6', g: 330 } },
  { id: 'tortilla', corto: 'tortillas', nombre: 'Tortilla de trigo integral', kcal: 300, p: 10.3, c: 46, g: 7, grupo: 'hidratos', unidad: { nombre: 'tortilla', plural: 'tortillas', g: 36 }, envase: { nombre: 'paquete 8', g: 288 } },
  { id: 'pasta', corto: 'pasta', nombre: 'Pasta (seca)', kcal: 355, p: 12, c: 71, g: 1.5, grupo: 'hidratos', envase: { nombre: 'paquete', g: 500 } },
  { id: 'gnocchi', corto: 'gnocchi', nombre: 'Gnocchi de patata', kcal: 160, p: 4.5, c: 34, g: 0.4, grupo: 'hidratos', envase: { nombre: 'paquete', g: 500 } },
  { id: 'arroz', corto: 'arroz', nombre: 'Arroz basmati (vasito)', kcal: 148, p: 3.2, c: 27.2, g: 2.7, grupo: 'hidratos', unidad: { nombre: 'vasito', plural: 'vasitos', g: 125 }, envase: { nombre: 'pack 2 vasitos', g: 250 } },
  { id: 'patata', corto: 'patata', nombre: 'Patatas para microondas', kcal: 80, p: 2, c: 17.5, g: 0.1, grupo: 'hidratos', envase: { nombre: 'bandeja', g: 500 } },
  { id: 'pan-rallado', nombre: 'Pan rallado', kcal: 350, p: 12, c: 72, g: 2.5, grupo: 'despensa', envase: { nombre: 'paquete', g: 250 } },

  // Fruta y verdura
  { id: 'verdura', nombre: 'Verdura cortada congelada (pimiento, cebolla, zanahoria)', kcal: 50, p: 1, c: 7, g: 1.8, grupo: 'fruta-verdura', envase: { nombre: 'bolsa', g: 1000 } },
  { id: 'platano', corto: 'plátano', nombre: 'Plátano', kcal: 87.5, p: 1.1, c: 20, g: 0.3, grupo: 'fruta-verdura', unidad: { nombre: 'plátano', plural: 'plátanos', g: 120 }, suelto: true },
  { id: 'arandanos', nombre: 'Arándanos congelados', kcal: 50, p: 0.7, c: 12, g: 0.3, grupo: 'fruta-verdura', envase: { nombre: 'bolsa', g: 300 } },
  { id: 'tomate', nombre: 'Tomate natural', kcal: 20, p: 0.9, c: 3.5, g: 0.2, grupo: 'fruta-verdura', unidad: { nombre: 'tomate', plural: 'tomates', g: 120 }, suelto: true },
  { id: 'limon', nombre: 'Limón', kcal: 29, p: 1.1, c: 9, g: 0.3, grupo: 'fruta-verdura', unidad: { nombre: 'limón', plural: 'limones', g: 60 }, suelto: true },

  // Despensa
  { id: 'triturado', nombre: 'Tomate triturado', kcal: 35, p: 1.5, c: 5, g: 0.2, grupo: 'despensa', envase: { nombre: 'brik', g: 390 } },
  { id: 'nueces', corto: 'nueces', nombre: 'Nueces peladas', kcal: 654, p: 15, c: 14, g: 65, grupo: 'despensa', envase: { nombre: 'bolsa', g: 200 } },
  { id: 'chocolate', nombre: 'Chocolate negro 85 %', kcal: 580, p: 10, c: 20, g: 50, grupo: 'despensa', unidad: { nombre: 'onza', plural: 'onzas', g: 10 }, envase: { nombre: 'tableta', g: 100 } },
  { id: 'miel', nombre: 'Miel', kcal: 300, p: 0, c: 82, g: 0, grupo: 'despensa', basico: true },
  { id: 'aceite', nombre: 'Aceite de oliva virgen extra', kcal: 900, p: 0, c: 0, g: 100, grupo: 'despensa', basico: true },
  { id: 'soja', nombre: 'Salsa de soja', kcal: 60, p: 8, c: 5, g: 0.1, grupo: 'despensa', basico: true },
  { id: 'especias', nombre: 'Especias (pimentón, curry, comino, orégano, ajo en polvo)', kcal: 0, p: 0, c: 0, g: 0, grupo: 'despensa', basico: true }
];

export const ALIMENTO: Record<string, Alimento> = Object.fromEntries(ALIMENTOS.map((a) => [a.id, a]));

/** Alimentos nuevos que ha añadido Claude (de la etiqueta de la foto). */
export function registrarAlimentosExtra(as: Alimento[]) {
  for (const a of as) {
    const k = ALIMENTOS.findIndex((x) => x.id === a.id);
    if (k >= 0) ALIMENTOS[k] = a;
    else ALIMENTOS.push(a);
    ALIMENTO[a.id] = a;
  }
}

/** Ración de verdura: 200 g de la bolsa congelada = 100 kcal y 2 g de proteína (como en sus planes). */
export const R1 = 200;

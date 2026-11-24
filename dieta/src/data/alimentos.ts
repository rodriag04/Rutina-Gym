import type { Alimento } from '../lib/tipos';

// Valores por 100 g (o 100 ml). Etiquetas de Mercadona/Hacendado cuando las hay;
// si no, tablas BEDCA. Se pueden corregir en Más → Alimentos con la etiqueta del envase.
export const ALIMENTOS: Alimento[] = [
  // Proteína
  { id: 'pollo', corto: 'pollo', nombre: 'Pechuga de pollo', kcal: 110, p: 23, c: 0, g: 1.8, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 500 } },
  { id: 'pavo', corto: 'pavo', nombre: 'Pechuga de pavo fresca', kcal: 105, p: 24, c: 0, g: 1, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 400 } },
  { id: 'cinta', corto: 'lomo', nombre: 'Cinta de lomo de cerdo (filetes)', kcal: 135, p: 22, c: 0, g: 5, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 450 } },
  { id: 'solomillo', corto: 'solomillo', nombre: 'Solomillo de cerdo', kcal: 120, p: 21, c: 0, g: 4, grupo: 'proteina', fresco: true, envase: { nombre: 'pieza', g: 450 } },
  { id: 'picada', corto: 'carne picada', nombre: 'Carne picada de vacuno', kcal: 170, p: 20, c: 0, g: 10, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja', g: 400 } },
  { id: 'salmon', corto: 'salmón', nombre: 'Salmón (lomos)', kcal: 200, p: 20, c: 0, g: 13, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja 2 lomos', g: 250 } },
  { id: 'lubina', corto: 'lubina', nombre: 'Lubina en filetes', kcal: 110, p: 19, c: 0, g: 3.5, grupo: 'proteina', fresco: true, envase: { nombre: 'bandeja 2 filetes', g: 220 } },
  { id: 'atun', corto: 'atún', nombre: 'Atún claro al natural (escurrido)', kcal: 105, p: 24, c: 0, g: 1, grupo: 'proteina', unidad: { nombre: 'lata', plural: 'latas', g: 56 }, envase: { nombre: 'pack 3 latas', g: 168 } },
  { id: 'jamon', corto: 'jamón', nombre: 'Jamón serrano', kcal: 240, p: 30, c: 0, g: 13, grupo: 'proteina', envase: { nombre: 'sobre', g: 100 } },
  { id: 'lomo-emb', corto: 'lomo embuchado', nombre: 'Lomo embuchado', kcal: 255, p: 38, c: 1, g: 11, grupo: 'proteina', envase: { nombre: 'sobre', g: 100 } },
  { id: 'pavo-fiambre', corto: 'pavo', nombre: 'Pechuga de pavo en lonchas', kcal: 100, p: 19, c: 2, g: 1.5, grupo: 'proteina', envase: { nombre: 'paquete', g: 225 } },
  { id: 'huevo', nombre: 'Huevo L', kcal: 143, p: 12.6, c: 0.7, g: 9.5, grupo: 'lacteos', unidad: { nombre: 'huevo', plural: 'huevos', g: 60 }, envase: { nombre: 'docena', g: 720 } },

  // Lácteos
  { id: 'yogur', nombre: 'Yogur +Proteínas natural', kcal: 51, p: 10, c: 3.5, g: 0.4, grupo: 'lacteos', unidad: { nombre: 'yogur', plural: 'yogures', g: 120 }, envase: { nombre: 'pack 4', g: 480 } },
  { id: 'cottage', nombre: 'Queso cottage', kcal: 99, p: 14, c: 1.7, g: 4, grupo: 'lacteos', envase: { nombre: 'tarrina', g: 200 } },
  { id: 'mozzarella', nombre: 'Mozzarella rallada', kcal: 285, p: 21, c: 2, g: 21, grupo: 'lacteos', envase: { nombre: 'bolsa', g: 200 } },
  { id: 'leche', nombre: 'Leche desnatada', kcal: 35, p: 3.4, c: 4.9, g: 0.1, grupo: 'lacteos', envase: { nombre: 'brik 1 L', g: 1000 } },
  { id: 'whey', nombre: 'Proteína en polvo (whey)', kcal: 390, p: 77, c: 10, g: 5.3, grupo: 'despensa', unidad: { nombre: 'cacito', plural: 'cacitos', g: 30 }, envase: { nombre: 'bote', g: 1000 } },

  // Hidratos
  { id: 'pan', corto: 'pan', nombre: 'Pan 100 % integral', kcal: 245, p: 10, c: 42, g: 3, grupo: 'hidratos', envase: { nombre: 'barra', g: 250 } },
  { id: 'pita', corto: 'pita', nombre: 'Pan de pita integral', kcal: 250, p: 9, c: 48, g: 2, grupo: 'hidratos', unidad: { nombre: 'pita', plural: 'pitas', g: 60 }, envase: { nombre: 'paquete 6', g: 360 } },
  { id: 'tortilla', corto: 'tortillas', nombre: 'Tortilla de trigo integral', kcal: 271, p: 9.3, c: 41, g: 5.8, grupo: 'hidratos', unidad: { nombre: 'tortilla', plural: 'tortillas', g: 36 }, envase: { nombre: 'paquete 8', g: 288 } },
  { id: 'pasta', corto: 'pasta', nombre: 'Pasta (seca)', kcal: 355, p: 12.5, c: 71, g: 1.5, grupo: 'hidratos', envase: { nombre: 'paquete', g: 500 } },
  { id: 'gnocchi', corto: 'ñoquis', nombre: 'Ñoquis de patata', kcal: 174, p: 4.5, c: 37.6, g: 0.4, grupo: 'hidratos', envase: { nombre: 'paquete', g: 500 } },
  { id: 'arroz', corto: 'arroz', nombre: 'Arroz basmati cocido (vasito)', kcal: 148, p: 3.2, c: 27.2, g: 2.7, grupo: 'hidratos', unidad: { nombre: 'vasito', plural: 'vasitos', g: 125 }, envase: { nombre: 'pack 2 vasitos', g: 250 } },
  { id: 'patata', corto: 'patata', nombre: 'Patatas para microondas', kcal: 77, p: 2, c: 17, g: 0.1, grupo: 'hidratos', envase: { nombre: 'bandeja', g: 500 } },

  // Fruta y verdura
  { id: 'verdura', nombre: 'Verdura cortada congelada (pimiento, cebolla, zanahoria)', kcal: 35, p: 1.5, c: 5.5, g: 0.3, grupo: 'fruta-verdura', envase: { nombre: 'bolsa', g: 1000 } },
  { id: 'platano', corto: 'plátano', nombre: 'Plátano', kcal: 90, p: 1.1, c: 20, g: 0.3, grupo: 'fruta-verdura', unidad: { nombre: 'plátano', plural: 'plátanos', g: 120 }, suelto: true },
  { id: 'arandanos', nombre: 'Arándanos congelados', kcal: 57, p: 0.7, c: 14, g: 0.3, grupo: 'fruta-verdura', envase: { nombre: 'bolsa', g: 300 } },
  { id: 'tomate', nombre: 'Tomate natural', kcal: 20, p: 0.9, c: 3.5, g: 0.2, grupo: 'fruta-verdura', unidad: { nombre: 'tomate', plural: 'tomates', g: 120 }, suelto: true },
  { id: 'limon', nombre: 'Limón', kcal: 29, p: 1.1, c: 9, g: 0.3, grupo: 'fruta-verdura', unidad: { nombre: 'limón', plural: 'limones', g: 60 }, suelto: true },

  // Despensa
  { id: 'triturado', nombre: 'Tomate triturado', kcal: 25, p: 1.2, c: 3.5, g: 0.2, grupo: 'despensa', envase: { nombre: 'brik', g: 390 } },
  { id: 'nueces', corto: 'nueces', nombre: 'Nueces peladas', kcal: 654, p: 15, c: 14, g: 65, grupo: 'despensa', envase: { nombre: 'bolsa', g: 200 } },
  { id: 'chocolate', nombre: 'Chocolate negro 85 %', kcal: 590, p: 11, c: 20, g: 50, grupo: 'despensa', unidad: { nombre: 'onza', plural: 'onzas', g: 10 }, envase: { nombre: 'tableta', g: 100 } },
  { id: 'aceite', nombre: 'Aceite de oliva virgen extra', kcal: 899, p: 0, c: 0, g: 100, grupo: 'despensa', basico: true },
  { id: 'soja', nombre: 'Salsa de soja', kcal: 60, p: 8, c: 5, g: 0.1, grupo: 'despensa', basico: true },
  { id: 'especias', nombre: 'Especias (pimentón, curry, orégano, ajo en polvo)', kcal: 0, p: 0, c: 0, g: 0, grupo: 'despensa', basico: true }
];

export const ALIMENTO: Record<string, Alimento> = Object.fromEntries(ALIMENTOS.map((a) => [a.id, a]));

/** Ración de verdura: 200 g de la bolsa congelada. */
export const R1 = 200;

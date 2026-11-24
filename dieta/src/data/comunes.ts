import type { Macro } from '../lib/tipos';

// Comidas fuera del plan: valores medios de una ración normal (estimación, ±20 %).
export interface Comun {
  id: string;
  nombre: string;
  detalle: string;
  m: Macro;
}

export const COMUNES: Comun[] = [
  { id: 'menu', nombre: 'Menú del día', detalle: 'Primero, segundo, pan y postre', m: { kcal: 1100, p: 50, c: 110, g: 45 } },
  { id: 'combinado', nombre: 'Plato combinado', detalle: 'Carne, huevo y patatas fritas', m: { kcal: 950, p: 50, c: 70, g: 50 } },
  { id: 'casa', nombre: 'Comida de casa (regla del plato)', detalle: 'Carne o pescado, hidratos y verdura', m: { kcal: 700, p: 45, c: 70, g: 22 } },
  { id: 'boc-bar', nombre: 'Bocadillo de bar', detalle: 'Pan blanco grande, lomo o pollo', m: { kcal: 650, p: 35, c: 75, g: 20 } },
  { id: 'burger-rest', nombre: 'Hamburguesa con patatas', detalle: 'De restaurante', m: { kcal: 1100, p: 45, c: 95, g: 58 } },
  { id: 'burger-ff', nombre: 'Hamburguesa de cadena', detalle: 'Sin patatas ni refresco', m: { kcal: 550, p: 28, c: 45, g: 28 } },
  { id: 'pizza-media', nombre: 'Pizza (media mediana)', detalle: '4 porciones', m: { kcal: 900, p: 38, c: 105, g: 34 } },
  { id: 'pizza-porcion', nombre: 'Pizza (1 porción)', detalle: '', m: { kcal: 280, p: 12, c: 32, g: 11 } },
  { id: 'kebab', nombre: 'Kebab durum', detalle: 'Con salsa', m: { kcal: 800, p: 40, c: 75, g: 36 } },
  { id: 'kebab-plato', nombre: 'Plato de kebab', detalle: 'Con patatas', m: { kcal: 1100, p: 50, c: 90, g: 58 } },
  { id: 'sushi', nombre: 'Sushi', detalle: '12 piezas', m: { kcal: 550, p: 22, c: 85, g: 12 } },
  { id: 'poke', nombre: 'Poke bowl', detalle: 'Ración normal', m: { kcal: 650, p: 35, c: 75, g: 22 } },
  { id: 'pollo-asado', nombre: 'Pollo asado con patatas', detalle: '¼ de pollo', m: { kcal: 800, p: 50, c: 50, g: 44 } },
  { id: 'paella', nombre: 'Paella o arroz', detalle: 'Un plato', m: { kcal: 650, p: 25, c: 85, g: 22 } },
  { id: 'pasta-rest', nombre: 'Pasta de restaurante', detalle: 'Carbonara, boloñesa…', m: { kcal: 850, p: 30, c: 95, g: 36 } },
  { id: 'tortilla-pincho', nombre: 'Pincho de tortilla', detalle: '', m: { kcal: 300, p: 10, c: 20, g: 20 } },
  { id: 'croquetas', nombre: 'Croquetas', detalle: '4 unidades', m: { kcal: 320, p: 10, c: 28, g: 18 } },
  { id: 'ensalada', nombre: 'Ensalada mixta con atún', detalle: '', m: { kcal: 350, p: 20, c: 15, g: 22 } },
  { id: 'tostada-bar', nombre: 'Tostada con tomate y aceite', detalle: 'De bar', m: { kcal: 250, p: 6, c: 35, g: 9 } },
  { id: 'croissant', nombre: 'Croissant o napolitana', detalle: '', m: { kcal: 350, p: 7, c: 38, g: 19 } },
  { id: 'barrita', nombre: 'Barrita de proteína', detalle: '', m: { kcal: 200, p: 20, c: 18, g: 7 } },
  { id: 'cafe', nombre: 'Café con leche', detalle: '', m: { kcal: 80, p: 4, c: 7, g: 4 } },
  { id: 'patatas-bolsa', nombre: 'Patatas fritas de bolsa', detalle: 'Bolsa pequeña (40 g)', m: { kcal: 215, p: 3, c: 21, g: 13 } },
  { id: 'cana', nombre: 'Caña de cerveza', detalle: '', m: { kcal: 90, p: 1, c: 7, g: 0 } },
  { id: 'cubata', nombre: 'Cubata con refresco normal', detalle: '', m: { kcal: 200, p: 0, c: 26, g: 0 } },
  { id: 'cubata-zero', nombre: 'Cubata con refresco zero', detalle: '', m: { kcal: 110, p: 0, c: 0, g: 0 } }
];

export const RACIONES = [0.5, 0.75, 1, 1.25, 1.5, 2];
export const textoRacion = (x: number) => ({ 0.5: '½', 0.75: '¾', 1: '1', 1.25: '1¼', 1.5: '1½', 2: '2' })[x as 1] ?? String(x);

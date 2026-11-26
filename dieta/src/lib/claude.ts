import { ALIMENTOS } from '../data/alimentos';
import { RECETAS } from '../data/recetas';
import { DIAS, diaSemana, fechaCorta, lunesDe, sumarDias } from './fechas';
import { cfgDia } from './generador';
import type { Horas } from './horario';
import { nombreSlot } from './horario';
import type { Alimento, ConfigSemana, Etiqueta, Grupo, Ingrediente, Macro, Objetivos, Receta, Rol, Slot } from './tipos';

// Puente con Claude sin API: la app prepara el texto, Rodri lo pega en su Claude con la foto
// y Claude responde con un bloque JSON ("código") que se pega de vuelta en la app.

export const VERSION_CODIGO = 1;

const SLOTS: Slot[] = ['desayuno', 'comida', 'merienda', 'cena'];
const ROLES: Rol[] = ['prot', 'hc', 'veg', 'grasa', 'extra'];
const GRUPOS: Grupo[] = ['proteina', 'hidratos', 'fruta-verdura', 'lacteos', 'despensa'];

/** Dibujos que puede elegir Claude para una receta nueva. */
export const DIBUJOS: Record<string, string> = {
  'bocadillo-jamon': 'bocadillo',
  'desayuno-huevos': 'huevos con tostada',
  'tostada-huevo': 'tostadas con huevo',
  'pollo-patata': 'pechuga en filetes con patatas',
  'curry': 'guiso con salsa y arroz',
  'solomillo-arroz': 'medallones de carne con arroz',
  'lomo-arroz': 'filetes de carne con arroz',
  'cinta': 'filetes de carne con patatas',
  'salmon-patata': 'pescado azul con patatas',
  'lubina-arroz': 'pescado blanco con arroz',
  'lubina': 'pescado blanco con patatas',
  'bolonesa': 'pasta con salsa de carne',
  'macarrones': 'pasta gratinada',
  'gnocchi-atun': 'gnocchi o pasta con tomate',
  'wok': 'arroz salteado en bol',
  'poke': 'bol de arroz',
  'albondigas': 'albóndigas con tomate',
  'burger': 'hamburguesa',
  'kebab': 'pita rellena',
  'fajitas': 'tortillas enrolladas',
  'pizza-wrap': 'pizza o tortilla gratinada',
  'patatas-atun': 'patatas con algo por encima',
  'huevos-rotos': 'huevos con patatas',
  'huevos-revuelto': 'revuelto',
  'batido': 'batido',
  'yogur-bowl': 'bol de yogur',
  'verduras': 'plato de verduras'
};

function resumenReceta(r: Receta) {
  const clave = r.ing
    .filter((i) => i.rol === 'prot' || i.rol === 'hc')
    .map((i) => i.a)
    .join('+');
  return `${r.id} · ${r.titulo} (${r.slots.join('/')}${clave ? `; ${clave}` : ''})`;
}

function lineaDia(semana: ConfigSemana, i: number) {
  const c = cfgDia(semana, i);
  const partes = [c.gym ? `gym ${c.gym.hora}${c.gym.tipo ? ` (${c.gym.tipo.toLowerCase()})` : ''}` : 'sin gym'];
  if (c.desayunoCasa) partes.push('desayuno en casa');
  if (c.futbol) partes.push(`fútbol ${c.futbol.hora}`);
  if (c.comidaLibre) partes.push('como fuera');
  if (c.cenaLibre) partes.push('ceno fuera');
  if (i === 0) partes.push(semana.taper ? 'comida: táper de mi madre' : 'sin táper (la comida, de lo que haya en casa)');
  if (i === 4 && c.cabra) partes.push('me voy a Cabra después de comer: sin merienda ni cena');
  return `- ${DIAS[i]} ${fechaCorta(c.fecha)} (${c.fecha}): ${partes.join(', ')}`;
}

export function promptSemana(semana: ConfigSemana, o: Objetivos, h: Horas): string {
  const lunes = semana.lunes;
  const ejemplo = {
    rodri: VERSION_CODIGO,
    tipo: 'semana',
    lunes,
    enCasa: ['pollo', 'patata', 'verdura'],
    alimentos: [{ id: 'merluza', nombre: 'Merluza en filetes', kcal: 80, p: 17, c: 0, g: 1, grupo: 'proteina', fresco: true }],
    recetas: [
      {
        id: 'x-merluza-patata',
        titulo: 'Merluza con patatas',
        sub: 'Airfryer y verdura',
        slots: ['cena', 'comida'],
        familia: 'merluza',
        min: 15,
        dibujo: 'lubina',
        ing: [
          { a: 'merluza', g: 200, rol: 'prot' },
          { a: 'patata', g: 250, rol: 'hc' },
          { a: 'verdura', g: 200, rol: 'veg' },
          { a: 'yogur', g: 120, rol: 'extra', nota: 'de postre' }
        ],
        pasos: ['Patatas al micro el tiempo del paquete.', 'Merluza con sal, airfryer 180 ºC 8-10 min.', 'Saltea la verdura.'],
        truco: 'Una frase útil.'
      }
    ],
    menu: { [lunes]: { desayuno: 'boc-casa', comida: 'taper-mama', merienda: 'batido-platano', cena: 'x-merluza-patata' } },
    nota: 'Por qué en una o dos frases.'
  };
  return [
    `Eres mi dietista. Te paso una foto de mi compra (o de mi nevera y despensa). Monta mis comidas del lunes ${fechaCorta(lunes)} al viernes ${fechaCorta(sumarDias(lunes, 4))} usando sobre todo lo que se ve.`,
    '',
    `Yo: 22 años, 1,82 m, 72 kg. Recomposición: días de gym ${o.kcalGym} kcal, de descanso ${o.kcalDescanso} kcal, ${o.prot} g de proteína al día.`,
    'Mi semana:',
    ...semana.dias.map((_, i) => lineaDia(semana, i)),
    '',
    'Reglas:',
    `- 4 comidas: desayuno (bocadillo en el descanso de clase, ${h.desayuno}; en casa solo si lo pone arriba), comida ${h.comida}, merienda ${h.merienda} y cena ${h.cena}. El plátano antes del gym lo pone la app.`,
    '- Sin repetir la proteína principal en el mismo día, ni el mismo plato en comida y cena, ni el mismo plato dos días seguidos. Un pescado al día como mucho.',
    '- Comida y cena con 1 ración de verdura (200 g de la bolsa congelada, id "verdura"). Postre de la cena: yogur +Proteínas (id "yogur", 120 g) o 1 onza de chocolate 85 % (id "chocolate", 10 g).',
    '- Recetas fáciles de estudiante: airfryer, micro y sartén, 10-20 min.',
    '- Carne y pescado frescos aguantan 1-2 días: úsalos el lunes y el martes. Lo demás, del congelador.',
    '- Pon la ración normal: la app escala proteína (rol "prot") e hidratos (rol "hc") para cuadrar kcal y proteína.',
    '- No me gusta el cottage de postre. Verdura: solo la bolsa de pimiento, cebolla y zanahoria.',
    '',
    'Recetas que ya tengo (usa su id):',
    ...RECETAS.filter((r) => r.slots.length).map(resumenReceta),
    '',
    'Alimentos que conoce la app (id · nombre):',
    ...ALIMENTOS.filter((a) => !a.basico || a.id === 'aceite').map((a) => `${a.id} · ${a.nombre}`),
    '',
    'Si algo de la foto no está en la lista, añádelo en "alimentos" con kcal, p, c y g por 100 g (de la etiqueta si se lee) y grupo (proteina, hidratos, fruta-verdura, lacteos o despensa).',
    `Si haces una receta nueva, ponle id que empiece por "x-", ingredientes de las listas con los gramos de una ración, pasos cortos y un dibujo de estos: ${Object.entries(DIBUJOS)
      .map(([k, v]) => `${k} (${v})`)
      .join(', ')}.`,
    'En "enCasa" pon los ids de lo que se ve en la foto (así no me sale en la lista de la compra).',
    '',
    'Responde SOLO con un bloque de código JSON como este (sin nada más):',
    '```json',
    JSON.stringify(ejemplo),
    '```'
  ].join('\n');
}

export function promptComida(slot: Slot): string {
  return [
    `Te paso una foto de mi ${nombreSlot(slot).toLowerCase()}. Estima la ración que se ve: kcal, proteína, hidratos y grasa. Mi app la apunta y reajusta el resto del día.`,
    'Responde SOLO con este bloque de código, con números enteros:',
    '```json',
    JSON.stringify({ rodri: VERSION_CODIGO, tipo: 'comida', slot, texto: 'nombre corto del plato', kcal: 0, p: 0, c: 0, g: 0 }),
    '```'
  ].join('\n');
}

// ───────── Lectura del código ─────────

export interface CodigoComida {
  tipo: 'comida';
  slot?: Slot;
  texto: string;
  macro: Macro;
}

export interface CodigoSemana {
  tipo: 'semana';
  lunes: string;
  enCasa?: string[];
  alimentos: Alimento[];
  recetas: Receta[];
  /** fecha → slot → id de receta */
  menu: Record<string, Partial<Record<Slot, string>>>;
  nota?: string;
  avisos: string[];
}

export type Codigo = CodigoComida | CodigoSemana;

/** ¿El texto parece una respuesta de Claude para la app? */
export const pareceCodigo = (t: string) => /"rodri"\s*:/.test(t);

const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : typeof x === 'string' && x.trim() !== '' && Number.isFinite(Number(x.replace(',', '.'))) ? Number(x.replace(',', '.')) : NaN);
const texto = (x: unknown, max = 200) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
const idValido = (x: unknown) => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{0,40}$/.test(x);

export function leerCodigo(entrada: string, conocidos: { alimentos: Set<string>; recetas: Set<string> }): { ok: true; codigo: Codigo } | { ok: false; error: string } {
  const t = entrada.replace(/```(json)?/g, '');
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a < 0 || b <= a) return { ok: false, error: 'No veo el bloque de código. Copia la respuesta entera de Claude.' };
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(t.slice(a, b + 1));
  } catch {
    return { ok: false, error: 'El código está cortado o incompleto. Vuelve a copiarlo con el botón de copiar del bloque.' };
  }
  if (d.rodri !== VERSION_CODIGO) return { ok: false, error: 'Este código no es de la app de comidas.' };

  if (d.tipo === 'comida') {
    const kcal = num(d.kcal);
    if (!(kcal > 0 && kcal < 4000)) return { ok: false, error: 'Faltan las kcal.' };
    const slot = SLOTS.includes(d.slot as Slot) ? (d.slot as Slot) : undefined;
    const m = { kcal, p: Math.max(0, num(d.p) || 0), c: Math.max(0, num(d.c) || 0), g: Math.max(0, num(d.g) || 0) };
    return { ok: true, codigo: { tipo: 'comida', slot, texto: texto(d.texto, 80) || 'Comida (Claude)', macro: m } };
  }

  if (d.tipo !== 'semana') return { ok: false, error: 'Tipo de código desconocido.' };
  const avisos: string[] = [];
  const lunesTxt = texto(d.lunes, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lunesTxt)) return { ok: false, error: 'Falta la fecha del lunes.' };
  const lunes = lunesDe(lunesTxt);

  // Alimentos nuevos
  const alimentos: Alimento[] = [];
  const ids = new Set(conocidos.alimentos);
  for (const x of Array.isArray(d.alimentos) ? (d.alimentos as Record<string, unknown>[]) : []) {
    const id = x.id;
    const kcal = num(x.kcal);
    const p = num(x.p);
    if (!idValido(id) || !(kcal >= 0 && kcal < 950) || !(p >= 0 && p <= 100)) {
      avisos.push(`Alimento "${texto(x.nombre ?? x.id, 40)}" ignorado: faltan datos.`);
      continue;
    }
    if (conocidos.alimentos.has(id as string)) continue; // ya existe: manda la tabla de Rodri
    alimentos.push({
      id: id as string,
      nombre: texto(x.nombre, 60) || (id as string),
      kcal,
      p,
      c: Math.max(0, num(x.c) || 0),
      g: Math.max(0, num(x.g) || 0),
      grupo: GRUPOS.includes(x.grupo as Grupo) ? (x.grupo as Grupo) : 'despensa',
      fresco: x.fresco === true
    });
    ids.add(id as string);
  }

  // Recetas nuevas
  const recetas: Receta[] = [];
  const recetasIds = new Set(conocidos.recetas);
  const renombrar = new Map<string, string>();
  for (const x of Array.isArray(d.recetas) ? (d.recetas as Record<string, unknown>[]) : []) {
    const titulo = texto(x.titulo, 60);
    let id = typeof x.id === 'string' ? x.id.toLowerCase() : '';
    if (!idValido(id) || !titulo) {
      avisos.push(`Receta "${titulo || id}" ignorada: falta el id o el título.`);
      continue;
    }
    if (!id.startsWith('x-')) {
      const nuevo = `x-${id}`;
      renombrar.set(id, nuevo);
      id = nuevo;
    }
    const slots = (Array.isArray(x.slots) ? x.slots : []).filter((s): s is Slot => SLOTS.includes(s as Slot));
    const ing: Ingrediente[] = [];
    let mal = false;
    for (const i of Array.isArray(x.ing) ? (x.ing as Record<string, unknown>[]) : []) {
      const a = typeof i.a === 'string' ? i.a : '';
      const g = num(i.g);
      if (!ids.has(a) || !(g >= 0 && g <= 1500)) {
        avisos.push(`"${titulo}": ingrediente "${a}" desconocido, quitado.`);
        if (i.rol === 'prot') mal = true;
        continue;
      }
      const rol = ROLES.includes(i.rol as Rol) ? (i.rol as Rol) : undefined;
      const ingr: Ingrediente = { a, g, rol, nota: texto(i.nota, 60) || undefined };
      if (rol === 'prot' || rol === 'hc') {
        ingr.min = num(i.min) > 0 ? num(i.min) : Math.round(g * 0.7);
        ingr.max = num(i.max) > 0 ? num(i.max) : Math.round(g * 1.5);
      }
      ing.push(ingr);
    }
    const pasos = (Array.isArray(x.pasos) ? x.pasos : []).map((p) => texto(p, 300)).filter(Boolean);
    if (!slots.length || !ing.length || !pasos.length || mal) {
      avisos.push(`Receta "${titulo}" ignorada: le faltan comidas, ingredientes o pasos.`);
      continue;
    }
    const principal = ing.find((i) => i.rol === 'prot')?.a ?? ing[0].a;
    const dibujo = typeof x.dibujo === 'string' && x.dibujo in DIBUJOS ? x.dibujo : 'verduras';
    const etiquetas: Etiqueta[] = [];
    if (slots.includes('desayuno')) etiquetas.push(ing.some((i) => i.a === 'pan') && !ing.some((i) => i.a === 'huevo') ? 'bocadillo' : 'casa');
    if (ing.some((i) => i.a === 'whey')) etiquetas.push('batido');
    recetas.push({
      id,
      titulo,
      sub: texto(x.sub, 80) || 'Receta de Claude',
      slots,
      familia: (texto(x.familia, 20) || familiaDe(principal)) as Receta['familia'],
      min: Math.max(1, Math.min(90, num(x.min) || 15)),
      ing,
      pasos,
      truco: texto(x.truco, 300) || undefined,
      etiquetas,
      dibujo,
      fondo: '#E7E2D2'
    });
    recetasIds.add(id);
  }

  // Menú
  const menu: CodigoSemana['menu'] = {};
  const dias = Array.from({ length: 5 }, (_, i) => sumarDias(lunes, i));
  const entradaMenu = (d.menu && typeof d.menu === 'object' ? d.menu : {}) as Record<string, Record<string, unknown>>;
  for (const [fecha, slots] of Object.entries(entradaMenu)) {
    if (!dias.includes(fecha)) {
      avisos.push(`El día ${fecha} no es de esta semana: ignorado.`);
      continue;
    }
    menu[fecha] = {};
    for (const [s, idR] of Object.entries(slots ?? {})) {
      if (!SLOTS.includes(s as Slot) || typeof idR !== 'string') continue;
      const id = renombrar.get(idR) ?? idR;
      if (!recetasIds.has(id)) {
        avisos.push(`${DIAS[diaSemana(fecha)]}, ${s}: "${idR}" no existe; lo elige la app.`);
        continue;
      }
      menu[fecha][s as Slot] = id;
    }
  }
  const enCasa = Array.isArray(d.enCasa) ? (d.enCasa as unknown[]).filter((x): x is string => typeof x === 'string' && ids.has(x)) : undefined;
  return { ok: true, codigo: { tipo: 'semana', lunes, enCasa, alimentos, recetas, menu, nota: texto(d.nota, 400) || undefined, avisos } };
}

function familiaDe(a: string): string {
  const m: Record<string, string> = { pollo: 'pollo', 'pollo-asado': 'pollo', pavo: 'pavo', 'pavo-fiambre': 'pavo', cinta: 'cerdo', solomillo: 'cerdo', picada: 'ternera', salmon: 'salmon', lubina: 'lubina', atun: 'atun', jamon: 'jamon', 'lomo-emb': 'lomo-emb', huevo: 'huevo', yogur: 'lacteo', whey: 'lacteo' };
  return m[a] ?? a;
}

// ───────── Resumen para el proyecto de Claude ─────────

export interface DatosResumen {
  hoy: string;
  objetivos: Objetivos;
  dias: import('./plan').DiaCalculado[];
  medidas: import('./tipos').Medida[];
  notas: import('./tipos').Nota[];
  ajustes: import('./tipos').Ajuste[];
  recomendacion: { titulo: string; texto: string };
  recetasExtra: Receta[];
  lunes: string;
}

const n0 = (x: number) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const coma = (x: number) => x.toFixed(1).replace('.', ',');

/** Estado de la app en texto, para pegarlo en el proyecto "Dieta Rodrigo". */
export function resumenParaClaude(d: DatosResumen): string {
  const l: string[] = [];
  l.push(`Resumen de mi app Comidas (${fechaCorta(d.hoy)}). Es mi estado actual: manda sobre lo que tengas guardado.`);
  l.push(`Objetivos: gym ${n0(d.objetivos.kcalGym)} kcal · descanso ${n0(d.objetivos.kcalDescanso)} kcal · ${d.objetivos.prot} g de proteína · fútbol +${d.objetivos.futbol} kcal.`);
  if (d.ajustes.length) l.push(`Ajustes hechos: ${d.ajustes.map((a) => `${fechaCorta(a.fecha)} ${a.texto}`).join('; ')}.`);
  l.push('', `Semana del ${fechaCorta(d.lunes)}:`);
  for (const dia of d.dias) {
    const i = diaSemana(dia.fecha);
    const cab = [`${DIAS[i]} ${fechaCorta(dia.fecha)}`, dia.cfg.gym ? `gym ${dia.cfg.gym.hora}` : 'sin gym', dia.cfg.futbol ? `fútbol ${dia.cfg.futbol.hora}` : '', dia.cfg.cabra ? 'tarde en Cabra' : '']
      .filter(Boolean)
      .join(', ');
    l.push(`- ${cab}. Objetivo ${n0(dia.objetivo.kcal)} kcal; previsto ${n0(dia.total.kcal)} kcal y ${n0(dia.total.p)} g.`);
    for (const c of dia.comidas) {
      const r = c.registro;
      const nombre = r?.estado === 'otro' ? `${r.texto ?? 'otra cosa'} (fuera del plan)` : r?.estado === 'saltada' ? `${c.receta?.titulo ?? ''} (saltada)` : c.hueco.libre ? 'libre (regla del plato)' : c.receta?.titulo ?? '';
      const marca = r?.estado === 'hecho' ? ' ✓' : '';
      l.push(`  ${c.hueco.hora} ${nombreSlot(c.hueco.slot).toLowerCase()}: ${nombre}${marca} · ${n0(c.macro.kcal)} kcal, ${n0(c.macro.p)} g`);
    }
  }
  const pesos = d.medidas.filter((m) => m.peso !== undefined).slice(-9);
  const cint = d.medidas.filter((m) => m.cintura !== undefined).slice(-4);
  l.push('');
  l.push(pesos.length ? `Peso: ${pesos.map((m) => `${fechaCorta(m.fecha)} ${coma(m.peso!)}`).join(' · ')} kg.` : 'Peso: sin datos todavía.');
  if (cint.length) l.push(`Cintura: ${cint.map((m) => `${fechaCorta(m.fecha)} ${coma(m.cintura!)}`).join(' · ')} cm.`);
  l.push(`La app dice: ${d.recomendacion.titulo}. ${d.recomendacion.texto}`);
  const notas = d.notas.filter((x) => x.fecha >= sumarDias(d.hoy, -14));
  if (notas.length) {
    l.push('', 'Mis notas (14 días):');
    for (const x of notas.slice(-20)) l.push(`- ${fechaCorta(x.fecha)} ${x.hora}: "${x.texto}"${x.aplicado.length ? ` → ${x.aplicado.join('; ')}` : ''}`);
  }
  if (d.recetasExtra.length) l.push('', `Recetas que me has creado: ${d.recetasExtra.map((r) => r.titulo).join(', ')}.`);
  return l.join('\n');
}

import { DIAS, diaSemana, fechaLarga, sumarDias } from './fechas';
import type { Slot } from './tipos';

// Entiende notas cortas en español ("he ido al gym a las 17", "ceno fuera",
// "fútbol el jueves a las 21", "peso 71,8") y las convierte en cambios del plan.

export type Accion =
  | { t: 'gym'; fecha: string; hora: string; dur?: number }
  | { t: 'sinGym'; fecha: string }
  | { t: 'futbol'; fecha: string; hora: string }
  | { t: 'sinFutbol'; fecha: string }
  | { t: 'cenaLibre'; fecha: string; valor: boolean }
  | { t: 'comidaLibre'; fecha: string; valor: boolean }
  | { t: 'taper'; valor: boolean }
  | { t: 'cabra'; fecha: string }
  | { t: 'desayunoCasa'; fecha: string; valor: boolean }
  | { t: 'peso'; fecha: string; kg: number }
  | { t: 'cintura'; fecha: string; cm: number }
  | { t: 'saltada'; fecha: string; slot: Slot };

const limpiar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const DIA_RE = /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/;
const NOMBRES = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

function fechaDe(t: string, hoy: string): string {
  if (/\bpasado manana\b/.test(t)) return sumarDias(hoy, 2);
  if (/\bmanana\b/.test(t) && !/\b(por|de|esta) la manana\b/.test(t)) return sumarDias(hoy, 1);
  if (/\bayer\b/.test(t)) return sumarDias(hoy, -1);
  const m = t.match(DIA_RE);
  if (m) {
    const objetivo = NOMBRES.indexOf(m[1]);
    const hoyI = diaSemana(hoy);
    let delta = objetivo - hoyI;
    if (delta < 0 && !/\b(pasado|fui|he ido|hice|jugue)\b/.test(t)) delta += 7;
    return sumarDias(hoy, delta);
  }
  return hoy;
}

/** Hora cerca de una palabra clave. "a las 5" por la tarde → 17:00. */
function horaDe(t: string): string | null {
  const re = /(?:a las|a la|sobre las|las|para las|desde las|^|\s)(\d{1,2})(?:[:.h](\d{2}))?\s*(h\b|horas\b)?(?:\s*y (media|cuarto))?(?:\s*menos cuarto)?(?:\s*de la (manana|tarde|noche))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const antes = t.slice(Math.max(0, m.index - 2), m.index + 1);
    const despues = t.slice(re.lastIndex, re.lastIndex + 5);
    if (/^\s*(kg|kilo|min|cm|g\b|gr)/.test(despues) || /[.,]\d/.test(t.slice(re.lastIndex - 1, re.lastIndex + 2)) && !m[2]) continue;
    if (/\d[.,]$/.test(antes)) continue;
    let h = Number(m[1]);
    let min = m[2] ? Number(m[2]) : 0;
    if (h > 23 || min > 59) continue;
    if (m[4] === 'media') min = 30;
    if (m[4] === 'cuarto') min = 15;
    if (/menos cuarto/.test(m[0])) {
      h -= 1;
      min = 45;
    }
    const franja = m[5];
    if (franja === 'tarde' || franja === 'noche') {
      if (h < 12) h += 12;
    } else if (!franja && h >= 1 && h <= 7) h += 12;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return null;
}

function duracionDe(t: string): number | undefined {
  if (/hora y media/.test(t)) return 90;
  const m = t.match(/(\d{2,3})\s*min/);
  if (m) return Number(m[1]);
  const h = t.match(/(\d)\s*h(?:oras?)?\s*(\d{2})?\b(?!\s*:)/);
  if (h && /dur|entren|estado|estuve/.test(t)) return Number(h[1]) * 60 + (h[2] ? Number(h[2]) : 0);
  return undefined;
}

const num = (s: string) => Number(s.replace(',', '.'));

const SLOTS: [RegExp, Slot][] = [
  [/desayun/, 'desayuno'],
  [/(comido|comida|almuerz)/, 'comida'],
  [/merend|merienda/, 'merienda'],
  [/(cenado|cena\b)/, 'cena']
];

export function interpretar(texto: string, hoy: string): { acciones: Accion[]; resumen: string[] } {
  const t = limpiar(texto);
  const acciones: Accion[] = [];
  const fecha = fechaDe(t, hoy);
  const cuando = fecha === hoy ? 'hoy' : fecha === sumarDias(hoy, 1) ? 'mañana' : fecha === sumarDias(hoy, -1) ? 'ayer' : `el ${DIAS[diaSemana(fecha)].toLowerCase()}`;

  // Peso y cintura
  const cint = t.match(/cintura\D{0,14}(\d{2,3}(?:[.,]\d)?)/);
  if (cint && num(cint[1]) >= 50 && num(cint[1]) <= 130) acciones.push({ t: 'cintura', fecha, cm: num(cint[1]) });
  const peso = t.match(/(?:peso|pesado|pese|bascula)\D{0,14}(\d{2,3}(?:[.,]\d{1,2})?)/) ?? t.match(/(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|kilos)/);
  if (peso && num(peso[1]) >= 45 && num(peso[1]) <= 140 && !(cint && cint[1] === peso[1])) acciones.push({ t: 'peso', fecha, kg: num(peso[1]) });

  // Gym
  const gym = /\b(gym|gimnasio|gim|entreno|entrenar|entrenado|entrene|pesas)\b/.test(t);
  const noGym = /\b(no|sin|tampoco)\b[^.]{0,20}\b(gym|gimnasio|gim|entreno|entrenar|entrenado|entrene)\b/.test(t) || /\bhoy descanso\b/.test(t);
  if (gym && noGym) acciones.push({ t: 'sinGym', fecha });
  else if (gym) {
    const trozo = t.slice(t.search(/gym|gimnasio|gim\b|entren|pesas/));
    const hora = horaDe(trozo) ?? horaDe(t);
    if (hora) acciones.push({ t: 'gym', fecha, hora, dur: duracionDe(t) });
  }

  // Fútbol
  const fut = /\b(futbol|partido|futbito|futsal|fut sala|pachanga)\b/.test(t);
  const noFut = /\b(no hay|sin|no juego|se suspende|suspendido|no tengo)\b[^.]{0,15}\b(partido|futbol|futbito)\b/.test(t);
  if (fut && noFut) acciones.push({ t: 'sinFutbol', fecha });
  else if (fut) {
    const trozo = t.slice(t.search(/futbol|partido|futbito|futsal|fut sala|pachanga/));
    const hora = horaDe(trozo) ?? horaDe(t);
    if (hora) acciones.push({ t: 'futbol', fecha, hora });
  }

  // Comidas fuera
  if (/\b(ceno fuera|cenar fuera|cena fuera|cena libre|salgo a cenar|salimos a cenar|cenamos fuera|ceno con|cena con|ceno en casa de)\b/.test(t))
    acciones.push({ t: 'cenaLibre', fecha, valor: true });
  if (/\b(ceno en casa|ya no ceno fuera)\b/.test(t)) acciones.push({ t: 'cenaLibre', fecha, valor: false });
  if (/\b(como fuera|comer fuera|comida fuera|comida libre|menu del dia|comemos fuera|como con)\b/.test(t))
    acciones.push({ t: 'comidaLibre', fecha, valor: true });

  // Táper, Cabra, desayuno en casa
  if (/\b(sin taper|no (tengo|hay|traigo|me ha hecho) taper)\b/.test(t)) acciones.push({ t: 'taper', valor: false });
  else if (/\b(tengo|traigo|hay|me ha hecho|me hizo) (el )?taper\b/.test(t)) acciones.push({ t: 'taper', valor: true });
  if (/\b(me voy|voy|me subo|subo|bajo|me bajo|salgo)( para| a| pa)? cabra\b/.test(t)) acciones.push({ t: 'cabra', fecha });
  if (/\b(desayuno en casa|huevos en casa|desayuno huevos|desayunar en casa)\b/.test(t)) acciones.push({ t: 'desayunoCasa', fecha, valor: true });

  // Comidas saltadas
  if (/\b(no he|no|me he saltado|me salte|sin)\b/.test(t)) {
    for (const [re, slot] of SLOTS) {
      const m = t.match(new RegExp(`\\b(no he|me he saltado( el| la)?|me salte( el| la)?|sin)\\s+(${re.source})`));
      if (m) acciones.push({ t: 'saltada', fecha, slot });
    }
  }

  const resumen = acciones.map((a) => describir(a, cuando, fecha));
  return { acciones, resumen };
}

function describir(a: Accion, cuando: string, fecha: string): string {
  switch (a.t) {
    case 'gym':
      return `Gym ${cuando} a las ${a.hora}${a.dur ? ` (${a.dur} min)` : ''}: comidas recolocadas`;
    case 'sinGym':
      return `Sin gym ${cuando}: objetivo de día de descanso`;
    case 'futbol':
      return `Fútbol ${cuando} a las ${a.hora}: +hidratos en la comida de después`;
    case 'sinFutbol':
      return `Sin fútbol ${cuando}`;
    case 'cenaLibre':
      return a.valor ? `Cena libre ${cuando}: regla del plato` : `Cenas en casa ${cuando}`;
    case 'comidaLibre':
      return `Comida fuera ${cuando}: regla del plato`;
    case 'taper':
      return a.valor ? 'Con táper de mamá el lunes' : 'Sin táper: comida del lunes de despensa';
    case 'cabra':
      return `A Cabra ${cuando} después de comer`;
    case 'desayunoCasa':
      return `Desayuno en casa ${cuando}`;
    case 'peso':
      return `Peso ${a.kg.toString().replace('.', ',')} kg (${fechaLarga(fecha).toLowerCase()})`;
    case 'cintura':
      return `Cintura ${a.cm.toString().replace('.', ',')} cm`;
    case 'saltada':
      return `${a.slot[0].toUpperCase() + a.slot.slice(1)} saltada ${cuando}: el resto del día se reajusta`;
  }
}

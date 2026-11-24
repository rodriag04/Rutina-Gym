import { RECETAS, RECETA } from '../data/recetas';
import { diaSemana, sumarDias } from './fechas';
import { horario, type Horas, HORAS, type Hueco } from './horario';
import { calcularDia } from './plan';
import type { ConfigDia, ConfigSemana, Eleccion, Objetivos, Receta, Semana, Slot } from './tipos';

// Genera el menú de lunes a viernes cumpliendo la checklist:
// kcal y proteína dentro del objetivo, sin repetir proteína principal en el día,
// ni plato en comida y cena, ni el mismo plato dos días seguidos; cuadra con el horario,
// el táper, la compra del lunes y el viaje a Cabra.

export function rng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GYM_POR_DEFECTO: Record<number, ConfigDia['gym']> = {
  0: { hora: '16:30', dur: 65, tipo: 'Pecho, hombro y tríceps' },
  1: { hora: '10:30', dur: 62, tipo: 'Espalda y bíceps' },
  3: { hora: '11:00', dur: 60, tipo: 'Brazos y hombro' }
};

export function configPorDefecto(lunes: string): ConfigSemana {
  const dias: ConfigDia[] = [0, 1, 2, 3, 4].map((i) => ({
    fecha: sumarDias(lunes, i),
    gym: GYM_POR_DEFECTO[i] ? { ...GYM_POR_DEFECTO[i]! } : undefined,
    cabra: i === 4
  }));
  return { lunes, dias, taper: true, cabraViernes: true, enCasa: ['whey', 'nueces', 'pasta', 'triturado', 'atun'], festivoLunes: false };
}

/** Familias que no pueden repetirse en el mismo día. */
const CUENTA_FAMILIA: Slot[] = ['desayuno', 'comida', 'cena'];

const ORDEN: Slot[] = ['comida', 'cena', 'desayuno', 'merienda', 'pre'];

interface Contexto {
  i: number;
  cfg: ConfigDia;
  semana: ConfigSemana;
  hueco: Hueco;
  hoy: Eleccion[];
  ayer: Eleccion[];
  usos: Map<string, number>;
  familias: Map<string, number>;
  /** Días (índice) en que se usa cottage. */
  diasCottage: number[];
}

const PESCADO = new Set(['salmon', 'lubina']);
const usaCottage = (r: Receta) => r.ing.some((i) => i.a === 'cottage');
const usaPicada = (r: Receta) => r.ing.some((i) => i.a === 'picada');
const hcPrincipal = (r: Receta) => r.ing.filter((i) => i.rol === 'hc').reduce((t, i) => t + i.g, 0);

export function candidatos(ctx: Contexto): { r: Receta; peso: number }[] {
  const { i, cfg, semana, hueco, hoy, ayer, usos, familias } = ctx;
  const slot = hueco.slot;
  const lunesAntesCompra = i === 0 && (slot === 'desayuno' || slot === 'comida' || slot === 'pre');
  const viernesUltima = i === 4 && cfg.cabra && slot === 'comida';
  const viernesCenaDespensa = i === 4 && !cfg.cabra && slot === 'cena';

  if (slot === 'pre') return [{ r: RECETA['platano'], peso: 1 }];
  if (slot === 'comida' && i === 0 && semana.taper) return [{ r: RECETA['taper-mama'], peso: 1 }];

  const familiasHoy = new Set(hoy.filter((e) => CUENTA_FAMILIA.includes(e.slot)).map((e) => RECETA[e.receta].familia));
  const idsHoy = new Set(hoy.map((e) => e.receta));
  const idsAyer = new Set(ayer.map((e) => e.receta));
  const picadaSemana = [...usos.entries()].filter(([id]) => usaPicada(RECETA[id])).reduce((t, [, n]) => t + n, 0);

  const out: { r: Receta; peso: number }[] = [];
  for (const r of RECETAS) {
    if (!r.slots.includes(slot) || r.id === 'taper-mama') continue;
    const et = r.etiquetas ?? [];
    if (slot === 'desayuno') {
      if (cfg.desayunoCasa ? !et.includes('casa') : !et.includes('bocadillo')) continue;
      // Lunes antes de la compra: embutido que aguanta toda la semana o huevos.
      if (lunesAntesCompra && r.familia === 'pavo') continue;
    }
    if (lunesAntesCompra && slot === 'comida' && !et.includes('despensa')) continue;
    if (viernesCenaDespensa && !et.includes('despensa')) continue;
    if (hueco.noBatido && et.includes('batido')) continue;
    if (idsHoy.has(r.id) || idsAyer.has(r.id)) continue;
    if (CUENTA_FAMILIA.includes(slot) && familiasHoy.has(r.familia)) continue;
    // Un pescado al día como mucho.
    if (PESCADO.has(r.familia) && [...familiasHoy].some((f) => PESCADO.has(f))) continue;
    const n = usos.get(r.id) ?? 0;
    if (n >= 2) continue;
    const nf = familias.get(r.familia) ?? 0;
    if (r.familia === 'salmon' && nf >= 2) continue;
    if (r.familia === 'lubina' && nf >= 1) continue;
    if (usaPicada(r) && picadaSemana >= 2) continue;

    let peso = n === 0 ? 3 : 1;
    if (slot !== 'merienda' && slot !== 'desayuno') peso *= 1 / (1 + 0.6 * nf);
    // Pescado fresco al principio de la semana (se compra el lunes).
    if ((r.familia === 'salmon' || r.familia === 'lubina') && i <= 1) peso *= 1.8;
    // Post-entreno: platos con más hidratos.
    if (hueco.gym === 'post' && hcPrincipal(r) >= 150) peso *= 1.4;
    // Cottage: que la tarrina se gaste en pocos días.
    if (usaCottage(r) && ctx.diasCottage.length) {
      const lejos = Math.min(...ctx.diasCottage.map((d) => Math.abs(d - i)));
      peso *= lejos <= 2 ? 1.6 : 0.4;
    }
    // Viernes antes de irse: algo de despensa o que se descongela el jueves.
    if (viernesUltima && et.includes('despensa')) peso *= 1.5;
    // Días de descanso: cena con menos hidratos.
    if (!cfg.gym && slot === 'cena' && hcPrincipal(r) <= 130) peso *= 1.3;
    out.push({ r, peso });
  }
  return out;
}

function elegir<T extends { peso: number }>(xs: T[], azar: () => number): T | undefined {
  const tot = xs.reduce((t, x) => t + x.peso, 0);
  let k = azar() * tot;
  for (const x of xs) {
    k -= x.peso;
    if (k <= 0) return x;
  }
  return xs.at(-1);
}

/** Configuración del día con lo que afecta a la semana (festivo del lunes, Cabra). */
export function cfgDia(semana: ConfigSemana, i: number): ConfigDia {
  const c = semana.dias[i];
  return { ...c, festivo: c.festivo || (i === 0 && semana.festivoLunes), cabra: i === 4 ? semana.cabraViernes : c.cabra };
}

export function generarSemana(semana: ConfigSemana, o: Objetivos, semilla: number, horas: Horas = HORAS, fijas: Record<string, Eleccion[]> = {}): Semana {
  const azar = rng(semilla);
  const menu: Record<string, Eleccion[]> = {};
  const usos = new Map<string, number>();
  const familias = new Map<string, number>();
  const diasCottage: number[] = [];

  for (let i = 0; i < semana.dias.length; i++) {
    const cfg = cfgDia(semana, i);
    const fecha = cfg.fecha;
    if (fijas[fecha]) {
      menu[fecha] = fijas[fecha];
      for (const e of fijas[fecha]) contar(e, i);
      continue;
    }
    const { huecos } = horario(cfg, horas);
    const ayer = i > 0 ? menu[sumarDias(fecha, -1)] ?? [] : [];
    let mejor: { el: Eleccion[]; err: number } | null = null;

    for (let intento = 0; intento < 60; intento++) {
      const hoy: Eleccion[] = [];
      let ok = true;
      const orden = [...huecos].filter((h) => !h.libre).sort((a, b) => ORDEN.indexOf(a.slot) - ORDEN.indexOf(b.slot));
      for (const h of orden) {
        const c = candidatos({ i, cfg, semana, hueco: h, hoy, ayer, usos, familias, diasCottage });
        const x = elegir(c, azar);
        if (!x) {
          ok = false;
          break;
        }
        hoy.push({ slot: h.slot, receta: x.r.id });
      }
      if (!ok) continue;
      const d = calcularDia(fecha, cfg, hoy, [], o, horas);
      const err = Math.abs(d.total.kcal - d.objetivo.kcal) / 40 + Math.max(0, Math.abs(d.total.p - d.objetivo.p) - 8) / 2;
      if (!mejor || err < mejor.err) mejor = { el: hoy, err };
      if (err < 1.5) break;
    }
    if (!mejor) throw new Error(`No hay combinación válida para ${fecha}`);
    menu[fecha] = mejor.el;
    for (const e of mejor.el) contar(e, i);
  }

  function contar(e: Eleccion, i: number) {
    usos.set(e.receta, (usos.get(e.receta) ?? 0) + 1);
    const r = RECETA[e.receta];
    if (e.slot !== 'pre' && e.slot !== 'merienda') familias.set(r.familia, (familias.get(r.familia) ?? 0) + 1);
    if (usaCottage(r) && !diasCottage.includes(i)) diasCottage.push(i);
  }

  return { id: semana.lunes, config: semana, menu, semilla, creada: new Date().toISOString() };
}

/** Platos que pueden sustituir a uno del menú sin romper las reglas del día. */
export function alternativas(sem: Semana, fecha: string, slot: Slot, horas: Horas = HORAS): Receta[] {
  const i = sem.config.dias.findIndex((d) => d.fecha === fecha);
  if (i < 0) return [];
  const cfg = cfgDia(sem.config, i);
  const { huecos } = horario(cfg, horas);
  const hueco = huecos.find((h) => h.slot === slot);
  if (!hueco) return [];
  const hoy = (sem.menu[fecha] ?? []).filter((e) => e.slot !== slot);
  const ayer = sem.menu[sumarDias(fecha, -1)] ?? [];
  const manana = sem.menu[sumarDias(fecha, 1)] ?? [];
  const usos = new Map<string, number>();
  const familias = new Map<string, number>();
  for (const [f, els] of Object.entries(sem.menu)) {
    for (const e of els) {
      if (f === fecha && e.slot === slot) continue;
      usos.set(e.receta, (usos.get(e.receta) ?? 0) + 1);
    }
  }
  const actual = (sem.menu[fecha] ?? []).find((e) => e.slot === slot)?.receta;
  return candidatos({ i, cfg, semana: sem.config, hueco, hoy, ayer: [...ayer, ...manana], usos, familias, diasCottage: [] })
    .map((x) => x.r)
    .filter((r) => r.id !== actual);
}

export const nombreDia = (fecha: string) => ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'][diaSemana(fecha)];

/** ¿Sigue valiendo este plato para el hueco tras un cambio de horario o de semana? */
function valida(e: Eleccion | undefined, h: Hueco, cfg: ConfigDia, i: number, semana: ConfigSemana): boolean {
  if (!e) return false;
  const r = RECETA[e.receta];
  if (!r || !r.slots.includes(h.slot)) return false;
  const et = r.etiquetas ?? [];
  if (h.slot === 'desayuno' && (cfg.desayunoCasa ? !et.includes('casa') : !et.includes('bocadillo'))) return false;
  if (h.noBatido && et.includes('batido')) return false;
  if (i === 0 && h.slot === 'comida') {
    if (semana.taper !== (r.id === 'taper-mama')) return false;
    if (!semana.taper && !et.includes('despensa')) return false;
  }
  if (i === 4 && !cfg.cabra && h.slot === 'cena' && !et.includes('despensa')) return false;
  return true;
}

/** Rellena o cambia solo los platos que ya no encajan; el resto de la semana se queda igual. */
export function reparar(sem: Semana, horas: Horas = HORAS, desde?: string): Semana {
  const menu: Record<string, Eleccion[]> = { ...sem.menu };
  const azar = rng(sem.semilla + 101);
  for (let i = 0; i < sem.config.dias.length; i++) {
    const cfg = cfgDia(sem.config, i);
    if (desde && cfg.fecha < desde) continue;
    const { huecos } = horario(cfg, horas);
    const actual = menu[cfg.fecha] ?? [];
    const nuevo: Eleccion[] = actual.filter((e) => huecos.some((h) => h.slot === e.slot) || (e.slot === 'cena' && cfg.cabra) || (e.slot === 'merienda' && cfg.cabra));
    for (const h of huecos) {
      const e = nuevo.find((x) => x.slot === h.slot);
      if (h.libre && e) continue;
      if (valida(e, h, cfg, i, sem.config)) continue;
      const sin = nuevo.filter((x) => x.slot !== h.slot);
      const usos = new Map<string, number>();
      for (const [f, els] of Object.entries(menu)) if (f !== cfg.fecha) for (const x of els) usos.set(x.receta, (usos.get(x.receta) ?? 0) + 1);
      for (const x of sin) usos.set(x.receta, (usos.get(x.receta) ?? 0) + 1);
      const ayer = [...(menu[sumarDias(cfg.fecha, -1)] ?? []), ...(menu[sumarDias(cfg.fecha, 1)] ?? [])];
      const c = candidatos({ i, cfg, semana: sem.config, hueco: h, hoy: sin, ayer, usos, familias: new Map(), diasCottage: [] });
      const x = elegir(c, azar);
      if (x) {
        const k = nuevo.findIndex((y) => y.slot === h.slot);
        if (k >= 0) nuevo[k] = { slot: h.slot, receta: x.r.id };
        else nuevo.push({ slot: h.slot, receta: x.r.id });
      }
    }
    menu[cfg.fecha] = nuevo;
  }
  return { ...sem, menu };
}

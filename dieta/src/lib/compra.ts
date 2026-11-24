import { aHora, aMin, DIAS, diaSemana, sumarDias } from './fechas';
import { cfgDia } from './generador';
import type { Horas } from './horario';
import { HORAS, nombreSlot } from './horario';
import { alimento } from './nutricion';
import { calcularDia, type DiaCalculado } from './plan';
import type { Grupo, Objetivos, Semana, Slot } from './tipos';

export interface Uso {
  fecha: string;
  slot: Slot;
  g: number;
  receta: string;
}

export interface LineaCompra {
  id: string;
  nombre: string;
  /** Gramos que hay que comprar. */
  g: number;
  texto: string;
  envases: string;
  usos: Uso[];
}

export interface GrupoCompra {
  id: Grupo | 'lunes' | 'casa';
  titulo: string;
  lineas: LineaCompra[];
}

export interface Tarea {
  fecha: string;
  hora: string;
  tipo: 'compra' | 'congelar' | 'descongelar' | 'pesar' | 'medidas';
  texto: string;
  detalle: string[];
}

const TITULO: Record<GrupoCompra['id'], string> = {
  lunes: 'Para el lunes por la mañana (tenlo ya en casa)',
  proteina: 'Carne, pescado y embutido',
  hidratos: 'Pan, pasta, arroz y patatas',
  'fruta-verdura': 'Fruta y verdura',
  lacteos: 'Lácteos y huevos',
  despensa: 'Despensa',
  casa: 'Ya en casa (comprueba que te queda)'
};

export function diasSemana(sem: Semana, o: Objetivos, horas: Horas = HORAS): DiaCalculado[] {
  return sem.config.dias.map((_, i) => {
    const cfg = cfgDia(sem.config, i);
    return calcularDia(cfg.fecha, cfg, sem.menu[cfg.fecha] ?? [], [], o, horas);
  });
}

function usosPorAlimento(dias: DiaCalculado[]): Map<string, Uso[]> {
  const m = new Map<string, Uso[]>();
  for (const d of dias) {
    for (const c of d.comidas) {
      if (!c.receta || c.receta.id === 'taper-mama' || c.hueco.libre) continue;
      for (const p of c.porciones) {
        if (p.g <= 0) continue;
        if (!m.has(p.a)) m.set(p.a, []);
        m.get(p.a)!.push({ fecha: d.fecha, slot: c.hueco.slot, g: p.g, receta: c.receta.id });
      }
    }
  }
  return m;
}

export function textoEnvases(id: string, g: number): string {
  const a = alimento(id);
  if (a.suelto && a.unidad) {
    const n = Math.max(1, Math.ceil(g / a.unidad.g - 0.15));
    return `${n} ${n === 1 ? a.unidad.nombre : a.unidad.plural}`;
  }
  if (a.envase) {
    const n = Math.max(1, Math.ceil(g / (a.envase.g * 1.08)));
    const nombre = n > 1 ? plural(a.envase.nombre) : a.envase.nombre;
    return `${n} ${nombre} (${a.envase.g >= 1000 ? `${a.envase.g / 1000} kg` : `${a.envase.g} g`})`;
  }
  return `${Math.round(g)} g`;
}

/** "pack 2 vasitos" → "packs de 2 vasitos", "bandeja" → "bandejas". */
function plural(n: string): string {
  const [cab, ...resto] = n.split(' ');
  const p = /[aeiou]$/.test(cab) ? `${cab}s` : /k$/.test(cab) ? `${cab}s` : `${cab}es`;
  return resto.length ? `${p} de ${resto.join(' ')}` : p;
}

const gramos = (g: number) => (g >= 1000 ? `${(g / 1000).toFixed(1).replace('.', ',')} kg` : `${Math.round(g / 10) * 10} g`);

/** El lunes por la mañana (antes de la compra) solo cuenta lo que ya hay en casa. */
const antesDeCompra = (sem: Semana, u: Uso) => u.fecha === sem.config.lunes && (u.slot === 'desayuno' || u.slot === 'comida' || u.slot === 'pre');

export function listaCompra(sem: Semana, o: Objetivos, horas: Horas = HORAS): { grupos: GrupoCompra[]; basicos: string[] } {
  const dias = diasSemana(sem, o, horas);
  const usos = usosPorAlimento(dias);
  const enCasa = new Set(sem.config.enCasa);
  const grupos = new Map<GrupoCompra['id'], LineaCompra[]>();
  const basicos: string[] = [];
  const meter = (gid: GrupoCompra['id'], l: LineaCompra) => {
    if (!grupos.has(gid)) grupos.set(gid, []);
    grupos.get(gid)!.push(l);
  };

  for (const [id, us] of usos) {
    const a = alimento(id);
    if (a.basico) {
      basicos.push(a.nombre);
      continue;
    }
    const lunes = us.filter((u) => antesDeCompra(sem, u));
    const resto = us.filter((u) => !antesDeCompra(sem, u));
    const gl = lunes.reduce((t, u) => t + u.g, 0);
    const gr = resto.reduce((t, u) => t + u.g, 0);
    if (gl > 0) meter('lunes', { id, nombre: a.nombre, g: gl, texto: gramos(gl), envases: '', usos: lunes });
    if (gr > 0) {
      const l: LineaCompra = { id, nombre: a.nombre, g: gr, texto: gramos(gr), envases: textoEnvases(id, gr), usos: resto };
      meter(enCasa.has(id) ? 'casa' : a.grupo, l);
    }
  }

  const orden: GrupoCompra['id'][] = ['proteina', 'hidratos', 'fruta-verdura', 'lacteos', 'despensa', 'casa', 'lunes'];
  return {
    grupos: orden
      .filter((g) => grupos.has(g))
      .map((g) => ({ id: g, titulo: TITULO[g], lineas: grupos.get(g)!.sort((x, y) => y.g - x.g) })),
    basicos: [...new Set(basicos)]
  };
}

const CUANDO: Record<Slot, string> = { desayuno: 'desayuno', pre: 'pre-gym', comida: 'comida', merienda: 'merienda', cena: 'cena' };

/** Compra, congelador, pesarse y medidas. */
export function tareasSemana(sem: Semana, o: Objetivos, horas: Horas = HORAS): Tarea[] {
  const dias = diasSemana(sem, o, horas);
  const usos = usosPorAlimento(dias);
  const tareas: Tarea[] = [];
  const lunes = sem.config.lunes;
  const cfgL = cfgDia(sem.config, 0);
  const horaCompra = cfgL.gym ? aHora(aMin(cfgL.gym.hora) + cfgL.gym.dur + 10) : '18:00';

  tareas.push({
    fecha: lunes,
    hora: horaCompra,
    tipo: 'compra',
    texto: sem.config.festivoLunes ? 'Compra (Mercadona cerrado)' : cfgL.gym ? 'Compra en Mercadona al salir del gym' : 'Compra en Mercadona',
    detalle: sem.config.festivoLunes
      ? ['Carrefour Market Nervión Plaza (9-22 h) o Lidl, Aldi, Dia.', 'Lista en la pestaña Compra.']
      : ['Lista en la pestaña Compra.']
  });

  // Lo fresco que se come del miércoles en adelante va al congelador al llegar.
  const congelar: string[] = [];
  const descongelar = new Map<string, string[]>();
  for (const [id, us] of usos) {
    const a = alimento(id);
    if (!a.fresco) continue;
    for (const u of us) {
      const i = diaSemana(u.fecha);
      if (i < 2) continue;
      const que = `${Math.round(u.g)} g de ${a.nombre.toLowerCase()}`;
      congelar.push(`${que} → ${DIAS[i].toLowerCase()}, ${CUANDO[u.slot]}`);
      const noche = sumarDias(u.fecha, -1);
      if (!descongelar.has(noche)) descongelar.set(noche, []);
      descongelar.get(noche)!.push(`${que} (${CUANDO[u.slot]} de mañana)`);
    }
  }
  const hayPan = usos.get('pan')?.some((u) => !antesDeCompra(sem, u));
  if (congelar.length || hayPan) {
    tareas.push({
      fecha: lunes,
      hora: aHora(aMin(horaCompra) + 40),
      tipo: 'congelar',
      texto: 'Al llegar: al congelador',
      detalle: [
        ...congelar.map((x) => `${x}. En bolsa de una ración con el día escrito.`),
        ...(hayPan ? ['Pan: en trozos de 80 g, cada uno en su bolsa.'] : [])
      ]
    });
  }
  for (const [noche, items] of descongelar) {
    tareas.push({ fecha: noche, hora: '22:30', tipo: 'descongelar', texto: 'Del congelador a la nevera', detalle: [...items, 'En un plato, en la nevera. Nunca en la encimera.'] });
  }

  for (const d of dias) {
    const i = diaSemana(d.fecha);
    if (i === 1 || i === 3) tareas.push({ fecha: d.fecha, hora: '07:00', tipo: 'pesar', texto: 'Pésate', detalle: ['En ayunas, después del baño. Apúntalo en Progreso.'] });
  }
  const revision = '2026-11-26';
  if (dias.some((d) => d.fecha === revision)) {
    tareas.push({ fecha: revision, hora: '07:05', tipo: 'medidas', texto: 'Revisión con medidas', detalle: ['Peso en ayunas, cintura a la altura del ombligo y brazo contraído.'] });
  }
  return tareas.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
}

export const etiquetaUso = (u: Uso) => `${DIAS[diaSemana(u.fecha)].slice(0, 3).toLowerCase()} · ${nombreSlot(u.slot).toLowerCase()}`;

/** "lun, mié, jue" */
export const diasDeUso = (us: Uso[]) => [...new Set(us.map((u) => diaSemana(u.fecha)))].sort().map((i) => DIAS[i].slice(0, 3).toLowerCase()).join(', ');

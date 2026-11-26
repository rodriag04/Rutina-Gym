import { DIAS, EJERCICIOS, ORDEN_SEMANA, PERFIL, dia as getDia, ejercicio, equivalente, type DiaId, type Ejercicio } from '../data/rutina';
import { ZONAS_SEMANALES } from '../data/musculos';
import { diasEntre, fechaCorta, kg as fkg, lunesDe, sumarDias } from './formato';
import { comparable, e1rm, limpias, ordenarSesiones, rendimiento } from './progresion';
import type { Serie, Sesion } from './tipos';

export interface Aviso {
  id: string;
  nivel: 'info' | 'atencion' | 'importante';
  titulo: string;
  texto: string;
}

const activos = () => EJERCICIOS.filter((e) => !e.retirado);

/** Cambio de rendimiento de cada ejercicio de una sesión frente a la vez anterior (mismo gimnasio). */
export function comparar(s: Sesion, todas: Sesion[], pc = 72): Map<string, number> {
  const prev = ordenarSesiones(todas).filter((x) => x.fecha < s.fecha || (x.fecha === s.fecha && x.guardado < s.guardado));
  const out = new Map<string, number>();
  for (const [id, series] of Object.entries(s.ex)) {
    const ex = ejercicio(id);
    if (!ex || s.sustituto?.[id]) continue;
    const ahora = rendimiento(series, ex, pc);
    const antes = [...prev].reverse().find((x) => x.ex[id]?.length && !x.sustituto?.[id] && !x.descarga && comparable(ex, x, s.gym));
    if (!antes || !ahora) continue;
    const r0 = rendimiento(antes.ex[id], ex, pc);
    if (r0) out.set(id, ahora / r0 - 1);
  }
  return out;
}

function moda(series: Serie[]) {
  const c = new Map<number, number>();
  series.forEach((x) => c.set(x.kg, (c.get(x.kg) ?? 0) + 1));
  return [...c.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0];
}

/**
 * ¿Has perdido rendimiento frente a la vez anterior?
 * Mismo peso de trabajo: 2 o más reps menos en total (mismas series). Peso distinto: 1RM estimado un 6 % peor.
 */
export function haBajado(antes: Serie[], ahora: Serie[], ex: Ejercicio, pc = 72): boolean {
  const a = limpias(antes, ex);
  const b = limpias(ahora, ex);
  if (!a.length || !b.length) return false;
  const wa = moda(a);
  const wb = moda(b);
  if (wa === wb) {
    const ra = a.filter((x) => x.kg === wa).map((x) => x.reps);
    const rb = b.filter((x) => x.kg === wb).map((x) => x.reps);
    const k = Math.min(ra.length, rb.length);
    const suma = (l: number[]) => l.slice(0, k).reduce((s, x) => s + x, 0);
    return suma(rb) <= suma(ra) - 2;
  }
  return rendimiento(ahora, ex, pc) < rendimiento(antes, ex, pc) * 0.94;
}

/** Ejercicios de una sesión en los que bajaste frente a la vez anterior (mismo gimnasio). */
export function bajadasSesion(s: Sesion, todas: Sesion[], pc = 72): string[] {
  const prev = ordenarSesiones(todas).filter((x) => x.fecha < s.fecha || (x.fecha === s.fecha && x.guardado < s.guardado));
  const out: string[] = [];
  for (const [id, series] of Object.entries(s.ex)) {
    const ex = ejercicio(id);
    if (!ex || s.sustituto?.[id]) continue;
    const antes = [...prev].reverse().find((x) => x.ex[id]?.length && !x.sustituto?.[id] && !x.descarga && comparable(ex, x, s.gym));
    if (antes && haBajado(antes.ex[id], series, ex, pc)) out.push(id);
  }
  return out;
}

export function avisos(sesiones: Sesion[], hoy: string, extra: { ultimaCopia?: string; medidas: { fecha: string }[]; pc: number }): Aviso[] {
  const out: Aviso[] = [];
  const ord = ordenarSesiones(sesiones).filter((s) => !s.descarga);

  // 1. Descarga: 2 sesiones seguidas perdiendo reps en 2 o más ejercicios.
  const ult = ord.slice(-2);
  if (ult.length === 2) {
    const b = ult.map((s) => bajadasSesion(s, sesiones, extra.pc));
    if (b.every((l) => l.length >= 2)) {
      const nombres = [...new Set(b.flat())].map((id) => ejercicio(id)!.corto).join(', ');
      out.push({
        id: 'descarga', nivel: 'importante', titulo: 'Toca semana de descarga',
        texto: `En las 2 últimas sesiones perdiste reps en ${b[0].length} y ${b[1].length} ejercicios (${nombres}). Actívala en Ajustes: mismos pesos, la mitad de series, nada al fallo.`
      });
    }
  }

  // 2. Dos lunes seguidos bajando en los presses → quitar el tríceps del domingo.
  const lunes = ord.filter((s) => s.dia === 'lun');
  if (PERFIL.reglaLunes && lunes.length >= 3) {
    const [a, b, c] = lunes.slice(-3);
    const bajaPress = (x: Sesion, y: Sesion) => {
      const ids = ['lun-1', 'lun-2'].filter((id) => x.ex[id]?.length && y.ex[id]?.length);
      const bajan = ids.filter((id) => haBajado(x.ex[id], y.ex[id], ejercicio(id)!, extra.pc));
      const suben = ids.filter((id) => rendimiento(y.ex[id], ejercicio(id)!, extra.pc) > rendimiento(x.ex[id], ejercicio(id)!, extra.pc) * 1.02);
      return bajan.length > 0 && suben.length === 0;
    };
    if (bajaPress(a, b) && bajaPress(b, c)) {
      out.push({
        id: 'lunes', nivel: 'importante', titulo: 'Dos lunes bajando en los presses',
        texto: 'Tu regla: quita la extensión con barra V del domingo hasta que los presses vuelvan a subir.'
      });
    }
  }

  // 3. Ejercicios que te saltas.
  for (const d of DIAS.filter((x) => x.cuentaSemanal)) {
    const delDia = ord.filter((s) => s.dia === d.id).slice(-4);
    for (const ex of activos().filter((e) => e.dia === d.id)) {
      const ses = delDia.filter((s) => !ex.desde || s.fecha >= ex.desde);
      if (ses.length < 2) continue;
      const sin = ses.filter((s) => !(s.ex[ex.id]?.length)).length;
      if (sin >= 2) {
        out.push({
          id: `salto-${ex.id}`, nivel: 'atencion', titulo: `Te saltas: ${ex.corto}`,
          texto: `${sin} de las últimas ${ses.length} sesiones del ${d.nombre.toLowerCase()}. Hazlo antes de lo que más pereza te dé.`
        });
      }
    }
  }

  // 4. Semana suave fija (cada N semanas).
  if (PERFIL.descargaCada && semanaSuave(sesiones, hoy, PERFIL.descargaCada)) {
    out.push({
      id: 'semana-suave', nivel: 'atencion', titulo: 'Esta semana toca suave',
      texto: `Llevas ${PERFIL.descargaCada - 1} semanas entrenando. Esta semana, la mitad de series y sin apurar. La app ya lo ha ajustado.`
    });
  }

  // 5. Medidas: revisión programada.
  const revision = PERFIL.revisionMedidas;
  const medido = !revision || extra.medidas.some((m) => m.fecha >= revision);
  if (revision && !medido && diasEntre(hoy, revision) <= 3) {
    out.push({
      id: 'medidas', nivel: diasEntre(hoy, revision) <= 0 ? 'atencion' : 'info',
      titulo: diasEntre(hoy, revision) <= 0 ? 'Toca medir' : `Medidas el ${fechaCorta(revision)}`,
      texto: `${PERFIL.textoMedidas} Apúntalo en Progreso.`
    });
  }

  // 6. Copia de seguridad.
  const nuevas = sesiones.filter((s) => s.origen === 'app' && (!extra.ultimaCopia || s.guardado > extra.ultimaCopia)).length;
  const dias = extra.ultimaCopia ? diasEntre(extra.ultimaCopia.slice(0, 10), hoy) : 99;
  if (nuevas >= 3 && dias >= 7) {
    out.push({
      id: 'copia', nivel: 'info', titulo: 'Haz una copia',
      texto: `${nuevas} sesiones nuevas sin copia. Ajustes → Exportar. Los datos solo están en este móvil.`
    });
  }
  return out;
}

/** Semanas pasadas en las que falta algún día de la rutina. */
export function huecos(sesiones: Sesion[], hoy: string): { semana: string; faltan: DiaId[] }[] {
  if (!sesiones.length) return [];
  const ord = ordenarSesiones(sesiones);
  const primera = lunesDe(ord[0].fecha);
  const estaSemana = lunesDe(hoy);
  const out: { semana: string; faltan: DiaId[] }[] = [];
  for (let l = primera; l < estaSemana; l = sumarDias(l, 7)) {
    const fin = sumarDias(l, 6);
    const delaSemana = ord.filter((s) => s.fecha >= l && s.fecha <= fin);
    const hechos = new Set(delaSemana.map((s) => equivalente(s.dia)));
    // Con días sin fijar (p. ej. 2 por semana), lo que cuenta es el número de sesiones.
    const faltan = ORDEN_SEMANA.filter((d) => !hechos.has(d)).slice(0, Math.max(0, ORDEN_SEMANA.length - delaSemana.length));
    // La primera semana empieza a mitad: solo cuenta desde el primer día registrado.
    if (l === primera) continue;
    if (faltan.length) out.push({ semana: l, faltan });
  }
  return out;
}

export interface ResumenSesion {
  hechas: number;
  previstas: number;
  sinHacer: Ejercicio[];
  incompletos: { ex: Ejercicio; hechas: number }[];
  piramides: Ejercicio[];
  calentamientos: Ejercicio[];
  bajadasRir: Ejercicio[];
  records: { ex: Ejercicio; serie: Serie }[];
}

export function resumenSesion(s: Sesion, todas: Sesion[], pc = 72): ResumenSesion {
  const exs = getDia(s.dia).bloques.flat().map((id) => ejercicio(id)!);
  const previstas = exs.reduce((a, e) => a + (s.descarga ? Math.ceil(e.series / 2) : e.series), 0);
  const r: ResumenSesion = { hechas: 0, previstas, sinHacer: [], incompletos: [], piramides: [], calentamientos: [], bajadasRir: [], records: [] };
  const anteriores = todas.filter((x) => x.id !== s.id && (x.fecha < s.fecha || (x.fecha === s.fecha && x.guardado < s.guardado)));
  for (const ex of exs) {
    const series = s.ex[ex.id] ?? [];
    const objetivo = s.descarga ? Math.ceil(ex.series / 2) : ex.series;
    r.hechas += Math.min(series.length, objetivo);
    if (!series.length) { r.sinHacer.push(ex); continue; }
    if (series.length < objetivo) r.incompletos.push({ ex, hechas: series.length });
    const c = limpias(series, ex);
    if (c.length < series.length) r.calentamientos.push(ex);
    if (!ex.esquema && new Set(c.map((x) => x.kg)).size > 1) r.piramides.push(ex);
    if (ex.rirMin >= 2 && series.some((x) => x.drop)) r.bajadasRir.push(ex);
    // Con variante no hay récord: se compararía con otro ejercicio.
    const mejorAntes = s.sustituto?.[ex.id] ? 0 : Math.max(0, ...anteriores.filter((x) => x.ex[ex.id] && !x.sustituto?.[ex.id] && comparable(ex, x, s.gym)).map((x) => rendimiento(x.ex[ex.id], ex, pc)));
    if (mejorAntes > 0) {
      const mejor = c.reduce<Serie | undefined>((m, x) => (!m || e1rm(x.kg, x.reps) > e1rm(m.kg, m.reps) ? x : m), undefined);
      if (mejor && rendimiento([mejor], ex, pc) > mejorAntes * 1.001) r.records.push({ ex, serie: mejor });
    }
  }
  return r;
}

/** Series directas por zona en la semana que empieza en `lunes` frente a lo previsto. */
export function seriesSemana(sesiones: Sesion[], lunes: string) {
  const fin = sumarDias(lunes, 6);
  const hechas = new Map<string, number>();
  const previstas = new Map<string, number>();
  for (const d of DIAS.filter((x) => x.cuentaSemanal)) {
    for (const id of d.bloques.flat()) {
      const ex = ejercicio(id)!;
      for (const z of ZONAS_SEMANALES) if (ex.musculos.p.some((m) => z.musculos.includes(m))) previstas.set(z.id, (previstas.get(z.id) ?? 0) + ex.series);
    }
  }
  for (const s of sesiones.filter((x) => x.fecha >= lunes && x.fecha <= fin && x.dia !== 'alt')) {
    for (const [id, series] of Object.entries(s.ex)) {
      const ex = ejercicio(id);
      if (!ex) continue;
      const n = limpias(series, ex).length;
      for (const z of ZONAS_SEMANALES) if (ex.musculos.p.some((m) => z.musculos.includes(m))) hechas.set(z.id, (hechas.get(z.id) ?? 0) + n);
    }
  }
  return ZONAS_SEMANALES.map((z) => ({ ...z, hechas: hechas.get(z.id) ?? 0, previstas: previstas.get(z.id) ?? 0 })).filter((z) => z.previstas > 0);
}

/** Qué día toca: el primero de la semana que no se ha hecho. */
export function diaSugerido(sesiones: Sesion[], hoy: string): DiaId {
  const l = lunesDe(hoy);
  const hechos = new Set(sesiones.filter((s) => s.fecha >= l && s.fecha <= hoy).map((s) => equivalente(s.dia)));
  const pendientes = ORDEN_SEMANA.filter((d) => !hechos.has(d));
  if (pendientes.length) return pendientes[0];
  // Semana completa: el que hace más tiempo que no se hace.
  const ultima = (d: DiaId) => ordenarSesiones(sesiones).filter((s) => equivalente(s.dia) === d).at(-1)?.fecha ?? '';
  return [...ORDEN_SEMANA].sort((a, b) => ultima(a).localeCompare(ultima(b)))[0];
}

export function textoSeries(series: Serie[]): string {
  return series.map((x) => `${fkg(x.kg)}×${x.reps}${x.drop ? `+${fkg(x.drop.kg)}×${x.drop.reps}` : ''}`).join(' · ');
}

/**
 * Semana suave fija: tras (cada − 1) semanas con entrenos desde la última semana suave, la siguiente va con la mitad de series.
 * Si esta semana ya hay una sesión suave, sigue siéndolo hasta el domingo.
 */
export function semanaSuave(sesiones: Sesion[], hoy: string, cada: number): boolean {
  const lunesHoy = lunesDe(hoy);
  if (sesiones.some((s) => s.descarga && s.fecha >= lunesHoy && s.fecha <= sumarDias(lunesHoy, 6))) return true;
  const ultimaSuave = sesiones.filter((s) => s.descarga && s.fecha < lunesHoy).map((s) => lunesDe(s.fecha)).sort().at(-1);
  const semanas = new Set(
    sesiones.filter((s) => s.fecha < lunesHoy && (!ultimaSuave || lunesDe(s.fecha) > ultimaSuave)).map((s) => lunesDe(s.fecha))
  );
  return semanas.size >= cada - 1;
}

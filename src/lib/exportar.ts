import { dia as getDia, ejercicio, EJERCICIOS, etiquetas, PERFIL } from '../data/rutina';
import { avisos, resumenSesion, textoSeries } from './analisis';
import { fechaCorta, fechaLarga, hoyISO, kg as fkg, sumarDias } from './formato';
import { ordenarSesiones } from './progresion';
import type { Ajustes, EntradaDiario, Medida, Sesion } from './tipos';
import { esVariante, nombreSustituto } from './variantes';

export function descargar(nombre: string, contenido: string, tipo: string) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function copiaJSON(d: {
  sesiones: Sesion[];
  diario: EntradaDiario[];
  medidas: Medida[];
  notasEjercicio: Record<string, string>;
  ajustes: Ajustes;
}) {
  return JSON.stringify({ app: 'rutina-rodrigo', version: 1, exportado: new Date().toISOString(), ...d, sesiones: ordenarSesiones(d.sesiones) }, null, 1);
}

const csvCampo = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function seriesCSV(sesiones: Sesion[], gyms: Ajustes['gimnasios']) {
  const filas = [['fecha', 'dia', 'gimnasio', 'ejercicio_id', 'ejercicio', 'serie', 'kg', 'reps', 'bajada_kg', 'bajada_reps', 'calentamiento', 'notas_sesion', 'hecho_en_su_lugar']];
  for (const s of ordenarSesiones(sesiones)) {
    const gym = gyms.find((g) => g.id === s.gym)?.nombre ?? (s.gym ? s.gym : 'sin confirmar');
    for (const [id, series] of Object.entries(s.ex)) {
      series.forEach((x, i) =>
        filas.push([s.fecha, s.dia, gym, id, ejercicio(id)?.nombre ?? id, String(i + 1), String(x.kg).replace('.', ','), String(x.reps),
          x.drop ? String(x.drop.kg).replace('.', ',') : '', x.drop ? String(x.drop.reps) : '', x.calentamiento ? 'si' : '', s.notas,
          s.sustituto?.[id] ? nombreSustituto(id, s.sustituto[id]) : ''])
      );
    }
  }
  return filas.map((f) => f.map(csvCampo).join(',')).join('\n') + '\n';
}

/** Resumen para WhatsApp. */
export function textoSesion(s: Sesion, todas: Sesion[], gyms: Ajustes['gimnasios']) {
  const d = getDia(s.dia);
  const et = etiquetas(s.dia);
  const r = resumenSesion(s, todas);
  const gym = gyms.find((g) => g.id === s.gym)?.nombre;
  const l: string[] = [`*${fechaLarga(s.fecha)} · ${d.titulo}*${gym ? ` · ${gym}` : ''}`];
  for (const id of d.bloques.flat()) {
    const ex = ejercicio(id)!;
    const series = s.ex[id];
    const sus = s.sustituto?.[id];
    const nombre = sus ? `${esVariante(id, sus) ? ex.variante!.corto : sus} (en lugar de ${ex.corto})` : ex.corto;
    l.push(series?.length ? `${et.get(id)}. ${nombre}: ${textoSeries(series)}` : `${et.get(id)}. ${nombre}: —`);
  }
  l.push(`Series: ${r.hechas}/${r.previstas}${s.duracionMin ? ` · ${s.duracionMin} min` : ''}`);
  if (r.records.length) l.push(`Récords: ${r.records.map((x) => `${x.ex.corto} ${fkg(x.serie.kg)}×${x.serie.reps}`).join(', ')}`);
  if (s.notas) l.push(`Notas: ${s.notas}`);
  return l.join('\n');
}

export async function compartir(texto: string): Promise<'compartido' | 'whatsapp'> {
  if (navigator.share) {
    try {
      await navigator.share({ text: texto });
      return 'compartido';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'compartido';
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  return 'whatsapp';
}

export async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const t = document.createElement('textarea');
    t.value = texto;
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand('copy');
    t.remove();
    return ok;
  }
}

const TIPO: Record<EntradaDiario['tipo'], string> = { sensacion: 'Sensación', correccion: 'Corrección', molestia: 'Molestia' };

/** Informe para pegar en Claude: últimas 2 semanas, avisos, notas y correcciones. */
export function informeClaude(d: {
  sesiones: Sesion[];
  diario: EntradaDiario[];
  medidas: Medida[];
  notasEjercicio: Record<string, string>;
  ajustes: Ajustes;
}) {
  const hoy = hoyISO();
  const desde = sumarDias(hoy, -14);
  const l: string[] = [];
  l.push(`Informe de entrenamiento · ${fechaLarga(hoy)}`);
  l.push(PERFIL.informe);
  if (d.ajustes.descarga) l.push('Semana de descarga activada.');
  l.push('');
  l.push('## Sesiones de las 2 últimas semanas');
  const recientes = ordenarSesiones(d.sesiones).filter((s) => s.fecha >= desde);
  if (!recientes.length) l.push('(ninguna)');
  for (const s of recientes) {
    const gym = d.ajustes.gimnasios.find((g) => g.id === s.gym)?.nombre ?? 'gimnasio sin confirmar';
    l.push(`### ${fechaLarga(s.fecha)} · ${getDia(s.dia).nombre} · ${gym}${s.descarga ? ' · descarga' : ''}`);
    for (const id of getDia(s.dia).bloques.flat()) {
      const ex = ejercicio(id)!;
      const sus = s.sustituto?.[id];
      l.push(`- ${ex.nombre}${sus ? ` → hecho en su lugar: ${nombreSustituto(id, sus)}` : ''}: ${s.ex[id]?.length ? textoSeries(s.ex[id]) : 'sin hacer'}`);
    }
    if (s.sensacion?.energia) l.push(`- Energía: ${['', 'floja', 'normal', 'buena', 'muy buena'][s.sensacion.energia]}`);
    if (s.sensacion?.molestias?.length) l.push(`- Molestias: ${s.sensacion.molestias.join(', ')}`);
    for (const [id, n] of Object.entries(s.exNotas ?? {})) if (n) l.push(`- Nota ${ejercicio(id)?.corto}: ${n}`);
    if (s.notas) l.push(`- Notas: ${s.notas}`);
  }
  const av = avisos(d.sesiones, hoy, { ultimaCopia: d.ajustes.ultimaCopia, medidas: d.medidas, pc: d.ajustes.pesoCorporal });
  if (av.length) {
    l.push('', '## Avisos de la app');
    av.forEach((a) => l.push(`- ${a.titulo}: ${a.texto}`));
  }
  const pend = d.diario.filter((x) => !x.revisada).sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (pend.length) {
    l.push('', '## Mis sensaciones y correcciones (sin revisar)');
    pend.forEach((x) => l.push(`- ${fechaCorta(x.fecha)} · ${TIPO[x.tipo]}: ${x.texto}`));
  }
  const notas = EJERCICIOS.filter((e) => !e.retirado && d.notasEjercicio[e.id]);
  if (notas.length) {
    l.push('', '## Correcciones guardadas por ejercicio');
    notas.forEach((e) => l.push(`- ${e.nombre}: ${d.notasEjercicio[e.id]}`));
  }
  const med = [...d.medidas].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(-3);
  if (med.length) {
    l.push('', '## Medidas');
    med.forEach((m) =>
      l.push(`- ${fechaCorta(m.fecha)}: ${[m.peso && `peso ${fkg(m.peso)} kg`, m.brazo && `brazo ${fkg(m.brazo)} cm`, m.cintura && `cintura ${fkg(m.cintura)} cm`].filter(Boolean).join(', ')}`)
    );
  }
  l.push('', '¿Qué cambiarías?');
  return l.join('\n');
}

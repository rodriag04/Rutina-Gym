import { diaSemana, diasEntre, lunesDe, sumarDias } from './fechas';
import type { Medida, Objetivos } from './tipos';

export interface MediaSemana {
  lunes: string;
  peso: number;
  n: number;
}

/** Media semanal del peso (martes, jueves y sábado; el lunes no cuenta). */
export function mediasSemanales(ms: Medida[]): MediaSemana[] {
  const g = new Map<string, number[]>();
  for (const m of ms) {
    if (m.peso === undefined || diaSemana(m.fecha) === 0) continue;
    const l = lunesDe(m.fecha);
    if (!g.has(l)) g.set(l, []);
    g.get(l)!.push(m.peso);
  }
  return [...g.entries()]
    .map(([lunes, xs]) => ({ lunes, peso: xs.reduce((a, b) => a + b, 0) / xs.length, n: xs.length }))
    .sort((a, b) => a.lunes.localeCompare(b.lunes));
}

export interface Recomendacion {
  tipo: 'bajar' | 'subir' | 'bien' | 'faltan-datos';
  titulo: string;
  texto: string;
  nuevos?: Objetivos;
}

/**
 * Reglas del plan:
 * - Si en 3 semanas la cintura no baja → −150 kcal los días de descanso.
 * - Si baja más de 0,5 kg/semana o pierde fuerza → +150 kcal los días de gym.
 */
export function recomendar(ms: Medida[], o: Objetivos, pierdeFuerza: boolean, hoy: string, ultimoAjuste?: string): Recomendacion {
  const medias = mediasSemanales(ms);
  const recientes = medias.filter((m) => diasEntre(m.lunes, lunesDe(hoy)) <= 21);
  const bloqueado = ultimoAjuste && diasEntre(ultimoAjuste, hoy) < 14;

  if (pierdeFuerza)
    return {
      tipo: 'subir',
      titulo: '+150 kcal los días de gym',
      texto: 'Pierdes fuerza: el déficit es demasiado para ganar músculo. Sube los hidratos de los días de entreno.',
      nuevos: { ...o, kcalGym: o.kcalGym + 150 }
    };

  if (recientes.length >= 2) {
    const a = recientes.at(-2)!;
    const b = recientes.at(-1)!;
    const sem = diasEntre(a.lunes, b.lunes) / 7 || 1;
    const ritmo = (b.peso - a.peso) / sem;
    if (ritmo < -0.5 && !bloqueado)
      return {
        tipo: 'subir',
        titulo: '+150 kcal los días de gym',
        texto: `Bajas ${Math.abs(ritmo).toFixed(1).replace('.', ',')} kg por semana: demasiado rápido para no perder músculo.`,
        nuevos: { ...o, kcalGym: o.kcalGym + 150 }
      };
  }

  const cinturas = ms.filter((m) => m.cintura !== undefined).sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (cinturas.length >= 2) {
    const ult = cinturas.at(-1)!;
    const ref = [...cinturas].reverse().find((m) => diasEntre(m.fecha, ult.fecha) >= 20);
    if (ref && ult.cintura! >= ref.cintura! - 0.4 && !bloqueado)
      return {
        tipo: 'bajar',
        titulo: '−150 kcal los días de descanso',
        texto: `En ${Math.round(diasEntre(ref.fecha, ult.fecha) / 7)} semanas la cintura no baja (${ref.cintura} → ${ult.cintura} cm). Quita hidratos de los días sin gym; los de entreno se quedan igual.`,
        nuevos: { ...o, kcalDescanso: o.kcalDescanso - 150 }
      };
  }

  if (medias.length < 2 || cinturas.length < 2)
    return {
      tipo: 'faltan-datos',
      titulo: 'Sigue apuntando',
      texto: 'Con 2 semanas de peso (mar, jue y sáb) y 2 medidas de cintura te digo si toca ajustar.'
    };

  return {
    tipo: 'bien',
    titulo: 'Vas bien: no toques nada',
    texto: 'Peso estable o bajando 0,1-0,3 kg por semana y cintura bajando. Sigue igual y que suban los pesos del gym.'
  };
}

/** Próximo día de pesarse (martes, jueves, sábado). */
export function proximoPeso(hoy: string): string {
  for (let i = 0; i < 7; i++) {
    const f = sumarDias(hoy, i);
    if ([1, 3, 5].includes(diaSemana(f))) return f;
  }
  return hoy;
}

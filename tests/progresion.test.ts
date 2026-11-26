import { describe, expect, it } from 'vitest';
import historial from '../datos/sesiones.json';
import { EJERCICIOS, ejercicio } from '../src/data/rutina';
import { ESCALONES_POR_DEFECTO, Escalera } from '../src/lib/cargas';
import { planificar, limpias, resolverAlt, type ContextoPlan } from '../src/lib/progresion';
import { avisos, diaSugerido, resumenSesion, seriesSemana, huecos } from '../src/lib/analisis';
import type { Sesion } from '../src/lib/tipos';

const sesiones = historial as unknown as Sesion[];
const ctx = (id: string, gym: string | null = 'sevilla', extra: Partial<ContextoPlan> = {}): ContextoPlan => ({
  sesiones,
  gym,
  escalera: new Escalera(ESCALONES_POR_DEFECTO[ejercicio(id)!.carga]),
  pesoCorporal: 72,
  descarga: false,
  ...extra
});
const plan = (id: string, gym: string | null = 'sevilla') => planificar(ejercicio(id)!, ctx(id, gym));

describe('importación', () => {
  it('13 sesiones y 244 series', () => {
    expect(sesiones.length).toBe(13);
    expect(sesiones.reduce((a, s) => a + Object.values(s.ex).reduce((b, x) => b + x.length, 0), 0)).toBe(244);
  });
  it('todos los ids del historial existen en la rutina', () => {
    for (const s of sesiones) for (const id of Object.keys(s.ex)) expect(ejercicio(id), id).toBeTruthy();
  });
  it('los ids son únicos', () => {
    expect(new Set(EJERCICIOS.map((e) => e.id)).size).toBe(EJERCICIOS.length);
  });
});

describe('limpias', () => {
  it('quita calentamientos apuntados (29 oct)', () => {
    const s = sesiones.find((x) => x.fecha === '2026-10-29')!;
    expect(limpias(s.ex['jue-1']).map((x) => x.kg)).toEqual([32, 36, 32]);
  });
});

describe('press inclinado (serie pesada)', () => {
  it('16 nov 28×8 → mantiene 28 y busca 9; 2.ª condicionada', () => {
    const p = plan('lun-1');
    expect(p.ref?.fecha).toBe('2026-11-16');
    expect(p.series[0]).toEqual({ kg: 28, reps: 9 });
    expect(p.series[1].kg).toBe(28);
    expect(p.series[1].alt?.kg).toBe(26);
    expect(p.series[2].kg).toBe(26);
    expect(p.series[3].kg).toBe(26);
    expect(p.calentamiento?.map((c) => c.kg)).toEqual([14, 20, 24]);
    expect(resolverAlt(p.series[1], 7).kg).toBe(26);
    expect(resolverAlt(p.series[1], 8).kg).toBe(28);
  });
});

describe('series rectas', () => {
  it('predicador 35×12,10,9 → mantiene 35 y 12/11/10/10', () => {
    const p = plan('jue-1');
    expect(p.decision).toBe('mantener');
    expect(p.series.map((s) => s.kg)).toEqual([35, 35, 35, 35]);
    expect(p.series.map((s) => s.reps)).toEqual([12, 11, 10, 10]);
  });
  it('fondos 50×12,10 → sube un escalón', () => {
    const p = plan('jue-2');
    expect(p.decision).toBe('subir');
    expect(p.series[0].kg).toBeGreaterThan(50);
    expect(p.series[0].reps).toBeGreaterThanOrEqual(6);
  });
  it('martillo 10×12,12,11 → salto 10→11,5 controlado', () => {
    const p = plan('mar-6');
    expect(['subir', 'mantener']).toContain(p.decision);
    if (p.decision === 'subir') expect(p.series[0].reps).toBeGreaterThanOrEqual(8);
  });
  it('remo polea 59×11,10,10 → mantiene 59', () => {
    const p = plan('mar-2');
    expect(p.series[0]).toEqual({ kg: 59, reps: 12 });
  });
  it('gimnasio distinto: usa la última sesión de Sevilla, no la del otro', () => {
    const p = plan('jue-4a', 'sevilla');
    expect(p.ref?.fecha).toBe('2026-11-12');
    const o = plan('jue-4a', 'otro');
    expect(o.ref?.fecha).toBe('2026-11-03'); // 3 nov sin confirmar vale para los dos; 12 nov es Sevilla
  });
  it('mancuernas: valen las de cualquier gimnasio; máquinas no', () => {
    const p = plan('lun-1', 'montoto');
    expect(p.otroGym).toBe(false);
    expect(p.ref?.fecha).toBe('2026-11-16');
    expect(plan('lun-2', 'montoto').otroGym).toBe(true);
  });
  it('3 nov fondos sustituidos no cuentan', () => {
    const p = planificar(ejercicio('jue-2')!, ctx('jue-2', 'sevilla', { sesiones: sesiones.filter((s) => s.fecha < '2026-11-12') }));
    expect(p.ref?.fecha).toBe('2026-10-29');
  });
  it('sin registros → nuevo', () => {
    expect(plan('dom-6a').decision).toBe('nuevo');
  });
  it('dominadas usan la nota del 8 nov', () => {
    const p = plan('alt-1');
    expect(p.ref?.inicial).toBe(true);
    expect(p.series[0].kg).toBe(0);
    expect(p.series[0].reps).toBe(9);
  });
  it('descarga: mitad de series y mismo peso', () => {
    const p = planificar(ejercicio('mar-2')!, ctx('mar-2', 'sevilla', { descarga: true }));
    expect(p.series.length).toBe(2);
    expect(p.series[0].kg).toBe(59);
    expect(p.series[0].reps).toBe(9);
  });
  it('todos los ejercicios activos generan un plan sin errores', () => {
    for (const e of EJERCICIOS.filter((x) => !x.retirado)) {
      const p = planificar(e, ctx(e.id));
      expect(p.series.length, e.id).toBe(e.series);
      for (const s of p.series) expect(Number.isFinite(s.reps) && s.reps > 0, e.id).toBe(true);
    }
  });
});

describe('análisis', () => {
  it('series semanales previstas', () => {
    const z = Object.fromEntries(seriesSemana(sesiones, '2026-11-16').map((x) => [x.id, x.previstas]));
    expect(z.biceps).toBe(16);
    expect(z.triceps).toBe(16);
    expect(z.pecho).toBe(10);
    expect(z.dorsal).toBe(10);
    expect(z.lateral).toBe(8);
    expect(z.posterior).toBe(7);
    expect(z.isquios).toBe(4);
  });
  it('día sugerido el 17 nov tras lunes y martes → jueves', () => {
    expect(diaSugerido(sesiones, '2026-11-17')).toBe('jue');
    expect(diaSugerido(sesiones, '2026-11-23')).toBe('lun');
  });
  it('detecta el domingo 15 nov sin guardar', () => {
    const h = huecos(sesiones, '2026-11-17');
    expect(h.find((x) => x.semana === '2026-11-09')?.faltan).toEqual(['dom']);
  });
  it('resumen de sesión: récords y pirámides', () => {
    const s = sesiones.find((x) => x.fecha === '2026-11-17')!;
    const r = resumenSesion(s, sesiones);
    expect(r.sinHacer.map((e) => e.id)).toEqual([]);
    expect(r.records.some((x) => x.ex.id === 'mar-2')).toBe(true);
  });
  it('avisos no rompe', () => {
    expect(Array.isArray(avisos(sesiones, '2026-11-17', { medidas: [], pc: 72 }))).toBe(true);
  });
});

describe('descarga', () => {
  it('con el historial actual no pide descarga (martillo bajó de peso a propósito)', () => {
    const a = avisos(sesiones, '2026-11-17', { medidas: [], pc: 72 });
    expect(a.find((x) => x.id === 'descarga')).toBeUndefined();
  });
});

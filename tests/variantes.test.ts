import { describe, expect, it } from 'vitest';
import historial from '../datos/sesiones.json';
import { EJERCICIOS, ejercicio, type Ejercicio } from '../src/data/rutina';
import { ESCALONES_POR_DEFECTO, Escalera } from '../src/lib/cargas';
import { planificar, type ContextoPlan } from '../src/lib/progresion';
import { comoVariante, nombreSustituto, planVariante } from '../src/lib/variantes';
import type { Sesion } from '../src/lib/tipos';

const sesiones = historial as unknown as Sesion[];
const escaleraDe = (e: Ejercicio) => new Escalera(ESCALONES_POR_DEFECTO[e.carga]);
const ctx = (extra: Partial<ContextoPlan> = {}) => ({
  sesiones,
  gym: 'sevilla',
  escalera: new Escalera(ESCALONES_POR_DEFECTO.mancuerna),
  pesoCorporal: 72,
  descarga: false,
  escaleraDe,
  ...extra
});
const activos = EJERCICIOS.filter((e) => !e.retirado);

describe('variantes', () => {
  it('todo ejercicio activo tiene una variante con id propio', () => {
    const ids = new Set(EJERCICIOS.map((e) => e.id));
    for (const e of activos) {
      expect(e.variante, e.id).toBeTruthy();
      expect(ids.has(e.variante!.id)).toBe(false);
      if (e.variante!.fuente) expect(ejercicio(e.variante!.fuente), e.id).toBeTruthy();
    }
  });
  it('respeta los vetos', () => {
    for (const e of activos) expect(e.variante!.nombre.toLowerCase()).not.toMatch(/sentadilla|peso muerto|hiperext|banca|zancada|good morning/);
  });
  it('todas salen en su escalera, con un solo peso y reps dentro del rango', () => {
    for (const e of activos) {
      const p = planVariante(e, ctx());
      const v = comoVariante(e);
      expect(p.series.length, e.id).toBe(v.series);
      if (p.decision === 'nuevo') continue;
      expect(new Set(p.series.map((s) => s.kg)).size, e.id).toBe(1);
      expect(escaleraDe(v).ajustar(p.series[0].kg), e.id).toBe(p.series[0].kg);
      for (const s of p.series) expect(s.reps >= v.min && s.reps <= v.max, `${e.id} ${s.reps}`).toBe(true);
    }
  });
});

describe('variantes: cálculo', () => {
  const lun1 = ejercicio('lun-1')!;
  const conVariante: Sesion = {
    id: '2026-11-23-lun-x', fecha: '2026-11-23', dia: 'lun', gym: 'sevilla', notas: '', guardado: '2026-11-23T19:00:00.000Z',
    ex: { 'lun-1': [{ kg: 50, reps: 10 }, { kg: 50, reps: 10 }, { kg: 50, reps: 9 }] },
    sustituto: { 'lun-1': 'lun-1v' }
  };

  it('primera vez: sale del press inclinado, en la escalera de la máquina y dentro del rango', () => {
    const p = planVariante(lun1, ctx());
    expect(p.decision).toBe('estimado');
    expect(p.fuente).toBe('Press inclinado');
    expect(p.series).toHaveLength(4);
    const esc = escaleraDe(comoVariante(lun1));
    for (const s of p.series) {
      expect(esc.ajustar(s.kg)).toBe(s.kg);
      expect(s.reps).toBeGreaterThanOrEqual(6);
      expect(s.reps).toBeLessThanOrEqual(10);
    }
    expect(new Set(p.series.map((s) => s.kg)).size).toBe(1);
  });

  it('variante de otro ejercicio: el curl inclinado sale del bayesiano del jueves', () => {
    const p = planVariante(ejercicio('mar-5')!, ctx());
    expect(p.fuente).toBe('Curl bayesiano');
    expect(p.ref?.fecha).toBe('2026-11-12');
  });

  it('con historial propio manda la variante y el principal no cambia', () => {
    const antes = planificar(lun1, { ...ctx(), escalera: escaleraDe(lun1) });
    const todas = [...sesiones, conVariante];
    const despues = planificar(lun1, { ...ctx({ sesiones: todas }), escalera: escaleraDe(lun1) });
    expect(despues).toEqual(antes);
    const p = planVariante(lun1, ctx({ sesiones: todas }));
    expect(p.ref?.fecha).toBe('2026-11-23');
    expect(p.series.every((s) => s.kg >= 50)).toBe(true);
    expect(p.fuente).toBeUndefined();
  });

  it('descarga: la mitad de series', () => {
    const p = planVariante(ejercicio('mar-6')!, ctx({ descarga: true }));
    expect(p.decision).toBe('descarga');
    expect(p.series).toHaveLength(2);
  });

  it('sin registros en la fuente → nuevo', () => {
    expect(planVariante(ejercicio('alt-3')!, ctx()).decision).toBe('nuevo');
  });

  it('nombre de lo hecho en su lugar', () => {
    expect(nombreSustituto('lun-1', 'lun-1v')).toBe('Press inclinado en máquina');
    expect(nombreSustituto('jue-2', 'Extensión con cuerda')).toBe('Extensión con cuerda');
  });
});

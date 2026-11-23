import { describe, expect, it } from 'vitest';
import { perfil } from '../src/perfiles/maricarmen';
import { perfil as rodrigo } from '../src/perfiles/rodrigo';
import { ANIMACIONES } from '../src/components/animaciones';
import { MUSCULOS, ZONAS_SEMANALES } from '../src/data/musculos';
import { duracionBloques } from '../src/data/tiempo';
import { ESCALONES_POR_DEFECTO, Escalera } from '../src/lib/cargas';
import { planificar } from '../src/lib/progresion';
import { semanaSuave } from '../src/lib/analisis';
import type { Sesion } from '../src/lib/tipos';

const porId = new Map(perfil.ejercicios.map((e) => [e.id, e]));
const esc = (c: keyof typeof ESCALONES_POR_DEFECTO) => new Escalera(perfil.escalones?.[c] ?? ESCALONES_POR_DEFECTO[c]);

describe('perfil de Mari Carmen', () => {
  it('2 días, ids únicos y todo enlazado', () => {
    expect(perfil.dias.map((d) => d.id)).toEqual(['d1', 'd2']);
    expect(new Set(perfil.ejercicios.map((e) => e.id)).size).toBe(perfil.ejercicios.length);
    for (const d of perfil.dias) for (const id of d.bloques.flat()) expect(porId.get(id)?.dia, id).toBe(d.id);
    for (const e of perfil.ejercicios) {
      expect(ANIMACIONES[e.anim], e.anim).toBeTruthy();
      for (const m of [...e.musculos.p, ...e.musculos.s]) expect(MUSCULOS[m], m).toBeTruthy();
    }
  });
  it('cada día cabe en unos 45-50 minutos', () => {
    for (const d of perfil.dias) {
      const min = duracionBloques(d.bloques.map((b) => b.map((x) => porId.get(x)!)));
      expect(min, d.id).toBeLessThanOrEqual(50);
      expect(min, d.id).toBeGreaterThanOrEqual(35);
    }
  });
  it('prioridad piernas: más series semanales de pierna que de tren superior', () => {
    const series = (zona: string) =>
      perfil.ejercicios.filter((e) => e.musculos.p.some((m) => ZONAS_SEMANALES.find((z) => z.id === zona)!.musculos.includes(m))).reduce((a, e) => a + e.series, 0);
    expect(series('cuadriceps')).toBe(9);
    expect(series('gluteo')).toBe(12);
    expect(series('isquios')).toBe(9);
    expect(series('gemelos')).toBe(6);
    expect(series('pecho')).toBe(3);
    expect(series('dorsal')).toBe(6);
  });
  it('sin historial: la primera vez pide elegir peso; luego progresa', () => {
    const ex = porId.get('d1-1a')!;
    const ctx = { sesiones: [] as Sesion[], gym: 'principal', escalera: esc(ex.carga), pesoCorporal: 65, descarga: false };
    expect(planificar(ex, ctx).decision).toBe('nuevo');
    const s: Sesion = { id: 'x', fecha: '2026-11-24', dia: 'd1', gym: 'principal', notas: '', guardado: '2026-11-24T18:00:00Z', ex: { 'd1-1a': [{ kg: 40, reps: 12 }, { kg: 40, reps: 11 }, { kg: 40, reps: 10 }] } };
    const p = planificar(ex, { ...ctx, sesiones: [s] });
    expect(p.decision).toBe('subir');
    expect(p.series[0].kg).toBe(42.5);
  });
  it('mancuernas ligeras: 4 → 5 kg es un salto del 25 %: antes sube reps hasta 15', () => {
    const ex = porId.get('d2-2')!;
    const ses = (reps: number[]): Sesion => ({ id: 'x', fecha: '2026-11-24', dia: 'd2', gym: 'principal', notas: '', guardado: '2026-11-24T18:00:00Z', ex: { 'd2-2': reps.map((r) => ({ kg: 4, reps: r })) } });
    const ctx = { gym: 'principal', escalera: esc('mancuerna'), pesoCorporal: 65, descarga: false };
    const a = planificar(ex, { ...ctx, sesiones: [ses([12, 12, 12])] });
    expect(a.decision).toBe('mantener');
    expect(a.series[0]).toEqual({ kg: 4, reps: 13 });
    const b = planificar(ex, { ...ctx, sesiones: [ses([15, 15, 14])] });
    expect(b.decision).toBe('subir');
    expect(b.series[0].kg).toBe(5);
  });
});

describe('semana suave cada 4', () => {
  const ses = (fecha: string, descarga = false): Sesion => ({ id: fecha, fecha, dia: 'd1', gym: 'principal', notas: '', guardado: fecha + 'T18:00:00Z', ex: {}, descarga });
  it('tras 3 semanas con entrenos, la 4.ª es suave; luego vuelve a contar', () => {
    const tres = [ses('2026-11-24'), ses('2026-11-27'), ses('2026-12-01'), ses('2026-12-09')];
    expect(semanaSuave(tres.slice(0, 2), '2026-12-02', 4)).toBe(false);
    expect(semanaSuave(tres, '2026-12-15', 4)).toBe(true);
    const conSuave = [...tres, ses('2026-12-15', true)];
    expect(semanaSuave(conSuave, '2026-12-18', 4)).toBe(true);
    expect(semanaSuave(conSuave, '2026-12-22', 4)).toBe(false);
  });
  it('Rodrigo no tiene semana suave fija', () => {
    expect(rodrigo.descargaCada).toBeUndefined();
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import historial from '../datos/sesiones.json';
import { deshacer, foto, herramientas, instrucciones } from '../src/lib/asistente';
import { borrador, notasEjercicio, sesiones } from '../src/lib/estado';
import { planificar } from '../src/lib/progresion';
import { ejercicio } from '../src/data/rutina';
import { ESCALONES_POR_DEFECTO, Escalera } from '../src/lib/cargas';
import type { Sesion } from '../src/lib/tipos';

const original = historial as unknown as Sesion[];
const usar = (nombre: string, input: Record<string, unknown>) => {
  const cambios: string[] = [];
  const t = herramientas(cambios, () => {}).find((x) => x.name === nombre)!;
  return Promise.resolve(t.execute(input)).then((r) => ({ r: String(r), cambios }));
};

beforeEach(() => {
  sesiones.value = [...original];
  borrador.value = null;
  notasEjercicio.value = {};
});

describe('chat: herramientas', () => {
  it('variante sin sesión en curso: crea la de su día y da el peso', async () => {
    const { r, cambios } = await usar('cambiar_ejercicio', { ejercicio: 'mar-1', por: 'variante' });
    expect(borrador.value?.dia).toBe('mar');
    expect(borrador.value?.sustituto).toEqual({ 'mar-1': 'mar-1v' });
    expect(cambios[0]).toMatch(/Jalón ancho → Dominadas/);
    expect(r).toMatch(/Le toca/);
  });

  it('otra máquina en una sesión guardada: deja de contar para la progresión', async () => {
    const jalon = ejercicio('mar-1')!;
    const ctx = () => ({ sesiones: sesiones.value, gym: 'sevilla', escalera: new Escalera(ESCALONES_POR_DEFECTO['polea-lb']), pesoCorporal: 72, descarga: false });
    expect(planificar(jalon, ctx()).ref?.fecha).toBe('2026-11-17');
    await usar('cambiar_ejercicio', { ejercicio: 'mar-1', por: 'Jalón en máquina de palancas', fecha: '2026-11-17' });
    const s = sesiones.value.find((x) => x.fecha === '2026-11-17')!;
    expect(s.sustituto).toEqual({ 'mar-1': 'Jalón en máquina de palancas' });
    expect(planificar(jalon, ctx()).ref?.fecha).toBe('2026-11-11');
  });

  it('apunta series en la sesión en curso y las suma con añadir', async () => {
    await usar('apuntar_series', { ejercicio: 'jue-1', series: [{ kg: 35, reps: 12 }, { kg: 35, reps: 11 }] });
    await usar('apuntar_series', { ejercicio: 'jue-1', series: [{ kg: 35, reps: 10 }], anadir: true });
    expect(borrador.value?.dia).toBe('jue');
    expect(borrador.value?.ex['jue-1']).toEqual([{ kg: 35, reps: 12 }, { kg: 35, reps: 11 }, { kg: 35, reps: 10 }]);
  });

  it('no mezcla días: ejercicio de otro día con sesión en curso', async () => {
    await usar('apuntar_series', { ejercicio: 'jue-1', series: [{ kg: 35, reps: 12 }] });
    await expect(usar('cambiar_ejercicio', { ejercicio: 'mar-1', por: 'variante' })).rejects.toThrow(/jueves/);
  });

  it('rechaza ids que no existen o retirados', async () => {
    await expect(usar('cambiar_ejercicio', { ejercicio: 'mar-7', por: 'variante' })).rejects.toThrow(/No existe/);
    await expect(usar('apuntar_series', { ejercicio: 'zzz', series: [] })).rejects.toThrow(/No existe/);
  });

  it('deshacer vuelve a como estaba', async () => {
    const antes = foto();
    await usar('cambiar_ejercicio', { ejercicio: 'mar-1', por: 'Otra máquina', fecha: '2026-11-17' });
    await usar('nota', { tipo: 'fija', ejercicio: 'mar-1', texto: 'Asiento en el 4' });
    await usar('apuntar_series', { ejercicio: 'lun-1', series: [{ kg: 28, reps: 9 }] });
    await deshacer(antes);
    expect(sesiones.value.find((x) => x.fecha === '2026-11-17')!.sustituto).toBeUndefined();
    expect(notasEjercicio.value['mar-1']).toBeUndefined();
    expect(borrador.value).toBeNull();
  });

  it('instrucciones: estado, reglas fijas y rutina con ids', () => {
    const t = instrucciones();
    expect(t).toMatch(/press inclinado con mancuernas y el jalón al pecho se quedan siempre/);
    expect(t).toMatch(/mar-1 · Jalón al pecho agarre ancho/);
    expect(t).toMatch(/variante: Dominadas/);
    expect(t.length).toBeLessThan(20000);
  });
});

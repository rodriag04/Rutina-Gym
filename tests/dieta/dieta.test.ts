import { describe, expect, test } from 'vitest';
import { ALIMENTO } from '../../dieta/src/data/alimentos';
import { RECETA, RECETAS } from '../../dieta/src/data/recetas';
import { listaCompra, tareasSemana } from '../../dieta/src/lib/compra';
import { cfgDia, configPorDefecto, generarSemana, alternativas } from '../../dieta/src/lib/generador';
import { horario } from '../../dieta/src/lib/horario';
import { interpretar } from '../../dieta/src/lib/notas';
import { macroReceta } from '../../dieta/src/lib/nutricion';
import { calcularDia, OBJETIVOS } from '../../dieta/src/lib/plan';
import { mediasSemanales, recomendar } from '../../dieta/src/lib/progreso';
import type { ConfigSemana, Registro } from '../../dieta/src/lib/tipos';

const LUNES = '2026-11-23';

function variantes(): [string, ConfigSemana][] {
  const base = configPorDefecto(LUNES);
  const sinTaper = { ...configPorDefecto(LUNES), taper: false };
  const sinCabra = { ...configPorDefecto(LUNES), cabraViernes: false };
  const otroHorario = configPorDefecto(LUNES);
  otroHorario.dias[1].gym = { hora: '13:30', dur: 62, tipo: 'Espalda' };
  otroHorario.dias[3].gym = { hora: '19:30', dur: 60 };
  otroHorario.dias[2].futbol = { hora: '21:00' };
  otroHorario.dias[1].desayunoCasa = true;
  otroHorario.dias[3].desayunoCasa = true;
  const tarde = configPorDefecto(LUNES);
  tarde.dias[0].gym = { hora: '15:15', dur: 65 };
  tarde.dias[3].cenaLibre = true;
  return [
    ['por defecto', base],
    ['sin táper', sinTaper],
    ['sin Cabra', sinCabra],
    ['otro horario', otroHorario],
    ['gym 15:15 y cena libre', tarde]
  ];
}

describe('datos', () => {
  test('cada receta usa alimentos de la tabla y tiene pasos', () => {
    for (const r of RECETAS) {
      expect(r.pasos.length, r.id).toBeGreaterThan(0);
      for (const i of r.ing) expect(ALIMENTO[i.a], `${r.id}: ${i.a}`).toBeDefined();
    }
  });
  test('raciones base razonables', () => {
    for (const r of RECETAS) {
      const m = macroReceta(r);
      if (r.slots.includes('comida') || r.slots.includes('cena')) {
        expect(m.kcal, r.id).toBeGreaterThan(500);
        expect(m.kcal, r.id).toBeLessThan(900);
        expect(m.p, r.id).toBeGreaterThan(35);
      }
    }
  });
});

describe('generador', () => {
  for (const [nombre, cfg] of variantes()) {
    for (const semilla of [1, 7, 42, 2026]) {
      test(`${nombre} · semilla ${semilla}`, () => {
        const sem = generarSemana(cfg, OBJETIVOS, semilla);
        let ayer = new Set<string>();
        for (let i = 0; i < 5; i++) {
          const c = cfgDia(cfg, i);
          const menu = sem.menu[c.fecha];
          const d = calcularDia(c.fecha, c, menu, [], OBJETIVOS);
          // kcal y proteína dentro del objetivo
          expect(Math.abs(d.total.kcal - d.objetivo.kcal), `${c.fecha} kcal ${d.total.kcal}`).toBeLessThan(130);
          expect(d.total.p, `${c.fecha} prot`).toBeGreaterThan(147);
          expect(d.total.p, `${c.fecha} prot`).toBeLessThan(178);
          // sin repetir proteína ni plato en el día
          const principales = menu.filter((e) => ['desayuno', 'comida', 'cena'].includes(e.slot));
          const fams = principales.map((e) => RECETA[e.receta].familia);
          expect(new Set(fams).size, `${c.fecha} familias ${fams}`).toBe(fams.length);
          const ids = menu.map((e) => e.receta);
          expect(new Set(ids).size).toBe(ids.length);
          // ni el mismo plato dos días seguidos
          for (const e of menu) if (e.slot !== 'pre') expect(ayer.has(e.receta), `${c.fecha} ${e.receta} repetido`).toBe(false);
          ayer = new Set(menu.map((e) => e.receta));
          // un pescado al día
          expect(fams.filter((f) => f === 'salmon' || f === 'lubina').length).toBeLessThan(2);
          // cada hueco del horario tiene plato
          const { huecos } = horario(c);
          for (const h of huecos.filter((x) => !x.libre)) expect(menu.find((e) => e.slot === h.slot), `${c.fecha} ${h.slot}`).toBeDefined();
          // batido nunca al salir del gym para volver a clase
          for (const h of huecos.filter((x) => x.noBatido)) {
            const e = menu.find((x) => x.slot === h.slot)!;
            expect(RECETA[e.receta].etiquetas ?? []).not.toContain('batido');
          }
        }
        const lunes = sem.menu[LUNES];
        const comidaLunes = lunes.find((e) => e.slot === 'comida')!.receta;
        if (cfg.taper) expect(comidaLunes).toBe('taper-mama');
        else expect(RECETA[comidaLunes].etiquetas).toContain('despensa');
        const viernes = sem.menu['2026-11-27'];
        if (cfg.cabraViernes) expect(viernes.find((e) => e.slot === 'cena')).toBeUndefined();
        else expect(RECETA[viernes.find((e) => e.slot === 'cena')!.receta].etiquetas).toContain('despensa');
      });
    }
  }

  test('alternativas respetan las reglas', () => {
    const cfg = configPorDefecto(LUNES);
    const sem = generarSemana(cfg, OBJETIVOS, 3);
    const f = '2026-11-25';
    const alt = alternativas(sem, f, 'cena');
    expect(alt.length).toBeGreaterThan(2);
    const comida = RECETA[sem.menu[f].find((e) => e.slot === 'comida')!.receta];
    for (const r of alt) expect(r.familia).not.toBe(comida.familia);
  });
});

describe('horario', () => {
  test('lunes 16:30: comida pre-gym y merienda post-gym', () => {
    const { huecos } = horario({ fecha: LUNES, gym: { hora: '16:30', dur: 65 } });
    expect(huecos.find((h) => h.slot === 'comida')!.gym).toBe('pre');
    expect(huecos.find((h) => h.slot === 'merienda')!.gym).toBe('post');
    expect(huecos.find((h) => h.slot === 'pre')).toBeUndefined();
  });
  test('martes 10:30: plátano antes y bocadillo al salir, sin batido', () => {
    const { huecos } = horario({ fecha: '2026-11-24', gym: { hora: '10:30', dur: 62 } });
    expect(huecos.find((h) => h.slot === 'pre')!.hora).toBe('09:50');
    const des = huecos.find((h) => h.slot === 'desayuno')!;
    expect(des.gym).toBe('post');
    expect(des.noBatido).toBe(true);
    expect(des.hora).toBe('11:40');
  });
  test('gym por la noche: merienda antes y cena después', () => {
    const { huecos } = horario({ fecha: '2026-11-25', gym: { hora: '19:30', dur: 60 } });
    expect(huecos.find((h) => h.slot === 'merienda')!.gym).toBe('pre');
    expect(huecos.find((h) => h.slot === 'cena')!.hora).toBe('21:30');
  });
  test('Cabra: el plan acaba en la comida', () => {
    const { huecos } = horario({ fecha: '2026-11-27', cabra: true });
    expect(huecos.map((h) => h.slot)).toEqual(['desayuno', 'comida']);
  });
});

describe('reajuste del día', () => {
  test('si como más, el resto del día baja y el total vuelve al objetivo', () => {
    const cfg = configPorDefecto(LUNES);
    const sem = generarSemana(cfg, OBJETIVOS, 1);
    const c = cfgDia(cfg, 2);
    const base = calcularDia(c.fecha, c, sem.menu[c.fecha], [], OBJETIVOS);
    const reg: Registro = { fecha: c.fecha, slot: 'comida', estado: 'otro', macro: { kcal: 1000, p: 45, c: 100, g: 40 }, hora: '15:10' };
    const des = base.comidas.find((x) => x.hueco.slot === 'desayuno')!;
    const regDes: Registro = { fecha: c.fecha, slot: 'desayuno', estado: 'hecho', macro: des.macro, hora: '11:00' };
    const d = calcularDia(c.fecha, c, sem.menu[c.fecha], [regDes, reg], OBJETIVOS);
    const cenaAntes = base.comidas.find((x) => x.hueco.slot === 'cena')!.macro.kcal;
    const cenaDespues = d.comidas.find((x) => x.hueco.slot === 'cena')!.macro.kcal;
    expect(cenaDespues).toBeLessThan(cenaAntes);
    expect(Math.abs(d.total.kcal - d.objetivo.kcal)).toBeLessThan(200);
    expect(d.comidas.find((x) => x.hueco.slot === 'cena')!.ajustada).toBe(true);
  });
  test('saltarse la merienda sube la cena', () => {
    const cfg = configPorDefecto(LUNES);
    const sem = generarSemana(cfg, OBJETIVOS, 1);
    const c = cfgDia(cfg, 2);
    const base = calcularDia(c.fecha, c, sem.menu[c.fecha], [], OBJETIVOS);
    const d = calcularDia(c.fecha, c, sem.menu[c.fecha], [{ fecha: c.fecha, slot: 'merienda', estado: 'saltada', macro: { kcal: 0, p: 0, c: 0, g: 0 }, hora: '18:30' }], OBJETIVOS);
    expect(d.comidas.find((x) => x.hueco.slot === 'cena')!.macro.kcal).toBeGreaterThan(base.comidas.find((x) => x.hueco.slot === 'cena')!.macro.kcal);
  });
});

describe('compra y congelador', () => {
  test('la lista suma lo del plan y separa el lunes por la mañana', () => {
    const cfg = configPorDefecto(LUNES);
    cfg.taper = false;
    const sem = generarSemana(cfg, OBJETIVOS, 5);
    const { grupos } = listaCompra(sem, OBJETIVOS);
    const lunes = grupos.find((g) => g.id === 'lunes');
    expect(lunes).toBeDefined();
    for (const l of lunes!.lineas) for (const u of l.usos) expect(u.fecha).toBe(LUNES);
    const todas = grupos.flatMap((g) => g.lineas);
    expect(todas.find((l) => l.id === 'verdura')!.g).toBeGreaterThan(1000);
  });
  test('lo fresco del miércoles en adelante se congela el lunes y se saca la noche antes', () => {
    const cfg = configPorDefecto(LUNES);
    const sem = generarSemana(cfg, OBJETIVOS, 9);
    const t = tareasSemana(sem, OBJETIVOS);
    const cong = t.find((x) => x.tipo === 'congelar');
    expect(cong?.fecha).toBe(LUNES);
    const des = t.filter((x) => x.tipo === 'descongelar');
    expect(des.length).toBeGreaterThan(0);
    for (const d of des) expect(d.fecha >= '2026-11-24').toBe(true);
    expect(t.find((x) => x.tipo === 'compra')!.hora).toBe('17:45');
  });
});

describe('notas', () => {
  const hoy = '2026-11-25'; // miércoles
  const a = (s: string) => interpretar(s, hoy).acciones;
  test('gym', () => {
    expect(a('He ido al gym a las 17:30')).toEqual([{ t: 'gym', fecha: hoy, hora: '17:30', dur: undefined }]);
    expect(a('gym a las 5')[0]).toMatchObject({ t: 'gym', hora: '17:00' });
    expect(a('mañana entreno a las 10 y media')[0]).toMatchObject({ t: 'gym', fecha: '2026-11-26', hora: '10:30' });
    expect(a('el jueves gimnasio a las 13:30')[0]).toMatchObject({ t: 'gym', fecha: '2026-11-26', hora: '13:30' });
    expect(a('hoy no voy al gym')[0]).toMatchObject({ t: 'sinGym', fecha: hoy });
  });
  test('fútbol, cenas y táper', () => {
    expect(a('partido a las 21')[0]).toMatchObject({ t: 'futbol', hora: '21:00' });
    expect(a('el viernes juego al fútbol a las 8 de la tarde')[0]).toMatchObject({ t: 'futbol', fecha: '2026-11-27', hora: '20:00' });
    expect(a('esta noche ceno fuera')[0]).toMatchObject({ t: 'cenaLibre', valor: true });
    expect(a('esta semana no tengo táper')[0]).toMatchObject({ t: 'taper', valor: false });
    expect(a('me voy a Cabra el jueves')[0]).toMatchObject({ t: 'cabra', fecha: '2026-11-26' });
  });
  test('medidas y comidas saltadas', () => {
    expect(a('peso 71,8')[0]).toEqual({ t: 'peso', fecha: hoy, kg: 71.8 });
    expect(a('me he pesado: 72.4 kg')[0]).toMatchObject({ t: 'peso', kg: 72.4 });
    expect(a('cintura 81,5')[0]).toMatchObject({ t: 'cintura', cm: 81.5 });
    expect(a('no he merendado')[0]).toMatchObject({ t: 'saltada', slot: 'merienda' });
    expect(a('me he saltado el desayuno')[0]).toMatchObject({ t: 'saltada', slot: 'desayuno' });
  });
  test('texto sin nada que aplicar', () => {
    expect(a('hoy estoy cansado')).toEqual([]);
  });
});

describe('progreso', () => {
  test('media semanal sin lunes', () => {
    const m = mediasSemanales([
      { fecha: '2026-11-23', peso: 74 },
      { fecha: '2026-11-24', peso: 72 },
      { fecha: '2026-11-26', peso: 72.4 },
      { fecha: '2026-11-28', peso: 71.6 }
    ]);
    expect(m[0].n).toBe(3);
    expect(m[0].peso).toBeCloseTo(72, 1);
  });
  test('cintura parada 3 semanas → −150 los días de descanso', () => {
    const r = recomendar(
      [
        { fecha: '2026-11-03', peso: 72, cintura: 82 },
        { fecha: '2026-11-10', peso: 72 },
        { fecha: '2026-11-17', peso: 72, cintura: 82 },
        { fecha: '2026-11-24', peso: 72, cintura: 82 }
      ],
      OBJETIVOS,
      false,
      '2026-11-25'
    );
    expect(r.tipo).toBe('bajar');
    expect(r.nuevos!.kcalDescanso).toBe(OBJETIVOS.kcalDescanso - 150);
  });
  test('baja muy rápido → +150 los días de gym', () => {
    const r = recomendar(
      [
        { fecha: '2026-11-17', peso: 72.5 },
        { fecha: '2026-11-19', peso: 72.3 },
        { fecha: '2026-11-24', peso: 71.6 },
        { fecha: '2026-11-26', peso: 71.5 }
      ],
      OBJETIVOS,
      false,
      '2026-11-27'
    );
    expect(r.tipo).toBe('subir');
  });
});

describe('tabla de Rodri', () => {
  // kcal y proteína de su plan del 16-20 nov (semana-16-20-nov.json), con las mismas cantidades.
  const PLAN: [string, number, number, boolean][] = [
    ['boc-jamon', 392, 32, false],
    ['boc-pollo', 332, 34, true],
    ['boc-pavo', 300, 26, false],
    ['bolonesa', 826, 45, false],
    ['pollo-patata', 666, 66, false],
    ['gnocchi-salmon', 794, 44, false],
    ['burrito-ternera', 706, 53, false],
    ['lomo-arroz', 640, 47, true],
    ['huevos-rotos', 682, 47, true],
    ['kebab', 810, 68, false],
    ['lubina-arroz', 656, 56, false],
    ['pizza-wrap', 602, 43, true],
    ['patatas-atun', 644, 51, true],
    ['batido-platano', 416, 30, false],
    ['batido-arandanos', 361, 29, false],
    ['batido-platano-arandanos', 466, 30, false],
    ['yogur-arandanos', 434, 31, true],
    ['yogur-platano', 489, 31, true]
  ];
  for (const [id, kcal, p, descanso] of PLAN) {
    test(`${id}: ${kcal} kcal y ${p} g como en su plan`, () => {
      const m = macroReceta(RECETA[id], { fp: 1, fh: 1 }, descanso);
      expect(Math.abs(m.kcal - kcal), `${id} kcal ${m.kcal}`).toBeLessThanOrEqual(3);
      expect(Math.abs(m.p - p), `${id} prot ${m.p}`).toBeLessThanOrEqual(1);
    });
  }
});

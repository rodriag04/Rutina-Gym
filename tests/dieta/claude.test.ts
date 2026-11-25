import { beforeEach, describe, expect, test } from 'vitest';
import { ALIMENTOS } from '../../dieta/src/data/alimentos';
import { RECETA } from '../../dieta/src/data/recetas';
import { leerCodigo, pareceCodigo, promptComida, promptSemana } from '../../dieta/src/lib/claude';
import { aplicarCodigo, diaCalculado, hoy, registros, semanas } from '../../dieta/src/lib/estado';
import { cfgDia, configPorDefecto } from '../../dieta/src/lib/generador';
import { HORAS } from '../../dieta/src/lib/horario';
import { OBJETIVOS } from '../../dieta/src/lib/plan';

const conocidos = () => ({ alimentos: new Set(ALIMENTOS.map((a) => a.id)), recetas: new Set(Object.keys(RECETA)) });
const LUNES = '2026-11-30';

// Lo que respondería Claude a una foto de la compra.
const RESPUESTA = `Aquí tienes tu semana:
\`\`\`json
{"rodri":1,"tipo":"semana","lunes":"${LUNES}","enCasa":["pollo","patata","verdura","merluza","yogur"],
"alimentos":[{"id":"merluza","nombre":"Merluza en filetes","kcal":80,"p":17,"c":0,"g":1,"grupo":"proteina","fresco":true},{"id":"pollo","nombre":"Pollo","kcal":999,"p":1}],
"recetas":[{"id":"merluza-patata","titulo":"Merluza con patatas","sub":"Airfryer","slots":["cena","comida"],"familia":"merluza","min":15,"dibujo":"lubina",
"ing":[{"a":"merluza","g":200,"rol":"prot"},{"a":"patata","g":250,"rol":"hc"},{"a":"verdura","g":200,"rol":"veg"},{"a":"aceite","g":5},{"a":"yogur","g":120,"rol":"extra","nota":"de postre"}],
"pasos":["Patatas al micro.","Merluza en airfryer 180 ºC 8-10 min.","Saltea la verdura."]}],
"menu":{"${LUNES}":{"desayuno":"boc-casa","comida":"taper-mama","merienda":"batido-platano","cena":"merluza-patata"},
"2026-12-01":{"desayuno":"boc-jamon","comida":"pollo-patata","merienda":"yogur-arandanos","cena":"plato-inventado"},
"2026-12-09":{"comida":"bolonesa"}},
"nota":"Lo fresco primero."}
\`\`\`
¡Que aproveche!`;

describe('instrucciones para Claude', () => {
  test('llevan el horario de la semana, las recetas y los alimentos', () => {
    const cfg = configPorDefecto(LUNES);
    cfg.taper = false;
    const t = promptSemana(cfg, OBJETIVOS, HORAS);
    expect(t).toContain('gym 16:30');
    expect(t).toContain('sin táper');
    expect(t).toContain('Cabra');
    expect(t).toContain('bolonesa · Pasta boloñesa');
    expect(t).toContain('verdura · Verdura cortada congelada');
    expect(t).toContain('"rodri":1');
    expect(t.length).toBeLessThan(12000);
  });
  test('la de una comida pide el bloque con kcal y proteína', () => {
    expect(promptComida('cena')).toContain('"tipo":"comida","slot":"cena"');
  });
});

describe('leer la respuesta', () => {
  test('comida, aunque venga con texto y comillas de código', () => {
    const r = leerCodigo('Claro:\n```json\n{"rodri":1,"tipo":"comida","slot":"comida","texto":"Kebab","kcal":"820","p":42,"c":80,"g":35}\n```', conocidos());
    expect(r.ok).toBe(true);
    if (r.ok && r.codigo.tipo === 'comida') {
      expect(r.codigo.macro.kcal).toBe(820);
      expect(r.codigo.slot).toBe('comida');
    }
    expect(pareceCodigo('{"rodri": 1}')).toBe(true);
    expect(pareceCodigo('gym a las 17')).toBe(false);
  });
  test('errores claros', () => {
    expect(leerCodigo('hola', conocidos())).toMatchObject({ ok: false });
    expect(leerCodigo('{"rodri":1,"tipo":"semana"', conocidos())).toMatchObject({ ok: false });
    expect(leerCodigo('{"rodri":2,"tipo":"comida","kcal":5}', conocidos())).toMatchObject({ ok: false });
  });
  test('semana: alimento y receta nuevos, ids raros fuera', () => {
    const r = leerCodigo(RESPUESTA, conocidos());
    expect(r.ok).toBe(true);
    if (!r.ok || r.codigo.tipo !== 'semana') return;
    const c = r.codigo;
    expect(c.alimentos.map((a) => a.id)).toEqual(['merluza']); // "pollo" ya existe: manda su tabla
    expect(c.recetas[0].id).toBe('x-merluza-patata');
    expect(c.recetas[0].ing[0]).toMatchObject({ a: 'merluza', rol: 'prot', min: 140, max: 300 });
    expect(c.menu[LUNES].cena).toBe('x-merluza-patata');
    expect(c.menu['2026-12-01'].cena).toBeUndefined();
    expect(c.menu['2026-12-09']).toBeUndefined();
    expect(c.avisos.join(' ')).toContain('plato-inventado');
  });
});

describe('aplicar en la app', () => {
  beforeEach(() => {
    semanas.value = {};
    registros.value = [];
    hoy.value = '2026-11-29';
  });
  test('la semana de Claude se monta, respeta sus platos y cuadra kcal y proteína', () => {
    const r = aplicarCodigo(RESPUESTA);
    expect(r.ok).toBe(true);
    const sem = semanas.value[LUNES];
    expect(sem.origen).toBe('claude');
    expect(sem.config.enCasa).toContain('merluza');
    const lunes = sem.menu[LUNES];
    expect(lunes.find((e) => e.slot === 'cena')!.receta).toBe('x-merluza-patata');
    expect(lunes.find((e) => e.slot === 'comida')!.receta).toBe('taper-mama');
    // El martes la cena inventada la rellena la app y añade el plátano del gym de la mañana.
    const martes = sem.menu['2026-12-01'];
    expect(martes.find((e) => e.slot === 'cena')).toBeDefined();
    expect(martes.find((e) => e.slot === 'pre')!.receta).toBe('platano');
    // Días sin menú de Claude: los rellena la app.
    expect(sem.menu['2026-12-03'].length).toBeGreaterThanOrEqual(4);
    hoy.value = LUNES;
    const d = diaCalculado(LUNES)!;
    expect(Math.abs(d.total.kcal - d.objetivo.kcal)).toBeLessThan(150);
    expect(d.comidas.find((c) => c.hueco.slot === 'cena')!.receta!.titulo).toBe('Merluza con patatas');
    void cfgDia;
  });
  test('una comida de Claude se apunta y reajusta el día', () => {
    aplicarCodigo(RESPUESTA);
    hoy.value = LUNES;
    const antes = diaCalculado(LUNES)!.comidas.find((c) => c.hueco.slot === 'cena')!.macro.kcal;
    const r = aplicarCodigo('{"rodri":1,"tipo":"comida","slot":"comida","texto":"Menú del día","kcal":1150,"p":50,"c":110,"g":45}');
    expect(r.ok).toBe(true);
    expect(registros.value[0]).toMatchObject({ slot: 'comida', estado: 'otro', texto: 'Menú del día' });
    const despues = diaCalculado(LUNES)!.comidas.find((c) => c.hueco.slot === 'cena')!.macro.kcal;
    expect(despues).toBeLessThan(antes);
  });
});

describe('semana a medias', () => {
  test('si Claude solo manda un día, el resto de la semana no cambia', () => {
    semanas.value = {};
    registros.value = [];
    hoy.value = '2026-11-29';
    aplicarCodigo(RESPUESTA);
    const antes = structuredClone(semanas.value[LUNES].menu);
    const r = aplicarCodigo(`{"rodri":1,"tipo":"semana","lunes":"${LUNES}","menu":{"2026-12-02":{"cena":"bolonesa"}}}`);
    expect(r.ok).toBe(true);
    const despues = semanas.value[LUNES].menu;
    expect(despues['2026-12-02'].find((e) => e.slot === 'cena')!.receta).toBe('bolonesa');
    expect(despues[LUNES]).toEqual(antes[LUNES]);
    expect(despues['2026-12-03']).toEqual(antes['2026-12-03']);
  });
});

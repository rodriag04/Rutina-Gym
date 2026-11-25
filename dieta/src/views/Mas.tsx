import { useState } from 'preact/hooks';
import { IAjustes, ICamara, ICopa, ICopia, IFlecha, IFuego, IGym, IInfo, ILibro, INota, IHoja, type Icono } from '../components/Iconos';
import { Hoja } from '../components/Hoja';
import { ImagenPlato } from '../components/Imagen';
import { ALIMENTOS } from '../data/alimentos';
import { RECETAS, VERDURAS } from '../data/recetas';
import { db } from '../lib/db';
import { correcciones, exportar, horas, hoy, importar, notas, objetivos, prefs, proximoLunes } from '../lib/estado';

const diaSemanaHoy = () => diaSemana(hoy.value);
import { diaSemana, fechaCorta, lunesDe } from '../lib/fechas';
import { HORAS, type Horas } from '../lib/horario';
import { macroReceta } from '../lib/nutricion';
import { OBJETIVOS } from '../lib/plan';
import type { Alimento, Slot } from '../lib/tipos';
import { abrir, avisar, fmt } from '../lib/ui';

const RUTINA = '/Rutina-Gym/';

export function Mas() {
  const sinCopia = !prefs.value.ultimaCopia || Date.now() - Date.parse(prefs.value.ultimaCopia) > 7 * 86400000;
  const items: [Icono, string, string, () => void][] = [
    [IGym, 'Rutina del gym', 'Tu app de entrenamiento', () => (location.href = RUTINA)],
    [ICamara, 'Semana con Claude', 'Foto de la compra → comidas con lo que tienes', () => abrir({ t: 'claude', lunes: diaSemanaHoy() >= 4 ? proximoLunes() : lunesDe(hoy.value) })],
    [ICopa, 'Fin de semana', 'Regla del plato, domingo y calculadora de copas', () => abrir({ t: 'finde' })],
    [IFuego, 'Airfryer', 'Temperaturas y tiempos', () => abrir({ t: 'airfryer' })],
    [ILibro, 'Recetario', `${RECETAS.length} platos con foto y preparación`, () => abrir({ t: 'recetario' })],
    [INota, 'Tus notas', `${notas.value.length} comentarios`, () => abrir({ t: 'notas' })],
    [IHoja, 'Alimentos', 'Tabla de kcal y proteína (editable)', () => abrir({ t: 'alimentos' })],
    [IInfo, 'Cómo se calcula', 'Objetivos, reparto y reglas del plan', () => abrir({ t: 'metodo' })],
    [ICopia, 'Copia de seguridad', sinCopia ? 'Hace más de una semana: haz una' : `Última: ${fechaCorta(prefs.value.ultimaCopia!.slice(0, 10))}`, () => abrir({ t: 'copia' })],
    [IAjustes, 'Ajustes', 'Horas de comida, objetivos y tema', () => abrir({ t: 'ajustes' })]
  ];
  return (
    <>
      <header class="cabecera">
        <div>
          <div class="sub">Comidas · Rodri</div>
          <h1>Más</h1>
        </div>
      </header>
      <div class="lista-menu">
        {items.map(([Ic, t, d, fn]) => (
          <button class="item-menu pulsable" onClick={fn}>
            <span class="icono">
              <Ic />
            </span>
            <div>
              <div class="t">{t}</div>
              <div class="d" style={t === 'Copia de seguridad' && sinCopia ? 'color:var(--aviso)' : ''}>
                {d}
              </div>
            </div>
            <IFlecha />
          </button>
        ))}
      </div>
      <p class="muted" style="text-align:center;font-size:12px;margin-top:22px">Versión {__VERSION_DIETA__} · Datos guardados en este iPhone</p>
    </>
  );
}

const CHULETA = [
  ['Precalentar', 'la del plato', '3 min', 'Siempre'],
  ['Pechuga de pollo entera', '180 ºC', '14-18 min', 'Vuelta a mitad, reposo 3 min'],
  ['Tiras de pollo + gajos', '200 ºC', '10-12 min', 'Agitar a mitad'],
  ['Salmón (lomo)', '180 ºC', '9-11 min', 'Piel abajo, sin dar la vuelta, sin aceite'],
  ['Salmón en dados', '180 ºC', '7-8 min', ''],
  ['Lubina en filetes', '180 ºC', '8-10 min', 'Piel abajo sobre papel recortado'],
  ['Hamburguesa 1,5 cm', '190 ºC', '10-12 min', 'Hoyo en el centro, vuelta a mitad'],
  ['Albóndigas', '190 ºC', '8-10 min', 'Agitar a mitad'],
  ['Solomillo en medallones', '200 ºC', '8-10 min', 'Vuelta a mitad, punto 63 ºC'],
  ['Filetes de cinta de lomo', '200 ºC', '6-8 min', 'Vuelta a mitad'],
  ['Pizza wrap', '200 ºC', '6-8 min', 'Pincha la tortilla si se infla'],
  ['Tostar patatas del micro', '200 ºC', '5-8 min', ''],
  ['Gratinar', '200 ºC', '4-5 min', '']
];

export function Airfryer() {
  return (
    <Hoja titulo="Airfryer · Moulinex Easy Fry Max">
      <div class="tarjeta" style="padding:4px 14px">
        <table class="tabla">
          <thead>
            <tr>
              <th>Qué</th>
              <th>ºC</th>
              <th>Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {CHULETA.map(([q, t, m, n]) => (
              <tr>
                <td>
                  <b>{q}</b>
                  {n && <div class="muted" style="font-size:12.5px">{n}</div>}
                </td>
                <td class="n">{t}</td>
                <td class="n">{m}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div class="seccion">
        <h2>Reglas</h2>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        {['Una sola capa: si amontonas, cuece en vez de dorar.', '1 cucharadita de aceite como mucho.', 'Agita o da la vuelta a mitad.', 'Papel solo debajo y recortado: si sube por las paredes, corta el aire.'].map((x, k) => (
          <div class="regla">
            <span class="n">{k + 1}</span>
            <span>{x}</span>
          </div>
        ))}
      </div>
    </Hoja>
  );
}

const GRUPOS: [Slot, string][] = [
  ['desayuno', 'Desayunos'],
  ['comida', 'Comidas'],
  ['cena', 'Cenas'],
  ['merienda', 'Meriendas'],
  ['pre', 'Pre-gym']
];

export function Recetario() {
  const [g, setG] = useState<Slot>('comida');
  const lista = RECETAS.filter((r) => r.slots[0] === g || (g === 'cena' && r.slots.includes('cena') && r.slots[0] !== 'comida'));
  return (
    <Hoja titulo="Recetario">
      <div class="segmentado" style="margin-bottom:12px;overflow-x:auto">
        {GRUPOS.map(([s, n]) => (
          <button class={g === s ? 'on' : ''} onClick={() => setG(s)}>
            {n}
          </button>
        ))}
      </div>
      <div class="rejilla">
        {(g === 'comida' ? [...lista, VERDURAS] : lista).map((r) => {
          const m = macroReceta(r);
          return (
            <button class="receta-tarjeta pulsable" onClick={() => abrir({ t: 'receta', id: r.id })}>
              <div class="img">
                <ImagenPlato receta={r.id} />
              </div>
              <div class="t">
                <h3>{r.titulo}</h3>
                <div class="d">
                  {fmt(m.kcal)} kcal · {fmt(m.p)} g · {r.min}′
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Hoja>
  );
}

export function Alimentos() {
  const [abierto, setAbierto] = useState<string | null>(null);
  return (
    <Hoja titulo="Alimentos">
      <p class="muted" style="margin:0 2px 10px;font-size:14px">
        Valores por 100 g. Si la etiqueta de tu envase dice otra cosa, cámbialo aquí y todo el plan se recalcula.
      </p>
      <div class="tarjeta" style="padding:4px 16px">
        {ALIMENTOS.filter((a) => !a.basico).map((base) => {
          const a: Alimento = { ...base, ...correcciones.value[base.id] };
          const editado = !!correcciones.value[base.id];
          return (
            <div style="border-bottom:1px solid var(--line);padding:10px 0">
              <button class="fila entre" style="width:100%;text-align:left" onClick={() => setAbierto(abierto === a.id ? null : a.id)}>
                <span style="font-weight:600">
                  {a.nombre}
                  {editado && <span class="marca-ajuste">editado</span>}
                </span>
                <span class="num muted" style="font-size:13px;white-space:nowrap">
                  {a.kcal} · {a.p} g
                </span>
              </button>
              {abierto === a.id && (
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px">
                  {(['kcal', 'p', 'c', 'g'] as const).map((k) => (
                    <label>
                      <div class="etiqueta">{{ kcal: 'kcal', p: 'Prot', c: 'Hidr', g: 'Grasa' }[k]}</div>
                      <input
                        class="campo num"
                        inputMode="decimal"
                        style="padding:8px"
                        value={String(a[k]).replace('.', ',')}
                        onChange={(e) => {
                          const v = Number((e.target as HTMLInputElement).value.replace(',', '.'));
                          if (!Number.isFinite(v) || v < 0) return;
                          correcciones.value = { ...correcciones.value, [a.id]: { ...correcciones.value[a.id], [k]: v } };
                        }}
                      />
                    </label>
                  ))}
                  {editado && (
                    <button
                      class="btn peq borde"
                      style="grid-column:1/-1"
                      onClick={() => {
                        const c = { ...correcciones.value };
                        delete c[a.id];
                        correcciones.value = c;
                      }}
                    >
                      Volver al valor original
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Hoja>
  );
}

export function Notas() {
  const lista = [...notas.value].reverse();
  return (
    <Hoja titulo="Tus notas">
      <p class="muted" style="margin:0 2px 10px;font-size:14px">
        Lo que escribes en "Cuéntame". Debajo, lo que entendió la app y cambió en el plan.
      </p>
      {lista.length === 0 && <div class="tarjeta vacio">Aún no hay notas.</div>}
      {lista.map((n) => (
        <div class="tarjeta">
          <div class="etiqueta">
            {fechaCorta(n.fecha)} · {n.hora}
          </div>
          <div style="font-weight:600;margin-top:2px">{n.texto}</div>
          {n.aplicado.length > 0 ? (
            <ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:var(--verde)">
              {n.aplicado.map((x) => (
                <li>{x}</li>
              ))}
            </ul>
          ) : (
            <div class="muted" style="font-size:13px;margin-top:4px">Sin cambios en el plan</div>
          )}
        </div>
      ))}
      {lista.length > 0 && (
        <button
          class="btn borde ancho"
          style="margin-top:12px"
          onClick={async () => {
            const t = lista
              .slice(0, 40)
              .reverse()
              .map((n) => `${n.fecha} ${n.hora}: ${n.texto}`)
              .join('\n');
            await navigator.clipboard?.writeText(t).catch(() => {});
            avisar(['Notas copiadas: pégalas en tu proyecto de Claude si quieres revisarlas.']);
          }}
        >
          <ICopia /> Copiar notas
        </button>
      )}
    </Hoja>
  );
}

export function Copia() {
  const descargar = async (conFotos: boolean) => {
    const datos = exportar();
    if (conFotos) {
      const fotos = await db.todasFotos();
      const out: Record<string, string> = {};
      for (const [k, b] of fotos) out[k] = await new Promise<string>((ok) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result));
        r.readAsDataURL(b);
      });
      datos.fotos = out;
    }
    const nombre = `comidas-rodri-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([JSON.stringify(datos)], nombre, { type: 'application/json' });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: nombre });
      else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = nombre;
        a.click();
      }
      prefs.value = { ...prefs.value, ultimaCopia: new Date().toISOString() };
      avisar(['Copia lista. Guárdala en Archivos → iCloud Drive.']);
    } catch {
      /* cancelado */
    }
  };
  const subir = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try {
      const datos = JSON.parse(await f.text());
      importar(datos);
      if (datos.fotos) {
        for (const [k, url] of Object.entries(datos.fotos as Record<string, string>)) {
          const b = await (await fetch(url)).blob();
          await db.guardarFoto(k, b);
        }
      }
      avisar(['Copia importada.']);
    } catch (err) {
      avisar([`No se pudo importar: ${(err as Error).message}`]);
    }
  };
  return (
    <Hoja titulo="Copia de seguridad">
      <p class="texto-2" style="margin:0 2px 12px;font-size:14px">
        Tus datos viven en este iPhone. Haz una copia cada semana y guárdala en iCloud Drive: si cambias de móvil o borras la app, la importas y lo recuperas todo.
      </p>
      <div style="display:grid;gap:8px">
        <button class="btn primario ancho" onClick={() => descargar(false)}>
          <ICopia /> Guardar copia (sin fotos)
        </button>
        <button class="btn ancho" onClick={() => descargar(true)}>
          Guardar copia con fotos
        </button>
        <label class="btn borde ancho">
          Importar una copia
          <input type="file" accept="application/json,.json" class="oculto" onChange={subir} />
        </label>
      </div>
      <ol class="pasos" style="margin-top:18px">
        <li>Pulsa "Guardar copia".</li>
        <li>En el menú de compartir elige "Guardar en Archivos".</li>
        <li>iCloud Drive → una carpeta "Comidas" → Guardar.</li>
      </ol>
    </Hoja>
  );
}

export function Ajustes() {
  const h = horas.value;
  const set = (k: keyof Horas, v: string) => /^\d{2}:\d{2}$/.test(v) && (horas.value = { ...h, [k]: v });
  const o = objetivos.value;
  const campos: [keyof Horas, string][] = [
    ['desayunoCasa', 'Desayuno en casa'],
    ['desayuno', 'Bocadillo (descanso de clase)'],
    ['comida', 'Comida'],
    ['merienda', 'Merienda'],
    ['cena', 'Cena'],
    ['finClase', 'Fin de las clases']
  ];
  return (
    <Hoja titulo="Ajustes">
      <div class="seccion" style="margin-top:4px">
        <h2>Horas</h2>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        {campos.map(([k, t]) => (
          <div class="opcion">
            <div class="t">{t}</div>
            <input type="time" class="campo-hora" value={h[k]} onChange={(e) => set(k, (e.target as HTMLInputElement).value)} />
          </div>
        ))}
      </div>
      <button class="btn peq borde" style="margin-top:8px" onClick={() => (horas.value = HORAS)}>
        Volver a las horas de siempre
      </button>

      <div class="seccion">
        <h2>Objetivos</h2>
        <span class="mas">mejor con la recomendación de Progreso</span>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        {(
          [
            ['kcalGym', 'kcal días de gym'],
            ['kcalDescanso', 'kcal días de descanso'],
            ['prot', 'Proteína (g)'],
            ['futbol', 'kcal extra por partido']
          ] as const
        ).map(([k, t]) => (
          <div class="opcion">
            <div class="t">{t}</div>
            <input
              class="campo-hora"
              inputMode="numeric"
              value={o[k]}
              onChange={(e) => {
                const v = Number((e.target as HTMLInputElement).value);
                if (v > 0 && v < 5000) objetivos.value = { ...o, [k]: v };
              }}
            />
          </div>
        ))}
      </div>
      <button class="btn peq borde" style="margin-top:8px" onClick={() => (objetivos.value = OBJETIVOS)}>
        Volver a 2.325 / 2.125 kcal y 160 g
      </button>

      <div class="seccion">
        <h2>Tema</h2>
      </div>
      <div class="segmentado">
        {(
          [
            ['auto', 'Automático'],
            ['claro', 'Claro'],
            ['oscuro', 'Oscuro']
          ] as const
        ).map(([v, t]) => (
          <button class={prefs.value.tema === v ? 'on' : ''} onClick={() => (prefs.value = { ...prefs.value, tema: v })}>
            {t}
          </button>
        ))}
      </div>
    </Hoja>
  );
}

export function Metodo() {
  const o = objetivos.value;
  return (
    <Hoja titulo="Cómo se calcula">
      <div class="tarjeta">
        <div class="etiqueta">Punto de partida</div>
        <p style="margin:6px 0 0;font-size:15px">
          22 años, 1,82 m, 72 kg, ≈18-20 % de grasa. Gasto estimado con 10.000 pasos y 4 días de gym: <b>≈2.650 kcal/día</b> (Mifflin-St Jeor 1.752 kcal × 1,5).
        </p>
      </div>
      <div class="tarjeta">
        <div class="etiqueta">Objetivo: recomposición</div>
        <p style="margin:6px 0 0;font-size:15px">
          Déficit pequeño + proteína alta + entreno con progresión. Gym <b class="num">{fmt(o.kcalGym)}</b> kcal, descanso <b class="num">{fmt(o.kcalDescanso)}</b> kcal, proteína <b class="num">{o.prot} g</b> (2,2 g/kg) repartida en 4 comidas.
        </p>
      </div>
      <div class="tarjeta">
        <div class="etiqueta">Cómo monta cada día</div>
        <ol class="pasos" style="margin-top:10px">
          <li>Coloca las comidas alrededor del gym: plátano 30-45 min antes, hidratos y proteína después. Sin batido si sales del gym a clase.</li>
          <li>Elige platos sin repetir proteína en el día, ni el mismo plato en comida y cena, ni dos días seguidos.</li>
          <li>Calcula kcal y proteína con la tabla de alimentos (nunca a ojo) y escala la proteína y los hidratos de cada plato hasta cuadrar el día.</li>
          <li>Más hidratos pegados al entreno; días de descanso, menos hidratos y algo más de nueces.</li>
          <li>Si apuntas algo distinto, recalcula solo lo que queda del día. Si te pasas, no lo compenses al día siguiente.</li>
        </ol>
      </div>
      <div class="tarjeta">
        <div class="etiqueta">Ajustes automáticos</div>
        <p style="margin:6px 0 0;font-size:15px">
          Si en 3 semanas la cintura no baja: −150 kcal los días de descanso. Si bajas más de 0,5 kg por semana o pierdes fuerza: +150 kcal los días de gym. Fútbol: +{o.futbol} kcal de hidratos en la comida de después.
        </p>
      </div>
      <p class="muted" style="font-size:12.5px;margin:12px 2px">
        Valores de los alimentos: etiquetas de Mercadona/Hacendado y tablas BEDCA. Margen de error normal de una etiqueta: ±10 %.
      </p>
    </Hoja>
  );
}

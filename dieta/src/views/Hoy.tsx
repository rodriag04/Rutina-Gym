import { useMemo, useState } from 'preact/hooks';
import { Anillo, BarraMacro } from '../components/Anillo';
import { IAviso, IBalon, IBascula, ICheck, ICoche, ICopo, ICompra, IEnviar, IGym, INevera, ISaltar } from '../components/Iconos';
import { ImagenPlato } from '../components/Imagen';
import { tareasSemana, type Tarea } from '../lib/compra';
import { aMin, diaSemana, fechaCorta, DIAS } from '../lib/fechas';
import {
  aplicarAcciones,
  aplicarCodigo,
  borrarRegistro,
  diaCalculado,
  horas,
  hoy,
  objetivos,
  prefs,
  registrar,
  restaurar,
  semanaActual,
  tareasHechas
} from '../lib/estado';
import { interpretar } from '../lib/notas';
import { pareceCodigo } from '../lib/claude';
import { calcularDia, type ComidaDia, type DiaCalculado } from '../lib/plan';
import { abrir, avisar, fmt, pestana } from '../lib/ui';
import { cfgDia } from '../lib/generador';
import { porQue, resumenCantidades } from '../lib/explicar';
import { Finde } from './Finde';

const ICONO_TAREA = { compra: ICompra, congelar: ICopo, descongelar: INevera, pesar: IBascula, medidas: IBascula } as const;

export function Hoy() {
  const fecha = hoy.value;
  const d = diaCalculado(fecha);
  const i = diaSemana(fecha);
  return (
    <>
      <header class="cabecera">
        <div>
          <div class="sub">{fechaCorta(fecha)}</div>
          <h1>{DIAS[i]}</h1>
        </div>
      </header>
      {d ? <DiaHoy d={d} /> : <Finde enPestana />}
    </>
  );
}

function DiaHoy({ d }: { d: DiaCalculado }) {
  const sem = semanaActual.value!;
  const tareas = useMemo(() => tareasSemana(sem, objetivos.value, horas.value).filter((t) => t.fecha === d.fecha), [sem, objetivos.value, horas.value, d.fecha]);
  const base = useMemo(() => {
    const i = sem.config.dias.findIndex((x) => x.fecha === d.fecha);
    const b = calcularDia(d.fecha, cfgDia(sem.config, i), sem.menu[d.fecha] ?? [], [], objetivos.value, horas.value);
    return new Map(b.comidas.map((c) => [c.hueco.slot, c.macro.kcal]));
  }, [sem, d.fecha, objetivos.value, horas.value]);

  const gym = d.eventos.find((e) => e.tipo === 'gym');
  const fut = d.eventos.find((e) => e.tipo === 'futbol');
  const libre = d.comidas.find((c) => c.hueco.libre && !c.registro);

  type Paso = { hora: string; k: string; el: preact.JSX.Element; hecho?: boolean; evento?: boolean };
  const pasos: Paso[] = [];
  const proxima = d.comidas.find((c) => !c.registro && !c.hueco.libre);
  for (const c of d.comidas)
    pasos.push({ hora: c.hueco.hora, k: c.hueco.slot, el: <TarjetaComida d={d} c={c} base={base.get(c.hueco.slot)} />, hecho: !!c.registro });
  for (const e of d.eventos) {
    const Ic = e.tipo === 'gym' ? IGym : e.tipo === 'futbol' ? IBalon : ICoche;
    pasos.push({
      hora: e.hora,
      k: e.tipo + e.hora,
      evento: true,
      el: (
        <div class="evento-tarjeta">
          <span class="icono">
            <Ic />
          </span>
          <div>
            <div class="t">
              {e.texto}
              {e.fin ? <span class="num" style="font-size:13px;opacity:.75;margin-left:8px">{e.hora}–{e.fin}</span> : null}
            </div>
            {e.detalle && <div class="d">{e.detalle}</div>}
          </div>
        </div>
      )
    });
  }
  for (const t of tareas) pasos.push({ hora: t.hora, k: t.tipo + t.hora, el: <TarjetaTarea t={t} />, hecho: tareasHechas.value.includes(clave(t)) });
  pasos.sort((a, b) => aMin(a.hora) - aMin(b.hora));

  const previsto = d.total;
  return (
    <>
      <section class="heroe">
        <div class="heroe-fila">
          <Anillo comido={d.comido.kcal} previsto={previsto.kcal} objetivo={d.objetivo.kcal} />
          <div class="macros">
            <div class="etiqueta">{gym ? 'Día de gym' : 'Día de descanso'}</div>
            <BarraMacro nombre="Proteína" color="var(--prot)" comido={d.comido.p} previsto={previsto.p} objetivo={d.objetivo.p} />
            <div class="mini-macros">
              <div>
                <span>
                  <i style="background:var(--hc)" />
                  Hidratos
                </span>
                <b class="num">{fmt(previsto.c)} g</b>
              </div>
              <div>
                <span>
                  <i style="background:var(--grasa)" />
                  Grasa
                </span>
                <b class="num">{fmt(previsto.g)} g</b>
              </div>
            </div>
          </div>
        </div>
        <div class="chips-heroe">
          {gym && (
            <span class="chip lima">
              <IGym /> {gym.hora} · {gym.detalle ?? 'Gimnasio'}
            </span>
          )}
          {fut && (
            <span class="chip">
              <IBalon /> Fútbol {fut.hora}
            </span>
          )}
          {libre && <span class="chip">{libre.hueco.slot === 'cena' ? 'Cena libre' : 'Comida fuera'}</span>}
          {d.fuera && (
            <span class="chip">
              <ICoche /> Tarde en Cabra
            </span>
          )}
          <span class="chip">Objetivo {fmt(d.objetivo.kcal)} kcal</span>
        </div>
      </section>

      <Cuentame />
      <Bienvenida />

      {d.aviso && (
        <div class="aviso">
          <IAviso />
          <span>{d.aviso}</span>
        </div>
      )}

      <div class="seccion">
        <h2>Tu día</h2>
        <span class="mas">Toca un plato para ver la receta</span>
      </div>
      <PorQue lineas={porQue(d, tareas, objetivos.value, { lunes: d.fecha === sem.config.lunes, taper: sem.config.taper })} />
      <div class="linea">
        {pasos.map((p) => (
          <div key={p.k} class={`paso-linea${p.hecho ? ' hecha' : ''}${p.evento ? ' evento' : ''}${proxima && p.k === proxima.hueco.slot ? ' ahora' : ''}`}>
            <div class="hora">{p.hora}</div>
            <div>{p.el}</div>
          </div>
        ))}
      </div>

      <Resto d={d} />
    </>
  );
}

export function PorQue({ lineas }: { lineas: string[] }) {
  if (!lineas.length) return null;
  return (
    <div class="porque">
      <b>Por qué</b> {lineas.join(' ')}
    </div>
  );
}

const clave = (t: Tarea) => `${t.fecha}|${t.tipo}|${t.hora}`;

function TarjetaTarea({ t }: { t: Tarea }) {
  const hecha = tareasHechas.value.includes(clave(t));
  const Ic = ICONO_TAREA[t.tipo];
  const cambiar = () => {
    const k = clave(t);
    tareasHechas.value = hecha ? tareasHechas.value.filter((x) => x !== k) : [...tareasHechas.value, k];
  };
  return (
    <button class={`tarea pulsable${hecha ? ' hecha' : ''}`} onClick={cambiar}>
      <span class="icono">{hecha ? <ICheck /> : <Ic />}</span>
      <div>
        <div class="t" style="font-weight:700">
          {t.texto}
        </div>
        {t.detalle.length > 0 && (
          <ul>
            {t.detalle.map((x) => (
              <li>{x}</li>
            ))}
          </ul>
        )}
      </div>
    </button>
  );
}

function TarjetaComida({ d, c, base }: { d: DiaCalculado; c: ComidaDia; base?: number }) {
  const r = c.registro;
  const slot = c.hueco.slot;
  if (c.hueco.libre && !r) {
    return (
      <button class="comida pulsable" onClick={() => abrir({ t: 'registrar', fecha: d.fecha, slot })}>
        <div class="miniatura" style="display:grid;place-items:center;background:var(--surface-2)">
          <span style="font-family:var(--f-titulo);font-weight:800;font-size:28px;color:var(--ink-3)">½</span>
        </div>
        <div>
          <div class="etiqueta">{c.hueco.etiqueta} · libre</div>
          <h3>Regla del plato</h3>
          <div class="datos">Carne o pescado (2 palmas), 1-2 puños de hidratos, verdura. ≈{fmt(c.macro.kcal)} kcal</div>
        </div>
        <span class="check" />
      </button>
    );
  }
  const titulo = r?.estado === 'otro' ? r.texto || 'Otra cosa' : r?.estado === 'saltada' ? c.receta?.titulo ?? 'Saltada' : c.receta?.titulo ?? '';
  const cambio = !r && c.ajustada && base !== undefined && Math.abs(base - c.macro.kcal) > 25;
  const marcar = (e: Event) => {
    e.stopPropagation();
    if (r) {
      const prev = r;
      borrarRegistro(d.fecha, slot);
      avisar(['Marca quitada'], () => registrar(prev.fecha, prev.slot, prev.estado, prev.macro, { texto: prev.texto, foto: prev.foto }));
    } else {
      registrar(d.fecha, slot, 'hecho', c.macro);
      avisar([`${c.receta?.titulo}: hecho`], () => borrarRegistro(d.fecha, slot), 3500);
    }
  };
  return (
    <button
      class={`comida pulsable${r ? ' hecha' : ''}`}
      onClick={() => (c.receta ? abrir({ t: 'receta', fecha: d.fecha, slot, id: c.receta.id }) : abrir({ t: 'registrar', fecha: d.fecha, slot }))}
    >
      <div class="miniatura">
        <ImagenPlato receta={r?.estado === 'otro' ? undefined : c.receta?.id} foto={r?.foto} />
      </div>
      <div style="min-width:0">
        <div class="etiqueta">
          {c.hueco.etiqueta}
          {cambio && <span class="marca-ajuste">{c.macro.kcal > base! ? '+' : '−'}{fmt(Math.abs(c.macro.kcal - base!))} kcal</span>}
        </div>
        <h3>{titulo}</h3>
        {!r && c.porciones.length > 0 && <div class="cantidades">{resumenCantidades(c.porciones)}</div>}
        <div class="datos">
          {r?.estado === 'saltada' ? (
            <span>Saltada</span>
          ) : (
            <>
              <span>
                <b class="num">{fmt(c.macro.kcal)}</b> kcal
              </span>
              <span>
                <b class="num">{fmt(c.macro.p)}</b> g prot
              </span>
            </>
          )}
        </div>
      </div>
      <span
        class={`check${r?.estado === 'hecho' ? ' on' : r?.estado === 'otro' ? ' otro' : r?.estado === 'saltada' ? ' saltada' : ''}`}
        role="checkbox"
        aria-checked={!!r}
        aria-label={r ? 'Quitar marca' : 'Marcar como hecha'}
        onClick={marcar}
      >
        {r?.estado === 'saltada' ? <ISaltar /> : <ICheck />}
      </span>
    </button>
  );
}

function Resto({ d }: { d: DiaCalculado }) {
  if (d.comidas.every((c) => c.registro)) {
    const dk = Math.round(d.comido.kcal - d.objetivo.kcal);
    return (
      <div class="resto">
        Día cerrado: <b class="num">{fmt(d.comido.kcal)} kcal</b> y <b class="num">{fmt(d.comido.p)} g</b> de proteína ({dk >= 0 ? '+' : ''}
        {dk} kcal sobre el objetivo).
      </div>
    );
  }
  return (
    <div class="resto">
      Te quedan <b class="num">{fmt(d.pendiente.kcal)} kcal</b> y <b class="num">{fmt(d.pendiente.p)} g</b> de proteína en lo que falta del plan
      {d.fuera ? ` (más la tarde en Cabra, ≈${fmt(d.fuera.kcal)} kcal)` : ''}.
    </div>
  );
}

function Bienvenida() {
  if (prefs.value.bienvenida) return null;
  const ok = () => (prefs.value = { ...prefs.value, bienvenida: true });
  return (
    <div class="tarjeta" style="margin-top:12px;box-shadow:inset 0 0 0 2px var(--verde)">
      <div style="font-family:var(--f-titulo);font-weight:800;font-size:18px">Tu semana ya está montada</div>
      <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;color:var(--ink-2)">
        <li>Toca el círculo de cada comida al acabarla. Si comes otra cosa, abre el plato → "Comí otra cosa" y el resto del día se reajusta.</li>
        <li>Escribe en "Cuéntame" lo que cambie: "gym a las 17", "ceno fuera", "peso 71,8".</li>
        <li>Revisa el horario del gym, el táper y lo que tienes en casa.</li>
      </ul>
      <div class="botones" style="margin-top:12px">
        <button class="btn primario" onClick={() => (ok(), abrir({ t: 'generador', lunes: semanaActual.value!.id }))}>
          Revisar semana
        </button>
        <button class="btn" onClick={ok}>
          Entendido
        </button>
      </div>
    </div>
  );
}

const EJEMPLOS = ['gym a las 17:30', 'hoy ceno fuera', 'partido a las 21', 'peso 71,8', 'no he merendado', 'mañana desayuno en casa'];

function Cuentame() {
  const [txt, setTxt] = useState('');
  const ej = EJEMPLOS[Math.floor(Date.now() / 86400000) % EJEMPLOS.length];
  const enviar = (e: Event) => {
    e.preventDefault();
    const t = txt.trim();
    if (!t) return;
    if (pareceCodigo(t)) {
      const r = aplicarCodigo(t);
      setTxt('');
      (document.activeElement as HTMLElement | null)?.blur();
      if (!r.ok) return avisar([r.error]);
      if (r.semana) pestana.value = 'semana';
      return avisar(r.lineas, () => restaurar(r.deshacer), 9000);
    }
    const { acciones, resumen } = interpretar(t, hoy.value);
    const antes = aplicarAcciones(acciones, t, resumen);
    setTxt('');
    (document.activeElement as HTMLElement | null)?.blur();
    if (acciones.length) avisar(resumen, () => restaurar(antes), 8000);
    else avisar(['Guardado en tus notas.', 'No he visto nada que cambiar en el plan. Prueba con horas, "ceno fuera", "peso 72"…']);
  };
  return (
    <form class="cuentame" onSubmit={enviar}>
      <input value={txt} onInput={(e) => setTxt((e.target as HTMLInputElement).value)} placeholder={`Cuéntame: "${ej}"`} enterKeyHint="send" aria-label="Cuéntame qué ha cambiado" />
      <button type="submit" disabled={!txt.trim()} aria-label="Enviar">
        <IEnviar />
      </button>
    </form>
  );
}

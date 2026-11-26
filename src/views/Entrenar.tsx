import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { MapaMuscular } from '../components/MapaMuscular';
import { Hoja } from '../components/Hoja';
import { IcoAviso, IcoBaja, IcoCheck, IcoDcha, IcoIgual, IcoMas, IcoMenos, IcoSube, IcoX } from '../components/Iconos';
import { DIAS, PERFIL, bloqueDe, dia as getDia, duracionEstimada, ejercicio, etiquetas, type DiaId, type Ejercicio } from '../data/rutina';
import { conPesoCorporal } from '../lib/cargas';
import { avisos, diaSugerido, textoSeries } from '../lib/analisis';
import {
  ajustes, borrador, descargaActiva, diaEnPantalla, escalera, medidas, notasEjercicio, nuevoBorrador, pesoCorporal, seriesHechas, sesiones, setBorrador, type Borrador
} from '../lib/estado';
import { fechaCorta, fechaLarga, hoyISO, kg as fkg, lunesDe, mmss } from '../lib/formato';
import { calentamientoGenerico, e1rm, planificar, repsCon, resolverAlt, type Plan } from '../lib/progresion';
import { ir } from '../lib/ruta';
import { comoVariante, esVariante, planVariante } from '../lib/variantes';
import { mantenerPantalla, prepararAudio } from '../lib/sonido';
import type { Serie } from '../lib/tipos';
import { Terminar } from './Terminar';

const rirTexto = (rir: string) => (PERFIL.sencillo ? `te sobran ${rir}` : `RIR ${rir}`);

interface Fila { kg: number; reps: number; hecha?: Serie; alt?: string }

function fila(ex: Ejercicio, plan: Plan, b: Borrador | null, i: number, pc: number): Fila {
  const hecha = b?.ex[ex.id]?.[i] ?? undefined;
  if (hecha) return { kg: hecha.kg, reps: hecha.reps, hecha };
  const base = plan.series[Math.min(i, plan.series.length - 1)] ?? { kg: 0, reps: ex.max };
  let { kg, reps } = base.alt ? resolverAlt(base, b?.ex[ex.id]?.[0]?.reps) : base;
  const alt = base.alt && b?.ex[ex.id]?.[0] == null ? `Si la 1.ª no llega a 8: ${fkg(base.alt.kg)} kg × ${base.alt.reps}` : undefined;
  const elegido = b?.pesos[ex.id]?.[i];
  if (elegido != null && Math.abs(elegido - kg) > 0.01) {
    const carga = (k: number) => (conPesoCorporal(ex.carga) ? pc + k : k);
    reps = kg > 0 || conPesoCorporal(ex.carga)
      ? Math.max(1, Math.min(ex.max + 3, Math.floor(repsCon(e1rm(carga(kg), reps), carga(elegido)))))
      : reps;
    kg = elegido;
  }
  return { kg, reps, alt };
}

export function Entrenar() {
  const b = borrador.value;
  const hoy = hoyISO();
  const [diaElegido, setDiaElegido] = useState<DiaId>(() => diaSugerido(sesiones.value, hoy));
  const [pesoAbierto, setPesoAbierto] = useState<{ ex: Ejercicio; i: number; kg: number } | null>(null);
  const [cambioDia, setCambioDia] = useState<DiaId | null>(null);
  const [terminar, setTerminar] = useState(false);
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null);
  // Al guardar, el borrador pasa a null: la hoja de "Sesión guardada" sigue con el último.
  const ultimo = useRef<Borrador | null>(null);
  if (b) ultimo.current = b;

  const diaId = b?.dia ?? diaElegido;
  const d = getDia(diaId);
  const gym = b?.gym ?? ajustes.value.gymPorDefecto;
  const descarga = b?.descarga ?? descargaActiva();
  const pc = pesoCorporal.value;
  const et = etiquetas(diaId);
  useEffect(() => {
    diaEnPantalla.value = diaId;
  }, [diaId]);

  const base = useMemo(
    () => sesiones.value.filter((s) => s.id !== b?.editando && (!b || s.fecha <= b.fecha)),
    [sesiones.value, b?.editando, b?.fecha]
  );
  const planes = useMemo(() => {
    const m = new Map<string, Plan>();
    const v = new Map<string, Plan>();
    for (const id of d.bloques.flat()) {
      const ex = ejercicio(id)!;
      const c = { sesiones: base, gym, escalera: escalera(ex.carga), pesoCorporal: pc, descarga };
      m.set(id, planificar(ex, c));
      if (ex.variante) v.set(id, planVariante(ex, { ...c, escaleraDe: (e: Ejercicio) => escalera(e.carga) }));
    }
    return { m, v };
  }, [base, gym, diaId, descarga, pc, ajustes.value.escalones]);

  /** El ejercicio como se hace hoy: el de la rutina o su variante. */
  const vista = (id: string): Ejercicio => {
    const ex = ejercicio(id)!;
    return esVariante(id, b?.sustituto?.[id]) ? comoVariante(ex) : ex;
  };

  const lista = avisos(sesiones.value, hoy, { ultimaCopia: ajustes.value.ultimaCopia, medidas: medidas.value, pc }).filter((a) => a.nivel !== 'info' || a.id === 'medidas');
  const totalSeries = d.bloques.flat().reduce((a, id) => a + nSeries(vista(id)), 0);
  const hechas = seriesHechas(b);
  const semana = lunesDe(hoy);
  const hechosSemana = new Set(sesiones.value.filter((s) => s.fecha >= semana && s.fecha <= hoy).map((s) => s.dia));

  function nSeries(ex: Ejercicio) {
    const n = descarga ? Math.ceil(ex.series / 2) : ex.series;
    return Math.max(n + (b?.extra[ex.id] ?? 0), b?.ex[ex.id]?.length ?? 0);
  }

  function actual(): Borrador {
    return borrador.value ?? nuevoBorrador(diaId, gym);
  }
  function guardar(nb: Borrador) {
    setBorrador(nb);
  }

  function marcar(ex: Ejercicio, i: number, f: Fila) {
    prepararAudio();
    const nb = { ...actual() };
    const listaEx = [...(nb.ex[ex.id] ?? [])];
    if (f.hecha) {
      listaEx[i] = null;
      while (listaEx.length && listaEx[listaEx.length - 1] == null) listaEx.pop();
      nb.ex = { ...nb.ex, [ex.id]: listaEx };
      guardar(nb);
      return;
    }
    if (f.kg <= 0 && !conPesoCorporal(ex.carga)) {
      setPesoAbierto({ ex, i, kg: 0 });
      return;
    }
    while (listaEx.length < i) listaEx.push(null);
    listaEx[i] = { kg: f.kg, reps: f.reps };
    nb.ex = { ...nb.ex, [ex.id]: listaEx };
    // Descanso: en superserie, transición corta al siguiente ejercicio del bloque.
    const bloque = bloqueDe(ex.id) ?? [ex.id];
    const k = bloque.indexOf(ex.id);
    const esA = bloque.length > 1 && k < bloque.length - 1;
    const seg = esA ? Math.min(ex.descanso, 30) : ex.descanso;
    const sigEx = esA ? vista(bloque[k + 1]) : null;
    const restantes = nSeries(ex) - listaEx.filter(Boolean).length;
    const texto = sigEx ? `Ahora: ${sigEx.corto}` : restantes > 0 ? `Quedan ${restantes} de ${ex.corto}` : siguienteTexto(ex.id);
    nb.descanso = { hasta: Date.now() + seg * 1000, total: seg, exId: ex.id, texto };
    guardar(nb);
    if (ajustes.value.pantallaEncendida) mantenerPantalla(true);
  }

  function siguienteTexto(exId: string) {
    const ids = d.bloques.flat();
    const sig = ids.slice(ids.indexOf(exId) + 1).find((id) => !(borrador.value?.ex[id]?.filter(Boolean).length));
    return sig ? `Siguiente: ${vista(sig).corto}` : 'Último ejercicio hecho';
  }

  function setReps(ex: Ejercicio, i: number, delta: number) {
    const nb = { ...actual() };
    const l = [...(nb.ex[ex.id] ?? [])];
    const s = l[i];
    if (!s) return;
    l[i] = { ...s, reps: Math.max(0, s.reps + delta) };
    nb.ex = { ...nb.ex, [ex.id]: l };
    guardar(nb);
  }

  function setDrop(ex: Ejercicio, i: number, drop: Serie['drop'] | null) {
    const nb = { ...actual() };
    const l = [...(nb.ex[ex.id] ?? [])];
    const s = l[i];
    if (!s) return;
    const n = { ...s };
    if (drop) n.drop = drop;
    else delete n.drop;
    l[i] = n;
    nb.ex = { ...nb.ex, [ex.id]: l };
    guardar(nb);
  }

  function aplicarPeso(ex: Ejercicio, i: number, kg: number) {
    const nb = { ...actual() };
    const l = [...(nb.ex[ex.id] ?? [])];
    const pesos = [...(nb.pesos[ex.id] ?? [])];
    if (l[i]) l[i] = { ...l[i]!, kg };
    else pesos[i] = kg;
    // Series rectas: el cambio pasa a las siguientes pendientes (no en el press inclinado).
    if (ex.esquema !== 'topset') for (let j = i + 1; j < nSeries(ex); j++) if (!l[j]) pesos[j] = kg;
    nb.ex = { ...nb.ex, [ex.id]: l };
    nb.pesos = { ...nb.pesos, [ex.id]: pesos };
    guardar(nb);
    setPesoAbierto(null);
  }

  /** Variante o ejercicio hecho en su lugar (null = el de la rutina). Reinicia los pesos elegidos. */
  function setSustituto(id: string, valor: string | null) {
    const nb = { ...actual() };
    const sus = { ...(nb.sustituto ?? {}) };
    if (valor) sus[id] = valor;
    else delete sus[id];
    nb.sustituto = Object.keys(sus).length ? sus : undefined;
    const { [id]: _p, ...pesos } = nb.pesos;
    const { [id]: _e, ...extra } = nb.extra;
    nb.pesos = pesos;
    nb.extra = extra;
    guardar(nb);
  }

  function cambiarSeries(ex: Ejercicio, delta: number) {
    const nb = { ...actual() };
    nb.extra = { ...nb.extra, [ex.id]: (nb.extra[ex.id] ?? 0) + delta };
    guardar(nb);
  }

  function elegirDia(nd: DiaId) {
    if (nd === diaId) return;
    if (b && seriesHechas(b) > 0) return setCambioDia(nd);
    if (b) setBorrador(null);
    setDiaElegido(nd);
  }

  function cambiarGym() {
    const gs = ajustes.value.gimnasios;
    const i = gs.findIndex((g) => g.id === gym);
    const sig = gs[(i + 1) % gs.length].id;
    guardar({ ...actual(), gym: sig });
  }

  const nombreGym = ajustes.value.gimnasios.find((g) => g.id === gym)?.nombre ?? gym;
  const minutos = b && hechas ? Math.round((Date.now() - new Date(b.inicio).getTime()) / 60000) : 0;

  return (
    <div class="vista vista-entrenar" style={{ '--dia': d.color }}>
      <header class="cab">
        <div class="cab-fila">
          <span class="cab-fecha">{b?.editando ? `Editando · ${fechaLarga(b.fecha)}` : fechaLarga(b?.fecha ?? hoy)}</span>
          {ajustes.value.gimnasios.length > 1 && <button class="chip chip-gym" onClick={cambiarGym} aria-label="Cambiar gimnasio">{nombreGym}</button>}
        </div>
        <nav class="dias" aria-label="Día de rutina" style={{ gridTemplateColumns: `repeat(${DIAS.length}, 1fr)` }}>
          {DIAS.map((x) => (
            <button
              key={x.id}
              class={`dia-btn ${x.id === diaId ? 'activo' : ''}`}
              style={{ '--c': x.color }}
              onClick={() => elegirDia(x.id)}
              aria-pressed={x.id === diaId}
            >
              <span class="dia-disco" />
              <span>{x.corto}</span>
              {hechosSemana.has(x.id) && <span class="dia-hecho" aria-label="hecho esta semana"><IcoCheck size={12} /></span>}
            </button>
          ))}
        </nav>
        <h1 class="dia-titulo">{d.titulo}</h1>
        <p class="dia-meta">
          {d.bloques.flat().length} ejercicios · {totalSeries} series · ~{duracionEstimada(diaId, descarga)} min
          {!d.cuentaSemanal && ' · no cuenta en las series semanales'}
        </p>
        {descarga && <p class="banda banda-descarga">{PERFIL.sencillo ? 'Semana suave: mismos pesos, la mitad de series y sin apurar.' : 'Semana de descarga: mismos pesos, mitad de series, nada al fallo.'}</p>}
      </header>

      {PERFIL.bienvenida && sesiones.value.length === 0 && !hechas && (
        <section class="tarjeta tarjeta-accion bienvenida">
          {PERFIL.bienvenida.map((t, i) => (i === 0 ? <strong key={i}>{t}</strong> : <p key={i}>{t}</p>))}
        </section>
      )}

      {lista.length > 0 && !b?.editando && (
        <section class="avisos">
          {lista.map((a) => (
            <div key={a.id} class={`aviso aviso-${a.nivel}`}>
              <IcoAviso size={18} />
              <div>
                <strong>{a.titulo}</strong>
                <p>{a.texto}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {d.bloques.map((bloque, bi) => (
        <section key={bi} class={`bloque ${bloque.length > 1 ? 'bloque-super' : ''}`}>
          {bloque.length > 1 && (
            <p class="bloque-tit">
              {PERFIL.sencillo
                ? `Por parejas: haz el ${et.get(bloque[0])} y enseguida el ${et.get(bloque[1])}; descansa al acabar los dos`
                : `Superserie · ${bloque.map((id) => et.get(id)).join(' + ')} sin descanso entre medias`}
            </p>
          )}
          {bloque.map((id) => {
            const principal = ejercicio(id)!;
            const sus = b?.sustituto?.[id];
            const enVariante = esVariante(id, sus);
            const libre = sus && !enVariante ? sus : null;
            const ex = enVariante ? comoVariante(principal) : principal;
            const plan = enVariante ? planes.v.get(id)! : planes.m.get(id)!;
            const planV = planes.v.get(id);
            const v = principal.variante;
            const n = nSeries(ex);
            const filas = Array.from({ length: n }, (_, i) => fila(ex, plan, b, i, pc));
            const nota = notasEjercicio.value[id];
            const calent = ex.esquema === 'topset' ? plan.calentamiento : ex.calentar && !descarga ? calentamientoGenerico(filas[0]?.kg ?? 0, escalera(ex.carga)) : undefined;
            const hechasEx = (b?.ex[id] ?? []).filter(Boolean).length;
            return (
              <article key={id} class={`ej ${hechasEx >= n ? 'ej-completo' : ''}`}>
                <button class="ej-cab" onClick={() => ir({ v: 'ejercicio', id })}>
                  <span class="ej-num num">{et.get(id)}</span>
                  <span class="ej-titulos">
                    {enVariante && <span class="ej-var-tag">Variante de {principal.corto}</span>}
                    <span class="ej-nombre">{ex.nombre}</span>
                    <span class="ej-foco">{ex.foco}</span>
                  </span>
                  <span class="ej-mapa"><MapaMuscular p={ex.musculos.p} s={ex.musculos.s} compacto /></span>
                  <IcoDcha size={18} />
                </button>
                <p class="ej-meta num">
                  {descarga ? Math.ceil(ex.series / 2) : ex.series} × {ex.min}-{ex.max}{ex.porLado ? ' por lado' : ''} · {rirTexto(ex.rir)} · {mmss(ex.descanso)}
                  {ex.carga === 'lastre' && ' · kg = lastre'}
                  {ex.carga === 'corporal' && ' · kg = disco opcional'}
                  {enVariante && v?.kgNota && ` · ${v.kgNota}`}
                </p>
                {enVariante && <p class="ej-tecnica">{ex.tecnica}</p>}
                {libre && (
                  <p class="ej-libre">
                    Hecho en su lugar: <b>{libre}</b>. No cuenta para la progresión de {principal.corto}.
                    <button class="btn-texto" onClick={() => setSustituto(id, null)}>Quitar</button>
                  </p>
                )}
                <Decision plan={plan} gym={gym} />
                {calent && calent.length > 0 && (
                  <p class="ej-calent">Calienta (no se apunta): <span class="num">{calent.map((c) => `${fkg(c.kg)}×${c.reps}`).join(' · ')}</span></p>
                )}
                <div class="series" role="list">
                  {filas.map((f, i) => (
                    <div key={i} class={`serie ${f.hecha ? 'hecha' : ''}`} role="listitem">
                      <span class="serie-n num">{i + 1}</span>
                      <button class="serie-kg" onClick={() => setPesoAbierto({ ex, i, kg: f.kg })} aria-label={`Peso serie ${i + 1}`}>
                        {f.kg > 0 || conPesoCorporal(ex.carga) ? (
                          <>
                            <span class="num grande">{conPesoCorporal(ex.carga) && f.kg === 0 ? (ex.carga === 'lastre' ? 'Peso' : 'Sin') : fkg(f.kg)}</span>
                            <span class="ud">{conPesoCorporal(ex.carga) && f.kg === 0 ? (ex.carga === 'lastre' ? 'corporal' : 'peso') : 'kg'}</span>
                          </>
                        ) : (
                          <span class="serie-elegir">Elegir peso</span>
                        )}
                      </button>
                      {f.hecha ? (
                        <span class="serie-reps">
                          <button class="paso" onClick={() => setReps(ex, i, -1)} aria-label="Una rep menos"><IcoMenos size={18} /></button>
                          <span class="num grande">{f.reps}</span>
                          <button class="paso" onClick={() => setReps(ex, i, 1)} aria-label="Una rep más"><IcoMas size={18} /></button>
                        </span>
                      ) : (
                        <span class="serie-obj"><span class="x">×</span><span class="num grande">{f.reps}</span></span>
                      )}
                      <button class="serie-ok" onClick={() => marcar(ex, i, f)} aria-label={f.hecha ? 'Deshacer serie' : `Serie hecha: ${fkg(f.kg)} kg × ${f.reps}`}>
                        <IcoCheck size={24} />
                      </button>
                      {f.alt && <span class="serie-alt">{f.alt}</span>}
                      {f.hecha && ex.rirMin < 2 && !f.hecha.drop && (
                        <button class="serie-drop-add" onClick={() => setDrop(ex, i, { kg: escalera(ex.carga).anterior(f.kg), reps: 4 })}>+ bajada</button>
                      )}
                      {f.hecha?.drop && (
                        <span class="serie-drop">
                          <span>Bajada</span>
                          <button class="paso" onClick={() => setDrop(ex, i, { ...f.hecha!.drop!, kg: escalera(ex.carga).anterior(f.hecha!.drop!.kg) })} aria-label="Menos peso en la bajada"><IcoMenos size={16} /></button>
                          <span class="num">{fkg(f.hecha.drop.kg)} kg</span>
                          <button class="paso" onClick={() => setDrop(ex, i, { ...f.hecha!.drop!, kg: escalera(ex.carga).siguiente(f.hecha!.drop!.kg) })} aria-label="Más peso en la bajada"><IcoMas size={16} /></button>
                          <span class="sep">×</span>
                          <button class="paso" onClick={() => setDrop(ex, i, { ...f.hecha!.drop!, reps: Math.max(1, f.hecha!.drop!.reps - 1) })} aria-label="Menos reps en la bajada"><IcoMenos size={16} /></button>
                          <span class="num">{f.hecha.drop.reps}</span>
                          <button class="paso" onClick={() => setDrop(ex, i, { ...f.hecha!.drop!, reps: f.hecha!.drop!.reps + 1 })} aria-label="Más reps en la bajada"><IcoMas size={16} /></button>
                          <button class="paso" onClick={() => setDrop(ex, i, null)} aria-label="Quitar bajada"><IcoX size={16} /></button>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {v && planV && hechasEx === 0 && !libre && (
                  <button class="ej-var" onClick={() => setSustituto(id, enVariante ? null : v.id)}>
                    {enVariante ? (
                      <span>↩ Volver a <b>{principal.corto}</b></span>
                    ) : (
                      <>
                        <span>↔ Variante: <b>{v.corto}</b>{resumenPlan(planV, v.carga)}</span>
                        <span class="ej-var-cuando">{v.cuando}</span>
                      </>
                    )}
                  </button>
                )}
                <div class="ej-pie">
                  <button class="btn-texto" onClick={() => cambiarSeries(ex, 1)}>+ Serie</button>
                  {(b?.extra[id] ?? 0) > 0 && <button class="btn-texto" onClick={() => cambiarSeries(ex, -1)}>− Serie</button>}
                  <button class="btn-texto" onClick={() => setNotaAbierta(notaAbierta === id ? null : id)}>{b?.exNotas[id] ? 'Nota de hoy ✓' : 'Nota de hoy'}</button>
                </div>
                {notaAbierta === id && (
                  <textarea
                    class="campo ej-nota-hoy"
                    rows={2}
                    placeholder="Cómo ha ido, molestias, máquina distinta…"
                    value={b?.exNotas[id] ?? ''}
                    onInput={(e) => guardar({ ...actual(), exNotas: { ...actual().exNotas, [id]: (e.target as HTMLTextAreaElement).value } })}
                  />
                )}
                {nota && !enVariante && <p class="ej-nota"><span>Tu corrección</span>{nota}</p>}
              </article>
            );
          })}
        </section>
      ))}

      <div class="pie-sesion">
        <div class="pie-progreso">
          <div class="pie-barra"><span style={{ transform: `scaleX(${totalSeries ? Math.min(1, hechas / totalSeries) : 0})` }} /></div>
          <span class="num">{hechas}/{totalSeries} series{minutos > 0 && !b?.editando ? ` · ${minutos} min` : ''}</span>
        </div>
        <button class="btn btn-prim" disabled={!hechas} onClick={() => setTerminar(true)}>
          {b?.editando ? 'Guardar cambios' : 'Terminar'}
        </button>
      </div>

      {pesoAbierto && (
        <SelectorPeso
          ex={pesoAbierto.ex}
          kg={pesoAbierto.kg}
          onCerrar={() => setPesoAbierto(null)}
          onElegir={(kg) => aplicarPeso(pesoAbierto.ex, pesoAbierto.i, kg)}
        />
      )}
      {cambioDia && (
        <Hoja titulo="Sesión en curso" onCerrar={() => setCambioDia(null)}>
          <p class="parrafo">Llevas {hechas} series del {getDia(diaId).nombre.toLowerCase()}. Si cambias de día, se descartan.</p>
          <div class="fila-btns">
            <button class="btn" onClick={() => setCambioDia(null)}>Seguir con el {getDia(diaId).corto.toLowerCase()}</button>
            <button class="btn btn-peligro" onClick={() => { setBorrador(null); setDiaElegido(cambioDia); setCambioDia(null); mantenerPantalla(false); }}>
              Descartar y cambiar
            </button>
          </div>
        </Hoja>
      )}
      {terminar && ultimo.current && <Terminar b={b ?? ultimo.current} onCerrar={() => setTerminar(false)} onGuardado={() => { setTerminar(false); }} />}
    </div>
  );
}

/** "· 50 kg × 10" para el botón de la variante. */
function resumenPlan(p: Plan, carga: Ejercicio['carga']): string {
  const s = p.series[0];
  if (!s || p.decision === 'nuevo') return '';
  if (conPesoCorporal(carga) && s.kg === 0) return ` · tu peso × ${s.reps}`;
  return ` · ${fkg(s.kg)} kg × ${s.reps}`;
}

function Decision({ plan, gym }: { plan: Plan; gym: string }) {
  const Ico = plan.decision === 'subir' ? IcoSube : plan.decision === 'bajar' ? IcoBaja : IcoIgual;
  const txt = { subir: 'Sube', bajar: 'Baja', mantener: 'Mantén', nuevo: PERFIL.sencillo ? 'Primera vez' : 'Nuevo', descarga: PERFIL.sencillo ? 'Semana suave' : 'Descarga', estimado: 'Calculado' }[plan.decision];
  const motivo = plan.decision === 'nuevo' && PERFIL.sencillo
    ? 'Toca el peso y elige uno con el que hagas las repeticiones y te sobren 2. La próxima vez la app te dice cuál poner.'
    : plan.motivo;
  return (
    <div class={`decision decision-${plan.decision}`}>
      <span class="decision-tag"><Ico size={14} /> {txt}</span>
      <span class="decision-motivo">{motivo}</span>
      {plan.ref && (
        <span class="decision-ref num">
          {plan.fuente ? `${plan.fuente} · ` : ''}{plan.ref.inicial ? 'Notas' : 'Último'} · {fechaCorta(plan.ref.fecha)}{plan.otroGym ? ' (otro gimnasio)' : ''}: {textoSeries(plan.ref.series)}
        </span>
      )}
      {plan.otroGym && <span class="decision-ref">No hay registros en {gym === 'sevilla' ? 'Sevilla' : 'este gimnasio'}: ajusta el peso por sensaciones.</span>}
    </div>
  );
}

function SelectorPeso({ ex, kg, onElegir, onCerrar }: { ex: Ejercicio; kg: number; onElegir: (kg: number) => void; onCerrar: () => void }) {
  const esc = escalera(ex.carga);
  const ref = kg > 0 || conPesoCorporal(ex.carga) ? kg : esc.ajustar(PERFIL.pesosIniciales?.[ex.carga] ?? (ex.carga === 'mancuerna' ? 10 : 30));
  const [valor, setValor] = useState(String(ref).replace('.', ','));
  const opciones = esc.alrededor(ref, 4);
  return (
    <Hoja titulo={`Peso · ${ex.corto}`} onCerrar={onCerrar}>
      <div class="pesos">
        {opciones.map((v) => (
          <button key={v} class={`peso-op num ${Math.abs(v - kg) < 0.01 ? 'activo' : ''}`} onClick={() => onElegir(v)}>
            {fkg(v)}
          </button>
        ))}
      </div>
      <form
        class="peso-libre"
        onSubmit={(e) => {
          e.preventDefault();
          const v = parseFloat(valor.replace(',', '.'));
          if (Number.isFinite(v) && v >= 0) onElegir(Math.round(v * 10) / 10);
        }}
      >
        <label>
          Otro peso
          <input class="campo num" inputMode="decimal" value={valor} onInput={(e) => setValor((e.target as HTMLInputElement).value)} />
        </label>
        <button class="btn btn-prim" type="submit">Usar</button>
      </form>
      <p class="nota-pie">El cambio se aplica a las series siguientes que no has hecho. Escalones en Ajustes.</p>
    </Hoja>
  );
}

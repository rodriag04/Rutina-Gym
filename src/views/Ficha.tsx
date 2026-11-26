import { useState } from 'preact/hooks';
import { Animacion } from '../components/Animacion';
import { Grafica } from '../components/Grafica';
import { IcoAtras, IcoVideo } from '../components/Iconos';
import { MapaMuscular } from '../components/MapaMuscular';
import { GRUPOS, MUSCULOS } from '../data/musculos';
import { PERFIL, dia as getDia, ejercicio, etiquetas } from '../data/rutina';
import { textoSeries } from '../lib/analisis';
import { ajustes, escalera, notasEjercicio, pesoCorporal, sesiones, setNota } from '../lib/estado';
import { fechaCorta, kg as fkg, mmss } from '../lib/formato';
import { comparable, sesionesDe } from '../lib/progresion';
import { serie } from './Progreso';
import { volver } from '../lib/ruta';
import { comoVariante, planVariante, sesionesVariante } from '../lib/variantes';


export function Ficha({ id }: { id: string }) {
  const ex = ejercicio(id);
  const [nota, setNotaLocal] = useState(notasEjercicio.value[id] ?? '');
  const [guardado, setGuardado] = useState(false);
  if (!ex) return <div class="vista"><p class="vacio">Ejercicio no encontrado.</p></div>;
  const pc = pesoCorporal.value;
  const hist = sesionesDe(id, sesiones.value);
  const puntos = serie(ex, pc);
  const fuera = hist.filter((s) => !comparable(ex, s, ajustes.value.gymPorDefecto));
  const grupos = [...new Set(ex.musculos.p.map((m) => MUSCULOS[m].grupo))].map((g) => GRUPOS[g]);
  const gymNombre = (g: string | null) => ajustes.value.gimnasios.find((x) => x.id === g)?.nombre ?? 'sin confirmar';
  const d = getDia(ex.dia);
  const v = ex.variante;
  const exV = v ? comoVariante(ex) : null;
  const planV = v
    ? planVariante(ex, {
        sesiones: sesiones.value,
        gym: ajustes.value.gymPorDefecto,
        escalera: escalera(v.carga),
        pesoCorporal: pc,
        descarga: false,
        escaleraDe: (e) => escalera(e.carga)
      })
    : null;
  const histV = v ? [...sesionesVariante(ex, sesiones.value)].reverse() : [];

  return (
    <div class="vista vista-ficha" style={{ '--dia': d.color }}>
      <header class="cab-sub">
        <button class="btn-icono" onClick={() => volver()} aria-label="Volver"><IcoAtras /></button>
        <span class="cab-sub-tit">{d.nombre} · {etiquetas(ex.dia).get(id) ?? 'retirado'}</span>
      </header>

      <h1 class="ficha-titulo">{ex.nombre}</h1>
      <p class="ficha-foco">{ex.foco}</p>
      {ex.retirado && <p class="banda banda-retirado">Retirado el {fechaCorta(ex.retirado.fecha)}: {ex.retirado.motivo}</p>}
      {ex.cambio && <p class="banda">Cambio: {ex.cambio}</p>}

      <section class="tarjeta tarjeta-anim">
        <Animacion anim={ex.anim} tempo={ex.tempo} />
        <a class="btn btn-ancho btn-video" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.busqueda)}`} target="_blank" rel="noopener">
          <IcoVideo size={18} /> Ver vídeos reales (necesita conexión)
        </a>
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Qué trabaja</h2>
        <div class="musculos">
          <MapaMuscular p={ex.musculos.p} s={ex.musculos.s} />
          <div class="musculos-lista">
            <p class="musculos-grupo">{grupos.join(' · ')}</p>
            {ex.musculos.p.map((m) => (
              <div key={m} class="musculo">
                <span class="punto punto-p" />
                <div>
                  <strong>{GRUPOS[MUSCULOS[m].grupo]} · {MUSCULOS[m].nombre}</strong>
                  <p>{MUSCULOS[m].detalle}</p>
                </div>
              </div>
            ))}
            {ex.musculos.s.length > 0 && (
              <div class="musculo">
                <span class="punto punto-s" />
                <div>
                  <strong>Ayudan</strong>
                  <p>{ex.musculos.s.map((m) => `${GRUPOS[MUSCULOS[m].grupo]} (${MUSCULOS[m].nombre.toLowerCase()})`).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <p class="parati"><span>Para ti</span>{ex.paraTi}</p>
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Técnica</h2>
        <p class="tecnica">{ex.tecnica}</p>
        <ul class="claves">
          {ex.claves.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <p class="error"><span>Error típico</span>{ex.error}</p>
        <dl class="datos num">
          <div><dt>Series</dt><dd>{ex.series} × {ex.min}-{ex.max}{ex.porLado ? ' por lado' : ''}</dd></div>
          <div><dt>{PERFIL.sencillo ? 'Te sobran' : 'RIR'}</dt><dd>{ex.rir}</dd></div>
          <div><dt>Descanso</dt><dd>{mmss(ex.descanso)}</dd></div>
          <div><dt>Tempo</dt><dd>sube {ex.tempo.sube} s · baja {ex.tempo.baja} s</dd></div>
        </dl>
      </section>

      {v && exV && planV && (
        <section class="tarjeta">
          <h2 class="tarjeta-tit">Variante · trabaja lo mismo</h2>
          <p class="ficha-var-nombre">{v.nombre}</p>
          <p class="nota-pie">{v.cuando} Se elige en la pantalla de entrenar y no mezcla sus pesos con los de {ex.corto}.</p>
          <p class="tecnica">{v.tecnica}</p>
          <dl class="datos num">
            <div><dt>Series</dt><dd>{exV.series} × {exV.min}-{exV.max}{exV.porLado ? ' por lado' : ''}</dd></div>
            <div>
              <dt>Hoy</dt>
              <dd>
                {planV.decision === 'nuevo'
                  ? 'elige peso'
                  : `${fkg(planV.series[0].kg)} kg × ${planV.series.map((x) => x.reps).join(' · ')}`}
              </dd>
            </div>
          </dl>
          <p class="nota-pie">{planV.motivo}{v.kgNota ? ` (${v.kgNota}.)` : ''}</p>
          {histV.length > 0 && (
            <table class="tabla">
              <thead><tr><th>Fecha</th><th>Series</th></tr></thead>
              <tbody>
                {histV.map((s) => (
                  <tr key={s.id}>
                    <td>{fechaCorta(s.fecha)}<span class="tabla-sub">{gymNombre(s.gym)}</span></td>
                    <td class="num">{textoSeries(s.ex[id])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Tus correcciones</h2>
        <p class="nota-pie">Se muestran en el ejercicio cada vez que toca y van en el informe para Claude.</p>
        <textarea
          class="campo"
          rows={3}
          value={nota}
          placeholder="Ej.: agarre a dos manos, asiento en el 4, muñequera…"
          onInput={(e) => { setNotaLocal((e.target as HTMLTextAreaElement).value); setGuardado(false); }}
          onBlur={async () => { await setNota(id, nota.trim()); setGuardado(true); }}
        />
        {guardado && <p class="nota-pie">Guardado.</p>}
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Progreso · 1RM estimado</h2>
        {puntos.length ? <Grafica puntos={puntos} titulo={`Progreso de ${ex.nombre}`} /> : <p class="vacio">{ex.referencia ?? 'Sin registros todavía.'}</p>}
        {fuera.length > 0 && <p class="nota-pie">Fuera de la gráfica (otro gimnasio): {fuera.map((s) => fechaCorta(s.fecha)).join(', ')}.</p>}
        {hist.length > 0 && (
          <table class="tabla">
            <thead><tr><th>Fecha</th><th>Series</th></tr></thead>
            <tbody>
              {hist.map((s) => (
                <tr key={s.id}>
                  <td>{fechaCorta(s.fecha)}<span class="tabla-sub">{gymNombre(s.gym)}</span></td>
                  <td class="num">{textoSeries(s.ex[id])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

import { useState } from 'preact/hooks';
import { IcoAtras, IcoCompartir, IcoCopiar, IcoDcha, IcoLapiz, IcoPapelera } from '../components/Iconos';
import { dia as getDia, ejercicio, etiquetas } from '../data/rutina';
import { comparar, huecos, resumenSesion, textoSeries } from '../lib/analisis';
import { ajustes, borradorDesde, borrador, borrarSesion, guardarSesion, sesiones, setBorrador } from '../lib/estado';
import { compartir, copiar, textoSesion } from '../lib/exportar';
import { fechaCorta, fechaLarga, hoyISO, lunesDe, sumarDias } from '../lib/formato';
import { ordenarSesiones } from '../lib/progresion';
import { ir, volver } from '../lib/ruta';
import type { Sesion } from '../lib/tipos';


export function Historial() {
  const lista = ordenarSesiones(sesiones.value).reverse();
  const sinConfirmar = lista.filter((s) => s.gym == null || (s.origen === 'importado' && !s.gymConfirmado));
  const [revisar, setRevisar] = useState(false);
  const hs = huecos(sesiones.value, hoyISO());
  const semanas = new Map<string, Sesion[]>();
  for (const s of lista) {
    const l = lunesDe(s.fecha);
    semanas.set(l, [...(semanas.get(l) ?? []), s]);
  }
  const varios = ajustes.value.gimnasios.length > 1;
  const gymCorto = (g: string | null) => (g == null ? '¿gimnasio?' : g === 'sevilla' ? 'Sevilla' : ajustes.value.gimnasios.find((x) => x.id === g)?.nombre ?? g);

  return (
    <div class="vista">
      <header class="cab"><h1 class="vista-titulo">Historial</h1><p class="dia-meta">{lista.length} sesiones</p></header>

      {sinConfirmar.length > 0 && (
        <section class="tarjeta tarjeta-accion">
          <div class="fila-esp">
            <div>
              <strong>Confirma el gimnasio de {sinConfirmar.length} sesiones importadas</strong>
              <p class="nota-pie">Los pesos de poleas y máquinas no valen entre gimnasios. El 3 nov está en duda.</p>
            </div>
            <button class="btn" onClick={() => setRevisar(!revisar)}>{revisar ? 'Listo' : 'Revisar'}</button>
          </div>
          {revisar && (
            <div class="gym-lista">
              {sinConfirmar.map((s) => (
                <div key={s.id} class="gym-fila">
                  <span>{fechaCorta(s.fecha)} · {getDia(s.dia).corto}</span>
                  <div class="chips">
                    {ajustes.value.gimnasios.map((g) => (
                      <button key={g.id} class={`chip ${s.gym === g.id ? 'activo' : ''}`} onClick={() => guardarSesion({ ...s, gym: g.id, gymConfirmado: true })}>
                        {g.id === 'sevilla' ? 'Sevilla' : g.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {[...semanas.entries()].map(([lunes, ss]) => {
        const h = hs.find((x) => x.semana === lunes);
        return (
          <section key={lunes} class="semana">
            <h2 class="semana-tit">
              {fechaCorta(lunes)} – {fechaCorta(sumarDias(lunes, 6))}
              {h && <span class="semana-falta">Falta: {h.faltan.map((d) => getDia(d).nombre.toLowerCase()).join(', ')}</span>}
            </h2>
            {ss.map((s) => {
              const r = resumenSesion(s, sesiones.value);
              const cmp = comparar(s, sesiones.value);
              const suben = [...cmp.values()].filter((v) => v > 0.02).length;
              const bajan = [...cmp.values()].filter((v) => v < -0.02).length;
              return (
                <button key={s.id} class="sesion-fila" style={{ '--dia': getDia(s.dia).color }} onClick={() => ir({ v: 'sesion', id: s.id })}>
                  <span class="sesion-barra" />
                  <span class="sesion-txt">
                    <strong>{fechaLarga(s.fecha)} · {getDia(s.dia).titulo}</strong>
                    <span>
                      {r.hechas}/{r.previstas} series{varios ? ` · ${gymCorto(s.gym)}` : ''}{s.descarga ? ' · suave' : ''}
                      {suben ? ` · ↑${suben}` : ''}{bajan ? ` · ↓${bajan}` : ''}
                      {r.records.length ? ` · ${r.records.length} récord${r.records.length > 1 ? 's' : ''}` : ''}
                    </span>
                  </span>
                  <IcoDcha size={18} />
                </button>
              );
            })}
          </section>
        );
      })}
      {lista.length === 0 && <p class="vacio">Todavía no hay sesiones. Aparecerán aquí al guardar la primera.</p>}
      <button class="btn btn-ancho" onClick={() => ir({ v: 'entrenar' })}>Apuntar una sesión pasada: empieza el día y cambia la fecha al terminar</button>
    </div>
  );
}

export function DetalleSesion({ id }: { id: string }) {
  const s = sesiones.value.find((x) => x.id === id);
  const [copiado, setCopiado] = useState(false);
  if (!s) return <div class="vista"><p class="vacio">Sesión no encontrada.</p><button class="btn" onClick={() => ir({ v: 'historial' })}>Volver</button></div>;
  const d = getDia(s.dia);
  const et = etiquetas(s.dia);
  const cmp = comparar(s, sesiones.value);
  const r = resumenSesion(s, sesiones.value);
  const texto = textoSesion(s, sesiones.value, ajustes.value.gimnasios);
  const ids = [...new Set([...d.bloques.flat(), ...Object.keys(s.ex)])];

  return (
    <div class="vista" style={{ '--dia': d.color }}>
      <header class="cab-sub">
        <button class="btn-icono" onClick={() => volver({ v: 'historial' })} aria-label="Volver"><IcoAtras /></button>
        <span class="cab-sub-tit">{d.nombre}</span>
      </header>
      <h1 class="ficha-titulo">{fechaLarga(s.fecha)}</h1>
      <p class="ficha-foco">
        {d.titulo} · {ajustes.value.gimnasios.find((g) => g.id === s.gym)?.nombre ?? 'gimnasio sin confirmar'}
        {s.duracionMin ? ` · ${s.duracionMin} min` : ''}{s.descarga ? ' · descarga' : ''}
      </p>
      <section class="tarjeta">
        {ids.map((exId) => {
          const ex = ejercicio(exId);
          const series = s.ex[exId];
          const c = cmp.get(exId);
          return (
            <div key={exId} class="det-fila">
              <span class="ej-num num">{et.get(exId) ?? '·'}</span>
              <div class="det-txt">
                <button class="det-nombre" onClick={() => ir({ v: 'ejercicio', id: exId })}>{ex?.nombre ?? exId}</button>
                <span class="num">{series?.length ? textoSeries(series) : 'Sin hacer'}</span>
                {s.sustituto?.[exId] && <span class="det-nota">Hecho en su lugar: {s.sustituto[exId]}</span>}
                {s.exNotas?.[exId] && <span class="det-nota">{s.exNotas[exId]}</span>}
              </div>
              {c != null && <span class={`det-cmp ${c > 0.02 ? 'sube' : c < -0.02 ? 'baja' : ''}`}>{c > 0.02 ? '↑' : c < -0.02 ? '↓' : '='} {Math.abs(Math.round(c * 100))}%</span>}
            </div>
          );
        })}
        <p class="nota-pie">↑/↓: cambio del 1RM estimado frente a la vez anterior en el mismo gimnasio. Series: {r.hechas}/{r.previstas}.</p>
      </section>
      {(s.notas || s.sensacion) && (
        <section class="tarjeta">
          <h2 class="tarjeta-tit">Notas</h2>
          {s.sensacion?.energia && <p>Energía: {['', 'floja', 'normal', 'buena', 'muy buena'][s.sensacion.energia]}</p>}
          {s.sensacion?.molestias?.length ? <p>Molestias: {s.sensacion.molestias.join(', ')}</p> : null}
          {s.notas && <p class="parrafo">{s.notas}</p>}
        </section>
      )}
      <div class="fila-btns">
        <button class="btn btn-prim" onClick={() => compartir(texto)}><IcoCompartir size={18} /> WhatsApp</button>
        <button class="btn" onClick={async () => setCopiado(await copiar(texto))}><IcoCopiar size={18} /> {copiado ? 'Copiado' : 'Copiar'}</button>
      </div>
      <div class="fila-btns">
        <button
          class="btn"
          onClick={() => {
            if (borrador.value && !confirm('Tienes una sesión en curso. ¿Descartarla para editar esta?')) return;
            setBorrador(borradorDesde(s));
            ir({ v: 'entrenar' });
          }}
        >
          <IcoLapiz size={18} /> Editar
        </button>
        <button
          class="btn btn-texto-peligro"
          onClick={async () => {
            if (confirm(`¿Borrar la sesión del ${fechaCorta(s.fecha)}? No se puede deshacer.`)) {
              await borrarSesion(s.id);
              ir({ v: 'historial' });
            }
          }}
        >
          <IcoPapelera size={18} /> Borrar
        </button>
      </div>
    </div>
  );
}

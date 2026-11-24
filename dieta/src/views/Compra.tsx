import { useMemo, useState } from 'preact/hooks';
import { ICheck, ICompartir, ICopo, INevera } from '../components/Iconos';
import { diasDeUso, listaCompra, tareasSemana } from '../lib/compra';
import { DIAS, diaSemana, fechaCorta, lunesDe } from '../lib/fechas';
import { compraHecha, horas, hoy, objetivos, proximoLunes, semanas } from '../lib/estado';
import { abrir, avisar } from '../lib/ui';

export function Compra() {
  const lunesHoy = lunesDe(hoy.value);
  const tieneSiguiente = !!semanas.value[proximoLunes()];
  const [lunes, setLunes] = useState(tieneSiguiente && diaSemana(hoy.value) >= 4 ? proximoLunes() : lunesHoy);
  const sem = semanas.value[lunes];
  const lista = useMemo(() => (sem ? listaCompra(sem, objetivos.value, horas.value) : null), [sem, objetivos.value, horas.value]);
  const tareas = useMemo(() => (sem ? tareasSemana(sem, objetivos.value, horas.value).filter((t) => t.tipo === 'congelar' || t.tipo === 'descongelar') : []), [sem, objetivos.value, horas.value]);
  const marcadas = new Set(compraHecha.value[lunes] ?? []);

  if (!sem || !lista)
    return (
      <>
        <Cabecera lunes={lunes} />
        <div class="tarjeta vacio">
          No hay semana montada.
          <div style="margin-top:12px">
            <button class="btn primario" onClick={() => abrir({ t: 'generador', lunes })}>
              Montar semana
            </button>
          </div>
        </div>
      </>
    );

  const comprables = lista.grupos.filter((g) => g.id !== 'casa' && g.id !== 'lunes').flatMap((g) => g.lineas);
  const hechas = comprables.filter((l) => marcadas.has(l.id)).length;
  const marcar = (id: string) => {
    const s = new Set(marcadas);
    s.has(id) ? s.delete(id) : s.add(id);
    compraHecha.value = { ...compraHecha.value, [lunes]: [...s] };
  };

  const compartir = async () => {
    const texto = [
      `🛒 Compra · semana del ${fechaCorta(lunes)}`,
      ...lista.grupos
        .filter((g) => g.id !== 'casa' && g.id !== 'lunes')
        .flatMap((g) => [``, `*${g.titulo}*`, ...g.lineas.map((l) => `• ${l.nombre}: ${l.envases}`)])
    ].join('\n');
    try {
      if (navigator.share) await navigator.share({ text: texto });
      else {
        await navigator.clipboard.writeText(texto);
        avisar(['Lista copiada.']);
      }
    } catch {
      /* cancelado */
    }
  };

  return (
    <>
      <Cabecera lunes={lunes} />
      <div class="fila" style="gap:6px;margin-bottom:12px">
        <button class={`chip${lunes === lunesHoy ? ' verde' : ''}`} onClick={() => setLunes(lunesHoy)}>
          Esta semana
        </button>
        <button class={`chip${lunes === proximoLunes() ? ' verde' : ''}`} onClick={() => (tieneSiguiente ? setLunes(proximoLunes()) : abrir({ t: 'generador', lunes: proximoLunes() }))}>
          {tieneSiguiente ? 'Próxima semana' : '+ Próxima semana'}
        </button>
      </div>

      <div class="tarjeta">
        <div class="fila entre">
          <div>
            <div class="etiqueta">{sem.config.festivoLunes ? 'Lunes festivo' : 'Lunes al salir del gym'}</div>
            <div style="font-family:var(--f-titulo);font-weight:800;font-size:18px">
              {sem.config.festivoLunes ? 'Carrefour Market Nervión Plaza (9-22 h)' : 'Mercadona'}
            </div>
          </div>
          <div class="num" style="font-weight:700">
            {hechas}/{comprables.length}
          </div>
        </div>
        <div class="progreso-compra">
          <i style={{ width: `${comprables.length ? (hechas / comprables.length) * 100 : 0}%` }} />
        </div>
        <button class="btn borde peq" style="margin-top:12px" onClick={compartir}>
          <ICompartir /> Compartir lista
        </button>
      </div>

      {lista.grupos.map((g) => (
        <>
          <div class="seccion">
            <h2 style={g.id === 'casa' || g.id === 'lunes' ? 'font-size:16px' : ''}>{g.titulo}</h2>
          </div>
          <div class="tarjeta" style="padding:2px 16px">
            {g.lineas.map((l) => {
              const on = marcadas.has(l.id);
              const soloInfo = g.id === 'casa' || g.id === 'lunes';
              return (
                <button class={`compra-linea${on && !soloInfo ? ' on' : ''}`} onClick={() => !soloInfo && marcar(l.id)} style={soloInfo ? 'grid-template-columns:1fr auto' : ''}>
                  {!soloInfo && (
                    <span class="caja">
                      <ICheck />
                    </span>
                  )}
                  <div style="min-width:0">
                    <div class="nombre">{l.nombre}</div>
                    <div class="usos">{diasDeUso(l.usos)}</div>
                  </div>
                  <div>
                    {l.envases && <div class="env">{l.envases}</div>}
                    <div class="g">{l.texto}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ))}
      {lista.basicos.length > 0 && <p class="muted" style="font-size:13px;margin:10px 2px">Básicos que das por hechos: {lista.basicos.join(', ').toLowerCase()}.</p>}

      <div class="seccion">
        <h2>Congelador</h2>
        <span class="mas">Para que nada se estropee</span>
      </div>
      {tareas.length === 0 && <div class="tarjeta muted">Esta semana todo lo fresco se come antes del miércoles.</div>}
      {tareas.map((t) => (
        <div class="tarea" style="margin-bottom:8px">
          <span class="icono">{t.tipo === 'congelar' ? <ICopo /> : <INevera />}</span>
          <div>
            <div style="font-weight:700">
              {DIAS[diaSemana(t.fecha)]} {t.hora} · {t.texto}
            </div>
            <ul>
              {t.detalle.map((x) => (
                <li>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
}

function Cabecera({ lunes }: { lunes: string }) {
  return (
    <header class="cabecera">
      <div>
        <div class="sub">Lista de la compra</div>
        <h1>Semana del {fechaCorta(lunes)}</h1>
      </div>
    </header>
  );
}

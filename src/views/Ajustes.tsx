import { useRef, useState } from 'preact/hooks';
import { IcoDescarga, IcoSubir } from '../components/Iconos';
import { CAMBIOS_RUTINA, EJERCICIOS, PERFIL, type Carga } from '../data/rutina';
import { conPesoCorporal, ESCALONES_POR_DEFECTO, NOMBRE_CARGA } from '../lib/cargas';
import {
  ajustes, borrarTodo, diario, importarCopia, medidas, notasEjercicio, restaurarOriginal, sesiones, setAjustes, verificacion, contarSeries
} from '../lib/estado';
import { copiaJSON, descargar, seriesCSV } from '../lib/exportar';
import { fechaCorta, hoyISO, kg as fkg, uid } from '../lib/formato';

export function Ajustes({ actualizar }: { actualizar?: () => void }) {
  const a = ajustes.value;
  const [nuevoGym, setNuevoGym] = useState('');
  const [msg, setMsg] = useState('');
  const fichero = useRef<HTMLInputElement>(null);
  const v = verificacion.value;

  function exportarJSON() {
    descargar(`rutina-copia-${hoyISO()}.json`, copiaJSON({ sesiones: sesiones.value, diario: diario.value, medidas: medidas.value, notasEjercicio: notasEjercicio.value, ajustes: a }), 'application/json');
    setAjustes({ ultimaCopia: new Date().toISOString() });
  }
  async function importar(f: File) {
    try {
      const d = JSON.parse(await f.text());
      const lista = Array.isArray(d) ? d : d.sesiones;
      if (!Array.isArray(lista)) throw new Error('formato');
      await importarCopia(Array.isArray(d) ? { sesiones: d } : d);
      setMsg(`Importadas ${lista.length} sesiones y ${contarSeries(lista)} series.`);
    } catch {
      setMsg('No se pudo leer el archivo. Tiene que ser una copia JSON de esta app o datos/sesiones.json.');
    }
  }

  return (
    <div class="vista">
      <header class="cab"><h1 class="vista-titulo">Ajustes</h1></header>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Entrenamiento</h2>
        <label class="interruptor">
          <span><strong>{PERFIL.sencillo ? 'Semana suave' : 'Semana de descarga'}</strong><span>{PERFIL.descargaCada ? `Mismos pesos y la mitad de series. La app la pone sola cada ${PERFIL.descargaCada} semanas; esto es para forzarla.` : 'Mismos pesos, mitad de series, nada al fallo. Actívala solo cuando la app lo avise.'}</span></span>
          <input type="checkbox" checked={a.descarga} onChange={() => setAjustes({ descarga: !a.descarga })} />
        </label>
        <label class="interruptor">
          <span><strong>Pitido al acabar el descanso</strong><span>Con el móvil en silencio no suena.</span></span>
          <input type="checkbox" checked={a.sonido} onChange={() => setAjustes({ sonido: !a.sonido })} />
        </label>
        <label class="interruptor">
          <span><strong>Pantalla encendida durante la sesión</strong><span>Para ver el descanso sin desbloquear.</span></span>
          <input type="checkbox" checked={a.pantallaEncendida} onChange={() => setAjustes({ pantallaEncendida: !a.pantallaEncendida })} />
        </label>
        {EJERCICIOS.some((e) => !e.retirado && conPesoCorporal(e.carga)) && <label class="campo-etq">Tu peso corporal (kg), para los ejercicios sin peso
          <input class="campo num" inputMode="decimal" value={fkg(a.pesoCorporal)} onChange={(e) => {
            const n = parseFloat((e.target as HTMLInputElement).value.replace(',', '.'));
            if (n > 30 && n < 200) setAjustes({ pesoCorporal: n });
          }} />
          <span class="nota-pie">Si apuntas el peso en Medidas, se usa ese.</span>
        </label>}
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Gimnasios</h2>
        {a.gimnasios.map((g) => (
          <div key={g.id} class="gym-fila">
            <input class="campo" value={g.nombre} onChange={(e) => setAjustes({ gimnasios: a.gimnasios.map((x) => (x.id === g.id ? { ...x, nombre: (e.target as HTMLInputElement).value } : x)) })} />
            <button class={`chip ${a.gymPorDefecto === g.id ? 'activo' : ''}`} onClick={() => setAjustes({ gymPorDefecto: g.id })}>{a.gymPorDefecto === g.id ? 'Por defecto' : 'Usar por defecto'}</button>
          </div>
        ))}
        <form class="peso-libre" onSubmit={(e) => { e.preventDefault(); if (nuevoGym.trim()) { setAjustes({ gimnasios: [...a.gimnasios, { id: uid(), nombre: nuevoGym.trim() }] }); setNuevoGym(''); } }}>
          <input class="campo" placeholder="Añadir gimnasio" value={nuevoGym} onInput={(e) => setNuevoGym((e.target as HTMLInputElement).value)} />
          <button class="btn" type="submit">Añadir</button>
        </form>
        <p class="nota-pie">Los pesos de poleas y máquinas solo se comparan dentro del mismo gimnasio.</p>
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Escalones de peso</h2>
        <p class="nota-pie">La app sube siempre al siguiente escalón que exista. Separa con comas; usa punto para decimales.</p>
        {(Object.keys(NOMBRE_CARGA) as Carga[]).map((c) => (
          <label key={c} class="campo-etq">{NOMBRE_CARGA[c]}
            <textarea class="campo num" rows={2} value={(a.escalones[c] ?? ESCALONES_POR_DEFECTO[c]).join(', ')} onChange={(e) => {
              const l = (e.target as HTMLTextAreaElement).value.split(/[,;\s]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0).sort((x, y) => x - y);
              if (l.length >= 2) setAjustes({ escalones: { ...a.escalones, [c]: [...new Set(l)] } });
            }} />
          </label>
        ))}
        <button class="btn-texto" onClick={() => setAjustes({ escalones: { ...ESCALONES_POR_DEFECTO } })}>Restaurar escalones</button>
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Datos</h2>
        {v && PERFIL.verificacion && (
          <p class={`verif ${v.sesiones === PERFIL.verificacion.sesiones && v.series === PERFIL.verificacion.series ? 'ok' : 'mal'}`}>
            Historial original: {v.sesiones} de {PERFIL.verificacion.sesiones} sesiones y {v.series} de {PERFIL.verificacion.series} series {v.sesiones === PERFIL.verificacion.sesiones && v.series === PERFIL.verificacion.series ? '✓' : '(revisa)'}
          </p>
        )}
        <p class="nota-pie">
          {sesiones.value.length} sesiones guardadas en este móvil · {contarSeries(sesiones.value)} series.
          {a.ultimaCopia ? ` Última copia: ${fechaCorta(a.ultimaCopia.slice(0, 10))}.` : ' Sin copias todavía.'}
        </p>
        <div class="fila-btns">
          <button class="btn btn-prim" onClick={exportarJSON}><IcoDescarga size={18} /> Copia JSON</button>
          <button class="btn" onClick={() => descargar(`rutina-series-${hoyISO()}.csv`, seriesCSV(sesiones.value, a.gimnasios), 'text/csv')}><IcoDescarga size={18} /> CSV</button>
        </div>
        <button class="btn btn-ancho" onClick={() => fichero.current?.click()}><IcoSubir size={18} /> Importar copia JSON</button>
        <input ref={fichero} type="file" accept="application/json,.json" class="oculto" onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) importar(f); }} />
        {msg && <p class="nota-pie">{msg}</p>}
        {PERFIL.historial.length > 0 && <button class="btn-texto" onClick={async () => { await restaurarOriginal(); setMsg('Historial original restaurado (no borra lo nuevo).'); }}>Volver a importar el historial original</button>}
        <button class="btn-texto btn-texto-peligro" onClick={() => confirm('¿Borrar TODOS los datos de este móvil? Haz antes una copia.') && confirm('Seguro. No se puede deshacer.') && borrarTodo()}>Borrar todos los datos</button>
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">{PERFIL.id === 'rodrigo' ? 'Cambios en la rutina' : 'Cómo se ha adaptado tu tabla'}</h2>
        {CAMBIOS_RUTINA.map((c) => (
          <div key={c.titulo} class="cambio">
            <strong>{c.titulo}</strong>
            <p>{c.motivo}</p>
            <span class="nota-pie">{fechaCorta(c.fecha)}</span>
          </div>
        ))}
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Cómo calcula los pesos</h2>
        <ol class="reglas">
          {PERFIL.reglas.map((r) => <li key={r}>{r}</li>)}
        </ol>
      </section>

      {actualizar && (
        <section class="tarjeta">
          <button class="btn btn-ancho" onClick={actualizar}>Buscar actualización</button>
        </section>
      )}
      <p class="nota-pie centro">Rutina de {PERFIL.nombre} · v{__VERSION__} · los datos solo se guardan en este dispositivo</p>
    </div>
  );
}

import { Descanso } from './components/Descanso';
import { TabAjustes, TabClaude, TabEntrenar, TabHistorial, TabNotas, TabProgreso } from './components/Iconos';
import { dia as getDia } from './data/rutina';
import { diaSugerido } from './lib/analisis';
import { hoyISO } from './lib/formato';
import { errorGuardado } from './lib/db';
import { borrador, cargado, diaEnPantalla, seriesHechas, sesiones } from './lib/estado';
import { ir, ruta } from './lib/ruta';
import { Ajustes } from './views/Ajustes';
import { Chat } from './views/Chat';
import { Entrenar } from './views/Entrenar';
import { Ficha } from './views/Ficha';
import { DetalleSesion, Historial } from './views/Historial';
import { Notas } from './views/Notas';
import { Progreso } from './views/Progreso';

const TABS = [
  { v: 'entrenar', nombre: 'Entrenar', Ico: TabEntrenar },
  ...(__CLAUDE__ ? [{ v: 'claude' as const, nombre: 'Claude', Ico: TabClaude }] : []),
  { v: 'historial', nombre: 'Historial', Ico: TabHistorial },
  { v: 'progreso', nombre: 'Progreso', Ico: TabProgreso },
  { v: 'notas', nombre: 'Notas', Ico: TabNotas },
  { v: 'ajustes', nombre: 'Ajustes', Ico: TabAjustes }
] as const;

export function App({ actualizar }: { actualizar?: () => void }) {
  if (!cargado.value) return <div class="cargando">Cargando…</div>;
  const r = ruta.value;
  const activa = r.v === 'ejercicio' ? 'entrenar' : r.v === 'sesion' ? 'historial' : r.v;
  const enCurso = seriesHechas(borrador.value) > 0;
  // La pestaña activa lleva el color del día de rutina que tienes delante.
  const diaTab = diaEnPantalla.value ?? borrador.value?.dia ?? diaSugerido(sesiones.value, hoyISO());
  return (
    <>
      <main class="principal">
        {errorGuardado.value && <p class="aviso-nube">{errorGuardado.value}</p>}
        {r.v === 'entrenar' && <Entrenar />}
        {__CLAUDE__ && r.v === 'claude' && <Chat />}
        {r.v === 'historial' && <Historial />}
        {r.v === 'progreso' && <Progreso />}
        {r.v === 'notas' && <Notas />}
        {r.v === 'ajustes' && <Ajustes actualizar={actualizar} />}
        {r.v === 'ejercicio' && <Ficha id={r.id} key={r.id} />}
        {r.v === 'sesion' && <DetalleSesion id={r.id} key={r.id} />}
      </main>
      <Descanso />
      <nav class={`tabs${TABS.length > 5 ? ' seis' : ''}`} aria-label="Secciones" style={{ '--tab-dia': getDia(diaTab).color }}>
        {TABS.map(({ v, nombre, Ico }) => (
          <button key={v} class={`tab ${activa === v ? 'activa' : ''}`} onClick={() => ir({ v })} aria-current={activa === v ? 'page' : undefined}>
            <span class="pildora">
              <Ico size={24} relleno={activa === v} />
            </span>
            <span>{nombre}</span>
            {v === 'entrenar' && enCurso && activa !== 'entrenar' && <span class="tab-punto" aria-label="sesión en curso" />}
          </button>
        ))}
      </nav>
    </>
  );
}

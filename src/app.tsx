import { Descanso } from './components/Descanso';
import { IcoAjustes, IcoDisco, IcoGrafica, IcoLista, IcoNota } from './components/Iconos';
import { borrador, cargado, seriesHechas } from './lib/estado';
import { ir, ruta } from './lib/ruta';
import { Ajustes } from './views/Ajustes';
import { Entrenar } from './views/Entrenar';
import { Ficha } from './views/Ficha';
import { DetalleSesion, Historial } from './views/Historial';
import { Notas } from './views/Notas';
import { Progreso } from './views/Progreso';

const TABS = [
  { v: 'entrenar', nombre: 'Entrenar', Ico: IcoDisco },
  { v: 'historial', nombre: 'Historial', Ico: IcoLista },
  { v: 'progreso', nombre: 'Progreso', Ico: IcoGrafica },
  { v: 'notas', nombre: 'Notas', Ico: IcoNota },
  { v: 'ajustes', nombre: 'Ajustes', Ico: IcoAjustes }
] as const;

export function App({ actualizar }: { actualizar?: () => void }) {
  if (!cargado.value) return <div class="cargando">Cargando…</div>;
  const r = ruta.value;
  const activa = r.v === 'ejercicio' ? 'entrenar' : r.v === 'sesion' ? 'historial' : r.v;
  const enCurso = seriesHechas(borrador.value) > 0;
  return (
    <>
      <main class="principal">
        {r.v === 'entrenar' && <Entrenar />}
        {r.v === 'historial' && <Historial />}
        {r.v === 'progreso' && <Progreso />}
        {r.v === 'notas' && <Notas />}
        {r.v === 'ajustes' && <Ajustes actualizar={actualizar} />}
        {r.v === 'ejercicio' && <Ficha id={r.id} key={r.id} />}
        {r.v === 'sesion' && <DetalleSesion id={r.id} key={r.id} />}
      </main>
      <Descanso />
      <nav class="tabs" aria-label="Secciones">
        {TABS.map(({ v, nombre, Ico }) => (
          <button key={v} class={`tab ${activa === v ? 'activa' : ''}`} onClick={() => ir({ v })} aria-current={activa === v ? 'page' : undefined}>
            <Ico size={22} />
            <span>{nombre}</span>
            {v === 'entrenar' && enCurso && activa !== 'entrenar' && <span class="tab-punto" aria-label="sesión en curso" />}
          </button>
        ))}
      </nav>
    </>
  );
}

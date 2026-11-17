import { render } from 'preact';
import { ANIMACIONES } from './components/animaciones';
import { Pose } from './components/Animacion';
import { Suelo } from './components/animaciones';
import { MapaMuscular } from './components/MapaMuscular';
import { EJERCICIOS } from './data/rutina';
import './styles/base.css';
import './styles/figuras.css';

function Lab() {
  const solo = new URLSearchParams(location.search).get('solo');
  const ids = Object.keys(ANIMACIONES).filter((k) => !solo || k === solo);
  return (
    <div style="padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      {new URLSearchParams(location.search).get('mapa') ? (
        EJERCICIOS.slice(0, 12).map((e) => (
          <div style="background:var(--surface);border-radius:10px;padding:6px">
            <div style="font-size:11px">{e.id} {e.corto}</div>
            <MapaMuscular p={e.musculos.p} s={e.musculos.s} />
          </div>
        ))
      ) : (
        ids.flatMap((id) =>
          [0, 0.5, 1].map((t) => (
            <div style="background:var(--surface);border-radius:10px;padding:4px">
              <div style="font-size:11px;color:var(--text-2)">{id} t={t}</div>
              <svg viewBox="0 -16 240 206" style="width:100%">
                <Pose anim={id} t={t} />
                <Suelo />
              </svg>
            </div>
          ))
        )
      )}
    </div>
  );
}
render(<Lab />, document.getElementById('app')!);

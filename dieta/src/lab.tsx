import { render } from 'preact';
import { RECETAS } from './data/recetas';
import { Ilustracion } from './components/Plato';
import './styles/app.css';

render(
  <div style="display:grid;grid-template-columns:repeat(6,160px);gap:10px;padding:10px">
    {RECETAS.map((r) => (
      <div style="font:600 11px sans-serif">
        <div style="width:160px;height:160px;border-radius:14px;overflow:hidden">
          <Ilustracion dibujo={r.dibujo} fondo={r.fondo} />
        </div>
        {r.id}
      </div>
    ))}
  </div>,
  document.getElementById('lab')!
);

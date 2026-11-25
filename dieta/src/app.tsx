import { useEffect } from 'preact/hooks';
import { ICompra, IHoy, IMas, IProgreso, ISemana, type Icono } from './components/Iconos';
import { cargado, prefs } from './lib/estado';
import { hojas, pestana, toast, type Pestana } from './lib/ui';
import { Cambiar } from './views/Cambiar';
import { ConClaude } from './views/ConClaude';
import { Compra } from './views/Compra';
import { HojaFinde } from './views/Finde';
import { Generador } from './views/Generador';
import { Hoy } from './views/Hoy';
import { Airfryer, Ajustes, Alimentos, Copia, Mas, Metodo, Notas, Recetario } from './views/Mas';
import { Progreso } from './views/Progreso';
import { Receta } from './views/Receta';
import { Registrar } from './views/Registrar';
import { Semana } from './views/Semana';

const PESTANAS: [Pestana, string, Icono][] = [
  ['hoy', 'Hoy', IHoy],
  ['semana', 'Semana', ISemana],
  ['compra', 'Compra', ICompra],
  ['progreso', 'Progreso', IProgreso],
  ['mas', 'Más', IMas]
];

export function App({ actualizar }: { actualizar?: () => void }) {
  const tema = prefs.value.tema;
  useEffect(() => {
    const r = document.documentElement;
    if (tema === 'auto') r.removeAttribute('data-theme');
    else r.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light');
  }, [tema]);
  useEffect(() => window.scrollTo(0, 0), [pestana.value]);

  if (!cargado.value) return <div class="app" />;
  const P = pestana.value;
  return (
    <>
      <main class="app">
        {actualizar && (
          <button class="aviso verde" style="width:100%;text-align:left;margin:0 0 10px" onClick={actualizar}>
            Hay una versión nueva. Toca para actualizar.
          </button>
        )}
        {P === 'hoy' && <Hoy />}
        {P === 'semana' && <Semana />}
        {P === 'compra' && <Compra />}
        {P === 'progreso' && <Progreso />}
        {P === 'mas' && <Mas />}
      </main>
      <nav class="nav" aria-label="Secciones">
        <div class="nav-in">
          {PESTANAS.map(([id, t, Ic]) => (
            <button class={P === id ? 'activa' : ''} aria-current={P === id ? 'page' : undefined} onClick={() => (pestana.value = id)}>
              <Ic />
              {t}
            </button>
          ))}
        </div>
      </nav>
      {hojas.value.map((h) => {
        switch (h.t) {
          case 'receta':
            return <Receta id={h.id} fecha={h.fecha} slot={h.slot} />;
          case 'registrar':
            return <Registrar fecha={h.fecha} slot={h.slot} />;
          case 'cambiar':
            return <Cambiar fecha={h.fecha} slot={h.slot} />;
          case 'generador':
            return <Generador lunes={h.lunes} />;
          case 'finde':
            return <HojaFinde />;
          case 'airfryer':
            return <Airfryer />;
          case 'recetario':
            return <Recetario />;
          case 'alimentos':
            return <Alimentos />;
          case 'ajustes':
            return <Ajustes />;
          case 'notas':
            return <Notas />;
          case 'copia':
            return <Copia />;
          case 'metodo':
            return <Metodo />;
          case 'claude':
            return <ConClaude lunes={h.lunes} />;
        }
      })}
      {toast.value && (
        <div class="toast" role="status">
          <div style="flex:1">
            {toast.value.lineas.length === 1 ? (
              toast.value.lineas[0]
            ) : (
              <>
                <b>{toast.value.lineas[0]}</b>
                <ul>
                  {toast.value.lineas.slice(1).map((l) => (
                    <li>{l}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {toast.value.deshacer && (
            <button
              onClick={() => {
                toast.value!.deshacer!();
                toast.value = null;
              }}
            >
              Deshacer
            </button>
          )}
        </div>
      )}
    </>
  );
}

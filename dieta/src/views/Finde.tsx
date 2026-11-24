import { useState } from 'preact/hooks';
import { ICopa } from '../components/Iconos';
import { Hoja } from '../components/Hoja';
import { abrir, fmt } from '../lib/ui';
import { proximoLunes } from '../lib/estado';

const BEBIDAS = [
  { id: 'cana', n: 'Caña', k: 90 },
  { id: 'cubata', n: 'Cubata con refresco normal', k: 200 },
  { id: 'zero', n: 'Cubata con refresco zero', k: 110 },
  { id: 'vino', n: 'Copa de vino', k: 120 },
  { id: 'chupito', n: 'Chupito', k: 70 }
];

export function Finde({ enPestana = false }: { enPestana?: boolean }) {
  const [n, setN] = useState<Record<string, number>>({});
  const total = BEBIDAS.reduce((t, b) => t + (n[b.id] ?? 0) * b.k, 0);
  return (
    <>
      <section class="portada-finde">
        <div class="etiqueta" style="color:var(--hero-ink-2)">Fin de semana en Cabra</div>
        <h2 style="margin-top:4px">Una comida libre, no el finde entero</h2>
        <p style="margin:8px 0 0;font-size:14px;color:var(--hero-ink-2)">
          Entre semana ahorras 1.500-2.000 kcal. Un finde de excesos se las come todas y es lo que más decide tu barriga.
        </p>
      </section>

      <div class="seccion">
        <h2>Regla del plato</h2>
        <span class="mas">cuando no comes del plan</span>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        <div class="regla">
          <span class="n">1</span>
          <span>
            <b>Carne o pescado</b> del tamaño de dos palmas.
          </span>
        </div>
        <div class="regla">
          <span class="n">2</span>
          <span>
            <b>Hidratos</b> del tamaño de uno o dos puños (dos si hay gym o partido).
          </span>
        </div>
        <div class="regla">
          <span class="n">3</span>
          <span>
            <b>La verdura que haya</b> y sin repetir plato.
          </span>
        </div>
        <div class="regla">
          <span class="n">4</span>
          <span>De postre, fruta o un yogur. Dulce solo en la comida libre.</span>
        </div>
      </div>

      <div class="seccion">
        <h2>Domingo</h2>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        <div class="regla">
          <span class="n">P</span>
          <span>
            <b>Pierna y brazo:</b> hidratos en todas las comidas. 30-45 min antes, plátano o pan con pavo.
          </span>
        </div>
        <div class="regla">
          <span class="n">F</span>
          <span>
            <b>Partido + día Alt:</b> acaba el gym 4 h antes como mínimo. Arroz, pasta o pan unas 3 h antes. Después, carne o pescado con patata o arroz (+200-300 kcal de hidratos; no repongas lo que marca el reloj, se pasa).
          </span>
        </div>
      </div>

      <div class="seccion">
        <h2>Si sales</h2>
        <span class="mas">calculadora</span>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        {BEBIDAS.map((b) => (
          <div class="opcion">
            <div>
              <div class="t">{b.n}</div>
              <div class="d num">{b.k} kcal</div>
            </div>
            <div class="contador">
              <button onClick={() => setN({ ...n, [b.id]: Math.max(0, (n[b.id] ?? 0) - 1) })} aria-label={`Quitar ${b.n}`}>
                −
              </button>
              <b>{n[b.id] ?? 0}</b>
              <button onClick={() => setN({ ...n, [b.id]: (n[b.id] ?? 0) + 1 })} aria-label={`Añadir ${b.n}`}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div class={`aviso${total > 600 ? '' : ' verde'}`}>
        <ICopa />
        <span>
          {total === 0
            ? 'Refresco zero y un vaso de agua entre copa y copa.'
            : `${fmt(total)} kcal en bebida${total >= 600 ? ': lo mismo que una cena entera.' : '.'} Con refresco zero te ahorras unas 90 kcal por cubata.`}
        </span>
      </div>
      {enPestana && (
        <button class="btn borde ancho" style="margin-top:16px" onClick={() => abrir({ t: 'generador', lunes: proximoLunes() })}>
          Preparar la semana que viene
        </button>
      )}
    </>
  );
}

export function HojaFinde() {
  return (
    <Hoja titulo="Fin de semana">
      <Finde />
    </Hoja>
  );
}

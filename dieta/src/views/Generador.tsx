import { useState } from 'preact/hooks';
import { Hoja } from '../components/Hoja';
import { DIAS, fechaCorta, sumarDias } from '../lib/fechas';
import { generar, hoy, semanas } from '../lib/estado';
import { configPorDefecto } from '../lib/generador';
import { alimento } from '../lib/nutricion';
import type { ConfigSemana } from '../lib/tipos';
import { avisar, cerrarTodo, pestana } from '../lib/ui';
import { Interruptor, OpcionesDia } from './Semana';

const DESPENSA = ['whey', 'nueces', 'pasta', 'arroz', 'triturado', 'atun', 'patata', 'gnocchi', 'tortilla', 'pita', 'pan', 'jamon', 'lomo-emb', 'huevo', 'verdura', 'arandanos', 'chocolate'];

export function Generador({ lunes }: { lunes: string }) {
  const existe = semanas.value[lunes];
  const [cfg, setCfg] = useState<ConfigSemana>(() => (existe ? structuredClone(existe.config) : configPorDefecto(lunes)));
  const [abierto, setAbierto] = useState<number | null>(null);
  const viernes = sumarDias(lunes, 4);

  const crear = () => {
    generar(cfg, Math.floor(Math.random() * 1e6));
    cerrarTodo();
    pestana.value = 'semana';
    avisar([existe ? 'Semana rehecha. Los días pasados no cambian.' : `Semana del ${fechaCorta(lunes)} lista.`, 'Revisa la lista de la compra.']);
  };

  const enCasa = new Set(cfg.enCasa);
  return (
    <Hoja titulo={`Semana del ${fechaCorta(lunes)} al ${fechaCorta(viernes)}`}>
      <p class="muted" style="margin:0 2px 12px;font-size:14px">
        Dime lo justo y monto la semana: kcal y proteína cuadradas, sin repetir y con la compra del lunes.
      </p>
      <div class="tarjeta" style="padding:4px 16px">
        <Interruptor t="Táper de mamá el lunes" d="Si te quedas en Sevilla el finde, no hay" v={cfg.taper} on={(v) => setCfg({ ...cfg, taper: v })} />
        <Interruptor
          t="Me voy a Cabra el viernes"
          d="El plan acaba en la comida del viernes"
          v={cfg.cabraViernes}
          on={(v) => setCfg({ ...cfg, cabraViernes: v, dias: cfg.dias.map((d, i) => (i === 4 ? { ...d, cabra: v } : d)) })}
        />
        <Interruptor t="El lunes es festivo" d="Mercadona cerrado: te digo dónde comprar" v={cfg.festivoLunes} on={(v) => setCfg({ ...cfg, festivoLunes: v })} />
      </div>

      <div class="seccion">
        <h2>Cada día</h2>
        <span class="mas">Gym, fútbol, comidas fuera</span>
      </div>
      {cfg.dias.map((d, i) => (
        <div class="tarjeta" style="padding:0 16px;margin-bottom:8px">
          <button class="opcion" style="width:100%;text-align:left;border:0" onClick={() => setAbierto(abierto === i ? null : i)}>
            <div>
              <div class="t">
                {DIAS[i]} <span class="muted num" style="font-size:13px">{fechaCorta(d.fecha)}</span>
                {d.fecha < hoy.value && <span class="muted" style="font-size:12px"> · pasado</span>}
              </div>
              <div class="d">
                {[d.gym ? `Gym ${d.gym.hora}` : 'Sin gym', d.futbol ? `Fútbol ${d.futbol.hora}` : '', d.desayunoCasa ? 'Desayuno en casa' : '', d.cenaLibre ? 'Cena fuera' : '', i === 4 && cfg.cabraViernes ? 'A Cabra' : '']
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            <span class="muted" style="font-size:20px">{abierto === i ? '−' : '+'}</span>
          </button>
          {abierto === i && (
            <div style="border-top:1px solid var(--line)">
              <OpcionesDia
                fecha={d.fecha}
                cfg={{ ...d, cabra: i === 4 ? cfg.cabraViernes : d.cabra }}
                i={i}
                taper={cfg.taper}
                cambiar={(c) =>
                  setCfg({
                    ...cfg,
                    cabraViernes: i === 4 && c.cabra !== undefined ? !!c.cabra : cfg.cabraViernes,
                    dias: cfg.dias.map((x, k) => (k === i ? { ...x, ...c } : x))
                  })
                }
              />
            </div>
          )}
        </div>
      ))}

      <div class="seccion">
        <h2>Ya tienes en casa</h2>
        <span class="mas">No sale en la compra</span>
      </div>
      <div class="fila envolver" style="gap:6px">
        {DESPENSA.map((id) => (
          <button
            class={`chip${enCasa.has(id) ? ' verde' : ''}`}
            onClick={() => setCfg({ ...cfg, enCasa: enCasa.has(id) ? cfg.enCasa.filter((x) => x !== id) : [...cfg.enCasa, id] })}
          >
            {enCasa.has(id) ? '✓ ' : ''}
            {alimento(id).nombre.split(' (')[0]}
          </button>
        ))}
      </div>

      <div style="position:sticky;bottom:0;padding-top:16px;background:var(--bg)">
        <button class="btn primario ancho" onClick={crear}>
          {existe ? 'Rehacer la semana' : 'Generar la semana'}
        </button>
      </div>
    </Hoja>
  );
}

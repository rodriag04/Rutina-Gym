import { Hoja } from '../components/Hoja';
import { ImagenPlato } from '../components/Imagen';
import { cambiarPlato, horas, semanaDe } from '../lib/estado';
import { alternativas } from '../lib/generador';
import { nombreSlot } from '../lib/horario';
import { macroReceta } from '../lib/nutricion';
import type { Slot } from '../lib/tipos';
import { avisar, cerrarTodo, fmt } from '../lib/ui';

export function Cambiar({ fecha, slot }: { fecha: string; slot: Slot }) {
  const sem = semanaDe(fecha);
  const alt = sem ? alternativas(sem, fecha, slot, horas.value) : [];
  return (
    <Hoja titulo={`Cambiar ${nombreSlot(slot).toLowerCase()}`}>
      <p class="muted" style="margin:0 2px 10px;font-size:14px">
        Solo salen platos que no repiten proteína ni plato de ayer o mañana. Las cantidades se recalculan para cuadrar el día.
      </p>
      <div class="tarjeta" style="padding:4px 16px">
        {alt.length === 0 && <div class="vacio">No hay alternativas que cumplan las reglas para este hueco.</div>}
        {alt.map((r) => {
          const m = macroReceta(r);
          return (
            <button
              class="comida-semana"
              onClick={() => {
                cambiarPlato(fecha, slot, r.id);
                cerrarTodo();
                avisar([`${nombreSlot(slot)}: ${r.titulo}`]);
              }}
            >
              <div class="miniatura">
                <ImagenPlato receta={r.id} />
              </div>
              <div>
                <div style="font-weight:800">{r.titulo}</div>
                <div class="muted" style="font-size:13px">
                  {r.sub} · {r.min} min
                </div>
              </div>
              <div class="k">
                <b>{fmt(m.kcal)}</b>
                <br />
                {fmt(m.p)} g
              </div>
            </button>
          );
        })}
      </div>
    </Hoja>
  );
}

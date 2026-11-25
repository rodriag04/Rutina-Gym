import { useState } from 'preact/hooks';
import { ICamara, ICopia, IFlecha } from '../components/Iconos';
import { Hoja } from '../components/Hoja';
import { promptSemana } from '../lib/claude';
import { fechaCorta, lunesDe } from '../lib/fechas';
import { aplicarCodigo, horas, hoy, objetivos, proximoLunes, restaurar, semanas } from '../lib/estado';
import { configPorDefecto } from '../lib/generador';
import { abrir, avisar, cerrarTodo, pestana } from '../lib/ui';

export const URL_CLAUDE = 'https://claude.ai/new';

export async function copiar(texto: string, aviso: string) {
  try {
    await navigator.clipboard.writeText(texto);
    avisar([aviso]);
    return true;
  } catch {
    return false;
  }
}

/** Foto de la compra → Claude → código → semana montada. */
export function ConClaude({ lunes: inicial }: { lunes: string }) {
  const [lunes, setLunes] = useState(inicial);
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState<string | null>(null);
  const config = semanas.value[lunes]?.config ?? configPorDefecto(lunes);
  const esta = lunesDe(hoy.value);

  const copiarPrompt = async () => {
    const t = promptSemana(config, objetivos.value, horas.value);
    if (!(await copiar(t, 'Copiado. Ábrelo en Claude, pega y adjunta la foto.'))) setManual(t);
  };

  const importar = () => {
    const r = aplicarCodigo(respuesta);
    if (!r.ok) return setError(r.error);
    setError(null);
    cerrarTodo();
    pestana.value = 'semana';
    avisar(r.lineas, () => restaurar(r.deshacer), 10000);
  };

  return (
    <Hoja titulo="Semana con Claude">
      <p class="texto-2" style="margin:0 2px 12px;font-size:14px">
        Haz una foto de tu compra (o de la nevera y la despensa) y Claude te monta las comidas con lo que tienes. Usa tu Claude de siempre: no cuesta nada más.
      </p>
      <div class="segmentado" style="margin-bottom:12px">
        <button class={lunes === esta ? 'on' : ''} onClick={() => setLunes(esta)}>
          Esta semana · {fechaCorta(esta)}
        </button>
        <button class={lunes === proximoLunes() ? 'on' : ''} onClick={() => setLunes(proximoLunes())}>
          Próxima · {fechaCorta(proximoLunes())}
        </button>
      </div>

      <div class="tarjeta">
        <div class="paso-claude">
          <span>1</span>
          <div>
            <b>Copia las instrucciones</b>
            <div class="muted" style="font-size:13px">Llevan tus kcal, tus recetas y el horario de esa semana (gym, táper, Cabra). Si cambia algo, ajústalo antes en Semana.</div>
            <div class="fila" style="gap:8px;margin-top:8px">
              <button class="btn primario peq" onClick={copiarPrompt}>
                <ICopia /> Copiar instrucciones
              </button>
              <button class="btn peq" onClick={() => abrir({ t: 'generador', lunes })}>
                Horario
              </button>
            </div>
            {manual && <textarea class="campo" style="margin-top:8px;height:120px;font-size:12px" readOnly value={manual} onFocus={(e) => (e.target as HTMLTextAreaElement).select()} />}
          </div>
        </div>
        <div class="paso-claude">
          <span>2</span>
          <div>
            <b>Pégalas en Claude y adjunta la foto</b>
            <div class="muted" style="font-size:13px">
              <ICamara style="width:14px;height:14px;vertical-align:-2px" /> Mejor con los productos a la vista y las etiquetas legibles.
            </div>
            <a class="btn peq" style="margin-top:8px;text-decoration:none" href={URL_CLAUDE} target="_blank" rel="noopener">
              Abrir Claude <IFlecha />
            </a>
          </div>
        </div>
        <div class="paso-claude">
          <span>3</span>
          <div style="min-width:0;flex:1">
            <b>Copia su respuesta y pégala aquí</b>
            <div class="muted" style="font-size:13px">Usa el botón de copiar del bloque de código.</div>
            <textarea
              class="campo"
              style="margin-top:8px;height:110px;font-family:var(--f-num);font-size:12px"
              placeholder='{"rodri":1,"tipo":"semana",…}'
              value={respuesta}
              onInput={(e) => (setRespuesta((e.target as HTMLTextAreaElement).value), setError(null))}
            />
            {error && <div class="aviso" style="margin-top:8px">{error}</div>}
          </div>
        </div>
      </div>

      <div style="position:sticky;bottom:0;padding-top:12px;background:var(--bg)">
        <button class="btn primario ancho" disabled={!respuesta.trim()} style={!respuesta.trim() ? 'opacity:.4' : ''} onClick={importar}>
          Montar la semana
        </button>
      </div>
    </Hoja>
  );
}

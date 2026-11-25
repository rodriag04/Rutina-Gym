import { useMemo, useState } from 'preact/hooks';
import { ICamara, ICopia } from '../components/Iconos';
import { Hoja } from '../components/Hoja';
import { ImagenPlato, useFoto } from '../components/Imagen';
import { COMUNES, RACIONES, textoRacion } from '../data/comunes';
import { RECETAS, RECETA } from '../data/recetas';
import { comprimir, db } from '../lib/db';
import { diaCalculado, fotoId, registrar } from '../lib/estado';
import { nombreSlot } from '../lib/horario';
import { leerCodigo, pareceCodigo, promptComida } from '../lib/claude';
import { URL_CLAUDE } from './ConClaude';
import { macroReceta } from '../lib/nutricion';
import type { Macro, Slot } from '../lib/tipos';
import { avisar, cerrarTodo, fmt } from '../lib/ui';

type Modo = 'plan' | 'recetario' | 'fuera' | 'numeros';

const por = (m: Macro, k: number): Macro => ({ kcal: m.kcal * k, p: m.p * k, c: m.c * k, g: m.g * k });

export function Registrar({ fecha, slot }: { fecha: string; slot: Slot }) {
  const d = diaCalculado(fecha);
  const c = d?.comidas.find((x) => x.hueco.slot === slot);
  const tienePlan = !!c?.receta && !c.hueco.libre;
  const [modo, setModo] = useState<Modo>(tienePlan ? 'plan' : 'fuera');
  const [racion, setRacion] = useState(1);
  const [eleccion, setEleccion] = useState<string | null>(null);
  const [buscar, setBuscar] = useState('');
  const [num, setNum] = useState({ kcal: '', p: '', texto: '' });
  const [foto, setFoto] = useState<string | undefined>();
  const urlFoto = useFoto(foto);

  const resultado = useMemo((): { m: Macro; texto: string } | null => {
    if (modo === 'plan' && c?.receta) return { m: por(c.macro, racion), texto: `${c.receta.titulo}${racion !== 1 ? ` (×${textoRacion(racion)})` : ''}` };
    if (modo === 'recetario' && eleccion) {
      const r = RECETA[eleccion];
      return { m: por(macroReceta(r), racion), texto: `${r.titulo}${racion !== 1 ? ` (×${textoRacion(racion)})` : ''}` };
    }
    if (modo === 'fuera' && eleccion) {
      const x = COMUNES.find((y) => y.id === eleccion)!;
      return { m: por(x.m, racion), texto: `${x.nombre}${racion !== 1 ? ` (×${textoRacion(racion)})` : ''}` };
    }
    if (modo === 'numeros') {
      const k = Number(num.kcal.replace(',', '.'));
      const p = Number(num.p.replace(',', '.'));
      if (k > 0) return { m: { kcal: k, p: p || 0, c: 0, g: 0 }, texto: num.texto.trim() || 'Otra comida' };
    }
    return null;
  }, [modo, racion, eleccion, num, c]);

  const subir = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const blob = await comprimir(f);
    const id = fotoId();
    await db.guardarFoto(id, blob);
    setFoto(id);
  };

  const guardar = () => {
    if (!resultado) return;
    const antes = d?.comidas.filter((x) => !x.registro && x.hueco.slot !== slot && x.receta).map((x) => [x.hueco.slot, x.macro.kcal] as const) ?? [];
    const esPlan = modo === 'plan' && racion === 1;
    registrar(fecha, slot, esPlan ? 'hecho' : 'otro', resultado.m, { texto: esPlan ? undefined : resultado.texto, foto });
    const despues = diaCalculado(fecha);
    const cambios = antes
      .map(([s, k]) => {
        const n = despues?.comidas.find((x) => x.hueco.slot === s)?.macro.kcal ?? k;
        return Math.abs(n - k) > 20 ? `${nombreSlot(s)}: ${fmt(k)} → ${fmt(n)} kcal` : null;
      })
      .filter(Boolean) as string[];
    cerrarTodo();
    avisar([`${nombreSlot(slot)} apuntada: ${fmt(resultado.m.kcal)} kcal, ${fmt(resultado.m.p)} g de proteína.`, ...(cambios.length ? ['Resto del día reajustado:', ...cambios] : [])], undefined, 7000);
  };

  const copiarParaClaude = async () => {
    const t = promptComida(slot);
    try {
      await navigator.clipboard.writeText(t);
      avisar(['Copiado. En Claude: pega, adjunta la foto del plato y copia su respuesta aquí abajo.']);
    } catch {
      avisar([t]);
    }
  };

  const pegarRespuesta = (t: string) => {
    if (!pareceCodigo(t)) return;
    const r = leerCodigo(t, { alimentos: new Set(), recetas: new Set() });
    if (r.ok && r.codigo.tipo === 'comida') {
      const m = r.codigo.macro;
      setNum({ kcal: String(Math.round(m.kcal)), p: String(Math.round(m.p)), texto: r.codigo.texto });
      avisar([`Claude: ${r.codigo.texto}, ${Math.round(m.kcal)} kcal y ${Math.round(m.p)} g. Revisa y guarda.`]);
    } else if (!r.ok) avisar([r.error]);
  };

  const lista = RECETAS.filter((r) => r.id !== 'taper-mama' && r.titulo.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <Hoja titulo={`¿Qué has comido? · ${nombreSlot(slot)}`}>
      <label class="tarjeta pulsable" style="display:flex;align-items:center;gap:14px;cursor:pointer">
        <div style="width:64px;height:64px;border-radius:14px;overflow:hidden;background:var(--surface-2);display:grid;place-items:center;flex:none">
          {urlFoto ? <img src={urlFoto} style="width:100%;height:100%;object-fit:cover" alt="" /> : <ICamara class="muted" />}
        </div>
        <div>
          <div style="font-weight:800">{foto ? 'Foto añadida' : 'Haz una foto (opcional)'}</div>
          <div class="muted" style="font-size:13px">Se queda en tu historial. Los números los eliges abajo.</div>
        </div>
        <input type="file" accept="image/*" capture="environment" class="oculto" onChange={subir} />
      </label>

      <div class="segmentado" style="margin-top:14px">
        {tienePlan && (
          <button class={modo === 'plan' ? 'on' : ''} onClick={() => (setModo('plan'), setRacion(1))}>
            Lo del plan
          </button>
        )}
        <button class={modo === 'fuera' ? 'on' : ''} onClick={() => (setModo('fuera'), setEleccion(null), setRacion(1))}>
          Fuera
        </button>
        <button class={modo === 'recetario' ? 'on' : ''} onClick={() => (setModo('recetario'), setEleccion(null), setRacion(1))}>
          Recetario
        </button>
        <button class={modo === 'numeros' ? 'on' : ''} onClick={() => setModo('numeros')}>
          Números
        </button>
      </div>

      {modo === 'plan' && c?.receta && (
        <div class="tarjeta" style="margin-top:12px">
          <div class="fila">
            <div style="width:56px;height:56px;border-radius:12px;overflow:hidden;flex:none">
              <ImagenPlato receta={c.receta.id} />
            </div>
            <div>
              <div style="font-weight:800">{c.receta.titulo}</div>
              <div class="muted" style="font-size:13px">¿Comiste más o menos de lo que tocaba?</div>
            </div>
          </div>
          <Raciones valor={racion} poner={setRacion} />
        </div>
      )}

      {modo === 'fuera' && (
        <div class="tarjeta" style="margin-top:12px;padding:4px 16px">
          {COMUNES.map((x) => (
            <button class="opcion" style="width:100%;text-align:left" onClick={() => (setEleccion(x.id), setRacion(1))}>
              <div>
                <div class="t">{x.nombre}</div>
                <div class="d">
                  {x.detalle ? `${x.detalle} · ` : ''}
                  <span class="num">
                    {x.m.kcal} kcal · {x.m.p} g
                  </span>
                </div>
              </div>
              <span class={`caja${eleccion === x.id ? '' : ''}`} style={eleccion === x.id ? 'background:var(--verde);box-shadow:none;color:#fff' : ''}>
                {eleccion === x.id ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {modo === 'recetario' && (
        <div style="margin-top:12px">
          <input class="campo" placeholder="Buscar plato" value={buscar} onInput={(e) => setBuscar((e.target as HTMLInputElement).value)} />
          <div class="tarjeta" style="margin-top:8px;padding:4px 16px">
            {lista.map((r) => {
              const m = macroReceta(r);
              return (
                <button class="comida-semana" onClick={() => (setEleccion(r.id), setRacion(1))} style={eleccion === r.id ? 'background:var(--verde-suave);margin:0 -16px;padding:10px 16px;width:calc(100% + 32px)' : ''}>
                  <div class="miniatura">
                    <ImagenPlato receta={r.id} />
                  </div>
                  <div style="font-weight:700">{r.titulo}</div>
                  <div class="k">
                    <b>{fmt(m.kcal)}</b>
                    <br />
                    {fmt(m.p)} g
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {modo === 'numeros' && (
        <div class="tarjeta" style="margin-top:12px;display:grid;gap:10px">
          <input class="campo" placeholder="Qué era (opcional)" value={num.texto} onInput={(e) => setNum({ ...num, texto: (e.target as HTMLInputElement).value })} />
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label>
              <div class="etiqueta" style="margin-bottom:4px">kcal</div>
              <input class="campo num" inputMode="numeric" value={num.kcal} onInput={(e) => setNum({ ...num, kcal: (e.target as HTMLInputElement).value })} placeholder="650" />
            </label>
            <label>
              <div class="etiqueta" style="margin-bottom:4px">Proteína (g)</div>
              <input class="campo num" inputMode="decimal" value={num.p} onInput={(e) => setNum({ ...num, p: (e.target as HTMLInputElement).value })} placeholder="35" />
            </label>
          </div>
          <div class="tarjeta" style="background:var(--surface-2);box-shadow:none;padding:12px">
            <div style="font-weight:700;font-size:14px">¿No los sabes? Que los calcule Claude con la foto</div>
            <div class="muted" style="font-size:12.5px;margin:2px 0 8px">1. Copia el texto · 2. Pégalo en Claude con la foto del plato · 3. Pega aquí su respuesta</div>
            <div class="fila envolver" style="gap:6px">
              <button class="btn borde peq" onClick={copiarParaClaude}>
                <ICopia /> Copiar texto
              </button>
              <a class="btn borde peq" style="text-decoration:none" href={URL_CLAUDE} target="_blank" rel="noopener">
                Abrir Claude
              </a>
            </div>
            <input
              class="campo"
              style="margin-top:8px;font-family:var(--f-num);font-size:13px"
              placeholder="Pega aquí la respuesta de Claude"
              onInput={(e) => pegarRespuesta((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      )}

      {(modo === 'fuera' || modo === 'recetario') && eleccion && (
        <div class="tarjeta" style="margin-top:10px">
          <div class="etiqueta">Cuánto</div>
          <Raciones valor={racion} poner={setRacion} />
        </div>
      )}

      <div style="position:sticky;bottom:0;padding-top:12px;background:var(--bg)">
        <button class="btn primario ancho" disabled={!resultado} onClick={guardar} style={!resultado ? 'opacity:.4' : ''}>
          {resultado ? `Guardar · ${fmt(resultado.m.kcal)} kcal · ${fmt(resultado.m.p)} g prot` : 'Elige qué has comido'}
        </button>
      </div>
    </Hoja>
  );
}

function Raciones({ valor, poner }: { valor: number; poner: (x: number) => void }) {
  return (
    <div class="segmentado" style="margin-top:10px">
      {RACIONES.map((x) => (
        <button class={valor === x ? 'on' : ''} onClick={() => poner(x)}>
          ×{textoRacion(x)}
        </button>
      ))}
    </div>
  );
}

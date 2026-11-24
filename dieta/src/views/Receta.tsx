import { ICamara, ICambiar, ICheck, IFuego, IReloj, ISaltar, ILapiz } from '../components/Iconos';
import { Hoja } from '../components/Hoja';
import { ImagenPlato } from '../components/Imagen';
import { RECETA } from '../data/recetas';
import { comprimir, db } from '../lib/db';
import { diaCalculado, fotoId, fotosReceta, registrar, borrarRegistro } from '../lib/estado';
import { alimento, cantidades, macroPorciones, textoCantidad, type Porcion } from '../lib/nutricion';
import { abrir, avisar, cerrar, fmt } from '../lib/ui';
import type { Slot } from '../lib/tipos';

export function Receta({ id, fecha, slot }: { id: string; fecha?: string; slot?: Slot }) {
  const r = RECETA[id];
  const d = fecha ? diaCalculado(fecha) : null;
  const c = d?.comidas.find((x) => x.hueco.slot === slot && x.receta?.id === id);
  const porciones: Porcion[] = c && c.porciones.length ? c.porciones : cantidades(r, { fp: 1, fh: 1 }, false);
  const m = macroPorciones(porciones);
  const fresco = porciones.some((p) => alimento(p.a).fresco);

  const subirFoto = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const blob = await comprimir(f, 1200);
    const fid = fotoId();
    await db.guardarFoto(fid, blob);
    fotosReceta.value = { ...fotosReceta.value, [id]: fid };
    avisar(['Foto guardada: saldrá en este plato a partir de ahora.']);
  };

  return (
    <Hoja titulo={c ? c.hueco.etiqueta : 'Receta'}>
      <div class="receta-portada">
        <ImagenPlato receta={id} alt={r.titulo} />
        <label class="foto-btn">
          <ICamara /> {fotosReceta.value[id] ? 'Cambiar foto' : 'Tu foto'}
          <input type="file" accept="image/*" class="oculto" onChange={subirFoto} />
        </label>
      </div>
      <div class="receta-titulo">
        <h2>{r.titulo}</h2>
        <div class="texto-2" style="margin-top:4px">{r.sub}</div>
      </div>
      <div class="fila envolver" style="gap:6px;margin-top:10px">
        <span class="chip">
          <IReloj /> {r.min} min
        </span>
        {r.airfryer && (
          <span class="chip">
            <IFuego /> Airfryer {r.airfryer.temp} ºC
          </span>
        )}
        {(r.etiquetas ?? []).includes('despensa') && <span class="chip verde">De despensa</span>}
        {c?.ajustada && c.registro === undefined && <span class="chip aviso">Ajustada a lo que llevas hoy</span>}
      </div>

      <div class="cifras">
        <Cifra n={m.kcal} t="kcal" color="var(--verde)" />
        <Cifra n={m.p} t="Prot" color="var(--prot)" u="g" />
        <Cifra n={m.c} t="Hidr" color="var(--hc)" u="g" />
        <Cifra n={m.g} t="Grasa" color="var(--grasa)" u="g" />
      </div>

      {c && slot && fecha && (
        <div class="botones" style="margin-top:12px">
          {c.registro ? (
            <button class="btn" onClick={() => (borrarRegistro(fecha, slot), cerrar())}>
              Quitar marca
            </button>
          ) : (
            <button class="btn primario" onClick={() => (registrar(fecha, slot, 'hecho', m), cerrar(), avisar([`${r.titulo}: hecho`], () => borrarRegistro(fecha, slot), 3500))}>
              <ICheck /> Hecho
            </button>
          )}
          <button class="btn" onClick={() => abrir({ t: 'registrar', fecha, slot })}>
            <ILapiz /> Comí otra cosa
          </button>
          {!c.registro && (
            <>
              <button class="btn" onClick={() => abrir({ t: 'cambiar', fecha, slot })}>
                <ICambiar /> Cambiar plato
              </button>
              <button class="btn" onClick={() => (registrar(fecha, slot, 'saltada', { kcal: 0, p: 0, c: 0, g: 0 }), cerrar(), avisar(['Saltada: el resto del día se reajusta.'], () => borrarRegistro(fecha, slot)))}>
                <ISaltar /> Me la salto
              </button>
            </>
          )}
        </div>
      )}

      <div class="seccion">
        <h2>Ingredientes</h2>
        <span class="mas">{c ? 'cantidades de hoy' : 'ración normal'}</span>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        <ul class="ingredientes">
          {porciones
            .filter((p) => p.g > 0 || p.a === 'especias' || p.a === 'limon')
            .map((p) => (
              <li>
                <span>
                  {alimento(p.a).nombre}
                  {p.nota && p.a !== 'especias' && p.a !== 'limon' && <span class="nota"> · {p.nota}</span>}
                </span>
                <span class="cant">{textoCantidad(p)}</span>
              </li>
            ))}
        </ul>
      </div>

      {r.airfryer && (
        <div class="airfryer" style="margin-top:12px">
          <div class="temp">{r.airfryer.temp}º</div>
          <div>
            <div style="font-weight:800;font-family:var(--f-titulo)">Airfryer · {r.airfryer.tiempo}</div>
            <div style="font-size:13px;color:var(--hero-ink-2)">Precalienta 3 min. {r.airfryer.nota ? `${r.airfryer.nota[0].toUpperCase()}${r.airfryer.nota.slice(1)}.` : ''} Una sola capa.</div>
          </div>
        </div>
      )}

      <div class="seccion">
        <h2>Preparación</h2>
      </div>
      <ol class="pasos">
        {r.pasos.map((p) => (
          <li>{p}</li>
        ))}
      </ol>
      {r.truco && (
        <div class="aviso verde">
          <span>
            <b>Truco.</b> {r.truco}
          </span>
        </div>
      )}
      {fresco && (
        <div class="aviso" style="margin-top:8px">
          <span>Carne y pescado frescos: 1-2 días en la nevera. Si es para después del martes, congélalo al llegar de la compra y pásalo a la nevera la noche antes.</span>
        </div>
      )}
    </Hoja>
  );
}

function Cifra({ n, t, color, u = '' }: { n: number; t: string; color: string; u?: string }) {
  return (
    <div class="cifra">
      <b>
        {fmt(n)}
        {u && <small style="font-size:12px;font-weight:500"> {u}</small>}
      </b>
      <span>{t}</span>
      <i style={{ background: color }} />
    </div>
  );
}

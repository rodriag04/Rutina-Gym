import { useState } from 'preact/hooks';
import { Hoja } from '../components/Hoja';
import { IcoCompartir, IcoCopiar } from '../components/Iconos';
import { dia as getDia } from '../data/rutina';
import { resumenSesion } from '../lib/analisis';
import { ajustes, guardarSesion, sesiones, setBorrador, type Borrador } from '../lib/estado';
import { compartir, copiar, textoSesion } from '../lib/exportar';
import { kg as fkg, uid } from '../lib/formato';
import { ir } from '../lib/ruta';
import { mantenerPantalla } from '../lib/sonido';
import type { Sesion } from '../lib/tipos';

const ENERGIA = ['Floja', 'Normal', 'Buena', 'Muy buena'];
const MOLESTIAS = ['Muñeca izq.', 'Hombro', 'Codo', 'Lumbar', 'Rodilla'];

export function sesionDesde(b: Borrador): Sesion {
  const ex: Sesion['ex'] = {};
  for (const [id, l] of Object.entries(b.ex)) {
    const ok = l.filter((x): x is NonNullable<typeof x> => !!x);
    if (ok.length) ex[id] = ok;
  }
  const exNotas = Object.fromEntries(Object.entries(b.exNotas).filter(([, v]) => v.trim()));
  const dur = Math.round((Date.now() - new Date(b.inicio).getTime()) / 60000);
  return {
    id: b.editando ?? `${b.fecha}-${b.dia}-${uid().slice(0, 4)}`,
    fecha: b.fecha,
    dia: b.dia,
    gym: b.gym,
    gymConfirmado: true,
    notas: b.notas ?? '',
    ex,
    exNotas: Object.keys(exNotas).length ? exNotas : undefined,
    sensacion: b.sensacion,
    descarga: b.descarga || undefined,
    guardado: new Date().toISOString(),
    origen: 'app',
    duracionMin: b.editando ? undefined : dur > 0 && dur < 240 ? dur : undefined
  };
}

export function Terminar({ b, onCerrar, onGuardado }: { b: Borrador; onCerrar: () => void; onGuardado: () => void }) {
  const [guardada, setGuardada] = useState<Sesion | null>(null);
  const [copiado, setCopiado] = useState(false);
  const previa = sesionDesde(b);
  const otras = sesiones.value.filter((s) => s.id !== b.editando);
  const r = resumenSesion(previa, otras);
  const upd = (p: Partial<Borrador>) => setBorrador({ ...b, ...p });

  async function guardar() {
    const s = sesionDesde(b);
    if (b.editando) {
      const orig = sesiones.value.find((x) => x.id === b.editando);
      if (orig) {
        s.duracionMin = orig.duracionMin;
        s.origen = orig.origen;
        if (orig.sustituto) s.sustituto = orig.sustituto;
      }
    }
    await guardarSesion(s);
    await setBorrador(null);
    mantenerPantalla(false);
    setGuardada(s);
  }

  if (guardada) {
    const texto = textoSesion(guardada, sesiones.value, ajustes.value.gimnasios);
    return (
      <Hoja titulo="Sesión guardada" onCerrar={() => { onGuardado(); ir({ v: 'historial' }); }}>
        <pre class="resumen-texto">{texto}</pre>
        <div class="fila-btns">
          <button class="btn btn-prim" onClick={() => compartir(texto)}><IcoCompartir size={18} /> WhatsApp</button>
          <button class="btn" onClick={async () => setCopiado(await copiar(texto))}><IcoCopiar size={18} /> {copiado ? 'Copiado' : 'Copiar'}</button>
        </div>
      </Hoja>
    );
  }

  return (
    <Hoja titulo={b.editando ? 'Guardar cambios' : `Terminar · ${getDia(b.dia).nombre}`} onCerrar={onCerrar} alta>
      <div class="resumen-cifras">
        <div><span class="num grande">{r.hechas}/{r.previstas}</span><span>series</span></div>
        <div><span class="num grande">{r.records.length}</span><span>récords</span></div>
        {previa.duracionMin && <div><span class="num grande">{previa.duracionMin}</span><span>min</span></div>}
      </div>

      {(r.sinHacer.length > 0 || r.incompletos.length > 0) && (
        <div class="aviso aviso-atencion">
          <div>
            <strong>Te dejas series</strong>
            {r.sinHacer.length > 0 && <p>Sin hacer: {r.sinHacer.map((e) => e.corto).join(', ')}.</p>}
            {r.incompletos.map((x) => <p key={x.ex.id}>{x.ex.corto}: {x.hechas} de {b.descarga ? Math.ceil(x.ex.series / 2) : x.ex.series}.</p>)}
          </div>
        </div>
      )}
      {r.records.length > 0 && (
        <div class="aviso aviso-ok">
          <div>
            <strong>Récords (1RM estimado)</strong>
            <p>{r.records.map((x) => `${x.ex.corto} ${fkg(x.serie.kg)}×${x.serie.reps}`).join(' · ')}</p>
          </div>
        </div>
      )}
      {r.piramides.length > 0 && <p class="consejo">Pirámide en {r.piramides.map((e) => e.corto).join(', ')}: la próxima vez, un solo peso para todas.</p>}
      {r.calentamientos.length > 0 && <p class="consejo">Parece que apuntaste un calentamiento en {r.calentamientos.map((e) => e.corto).join(', ')}. No cuenta para calcular.</p>}
      {r.bajadasRir.length > 0 && <p class="consejo">{r.bajadasRir.map((e) => e.corto).join(', ')} va a 2 RIR: sin bajadas.</p>}

      <label class="campo-etq">Fecha
        <input class="campo" type="date" value={b.fecha} onInput={(e) => upd({ fecha: (e.target as HTMLInputElement).value })} />
      </label>
      <div class="campo-etq">Gimnasio
        <div class="chips">
          {ajustes.value.gimnasios.map((g) => (
            <button key={g.id} class={`chip ${b.gym === g.id ? 'activo' : ''}`} onClick={() => upd({ gym: g.id })}>{g.nombre}</button>
          ))}
        </div>
      </div>
      <div class="campo-etq">¿Qué tal?
        <div class="chips">
          {ENERGIA.map((t, i) => (
            <button key={t} class={`chip ${b.sensacion?.energia === i + 1 ? 'activo' : ''}`} onClick={() => upd({ sensacion: { ...b.sensacion, energia: b.sensacion?.energia === i + 1 ? undefined : i + 1 } })}>{t}</button>
          ))}
        </div>
      </div>
      <div class="campo-etq">Molestias
        <div class="chips">
          {MOLESTIAS.map((t) => {
            const on = b.sensacion?.molestias?.includes(t);
            const m = on ? b.sensacion!.molestias!.filter((x) => x !== t) : [...(b.sensacion?.molestias ?? []), t];
            return <button key={t} class={`chip ${on ? 'activo' : ''}`} onClick={() => upd({ sensacion: { ...b.sensacion, molestias: m } })}>{t}</button>;
          })}
        </div>
      </div>
      <label class="campo-etq">Notas
        <textarea class="campo" rows={3} placeholder="Sensaciones, máquinas ocupadas, cambios…" value={b.notas ?? ''} onInput={(e) => upd({ notas: (e.target as HTMLTextAreaElement).value })} />
      </label>

      <button class="btn btn-prim btn-ancho" onClick={guardar}>{b.editando ? 'Guardar cambios' : 'Guardar sesión'}</button>
      <button
        class="btn btn-texto-peligro btn-ancho"
        onClick={async () => {
          if (confirm(b.editando ? '¿Descartar los cambios?' : '¿Descartar la sesión? Se pierden las series apuntadas.')) {
            await setBorrador(null);
            mantenerPantalla(false);
            onCerrar();
          }
        }}
      >
        {b.editando ? 'Descartar cambios' : 'Descartar sesión'}
      </button>
    </Hoja>
  );
}

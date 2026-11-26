import { useEffect, useRef, useState } from 'preact/hooks';
import { IcoCamara, IcoEnviar, IcoX } from '../components/Iconos';
import {
  deshacer,
  foto as fotoEstado,
  herramientas,
  instrucciones,
  mensajeError,
  SUGERENCIAS,
  usarSample,
  type Deshacer,
  type ErrorSample,
  type Sample,
  type Turno
} from '../lib/asistente';
import { chat, setChat, type MensajeChat } from '../lib/estado';
import { hoyISO } from '../lib/formato';

// Chat con Claude dentro de la app. Solo existe en la versión que vive dentro de Claude.

const MAX_TURNOS = 14;
const deshacerPorMensaje = new Map<number, Deshacer>();
const hora = () => new Date().toTimeString().slice(0, 5);

function construirTurnos(historial: MensajeChat[]): Turno[] {
  const recientes = historial.filter((m) => !m.error || m.rol === 'yo').slice(-MAX_TURNOS);
  while (recientes.length && recientes[0].rol !== 'yo') recientes.shift();
  const turnos: Turno[] = [{ role: 'user', content: instrucciones() }, { role: 'assistant', content: 'Entendido. Te leo.' }];
  for (const m of recientes) {
    const extra = m.foto ? '\n[Adjunta una foto]' : '';
    const hechos = m.cambios?.length ? `\n(Cambios hechos en la app: ${m.cambios.join('; ')})` : '';
    turnos.push({ role: m.rol === 'yo' ? 'user' : 'assistant', content: `${m.texto || '(foto)'}${extra}${hechos}` });
  }
  return turnos;
}

/** Negritas (**así**) y viñetas "- " sin meter HTML. */
function Texto({ t }: { t: string }) {
  const out: preact.JSX.Element[] = [];
  let lista: string[] = [];
  const negritas = (s: string) => s.split(/\*\*(.+?)\*\*/g).map((x, i) => (i % 2 ? <b>{x}</b> : x));
  const cerrar = () => {
    if (lista.length) out.push(<ul>{lista.map((x) => <li>{negritas(x)}</li>)}</ul>);
    lista = [];
  };
  for (const l of t.split('\n')) {
    const m = l.match(/^\s*[-•*]\s+(.*)$/);
    if (m) {
      lista.push(m[1]);
      continue;
    }
    cerrar();
    if (l.trim()) out.push(<p>{negritas(l.replace(/^#+\s*/, ''))}</p>);
  }
  cerrar();
  return <>{out}</>;
}

/** Reduce la foto antes de mandarla. */
async function comprimir(f: File, lado = 1600): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((ok) => c.toBlob((b) => ok(b ?? f), 'image/jpeg', 0.85));
  } catch {
    return f;
  }
}

export function Chat() {
  const [sample, setSample] = useState<Sample | null | undefined>(undefined);
  const [limites, setLimites] = useState({ images: false, tools: false });
  const [texto, setTexto] = useState('');
  const [imagen, setImagen] = useState<{ blob: Blob; url: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [parcial, setParcial] = useState('');
  const [vivos, setVivos] = useState<string[]>([]);
  const ctl = useRef<AbortController | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vivo = true;
    usarSample().then(async (s) => {
      if (!vivo) return;
      // Es una función: se guarda envuelta para que Preact no la ejecute.
      setSample(() => s);
      if (s) {
        const l = await s.limits().catch(() => null);
        if (vivo) setLimites({ images: !!l?.images, tools: !!l?.tools });
      }
    });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => fin.current?.scrollIntoView({ block: 'end' }), [chat.value.length, parcial, vivos.length]);

  async function enviar(t: string, img: { blob: Blob; url: string } | null) {
    const s = sample;
    const msg = t.trim();
    if (!s || enviando || (!msg && !img)) return;
    setTexto('');
    setImagen(null);
    await setChat([...chat.value, { rol: 'yo', texto: msg, hora: hora(), fecha: hoyISO(), foto: img ? true : undefined }]);
    const antes = fotoEstado();
    const cambios: string[] = [];
    setEnviando(true);
    setParcial('');
    setVivos([]);
    const c = new AbortController();
    ctl.current = c;
    let respuesta: MensajeChat;
    try {
      const r = await s(construirTurnos(chat.value), {
        tools: limites.tools ? herramientas(cambios, () => setVivos([...cambios])) : undefined,
        images: img ? [img.blob] : undefined,
        cache: false,
        signal: c.signal,
        onText: ({ text }) => setParcial(text)
      });
      respuesta = { rol: 'claude', texto: r.text + (r.truncated ? '\n\n(Respuesta cortada: pregunta por partes.)' : ''), hora: hora(), fecha: hoyISO() };
    } catch (e) {
      const err = e as ErrorSample;
      respuesta = { rol: 'claude', texto: [err.text, mensajeError(err)].filter(Boolean).join('\n\n'), hora: hora(), fecha: hoyISO(), error: true };
    }
    if (cambios.length) respuesta.cambios = cambios;
    await setChat([...chat.value, respuesta]);
    if (cambios.length) deshacerPorMensaje.set(chat.value.length - 1, antes);
    setEnviando(false);
    setParcial('');
    setVivos([]);
    ctl.current = null;
  }

  const elegirFoto = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    (e.target as HTMLInputElement).value = '';
    if (!f) return;
    const blob = await comprimir(f);
    setImagen({ blob, url: URL.createObjectURL(blob) });
  };

  const mensajes = chat.value;
  return (
    <div class="vista vista-chat">
      <header class="cab-chat">
        <div>
          <p class="cab-chat-sub">Tu entrenador</p>
          <h1>Claude</h1>
        </div>
        {mensajes.length > 0 && !enviando && (
          <button
            class="chip"
            onClick={() => {
              deshacerPorMensaje.clear();
              void setChat([]);
            }}
          >
            Borrar chat
          </button>
        )}
      </header>

      {sample === null && (
        <div class="tarjeta">
          <strong>Claude no está disponible aquí.</strong>
          <p class="nota-pie">El chat funciona cuando abres esta app desde Claude (la app de Claude o claude.ai).</p>
        </div>
      )}
      {sample && !limites.tools && <p class="banda">En esta vista Claude puede contestarte, pero no cambiar la app. Ábrela en la app de Claude o en claude.ai.</p>}

      <div class="chat">
        {mensajes.length === 0 && (
          <div class="chat-vacio">
            <p>
              Cuéntale lo que cambia: una máquina ocupada, un ejercicio que has hecho en otra, series que no has apuntado, molestias. Ve tu rutina, tus pesos y la sesión de hoy, y lo cambia por ti.
            </p>
            <div class="chat-sugerencias">
              {SUGERENCIAS.map((s) => (
                <button key={s} class="chip" onClick={() => void enviar(s, null)} disabled={!sample}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {mensajes.map((m, i) => (
          <div key={i} class={`burbuja ${m.rol}${m.error ? ' error' : ''}`}>
            {m.foto && <p class="burbuja-foto">Foto</p>}
            {m.texto && <Texto t={m.texto} />}
            {m.cambios && (
              <div class="chat-cambios">
                {m.cambios.map((x) => (
                  <span key={x}>✓ {x}</span>
                ))}
                {deshacerPorMensaje.has(i) && i === mensajes.length - 1 && (
                  <button
                    class="chip"
                    onClick={async () => {
                      const d = deshacerPorMensaje.get(i)!;
                      deshacerPorMensaje.delete(i);
                      await deshacer(d);
                      await setChat([...chat.value.slice(0, i), { ...m, cambios: m.cambios!.map((x) => `${x} (deshecho)`) }]);
                    }}
                  >
                    Deshacer
                  </button>
                )}
              </div>
            )}
            <span class="hora">{m.hora}</span>
          </div>
        ))}
        {enviando && (
          <div class="burbuja claude">
            {parcial ? <Texto t={parcial} /> : <p class="muted">Pensando…</p>}
            {vivos.length > 0 && (
              <div class="chat-cambios">
                {vivos.map((x) => (
                  <span key={x}>✓ {x}</span>
                ))}
              </div>
            )}
          </div>
        )}
        <div ref={fin} />
      </div>

      <form
        class="compositor"
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(texto, imagen);
        }}
      >
        {imagen && (
          <div class="adjunto">
            <img src={imagen.url} alt="Foto para Claude" />
            <button type="button" aria-label="Quitar foto" onClick={() => setImagen(null)}>
              <IcoX size={12} />
            </button>
          </div>
        )}
        <div class="compositor-fila">
          {limites.images && (
            <label class="boton-foto" aria-label="Añadir foto">
              <IcoCamara size={20} />
              <input type="file" accept="image/*" class="oculto" onChange={elegirFoto} />
            </label>
          )}
          <textarea
            rows={1}
            value={texto}
            placeholder={imagen ? '¿Qué quieres saber de la foto?' : 'Escribe a Claude…'}
            onInput={(e) => setTexto((e.target as HTMLTextAreaElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(pointer: fine)').matches) {
                e.preventDefault();
                void enviar(texto, imagen);
              }
            }}
          />
          {enviando ? (
            <button type="button" class="boton-enviar parar" onClick={() => ctl.current?.abort()} aria-label="Parar">
              <span />
            </button>
          ) : (
            <button type="submit" class="boton-enviar" disabled={!sample || (!texto.trim() && !imagen)} aria-label="Enviar">
              <IcoEnviar size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

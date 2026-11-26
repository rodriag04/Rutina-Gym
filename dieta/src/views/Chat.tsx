import { useEffect, useRef, useState } from 'preact/hooks';
import { ICamara, ICerrar, IEnviar } from '../components/Iconos';
import { useFoto } from '../components/Imagen';
import { almacen } from '../lib/almacen';
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
import { comprimir } from '../lib/db';
import { ahoraHora } from '../lib/fechas';
import { chat, hoy, type MensajeChat } from '../lib/estado';
import { avisar, borradorChat } from '../lib/ui';

// El chat con Claude dentro de la app. Solo existe en la versión que vive dentro de Claude.

const MAX_TURNOS = 14;
const deshacerPorMensaje = new Map<number, Deshacer>();

function construirTurnos(historial: MensajeChat[]): Turno[] {
  const recientes = historial.filter((m) => !m.error || m.rol === 'yo').slice(-MAX_TURNOS);
  while (recientes.length && recientes[0].rol !== 'yo') recientes.shift();
  const turnos: Turno[] = [{ role: 'user', content: instrucciones() }];
  for (const m of recientes) {
    const extra = m.foto ? '\n[Adjunta una foto]' : '';
    const hechos = m.cambios?.length ? `\n(Cambios hechos en la app: ${m.cambios.join('; ')})` : '';
    turnos.push({ role: m.rol === 'yo' ? 'user' : 'assistant', content: `${m.texto || '(foto)'}${extra}${hechos}` });
  }
  return turnos;
}

/** Negritas (**así**) y viñetas "- " sin meter HTML. */
function Texto({ t }: { t: string }) {
  const lineas = t.split('\n');
  const out: preact.JSX.Element[] = [];
  let lista: string[] = [];
  const negritas = (s: string) => s.split(/\*\*(.+?)\*\*/g).map((x, i) => (i % 2 ? <b>{x}</b> : x));
  const cerrar = () => {
    if (lista.length) out.push(<ul>{lista.map((x) => <li>{negritas(x)}</li>)}</ul>);
    lista = [];
  };
  for (const l of lineas) {
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

function FotoMensaje({ id }: { id: string }) {
  const url = useFoto(id);
  return url ? <img class="chat-foto" src={url} alt="Foto enviada" /> : null;
}

export function Chat() {
  const [sample, setSample] = useState<Sample | null | undefined>(undefined);
  const [limites, setLimites] = useState<{ images: boolean; tools: boolean }>({ images: false, tools: false });
  const [texto, setTexto] = useState('');
  const [imagen, setImagen] = useState<{ blob: Blob; url: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [parcial, setParcial] = useState('');
  const [cambiosVivos, setCambiosVivos] = useState<string[]>([]);
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

  useEffect(() => fin.current?.scrollIntoView({ block: 'end' }), [chat.value.length, parcial, cambiosVivos.length]);

  // Texto que llega desde Cuéntame o desde Semana.
  useEffect(() => {
    const b = borradorChat.value;
    if (!b || sample === undefined) return;
    borradorChat.value = null;
    if (b.enviar && sample) void enviar(b.texto, null);
    else setTexto(b.texto);
  }, [sample, borradorChat.value]);

  async function enviar(t: string, img: { blob: Blob; url: string } | null) {
    const s = sample;
    const msg = t.trim();
    if (!s || enviando || (!msg && !img)) return;
    setTexto('');
    setImagen(null);
    let fotoId: string | undefined;
    if (img) {
      try {
        fotoId = await almacen.subirFoto(img.blob);
      } catch {
        /* la foto va a Claude aunque no se guarde en el historial */
      }
    }
    chat.value = [...chat.value, { rol: 'yo' as const, texto: msg, hora: ahoraHora(), fecha: hoy.value, foto: fotoId }].slice(-80);
    const antes = fotoEstado();
    const cambios: string[] = [];
    setEnviando(true);
    setParcial('');
    setCambiosVivos([]);
    const c = new AbortController();
    ctl.current = c;
    try {
      const r = await s(construirTurnos(chat.value), {
        tools: limites.tools ? herramientas(cambios, () => setCambiosVivos([...cambios])) : undefined,
        images: img ? [img.blob] : undefined,
        cache: false,
        signal: c.signal,
        onText: ({ text }) => setParcial(text)
      });
      chat.value = [...chat.value, { rol: 'claude', texto: r.text + (r.truncated ? '\n\n(Respuesta cortada: pregunta por partes.)' : ''), hora: ahoraHora(), fecha: hoy.value, cambios: cambios.length ? cambios : undefined }];
    } catch (e) {
      const err = e as ErrorSample;
      chat.value = [
        ...chat.value,
        { rol: 'claude', texto: [err.text, mensajeError(err)].filter(Boolean).join('\n\n'), hora: ahoraHora(), fecha: hoy.value, error: true, cambios: cambios.length ? cambios : undefined }
      ];
    } finally {
      if (cambios.length) deshacerPorMensaje.set(chat.value.length - 1, antes);
      setEnviando(false);
      setParcial('');
      setCambiosVivos([]);
      ctl.current = null;
    }
  }

  const elegirFoto = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    (e.target as HTMLInputElement).value = '';
    if (!f) return;
    const blob = await comprimir(f, 1600);
    setImagen({ blob, url: URL.createObjectURL(blob) });
  };

  if (sample === null)
    return (
      <>
        <Cabecera />
        <div class="tarjeta">
          <b>Claude no está disponible aquí.</b>
          <p class="texto-2" style="margin:6px 0 0;font-size:14px">
            El chat funciona cuando abres esta app desde Claude (la app de Claude o claude.ai). Mientras tanto, usa "Cuéntame" en Hoy.
          </p>
        </div>
      </>
    );

  const mensajes = chat.value;
  return (
    <>
      <Cabecera
        borrar={
          mensajes.length > 0 && !enviando
            ? () => {
                chat.value = [];
                deshacerPorMensaje.clear();
              }
            : undefined
        }
      />
      {!limites.tools && sample && <div class="aviso">En esta vista Claude puede contestarte, pero no cambiar el plan. Ábrela en la app de Claude o en claude.ai.</div>}

      <div class="chat">
        {mensajes.length === 0 && (
          <div class="chat-vacio">
            <p>
              Cuéntale lo que cambia, pregúntale lo que quieras o mándale una foto de un plato o de tu compra. Ve tu semana, tu peso y tus notas, y cambia el plan por ti.
            </p>
            <div class="fila envolver" style="gap:6px">
              {SUGERENCIAS.map((s) => (
                <button class="chip" onClick={() => void enviar(s, null)} disabled={!sample}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {mensajes.map((m, i) => (
          <div class={`burbuja ${m.rol}${m.error ? ' error' : ''}`}>
            {m.foto && <FotoMensaje id={m.foto} />}
            {m.texto && <Texto t={m.texto} />}
            {m.cambios && (
              <div class="chat-cambios">
                {m.cambios.map((x) => (
                  <span>✓ {x}</span>
                ))}
                {deshacerPorMensaje.has(i) && i === mensajes.length - 1 && (
                  <button
                    class="chip"
                    onClick={() => {
                      deshacer(deshacerPorMensaje.get(i)!);
                      deshacerPorMensaje.delete(i);
                      chat.value = [...chat.value.slice(0, i), { ...m, cambios: m.cambios!.map((x) => `${x} (deshecho)`) }];
                      avisar(['Cambios deshechos.']);
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
            {cambiosVivos.length > 0 && (
              <div class="chat-cambios">
                {cambiosVivos.map((x) => (
                  <span>✓ {x}</span>
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
              <ICerrar />
            </button>
          </div>
        )}
        <div class="compositor-fila">
          {limites.images && (
            <label class="boton-foto" aria-label="Añadir foto">
              <ICamara />
              <input id="chat-foto" type="file" accept="image/*" class="oculto" onChange={elegirFoto} />
            </label>
          )}
          <textarea
            id="chat-texto"
            rows={1}
            value={texto}
            placeholder={imagen ? '¿Qué quieres que haga con la foto?' : 'Escribe a Claude…'}
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
              <IEnviar />
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function Cabecera({ borrar }: { borrar?: () => void }) {
  return (
    <header class="cabecera">
      <div>
        <div class="sub">Tu dietista</div>
        <h1>Claude</h1>
      </div>
      {borrar && (
        <button class="chip" onClick={borrar}>
          Borrar chat
        </button>
      )}
    </header>
  );
}

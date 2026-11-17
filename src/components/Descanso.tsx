import { useEffect, useRef, useState } from 'preact/hooks';
import { ajustes, borrador, setBorrador } from '../lib/estado';
import { mmss } from '../lib/formato';
import { pitido } from '../lib/sonido';
import { ruta } from '../lib/ruta';
import { IcoX } from './Iconos';

/** Barra de descanso. Cuenta por marca de tiempo: sigue bien aunque iOS congele la app. */
export function Descanso() {
  const d = borrador.value?.descanso;
  const [ahora, setAhora] = useState(Date.now());
  const sonado = useRef<number | null>(null);

  useEffect(() => {
    if (!d) return;
    const id = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(id);
  }, [d?.hasta]);

  useEffect(() => {
    if (!d) return;
    const resta = (d.hasta - ahora) / 1000;
    if (resta <= 0 && sonado.current !== d.hasta) {
      sonado.current = d.hasta;
      if (ajustes.value.sonido && resta > -3) pitido();
    }
    if (resta < -8) cerrar();
  }, [ahora, d?.hasta]);

  if (!d) return null;
  const resta = (d.hasta - ahora) / 1000;
  const fin = resta <= 0;
  const pct = Math.max(0, Math.min(1, 1 - resta / d.total));

  function cambiar(seg: number) {
    const b = borrador.value;
    if (!b?.descanso) return;
    setBorrador({ ...b, descanso: { ...b.descanso, hasta: Math.max(Date.now(), b.descanso.hasta + seg * 1000), total: Math.max(5, b.descanso.total + seg) } });
  }
  function cerrar() {
    const b = borrador.value;
    if (b) setBorrador({ ...b, descanso: undefined });
  }

  return (
    <div class={`descanso ${fin ? 'descanso-fin' : ''} ${ruta.value.v === 'entrenar' ? 'descanso-alto' : ''}`} role="timer" aria-live="polite">
      <div class="descanso-barra" style={{ transform: `scaleX(${pct})` }} />
      <div class="descanso-contenido">
        <div class="descanso-tiempo num">{fin ? 'Ya' : mmss(resta)}</div>
        <div class="descanso-texto">
          <strong>{fin ? 'A por la siguiente' : 'Descanso'}</strong>
          <span>{d.texto}</span>
        </div>
        {!fin && (
          <>
            <button class="descanso-btn num" onClick={() => cambiar(-15)} aria-label="Quitar 15 segundos">−15</button>
            <button class="descanso-btn num" onClick={() => cambiar(15)} aria-label="Añadir 15 segundos">+15</button>
          </>
        )}
        <button class="descanso-btn" onClick={cerrar} aria-label="Cerrar descanso"><IcoX size={18} /></button>
      </div>
    </div>
  );
}

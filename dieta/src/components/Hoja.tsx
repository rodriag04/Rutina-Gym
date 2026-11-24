import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { cerrar } from '../lib/ui';
import { ICerrar } from './Iconos';

export function Hoja({ titulo, children }: { titulo: string; children: ComponentChildren }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <>
      <div class="velo" onClick={cerrar} />
      <div class="hoja" role="dialog" aria-label={titulo}>
        <div class="hoja-cab">
          <h2>{titulo}</h2>
          <button class="cerrar" onClick={cerrar} aria-label="Cerrar">
            <ICerrar />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { IcoX } from './Iconos';

/** Hoja inferior modal (estilo iOS). */
export function Hoja({ titulo, onCerrar, children, alta }: { titulo?: string; onCerrar: () => void; children: ComponentChildren; alta?: boolean }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    addEventListener('keydown', esc);
    document.body.classList.add('sin-scroll');
    return () => {
      removeEventListener('keydown', esc);
      document.body.classList.remove('sin-scroll');
    };
  }, []);
  return (
    <div class="hoja-fondo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div class={`hoja ${alta ? 'hoja-alta' : ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div class="hoja-cab">
          <span class="hoja-asa" />
          {titulo && <h2>{titulo}</h2>}
          <button class="btn-icono" onClick={onCerrar} aria-label="Cerrar"><IcoX /></button>
        </div>
        <div class="hoja-cuerpo">{children}</div>
      </div>
    </div>
  );
}

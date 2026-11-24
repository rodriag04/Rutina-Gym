import { fmt } from '../lib/ui';

/** Anillo de kcal: comido (sólido) y previsto (suave). Un solo indicador, sin leyenda. */
export function Anillo({ comido, previsto, objetivo }: { comido: number; previsto: number; objetivo: number }) {
  const R = 54;
  const L = 2 * Math.PI * R;
  const f = (x: number) => Math.max(0, Math.min(1, x / objetivo));
  return (
    <div class="anillo" role="img" aria-label={`${fmt(comido)} de ${fmt(objetivo)} kcal`}>
      <svg viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="11" />
        <circle cx="66" cy="66" r={R} fill="none" stroke="var(--lima)" stroke-opacity="0.32" stroke-width="11" stroke-linecap="round" stroke-dasharray={`${L * f(previsto)} ${L}`} />
        {comido > 0 && (
          <circle cx="66" cy="66" r={R} fill="none" stroke="var(--lima)" stroke-width="11" stroke-linecap="round" stroke-dasharray={`${L * f(comido)} ${L}`} />
        )}
      </svg>
      <div class="centro">
        <div>
          <div class="grande">{fmt(comido)}</div>
          <div class="peq">de {fmt(objetivo)} kcal</div>
        </div>
      </div>
    </div>
  );
}

export function BarraMacro({ nombre, color, comido, previsto, objetivo, unidad = 'g' }: { nombre: string; color: string; comido: number; previsto: number; objetivo: number; unidad?: string }) {
  const f = (x: number) => `${Math.max(0, Math.min(100, (x / objetivo) * 100))}%`;
  return (
    <div class="macro">
      <div class="fila">
        <span class="nombre">
          <i class="punto" style={{ background: color }} />
          {nombre}
        </span>
        <span class="num">
          {fmt(comido)} / {fmt(objetivo)} {unidad}
        </span>
      </div>
      <div class="barra">
        <i class="prevision" style={{ width: f(previsto), background: color }} />
        <i style={{ width: f(comido), background: color }} />
      </div>
    </div>
  );
}

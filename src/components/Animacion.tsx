import { useEffect, useRef, useState } from 'preact/hooks';
import { ANIMACIONES, Suelo, type DefFrente, type DefLado, type Resalte, type ResalteF } from './animaciones';
import { mezclar, resolverFrente, resolverLado, suave, type Articulaciones, type ArticulacionesF, type P } from './figura';

const Seg = ({ a, b, w, c = 'fig' }: { a: P; b: P; w: number; c?: string }) => (
  <line class={c} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke-width={w} />
);

/** Franja de músculo desplazada a un lado del segmento (lado: +1 o −1). */
function Franja({ a, b, lado, off, w, de = 0.18, a2 = 0.82 }: { a: P; b: P; lado: number; off: number; w: number; de?: number; a2?: number }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const n: P = [(-dy / l) * lado * off, (dx / l) * lado * off];
  const p1: P = [a[0] + dx * de + n[0], a[1] + dy * de + n[1]];
  const p2: P = [a[0] + dx * a2 + n[0], a[1] + dy * a2 + n[1]];
  return <line class="fig-musculo" x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke-width={w} />;
}

function Lado({ def, j }: { def: DefLado; j: Articulaciones }) {
  const r = new Set<Resalte>(def.musculo);
  return (
    <g>
      {def.fondo?.(j)}
      <g class="fig-lejos">
        <Seg a={j.cadera} b={j.rodilla2} w={12} />
        <Seg a={j.rodilla2} b={j.tobillo2} w={9.5} />
        <Seg a={j.tobillo2} b={j.punta2} w={5} />
        {!def.unBrazo && (
          <g>
            <Seg a={j.hombro} b={j.codo2} w={8.5} />
            <Seg a={j.codo2} b={j.mano2} w={7.5} />
          </g>
        )}
      </g>
      <Seg a={j.cadera} b={j.hombro} w={18} />
      <Seg a={j.hombro} b={j.cuello} w={7} />
      <circle class="fig-cabeza" cx={j.cabeza[0]} cy={j.cabeza[1]} r="9.5" />
      {r.has('pecho') && <Franja a={j.cadera} b={j.hombro} lado={1} off={4.5} w={8} de={0.55} a2={0.92} />}
      {r.has('espalda') && <Franja a={j.cadera} b={j.hombro} lado={-1} off={4.5} w={8} de={0.35} a2={0.9} />}
      {r.has('gluteo') && <Franja a={j.cadera} b={j.hombro} lado={-1} off={5} w={9} de={-0.06} a2={0.14} />}
      <Seg a={j.cadera} b={j.rodilla} w={13} />
      <Seg a={j.rodilla} b={j.tobillo} w={10} />
      <Seg a={j.tobillo} b={j.punta} w={5.5} />
      {r.has('muslo-del') && <Franja a={j.cadera} b={j.rodilla} lado={-1} off={3.2} w={6} />}
      {r.has('muslo-tras') && <Franja a={j.cadera} b={j.rodilla} lado={1} off={3.2} w={6} />}
      {r.has('gemelo') && <Franja a={j.rodilla} b={j.tobillo} lado={1} off={2.4} w={5} de={0.12} a2={0.62} />}
      {def.medio?.(j)}
      <Seg a={j.hombro} b={j.codo} w={13} c="fig-borde" />
      <Seg a={j.codo} b={j.mano} w={11.5} c="fig-borde" />
      <Seg a={j.hombro} b={j.codo} w={9.5} />
      <Seg a={j.codo} b={j.mano} w={8} />
      <circle class="fig" cx={j.mano[0]} cy={j.mano[1]} r="4.2" />
      {r.has('brazo-del') && <Franja a={j.hombro} b={j.codo} lado={-1} off={2.4} w={5} />}
      {r.has('brazo-tras') && <Franja a={j.hombro} b={j.codo} lado={1} off={2.4} w={5} />}
      {r.has('antebrazo') && <Franja a={j.codo} b={j.mano} lado={-1} off={2} w={4.5} />}
      {r.has('hombro') && <circle class="fig-musculo-c" cx={j.hombro[0]} cy={j.hombro[1]} r="6" />}
      {def.frente?.(j)}
    </g>
  );
}

function Frente({ def, j }: { def: DefFrente; j: ArticulacionesF }) {
  const r = new Set<ResalteF>(def.musculo);
  const sy = j.hombroI[1];
  const hy = j.caderaI[1];
  const torso = `M${j.hombroI[0]},${sy} L${j.hombroD[0]},${sy} L${j.caderaD[0]},${hy} L${j.caderaI[0]},${hy} Z`;
  const sentado = j.rodillaI[1] - hy < 20;
  return (
    <g>
      {def.fondo?.(j)}
      <Seg a={j.caderaI} b={j.rodillaI} w={sentado ? 14 : 13} />
      <Seg a={j.caderaD} b={j.rodillaD} w={sentado ? 14 : 13} />
      <Seg a={j.rodillaI} b={j.pieI} w={10} />
      <Seg a={j.rodillaD} b={j.pieD} w={10} />
      {r.has('aductor') && (
        <g>
          <Franja a={[j.cx - 5, hy + 2]} b={[j.rodillaI[0] + 3, j.rodillaI[1] + 2]} lado={1} off={0} w={6} de={0} a2={1} />
          <Franja a={[j.cx + 5, hy + 2]} b={[j.rodillaD[0] - 3, j.rodillaD[1] + 2]} lado={1} off={0} w={6} de={0} a2={1} />
        </g>
      )}
      <path class="fig-torso" d={torso} />
      <Seg a={[j.cx, sy]} b={j.cuello} w={8} />
      <circle class="fig-cabeza" cx={j.cabeza[0]} cy={j.cabeza[1]} r="10" />
      {r.has('pecho') && (
        <g>
          <line class="fig-musculo" x1={j.cx - 13} y1={sy + 9} x2={j.cx - 3} y2={sy + 9} stroke-width="9" />
          <line class="fig-musculo" x1={j.cx + 3} y1={sy + 9} x2={j.cx + 13} y2={sy + 9} stroke-width="9" />
        </g>
      )}
      {r.has('dorsal') && (
        <g>
          <line class="fig-musculo" x1={j.hombroI[0] + 5} y1={sy + 9} x2={j.caderaI[0] + 3} y2={hy - 16} stroke-width="6" />
          <line class="fig-musculo" x1={j.hombroD[0] - 5} y1={sy + 9} x2={j.caderaD[0] - 3} y2={hy - 16} stroke-width="6" />
        </g>
      )}
      {r.has('gluteo-lado') && (
        <g>
          <circle class="fig-musculo-c" cx={j.caderaI[0] - 3} cy={hy - 2} r="5.5" />
          <circle class="fig-musculo-c" cx={j.caderaD[0] + 3} cy={hy - 2} r="5.5" />
        </g>
      )}
      <Seg a={j.codoI} b={j.manoI} w={11.5} c="fig-borde" />
      <Seg a={j.codoD} b={j.manoD} w={11.5} c="fig-borde" />
      <Seg a={j.hombroI} b={j.codoI} w={9.5} />
      <Seg a={j.codoI} b={j.manoI} w={8} />
      <Seg a={j.hombroD} b={j.codoD} w={9.5} />
      <Seg a={j.codoD} b={j.manoD} w={8} />
      <circle class="fig" cx={j.manoI[0]} cy={j.manoI[1]} r="4.2" />
      <circle class="fig" cx={j.manoD[0]} cy={j.manoD[1]} r="4.2" />
      {r.has('hombro') && (
        <g>
          <circle class="fig-musculo-c" cx={j.hombroI[0]} cy={j.hombroI[1]} r="6.5" />
          <circle class="fig-musculo-c" cx={j.hombroD[0]} cy={j.hombroD[1]} r="6.5" />
        </g>
      )}
      {def.frente?.(j)}
    </g>
  );
}

export function Pose({ anim, t }: { anim: string; t: number }) {
  const def = ANIMACIONES[anim];
  if (!def) return null;
  if (def.vista === 'lado') return <Lado def={def} j={resolverLado(mezclar(def.A, def.B, t))} />;
  return <Frente def={def} j={resolverFrente(mezclar(def.A, def.B, t))} />;
}

const reducido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Figura animada en bucle: sube → pausa → baja → pausa, con el tempo del ejercicio. */
export function Animacion({ anim, tempo, compacta }: { anim: string; tempo: { sube: number; baja: number; pausa?: number }; compacta?: boolean }) {
  const [t, setT] = useState(0);
  const [fase, setFase] = useState<'sube' | 'arriba' | 'baja' | 'abajo'>('abajo');
  const [pausado, setPausado] = useState(reducido());
  const ref = useRef<SVGSVGElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (pausado) return;
    const pa = tempo.pausa ?? 0.4;
    const ciclo = [
      ['sube', tempo.sube],
      ['arriba', pa],
      ['baja', tempo.baja],
      ['abajo', 0.6]
    ] as const;
    const total = ciclo.reduce((a, c) => a + c[1], 0);
    let raf = 0;
    let ultimo = 0;
    const t0 = performance.now();
    const paso = (ahora: number) => {
      raf = requestAnimationFrame(paso);
      if (!visible.current || document.hidden || ahora - ultimo < 33) return;
      ultimo = ahora;
      let s = (((ahora - t0) / 1000) % total + total) % total;
      for (const [f, d] of ciclo) {
        if (s <= d) {
          const k = d ? s / d : 1;
          setFase(f);
          setT(f === 'sube' ? suave(k) : f === 'arriba' ? 1 : f === 'baja' ? 1 - suave(k) : 0);
          return;
        }
        s -= d;
      }
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [anim, pausado, tempo.sube, tempo.baja, tempo.pausa]);

  const def = ANIMACIONES[anim];
  if (!def) return null;
  const etiqueta = fase === 'sube' ? `Sube · ${tempo.sube} s` : fase === 'baja' ? `Baja · ${tempo.baja} s` : fase === 'arriba' ? 'Aprieta' : 'Estira';
  return (
    <div class={`anim ${compacta ? 'anim-compacta' : ''}`}>
      <svg ref={ref} viewBox="0 -16 240 206" role="img" aria-label="Animación de la técnica" onClick={() => setPausado(!pausado)}>
        {pausado && reducido() ? (
          <g>
            <g opacity="0.35"><Pose anim={anim} t={1} /></g>
            <Pose anim={anim} t={0} />
          </g>
        ) : (
          <Pose anim={anim} t={t} />
        )}
        {def.vista === 'frente' && def.sinSuelo ? null : <Suelo />}
      </svg>
      {!compacta && (
        <div class="anim-pie">
          <span class={`anim-fase anim-fase-${fase}`}>{pausado ? 'En pausa' : etiqueta}</span>
          <button class="btn-texto" onClick={() => setPausado(!pausado)}>{pausado ? 'Reproducir' : 'Pausa'}</button>
        </div>
      )}
    </div>
  );
}

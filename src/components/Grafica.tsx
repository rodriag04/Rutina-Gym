import { useEffect, useRef, useState } from 'preact/hooks';
import { desdeISO, fechaCorta, kg as fkg } from '../lib/formato';

export interface Punto {
  fecha: string;
  valor: number;
  etiqueta: string; // p. ej. "28×8"
}

function ticks(min: number, max: number, n = 4) {
  const paso0 = (max - min) / n || 1;
  const mag = 10 ** Math.floor(Math.log10(paso0));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= paso0) ?? paso0;
  const a = Math.floor(min / paso) * paso;
  const t: number[] = [];
  for (let v = a; v <= max + paso * 0.5; v += paso) t.push(Math.round(v * 100) / 100);
  return t;
}

/** Línea de progreso (una serie): 1RM estimado por sesión. Toca para ver cada punto. */
export function Grafica({ puntos, alto = 170, unidad = 'kg', titulo }: { puntos: Punto[]; alto?: number; unidad?: string; titulo: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(320);
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAncho(Math.max(220, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (puntos.length === 0) return <p class="vacio">Sin datos todavía.</p>;
  const m = { i: 34, d: 14, a: 12, b: 24 };
  const xs = puntos.map((p) => desdeISO(p.fecha).getTime());
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const vals = puntos.map((p) => p.valor);
  const t = ticks(Math.min(...vals) * 0.97, Math.max(...vals) * 1.02);
  const y0 = t[0];
  const y1 = t[t.length - 1];
  const X = (v: number) => m.i + (x1 === x0 ? (ancho - m.i - m.d) / 2 : ((v - x0) / (x1 - x0)) * (ancho - m.i - m.d));
  const Y = (v: number) => m.a + (1 - (v - y0) / (y1 - y0 || 1)) * (alto - m.a - m.b);
  const pts = puntos.map((p, i) => [X(xs[i]), Y(p.valor)] as const);
  const linea = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${linea} L${pts[pts.length - 1][0]},${alto - m.b} L${pts[0][0]},${alto - m.b} Z`;
  const elegir = (cx: number) => {
    let mejor = 0;
    pts.forEach((p, i) => Math.abs(p[0] - cx) < Math.abs(pts[mejor][0] - cx) && (mejor = i));
    setSel(mejor);
  };
  const s = sel != null ? puntos[sel] : null;
  const ultimo = pts.length - 1;
  return (
    <div class="grafica" ref={ref}>
      <svg
        width={ancho}
        height={alto}
        role="img"
        aria-label={titulo}
        onPointerDown={(e) => elegir(e.offsetX)}
        onPointerMove={(e) => (e.buttons || e.pointerType === 'mouse') && elegir(e.offsetX)}
        onPointerLeave={() => setSel(null)}
      >
        {t.map((v) => (
          <g key={v}>
            <line class="g-rejilla" x1={m.i} x2={ancho - m.d} y1={Y(v)} y2={Y(v)} />
            <text class="g-eje" x={m.i - 6} y={Y(v) + 4} text-anchor="end">{fkg(v)}</text>
          </g>
        ))}
        <text class="g-eje" x={m.i} y={alto - 6}>{fechaCorta(puntos[0].fecha)}</text>
        {puntos.length > 1 && <text class="g-eje" x={ancho - m.d} y={alto - 6} text-anchor="end">{fechaCorta(puntos[ultimo].fecha)}</text>}
        <path class="g-area" d={area} />
        <path class="g-linea" d={linea} />
        {s && <line class="g-cruz" x1={pts[sel!][0]} x2={pts[sel!][0]} y1={m.a} y2={alto - m.b} />}
        {pts.map((p, i) => (
          <circle key={i} class={`g-punto ${i === sel ? 'g-punto-sel' : ''}`} cx={p[0]} cy={p[1]} r={i === sel || i === ultimo ? 5 : 4} />
        ))}
        {!s && (
          <text class="g-valor" x={Math.min(pts[ultimo][0], ancho - m.d)} y={pts[ultimo][1] - 10} text-anchor="end">
            {puntos[ultimo].etiqueta}
          </text>
        )}
      </svg>
      {s && (
        <div class="g-tip" style={{ left: `${Math.min(Math.max(pts[sel!][0], 70), ancho - 70)}px` }}>
          <strong class="num">{fkg(s.valor)} {unidad}</strong>
          <span>{s.etiqueta} · {fechaCorta(s.fecha)}</span>
        </div>
      )}
    </div>
  );
}

/** Mini línea sin ejes para listas. */
export function Chispa({ valores, ancho = 72, alto = 26 }: { valores: number[]; ancho?: number; alto?: number }) {
  if (valores.length < 2) return <svg width={ancho} height={alto} />;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const X = (i: number) => 3 + (i / (valores.length - 1)) * (ancho - 6);
  const Y = (v: number) => 3 + (1 - (v - min) / (max - min || 1)) * (alto - 6);
  const d = valores.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={ancho} height={alto} aria-hidden="true">
      <path class="g-linea g-linea-fina" d={d} />
      <circle class="g-punto" cx={X(valores.length - 1)} cy={Y(valores[valores.length - 1])} r="3" />
    </svg>
  );
}

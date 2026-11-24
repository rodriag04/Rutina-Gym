import type { JSX } from 'preact';

// Ilustraciones de los platos: vista cenital, estilo plano con dos tonos.
// Todo se dibuja con una semilla fija por plato, así sale siempre igual.

type R = () => number;
type El = JSX.Element;

function rng(semilla: number): R {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
const entre = (r: R, a: number, b: number) => a + r() * (b - a);

/** Reparto en girasol dentro de un círculo. */
function girasol(r: R, cx: number, cy: number, rad: number, n: number, jitter = 0.35) {
  const out: { x: number; y: number; a: number }[] = [];
  const g = 2.39996;
  const off = r() * 6.28;
  for (let k = 0; k < n; k++) {
    const rr = rad * Math.sqrt((k + 0.5) / n) * (1 + (r() - 0.5) * jitter * 0.4);
    const ang = k * g + off + (r() - 0.5) * jitter;
    out.push({ x: cx + rr * Math.cos(ang), y: cy + rr * Math.sin(ang), a: r() * 180 });
  }
  return out;
}

const C = {
  plato: '#FBFAF6',
  platoBorde: '#E9E4D6',
  platoFondo: '#F4F0E5',
  sombra: 'rgba(70,45,20,0.16)',
  tomate: '#C8402A',
  tomateLuz: '#DE5A3C',
  pimRojo: '#D9412B',
  pimRojoLuz: '#EF6B4C',
  pimVerde: '#4F9A3B',
  pimVerdeLuz: '#73B95A',
  zanahoria: '#EE8A2A',
  zanahoriaLuz: '#F7A853',
  cebolla: '#F1E4C3',
  patata: '#E9B85A',
  patataOsc: '#C98F2F',
  patataLuz: '#F5D486',
  arroz: '#FAF6EC',
  arrozGrano: '#E6DEC8',
  pollo: '#EBC58F',
  polloOsc: '#C99556',
  polloLuz: '#F5DDB2',
  plancha: '#9B6334',
  salmon: '#F0875A',
  salmonOsc: '#D2683E',
  salmonGrasa: '#FBD2BA',
  pan: '#C98B4E',
  panOsc: '#9E6431',
  panLuz: '#E0AE74',
  miga: '#EFD9B0',
  queso: '#FBE7A8',
  quesoTostado: '#E2A54B',
  huevoClara: '#FFFDF5',
  yema: '#F4B22A',
  yemaLuz: '#F9CF63',
  jamon: '#C9454B',
  jamonGrasa: '#F6D7D2',
  pavo: '#F1CBBE',
  pavoOsc: '#E2AE9F',
  carne: '#7A3E24',
  carneLuz: '#9C5634',
  tortilla: '#E7C48A',
  tortillaOsc: '#C99A57',
  yogur: '#FFFFFF',
  arandano: '#3F4C8E',
  arandanoLuz: '#6574B5',
  nuez: '#A9743E',
  nuezLuz: '#C99560',
  platano: '#F4D03F',
  platanoOsc: '#D4A92A',
  hierba: '#5AA246',
  curry: '#E5A32F',
  curryLuz: '#F0BE55',
  madera: '#D7AA74',
  maderaOsc: '#BF8F5A'
};

// ───────── Soportes ─────────
const Plato = (cx = 100, cy = 100, rad = 80): El => (
  <g>
    <circle cx={cx + 4} cy={cy + 6} r={rad + 1} fill={C.sombra} />
    <circle cx={cx} cy={cy} r={rad} fill={C.plato} stroke={C.platoBorde} stroke-width="1.5" />
    <circle cx={cx} cy={cy} r={rad * 0.76} fill={C.platoFondo} />
    <circle cx={cx} cy={cy} r={rad * 0.76} fill="none" stroke={C.platoBorde} stroke-width="1" />
  </g>
);

const Cuenco = (cx = 100, cy = 100, rad = 76, color = '#FBFAF6'): El => (
  <g>
    <circle cx={cx + 4} cy={cy + 6} r={rad + 1} fill={C.sombra} />
    <circle cx={cx} cy={cy} r={rad} fill={color} stroke={C.platoBorde} stroke-width="1.5" />
    <circle cx={cx} cy={cy} r={rad * 0.86} fill="#EFEADC" />
  </g>
);

const Tabla = (x: number, y: number, w: number, h: number): El => (
  <g>
    <rect x={x + 4} y={y + 6} width={w} height={h} rx="14" fill={C.sombra} />
    <rect x={x} y={y} width={w} height={h} rx="14" fill={C.madera} />
    {[0.22, 0.45, 0.7].map((f) => (
      <path d={`M${x + 12} ${y + h * f} q ${w * 0.3} -6 ${w * 0.55} 0 t ${w * 0.35} 2`} stroke={C.maderaOsc} stroke-width="1.2" fill="none" opacity="0.5" />
    ))}
  </g>
);

// ───────── Ingredientes ─────────
function Verduras(r: R, cx: number, cy: number, rad: number, n = 16): El {
  const tipos = [
    [C.pimRojo, C.pimRojoLuz],
    [C.pimVerde, C.pimVerdeLuz],
    [C.zanahoria, C.zanahoriaLuz],
    [C.pimRojo, C.pimRojoLuz],
    [C.cebolla, '#FFF8E6']
  ];
  return (
    <g>
      {girasol(r, cx, cy, rad, n).map((p, k) => {
        const [c, l] = tipos[k % tipos.length];
        const largo = entre(r, 13, 20);
        if (c === C.cebolla)
          return <path d={`M${p.x - 7} ${p.y} q 7 -8 14 0`} stroke={c} stroke-width="3.2" fill="none" stroke-linecap="round" transform={`rotate(${p.a} ${p.x} ${p.y})`} />;
        return (
          <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
            <rect x={p.x - largo / 2} y={p.y - 2.6} width={largo} height="5.2" rx="2.6" fill={c} />
            <rect x={p.x - largo / 2 + 2} y={p.y - 2} width={largo * 0.6} height="1.6" rx="0.8" fill={l} />
          </g>
        );
      })}
    </g>
  );
}

function Patatas(r: R, cx: number, cy: number, rad: number, n = 6): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.6).map((p) => {
        const rx = entre(r, 10, 13);
        const ry = rx * entre(r, 0.72, 0.85);
        return (
          <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
            <ellipse cx={p.x} cy={p.y + 1.5} rx={rx} ry={ry} fill={C.patataOsc} />
            <ellipse cx={p.x} cy={p.y} rx={rx - 1} ry={ry - 1} fill={C.patata} />
            <ellipse cx={p.x - rx * 0.25} cy={p.y - ry * 0.25} rx={rx * 0.45} ry={ry * 0.35} fill={C.patataLuz} />
          </g>
        );
      })}
    </g>
  );
}

function Gajos(r: R, cx: number, cy: number, rad: number, n = 7): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.7).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <path d={`M${p.x - 14} ${p.y + 3} Q ${p.x} ${p.y - 13} ${p.x + 14} ${p.y + 3} Z`} fill={C.patata} stroke={C.patataOsc} stroke-width="2.4" stroke-linejoin="round" />
          <path d={`M${p.x - 7} ${p.y - 1} Q ${p.x} ${p.y - 7} ${p.x + 7} ${p.y - 1}`} stroke={C.patataLuz} stroke-width="2" fill="none" stroke-linecap="round" />
        </g>
      ))}
    </g>
  );
}

function Arroz(r: R, cx: number, cy: number, rad: number): El {
  return (
    <g>
      <circle cx={cx + 1.5} cy={cy + 2} r={rad} fill="#E8E0CC" />
      <circle cx={cx} cy={cy} r={rad} fill={C.arroz} />
      {girasol(r, cx, cy, rad - 4, Math.round(rad * 1.6)).map((p) => (
        <rect x={p.x - 2.6} y={p.y - 1} width="5.2" height="2" rx="1" fill={C.arrozGrano} transform={`rotate(${p.a} ${p.x} ${p.y})`} />
      ))}
    </g>
  );
}

function Salsa(r: R, cx: number, cy: number, rad: number, color: string, luz: string): El {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const a = (k / 10) * Math.PI * 2;
    const rr = rad * entre(r, 0.86, 1.06);
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  });
  const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + 'Z';
  return (
    <g>
      <path d={d} fill={color} stroke={color} stroke-width="10" stroke-linejoin="round" />
      <ellipse cx={cx - rad * 0.3} cy={cy - rad * 0.35} rx={rad * 0.35} ry={rad * 0.16} fill={luz} opacity="0.55" transform={`rotate(-25 ${cx} ${cy})`} />
    </g>
  );
}

function Pasta(r: R, cx: number, cy: number, rad: number, n = 22): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <rect x={p.x - 9} y={p.y - 3.6} width="18" height="7.2" rx="3.2" fill="#D9A443" />
          <rect x={p.x - 8.5} y={p.y - 3.6} width="17" height="5.6" rx="2.8" fill="#F0C66B" />
          <path d={`M${p.x - 4} ${p.y - 3} v6 M${p.x} ${p.y - 3} v6 M${p.x + 4} ${p.y - 3} v6`} stroke="#D9A443" stroke-width="0.9" />
        </g>
      ))}
    </g>
  );
}

function Migas(r: R, cx: number, cy: number, rad: number, n: number, color: string, luz: string, tam = 3.2): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n).map((p) => {
        const s = entre(r, tam * 0.7, tam * 1.3);
        return (
          <g>
            <circle cx={p.x} cy={p.y} r={s} fill={color} />
            <circle cx={p.x - s * 0.3} cy={p.y - s * 0.3} r={s * 0.4} fill={luz} />
          </g>
        );
      })}
    </g>
  );
}

function Hierbas(r: R, cx: number, cy: number, rad: number, n = 8): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n).map((p) => (
        <ellipse cx={p.x} cy={p.y} rx="2.4" ry="1.3" fill={C.hierba} transform={`rotate(${p.a} ${p.x} ${p.y})`} />
      ))}
    </g>
  );
}

function FiletePollo(r: R, cx: number, cy: number, rot = 0, n = 5, color = C.pollo, osc = C.polloOsc): El {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {Array.from({ length: n }, (_, k) => {
        const x = cx - (n - 1) * 6 + k * 12;
        const h = 30 - Math.abs(k - (n - 1) / 2) * 4;
        return (
          <g>
            <rect x={x - 7} y={cy - h / 2 + 1.5} width="14" height={h} rx="6" fill={osc} />
            <rect x={x - 7} y={cy - h / 2} width="13" height={h - 1} rx="6" fill={color} />
            <path d={`M${x - 5} ${cy - h / 4} l9 -4 M${x - 5} ${cy + 2} l9 -4`} stroke={C.plancha} stroke-width="1.6" stroke-linecap="round" opacity="0.8" />
          </g>
        );
      })}
      {void r}
    </g>
  );
}

function Tiras(r: R, cx: number, cy: number, rad: number, n: number, color: string, osc: string): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.5).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <rect x={p.x - 13} y={p.y - 4} width="26" height="9" rx="4.5" fill={osc} />
          <rect x={p.x - 13} y={p.y - 4.5} width="25" height="7.5" rx="3.8" fill={color} />
          <path d={`M${p.x - 6} ${p.y - 3} l3 6 M${p.x + 2} ${p.y - 3} l3 6`} stroke={C.plancha} stroke-width="1.3" opacity="0.6" />
        </g>
      ))}
    </g>
  );
}

function Dados(r: R, cx: number, cy: number, rad: number, n: number, color: string, osc: string, tam = 10): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.5).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <rect x={p.x - tam / 2} y={p.y - tam / 2 + 1.5} width={tam} height={tam} rx="2.6" fill={osc} />
          <rect x={p.x - tam / 2} y={p.y - tam / 2} width={tam - 0.5} height={tam - 1.2} rx="2.6" fill={color} />
        </g>
      ))}
    </g>
  );
}

function Salmon(cx: number, cy: number, rot = 0, esc = 1): El {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${esc})`}>
      <path d="M-30 -16 C -10 -24 20 -22 32 -12 C 38 -2 36 12 26 18 C 6 24 -18 22 -30 14 C -36 6 -36 -8 -30 -16 Z" fill={C.salmonOsc} />
      <path d="M-29 -17 C -10 -24 19 -22 30 -13 C 35 -3 33 10 24 15 C 6 20 -17 19 -28 12 C -33 5 -33 -9 -29 -17 Z" fill={C.salmon} />
      {[-18, -6, 6, 18].map((x) => (
        <path d={`M${x} -18 q 6 16 -2 32`} stroke={C.salmonGrasa} stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.9" />
      ))}
      <path d="M-24 -12 C -8 -18 14 -17 24 -10" stroke="#F7A27A" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>
  );
}

function Lubina(cx: number, cy: number, rot = 0): El {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <path d="M-42 -9 C -20 -17 24 -16 42 -6 C 46 0 44 6 40 9 C 20 16 -22 15 -42 8 C -47 3 -47 -4 -42 -9 Z" fill="#C2A272" />
      <path d="M-41 -10 C -20 -17 23 -16 40 -7 C 43 -1 42 4 38 7 C 20 13 -21 13 -40 6 C -44 2 -44 -5 -41 -10 Z" fill="#F4EEDF" />
      <path d="M-38 -6 C -16 -12 20 -11 36 -4" stroke="#AEB9BC" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M-30 -7 C -10 -11 14 -10 30 -5" stroke="#D7DFE1" stroke-width="1.6" fill="none" stroke-linecap="round" />
    </g>
  );
}

function Medallones(r: R, cx: number, cy: number, rad: number, n = 4): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.3).map((p) => (
        <g>
          <circle cx={p.x} cy={p.y + 2} r="12.5" fill="#7E4A2B" />
          <circle cx={p.x} cy={p.y} r="12" fill="#B67A4C" />
          <circle cx={p.x} cy={p.y} r="8.5" fill="#E2A88A" />
          <circle cx={p.x} cy={p.y} r="4.5" fill="#EDB9A1" />
        </g>
      ))}
    </g>
  );
}

function FiletesLomo(cx: number, cy: number, rot = 0): El {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      {[
        [-12, -8, -8],
        [10, 6, 10]
      ].map(([x, y, a]) => (
        <g transform={`translate(${x} ${y}) rotate(${a})`}>
          <ellipse cx="0" cy="2" rx="24" ry="15" fill="#A86E3F" />
          <ellipse cx="0" cy="0" rx="23.5" ry="14" fill="#D6A574" />
          <path d="M-14 -6 l10 10 M-4 -10 l14 14 M8 -9 l9 9" stroke={C.plancha} stroke-width="2" stroke-linecap="round" opacity="0.75" />
        </g>
      ))}
    </g>
  );
}

function Albondigas(r: R, cx: number, cy: number, rad: number, n = 7): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.4).map((p) => (
        <g>
          <circle cx={p.x + 1} cy={p.y + 2} r="9" fill="#5A2C18" />
          <circle cx={p.x} cy={p.y} r="8.6" fill={C.carne} />
          <circle cx={p.x - 3} cy={p.y - 3} r="3.2" fill={C.carneLuz} />
        </g>
      ))}
    </g>
  );
}

function Queso(r: R, cx: number, cy: number, rad: number, n = 9): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.6).map((p) => {
        const s = entre(r, 5, 9);
        return (
          <g>
            <ellipse cx={p.x} cy={p.y} rx={s * 1.3} ry={s} fill={C.queso} transform={`rotate(${p.a} ${p.x} ${p.y})`} />
            <circle cx={p.x + s * 0.3} cy={p.y} r={s * 0.35} fill={C.quesoTostado} opacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

function Huevo(cx: number, cy: number, rot = 0, roto = false): El {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <path d="M-20 -4 C -22 -16 -6 -22 6 -19 C 20 -16 24 -4 20 6 C 16 18 -2 21 -12 16 C -20 12 -19 6 -20 -4 Z" fill="#EDE6D2" transform="translate(1.5 2)" />
      <path d="M-20 -4 C -22 -16 -6 -22 6 -19 C 20 -16 24 -4 20 6 C 16 18 -2 21 -12 16 C -20 12 -19 6 -20 -4 Z" fill={C.huevoClara} />
      {roto ? (
        <path d="M-8 -6 C -4 -12 8 -10 9 -2 C 10 6 2 8 -2 14 C -4 8 -12 2 -8 -6 Z" fill={C.yema} />
      ) : (
        <circle cx="0" cy="-1" r="8.5" fill={C.yema} />
      )}
      <circle cx="-2.6" cy="-3.6" r="2.6" fill={C.yemaLuz} />
    </g>
  );
}

function Revuelto(r: R, cx: number, cy: number, rad: number): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, 11, 0.6).map((p) => {
        const s = entre(r, 8, 12);
        return (
          <g>
            <ellipse cx={p.x} cy={p.y + 1.5} rx={s * 1.2} ry={s} fill="#E7B833" transform={`rotate(${p.a} ${p.x} ${p.y})`} />
            <ellipse cx={p.x} cy={p.y} rx={s * 1.15} ry={s * 0.92} fill="#F6D24F" transform={`rotate(${p.a} ${p.x} ${p.y})`} />
            <ellipse cx={p.x - 2} cy={p.y - 2} rx={s * 0.5} ry={s * 0.35} fill="#FBE58F" />
          </g>
        );
      })}
    </g>
  );
}

function Tostada(cx: number, cy: number, rot = 0, w = 54, h = 46): El {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <rect x={-w / 2 + 2} y={-h / 2 + 3} width={w} height={h} rx="12" fill={C.sombra} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="12" fill={C.panOsc} />
      <rect x={-w / 2 + 4} y={-h / 2 + 4} width={w - 8} height={h - 8} rx="9" fill={C.panLuz} />
      {[-12, 0, 12].map((x) => (
        <circle cx={x} cy={(x % 5) + 2} r="1.4" fill={C.pan} opacity="0.7" />
      ))}
    </g>
  );
}

function Bocadillo(cx: number, cy: number, relleno: 'pavo' | 'jamon' | 'lomo'): El {
  const cara = (
    <g>
      <rect x="-68" y="-19" width="136" height="38" rx="19" fill={C.panOsc} />
      <rect x="-64" y="-15" width="128" height="30" rx="15" fill={C.miga} />
      <path d="M-56 -4 q 14 -8 28 0 t 28 0 t 28 0 t 28 0" stroke="#E0593E" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.75" />
      {relleno === 'jamon' &&
        [-44, -20, 4, 28].map((x, k) => (
          <g transform={`rotate(${k % 2 ? 8 : -6} ${x} 0)`}>
            <path d={`M${x - 14} -8 q 7 -5 14 0 q 7 5 14 0 l 0 14 q -7 5 -14 0 q -7 -5 -14 0 z`} fill={C.jamon} />
            <path d={`M${x - 14} 6 q 7 -5 14 0 q 7 5 14 0`} stroke={C.jamonGrasa} stroke-width="3" fill="none" />
          </g>
        ))}
      {relleno === 'pavo' &&
        [-42, -18, 6, 30].map((x, k) => (
          <rect x={x - 15} y={-12 + (k % 2) * 2} width="30" height="22" rx="7" fill={C.pavo} stroke={C.pavoOsc} stroke-width="1.6" transform={`rotate(${k % 2 ? 6 : -5} ${x} 0)`} />
        ))}
      {relleno === 'lomo' &&
        [-46, -26, -6, 14, 34].map((x) => (
          <g>
            <circle cx={x} cy="0" r="11" fill="#F3E2D9" />
            <circle cx={x} cy="0" r="9" fill="#A23A34" />
            <path d={`M${x - 5} -2 q 3 3 7 1 M${x - 2} 4 q 3 -1 5 1`} stroke="#E9B9B0" stroke-width="1.2" fill="none" />
          </g>
        ))}
    </g>
  );
  return (
    <g>
      <g transform={`translate(${cx} ${cy - 20}) rotate(-6)`}>{cara}</g>
      <g transform={`translate(${cx + 4} ${cy + 24}) rotate(-6)`}>
        <rect x="-66" y="-17" width="132" height="34" rx="17" fill={C.panOsc} />
        <rect x="-64" y="-17" width="128" height="30" rx="15" fill={C.pan} />
        <path d="M-56 -8 C -40 -13 40 -13 56 -8" stroke={C.panLuz} stroke-width="4" fill="none" stroke-linecap="round" />
        {[-40, -16, 8, 32].map((x) => (
          <path d={`M${x} -8 l14 10`} stroke={C.panOsc} stroke-width="3" stroke-linecap="round" />
        ))}
      </g>
    </g>
  );
}

function Tortilla(cx: number, cy: number, rad: number, r: R): El {
  return (
    <g>
      <circle cx={cx + 3} cy={cy + 4} r={rad} fill={C.sombra} />
      <circle cx={cx} cy={cy} r={rad} fill={C.tortillaOsc} />
      <circle cx={cx} cy={cy} r={rad - 3} fill={C.tortilla} />
      {girasol(r, cx, cy, rad - 6, 10).map((p) => (
        <ellipse cx={p.x} cy={p.y} rx="3" ry="2" fill={C.tortillaOsc} opacity="0.55" transform={`rotate(${p.a} ${p.x} ${p.y})`} />
      ))}
    </g>
  );
}

function Platano(cx: number, cy: number, rot = 0, esc = 1): El {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${esc})`}>
      <path d="M-46 -16 C -30 16 22 24 48 0 C 40 30 -24 30 -50 -10 Z" fill={C.platanoOsc} transform="translate(2 4)" opacity="0.4" />
      <path d="M-46 -16 C -30 16 22 24 48 0 C 40 30 -24 30 -50 -10 Z" fill={C.platano} />
      <path d="M-44 -12 C -28 14 20 20 44 2" stroke={C.platanoOsc} stroke-width="2" fill="none" opacity="0.7" />
      <path d="M-52 -14 l6 -6 l4 4" fill="#6B4A1E" stroke="#6B4A1E" stroke-width="3" stroke-linejoin="round" />
      <circle cx="49" cy="1" r="2.8" fill="#4D3416" />
    </g>
  );
}

function Rodajas(r: R, cx: number, cy: number, rad: number, n: number): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.3).map((p) => (
        <g>
          <circle cx={p.x} cy={p.y} r="7" fill="#F6E6A8" stroke="#E7D082" stroke-width="1" />
          <circle cx={p.x} cy={p.y} r="2.2" fill="#D8BE6A" />
        </g>
      ))}
    </g>
  );
}

function Arandanos(r: R, cx: number, cy: number, rad: number, n: number): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.6).map((p) => (
        <g>
          <circle cx={p.x} cy={p.y} r="4.6" fill={C.arandano} />
          <circle cx={p.x - 1.4} cy={p.y - 1.4} r="1.6" fill={C.arandanoLuz} />
          <circle cx={p.x + 1.2} cy={p.y + 1.3} r="1" fill="#2A3366" />
        </g>
      ))}
    </g>
  );
}

function Nueces(r: R, cx: number, cy: number, rad: number, n: number): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.6).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <path d={`M${p.x - 6} ${p.y} c 0 -6 5 -7 6 -3 c 1 -4 6 -3 6 3 c 0 6 -5 7 -6 3 c -1 4 -6 3 -6 -3 z`} fill={C.nuez} />
          <path d={`M${p.x} ${p.y - 4} v8`} stroke={C.nuezLuz} stroke-width="1.2" />
        </g>
      ))}
    </g>
  );
}

function Vaso(cx: number, cy: number, liquido: string, espuma: string): El {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <ellipse cx="4" cy="58" rx="30" ry="7" fill={C.sombra} />
      <path d="M-28 -52 L -22 54 Q 0 60 22 54 L 28 -52 Z" fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.9)" stroke-width="2" />
      <path d="M-25 -30 L -21 50 Q 0 56 21 50 L 25 -30 Z" fill={liquido} />
      <path d="M-25 -30 Q 0 -24 25 -30 L 25 -36 Q 0 -30 -25 -36 Z" fill={espuma} />
      <path d="M-18 -20 L -15 40" stroke="rgba(255,255,255,0.45)" stroke-width="4" stroke-linecap="round" />
    </g>
  );
}

function Yogur(cx: number, cy: number, esc = 1): El {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${esc})`}>
      <ellipse cx="3" cy="24" rx="20" ry="6" fill={C.sombra} />
      <path d="M-18 -16 L -15 20 Q 0 25 15 20 L 18 -16 Z" fill="#FFFFFF" stroke="#E4E0D4" stroke-width="1.2" />
      <rect x="-17" y="-4" width="34" height="12" fill="#2E7D5B" />
      <text x="0" y="5" text-anchor="middle" font-size="7" font-weight="700" fill="#FFFFFF" font-family="sans-serif">+PROT</text>
      <ellipse cx="0" cy="-16" rx="18" ry="5" fill="#F1EEE6" stroke="#E4E0D4" stroke-width="1.2" />
    </g>
  );
}

function Cuenquito(cx: number, cy: number, rad: number, relleno: string, borde = '#E9E4D6'): El {
  return (
    <g>
      <circle cx={cx + 2} cy={cy + 3} r={rad + 1} fill={C.sombra} />
      <circle cx={cx} cy={cy} r={rad} fill="#FBFAF6" stroke={borde} stroke-width="1.2" />
      <circle cx={cx} cy={cy} r={rad * 0.72} fill={relleno} />
      <ellipse cx={cx - rad * 0.2} cy={cy - rad * 0.25} rx={rad * 0.3} ry={rad * 0.14} fill="#FFFFFF" opacity="0.5" />
    </g>
  );
}

function Tomates(r: R, cx: number, cy: number, rad: number, n: number): El {
  return (
    <g>
      {girasol(r, cx, cy, rad, n, 0.5).map((p) => (
        <g>
          <circle cx={p.x} cy={p.y} r="7.5" fill={C.pimRojo} />
          <circle cx={p.x} cy={p.y} r="5.5" fill={C.pimRojoLuz} />
          {[0, 120, 240].map((a) => (
            <ellipse cx={p.x + 2.6 * Math.cos((a * Math.PI) / 180)} cy={p.y + 2.6 * Math.sin((a * Math.PI) / 180)} rx="1.4" ry="0.9" fill="#F7D6A1" />
          ))}
        </g>
      ))}
    </g>
  );
}

// ───────── Platos ─────────
const DIBUJOS: Record<string, (r: R) => El> = {
  'bocadillo-pavo': () => <g>{Tabla(14, 40, 172, 124)}{Bocadillo(100, 102, 'pavo')}</g>,
  'bocadillo-jamon': () => <g>{Tabla(14, 40, 172, 124)}{Bocadillo(100, 102, 'jamon')}</g>,
  'bocadillo-lomo': () => <g>{Tabla(14, 40, 172, 124)}{Bocadillo(100, 102, 'lomo')}</g>,
  revuelto: (r) => (
    <g>
      {Plato()}
      {Tostada(70, 112, -12)}
      {Revuelto(r, 118, 86, 26)}
      {Tiras(r, 120, 88, 22, 4, C.jamon, '#9E2F35')}
      {Hierbas(r, 116, 86, 26, 6)}
    </g>
  ),
  'tostada-huevo': (r) => (
    <g>
      {Plato()}
      {Tostada(76, 104, -8, 60, 50)}
      {Tostada(124, 96, 10, 56, 48)}
      <g transform="translate(0 0)">
        <rect x="58" y="88" width="34" height="30" rx="10" fill={C.pavo} transform="rotate(-8 76 104)" />
      </g>
      {Huevo(76, 102, -10)}
      {Tomates(r, 124, 96, 14, 3)}
      <rect x="110" y="104" width="30" height="10" rx="5" fill={C.pavo} transform="rotate(10 124 109)" />
    </g>
  ),
  platano: () => (
    <g>
      {Plato(100, 100, 78)}
      {Platano(100, 100, -18, 1.25)}
    </g>
  ),
  taper: (r) => (
    <g>
      <rect x="26" y="40" width="152" height="124" rx="22" fill={C.sombra} />
      <rect x="22" y="34" width="152" height="124" rx="22" fill="#E8F0F1" stroke="#B9CBCF" stroke-width="2" />
      <rect x="30" y="42" width="136" height="108" rx="16" fill="#F3F6F2" />
      {FiletePollo(r, 66, 76, -6, 4)}
      {Patatas(r, 128, 76, 20, 4)}
      {Verduras(r, 98, 122, 30, 14)}
      <rect x="92" y="28" width="16" height="10" rx="3" fill="#9FB6BB" />
    </g>
  ),
  bolonesa: (r) => (
    <g>
      {Plato()}
      {Pasta(r, 100, 100, 50, 24)}
      {Salsa(r, 104, 96, 28, C.tomate, C.tomateLuz)}
      {Migas(r, 104, 96, 26, 22, C.carne, C.carneLuz, 3)}
      {Verduras(r, 104, 96, 24, 6)}
      {Hierbas(r, 100, 100, 46, 9)}
    </g>
  ),
  curry: (r) => (
    <g>
      {Plato()}
      {Arroz(r, 74, 92, 30)}
      {Salsa(r, 124, 112, 30, C.curry, C.curryLuz)}
      {Dados(r, 124, 112, 24, 8, C.polloLuz, C.polloOsc, 11)}
      {Verduras(r, 124, 112, 22, 6)}
      {Hierbas(r, 74, 92, 26, 5)}
    </g>
  ),
  'salmon-patata': (r) => (
    <g>
      {Plato()}
      {Verduras(r, 72, 120, 26, 12)}
      {Patatas(r, 128, 126, 24, 4)}
      {Salmon(100, 78, -6, 1.05)}
      {Hierbas(r, 100, 78, 18, 4)}
      <path d="M140 72 a 12 12 0 0 1 0 22 z" fill="#F2E46B" stroke="#E0CC3F" stroke-width="1.5" />
    </g>
  ),
  gnocchi: (r) => (
    <g>
      {Plato()}
      {Salsa(r, 100, 100, 50, C.tomate, C.tomateLuz)}
      {girasol(r, 100, 100, 44, 18).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <ellipse cx={p.x} cy={p.y + 1.2} rx="7.6" ry="5.6" fill="#D9B070" />
          <ellipse cx={p.x} cy={p.y} rx="7.2" ry="5.2" fill="#F2D9A0" />
          <path d={`M${p.x - 3} ${p.y - 4} v8 M${p.x} ${p.y - 4.5} v9 M${p.x + 3} ${p.y - 4} v8`} stroke="#DDBF80" stroke-width="0.9" />
        </g>
      ))}
      {Dados(r, 100, 100, 30, 6, C.polloLuz, C.polloOsc, 9)}
      {Queso(r, 100, 100, 34, 8)}
      {Hierbas(r, 100, 100, 40, 7)}
    </g>
  ),
  solomillo: (r) => (
    <g>
      {Plato()}
      {Gajos(r, 128, 120, 26, 5)}
      {Verduras(r, 70, 120, 24, 10)}
      {Medallones(r, 100, 78, 24, 4)}
      {Cuenquito(146, 68, 13, '#F3E3B4')}
    </g>
  ),
  wok: (r) => (
    <g>
      {Cuenco(100, 102, 78)}
      {Arroz(r, 100, 102, 56)}
      {Tiras(r, 100, 102, 38, 7, '#E2B077', '#B9844B')}
      {Verduras(r, 100, 102, 46, 14)}
      {Migas(r, 100, 102, 44, 8, '#F4D04E', '#FBE48C', 3.6)}
      {Hierbas(r, 100, 102, 46, 8)}
      <path d="M150 20 L 186 150" stroke="#B78952" stroke-width="5" stroke-linecap="round" />
      <path d="M162 18 L 194 140" stroke="#C99A60" stroke-width="5" stroke-linecap="round" />
    </g>
  ),
  albondigas: (r) => (
    <g>
      {Plato()}
      {Arroz(r, 70, 90, 26)}
      {Salsa(r, 122, 110, 32, C.tomate, C.tomateLuz)}
      {Albondigas(r, 122, 110, 24, 6)}
      {Verduras(r, 74, 130, 16, 6)}
      {Hierbas(r, 122, 110, 30, 6)}
    </g>
  ),
  lubina: (r) => (
    <g>
      {Plato()}
      {Verduras(r, 76, 126, 22, 10)}
      {Patatas(r, 130, 124, 22, 4)}
      {Lubina(100, 80, -8)}
      {Hierbas(r, 100, 80, 22, 4)}
      <path d="M150 86 a 11 11 0 0 1 0 20 z" fill="#F2E46B" stroke="#E0CC3F" stroke-width="1.5" />
    </g>
  ),
  cinta: (r) => (
    <g>
      {Plato()}
      {Verduras(r, 70, 124, 24, 10)}
      {Patatas(r, 130, 126, 22, 4)}
      {FiletesLomo(100, 80, -10)}
      {Hierbas(r, 100, 80, 24, 5)}
    </g>
  ),
  'pasta-atun': (r) => (
    <g>
      {Plato()}
      {Pasta(r, 100, 100, 50, 24)}
      {Salsa(r, 100, 100, 26, C.tomate, C.tomateLuz)}
      {Migas(r, 100, 100, 24, 14, '#D9B9A1', '#EBD3C2', 3.4)}
      {Verduras(r, 100, 100, 30, 6)}
      {Hierbas(r, 100, 100, 46, 9)}
    </g>
  ),
  burger: (r) => (
    <g>
      {Plato()}
      {Gajos(r, 138, 112, 20, 4)}
      {Verduras(r, 98, 144, 16, 6)}
      <circle cx="84" cy="88" r="38" fill={C.panOsc} />
      <circle cx="84" cy="86" r="36" fill={C.pan} />
      <circle cx="84" cy="86" r="29" fill="#5E3019" />
      <path d="M58 76 q 14 -10 30 -6 q 18 4 22 18 q -8 4 -14 0 q -10 12 -22 4 q -10 4 -16 -16 z" fill="#F7D35E" />
      <circle cx="96" cy="96" r="9" fill={C.pimRojo} />
      <circle cx="96" cy="96" r="6.5" fill={C.pimRojoLuz} />
      <circle cx="74" cy="102" r="8" fill={C.pimRojo} />
      <circle cx="74" cy="102" r="5.6" fill={C.pimRojoLuz} />
    </g>
  ),
  'pollo-gajos': (r) => (
    <g>
      {Plato()}
      {Gajos(r, 76, 112, 28, 6)}
      {Tiras(r, 120, 84, 26, 5, '#E1A564', '#B97A3E')}
      {Verduras(r, 124, 132, 18, 7)}
      {Cuenquito(152, 132, 15, '#FFFFFF')}
      {Hierbas(r, 152, 132, 8, 3)}
    </g>
  ),
  burrito: (r) => (
    <g>
      {Plato()}
      {[
        [76, 86, -20],
        [124, 116, -20]
      ].map(([x, y, a]) => (
        <g transform={`translate(${x} ${y}) rotate(${a})`}>
          <rect x="-36" y="-22" width="72" height="44" rx="22" fill={C.tortillaOsc} />
          <rect x="-34" y="-20" width="68" height="40" rx="20" fill={C.tortilla} />
          <ellipse cx="30" cy="0" rx="10" ry="18" fill="#F7F3E8" />
          <circle cx="29" cy="-7" r="3" fill={C.pollo} />
          <circle cx="32" cy="2" r="2.6" fill={C.pimRojo} />
          <circle cx="27" cy="7" r="2.4" fill={C.pimVerde} />
          <circle cx="33" cy="-1" r="1.8" fill={C.queso} />
          {[-20, -6, 8].map((k) => (
            <ellipse cx={k} cy={k % 3} rx="4" ry="2.4" fill={C.tortillaOsc} opacity="0.6" />
          ))}
        </g>
      ))}
      {Cuenquito(150, 64, 14, '#FFFFFF')}
      {Hierbas(r, 100, 100, 50, 6)}
    </g>
  ),
  'pavo-arroz': (r) => (
    <g>
      {Plato()}
      {Arroz(r, 76, 90, 30)}
      {Dados(r, 124, 108, 26, 9, '#E4A06A', '#BD7A44', 11)}
      {Verduras(r, 90, 134, 20, 8)}
      {Hierbas(r, 120, 104, 28, 6)}
    </g>
  ),
  batido: (r) => (
    <g>
      {Vaso(78, 96, '#D9BC9C', '#F1E4D2')}
      {Platano(140, 140, -40, 0.62)}
      {Nueces(r, 146, 62, 16, 5)}
    </g>
  ),
  'batido-arandanos': (r) => (
    <g>
      {Vaso(84, 96, '#8D5FA7', '#C7A8DA')}
      {Arandanos(r, 148, 132, 20, 12)}
      {Nueces(r, 148, 60, 14, 4)}
    </g>
  ),
  'yogur-bowl': (r) => (
    <g>
      {Cuenco(100, 100, 76)}
      <circle cx="100" cy="100" r="60" fill={C.yogur} />
      <path d="M70 92 q 30 -22 60 0 q -30 26 -60 0" fill="none" stroke="#ECE8DD" stroke-width="3" />
      {Arandanos(r, 80, 86, 22, 14)}
      {Rodajas(r, 124, 112, 18, 5)}
      {Nueces(r, 104, 128, 14, 4)}
    </g>
  ),
  'tostada-yogur': (r) => (
    <g>
      {Plato(84, 104, 66)}
      {Tostada(84, 104, -8, 70, 54)}
      <rect x="58" y="88" width="52" height="30" rx="12" fill={C.pavo} transform="rotate(-8 84 104)" />
      <rect x="62" y="92" width="44" height="8" rx="4" fill={C.pavoOsc} transform="rotate(-8 84 104)" opacity="0.6" />
      {Tomates(r, 84, 104, 10, 2)}
      {Yogur(158, 82)}
      {Nueces(r, 160, 146, 12, 3)}
    </g>
  ),
  'pizza-wrap': (r) => (
    <g>
      {Tortilla(100, 100, 72, r)}
      {Salsa(r, 100, 100, 54, C.tomate, C.tomateLuz)}
      {Queso(r, 100, 100, 48, 14)}
      {girasol(r, 100, 100, 44, 7).map((p) => (
        <rect x={p.x - 7} y={p.y - 5} width="14" height="10" rx="4" fill={C.pavo} stroke={C.pavoOsc} stroke-width="1" transform={`rotate(${p.a} ${p.x} ${p.y})`} />
      ))}
      {Verduras(r, 100, 100, 46, 8)}
      {Hierbas(r, 100, 100, 50, 14)}
      <path d="M100 28 V 172 M28 100 H 172" stroke="rgba(120,70,30,0.35)" stroke-width="1.5" />
    </g>
  ),
  pita: (r) => (
    <g>
      {Plato()}
      {[
        [80, 96, -30],
        [118, 112, 20]
      ].map(([x, y, a]) => (
        <g transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M-34 8 A 34 34 0 0 1 34 8 Z" fill={C.tortillaOsc} />
          <path d="M-31 8 A 31 31 0 0 1 31 8 Z" fill={C.tortilla} />
          <path d="M-30 8 Q 0 -4 30 8 Q 0 18 -30 8 Z" fill="#FFFFFF" />
          {[-18, -6, 6, 18].map((k, i) => (
            <circle cx={k} cy={6} r="4" fill={[C.pollo, C.pimRojo, C.pimVerde, C.pollo][i]} />
          ))}
        </g>
      ))}
      {Cuenquito(150, 62, 13, '#FFFFFF')}
      {Hierbas(r, 150, 62, 6, 3)}
    </g>
  ),
  poke: (r) => (
    <g>
      {Cuenco(100, 100, 78)}
      <path d="M100 100 L 100 34 A 66 66 0 0 1 157 133 Z" fill={C.arroz} />
      {Arroz(r, 120, 76, 26)}
      {Dados(r, 74, 86, 26, 9, C.salmon, C.salmonOsc, 12)}
      {Verduras(r, 104, 136, 24, 10)}
      {girasol(r, 100, 100, 54, 20).map((p) => (
        <ellipse cx={p.x} cy={p.y} rx="1.4" ry="0.8" fill="#F4EBD5" transform={`rotate(${p.a} ${p.x} ${p.y})`} />
      ))}
      {Hierbas(r, 100, 100, 50, 8)}
    </g>
  ),
  quesadilla: (r) => (
    <g>
      {Plato()}
      {[
        [76, 84, 0],
        [118, 80, 60],
        [104, 124, -60]
      ].map(([x, y, a]) => (
        <g transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M-26 -18 L 26 -18 L 0 26 Z" fill={C.tortillaOsc} stroke={C.tortillaOsc} stroke-width="6" stroke-linejoin="round" />
          <path d="M-24 -17 L 24 -17 L 0 23 Z" fill={C.tortilla} stroke={C.tortilla} stroke-width="3" stroke-linejoin="round" />
          <path d="M-22 -18 q 6 6 12 0 q 6 7 12 0 q 6 6 12 0" fill={C.queso} stroke="#F2CF66" stroke-width="2" />
          <path d="M-10 -8 l14 14 M2 -12 l10 10" stroke={C.tortillaOsc} stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
        </g>
      ))}
      {Cuenquito(150, 140, 14, '#FFFFFF')}
      {Hierbas(r, 100, 100, 46, 6)}
    </g>
  ),
  tacos: (r) => (
    <g>
      {Plato()}
      {[
        [100, 70, 0],
        [72, 120, -28],
        [130, 122, 28]
      ].map(([x, y, a]) => (
        <g transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M-30 2 Q -28 -22 0 -24 Q 28 -22 30 2 Z" fill={C.carne} />
          {[-18, -9, 0, 9, 18].map((k, i) => (
            <circle cx={k} cy={-10 - (i % 2) * 5} r="4.2" fill={[C.carneLuz, C.pimRojo, C.carne, C.pimRojoLuz, C.carneLuz][i]} />
          ))}
          <ellipse cx="-4" cy="-14" rx="7" ry="4" fill="#FFFFFF" />
          <ellipse cx="12" cy="-6" rx="2.6" ry="1.4" fill={C.hierba} />
          <ellipse cx="-14" cy="-4" rx="2.6" ry="1.4" fill={C.hierba} />
          <path d="M-32 0 Q 0 30 32 0 Q 30 10 0 14 Q -30 10 -32 0 Z" fill={C.tortillaOsc} />
          <path d="M-32 -1 Q 0 26 32 -1 L 32 3 Q 0 22 -32 3 Z" fill={C.tortilla} />
        </g>
      ))}
      {void r}
    </g>
  ),
  'patata-rellena': (r) => (
    <g>
      {Plato()}
      {[
        [76, 84, -20],
        [126, 110, 20]
      ].map(([x, y, a]) => (
        <g transform={`translate(${x} ${y}) rotate(${a})`}>
          <ellipse cx="2" cy="4" rx="32" ry="22" fill="#8F6230" />
          <ellipse cx="0" cy="0" rx="32" ry="22" fill="#B98544" />
          <ellipse cx="0" cy="-1" rx="26" ry="16" fill="#F2D38E" />
          <ellipse cx="-6" cy="-3" rx="10" ry="6" fill="#D9BAA2" />
          <ellipse cx="8" cy="2" rx="9" ry="5" fill="#D9BAA2" />
          <ellipse cx="0" cy="0" rx="18" ry="10" fill="#FBE3A0" opacity="0.85" />
          <circle cx="-6" cy="-2" r="3" fill={C.quesoTostado} opacity="0.8" />
          <circle cx="7" cy="3" r="2.4" fill={C.quesoTostado} opacity="0.8" />
        </g>
      ))}
      {Verduras(r, 82, 138, 16, 6)}
      {Hierbas(r, 100, 96, 40, 8)}
    </g>
  ),
  'huevos-rotos': (r) => (
    <g>
      {Plato()}
      {girasol(r, 100, 104, 46, 12, 0.4).map((p) => (
        <g transform={`rotate(${p.a} ${p.x} ${p.y})`}>
          <rect x={p.x - 11} y={p.y - 7} width="22" height="14" rx="6" fill={C.patataOsc} />
          <rect x={p.x - 10} y={p.y - 7} width="20" height="12" rx="5.5" fill={C.patata} />
        </g>
      ))}
      {Verduras(r, 100, 104, 40, 8)}
      {Huevo(86, 92, 10, true)}
      {Huevo(120, 112, -20, true)}
      {Tiras(r, 104, 102, 34, 4, C.jamon, '#9E2F35')}
    </g>
  )
};

export function Ilustracion({ dibujo, fondo, titulo }: { dibujo: string; fondo: string; titulo?: string }) {
  const r = rng(hash(dibujo));
  const pintar = DIBUJOS[dibujo];
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={titulo ?? dibujo} preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="200" fill={fondo} />
      {[30, 80, 130, 180, 230].map((x) => (
        <path d={`M${x} -10 L ${x - 140} 210`} stroke="#FFFFFF" stroke-width="16" opacity="0.08" />
      ))}
      {pintar ? pintar(r) : Plato()}
    </svg>
  );
}

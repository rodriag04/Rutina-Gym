import type { VNode } from 'preact';
import { desde, type Articulaciones, type ArticulacionesF, type P, type PoseFrente, type PoseLado } from './figura';

export type Resalte = 'brazo-del' | 'brazo-tras' | 'antebrazo' | 'pecho' | 'espalda' | 'hombro' | 'muslo-del' | 'muslo-tras' | 'gemelo' | 'gluteo';
export type ResalteF = 'hombro' | 'pecho' | 'dorsal' | 'aductor' | 'gluteo-lado';

export interface DefLado {
  vista: 'lado';
  A: PoseLado;
  B: PoseLado;
  musculo: Resalte[];
  fondo?: (j: Articulaciones) => VNode;
  /** Entre el cuerpo y el brazo cercano (apoyos del brazo). */
  medio?: (j: Articulaciones) => VNode;
  frente?: (j: Articulaciones) => VNode;
  /** Un solo brazo (ejercicios unilaterales). */
  unBrazo?: boolean;
}
export interface DefFrente {
  vista: 'frente';
  sinSuelo?: boolean;
  A: PoseFrente;
  B: PoseFrente;
  musculo: ResalteF[];
  espalda?: boolean;
  fondo?: (j: ArticulacionesF) => VNode;
  frente?: (j: ArticulacionesF) => VNode;
}
export type DefAnim = DefLado | DefFrente;

const SUELO = 177;

// ── Piezas de equipo ──
const Suelo = () => <line class="eq-suelo" x1="8" y1={SUELO + 1.5} x2="232" y2={SUELO + 1.5} />;
const Pad = ({ a, b, w = 7 }: { a: P; b: P; w?: number }) => <line class="eq" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke-width={w} />;
const Pata = ({ x, y }: { x: number; y: number }) => <line class="eq-fino" x1={x} y1={y} x2={x} y2={SUELO} />;
const Cable = ({ de, a }: { de: P; a: P }) => (
  <g>
    <line class="cable" x1={de[0]} y1={de[1]} x2={a[0]} y2={a[1]} />
    <circle class="eq" cx={de[0]} cy={de[1]} r="4" />
  </g>
);
const Torre = ({ x, y = 12 }: { x: number; y?: number }) => <rect class="eq-suave" x={x - 7} y={y} width="14" height={SUELO - y} rx="3" />;
const Disco = ({ m, r = 6.5 }: { m: P; r?: number }) => (
  <g>
    <circle class="eq" cx={m[0]} cy={m[1]} r={r} />
    <circle class="eq-hueco" cx={m[0]} cy={m[1]} r={r * 0.35} />
  </g>
);
const Mancuerna = ({ m, ang }: { m: P; ang: number }) => {
  // Mancuerna de perfil (agarre neutro): barra perpendicular al antebrazo.
  const a = desde(m, ang + 90, 8);
  const b = desde(m, ang - 90, 8);
  return (
    <g>
      <line class="eq" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke-width="3" />
      <line class="eq" x1={desde(a, ang + 90, 2)[0]} y1={desde(a, ang + 90, 2)[1]} x2={desde(a, ang - 90, 3)[0]} y2={desde(a, ang - 90, 3)[1]} stroke-width="9" />
      <line class="eq" x1={desde(b, ang - 90, 2)[0]} y1={desde(b, ang - 90, 2)[1]} x2={desde(b, ang + 90, 3)[0]} y2={desde(b, ang + 90, 3)[1]} stroke-width="9" />
    </g>
  );
};
const Asa = ({ m }: { m: P }) => <circle class="eq" cx={m[0]} cy={m[1]} r="3.5" />;
const Palanca = ({ de, a, w = 5 }: { de: P; a: P; w?: number }) => (
  <g>
    <line class="eq" x1={de[0]} y1={de[1]} x2={a[0]} y2={a[1]} stroke-width={w} />
    <circle class="eq" cx={de[0]} cy={de[1]} r="4.5" />
  </g>
);
const Rodillo = ({ m }: { m: P }) => <circle class="eq" cx={m[0]} cy={m[1]} r="6" />;
const Asiento = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => (
  <g>
    <Pad a={[x1, y]} b={[x2, y]} />
    <Pata x={(x1 + x2) / 2} y={y} />
  </g>
);

const Prensa = () => (
  <g>
    <Pad a={[78, 150]} b={[28, 122]} w={8} />
    <line class="eq-suave-l" x1="112" y1="124" x2="210" y2="42" />
    <Pata x={60} y={146} />
  </g>
);

// Piernas de pie (normal y adelantada)
const DE_PIE = { m: 90, t: 90, p: 0 } as const;

// ── Definiciones ──
const curlDePie = (extra: Partial<DefLado> = {}): DefLado => ({
  vista: 'lado',
  A: { cadera: [116, 96], tronco: -90, brazo: { h: 92, c: 86 }, pierna: DE_PIE },
  B: { cadera: [116, 96], tronco: -90, brazo: { h: 96, c: -62 }, pierna: DE_PIE },
  musculo: ['brazo-del'],
  ...extra
});

export const ANIMACIONES: Record<string, DefAnim> = {
  'press-inclinado': {
    vista: 'lado',
    A: { cadera: [146, 128], tronco: -150, cabeza: -6, brazo: { codo: [100, 124], mano: [108, 98] }, pierna: { m: 15, t: 90, p: 0 } },
    B: { cadera: [146, 128], tronco: -150, cabeza: -6, brazo: { codo: [108, 77], mano: [112, 50] }, pierna: { m: 15, t: 90, p: 0 } },
    musculo: ['pecho', 'hombro'],
    fondo: () => (
      <g>
        <Pad a={[154, 139]} b={[80, 96]} />
        <Pad a={[150, 139]} b={[186, 139]} />
        <Pata x={170} y={139} />
        <Pata x={98} y={106} />
      </g>
    ),
    frente: (j) => <Disco m={j.mano} r={6.5} />
  },
  'press-maquina': {
    vista: 'lado',
    A: { cadera: [104, 128], tronco: -95, brazo: { codo: [76, 88], mano: [101, 84] }, pierna: { m: 5, t: 92, p: 0 } },
    B: { cadera: [104, 128], tronco: -95, brazo: { codo: [128, 82], mano: [155, 82] }, pierna: { m: 5, t: 92, p: 0 } },
    musculo: ['pecho', 'hombro'],
    fondo: (j) => (
      <g>
        <Pad a={[88, 136]} b={[82, 62]} w={8} />
        <Asiento x1={84} x2={124} y={137} />
        <Palanca de={[164, 12]} a={j.mano} w={4} />
      </g>
    ),
    frente: (j) => <Asa m={j.mano} />
  },
  aperturas: {
    vista: 'frente',
    A: { cx: 120, cadera: 126, bi: { codo: [72, 70], mano: [48, 72] }, sentado: { abre: 8 } },
    B: { cx: 120, cadera: 126, bi: { codo: [94, 76], mano: [113, 80] }, sentado: { abre: 8 } },
    musculo: ['pecho'],
    fondo: () => (
      <g>
        <rect class="eq-suave" x="96" y="44" width="48" height="96" rx="6" />
        <line class="eq-fino" x1="40" y1="30" x2="200" y2="30" />
      </g>
    ),
    frente: (j) => (
      <g>
        <Pad a={[j.manoI[0], j.manoI[1] - 9]} b={[j.manoI[0], j.manoI[1] + 9]} w={5} />
        <Pad a={[j.manoD[0], j.manoD[1] - 9]} b={[j.manoD[0], j.manoD[1] + 9]} w={5} />
      </g>
    )
  },
  laterales: {
    vista: 'frente',
    A: { cx: 120, cadera: 100, bi: { a: 10, c: 16 } },
    B: { cx: 120, cadera: 100, bi: { a: 84, c: 92 } },
    musculo: ['hombro'],
    frente: (j) => (
      <g>
        <Disco m={j.manoI} r={5.5} />
        <Disco m={j.manoD} r={5.5} />
      </g>
    )
  },
  'laterales-polea': {
    vista: 'frente',
    A: { cx: 120, cadera: 100, bi: { a: 70, c: 84 }, bd: { a: -12, c: -24 } },
    B: { cx: 120, cadera: 100, bi: { a: 70, c: 84 }, bd: { a: 84, c: 90 } },
    musculo: ['hombro'],
    fondo: () => <Torre x={40} />,
    frente: (j) => (
      <g>
        <Cable de={[44, 170]} a={j.manoD} />
        <Asa m={j.manoD} />
        <Asa m={j.manoI} />
      </g>
    )
  },
  trasnuca: {
    vista: 'lado',
    A: { cadera: [122, 98], tronco: -68, cabeza: 8, brazo: { h: -52, c: -238 }, pierna: { m: 72, t: 96, p: 0 }, pierna2: { m: 112, t: 100, p: 0 } },
    B: { cadera: [122, 98], tronco: -68, cabeza: 8, brazo: { h: -46, c: -40 }, pierna: { m: 72, t: 96, p: 0 }, pierna2: { m: 112, t: 100, p: 0 } },
    musculo: ['brazo-tras'],
    fondo: () => <Torre x={30} />,
    frente: (j) => (
      <g>
        <Cable de={[34, 54]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  pushdown: {
    vista: 'lado',
    A: { cadera: [112, 96], tronco: -82, brazo: { h: 96, c: -22 }, pierna: { m: 86, t: 94, p: 0 }, pierna2: { m: 98, t: 92, p: 0 } },
    B: { cadera: [112, 96], tronco: -82, brazo: { h: 94, c: 88 }, pierna: { m: 86, t: 94, p: 0 }, pierna2: { m: 98, t: 92, p: 0 } },
    musculo: ['brazo-tras'],
    fondo: () => <Torre x={192} />,
    frente: (j) => (
      <g>
        <Cable de={[188, 22]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  jalon: {
    vista: 'frente',
    A: { cx: 120, cadera: 124, bi: { mano: [78, 22], flex: 1 }, sentado: { abre: 6 } },
    B: { cx: 120, cadera: 124, bi: { mano: [84, 72], flex: 1 }, sentado: { abre: 6 } },
    musculo: ['dorsal'],
    fondo: (j) => (
      <g>
        <line class="eq-fino" x1="120" y1="4" x2="120" y2={j.manoI[1]} />
        <circle class="eq" cx="120" cy="6" r="4" />
        <Pad a={[92, 140]} b={[148, 140]} />
        <Pata x={120} y={140} />
      </g>
    ),
    frente: (j) => (
      <g>
        <Pad a={[j.manoI[0] - 12, j.manoI[1] + 2]} b={[j.manoD[0] + 12, j.manoD[1] + 2]} w={4} />
        <Pad a={[96, 128]} b={[144, 128]} w={6} />
      </g>
    )
  },
  'remo-polea': {
    vista: 'lado',
    A: { cadera: [78, 142], tronco: -84, brazo: { mano: [134, 108], flex: 1 }, pierna: { pie: [146, 152], flex: -1, p: -78 } },
    B: { cadera: [78, 142], tronco: -92, brazo: { mano: [96, 116], flex: 1 }, pierna: { pie: [146, 152], flex: -1, p: -78 } },
    musculo: ['espalda', 'brazo-del'],
    fondo: () => (
      <g>
        <Pad a={[52, 150]} b={[112, 150]} />
        <Pata x={60} y={150} />
        <Pata x={104} y={150} />
        <rect class="eq-suave" x="150" y="128" width="14" height="49" rx="3" />
      </g>
    ),
    frente: (j) => (
      <g>
        <Cable de={[164, 120]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  'remo-maquina': {
    vista: 'lado',
    A: { cadera: [90, 128], tronco: -62, brazo: { mano: [158, 104], flex: 1 }, pierna: { m: 15, t: 92, p: 0 } },
    B: { cadera: [90, 128], tronco: -62, brazo: { mano: [128, 100], flex: 1 }, pierna: { m: 15, t: 92, p: 0 } },
    musculo: ['espalda', 'hombro'],
    fondo: () => (
      <g>
        <Asiento x1={66} x2={104} y={138} />
        <line class="eq-fino" x1="122" y1="112" x2="122" y2={SUELO} />
      </g>
    ),
    medio: () => <Pad a={[112, 118]} b={[124, 97]} w={9} />,
    frente: (j) => (
      <g>
        <Palanca de={[172, 36]} a={j.mano} w={4} />
        <Asa m={j.mano} />
      </g>
    )
  },
  pullover: {
    vista: 'lado',
    A: { cadera: [108, 96], tronco: -74, brazo: { h: -58, c: -48 }, pierna: DE_PIE },
    B: { cadera: [108, 96], tronco: -74, brazo: { h: 96, c: 104 }, pierna: DE_PIE },
    musculo: ['espalda'],
    fondo: () => <Torre x={200} />,
    frente: (j) => (
      <g>
        <Cable de={[196, 16]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  'curl-inclinado': {
    vista: 'lado',
    A: { cadera: [112, 134], tronco: -122, cabeza: 6, brazo: { h: 92, c: 88 }, pierna: { m: 6, t: 86, p: 0 } },
    B: { cadera: [112, 134], tronco: -122, cabeza: 6, brazo: { h: 96, c: -50 }, pierna: { m: 6, t: 86, p: 0 } },
    musculo: ['brazo-del'],
    fondo: () => (
      <g>
        <Pad a={[102, 141]} b={[70, 88]} w={8} />
        <Pad a={[100, 144]} b={[146, 144]} />
        <Pata x={128} y={144} />
        <Pata x={90} y={120} />
      </g>
    ),
    frente: (j) => <Disco m={j.mano} r={6} />
  },
  'curl-martillo': curlDePie({ frente: (j) => <Mancuerna m={j.mano} ang={j.angAntebrazo} /> }),
  'curl-de-pie': curlDePie({
    A: { cadera: [116, 96], tronco: -90, brazo: { h: 92, c: 86 }, brazo2: { h: 92, c: 88 }, pierna: DE_PIE },
    B: { cadera: [116, 96], tronco: -90, brazo: { h: 96, c: -62 }, brazo2: { h: 92, c: 88 }, pierna: DE_PIE },
    frente: (j) => <Disco m={j.mano} r={6} />
  }),
  'curl-polea': curlDePie({
    fondo: () => <Torre x={196} />,
    frente: (j) => (
      <g>
        <Cable de={[192, 168]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  }),
  'face-pull': {
    vista: 'lado',
    A: { cadera: [104, 96], tronco: -94, brazo: { mano: [158, 40], flex: 1 }, pierna: { m: 84, t: 92, p: 0 }, pierna2: { m: 100, t: 92, p: 0 } },
    B: { cadera: [104, 96], tronco: -94, brazo: { mano: [124, 34], flex: -1 }, pierna: { m: 84, t: 92, p: 0 }, pierna2: { m: 100, t: 92, p: 0 } },
    musculo: ['hombro', 'espalda'],
    fondo: () => <Torre x={200} />,
    frente: (j) => (
      <g>
        <Cable de={[196, 38]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  predicador: {
    vista: 'lado',
    A: { cadera: [92, 132], tronco: -80, brazo: { h: 52, c: 62 }, pierna: { m: 8, t: 88, p: 0 } },
    B: { cadera: [92, 132], tronco: -80, brazo: { h: 52, c: -78 }, pierna: { m: 8, t: 88, p: 0 } },
    musculo: ['brazo-del'],
    fondo: () => <Asiento x1={74} x2={110} y={142} />,
    medio: (j) => {
      const a = desde(j.hombro, 52 + 90, 0);
      const pa = desde(desde(a, 142, 9), 52, 6);
      const pb = desde(desde(j.codo, 142, 9), 52, 8);
      return (
        <g>
          <Pad a={pa} b={pb} w={11} />
          <line class="eq-fino" x1={pb[0] - 4} y1={pb[1]} x2={pb[0] - 4} y2={SUELO} />
        </g>
      );
    },
    frente: (j) => <Disco m={j.mano} r={6} />
  },
  fondos: {
    vista: 'lado',
    A: { cadera: [108, 128], tronco: -90, brazo: { mano: [116, 100], flex: 1 }, pierna: { m: 4, t: 92, p: 0 } },
    B: { cadera: [108, 128], tronco: -90, brazo: { mano: [112, 128], flex: 1 }, pierna: { m: 4, t: 92, p: 0 } },
    musculo: ['brazo-tras'],
    fondo: () => (
      <g>
        <Pad a={[92, 136]} b={[88, 64]} w={8} />
        <Asiento x1={88} x2={126} y={137} />
      </g>
    ),
    frente: (j) => (
      <g>
        <Pad a={[j.mano[0] - 2, j.mano[1] - 7]} b={[j.mano[0] + 3, j.mano[1] + 7]} w={5} />
        <line class="eq-fino" x1={j.mano[0] + 3} y1={j.mano[1] + 7} x2={j.mano[0] + 30} y2={j.mano[1] + 18} />
      </g>
    )
  },
  bayesiano: {
    vista: 'lado',
    A: { cadera: [126, 96], tronco: -86, brazo: { h: 104, c: 108 }, pierna: { m: 76, t: 96, p: 0 }, pierna2: { m: 108, t: 98, p: 0 } },
    B: { cadera: [126, 96], tronco: -86, brazo: { h: 104, c: -46 }, pierna: { m: 76, t: 96, p: 0 }, pierna2: { m: 108, t: 98, p: 0 } },
    musculo: ['brazo-del'],
    unBrazo: true,
    fondo: () => <Torre x={30} />,
    frente: (j) => (
      <g>
        <Cable de={[34, 166]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  'extension-cabeza': {
    vista: 'lado',
    A: { cadera: [126, 96], tronco: -86, brazo: { h: -96, c: -256 }, pierna: { m: 78, t: 94, p: 0 }, pierna2: { m: 106, t: 96, p: 0 } },
    B: { cadera: [126, 96], tronco: -86, brazo: { h: -96, c: -92 }, pierna: { m: 78, t: 94, p: 0 }, pierna2: { m: 106, t: 96, p: 0 } },
    musculo: ['brazo-tras'],
    unBrazo: true,
    fondo: () => <Torre x={30} />,
    frente: (j) => (
      <g>
        <Cable de={[34, 166]} a={j.mano} />
        <Asa m={j.mano} />
      </g>
    )
  },
  pajaros: {
    vista: 'frente',
    espalda: true,
    A: { cx: 120, cadera: 126, bi: { codo: [96, 78], mano: [114, 82] }, sentado: { abre: 8 } },
    B: { cx: 120, cadera: 126, bi: { codo: [72, 72], mano: [46, 74] }, sentado: { abre: 8 } },
    musculo: ['hombro'],
    fondo: () => <line class="eq-fino" x1="40" y1="30" x2="200" y2="30" />,
    frente: (j) => (
      <g>
        <Pad a={[j.manoI[0], j.manoI[1] - 9]} b={[j.manoI[0], j.manoI[1] + 9]} w={5} />
        <Pad a={[j.manoD[0], j.manoD[1] - 9]} b={[j.manoD[0], j.manoD[1] + 9]} w={5} />
      </g>
    )
  },
  femoral: {
    vista: 'lado',
    A: { cadera: [96, 120], tronco: -74, brazo: { h: 84, c: 40 }, pierna: { m: 0, t: -4, p: -70 } },
    B: { cadera: [96, 120], tronco: -74, brazo: { h: 84, c: 40 }, pierna: { m: 0, t: 104, p: -10 } },
    musculo: ['muslo-tras'],
    fondo: () => (
      <g>
        <Asiento x1={72} x2={130} y={130} />
        <Pad a={[78, 128]} b={[66, 70]} w={8} />
      </g>
    ),
    frente: (j) => (
      <g>
        <Pad a={[116, 110]} b={[142, 110]} w={6} />
        <Palanca de={[136, 120]} a={desde(j.tobillo, j.angPierna + 90, 7)} w={4} />
        <Rodillo m={desde(j.tobillo, j.angPierna + 90, 7)} />
      </g>
    )
  },
  'extension-cuadriceps': {
    vista: 'lado',
    A: { cadera: [96, 120], tronco: -98, brazo: { h: 84, c: 40 }, pierna: { m: 0, t: 92, p: 0 } },
    B: { cadera: [96, 120], tronco: -98, brazo: { h: 84, c: 40 }, pierna: { m: 0, t: -6, p: -86 } },
    musculo: ['muslo-del'],
    fondo: () => (
      <g>
        <Asiento x1={70} x2={136} y={130} />
        <Pad a={[74, 128]} b={[68, 66]} w={8} />
      </g>
    ),
    frente: (j) => (
      <g>
        <Palanca de={[136, 124]} a={desde(j.tobillo, j.angPierna - 90, 7)} w={4} />
        <Rodillo m={desde(j.tobillo, j.angPierna - 90, 7)} />
      </g>
    )
  },
  prensa: {
    vista: 'lado',
    A: { cadera: [70, 140], tronco: -150, cabeza: 10, brazo: { h: 70, c: 20 }, pierna: { pie: [106, 104], flex: -1, p: -130 } },
    B: { cadera: [70, 140], tronco: -150, cabeza: 10, brazo: { h: 70, c: 20 }, pierna: { pie: [126, 87], flex: -1, p: -130 } },
    musculo: ['muslo-del', 'gluteo'],
    fondo: () => <Prensa />,
    frente: (j) => {
      const c = desde([(j.tobillo[0] + j.punta[0]) / 2, (j.tobillo[1] + j.punta[1]) / 2], -40, 5);
      return <Pad a={desde(c, -130, 18)} b={desde(c, 50, 16)} w={6} />;
    }
  },
  gemelos: {
    vista: 'lado',
    A: { cadera: [70, 140], tronco: -150, cabeza: 10, brazo: { h: 70, c: 20 }, pierna: { m: -38, t: -40, p: -158 } },
    B: { cadera: [70, 140], tronco: -150, cabeza: 10, brazo: { h: 70, c: 20 }, pierna: { m: -38, t: -40, p: -78 } },
    musculo: ['gemelo'],
    fondo: () => <Prensa />,
    frente: (j) => {
      const c = desde(j.punta, -40, 3);
      return <Pad a={desde(c, 50, 3)} b={desde(c, -130, 28)} w={6} />;
    }
  },
  aductores: {
    vista: 'frente',
    A: { cx: 120, cadera: 120, bi: { a: 26, c: 12 }, sentado: { abre: 34 } },
    B: { cx: 120, cadera: 120, bi: { a: 26, c: 12 }, sentado: { abre: 2 } },
    musculo: ['aductor'],
    fondo: () => <rect class="eq-suave" x="96" y="40" width="48" height="92" rx="6" />,
    frente: (j) => (
      <g>
        <Pad a={[j.rodillaI[0] + 6, j.rodillaI[1] - 4]} b={[j.rodillaI[0] + 6, j.rodillaI[1] + 18]} w={6} />
        <Pad a={[j.rodillaD[0] - 6, j.rodillaD[1] - 4]} b={[j.rodillaD[0] - 6, j.rodillaD[1] + 18]} w={6} />
      </g>
    )
  },
  abductores: {
    vista: 'frente',
    A: { cx: 120, cadera: 120, bi: { a: 26, c: 12 }, sentado: { abre: 2 } },
    B: { cx: 120, cadera: 120, bi: { a: 26, c: 12 }, sentado: { abre: 34 } },
    musculo: ['gluteo-lado'],
    fondo: () => <rect class="eq-suave" x="96" y="40" width="48" height="92" rx="6" />,
    frente: (j) => (
      <g>
        <Pad a={[j.rodillaI[0] - 7, j.rodillaI[1] - 4]} b={[j.rodillaI[0] - 7, j.rodillaI[1] + 18]} w={6} />
        <Pad a={[j.rodillaD[0] + 7, j.rodillaD[1] - 4]} b={[j.rodillaD[0] + 7, j.rodillaD[1] + 18]} w={6} />
      </g>
    )
  },
  dominadas: {
    vista: 'frente',
    sinSuelo: true,
    A: { cx: 120, cadera: 106, bi: { mano: [80, 0], flex: 1 }, colgado: true },
    B: { cx: 120, cadera: 70, bi: { mano: [80, 0], flex: 1 }, colgado: true },
    musculo: ['dorsal'],
    fondo: () => <line class="eq" x1="40" y1="-2" x2="200" y2="-2" stroke-width="5" />
  },
  'press-militar': {
    vista: 'lado',
    A: { cadera: [104, 130], tronco: -90, brazo: { codo: [96, 96], mano: [100, 70] }, pierna: { m: 4, t: 92, p: 0 } },
    B: { cadera: [104, 130], tronco: -90, brazo: { codo: [106, 50], mano: [108, 22] }, pierna: { m: 4, t: 92, p: 0 } },
    musculo: ['hombro'],
    fondo: () => (
      <g>
        <Pad a={[90, 138]} b={[86, 60]} w={8} />
        <Asiento x1={86} x2={126} y={139} />
      </g>
    ),
    frente: (j) => <Disco m={j.mano} r={6} />
  },
  'press-frances': {
    vista: 'lado',
    A: { cadera: [150, 128], tronco: 180, cabeza: 0, brazo: { h: -102, c: -232 }, pierna: { m: 10, t: 96, p: 0 } },
    B: { cadera: [150, 128], tronco: 180, cabeza: 0, brazo: { h: -100, c: -96 }, pierna: { m: 10, t: 96, p: 0 } },
    musculo: ['brazo-tras'],
    fondo: () => (
      <g>
        <Pad a={[52, 138]} b={[160, 138]} />
        <Pata x={64} y={138} />
        <Pata x={150} y={138} />
      </g>
    ),
    frente: (j) => <Disco m={j.mano} r={7} />
  }
};

export { SUELO, Suelo };

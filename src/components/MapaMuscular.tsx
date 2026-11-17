import type { MusculoId } from '../data/musculos';

/*
  Mapa muscular frontal y dorsal. Cada zona es un path de la mitad izquierda de la figura
  (x < 60) que se refleja para la derecha. Viewbox por figura: 120 × 262.
*/

type Zona = { id: MusculoId; d: string };

const SILUETA =
  'M53,30 C53,34 53,37 52,39 C45,41 37,42 31,45 C25,48 22,55 22,64 C21,76 22,90 21,102 C19,114 18,128 18,142 C17,150 18,158 20,163 C22,166 25,165 26,160 C27,152 27,146 28,139 C30,127 32,116 33,106 C34,98 35,92 36,87 C37,96 38,108 38,120 C37,128 36,136 36,145 C35,162 36,180 39,197 C38,207 38,218 40,228 C41,236 42,243 42,247 C39,251 39,254 43,255 L53,255 C54,251 53,246 53,242 C55,232 56,220 55,207 C56,200 57,194 58,187 C59,174 59,162 60,152 L60,30 Z';

const FRENTE: Zona[] = [
  { id: 'trap-sup', d: 'M53,33 C51,37 46,40 39,43 L45,45 C49,43 52,41 56,40 Z' },
  { id: 'delt-lat', d: 'M37,44 C29,45 24,51 23,60 C23,66 25,71 27,75 C28,66 29,58 32,51 Z' },
  { id: 'delt-ant', d: 'M38,44 C35,48 33,51 32,52 C29,59 28,67 27,75 C31,73 35,68 37,62 C39,56 40,51 41,47 Z' },
  { id: 'pec-clav', d: 'M42,47 C48,46 54,46 59,47 L59,57 C52,57 45,58 38,62 C39,56 40,51 42,47 Z' },
  { id: 'pec-est', d: 'M38,63 C45,59 52,58 59,58 L59,76 C53,80 45,79 40,76 C37,72 37,67 38,63 Z' },
  { id: 'bic-larga', d: 'M27,77 C24,85 23,94 25,103 L29,103 C28,95 28,86 30,78 Z' },
  { id: 'bic-corta', d: 'M30,78 C28,86 28,95 29,103 L32,103 C34,96 34,86 32,78 Z' },
  { id: 'braquial', d: 'M24,95 C23,99 23,102 24,106 L26,106 C25,102 25,98 25,95 Z' },
  { id: 'braquiorradial', d: 'M24,107 C21,115 20,124 20,133 L23,133 C23,124 25,115 27,108 Z' },
  { id: 'antebrazo', d: 'M27,108 C30,116 30,126 27,140 L23,140 C23,129 24,118 27,108 Z' },
  { id: 'abdomen', d: 'M51,81 L59,81 L59,92 L51,92 Z M51,94 L59,94 L59,105 L51,105 Z M51,107 L59,107 L59,118 L51,118 Z M51,120 L59,120 L59,136 C56,136 53,134 51,131 Z' },
  { id: 'oblicuos', d: 'M41,80 C45,82 48,83 49,84 L49,128 C46,124 44,118 42,110 C41,100 40,90 41,80 Z' },
  { id: 'cuad-vl', d: 'M38,146 C35,160 36,178 40,194 L44,190 C43,176 43,160 43,147 Z' },
  { id: 'cuad-rf', d: 'M44,146 C44,160 45,176 46,188 L51,188 C51,174 51,160 50,150 C48,147 46,146 44,146 Z' },
  { id: 'cuad-vm', d: 'M51,174 C51,181 50,187 50,193 C53,194 56,190 56,185 C55,180 53,176 51,174 Z' },
  { id: 'aductores', d: 'M51,150 C52,160 52,168 51,173 C54,168 57,160 58,153 C56,151 54,150 51,150 Z' },
  { id: 'tibial', d: 'M42,203 C40,214 40,227 42,240 L45,240 C45,227 45,214 46,204 Z' },
  { id: 'gemelo', d: 'M49,204 C53,212 54,222 52,233 L49,233 C49,222 49,212 47,204 Z' }
];

const ESPALDA: Zona[] = [
  { id: 'trap-sup', d: 'M55,31 C53,37 46,41 38,44 L47,48 C51,46 55,45 60,45 L60,31 Z' },
  { id: 'trap-medio', d: 'M47,48 C51,46 55,45 60,45 L60,68 C56,66 50,62 45,57 C45,54 46,51 47,48 Z' },
  { id: 'trap-inf', d: 'M45,58 C50,63 56,67 60,69 L60,97 C57,88 53,77 48,67 Z' },
  { id: 'delt-lat', d: 'M36,44 C29,45 24,51 23,60 C23,66 25,71 27,75 C27,66 28,57 31,50 Z' },
  { id: 'delt-post', d: 'M37,44 C34,47 32,49 31,51 C28,58 27,66 27,75 C31,71 34,64 37,58 C40,54 43,51 46,49 Z' },
  { id: 'infraespinoso', d: 'M38,58 C40,55 43,52 46,50 C46,54 45,58 46,62 C44,65 41,67 38,68 C37,65 37,61 38,58 Z' },
  { id: 'redondo', d: 'M38,69 C41,68 44,66 46,63 L48,67 C45,71 41,74 37,75 Z' },
  { id: 'dorsal', d: 'M37,76 C42,74 46,71 48,68 C52,77 56,88 59,98 C57,106 54,113 52,120 C46,114 42,104 39,92 C38,86 37,81 37,76 Z' },
  { id: 'lumbar', d: 'M54,104 C55,98 57,96 59,99 L59,134 L54,134 C53,124 53,114 54,104 Z' },
  { id: 'tri-lateral', d: 'M27,77 C24,84 23,93 24,100 L28,98 C28,90 28,83 30,77 Z' },
  { id: 'tri-largo', d: 'M30,77 C29,84 28,91 28,98 L33,98 C34,91 34,83 33,77 Z' },
  { id: 'tri-medial', d: 'M24,101 C25,104 26,106 26,108 L32,108 C33,105 33,102 33,99 L28,99 Z' },
  { id: 'antebrazo', d: 'M25,109 C21,118 20,128 21,140 L26,140 C27,128 29,118 31,109 Z' },
  { id: 'gluteo-medio', d: 'M39,128 C43,124 51,124 57,127 L55,134 C50,133 44,134 39,137 Z' },
  { id: 'gluteo-mayor', d: 'M39,138 C44,135 50,134 55,135 L59,139 L59,160 C52,163 44,162 38,156 C37,150 37,143 39,138 Z' },
  { id: 'isq-bf', d: 'M38,160 C37,174 39,187 42,196 L47,194 C46,182 46,170 47,163 C44,163 41,162 38,160 Z' },
  { id: 'isq-semi', d: 'M47,163 C46,170 46,182 47,194 L52,194 C55,183 56,172 57,163 C54,164 50,164 47,163 Z' },
  { id: 'gemelo', d: 'M41,203 C38,211 39,222 43,229 L47.5,227 L47.5,203 Z M48.5,203 L48.5,227 L52,229 C55,221 55,211 52,203 Z' },
  { id: 'soleo', d: 'M43,230 C43,235 44,239 45,243 L51,243 C52,239 52,234 52,230 L48,228 Z' }
];

const IDS_FRENTE = new Set(FRENTE.map((z) => z.id));
const IDS_ESPALDA = new Set(ESPALDA.map((z) => z.id));

export function vistaPreferida(p: MusculoId[]): 'frente' | 'espalda' {
  const f = p.filter((m) => IDS_FRENTE.has(m) && !IDS_ESPALDA.has(m)).length;
  const e = p.filter((m) => IDS_ESPALDA.has(m) && !IDS_FRENTE.has(m)).length;
  return e > f ? 'espalda' : 'frente';
}

function Figura({ zonas, p, s, x, titulo, cara }: { zonas: Zona[]; p: Set<MusculoId>; s: Set<MusculoId>; x: number; titulo: string; cara: boolean }) {
  const clase = (id: MusculoId) => (p.has(id) ? 'mm-p' : s.has(id) ? 'mm-s' : 'mm-n');
  const mitad = (
    <g>
      <path class="mm-base" d={SILUETA} />
      {zonas.map((z) => (
        <path key={z.id} class={clase(z.id)} d={z.d} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse class="mm-base" cx="60" cy="16" rx="10.5" ry="13" />
      {cara ? null : <path class="mm-pelo" d="M50,13 C51,5 69,5 70,13 C66,9 54,9 50,13 Z" />}
      {mitad}
      <g transform="matrix(-1 0 0 1 120 0)">{mitad}</g>
      <text class="mm-tit" x="60" y="272" text-anchor="middle">{titulo}</text>
    </g>
  );
}

export function MapaMuscular({ p, s, compacto }: { p: MusculoId[]; s: MusculoId[]; compacto?: boolean }) {
  const P = new Set(p);
  const S = new Set(s.filter((m) => !P.has(m)));
  return (
    <svg class={`mapa ${compacto ? 'mapa-compacto' : ''}`} viewBox="0 0 260 278" role="img" aria-label="Músculos trabajados">
      <Figura zonas={FRENTE} p={P} s={S} x={4} titulo="Delante" cara />
      <Figura zonas={ESPALDA} p={P} s={S} x={136} titulo="Detrás" cara={false} />
    </svg>
  );
}

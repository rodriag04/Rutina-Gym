import { useState } from 'preact/hooks';
import { IBascula, IInfo } from '../components/Iconos';
import { DIAS, diaSemana, fechaCorta, sumarDias } from '../lib/fechas';
import { aplicarObjetivos, ajustesLog, diaCalculado, guardarMedida, hoy, medidas, objetivos, prefs, registros } from '../lib/estado';
import { mediasSemanales, proximoPeso, recomendar } from '../lib/progreso';
import { sumar, CERO } from '../lib/nutricion';
import type { Medida } from '../lib/tipos';
import { avisar, fmt } from '../lib/ui';

export function Progreso() {
  const f = hoy.value;
  const tocaPeso = [1, 3, 5].includes(diaSemana(f));
  const deHoy = medidas.value.find((m) => m.fecha === f);
  const [peso, setPeso] = useState(deHoy?.peso?.toString().replace('.', ',') ?? '');
  const [cint, setCint] = useState(deHoy?.cintura?.toString().replace('.', ',') ?? '');
  const ultimoAjuste = ajustesLog.value.at(-1)?.fecha;
  const rec = recomendar(medidas.value, objetivos.value, prefs.value.pierdeFuerza, f, ultimoAjuste);
  const medias = mediasSemanales(medidas.value);
  const ultCintura = [...medidas.value].reverse().find((m) => m.cintura !== undefined);

  const guardar = () => {
    const p = Number(peso.replace(',', '.'));
    const c = Number(cint.replace(',', '.'));
    const m: Partial<Medida> = {};
    if (p >= 45 && p <= 140) m.peso = p;
    if (c >= 50 && c <= 130) m.cintura = c;
    if (!Object.keys(m).length) return avisar(['Escribe el peso (kg) o la cintura (cm).']);
    guardarMedida(f, m);
    avisar(['Guardado.']);
  };

  return (
    <>
      <header class="cabecera">
        <div>
          <div class="sub">Medir y ajustar</div>
          <h1>Progreso</h1>
        </div>
      </header>

      <div class="tarjeta">
        <div class="fila entre">
          <div>
            <div class="etiqueta">{tocaPeso ? 'Hoy toca pesarse' : `Próximo peso: ${DIAS[diaSemana(proximoPeso(f))].toLowerCase()}`}</div>
            <div class="muted" style="font-size:13px">En ayunas, después del baño. Martes, jueves y sábado.</div>
          </div>
          <IBascula class="muted" style="width:26px;height:26px" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:12px;align-items:end">
          <label>
            <div class="etiqueta" style="margin-bottom:4px">Peso (kg)</div>
            <input class="campo num" inputMode="decimal" placeholder="72,0" value={peso} onInput={(e) => setPeso((e.target as HTMLInputElement).value)} />
          </label>
          <label>
            <div class="etiqueta" style="margin-bottom:4px">Cintura (cm)</div>
            <input class="campo num" inputMode="decimal" placeholder={ultCintura ? String(ultCintura.cintura).replace('.', ',') : '82'} value={cint} onInput={(e) => setCint((e.target as HTMLInputElement).value)} />
          </label>
          <button class="btn primario" onClick={guardar}>
            Guardar
          </button>
        </div>
        <div class="muted" style="font-size:12.5px;margin-top:8px">Cintura a la altura del ombligo, cada 2 semanas, el mismo día.</div>
      </div>

      <Recomendacion rec={rec} />

      <div class="seccion">
        <h2>Peso</h2>
        <span class="mas">media semanal (sin lunes)</span>
      </div>
      <div class="tarjeta">
        {medidas.value.filter((m) => m.peso).length === 0 ? (
          <div class="vacio" style="padding:10px">Aún no hay pesos. El primero, el próximo {DIAS[diaSemana(proximoPeso(f))].toLowerCase()}.</div>
        ) : (
          <GraficaPeso ms={medidas.value} />
        )}
        {medias.length >= 2 && (
          <div class="fila" style="gap:16px;margin-top:10px;font-size:13px">
            <span>
              Esta semana <b class="num">{medias.at(-1)!.peso.toFixed(1).replace('.', ',')} kg</b>
            </span>
            <span class="muted">
              {(medias.at(-1)!.peso - medias.at(-2)!.peso >= 0 ? '+' : '') + (medias.at(-1)!.peso - medias.at(-2)!.peso).toFixed(1).replace('.', ',')} kg vs la anterior
            </span>
          </div>
        )}
      </div>

      <div class="seccion">
        <h2>Cintura</h2>
      </div>
      <div class="tarjeta">
        {medidas.value.filter((m) => m.cintura).length === 0 ? (
          <div class="vacio" style="padding:10px">Sin medidas de cintura todavía.</div>
        ) : (
          <table class="tabla">
            <tbody>
              {medidas.value
                .filter((m) => m.cintura)
                .slice(-6)
                .reverse()
                .map((m) => (
                  <tr>
                    <td>{fechaCorta(m.fecha)}</td>
                    <td class="n" style="text-align:right">
                      {String(m.cintura).replace('.', ',')} cm
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <Cumplimiento />

      <div class="seccion">
        <h2>Objetivos</h2>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        <div class="opcion">
          <div class="t">Días de gym</div>
          <div class="num" style="font-weight:700">{fmt(objetivos.value.kcalGym)} kcal</div>
        </div>
        <div class="opcion">
          <div class="t">Días de descanso</div>
          <div class="num" style="font-weight:700">{fmt(objetivos.value.kcalDescanso)} kcal</div>
        </div>
        <div class="opcion">
          <div class="t">Proteína</div>
          <div class="num" style="font-weight:700">{objetivos.value.prot} g/día</div>
        </div>
        <div class="opcion">
          <div>
            <div class="t">He perdido fuerza en el gym</div>
            <div class="d">Dos semanas seguidas bajando reps o kilos</div>
          </div>
          <button
            class={`interruptor${prefs.value.pierdeFuerza ? ' on' : ''}`}
            role="switch"
            aria-checked={prefs.value.pierdeFuerza}
            aria-label="He perdido fuerza"
            onClick={() => (prefs.value = { ...prefs.value, pierdeFuerza: !prefs.value.pierdeFuerza })}
          />
        </div>
      </div>
      {ajustesLog.value.length > 0 && (
        <div class="tarjeta" style="margin-top:10px">
          <div class="etiqueta">Ajustes hechos</div>
          {ajustesLog.value
            .slice()
            .reverse()
            .map((a) => (
              <div style="font-size:14px;margin-top:6px">
                <span class="num muted">{fechaCorta(a.fecha)}</span> · {a.texto}
              </div>
            ))}
        </div>
      )}
      <div class="aviso" style="margin-top:12px;background:var(--surface-2);color:var(--ink-2)">
        <IInfo />
        <span>La grasa no se quita por zonas: la barriga baja cuando baja la de todo el cuerpo, y en hombres suele ser lo último. Lo normal: peso igual o −0,1/−0,3 kg por semana y la cintura bajando poco a poco.</span>
      </div>
    </>
  );
}

function Recomendacion({ rec }: { rec: ReturnType<typeof recomendar> }) {
  const color = rec.tipo === 'bien' ? 'verde' : rec.tipo === 'faltan-datos' ? '' : 'aviso';
  return (
    <div class={`tarjeta`} style="margin-top:10px">
      <div class="fila entre">
        <div>
          <div class="etiqueta">Recomendación</div>
          <div style="font-family:var(--f-titulo);font-weight:800;font-size:19px">{rec.titulo}</div>
        </div>
        {color && <span class={`chip ${color}`}>{rec.tipo === 'bien' ? 'OK' : 'Ajuste'}</span>}
      </div>
      <p class="texto-2" style="margin:6px 0 0;font-size:14px">{rec.texto}</p>
      {rec.nuevos && (
        <button
          class="btn primario"
          style="margin-top:12px"
          onClick={() => {
            aplicarObjetivos(rec.nuevos!, rec.titulo);
            if (prefs.value.pierdeFuerza) prefs.value = { ...prefs.value, pierdeFuerza: false };
            avisar([`Aplicado: ${rec.titulo}. El plan ya usa los nuevos números.`]);
          }}
        >
          Aplicar
        </button>
      )}
    </div>
  );
}

/** Media semanal (línea) y pesajes sueltos (puntos). Una sola serie: sin leyenda. */
function GraficaPeso({ ms }: { ms: Medida[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; t: string } | null>(null);
  const puntos = ms.filter((m) => m.peso !== undefined).slice(-36);
  // Cada media se dibuja en la fecha media de sus pesajes (no se sale por la derecha).
  const medias = mediasSemanales(puntos).map((m) => {
    const fs = puntos.filter((x) => x.fecha >= m.lunes && x.fecha <= sumarDias(m.lunes, 6) && diaSemana(x.fecha) !== 0).map((x) => Date.parse(x.fecha));
    return { t: fs.reduce((a, b) => a + b, 0) / fs.length, peso: m.peso };
  });
  const W = 320;
  const H = 150;
  const pad = { l: 34, r: 10, t: 10, b: 22 };
  const xs = puntos.map((p) => p.fecha);
  const t0 = Date.parse(xs[0]);
  const t1 = Math.max(Date.parse(xs.at(-1)!), t0 + 6 * 86400000);
  const vals = puntos.map((p) => p.peso!);
  const lo = Math.floor(Math.min(...vals) - 0.5);
  const hi = Math.ceil(Math.max(...vals) + 0.5);
  const Xt = (t: number) => pad.l + ((t - t0) / (t1 - t0)) * (W - pad.l - pad.r);
  const X = (f: string) => Xt(Date.parse(f));
  const Y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k).filter((_, k, a) => a.length <= 5 || k % 2 === 0);
  return (
    <div class="grafica" style="position:relative" onClick={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolución del peso">
        {ticks.map((v) => (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={Y(v)} y2={Y(v)} stroke="var(--line)" stroke-width="1" />
            <text x={pad.l - 6} y={Y(v) + 4} text-anchor="end" font-size="10" fill="var(--ink-3)" font-family="var(--f-num)">
              {v}
            </text>
          </g>
        ))}
        <text x={pad.l} y={H - 4} font-size="10" fill="var(--ink-3)">
          {fechaCorta(xs[0])}
        </text>
        <text x={W - pad.r} y={H - 4} font-size="10" fill="var(--ink-3)" text-anchor="end">
          {fechaCorta(xs.at(-1)!)}
        </text>
        {medias.length > 1 && <polyline points={medias.map((m) => `${Xt(m.t)},${Y(m.peso)}`).join(' ')} fill="none" stroke="var(--verde)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />}
        {puntos.map((p) => (
          <g>
            <circle cx={X(p.fecha)} cy={Y(p.peso!)} r="4" fill="var(--surface)" stroke="var(--verde)" stroke-width="2" />
            <circle
              cx={X(p.fecha)}
              cy={Y(p.peso!)}
              r="14"
              fill="transparent"
              onClick={(e) => {
                e.stopPropagation();
                setTip({ x: (X(p.fecha) / W) * 100, y: (Y(p.peso!) / H) * 100, t: `${fechaCorta(p.fecha)} · ${String(p.peso).replace('.', ',')} kg` });
              }}
            />
          </g>
        ))}
      </svg>
      {tip && (
        <div class="tip" style={{ left: `${tip.x}%`, top: `${tip.y}%` }}>
          {tip.t}
        </div>
      )}
    </div>
  );
}

function Cumplimiento() {
  const dias = Array.from({ length: 7 }, (_, k) => sumarDias(hoy.value, -6 + k)).filter((f) => diaSemana(f) < 5);
  const filas = dias
    .map((f) => {
      const d = diaCalculado(f);
      const regs = registros.value.filter((r) => r.fecha === f);
      if (!d || !regs.length) return null;
      const comido = sumar(CERO, ...regs.map((r) => r.macro));
      return { f, comido, objetivo: d.objetivo, n: regs.length, total: d.comidas.length };
    })
    .filter(Boolean) as { f: string; comido: { kcal: number; p: number }; objetivo: { kcal: number; p: number }; n: number; total: number }[];
  if (!filas.length) return null;
  return (
    <>
      <div class="seccion">
        <h2>Últimos días</h2>
        <span class="mas">lo apuntado vs objetivo</span>
      </div>
      <div class="tarjeta">
        {filas.map((x) => (
          <div style="margin-bottom:10px">
            <div class="fila entre" style="font-size:13px">
              <b>
                {DIAS[diaSemana(x.f)]} <span class="muted num">{fechaCorta(x.f)}</span>
              </b>
              <span class="num">
                {fmt(x.comido.kcal)}/{fmt(x.objetivo.kcal)} kcal · {fmt(x.comido.p)} g
              </span>
            </div>
            <div class="barra" style="margin-top:4px">
              <i style={{ width: `${Math.min(100, (x.comido.kcal / x.objetivo.kcal) * 100)}%`, background: 'var(--verde)' }} />
            </div>
            {x.n < x.total && <div class="muted" style="font-size:12px;margin-top:2px">{x.total - x.n} comidas sin apuntar</div>}
          </div>
        ))}
      </div>
    </>
  );
}

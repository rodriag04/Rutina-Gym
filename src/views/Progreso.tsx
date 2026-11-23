import { useState } from 'preact/hooks';
import { Chispa, Grafica } from '../components/Grafica';
import { IcoDcha } from '../components/Iconos';
import { DIAS, EJERCICIOS, PERFIL, ejercicio, type Ejercicio } from '../data/rutina';
import { avisos, seriesSemana } from '../lib/analisis';
import { ajustes, medidas, pesoCorporal, sesiones, setMedidas } from '../lib/estado';
import { fechaCorta, hoyISO, kg as fkg, lunesDe, sumarDias } from '../lib/formato';
import { e1rm, gymCompatible, limpias, rendimiento, sesionesDe } from '../lib/progresion';
import { ir } from '../lib/ruta';
import type { Medida } from '../lib/tipos';

/** Puntos de 1RM estimado del ejercicio, solo del gimnasio por defecto (los pesos no se comparan entre gimnasios). */
export function serie(ex: Ejercicio, pc: number) {
  const gym = ajustes.value.gymPorDefecto;
  return [...sesionesDe(ex.id, sesiones.value)].reverse().filter((s) => gymCompatible(s, gym)).map((s) => {
    const c = limpias(s.ex[ex.id], ex);
    const mejor = c.reduce((m, x) => (e1rm(x.kg, x.reps) > e1rm(m.kg, m.reps) ? x : m), c[0]);
    return { fecha: s.fecha, valor: Math.round(rendimiento(s.ex[ex.id], ex, pc) * 10) / 10, etiqueta: mejor ? `${fkg(mejor.kg)}×${mejor.reps}` : '' };
  }).filter((p) => p.valor > 0);
}


export function Progreso() {
  const pc = pesoCorporal.value;
  const hoy = hoyISO();
  const [semana, setSemana] = useState(lunesDe(hoy));
  const press = ejercicio(PERFIL.destacado.id)!;
  const pp = serie(press, pc);
  const primero = pp[0];
  const ultimo = pp[pp.length - 1];
  const vol = seriesSemana(sesiones.value, semana);
  const info = avisos(sesiones.value, hoy, { ultimaCopia: ajustes.value.ultimaCopia, medidas: medidas.value, pc });

  return (
    <div class="vista">
      <header class="cab"><h1 class="vista-titulo">Progreso</h1><p class="dia-meta">1RM estimado con la mejor serie de cada sesión. Solo {ajustes.value.gimnasios.find((g) => g.id === ajustes.value.gymPorDefecto)?.nombre ?? 'tu gimnasio'}.</p></header>

      {info.filter((a) => a.nivel === 'info').map((a) => (
        <div key={a.id} class="aviso aviso-info"><div><strong>{a.titulo}</strong><p>{a.texto}</p></div></div>
      ))}

      <section class="tarjeta tarjeta-hero" style={{ '--dia': DIAS.find((d) => d.id === press.dia)?.color }}>
        <button class="hero-cab" onClick={() => ir({ v: 'ejercicio', id: press.id })}>
          <span>
            <span class="hero-tit">{press.nombre}</span>
            <span class="hero-sub">{PERFIL.destacado.sub}</span>
          </span>
          <IcoDcha size={18} />
        </button>
        {ultimo && (
          <div class="hero-cifras">
            <div><span class="hero-num">{ultimo.etiqueta}</span><span>mejor serie · {fechaCorta(ultimo.fecha)}</span></div>
            <div><span class="hero-num-s num">{fkg(ultimo.valor)} kg</span><span>1RM est.</span></div>
            {primero && primero !== ultimo && (
              <div><span class="hero-num-s num">{ultimo.valor >= primero.valor ? '+' : ''}{fkg(Math.round((ultimo.valor - primero.valor) * 10) / 10)} kg</span><span>desde {fechaCorta(primero.fecha)}</span></div>
            )}
          </div>
        )}
        {pp.length ? <Grafica puntos={pp} titulo={`Progreso de ${press.nombre}`} /> : <p class="vacio">La gráfica sale cuando guardes la primera sesión.</p>}
      </section>

      <section class="tarjeta">
        <h2 class="tarjeta-tit">{PERFIL.grupo.titulo}</h2>
        <div class="mini-lista">
          {PERFIL.grupo.ids.map((id) => {
            const ex = ejercicio(id)!;
            const p = serie(ex, pc);
            const u = p[p.length - 1];
            const delta = p.length > 1 ? (u.valor / p[0].valor - 1) * 100 : 0;
            return (
              <button key={id} class="mini-fila" onClick={() => ir({ v: 'ejercicio', id })}>
                <span class="mini-txt">
                  <strong>{ex.corto}</strong>
                  <span>{ex.foco.split('·')[1]?.trim() ?? ex.foco}</span>
                </span>
                <Chispa valores={p.map((x) => x.valor)} />
                <span class="mini-val num">
                  {u ? u.etiqueta : '—'}
                  {p.length > 1 && <span class={delta > 0.5 ? 'sube' : delta < -0.5 ? 'baja' : ''}>{delta > 0 ? '+' : ''}{Math.round(delta)}%</span>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section class="tarjeta">
        <div class="fila-esp">
          <h2 class="tarjeta-tit">Series directas · semana del {fechaCorta(semana)}</h2>
          <div class="chips">
            <button class="chip" onClick={() => setSemana(sumarDias(semana, -7))} aria-label="Semana anterior">‹</button>
            <button class="chip" disabled={semana >= lunesDe(hoy)} onClick={() => setSemana(sumarDias(semana, 7))} aria-label="Semana siguiente">›</button>
          </div>
        </div>
        <div class="vol">
          {vol.map((z) => (
            <div key={z.id} class="vol-fila">
              <span class="vol-nombre">{z.nombre}</span>
              <span class="vol-pista">
                <span class="vol-barra" style={{ width: `${Math.min(100, (z.hechas / z.previstas) * 100)}%` }} />
              </span>
              <span class="vol-num num">{z.hechas}/{z.previstas}</span>
            </div>
          ))}
        </div>
        <p class="nota-pie">Cuenta las series válidas (sin calentamientos) de los ejercicios donde ese músculo es el principal.</p>
      </section>

      <Medidas />

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Todos los ejercicios</h2>
        {DIAS.map((d) => (
          <div key={d.id} class="todos-dia">
            <p class="todos-tit" style={{ '--dia': d.color }}>{d.nombre}</p>
            {d.bloques.flat().map((id) => {
              const ex = ejercicio(id)!;
              const p = serie(ex, pc);
              return (
                <button key={id} class="mini-fila" onClick={() => ir({ v: 'ejercicio', id })}>
                  <span class="mini-txt"><strong>{ex.corto}</strong><span>{ex.foco}</span></span>
                  <Chispa valores={p.map((x) => x.valor)} />
                  <span class="mini-val num">{p.length ? p[p.length - 1].etiqueta : '—'}</span>
                </button>
              );
            })}
          </div>
        ))}
        {EJERCICIOS.some((e) => e.retirado) && <p class="todos-tit">Retirados</p>}
        {EJERCICIOS.filter((e) => e.retirado).map((ex) => (
          <button key={ex.id} class="mini-fila" onClick={() => ir({ v: 'ejercicio', id: ex.id })}>
            <span class="mini-txt"><strong>{ex.corto}</strong><span>{ex.retirado!.motivo}</span></span>
          </button>
        ))}
      </section>
    </div>
  );
}

function Medidas() {
  const hoy = hoyISO();
  const l = [...medidas.value].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const [f, setF] = useState<Medida>({ fecha: hoy });
  const num = (v: string) => {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  };
  const guardar = async () => {
    if (!f.peso && !f.brazo && !f.cintura) return;
    const resto = medidas.value.filter((m) => m.fecha !== f.fecha);
    const previa = medidas.value.find((m) => m.fecha === f.fecha);
    await setMedidas([...resto, { ...previa, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined)) } as Medida]);
    setF({ fecha: hoy });
  };
  const graf = (k: 'peso' | 'brazo' | 'cintura') => l.filter((m) => m[k]).map((m) => ({ fecha: m.fecha, valor: m[k]!, etiqueta: `${fkg(m[k]!)}` }));
  return (
    <section class="tarjeta">
      <h2 class="tarjeta-tit">Medidas</h2>
      <p class="nota-pie">{PERFIL.textoMedidas}</p>
      <div class="medidas-form">
        <label>Fecha<input class="campo" type="date" value={f.fecha} onInput={(e) => setF({ ...f, fecha: (e.target as HTMLInputElement).value })} /></label>
        <label>Peso (kg)<input class="campo num" inputMode="decimal" value={f.peso ?? ''} onInput={(e) => setF({ ...f, peso: num((e.target as HTMLInputElement).value) })} /></label>
        <label>Brazo (cm)<input class="campo num" inputMode="decimal" value={f.brazo ?? ''} onInput={(e) => setF({ ...f, brazo: num((e.target as HTMLInputElement).value) })} /></label>
        <label>Cintura (cm)<input class="campo num" inputMode="decimal" value={f.cintura ?? ''} onInput={(e) => setF({ ...f, cintura: num((e.target as HTMLInputElement).value) })} /></label>
      </div>
      <button class="btn btn-prim btn-ancho" onClick={guardar}>Guardar medidas</button>
      {(['brazo', 'cintura', 'peso'] as const).map((k) => {
        const p = graf(k);
        if (p.length < 2) return null;
        return (
          <div key={k} class="medida-graf">
            <p class="todos-tit">{{ brazo: 'Brazo contraído (cm)', cintura: 'Cintura (cm)', peso: 'Peso (kg)' }[k]}</p>
            <Grafica puntos={p} alto={130} unidad={k === 'peso' ? 'kg' : 'cm'} titulo={`Evolución de ${k}`} />
          </div>
        );
      })}
      {l.length > 0 && (
        <table class="tabla">
          <thead><tr><th>Fecha</th><th>Peso</th><th>Brazo</th><th>Cintura</th></tr></thead>
          <tbody>
            {[...l].reverse().map((m) => (
              <tr key={m.fecha}>
                <td>{fechaCorta(m.fecha)}</td>
                <td class="num">{m.peso ? fkg(m.peso) : '—'}</td>
                <td class="num">{m.brazo ? fkg(m.brazo) : '—'}</td>
                <td class="num">{m.cintura ? fkg(m.cintura) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

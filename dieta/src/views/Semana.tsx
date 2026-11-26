import { useState } from 'preact/hooks';
import { IAtras, IBalon, ICamara, ICambiar, IFlecha, IGym, IAjustes } from '../components/Iconos';
import { ImagenPlato } from '../components/Imagen';
import { aMin, DIAS, DIAS_CORTO, desdeISO, diaSemana, fechaCorta, lunesDe, sumarDias } from '../lib/fechas';
import { actualizarDia, actualizarSemana, diaCalculado, horas, hoy, objetivos, proximoLunes, semanas } from '../lib/estado';
import { resumenCantidades, porQue } from '../lib/explicar';
import { tareasSemana } from '../lib/compra';
import { PorQue } from './Hoy';
import type { ConfigDia } from '../lib/tipos';
import { abrir, borradorChat, fmt, pestana } from '../lib/ui';
import { Finde } from './Finde';

export function Semana() {
  const lunesHoy = lunesDe(hoy.value);
  const [lunes, setLunes] = useState(lunesHoy);
  const sem = semanas.value[lunes];
  const lunesExistentes = Object.keys(semanas.value).sort();
  const i0 = sem ? Math.max(0, Math.min(4, diaSemana(hoy.value))) : 0;
  const [sel, setSel] = useState<number>(lunes === lunesHoy && diaSemana(hoy.value) > 4 ? 5 : i0);

  const anterior = lunesExistentes.filter((l) => l < lunes).at(-1);
  const siguiente = lunesExistentes.find((l) => l > lunes);

  return (
    <>
      <header class="cabecera">
        <div>
          <div class="sub">Semana</div>
          <h1>
            {fechaCorta(lunes).split(' ')[0]}–{fechaCorta(sumarDias(lunes, 4))}
          </h1>
        </div>
        <div class="fila" style="gap:6px">
          <button class="cerrar" aria-label="Semana anterior" disabled={!anterior} style={!anterior ? 'opacity:.3' : ''} onClick={() => anterior && (setLunes(anterior), setSel(0))}>
            <IAtras />
          </button>
          <button class="cerrar" aria-label="Semana siguiente" disabled={!siguiente} style={!siguiente ? 'opacity:.3' : ''} onClick={() => siguiente && (setLunes(siguiente), setSel(0))}>
            <IFlecha />
          </button>
        </div>
      </header>

      {!semanas.value[proximoLunes()] && diaSemana(hoy.value) >= 3 && (
        <button class="item-menu pulsable" style="margin-bottom:12px;background:var(--hero);color:var(--hero-ink)" onClick={() => abrir({ t: 'generador', lunes: proximoLunes() })}>
          <span class="icono" style="background:var(--lima);color:#13201a">
            <IAjustes />
          </span>
          <div>
            <div class="t">Prepara la semana que viene</div>
            <div class="d" style="color:var(--hero-ink-2)">Horario del gym, táper, fútbol y lo que tienes en casa</div>
          </div>
          <IFlecha />
        </button>
      )}

      {!sem ? (
        <div class="tarjeta vacio">
          No hay plan para esta semana.
          <div style="margin-top:12px">
            <button class="btn primario" onClick={() => abrir({ t: 'generador', lunes })}>
              Montar semana
            </button>
          </div>
        </div>
      ) : (
        <>
          <div class="dias">
            {sem.config.dias.map((d, i) => (
              <button class={`dia-btn${sel === i ? ' activo' : ''}${d.fecha === hoy.value ? ' hoy' : ''}`} onClick={() => setSel(i)}>
                <span class="l">{DIAS_CORTO[i]}</span>
                <span class="n">{desdeISO(d.fecha).getDate()}</span>
                <span class={`pto${d.gym ? ' gym' : ''}`} />
              </button>
            ))}
            <button class={`dia-btn${sel === 5 ? ' activo' : ''}`} onClick={() => setSel(5)}>
              <span class="l">Finde</span>
              <span class="n">S·D</span>
              <span class="pto" />
            </button>
          </div>
          {sel === 5 ? (
            <div style="margin-top:14px">
              <Finde />
            </div>
          ) : (
            <Dia fecha={sem.config.dias[sel].fecha} cfg={sem.config.dias[sel]} i={sel} taper={sem.config.taper} />
          )}
          <div style="display:grid;gap:8px;margin-top:18px">
            <button
              class="btn ancho claude-btn"
              onClick={() => {
                if (!__CLAUDE__) return abrir({ t: 'claude', lunes });
                borradorChat.value = { texto: `Te mando la foto de mi compra: móntame la semana del ${fechaCorta(lunes)} con lo que tengo.`, enviar: false };
                pestana.value = 'chat';
              }}
            >
              <ICamara /> Semana con Claude · foto de la compra
            </button>
            <button class="btn borde ancho" onClick={() => abrir({ t: 'generador', lunes })}>
              <IAjustes /> Rehacer la semana
            </button>
          </div>
        </>
      )}
    </>
  );
}

function Dia({ fecha, cfg, i, taper }: { fecha: string; cfg: ConfigDia; i: number; taper: boolean }) {
  const d = diaCalculado(fecha);
  if (!d) return null;
  const pct = (x: number, o: number) => `${Math.min(100, (x / o) * 100)}%`;
  const comidas = d.comidas;
  return (
    <>
      <div class="tarjeta" style="margin-top:14px">
        <div class="fila entre">
          <div>
            <div class="etiqueta">{DIAS[i]}</div>
            <div style="font-family:var(--f-titulo);font-weight:800;font-size:20px">{cfg.gym ? `Gym ${cfg.gym.hora}` : 'Descanso'}</div>
          </div>
          <div style="text-align:right">
            <div class="num" style="font-weight:700;font-size:18px">
              {fmt(d.total.kcal)} <span class="muted" style="font-size:13px">/ {fmt(d.objetivo.kcal)} kcal</span>
            </div>
            <div class="num muted" style="font-size:13px">{fmt(d.total.p)} g de proteína</div>
          </div>
        </div>
        <div class="barra" style="margin-top:10px">
          <i style={{ width: pct(d.total.kcal, d.objetivo.kcal), background: 'var(--verde)' }} />
        </div>
      </div>

      <div style="margin-top:10px">
        <PorQue lineas={porQue(d, tareasSemana(semanas.value[lunesDe(fecha)]!, objetivos.value, horas.value).filter((t) => t.fecha === fecha), objetivos.value, { lunes: i === 0, taper })} />
      </div>
      <div class="seccion">
        <h2>Comidas</h2>
        {d.fuera && <span class="mas">Tarde en Cabra</span>}
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        {comidas.map((c) => {
          if (c.hueco.libre)
            return (
              <div class="comida-semana">
                <div class="miniatura" style="display:grid;place-items:center;background:var(--surface-2);font-weight:800;color:var(--ink-3)">½</div>
                <div>
                  <div class="etiqueta">
                    {c.hueco.hora} · {c.hueco.etiqueta}
                  </div>
                  <div style="font-weight:800">Libre · regla del plato</div>
                </div>
                <div class="k">≈{fmt(c.macro.kcal)}</div>
              </div>
            );
          if (!c.receta) return null;
          const clave = resumenCantidades(c.porciones);
          return (
            <div class="comida-semana">
              <button class="miniatura" onClick={() => abrir({ t: 'receta', fecha, slot: c.hueco.slot, id: c.receta!.id })} aria-label={c.receta.titulo}>
                <ImagenPlato receta={c.receta.id} foto={c.registro?.foto} />
              </button>
              <button style="text-align:left;min-width:0" onClick={() => abrir({ t: 'receta', fecha, slot: c.hueco.slot, id: c.receta!.id })}>
                <div class="etiqueta">
                  {c.hueco.hora} · {c.hueco.etiqueta}
                </div>
                <div style="font-weight:800;line-height:1.2">{c.registro?.estado === 'otro' ? c.registro.texto : c.receta.titulo}</div>
                {clave && <div class="muted" style="font-size:12.5px;margin-top:2px">{clave}</div>}
              </button>
              <div style="display:grid;justify-items:end;gap:4px">
                <div class="k">
                  <b>{fmt(c.macro.kcal)}</b> · {fmt(c.macro.p)} g
                </div>
                {!c.registro && c.hueco.slot !== 'pre' && c.receta.id !== 'taper-mama' && (
                  <button class="chip" style="padding:3px 8px;font-size:12px" onClick={() => abrir({ t: 'cambiar', fecha, slot: c.hueco.slot })}>
                    <ICambiar /> Cambiar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div class="seccion">
        <h2>Este día</h2>
        <span class="mas">Cambia y el plan se recoloca</span>
      </div>
      <div class="tarjeta" style="padding:4px 16px">
        <OpcionesDia fecha={fecha} cfg={cfg} i={i} taper={taper} />
      </div>
    </>
  );
}

export function OpcionesDia({ fecha, cfg, i, taper, cambiar }: { fecha: string; cfg: ConfigDia; i: number; taper: boolean; cambiar?: (c: Partial<ConfigDia>) => void }) {
  const set = cambiar ?? ((c: Partial<ConfigDia>) => actualizarDia(fecha, c));
  const horaOk = (h: string) => /^\d{2}:\d{2}$/.test(h) && aMin(h) >= 360 && aMin(h) <= 1380;
  return (
    <div class="ajustes-dia">
      <div class="opcion">
        <div class="fila">
          <IGym class="muted" style="width:20px;height:20px" />
          <div>
            <div class="t">Gimnasio</div>
            {cfg.gym && <div class="d">{cfg.gym.dur} min{cfg.gym.tipo ? ` · ${cfg.gym.tipo}` : ''}</div>}
          </div>
        </div>
        <div class="fila" style="gap:8px">
          {cfg.gym && (
            <input
              type="time"
              class="campo-hora"
              value={cfg.gym.hora}
              onChange={(e) => {
                const h = (e.target as HTMLInputElement).value;
                if (horaOk(h)) set({ gym: { ...cfg.gym!, hora: h } });
              }}
            />
          )}
          <button
            class={`interruptor${cfg.gym ? ' on' : ''}`}
            role="switch"
            aria-checked={!!cfg.gym}
            aria-label="Gimnasio"
            onClick={() => set({ gym: cfg.gym ? undefined : { hora: i === 1 ? '10:30' : i === 3 ? '11:00' : '16:30', dur: 65 } })}
          />
        </div>
      </div>
      <div class="opcion">
        <div class="fila">
          <IBalon class="muted" style="width:20px;height:20px" />
          <div>
            <div class="t">Fútbol sala</div>
            <div class="d">+{250} kcal de hidratos en la comida de después</div>
          </div>
        </div>
        <div class="fila" style="gap:8px">
          {cfg.futbol && (
            <input
              type="time"
              class="campo-hora"
              value={cfg.futbol.hora}
              onChange={(e) => {
                const h = (e.target as HTMLInputElement).value;
                if (horaOk(h)) set({ futbol: { hora: h } });
              }}
            />
          )}
          <button class={`interruptor${cfg.futbol ? ' on' : ''}`} role="switch" aria-checked={!!cfg.futbol} aria-label="Fútbol" onClick={() => set({ futbol: cfg.futbol ? undefined : { hora: '21:00' } })} />
        </div>
      </div>
      <Interruptor t="Desayuno en casa" d="Huevos fáciles en vez de bocadillo" v={!!cfg.desayunoCasa} on={(v) => set({ desayunoCasa: v })} />
      {!(i === 4 && cfg.cabra) && <Interruptor t="Cena fuera" d="Cena libre con la regla del plato" v={!!cfg.cenaLibre} on={(v) => set({ cenaLibre: v })} />}
      <Interruptor t="Comida fuera" d="Menú o comida libre a mediodía" v={!!cfg.comidaLibre} on={(v) => set({ comidaLibre: v })} />
      {i === 0 && <Interruptor t="Táper de mamá" d="La comida del lunes" v={taper} on={(v) => actualizarSemana(lunesDe(fecha), { taper: v })} />}
      {i === 4 && <Interruptor t="Me voy a Cabra después de comer" d="El plan acaba en la comida del viernes" v={!!cfg.cabra} on={(v) => set({ cabra: v })} />}
    </div>
  );
}

export function Interruptor({ t, d, v, on }: { t: string; d?: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div class="opcion">
      <div>
        <div class="t">{t}</div>
        {d && <div class="d">{d}</div>}
      </div>
      <button class={`interruptor${v ? ' on' : ''}`} role="switch" aria-checked={v} aria-label={t} onClick={() => on(!v)} />
    </div>
  );
}

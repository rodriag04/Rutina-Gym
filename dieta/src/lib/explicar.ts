import type { Tarea } from './compra';
import { aMin, diaSemana } from './fechas';
import { nombreSlot } from './horario';
import { alimento, textoCantidad, type Porcion } from './nutricion';
import type { DiaCalculado } from './plan';
import type { Objetivos } from './tipos';

/** "110 g pasta · 150 g carne picada" (lo que se escala: proteína e hidratos). */
export function resumenCantidades(ps: Porcion[]): string {
  return ps
    .filter((p) => (p.rol === 'prot' || p.rol === 'hc') && p.g > 0)
    .map((p) => {
      const t = textoCantidad(p);
      const a = alimento(p.a);
      return a.unidad && t.includes(a.unidad.nombre.slice(0, 4)) ? t : `${t} ${a.corto ?? a.nombre.toLowerCase()}`;
    })
    .join(' · ');
}

/** El "Por qué" del día, como en sus planes: cómo encaja cada comida con el horario. */
export function porQue(d: DiaCalculado, tareas: Tarea[], o: Objetivos, opts: { lunes: boolean; taper: boolean }): string[] {
  const out: string[] = [];
  const gym = d.cfg.gym;
  const hueco = (s: string) => d.comidas.find((c) => c.hueco.slot === s)?.hueco;
  const pre = hueco('pre');
  const des = hueco('desayuno');
  const com = hueco('comida');
  const mer = hueco('merienda');

  if (gym) {
    const h = gym.hora;
    if (des?.gym === 'post')
      out.push(`Gym a las ${h}: plátano a las ${pre?.hora ?? '—'} y el bocadillo al salir. Vuelves a clase, así que nada de batido hasta la merienda.`);
    else if (des?.gym === 'pre') out.push(`Gym a las ${h}: el desayuno en casa es tu pre-entreno y la comida, la recuperación con más hidratos.`);
    else if (com?.gym === 'post' && pre) out.push(`Gym a las ${h}: plátano justo antes y la comida de después, la que más hidratos lleva, es la de recuperación.`);
    else if (com?.gym === 'pre')
      out.push(`Gym a las ${h}: la comida es tu pre-entreno, ${aMin(h) - aMin(com.hora)} min antes, con hidratos y proteína. La merienda es la recuperación: tómatela al llegar.`);
    else if (mer?.gym === 'pre') out.push(`Gym a las ${h}: la merienda es el pre-entreno y la cena, la recuperación.`);
    else out.push(`Gym a las ${h}: más hidratos pegados al entreno.`);
  } else {
    out.push('Sin gym gastas menos: menos hidratos y algo más de grasa buena (nueces).');
  }

  if (d.cfg.futbol) {
    const tras = d.comidas.find((c) => c.hueco.futbol);
    out.push(`Fútbol a las ${d.cfg.futbol.hora}: +${o.futbol} kcal de hidratos en la ${tras ? nombreSlot(tras.hueco.slot).toLowerCase() : 'comida'} de después. No repongas lo que marca el reloj: se pasa.`);
  }

  if (opts.lunes) {
    out.push(opts.taper ? 'Comida: el táper de tu madre.' : 'Sin táper: la comida es de despensa porque aún no has hecho la compra.');
    if (!d.cfg.desayunoCasa) out.push('Desayuno con el pan y el embutido que tengas en casa.');
    if (tareas.some((t) => t.tipo === 'compra')) out.push('Compra al salir del gym. Al volver, congela lo que se come del miércoles en adelante.');
  }

  if (d.cfg.cenaLibre) out.push('Cena fuera: regla del plato (carne o pescado de dos palmas, 1-2 puños de hidratos y verdura).');
  if (d.cfg.cabra) out.push('Te vas a Cabra después de comer: el plan acaba en la comida y en la nevera no queda nada que se estropee.');
  else if (opts.lunes === false && d.comidas.some((c) => c.hueco.slot === 'cena' && c.receta?.etiquetas?.includes('despensa')) && diaSemana(d.fecha) === 4)
    out.push('La cena es de despensa: si al final te vas a Cabra, no se te estropea nada.');

  const noche = tareas.find((t) => t.tipo === 'descongelar');
  if (noche) out.push(`Esta noche, del congelador a la nevera: ${noche.detalle.slice(0, -1).map((x) => x.split(' (')[0]).join(' y ')}.`);
  return out;
}

import { aHora, aMin } from './fechas';
import type { ConfigDia, Slot } from './tipos';

export interface Horas {
  desayunoCasa: string;
  desayuno: string;
  comida: string;
  merienda: string;
  cena: string;
  finClase: string;
}

export const HORAS: Horas = {
  desayunoCasa: '07:15',
  desayuno: '11:00',
  comida: '15:00',
  merienda: '18:30',
  cena: '21:30',
  finClase: '14:30'
};

export interface Hueco {
  slot: Slot;
  hora: string;
  etiqueta: string;
  gym?: 'pre' | 'post';
  /** Comida justo después de un partido: +hidratos. */
  futbol?: boolean;
  libre?: boolean;
  /** Sale del gym y vuelve a clase: nada de batido. */
  noBatido?: boolean;
  /** Peso de los hidratos al repartir (más alrededor del entreno). */
  pesoHc: number;
  /** Tope del factor de hidratos (cenas no exageradas). */
  topeHc?: number;
}

export interface Evento {
  tipo: 'gym' | 'futbol' | 'cabra' | 'clase';
  hora: string;
  fin?: string;
  texto: string;
  detalle?: string;
}

const NOMBRE: Record<Slot, string> = {
  desayuno: 'Desayuno',
  pre: 'Pre-gym',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena'
};

export const nombreSlot = (s: Slot) => NOMBRE[s];

/** Coloca las comidas del día alrededor del gym, el fútbol y las clases. */
export function horario(cfg: ConfigDia, h: Horas = HORAS, finde = false): { huecos: Hueco[]; eventos: Evento[] } {
  const eventos: Evento[] = [];
  const gym = cfg.gym ? { ini: aMin(cfg.gym.hora), fin: aMin(cfg.gym.hora) + cfg.gym.dur } : null;
  const finClase = aMin(h.finClase);
  const clase = !finde && !cfg.festivo;

  let des = aMin(cfg.desayunoCasa ? h.desayunoCasa : h.desayuno);
  let desEtq = cfg.desayunoCasa ? 'Desayuno en casa' : clase ? 'Desayuno · descanso de clase' : 'Desayuno';
  let desGym: Hueco['gym'];
  let com = aMin(h.comida);
  let comEtq = 'Comida';
  let comGym: Hueco['gym'];
  let mer = aMin(h.merienda);
  let merEtq = 'Merienda';
  let merGym: Hueco['gym'];
  let cen = aMin(h.cena);
  let cenEtq = 'Cena';
  let cenGym: Hueco['gym'];
  let pre: number | null = null;
  let noBatidoDes = false;

  if (gym) {
    if (gym.ini < finClase && gym.ini < aMin('12:30')) {
      // Gym por la mañana (vuelve a clase): plátano antes, bocadillo al salir.
      if (cfg.desayunoCasa) {
        const margen = gym.ini - des;
        if (margen >= 60 && margen <= 150) {
          desEtq = 'Desayuno en casa · pre-gym';
          desGym = 'pre';
        } else pre = gym.ini - 40;
        comEtq = 'Comida · post-gym';
        comGym = 'post';
      } else {
        pre = gym.ini - 40;
        des = gym.fin + 10;
        desEtq = clase ? 'Desayuno · al salir del gym' : 'Desayuno · post-gym';
        desGym = 'post';
        noBatidoDes = clase;
      }
    } else if (gym.ini < aMin('14:45')) {
      // Mediodía (13:30): bocadillo a las 11, plátano antes y la comida es el post-entreno.
      pre = gym.ini - 40;
      com = Math.max(com, gym.fin + 15);
      comEtq = 'Comida · post-gym';
      comGym = 'post';
    } else if (gym.ini < aMin('18:30')) {
      // Tarde: la comida es el pre-entreno si cae 75-150 min antes.
      const margen = gym.ini - com;
      if (margen >= 75) {
        comEtq = margen <= 180 ? 'Comida · pre-gym' : 'Comida';
        if (margen <= 180) comGym = 'pre';
        if (margen > 180) pre = gym.ini - 40;
      } else {
        pre = Math.max(finClase + 5, gym.ini - 35);
        com = gym.fin + 15;
        comEtq = 'Comida · post-gym';
        comGym = 'post';
      }
      if (comGym !== 'post') {
        mer = Math.max(mer, gym.fin + 25);
        merEtq = 'Merienda · post-gym';
        merGym = 'post';
      } else mer = Math.max(mer, com + 180);
    } else {
      // Noche: merienda pre-entreno y cena después.
      mer = Math.min(mer, gym.ini - 75);
      merEtq = 'Merienda · pre-gym';
      merGym = 'pre';
      cen = Math.max(cen, gym.fin + 30);
      cenEtq = 'Cena · post-gym';
      cenGym = 'post';
    }
    eventos.push({ tipo: 'gym', hora: aHora(gym.ini), fin: aHora(gym.fin), texto: 'Gimnasio', detalle: cfg.gym?.tipo });
  }

  let huecos: Hueco[] = [
    { slot: 'desayuno', hora: aHora(des), etiqueta: desEtq, gym: desGym, noBatido: noBatidoDes, pesoHc: 1 },
    { slot: 'comida', hora: aHora(com), etiqueta: comEtq, gym: comGym, pesoHc: 1, libre: cfg.comidaLibre },
    { slot: 'merienda', hora: aHora(mer), etiqueta: merEtq, gym: merGym, pesoHc: 1 },
    { slot: 'cena', hora: aHora(cen), etiqueta: cenEtq, gym: cenGym, pesoHc: 1, libre: cfg.cenaLibre }
  ];
  if (pre !== null) huecos.push({ slot: 'pre', hora: aHora(pre), etiqueta: 'Pre-gym', gym: 'pre', pesoHc: 1 });

  if (cfg.futbol) {
    const ini = aMin(cfg.futbol.hora);
    const fin = ini + 60;
    eventos.push({ tipo: 'futbol', hora: aHora(ini), fin: aHora(fin), texto: 'Fútbol sala', detalle: '+hidratos en la comida de después' });
    const cena = huecos.find((x) => x.slot === 'cena')!;
    if (fin + 30 > aMin(cena.hora) && ini > aMin(cena.hora) - 180) cena.hora = aHora(fin + 30);
    const despues = huecos
      .filter((x) => x.slot !== 'pre' && aMin(x.hora) >= fin)
      .sort((a, b) => aMin(a.hora) - aMin(b.hora))[0];
    if (despues) {
      despues.futbol = true;
      despues.etiqueta = `${NOMBRE[despues.slot]} · post-partido`;
    }
  }

  if (cfg.cabra) {
    const com2 = huecos.find((x) => x.slot === 'comida')!;
    huecos = huecos.filter((x) => aMin(x.hora) <= aMin(com2.hora));
    eventos.push({ tipo: 'cabra', hora: aHora(aMin(com2.hora) + 90), texto: 'A Cabra', detalle: 'Merienda y cena en casa: regla del plato' });
  }

  // Más hidratos pegados al entreno; días sin gym, cena algo más ligera.
  for (const x of huecos) {
    if (x.gym === 'post') x.pesoHc = 1.3;
    else if (x.gym === 'pre') x.pesoHc = 1.15;
    else if (x.slot === 'comida') x.pesoHc = 1.1;
    else if (x.slot === 'cena') x.pesoHc = gym ? 0.8 : 0.7;
    if (x.futbol) x.pesoHc += 1.2;
    if (x.slot === 'cena' && x.gym !== 'post' && !x.futbol) x.topeHc = 1.3;
  }

  huecos.sort((a, b) => aMin(a.hora) - aMin(b.hora));
  return { huecos, eventos };
}

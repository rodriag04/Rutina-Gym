import { ALIMENTOS } from '../data/alimentos';
import { RECETA, RECETAS } from '../data/recetas';
import { capacidad } from './almacen';
import { DIBUJOS } from './claude';
import { ahoraHora, DIAS, diaSemana, fechaCorta, lunesDe, sumarDias } from './fechas';
import {
  actualizarDia,
  ajustesLog,
  aplicarCodigo,
  aplicarObjetivos,
  borrarRegistro,
  cambiarPlato,
  diaCalculado,
  guardarMedida,
  hoy,
  objetivos,
  registrar,
  restaurar,
  resumenActual,
  semanaDe,
  type Instantanea,
  medidas,
  registros,
  semanas
} from './estado';
import { resumenCantidades } from './explicar';
import { nombreSlot } from './horario';
import type { Objetivos, Slot } from './tipos';

// El dietista dentro de la app: Claude con el estado de la app en el mensaje y
// funciones de la página para cambiar el plan (capacidad `sample` del artifact).

export interface Turno {
  role: 'user' | 'assistant';
  content: string;
}
interface Herramienta {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute(input: Record<string, unknown>): unknown;
}
export type Sample = ((
  input: string | Turno[],
  opts?: { onText?: (u: { text: string }) => void; signal?: AbortSignal; tools?: Herramienta[]; images?: Blob[]; cache?: boolean; modelTier?: string }
) => Promise<{ text: string; truncated: boolean }>) & {
  json<T>(input: string | Turno[], opts?: { images?: Blob[]; signal?: AbortSignal; modelTier?: string }): Promise<T>;
  limits(): Promise<{ images?: { maxCount: number }; tools?: { maxCount: number } }>;
};
export interface ErrorSample {
  code: string;
  message: string;
  text?: string;
  reason?: string;
}

export const usarSample = () => capacidad<Sample>('sample');

const SLOTS: Slot[] = ['desayuno', 'comida', 'merienda', 'cena'];

export function instrucciones(): string {
  const f = hoy.value;
  return [
    `Eres el dietista de Rodri dentro de su app "Comidas". Hoy es ${DIAS[diaSemana(f)].toLowerCase()} ${fechaCorta(f)} (${f}), son las ${ahoraHora()}.`,
    '',
    'Cómo hablarle: español de España, frases cortas, al grano, datos concretos. Si pide una decisión, una sola recomendación. No le des la razón por dársela: si algo va contra su objetivo, díselo con el motivo. Nada de lenguaje de anuncio. Sin tablas largas: el móvil es estrecho.',
    '',
    'Quién es: 22 años, 1,82 m, 72 kg, ~18-20 % de grasa. Estudia en Sevilla (clases L-V 8:00-14:30), los findes en Cabra. Gym Basic-Fit 3-4 días, 10.000 pasos, a veces fútbol sala. Objetivo: recomposición (más músculo, sobre todo brazos y hombros, y bajar la barriga). Gasto ≈2.650 kcal.',
    'Reglas del plan: proteína en las 4 comidas; hidratos pegados al entreno; días de descanso menos hidratos y algo más de nueces; plátano 30-45 min antes del gym; nada de batido si sale del gym a clase; fútbol +200-300 kcal de hidratos en la comida de después (no reponer lo que marca el reloj); no repetir proteína en el día ni plato dos días seguidos; verdura: solo su bolsa congelada de pimiento, cebolla y zanahoria (200 g por ración); postre yogur +Proteínas u onza de chocolate 85 %; cottage solo en salsas; airfryer, micro y sartén, 10-20 min. Si se pasa un día, no compensar al siguiente. La grasa no se quita por zonas. Ajustes: si en 3 semanas la cintura no baja, −150 kcal los días de descanso; si baja más de 0,5 kg/semana o pierde fuerza, +150 kcal los días de gym.',
    '',
    'Qué hacer con lo que te diga:',
    '- Si cuenta algo que cambia el plan (hora del gym, partido, cena o comida fuera, desayuno en casa, se va a Cabra, peso o cintura) o lo pide, aplícalo con las herramientas y luego dilo en una frase. Las cantidades las recalcula la app sola.',
    '- Si dice lo que ha comido o manda la foto de un plato que se ha comido, estima kcal y macros de la ración que se ve y apúntalo con apuntar_comida en la comida que toque. Si solo pregunta, contesta sin apuntar.',
    '- Si manda la foto de su compra, nevera o despensa y pide la semana, monta la semana con montar_semana usando lo que se ve.',
    '- Para preguntas, responde sin herramientas. Para ver las cantidades de un día, usa ver_dia.',
    '- Usa solo ids de recetas y alimentos de las listas. No inventes datos que no estén aquí.',
    '',
    'ESTADO ACTUAL DE LA APP',
    resumenActual(),
    '',
    'Recetas (id · nombre · comidas):',
    RECETAS.filter((r) => r.slots.length)
      .map((r) => `${r.id} · ${r.titulo} · ${r.slots.join('/')}`)
      .join('\n'),
    '',
    `Alimentos (ids): ${ALIMENTOS.filter((a) => !a.basico || a.id === 'aceite')
      .map((a) => a.id)
      .join(', ')}.`
  ].join('\n');
}

const fechaDe = (x: unknown) => {
  const s = String(x ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : hoy.value;
};
const slotDe = (x: unknown): Slot => {
  const s = String(x ?? '').toLowerCase() as Slot;
  if (!SLOTS.includes(s)) throw new Error(`comida debe ser una de: ${SLOTS.join(', ')}`);
  return s;
};
const horaDe = (x: unknown) => {
  const s = String(x ?? '').trim();
  if (!/^\d{1,2}:\d{2}$/.test(s)) throw new Error('hora con formato HH:MM');
  return s.padStart(5, '0');
};
const cuando = (f: string) => (f === hoy.value ? 'hoy' : `el ${DIAS[diaSemana(f)].toLowerCase()} ${fechaCorta(f)}`);
const n = (x: unknown) => (typeof x === 'number' ? x : Number(String(x ?? '').replace(',', '.')));

export interface Deshacer {
  inst: Instantanea;
  objetivos: Objetivos;
  ajustes: number;
}
export const foto = (): Deshacer => ({ inst: { semanas: semanas.value, registros: registros.value, medidas: medidas.value }, objetivos: objetivos.value, ajustes: ajustesLog.value.length });
export function deshacer(d: Deshacer) {
  restaurar(d.inst);
  objetivos.value = d.objetivos;
  ajustesLog.value = ajustesLog.value.slice(0, d.ajustes);
}

/** Funciones que Claude puede usar. Cada cambio se anota en `cambios` para enseñarlo en el chat. */
export function herramientas(cambios: string[], alCambiar: () => void): Herramienta[] {
  const hecho = (t: string) => {
    cambios.push(t);
    alCambiar();
    return `Hecho: ${t}`;
  };
  const tieneDia = (f: string) => {
    const sem = semanaDe(f);
    if (!sem || !sem.config.dias.some((d) => d.fecha === f)) throw new Error(`No hay plan para ${f} (solo de lunes a viernes de semanas montadas).`);
  };
  return [
    {
      name: 'cambiar_dia',
      description: 'Cambia el horario de un día (lunes a viernes): gym, fútbol, desayuno en casa, comida o cena fuera, irse a Cabra después de comer. La app recoloca las comidas y recalcula cantidades. Pon solo los campos que cambian.',
      inputSchema: {
        type: 'object',
        properties: {
          fecha: { type: 'string', description: 'YYYY-MM-DD; por defecto hoy' },
          gym: { type: 'string', description: 'hora "HH:MM" o "no" para quitarlo' },
          gym_minutos: { type: 'number' },
          futbol: { type: 'string', description: 'hora "HH:MM" o "no"' },
          desayuno_en_casa: { type: 'boolean' },
          comida_fuera: { type: 'boolean' },
          cena_fuera: { type: 'boolean' },
          cabra: { type: 'boolean', description: 'se va a Cabra después de comer' }
        }
      },
      execute(i) {
        const f = fechaDe(i.fecha);
        tieneDia(f);
        const sem = semanaDe(f)!;
        const prev = sem.config.dias.find((d) => d.fecha === f)!;
        const c: Record<string, unknown> = {};
        const partes: string[] = [];
        if (i.gym !== undefined) {
          if (String(i.gym).toLowerCase() === 'no') {
            c.gym = undefined;
            partes.push('sin gym');
          } else {
            const h = horaDe(i.gym);
            c.gym = { hora: h, dur: n(i.gym_minutos) > 0 ? n(i.gym_minutos) : prev.gym?.dur ?? 65, tipo: prev.gym?.tipo };
            partes.push(`gym a las ${h}`);
          }
        }
        if (i.futbol !== undefined) {
          if (String(i.futbol).toLowerCase() === 'no') {
            c.futbol = undefined;
            partes.push('sin fútbol');
          } else {
            const h = horaDe(i.futbol);
            c.futbol = { hora: h };
            partes.push(`fútbol a las ${h}`);
          }
        }
        for (const [k, campo, si, no] of [
          ['desayuno_en_casa', 'desayunoCasa', 'desayuno en casa', 'desayuno de bocadillo'],
          ['comida_fuera', 'comidaLibre', 'comida fuera', 'comida en casa'],
          ['cena_fuera', 'cenaLibre', 'cena fuera', 'cena en casa'],
          ['cabra', 'cabra', 'a Cabra después de comer', 'se queda en Sevilla']
        ] as const) {
          if (typeof i[k] === 'boolean') {
            c[campo] = i[k];
            partes.push(i[k] ? si : no);
          }
        }
        if (!partes.length) throw new Error('No has dicho qué cambiar.');
        actualizarDia(f, c);
        return hecho(`${partes.join(', ')} ${cuando(f)}`);
      }
    },
    {
      name: 'apuntar_comida',
      description: 'Apunta lo que Rodri ha comido de verdad en una comida (fuera del plan o distinto). El resto del día se reajusta. Usa tu estimación de la ración.',
      inputSchema: {
        type: 'object',
        properties: {
          fecha: { type: 'string', description: 'YYYY-MM-DD; por defecto hoy' },
          comida: { type: 'string', enum: SLOTS },
          que: { type: 'string', description: 'nombre corto del plato' },
          kcal: { type: 'number' },
          proteina: { type: 'number', description: 'gramos' },
          hidratos: { type: 'number' },
          grasa: { type: 'number' }
        },
        required: ['comida', 'que', 'kcal', 'proteina']
      },
      execute(i) {
        const f = fechaDe(i.fecha);
        const slot = slotDe(i.comida);
        const kcal = n(i.kcal);
        if (!(kcal > 0 && kcal < 4000)) throw new Error('kcal fuera de rango');
        const texto = String(i.que ?? 'Otra comida').slice(0, 80);
        registrar(f, slot, 'otro', { kcal, p: Math.max(0, n(i.proteina) || 0), c: Math.max(0, n(i.hidratos) || 0), g: Math.max(0, n(i.grasa) || 0) }, { texto });
        return hecho(`${nombreSlot(slot)} ${cuando(f)}: ${texto} (${Math.round(kcal)} kcal, ${Math.round(n(i.proteina) || 0)} g)`);
      }
    },
    {
      name: 'marcar_comida',
      description: 'Marca una comida del plan como hecha tal cual, como saltada, o quita la marca.',
      inputSchema: {
        type: 'object',
        properties: { fecha: { type: 'string' }, comida: { type: 'string', enum: SLOTS }, estado: { type: 'string', enum: ['hecha', 'saltada', 'quitar'] } },
        required: ['comida', 'estado']
      },
      execute(i) {
        const f = fechaDe(i.fecha);
        const slot = slotDe(i.comida);
        const e = String(i.estado);
        if (e === 'quitar') {
          borrarRegistro(f, slot);
          return hecho(`${nombreSlot(slot)} ${cuando(f)} sin marcar`);
        }
        if (e === 'saltada') {
          registrar(f, slot, 'saltada', { kcal: 0, p: 0, c: 0, g: 0 });
          return hecho(`${nombreSlot(slot)} ${cuando(f)} saltada`);
        }
        const c = diaCalculado(f)?.comidas.find((x) => x.hueco.slot === slot);
        if (!c?.receta) throw new Error('Esa comida no está en el plan de ese día.');
        registrar(f, slot, 'hecho', c.macro);
        return hecho(`${nombreSlot(slot)} ${cuando(f)} hecha (${c.receta.titulo})`);
      }
    },
    {
      name: 'cambiar_plato',
      description: 'Cambia el plato de una comida por otra receta de la lista (por id). Las cantidades se recalculan.',
      inputSchema: {
        type: 'object',
        properties: { fecha: { type: 'string' }, comida: { type: 'string', enum: SLOTS }, receta: { type: 'string', description: 'id de la receta' } },
        required: ['comida', 'receta']
      },
      execute(i) {
        const f = fechaDe(i.fecha);
        tieneDia(f);
        const slot = slotDe(i.comida);
        const r = RECETA[String(i.receta)];
        if (!r) throw new Error('Esa receta no existe: usa un id de la lista.');
        if (!r.slots.includes(slot)) throw new Error(`"${r.titulo}" no sirve para ${slot}.`);
        cambiarPlato(f, slot, r.id);
        return hecho(`${nombreSlot(slot)} ${cuando(f)}: ${r.titulo}`);
      }
    },
    {
      name: 'ver_dia',
      description: 'Devuelve el plan de un día con horas, platos, gramos de lo principal, kcal y proteína, y lo ya apuntado.',
      inputSchema: { type: 'object', properties: { fecha: { type: 'string' } } },
      execute(i) {
        const f = fechaDe(i.fecha);
        const d = diaCalculado(f);
        if (!d) return `No hay plan para ${f}.`;
        return [
          `${DIAS[diaSemana(f)]} ${f}: objetivo ${d.objetivo.kcal} kcal y ${d.objetivo.p} g; previsto ${Math.round(d.total.kcal)} kcal y ${Math.round(d.total.p)} g.`,
          ...d.comidas.map(
            (c) =>
              `${c.hueco.hora} ${c.hueco.etiqueta}: ${c.registro ? `${c.registro.estado}${c.registro.texto ? ` (${c.registro.texto})` : ''}` : c.hueco.libre ? 'libre' : `${c.receta?.titulo} [${resumenCantidades(c.porciones)}]`} · ${Math.round(c.macro.kcal)} kcal, ${Math.round(c.macro.p)} g`
          )
        ].join('\n');
      }
    },
    {
      name: 'montar_semana',
      description: `Monta o rehace la semana (lunes a viernes) con platos elegidos por ti, por ejemplo con lo que se ve en la foto de la compra. Los días que no pongas se quedan como están. Puedes crear recetas nuevas (id "x-...") y alimentos nuevos (valores por 100 g). Dibujos para recetas nuevas: ${Object.keys(DIBUJOS).join(', ')}.`,
      inputSchema: {
        type: 'object',
        properties: {
          lunes: { type: 'string', description: 'YYYY-MM-DD del lunes' },
          menu: { type: 'object', description: '{ "YYYY-MM-DD": { "desayuno": id, "comida": id, "merienda": id, "cena": id } }' },
          recetas: { type: 'array', description: '[{id, titulo, sub, slots[], familia, min, dibujo, ing:[{a: idAlimento, g, rol: prot|hc|veg|grasa|extra, nota?}], pasos[], truco?}]' },
          alimentos: { type: 'array', description: '[{id, nombre, kcal, p, c, g, grupo: proteina|hidratos|fruta-verdura|lacteos|despensa, fresco?}]' },
          enCasa: { type: 'array', description: 'ids de alimentos que ya tiene (no salen en la compra)' },
          nota: { type: 'string' }
        },
        required: ['lunes', 'menu']
      },
      execute(i) {
        const r = aplicarCodigo(JSON.stringify({ rodri: 1, tipo: 'semana', ...i }));
        if (!r.ok) throw new Error(r.error);
        return hecho(r.lineas[0] + (r.lineas.length > 1 ? ` ${r.lineas.slice(1, 3).join(' ')}` : ''));
      }
    },
    {
      name: 'guardar_medida',
      description: 'Guarda el peso (kg, en ayunas) y/o la cintura (cm, a la altura del ombligo).',
      inputSchema: { type: 'object', properties: { fecha: { type: 'string' }, peso: { type: 'number' }, cintura: { type: 'number' } } },
      execute(i) {
        const f = fechaDe(i.fecha);
        const peso = n(i.peso);
        const cintura = n(i.cintura);
        const m: { peso?: number; cintura?: number } = {};
        if (peso >= 45 && peso <= 140) m.peso = peso;
        if (cintura >= 50 && cintura <= 130) m.cintura = cintura;
        if (!Object.keys(m).length) throw new Error('Peso o cintura fuera de rango.');
        guardarMedida(f, m);
        return hecho(`${m.peso ? `peso ${String(m.peso).replace('.', ',')} kg` : ''}${m.peso && m.cintura ? ' y ' : ''}${m.cintura ? `cintura ${String(m.cintura).replace('.', ',')} cm` : ''} (${fechaCorta(f)})`);
      }
    },
    {
      name: 'cambiar_objetivos',
      description: 'Cambia los objetivos diarios. Solo si Rodri lo pide o lo aceptas tras explicarle por qué (reglas de ajuste ±150 kcal).',
      inputSchema: { type: 'object', properties: { kcal_gym: { type: 'number' }, kcal_descanso: { type: 'number' }, proteina: { type: 'number' }, motivo: { type: 'string' } }, required: ['motivo'] },
      execute(i) {
        const o = { ...objetivos.value };
        if (n(i.kcal_gym) >= 1500 && n(i.kcal_gym) <= 3500) o.kcalGym = Math.round(n(i.kcal_gym));
        if (n(i.kcal_descanso) >= 1500 && n(i.kcal_descanso) <= 3500) o.kcalDescanso = Math.round(n(i.kcal_descanso));
        if (n(i.proteina) >= 100 && n(i.proteina) <= 250) o.prot = Math.round(n(i.proteina));
        aplicarObjetivos(o, String(i.motivo ?? 'Ajuste desde el chat').slice(0, 120));
        return hecho(`objetivos: gym ${o.kcalGym} kcal, descanso ${o.kcalDescanso} kcal, ${o.prot} g de proteína`);
      }
    }
  ];
}

/** Foto de un plato → estimación de kcal y macros (para "Comí otra cosa"). */
export async function estimarFoto(sample: Sample, imagen: Blob, slot: Slot, signal?: AbortSignal) {
  const r = await sample.json<{ texto?: string; kcal?: number; p?: number; c?: number; g?: number }>(
    `Foto de la ${nombreSlot(slot).toLowerCase()} de Rodri (España, 22 años, 72 kg). Identifica el plato y estima la ración que se ve: kcal, proteína, hidratos y grasa en gramos. Responde solo con JSON: {"texto": "nombre corto del plato", "kcal": 0, "p": 0, "c": 0, "g": 0}`,
    { images: [imagen], signal }
  );
  const kcal = n(r?.kcal);
  if (!(kcal > 0)) throw { code: 'invalid_json', message: 'Sin kcal' };
  return { texto: String(r.texto ?? 'Plato de la foto').slice(0, 80), kcal, p: n(r.p) || 0, c: n(r.c) || 0, g: n(r.g) || 0 };
}

export const SUGERENCIAS = ['He ido al gym a las 17:30', 'Hoy ceno fuera', '¿Cómo voy esta semana?', 'Cámbiame la cena de hoy por algo más ligero', 'Peso 71,8'];

export const lunesActual = () => lunesDe(hoy.value);
export const proximo = () => sumarDias(lunesDe(hoy.value), 7);

export function mensajeError(e: ErrorSample): string {
  switch (e.code) {
    case 'not_granted':
      return 'No has dado permiso a la app para usar Claude. Ciérrala y vuelve a abrirla para que te lo pregunte.';
    case 'rate_limited':
      return e.reason === 'usage_limit' ? 'Has llegado al límite de uso de tu plan de Claude. Prueba más tarde.' : 'Demasiados mensajes seguidos. Espera un momento y vuelve a enviarlo.';
    case 'session_expired':
      return 'Tienes que volver a iniciar sesión en Claude.';
    case 'image_rejected':
      return 'No he podido leer la foto. Prueba con otra (JPG o PNG).';
    case 'prompt_too_large':
      return 'La conversación es muy larga. Borra el chat y vuelve a preguntar.';
    case 'refused':
      return 'Claude no ha querido responder a eso. Prueba a decirlo de otra forma.';
    case 'cancelled':
      return 'Parado.';
    default:
      return 'No ha llegado la respuesta. Vuelve a enviarlo.';
  }
}

import { useState } from 'preact/hooks';
import { IcoCompartir, IcoCopiar, IcoPapelera } from '../components/Iconos';
import { EJERCICIOS } from '../data/rutina';
import { ajustes, diario, medidas, notasEjercicio, sesiones, setDiario } from '../lib/estado';
import { compartir, copiar, informeClaude } from '../lib/exportar';
import { fechaCorta, hoyISO, uid } from '../lib/formato';
import { ir } from '../lib/ruta';
import type { EntradaDiario } from '../lib/tipos';

const TIPOS: { id: EntradaDiario['tipo']; nombre: string; ayuda: string }[] = [
  { id: 'sensacion', nombre: 'Sensación', ayuda: 'Cómo te notas: energía, bombeo, fuerza, sueño…' },
  { id: 'correccion', nombre: 'Corrección', ayuda: 'Algo que cambiar en la rutina o en la técnica.' },
  { id: 'molestia', nombre: 'Molestia', ayuda: 'Dónde, en qué ejercicio y desde cuándo.' }
];

export function Notas() {
  const [tipo, setTipo] = useState<EntradaDiario['tipo']>('sensacion');
  const [texto, setTexto] = useState('');
  const [copiado, setCopiado] = useState(false);
  const lista = [...diario.value].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
  const pendientes = lista.filter((x) => !x.revisada).length;
  const correcciones = EJERCICIOS.filter((e) => !e.retirado && notasEjercicio.value[e.id]);

  const datos = () => ({ sesiones: sesiones.value, diario: diario.value, medidas: medidas.value, notasEjercicio: notasEjercicio.value, ajustes: ajustes.value });

  async function anadir() {
    if (!texto.trim()) return;
    await setDiario([...diario.value, { id: uid(), fecha: hoyISO(), tipo, texto: texto.trim() }]);
    setTexto('');
  }

  return (
    <div class="vista">
      <header class="cab">
        <h1 class="vista-titulo">Notas</h1>
        <p class="dia-meta">Sensaciones y correcciones para revisar con Claude</p>
      </header>

      <section class="tarjeta">
        <div class="chips">
          {TIPOS.map((t) => (
            <button key={t.id} class={`chip ${tipo === t.id ? 'activo' : ''}`} onClick={() => setTipo(t.id)}>{t.nombre}</button>
          ))}
        </div>
        <textarea class="campo" rows={4} placeholder={TIPOS.find((t) => t.id === tipo)!.ayuda} value={texto} onInput={(e) => setTexto((e.target as HTMLTextAreaElement).value)} />
        <button class="btn btn-prim btn-ancho" disabled={!texto.trim()} onClick={anadir}>Guardar nota</button>
      </section>

      <section class="tarjeta tarjeta-accion">
        <strong>Informe para Claude</strong>
        <p class="nota-pie">
          Junta las sesiones de las 2 últimas semanas, los avisos, {pendientes} nota{pendientes === 1 ? '' : 's'} sin revisar, tus correcciones y las medidas. Pégalo en el proyecto “Rutina Gym”.
        </p>
        <div class="fila-btns">
          <button class="btn btn-prim" onClick={async () => setCopiado(await copiar(informeClaude(datos())))}><IcoCopiar size={18} /> {copiado ? 'Copiado' : 'Copiar informe'}</button>
          <button class="btn" onClick={() => compartir(informeClaude(datos()))}><IcoCompartir size={18} /> Compartir</button>
        </div>
      </section>

      {lista.length > 0 && (
        <section class="tarjeta">
          <h2 class="tarjeta-tit">Tus notas</h2>
          {lista.map((n) => (
            <div key={n.id} class={`nota ${n.revisada ? 'nota-revisada' : ''}`}>
              <div class="nota-cab">
                <span class={`nota-tipo nota-${n.tipo}`}>{TIPOS.find((t) => t.id === n.tipo)?.nombre}</span>
                <span class="nota-fecha">{fechaCorta(n.fecha)}</span>
              </div>
              <p>{n.texto}</p>
              <div class="nota-acc">
                <label class="check">
                  <input type="checkbox" checked={!!n.revisada} onChange={() => setDiario(diario.value.map((x) => (x.id === n.id ? { ...x, revisada: !x.revisada } : x)))} />
                  Revisada
                </label>
                <button class="btn-icono" aria-label="Borrar nota" onClick={() => confirm('¿Borrar esta nota?') && setDiario(diario.value.filter((x) => x.id !== n.id))}>
                  <IcoPapelera size={18} />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section class="tarjeta">
        <h2 class="tarjeta-tit">Correcciones por ejercicio</h2>
        <p class="nota-pie">Se editan desde la ficha de cada ejercicio.</p>
        {correcciones.map((e) => (
          <button key={e.id} class="mini-fila" onClick={() => ir({ v: 'ejercicio', id: e.id })}>
            <span class="mini-txt"><strong>{e.corto}</strong><span>{notasEjercicio.value[e.id]}</span></span>
          </button>
        ))}
      </section>
    </div>
  );
}

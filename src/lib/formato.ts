const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_SEM = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const kg = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

export const hoyISO = () => isoLocal(new Date());
export function isoLocal(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export const desdeISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const fechaCorta = (s: string) => {
  const d = desdeISO(s);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
};
export const fechaLarga = (s: string) => {
  const d = desdeISO(s);
  const dia = DIAS_SEM[d.getDay()];
  return `${dia[0].toUpperCase()}${dia.slice(1)} ${d.getDate()} ${MESES[d.getMonth()]}`;
};
export const diaSemana = (s: string) => DIAS_SEM[desdeISO(s).getDay()];
export const diasEntre = (a: string, b: string) =>
  Math.round((desdeISO(b).getTime() - desdeISO(a).getTime()) / 86400000);

/** Lunes de la semana de una fecha (semana lunes-domingo). */
export function lunesDe(s: string): string {
  const d = desdeISO(s);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return isoLocal(d);
}
export function sumarDias(s: string, n: number): string {
  const d = desdeISO(s);
  d.setDate(d.getDate() + n);
  return isoLocal(d);
}
export const mmss = (seg: number) => {
  const s = Math.max(0, Math.round(seg));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

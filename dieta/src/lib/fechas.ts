// Fechas en hora local como 'YYYY-MM-DD' y horas como 'HH:MM'.

const pad = (n: number) => String(n).padStart(2, '0');

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const desdeISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const hoyISO = () => iso(new Date());

export const sumarDias = (s: string, n: number) => {
  const d = desdeISO(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** 0 = lunes … 6 = domingo */
export const diaSemana = (s: string) => (desdeISO(s).getDay() + 6) % 7;

export const lunesDe = (s: string) => sumarDias(s, -diaSemana(s));

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_CORTO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export const fechaCorta = (s: string) => {
  const d = desdeISO(s);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
};

export const fechaLarga = (s: string) => `${DIAS[diaSemana(s)]} ${fechaCorta(s)}`;

export const aMin = (h: string) => {
  const [a, b] = h.split(':').map(Number);
  return a * 60 + (b || 0);
};

export const aHora = (m: number) => {
  const t = Math.max(0, Math.min(23 * 60 + 59, Math.round(m / 5) * 5));
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
};

export const ahoraHora = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const diasEntre = (a: string, b: string) => Math.round((desdeISO(b).getTime() - desdeISO(a).getTime()) / 86400000);

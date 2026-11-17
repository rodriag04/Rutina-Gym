// Iconos de trazo, 24×24.
const I = ({ d, size = 22, sw = 1.8 }: { d: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
export const IcoDisco = (p: { size?: number }) => <I {...p} d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5M5.6 7.5a7.5 7.5 0 0 1 2-2" />;
export const IcoLista = (p: { size?: number }) => <I {...p} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />;
export const IcoGrafica = (p: { size?: number }) => <I {...p} d="M4 19V5M4 19h16M7 15l4-5 3 3 5-7" />;
export const IcoNota = (p: { size?: number }) => <I {...p} d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5" />;
export const IcoAjustes = (p: { size?: number }) => <I {...p} d="M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4" />;
export const IcoCheck = (p: { size?: number }) => <I {...p} sw={2.4} d="M5 12.5l4.5 4.5L19 7.5" />;
export const IcoMas = (p: { size?: number }) => <I {...p} sw={2.2} d="M12 5v14M5 12h14" />;
export const IcoMenos = (p: { size?: number }) => <I {...p} sw={2.2} d="M5 12h14" />;
export const IcoX = (p: { size?: number }) => <I {...p} sw={2} d="M6 6l12 12M18 6L6 18" />;
export const IcoAtras = (p: { size?: number }) => <I {...p} sw={2} d="M15 5l-7 7 7 7" />;
export const IcoDcha = (p: { size?: number }) => <I {...p} sw={2} d="M9 5l7 7-7 7" />;
export const IcoSube = (p: { size?: number }) => <I {...p} sw={2.2} d="M12 19V6M6 11l6-6 6 6" />;
export const IcoBaja = (p: { size?: number }) => <I {...p} sw={2.2} d="M12 5v13M6 13l6 6 6-6" />;
export const IcoIgual = (p: { size?: number }) => <I {...p} sw={2.2} d="M6 10h12M6 14h12" />;
export const IcoCompartir = (p: { size?: number }) => <I {...p} d="M12 3v12M8 7l4-4 4 4M5 12v7h14v-7" />;
export const IcoCopiar = (p: { size?: number }) => <I {...p} d="M9 9h10v11H9zM5 15V4h10" />;
export const IcoReloj = (p: { size?: number }) => <I {...p} d="M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18" />;
export const IcoAviso = (p: { size?: number }) => <I {...p} d="M12 4L2.5 20h19zM12 10v4M12 17h.01" />;
export const IcoInfo = (p: { size?: number }) => <I {...p} d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 11v5M12 8h.01" />;
export const IcoPapelera = (p: { size?: number }) => <I {...p} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />;
export const IcoLapiz = (p: { size?: number }) => <I {...p} d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />;
export const IcoVideo = (p: { size?: number }) => <I {...p} d="M4 6h11v12H4zM15 10l5-3v10l-5-3" />;
export const IcoDescarga = (p: { size?: number }) => <I {...p} d="M12 4v11M8 11l4 4 4-4M5 20h14" />;
export const IcoSubir = (p: { size?: number }) => <I {...p} d="M12 20V9M8 13l4-4 4 4M5 4h14" />;

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
export const IcoChat = (p: { size?: number }) => <I {...p} d="M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5" />;
export const IcoCamara = (p: { size?: number }) => <I {...p} d="M4 8h3l2-3h6l2 3h3v11H4zM12 10.5a3 3 0 1 0 0 6a3 3 0 1 0 0-6" />;
export const IcoEnviar = (p: { size?: number }) => <I {...p} sw={2.2} d="M12 19V5M6 11l6-6 6 6" />;

// Pestañas: contorno cuando no están activas, relleno cuando sí (los huecos toman el color de la píldora).
type Tab = { size?: number; relleno?: boolean };
const T = ({ size = 24, children }: { size?: number; children: preact.ComponentChildren }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
);
const LN = { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } as const;

export const TabEntrenar = ({ size, relleno }: Tab) => (
  <T size={size}>
    {relleno ? (
      <g fill="currentColor">
        <rect x="1.5" y="8.5" width="3.5" height="7" rx="1.2" />
        <rect x="5" y="5.5" width="4" height="13" rx="1.4" />
        <rect x="15" y="5.5" width="4" height="13" rx="1.4" />
        <rect x="19" y="8.5" width="3.5" height="7" rx="1.2" />
        <rect x="8.5" y="10.8" width="7" height="2.4" rx="1" />
      </g>
    ) : (
      <g {...LN}>
        <rect x="2" y="9" width="3" height="6" rx="1" />
        <rect x="5" y="6.5" width="3.5" height="11" rx="1.2" />
        <rect x="15.5" y="6.5" width="3.5" height="11" rx="1.2" />
        <rect x="19" y="9" width="3" height="6" rx="1" />
        <path d="M8.5 12h7" />
      </g>
    )}
  </T>
);

const BOCADILLO = 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.3A2.5 2.5 0 0 1 4 13.5z';
const CHISPA = 'M12 6.8l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z';
export const TabClaude = ({ size, relleno }: Tab) => (
  <T size={size}>
    {relleno ? (
      <>
        <path fill="currentColor" d={BOCADILLO} />
        <path class="hueco-f" d={CHISPA} />
      </>
    ) : (
      <>
        <path {...LN} d={BOCADILLO} />
        <path fill="currentColor" d={CHISPA} />
      </>
    )}
  </T>
);

export const TabHistorial = ({ size, relleno }: Tab) => (
  <T size={size}>
    {relleno ? (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="2.8" fill="currentColor" />
        <path d="M8 2.6v4M16 2.6v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path class="hueco-s" d="M3 10h18" stroke-width="1.6" />
        <g class="hueco-f">
          <circle cx="8" cy="14.5" r="1.2" />
          <circle cx="12" cy="14.5" r="1.2" />
          <circle cx="16" cy="14.5" r="1.2" />
        </g>
      </>
    ) : (
      <>
        <g {...LN}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </g>
        <g fill="currentColor">
          <circle cx="8" cy="14" r="1.1" />
          <circle cx="12" cy="14" r="1.1" />
          <circle cx="16" cy="14" r="1.1" />
        </g>
      </>
    )}
  </T>
);

export const TabProgreso = ({ size, relleno }: Tab) => (
  <T size={size}>
    {relleno ? (
      <g fill="currentColor">
        <rect x="3.5" y="12.5" width="5" height="8" rx="1.4" />
        <rect x="9.5" y="8.5" width="5" height="12" rx="1.4" />
        <rect x="15.5" y="3.5" width="5" height="17" rx="1.4" />
      </g>
    ) : (
      <g {...LN}>
        <rect x="4" y="13" width="4" height="7" rx="1" />
        <rect x="10" y="9" width="4" height="11" rx="1" />
        <rect x="16" y="4" width="4" height="16" rx="1" />
      </g>
    )}
  </T>
);

export const TabNotas = ({ size, relleno }: Tab) => (
  <T size={size}>
    {relleno ? (
      <>
        <path fill="currentColor" d="M5.5 2.5h8.8l5.2 5.2V21.5H5.5z" />
        <path class="hueco-s" d="M14 2.8v5.2h5.2M9 12.5h7M9 16.5h5" fill="none" stroke-width="1.6" stroke-linecap="round" />
      </>
    ) : (
      <g {...LN}>
        <path d="M6 3h8l5 5v13H6z" />
        <path d="M14 3v5h5M9 12.5h7M9 16.5h5" />
      </g>
    )}
  </T>
);

export const TabAjustes = ({ size, relleno }: Tab) => (
  <T size={size}>
    {relleno ? (
      <>
        <path d="M4 7h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="9" cy="7" r="3.2" fill="currentColor" />
        <circle cx="15" cy="17" r="3.2" fill="currentColor" />
      </>
    ) : (
      <g {...LN}>
        <path d="M4 7h16M4 17h16" />
        <circle class="hueco-f" cx="9" cy="7" r="2.6" />
        <circle class="hueco-f" cx="15" cy="17" r="2.6" />
      </g>
    )}
  </T>
);

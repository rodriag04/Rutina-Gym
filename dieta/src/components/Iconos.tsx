// Iconos de trazo (24×24, 1.8). Sin dependencias.
export type Icono = (props: { class?: string; style?: string }) => preact.JSX.Element;
const I = (d: string | string[], extra = {}): Icono => (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" {...extra} {...props}>
    {(Array.isArray(d) ? d : [d]).map((x) => (
      <path d={x} />
    ))}
  </svg>
);

export const IHoy = I(['M4 11.5 12 5l8 6.5', 'M6 10v9h12v-9', 'M10 19v-5h4v5']);
export const ISemana = I(['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4M16 3v4', 'M8 14h2M12 14h2M16 14h0', 'M8 17h2M12 17h2']);
export const ICompra = I(['M5 8h14l-1.2 11H6.2z', 'M9 8V6a3 3 0 0 1 6 0v2']);
export const IProgreso = I(['M4 19V5', 'M4 19h16', 'm7 14 4-4 3 3 5-6']);
export const IMas = I(['M5 12h.01M12 12h.01M19 12h.01'], { 'stroke-width': 3 });
export const ICheck = I('m5 12.5 4.5 4.5L19 7.5', { 'stroke-width': 2.6 });
export const ICerrar = I(['M6 6l12 12', 'M18 6 6 18'], { 'stroke-width': 2.2 });
export const IEnviar = I(['M5 12h13', 'm13 6 6 6-6 6'], { 'stroke-width': 2.2 });
export const IGym = I(['M3 10v4M6 8v8M18 8v8M21 10v4', 'M6 12h12']);
export const IBalon = I(['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'm12 7 3.5 2.6-1.3 4.2H9.8L8.5 9.6z', 'M12 3v4M15.5 9.6l4.6-1.4M14.2 13.8l2.8 4M9.8 13.8l-2.8 4M8.5 9.6 3.9 8.2']);
export const ICoche = I(['M5 16h14v-4l-2-5H7l-2 5z', 'M5 12h14', 'M7 16v2M17 16v2', 'M8 14h.01M16 14h.01']);
export const ICamara = I(['M4 8h3l2-2.5h6L17 8h3v11H4z', 'M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z']);
export const IAviso = I(['M12 4 3 20h18z', 'M12 10v4', 'M12 17h.01']);
export const IInfo = I(['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 11v6', 'M12 7.5h.01']);
export const ICambiar = I(['M4 8h13l-3-3', 'M20 16H7l3 3']);
export const ISaltar = I(['M5 5l14 14', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z']);
export const ILapiz = I(['M4 20h4L19 9l-4-4L4 16z', 'm13.5 6.5 4 4']);
export const IFlecha = I('m9 5 7 7-7 7');
export const IAtras = I('m15 5-7 7 7 7');
export const ICopo = I(['M12 3v18', 'M4.2 7.5l15.6 9', 'M19.8 7.5l-15.6 9', 'm9.5 4.5 2.5 2 2.5-2', 'm9.5 19.5 2.5-2 2.5 2']);
export const INevera = I(['M7 3h10v18H7z', 'M7 10h10', 'M10 6v2M10 13v3']);
export const IBascula = I(['M5 4h14l1 16H4z', 'M9 9a3 3 0 0 1 6 0', 'm12 9 1.5-1.5']);
export const IFuego = I(['M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z']);
export const IReloj = I(['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2']);
export const ILibro = I(['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z', 'M5 17a3 3 0 0 1 3-3h11']);
export const IAjustes = I(['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z']);
export const ICopia = I(['M12 4v11', 'm7 10 5 5 5-5', 'M5 20h14']);
export const ICopa = I(['M7 3h10l-1 7a4 4 0 0 1-8 0z', 'M12 14v6', 'M8 20h8']);
export const IHoja = I(['M5 19c0-8 5-14 14-14 0 9-6 14-14 14z', 'M5 19 13 11']);
export const INota = I(['M5 4h14v12l-4 4H5z', 'M15 20v-4h4', 'M9 9h6M9 13h4']);
export const IPesa = IGym;
export const ICompartir = I(['M12 3v12', 'm8 7 4-4 4 4', 'M6 11H5v9h14v-9h-1']);
export const IMas2 = I(['M12 5v14', 'M5 12h14'], { 'stroke-width': 2.2 });
export const IEstrella = I('m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z');
export const IChat = I(['M5 5h14v10H9l-4 4z', 'M9 9h6M9 12h4']);

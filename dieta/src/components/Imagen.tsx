import { useEffect, useState } from 'preact/hooks';
import { RECETA } from '../data/recetas';
import { db } from '../lib/db';
import { fotosReceta } from '../lib/estado';
import { Ilustracion } from './Plato';

const cache = new Map<string, string>();

export function useFoto(id?: string) {
  const [url, setUrl] = useState<string | undefined>(id ? cache.get(id) : undefined);
  useEffect(() => {
    if (!id) return setUrl(undefined);
    if (cache.has(id)) return setUrl(cache.get(id));
    let vivo = true;
    db.foto(id).then((b) => {
      if (!b || !vivo) return;
      const u = URL.createObjectURL(b);
      cache.set(id, u);
      setUrl(u);
    });
    return () => {
      vivo = false;
    };
  }, [id]);
  return url;
}

/** Foto propia (de la comida o de la receta) o la ilustración del plato. */
export function ImagenPlato({ receta, foto, alt }: { receta?: string; foto?: string; alt?: string }) {
  const propia = foto ?? (receta ? fotosReceta.value[receta] : undefined);
  const url = useFoto(propia);
  if (url) return <img src={url} alt={alt ?? ''} style="width:100%;height:100%;object-fit:cover;display:block" />;
  const r = receta ? RECETA[receta] : undefined;
  if (!r) return <Ilustracion dibujo="-" fondo="#E8E4D8" titulo={alt} />;
  return <Ilustracion dibujo={r.dibujo} fondo={r.fondo} titulo={alt ?? r.titulo} />;
}

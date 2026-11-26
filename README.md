# Rutina

App de entrenamiento. Funciona sin conexión, se instala en el móvil y guarda los datos en el propio móvil.

| Persona | Dirección |
|---|---|
| Rodrigo | https://rodriag04.github.io/Rutina-Gym/ |
| Rodrigo, dentro de Claude (con chat) | https://claude.ai/artifact/Wm2WCDVUiwi6SLovW7qAUy |
| Mari Carmen | https://rodriag04.github.io/Rutina-Gym/maricarmen/ |
| Comidas de Rodrigo (app aparte) | https://rodriag04.github.io/Rutina-Gym/dieta/ · ver `dieta/README.md` |

Cada persona tiene su propia app (rutina, textos, icono y datos aparte), compilada desde el mismo código con un perfil distinto: `src/perfiles/<id>/`.

## Qué hace

- **Entrenar**: elige el día que toca (el primero pendiente de la semana). Cada serie sale con el peso y las reps calculados. Un toque en el círculo = serie hecha con esas reps; luego ajustas con − / +. Arranca el descanso del ejercicio con pitido al acabar.
- **Variante de cada ejercicio**: debajo de las series, *↔ Variante* cambia el ejercicio por otro que trabaja lo mismo en otra máquina (p. ej. press inclinado en máquina si no hay banco). La primera vez el peso sale del ejercicio de la rutina (1RM estimado × factor) o de otro ejercicio tuyo del mismo músculo; luego, de su propio historial. Sus series se guardan con la marca *hecho en su lugar* y no tocan la progresión del ejercicio de la rutina.
- **Progresión automática** con tus reglas (ver Ajustes → Cómo calcula los pesos). Solo compara con sesiones del mismo gimnasio.
- **Avisos**: ejercicios que te saltas, semana de descarga, regla de los presses del lunes, medidas del 26 nov, copia de seguridad.
- **Ficha de cada ejercicio**: figura animada con el tempo, mapa muscular (grupo y parte), técnica en una frase, claves, error típico, tus correcciones, gráfica de 1RM estimado e historial. Enlace a vídeos reales de YouTube cuando hay conexión.
- **Historial** por semanas, con huecos (días sin guardar), edición y borrado. Confirmación del gimnasio de las sesiones importadas.
- **Progreso**: press inclinado, brazos, series directas por semana y medidas (peso, brazo, cintura).
- **Notas**: sensaciones, correcciones y molestias. Botón *Copiar informe* que junta las 2 últimas semanas para pegarlo en Claude.
- **Exportar**: copia JSON (se puede volver a importar) y CSV. Resumen de la sesión por WhatsApp.

## Versión dentro de Claude

La misma app publicada como artifact de Claude: https://claude.ai/artifact/Wm2WCDVUiwi6SLovW7qAUy (privada). Añade la pestaña **Claude**: le cuentas lo que cambia ("el jalón estaba ocupado, he hecho dominadas: 9, 8, 8") y lo aplica con herramientas de la app: cambiar un ejercicio por su variante u otra máquina, apuntar series, notas, gimnasio, medidas, diario y empezar otro día. Funciona en la sesión en curso y en sesiones ya guardadas (con fecha). Cada respuesta con cambios tiene *Deshacer*.

- Necesita conexión. Los datos viven en la base de datos del artifact (solo tú puedes leerla), no en el iPhone: son independientes de la app instalada. Para pasar tus sesiones, en la app del iPhone Ajustes → Copia JSON, y en la de Claude Ajustes → Importar.
- Código: `src/main-claude.tsx`, `src/lib/nube.ts` (almacén), `src/lib/asistente.ts` (instrucciones y herramientas), `src/views/Chat.tsx`. Compilar: `npm run build:claude-gym` → `dist-claude-gym/rutina-de-rodrigo.html`, que se publica en esa misma dirección. En local: `npm run dev:claude-gym` y abrir `/claude.html` (sin Claude, el chat avisa de que no está disponible).

**Acceso con icono propio en el iPhone.** Claude dibuja él mismo el icono de los accesos a sus artifacts. Para tener el nuestro: abrir en Safari https://rodriag04.github.io/Rutina-Gym/ir/rutina.html (o `ir/dieta.html`) → Compartir → Añadir a pantalla de inicio. La página guarda la dirección con `?abrir` y, al tocar el icono, salta a la app de Claude. Código: `public/ir/`.

## Primer arranque

Importa `datos/sesiones.json` (13 sesiones, 244 series) y lo comprueba. El resultado sale en Ajustes → Datos.

## Instalar en el iPhone

Dirección: **https://rodriag04.github.io/Rutina-Gym/**

1. Ábrela en **Safari** (desde Chrome en iPhone no se instala igual). En Android: Chrome → menú ⋮ → **Instalar aplicación**.
2. Compartir → **Añadir a pantalla de inicio**.
3. Ábrela desde el icono. A partir de ahí funciona sin conexión.

Los datos viven en ese iPhone. Haz una copia JSON de vez en cuando (la app avisa).

## Desplegar

Cada push a la rama principal se publica solo en GitHub Pages (`.github/workflows/publicar.yml`): pasa los tests, compila las dos apps (`npm run build:pages`) y sube `dist/` a la rama `gh-pages`. La app avisa dentro cuando hay versión nueva.

Si algún día prefieres Netlify o Vercel, la configuración ya está en `netlify.toml` y `vercel.json` (comando `npm run build`, carpeta `dist`). Cambiar de dirección es cambiar de almacén: antes exporta la copia JSON y luego impórtala.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173  (lab.html: todas las figuras animadas)
npm run dev:maricarmen   # la app de Mari Carmen
npm test         # motor de progresión, importación y avisos
npm run build    # comprueba tipos y genera dist/ con el service worker
npm run iconos   # regenera los PNG de public/iconos (necesita Playwright); para otra persona: node scripts/iconos.mjs iconos/maricarmen
```

## Estructura

```
datos/                 historial original (JSON y CSV)
src/perfiles/<id>/     rutina de cada persona (ejercicios, días, textos, reglas) y su app.json
src/data/rutina.ts     acceso a la rutina del perfil compilado
src/data/musculos.ts   grupos y partes de cada músculo
src/lib/progresion.ts  cálculo de peso y reps
src/lib/variantes.ts   variante de cada ejercicio y su peso
src/lib/analisis.ts    avisos, descarga, saltos, series semanales
src/lib/estado.ts      estado de la app e importación
src/lib/db.ts          IndexedDB (o la nube de Claude, src/lib/nube.ts)
src/lib/asistente.ts   chat de la versión de Claude
src/components/        figuras animadas, mapa muscular, gráficas, descanso
src/views/             pantallas
tests/                 pruebas
```

Los ids de ejercicio (`lun-1`, `jue-3a`…) no cambian nunca: el historial depende de ellos.

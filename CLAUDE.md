# Contexto para Claude Code: app de gimnasio de Rodrigo

Exportado el 17 nov 2026 desde el proyecto "Rutina Gym" de Claude. Ese proyecto sigue activo en paralelo.

## Estado del repositorio (17 nov 2026)

- App nueva: PWA con Vite + Preact + TypeScript, sin backend. Datos en IndexedDB del móvil (copia mínima en localStorage). Ver `README.md`.
- Comandos: `npm run dev`, `npm test` (motor de progresión e importación), `npm run build` (sale en `dist/`). `lab.html` en dev muestra todas las figuras animadas.
- Código: `src/data/rutina.ts` (ejercicios, días, músculos, técnica, cambios), `src/data/musculos.ts`, `src/lib/progresion.ts` (reglas de peso y reps), `src/lib/analisis.ts` (avisos, descarga, saltos, series semanales), `src/components/animaciones.tsx` (figuras), `src/components/MapaMuscular.tsx`.
- Del paquete original solo llegó este archivo. `app-actual/`, `imagenes/`, `memoria-proyecto/`, `rutina/` y `datos/plan-*.json` no están. `datos/sesiones.json` y `datos/series.csv` se reconstruyeron desde el historial de abajo (13 sesiones, 244 series; lo comprueban los tests y la app al importar).
- Gimnasio en las sesiones importadas: 29 oct y 2 nov = otro; 3 nov = sin confirmar (null); el resto = Sevilla sin confirmar. La app pide confirmarlo en Historial.

## Quién soy

- Rodrigo, 21 años, 1,81 m, 72 kg (1 oct 2026). Estudio Marketing y Publicidad (grado superior) en Sevilla; vivo en Cabra (Córdoba).
- Casi 3 años entrenando. Gimnasio principal: Basic-Fit Sevilla. A veces entreno en otro gimnasio (ver "Gimnasios").
- Objetivo: ganar músculo y fuerza. Punto débil y prioridad: brazos.
- 4 días por semana (lunes, martes, jueves, domingo), unos 1h15 por sesión.
- Uso iPhone. Comparto cosas por WhatsApp.

## Cómo quiero que me hables

- Español de España, frases cortas, al grano.
- Si te pido una decisión, dame una sola recomendación, no tres opciones.
- Datos concretos antes que adjetivos. Nada de lenguaje de anuncio.
- Actúa como entrenador con experiencia sin esperar a que pregunte: revisa orden, fatiga y músculos sin trabajar. Cambia lo que mejore la rutina y explica el motivo en una línea. Deja igual lo que ya esté bien.

## Reglas fijas (no cambiar sin preguntarme)

- Press inclinado con mancuernas y jalón al pecho se quedan siempre (me encantan).
- Press de banca: solo en máquina, plano.
- Sin sentadillas ni peso muerto. Tampoco hiperextensiones (bisagra de cadera = mismo veto).
- Muñeca izquierda regular: con muñequera va bien. No condicionar mucho la rutina por ella.
- La alimentación la llevo en otro proyecto. No va aquí. La grasa de la barriga es cosa de la dieta.
- Si la rutina cambia, mantener los ids de ejercicio (`lun-1`, `jue-3a`...) o el historial deja de casar.

## Rutina vigente

Detalle completo (series, reps, descanso, RIR, músculos, técnica en una frase): `datos/rutina.json` y `rutina/rutina-octubre-2026.md`.
RIR = repeticiones en recámara. "a/b" = superserie.

- **Lunes (pecho, hombro, tríceps, ~65 min)**: 1 press inclinado mancuernas 4×6-10 · 2 press plano máquina 3×6-10 · 3 aperturas máquina 3×12-15 · 4 laterales mancuerna 4×12-15 · 5 extensión trasnuca polea cuerda 3×10-15 · 6 extensión polea alta 3×10-15.
- **Martes (espalda, bíceps, ~62 min)**: 1 jalón ancho 4×6-10 · 2 remo polea baja agarre estrecho (V) 3×8-12 · 3 remo máquina apoyo pecho agarre abierto 3×8-12 · 4 pullover polea alta 3×12-15 · 5 curl inclinado mancuernas 3×8-12 (2 RIR) · 6 curl martillo 3×8-12 (2 RIR). Face pull (`mar-7`) retirado el 17 nov.
- **Jueves (brazos, hombro, ~60 min)**: 1 curl predicador barra Z 4×8-12 · 2 fondos máquina 4×6-10 · 3a curl bayesiano polea 3×10-15 + 3b extensión a un brazo por encima de la cabeza 3×10-15 · 4a laterales polea 4×12-15 + 4b aperturas invertidas (pájaros) 4×12-15. Sin press militar (quitado a propósito). Femoral del jueves (`jue-5`) retirado el 17 nov.
- **Domingo (pierna, brazo, ~62 min)**: 1a curl polea baja barra Z 3×10-15 + 1b extensión polea alta barra V 3×12-15 (2 RIR, nunca al fallo) · 2a prensa 4×8-12 + 2b gemelos en la prensa 4×10-15 (`dom-6a`) · 3 femoral sentado 4×10-12 · 4 extensión cuádriceps 3×12-15 · 5a aductores (cerrar) 3×10-15 (`dom-5`) + 5b abductores (abrir) 3×12-15 (`dom-6b`).
- **Alt (sustituto del domingo sin pierna, por partido)**: 1 dominadas 4×6-10 (kg = lastre) · 2 remo en polea baja con barra agarre supino 4×6-10 (antes remo con barra de pie) · 3 press militar mancuernas sentado 3×8-12 (2 RIR) · 4a curl alterno de pie 3×8-12 + 4b press francés barra Z 3×8-12 (2 RIR). No cuenta en las series semanales.
- Series directas por semana: bíceps 16, tríceps 16, pecho 10, dorsal 10, espalda alta 6, lateral 8, posterior 7, cuádriceps 7, isquios 4, gemelo 4.
- Los ids no cambian aunque cambie el orden: la app calcula las etiquetas (1, 2a, 2b…) del orden real.

Decisiones ya tomadas (no volver a discutir):
- Remo del martes: polea baja con agarre estrecho (27 oct). Si está ocupada, la máquina del ejercicio 3 con las asas verticales.
- Aductores y abductores sustituyen a hip thrust y crunch (los cambié yo el 1 nov; el glúteo mayor ya va en la prensa).
- No se añade press inclinado al jueves (revisado el 16 nov: ya progreso).

Cambios del 17 nov (app nueva, hechos como entrenador; motivo en una línea):
- Face pull fuera: 0 de 4 martes. Pájaros del jueves 3 → 4 series (van en superserie con 4 de laterales: no añade tiempo).
- Femoral del jueves fuera: 0 de 3 jueves. El domingo ya tiene 4 series.
- Gemelos a la prensa, justo después de cada serie: nunca se apuntaban al final del domingo.
- Aductores + abductores en superserie: ahorra ~5 min; el 8 nov se saltaron.
- Alt: remo con barra de pie → polea baja supino (la bisagra cargada está vetada).
- Ejercicios a 2 RIR sin botón de bajada (martillo y curl inclinado acababan con bajadas).
- Progresión: subir exige 1.ª serie en el máximo y 2.ª a 1; si el siguiente peso es un salto grande y no llegarías al mínimo, antes se suben reps hasta máximo+3. Las series de prueba con más peso cuentan (convertidas con Epley); las de menos peso se ignoran.
- Descarga: "perder reps" = mismo peso y 2 reps menos en total, o 1RM estimado un 6 % peor si cambió el peso.

## Reglas de progresión (las que usa la app actual)

- Calentamiento: 5 min de bici o elíptica + series de aproximación en el primer ejercicio pesado. Los calentamientos NO se apuntan.
- Series rectas: un solo peso para todas. Si llegas al máximo del rango, sube el salto mínimo (mancuernas +2 kg, prensa +5, resto +2,5 o el siguiente escalón de la máquina) y vuelve a reps mínimo a mínimo+2. Si quedas 3 o más por debajo del mínimo, baja un salto. Si no, mismo peso y busca una rep más.
- Para calcular, se ignoran las series con menos del 75 % del peso máximo del ejercicio (son calentamientos). Las reps de la "bajada" (drop set) no cuentan.
- La app sube al siguiente escalón que exista (Ajustes → Escalones). Mancuernas: 2, 4, 6, 6,5, 8, 9, 10, 11,5, 12, 14… Poleas Sevilla: pila de 10 lb (~4,5 kg) + placa de 2,3.
- **Press inclinado (lun-1)**: 1ª serie pesada (T), 2ª = T si la 1ª hizo 8 o más (si no, T−2), 3ª y 4ª = T−2. La 1ª sube +2 al llegar a 10 limpias. 3 min de descanso. Calentar 14×10, 20×4, 24×2. Subo las mancuernas con las rodillas (me cuesta colocarlas; si puedo, me ayuda un compañero). Solo cuentan reps con técnica limpia.
- Historia del press inclinado: estancado en 26 kg desde febrero 2026. 5 nov hizo 26×10 → el 9 nov subió a 28 (28×7) → 16 nov 28×8.
- Descarga solo si en 2 sesiones seguidas pierdo reps en 2 o más ejercicios: semana suave, mismos pesos, la mitad de series, nada al fallo.
- Si dos lunes seguidos bajo en los presses, quitar el tríceps del domingo.
- Poleas y máquinas de mi Basic-Fit van en escalones de ~4,5 kg (32, 36, 41, 45, 50, 54,5, 59, 64, 68, 73), a veces con placa extra de ~2,3 (34,5, 61,5).
- Próxima revisión con medidas: 26 nov 2026 (brazo contraído, cintura a la altura del ombligo, peso en ayunas).

## Gimnasios

- Mis pesos en poleas y máquinas no son comparables entre gimnasios.
- 12 nov (jueves): Sevilla, seguro.
- 29 oct (jueves): otro gimnasio (fondos 64, predicador 36, laterales 9).
- 2 nov: otro gimnasio (nota: el pullover "seguro mal").
- 3 nov (jueves): dudoso. La nota de ese día dice "otro gym", pero luego dije que los pesos de los jueves 3 y 12 (fondos 50, predicador 35, bayesiano 20-25, laterales polea 15, pájaros 40-45) eran de Sevilla. Por confirmar.
- La app nueva debería guardar el gimnasio en cada sesión.

## Mis registros (lo más importante)

Archivos:
- `datos/sesiones.json`: las 13 sesiones tal cual estaban guardadas en la base de datos de la app, con notas.
- `datos/series.csv`: lo mismo en una fila por serie (244 series). Columnas: fecha, dia, ejercicio_id, ejercicio, serie, kg, reps, bajada_kg, bajada_reps, notas_sesion.
- `datos/plan-9nov.json` y `datos/plan-16nov.json`: pesos y reps objetivo por serie de esas semanas.

Formato de cada sesión: `{fecha, dia, notas, guardado, ex: {"lun-1": [{kg, reps, drop?: {kg, reps}}]}}`. `dia` es la rutina que hice, `fecha` el día real (el 2 nov, lunes, hice la rutina del martes; el 5 nov, jueves, la del lunes).

Sesiones: 26 oct (lun), 27 oct (mar), 29 oct (jue), 1 nov (dom), 2 nov (mar), 3 nov (jue), 5 nov (lun), 8 nov (dom), 9 nov (lun), 11 nov (mar), 12 nov (jue), 16 nov (lun), 17 nov (mar).

Huecos conocidos:
- Domingo 15 nov: no se guardó.
- Nunca apuntados: face pull (mar-7), curl femoral del jueves (jue-5), gemelos (dom-6a), todo el día Alt.
- Dominadas del 8 nov solo en notas: 8, 6 y 7 con mi peso (antes no hacía ninguna).
- 29 oct: predicador 9×12 y fondos 45×12 son calentamientos que apunté como series.

Historial por ejercicio (kg×reps; "+" = bajada):

### Lunes
- **lun-1 Press inclinado con mancuernas**: 10-26: 26×9, 26×7, 24×10 · 11-05: 26×10, 26×8, 24×9, 24×8 · 11-09: 28×7, 26×9, 24×10, 24×9 · 11-16: 28×8, 26×10, 26×8, 24×10
- **lun-2 Press plano en máquina**: 10-26: 52×11, 48×8, 45×11 · 11-05: 54,5×7, 54,5×7, 54,5×6 · 11-09: 54,5×9, 54,5×8, 54,5×6 · 11-16: 54,5×10, 54,5×8, 54,5×7
- **lun-3 Aperturas en máquina**: 10-26: 59×10, 59×9, 57×12 · 11-05: 59×12, 59×10, 52×10 · 11-09: 59×12, 59×10, 59×7+52×3 · 11-16: 59×12, 59×11, 59×8+52×3
- **lun-4 Elevaciones laterales con mancuerna**: 10-26: 9×12, 9×14, 9×10+6,5×4 · 11-05: 9×15, 9×14, 9×13, 9×12 · 11-16: 9×15, 11,5×12, 11,5×11
- **lun-5 Extensión trasnuca en polea con cuerda**: 10-26: 32×12, 32×12, 32×10 · 11-05: 32×7+27×5, 27×13, 27×12 · 11-09: 32×11, 32×5+27×5, 27×12 · 11-16: 27×11, 27×12, 27×12
- **lun-6 Extensión de tríceps en polea alta**: 10-26: 41×11, 34×12, 32×14 · 11-05: 36×11, 36×7+32×4, 32×11 · 11-09: 36×11, 36×11, 34,5×13 · 11-16: 36×8+32×4, 34,5×11, 34,5×11+32×3

### Martes
- **mar-1 Jalón al pecho agarre ancho**: 10-27: 60×12, 70×8, 65×9+60×3 · 11-02: 66×9, 66×7, 59×10, 59×9 · 11-11: 70×6, 66×8, 66×7, 61,5×9 · 11-17: 66×9, 66×8, 66×7, 66×7
- **mar-2 Remo en polea baja con agarre estrecho**: 10-27: 55×10, 55×10 · 11-02: 54,5×11, 54,5×10, 54,5×9 · 11-11: 54,5×12, 54,5×11, 54,5×10 · 11-17: 59×11, 59×10, 59×10
- **mar-3 Remo en máquina con apoyo en el pecho, agarre abierto**: 10-27: 40×10, 45×10, 45×12 · 11-02: 45×10, 45×12, 52×11 · 11-11: 50×10, 50×10, 50×10 · 11-17: 50×11, 50×10, 50×10
- **mar-4 Pullover en polea alta**: 10-27: 65×12, 70×10, 63×11 · 11-02: 45×12, 45×10, 45×11 · 11-11: 45×12, 50×7, 45×9 · 11-17: 45×12, 45×11, 45×9
- **mar-5 Curl en banco inclinado con mancuernas**: 10-27: 12×11, 12×9, 12×10 · 11-02: 12×11, 12×9+10×2, 12×6+10×4 · 11-11: 12×12, 12×9, 12×7 · 11-17: 12×10, 12×9, 12×8
- **mar-6 Curl martillo**: 10-27: 12×9, 12×9+10×5, 12×6+10×8 · 11-02: 12×6+10×4, 10×12, 10×12 · 11-11: 12×7+10×4, 12×6+10×4, 12×7+10×3 · 11-17: 10×12, 10×12, 10×11
- **mar-7 Face pull en polea con cuerda**: sin registros

### Jueves
- **jue-1 Curl predicador con barra Z**: 10-29: 9×12, 32×12, 36×10, 32×11 · 11-03: 35×11, 35×6+30×4, 35×4+30×4 · 11-12: 35×12, 35×10, 35×9
- **jue-2 Fondos en máquina para tríceps**: 10-29: 45×12, 59×12, 64×11, 64×10 · 11-03: 45×14, 50×9, 50×8, 45×12 · 11-12: 50×12, 50×10, 45×10
- **jue-3a Curl bayesiano en polea**: 10-29: 14×14, 14×13 · 11-03: 25×12, 25×10, 20×13 · 11-12: 25×10, 20×14, 20×13
- **jue-3b Extensión de tríceps a un brazo por encima de la cabeza**: 10-29: 32×12, 32×15, 32×13 · 11-03: 55×12, 60×12, 60×11 · 11-12: 60×12, 55×12, 55×11
- **jue-4a Elevaciones laterales en polea**: 10-29: 9×14, 9×12, 9×9+7×6, 7×14 · 11-03: 15×8+10×7, 10×15, 10×15 · 11-12: 15×15, 15×14, 15×13
- **jue-4b Aperturas invertidas en máquina**: 10-29: 45×12, 45×12, 39×13 · 11-03: 40×9, 40×10+35×2, 35×9+30×4 · 11-12: 45×11, 40×10, 40×7+35×4
- **jue-5 Curl femoral sentado**: sin registros

### Domingo
- **dom-1a Curl en polea baja con barra Z**: 11-01: 36×7+32×5, 32×13, 32×11+27×1 · 11-08: 34,5×12, 34,5×11, 34,5×10
- **dom-1b Extensión de tríceps en polea alta con barra en V**: 11-01: 32×15, 36×13, 32×13 · 11-08: 36×14, 41×15, 41×14
- **dom-2 Prensa de piernas**: 11-01: 66×12, 73×11, 66×11, 66×10 · 11-08: 66×12, 73×8, 66×11, 66×10
- **dom-3 Curl femoral sentado**: 11-01: 52×12, 59×12, 59×10, 52×11 · 11-08: 61,5×12, 61,5×11, 61,5×10, 61,5×10
- **dom-4 Extensión de cuádriceps**: 11-01: 39×12, 39×13, 39×12 · 11-08: 39×14, 39×13, 39×12
- **dom-5 Aductores en máquina (cerrar piernas)**: 11-01: 45×13, 45×12, 45×11
- **dom-6a Gemelos de pie en máquina**: sin registros
- **dom-6b Abductores en máquina (abrir piernas)**: 11-01: 45×15, 52×12, 52×12

### Alternativo
- **alt-1 Dominadas**: sin registros
- **alt-2 Remo con barra agarre supino**: sin registros
- **alt-3 Press militar con mancuernas sentado**: sin registros
- **alt-4a Curl alterno con mancuernas de pie**: sin registros
- **alt-4b Press francés con barra Z**: sin registros

Notas que dejé al guardar:
- 2 nov: hago espalda el lunes porque prefiero que en el press inclinado me ayude mi compañero a subir las mancuernas.
- 3 nov: fondos ocupados, hice extensión de tríceps con cuerda. Trasnuca a dos manos.
- 5 y 16 nov: llego muy fatigado al tríceps del lunes (el 5 nov había hecho brazo 48 h antes; el 16, el lunes anterior no hice hombro).
- 9 nov: no hice laterales.
- 12 nov: trasnuca con agarre a dos manos. En el gym de Sevilla.

## Plan de esta semana (16-22 nov), lo que falta

- Jueves: predicador 35 × 12/11/10/10 · fondos 55 × 8/8/7/7 · bayesiano 20 × 15/14/13 · extensión por encima 60 × 12/11/10 · laterales polea 15 × 15/15/14/13 · pájaros 40 × 12/11/10 · femoral ~50 kg × 12/11/10 (apuntarlo).
- Domingo: curl polea Z 34,5 × 13/12/11 · extensión V 45 × 13/12/12 · prensa 73 × 10/9/9/8 · femoral 64 × 11/10/10/10 · extensión cuádriceps 39 × 15/14/13 · aductores 45 × 14/13/12 · gemelos (elegir peso para 12-15) · abductores 52 × 13/12/12.
- Martes 17 nov ya hecho: jalón 66 (9,8,7,7), remo 59 (11,10,10), remo máquina 50 (11,10,10), pullover 45 (12,11,9), curl inclinado 12 (10,9,8), martillo 10 (12,12,11). Face pull otra vez sin hacer.

Patrones a vigilar: hago series en pirámide, apunto calentamientos, me dejo series y el último ejercicio del día (face pull, femoral del jueves, gemelos). En el martillo y el curl inclinado acabo con bajadas aunque tocan a 2 RIR.

## La app actual (punto de partida)

- Página de una sola pieza: `app-actual/pagina/rutina-rodrigo.html` (HTML + CSS + JS sin frameworks). Pestañas por día con colores de discos (rojo, azul, amarillo, verde, violeta), mapa de músculos que se ilumina al tocar un ejercicio, técnica en una frase, dibujos de inicio/final en el día Alt, tabla "Hoy toca" con peso y reps por serie, registro por serie (tocar el número = hecha con las reps objetivo; +/−; botón ↓ para bajada), "Guardar sesión" con fecha y notas, botones "Enviar por WhatsApp" y "Copiar", marcas de récord/↑/↓ por volumen, tabla de series por semana.
- Guarda en una base de datos del Artifact de Claude (colección `sesiones`) con copia en localStorage. En la app nueva habrá que cambiar eso por una base de datos propia e importar `datos/sesiones.json`.
- La lógica de progresión está en el propio HTML (funciones `exId`, `range`, `incOf`, `planFor`...).
- `app-actual/fuente/`: todos los scripts que generan la página, el PDF, las imágenes de WhatsApp y la guía de técnica (Node + Playwright). `fuente/tecnica/`: motor de dibujo de las figuras.
- `app-actual/app-pwa/`: versión instalable sin conexión (index + manifest + sw.js + iconos).
- `imagenes/tecnica/`: 19 imágenes de técnica (dibujo inicio/final, músculo en naranja, claves, error típico). `imagenes/whatsapp/`: rutina por días y pesos de las semanas 9 y 16 nov.
- `memoria-proyecto/`: las notas que Claude guardó en el proyecto, por si falta algún detalle.

## Lo que quiero de la app nueva

- Más profesional, instalable en el iPhone (PWA) y que funcione sin entrar en Claude y sin conexión en el gimnasio.
- Que no se pierda nada: importar todo el historial de `datos/` el primer día y comprobar que salen las 13 sesiones y 244 series.
- Apuntar en pocos toques (me da pereza apuntar): peso ya relleno con lo que toca, un toque = serie hecha.
- Que me diga el peso y las reps del próximo día con las reglas de arriba, y avise si me salto ejercicios o series.
- Gráficas de progreso por ejercicio, sobre todo press inclinado y brazos.
- Campo de gimnasio en cada sesión (Sevilla u otro).
- Mantener la técnica en una frase y los músculos de cada ejercicio.
- Exportar a JSON/CSV y compartir el resumen por WhatsApp.
- Despliegue en Netlify o Vercel desde GitHub.

## Fuera de este paquete

- Jose Navarro, mi compañero de piso, tiene su propia rutina de 3 días y su app en el proyecto "Rutina Gym". No va aquí.
- Alimentación: en otro proyecto.

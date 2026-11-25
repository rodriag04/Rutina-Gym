# Comidas · Rodri

App de comidas de Rodri: plan de lunes a viernes al mediodía, recetas con foto y preparación, registro de lo que come, lista de la compra, congelador y progreso. Funciona sin conexión y guarda los datos en el iPhone.

Dirección: **https://rodriag04.github.io/Rutina-Gym/dieta/**

Es una app aparte de la rutina (la dieta no va dentro de la app del gym). Comparte repositorio y despliegue.

## Instalar en el iPhone

1. Abre la dirección en **Safari**.
2. Compartir → **Añadir a pantalla de inicio** → Añadir.
3. Ábrela desde el icono verde. Desde ahí funciona sin conexión.

Si al abrir la dirección te sale la rutina: cierra la pestaña de Safari y vuelve a abrirla (la rutina tenía guardada una versión antigua).

## Qué hace

- **Hoy**: el día en una línea de tiempo (gym, comidas, tareas del congelador). Anillo de kcal y barra de proteína. Un toque en el círculo = comida hecha.
- **Comí otra cosa**: foto opcional + lo que comiste (del plan con más o menos ración, comida fuera, otro plato del recetario o los números). El resto del día se reajusta solo.
- **Con Claude, sin API**: la app copia unas instrucciones (horario de la semana, kcal, recetas y alimentos), Rodri las pega en su Claude con una foto y pega de vuelta el bloque JSON que responde (`"rodri":1`). Foto de la compra o de la nevera → semana montada con lo que tiene (Semana → "Semana con Claude"); puede traer recetas y alimentos nuevos, que se guardan en el móvil. Foto de un plato → kcal y proteína (Comí otra cosa → Números, o pegándolo en Cuéntame). La app valida el código y ajusta las cantidades con su motor. Código: `src/lib/claude.ts`.
- **Cuéntame**: notas en texto libre que cambian el plan: "gym a las 17:30", "mañana entreno a las 10 y media", "ceno fuera", "partido a las 21", "sin táper", "me voy a Cabra el jueves", "peso 71,8", "cintura 82", "no he merendado".
- **Semana**: días L-V y finde. Gym, fútbol, desayuno en casa, comida/cena fuera, táper y Cabra por día. Cambiar plato solo ofrece los que cumplen las reglas.
- **Generador**: táper sí/no, Cabra el viernes, lunes festivo, horario de cada día y lo que hay en casa.
- **Compra**: lista agrupada y marcable, envases de Mercadona, lo que hace falta el lunes antes de comprar y agenda del congelador.
- **Progreso**: peso (mar, jue, sáb) con media semanal sin lunes, cintura cada 2 semanas y ajuste de ±150 kcal según las reglas.
- **Más**: fin de semana (regla del plato y calculadora de copas), airfryer, recetario (42 platos + la verdura base), notas, tabla de alimentos editable, cómo se calcula, copia de seguridad (Archivos → iCloud Drive) y ajustes.

## Reglas del plan (las que aplica el código)

- Objetivo: gym 2.325 kcal, descanso 2.125 kcal, proteína 160 g. Fútbol: +250 kcal de hidratos en la comida de después.
- Kcal y proteína calculadas con `src/data/alimentos.ts` (etiquetas de Mercadona/Hacendado y BEDCA). Nunca a ojo.
- Sin repetir proteína principal en el día (desayuno, comida y cena), ni el mismo plato en comida y cena, ni dos días seguidos. Un pescado al día como mucho.
- Horario: plátano 30-45 min antes del gym de mañana y bocadillo al salir (nunca batido si vuelve a clase). Gym de tarde: la comida es el pre-entreno y la merienda el post. Más hidratos pegados al entreno; cenas con tope.
- Lunes: táper de su madre (si lo hay) y desayuno de embutido que aguanta; si no hay táper, comida de despensa. Compra al salir del gym.
- Lo fresco que se come del miércoles en adelante se congela el lunes y se pasa a la nevera la noche antes.
- Viernes: si se va a Cabra, el plan acaba en la comida; la tarde cuenta como presupuesto (regla del plato). Si no, cena de despensa.
- Ajustes: si en 3 semanas la cintura no baja → −150 kcal los días de descanso. Si baja más de 0,5 kg/semana o pierde fuerza → +150 kcal los días de gym.

## De dónde salen los datos

- `origen/`: los archivos del proyecto "Dieta Rodrigo" (tabla de alimentos, 38 recetas y el plan del 16-20 nov), tal cual llegaron.
- `src/data/alimentos.ts`: kcal y proteína de `origen/alimentos.json` pasadas a valores por 100 g. Hidratos y grasa añadidos de etiquetas de Mercadona/BEDCA (solo para mostrar).
- `src/data/recetas.ts`: las recetas de `origen/recetas.json` con sus pasos y trucos, y las cantidades de su plan. Se quitan las líneas tipo "el martes por la noche, pasa…": eso lo pone la agenda del congelador. Se añaden 4 de variedad (revuelto con jamón, tostadas con huevo, arroz salteado y tostada con yogur).
- Los tests (`tests/dieta`) comprueban que 18 platos de su plan dan las mismas kcal y proteína que entonces.

## Código

```
dieta/src/data/       alimentos, recetas (42), comidas fuera
dieta/src/lib/        horario (comidas alrededor del gym), plan (cuadra el día), generador, compra y congelador, notas (texto libre), progreso, estado, IndexedDB
dieta/src/components/ ilustraciones de los platos (Plato.tsx), anillo, hoja, iconos
dieta/src/views/      Hoy, Semana, Compra, Progreso, Más, Receta, Registrar, Cambiar, Generador, Finde
tests/dieta/          generador, horario, reajuste, compra, notas, progreso
```

```bash
npm run dev:dieta     # http://localhost:5173 (lab.html: todas las ilustraciones)
npm test              # incluye tests/dieta
npm run build:pages   # rutina + Mari Carmen + comidas, como en GitHub Pages
npm run iconos:dieta  # regenera los PNG del icono
```

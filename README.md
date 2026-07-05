# Su Majestad

**Versión actual:** `v0.6.4`

`Su Majestad` es un roguelike de gestión de reino para móvil y escritorio, creado con HTML, CSS y JavaScript puro. La partida dura 30 días y cada jornada presenta asuntos del consejo que pueden cambiar recursos, abrir conflictos, recordar personajes o provocar consecuencias futuras.

No requiere dependencias, instalación ni paso de build. Está pensado para funcionar directamente como sitio estático y mantener compatibilidad con GitHub Pages.

## Qué es el juego

Eres la corona de un reino en crisis. Debes mantener el equilibrio entre:

- Oro
- Comida
- Ejército
- Pueblo
- Nobleza
- Fe
- Corona
- Amenaza

El objetivo no es solo optimizar barras: tus decisiones dejan memoria narrativa mediante etiquetas, personajes recurrentes, eventos diferidos e issues activos.

## Cómo jugar

1. Abre `index.html` en un navegador móvil o de escritorio.
2. Desde el menú principal, continúa una partida guardada o crea un nuevo reinado.
3. En nueva partida, elige 1 rasgo común del monarca, 1 ambición entre 3 opciones aleatorias y 1 religión inicial del reino.
4. Al comenzar el día 10 y el día 20, elige una evolución relacionada para ampliar la cadena de rasgos del reinado.
5. Cada partida dura 30 días.
6. Cada día aparecen 2 eventos del consejo.
7. Elige una opción por evento.
8. Pulsa **Terminar día** cuando hayas resuelto los 2 asuntos.
9. Sobrevive hasta completar el día 30 para ganar y revisa la pantalla final de crónica.

Pierdes si oro, comida, ejército, pueblo, nobleza, fe o Corona llegan a 0. También pierdes si amenaza llega a 100.

## Características actuales

- Interfaz responsive orientada a móvil.
- Flujo completo de pantallas internas: menú, setup, partida activa y final de partida.
- Versión visible en la pantalla principal.
- Sistema híbrido de eventos: sucesos simples, eventos modulares con escaladas y cadenas narrativas largas hechas a mano.
- Issues activos del reino con actor, tipo, etapa, tensión, confianza, etiquetas, días activos y último día de evento.
- Selector ponderado por peso base, issues relacionados, incompatibilidades y repetición reciente.
- Catálogo modular con decisiones inmediatas, etiquetas, personajes recurrentes y consecuencias futuras.
- Memoria persistente del reino: historial, etiquetas, personajes recurrentes y eventos pendientes.
- Guardado automático con `localStorage`.
- Sistemas roguelike ligeros: árbol evolutivo de rasgos, ambición de reinado, religión inicial del reino, crisis de temporada, edictos y epílogo narrativo.
- Menú con continuar reinado, nuevo reinado y borrado de guardado.
- Pantalla final con victoria/derrota, causa de caída, recursos, issues, decisiones recientes y crónica desplegable.
- Sin dependencias y sin build step.

## Cómo publicarlo en GitHub Pages

1. Sube el repositorio a GitHub.
2. En GitHub, abre **Settings** → **Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama que quieras publicar, por ejemplo `main`.
5. Selecciona la carpeta raíz `/` como origen.
6. Guarda la configuración.
7. GitHub Pages servirá `index.html` como página principal.

Como el proyecto es estático, no hace falta configurar Node, bundlers ni workflows de build.

## Cómo actualizar versión

La versión del juego vive en un único sitio del código: `GAME_VERSION` en `game.js`.

Para un cambio importante:

1. Incrementa `GAME_VERSION` usando semver: `v0.1.0`, `v0.1.1`, `v0.2.0`, etc.
2. Actualiza la versión indicada en este `README.md`.
3. Añade una entrada en `CHANGELOG.md` con fecha, cambios, correcciones y pendientes conocidos.
4. Actualiza `DEVLOG.md` si el cambio modifica el diseño del juego.
5. Actualiza `ARCHITECTURE.md` si el cambio modifica el motor, guardado, estructura o flujo técnico.
6. Mantén compatibilidad con GitHub Pages.

## Regla obligatoria de evolución

A partir de ahora, cada cambio importante debe:

- Incrementar la versión.
- Actualizar `CHANGELOG.md`.
- Actualizar `DEVLOG.md` si cambia el diseño.
- Actualizar `ARCHITECTURE.md` si cambia el motor.

## Roadmap breve

- Añadir tests de integridad para el catálogo de eventos.
- Separar eventos en módulos cuando el catálogo crezca.
- Crear más quests largas hechas a mano.
- Añadir finales más específicos según memoria e historial.
- Mejorar la presentación de personajes recurrentes, memoria e issues.
- Diseñar migraciones explícitas para futuras versiones de guardado.

## v0.6.4 - Religión inicial del reino

- Añade una elección de religión al crear nueva partida, junto al rasgo y la ambición.
- La religión queda guardada en `state.religion`, aplica un bono inicial y aparece en la tarjeta de Reinado con tooltip.
- Incluye tres prototipos pequeños orientados a Fe, Pueblo y Corona, con referencias reservadas para evolución o ruptura futuras.
- Las partidas antiguas sin religión siguen cargando y se muestran como reinados sin credo inicial.

## v0.6.3 - Reformulación de familias

- Sustituye el catálogo de familias por mercaderes, artesanos, canciller, clero, ejército, nobleza, pueblo, espía, diplomacia, mayordomo, senescal, boticario, erudito y bufón.
- Mapea familias antiguas a familias nuevas para preservar eventos, actores, temporadas e historial guardado.
- Mantiene los tipos de issue como etiquetas compatibles cuando no son familias nuevas.

## v0.6.2 - Aparición por atributos

- Añade `resourceConditions` para eventos que solo aparecen cuando los atributos actuales cumplen mínimos o máximos.
- Añade `resourceWeights` para aumentar o reducir el peso de eventos según atributos sin bloquearlos.
- Las reglas funcionan con cualquier recurso del reino, incluida Corona.

## v0.6.1 - Corona

- Añade **Corona** como atributo del reino con valor inicial 50 para representar la confianza global en el monarca.
- Corona aparece como recurso con tooltip propio, se incluye en resúmenes finales y provoca derrota al caer a 0.
- Las partidas antiguas sin `crown` se normalizan con Corona 50 al cargar.

## v0.6.0 - Noticias del Reino y Crisis abiertas

- Añade **Noticias del Reino** como sistema de pasivos temporales de varios días (`state.news`) para temporadas, edictos, consecuencias y eventos. Las partidas antiguas migran `activeCrisis` a noticia estacional y `activeEdicts` a noticias de edicto.
- Separa **Crisis abiertas** de las noticias: las crisis persistentes siguen usando `state.issues` internamente, pero la UI las presenta como conflictos con actor, tensión, confianza, días abiertos, presión diaria, recompensa y problemas posibles.
- Las opciones de evento aceptan `addNews`, con apilado `refresh`, `replace`, `stack` o `ignore`; el cierre del día aplica `daily`, costes periódicos y caducidad.
- La presión de crisis se calcula una vez al día por tipo, etapa y tensión, sin crear noticias internas duplicadas.
- La tarjeta de Reinado se centra en rasgo, ambición y cadena de rasgos; edictos y temporadas aparecen ahora en Noticias del Reino.
- Los chips narrativos distinguen 🧠 Memoria, 📰 Noticia, ⚖️ Crisis, ⏳ Consecuencia y 🎲 Azar.


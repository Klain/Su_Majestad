# Changelog

Todas las versiones del proyecto deben usar formato semver y actualizar este archivo cuando haya cambios importantes.

## v0.6.4 - 2026-07-05

### Cambios realizados
- Se añade `kingdomReligions` con tres religiones iniciales prototipo orientadas a Fe, Pueblo y Corona.
- La pantalla de nueva partida exige elegir religión además de rasgo y ambición.
- La religión elegida se guarda en `state.religion`, aplica su bono inicial al crear la partida y se muestra en Reinado y resumen final.
- Se actualiza la versión a `v0.6.4`.

### Correcciones
- Las partidas antiguas sin religión normalizan `state.religion` como `null` y cargan sin bloquear la UI.
- La comprobación de derrota vuelve a usar los recursos vitales actuales: oro, comida, ejército, pueblo, nobleza, fe y Corona.

## v0.6.3 - 2026-07-05

### Cambios realizados
- Se reformula `data/families.js` con las 14 familias objetivo y descripciones de identidad aproximada.
- Se mapean los eventos, actores y temporadas existentes a familias nuevas sin crear packs grandes de eventos.
- Se añade compatibilidad por alias heredados para familias antiguas en catálogo, noticias, actores e historial reciente.
- Se actualiza la versión a `v0.6.3`.

### Correcciones
- Las familias antiguas `commerce`, `church`, `border`, `crime`, `exploration`, `royal_family`, `disease`, `diplomacy`, `food` y `crown` siguen resolviendo a familias nuevas si aparecen en partidas guardadas o contenido legado.

## v0.6.2 - 2026-07-05

### Cambios realizados
- Se añade `resourceConditions` a los eventos para bloquear su aparición según valores mínimos o máximos de cualquier atributo del reino.
- Se añade `resourceWeights` para multiplicar el peso de aparición cuando un atributo cumple una regla, sin impedir el evento si no la cumple.
- Se incorporan dos eventos mínimos de verificación: uno condicionado por comida baja y otro ponderado por Corona alta.
- Se actualiza la versión a `v0.6.2`.

### Correcciones
- Los eventos sin reglas de recursos mantienen el comportamiento de selección existente.

## v0.6.1 - 2026-07-05

### Cambios realizados
- Se añade `crown` / Corona como atributo del reino con valor inicial 50.
- Corona se integra en la UI de recursos, tooltips, chips de efectos, resumen final y migración de partidas guardadas antiguas.
- Llegar a 0 Corona provoca derrota por pérdida de legitimidad del monarca.
- Se actualiza la versión a `v0.6.1`.

### Correcciones
- Las partidas guardadas sin Corona reciben el valor inicial durante la normalización del estado.

## v0.6.0 - 2026-07-04

### Cambios realizados
- Se sustituye el rasgo inicial plano por un árbol evolutivo de 3 tiers con ramas para oro, comida, ejército, pueblo, nobleza, fe y amenaza.
- Se añade `traitPath`, `acquiredTraits`, `traitEvolutionChoices`, `traitEvolutionPending` y `traitEvolutionTier` al estado guardado.
- Los efectos fijos de rasgo usan `onAcquire` y los efectos recurrentes usan `passive`; `applyTraitPassives()` aplica los pasivos una sola vez por cierre de día.
- El día 10 ofrece evolución a Tier 2 y el día 20 evolución a Tier 3 según el último rasgo de la cadena.
- La setup UI muestra tier, descripción y efecto al adquirir; la partida muestra la cadena de rasgos y una tarjeta propia de evolución.
- Se migran partidas antiguas con `state.rulerTrait` a rasgos equivalentes del nuevo árbol.
- Se actualiza la versión a `v0.6.0`.

### Correcciones
- La amenaza conserva polaridad inversa en chips y tooltips: bajar amenaza se presenta como favorable.
- Se valida en arranque que no haya ids duplicados, evoluciones inexistentes ni relaciones de tier incorrectas.

## v0.4.3 - 2026-07-04

### Cambios realizados
- Los chips de consecuencias de recursos pasan a mostrar solo dirección y magnitud con flechas: una para impacto mínimo, dos para moderado y tres para enorme.
- Los tooltips individuales de chips explican los cambios de recursos en términos cualitativos, sin cifras exactas, e indican tendencia probable o resultado variable cuando hay ramas probabilísticas.
- El tooltip general de cada decisión separa la lectura de riesgo: resume porcentajes de outcomes inmediatos, consecuencias futuras con `defer.branches`, memoria política e issues sin convertir la interfaz en una hoja de cálculo.
- Se añade soporte opcional para `outcome.tone` (`success`, `mixed`, `failure`) y una inferencia prudente cuando el catálogo aún no lo define.
- Se actualiza la versión a `v0.4.3`.

### Correcciones
- Se mantiene la protección de propagación en tooltips dentro de botones para evitar elecciones accidentales al tocar chips o el icono de ayuda.

## v0.4.2 - 2026-07-04

### Cambios realizados
- El valor elegido de rasgo, ambición, crisis y edicto activo ahora conserva tooltip propio con su efecto o descripción.
- Las opciones del consejo añaden un indicador de ayuda con impacto previsto y probabilidades cuando el evento las define.
- Se actualiza la versión a `v0.4.2`.

### Correcciones
- La ayuda de decisiones usa un icono separado para no elegir la opción accidentalmente al consultar el tooltip.

## v0.4.1 - 2026-07-04

### Cambios realizados
- Se añade un sistema propio de tooltips accesibles con `data-tooltip`, compatible con ratón, teclado y toque en móvil.
- Recursos, Reinado, Issues activos y chips de consecuencias explican su función sin revelar fórmulas internas.
- Los tooltips se pueden cerrar al tocar fuera, al abrir otro tooltip o con Escape.
- Se actualiza la versión a `v0.4.1`.

### Correcciones
- Los tooltips dentro de botones de decisión no disparan la elección salvo que se toque fuera de la zona de ayuda.

## v0.4.0 - 2026-07-04

### Cambios realizados
- Se añade flujo completo de partida con pantallas internas para menú, creación, partida activa y final de run.
- La creación de partida permite elegir 1 rasgo y 1 ambición entre 3 opciones aleatorias antes de comenzar.
- El menú ya no inicia automáticamente una partida nueva cuando no hay guardado y permite continuar o borrar una partida existente.
- La pantalla final muestra victoria o derrota, epílogo, ambición, rasgo, día alcanzado, causa de derrota, recursos finales, issues y crónica.
- `newGame` acepta `{ trait, ambition }` y conserva selección aleatoria como fallback.
- Se actualiza la versión a `v0.4.0`.

### Correcciones
- `render()` evita pintar la partida activa si no hay estado válido y deriva los finales a la pantalla de cierre.
- Se mantiene `STORAGE_KEY` para no romper partidas guardadas anteriores.

## v0.3.0 - 2026-07-03

### Cambios realizados
- Se añaden rasgos iniciales aleatorios del monarca con ajustes pequeños de recursos.
- Se añaden ambiciones de reinado como objetivos secundarios de partida.
- Se incorporan crisis de temporada cada 7 días con efecto diario y ponderación de familias de eventos.
- Se añaden edictos cada 5 días como modificadores pasivos simples elegidos entre 3 opciones.
- Se muestra una tarjeta compacta de Reinado con rasgo, ambición, crisis activa y edicto activo.
- Se añade epílogo narrativo final según ambición, recursos, tags, issues y amenaza.
- El guardado normaliza campos nuevos para mantener compatibilidad con partidas antiguas.

### Correcciones
- El motor de eventos solo se amplía con un bonus de peso por crisis activa, sin reescrituras.

## v0.2.3 - 2026-07-03

### Cambios realizados
- UI: traducción de tags e IDs internos a lenguaje narrativo.
- UI: memoria e issues más inmersivos.

## v0.2.2 - 2026-07-03

### Cambios realizados
- Se pule la experiencia móvil con más padding inferior y soporte de `safe-area-inset-bottom` para que el botón sticky de terminar día no tape contenido.
- Se convierten las consecuencias cualitativas de las opciones en chips visuales cortos con iconos, flechas de dirección y límite de cuatro pistas visibles.
- Se mejora la jerarquía de los botones de opción separando título y consecuencias, reduciendo textos secundarios y aumentando la respiración entre cartas.
- Memoria del reino e Issues activos pasan a mostrarse como resúmenes plegables por defecto para reducir densidad en móvil.

### Correcciones
- El botón deshabilitado de terminar día pierde protagonismo visual sin dejar de ser cómodo para táctil.
- La interfaz conserva el motor narrativo, eventos, reglas y estructura de guardado existentes.

## v0.2.1 - 2026-07-03

### Cambios realizados
- Se divide el catálogo de eventos en módulos bajo `data/events/` para preparar el crecimiento a cientos de eventos.
- Se añade `data/actors.js` con actores persistentes y se migra Dario Valen al nuevo registro de actores.
- Se añade `data/families.js` con familias narrativas para comercio, iglesia, nobleza, pueblo, ejército, frontera, crimen, exploración, familia real, enfermedad y diplomacia.
- `events.js` queda como capa de compatibilidad con helpers y registro agregado para mantener el `EventManager` actual.
- `EventManager` puede enriquecer personajes recordados desde el catálogo de actores sin romper datos antiguos.
- Se actualiza la arquitectura con guías para crear eventos normales, consecuencias, cadenas, actores, familias e issues.

### Correcciones
- La carga estática sigue siendo compatible con GitHub Pages y no requiere dependencias externas ni build step.

### Cambios pendientes conocidos
- Aún falta validación automática para detectar IDs duplicados, consecuencias inexistentes e issues mal formados.

## v0.2.0 - 2026-07-03

### Cambios realizados
- Se ocultan los números exactos de recursos en los botones de decisión para reducir la optimización por suma directa.
- Se añade una presentación cualitativa de impactos: efectos leves, moderados y fuertes según la magnitud interna.
- Se incorpora soporte para `outcomes` probabilísticos inmediatos por opción, manteniendo `immediate` como formato compatible.
- Se muestran pistas cualitativas de riesgo, incertidumbre, recompensa y pérdida sin revelar porcentajes exactos.
- Se muestra el resultado narrativo tras elegir una opción y se guarda ese resultado en el historial.
- Se añade un primer evento con resultado inmediato probabilístico en la cosecha dorada.

### Correcciones
- La memoria del reino ahora puede mostrar qué ocurrió realmente, no solo qué opción eligió el jugador.
- El motor conserva los valores numéricos internamente para balanceo sin exponerlos en las opciones.

### Cambios pendientes conocidos
- Las barras de recursos siguen mostrando valores exactos; el cambio se centra en ocultar sumas exactas en decisiones.
- Falta una suite automática de tests de probabilidad e integridad del catálogo.

## v0.1.0 - 2026-07-03

### Cambios realizados
- Se añade la constante `GAME_VERSION` como fuente única de la versión visible del juego.
- Se muestra la versión actual en la cabecera de la pantalla principal.
- Se incorpora documentación de evolución, arquitectura y mantenimiento del proyecto.
- Se amplía el `README.md` con instrucciones de juego, publicación, versionado y roadmap.

### Correcciones
- Se formaliza el proceso de cambios importantes para evitar versiones no documentadas.
- Se documentan las zonas sensibles del motor para reducir roturas al añadir eventos.

### Cambios pendientes conocidos
- No existe una suite automática de tests para validar catálogo de eventos, guardado y compatibilidad de estados antiguos.
- El catálogo de eventos todavía vive en un único archivo y puede crecer demasiado.
- La pantalla de memoria e issues activos es funcional, pero aún puede mejorar su presentación narrativa.
- No hay migraciones explícitas por versión de guardado más allá de la normalización del estado.

## v0.6.0 - Noticias del Reino y Crisis abiertas

- Añade **Noticias del Reino** como sistema de pasivos temporales de varios días (`state.news`) para temporadas, edictos, consecuencias y eventos. Las partidas antiguas migran `activeCrisis` a noticia estacional y `activeEdicts` a noticias de edicto.
- Separa **Crisis abiertas** de las noticias: las crisis persistentes siguen usando `state.issues` internamente, pero la UI las presenta como conflictos con actor, tensión, confianza, días abiertos, presión diaria, recompensa y problemas posibles.
- Las opciones de evento aceptan `addNews`, con apilado `refresh`, `replace`, `stack` o `ignore`; el cierre del día aplica `daily`, costes periódicos y caducidad.
- La presión de crisis se calcula una vez al día por tipo, etapa y tensión, sin crear noticias internas duplicadas.
- La tarjeta de Reinado se centra en rasgo, ambición y cadena de rasgos; edictos y temporadas aparecen ahora en Noticias del Reino.
- Los chips narrativos distinguen 🧠 Memoria, 📰 Noticia, ⚖️ Crisis, ⏳ Consecuencia y 🎲 Azar.


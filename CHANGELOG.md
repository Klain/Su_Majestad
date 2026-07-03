# Changelog

Todas las versiones del proyecto deben usar formato semver y actualizar este archivo cuando haya cambios importantes.

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

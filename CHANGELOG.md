# Changelog

Todas las versiones del proyecto deben usar formato semver y actualizar este archivo cuando haya cambios importantes.

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

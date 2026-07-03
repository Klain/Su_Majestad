# Su Majestad

**Versión actual:** `v0.1.0`

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
- Amenaza

El objetivo no es solo optimizar barras: tus decisiones dejan memoria narrativa mediante etiquetas, personajes recurrentes, eventos diferidos e issues activos.

## Cómo jugar

1. Abre `index.html` en un navegador móvil o de escritorio.
2. Cada partida dura 30 días.
3. Cada día aparecen 2 eventos del consejo.
4. Elige una opción por evento.
5. Pulsa **Terminar día** cuando hayas resuelto los 2 asuntos.
6. Sobrevive hasta completar el día 30 para ganar.

Pierdes si oro, comida, ejército, pueblo, nobleza o fe llegan a 0. También pierdes si amenaza llega a 100.

## Características actuales

- Interfaz responsive orientada a móvil.
- Versión visible en la pantalla principal.
- Sistema híbrido de eventos: sucesos simples, eventos modulares con escaladas y cadenas narrativas largas hechas a mano.
- Issues activos del reino con actor, tipo, etapa, tensión, confianza, etiquetas, días activos y último día de evento.
- Selector ponderado por peso base, issues relacionados, incompatibilidades y repetición reciente.
- Catálogo modular con decisiones inmediatas, etiquetas, personajes recurrentes y consecuencias futuras.
- Memoria persistente del reino: historial, etiquetas, personajes recurrentes y eventos pendientes.
- Guardado automático con `localStorage`.
- Botón **Nueva partida** para reiniciar.
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

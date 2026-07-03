# Su Majestad

MVP jugable de un roguelike de gestión de reino para móvil, creado con HTML, CSS y JavaScript puro.

## Cómo jugar

1. Abre `index.html` en un navegador móvil o de escritorio.
2. Cada partida dura 30 días.
3. Cada día aparecen 2 eventos aleatorios del consejo.
4. Elige una opción por evento y pulsa **Terminar día**.
5. Sobrevive hasta completar el día 30 para ganar.

## Recursos

- Oro
- Comida
- Ejército
- Pueblo
- Nobleza
- Fe
- Amenaza

Pierdes si oro, comida, ejército, pueblo, nobleza o fe llegan a 0. También pierdes si amenaza llega a 100.

## Características del MVP

- Interfaz responsive orientada a móvil.
- 31 eventos iniciales con 2-3 decisiones cada uno.
- Decisiones con cambios visibles en recursos.
- Guardado automático con `localStorage`.
- Botón **Nueva partida** para reiniciar.
- Sin dependencias y sin build step.

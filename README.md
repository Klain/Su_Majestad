# Su Majestad

MVP jugable de un roguelike de gestión de reino para móvil, creado con HTML, CSS y JavaScript puro.

## Cómo jugar

1. Abre `index.html` en un navegador móvil o de escritorio.
2. Cada partida dura 30 días.
3. Cada día aparecen 2 eventos del consejo: algunos son asuntos nuevos y otros son consecuencias de decisiones anteriores.
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
- Sistema híbrido de eventos: sucesos simples aleatorios, eventos modulares con 1-2 escaladas y cadenas narrativas largas escritas a mano.
- Issues activos del reino con actor, tipo, etapa, tensión, confianza, etiquetas, días activos y último día de evento.
- Selector ponderado: peso base, bonus por issues relacionados, descarte de incompatibilidades y penalización por repetición reciente.
- Catálogo modular de eventos con decisiones inmediatas, etiquetas, personajes recurrentes y consecuencias futuras.
- Decisiones con cambios visibles en recursos, etiquetas narrativas y consecuencias diferidas.
- Memoria persistente del reino: historial, etiquetas, personajes recurrentes y eventos pendientes.
- Guardado automático con `localStorage`.
- Botón **Nueva partida** para reiniciar.
- Sin dependencias y sin build step.

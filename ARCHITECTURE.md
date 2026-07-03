# Arquitectura de Su Majestad

## Estructura actual de archivos

- `index.html`: estructura de la aplicación, puntos de montaje de la interfaz y carga de scripts.
- `style.css`: estilos visuales, responsive móvil/escritorio y componentes de cartas, recursos, mensajes, memoria e issues.
- `game.js`: estado principal, bucle de partida, renderizado, guardado, carga y constante `GAME_VERSION`.
- `event-manager.js`: motor de eventos, memoria, consecuencias, issues, selección ponderada e interpolación de texto.
- `events.js`: catálogo de eventos y helper para normalizar opciones.
- `README.md`: documentación de uso, publicación, versionado y roadmap.
- `CHANGELOG.md`: historial versionado de cambios.
- `DEVLOG.md`: evolución de diseño y decisiones de producto.
- `ARCHITECTURE.md`: esta guía técnica.

## Cómo funciona el bucle del juego

1. Al cargar la página, `game.js` intenta recuperar una partida desde `localStorage`.
2. Si no hay partida válida, crea una nueva con recursos iniciales, memoria vacía y día 1.
3. Cada día se seleccionan hasta 2 eventos: primero consecuencias vencidas y después eventos disponibles del catálogo.
4. El jugador resuelve cada evento eligiendo una opción.
5. Cada elección aplica efectos inmediatos, etiquetas, personajes, acciones sobre issues, consecuencias diferidas e historial.
6. Cuando los 2 eventos del día están resueltos, el jugador puede terminar la jornada.
7. Al terminar el día, avanzan los issues activos, se roba el siguiente consejo o se gana si se superan los 30 días.
8. Tras cada decisión o avance se guarda automáticamente y se renderiza la interfaz.

## Cómo se define un evento

Los eventos se definen en `events.js` con el helper `event(id, title, text, options, extra)`.

Cada evento incluye:

- `id`: identificador único y estable.
- `title`: título visible.
- `text`: descripción narrativa.
- `options`: lista de decisiones.
- `extra`: metadatos opcionales como `kind`, `family`, `families`, `weight`, requisitos de etiquetas o reglas de issue.

Una opción puede usar formato corto:

```js
["Cobrad impuestos", { gold: 8, people: -2 }]
```

O formato con configuración narrativa:

```js
[
  "Dadles escolta",
  { army: -2 },
  {
    addTags: ["supported_merchants"],
    characters: [{ id: "dario", name: "Dario Valen", role: "mercader aliado" }],
    defer: [{ delay: 6, eventId: "dario_prospers" }]
  }
]
```

## Cómo se aplican consecuencias

`EventManager.applyChoice` centraliza las consecuencias de una opción:

- `immediate` o `effects`: modifica recursos visibles y los limita entre 0 y 100.
- `addTags`: añade memoria narrativa persistente.
- `characters`: registra o actualiza personajes recurrentes.
- `issues`: crea, modifica, escala o resuelve conflictos persistentes.
- `defer`: programa eventos futuros para un día posterior.
- historial: guarda día, evento, familia, elección y etiquetas.

Los eventos diferidos se guardan en `state.pendingEvents`. Al inicio de cada día, `dueEventsForDay` extrae los vencidos, resuelve posibles ramas y comprueba compatibilidad antes de mostrarlos.

## Cómo funciona el guardado

El guardado usa `localStorage` con la clave actual `su-majestad-save-v2`. También se lee la clave antigua `su-majestad-save-v1` como compatibilidad básica.

La función `save()` serializa el estado completo. La función `load()` intenta cargarlo, normaliza estructuras nuevas con `eventManager.normalizeState()` y, si algo falla, inicia una partida nueva.

Importante: si en el futuro cambia la forma del estado, debe añadirse una migración o ampliar la normalización para no romper partidas existentes.

## Cómo añadir nuevos eventos

1. Añade el evento en `events.js` con un `id` único.
2. Comprueba que cada recurso usado existe en `resourceMeta`.
3. Si programas `defer`, verifica que el `eventId` de destino exista.
4. Si usas `requiresTags` o `forbiddenTags`, asegúrate de que las etiquetas se añaden desde alguna opción alcanzable.
5. Para eventos de issue, define bien `family`, `families` y la regla `issue`.
6. Evita efectos extremos salvo que sean parte explícita del riesgo narrativo.
7. Actualiza documentación y versión si el cambio es importante.

## Qué partes del código conviene no romper

- La forma de `state`: `day`, `resources`, `todaysEvents`, `resolved`, `gameOver`, `outcome`, `tags`, `history`, `pendingEvents`, `characters` e `issues`.
- Los IDs de eventos ya publicados, porque pueden aparecer en partidas guardadas y eventos diferidos.
- Las claves de recursos (`gold`, `food`, `army`, `people`, `nobility`, `faith`, `threat`).
- La normalización de opciones en `events.js`, porque permite compatibilidad entre formato corto y formato extendido.
- `EventManager.applyChoice`, porque es el punto único de aplicación de consecuencias.
- La clave de guardado sin plan de migración.
- La compatibilidad con GitHub Pages: el proyecto debe seguir funcionando como archivos estáticos sin build step.

## Regla de cambios importantes

Cada cambio importante debe incrementar `GAME_VERSION`, actualizar `CHANGELOG.md`, actualizar `DEVLOG.md` si cambia el diseño y actualizar `ARCHITECTURE.md` si cambia el motor.

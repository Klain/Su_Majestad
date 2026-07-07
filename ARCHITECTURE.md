# Arquitectura de Su Majestad

## Estructura actual de archivos

- `index.html`: estructura de la aplicación, contenedores `menuScreen`, `setupScreen`, `gameScreen`, `developerScreen` y `endingScreen`, puntos de montaje de la interfaz y carga de scripts estáticos para GitHub Pages.
- `style.css`: estilos visuales, responsive móvil/escritorio y componentes de cartas, recursos, mensajes, memoria, issues y editor de desarrollo.
- `game.js`: estado principal, `currentScreen`, setup de nueva run con rasgo, ambición y religión, bucle de partida, renderizado, tooltips reutilizables, guardado, carga, migración ligera de recursos faltantes, pantalla final, integración de pantallas internas y constante `GAME_VERSION`.
- `event-manager.js`: motor de eventos, memoria, consecuencias, actores, issues, selección ponderada e interpolación de texto.
- `events.js`: helpers globales `event`, `normalizeOption`, el catálogo agregado `events` y `registerEvents`.
- `data/actors.js`: actores persistentes reutilizables por eventos y cadenas.
- `data/families.js`: familias narrativas usadas para clasificar eventos e issues.
- `data/events-database.js`: catálogo unificado `eventsDatabase` cargado como script clásico y registrado con `registerEvents(eventsDatabase)`.
- `dev-editor.js`: modo desarrollador, estado en memoria del editor, búsqueda/filtros, CRUD de eventos, import/export JSON, borrador local y validación básica.
- `README.md`: documentación de uso, publicación, versionado y roadmap.
- `CHANGELOG.md`: historial versionado de cambios.
- `DEVLOG.md`: evolución de diseño y decisiones de producto.
- `ARCHITECTURE.md`: esta guía técnica.

El proyecto sigue sin usar dependencias externas ni paso de build. Por eso los módulos son scripts clásicos cargados en orden desde `index.html`: primero helpers, actores, familias y catálogo unificado, después `EventManager`, `game.js` y finalmente `dev-editor.js`.


## Tooltips accesibles

`game.js` define `tooltipTexts` como diccionario de textos para recursos, Reinado, Issues activos y chips de consecuencias. El helper `tooltip(label, text, className)` devuelve un activador con `data-tooltip`, `aria-label`, foco de teclado y clase `tooltip-trigger`. Además, helpers como `formatChoiceTooltip`, `formatTraitTooltip`, `formatCrisisTooltip` y `formatEdictTooltip` generan ayuda contextual para valores concretos y decisiones del consejo.

Después de renderizar la pantalla de partida, `render()` llama a `initTooltips()`. Esta función registra interacciones de ratón, foco y toque sobre los activadores, crea una única burbuja flotante `#tooltipBubble` con `role="tooltip"` y la posiciona según escritorio o móvil. Tocar otro tooltip reemplaza el activo, tocar fuera cierra la burbuja y Escape también la oculta.

Los tooltips no cambian mecánicas ni estado persistente: solo añaden ayuda contextual en la capa de presentación. En botones de decisión, el clic del activador detiene la propagación para que tocar exactamente un chip o icono de ayuda no elija la opción por accidente. Cuando una opción define probabilidades explícitas, el tooltip general resume porcentajes y riesgo; si no, indica que la decisión tiene efecto previsible. Los chips visibles de recursos se generan con `formatImpactChip`, `impactLevel`, `arrowMagnitude` y `formatResourceChipTooltip`: muestran solo dirección/magnitud con flechas y desplazan la explicación cualitativa al tooltip individual del chip.

## Cómo funciona el bucle del juego

1. Al cargar la página, `game.js` muestra el menú principal y comprueba si existe guardado válido en `localStorage`.
2. Si no hay partida válida, no crea una run automáticamente; el jugador debe abrir la pantalla de nueva partida.
3. En nueva partida se ofrecen 3 rasgos, 3 ambiciones aleatorias y las religiones prototipo; al comenzar se crea una run con recursos iniciales —incluida Corona 50—, memoria vacía y día 1.
4. Cada día se seleccionan hasta 2 eventos: primero consecuencias vencidas y después eventos disponibles del catálogo.
5. El jugador resuelve cada evento eligiendo una opción.
6. Cada elección aplica efectos inmediatos, etiquetas, actores recordados, acciones sobre issues, consecuencias diferidas e historial.
7. Cuando los 2 eventos del día están resueltos, el jugador puede terminar la jornada.
8. Al terminar el día, avanzan los issues activos, se roba el siguiente consejo o se gana si se superan los 30 días.
9. Si `state.gameOver` es verdadero, `currentScreen` pasa a `ending` y se renderiza el cierre de run.
10. Tras cada decisión o avance se guarda automáticamente y se renderiza la interfaz.

## Religión inicial del reino

`game.js` define `kingdomReligions` y `kingdomReligionsById`. Cada religión tiene `id`, `name`, `description`, `bonus` y `futureHooks` para reservar referencias de evolución o ruptura sin implementar todavía esos sistemas.

Durante `newGame(selection)`, la religión seleccionada se guarda en `state.religion` y su `bonus` se aplica a los recursos iniciales después del bono del rasgo. `normalizeRoguelikeState()` llama a `normalizeReligionState()` para reconstruir religiones conocidas por id y dejar `null` en partidas antiguas sin religión. La UI de setup exige `selectedReligion`; la tarjeta de Reinado muestra la religión elegida con `formatReligionTooltip()`.

## Catálogo modular

`events.js` ya no contiene todo el contenido narrativo. Su responsabilidad es ofrecer compatibilidad con el formato anterior:

```js
const events = [];
function registerEvents(items) {
  events.push(...items);
}
```

## Catálogo unificado y modo desarrollador

`data/events-database.js` define una única estructura `const eventsDatabase = [...]` con eventos ya normalizados mediante el helper global `event(...)`. Al final del archivo se llama a `registerEvents(eventsDatabase)`, por lo que `EventManager` sigue recibiendo el array global `events` sin cambios de contrato. El catálogo modular anterior bajo `data/events/` fue eliminado en `v0.7.1` porque era una copia histórica no cargada desde `index.html`; cualquier recuperación debe hacerse desde el historial Git.

`developerScreen` es una pantalla interna estática, no una ruta ni una aplicación separada. `dev-editor.js` clona el catálogo cargado al arranque en `developerState.events`; por tanto, crear, editar, importar o borrar dentro del editor no muta el array usado por una partida normal ya inicializada. Esta separación evita que el modo desarrollador afecte a partidas normales salvo que un autor copie manualmente un export al proyecto y recargue la página con el nuevo catálogo.

El editor soporta:

1. Lista de eventos con selección.
2. Búsqueda por ID, título, texto, familias, tags y opciones.
3. Filtros por `family`, `kind`, eventos normales/consecuencias, eventos con `issue` y eventos con `defer`.
4. Formulario visual para campos frecuentes (`id`, `title`, `text`, `kind`, `family`, `families`, peso, días, tags, `issue` y campos principales de opciones).
5. Vista **JSON avanzado** para reemplazar el objeto completo del evento seleccionado cuando el formulario visual no cubre una estructura compleja.
6. Exportación del catálogo completo como JSON descargable.
7. Importación de un array JSON de eventos.
8. Borrador opcional en `localStorage` con la clave `su-majestad-dev-events-draft-v1`.

La validación de `dev-editor.js` informa sin bloquear edición. Clasifica como errores los IDs duplicados, campos obligatorios ausentes, opciones sin `label`, `defer.eventId` y `defer.branches[].eventId` inexistentes, arrays de tags mal formados y recursos desconocidos en `immediate`, `effects` u `outcomes`. Clasifica como avisos las familias o actores referenciados que no existen en `families` o `actors`.

## Cómo crear un evento normal

Añade el evento en `data/events-database.js` o créalo desde el modo desarrollador, exporta el JSON y copia el resultado al fichero unificado.

```js
registerEvents([
  event(
    "market_fire",
    "Incendio en el mercado",
    "Las lonas arden y los comerciantes piden ayuda inmediata.",
    [
      ["Enviar cubas reales", { gold: -4, people: 3 }, { family: "merchants" }],
      ["Dejar que se organicen", { people: -2, threat: 2 }]
    ],
    { family: "merchants", families: ["merchants", "people"], weight: 1 }
  )
]);
```

Reglas prácticas:

1. Usa un `id` único y estable; puede aparecer en partidas guardadas o consecuencias pendientes.
2. Comprueba que cada recurso existe en `resourceMeta` de `game.js`.
3. Usa `family` para la familia principal y `families` si el evento también encaja con otras familias o tipos de issue.
4. Evita efectos extremos salvo que el riesgo narrativo lo justifique.

## Cómo crear un evento de consecuencia

Los eventos de consecuencia deben vivir en `data/events-database.js`, preferentemente junto al bloque o cadena narrativa relacionada. Declara `kind: "consequence"` para que no aparezcan como evento diario normal.

```js
event(
  "market_fire_debt",
  "La deuda del mercado",
  "Los comerciantes recuerdan quién pagó las cubas y quién cerró la puerta.",
  [
    ["Aceptar su gratitud", { gold: 5 }, { addTags: ["merchant_gratitude"] }],
    ["Pedir más impuestos", { gold: 8, people: -3 }, { addTags: ["taxed_merchants"] }]
  ],
  { kind: "consequence", requiresTags: ["helped_market"], family: "merchants" }
)
```

Programa la consecuencia desde una opción con `defer`:

```js
["Enviar cubas reales", { gold: -4, people: 3 }, {
  addTags: ["helped_market"],
  defer: [{ delay: 5, eventId: "market_fire_debt" }]
}]
```

También puedes usar ramas probabilísticas:

```js
defer: [{
  delay: 6,
  branches: [
    { probability: 0.65, eventId: "merchant_reward" },
    { probability: 0.35, eventId: "merchant_complaint" }
  ]
}]
```

Las ramas de `outcomes` y `defer.branches` pueden declarar opcionalmente `tone: "success" | "mixed" | "failure"`. Este campo no es obligatorio para mantener compatibilidad con el catálogo existente: si falta, `game.js` infiere una lectura prudente a partir de los efectos netos, tratando `threat` como recurso inverso. Usar `tone` es preferible cuando la intención narrativa de una rama no se deduce bien de sus recursos.

## Cómo crear una cadena

Una cadena es un grupo de eventos relacionados dentro de `data/events-database.js`. Mantén sus pasos juntos y separados por un comentario de bloque cuando tenga varios pasos o un arco dramático claro.

Estructura recomendada:

1. Un evento inicial normal que pueda crear tags o issues.
2. Uno o más eventos `kind: "consequence"` enlazados por `defer`.
3. Reglas `requiresTags`, `forbiddenTags` o `issue` para evitar pasos imposibles.
4. Opciones finales que resuelvan el arco con tags persistentes o resolución de issue.

Ejemplo de ruta:

```js
// data/events-database.js
event("example_start", "Inicio", "...", [["Actuar", {}, { defer: [{ delay: 4, eventId: "example_middle" }] }]], { family: "diplomat" }),
event("example_middle", "Nudo", "...", [["Resolver", {}, { addTags: ["example_resolved"] }]], { kind: "consequence", family: "diplomat" })
```

Si añades contenido nuevo, incorpóralo al array `eventsDatabase`; no hace falta tocar `index.html` mientras el catálogo siga unificado.

## Cómo crear un actor

Añade actores persistentes en `data/actors.js` con esta forma:

```js
{
  id: "dario",
  name: "Dario Valen",
  role: "Mercader",
  family: "merchants",
  tags: ["merchant", "caravan"],
  trust: 50,
  tension: 20,
  description: "Mercader extranjero que recuerda los favores y agravios de la corona."
}
```

`id` debe ser único. `family` debe apuntar a una familia narrativa existente cuando sea posible. `trust` y `tension` son valores iniciales para futuras mecánicas de relación; actualmente se preservan cuando el actor se recuerda en `state.characters`.

## Cómo vincular un evento con un actor

En una opción, usa `characters` con el `id` del actor. El `EventManager` mezcla los datos base de `data/actors.js` con los datos puntuales de la opción.

```js
["Dadles escolta", { army: -2 }, {
  characters: [{ id: "dario", role: "Mercader aliado" }],
  addTags: ["supported_merchants"]
}]
```

Después puedes interpolar campos del actor recordado:

```js
"Regreso de {character:dario.name}"
```

Si el actor no se ha recordado todavía, la interpolación usa un texto genérico para no romper el evento.

## Cómo vincular un evento con una familia

Las familias viven en `data/families.js`. Vincula eventos con:

- `family`: familia principal, usada por historial y penalización de repetición reciente.
- `families`: lista de familias o tipos de issue relacionados, usada para dar peso extra si hay issues activos compatibles.

```js
event("border_refugees", "Refugiados en la frontera", "...", options, {
  family: "diplomat",
  families: ["diplomat"]
})
```

Usa IDs de `data/families.js` para contenido nuevo salvo que estés modelando un tipo de issue específico ya existente. El catálogo actual de familias es: `merchants`, `artisans`, `chancellor`, `clergy`, `army`, `nobility`, `people`, `spy`, `diplomat`, `steward`, `seneschal`, `apothecary`, `scholar` y `jester`. El motor conserva alias heredados para contenido o partidas antiguas, pero no deben usarse como IDs nuevos.

## Cómo crear un issue

Un issue representa un conflicto persistente. Se crea desde una opción con `issues`:

```js
issues: [{
  action: "create",
  issue: {
    id: "border-crisis",
    actorId: "marca_oriental",
    type: "diplomat",
    stage: 0,
    tension: 38,
    trust: 45,
    tags: ["refugees"]
  }
}]
```

Campos importantes:

- `id`: identificador único del conflicto.
- `actorId`: actor, facción o entidad responsable.
- `type`: tipo de issue; idealmente compatible con una familia.
- `stage`: escalón narrativo, empezando en 0.
- `tension`: presión o riesgo del conflicto, entre 0 y 100.
- `trust`: confianza del actor hacia la corona, entre 0 y 100.
- `tags`: marcas específicas del conflicto.

Acciones disponibles:

```js
{ action: "modify", issueId: "border-crisis", tension: -12, trust: 10 }
{ action: "escalate", issueId: "border-crisis", tension: 8, trust: -6 }
{ action: "resolve", issueId: "border-crisis", addTags: ["border_secured"] }
```

Para mostrar un evento solo si existe un issue compatible, añade una regla `issue` al evento:

```js
{ kind: "consequence", family: "diplomat", issue: { id: "border-crisis", minStage: 1 } }
```


## Renderizado de pistas de consecuencias

Las opciones siguen usando internamente `immediate`, `effects`, `outcomes`, `defer`, `addTags` e `issues` con el mismo formato de catálogo. La capa de UI en `game.js` transforma esos datos en chips cualitativos: icono del recurso definido en `resourceMeta`, flecha `↑`/`↓` para la dirección, texto de magnitud solo cuando ayuda a leer rápido y chips narrativos para incertidumbre, memoria o conflicto.

Esta conversión es solo de presentación: no cambia `EventManager.applyChoice`, no expone números exactos y mantiene el límite visual de cuatro chips por opción para móvil.

## Cómo funciona el guardado

El guardado usa `localStorage` con la clave actual `su-majestad-save-v2`. También se lee la clave antigua `su-majestad-save-v1` como compatibilidad básica.

La función `save()` serializa el estado completo. La función `load()` intenta cargarlo, normaliza estructuras nuevas con `eventManager.normalizeState()` y, si algo falla, inicia una partida nueva.

Importante: si en el futuro cambia la forma del estado, debe añadirse una migración o ampliar la normalización para no romper partidas existentes.

## Qué partes del código conviene no romper

- La forma de `state`: `day`, `resources`, `todaysEvents`, `resolved`, `gameOver`, `outcome`, `tags`, `history`, `pendingEvents`, `characters` e `issues`.
- Los IDs de eventos ya publicados, porque pueden aparecer en partidas guardadas y eventos diferidos.
- Las claves de recursos (`gold`, `food`, `army`, `people`, `nobility`, `faith`, `threat`).
- La normalización de opciones en `events.js`, porque permite compatibilidad entre formato corto y formato extendido.
- `EventManager.applyChoice`, porque es el punto único de aplicación de consecuencias.
- La clave de guardado sin plan de migración.
- El orden de scripts de `index.html`: helpers, datos, motor, juego.
- La compatibilidad con GitHub Pages: el proyecto debe seguir funcionando como archivos estáticos sin build step.

## Regla de cambios importantes

Cada cambio importante debe incrementar `GAME_VERSION`, actualizar `CHANGELOG.md`, actualizar `DEVLOG.md` si cambia el diseño y actualizar `ARCHITECTURE.md` si cambia el motor o el formato de contenido.


## v0.3.0 - Capa roguelike de partida

La capa roguelike vive en `game.js` y persiste `ambition`, `rulerTrait`, `activeCrisis`, `activeEdicts`, `edictChoices` y `completedObjectives` dentro del mismo estado de `localStorage`. `EventManager.weightFor` consulta la crisis activa para sumar un bonus pequeño a eventos cuyas familias coinciden; el resto del motor de eventos permanece intacto.


## Sistema de pantallas

`game.js` mantiene `currentScreen` con cuatro valores: `menu`, `setup`, `game` y `ending`. `render()` sincroniza la clase `.hidden` en los contenedores de `index.html` y solo pinta la interfaz de partida cuando existe `state` y la pantalla activa es `game`.

La pantalla `ending` usa el estado guardado para construir una crónica final: epílogo, ambición, rasgo inicial, causa de derrota, recursos, issues, decisiones recientes y consecuencias pendientes. Esto permite conservar el formato de guardado actual y evita modificar `EventManager`.

## Árbol evolutivo de rasgos

Desde `v0.6.0`, `rulerTraits` ya no describe solo ventajas iniciales pequeñas. Cada rasgo tiene `id`, `name`, `tier`, `tierName`, `family`, `description`, `onAcquire`, `passive`, `evolvesTo` y, salvo los Tier 1, `parentId`.

### Estado persistente

- `traitPath`: cadena ordenada de ids adquiridos durante el reinado. Ejemplo: `administrator -> tax_collector -> greater_tax_collector`.
- `acquiredTraits`: lista compatible de ids activos; actualmente replica la cadena para facilitar futuras UI o consultas.
- `traitEvolutionChoices`: ids disponibles cuando hay evolución pendiente.
- `traitEvolutionPending`: bloquea el avance normal del consejo hasta elegir evolución.
- `traitEvolutionTier`: tier objetivo de la evolución pendiente, `2` o `3`.
- `lastTraitPassiveDay`: guardia para que los pasivos de rasgos no se apliquen dos veces en el mismo día.

Las partidas antiguas pueden traer solo `state.rulerTrait`. `normalizeRoguelikeState()` llama a `migrateTraitState()` para mapear ids anteriores a líneas equivalentes: generoso a pueblo, militar a ejército, devoto a fe, ambicioso a nobleza, prudente a comida y mercantil a oro. Si el id no se reconoce, el fallback seguro es `administrator`.

### Efectos de rasgo

`onAcquire` representa un efecto fijo que se aplica exactamente una vez al obtener un rasgo, tanto al empezar una run como al evolucionar. Sustituye el antiguo concepto de `initial`, porque la adquisición ya no ocurre solo al inicio.

`passive` representa efectos recurrentes que se aplican al cerrar cada día mediante `applyTraitPassives()`. Esta función recorre todos los ids de `traitPath` y aplica el pasivo de cada rasgo activo antes de crisis y edictos. La lógica vive separada de edictos para evitar mezclar sistemas.

### Momentos de evolución

Al cerrar el día 9, `endDay()` incrementa a día 10 y llama a `prepareTraitEvolution()`. Si el último rasgo tiene evoluciones Tier 2, se rellena `traitEvolutionChoices` y se muestra la tarjeta “Evolución del rasgo”. Al cerrar el día 19 ocurre lo mismo para Tier 3 al entrar en el día 20.

La UI solo ofrece ids listados en `evolvesTo` del último rasgo de `traitPath`, de modo que no puede saltar a otra familia ni escoger una rama no relacionada. Mientras hay evolución pendiente, los eventos del consejo quedan deshabilitados y el botón de terminar día no puede avanzar.

### Polaridad inversa de amenaza

`threat` conserva la regla especial del resto del juego: bajar amenaza es positivo y subir amenaza es negativo. Los chips usan `resourceTone()` para mostrar `threat: -30` como favorable y `threat: +30` como problemático. Los tooltips añaden una frase explícita cuando la amenaza baja o sube.

### Resumen del árbol

| Familia | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| Oro | Administrador | Tesorero Real / Recaudador / Mercader de Corte | Ministro del Tesoro, Casa de la Moneda, Recaudador Mayor, Hacienda de Hierro, Rey Mercader, Monopolios Reales |
| Comida | Granero Real | Mayordomo de Graneros / Previsor / Racionador | Señor de los Silos, Red de Almacenes, Intendente General, Reino de la Abundancia, Mano de Invierno, Pan Controlado |
| Ejército | Veterano | Capitán Real / Reclutador / Guardia de Palacio | Mariscal de la Corona, Academia Militar, Leva Permanente, Señor de la Guerra, Guardia Pretoriana, Reino Acuartelado |
| Pueblo | Popular | Protector del Pueblo / Carismático / Benefactor | Padre del Pueblo, Consejo Vecinal, Voz de las Plazas, Corona Amada, Gran Benefactor, Pan y Fiesta |
| Nobleza | Bien Nacido | Heredero de Linaje / Cortesano / Señor Feudal | Primero entre Pares, Corte Dorada, Canciller de Sangre, Pacto de Casas, Liga de Nobles, Trono Aristocrático |
| Fe | Devoto | Peregrino Real / Ungido / Diezmo Piadoso | Santo Protector, Red de Monasterios, Voz del Altar, Elegido de Dios, Reino Sacro, Trono Teocrático |
| Amenaza | Vigilante | Ojos en la Muralla / Implacable / Ley de Hierro | Red de Atalayas, Guardia de Caminos, Mano Dura, El Pacificador, Reino Ordenado, Paz Armada |

`validateTraitTree()` se ejecuta al cargar `game.js` y comprueba ids duplicados, destinos de `evolvesTo`, ausencia de `parentId` en Tier 1 y coherencia padre-hijo entre Tier 1, Tier 2 y Tier 3.

## v0.6.0 - Noticias del Reino y Crisis abiertas

- Añade **Noticias del Reino** como sistema de pasivos temporales de varios días (`state.news`) para temporadas, edictos, consecuencias y eventos. Las partidas antiguas migran `activeCrisis` a noticia estacional y `activeEdicts` a noticias de edicto.
- Separa **Crisis abiertas** de las noticias: las crisis persistentes siguen usando `state.issues` internamente, pero la UI las presenta como conflictos con actor, tensión, confianza, días abiertos, presión diaria, recompensa y problemas posibles.
- Las opciones de evento aceptan `addNews`, con apilado `refresh`, `replace`, `stack` o `ignore`; el cierre del día aplica `daily`, costes periódicos y caducidad.
- La presión de crisis se calcula una vez al día por tipo, etapa y tensión, sin crear noticias internas duplicadas.
- La tarjeta de Reinado se centra en rasgo, ambición y cadena de rasgos; edictos y temporadas aparecen ahora en Noticias del Reino.
- Los chips narrativos distinguen 🧠 Memoria, 📰 Noticia, ⚖️ Crisis, ⏳ Consecuencia y 🎲 Azar.


## Condiciones y pesos por recursos

El selector de `EventManager` integra dos campos opcionales para que un evento dependa del estado actual de los atributos del reino sin crear un sistema paralelo.

- `resourceConditions`: objeto por recurso con `min` y/o `max`. Todas las reglas deben cumplirse para que el evento sea compatible. Si el recurso no existe en `state.resources`, la condición falla.
- `resourceWeights`: lista de reglas `{ resource, min, max, multiplier }`. Cada regla cumplida multiplica el peso calculado del evento; si no se cumple, el evento sigue disponible con su peso normal. El multiplicador se aplica después de peso base, afinidades, issues y crisis, y antes de la penalización por repetición.

Ejemplo:

```js
event("empty_granaries", "Graneros vacíos", "...", options, {
  family: "seneschal",
  resourceConditions: { food: { max: 30 } }
})

event("royal_auditors", "Auditores reales", "...", options, {
  family: "chancellor",
  resourceWeights: [{ resource: "crown", min: 70, multiplier: 2 }]
})
```

Ambos campos funcionan con cualquier atributo presente en `state.resources`, incluida `crown`, y son opcionales para mantener intactos los eventos existentes.

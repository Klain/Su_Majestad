# Devlog de Su Majestad

## Idea inicial del juego

`Su Majestad` nace como un roguelike ligero de gestión de reino: una partida corta de 30 días donde cada jornada presenta asuntos del consejo y el jugador debe sobrevivir equilibrando recursos como oro, comida, ejército, pueblo, nobleza, fe y amenaza.

La inspiración de diseño es una experiencia de decisiones rápidas, legible en móvil y sin dependencias externas. Cada decisión debía tener un coste claro y empujar al reino hacia una victoria, una derrota o una historia emergente.

## Problema detectado: optimización de barras

El primer riesgo de diseño fue que el jugador tratara cada evento solo como una suma o resta de barras. Si todas las decisiones se reducen a maximizar recursos, el juego pierde personalidad y se convierte en una hoja de cálculo.

Ese problema también reduce la rejugabilidad: una vez detectadas las opciones eficientes, las escenas dejan de importar.

## Cambio hacia consecuencias narrativas

Para combatir esa optimización, el diseño evolucionó hacia consecuencias narrativas. Las opciones no solo modifican recursos: también añaden etiquetas, recuerdan personajes, registran historial y pueden programar eventos futuros.

Así, una decisión aparentemente eficiente puede volver días después como deuda política, gratitud de un personaje o escalada de un conflicto.

## Eventos diferidos

Los eventos diferidos permiten que una decisión programe consecuencias para jornadas futuras. Cada entrada diferida guarda el evento origen, el día objetivo y, opcionalmente, ramas con probabilidad.

Esto crea memoria jugable: el reino no solo cambia en el instante, sino que reacciona después.

## Issues activos

Los issues activos representan conflictos persistentes del reino. Un issue tiene actor, tipo, etapa, tensión, confianza, etiquetas, días activo y último día de evento.

Sirven para modelar problemas que no deberían resolverse con una sola carta: crisis fronterizas, reclamaciones nobles o futuras líneas de conflicto. El selector de eventos puede dar peso extra a eventos relacionados con issues abiertos.

## Eventos modulares

Los eventos modulares son arquetipos reutilizables que pueden abrir, modificar, escalar o resolver issues. Están pensados para generar variedad sin escribir una quest completa para cada aparición.

Ejemplo actual: una reclamación noble puede empezar como petición, escalar y terminar en duelo o resolución política.

## Quest largas hechas a mano

Junto a los eventos modulares existen cadenas más manuales, escritas con intención dramática. Estas quests permiten controlar mejor el ritmo, los personajes recurrentes y los desenlaces.

Ejemplo actual: la crisis de la marca oriental funciona como una línea con varias escenas encadenadas y decisiones que pueden convertir la frontera en alianza, autonomía o abandono.

## Issues activos de desarrollo

- Separar el catálogo en módulos cuando el volumen de eventos crezca.
- Añadir validación automática para detectar IDs duplicados, consecuencias inexistentes y opciones mal formadas.
- Diseñar más eventos que oculten parte de su consecuencia narrativa sin hacer injusto el sistema.
- Mejorar cómo la interfaz explica memoria, issues e historial al jugador.
- Definir una estrategia de migraciones para futuras versiones de guardado.

## Objetivos futuros

- Aumentar el número de cadenas narrativas largas hechas a mano.
- Añadir finales más específicos según etiquetas e historial.
- Mejorar la presentación de personajes recurrentes.
- Incorporar tests de integridad del catálogo.
- Mantener compatibilidad con GitHub Pages y sin paso de build obligatorio.

## Regla de evolución

Cada cambio importante debe incrementar la versión, actualizar `CHANGELOG.md`, actualizar `DEVLOG.md` si cambia el diseño y actualizar `ARCHITECTURE.md` si cambia el motor.

## v0.2.0: del cálculo exacto al riesgo cualitativo

La prioridad de esta versión es atacar de forma directa el problema de optimización por suma. En versiones anteriores, cada botón podía revelar cambios como `+10 oro` o `-6 pueblo`, lo que empujaba al jugador a comparar opciones como una operación aritmética.

Desde `v0.2.0`, las decisiones presentan intención y riesgo con lenguaje cualitativo: ingresos grandes, pérdidas moderadas, resultado incierto, posible recompensa o posible pérdida. Los números no desaparecen del motor; siguen existiendo para balancear recursos y derrotas, pero dejan de ser la información dominante en la elección.

También aparece una nueva capa de incertidumbre inmediata. Una opción puede tener varios `outcomes` posibles con probabilidades internas. El jugador no ve el porcentaje exacto, solo señales narrativas de riesgo. Al elegir, el juego revela qué ocurrió realmente con un mensaje breve y lo registra en la memoria del reino.

Este cambio refuerza la fantasía de gobernar bajo información incompleta: la corona decide por criterio político, intuición narrativa y consecuencias posibles, no por optimización perfecta de barras.


## v0.3.0 - Sistemas roguelike ligeros

Se añade identidad de partida mediante rasgo inicial, ambición, crisis de temporada y edictos. El diseño evita una historia principal o quests largas: son capas sistémicas pequeñas que modifican recursos, objetivos y pesos de familias de eventos.


## v0.4.0 - Flujo completo de partida

Esta versión convierte la interfaz de prototipo en un flujo de run más claro. La experiencia ya no comienza creando una partida de forma implícita: el jugador entra por un menú, decide si continúa o crea un nuevo reinado y entiende que cada partida tiene identidad propia.

La creación del reinado hace explícitos dos ejes roguelike: el rasgo inicial y la ambición. Al presentar tres opciones aleatorias de cada tipo, cada run empieza con una promesa distinta y anima a probar combinaciones nuevas.

El final de partida deja de ser un mensaje incrustado en la pantalla de juego. La derrota se presenta como cierre de run, con causa, recursos finales, asuntos pendientes y últimas decisiones. La victoria también cierra la historia y no se limita a declarar que se ha ganado.


## v0.4.1 - Tooltips accesibles

Se añade una capa de explicación contextual para reducir la densidad visual sin esconder información importante. En recursos, reinado, issues y consecuencias previstas, los textos explican qué significa cada dato con tono narrativo y sin exponer fórmulas internas.

La solución evita depender de `title`: usa activadores tocables y enfocables, funciona con ratón, teclado y móvil, y permite cerrar la burbuja al tocar fuera o pulsar Escape. Así la interfaz gana legibilidad y sensación profesional sin alterar las mecánicas de decisión ni el balance.


## v0.4.2 - Ayuda persistente de decisiones y reinado

Los tooltips dejan de explicar solo la categoría y pasan a explicar también el valor concreto elegido: qué aporta el rasgo inicial, cuál es la ambición, qué hace la crisis activa y qué mantiene el edicto vigente. Esto evita que el jugador pierda contexto después de la pantalla de creación o tras varios días de partida.

Las opciones del consejo incorporan una ayuda dedicada con impacto previsto y probabilidades cuando existen ramas explícitas. La intención es aclarar riesgo y beneficio sin convertir la interfaz principal en una hoja de cálculo: los chips siguen siendo breves, y el detalle queda bajo demanda.

## v0.4.3 - Tres niveles de información de riesgo

La interfaz de decisiones separa ahora tres capas para reforzar el tono roguelike sin volver a una hoja de cálculo. El chip visible es lectura rápida: recurso, dirección y magnitud mediante flechas. El tooltip individual del chip explica de forma cualitativa si el recurso crecerá o bajará mínimamente, moderadamente o enormemente, y avisa cuando una decisión probabilística puede variar entre ramas.

El tooltip general de la decisión deja de listar costes exactos por defecto. Su función pasa a ser informar el riesgo: porcentajes de ramas inmediatas, lectura favorable/problemática/mixta y probabilidades de consecuencias futuras cuando existen. Los valores numéricos exactos quedan reservados para `DEBUG_UI`, de modo que el balance sigue siendo auditable durante desarrollo sin dominar la experiencia del jugador.

## v0.6.0 - Evolución de rasgos

Los rasgos del monarca pasan a formar un árbol de 3 tiers. Cada run empieza con un rasgo común, puede evolucionar a raro al llegar al día 10 y a legendario al llegar al día 20. Las evoluciones no reemplazan lo anterior: forman una cadena del reinado y suman efectos `onAcquire` y pasivos diarios.

Este cambio refuerza la identidad roguelike de cada partida sin tocar el `EventManager` ni reestructurar eventos. La amenaza mantiene polaridad inversa: reducirla es beneficioso y la UI lo comunica como favorable.

## v0.6.0 - Noticias del Reino y Crisis abiertas

- Añade **Noticias del Reino** como sistema de pasivos temporales de varios días (`state.news`) para temporadas, edictos, consecuencias y eventos. Las partidas antiguas migran `activeCrisis` a noticia estacional y `activeEdicts` a noticias de edicto.
- Separa **Crisis abiertas** de las noticias: las crisis persistentes siguen usando `state.issues` internamente, pero la UI las presenta como conflictos con actor, tensión, confianza, días abiertos, presión diaria, recompensa y problemas posibles.
- Las opciones de evento aceptan `addNews`, con apilado `refresh`, `replace`, `stack` o `ignore`; el cierre del día aplica `daily`, costes periódicos y caducidad.
- La presión de crisis se calcula una vez al día por tipo, etapa y tensión, sin crear noticias internas duplicadas.
- La tarjeta de Reinado se centra en rasgo, ambición y cadena de rasgos; edictos y temporadas aparecen ahora en Noticias del Reino.
- Los chips narrativos distinguen 🧠 Memoria, 📰 Noticia, ⚖️ Crisis, ⏳ Consecuencia y 🎲 Azar.


## v0.6.1 - Corona como confianza monárquica

Esta versión añade **Corona** como atributo separado para representar la confianza global del reino en el monarca. A diferencia de Pueblo, Nobleza o Fe, no introduce aún eventos ni mecánicas nuevas: sirve como barra de legitimidad general preparada para futuros sistemas.

El valor inicial es 50 y las partidas antiguas migran con ese mismo valor si no lo tenían guardado. Como el resto de recursos vitales, caer a 0 provoca derrota; la amenaza conserva su regla inversa de derrota al llegar a 100.

## v0.6.2 - Aparición por atributos

El selector de eventos puede leer los atributos actuales del reino antes de decidir qué asuntos llegan al consejo. `resourceConditions` cubre escenas que solo tienen sentido bajo una presión concreta, como escasez de comida, mientras `resourceWeights` permite que un tema sea más probable cuando un recurso está alto o bajo sin convertirlo en obligatorio.

La decisión de diseño es mantener esta lógica dentro del `EventManager`: los eventos antiguos no necesitan cambios y los nuevos campos se combinan con pesos base, familias, issues, crisis y penalización por repetición.

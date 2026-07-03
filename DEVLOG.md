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

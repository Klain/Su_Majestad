registerEvents([
  event("garrison_boots", "Botas rotas", "El Capitán Rodrigo informa que media guarnición patrulla con botas abiertas. Un soldado cojo defiende peor la muralla.", [
    ["Comprar botas nuevas", { gold: -5, army: 4 }, { characters: [{ id: "capitan_rodrigo" }], addTags: ["garrison_boots_replaced"], resultText: "La guardia marcha mejor y se queja menos." }],
    ["Repararlas con cuero viejo", { gold: -2, army: 2 }, { characters: [{ id: "capitan_rodrigo" }], defer: [{ delay: 4, branches: [{ probability: 0.65, eventId: "patched_boots_hold" }, { probability: 0.35, eventId: "patched_boots_fail" }] }], resultText: "Las botas parecen dignas desde el balcón." }],
    ["Que aguanten", { army: -3, gold: 2 }, { characters: [{ id: "capitan_rodrigo" }], addTags: ["ignored_garrison_needs"], resultText: "Rodrigo saluda, pero no oculta la mirada." }]
  ], { family: "army", families: ["army", "garrison"], weight: 1.05 }),

  event("deserter_mother", "Madre de desertor", "Una mujer pide clemencia para su hijo desertor. La sargenta Breña dice que si uno corre, otros mirarán la puerta.", [
    ["Perdonarlo y enviarlo a obras", { people: 3, army: -3 }, { characters: [{ id: "sargenta_brena" }], addTags: ["deserter_spared"], resultText: "La madre llora de alivio; la tropa cuenta precedentes." }],
    ["Castigo público sin muerte", { army: 2, people: -2 }, { characters: [{ id: "sargenta_brena" }], addTags: ["deserter_whipped"], resultText: "La disciplina se mantiene con un sonido que nadie olvida." }],
    ["Ejecutarlo", { army: 4, people: -5, threat: -1 }, { addTags: ["deserter_executed"], resultText: "La plaza aprende qué pesa más: ley o sangre." }]
  ], { family: "army", families: ["army", "people"], weight: 1 }),

  event("watch_bribes", "Guardias con bolsas", "La alguacil Inés sospecha que algunos guardias cobran por mirar a otro lado en la puerta oeste.", [
    ["Investigar en secreto", { gold: -2 }, { characters: [{ id: "alguacil_ines" }], defer: [{ delay: 4, branches: [{ probability: 0.55, eventId: "bribes_confirmed" }, { probability: 0.45, eventId: "bribes_false_lead" }] }], resultText: "Inés coloca ojos donde antes había manos abiertas." }],
    ["Cambiar la guardia entera", { army: -2, threat: -3 }, { characters: [{ id: "alguacil_ines" }], addTags: ["west_gate_rotated"], resultText: "La puerta oeste despierta con caras nuevas." }],
    ["Ignorar rumores", { gold: 2, threat: 3 }, { addTags: ["ignored_watch_bribes"], defer: [{ delay: 5, eventId: "smugglers_west_gate" }], resultText: "Los rumores aprenden a cobrar peaje." }]
  ], { family: "spy", families: ["spy", "army", "corruption"], weight: 1.05 }),

  event("bandit_pardon_offer", "Bandidos piden perdón", "Un grupo de bandidos ofrece entregar armas si se les permite trabajar en la cantera. La sargenta Breña duda de las manos limpias.", [
    ["Aceptar con vigilancia", { threat: -4, army: -1, people: 2 }, { characters: [{ id: "sargenta_brena" }], addTags: ["bandits_reformed"], defer: [{ delay: 6, branches: [{ probability: 0.70, eventId: "bandits_work_quarry" }, { probability: 0.30, eventId: "bandits_escape_quarry" }] }], resultText: "Las armas bajan. Los ojos de la guardia, no." }],
    ["Reclutarlos como exploradores", { army: 3, threat: 2 }, { addTags: ["bandits_recruited"], resultText: "Conocen los caminos. También conocen cómo traicionarlos." }],
    ["Colgarlos", { threat: -5, people: -3 }, { addTags: ["bandits_hanged"], resultText: "El camino queda más seguro y más silencioso." }]
  ], { family: "spy", families: ["spy", "army", "people"], weight: 1 }),

  event("missing_prisoner", "Celda vacía", "Un preso desaparece de una celda cerrada. La alguacil Inés no pregunta si escapó, sino quién abrió.", [
    ["Interrogar carceleros", { threat: -2, people: -1 }, { characters: [{ id: "alguacil_ines" }], issues: [{ action: "create", issue: { id: "jail-corruption", actorId: "alguacil_ines", type: "corruption", stage: 0, tension: 45, trust: 50, tags: ["jail"] } }], defer: [{ delay: 5, eventId: "jail_corruption_thread" }], resultText: "Las llaves empiezan a pesar más que antes." }],
    ["Ofrecer recompensa", { gold: -4, threat: -3 }, { addTags: ["prisoner_bounty"], resultText: "Media ciudad recuerda haber visto algo." }],
    ["Ocultarlo", { nobility: 1, threat: 4 }, { addTags: ["hidden_escape"], resultText: "Una celda vacía es fácil de tapar. Una historia, menos." }]
  ], { family: "spy", families: ["spy", "corruption"], weight: 1 }),

  event("training_accident", "Accidente de entrenamiento", "Un recluta cae durante práctica de lanza. El capitán pide pagar a la familia; el maestro de armas pide no parecer débil.", [
    ["Pensión a la familia", { gold: -4, people: 3, army: 1 }, { characters: [{ id: "capitan_rodrigo" }], addTags: ["soldier_family_pension"], resultText: "La guarnición aprende que no será olvidada." }],
    ["Funeral militar", { faith: 1, army: 2 }, { addTags: ["military_funeral"], resultText: "Los tambores cubren la incomodidad." }],
    ["Nada especial", { gold: 2, army: -3 }, { addTags: ["soldier_death_ignored"], resultText: "La familia recibe silencio con sello." }]
  ], { family: "army", families: ["army", "people", "clergy"], weight: 0.95 }),

  event("blackmail_letter", "Carta de chantaje", "El Cuervo Gris ofrece una carta que compromete a un consejero. Su precio es alto porque el miedo siempre lo es.", [
    ["Comprar la carta", { gold: -5, nobility: 2 }, { characters: [{ id: "cuervo_gris" }], addTags: ["blackmail_letter_bought"], resultText: "La carta cambia de manos y no de naturaleza." }],
    ["Tender trampa al Cuervo", { outcomes: [{ probability: 0.45, immediate: { threat: -4 }, text: "La trampa captura a un mensajero del Cuervo, no al Cuervo." }, { probability: 0.55, immediate: { threat: 3, nobility: -1 }, text: "El Cuervo olía la trampa antes de que existiera." }] }, { characters: [{ id: "cuervo_gris" }], addTags: ["tried_trapping_crow" ] }],
    ["Quemarla sin leer", { faith: 1, nobility: -2 }, { addTags: ["refused_blackmail"], resultText: "Hay virtudes que parecen imprudencia hasta que salvan el sueño." }]
  ], { family: "spy", families: ["spy", "nobility"], weight: 0.85 }),

  event("militia_drunk", "Milicia borracha", "La milicia local celebra una victoria que nadie recuerda haberles concedido. Sus lanzas descansan peor que sus jarras.", [
    ["Pagarles para irse a casa", { gold: -3, threat: -2, people: 1 }, { addTags: ["militia_sent_home"], resultText: "La fiesta termina con monedas y bostezos." }],
    ["Integrarlos en guardia", { army: 3, people: -2 }, { addTags: ["militia_absorbed"], resultText: "La guardia gana brazos y dolor de cabeza." }],
    ["Arrestar cabecillas", { threat: -3, people: -3 }, { addTags: ["militia_arrested"], resultText: "La resaca llega con grilletes." }]
  ], { family: "army", families: ["army", "people", "public_order"], weight: 0.9 }),

  event("smugglers_salt", "Sal sin sello", "Barriles de sal sin sello real aparecen en el mercado. Nadie confiesa comprarlos; todos confiesan necesitarlos.", [
    ["Confiscar sal", { food: 3, gold: 2, people: -2 }, { addTags: ["salt_confiscated"], resultText: "La ley gana barriles; las cocinas pierden paciencia." }],
    ["Legalizar con multa", { gold: 5, people: 1 }, { addTags: ["salt_amnesty"], resultText: "El contrabando se convierte en impuesto con una firma." }],
    ["Seguir la ruta", { gold: -2, threat: -2 }, { addTags: ["salt_route_followed"], defer: [{ delay: 5, eventId: "salt_smuggler_ring" }], resultText: "Un barril nunca camina solo." }]
  ], { family: "spy", families: ["spy", "merchants", "smuggling"], weight: 1 }),

  event("old_siege_engine", "Máquina de asedio vieja", "En un cobertizo aparece una vieja máquina de asedio. Podría defender la ciudad, decorar una plaza o matar a quien la toque.", [
    ["Restaurarla", { gold: -6, army: 5 }, { addTags: ["siege_engine_restored"], defer: [{ delay: 5, branches: [{ probability: 0.65, eventId: "siege_engine_ready" }, { probability: 0.35, eventId: "siege_engine_accident" }] }], resultText: "Los carpinteros miran la máquina como a un animal dormido." }],
    ["Vender la madera", { gold: 4, army: -1 }, { addTags: ["siege_engine_scrapped"], resultText: "La defensa se convierte en tablas." }],
    ["Exhibirla", { nobility: 2, people: 1 }, { addTags: ["siege_engine_displayed"], resultText: "La plaza gana un monstruo domesticado." }]
  ], { family: "army", families: ["army", "public_works"], weight: 0.85 }),

  event("veteran_beggar", "Veterano en la escalinata", "Un veterano sin pierna duerme bajo tu escudo. Rodrigo dice que sirvió bien. La corte dice que afea la entrada.", [
    ["Crear pensión de veteranos", { gold: -6, army: 4, people: 3 }, { addTags: ["veteran_pension"], resultText: "Los viejos soldados enderezan la espalda." }],
    ["Darle trabajo de portero", { gold: -2, army: 2 }, { addTags: ["veteran_employed"], resultText: "El veterano vuelve a guardar una puerta, aunque sea sentado." }],
    ["Retirarlo de la vista", { nobility: 2, people: -3, army: -2 }, { addTags: ["veteran_removed"], resultText: "La escalinata queda limpia. Demasiado limpia." }]
  ], { family: "army", families: ["army", "people", "nobility"], weight: 0.95 }),

  event("patched_boots_hold", "Cuero suficiente", "Las botas remendadas aguantan una semana de patrullas. A veces la austeridad no muerde.", [
    ["Agradecer al zapatero", { people: 2, army: 1 }, { addTags: ["shoemaker_thanked"] }],
    ["Encargar más remiendos", { gold: -2, army: 2 }, { addTags: ["repair_policy"] }]
  ], { kind: "consequence", family: "army" }),

  event("patched_boots_fail", "Ampollas en la guardia", "Las botas remendadas se abren con lluvia. La guardia patrulla menos y maldice mejor.", [
    ["Comprar botas por fin", { gold: -6, army: 3 }, { addTags: ["late_boot_purchase"] }],
    ["Reducir patrullas", { army: -2, threat: 3 }, { addTags: ["patrols_reduced"] }]
  ], { kind: "consequence", family: "army" }),

  event("bribes_confirmed", "Puerta comprada", "La investigación confirma sobornos en la puerta oeste. No era una grieta: era una puerta abierta.", [
    ["Purgar guardias", { army: -3, threat: -5 }, { addTags: ["gate_bribes_purged"] }],
    ["Usarlos como doble agentes", { gold: -2, threat: -4 }, { addTags: ["bribed_guards_flipped"] }]
  ], { kind: "consequence", family: "spy" }),

  event("bribes_false_lead", "Soborno imaginado", "Inés no encuentra bolsas ocultas, solo rivalidades internas y un guardia demasiado odiado.", [
    ["Restituir honor", { army: 2, people: 1 }, { addTags: ["guard_cleared"] }],
    ["Mantener vigilancia", { gold: -2, threat: -1 }, { addTags: ["gate_watch_continues"] }]
  ], { kind: "consequence", family: "spy" }),

  event("smugglers_west_gate", "Sacos por la puerta oeste", "Al ignorar los sobornos, la puerta oeste se convirtió en garganta de contrabando.", [
    ["Cerrar la puerta temporalmente", { gold: -3, threat: -4 }, { addTags: ["west_gate_closed"] }],
    ["Operación nocturna", { army: -2, threat: -5 }, { addTags: ["west_gate_raid"] }]
  ], { kind: "consequence", family: "spy", requiresTags: ["ignored_watch_bribes"] }),

  event("bandits_work_quarry", "Bandidos con pico", "Los antiguos bandidos trabajan la cantera bajo vigilancia. No cantan, pero tampoco roban.", [
    ["Reducir vigilancia", { army: 2, people: 1 }, { addTags: ["reformed_bandits_trusted"] }],
    ["Mantener cadenas", { threat: -2, people: -1 }, { addTags: ["bandits_kept_chained"] }]
  ], { kind: "consequence", family: "spy", requiresTags: ["bandits_reformed"] }),

  event("bandits_escape_quarry", "La cantera vacía", "Los bandidos aceptaron el perdón hasta que encontraron una noche sin luna.", [
    ["Perseguirlos", { army: -3, threat: -3 }, { addTags: ["escaped_bandits_hunted"] }],
    ["Culpar al vigilante", { people: -1, threat: -1 }, { addTags: ["quarry_guard_punished"] }]
  ], { kind: "consequence", family: "spy", requiresTags: ["bandits_reformed"] }),

  event("jail_corruption_thread", "Llaves vendidas", "Inés encuentra marcas de cera en las llaves de la cárcel. Alguien copió más que metal: copió autoridad.", [
    ["Cambiar cerraduras", { gold: -4, threat: -3 }, { issues: [{ action: "resolve", issueId: "jail-corruption", addTags: ["jail_locks_changed"] }] }],
    ["Tender celda trampa", { gold: -2, threat: -4 }, { issues: [{ action: "modify", issueId: "jail-corruption", tension: -12, trust: 5 }] }]
  ], { kind: "consequence", family: "spy", issue: { id: "jail-corruption" } }),

  event("salt_smuggler_ring", "Anillo de sal", "Seguir los barriles revela una red pequeña, organizada y sorprendentemente popular.", [
    ["Desmantelarla", { threat: -5, people: -2 }, { addTags: ["salt_ring_broken"] }],
    ["Convertirla en licencia", { gold: 6, people: 1 }, { addTags: ["salt_ring_licensed"] }]
  ], { kind: "consequence", family: "spy", requiresTags: ["salt_route_followed"] }),

  event("siege_engine_ready", "La vieja máquina despierta", "La máquina de asedio vuelve a moverse sin matar a nadie. Los soldados la miran como si fuera un santo con ruedas.", [
    ["Asignarla a muralla", { army: 4, threat: -3 }, { addTags: ["siege_engine_wall"] }],
    ["Usarla para intimidar", { nobility: 2, threat: -2 }, { addTags: ["siege_engine_paraded"] }]
  ], { kind: "consequence", family: "army", requiresTags: ["siege_engine_restored"] }),

  event("siege_engine_accident", "Brazo roto de madera", "La máquina restaurada lanza una viga contra una pared y dos ayudantes. El pasado no siempre quiere servir.", [
    ["Pagar sanadores", { gold: -4, people: 2 }, { addTags: ["siege_accident_aid"] }],
    ["Desmontarla", { army: -2, gold: 2 }, { addTags: ["siege_engine_dismantled"] }]
  ], { kind: "consequence", family: "army", requiresTags: ["siege_engine_restored"] })
]);

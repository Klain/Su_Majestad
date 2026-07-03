registerEvents([
  event("southern_fever", "Fiebre del sur", "El doctor Avelino informa de una fiebre leve en el barrio de curtidores. Leve es una palabra que cambia deprisa.", [
    ["Cuarentena temprana", { gold: -4, people: -2, threat: -4 }, { characters: [{ id: "doctor_avelino" }], addTags: ["early_quarantine"], resultText: "Las puertas cerradas duelen antes de salvar." }],
    ["Enviar sanadores", { gold: -5, people: 3 }, { characters: [{ id: "doctor_avelino" }, { id: "isolda_matrona" }], defer: [{ delay: 5, branches: [{ probability: 0.65, eventId: "fever_contained" }, { probability: 0.35, eventId: "fever_spreads" }] }], resultText: "Sanadores y hierbas entran donde el miedo ya estaba." }],
    ["Esperar informes", { gold: 1, threat: 3 }, { addTags: ["delayed_fever_response"], defer: [{ delay: 4, eventId: "fever_spreads" }], resultText: "La fiebre agradece la paciencia." }]
  ], { family: "disease", families: ["disease", "people"], weight: 1.1 }),

  event("storm_roofs", "Tejados contra el viento", "Una tormenta arranca tejas en tres barrios. Los nobles piden proteger palomares; el pueblo pide no mojar camas.", [
    ["Reparar barrios pobres", { gold: -5, people: 5, nobility: -2 }, { addTags: ["poor_roofs_repaired"], resultText: "La lluvia sigue cayendo, pero no sobre las mantas rotas." }],
    ["Repartir materiales", { gold: -3, people: 2 }, { addTags: ["roof_materials_shared"], defer: [{ delay: 4, branches: [{ probability: 0.60, eventId: "roofs_fixed_by_neighbors" }, { probability: 0.40, eventId: "roof_materials_stolen" }] }], resultText: "La ciudad recibe madera, clavos y tentaciones." }],
    ["Priorizar edificios nobles", { nobility: 4, people: -4 }, { addTags: ["noble_roofs_first"], resultText: "Los palomares sobreviven. Las camas, no todas." }]
  ], { family: "people", families: ["people", "nobility", "public_works"], weight: 0.95 }),

  event("strange_map_margin", "Nota en el margen", "Maese Ireo encuentra en un mapa viejo una nota que no estaba ayer: 'no cavéis donde la piedra canta'.", [
    ["Financiar prospección", { gold: -4 }, { characters: [{ id: "maese_ireo" }], addTags: ["singing_stone_survey"], defer: [{ delay: 7, branches: [{ probability: 0.45, eventId: "singing_stone_ore" }, { probability: 0.35, eventId: "singing_stone_nothing" }, { probability: 0.20, eventId: "singing_stone_collapse" }] }], resultText: "El mapa vuelve al escritorio con más alfileres." }],
    ["Archivar advertencia", { nobility: 1 }, { characters: [{ id: "maese_ireo" }], addTags: ["ignored_singing_stone"], resultText: "Algunas notas envejecen mejor cerradas." }],
    ["Entregarlo al monasterio", { faith: 2 }, { characters: [{ id: "maese_ireo" }, { id: "abad_berenguer" }], addTags: ["map_to_monastery"], resultText: "Los monjes copian el margen con letra temblorosa." }]
  ], { family: "exploration", families: ["exploration", "church"], weight: 0.9 }),

  event("foreign_envoy_gift", "Regalo de Qalat", "Samira de Qalat trae una alfombra bordada con la historia de una derrota que se parece demasiado a una advertencia.", [
    ["Aceptar con honores", { nobility: 2 }, { characters: [{ id: "embajadora_samira" }], addTags: ["accepted_qalat_gift"], resultText: "La alfombra decora la sala y la conversación." }],
    ["Responder con regalo mayor", { gold: -6, nobility: 3 }, { characters: [{ id: "embajadora_samira" }], addTags: ["outgifted_qalat"], resultText: "Samira sonríe como quien gana perdiendo." }],
    ["Preguntar por la derrota", { threat: -2, nobility: -1 }, { characters: [{ id: "embajadora_samira" }], addTags: ["questioned_qalat_warning"], defer: [{ delay: 6, eventId: "qalat_plain_words" }], resultText: "La cortesía pierde una capa." }]
  ], { family: "diplomacy", families: ["diplomacy", "nobility"], weight: 0.85 }),

  event("heir_bad_poem", "Poema del heredero", "El heredero recita un poema terrible ante la corte. Nadie sabe si aplaudir por amor o por supervivencia política.", [
    ["Aplaudir con entusiasmo", { nobility: 2, people: -1 }, { addTags: ["heir_praised_anyway"], resultText: "El heredero brilla. La poesía no." }],
    ["Corregirlo con cariño", { nobility: -1, people: 2 }, { addTags: ["heir_honest_lesson"], resultText: "El niño aprende que una corona no mejora los versos." }],
    ["Nombrar tutor literario", { gold: -3, nobility: 1 }, { addTags: ["heir_tutor_hired"], defer: [{ delay: 7, eventId: "heir_tutor_report" }], resultText: "El heredero gana maestro; la corte, esperanza." }]
  ], { family: "royal_family", families: ["royal_family", "nobility", "people"], weight: 0.75 }),

  event("border_shepherds", "Pastores de la linde", "Pastores de dos aldeas discuten por una colina. La frontera entre pastos parece más peligrosa que muchas murallas.", [
    ["Marcar lindes reales", { gold: -3, people: 3, threat: -2 }, { addTags: ["pasture_boundary_marked"], resultText: "Las piedras reales separan ovejas y orgullo." }],
    ["Dar la colina a quien pague", { gold: 5, people: -4 }, { addTags: ["pasture_sold"], defer: [{ delay: 5, eventId: "pasture_grudge" }], resultText: "La colina cambia de dueño; el rencor no." }],
    ["Enviar mediador religioso", { faith: 2, people: 1 }, { addTags: ["pasture_mediated_by_church"], resultText: "El mediador promete que Dios prefiere ovejas vivas." }]
  ], { family: "border", families: ["border", "people", "church"], weight: 0.9 }),

  event("frozen_road", "Camino helado", "El camino norte se ha vuelto una cinta de hielo. Los carros se retrasan y los juramentos llegan antes que la comida.", [
    ["Echar sal real", { gold: -3, food: 2 }, { addTags: ["salted_north_road"], resultText: "El hielo cede con desgana." }],
    ["Cerrar ruta temporalmente", { food: -3, threat: -2 }, { addTags: ["north_road_closed_ice"], resultText: "Nadie cae al barranco. Nadie llega tampoco." }],
    ["Permitir paso bajo riesgo", { outcomes: [{ probability: 0.55, immediate: { food: 4, gold: 2 }, text: "Los carros cruzan con ruedas lentas y plegarias rápidas." }, { probability: 0.45, immediate: { food: -4, people: -2 }, text: "Un carro cae y el hielo cobra peaje." }] }, { addTags: ["risked_icy_road"] }]
  ], { family: "commerce", families: ["commerce", "people", "border"], weight: 0.85 }),

  event("midwife_herbs", "Hierbas de Isolda", "Isolda la Matrona pide permiso para cultivar hierbas medicinales en un terreno real abandonado.", [
    ["Ceder terreno", { people: 4, faith: -1 }, { characters: [{ id: "isolda_matrona" }], addTags: ["healer_garden"], resultText: "El terreno viejo empieza a oler a menta y sospecha clerical." }],
    ["Ponerla bajo supervisión del médico", { gold: -2, people: 2 }, { characters: [{ id: "isolda_matrona" }, { id: "doctor_avelino" }], addTags: ["supervised_healer_garden"], resultText: "Isolda acepta supervisión como quien acepta lluvia." }],
    ["Negarlo", { faith: 2, people: -3 }, { characters: [{ id: "isolda_matrona" }], addTags: ["healer_garden_denied"], resultText: "La Iglesia duerme tranquila; los enfermos, no tanto." }]
  ], { family: "disease", families: ["disease", "people", "church"], weight: 0.9 }),

  event("falcon_lost", "Halcón perdido", "El halcón favorito de un noble ha desaparecido. Ofrece recompensa y culpa a niños, criados y quizá al viento.", [
    ["Ayudar en la búsqueda", { gold: -2, nobility: 3 }, { addTags: ["searched_noble_falcon"], resultText: "Medio reino mira árboles por un pájaro caro." }],
    ["Ignorar el capricho", { people: 2, nobility: -3 }, { addTags: ["ignored_falcon_drama"], resultText: "El pueblo agradece que la corona sepa distinguir plumas de problemas." }],
    ["Cobrar tasa de búsqueda", { gold: 3, nobility: -1 }, { addTags: ["falcon_search_tax"], resultText: "El noble paga por su amor emplumado." }]
  ], { family: "nobility", families: ["nobility", "people"], weight: 0.7 }),

  event("river_bones", "Huesos en el río", "Un niño encuentra huesos humanos junto al río. Nadie sabe si son antiguos, recientes o útiles para acusar al vecino.", [
    ["Investigar con alguacil", { gold: -2, threat: -2 }, { characters: [{ id: "alguacil_ines" }], addTags: ["river_bones_investigated"], defer: [{ delay: 5, branches: [{ probability: 0.50, eventId: "river_bones_old" }, { probability: 0.50, eventId: "river_bones_recent" }] }], resultText: "Inés acordona barro y rumores." }],
    ["Entierro religioso", { faith: 3, people: 1 }, { addTags: ["river_bones_buried"], resultText: "Los huesos descansan antes de contar su historia." }],
    ["Decir que son de animales", { threat: 2 }, { addTags: ["river_bones_dismissed"], resultText: "El río no confirma ni desmiente." }]
  ], { family: "crime", families: ["crime", "church", "people"], weight: 0.85 }),

  event("rain_after_drought", "Lluvia tardía", "Tras semanas secas, la lluvia cae con fuerza. Los campesinos ríen hasta que los caminos empiezan a deshacerse.", [
    ["Celebrar rogativa cumplida", { faith: 3, food: 3 }, { addTags: ["rain_thanked"], resultText: "La lluvia parece bendición mientras no mire los caminos." }],
    ["Reforzar caminos", { gold: -4, food: 2 }, { addTags: ["mud_roads_reinforced"], resultText: "El barro encuentra menos víctimas." }],
    ["Dejar que drene", { food: 4, threat: 2 }, { addTags: ["rain_unmanaged"], defer: [{ delay: 4, eventId: "mud_blocks_carts" }], resultText: "El agua baja por donde quiere." }]
  ], { family: "people", families: ["people", "commerce", "public_works"], weight: 0.9 }),

  event("old_treaty_clause", "Cláusula olvidada", "Samira encuentra en un tratado viejo una cláusula que obliga a intercambiar rehenes nobles en tiempo de tensión. La tinta vieja todavía muerde.", [
    ["Honrar la cláusula", { nobility: -3, threat: -4 }, { characters: [{ id: "embajadora_samira" }], addTags: ["old_treaty_honored"], resultText: "Los tratados respiran cuando duelen." }],
    ["Renegociarla", { gold: -3, threat: -2 }, { characters: [{ id: "embajadora_samira" }], addTags: ["old_treaty_renegotiated"], defer: [{ delay: 6, eventId: "qalat_counteroffer" }], resultText: "Samira acepta hablar; eso nunca significa ceder." }],
    ["Declararla caduca", { nobility: 2, threat: 5 }, { addTags: ["old_treaty_rejected"], resultText: "La corte aplaude. Los mapas no." }]
  ], { family: "diplomacy", families: ["diplomacy", "nobility", "border"], weight: 0.8 }),

  event("fever_contained", "Fiebre contenida", "Los sanadores contienen la fiebre antes de que aprenda el nombre de todas las calles.", [
    ["Premiar a sanadores", { gold: -3, people: 4 }, { addTags: ["healers_rewarded"] }],
    ["Registrar el método", { gold: -2, faith: 1 }, { addTags: ["fever_method_recorded"] }]
  ], { kind: "consequence", family: "disease" }),

  event("fever_spreads", "La fiebre conoce puertas", "La fiebre salta de casa en casa. Ya no es noticia médica: es miedo con temperatura.", [
    ["Cuarentena dura", { people: -5, threat: -5 }, { addTags: ["hard_fever_quarantine"] }],
    ["Hospital de campaña", { gold: -7, people: 3, faith: 1 }, { addTags: ["field_hospital"] }]
  ], { kind: "consequence", family: "disease" }),

  event("roofs_fixed_by_neighbors", "Vecinos en los tejados", "La madera repartida basta porque los vecinos suben a reparar juntos. La ciudad recuerda que también tiene manos.", [
    ["Enviar comida a voluntarios", { food: -2, people: 4 }, { addTags: ["roof_volunteers_fed"] }],
    ["Agradecimiento público", { people: 3, nobility: 1 }, { addTags: ["roof_volunteers_praised"] }]
  ], { kind: "consequence", family: "people" }),

  event("roof_materials_stolen", "Clavos desaparecidos", "Parte de la madera y los clavos acaba en almacenes privados antes de tocar un tejado.", [
    ["Perseguir robo", { gold: -2, threat: -3 }, { addTags: ["roof_thieves_hunted"] }],
    ["Repartir segunda tanda", { gold: -4, people: 3 }, { addTags: ["second_roof_materials"] }]
  ], { kind: "consequence", family: "crime" }),

  event("singing_stone_ore", "Piedra con plata", "Donde la piedra cantaba había una veta menor de plata. El mapa mentía con poesía útil.", [
    ["Explotarla", { gold: 9, threat: 2 }, { addTags: ["silver_vein_claimed"] }],
    ["Mantenerla secreta", { gold: 4, nobility: 2 }, { addTags: ["silver_vein_secret"] }]
  ], { kind: "consequence", family: "exploration", requiresTags: ["singing_stone_survey"] }),

  event("singing_stone_nothing", "Solo viento", "La piedra cantaba porque el viento atravesaba grietas. No hay plata, pero sí un paso oculto entre colinas.", [
    ["Marcar paso seguro", { threat: -3, gold: -1 }, { addTags: ["hidden_pass_marked"] }],
    ["Cobrar ruta nueva", { gold: 4 }, { addTags: ["hidden_pass_toll"] }]
  ], { kind: "consequence", family: "exploration", requiresTags: ["singing_stone_survey"] }),

  event("singing_stone_collapse", "La piedra se abre", "La prospección provoca un derrumbe. La montaña guardaba silencio por una razón.", [
    ["Rescatar mineros", { gold: -5, people: 3 }, { addTags: ["collapse_rescue"] }],
    ["Sellar el lugar", { threat: -3, people: -2 }, { addTags: ["singing_stone_sealed"] }]
  ], { kind: "consequence", family: "exploration", requiresTags: ["singing_stone_survey"] }),

  event("qalat_plain_words", "Palabras sin bordado", "Samira admite que la alfombra era advertencia: otros reinos miran tu frontera como mesa servida.", [
    ["Pedir pacto de información", { gold: -3, threat: -4 }, { addTags: ["qalat_intel_pact"] }],
    ["Mostrar fuerza", { army: -2, nobility: 2, threat: -2 }, { addTags: ["displayed_strength_to_qalat"] }]
  ], { kind: "consequence", family: "diplomacy", requiresTags: ["questioned_qalat_warning"] }),

  event("heir_tutor_report", "Informe del tutor", "El tutor del heredero informa que el niño no será poeta, pero aprende a escuchar críticas sin romper copas.", [
    ["Continuar lecciones", { gold: -2, nobility: 2 }, { addTags: ["heir_lessons_continue"] }],
    ["Presentarlo al pueblo", { people: 3, nobility: -1 }, { addTags: ["heir_seen_by_people"] }]
  ], { kind: "consequence", family: "royal_family", requiresTags: ["heir_tutor_hired"] }),

  event("pasture_grudge", "La colina vendida", "La aldea que perdió la colina ahora corta cercas de noche. Comprar paz con oro vendió otra cosa.", [
    ["Reabrir mediación", { gold: -2, people: 2, threat: -2 }, { addTags: ["pasture_reopened"] }],
    ["Castigar sabotajes", { threat: -3, people: -3 }, { addTags: ["pasture_saboteurs_punished"] }]
  ], { kind: "consequence", family: "border", requiresTags: ["pasture_sold"] }),

  event("river_bones_old", "Huesos antiguos", "Los huesos pertenecen a muertos de una guerra vieja. El río devolvió historia, no crimen.", [
    ["Monumento pequeño", { gold: -3, faith: 2, people: 2 }, { addTags: ["old_bones_memorial"] }],
    ["Archivo militar", { army: 1, nobility: 1 }, { addTags: ["old_bones_archived"] }]
  ], { kind: "consequence", family: "church", requiresTags: ["river_bones_investigated"] }),

  event("river_bones_recent", "Huesos recientes", "Inés confirma que los huesos son recientes. Alguien usó el río como juez.", [
    ["Abrir investigación criminal", { gold: -3, threat: -4 }, { addTags: ["river_murder_investigation"] }],
    ["Cerrar el río de noche", { people: -2, threat: -3 }, { addTags: ["river_night_closure"] }]
  ], { kind: "consequence", family: "crime", requiresTags: ["river_bones_investigated"] }),

  event("mud_blocks_carts", "Barro hasta los ejes", "Los carros quedan atrapados en caminos empapados. La lluvia dio vida al campo y hambre a la ciudad.", [
    ["Enviar cuadrillas", { gold: -4, food: 2 }, { addTags: ["mud_cleared"] }],
    ["Priorizar carros de grano", { army: -1, food: 4, people: -1 }, { addTags: ["grain_carts_prioritized"] }]
  ], { kind: "consequence", family: "commerce", requiresTags: ["rain_unmanaged"] }),

  event("qalat_counteroffer", "Contraoferta de Qalat", "Samira acepta retirar la cláusula de rehenes si entregas paso preferente a sus caravanas.", [
    ["Aceptar paso preferente", { gold: 3, nobility: -2, threat: -3 }, { addTags: ["qalat_preferred_passage"] }],
    ["Ofrecer tributo menor", { gold: -4, threat: -2 }, { addTags: ["qalat_minor_tribute"] }]
  ], { kind: "consequence", family: "diplomacy", requiresTags: ["old_treaty_renegotiated"] })
]);

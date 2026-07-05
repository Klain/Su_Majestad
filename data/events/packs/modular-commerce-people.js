registerEvents([
  event("forge_cold_coal", "Carbón húmedo", "Tomás de la Fragua llega con las manos negras y la voz seca: sin carbón seco, la forja se apagará justo cuando más encargos hay.", [
    ["Comprar carbón de reserva", { gold: -5, army: 2 }, { characters: [{ id: "tomas_fragua" }], addTags: ["forge_supplied"], resultText: "La forja vuelve a respirar durante la noche." }],
    ["Priorizar herramientas agrícolas", { food: 3, army: -2 }, { characters: [{ id: "tomas_fragua" }], addTags: ["tools_before_weapons"], resultText: "Los campesinos bendicen las nuevas azadas; la guardia frunce el ceño." }],
    ["Que espere al próximo cargamento", {}, { characters: [{ id: "tomas_fragua" }], addTags: ["forge_delayed"], defer: [{ delay: 4, branches: [{ probability: 0.55, eventId: "forge_recovers" }, { probability: 0.45, eventId: "forge_backlog" }] }], resultText: "Tomás acepta, pero mira la fragua como quien mira una tumba pequeña." }]
  ], { family: "merchants", families: ["merchants", "army"], weight: 1.1 }),

  event("market_scales_false", "Pesas falsas", "La alguacil Inés trae una bolsa de pesas trucadas del mercado. Los vendedores juran que todos hacen lo mismo.", [
    ["Registrar todos los puestos", { gold: 4, people: -2 }, { characters: [{ id: "alguacil_ines" }, { id: "gremio_mercaderes" }], addTags: ["market_inspections"], resultText: "La corona cobra multas, pero el mercado se vuelve hostil al paso de la guardia." }],
    ["Multar solo al culpable", { gold: 2, people: 1 }, { characters: [{ id: "alguacil_ines" }], addTags: ["measured_justice"], resultText: "El castigo parece justo, aunque algunos tenderos esconden las pesas al verte pasar." }],
    ["Mirar hacia otro lado", {}, { addTags: ["ignored_market_fraud"], defer: [{ delay: 5, eventId: "market_fraud_spreads" }], resultText: "El mercado recupera el ruido normal demasiado deprisa." }]
  ], { family: "merchants", families: ["merchants", "spy"], weight: 1 }),

  event("inn_brawl", "Bronca en la Oca Tuerta", "Marta la Posadera pide ayuda antes de que una pelea entre carreteros y soldados convierta su sala en astillas.", [
    ["Enviar guardias sobrios", { army: -1, people: 2, threat: -2 }, { characters: [{ id: "marta_posadera" }, { id: "capitan_rodrigo" }], addTags: ["kept_inn_order"], resultText: "La taberna queda en pie y Marta recuerda quién salvó sus mesas." }],
    ["Hacer pagar los daños", { gold: 3, army: -2 }, { characters: [{ id: "marta_posadera" }], addTags: ["charged_brawlers"], resultText: "Los culpables pagan, pero los soldados salen mascullando." }],
    ["Dejar que se arreglen solos", { people: -2 }, { characters: [{ id: "marta_posadera" }], addTags: ["ignored_inn_brawl"], defer: [{ delay: 3, eventId: "inn_rumor_mill" }], resultText: "La pelea termina; los rumores empiezan." }]
  ], { family: "merchants", families: ["merchants", "army", "people"], weight: 1 }),

  event("flour_short_measure", "Harina corta", "Alda la Panadera enseña sacos que pesan menos de lo pactado. Si sube el precio del pan, el barrio bajo lo notará antes que la corte.", [
    ["Subvencionar harina", { gold: -5, people: 4 }, { characters: [{ id: "alda_panadera" }], addTags: ["bread_subsidy"], resultText: "El pan sigue barato, al menos por ahora." }],
    ["Investigar al molino", { gold: -2 }, { characters: [{ id: "alda_panadera" }], issues: [{ action: "create", issue: { id: "flour-shortage", actorId: "alda_panadera", type: "shortage", stage: 0, tension: 35, trust: 50, tags: ["flour"] } }], defer: [{ delay: 4, branches: [{ probability: 0.60, eventId: "mill_found_guilty" }, { probability: 0.40, eventId: "flour_bad_harvest" }] }], resultText: "El molino queda bajo sospecha." }],
    ["Permitir subir el pan", { people: -5, gold: 2 }, { characters: [{ id: "alda_panadera" }], addTags: ["bread_price_rises"], resultText: "El pan se vende; la paciencia popular se vende peor." }]
  ], { family: "people", families: ["people", "merchants", "shortage"], weight: 1.15 }),

  event("dockless_fish", "Pescado sin muelle", "Unos pescadores de río han traído barriles de pescado, pero no hay espacio seco donde salarlo antes de que se eche a perder.", [
    ["Abrir almacenes reales", { food: 5, gold: -3 }, { addTags: ["royal_warehouses_shared"], resultText: "El pescado se conserva y el olor invade medio barrio." }],
    ["Venderlo rápido y barato", { food: 2, people: 3 }, { addTags: ["cheap_fish_day"], resultText: "Por una tarde, hasta los pobres comen con grasa en los dedos." }],
    ["Cobrar permiso de uso", { gold: 4 }, { addTags: ["warehouse_tolls"], defer: [{ delay: 5, eventId: "fishmongers_complain" }], resultText: "Los cofres ganan unas monedas; los pescadores pierden la sonrisa." }]
  ], { family: "merchants", families: ["merchants", "seneschal", "people"], weight: 0.95 }),

  event("widow_tax_receipt", "Recibo de una viuda", "Una viuda muestra dos recibos por el mismo impuesto. El recaudador dice que la tinta vieja siempre confunde a los pobres.", [
    ["Devolver el segundo pago", { gold: -3, people: 4 }, { addTags: ["tax_mercy_smallfolk"], resultText: "La viuda besa el sello real como si fuera pan." }],
    ["Auditar al recaudador", { gold: -1 }, { issues: [{ action: "create", issue: { id: "tax-corruption", actorId: "tax_collectors", type: "corruption", stage: 0, tension: 40, trust: 35, tags: ["taxes"] } }], defer: [{ delay: 5, branches: [{ probability: 0.55, eventId: "tax_corruption_found" }, { probability: 0.45, eventId: "tax_collectors_close_ranks" }] }], resultText: "Los recaudadores aprenden que alguien revisa sus libros." }],
    ["Confirmar la deuda", { gold: 3, people: -4 }, { addTags: ["taxes_over_mercy"], resultText: "La ley queda limpia. Tu nombre, un poco menos." }]
  ], { family: "people", families: ["people", "merchants", "corruption"], weight: 1.05 }),

  event("bridge_toll_argument", "Peaje en el puente", "Carreteros y aldeanos se bloquean en el puente viejo. Unos quieren peaje para repararlo; otros dicen que ya pagan con barro y huesos.", [
    ["Autorizar peaje temporal", { gold: 4, people: -2 }, { addTags: ["bridge_toll"], issues: [{ action: "create", issue: { id: "bridge-repair", actorId: "carters", type: "public_works", stage: 0, tension: 32, trust: 45, tags: ["bridge"] } }], resultText: "El puente tendrá dinero; el camino, quejas." }],
    ["Pagar reparación real", { gold: -6, people: 3 }, { addTags: ["royal_bridge_repair"], resultText: "Los carros cruzan sin detenerse y algunos bendicen tu escudo." }],
    ["Posponer la decisión", {}, { addTags: ["bridge_delayed"], defer: [{ delay: 4, eventId: "bridge_cart_falls" }], resultText: "El puente cruje como si hubiera escuchado." }]
  ], { family: "people", families: ["people", "merchants", "public_works"], weight: 1 }),

  event("night_market", "Mercado nocturno", "El gremio propone abrir un mercado nocturno con lámparas, música y tasas dobles. La alguacil pregunta quién vigilará las sombras.", [
    ["Aprobar con guardia", { gold: 5, army: -2, people: 2 }, { characters: [{ id: "gremio_mercaderes" }, { id: "alguacil_ines" }], addTags: ["night_market_allowed"], resultText: "La noche gana luces y también bolsillos abiertos." }],
    ["Aprobar sin gasto real", { gold: 6, threat: 3 }, { addTags: ["unwatched_night_market"], defer: [{ delay: 4, branches: [{ probability: 0.55, eventId: "night_market_prospers" }, { probability: 0.45, eventId: "night_market_knives" }] }], resultText: "Las monedas cantan más alto que las advertencias." }],
    ["Prohibirlo", { nobility: 1, people: -2 }, { addTags: ["night_market_banned"], resultText: "La ciudad duerme más pronto y murmura más bajo." }]
  ], { family: "merchants", families: ["merchants", "spy", "people"], weight: 1 }),

  event("orphan_apprentices", "Aprendices huérfanos", "Los talleres quieren tomar huérfanos como aprendices. La propuesta huele a caridad... y a mano de obra barata.", [
    ["Aprobar con salario mínimo", { gold: -2, people: 4 }, { addTags: ["protected_apprentices"], resultText: "Los talleres gruñen, pero los niños comen." }],
    ["Aprobar sin condiciones", { gold: 3, people: -3 }, { addTags: ["cheap_apprentices"], defer: [{ delay: 6, eventId: "apprentice_abuses" }], resultText: "Los talleres se llenan de manos pequeñas y silencios grandes." }],
    ["Enviarles al monasterio", { faith: 3, people: 1 }, { addTags: ["orphans_to_church"], resultText: "El claustro abre camas. Los talleres cierran oportunidades." }]
  ], { family: "people", families: ["people", "merchants", "clergy"], weight: 0.95 }),

  event("grain_speculators", "Acaparadores de grano", "Se rumorea que varios comerciantes guardan grano esperando que el precio suba. Nadie vende hambre, dicen; solo oportunidad.", [
    ["Incautar reservas", { food: 8, nobility: -2, threat: -2 }, { addTags: ["seized_grain"], resultText: "Los graneros reales engordan y las casas ricas toman nota." }],
    ["Comprar discretamente", { gold: -7, food: 6 }, { addTags: ["quiet_grain_buyout"], resultText: "El pueblo ve pan; no ve el agujero en los cofres." }],
    ["Dejar que el mercado decida", { gold: 3, people: -5 }, { addTags: ["free_grain_market"], defer: [{ delay: 5, eventId: "bread_riot_warning" }], resultText: "Los precios aprenden a trepar." }]
  ], { family: "merchants", families: ["merchants", "people", "shortage"], weight: 1.05 }),

  event("old_well_crack", "Pozo agrietado", "El pozo del barrio bajo se ha agrietado. La gente aún bebe, pero ya mira el agua antes de bendecirse.", [
    ["Repararlo ya", { gold: -5, people: 4 }, { addTags: ["well_repaired"], resultText: "El agua vuelve clara y el barrio respira." }],
    ["Enviar inspectores", { gold: -2 }, { defer: [{ delay: 3, branches: [{ probability: 0.65, eventId: "well_fixed_cheap" }, { probability: 0.35, eventId: "well_water_sick" }] }], resultText: "Los inspectores bajan cubos y suben dudas." }],
    ["Sellarlo y racionar agua", { people: -3, threat: -2 }, { addTags: ["water_rationed"], resultText: "El barrio no enferma, pero aprende a maldecir con sed." }]
  ], { family: "people", families: ["people", "apothecary", "public_works"], weight: 1 }),

  event("merchant_loan_offer", "Préstamo del gremio", "El Gremio de Mercaderes ofrece un préstamo sin preguntas. Lo preocupante no es el oro: es la sonrisa.", [
    ["Aceptar condiciones", { gold: 10 }, { characters: [{ id: "gremio_mercaderes" }], addTags: ["merchant_debt"], defer: [{ delay: 7, eventId: "merchant_debt_called" }], resultText: "Los cofres pesan más; también tu cuello." }],
    ["Negociar interés menor", { outcomes: [{ probability: 0.55, immediate: { gold: 7 }, text: "El gremio acepta menos interés, sorprendido por tu firmeza." }, { probability: 0.45, immediate: { gold: 3, nobility: -1 }, text: "El gremio reduce la oferta y difunde que la corona regatea como mendiga." }] }, { characters: [{ id: "gremio_mercaderes" }], addTags: ["merchant_loan_negotiated"] }],
    ["Rechazarlo", { nobility: 2 }, { addTags: ["refused_merchant_debt"], resultText: "Algunos nobles celebran que la corona no se arrodille ante tenderos." }]
  ], { family: "merchants", families: ["merchants", "nobility"], weight: 0.9 }),

  event("laundry_tax", "Impuesto a las lavanderas", "Un consejero propone gravar las lavanderas del río. Dice que el agua es real. Ellas dicen que la espalda no.", [
    ["Aprobar el impuesto", { gold: 4, people: -4 }, { addTags: ["laundry_tax"], resultText: "Las sábanas quedan limpias; tu nombre, menos." }],
    ["Proteger el oficio", { people: 3, nobility: -1 }, { addTags: ["protected_laundry_workers"], resultText: "Las lavanderas golpean la ropa contra la piedra como si aplaudieran." }],
    ["Cambiarlo por tasa a tintoreros", { gold: 3 }, { addTags: ["dye_tax"], defer: [{ delay: 4, eventId: "dyers_blue_hands" }], resultText: "El impuesto cambia de manos, pero no desaparece." }]
  ], { family: "people", families: ["people", "merchants"], weight: 0.85 }),

  event("caravan_overloaded", "Caravana sobrecargada", "Una caravana del norte pide cruzar con carros demasiado pesados para el camino. Si se rompen los ejes, bloquearán la ruta días.", [
    ["Obligar a descargar", { gold: -1, threat: -2 }, { addTags: ["strict_road_limits"], resultText: "Los carreteros protestan, pero el camino queda libre." }],
    ["Cobrar peaje de riesgo", { gold: 5 }, { addTags: ["risk_toll"], defer: [{ delay: 3, branches: [{ probability: 0.60, eventId: "caravan_crosses" }, { probability: 0.40, eventId: "caravan_breaks_road" }] }], resultText: "El peaje entra en caja antes que la prudencia." }],
    ["Enviar escolta de ingenieros", { gold: -3, army: -1 }, { addTags: ["engineered_crossing"], resultText: "La caravana cruza despacio y deja gratitud cansada." }]
  ], { family: "merchants", families: ["merchants", "public_works"], weight: 0.95 }),

  event("children_stones", "Niños con piedras", "Los niños del barrio alto y bajo se apedrean por una fuente. Los padres ya han empezado a discutir con herramientas en la mano.", [
    ["Separar turnos de agua", { people: 2, threat: -2 }, { addTags: ["water_turns"], resultText: "Nadie queda satisfecho, pero todos beben." }],
    ["Construir otra fuente", { gold: -6, people: 5 }, { addTags: ["new_fountain"], resultText: "La nueva fuente parece pequeña hasta que la gente sonríe." }],
    ["Castigar a los padres", { gold: 2, people: -3, threat: -1 }, { addTags: ["collective_punishment"], resultText: "La pelea cesa con rapidez. El resentimiento no." }]
  ], { family: "people", families: ["people", "public_order"], weight: 1 }),

  event("market_fraud_spreads", "Las pesas corren", "Las pesas falsas se han multiplicado. Ya no es un tendero tramposo: es una costumbre.", [
    ["Crear inspectores reales", { gold: -4, people: 3 }, { issues: [{ action: "create", issue: { id: "market-fraud", actorId: "gremio_mercaderes", type: "corruption", stage: 1, tension: 50, trust: 35, tags: ["market"] } }], addTags: ["market_watch_created"] }],
    ["Castigo ejemplar", { people: -2, threat: -4 }, { addTags: ["harsh_market_law"] }]
  ], { kind: "consequence", family: "merchants", families: ["merchants", "spy"] }),

  event("forge_recovers", "La forja aguanta", "El cargamento de carbón llega tarde, pero llega. Tomás trabaja dos noches seguidas para ponerse al día.", [
    ["Pagar horas extra", { gold: -3, army: 3 }, { addTags: ["forge_loyal"], characters: [{ id: "tomas_fragua" }] }],
    ["Exigir entrega completa", { army: 4, people: -2 }, { addTags: ["forge_pressed"], characters: [{ id: "tomas_fragua" }] }]
  ], { kind: "consequence", family: "merchants" }),

  event("forge_backlog", "Retraso en la forja", "Las armas y herramientas pendientes se acumulan. Tomás no pide perdón; pide tiempo.", [
    ["Reducir encargos militares", { food: 3, army: -3 }, { addTags: ["forged_tools_priority"], characters: [{ id: "tomas_fragua" }] }],
    ["Traer herreros de fuera", { gold: -5, army: 3 }, { addTags: ["foreign_smiths_hired"] }]
  ], { kind: "consequence", family: "merchants" }),

  event("mill_found_guilty", "El molino robaba peso", "La investigación confirma que el molinero vendía aire junto a la harina.", [
    ["Confiscar el molino", { food: 5, nobility: -2 }, { issues: [{ action: "resolve", issueId: "flour-shortage", addTags: ["mill_confiscated"] }] }],
    ["Multa y vigilancia", { gold: 4, people: 2 }, { issues: [{ action: "modify", issueId: "flour-shortage", tension: -15, trust: 8, addTags: ["watched_mill"] }] }]
  ], { kind: "consequence", family: "people", issue: { id: "flour-shortage" } }),

  event("flour_bad_harvest", "No era fraude", "El molino no robaba: simplemente no llegaba trigo suficiente. La escasez tiene peor cara cuando no hay culpable.", [
    ["Comprar trigo extranjero", { gold: -7, food: 7 }, { issues: [{ action: "resolve", issueId: "flour-shortage", addTags: ["imported_grain"] }] }],
    ["Racionar harina", { food: 3, people: -3 }, { issues: [{ action: "modify", issueId: "flour-shortage", tension: 10, trust: -6 }] }]
  ], { kind: "consequence", family: "people", issue: { id: "flour-shortage" } }),

  event("fishmongers_complain", "Olor a tasa", "Los pescaderos dicen que el permiso de almacén les dejó menos beneficio que espinas.", [
    ["Reducir la tasa", { gold: -2, people: 3 }, { addTags: ["fish_tax_reduced"] }],
    ["Mantenerla", { gold: 3, people: -2 }, { addTags: ["fish_tax_maintained"] }]
  ], { kind: "consequence", family: "merchants" }),

  event("tax_corruption_found", "Libros con doble fondo", "La auditoría encuentra pagos duplicados y recibos raspados. Los recaudadores han cobrado con dos manos.", [
    ["Devolver lo robado", { gold: -5, people: 6 }, { issues: [{ action: "resolve", issueId: "tax-corruption", addTags: ["tax_corruption_punished"] }] }],
    ["Quedarse parte como multa", { gold: 5, people: 2 }, { issues: [{ action: "resolve", issueId: "tax-corruption", addTags: ["tax_books_reformed"] }] }]
  ], { kind: "consequence", family: "people", issue: { id: "tax-corruption" } }),

  event("tax_collectors_close_ranks", "Los recaudadores se cubren", "Nadie recuerda nada, todos firman igual y los libros parecen haber sido ordenados por un santo sospechosamente rico.", [
    ["Cambiar la oficina entera", { gold: -4, people: 3 }, { issues: [{ action: "resolve", issueId: "tax-corruption", addTags: ["tax_office_replaced"] }] }],
    ["Forzar confesiones", { threat: -3, people: -2 }, { issues: [{ action: "escalate", issueId: "tax-corruption", tension: 12, trust: -10 }] }]
  ], { kind: "consequence", family: "people", issue: { id: "tax-corruption" } }),

  event("bridge_cart_falls", "Carro en el río", "El puente viejo cede bajo un carro de harina. Nadie muere, pero el río se lleva comida y paciencia.", [
    ["Reparación urgente", { gold: -7, people: 3, food: -2 }, { addTags: ["bridge_repaired_late"] }],
    ["Cortar el paso", { gold: -2, threat: -2, people: -2 }, { addTags: ["bridge_closed"] }]
  ], { kind: "consequence", family: "people" }),

  event("night_market_prospers", "La noche paga", "El mercado nocturno atrae viajeros, músicos y bolsillos generosos. Hasta la guardia compra empanadas.", [
    ["Formalizarlo", { gold: 6, people: 3 }, { addTags: ["night_market_chartered"] }],
    ["Subir tasas", { gold: 8, people: -2 }, { addTags: ["night_market_taxed"] }]
  ], { kind: "consequence", family: "merchants" }),

  event("night_market_knives", "Cuchillos bajo faroles", "Un robo termina en sangre entre puestos nocturnos. La ciudad pregunta si la corona vendió oscuridad por tasas.", [
    ["Cerrar durante una semana", { gold: -3, threat: -3 }, { addTags: ["night_market_suspended"] }],
    ["Duplicar guardia", { army: -3, people: 2, threat: -2 }, { addTags: ["night_guard_doubled"] }]
  ], { kind: "consequence", family: "spy" }),

  event("apprentice_abuses", "Aprendices marcados", "Un niño huye de un taller con la espalda llena de golpes. La caridad barata muestra su precio.", [
    ["Cerrar el taller", { gold: -2, people: 4 }, { addTags: ["abusive_workshop_closed"] }],
    ["Regular aprendizajes", { gold: -3, people: 3, nobility: -1 }, { addTags: ["apprenticeship_rules"] }]
  ], { kind: "consequence", family: "people" }),

  event("bread_riot_warning", "Cola ante el horno", "La subida del grano convierte la cola del pan en asamblea. Alda no teme vender menos: teme que rompan la puerta.", [
    ["Soltar reservas", { food: -5, people: 5, threat: -3 }, { characters: [{ id: "alda_panadera" }], addTags: ["bread_riot_prevented"] }],
    ["Enviar guardia", { army: -2, threat: -2, people: -3 }, { characters: [{ id: "capitan_rodrigo" }], addTags: ["bread_line_guarded"] }]
  ], { kind: "consequence", family: "people" }),

  event("well_fixed_cheap", "El pozo solo quería piedra", "Los inspectores descubren que bastan piedra y mortero. El barrio exageraba, pero tenía razón en preocuparse.", [
    ["Pagar reparación menor", { gold: -2, people: 3 }, { addTags: ["well_cheap_fix"] }],
    ["Cobrar al barrio", { gold: 2, people: -2 }, { addTags: ["well_local_charge"] }]
  ], { kind: "consequence", family: "people" }),

  event("well_water_sick", "Agua enferma", "Los primeros enfermos llegan con fiebre y manos frías. El pozo no estaba roto: estaba podrido.", [
    ["Cerrar y traer agua", { gold: -5, people: 2, threat: -2 }, { addTags: ["sick_well_closed"] }],
    ["Pedir ayuda al monasterio", { faith: 2, people: 2 }, { addTags: ["church_water_aid"] }]
  ], { kind: "consequence", family: "apothecary" }),

  event("merchant_debt_called", "El gremio cobra memoria", "El préstamo vuelve con intereses envueltos en cortesía. El Gremio no pide oro: pide privilegios.", [
    ["Pagar en oro", { gold: -9 }, { addTags: ["merchant_debt_paid"] }],
    ["Conceder privilegios", { gold: -2, nobility: -3, people: -2 }, { addTags: ["merchant_privileges"] }],
    ["Negarse", { gold: 2, threat: 4 }, { addTags: ["merchant_debt_refused"] }]
  ], { kind: "consequence", family: "merchants", requiresTags: ["merchant_debt"] }),

  event("dyers_blue_hands", "Manos azules", "Los tintoreros se presentan con manos teñidas y cuentas rojas. Dicen que la nueva tasa ahoga un oficio entero.", [
    ["Retirar tasa", { gold: -2, people: 3 }, { addTags: ["dye_tax_removed"] }],
    ["Exigir pago", { gold: 4, people: -3 }, { addTags: ["dyers_taxed"] }]
  ], { kind: "consequence", family: "merchants" }),

  event("caravan_crosses", "La caravana cruza", "Contra todo pronóstico, los carros pasan sin romper la ruta. Los carreteros juran que el peaje dio suerte.", [
    ["Aceptar agradecimiento", { gold: 4, people: 1 }, { addTags: ["caravan_lucky_crossing"] }]
  ], { kind: "consequence", family: "merchants" }),

  event("caravan_breaks_road", "Ejes en el barro", "La caravana se parte en mitad del camino y bloquea la ruta comercial. El peaje no arregla ruedas.", [
    ["Pagar despeje", { gold: -5, threat: -2 }, { addTags: ["road_cleared"] }],
    ["Hacerles pagar", { gold: 3, people: -2 }, { addTags: ["carters_fined"] }]
  ], { kind: "consequence", family: "merchants" }),
  event("rats_return", "Las ratas aprenden", "Ignorar el granero dio tiempo a las ratas para convertir una infestación en costumbre.", [
    ["Purga completa", { food: -6, gold: -3, threat: -3 }, { addTags: ["granary_purged_late"] }],
    ["Gatos y trampas", { gold: -4, food: -2, people: 1 }, { addTags: ["granary_cats"] }],
    ["Racionar pérdidas", { food: -4, people: -2 }, { addTags: ["rat_losses_rationed"] }]
  ], { kind: "consequence", family: "apothecary", families: ["apothecary", "seneschal"] }),

  event("inn_rumor_mill", "Marta cuenta la pelea", "Marta la Posadera no olvida quién dejó que su sala se rompiera. Ahora cada jarra trae una versión peor de la historia.", [
    ["Pagar reparación tardía", { gold: -4, people: 2 }, { characters: [{ id: "marta_posadera" }], addTags: ["inn_late_repair"] }],
    ["Comprar silencio con licencia", { gold: -2, nobility: -1 }, { characters: [{ id: "marta_posadera" }], addTags: ["inn_license_granted"] }],
    ["Ignorar rumores", { people: -2 }, { characters: [{ id: "marta_posadera" }], addTags: ["inn_rumors_ignored"] }]
  ], { kind: "consequence", family: "merchants" }),

]);

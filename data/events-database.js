// Catálogo unificado de eventos para Su Majestad.
// Mantiene el formato normalizado existente mediante los helpers globales de events.js.
const eventsDatabase = [
// data/events/common-events.js
event("rats_granary", "Granero con ratas", "Las reservas del norte han sido infestadas.", [["Quemad el granero", { food: -8, threat: -3, people: -2 }, { addTags: ["decisive_ruler"] }], ["Contratad cazadores", { gold: -6, food: -3, people: 2 }], ["Ignoradlo", { food: -10 }, { defer: [{ delay: 4, eventId: "rats_return" }] }]]),
  event("foreign_merchants", "Mercaderes extranjeros", "Una caravana de telas y especias espera audiencia. Su portavoz, Dario Valen, promete recordar la mano que le abra la puerta.", [["Cobrad impuestos", { gold: 8, people: -2 }, { addTags: ["taxed_merchants"], characters: [{ id: "dario" }], defer: [{ delay: 6, branches: [{ probability: 0.45, eventId: "dario_smuggling" }, { probability: 0.35, eventId: "dario_pays_due" }, { probability: 0.20, eventId: "dario_leaves" }] }] }], ["Dadles escolta", { army: -2 }, { addTags: ["supported_merchants"], characters: [{ id: "dario", role: "Mercader aliado" }], defer: [{ delay: 6, branches: [{ probability: 0.60, eventId: "dario_prospers" }, { probability: 0.30, eventId: "dario_robbed" }, { probability: 0.10, eventId: "dario_missing" }] }] }], ["Cerrad las puertas", { threat: -2 }, { addTags: ["closed_gates_to_merchants"] }]], { family: "merchants", families: ["merchants"] }),
  event("prophet_square", "Profeta en la plaza", "Un predicador arrastra multitudes y pregunta si la corona teme a la verdad.", [["Bendecidlo", { faith: 6 }, { addTags: ["helped_church"], defer: [{ delay: 5, eventId: "church_remembers" }] }], ["Arrestadlo", { faith: -6, people: -3, threat: -2 }, { addTags: ["angered_church"] }], ["Invitadlo a palacio", { gold: -3, faith: 3 }, { addTags: ["courted_church"] }]]),
  event("noble_duel", "Duelo noble", "Dos casas rivales exigen que arbitres su honor.", [["Favoreced al duque", { nobility: 4, people: -2 }, { addTags: ["favored_nobles"] }], ["Multad a ambos", { gold: 6, nobility: -5 }, { addTags: ["angered_nobles"] }], ["Ejecutad al instigador", { nobility: -8, threat: -4 }, { addTags: ["executed_noble", "angered_nobles"], defer: [{ delay: 7, eventId: "noble_blood_feud" }] }]]),
  event("road_bandits", "Bandidos del camino", "Los aldeanos temen viajar al mercado.", [["Patrulla militar", { army: -4, people: 4, threat: -5 }, { addTags: ["protected_roads"], defer: [{ delay: 5, branches: [{ probability: 0.65, eventId: "bandits_scattered" }, { probability: 0.35, eventId: "ambushed_patrol" }] }] }], ["Pagad informantes", { gold: -5, threat: -4 }, { addTags: ["spy_network"] }], ["Ejecutad capturados", { people: -2, threat: -6 }, { addTags: ["executed_bandits"] }]]),
  event("golden_harvest", "Cosecha dorada", "Los campos producen más de lo esperado.", [["Almacenar", { outcomes: [{ probability: 0.55, immediate: { food: 10 }, text: "El grano se conserva bien." }, { probability: 0.30, immediate: { food: 4 }, text: "Parte del grano se estropea." }, { probability: 0.15, immediate: { food: -5 }, text: "Una plaga arruina los almacenes." }] }], ["Celebrar feria", { food: 5, gold: 4, people: 3 }, { addTags: ["held_fair"] }], ["Diezmo especial", { food: 3, faith: 4, people: -2 }, { addTags: ["helped_church"] }]]),
  event("war_tax", "Impuesto de guerra", "Los cofres menguan y la frontera arde.", [["Cobrar al pueblo", { gold: 10, people: -6 }, { addTags: ["rejected_tax_mercy"] }], ["Cobrar a nobles", { gold: 8, nobility: -6 }, { addTags: ["angered_nobles"] }], ["Perdonar impuestos", {}, { addTags: ["rejected_taxes"], defer: [{ delay: 4, eventId: "tax_mercy_remembered" }] }]]),
  event("ancient_map", "Mapa antiguo", "Un cartógrafo vende rutas hacia ruinas olvidadas.", [["Financiad exploradores", { gold: -5, army: -2 }, { addTags: ["funded_explorers"], defer: [{ delay: 8, branches: [{ probability: 0.50, eventId: "explorers_relic" }, { probability: 0.30, eventId: "explorers_lost" }, { probability: 0.20, eventId: "explorers_warning" }] }] }], ["Subastad mapa", { gold: 6, nobility: 1 }], ["Entregad al templo", { faith: 4 }, { addTags: ["helped_church"] }]]),
  event("empty_granaries", "Graneros vacíos", "Los panaderos advierten que la harina no alcanza para otra semana.", [["Comprar grano caro", { gold: -8, food: 8 }], ["Racionar el pan", { food: 4, people: -4 }, { addTags: ["rationed_bread"] }]], { family: "seneschal", families: ["seneschal", "shortage"], weight: 0.8, resourceConditions: { food: { max: 30 } } }),
  event("royal_auditors", "Auditores reales", "Los escribanos de palacio revisan cuentas y privilegios con celo renovado.", [["Revisad los libros", { gold: 4, crown: -2 }], ["Mostrad clemencia", { crown: 2, gold: -3 }]], { family: "chancellor", families: ["chancellor", "merchants"], weight: 0.6, resourceWeights: [{ resource: "crown", min: 70, multiplier: 2 }] }),

// data/events/consequence-events.js
event("dario_prospers", "Regreso de {character:dario.name}", "{character:dario.name} vuelve con caravanas llenas. No habla de 'la corona', habla de ti.", [["Aceptad su regalo", { gold: 10, food: 4 }, { addTags: ["dario_grateful", "supported_merchants"] }], ["Pedid inversión pública", { people: 5 }, { addTags: ["merchant_public_works"] }]], { kind: "consequence", requiresTags: ["supported_merchants"], family: "merchants" }),
  event("dario_robbed", "La caravana de {character:dario.name} fue asaltada", "El mercader sobrevivió, pero culpa a tus caminos y exige justicia.", [["Compensadlo", { gold: -6, people: 2 }, { addTags: ["dario_compensated"] }], ["Cazad a los culpables", { army: -3, threat: -5 }, { addTags: ["protected_roads"] }]], { kind: "consequence", family: "merchants" }),
  event("dario_missing", "Silencio en la ruta", "Nadie ha visto a {character:dario.name}. Sus socios murmuran que comerciar contigo trae mala suerte.", [["Enviar búsqueda", { gold: -4, threat: -2 }, { addTags: ["searched_for_dario"] }], ["Negar responsabilidad", { people: -3 }, { addTags: ["abandoned_merchants"] }]], { kind: "consequence", family: "merchants" }),
  event("dario_smuggling", "El viejo trato de {character:dario.name}", "Tras los impuestos, {character:dario.name} mueve mercancía por pasos secretos.", [["Amnistía por multa", { gold: 7 }, { addTags: ["merchant_amnesty"] }], ["Confiscarlo todo", { gold: 5, people: -3 }, { addTags: ["angered_merchants"] }]], { kind: "consequence", requiresTags: ["taxed_merchants"], family: "merchants" }),
  event("dario_pays_due", "Tributo de {character:dario.name}", "El mercader pagó, prosperó y trae una bolsa sellada con tu escudo.", [["Aceptar tributo", { gold: 8 }], ["Reducir sus tasas futuras", {}, { addTags: ["supported_merchants"] }]], { kind: "consequence", family: "merchants" }),
  event("dario_leaves", "Una ruta menos", "Los puestos de {character:dario.name} han cerrado. Otros mercaderes preguntan si serán los siguientes.", [["Prometer privilegios", { gold: -3 }, { addTags: ["supported_merchants"] }], ["Que aprendan obediencia", { nobility: 2, people: -2 }]], { kind: "consequence", family: "merchants" }),
  event("church_remembers", "La iglesia devuelve el favor", "Los sacerdotes recuerdan tu apoyo y calman a los barrios inquietos.", [["Agradeced desde el balcón", { faith: 4, people: 3 }], ["Pedid donativos", { gold: 5, faith: -2 }]], { kind: "consequence", requiresTags: ["helped_church"] }),
  event("noble_blood_feud", "Sangre noble pide sangre", "La familia del ejecutado no olvida. Sus vasallos retrasan tributos y afilan juramentos.", [["Convocad juicio público", { gold: -3, nobility: -2, people: 3 }, { addTags: ["public_justice"] }], ["Aplastad la casa", { army: -5, nobility: -6, threat: -3 }, { addTags: ["crushed_noble_house"] }]], { kind: "consequence", requiresTags: ["executed_noble"] }),
  event("bandits_scattered", "Caminos abiertos", "Las patrullas vuelven con estandartes de bandidos. Los mercados respiran.", [["Premiad a la patrulla", { gold: -3, army: 3, people: 3 }], ["Exhibid los estandartes", { threat: -4 }]], { kind: "consequence", family: "spy" }),
  event("ambushed_patrol", "Emboscada en el bosque", "La patrulla enviada contra bandidos regresa diezmada.", [["Enviar refuerzos", { army: -5, threat: -4 }], ["Negociar con aldeanos", { gold: -4, people: 2 }]], { kind: "consequence", family: "spy" }),
  event("tax_mercy_remembered", "El perdón en los impuestos", "Los recaudadores informan que el pueblo cita tu perdón como prueba de que el trono escucha.", [["Mantener la promesa", { people: 5 }], ["Recuperar parte ahora", { gold: 5, people: -3 }]], { kind: "consequence", requiresTags: ["rejected_taxes"] }),
  event("explorers_relic", "Los exploradores regresan", "La expedición financiada trae una reliquia y mapas de pasos seguros.", [["Consagrar la reliquia", { faith: 5, threat: -3 }], ["Vender hallazgos", { gold: 9 }]], { kind: "consequence", requiresTags: ["funded_explorers"] }),
  event("explorers_lost", "No vuelven los exploradores", "Solo llega una mochila rasgada. Las familias piden respuestas.", [["Pensionar familias", { gold: -5, people: 4 }], ["Cerrar el expediente", { people: -4, nobility: 2 }]], { kind: "consequence", requiresTags: ["funded_explorers"] }),
  event("explorers_warning", "Advertencia desde las ruinas", "Tus exploradores hallaron columnas quemadas por un enemigo antiguo.", [["Fortificar pasos", { gold: -5, threat: -6 }], ["Ocultar el informe", { nobility: 2, threat: 3 }]], { kind: "consequence", requiresTags: ["funded_explorers"] }),

// data/events/chains/border-chain.js
event("border_refugees", "Refugiados en la frontera", "Familias de la marca oriental llegan con carros quemados. Traen noticias de una guerra que aún no aparece en tus mapas.", [["Abrid los graneros", { food: -7, people: 5 }, { issues: [{ action: "create", issue: { id: "border-crisis", actorId: "marca_oriental", type: "diplomat", stage: 0, tension: 38, trust: 45, tags: ["refugees"], reward: { text: "Si se resuelve, la frontera quedará asegurada.", addTags: ["border_secured"], addNews: [{ id: "border_loyalty", title: "Lealtad de la Marca", text: "La frontera coopera con la corona.", type: "boon", duration: 4, daily: { threat: -1 } }] }, unresolvedProblem: { text: "Si se abandona con tensión alta, la crisis puede estallar.", minDaysActive: 8, minTension: 70, eventId: "border_burns" }, trustProblem: { text: "Si la confianza cae demasiado, la Marca podría actuar por su cuenta.", maxTrust: 20, eventId: "border_breaks_with_crown" } } }], defer: [{ delay: 5, eventId: "border_raiders" }] }], ["Interrogadlos primero", { threat: -2, people: -2 }, { issues: [{ action: "create", issue: { id: "border-crisis", actorId: "marca_oriental", type: "diplomat", stage: 0, tension: 46, trust: 30, tags: ["suspected_spies"] } }] }], ["Cerrad la frontera", { threat: -4, people: -5 }, { addTags: ["closed_border"], defer: [{ delay: 4, eventId: "border_raiders" }] }]], { weight: 1.2, family: "diplomat", families: ["diplomat"] }),
  event("border_raiders", "Jinetes tras los refugiados", "Los perseguidores cruzan mojones reales y prueban tus torres. La marca oriental exige una respuesta que no parezca azar ni pánico.", [["Enviar caballería", { army: -5, threat: -6 }, { issues: [{ action: "modify", issueId: "border-crisis", tension: -12, trust: 10 }], addNews: [{ id: "military_roads", title: "Caminos militarizados", text: "Las rutas principales quedan bajo presencia armada.", type: "aftermath", duration: 3, daily: { threat: -1, army: -1 }, stacking: "refresh" }], defer: [{ delay: 6, eventId: "border_envoy" }] }], ["Pagar tributo fronterizo", { gold: -8, threat: -3, nobility: -2 }, { issues: [{ action: "modify", issueId: "border-crisis", tension: -8, trust: -3 }] }], ["Ignorar la incursión", { people: -4, threat: 7 }, { issues: [{ action: "escalate", issueId: "border-crisis", tension: 10, trust: -12 }], defer: [{ delay: 4, eventId: "border_burns" }] }]], { kind: "consequence", family: "diplomat", issue: { id: "border-crisis", maxStage: 1 } }),
  event("border_burns", "La marca arde", "Tres aldeas fronterizas prenden hogueras de auxilio. El asunto ya no es una queja: es una herida abierta del reino.", [["Nombrar un mariscal", { gold: -4, army: -4, threat: -8 }, { issues: [{ action: "escalate", issueId: "border-crisis", tension: -5, trust: 8 }], defer: [{ delay: 5, eventId: "border_envoy" }] }], ["Ordenar leva local", { army: 5, people: -6, nobility: -3 }, { issues: [{ action: "escalate", issueId: "border-crisis", tension: 8, trust: -6 }] }]], { kind: "consequence", family: "diplomat", issue: { id: "border-crisis" } }),
  event("border_envoy", "El enviado de la marca", "Un capitán cubierto de polvo pide fueros, soldados y una promesa sellada. Si lo atiendes, el problema puede convertirse en alianza.", [["Firmar los fueros", { gold: -6, nobility: -3, people: 5, threat: -6 }, { addTags: ["border_oath"], issues: [{ action: "resolve", issueId: "border-crisis", addTags: ["border_secured"] }] }], ["Exigir obediencia antes de ayuda", { nobility: 3, people: -3 }, { issues: [{ action: "escalate", issueId: "border-crisis", tension: 10, trust: -10 }], defer: [{ delay: 5, eventId: "border_last_stand" }] }]], { kind: "consequence", family: "diplomat", issue: { id: "border-crisis" } }),
  event("border_last_stand", "Último estandarte oriental", "La marca oriental combate sola bajo tu blasón. La decisión de hoy escribirá si la frontera fue abandonada o integrada al reino.", [["Marchar personalmente", { army: -8, gold: -5, people: 4, threat: -12 }, { addTags: ["border_hero"], issues: [{ action: "resolve", issueId: "border-crisis", addTags: ["border_secured"] }] }], ["Conceder independencia de defensa", { nobility: -5, threat: -5 }, { addTags: ["border_autonomy"], issues: [{ action: "resolve", issueId: "border-crisis", addTags: ["border_autonomy"] }] }], ["Retirar el blasón", { army: 3, people: -10, threat: 12 }, { addTags: ["abandoned_border"], issues: [{ action: "resolve", issueId: "border-crisis" }] }]], { kind: "consequence", family: "diplomat", issue: { id: "border-crisis", minStage: 1 } }),

// data/events/chains/noble-chain.js
event("noble_petition", "Petición de una casa inquieta", "Una familia menor pide tierras disputadas. Es un asunto modular: puede morir aquí o crecer dos escalones.", [["Conceded las tierras", { nobility: 4, people: -3 }, { issues: [{ action: "create", issue: { id: "house-varela-claim", actorId: "house_varela", type: "noble_claim", stage: 0, tension: 30, trust: 55, tags: ["land_claim"] } }] }], ["Aplazar sentencia", { nobility: -2 }, { issues: [{ action: "create", issue: { id: "house-varela-claim", actorId: "house_varela", type: "noble_claim", stage: 0, tension: 42, trust: 40, tags: ["delayed_claim"] } }], defer: [{ delay: 5, eventId: "noble_claim_escalates" }] }], ["Rechazarla", { nobility: -5, people: 2 }, { issues: [{ action: "create", issue: { id: "house-varela-claim", actorId: "house_varela", type: "noble_claim", stage: 1, tension: 55, trust: 25, tags: ["insulted"] } }], defer: [{ delay: 4, eventId: "noble_claim_escalates" }] }]], { weight: 1, family: "nobility", families: ["nobility", "noble_claim"] }),
  event("noble_claim_escalates", "La casa Varela sube el tono", "Sus sellos llegan rotos y sus hombres retrasan diezmos. La disputa sigue dentro de su arquetipo: tierras, honor y vasallaje.", [["Mediar con testigos", { gold: -4, nobility: 2, people: 2 }, { issues: [{ action: "modify", issueId: "house-varela-claim", tension: -20, trust: 12 }] }], ["Amenazar con confiscaciones", { threat: -3, nobility: -4 }, { issues: [{ action: "escalate", issueId: "house-varela-claim", tension: 8, trust: -8 }], defer: [{ delay: 5, eventId: "noble_claim_duel" }] }], ["Cerrar el caso", { nobility: -2 }, { issues: [{ action: "resolve", issueId: "house-varela-claim", addTags: ["varela_settled"] }] }]], { kind: "consequence", family: "nobility", issue: { id: "house-varela-claim", maxStage: 1 } }),
  event("noble_claim_duel", "Duelos por la heredad", "La segunda escalada llega con acero desnudo. Ya no hay combinaciones libres: es la culminación natural de una reclamación noble.", [["Reconocer un campeón real", { army: -2, nobility: 4, threat: -3 }, { issues: [{ action: "resolve", issueId: "house-varela-claim", addTags: ["varela_bound"] }] }], ["Prohibir los duelos", { nobility: -6, people: 3, threat: -2 }, { issues: [{ action: "resolve", issueId: "house-varela-claim", addTags: ["duels_banned"] }] }]], { kind: "consequence", family: "nobility", issue: { id: "house-varela-claim", minStage: 1 } }),

// data/events/packs/modular-commerce-people.js
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

// data/events/packs/modular-faith-nobility.js
event("monastery_roof_leaks", "Goteras en San Elías", "El abad Berenguer dice que la lluvia cae sobre los manuscritos como si Dios tuviera mala puntería.", [
    ["Pagar carpinteros", { gold: -5, faith: 4 }, { characters: [{ id: "abad_berenguer" }], addTags: ["monastery_roof_repaired"], resultText: "El claustro queda seco y el abad pronuncia tu nombre en misa." }],
    ["Enviar madera vieja", { gold: -2, faith: 2 }, { characters: [{ id: "abad_berenguer" }], defer: [{ delay: 5, branches: [{ probability: 0.65, eventId: "monastery_roof_holds" }, { probability: 0.35, eventId: "monastery_roof_falls" }] }], resultText: "La reparación parece suficiente desde lejos." }],
    ["Decir que recen por sol", { faith: -4, nobility: 1 }, { addTags: ["mocked_monastery_need"], resultText: "La corte ríe más que el monasterio." }]
  ], { family: "clergy", families: ["clergy", "public_works"], weight: 1 }),

  event("relic_seller", "Reliquia en venta", "Un mercader ofrece un dedo santo en una cajita de plata. El abad palidece: podría ser milagro, fraude o ambas cosas caras.", [
    ["Comprar para la iglesia", { gold: -6, faith: 5 }, { addTags: ["bought_relic"], defer: [{ delay: 6, branches: [{ probability: 0.50, eventId: "relic_draws_pilgrims" }, { probability: 0.50, eventId: "relic_questioned" }] }], resultText: "La cajita queda sellada bajo tres velas." }],
    ["Examinarla primero", { gold: -2 }, { addTags: ["relic_examined"], defer: [{ delay: 4, branches: [{ probability: 0.60, eventId: "relic_fake" }, { probability: 0.40, eventId: "relic_true_enough" }] }], resultText: "Los sabios discuten si la santidad tiene olor a cera vieja." }],
    ["Expulsar al vendedor", { faith: 1, gold: 1 }, { addTags: ["relic_seller_expelled"], resultText: "El mercader se marcha jurando que tu reino desprecia milagros." }]
  ], { family: "clergy", families: ["clergy", "merchants"], weight: 0.95 }),

  event("confession_seal", "Secreto de confesión", "Un sacerdote asegura saber quién roba a los pobres, pero dice que el secreto de confesión ata su lengua.", [
    ["Respetar el sello", { faith: 4, people: -2 }, { addTags: ["respected_confession"], resultText: "La Iglesia respira; el barrio bajo no entiende tanta paciencia." }],
    ["Presionarlo discretamente", { faith: -2, threat: -3 }, { addTags: ["pressed_confessor"], resultText: "La verdad sale torcida, pero sale." }],
    ["Ofrecer amnistía al ladrón", { gold: -2, people: 3 }, { addTags: ["mercy_for_thief"], defer: [{ delay: 5, eventId: "thief_returns_alms" }], resultText: "La ciudad oye que incluso el pecado puede encontrar puerta." }]
  ], { family: "clergy", families: ["clergy", "spy", "people"], weight: 1 }),

  event("noble_hunt_damage", "Caza noble", "La Duquesa Elvira vuelve de caza con venados, risas y media huerta campesina pisoteada.", [
    ["Exigir compensación", { people: 4, nobility: -4 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["noble_hunt_compensated"], resultText: "Los campesinos reciben plata; la duquesa guarda silencio con dientes." }],
    ["Cubrir daños con tesoro", { gold: -5, people: 3, nobility: 2 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["covered_noble_damage"], resultText: "Todos sonríen salvo el tesorero." }],
    ["Ignorar quejas", { nobility: 3, people: -5 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["ignored_peasant_damage"], defer: [{ delay: 5, eventId: "trampled_fields_anger" }], resultText: "La nobleza brinda; el campo cuenta pisadas." }]
  ], { family: "nobility", families: ["nobility", "people"], weight: 1.05 }),

  event("baron_debt_plea", "Deuda del barón", "El Barón Mendo pide que la corona compre sus deudas para evitar que sus tierras caigan en manos de prestamistas.", [
    ["Comprar la deuda", { gold: -8, nobility: 4 }, { characters: [{ id: "baron_mendo" }], addTags: ["baron_debt_bought"], defer: [{ delay: 7, eventId: "baron_asks_again" }], resultText: "Mendo besa tu anillo con alivio demasiado ensayado." }],
    ["Exigir tierras a cambio", { gold: -4, nobility: -2, food: 3 }, { characters: [{ id: "baron_mendo" }], addTags: ["baron_lands_taken"], resultText: "La deuda baja; el orgullo del barón también." }],
    ["Negarse", { nobility: -3, gold: 2 }, { characters: [{ id: "baron_mendo" }], addTags: ["refused_baron_debt"], resultText: "Mendo se inclina como quien promete recordar cada baldosa." }]
  ], { family: "nobility", families: ["nobility", "merchants"], weight: 0.95 }),

  event("chapel_singers", "Coro desafinado", "El coro de la capilla canta tan mal que los nobles llegan tarde a misa. El abad dice que Dios escucha intención; la corte escucha ruido.", [
    ["Contratar maestro de canto", { gold: -3, faith: 3, nobility: 1 }, { addTags: ["chapel_music_improved"], resultText: "La misa suena menos a castigo." }],
    ["Mantener a los niños pobres", { faith: 2, people: 2, nobility: -2 }, { addTags: ["poor_children_choir"], resultText: "Cantan mal, pero comen después de cantar." }],
    ["Silenciar el coro", { nobility: 2, faith: -3 }, { addTags: ["choir_silenced"], resultText: "La capilla queda ordenada y fría." }]
  ], { family: "clergy", families: ["clergy", "nobility", "people"], weight: 0.75 }),

  event("duchess_marriage_gift", "Regalo de boda", "La Duquesa Elvira pide un regalo real para la boda de su sobrina. El regalo será leído como afecto, miedo o desprecio.", [
    ["Enviar joyas", { gold: -6, nobility: 5 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["ormont_wedding_gift"], resultText: "La casa Ormont exhibe tu generosidad como si fuera suya." }],
    ["Enviar grano para la fiesta", { food: -4, people: 2, nobility: 2 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["practical_wedding_gift"], resultText: "Los invitados comen bien; la duquesa sonríe con esfuerzo." }],
    ["Enviar una carta", { nobility: -4 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["wedding_snub"], defer: [{ delay: 6, eventId: "ormont_cold_invitation" }], resultText: "La carta pesa menos que el insulto." }]
  ], { family: "nobility", families: ["nobility", "diplomat"], weight: 0.85 }),

  event("forbidden_sermon", "Sermón incómodo", "Un fraile predica que los reyes también serán juzgados. El pueblo escucha con hambre de justicia.", [
    ["Permitirlo", { faith: 3, people: 3, nobility: -2 }, { addTags: ["allowed_hard_sermons"], resultText: "El sermón termina y nadie prende fuego a nada. Eso también es victoria." }],
    ["Pedir sermones más suaves", { faith: -2, nobility: 2 }, { addTags: ["softened_sermons"], resultText: "La Iglesia obedece en público y te estudia en privado." }],
    ["Expulsar al fraile", { faith: -5, threat: -2, people: -2 }, { addTags: ["exiled_friar"], defer: [{ delay: 5, eventId: "friar_becomes_symbol" }], resultText: "Un hombre sale del reino; una frase se queda." }]
  ], { family: "clergy", families: ["clergy", "people", "nobility"], weight: 1 }),

  event("noble_table_order", "Orden de mesa", "Dos casas nobles amenazan con marcharse del banquete si una se sienta por debajo de la otra. El hambre de honor supera al de comida.", [
    ["Sentarlas por antigüedad", { nobility: 2 }, { addTags: ["court_protocol_old_blood"], resultText: "Los viejos linajes respiran satisfechos." }],
    ["Sentarlas por mérito", { nobility: -2, army: 2 }, { addTags: ["court_protocol_merit"], resultText: "Los militares sonríen; los genealogistas sufren." }],
    ["Cancelar el banquete", { gold: 3, nobility: -5 }, { addTags: ["banquet_cancelled"], resultText: "Ahorras comida y compras enemistades finas." }]
  ], { family: "nobility", families: ["nobility", "steward"], weight: 0.9 }),

  event("monk_copies_law", "Copias de la ley", "Un monje ofrece copiar leyes del reino para que todos sepan qué se castiga. Algunos consejeros prefieren que la ley siga siendo niebla.", [
    ["Financiar copias públicas", { gold: -4, people: 4, nobility: -1 }, { addTags: ["public_law_copies"], resultText: "La ley deja de ser solo voz de alguaciles." }],
    ["Solo copias para jueces", { gold: -2, threat: -2 }, { addTags: ["judicial_law_copies"], resultText: "Los jueces ganan claridad; el pueblo sigue preguntando." }],
    ["Rechazarlo", { nobility: 2, people: -2 }, { addTags: ["law_kept_obscure"], resultText: "La niebla legal permanece muy útil para quien sabe caminarla." }]
  ], { family: "clergy", families: ["clergy", "spy", "people"], weight: 0.85 }),

  event("illegitimate_cousin", "Primo ilegítimo", "Un joven de rostro demasiado familiar afirma llevar sangre real. No pide corona: pide reconocimiento y una cama segura.", [
    ["Reconocerlo discretamente", { gold: -3, nobility: -2, people: 2 }, { addTags: ["bastard_cousin_recognized"], defer: [{ delay: 8, eventId: "bastard_cousin_useful" }], resultText: "Una rama incómoda entra en el árbol familiar." }],
    ["Enviar al monasterio", { faith: 2, nobility: 1 }, { addTags: ["bastard_sent_church"], resultText: "El muchacho cambia apellido por hábito." }],
    ["Expulsarlo", { nobility: 2, people: -2 }, { addTags: ["bastard_exiled"], defer: [{ delay: 7, eventId: "bastard_cousin_returns_angry" }], resultText: "La sangre negada no siempre se seca." }]
  ], { family: "steward", families: ["steward", "nobility", "clergy"], weight: 0.75 }),

  event("pilgrim_crowd", "Peregrinos en la puerta", "Un grupo de peregrinos pide entrar antes de la noche. Traen cantos, polvo y quizá fiebre.", [
    ["Abrir hospicio", { gold: -4, faith: 4, people: 1 }, { addTags: ["welcomed_pilgrims"], defer: [{ delay: 5, branches: [{ probability: 0.70, eventId: "pilgrims_bless_city" }, { probability: 0.30, eventId: "pilgrim_coughs" }] }], resultText: "La ciudad gana voces cansadas y velas nuevas." }],
    ["Dejarles fuera con comida", { food: -4, faith: 2, threat: -1 }, { addTags: ["fed_pilgrims_outside"], resultText: "Comen bajo el muro, agradecidos y visibles." }],
    ["Cerrar las puertas", { faith: -4, threat: -2 }, { addTags: ["closed_doors_to_pilgrims"], resultText: "La noche queda fuera. También sus oraciones." }]
  ], { family: "clergy", families: ["clergy", "apothecary", "people"], weight: 0.95 }),

  event("noble_private_guard", "Guardia privada", "La Duquesa Elvira solicita permiso para ampliar su guardia privada. Dice que es por seguridad. Rodrigo lo llama ejército con perfume.", [
    ["Conceder permiso", { nobility: 4, threat: 3 }, { characters: [{ id: "duquesa_elvira" }, { id: "capitan_rodrigo" }], addTags: ["private_guard_allowed"], issues: [{ action: "create", issue: { id: "ormont-private-guard", actorId: "duquesa_elvira", type: "feud", stage: 0, tension: 35, trust: 45, tags: ["private_guard"] } }], resultText: "Elvira agradece con una inclinación demasiado militar." }],
    ["Limitar número de hombres", { nobility: 1, threat: -1 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["private_guard_limited"], resultText: "La duquesa acepta la mitad como quien memoriza una deuda." }],
    ["Prohibirlo", { nobility: -4, army: 2 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["private_guard_forbidden"], resultText: "El ejército te respeta más; la casa Ormont bastante menos." }]
  ], { family: "nobility", families: ["nobility", "army", "feud"], weight: 1 }),

  event("church_tithe_short", "Diezmo corto", "El abad Berenguer afirma que el diezmo ha llegado incompleto. El recaudador asegura que Dios no sabe sumar.", [
    ["Cubrir la diferencia", { gold: -4, faith: 4 }, { characters: [{ id: "abad_berenguer" }], addTags: ["tithe_covered"], resultText: "El abad agradece la reparación, no la causa." }],
    ["Auditar diezmos", { gold: -2 }, { issues: [{ action: "create", issue: { id: "tithe-dispute", actorId: "abad_berenguer", type: "tithe", stage: 0, tension: 35, trust: 45, tags: ["accounts"] } }], defer: [{ delay: 5, branches: [{ probability: 0.50, eventId: "tithe_miscount" }, { probability: 0.50, eventId: "tithe_theft" }] }], resultText: "Los libros de Dios y del rey se abren a la vez." }],
    ["Negar la queja", { faith: -4, gold: 2 }, { characters: [{ id: "abad_berenguer" }], addTags: ["denied_tithe_claim"], resultText: "El abad no alza la voz. No necesita hacerlo." }]
  ], { family: "clergy", families: ["clergy", "merchants", "tithe"], weight: 0.9 }),

  event("monastery_roof_holds", "El tejado resiste", "La madera vieja aguanta. El abad lo llama providencia; el carpintero, suerte.", [
    ["Enviar limosna de gratitud", { gold: -2, faith: 3 }, { addTags: ["monastery_luck_thanked"] }],
    ["Dar el asunto por cerrado", { faith: 1 }, { addTags: ["monastery_roof_closed"] }]
  ], { kind: "consequence", family: "clergy" }),

  event("monastery_roof_falls", "Techo sobre pergaminos", "Una viga cede durante la lluvia. Nadie muere, pero se pierden páginas antiguas.", [
    ["Restaurar el scriptorium", { gold: -6, faith: 5 }, { addTags: ["scriptorium_restored"] }],
    ["Culpar al carpintero", { faith: -2, gold: 2 }, { addTags: ["carpenter_blamed"] }]
  ], { kind: "consequence", family: "clergy" }),

  event("relic_draws_pilgrims", "La reliquia atrae pasos", "La cajita de plata llena la ciudad de peregrinos y monedas pequeñas.", [
    ["Organizar feria devota", { gold: 5, faith: 4, people: 1 }, { addTags: ["relic_fair"] }],
    ["Controlar multitudes", { army: -2, threat: -2, faith: 2 }, { addTags: ["relic_ordered"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["bought_relic"] }),

  event("relic_questioned", "Dedo de santo dudoso", "Un clérigo visitante asegura que el santo ya tenía todos sus dedos contados en otra abadía.", [
    ["Encargar investigación", { gold: -3, faith: -1 }, { addTags: ["relic_investigated"] }],
    ["Defender la devoción", { faith: 3, nobility: -1 }, { addTags: ["relic_defended"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["bought_relic"] }),

  event("relic_fake", "La reliquia era hueso de cabra", "La investigación concluye que el dedo santo perteneció a una cabra muy poco canonizada.", [
    ["Hacerlo público", { faith: -3, people: 2 }, { addTags: ["fake_relic_exposed"] }],
    ["Enterrar el informe", { gold: -1, faith: 2 }, { addTags: ["fake_relic_hidden"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["relic_examined"] }),

  event("relic_true_enough", "Santidad suficiente", "Nadie puede probar la reliquia, pero tampoco desacreditarla. A veces la fe vive en ese hueco.", [
    ["Bendecirla oficialmente", { faith: 5 }, { addTags: ["relic_blessed"] }],
    ["Mantenerla privada", { nobility: 1, faith: 2 }, { addTags: ["private_relic"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["relic_examined"] }),

  event("thief_returns_alms", "El ladrón vuelve con pan", "El ladrón amnistiado deja pan en la iglesia y nombres bajo la puerta de la alguacil.", [
    ["Usar los nombres", { threat: -4, faith: 1 }, { addTags: ["confession_names_used"] }],
    ["Proteger al arrepentido", { people: 2, threat: -2 }, { addTags: ["protected_repentant"] }]
  ], { kind: "consequence", family: "spy", requiresTags: ["mercy_for_thief"] }),

  event("trampled_fields_anger", "Huertas pisoteadas", "Los campesinos de la huerta arruinada llegan con raíces rotas. La caza terminó; el daño, no.", [
    ["Compensar tarde", { gold: -5, people: 3 }, { addTags: ["late_field_compensation"] }],
    ["Ordenar silencio", { threat: -2, people: -4 }, { addTags: ["silenced_trampled_farmers"] }]
  ], { kind: "consequence", family: "people", requiresTags: ["ignored_peasant_damage"] }),

  event("baron_asks_again", "Mendo vuelve a deber", "El Barón Mendo regresa con otra deuda y una explicación más larga que sus tierras.", [
    ["Cortar ayuda", { nobility: -3, gold: 2 }, { addTags: ["baron_cut_off"] }],
    ["Convertir deuda en vasallaje", { gold: -4, nobility: 2, food: 2 }, { addTags: ["baron_bound_by_debt"] }]
  ], { kind: "consequence", family: "nobility", requiresTags: ["baron_debt_bought"] }),

  event("ormont_cold_invitation", "Invitación fría", "La casa Ormont invita a media corte a una cacería y olvida tu sello. Nadie cree que fuera descuido.", [
    ["Enviar representante", { gold: -2, nobility: 2 }, { addTags: ["ormont_snub_softened"] }],
    ["Responder con silencio", { nobility: -3 }, { addTags: ["ormont_snub_returned"] }]
  ], { kind: "consequence", family: "nobility", requiresTags: ["wedding_snub"] }),

  event("friar_becomes_symbol", "El fraile en canciones", "El fraile expulsado aparece en coplas de taberna. Es difícil arrestar una melodía.", [
    ["Permitir las coplas", { people: 2, faith: -1 }, { addTags: ["allowed_friar_songs"] }],
    ["Perseguir canciones", { threat: -2, people: -4 }, { addTags: ["banned_friar_songs"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["exiled_friar"] }),

  event("bastard_cousin_useful", "El primo discreto", "El primo reconocido oye cosas que los nobles no dirían ante un heredero legítimo.", [
    ["Usarlo como oído en la corte", { nobility: -1, threat: -3 }, { addTags: ["bastard_spy"] }],
    ["Darle oficio honrado", { gold: -2, people: 2 }, { addTags: ["bastard_settled"] }]
  ], { kind: "consequence", family: "steward", requiresTags: ["bastard_cousin_recognized"] }),

  event("bastard_cousin_returns_angry", "Sangre en otra bandera", "El primo expulsado vuelve como huésped de una casa rival. Ahora sí tiene cama segura.", [
    ["Comprar su silencio", { gold: -6, nobility: 1 }, { addTags: ["bastard_silenced"] }],
    ["Desacreditarlo", { nobility: -3, threat: 2 }, { addTags: ["bastard_discredited"] }]
  ], { kind: "consequence", family: "steward", requiresTags: ["bastard_exiled"] }),

  event("pilgrims_bless_city", "Bendición de caminantes", "Los peregrinos parten dejando velas, historias y una pequeña bolsa común para los pobres.", [
    ["Aceptar donativo", { gold: 3, faith: 3 }, { addTags: ["pilgrim_blessing"] }],
    ["Entregarlo al barrio bajo", { people: 4, faith: 2 }, { addTags: ["pilgrim_alms_shared"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["welcomed_pilgrims"] }),

  event("pilgrim_coughs", "Tos entre peregrinos", "Una tos persistente se extiende en el hospicio. La misericordia también trae riesgos bajo la manta.", [
    ["Cuarentena amable", { gold: -4, faith: 2, threat: -2 }, { addTags: ["gentle_quarantine"] }],
    ["Expulsarlos", { faith: -5, threat: -3 }, { addTags: ["pilgrims_expelled_sick"] }]
  ], { kind: "consequence", family: "apothecary", requiresTags: ["welcomed_pilgrims"] }),

  event("tithe_miscount", "Error de cuentas", "Los diezmos estaban mal contados por incompetencia, no por robo. El error irrita menos que la sospecha.", [
    ["Corregir libros", { gold: -2, faith: 3 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["tithe_books_corrected"] }] }],
    ["Exigir disculpa pública", { faith: -1, nobility: 1 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["church_apologized"] }] }]
  ], { kind: "consequence", family: "clergy", issue: { id: "tithe-dispute" } }),

  event("tithe_theft", "Diezmo desviado", "Parte del diezmo acabó en manos de un escribano real. La Iglesia tiene razón, lo peor posible.", [
    ["Castigar al escribano", { faith: 4, threat: -2 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["tithe_thief_punished"] }] }],
    ["Devolver sin escándalo", { gold: -5, faith: 2 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["tithe_scandal_hidden"] }] }]
  ], { kind: "consequence", family: "clergy", issue: { id: "tithe-dispute" } }),

// data/events/packs/modular-army-crime.js
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
  ], { kind: "consequence", family: "army", requiresTags: ["siege_engine_restored"] }),

// data/events/packs/modular-realm-frontier.js
event("southern_fever", "Fiebre del sur", "El doctor Avelino informa de una fiebre leve en el barrio de curtidores. Leve es una palabra que cambia deprisa.", [
    ["Cuarentena temprana", { gold: -4, people: -2, threat: -4 }, { characters: [{ id: "doctor_avelino" }], addTags: ["early_quarantine"], resultText: "Las puertas cerradas duelen antes de salvar." }],
    ["Enviar sanadores", { gold: -5, people: 3 }, { characters: [{ id: "doctor_avelino" }, { id: "isolda_matrona" }], defer: [{ delay: 5, branches: [{ probability: 0.65, eventId: "fever_contained" }, { probability: 0.35, eventId: "fever_spreads" }] }], resultText: "Sanadores y hierbas entran donde el miedo ya estaba." }],
    ["Esperar informes", { gold: 1, threat: 3 }, { addTags: ["delayed_fever_response"], defer: [{ delay: 4, eventId: "fever_spreads" }], resultText: "La fiebre agradece la paciencia." }]
  ], { family: "apothecary", families: ["apothecary", "people"], weight: 1.1 }),

  event("storm_roofs", "Tejados contra el viento", "Una tormenta arranca tejas en tres barrios. Los nobles piden proteger palomares; el pueblo pide no mojar camas.", [
    ["Reparar barrios pobres", { gold: -5, people: 5, nobility: -2 }, { addTags: ["poor_roofs_repaired"], resultText: "La lluvia sigue cayendo, pero no sobre las mantas rotas." }],
    ["Repartir materiales", { gold: -3, people: 2 }, { addTags: ["roof_materials_shared"], defer: [{ delay: 4, branches: [{ probability: 0.60, eventId: "roofs_fixed_by_neighbors" }, { probability: 0.40, eventId: "roof_materials_stolen" }] }], resultText: "La ciudad recibe madera, clavos y tentaciones." }],
    ["Priorizar edificios nobles", { nobility: 4, people: -4 }, { addTags: ["noble_roofs_first"], resultText: "Los palomares sobreviven. Las camas, no todas." }]
  ], { family: "people", families: ["people", "nobility", "public_works"], weight: 0.95 }),

  event("strange_map_margin", "Nota en el margen", "Maese Ireo encuentra en un mapa viejo una nota que no estaba ayer: 'no cavéis donde la piedra canta'.", [
    ["Financiar prospección", { gold: -4 }, { characters: [{ id: "maese_ireo" }], addTags: ["singing_stone_survey"], defer: [{ delay: 7, branches: [{ probability: 0.45, eventId: "singing_stone_ore" }, { probability: 0.35, eventId: "singing_stone_nothing" }, { probability: 0.20, eventId: "singing_stone_collapse" }] }], resultText: "El mapa vuelve al escritorio con más alfileres." }],
    ["Archivar advertencia", { nobility: 1 }, { characters: [{ id: "maese_ireo" }], addTags: ["ignored_singing_stone"], resultText: "Algunas notas envejecen mejor cerradas." }],
    ["Entregarlo al monasterio", { faith: 2 }, { characters: [{ id: "maese_ireo" }, { id: "abad_berenguer" }], addTags: ["map_to_monastery"], resultText: "Los monjes copian el margen con letra temblorosa." }]
  ], { family: "scholar", families: ["scholar", "clergy"], weight: 0.9 }),

  event("foreign_envoy_gift", "Regalo de Qalat", "Samira de Qalat trae una alfombra bordada con la historia de una derrota que se parece demasiado a una advertencia.", [
    ["Aceptar con honores", { nobility: 2 }, { characters: [{ id: "embajadora_samira" }], addTags: ["accepted_qalat_gift"], resultText: "La alfombra decora la sala y la conversación." }],
    ["Responder con regalo mayor", { gold: -6, nobility: 3 }, { characters: [{ id: "embajadora_samira" }], addTags: ["outgifted_qalat"], resultText: "Samira sonríe como quien gana perdiendo." }],
    ["Preguntar por la derrota", { threat: -2, nobility: -1 }, { characters: [{ id: "embajadora_samira" }], addTags: ["questioned_qalat_warning"], defer: [{ delay: 6, eventId: "qalat_plain_words" }], resultText: "La cortesía pierde una capa." }]
  ], { family: "diplomat", families: ["diplomat", "nobility"], weight: 0.85 }),

  event("heir_bad_poem", "Poema del heredero", "El heredero recita un poema terrible ante la corte. Nadie sabe si aplaudir por amor o por supervivencia política.", [
    ["Aplaudir con entusiasmo", { nobility: 2, people: -1 }, { addTags: ["heir_praised_anyway"], resultText: "El heredero brilla. La poesía no." }],
    ["Corregirlo con cariño", { nobility: -1, people: 2 }, { addTags: ["heir_honest_lesson"], resultText: "El niño aprende que una corona no mejora los versos." }],
    ["Nombrar tutor literario", { gold: -3, nobility: 1 }, { addTags: ["heir_tutor_hired"], defer: [{ delay: 7, eventId: "heir_tutor_report" }], resultText: "El heredero gana maestro; la corte, esperanza." }]
  ], { family: "steward", families: ["steward", "nobility", "people"], weight: 0.75 }),

  event("border_shepherds", "Pastores de la linde", "Pastores de dos aldeas discuten por una colina. La frontera entre pastos parece más peligrosa que muchas murallas.", [
    ["Marcar lindes reales", { gold: -3, people: 3, threat: -2 }, { addTags: ["pasture_boundary_marked"], resultText: "Las piedras reales separan ovejas y orgullo." }],
    ["Dar la colina a quien pague", { gold: 5, people: -4 }, { addTags: ["pasture_sold"], defer: [{ delay: 5, eventId: "pasture_grudge" }], resultText: "La colina cambia de dueño; el rencor no." }],
    ["Enviar mediador religioso", { faith: 2, people: 1 }, { addTags: ["pasture_mediated_by_church"], resultText: "El mediador promete que Dios prefiere ovejas vivas." }]
  ], { family: "diplomat", families: ["diplomat", "people", "clergy"], weight: 0.9 }),

  event("frozen_road", "Camino helado", "El camino norte se ha vuelto una cinta de hielo. Los carros se retrasan y los juramentos llegan antes que la comida.", [
    ["Echar sal real", { gold: -3, food: 2 }, { addTags: ["salted_north_road"], resultText: "El hielo cede con desgana." }],
    ["Cerrar ruta temporalmente", { food: -3, threat: -2 }, { addTags: ["north_road_closed_ice"], resultText: "Nadie cae al barranco. Nadie llega tampoco." }],
    ["Permitir paso bajo riesgo", { outcomes: [{ probability: 0.55, immediate: { food: 4, gold: 2 }, text: "Los carros cruzan con ruedas lentas y plegarias rápidas." }, { probability: 0.45, immediate: { food: -4, people: -2 }, text: "Un carro cae y el hielo cobra peaje." }] }, { addTags: ["risked_icy_road"] }]
  ], { family: "merchants", families: ["merchants", "people", "diplomat"], weight: 0.85 }),

  event("midwife_herbs", "Hierbas de Isolda", "Isolda la Matrona pide permiso para cultivar hierbas medicinales en un terreno real abandonado.", [
    ["Ceder terreno", { people: 4, faith: -1 }, { characters: [{ id: "isolda_matrona" }], addTags: ["healer_garden"], resultText: "El terreno viejo empieza a oler a menta y sospecha clerical." }],
    ["Ponerla bajo supervisión del médico", { gold: -2, people: 2 }, { characters: [{ id: "isolda_matrona" }, { id: "doctor_avelino" }], addTags: ["supervised_healer_garden"], resultText: "Isolda acepta supervisión como quien acepta lluvia." }],
    ["Negarlo", { faith: 2, people: -3 }, { characters: [{ id: "isolda_matrona" }], addTags: ["healer_garden_denied"], resultText: "La Iglesia duerme tranquila; los enfermos, no tanto." }]
  ], { family: "apothecary", families: ["apothecary", "people", "clergy"], weight: 0.9 }),

  event("falcon_lost", "Halcón perdido", "El halcón favorito de un noble ha desaparecido. Ofrece recompensa y culpa a niños, criados y quizá al viento.", [
    ["Ayudar en la búsqueda", { gold: -2, nobility: 3 }, { addTags: ["searched_noble_falcon"], resultText: "Medio reino mira árboles por un pájaro caro." }],
    ["Ignorar el capricho", { people: 2, nobility: -3 }, { addTags: ["ignored_falcon_drama"], resultText: "El pueblo agradece que la corona sepa distinguir plumas de problemas." }],
    ["Cobrar tasa de búsqueda", { gold: 3, nobility: -1 }, { addTags: ["falcon_search_tax"], resultText: "El noble paga por su amor emplumado." }]
  ], { family: "nobility", families: ["nobility", "people"], weight: 0.7 }),

  event("river_bones", "Huesos en el río", "Un niño encuentra huesos humanos junto al río. Nadie sabe si son antiguos, recientes o útiles para acusar al vecino.", [
    ["Investigar con alguacil", { gold: -2, threat: -2 }, { characters: [{ id: "alguacil_ines" }], addTags: ["river_bones_investigated"], defer: [{ delay: 5, branches: [{ probability: 0.50, eventId: "river_bones_old" }, { probability: 0.50, eventId: "river_bones_recent" }] }], resultText: "Inés acordona barro y rumores." }],
    ["Entierro religioso", { faith: 3, people: 1 }, { addTags: ["river_bones_buried"], resultText: "Los huesos descansan antes de contar su historia." }],
    ["Decir que son de animales", { threat: 2 }, { addTags: ["river_bones_dismissed"], resultText: "El río no confirma ni desmiente." }]
  ], { family: "spy", families: ["spy", "clergy", "people"], weight: 0.85 }),

  event("rain_after_drought", "Lluvia tardía", "Tras semanas secas, la lluvia cae con fuerza. Los campesinos ríen hasta que los caminos empiezan a deshacerse.", [
    ["Celebrar rogativa cumplida", { faith: 3, food: 3 }, { addTags: ["rain_thanked"], resultText: "La lluvia parece bendición mientras no mire los caminos." }],
    ["Reforzar caminos", { gold: -4, food: 2 }, { addTags: ["mud_roads_reinforced"], resultText: "El barro encuentra menos víctimas." }],
    ["Dejar que drene", { food: 4, threat: 2 }, { addTags: ["rain_unmanaged"], defer: [{ delay: 4, eventId: "mud_blocks_carts" }], resultText: "El agua baja por donde quiere." }]
  ], { family: "people", families: ["people", "merchants", "public_works"], weight: 0.9 }),

  event("old_treaty_clause", "Cláusula olvidada", "Samira encuentra en un tratado viejo una cláusula que obliga a intercambiar rehenes nobles en tiempo de tensión. La tinta vieja todavía muerde.", [
    ["Honrar la cláusula", { nobility: -3, threat: -4 }, { characters: [{ id: "embajadora_samira" }], addTags: ["old_treaty_honored"], resultText: "Los tratados respiran cuando duelen." }],
    ["Renegociarla", { gold: -3, threat: -2 }, { characters: [{ id: "embajadora_samira" }], addTags: ["old_treaty_renegotiated"], defer: [{ delay: 6, eventId: "qalat_counteroffer" }], resultText: "Samira acepta hablar; eso nunca significa ceder." }],
    ["Declararla caduca", { nobility: 2, threat: 5 }, { addTags: ["old_treaty_rejected"], resultText: "La corte aplaude. Los mapas no." }]
  ], { family: "diplomat", families: ["diplomat", "nobility", "diplomat"], weight: 0.8 }),

  event("fever_contained", "Fiebre contenida", "Los sanadores contienen la fiebre antes de que aprenda el nombre de todas las calles.", [
    ["Premiar a sanadores", { gold: -3, people: 4 }, { addTags: ["healers_rewarded"] }],
    ["Registrar el método", { gold: -2, faith: 1 }, { addTags: ["fever_method_recorded"] }]
  ], { kind: "consequence", family: "apothecary" }),

  event("fever_spreads", "La fiebre conoce puertas", "La fiebre salta de casa en casa. Ya no es noticia médica: es miedo con temperatura.", [
    ["Cuarentena dura", { people: -5, threat: -5 }, { addTags: ["hard_fever_quarantine"] }],
    ["Hospital de campaña", { gold: -7, people: 3, faith: 1 }, { addTags: ["field_hospital"] }]
  ], { kind: "consequence", family: "apothecary" }),

  event("roofs_fixed_by_neighbors", "Vecinos en los tejados", "La madera repartida basta porque los vecinos suben a reparar juntos. La ciudad recuerda que también tiene manos.", [
    ["Enviar comida a voluntarios", { food: -2, people: 4 }, { addTags: ["roof_volunteers_fed"] }],
    ["Agradecimiento público", { people: 3, nobility: 1 }, { addTags: ["roof_volunteers_praised"] }]
  ], { kind: "consequence", family: "people" }),

  event("roof_materials_stolen", "Clavos desaparecidos", "Parte de la madera y los clavos acaba en almacenes privados antes de tocar un tejado.", [
    ["Perseguir robo", { gold: -2, threat: -3 }, { addTags: ["roof_thieves_hunted"] }],
    ["Repartir segunda tanda", { gold: -4, people: 3 }, { addTags: ["second_roof_materials"] }]
  ], { kind: "consequence", family: "spy" }),

  event("singing_stone_ore", "Piedra con plata", "Donde la piedra cantaba había una veta menor de plata. El mapa mentía con poesía útil.", [
    ["Explotarla", { gold: 9, threat: 2 }, { addTags: ["silver_vein_claimed"] }],
    ["Mantenerla secreta", { gold: 4, nobility: 2 }, { addTags: ["silver_vein_secret"] }]
  ], { kind: "consequence", family: "scholar", requiresTags: ["singing_stone_survey"] }),

  event("singing_stone_nothing", "Solo viento", "La piedra cantaba porque el viento atravesaba grietas. No hay plata, pero sí un paso oculto entre colinas.", [
    ["Marcar paso seguro", { threat: -3, gold: -1 }, { addTags: ["hidden_pass_marked"] }],
    ["Cobrar ruta nueva", { gold: 4 }, { addTags: ["hidden_pass_toll"] }]
  ], { kind: "consequence", family: "scholar", requiresTags: ["singing_stone_survey"] }),

  event("singing_stone_collapse", "La piedra se abre", "La prospección provoca un derrumbe. La montaña guardaba silencio por una razón.", [
    ["Rescatar mineros", { gold: -5, people: 3 }, { addTags: ["collapse_rescue"] }],
    ["Sellar el lugar", { threat: -3, people: -2 }, { addTags: ["singing_stone_sealed"] }]
  ], { kind: "consequence", family: "scholar", requiresTags: ["singing_stone_survey"] }),

  event("qalat_plain_words", "Palabras sin bordado", "Samira admite que la alfombra era advertencia: otros reinos miran tu frontera como mesa servida.", [
    ["Pedir pacto de información", { gold: -3, threat: -4 }, { addTags: ["qalat_intel_pact"] }],
    ["Mostrar fuerza", { army: -2, nobility: 2, threat: -2 }, { addTags: ["displayed_strength_to_qalat"] }]
  ], { kind: "consequence", family: "diplomat", requiresTags: ["questioned_qalat_warning"] }),

  event("heir_tutor_report", "Informe del tutor", "El tutor del heredero informa que el niño no será poeta, pero aprende a escuchar críticas sin romper copas.", [
    ["Continuar lecciones", { gold: -2, nobility: 2 }, { addTags: ["heir_lessons_continue"] }],
    ["Presentarlo al pueblo", { people: 3, nobility: -1 }, { addTags: ["heir_seen_by_people"] }]
  ], { kind: "consequence", family: "steward", requiresTags: ["heir_tutor_hired"] }),

  event("pasture_grudge", "La colina vendida", "La aldea que perdió la colina ahora corta cercas de noche. Comprar paz con oro vendió otra cosa.", [
    ["Reabrir mediación", { gold: -2, people: 2, threat: -2 }, { addTags: ["pasture_reopened"] }],
    ["Castigar sabotajes", { threat: -3, people: -3 }, { addTags: ["pasture_saboteurs_punished"] }]
  ], { kind: "consequence", family: "diplomat", requiresTags: ["pasture_sold"] }),

  event("river_bones_old", "Huesos antiguos", "Los huesos pertenecen a muertos de una guerra vieja. El río devolvió historia, no crimen.", [
    ["Monumento pequeño", { gold: -3, faith: 2, people: 2 }, { addTags: ["old_bones_memorial"] }],
    ["Archivo militar", { army: 1, nobility: 1 }, { addTags: ["old_bones_archived"] }]
  ], { kind: "consequence", family: "clergy", requiresTags: ["river_bones_investigated"] }),

  event("river_bones_recent", "Huesos recientes", "Inés confirma que los huesos son recientes. Alguien usó el río como juez.", [
    ["Abrir investigación criminal", { gold: -3, threat: -4 }, { addTags: ["river_murder_investigation"] }],
    ["Cerrar el río de noche", { people: -2, threat: -3 }, { addTags: ["river_night_closure"] }]
  ], { kind: "consequence", family: "spy", requiresTags: ["river_bones_investigated"] }),

  event("mud_blocks_carts", "Barro hasta los ejes", "Los carros quedan atrapados en caminos empapados. La lluvia dio vida al campo y hambre a la ciudad.", [
    ["Enviar cuadrillas", { gold: -4, food: 2 }, { addTags: ["mud_cleared"] }],
    ["Priorizar carros de grano", { army: -1, food: 4, people: -1 }, { addTags: ["grain_carts_prioritized"] }]
  ], { kind: "consequence", family: "merchants", requiresTags: ["rain_unmanaged"] }),

  event("qalat_counteroffer", "Contraoferta de Qalat", "Samira acepta retirar la cláusula de rehenes si entregas paso preferente a sus caravanas.", [
    ["Aceptar paso preferente", { gold: 3, nobility: -2, threat: -3 }, { addTags: ["qalat_preferred_passage"] }],
    ["Ofrecer tributo menor", { gold: -4, threat: -2 }, { addTags: ["qalat_minor_tribute"] }]
  ], { kind: "consequence", family: "diplomat", requiresTags: ["old_treaty_renegotiated"] })
];

registerEvents(eventsDatabase);

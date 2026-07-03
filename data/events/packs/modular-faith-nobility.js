registerEvents([
  event("monastery_roof_leaks", "Goteras en San Elías", "El abad Berenguer dice que la lluvia cae sobre los manuscritos como si Dios tuviera mala puntería.", [
    ["Pagar carpinteros", { gold: -5, faith: 4 }, { characters: [{ id: "abad_berenguer" }], addTags: ["monastery_roof_repaired"], resultText: "El claustro queda seco y el abad pronuncia tu nombre en misa." }],
    ["Enviar madera vieja", { gold: -2, faith: 2 }, { characters: [{ id: "abad_berenguer" }], defer: [{ delay: 5, branches: [{ probability: 0.65, eventId: "monastery_roof_holds" }, { probability: 0.35, eventId: "monastery_roof_falls" }] }], resultText: "La reparación parece suficiente desde lejos." }],
    ["Decir que recen por sol", { faith: -4, nobility: 1 }, { addTags: ["mocked_monastery_need"], resultText: "La corte ríe más que el monasterio." }]
  ], { family: "church", families: ["church", "public_works"], weight: 1 }),

  event("relic_seller", "Reliquia en venta", "Un mercader ofrece un dedo santo en una cajita de plata. El abad palidece: podría ser milagro, fraude o ambas cosas caras.", [
    ["Comprar para la iglesia", { gold: -6, faith: 5 }, { addTags: ["bought_relic"], defer: [{ delay: 6, branches: [{ probability: 0.50, eventId: "relic_draws_pilgrims" }, { probability: 0.50, eventId: "relic_questioned" }] }], resultText: "La cajita queda sellada bajo tres velas." }],
    ["Examinarla primero", { gold: -2 }, { addTags: ["relic_examined"], defer: [{ delay: 4, branches: [{ probability: 0.60, eventId: "relic_fake" }, { probability: 0.40, eventId: "relic_true_enough" }] }], resultText: "Los sabios discuten si la santidad tiene olor a cera vieja." }],
    ["Expulsar al vendedor", { faith: 1, gold: 1 }, { addTags: ["relic_seller_expelled"], resultText: "El mercader se marcha jurando que tu reino desprecia milagros." }]
  ], { family: "church", families: ["church", "commerce"], weight: 0.95 }),

  event("confession_seal", "Secreto de confesión", "Un sacerdote asegura saber quién roba a los pobres, pero dice que el secreto de confesión ata su lengua.", [
    ["Respetar el sello", { faith: 4, people: -2 }, { addTags: ["respected_confession"], resultText: "La Iglesia respira; el barrio bajo no entiende tanta paciencia." }],
    ["Presionarlo discretamente", { faith: -2, threat: -3 }, { addTags: ["pressed_confessor"], resultText: "La verdad sale torcida, pero sale." }],
    ["Ofrecer amnistía al ladrón", { gold: -2, people: 3 }, { addTags: ["mercy_for_thief"], defer: [{ delay: 5, eventId: "thief_returns_alms" }], resultText: "La ciudad oye que incluso el pecado puede encontrar puerta." }]
  ], { family: "church", families: ["church", "crime", "people"], weight: 1 }),

  event("noble_hunt_damage", "Caza noble", "La Duquesa Elvira vuelve de caza con venados, risas y media huerta campesina pisoteada.", [
    ["Exigir compensación", { people: 4, nobility: -4 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["noble_hunt_compensated"], resultText: "Los campesinos reciben plata; la duquesa guarda silencio con dientes." }],
    ["Cubrir daños con tesoro", { gold: -5, people: 3, nobility: 2 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["covered_noble_damage"], resultText: "Todos sonríen salvo el tesorero." }],
    ["Ignorar quejas", { nobility: 3, people: -5 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["ignored_peasant_damage"], defer: [{ delay: 5, eventId: "trampled_fields_anger" }], resultText: "La nobleza brinda; el campo cuenta pisadas." }]
  ], { family: "nobility", families: ["nobility", "people"], weight: 1.05 }),

  event("baron_debt_plea", "Deuda del barón", "El Barón Mendo pide que la corona compre sus deudas para evitar que sus tierras caigan en manos de prestamistas.", [
    ["Comprar la deuda", { gold: -8, nobility: 4 }, { characters: [{ id: "baron_mendo" }], addTags: ["baron_debt_bought"], defer: [{ delay: 7, eventId: "baron_asks_again" }], resultText: "Mendo besa tu anillo con alivio demasiado ensayado." }],
    ["Exigir tierras a cambio", { gold: -4, nobility: -2, food: 3 }, { characters: [{ id: "baron_mendo" }], addTags: ["baron_lands_taken"], resultText: "La deuda baja; el orgullo del barón también." }],
    ["Negarse", { nobility: -3, gold: 2 }, { characters: [{ id: "baron_mendo" }], addTags: ["refused_baron_debt"], resultText: "Mendo se inclina como quien promete recordar cada baldosa." }]
  ], { family: "nobility", families: ["nobility", "commerce"], weight: 0.95 }),

  event("chapel_singers", "Coro desafinado", "El coro de la capilla canta tan mal que los nobles llegan tarde a misa. El abad dice que Dios escucha intención; la corte escucha ruido.", [
    ["Contratar maestro de canto", { gold: -3, faith: 3, nobility: 1 }, { addTags: ["chapel_music_improved"], resultText: "La misa suena menos a castigo." }],
    ["Mantener a los niños pobres", { faith: 2, people: 2, nobility: -2 }, { addTags: ["poor_children_choir"], resultText: "Cantan mal, pero comen después de cantar." }],
    ["Silenciar el coro", { nobility: 2, faith: -3 }, { addTags: ["choir_silenced"], resultText: "La capilla queda ordenada y fría." }]
  ], { family: "church", families: ["church", "nobility", "people"], weight: 0.75 }),

  event("duchess_marriage_gift", "Regalo de boda", "La Duquesa Elvira pide un regalo real para la boda de su sobrina. El regalo será leído como afecto, miedo o desprecio.", [
    ["Enviar joyas", { gold: -6, nobility: 5 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["ormont_wedding_gift"], resultText: "La casa Ormont exhibe tu generosidad como si fuera suya." }],
    ["Enviar grano para la fiesta", { food: -4, people: 2, nobility: 2 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["practical_wedding_gift"], resultText: "Los invitados comen bien; la duquesa sonríe con esfuerzo." }],
    ["Enviar una carta", { nobility: -4 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["wedding_snub"], defer: [{ delay: 6, eventId: "ormont_cold_invitation" }], resultText: "La carta pesa menos que el insulto." }]
  ], { family: "nobility", families: ["nobility", "diplomacy"], weight: 0.85 }),

  event("forbidden_sermon", "Sermón incómodo", "Un fraile predica que los reyes también serán juzgados. El pueblo escucha con hambre de justicia.", [
    ["Permitirlo", { faith: 3, people: 3, nobility: -2 }, { addTags: ["allowed_hard_sermons"], resultText: "El sermón termina y nadie prende fuego a nada. Eso también es victoria." }],
    ["Pedir sermones más suaves", { faith: -2, nobility: 2 }, { addTags: ["softened_sermons"], resultText: "La Iglesia obedece en público y te estudia en privado." }],
    ["Expulsar al fraile", { faith: -5, threat: -2, people: -2 }, { addTags: ["exiled_friar"], defer: [{ delay: 5, eventId: "friar_becomes_symbol" }], resultText: "Un hombre sale del reino; una frase se queda." }]
  ], { family: "church", families: ["church", "people", "nobility"], weight: 1 }),

  event("noble_table_order", "Orden de mesa", "Dos casas nobles amenazan con marcharse del banquete si una se sienta por debajo de la otra. El hambre de honor supera al de comida.", [
    ["Sentarlas por antigüedad", { nobility: 2 }, { addTags: ["court_protocol_old_blood"], resultText: "Los viejos linajes respiran satisfechos." }],
    ["Sentarlas por mérito", { nobility: -2, army: 2 }, { addTags: ["court_protocol_merit"], resultText: "Los militares sonríen; los genealogistas sufren." }],
    ["Cancelar el banquete", { gold: 3, nobility: -5 }, { addTags: ["banquet_cancelled"], resultText: "Ahorras comida y compras enemistades finas." }]
  ], { family: "nobility", families: ["nobility", "royal_family"], weight: 0.9 }),

  event("monk_copies_law", "Copias de la ley", "Un monje ofrece copiar leyes del reino para que todos sepan qué se castiga. Algunos consejeros prefieren que la ley siga siendo niebla.", [
    ["Financiar copias públicas", { gold: -4, people: 4, nobility: -1 }, { addTags: ["public_law_copies"], resultText: "La ley deja de ser solo voz de alguaciles." }],
    ["Solo copias para jueces", { gold: -2, threat: -2 }, { addTags: ["judicial_law_copies"], resultText: "Los jueces ganan claridad; el pueblo sigue preguntando." }],
    ["Rechazarlo", { nobility: 2, people: -2 }, { addTags: ["law_kept_obscure"], resultText: "La niebla legal permanece muy útil para quien sabe caminarla." }]
  ], { family: "church", families: ["church", "crime", "people"], weight: 0.85 }),

  event("illegitimate_cousin", "Primo ilegítimo", "Un joven de rostro demasiado familiar afirma llevar sangre real. No pide corona: pide reconocimiento y una cama segura.", [
    ["Reconocerlo discretamente", { gold: -3, nobility: -2, people: 2 }, { addTags: ["bastard_cousin_recognized"], defer: [{ delay: 8, eventId: "bastard_cousin_useful" }], resultText: "Una rama incómoda entra en el árbol familiar." }],
    ["Enviar al monasterio", { faith: 2, nobility: 1 }, { addTags: ["bastard_sent_church"], resultText: "El muchacho cambia apellido por hábito." }],
    ["Expulsarlo", { nobility: 2, people: -2 }, { addTags: ["bastard_exiled"], defer: [{ delay: 7, eventId: "bastard_cousin_returns_angry" }], resultText: "La sangre negada no siempre se seca." }]
  ], { family: "royal_family", families: ["royal_family", "nobility", "church"], weight: 0.75 }),

  event("pilgrim_crowd", "Peregrinos en la puerta", "Un grupo de peregrinos pide entrar antes de la noche. Traen cantos, polvo y quizá fiebre.", [
    ["Abrir hospicio", { gold: -4, faith: 4, people: 1 }, { addTags: ["welcomed_pilgrims"], defer: [{ delay: 5, branches: [{ probability: 0.70, eventId: "pilgrims_bless_city" }, { probability: 0.30, eventId: "pilgrim_coughs" }] }], resultText: "La ciudad gana voces cansadas y velas nuevas." }],
    ["Dejarles fuera con comida", { food: -4, faith: 2, threat: -1 }, { addTags: ["fed_pilgrims_outside"], resultText: "Comen bajo el muro, agradecidos y visibles." }],
    ["Cerrar las puertas", { faith: -4, threat: -2 }, { addTags: ["closed_doors_to_pilgrims"], resultText: "La noche queda fuera. También sus oraciones." }]
  ], { family: "church", families: ["church", "disease", "people"], weight: 0.95 }),

  event("noble_private_guard", "Guardia privada", "La Duquesa Elvira solicita permiso para ampliar su guardia privada. Dice que es por seguridad. Rodrigo lo llama ejército con perfume.", [
    ["Conceder permiso", { nobility: 4, threat: 3 }, { characters: [{ id: "duquesa_elvira" }, { id: "capitan_rodrigo" }], addTags: ["private_guard_allowed"], issues: [{ action: "create", issue: { id: "ormont-private-guard", actorId: "duquesa_elvira", type: "feud", stage: 0, tension: 35, trust: 45, tags: ["private_guard"] } }], resultText: "Elvira agradece con una inclinación demasiado militar." }],
    ["Limitar número de hombres", { nobility: 1, threat: -1 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["private_guard_limited"], resultText: "La duquesa acepta la mitad como quien memoriza una deuda." }],
    ["Prohibirlo", { nobility: -4, army: 2 }, { characters: [{ id: "duquesa_elvira" }], addTags: ["private_guard_forbidden"], resultText: "El ejército te respeta más; la casa Ormont bastante menos." }]
  ], { family: "nobility", families: ["nobility", "army", "feud"], weight: 1 }),

  event("church_tithe_short", "Diezmo corto", "El abad Berenguer afirma que el diezmo ha llegado incompleto. El recaudador asegura que Dios no sabe sumar.", [
    ["Cubrir la diferencia", { gold: -4, faith: 4 }, { characters: [{ id: "abad_berenguer" }], addTags: ["tithe_covered"], resultText: "El abad agradece la reparación, no la causa." }],
    ["Auditar diezmos", { gold: -2 }, { issues: [{ action: "create", issue: { id: "tithe-dispute", actorId: "abad_berenguer", type: "tithe", stage: 0, tension: 35, trust: 45, tags: ["accounts"] } }], defer: [{ delay: 5, branches: [{ probability: 0.50, eventId: "tithe_miscount" }, { probability: 0.50, eventId: "tithe_theft" }] }], resultText: "Los libros de Dios y del rey se abren a la vez." }],
    ["Negar la queja", { faith: -4, gold: 2 }, { characters: [{ id: "abad_berenguer" }], addTags: ["denied_tithe_claim"], resultText: "El abad no alza la voz. No necesita hacerlo." }]
  ], { family: "church", families: ["church", "commerce", "tithe"], weight: 0.9 }),

  event("monastery_roof_holds", "El tejado resiste", "La madera vieja aguanta. El abad lo llama providencia; el carpintero, suerte.", [
    ["Enviar limosna de gratitud", { gold: -2, faith: 3 }, { addTags: ["monastery_luck_thanked"] }],
    ["Dar el asunto por cerrado", { faith: 1 }, { addTags: ["monastery_roof_closed"] }]
  ], { kind: "consequence", family: "church" }),

  event("monastery_roof_falls", "Techo sobre pergaminos", "Una viga cede durante la lluvia. Nadie muere, pero se pierden páginas antiguas.", [
    ["Restaurar el scriptorium", { gold: -6, faith: 5 }, { addTags: ["scriptorium_restored"] }],
    ["Culpar al carpintero", { faith: -2, gold: 2 }, { addTags: ["carpenter_blamed"] }]
  ], { kind: "consequence", family: "church" }),

  event("relic_draws_pilgrims", "La reliquia atrae pasos", "La cajita de plata llena la ciudad de peregrinos y monedas pequeñas.", [
    ["Organizar feria devota", { gold: 5, faith: 4, people: 1 }, { addTags: ["relic_fair"] }],
    ["Controlar multitudes", { army: -2, threat: -2, faith: 2 }, { addTags: ["relic_ordered"] }]
  ], { kind: "consequence", family: "church", requiresTags: ["bought_relic"] }),

  event("relic_questioned", "Dedo de santo dudoso", "Un clérigo visitante asegura que el santo ya tenía todos sus dedos contados en otra abadía.", [
    ["Encargar investigación", { gold: -3, faith: -1 }, { addTags: ["relic_investigated"] }],
    ["Defender la devoción", { faith: 3, nobility: -1 }, { addTags: ["relic_defended"] }]
  ], { kind: "consequence", family: "church", requiresTags: ["bought_relic"] }),

  event("relic_fake", "La reliquia era hueso de cabra", "La investigación concluye que el dedo santo perteneció a una cabra muy poco canonizada.", [
    ["Hacerlo público", { faith: -3, people: 2 }, { addTags: ["fake_relic_exposed"] }],
    ["Enterrar el informe", { gold: -1, faith: 2 }, { addTags: ["fake_relic_hidden"] }]
  ], { kind: "consequence", family: "church", requiresTags: ["relic_examined"] }),

  event("relic_true_enough", "Santidad suficiente", "Nadie puede probar la reliquia, pero tampoco desacreditarla. A veces la fe vive en ese hueco.", [
    ["Bendecirla oficialmente", { faith: 5 }, { addTags: ["relic_blessed"] }],
    ["Mantenerla privada", { nobility: 1, faith: 2 }, { addTags: ["private_relic"] }]
  ], { kind: "consequence", family: "church", requiresTags: ["relic_examined"] }),

  event("thief_returns_alms", "El ladrón vuelve con pan", "El ladrón amnistiado deja pan en la iglesia y nombres bajo la puerta de la alguacil.", [
    ["Usar los nombres", { threat: -4, faith: 1 }, { addTags: ["confession_names_used"] }],
    ["Proteger al arrepentido", { people: 2, threat: -2 }, { addTags: ["protected_repentant"] }]
  ], { kind: "consequence", family: "crime", requiresTags: ["mercy_for_thief"] }),

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
  ], { kind: "consequence", family: "church", requiresTags: ["exiled_friar"] }),

  event("bastard_cousin_useful", "El primo discreto", "El primo reconocido oye cosas que los nobles no dirían ante un heredero legítimo.", [
    ["Usarlo como oído en la corte", { nobility: -1, threat: -3 }, { addTags: ["bastard_spy"] }],
    ["Darle oficio honrado", { gold: -2, people: 2 }, { addTags: ["bastard_settled"] }]
  ], { kind: "consequence", family: "royal_family", requiresTags: ["bastard_cousin_recognized"] }),

  event("bastard_cousin_returns_angry", "Sangre en otra bandera", "El primo expulsado vuelve como huésped de una casa rival. Ahora sí tiene cama segura.", [
    ["Comprar su silencio", { gold: -6, nobility: 1 }, { addTags: ["bastard_silenced"] }],
    ["Desacreditarlo", { nobility: -3, threat: 2 }, { addTags: ["bastard_discredited"] }]
  ], { kind: "consequence", family: "royal_family", requiresTags: ["bastard_exiled"] }),

  event("pilgrims_bless_city", "Bendición de caminantes", "Los peregrinos parten dejando velas, historias y una pequeña bolsa común para los pobres.", [
    ["Aceptar donativo", { gold: 3, faith: 3 }, { addTags: ["pilgrim_blessing"] }],
    ["Entregarlo al barrio bajo", { people: 4, faith: 2 }, { addTags: ["pilgrim_alms_shared"] }]
  ], { kind: "consequence", family: "church", requiresTags: ["welcomed_pilgrims"] }),

  event("pilgrim_coughs", "Tos entre peregrinos", "Una tos persistente se extiende en el hospicio. La misericordia también trae riesgos bajo la manta.", [
    ["Cuarentena amable", { gold: -4, faith: 2, threat: -2 }, { addTags: ["gentle_quarantine"] }],
    ["Expulsarlos", { faith: -5, threat: -3 }, { addTags: ["pilgrims_expelled_sick"] }]
  ], { kind: "consequence", family: "disease", requiresTags: ["welcomed_pilgrims"] }),

  event("tithe_miscount", "Error de cuentas", "Los diezmos estaban mal contados por incompetencia, no por robo. El error irrita menos que la sospecha.", [
    ["Corregir libros", { gold: -2, faith: 3 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["tithe_books_corrected"] }] }],
    ["Exigir disculpa pública", { faith: -1, nobility: 1 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["church_apologized"] }] }]
  ], { kind: "consequence", family: "church", issue: { id: "tithe-dispute" } }),

  event("tithe_theft", "Diezmo desviado", "Parte del diezmo acabó en manos de un escribano real. La Iglesia tiene razón, lo peor posible.", [
    ["Castigar al escribano", { faith: 4, threat: -2 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["tithe_thief_punished"] }] }],
    ["Devolver sin escándalo", { gold: -5, faith: 2 }, { issues: [{ action: "resolve", issueId: "tithe-dispute", addTags: ["tithe_scandal_hidden"] }] }]
  ], { kind: "consequence", family: "church", issue: { id: "tithe-dispute" } })
]);

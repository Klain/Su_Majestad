const GAME_VERSION = "v0.6.4";
const DEBUG_UI = false;
const STORAGE_KEY = "su-majestad-save-v2";
const LEGACY_STORAGE_KEY = "su-majestad-save-v1";
const MAX_DAYS = 30;
const EVENTS_PER_DAY = 2;


const tooltipTexts = {
  resources: {
    gold: "Sirve para pagar obras, sobornos, soldados y reparaciones. Si el oro cae a 0, la corona entra en bancarrota.",
    food: "Mide reservas y abastecimiento. Si la comida cae a 0, llega la hambruna al reino.",
    army: "Representa soldados, disciplina y capacidad de imponer orden. Si el ejército cae a 0, la corona queda indefensa.",
    people: "Mide apoyo popular y bienestar común. Si el pueblo cae a 0, la paciencia del reino se rompe y estalla la revuelta.",
    nobility: "Mide apoyo de casas nobles, linajes y corte. Si la nobleza cae a 0, los grandes señores se vuelven contra el trono.",
    faith: "Mide legitimidad religiosa y apoyo de la Iglesia. Si la fe cae a 0, el trono pierde su amparo espiritual.",
    crown: "Representa la confianza del reino en el monarca. Si la Corona cae a 0, el reinado pierde su legitimidad y termina.",
    threat: "Mide peligro acumulado, crimen, guerra e inestabilidad. Si llega a 100, el reino queda consumido por la crisis."
  },
  reign: {
    trait: "Rasgo inicial del monarca. Modifica el arranque de la partida y da identidad a este reinado.",
    ambition: "Objetivo secundario del reinado. Cumplirlo mejora el epílogo final.",
    religion: "Religión inicial del reino. Define cómo se articula la Fe y aplica un bono al comenzar.",
    crisis: "Conflicto persistente con actor, tensión y confianza.",
    edict: "Edicto convertido en noticia temporal del reino."
  },
  issues: {
    tension: "Indica lo cerca que está este conflicto de escalar.",
    trust: "Indica la confianza de la facción o actor hacia la corona.",
    stage: "Muestra el nivel narrativo del conflicto: inicial, escalado o crisis abierta.",
    daysOpen: "Tiempo que el asunto lleva sin resolverse."
  },
  chips: {
    uncertain: "El resultado inmediato puede variar.",
    memory: "Esta decisión quedará en la memoria del reino y puede afectar eventos futuros.",
    news: "Esta decisión creará una noticia temporal con efectos durante varios días.",
    consequence: "Esta decisión puede volver más adelante como otro asunto del consejo.",
    conflict: "Esta decisión puede crear, modificar, escalar o resolver una crisis persistente.",
    positive: "Este recurso tiende a mejorar.",
    negative: "Este recurso tiende a empeorar."
  }
};

const resourceMeta = {
  gold: ["Oro", "🪙"],
  food: ["Comida", "🌾"],
  army: ["Ejército", "⚔️"],
  people: ["Pueblo", "🧑‍🌾"],
  nobility: ["Nobleza", "👑"],
  faith: ["Fe", "⛪"],
  crown: ["Corona", "♛"],
  threat: ["Amenaza", "🔥"]
};



const kingdomReligions = [
  {
    id: "altar_rite",
    name: "Rito del Altar Alto",
    description: "La Fe se ordena alrededor de templos, liturgia solemne y obediencia clerical.",
    bonus: { faith: 18, nobility: 4 },
    futureHooks: { evolution: ["sacred_realm", "monastery_patronage"], rupture: ["clerical_schism", "heresy_trials"] }
  },
  {
    id: "hearth_cult",
    name: "Culto del Hogar",
    description: "La devoción vive en plazas, familias y fiestas comunales antes que en palacios.",
    bonus: { people: 16, faith: 6 },
    futureHooks: { evolution: ["popular_saints", "village_confraternities"], rupture: ["folk_heresy", "pilgrim_riots"] }
  },
  {
    id: "crown_mandate",
    name: "Mandato de la Corona",
    description: "La religión proclama que gobernar bien es custodiar un orden sagrado desde el trono.",
    bonus: { crown: 16, faith: 4 },
    futureHooks: { evolution: ["anointed_dynasty", "royal_synod"], rupture: ["legitimacy_dispute", "anti_crown_preachers"] }
  }
];
const kingdomReligionsById = Object.fromEntries(kingdomReligions.map((religion) => [religion.id, religion]));

const ambitions = [
  { id: "merchant", name: "Rey mercader", description: "Acaba con oro alto y comercio favorecido." },
  { id: "pious", name: "Rey piadoso", description: "Acaba con fe alta y sin agravios graves a la iglesia." },
  { id: "people", name: "Rey del pueblo", description: "Acaba con pueblo alto y pocas decisiones crueles." },
  { id: "iron", name: "Rey de hierro", description: "Acaba con ejército alto y amenaza baja." },
  { id: "diplomat", name: "Rey diplomático", description: "Resuelve al menos 2 issues sin escalar demasiado el reino." },
  { id: "noble", name: "Rey noble", description: "Mantén nobleza alta y evita insultos a casas nobles." }
];

const TIER_NAMES = { 1: "Común", 2: "Raro", 3: "Legendario" };

const rulerTraits = [
  { id: "administrator", name: "Administrador", tier: 1, family: "gold", description: "La corona conoce el peso de cada moneda.", onAcquire: { gold: 30 }, passive: {}, evolvesTo: ["royal_treasurer", "tax_collector", "court_merchant"] },
  { id: "royal_treasurer", name: "Tesorero Real", tier: 2, family: "gold", parentId: "administrator", description: "Cada arca del palacio responde ante una sola llave.", onAcquire: { gold: 30 }, passive: {}, evolvesTo: ["treasury_minister", "royal_mint"] },
  { id: "treasury_minister", name: "Ministro del Tesoro", tier: 3, family: "gold", parentId: "royal_treasurer", description: "El reino aprende a obedecer al libro mayor.", onAcquire: { gold: 45 }, passive: {}, evolvesTo: [] },
  { id: "royal_mint", name: "Casa de la Moneda", tier: 3, family: "gold", parentId: "royal_treasurer", description: "La efigie real circula en cada mercado.", onAcquire: {}, passive: { gold: 3, people: -1 }, evolvesTo: [] },
  { id: "tax_collector", name: "Recaudador", tier: 2, family: "gold", parentId: "administrator", description: "Ningún tributo queda fuera de la mirada real.", onAcquire: {}, passive: { gold: 2 }, evolvesTo: ["greater_tax_collector", "iron_treasury"] },
  { id: "greater_tax_collector", name: "Recaudador Mayor", tier: 3, family: "gold", parentId: "tax_collector", description: "Hasta las piedras parecen deber impuestos.", onAcquire: {}, passive: { gold: 3, people: -1 }, evolvesTo: [] },
  { id: "iron_treasury", name: "Hacienda de Hierro", tier: 3, family: "gold", parentId: "tax_collector", description: "La hacienda no negocia: cobra.", onAcquire: { gold: 60 }, passive: { nobility: -1 }, evolvesTo: [] },
  { id: "court_merchant", name: "Mercader de Corte", tier: 2, family: "gold", parentId: "administrator", description: "La corte huele a especias, tinta y contratos.", onAcquire: { gold: 45 }, passive: { nobility: -1 }, evolvesTo: ["merchant_king", "royal_monopolies"] },
  { id: "merchant_king", name: "Rey Mercader", tier: 3, family: "gold", parentId: "court_merchant", description: "El trono habla el idioma del beneficio.", onAcquire: { gold: 90 }, passive: { people: -1 }, evolvesTo: [] },
  { id: "royal_monopolies", name: "Monopolios Reales", tier: 3, family: "gold", parentId: "court_merchant", description: "Todo gran negocio termina pagando a la corona.", onAcquire: {}, passive: { gold: 4, people: -2 }, evolvesTo: [] },
  { id: "royal_granary", name: "Granero Real", tier: 1, family: "seneschal", description: "El pan del mañana duerme bajo sello real.", onAcquire: { food: 30 }, passive: {}, evolvesTo: ["granary_steward", "foresighted", "rationer"] },
  { id: "granary_steward", name: "Mayordomo de Graneros", tier: 2, family: "seneschal", parentId: "royal_granary", description: "Cada saco tiene destino antes de ser cosechado.", onAcquire: { food: 30 }, passive: {}, evolvesTo: ["silo_lord", "warehouse_network"] },
  { id: "silo_lord", name: "Señor de los Silos", tier: 3, family: "seneschal", parentId: "granary_steward", description: "El hambre teme a tus almacenes.", onAcquire: { food: 45 }, passive: {}, evolvesTo: [] },
  { id: "warehouse_network", name: "Red de Almacenes", tier: 3, family: "seneschal", parentId: "granary_steward", description: "Carros y llaves unen las despensas del reino.", onAcquire: {}, passive: { food: 3, gold: -1 }, evolvesTo: [] },
  { id: "foresighted", name: "Previsor", tier: 2, family: "seneschal", parentId: "royal_granary", description: "La escasez se combate antes de tener nombre.", onAcquire: {}, passive: { food: 2 }, evolvesTo: ["general_intendant", "abundance_realm"] },
  { id: "general_intendant", name: "Intendente General", tier: 3, family: "seneschal", parentId: "foresighted", description: "La logística se convierte en ley silenciosa.", onAcquire: {}, passive: { food: 3, gold: -1 }, evolvesTo: [] },
  { id: "abundance_realm", name: "Reino de la Abundancia", tier: 3, family: "seneschal", parentId: "foresighted", description: "Las mesas llenas compran calma.", onAcquire: { food: 90 }, passive: { gold: -1 }, evolvesTo: [] },
  { id: "rationer", name: "Racionador", tier: 2, family: "seneschal", parentId: "royal_granary", description: "La justicia del pan se mide con cuchillo fino.", onAcquire: { food: 45 }, passive: { people: -1 }, evolvesTo: ["winter_hand", "controlled_bread"] },
  { id: "winter_hand", name: "Mano de Invierno", tier: 3, family: "seneschal", parentId: "rationer", description: "La corona guarda reservas aunque el pueblo murmure.", onAcquire: { food: 75 }, passive: { people: -1 }, evolvesTo: [] },
  { id: "controlled_bread", name: "Pan Controlado", tier: 3, family: "seneschal", parentId: "rationer", description: "Cada hogaza nace bajo norma real.", onAcquire: {}, passive: { food: 4, people: -2 }, evolvesTo: [] },
  { id: "veteran", name: "Veterano", tier: 1, family: "army", description: "Tu mano recuerda el peso de la espada.", onAcquire: { army: 30 }, passive: {}, evolvesTo: ["royal_captain", "recruiter", "palace_guard"] },
  { id: "royal_captain", name: "Capitán Real", tier: 2, family: "army", parentId: "veteran", description: "Los estandartes responden rápido a tu voz.", onAcquire: { army: 30 }, passive: {}, evolvesTo: ["crown_marshal", "military_academy"] },
  { id: "crown_marshal", name: "Mariscal de la Corona", tier: 3, family: "army", parentId: "royal_captain", description: "El ejército marcha al ritmo del trono.", onAcquire: { army: 45 }, passive: {}, evolvesTo: [] },
  { id: "military_academy", name: "Academia Militar", tier: 3, family: "army", parentId: "royal_captain", description: "La guerra se enseña antes de declararse.", onAcquire: {}, passive: { army: 3, gold: -1 }, evolvesTo: [] },
  { id: "recruiter", name: "Reclutador", tier: 2, family: "army", parentId: "veteran", description: "Siempre hay otra lanza que levantar.", onAcquire: {}, passive: { army: 2 }, evolvesTo: ["permanent_levy", "warlord"] },
  { id: "permanent_levy", name: "Leva Permanente", tier: 3, family: "army", parentId: "recruiter", description: "La vida civil aprende a marchar.", onAcquire: {}, passive: { army: 3, people: -1 }, evolvesTo: [] },
  { id: "warlord", name: "Señor de la Guerra", tier: 3, family: "army", parentId: "recruiter", description: "La paz parece solo una pausa entre campañas.", onAcquire: { army: 90 }, passive: { gold: -1 }, evolvesTo: [] },
  { id: "palace_guard", name: "Guardia de Palacio", tier: 2, family: "army", parentId: "veteran", description: "La seguridad del trono tiene rostro armado.", onAcquire: { army: 45 }, passive: { nobility: -1 }, evolvesTo: ["praetorian_guard", "barracked_realm"] },
  { id: "praetorian_guard", name: "Guardia Pretoriana", tier: 3, family: "army", parentId: "palace_guard", description: "Los guardianes del rey también pesan en la política.", onAcquire: { army: 75 }, passive: { nobility: -1 }, evolvesTo: [] },
  { id: "barracked_realm", name: "Reino Acuartelado", tier: 3, family: "army", parentId: "palace_guard", description: "El reino duerme junto a sus armas.", onAcquire: {}, passive: { army: 4, people: -2 }, evolvesTo: [] },
  { id: "popular", name: "Popular", tier: 1, family: "people", description: "Tu nombre suena cálido en plazas y tabernas.", onAcquire: { people: 30 }, passive: {}, evolvesTo: ["people_protector", "charismatic", "benefactor"] },
  { id: "people_protector", name: "Protector del Pueblo", tier: 2, family: "people", parentId: "popular", description: "La corona promete escuchar a los humildes.", onAcquire: { people: 30 }, passive: {}, evolvesTo: ["father_of_people", "neighborhood_council"] },
  { id: "father_of_people", name: "Padre del Pueblo", tier: 3, family: "people", parentId: "people_protector", description: "La multitud ve familia donde otros ven poder.", onAcquire: { people: 45 }, passive: {}, evolvesTo: [] },
  { id: "neighborhood_council", name: "Consejo Vecinal", tier: 3, family: "people", parentId: "people_protector", description: "La calle gana voz organizada.", onAcquire: {}, passive: { people: 3, gold: -1 }, evolvesTo: [] },
  { id: "charismatic", name: "Carismático", tier: 2, family: "people", parentId: "popular", description: "Una palabra tuya calma más que un decreto.", onAcquire: {}, passive: { people: 2 }, evolvesTo: ["voice_of_squares", "beloved_crown"] },
  { id: "voice_of_squares", name: "Voz de las Plazas", tier: 3, family: "people", parentId: "charismatic", description: "El rumor popular empieza a hablar en tu favor.", onAcquire: {}, passive: { people: 3, nobility: -1 }, evolvesTo: [] },
  { id: "beloved_crown", name: "Corona Amada", tier: 3, family: "people", parentId: "charismatic", description: "El cariño del pueblo sostiene fiestas y perdones.", onAcquire: { people: 90 }, passive: { gold: -1 }, evolvesTo: [] },
  { id: "benefactor", name: "Benefactor", tier: 2, family: "people", parentId: "popular", description: "La generosidad compra canciones y deudas.", onAcquire: { people: 45 }, passive: { gold: -1 }, evolvesTo: ["great_benefactor", "bread_and_festival"] },
  { id: "great_benefactor", name: "Gran Benefactor", tier: 3, family: "people", parentId: "benefactor", description: "Tu largueza se convierte en leyenda viva.", onAcquire: { people: 75 }, passive: { gold: -1 }, evolvesTo: [] },
  { id: "bread_and_festival", name: "Pan y Fiesta", tier: 3, family: "people", parentId: "benefactor", description: "La alegría pública devora despensas.", onAcquire: {}, passive: { people: 4, food: -2 }, evolvesTo: [] },
  { id: "highborn", name: "Bien Nacido", tier: 1, family: "nobility", description: "Tu sangre abre puertas antes que tu palabra.", onAcquire: { nobility: 30 }, passive: {}, evolvesTo: ["lineage_heir", "courtier", "feudal_lord"] },
  { id: "lineage_heir", name: "Heredero de Linaje", tier: 2, family: "nobility", parentId: "highborn", description: "Los árboles genealógicos se inclinan ante ti.", onAcquire: { nobility: 30 }, passive: {}, evolvesTo: ["first_among_peers", "golden_court"] },
  { id: "first_among_peers", name: "Primero entre Pares", tier: 3, family: "nobility", parentId: "lineage_heir", description: "Los nobles discuten, pero reconocen tu primacía.", onAcquire: { nobility: 45 }, passive: {}, evolvesTo: [] },
  { id: "golden_court", name: "Corte Dorada", tier: 3, family: "nobility", parentId: "lineage_heir", description: "El esplendor ata favores a precio de oro.", onAcquire: {}, passive: { nobility: 3, gold: -1 }, evolvesTo: [] },
  { id: "courtier", name: "Cortesano", tier: 2, family: "nobility", parentId: "highborn", description: "Sabes cuándo sonreír y cuándo callar.", onAcquire: {}, passive: { nobility: 2 }, evolvesTo: ["blood_chancellor", "pact_of_houses"] },
  { id: "blood_chancellor", name: "Canciller de Sangre", tier: 3, family: "nobility", parentId: "courtier", description: "La ley se escribe en tinta noble.", onAcquire: {}, passive: { nobility: 3, people: -1 }, evolvesTo: [] },
  { id: "pact_of_houses", name: "Pacto de Casas", tier: 3, family: "nobility", parentId: "courtier", description: "Las grandes familias atan sus destinos al trono.", onAcquire: { nobility: 90 }, passive: { gold: -1 }, evolvesTo: [] },
  { id: "feudal_lord", name: "Señor Feudal", tier: 2, family: "nobility", parentId: "highborn", description: "La tierra habla por boca de sus señores.", onAcquire: { nobility: 45 }, passive: { people: -1 }, evolvesTo: ["league_of_nobles", "aristocratic_throne"] },
  { id: "league_of_nobles", name: "Liga de Nobles", tier: 3, family: "nobility", parentId: "feudal_lord", description: "Un pacto aristocrático sostiene y limita tu poder.", onAcquire: { nobility: 75 }, passive: { people: -1 }, evolvesTo: [] },
  { id: "aristocratic_throne", name: "Trono Aristocrático", tier: 3, family: "nobility", parentId: "feudal_lord", description: "La corona y la nobleza se confunden en una sola voz.", onAcquire: {}, passive: { nobility: 4, people: -2 }, evolvesTo: [] },
  { id: "devout", name: "Devoto", tier: 1, family: "faith", description: "Tu corona se inclina ante lo sagrado.", onAcquire: { faith: 30 }, passive: {}, evolvesTo: ["royal_pilgrim", "anointed", "pious_tithe"] },
  { id: "royal_pilgrim", name: "Peregrino Real", tier: 2, family: "faith", parentId: "devout", description: "Tu piedad camina por caminos polvorientos.", onAcquire: { faith: 30 }, passive: {}, evolvesTo: ["holy_protector", "monastery_network"] },
  { id: "holy_protector", name: "Santo Protector", tier: 3, family: "faith", parentId: "royal_pilgrim", description: "El pueblo ve amparo divino en tus actos.", onAcquire: { faith: 45 }, passive: {}, evolvesTo: [] },
  { id: "monastery_network", name: "Red de Monasterios", tier: 3, family: "faith", parentId: "royal_pilgrim", description: "Claustros y caminos llevan ayuda y doctrina.", onAcquire: {}, passive: { faith: 3, gold: -1 }, evolvesTo: [] },
  { id: "anointed", name: "Ungido", tier: 2, family: "faith", parentId: "devout", description: "La legitimidad baja del altar al trono.", onAcquire: {}, passive: { faith: 2 }, evolvesTo: ["altar_voice", "chosen_by_god"] },
  { id: "altar_voice", name: "Voz del Altar", tier: 3, family: "faith", parentId: "anointed", description: "Los sermones pronuncian tu causa.", onAcquire: {}, passive: { faith: 3, nobility: -1 }, evolvesTo: [] },
  { id: "chosen_by_god", name: "Elegido de Dios", tier: 3, family: "faith", parentId: "anointed", description: "Dudar del rey empieza a parecer sacrilegio.", onAcquire: { faith: 90 }, passive: { nobility: -1 }, evolvesTo: [] },
  { id: "pious_tithe", name: "Diezmo Piadoso", tier: 2, family: "faith", parentId: "devout", description: "La fe se alimenta de monedas y paciencia.", onAcquire: { faith: 45 }, passive: { people: -1 }, evolvesTo: ["sacred_realm", "theocratic_throne"] },
  { id: "sacred_realm", name: "Reino Sacro", tier: 3, family: "faith", parentId: "pious_tithe", description: "La frontera entre ley y liturgia se estrecha.", onAcquire: { faith: 75 }, passive: { people: -1 }, evolvesTo: [] },
  { id: "theocratic_throne", name: "Trono Teocrático", tier: 3, family: "faith", parentId: "pious_tithe", description: "Gobernar se vuelve un acto de doctrina.", onAcquire: {}, passive: { faith: 4, nobility: -2 }, evolvesTo: [] },
  { id: "vigilant", name: "Vigilante", tier: 1, family: "threat", description: "Tus ojos buscan grietas antes de que sean heridas.", onAcquire: { threat: -30 }, passive: {}, evolvesTo: ["wall_eyes", "relentless", "iron_law"] },
  { id: "wall_eyes", name: "Ojos en la Muralla", tier: 2, family: "threat", parentId: "vigilant", description: "Nada cruza las almenas sin dejar rastro.", onAcquire: { threat: -30 }, passive: {}, evolvesTo: ["watchtower_network", "road_guard"] },
  { id: "watchtower_network", name: "Red de Atalayas", tier: 3, family: "threat", parentId: "wall_eyes", description: "Las hogueras avisan antes que el peligro llegue.", onAcquire: { threat: -45 }, passive: {}, evolvesTo: [] },
  { id: "road_guard", name: "Guardia de Caminos", tier: 3, family: "threat", parentId: "wall_eyes", description: "La seguridad viaja con cada caravana.", onAcquire: {}, passive: { threat: -3, gold: -1 }, evolvesTo: [] },
  { id: "relentless", name: "Implacable", tier: 2, family: "threat", parentId: "vigilant", description: "El desorden no recibe segundas oportunidades.", onAcquire: {}, passive: { threat: -2 }, evolvesTo: ["hard_hand", "peacemaker"] },
  { id: "hard_hand", name: "Mano Dura", tier: 3, family: "threat", parentId: "relentless", description: "La calma llega con botas pesadas.", onAcquire: {}, passive: { threat: -3, people: -1 }, evolvesTo: [] },
  { id: "peacemaker", name: "El Pacificador", tier: 3, family: "threat", parentId: "relentless", description: "La amenaza retrocede ante una voluntad férrea.", onAcquire: { threat: -90 }, passive: { army: -1 }, evolvesTo: [] },
  { id: "iron_law", name: "Ley de Hierro", tier: 2, family: "threat", parentId: "vigilant", description: "La norma pesa más que cualquier excusa.", onAcquire: { threat: -45 }, passive: { people: -1 }, evolvesTo: ["ordered_realm", "armed_peace"] },
  { id: "ordered_realm", name: "Reino Ordenado", tier: 3, family: "threat", parentId: "iron_law", description: "La paz pública se administra con disciplina.", onAcquire: { threat: -75 }, passive: { people: -1 }, evolvesTo: [] },
  { id: "armed_peace", name: "Paz Armada", tier: 3, family: "threat", parentId: "iron_law", description: "El silencio del reino descansa sobre lanzas visibles.", onAcquire: {}, passive: { threat: -4, army: -2 }, evolvesTo: [] }
].map((trait) => ({ tierName: TIER_NAMES[trait.tier], onAcquire: {}, passive: {}, evolvesTo: [], ...trait }));

const legacyTraitMap = {
  generous: "popular",
  military: "veteran",
  devout: "devout",
  ambitious: "highborn",
  prudent: "royal_granary",
  mercantile: "administrator"
};

const rulerTraitsById = Object.fromEntries(rulerTraits.map((trait) => [trait.id, trait]));
const tierOneTraits = rulerTraits.filter((trait) => trait.tier === 1);
validateTraitTree();

const seasonalNews = [
  { id: "drought", name: "Sequía", description: "La comida se agota más rápido.", duration: 4, families: ["seneschal", "shortage", "people"], daily: { food: -2 } },
  { id: "war_rumors", name: "Rumores de guerra", description: "La frontera pesa más en el consejo.", duration: 4, families: ["diplomat", "army"], daily: { threat: 2 } },
  { id: "royal_fair", name: "Feria real", description: "El comercio domina la corte.", duration: 4, families: ["merchants", "people"], daily: { gold: 2 } },
  { id: "banditry", name: "Bandolerismo", description: "El crimen gana presencia.", duration: 4, families: ["spy", "public_order"], daily: { threat: 1, gold: -1 } },
  { id: "schism", name: "Cisma religioso", description: "La iglesia exige respuestas.", duration: 4, families: ["clergy", "nobility"], daily: { faith: -1 } },
  { id: "court_intrigue", name: "Intriga cortesana", description: "Las casas nobles mueven sus piezas.", duration: 4, families: ["nobility", "steward"], daily: { nobility: -1 } }
].map((item) => ({ title: item.name, text: item.description, type: "seasonal", source: "seasonal", stacking: "replace", ...item }));
const crises = seasonalNews;

const edicts = [
  { id: "granaries", name: "Graneros reales", description: "Protege comida; a veces cuesta oro.", daily: { food: 1 }, every: 3, cost: { gold: -2 } },
  { id: "road_patrols", name: "Patrullas de caminos", description: "Reduce amenaza; desgasta al ejército.", daily: { threat: -1 }, every: 3, cost: { army: -1 } },
  { id: "market_tax", name: "Impuesto de mercado", description: "Mejora ingresos; deja malestar comercial.", daily: { gold: 1 }, tags: ["market_tax_edict"] },
  { id: "minor_pardon", name: "Indulto menor", description: "Calma el crimen; molesta a la nobleza.", daily: { threat: -1 }, every: 2, cost: { nobility: -1 } },
  { id: "strong_tithe", name: "Diezmo reforzado", description: "Sube la fe; baja el favor popular.", daily: { faith: 1 }, every: 2, cost: { people: -1 } },
  { id: "local_levy", name: "Leva local", description: "Refuerza ejército; cansa al pueblo.", daily: { army: 1 }, every: 2, cost: { people: -1 } }
];

const edictDuration = 5;
const crisisPressureRules = {
  border: [{ minStage: 0, minTension: 50, pressure: { title: "Alarma fronteriza", daily: { threat: 1 } } }, { minStage: 1, minTension: 70, pressure: { title: "Incursiones fronterizas", daily: { threat: 2, food: -1 } } }],
  noble_claim: [{ minStage: 1, minTension: 60, pressure: { title: "Corte dividida", daily: { nobility: -1 } } }],
  corruption: [{ minStage: 0, minTension: 60, pressure: { title: "Corrupción extendida", daily: { gold: -1, threat: 1 } } }],
  shortage: [{ minStage: 0, minTension: 60, pressure: { title: "Escasez persistente", daily: { food: -1, people: -1 } } }],
  tithe: [{ minStage: 0, minTension: 60, pressure: { title: "Diezmos disputados", daily: { faith: -1 } } }],
  feud: [{ minStage: 1, minTension: 60, pressure: { title: "Rencillas armadas", daily: { threat: 1, nobility: -1 } } }]
};

const startingResources = { gold: 55, food: 55, army: 45, people: 55, nobility: 50, faith: 50, crown: 50, threat: 20 };
const eventManager = new EventManager(events, { actors, families });
let state;
let currentScreen = "menu";
let setupOptions = { traits: [], ambitions: [], religions: [], selectedTrait: null, selectedAmbition: null, selectedReligion: null };

function newGame(selection = {}) {
  const trait = selection.trait || pickRandom(tierOneTraits);
  const ambition = selection.ambition || pickRandom(ambitions);
  const religion = selection.religion || pickRandom(kingdomReligions);
  const resources = { ...startingResources };
  applyResourceDelta(resources, trait.onAcquire);
  applyResourceDelta(resources, religion.bonus);
  state = eventManager.normalizeState({
    day: 1,
    resources,
    todaysEvents: [],
    resolved: [],
    gameOver: false,
    outcome: null,
    lastResult: null,
    ambition,
    religion,
    rulerTrait: trait,
    traitPath: [trait.id],
    acquiredTraits: [trait.id],
    traitEvolutionChoices: [],
    traitEvolutionPending: false,
    traitEvolutionTier: null,
    lastTraitPassiveDay: null,
    activeCrisis: null,
    activeEdicts: [],
    news: [],
    edictChoices: [],
    completedObjectives: { issuesResolved: 0 },
    ...eventManager.createInitialMemory()
  });
  state.todaysEvents = drawEventsForToday();
  save();
  setScreen("game");
}

function drawEventsForToday() {
  const dueEvents = eventManager.dueEventsForDay(state, state.day);
  const remaining = Math.max(0, EVENTS_PER_DAY - dueEvents.length);
  const dailyEvents = eventManager.getAvailableEvents(state, remaining, dueEvents.map((item) => item.id));
  return [...dueEvents, ...dailyEvents].slice(0, EVENTS_PER_DAY);
}

function clamp(value) { return Math.max(0, Math.min(100, value)); }
function pickRandom(items) { return items[Math.floor(Math.random() * items.length)]; }
function pickMany(items, amount) { return [...items].sort(() => Math.random() - 0.5).slice(0, amount); }
function applyResourceDelta(resources, effects = {}) { Object.entries(effects).forEach(([key, value]) => { if (resources[key] !== undefined) resources[key] = clamp(resources[key] + value); }); }

function applyChoice(eventIndex, optionIndex) {
  if (state.gameOver || state.traitEvolutionPending || state.resolved.includes(eventIndex)) return;
  const currentEvent = state.todaysEvents[eventIndex];
  const choice = currentEvent.options[optionIndex];
  eventManager.applyChoice(state, currentEvent, choice);
  state.resolved.push(eventIndex);
  checkOutcome();
  save();
  render();
}

function endDay() {
  if (state.resolved.length < EVENTS_PER_DAY || state.gameOver) return;
  applyDailyRoguelikeSystems();
  if (state.gameOver) { save(); setScreen("ending"); return; }
  state.day += 1;
  if (state.day > MAX_DAYS) {
    state.gameOver = true;
    state.outcome = "win";
    state.epilogue = buildEpilogue();
  } else {
    prepareTraitEvolution();
    prepareSeasonalCrisis();
    prepareEdictOffer();
    state.lastResult = null;
    eventManager.tickIssues(state);
    state.todaysEvents = drawEventsForToday();
    state.resolved = [];
  }
  save();
  if (state.gameOver) setScreen("ending");
  else render();
}

function checkOutcome() {
  const vital = ["gold", "food", "army", "people", "nobility", "faith", "crown"];
  if (vital.some((key) => state.resources[key] <= 0) || state.resources.threat >= 100) {
    state.gameOver = true;
    state.outcome = "lose";
  }
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function load() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!saved) { state = null; return setScreen("menu"); }
  try {
    state = normalizeRoguelikeState(eventManager.normalizeState(JSON.parse(saved)));
    state.todaysEvents = Array.isArray(state.todaysEvents) && state.todaysEvents.length ? state.todaysEvents : drawEventsForToday();
  } catch {
    state = null;
    return setScreen("menu");
  }
  save();
  setScreen(state.gameOver ? "ending" : "menu");
}

function render() {
  document.querySelectorAll("#gameVersion, #gameVersionGame").forEach((node) => { node.textContent = GAME_VERSION; });
  renderMenu();
  renderSetup();
  if (currentScreen === "setup") initTooltips();
  if (state?.gameOver && currentScreen !== "ending") currentScreen = "ending";
  syncScreens();
  if (currentScreen === "ending") return renderEnding();
  if (currentScreen !== "game" || !state) return;
  document.getElementById("dayNumber").textContent = Math.min(state.day, MAX_DAYS);
  document.getElementById("dayProgress").style.width = `${(Math.min(state.day, MAX_DAYS) / MAX_DAYS) * 100}%`;
  renderResources();
  renderReign();
  renderNews();
  renderTraitEvolution();
  renderEvents();
  renderMemory();
  renderIssues();
  renderEdictOffer();
  renderMessage();
  initTooltips();
  document.getElementById("endDayButton").disabled = state.gameOver || state.traitEvolutionPending || state.resolved.length < EVENTS_PER_DAY;
}

function normalizeRoguelikeState(saved) {
  saved.resources = { ...startingResources, ...(saved.resources || {}) };
  saved.ambition = ambitions.find((item) => item.id === saved.ambition?.id) || saved.ambition || pickRandom(ambitions);
  saved.religion = normalizeReligionState(saved.religion);
  migrateTraitState(saved);
  saved.news = Array.isArray(saved.news) ? saved.news : [];
  saved.activeCrisis = saved.activeCrisis?.id ? { ...seasonalNews.find((item) => item.id === saved.activeCrisis.id), ...saved.activeCrisis } : null;
  if (saved.activeCrisis?.remainingDays > 0) eventManager.addNews(saved, [normalizeSeasonalNews(saved.activeCrisis, saved.activeCrisis.remainingDays)], "seasonal", saved.activeCrisis.id);
  saved.activeCrisis = null;
  saved.activeEdicts = Array.isArray(saved.activeEdicts) ? saved.activeEdicts.map((edict) => ({ ...edicts.find((item) => item.id === edict.id), ...edict })).filter((edict) => edict.id) : [];
  saved.activeEdicts.forEach((edict) => eventManager.addNews(saved, [normalizeEdictNews(edict)], "edict", edict.id));
  saved.activeEdicts = [];
  saved.edictChoices = Array.isArray(saved.edictChoices) ? saved.edictChoices : [];
  saved.completedObjectives = { issuesResolved: 0, ...(saved.completedObjectives || {}) };
  return saved;
}

function normalizeReligionState(religion) {
  if (!religion) return null;
  const id = religion.id || religion;
  const base = kingdomReligionsById[id];
  return base ? { ...base, ...(typeof religion === "object" ? religion : {}) } : null;
}

function migrateTraitState(saved) {
  const legacyId = saved.rulerTrait?.id || saved.rulerTrait;
  const mappedId = rulerTraitsById[legacyId]?.id || legacyTraitMap[legacyId] || "administrator";
  const existingPath = Array.isArray(saved.traitPath) ? saved.traitPath.filter((id) => rulerTraitsById[id]) : [];
  saved.traitPath = existingPath.length ? existingPath : [mappedId];
  saved.acquiredTraits = Array.isArray(saved.acquiredTraits) ? saved.acquiredTraits.filter((id) => rulerTraitsById[id]) : [...saved.traitPath];
  saved.traitEvolutionChoices = Array.isArray(saved.traitEvolutionChoices) ? saved.traitEvolutionChoices.filter((id) => rulerTraitsById[id]) : [];
  saved.traitEvolutionPending = Boolean(saved.traitEvolutionPending && saved.traitEvolutionChoices.length);
  saved.traitEvolutionTier = saved.traitEvolutionPending ? (saved.traitEvolutionTier || rulerTraitsById[saved.traitEvolutionChoices[0]]?.tier || null) : null;
  saved.lastTraitPassiveDay = Number.isInteger(saved.lastTraitPassiveDay) ? saved.lastTraitPassiveDay : null;
  saved.rulerTrait = rulerTraitsById[saved.traitPath[0]] || rulerTraitsById.administrator;
}

function validateTraitTree() {
  const ids = new Set();
  rulerTraits.forEach((trait) => {
    if (ids.has(trait.id)) throw new Error(`Rasgo duplicado: ${trait.id}`);
    ids.add(trait.id);
  });
  rulerTraits.forEach((trait) => {
    if (trait.tier === 1 && trait.parentId) throw new Error(`Tier 1 con parentId: ${trait.id}`);
    if (trait.tier > 1) {
      const parent = rulerTraitsById?.[trait.parentId] || rulerTraits.find((item) => item.id === trait.parentId);
      if (!parent || parent.tier !== trait.tier - 1) throw new Error(`Parent inválido para ${trait.id}`);
    }
    (trait.evolvesTo || []).forEach((childId) => {
      const child = rulerTraits.find((item) => item.id === childId);
      if (!child) throw new Error(`Evolución inexistente: ${trait.id} -> ${childId}`);
      if (child.parentId !== trait.id || child.tier !== trait.tier + 1) throw new Error(`Evolución fuera de árbol: ${trait.id} -> ${childId}`);
    });
  });
}

function renderResources() {
  if (currentScreen !== "game" || !state) return;
  document.getElementById("resources").innerHTML = Object.entries(resourceMeta).map(([key, [name, icon]]) => {
    const value = state.resources[key];
    const classes = ["resource", key === "threat" ? "threat" : "", value <= 18 && key !== "threat" ? "low" : ""].join(" ");
    return `<article class="${classes}"><div class="resource-top"><span class="resource-name">${tooltip(`${icon} ${name}`, tooltipTexts.resources[key])}</span><span class="resource-value">${value}</span></div><div class="meter"><div class="meter-fill" style="width:${value}%"></div></div></article>`;
  }).join("");
}

function renderEvents() {
  if (currentScreen !== "game" || !state) return;
  document.getElementById("events").innerHTML = state.todaysEvents.map((item, eventIndex) => {
    const resolved = state.resolved.includes(eventIndex) || state.gameOver || state.traitEvolutionPending;
    const options = item.options.map((option, optionIndex) => `<button class="option-button" type="button" ${resolved ? "disabled" : ""} data-event="${eventIndex}" data-option="${optionIndex}"><span class="option-title"><span>${option.label}</span>${tooltip("ⓘ", formatChoiceTooltip(option), "icon option-help")}</span><span class="effects chips" aria-label="Consecuencias previstas">${formatChoicePreview(option)}</span></button>`).join("");
    return `<article class="event-card ${resolved ? "resolved" : ""}"><h3 class="event-title">${item.title}</h3><p class="event-text">${item.text}</p><div class="options">${options}</div></article>`;
  }).join("");

  document.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => applyChoice(Number(button.dataset.event), Number(button.dataset.option)));
  });
}

function renderReign() {
  if (currentScreen !== "game" || !state) return;
  const panel = document.getElementById("reign");
  if (!panel) return;
  const chain = formatTraitChain();
  const religion = state.religion ? `<span><strong>${tooltip("Religión", tooltipTexts.reign.religion)}</strong>${tooltip(state.religion.name, formatReligionTooltip(state.religion))}</span>` : `<span><strong>${tooltip("Religión", tooltipTexts.reign.religion)}</strong>${tooltip("Sin credo inicial", "Partida antigua: este reinado se creó antes de elegir religión inicial.")}</span>`;
  panel.innerHTML = `<div class="reign-grid"><span><strong>${tooltip("Rasgo", tooltipTexts.reign.trait)}</strong>${tooltip(chain, formatTraitPathTooltip())}</span><span><strong>${tooltip("Ambición", tooltipTexts.reign.ambition)}</strong>${tooltip(state.ambition.name, state.ambition.description)}</span>${religion}</div>`;
}

function renderTraitEvolution() {
  if (currentScreen !== "game" || !state) return;
  const panel = document.getElementById("traitEvolution");
  if (!panel) return;
  if (!state.traitEvolutionPending || !state.traitEvolutionChoices?.length || state.gameOver) {
    panel.className = "trait-evolution hidden";
    panel.innerHTML = "";
    return;
  }
  panel.className = "trait-evolution";
  panel.innerHTML = `<strong>Evolución del rasgo</strong><p>Elige una mejora ${TIER_NAMES[state.traitEvolutionTier] || ""} para continuar la cadena de tu reinado.</p><div class="trait-evolution-options">${state.traitEvolutionChoices.map((id) => renderEvolutionChoice(rulerTraitsById[id])).join("")}</div>`;
  panel.querySelectorAll("[data-evolve-trait]").forEach((button) => button.addEventListener("click", () => chooseTraitEvolution(button.dataset.evolveTrait)));
}

function renderEvolutionChoice(trait) {
  if (!trait) return "";
  const acquire = formatEffectsText(trait.onAcquire) || "Sin efecto inmediato";
  const passive = formatEffectsText(trait.passive) || "Sin pasivo";
  return `<button class="trait-evolution-button" type="button" data-evolve-trait="${trait.id}"><span class="trait-tier">${trait.tierName}</span><strong>${trait.name}</strong><small>${trait.description}</small><span class="effects">${formatEffectChips(trait.onAcquire).map(chipToHtml).join("") || "Al adquirir: —"}</span><span class="trait-detail">${tooltip("Al adquirir", acquire)} · ${tooltip("Pasivo por turno", passive)}</span></button>`;
}

function chooseTraitEvolution(traitId) {
  const lastTrait = getLastTrait();
  const trait = rulerTraitsById[traitId];
  if (!state.traitEvolutionPending || !trait || !(lastTrait?.evolvesTo || []).includes(trait.id)) return;
  applyResourceDelta(state.resources, trait.onAcquire);
  state.traitPath.push(trait.id);
  state.acquiredTraits = [...state.traitPath];
  state.traitEvolutionChoices = [];
  state.traitEvolutionPending = false;
  state.traitEvolutionTier = null;
  state.lastResult = { resultText: `Tu rasgo evoluciona: ${formatTraitChain()}.` };
  checkOutcome();
  save();
  render();
}

function prepareTraitEvolution() {
  if (![10, 20].includes(state.day) || state.traitEvolutionPending) return;
  const lastTrait = getLastTrait();
  const targetTier = state.day === 10 ? 2 : 3;
  const choices = (lastTrait?.evolvesTo || []).filter((id) => rulerTraitsById[id]?.tier === targetTier);
  if (!choices.length) return;
  state.traitEvolutionChoices = choices;
  state.traitEvolutionPending = true;
  state.traitEvolutionTier = targetTier;
}

function getLastTrait() {
  return rulerTraitsById[state.traitPath?.[state.traitPath.length - 1]];
}

function renderEdictOffer() {
  if (currentScreen !== "game" || !state) return;
  const panel = document.getElementById("edictOffer");
  if (!panel) return;
  if (!state.edictChoices?.length || state.gameOver) { panel.className = "edict-offer hidden"; panel.innerHTML = ""; return; }
  panel.className = "edict-offer";
  panel.innerHTML = `<strong>Nuevo edicto real</strong><p>Elige una política pasiva para los próximos días.</p><div class="edict-options">${state.edictChoices.map((edict, index) => `<button class="edict-button" data-edict="${index}"><span>${edict.name}</span><small>${edict.description}</small></button>`).join("")}</div>`;
  document.querySelectorAll(".edict-button").forEach((button) => button.addEventListener("click", () => chooseEdict(Number(button.dataset.edict))));
}

function chooseEdict(index) {
  const edict = state.edictChoices[index];
  if (!edict) return;
  addNews(normalizeEdictNews({ ...edict, chosenDay: state.day }));
  state.activeEdicts = [];
  if (edict.tags?.length) eventManager.addTags(state, edict.tags);
  state.edictChoices = [];
  save();
  render();
}

function prepareSeasonalCrisis() {
  if (state.day === 1 || (state.day - 1) % 7 !== 0) return;
  const news = pickRandom(seasonalNews);
  addNews(normalizeSeasonalNews(news));
}

function prepareEdictOffer() {
  if (state.day > 1 && (state.day - 1) % 5 === 0) state.edictChoices = pickMany(edicts, 3);
}

function applyDailyRoguelikeSystems() {
  applyTraitPassives();
  applyNewsEffects();
  applyCrisisPressures();
  checkOutcome();
}

function applyTraitPassives() {
  if (state.lastTraitPassiveDay === state.day) return;
  (state.traitPath || []).forEach((traitId) => {
    const trait = rulerTraitsById[traitId];
    if (trait?.passive) applyResourceDelta(state.resources, trait.passive);
  });
  state.lastTraitPassiveDay = state.day;
}

function normalizeSeasonalNews(item, remainingDays = null) {
  return { id: item.id, title: item.title || item.name, text: item.text || item.description, type: "seasonal", source: "seasonal", duration: item.duration || remainingDays || 4, remainingDays: remainingDays ?? item.remainingDays ?? item.duration ?? 4, daily: item.daily || {}, families: item.families || [], stacking: "replace" };
}

function normalizeEdictNews(edict) {
  return { id: edict.id, title: edict.title || edict.name, text: edict.text || edict.description, type: "edict", source: "edict", sourceId: edict.id, duration: edict.duration || edictDuration, remainingDays: edict.remainingDays || edict.duration || edictDuration, daily: edict.daily || {}, every: edict.every || null, cost: edict.cost || null, families: edict.families || edict.tags || [], stacking: "replace" };
}

function addNews(newsItem) {
  eventManager.addNews(state, [newsItem], newsItem.source || "event", newsItem.sourceId || null);
}

function applyNewsEffects() {
  state.news = Array.isArray(state.news) ? state.news : [];
  state.news.forEach((item) => {
    applyResourceDelta(state.resources, item.daily);
    if (item.every && item.cost) {
      const elapsed = Math.max(0, (item.duration || item.remainingDays || 1) - (item.remainingDays || 0));
      if ((elapsed + 1) % item.every === 0) applyResourceDelta(state.resources, item.cost);
    }
    item.remainingDays -= 1;
  });
  state.news = state.news.filter((item) => item.remainingDays > 0);
}

function getCrisisPressure(issue) {
  const rules = crisisPressureRules[issue.type] || [];
  return rules.filter((rule) => (issue.stage || 0) >= rule.minStage && (issue.tension || 0) >= rule.minTension).pop()?.pressure || null;
}

function applyCrisisPressures() {
  (state.issues || []).forEach((issue) => {
    const pressure = getCrisisPressure(issue);
    if (pressure?.daily) applyResourceDelta(state.resources, pressure.daily);
  });
}

function renderNews() {
  if (currentScreen !== "game" || !state) return;
  const panel = document.getElementById("news");
  if (!panel) return;
  const news = state.news || [];
  const summary = news.length ? news.slice(0, 4).map((item) => `${item.title} · ${item.remainingDays} día${item.remainingDays === 1 ? "" : "s"}`).join(" · ") : "No hay noticias activas. Por ahora.";
  panel.innerHTML = `<details class="compact-details"><summary><span>Noticias del Reino</span><strong>${summary}</strong></summary>${news.length ? news.slice(0, 4).map((item) => `<article class="news-row"><strong>${tooltip(item.title, formatNewsTooltip(item))}</strong><span>${item.remainingDays} día${item.remainingDays === 1 ? "" : "s"}</span></article>`).join("") : `<p>No hay noticias activas. Por ahora.</p>`}</details>`;
}

function formatNewsTooltip(item) {
  return `${item.title}\n\n${item.text}\n\nEfecto:\n${formatQualitativeEffects(item.daily)}\n\nDuración:\nQuedan ${item.remainingDays} día${item.remainingDays === 1 ? "" : "s"}.\n\nOrigen:\n${formatNewsSource(item.source)}.`;
}

function formatQualitativeEffects(effects = {}) {
  const parts = Object.entries(effects).filter(([key, value]) => resourceMeta[key] && value !== 0).map(([key, value]) => `${resourceMeta[key][0]} ${resourceTone(key, value) === "positive" ? "mejora" : "empeora"} al final de cada día`);
  return parts.length ? parts.join("; ") + "." : "No altera recursos directamente.";
}

function formatNewsSource(source) {
  return ({ edict: "Edicto real", event: "Acontecimiento del reino", consequence: "Consecuencia", seasonal: "Temporada", crisis: "Crisis abierta" })[source] || "Acontecimiento del reino";
}

function renderIssues() {
  if (currentScreen !== "game" || !state) return;
  const panel = document.getElementById("issues");
  if (!panel) return;
  const issues = state.issues || [];
  const summary = issues.length
    ? `${issues.length} crisis abierta${issues.length === 1 ? "" : "s"}: ${issues.slice(0, 2).map((issue) => formatIssueType(issue.type)).join(" · ")}${issues.length > 2 ? "…" : ""}`
    : "No hay crisis abiertas. Por ahora.";
  panel.innerHTML = `
    <details class="compact-details">
      <summary><span>Crisis abiertas</span><strong>${summary}</strong></summary>
      ${issues.length ? issues.map((issue) => {
        const issueTags = (issue.tags || []).map(formatIssueTagForPlayer).join(" · ");
        const debugLine = DEBUG_UI ? `<small>ID: ${issue.id} · Actor: ${issue.actorId} · Etapa ${issue.stage}</small>` : "";
        return `
          <article class="issue-row">
            <strong>${tooltip(formatActorForPlayer(issue.actorId), formatIssueTooltip(issue))}</strong>
            <span>${formatIssueType(issue.type)} · ${tooltip(formatIssueStage(issue), tooltipTexts.issues.stage)} · ${tooltip(formatDaysOpen(issue.daysActive), tooltipTexts.issues.daysOpen)}</span>
            <span>${tooltip(`Tensión ${formatTensionForPlayer(issue.tension)}`, tooltipTexts.issues.tension)} · ${tooltip(`Confianza ${formatTrustForPlayer(issue.trust)}`, tooltipTexts.issues.trust)}</span>
            <small>${issueTags ? `Motivo: ${issueTags}` : "Motivo: asunto aún difuso"}</small>
            ${debugLine}
          </article>
        `;
      }).join("") : ""}
    </details>
  `;
}

function formatIssueTooltip(issue) {
  const pressure = getCrisisPressure(issue);
  return `Crisis de ${formatActorForPlayer(issue.actorId)}\n\nActor:\n${formatActorForPlayer(issue.actorId)}\n\nSituación:\n${formatIssueType(issue.type)}${(issue.tags || []).length ? ` (${(issue.tags || []).map(formatIssueTagForPlayer).join(", ")})` : ""}.\n\nIntensidad:\n${capitalize(formatTensionForPlayer(issue.tension))}. La crisis puede escalar si la tensión aumenta.\n\nConfianza:\n${capitalize(formatTrustForPlayer(issue.trust))}.\n\nPresión actual:\n${pressure ? `${pressure.title}: ${formatQualitativeEffects(pressure.daily)}` : "Sin presión diaria por ahora."}\n\nRecompensa si se resuelve:\n${issue.reward?.text || "La corona ganará estabilidad política."}\n\nSi se abandona:\n${issue.unresolvedProblem?.text || "La tensión acumulada puede traer complicaciones futuras."}\n\nSi pierde toda confianza:\n${issue.trustProblem?.text || "El actor podría dejar de cooperar con el trono."}`;
}

function formatIssueType(type) {
  const issueTypes = {
    border: "Crisis fronteriza",
    noble_claim: "Reclamación noble",
    generic: "Asunto del reino",
    shortage: "Escasez del reino",
    corruption: "Corrupción investigada",
    public_works: "Obra pública disputada",
    feud: "Rencilla noble",
    tithe: "Disputa de diezmos"
  };
  return issueTypes[type] || humanizeIdentifier(type);
}

function renderMemory() {
  if (currentScreen !== "game" || !state) return;
  const memory = document.getElementById("memory");
  if (!memory) return;
  const recent = state.history.slice(-2).reverse();
  const tags = state.tags.slice(-4);
  const hiddenRumors = Math.max(0, state.tags.length - tags.length);
  const rumorText = tags.length ? `Rumores recientes: ${tags.map(formatTagForPlayer).join(" · ")}${hiddenRumors ? ` · + ${hiddenRumors} rumores más` : ""}` : "El reino aún no ha decidido quién eres.";
  const debugLine = DEBUG_UI && state.tags.length ? `<p>Tags: ${state.tags.join(", ")}</p>` : "";
  const summary = `${state.pendingEvents.length} consecuencia${state.pendingEvents.length === 1 ? "" : "s"} pendiente${state.pendingEvents.length === 1 ? "" : "s"} · ${recent.length} recuerdo${recent.length === 1 ? "" : "s"} reciente${recent.length === 1 ? "" : "s"}`;
  memory.innerHTML = `
    <details class="compact-details">
      <summary><span>Memoria del reino</span><strong>${summary}</strong></summary>
      <p>${rumorText}.</p>
      ${debugLine}
      ${recent.length ? `<ul>${recent.map((item) => `<li>Día ${item.day}: ${item.choice} (${item.eventTitle})${item.resultText ? ` — ${item.resultText}` : ""}</li>`).join("")}</ul>` : ""}
    </details>
  `;
}

function formatTagForPlayer(tag) {
  const tags = {
    hidden_escape: "fuga encubierta",
    old_treaty_rejected: "tratado antiguo rechazado",
    dye_tax: "impuesto del tinte",
    baron_lands_taken: "tierras arrebatadas a un barón",
    delayed_fever_response: "fiebre mal atendida",
    mocked_monastery_need: "burla hacia el monasterio",
    favored_nobles: "favor hacia la nobleza",
    closed_border: "frontera cerrada",
    bridge_toll: "peaje del puente",
    market_watch_created: "vigilancia del mercado",
    private_guard_allowed: "guardia privada tolerada",
    border_oath: "juramento fronterizo",
    border_hero: "gesta en la frontera",
    border_autonomy: "autonomía fronteriza",
    abandoned_border: "frontera abandonada"
  };
  return tags[tag] || humanizeIdentifier(tag);
}

function formatActorForPlayer(actorId) {
  const actor = [...(actors || [])].find((item) => item.id === actorId);
  const actorsById = {
    house_varela: "Casa Varela",
    marca_oriental: "Marca Oriental",
    tax_collectors: "Recaudadores reales",
    carters: "Carreteros del reino",
    gremio_mercaderes: "Gremio de mercaderes",
    realm: "El reino"
  };
  return actor?.name || actorsById[actorId] || humanizeIdentifier(actorId);
}

function formatIssueTagForPlayer(tag) {
  const issueTags = {
    insulted: "agravio pendiente",
    land_claim: "tierras reclamadas",
    delayed_claim: "sentencia aplazada",
    refugees: "refugiados desamparados",
    suspected_spies: "sospecha de espías",
    flour: "escasez de harina",
    taxes: "cuentas de impuestos turbias",
    bridge: "puente en disputa",
    market: "fraude de mercado",
    private_guard: "guardia privada",
    accounts: "libros bajo sospecha",
    jail: "corrupción carcelaria"
  };
  return issueTags[tag] || formatTagForPlayer(tag);
}

function formatIssueStage(issue) {
  if ((issue.stage || 0) <= 0) return "tensión inicial";
  if (issue.stage === 1) return "conflicto escalado";
  return "crisis abierta";
}

function formatTensionForPlayer(value) {
  if (value <= 24) return "baja";
  if (value <= 49) return "contenida";
  if (value <= 74) return "alta";
  return "crítica";
}

function formatTrustForPlayer(value) {
  if (value <= 24) return "muy baja";
  if (value <= 49) return "baja";
  if (value <= 74) return "estable";
  return "alta";
}

function formatDaysOpen(days) {
  return `${days} día${days === 1 ? "" : "s"} abierto${days === 1 ? "" : "s"}`;
}

function humanizeIdentifier(value) {
  return String(value || "asunto desconocido").replaceAll("_", " ").replaceAll("-", " ");
}

function renderMessage() {
  if (currentScreen !== "game" || !state) return;
  const box = document.getElementById("message");
  if (!state.gameOver) {
    if (state.lastResult?.resultText) {
      box.className = "message result";
      box.textContent = state.lastResult.resultText;
      return;
    }
    box.className = "message hidden";
    box.textContent = "";
    return;
  }
  box.className = `message ${state.outcome}`;
  const epilogue = state.epilogue || buildEpilogue();
  box.innerHTML = `<strong>${state.outcome === "win" ? "Victoria" : "Derrota"}: ${epilogue.title}.</strong> ${epilogue.text}`;
}

function buildEpilogue() {
  const ambitionWon = isAmbitionComplete();
  const r = state.resources;
  let title = ambitionWon ? "El Pacificador" : "El Último de su Casa";
  if (state.ambition.id === "merchant" && ambitionWon) title = "El Rey de los Mercaderes";
  else if (state.ambition.id === "pious" && ambitionWon) title = "El Santo de los Pobres";
  else if ((state.tags || []).some((tag) => /cruel|execut|hang|burn|blood|sang/.test(tag))) title = "El Sangriento";
  else if (r.gold <= 15) title = "El Rey Endeudado";
  else if (r.threat <= 25 && (state.completedObjectives?.issuesResolved || 0) >= 2) title = "El Justo";
  else if (r.army >= 70 && r.people < 40) title = "El Tirano Necesario";
  const text = `${ambitionWon ? "La ambición de " + state.ambition.name + " se cumplió" : "La ambición de " + state.ambition.name + " quedó incompleta"}. Recursos finales: oro ${r.gold}, comida ${r.food}, ejército ${r.army}, pueblo ${r.people}, nobleza ${r.nobility}, fe ${r.faith}, corona ${r.crown}, amenaza ${r.threat}. Crisis resueltas: ${state.completedObjectives?.issuesResolved || 0}; activos: ${(state.issues || []).length}.`;
  return { title, text, ambitionWon };
}

function isAmbitionComplete() {
  const r = state.resources;
  const histories = state.history || [];
  const tags = state.tags || [];
  const familyCount = (family) => histories.filter((entry) => entry.family === family).length;
  if (state.ambition.id === "merchant") return r.gold >= 70 && familyCount("merchants") >= 3;
  if (state.ambition.id === "pious") return r.faith >= 70 && !tags.some((tag) => /church|monastery|tithe/.test(tag) && /mocked|rejected|stolen|burned|insult/.test(tag));
  if (state.ambition.id === "people") return r.people >= 70 && tags.filter((tag) => /cruel|abandoned|executed|ignored/.test(tag)).length <= 1;
  if (state.ambition.id === "iron") return r.army >= 70 && r.threat <= 30;
  if (state.ambition.id === "diplomat") return (state.completedObjectives?.issuesResolved || 0) >= 2 && (state.issues || []).filter((issue) => issue.stage >= 2).length <= 1;
  if (state.ambition.id === "noble") return r.nobility >= 70 && !tags.some((tag) => /insult|baron_lands_taken|mocked/.test(tag));
  return false;
}

function formatChoiceTooltip(option) {
  const parts = [];
  if (option.outcomes?.length) parts.push(formatOutcomeProbabilityText(option.outcomes));
  else parts.push("Decisión de efecto previsible.");
  if (option.defer?.length) parts.push(formatDeferredProbabilityText(option.defer));
  if (option.addTags?.length) parts.push("Dejará memoria política.");
  if (option.addNews?.length) parts.push("Creará una noticia temporal del reino.");
  if (option.issues?.length) parts.push("Puede alterar una crisis persistente.");
  if (DEBUG_UI) {
    const directEffects = option.outcomes?.length ? summarizeWeightedOutcomes(option.outcomes) : (option.immediate || option.effects || {});
    const effectText = formatEffectsText(directEffects);
    if (effectText) parts.push(`DEBUG impacto previsto: ${effectText}.`);
  }
  return parts.filter(Boolean).join(" ") || "Decisión sin impacto visible inmediato; la corte observará el gesto.";
}

function summarizeWeightedOutcomes(outcomes = []) {
  const combined = {};
  outcomes.forEach((outcome) => {
    Object.entries(outcome.immediate || outcome.effects || {}).forEach(([key, value]) => {
      if (!resourceMeta[key] || value === 0) return;
      combined[key] = Math.round((combined[key] || 0) + value * (outcome.probability || 1));
    });
  });
  return combined;
}

function formatOutcomeProbabilityText(outcomes = []) {
  if (!outcomes.length) return "";
  const summary = summarizeToneProbabilities(outcomes);
  const branches = outcomes.map((outcome, index) => {
    const chance = Math.round((outcome.probability || 0) * 100);
    const tone = outcomeToneLabel(outcome, true);
    const detail = DEBUG_UI ? ` (${formatEffectsText(outcome.immediate || outcome.effects || {}) || outcome.text || "resultado narrativo"})` : "";
    return `${chance}% ${tone}${detail || (outcomes.length > 2 ? ` ${index + 1}` : "")}`;
  });
  if (summary.success > summary.failure && summary.success >= summary.mixed) {
    return `Éxito probable: ${summary.success}%. Riesgo: ${100 - summary.success}% de resultado menor. Ramas: ${branches.join(" · ")}.`;
  }
  if (summary.failure > summary.success && summary.failure >= summary.mixed) {
    return `Riesgo elevado: ${summary.failure}% problemático. Posible mejora: ${summary.success}%. Ramas: ${branches.join(" · ")}.`;
  }
  const favorable = summary.success;
  const problematic = summary.failure;
  return `Resultado incierto: ${favorable}% favorable / ${problematic}% problemático${summary.mixed ? ` / ${summary.mixed}% mixto` : ""}. Ramas: ${branches.join(" · ")}.`;
}

function formatDeferredProbabilityText(deferred = []) {
  const lines = deferred.flatMap((item) => item.branches?.length ? [summarizeDeferredBranches(item.branches)] : []);
  return lines.length ? `Consecuencia futura: ${lines.join("; ")}.` : "Puede traer una consecuencia futura, sin probabilidad pública.";
}

function summarizeDeferredBranches(branches = []) {
  const summary = summarizeToneProbabilities(branches);
  if (summary.success || summary.failure || summary.mixed) {
    const parts = [];
    if (summary.success) parts.push(`${summary.success}% desenlace favorable`);
    if (summary.failure) parts.push(`${summary.failure}% complicación`);
    if (summary.mixed) parts.push(`${summary.mixed}% desenlace mixto`);
    return parts.join(" / ");
  }
  return branches.map((branch, index) => `${Math.round((branch.probability || 0) * 100)}% rama ${index + 1}`).join(" / ");
}

function summarizeToneProbabilities(branches = []) {
  return branches.reduce((acc, branch) => {
    const tone = outcomeToneLabel(branch);
    const chance = Math.round((branch.probability || 0) * 100);
    if (tone === "success") acc.success += chance;
    else if (tone === "failure") acc.failure += chance;
    else acc.mixed += chance;
    return acc;
  }, { success: 0, mixed: 0, failure: 0 });
}

function outcomeToneLabel(outcome, forPlayer = false) {
  const tone = outcome.tone || inferOutcomeTone(outcome);
  if (!forPlayer) return tone;
  if (tone === "success") return "favorable";
  if (tone === "failure") return "problemático";
  return "mixto";
}

function inferOutcomeTone(outcome = {}) {
  const effects = outcome.immediate || outcome.effects || {};
  let score = 0;
  let hasPositive = false;
  let hasNegative = false;
  Object.entries(effects).forEach(([key, value]) => {
    if (!resourceMeta[key] || value === 0) return;
    const adjusted = key === "threat" ? -value : value;
    if (adjusted > 0) hasPositive = true;
    if (adjusted < 0) hasNegative = true;
    score += adjusted;
  });
  if (hasPositive && hasNegative) return "mixed";
  if (score > 0) return "success";
  if (score < 0) return "failure";
  return "mixed";
}

function formatTraitTooltip(trait) {
  const acquire = formatEffectsText(trait.onAcquire);
  const passive = formatEffectsText(trait.passive);
  return `${trait.tierName || `Tier ${trait.tier}`}: ${trait.description}${acquire ? ` Al adquirir: ${acquire}.` : ""}${passive ? ` Pasivo por turno: ${passive}.` : ""}`;
}

function formatTraitChain() {
  const names = (state.traitPath || []).map((id) => rulerTraitsById[id]?.name).filter(Boolean);
  return names.join(" → ") || "Sin rasgo";
}

function formatTraitPathTooltip() {
  return (state.traitPath || []).map((id) => formatTraitTooltip(rulerTraitsById[id])).join(" ");
}

function formatCrisisTooltip(crisis) {
  const daily = formatEffectsText(crisis.daily);
  return `${crisis.description}${daily ? ` Efecto diario mientras dure: ${daily}.` : ""}`;
}

function formatEdictTooltip(edict) {
  const daily = formatEffectsText(edict.daily);
  const cost = formatEffectsText(edict.cost);
  return `${edict.description}${daily ? ` Efecto recurrente: ${daily}.` : ""}${cost ? ` Coste ocasional: ${cost}.` : ""}`;
}


function formatChoicePreview(option) {
  const chips = [];
  if (option.outcomes?.length) chips.push(...formatOutcomeChips(option.outcomes));
  else chips.push(...formatEffectChips(option.immediate || option.effects || {}));
  chips.push(...formatStoryHookChips(option));

  const uniqueChips = dedupeChips(chips);
  const visible = uniqueChips.slice(0, 4);
  if (uniqueChips.length > 4) visible[3] = { icon: "✦", text: "+ más" };
  if (!visible.length) visible.push({ icon: "🎲", text: "Azar" });
  return visible.map(({ icon, text, tone = "", tooltipText = null }) => tooltip(`${icon} ${text}`, tooltipText || tooltipTextForChip(tone, text), `effect-chip ${tone}`)).join("");
}

function formatEffectChips(effects, context = {}) {
  return Object.entries(effects)
    .filter(([key, value]) => resourceMeta[key] && value !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .map(([key, value]) => formatImpactChip(key, value, context));
}

function formatImpactChip(key, value, context = {}) {
  const [name, icon] = resourceMeta[key];
  return {
    icon,
    text: `${name} ${arrowMagnitude(value)}`,
    tone: resourceTone(key, value),
    tooltipText: formatResourceChipTooltip(key, value, context)
  };
}

function chipToHtml({ icon, text, tone = "", tooltipText = null }) {
  return tooltip(`${icon} ${text}`, tooltipText || tooltipTextForChip(tone, text), `effect-chip ${tone}`);
}

function impactLevel(value) {
  const magnitude = Math.abs(value);
  if (magnitude >= 8) return "enorme";
  if (magnitude >= 4) return "moderado";
  return "minimo";
}

function arrowMagnitude(value) {
  const arrows = Math.abs(value) >= 8 ? 3 : Math.abs(value) >= 4 ? 2 : 1;
  return (value > 0 ? "↑" : "↓").repeat(arrows);
}

function formatResourceChipTooltip(key, value, context = {}) {
  const [name] = resourceMeta[key];
  const article = resourceArticle(key);
  const subject = `${article} ${name.toLowerCase()}`;
  if (context.variable) return `${capitalize(subject)} podría mejorar o empeorar: el resultado es variable entre ramas.`;
  const verb = value > 0 ? "crecerá" : "bajará";
  const adverb = impactAdverb(impactLevel(value));
  const certainty = context.probable ? " como tendencia probable" : "";
  const judgement = key === "threat" ? (value > 0 ? " Es una señal negativa." : " Es una señal positiva.") : "";
  return `${capitalize(subject)} ${verb} ${adverb}${certainty}.${judgement}`;
}

function formatOutcomeChips(outcomes) {
  const combined = {};
  const directions = {};
  outcomes.forEach((outcome) => {
    Object.entries(outcome.immediate || outcome.effects || {}).forEach(([key, value]) => {
      if (!resourceMeta[key] || value === 0) return;
      combined[key] = (combined[key] || 0) + Math.sign(value) * Math.abs(value) * (outcome.probability || 1);
      directions[key] = directions[key] || new Set();
      directions[key].add(Math.sign(value));
    });
  });
  const chips = Object.entries(combined)
    .filter(([key, value]) => resourceMeta[key] && value !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .map(([key, value]) => formatImpactChip(key, value, { probable: true, variable: (directions[key]?.size || 0) > 1 }));
  chips.unshift({ icon: "🎲", text: "Azar", tone: "uncertain" });
  return chips;
}

function resourceTone(key, value) {
  const improves = key === "threat" ? value < 0 : value > 0;
  return improves ? "positive" : "negative";
}

function resourceArticle(key) {
  return ["seneschal", "nobility", "faith", "chancellor", "threat"].includes(key) ? "la" : "el";
}

function impactAdverb(level) {
  if (level === "enorme") return "enormemente";
  if (level === "moderado") return "moderadamente";
  return "mínimamente";
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function dedupeChips(chips) {
  const seen = new Set();
  return chips.filter((chip) => {
    const key = `${chip.icon}-${chip.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatStoryHookChips(option) {
  const hooks = [];
  if (option.addTags?.length) hooks.push({ icon: "🧠", text: "Memoria", tone: "memory" });
  if (option.addNews?.length) hooks.push({ icon: "📰", text: "Noticia", tone: "news" });
  if (option.issues?.length) hooks.push({ icon: "⚖️", text: "Crisis", tone: "conflict" });
  if (option.defer?.length) hooks.push({ icon: "⏳", text: "Consecuencia", tone: "consequence" });
  if (option.outcomes?.length) hooks.push({ icon: "🎲", text: "Azar", tone: "uncertain" });
  return hooks;
}


function tooltip(label, text, className = "") {
  if (!text) return label;
  const classes = ["tooltip-trigger", className].filter(Boolean).join(" ");
  return `<span class="${classes}" tabindex="0" role="button" aria-label="${escapeHtml(`${label}: ${text}`)}" data-tooltip="${escapeHtml(text)}">${label}</span>`;
}

function tooltipTextForChip(tone, text) {
  if (tone === "uncertain" || text === "Incierta") return tooltipTexts.chips.uncertain;
  if (tone === "memory") return tooltipTexts.chips.memory;
  if (tone === "news") return tooltipTexts.chips.news;
  if (tone === "consequence") return tooltipTexts.chips.consequence;
  if (tone === "conflict") return tooltipTexts.chips.conflict;
  if (tone === "positive" || text.includes("↑")) return tooltipTexts.chips.positive;
  if (tone === "negative" || text.includes("↓")) return tooltipTexts.chips.negative;
  return tooltipTexts.chips.uncertain;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function initTooltips() {
  const triggers = document.querySelectorAll(".tooltip-trigger[data-tooltip]");
  if (!triggers.length) { closeTooltip(); return; }
  triggers.forEach((trigger) => {
    if (trigger.dataset.tooltipReady) return;
    trigger.dataset.tooltipReady = "true";
    trigger.addEventListener("mouseenter", () => openTooltip(trigger));
    trigger.addEventListener("focus", () => openTooltip(trigger));
    trigger.addEventListener("mouseleave", () => closeTooltip(trigger));
    trigger.addEventListener("blur", () => closeTooltip(trigger));
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (trigger.classList.contains("tooltip-active")) closeTooltip(trigger);
      else openTooltip(trigger);
    });
  });
}

function openTooltip(trigger) {
  const text = trigger?.dataset?.tooltip;
  if (!text) return;
  let bubble = document.getElementById("tooltipBubble");
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.id = "tooltipBubble";
    bubble.className = "tooltip-bubble";
    bubble.setAttribute("role", "tooltip");
    document.body.appendChild(bubble);
  }
  document.querySelectorAll(".tooltip-active").forEach((node) => node.classList.remove("tooltip-active"));
  trigger.classList.add("tooltip-active");
  trigger.setAttribute("aria-describedby", "tooltipBubble");
  bubble.textContent = text;
  bubble.classList.add("visible");
  positionTooltip(trigger, bubble);
}

function closeTooltip(trigger) {
  const bubble = document.getElementById("tooltipBubble");
  if (trigger) {
    trigger.classList.remove("tooltip-active");
    trigger.removeAttribute("aria-describedby");
  } else {
    document.querySelectorAll(".tooltip-active").forEach((node) => {
      node.classList.remove("tooltip-active");
      node.removeAttribute("aria-describedby");
    });
  }
  if (bubble && (!trigger || !document.querySelector(".tooltip-active"))) bubble.classList.remove("visible");
}

function positionTooltip(trigger, bubble) {
  const rect = trigger.getBoundingClientRect();
  const margin = 12;
  bubble.style.left = "";
  bubble.style.top = "";
  bubble.style.bottom = "";
  if (window.matchMedia("(max-width: 719px)").matches) {
    bubble.style.left = `${margin}px`;
    bubble.style.right = `${margin}px`;
    bubble.style.bottom = `calc(84px + env(safe-area-inset-bottom, 0px))`;
    return;
  }
  bubble.style.right = "auto";
  const bubbleWidth = Math.min(320, window.innerWidth - margin * 2);
  bubble.style.maxWidth = `${bubbleWidth}px`;
  const left = Math.max(margin, Math.min(rect.left + rect.width / 2 - bubbleWidth / 2, window.innerWidth - bubbleWidth - margin));
  const top = rect.top > 110 ? rect.top + window.scrollY - bubble.offsetHeight - margin : rect.bottom + window.scrollY + margin;
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

document.addEventListener("click", (event) => {
  if (!event.target.closest(".tooltip-trigger") && !event.target.closest("#tooltipBubble")) closeTooltip();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeTooltip(); });
window.addEventListener("resize", () => {
  const active = document.querySelector(".tooltip-active");
  const bubble = document.getElementById("tooltipBubble");
  if (active && bubble?.classList.contains("visible")) positionTooltip(active, bubble);
});


function hasValidSave() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!saved) return false;
  try { return !!eventManager.normalizeState(JSON.parse(saved)); } catch { return false; }
}

function setScreen(screen) { currentScreen = screen; render(); }
function syncScreens() { ["menu", "setup", "game", "ending"].forEach((screen) => document.getElementById(`${screen}Screen`).classList.toggle("hidden", currentScreen !== screen)); }
function renderMenu() {
  const hasSave = hasValidSave();
  document.getElementById("continueButton").disabled = !hasSave;
  document.getElementById("deleteSaveButton").classList.toggle("hidden", !hasSave);
}
function openSetup() {
  setupOptions = { traits: pickMany(tierOneTraits, 3), ambitions: pickMany(ambitions, 3), religions: kingdomReligions, selectedTrait: null, selectedAmbition: null, selectedReligion: null };
  setScreen("setup");
}
function renderSetup() {
  const traitBox = document.getElementById("traitChoices");
  const ambitionBox = document.getElementById("ambitionChoices");
  const religionBox = document.getElementById("religionChoices");
  if (!traitBox || !ambitionBox || !religionBox) return;
  traitBox.innerHTML = setupOptions.traits.map((trait) => `<button class="choice-card ${setupOptions.selectedTrait?.id === trait.id ? "selected" : ""}" type="button" data-trait="${trait.id}"><span class="trait-tier">${trait.tierName}</span><strong>${trait.name}</strong><span>${trait.description}</span><span>${tooltip("Al adquirir", formatEffectsText(trait.onAcquire) || "Sin efecto inmediato")}</span></button>`).join("");
  ambitionBox.innerHTML = setupOptions.ambitions.map((ambition) => `<button class="choice-card ${setupOptions.selectedAmbition?.id === ambition.id ? "selected" : ""}" type="button" data-ambition="${ambition.id}"><strong>${ambition.name}</strong><span>${ambition.description}</span></button>`).join("");
  religionBox.innerHTML = setupOptions.religions.map((religion) => `<button class="choice-card ${setupOptions.selectedReligion?.id === religion.id ? "selected" : ""}" type="button" data-religion="${religion.id}"><strong>${religion.name}</strong><span>${religion.description}</span><span>${tooltip("Bono inicial", formatEffectsText(religion.bonus) || "Sin efecto inmediato")}</span></button>`).join("");
  document.getElementById("startRunButton").disabled = !setupOptions.selectedTrait || !setupOptions.selectedAmbition || !setupOptions.selectedReligion;
  traitBox.querySelectorAll("[data-trait]").forEach((button) => button.addEventListener("click", () => { setupOptions.selectedTrait = tierOneTraits.find((item) => item.id === button.dataset.trait); renderSetup(); }));
  ambitionBox.querySelectorAll("[data-ambition]").forEach((button) => button.addEventListener("click", () => { setupOptions.selectedAmbition = ambitions.find((item) => item.id === button.dataset.ambition); renderSetup(); }));
  religionBox.querySelectorAll("[data-religion]").forEach((button) => button.addEventListener("click", () => { setupOptions.selectedReligion = kingdomReligionsById[button.dataset.religion]; renderSetup(); }));
}
function formatReligionTooltip(religion) {
  const bonus = formatEffectsText(religion.bonus) || "Sin bono inicial";
  return `${religion.description} Bono inicial: ${bonus}. Reservas futuras: evolución (${(religion.futureHooks?.evolution || []).join(", ") || "sin definir"}) y ruptura (${(religion.futureHooks?.rupture || []).join(", ") || "sin definir"}).`;
}

function formatEffectsText(effects = {}) { return Object.entries(effects).map(([key, value]) => `${resourceMeta[key]?.[0] || key} ${value > 0 ? "+" : ""}${value}`).join(" · "); }
function startSelectedRun() {
  if (!setupOptions.selectedTrait || !setupOptions.selectedAmbition || !setupOptions.selectedReligion) return;
  if (hasValidSave() && !confirm("Comenzar un nuevo reinado sobrescribirá la partida guardada anterior. ¿Continuar?")) return;
  newGame({ trait: setupOptions.selectedTrait, ambition: setupOptions.selectedAmbition, religion: setupOptions.selectedReligion });
}
function deleteSave() { if (!hasValidSave() || !confirm("¿Borrar la partida guardada?")) return; localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY); state = null; setScreen("menu"); }
function continueRun() { if (!state) loadSavedState(); if (state) setScreen(state.gameOver ? "ending" : "game"); }
function loadSavedState() { const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY); if (!saved) return; state = normalizeRoguelikeState(eventManager.normalizeState(JSON.parse(saved))); state.todaysEvents = Array.isArray(state.todaysEvents) && state.todaysEvents.length ? state.todaysEvents : drawEventsForToday(); }
function getDeathCause() { const r = state.resources; if (r.gold <= 0) return "Bancarrota"; if (r.food <= 0) return "Hambruna"; if (r.army <= 0) return "Ejército roto"; if (r.people <= 0) return "Revuelta popular"; if (r.nobility <= 0) return "Nobleza sublevada"; if (r.faith <= 0) return "Fe colapsada"; if (r.crown <= 0) return "Corona desacreditada"; if (r.threat >= 100) return "Reino consumido por amenaza"; return "Desenlace incierto"; }
function renderEnding() {
  const card = document.getElementById("endingCard");
  if (!state) { card.innerHTML = ""; return; }
  const epilogue = state.epilogue || buildEpilogue();
  const won = state.outcome === "win";
  const history = (state.history || []).slice(-3).reverse();
  const pending = state.pendingEvents || [];
  card.className = `ending-card ${won ? "win" : "lose"}`;
  card.innerHTML = `<p class="eyebrow">${won ? "Victoria" : "Derrota"}</p><h2>${epilogue.title}</h2><p>${won ? "La corte recordará este gobierno como una historia cerrada." : `Tu reinado cayó en el día ${state.day}. La corte recordará este gobierno como una advertencia.`}</p><p>${epilogue.text}</p><div class="run-summary"><strong>Religión:</strong> ${state.religion?.name || "Sin credo inicial"}<br><strong>Ambición:</strong> ${state.ambition.name} — ${epilogue.ambitionWon ? "cumplida" : "La ambición quedó incompleta."}<br><strong>Rasgos:</strong> ${formatTraitChain()}<br><strong>Día alcanzado:</strong> ${Math.min(state.day, MAX_DAYS)}</div>${won ? "" : `<p class="death-cause">Causa de derrota: ${getDeathCause()}</p>`}<div class="run-summary"><strong>Recursos finales:</strong> ${Object.entries(resourceMeta).map(([key,[name]]) => `${name} ${state.resources[key]}`).join(" · ")}<br><strong>Crisis resueltas:</strong> ${state.completedObjectives?.issuesResolved || 0}<br><strong>Crisis abiertas restantes:</strong> ${(state.issues || []).length}</div><h3>Últimas decisiones importantes</h3><ul class="chronicle-list">${history.length ? history.map((item) => `<li>Día ${item.day}: ${item.choice} (${item.eventTitle})</li>`).join("") : "<li>La crónica quedó casi en blanco.</li>"}</ul>${pending.length ? `<p>Aún quedaban consecuencias pendientes.</p><ul class="chronicle-list">${pending.map((item) => `<li>Día ${item.dueDay || "?"}: ${item.eventId || item.id || "consecuencia"}</li>`).join("")}</ul>` : ""}<details><summary>Ver crónica</summary><ul class="chronicle-list">${(state.history || []).map((item) => `<li>Día ${item.day}: ${item.choice} (${item.eventTitle})${item.resultText ? ` — ${item.resultText}` : ""}</li>`).join("") || "<li>Sin decisiones registradas.</li>"}</ul></details><div class="setup-actions"><button id="endingNewRunButton" class="primary-button" type="button">Nuevo reinado</button><button id="endingMenuButton" class="secondary-button" type="button">Volver al menú</button><button id="copySummaryButton" class="secondary-button" type="button">Copiar resumen</button></div>`;
  document.getElementById("endingNewRunButton").addEventListener("click", openSetup);
  document.getElementById("endingMenuButton").addEventListener("click", () => setScreen("menu"));
  document.getElementById("copySummaryButton").addEventListener("click", copyChronicle);
}
function copyChronicle() { const text = `${state.outcome === "win" ? "Victoria" : "Derrota"}: ${(state.epilogue || buildEpilogue()).title}\n${(state.history || []).map((item) => `Día ${item.day}: ${item.choice} (${item.eventTitle})`).join("\n")}`; navigator.clipboard?.writeText(text); }

document.getElementById("continueButton").addEventListener("click", continueRun);
document.getElementById("newRunButton").addEventListener("click", openSetup);
document.getElementById("deleteSaveButton").addEventListener("click", deleteSave);
document.getElementById("setupBackButton").addEventListener("click", () => setScreen("menu"));
document.getElementById("startRunButton").addEventListener("click", startSelectedRun);
document.getElementById("menuButton").addEventListener("click", () => setScreen("menu"));
document.getElementById("endDayButton").addEventListener("click", endDay);
load();

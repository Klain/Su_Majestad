const GAME_VERSION = "v0.4.3";
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
    threat: "Mide peligro acumulado, crimen, guerra e inestabilidad. Si llega a 100, el reino queda consumido por la crisis."
  },
  reign: {
    trait: "Rasgo inicial del monarca. Modifica el arranque de la partida y da identidad a este reinado.",
    ambition: "Objetivo secundario del reinado. Cumplirlo mejora el epílogo final.",
    crisis: "Problema temporal que altera recursos y aumenta la presencia de ciertos asuntos en el consejo.",
    edict: "Política pasiva activa. Aplica efectos recurrentes mientras dure."
  },
  issues: {
    tension: "Indica lo cerca que está este conflicto de escalar.",
    trust: "Indica la confianza de la facción o actor hacia la corona.",
    stage: "Muestra el nivel narrativo del conflicto: inicial, escalado o crisis abierta.",
    daysOpen: "Tiempo que el asunto lleva sin resolverse."
  },
  chips: {
    uncertain: "Hay azar o consecuencias no totalmente visibles.",
    memory: "La decisión quedará registrada en la memoria política del reino.",
    conflict: "La decisión puede crear, modificar, escalar o resolver un conflicto persistente.",
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
  threat: ["Amenaza", "🔥"]
};


const ambitions = [
  { id: "merchant", name: "Rey mercader", description: "Acaba con oro alto y comercio favorecido." },
  { id: "pious", name: "Rey piadoso", description: "Acaba con fe alta y sin agravios graves a la iglesia." },
  { id: "people", name: "Rey del pueblo", description: "Acaba con pueblo alto y pocas decisiones crueles." },
  { id: "iron", name: "Rey de hierro", description: "Acaba con ejército alto y amenaza baja." },
  { id: "diplomat", name: "Rey diplomático", description: "Resuelve al menos 2 issues sin escalar demasiado el reino." },
  { id: "noble", name: "Rey noble", description: "Mantén nobleza alta y evita insultos a casas nobles." }
];

const rulerTraits = [
  { id: "generous", name: "Generoso", effects: { people: 8, gold: -8 } },
  { id: "military", name: "Militar", effects: { army: 8, faith: -6 } },
  { id: "devout", name: "Devoto", effects: { faith: 8, gold: -6 } },
  { id: "ambitious", name: "Ambicioso", effects: { nobility: 8, threat: 6 } },
  { id: "prudent", name: "Prudente", effects: { food: 8, people: -6 } },
  { id: "mercantile", name: "Mercantil", effects: { gold: 8, nobility: -6 } }
];

const crises = [
  { id: "drought", name: "Sequía", description: "La comida se agota más rápido.", duration: 4, families: ["food", "shortage", "people"], daily: { food: -2 } },
  { id: "war_rumors", name: "Rumores de guerra", description: "La frontera pesa más en el consejo.", duration: 4, families: ["border", "army", "diplomacy"], daily: { threat: 2 } },
  { id: "royal_fair", name: "Feria real", description: "El comercio domina la corte.", duration: 4, families: ["commerce", "people"], daily: { gold: 2 } },
  { id: "banditry", name: "Bandolerismo", description: "El crimen gana presencia.", duration: 4, families: ["crime", "public_order"], daily: { threat: 1, gold: -1 } },
  { id: "schism", name: "Cisma religioso", description: "La iglesia exige respuestas.", duration: 4, families: ["church", "nobility"], daily: { faith: -1 } },
  { id: "court_intrigue", name: "Intriga cortesana", description: "Las casas nobles mueven sus piezas.", duration: 4, families: ["nobility", "royal_family"], daily: { nobility: -1 } }
];

const edicts = [
  { id: "granaries", name: "Graneros reales", description: "Protege comida; a veces cuesta oro.", daily: { food: 1 }, every: 3, cost: { gold: -2 } },
  { id: "road_patrols", name: "Patrullas de caminos", description: "Reduce amenaza; desgasta al ejército.", daily: { threat: -1 }, every: 3, cost: { army: -1 } },
  { id: "market_tax", name: "Impuesto de mercado", description: "Mejora ingresos; deja malestar comercial.", daily: { gold: 1 }, tags: ["market_tax_edict"] },
  { id: "minor_pardon", name: "Indulto menor", description: "Calma el crimen; molesta a la nobleza.", daily: { threat: -1 }, every: 2, cost: { nobility: -1 } },
  { id: "strong_tithe", name: "Diezmo reforzado", description: "Sube la fe; baja el favor popular.", daily: { faith: 1 }, every: 2, cost: { people: -1 } },
  { id: "local_levy", name: "Leva local", description: "Refuerza ejército; cansa al pueblo.", daily: { army: 1 }, every: 2, cost: { people: -1 } }
];

const startingResources = { gold: 55, food: 55, army: 45, people: 55, nobility: 50, faith: 50, threat: 20 };
const eventManager = new EventManager(events, { actors, families });
let state;
let currentScreen = "menu";
let setupOptions = { traits: [], ambitions: [], selectedTrait: null, selectedAmbition: null };

function newGame(selection = {}) {
  const trait = selection.trait || pickRandom(rulerTraits);
  const ambition = selection.ambition || pickRandom(ambitions);
  const resources = { ...startingResources };
  applyResourceDelta(resources, trait.effects);
  state = eventManager.normalizeState({
    day: 1,
    resources,
    todaysEvents: [],
    resolved: [],
    gameOver: false,
    outcome: null,
    lastResult: null,
    ambition,
    rulerTrait: trait,
    activeCrisis: null,
    activeEdicts: [],
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
  if (state.gameOver || state.resolved.includes(eventIndex)) return;
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
  const vital = ["gold", "food", "army", "people", "nobility", "faith"];
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
  if (state?.gameOver && currentScreen !== "ending") currentScreen = "ending";
  syncScreens();
  if (currentScreen === "ending") return renderEnding();
  if (currentScreen !== "game" || !state) return;
  document.getElementById("dayNumber").textContent = Math.min(state.day, MAX_DAYS);
  document.getElementById("dayProgress").style.width = `${(Math.min(state.day, MAX_DAYS) / MAX_DAYS) * 100}%`;
  renderResources();
  renderReign();
  renderEvents();
  renderMemory();
  renderIssues();
  renderEdictOffer();
  renderMessage();
  initTooltips();
  document.getElementById("endDayButton").disabled = state.gameOver || state.resolved.length < EVENTS_PER_DAY;
}

function normalizeRoguelikeState(saved) {
  saved.ambition = ambitions.find((item) => item.id === saved.ambition?.id) || saved.ambition || pickRandom(ambitions);
  saved.rulerTrait = rulerTraits.find((item) => item.id === saved.rulerTrait?.id) || saved.rulerTrait || pickRandom(rulerTraits);
  saved.activeCrisis = saved.activeCrisis?.id ? { ...crises.find((item) => item.id === saved.activeCrisis.id), ...saved.activeCrisis } : null;
  saved.activeEdicts = Array.isArray(saved.activeEdicts) ? saved.activeEdicts.map((edict) => ({ ...edicts.find((item) => item.id === edict.id), ...edict })).filter((edict) => edict.id) : [];
  saved.edictChoices = Array.isArray(saved.edictChoices) ? saved.edictChoices : [];
  saved.completedObjectives = { issuesResolved: 0, ...(saved.completedObjectives || {}) };
  return saved;
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
    const resolved = state.resolved.includes(eventIndex) || state.gameOver;
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
  const crisis = state.activeCrisis?.remainingDays > 0 ? tooltip(`${state.activeCrisis.name} (${state.activeCrisis.remainingDays}d)`, formatCrisisTooltip(state.activeCrisis)) : "Sin crisis";
  const edict = state.activeEdicts?.length ? state.activeEdicts.map((item) => tooltip(item.name, formatEdictTooltip(item))).join(" · ") : "Sin edicto";
  panel.innerHTML = `<div class="reign-grid"><span><strong>${tooltip("Rasgo", tooltipTexts.reign.trait)}</strong>${tooltip(state.rulerTrait.name, formatTraitTooltip(state.rulerTrait))}</span><span><strong>${tooltip("Ambición", tooltipTexts.reign.ambition)}</strong>${tooltip(state.ambition.name, state.ambition.description)}</span><span><strong>${tooltip("Crisis", tooltipTexts.reign.crisis)}</strong>${crisis}</span><span><strong>${tooltip("Edicto", tooltipTexts.reign.edict)}</strong>${edict}</span></div>`;
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
  state.activeEdicts = [{ ...edict, chosenDay: state.day }];
  if (edict.tags?.length) eventManager.addTags(state, edict.tags);
  state.edictChoices = [];
  save();
  render();
}

function prepareSeasonalCrisis() {
  if (state.activeCrisis?.remainingDays > 0) return;
  if (state.day === 1 || (state.day - 1) % 7 !== 0) return;
  const crisis = pickRandom(crises);
  state.activeCrisis = { ...crisis, remainingDays: crisis.duration };
}

function prepareEdictOffer() {
  if (state.day > 1 && (state.day - 1) % 5 === 0) state.edictChoices = pickMany(edicts, 3);
}

function applyDailyRoguelikeSystems() {
  if (state.activeCrisis?.remainingDays > 0) {
    applyResourceDelta(state.resources, state.activeCrisis.daily);
    state.activeCrisis.remainingDays -= 1;
  }
  (state.activeEdicts || []).forEach((edict) => {
    applyResourceDelta(state.resources, edict.daily);
    if (edict.every && state.day % edict.every === 0) applyResourceDelta(state.resources, edict.cost);
  });
  checkOutcome();
}

function renderIssues() {
  if (currentScreen !== "game" || !state) return;
  const panel = document.getElementById("issues");
  if (!panel) return;
  const issues = state.issues || [];
  const summary = issues.length
    ? `${issues.length} conflicto${issues.length === 1 ? "" : "s"} activo${issues.length === 1 ? "" : "s"}: ${issues.slice(0, 2).map((issue) => formatIssueType(issue.type)).join(" · ")}${issues.length > 2 ? "…" : ""}`
    : "No hay conflictos abiertos. Por ahora.";
  panel.innerHTML = `
    <details class="compact-details">
      <summary><span>Issues activos</span><strong>${summary}</strong></summary>
      ${issues.length ? issues.map((issue) => {
        const issueTags = (issue.tags || []).map(formatIssueTagForPlayer).join(" · ");
        const debugLine = DEBUG_UI ? `<small>ID: ${issue.id} · Actor: ${issue.actorId} · Etapa ${issue.stage}</small>` : "";
        return `
          <article class="issue-row">
            <strong>${formatActorForPlayer(issue.actorId)}</strong>
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
  const text = `${ambitionWon ? "La ambición de " + state.ambition.name + " se cumplió" : "La ambición de " + state.ambition.name + " quedó incompleta"}. Recursos finales: oro ${r.gold}, comida ${r.food}, ejército ${r.army}, pueblo ${r.people}, nobleza ${r.nobility}, fe ${r.faith}, amenaza ${r.threat}. Issues resueltos: ${state.completedObjectives?.issuesResolved || 0}; activos: ${(state.issues || []).length}.`;
  return { title, text, ambitionWon };
}

function isAmbitionComplete() {
  const r = state.resources;
  const histories = state.history || [];
  const tags = state.tags || [];
  const familyCount = (family) => histories.filter((entry) => entry.family === family).length;
  if (state.ambition.id === "merchant") return r.gold >= 70 && familyCount("commerce") >= 3;
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
  if (option.issues?.length) parts.push("Puede alterar un conflicto persistente.");
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
  return `Rasgo inicial: ${formatEffectsText(trait.effects)}.`;
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
  if (!visible.length) visible.push({ icon: "❓", text: "Incierta" });
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
  chips.unshift({ icon: "❓", text: "Incierta", tone: "uncertain" });
  return chips;
}

function resourceTone(key, value) {
  const improves = key === "threat" ? value < 0 : value > 0;
  return improves ? "positive" : "negative";
}

function resourceArticle(key) {
  return ["food", "nobility", "faith", "threat"].includes(key) ? "la" : "el";
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
  if (option.defer?.length) hooks.push({ icon: "❓", text: "Incierta", tone: "uncertain" });
  if (option.issues?.length) hooks.push({ icon: "⚖️", text: "Conflicto", tone: "conflict" });
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
  setupOptions = { traits: pickMany(rulerTraits, 3), ambitions: pickMany(ambitions, 3), selectedTrait: null, selectedAmbition: null };
  setScreen("setup");
}
function renderSetup() {
  const traitBox = document.getElementById("traitChoices");
  const ambitionBox = document.getElementById("ambitionChoices");
  if (!traitBox || !ambitionBox) return;
  traitBox.innerHTML = setupOptions.traits.map((trait) => `<button class="choice-card ${setupOptions.selectedTrait?.id === trait.id ? "selected" : ""}" type="button" data-trait="${trait.id}"><strong>${trait.name}</strong><span>${formatEffectsText(trait.effects)}</span></button>`).join("");
  ambitionBox.innerHTML = setupOptions.ambitions.map((ambition) => `<button class="choice-card ${setupOptions.selectedAmbition?.id === ambition.id ? "selected" : ""}" type="button" data-ambition="${ambition.id}"><strong>${ambition.name}</strong><span>${ambition.description}</span></button>`).join("");
  document.getElementById("startRunButton").disabled = !setupOptions.selectedTrait || !setupOptions.selectedAmbition;
  traitBox.querySelectorAll("[data-trait]").forEach((button) => button.addEventListener("click", () => { setupOptions.selectedTrait = rulerTraits.find((item) => item.id === button.dataset.trait); renderSetup(); }));
  ambitionBox.querySelectorAll("[data-ambition]").forEach((button) => button.addEventListener("click", () => { setupOptions.selectedAmbition = ambitions.find((item) => item.id === button.dataset.ambition); renderSetup(); }));
}
function formatEffectsText(effects = {}) { return Object.entries(effects).map(([key, value]) => `${resourceMeta[key]?.[0] || key} ${value > 0 ? "+" : ""}${value}`).join(" · "); }
function startSelectedRun() {
  if (!setupOptions.selectedTrait || !setupOptions.selectedAmbition) return;
  if (hasValidSave() && !confirm("Comenzar un nuevo reinado sobrescribirá la partida guardada anterior. ¿Continuar?")) return;
  newGame({ trait: setupOptions.selectedTrait, ambition: setupOptions.selectedAmbition });
}
function deleteSave() { if (!hasValidSave() || !confirm("¿Borrar la partida guardada?")) return; localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY); state = null; setScreen("menu"); }
function continueRun() { if (!state) loadSavedState(); if (state) setScreen(state.gameOver ? "ending" : "game"); }
function loadSavedState() { const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY); if (!saved) return; state = normalizeRoguelikeState(eventManager.normalizeState(JSON.parse(saved))); state.todaysEvents = Array.isArray(state.todaysEvents) && state.todaysEvents.length ? state.todaysEvents : drawEventsForToday(); }
function getDeathCause() { const r = state.resources; if (r.gold <= 0) return "Bancarrota"; if (r.food <= 0) return "Hambruna"; if (r.army <= 0) return "Ejército roto"; if (r.people <= 0) return "Revuelta popular"; if (r.nobility <= 0) return "Nobleza sublevada"; if (r.faith <= 0) return "Fe colapsada"; if (r.threat >= 100) return "Reino consumido por amenaza"; return "Desenlace incierto"; }
function renderEnding() {
  const card = document.getElementById("endingCard");
  if (!state) { card.innerHTML = ""; return; }
  const epilogue = state.epilogue || buildEpilogue();
  const won = state.outcome === "win";
  const history = (state.history || []).slice(-3).reverse();
  const pending = state.pendingEvents || [];
  card.className = `ending-card ${won ? "win" : "lose"}`;
  card.innerHTML = `<p class="eyebrow">${won ? "Victoria" : "Derrota"}</p><h2>${epilogue.title}</h2><p>${won ? "La corte recordará este gobierno como una historia cerrada." : `Tu reinado cayó en el día ${state.day}. La corte recordará este gobierno como una advertencia.`}</p><p>${epilogue.text}</p><div class="run-summary"><strong>Ambición:</strong> ${state.ambition.name} — ${epilogue.ambitionWon ? "cumplida" : "La ambición quedó incompleta."}<br><strong>Rasgo inicial:</strong> ${state.rulerTrait.name}<br><strong>Día alcanzado:</strong> ${Math.min(state.day, MAX_DAYS)}</div>${won ? "" : `<p class="death-cause">Causa de derrota: ${getDeathCause()}</p>`}<div class="run-summary"><strong>Recursos finales:</strong> ${Object.entries(resourceMeta).map(([key,[name]]) => `${name} ${state.resources[key]}`).join(" · ")}<br><strong>Issues resueltos:</strong> ${state.completedObjectives?.issuesResolved || 0}<br><strong>Issues activos restantes:</strong> ${(state.issues || []).length}</div><h3>Últimas decisiones importantes</h3><ul class="chronicle-list">${history.length ? history.map((item) => `<li>Día ${item.day}: ${item.choice} (${item.eventTitle})</li>`).join("") : "<li>La crónica quedó casi en blanco.</li>"}</ul>${pending.length ? `<p>Aún quedaban consecuencias pendientes.</p><ul class="chronicle-list">${pending.map((item) => `<li>Día ${item.dueDay || "?"}: ${item.eventId || item.id || "consecuencia"}</li>`).join("")}</ul>` : ""}<details><summary>Ver crónica</summary><ul class="chronicle-list">${(state.history || []).map((item) => `<li>Día ${item.day}: ${item.choice} (${item.eventTitle})${item.resultText ? ` — ${item.resultText}` : ""}</li>`).join("") || "<li>Sin decisiones registradas.</li>"}</ul></details><div class="setup-actions"><button id="endingNewRunButton" class="primary-button" type="button">Nuevo reinado</button><button id="endingMenuButton" class="secondary-button" type="button">Volver al menú</button><button id="copySummaryButton" class="secondary-button" type="button">Copiar resumen</button></div>`;
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

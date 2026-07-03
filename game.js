const GAME_VERSION = "v0.3.0";
const DEBUG_UI = false;
const STORAGE_KEY = "su-majestad-save-v2";
const LEGACY_STORAGE_KEY = "su-majestad-save-v1";
const MAX_DAYS = 30;
const EVENTS_PER_DAY = 2;

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

function newGame() {
  const trait = pickRandom(rulerTraits);
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
    ambition: pickRandom(ambitions),
    rulerTrait: trait,
    activeCrisis: null,
    activeEdicts: [],
    edictChoices: [],
    completedObjectives: { issuesResolved: 0 },
    ...eventManager.createInitialMemory()
  });
  state.todaysEvents = drawEventsForToday();
  save();
  render();
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
  if (state.gameOver) { save(); render(); return; }
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
  render();
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
  if (!saved) return newGame();
  try {
    state = normalizeRoguelikeState(eventManager.normalizeState(JSON.parse(saved)));
    state.todaysEvents = Array.isArray(state.todaysEvents) && state.todaysEvents.length ? state.todaysEvents : drawEventsForToday();
  } catch {
    return newGame();
  }
  save();
  render();
}

function render() {
  document.getElementById("gameVersion").textContent = GAME_VERSION;
  document.getElementById("dayNumber").textContent = Math.min(state.day, MAX_DAYS);
  document.getElementById("dayProgress").style.width = `${(Math.min(state.day, MAX_DAYS) / MAX_DAYS) * 100}%`;
  renderResources();
  renderReign();
  renderEvents();
  renderMemory();
  renderIssues();
  renderEdictOffer();
  renderMessage();
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
  document.getElementById("resources").innerHTML = Object.entries(resourceMeta).map(([key, [name, icon]]) => {
    const value = state.resources[key];
    const classes = ["resource", key === "threat" ? "threat" : "", value <= 18 && key !== "threat" ? "low" : ""].join(" ");
    return `<article class="${classes}"><div class="resource-top"><span class="resource-name">${icon} ${name}</span><span class="resource-value">${value}</span></div><div class="meter"><div class="meter-fill" style="width:${value}%"></div></div></article>`;
  }).join("");
}

function renderEvents() {
  document.getElementById("events").innerHTML = state.todaysEvents.map((item, eventIndex) => {
    const resolved = state.resolved.includes(eventIndex) || state.gameOver;
    const options = item.options.map((option, optionIndex) => `<button class="option-button" type="button" ${resolved ? "disabled" : ""} data-event="${eventIndex}" data-option="${optionIndex}"><span class="option-title">${option.label}</span><span class="effects chips" aria-label="Consecuencias previstas">${formatChoicePreview(option)}</span></button>`).join("");
    return `<article class="event-card ${resolved ? "resolved" : ""}"><h3 class="event-title">${item.title}</h3><p class="event-text">${item.text}</p><div class="options">${options}</div></article>`;
  }).join("");

  document.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => applyChoice(Number(button.dataset.event), Number(button.dataset.option)));
  });
}

function renderReign() {
  const panel = document.getElementById("reign");
  if (!panel) return;
  const crisis = state.activeCrisis?.remainingDays > 0 ? `${state.activeCrisis.name} (${state.activeCrisis.remainingDays}d)` : "Sin crisis";
  const edict = state.activeEdicts?.length ? state.activeEdicts.map((item) => item.name).join(" · ") : "Sin edicto";
  panel.innerHTML = `<div class="reign-grid"><span><strong>Rasgo</strong>${state.rulerTrait.name}</span><span><strong>Ambición</strong>${state.ambition.name}</span><span><strong>Crisis</strong>${crisis}</span><span><strong>Edicto</strong>${edict}</span></div>`;
}

function renderEdictOffer() {
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
            <span>${formatIssueType(issue.type)} · ${formatIssueStage(issue)} · ${formatDaysOpen(issue.daysActive)}</span>
            <span>Tensión ${formatTensionForPlayer(issue.tension)} · Confianza ${formatTrustForPlayer(issue.trust)}</span>
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

function formatChoicePreview(option) {
  const chips = [];
  if (option.outcomes?.length) chips.push(...formatOutcomeChips(option.outcomes));
  else chips.push(...formatEffectChips(option.immediate || option.effects || {}));
  chips.push(...formatStoryHookChips(option));

  const uniqueChips = dedupeChips(chips);
  const visible = uniqueChips.slice(0, 4);
  if (uniqueChips.length > 4) visible[3] = { icon: "✦", text: "+ más" };
  if (!visible.length) visible.push({ icon: "❓", text: "Incierta" });
  return visible.map(({ icon, text, tone = "" }) => `<span class="effect-chip ${tone}">${icon} ${text}</span>`).join("");
}

function formatEffectChips(effects) {
  return Object.entries(effects)
    .filter(([key, value]) => resourceMeta[key] && value !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .map(([key, value]) => formatImpactChip(key, value));
}

function formatImpactChip(key, value) {
  const [name, icon] = resourceMeta[key];
  const magnitude = Math.abs(value);
  const level = magnitude >= 8 ? " fuerte" : magnitude >= 4 ? " moderado" : "";
  return { icon, text: `${name} ${value > 0 ? "↑" : "↓"}${level}`, tone: value > 0 ? "positive" : "negative" };
}

function formatOutcomeChips(outcomes) {
  const combined = {};
  outcomes.forEach((outcome) => {
    Object.entries(outcome.immediate || outcome.effects || {}).forEach(([key, value]) => {
      if (!resourceMeta[key] || value === 0) return;
      combined[key] = (combined[key] || 0) + Math.sign(value) * Math.abs(value) * (outcome.probability || 1);
    });
  });
  const chips = formatEffectChips(combined);
  chips.unshift({ icon: "❓", text: "Incierta", tone: "uncertain" });
  return chips;
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

document.getElementById("newGameButton").addEventListener("click", newGame);
document.getElementById("endDayButton").addEventListener("click", endDay);
load();

const GAME_VERSION = "v0.2.3";
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

const startingResources = { gold: 55, food: 55, army: 45, people: 55, nobility: 50, faith: 50, threat: 20 };
const eventManager = new EventManager(events, { actors, families });
let state;

function newGame() {
  state = eventManager.normalizeState({
    day: 1,
    resources: { ...startingResources },
    todaysEvents: [],
    resolved: [],
    gameOver: false,
    outcome: null,
    lastResult: null,
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
  state.day += 1;
  if (state.day > MAX_DAYS) {
    state.gameOver = true;
    state.outcome = "win";
  } else {
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
    state = eventManager.normalizeState(JSON.parse(saved));
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
  renderEvents();
  renderMemory();
  renderIssues();
  renderMessage();
  document.getElementById("endDayButton").disabled = state.gameOver || state.resolved.length < EVENTS_PER_DAY;
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
  box.innerHTML = state.outcome === "win"
    ? "<strong>Victoria.</strong> Tu dinastía sobrevive los 30 días. El reino canta tu nombre."
    : "<strong>Derrota.</strong> El reino cae por hambre, bancarrota, rebelión, cisma o invasión.";
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

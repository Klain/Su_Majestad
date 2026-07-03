const GAME_VERSION = "v0.2.1";
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
    const options = item.options.map((option, optionIndex) => `<button class="option-button" type="button" ${resolved ? "disabled" : ""} data-event="${eventIndex}" data-option="${optionIndex}">${option.label}<span class="effects">${formatChoicePreview(option)}</span></button>`).join("");
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
  panel.innerHTML = `
    <h2>Issues activos</h2>
    ${issues.length ? issues.map((issue) => `
      <article class="issue-row">
        <strong>${formatIssueType(issue.type)}</strong>
        <span>Actor: ${issue.actorId} · Etapa ${issue.stage} · ${issue.daysActive} días</span>
        <span>Tensión ${issue.tension} · Confianza ${issue.trust}</span>
        <small>${issue.tags.join(", ") || "sin etiquetas"}</small>
      </article>
    `).join("") : "<p>No hay conflictos abiertos. Por ahora.</p>"}
  `;
}

function formatIssueType(type) {
  return ({ border: "Crisis fronteriza", noble_claim: "Reclamación noble", generic: "Asunto del reino" })[type] || type.replaceAll("_", " ");
}

function renderMemory() {
  const memory = document.getElementById("memory");
  if (!memory) return;
  const recent = state.history.slice(-3).reverse();
  const tags = state.tags.slice(-6);
  memory.innerHTML = `
    <h2>Memoria del reino</h2>
    <p>${state.pendingEvents.length} consecuencias pendientes. ${tags.length ? `Rumores: ${tags.join(", ")}.` : "El reino aún no ha decidido quién eres."}</p>
    ${recent.length ? `<ul>${recent.map((item) => `<li>Día ${item.day}: ${item.choice} (${item.eventTitle})${item.resultText ? ` — ${item.resultText}` : ""}</li>`).join("")}</ul>` : ""}
  `;
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
  const parts = [];
  if (option.outcomes?.length) parts.push(...formatOutcomeHints(option.outcomes));
  else parts.push(...formatEffects(option.immediate || option.effects || {}));
  const hooks = formatStoryHooks(option);
  if (hooks) parts.push(hooks);
  return [...new Set(parts)].join(" · ") || "Consecuencia incierta";
}

function formatEffects(effects) {
  return Object.entries(effects)
    .filter(([key, value]) => resourceMeta[key] && value !== 0)
    .map(([key, value]) => formatImpact(key, value));
}

function formatImpact(key, value) {
  const resource = resourceMeta[key][0].toLowerCase();
  const magnitude = Math.abs(value);
  const level = magnitude >= 8 ? "fuerte" : magnitude >= 4 ? "moderado" : "leve";
  if (value > 0) {
    if (key === "gold") return level === "fuerte" ? "Gran ingreso de oro" : `Ganancia ${level} de oro`;
    if (key === "threat") return `${capitalize(level)} aumento de amenaza`;
    return `Mejora ${level} de ${resource}`;
  }
  if (key === "gold") return level === "fuerte" ? "Gran gasto de oro" : `Gasto ${level} de oro`;
  if (key === "people") return `Pérdida ${level} de apoyo popular`;
  if (key === "threat") return `Reducción ${level} de amenaza`;
  return `Pérdida ${level} de ${resource}`;
}

function formatOutcomeHints(outcomes) {
  const hints = ["Resultado incierto"];
  const probabilities = outcomes.map((outcome) => outcome.probability || 0);
  const loss = outcomes.some((outcome) => Object.values(outcome.immediate || outcome.effects || {}).some((value) => value < 0));
  const reward = outcomes.some((outcome) => Object.values(outcome.immediate || outcome.effects || {}).some((value) => value > 0));
  if (Math.max(...probabilities) < 0.5 || loss) hints.push("Riesgo alto");
  else if (probabilities.some((probability) => probability <= 0.25)) hints.push("Riesgo medio");
  else hints.push("Riesgo bajo");
  if (reward) hints.push("Posible recompensa");
  if (loss) hints.push("Posible pérdida");
  return hints;
}

function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

function formatStoryHooks(option) {
  const hooks = [];
  if (option.addTags?.length) hooks.push("El reino recordará esto");
  if (option.defer?.length) hooks.push("Consecuencia incierta");
  if (option.issues?.length) hooks.push("Afecta un conflicto activo");
  return hooks.join(" · ");
}

document.getElementById("newGameButton").addEventListener("click", newGame);
document.getElementById("endDayButton").addEventListener("click", endDay);
load();

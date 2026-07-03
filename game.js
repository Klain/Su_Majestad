const STORAGE_KEY = "su-majestad-save-v1";
const MAX_DAYS = 30;

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

const events = [
  event("Granero con ratas", "Las reservas del norte han sido infestadas.", [["Quemad el granero", { food: -10, threat: -5, people: -3 }], ["Contratad cazadores", { gold: -8, food: -4, people: 4 }], ["Ignoradlo", { food: -16, threat: 5 }]]),
  event("Mercaderes extranjeros", "Una caravana ofrece lujo a cambio de privilegios.", [["Cobrad impuestos", { gold: 14, people: -4 }], ["Dadles escolta", { gold: 8, army: -4, nobility: 4 }], ["Cerrad las puertas", { threat: -3, gold: -5 }]]),
  event("Profeta en la plaza", "Un predicador arrastra multitudes.", [["Bendecidlo", { faith: 10, nobility: -4 }], ["Arrestadlo", { faith: -10, people: -6, threat: -4 }], ["Invitadlo a palacio", { faith: 6, gold: -5 }]]),
  event("Duelo noble", "Dos casas rivales exigen que arbitres su honor.", [["Favoreced al duque", { nobility: 8, people: -4 }], ["Multad a ambos", { gold: 10, nobility: -8 }], ["Enviadlos al frente", { army: 5, nobility: -5 }]]),
  event("Bandidos del camino", "Los aldeanos temen viajar al mercado.", [["Patrulla militar", { army: -6, people: 7, threat: -8 }], ["Pagad informantes", { gold: -7, threat: -6 }], ["Que se defiendan", { people: -9, threat: 6 }]]),
  event("Cosecha dorada", "Los campos producen más de lo esperado.", [["Almacenar", { food: 15 }], ["Celebrar feria", { food: 8, gold: 8, people: 4 }], ["Diezmo especial", { food: 6, faith: 6, people: -3 }]]),
  event("Veteranos inquietos", "Soldados licenciados piden paga atrasada.", [["Pagadles", { gold: -12, army: 8 }], ["Prometed tierras", { army: 5, nobility: -6 }], ["Dispersadlos", { army: -10, threat: 8 }]]),
  event("Reliquia hallada", "Un campesino descubre huesos santos.", [["Construid santuario", { gold: -10, faith: 14, people: 3 }], ["Vended reliquias", { gold: 12, faith: -8 }], ["Investigad fraude", { faith: -3, threat: -4 }]]),
  event("Sequía temprana", "El río baja y los molinos callan.", [["Racionar", { food: -6, people: -5, threat: -4 }], ["Comprar grano", { gold: -14, food: 12 }], ["Rezar por lluvia", { faith: -4, food: -8, people: 3 }]]),
  event("Embajada rival", "Un reino vecino ofrece una tregua sospechosa.", [["Aceptar", { threat: -10, nobility: -3 }], ["Exigir tributo", { gold: 10, threat: 7 }], ["Mostrar ejército", { army: -4, threat: -6, nobility: 4 }]]),
  event("Médica ambulante", "Una sanadora pide permiso para atender barrios pobres.", [["Financiadla", { gold: -7, people: 9, faith: -2 }], ["Entregadla al clero", { faith: 6, people: -4 }], ["Permitid sin ayuda", { people: 4 }]]),
  event("Banquete real", "La corte espera una fiesta memorable.", [["Esplendor total", { gold: -14, nobility: 9, food: -6 }], ["Cena austera", { nobility: -6, food: -2, faith: 3 }], ["Invitad al pueblo", { food: -10, people: 8, nobility: -3 }]]),
  event("Mina derrumbada", "Mineros atrapados golpean bajo tierra.", [["Rescate caro", { gold: -10, people: 8 }], ["Reabrid pronto", { gold: 12, people: -10 }], ["Consagrad víctimas", { faith: 5, people: -4 }]]),
  event("Espías capturados", "Tus guardias atrapan agentes con mapas del castillo.", [["Interrogadlos", { threat: -7, faith: -2 }], ["Canje secreto", { gold: 8, threat: 4 }], ["Ejecución pública", { people: 3, threat: -4, faith: -4 }]]),
  event("Niños hambrientos", "Un orfanato pide pan y leña.", [["Donad comida", { food: -8, people: 8, faith: 4 }], ["Donad oro", { gold: -8, people: 5 }], ["No hay excedente", { people: -8, faith: -5 }]]),
  event("Torneo de primavera", "Caballeros quieren gloria y premios.", [["Organizadlo", { gold: -10, nobility: 8, army: 4 }], ["Cobrad inscripción", { gold: 9, nobility: -3 }], ["Canceladlo", { nobility: -8, threat: -3 }]]),
  event("Herejía rural", "Una aldea mezcla ritos antiguos con misa.", [["Tolerancia", { faith: -7, people: 6 }], ["Inquisidores", { faith: 8, people: -9, threat: 5 }], ["Catequistas", { gold: -5, faith: 5, people: 2 }]]),
  event("Forja innovadora", "Una herrera promete armas mejores si recibe metal.", [["Invertid", { gold: -9, army: 10 }], ["Expropiad planos", { army: 5, people: -5 }], ["Rechazad", { nobility: 2 }]]),
  event("Rumor de monstruo", "Pastores hablan de una bestia en el bosque.", [["Cacería real", { army: -5, threat: -8, nobility: 3 }], ["Recompensa", { gold: -6, threat: -5 }], ["Supersticiones", { faith: -4, people: -5, threat: 6 }]]),
  event("Impuesto de guerra", "Los cofres menguan y la frontera arde.", [["Cobrar al pueblo", { gold: 15, people: -10 }], ["Cobrar a nobles", { gold: 12, nobility: -10 }], ["Pedir a templos", { gold: 10, faith: -10 }]]),
  event("Festival lunar", "La gente pide una noche sin trabajo.", [["Permitid fiesta", { people: 8, food: -6, gold: -4 }], ["Fiesta religiosa", { faith: 7, food: -4 }], ["Prohibidla", { people: -7, threat: 3 }]]),
  event("Reclutas campesinos", "El mariscal reclama más lanzas.", [["Leva obligatoria", { army: 12, people: -9, food: -3 }], ["Incentivos", { gold: -9, army: 7 }], ["No ahora", { army: -3, threat: 5 }]]),
  event("Puente roto", "El comercio se detiene tras una crecida.", [["Reconstruid", { gold: -11, people: 4, threat: -3 }], ["Peaje temporal", { gold: 7, people: -4 }], ["Ruta militar", { army: -4, gold: 5 }]]),
  event("Poeta satírico", "Sus versos se burlan de tu corona.", [["Reír con todos", { people: 6, nobility: -5 }], ["Nombrarlo cronista", { gold: -4, people: 3, nobility: 3 }], ["Censurarlo", { people: -6, threat: 4 }]]),
  event("Contrabando de sal", "Guardias descubren una red clandestina.", [["Amnistía por multa", { gold: 10, people: 2 }], ["Mano dura", { gold: 5, people: -6, threat: -5 }], ["Aliados discretos", { gold: 14, nobility: -4, threat: 4 }]]),
  event("Visión de la reina", "La consorte sueña con fuego sobre la capital.", [["Fortificar", { gold: -8, threat: -7 }], ["Procesión", { faith: 8, threat: -3, food: -3 }], ["Callad el rumor", { nobility: 3, people: -3 }]]),
  event("Aprendices rebeldes", "Los gremios jóvenes exigen voz propia.", [["Conceded carta", { people: 7, nobility: -5, gold: 4 }], ["Apoyad maestros", { nobility: 5, people: -6 }], ["Mediad", { gold: -4, people: 3, nobility: 2 }]]),
  event("Lobos en invierno", "Manadas hambrientas bajan de la montaña.", [["Batida", { army: -4, food: 4, threat: -6 }], ["Pagar pieles", { gold: -6, people: 5 }], ["Cerrar aldeas", { food: -5, people: -4, threat: -3 }]]),
  event("Deuda de palacio", "Prestamistas reclaman intereses antiguos.", [["Pagar", { gold: -13, nobility: 4 }], ["Renegociar", { gold: -5, nobility: -3 }], ["Repudiar deuda", { gold: 6, nobility: -9, threat: 4 }]]),
  event("Mapa antiguo", "Un cartógrafo vende rutas hacia ruinas olvidadas.", [["Expedición", { gold: -7, army: -3, threat: -4 }], ["Subastad mapa", { gold: 8, nobility: 2 }], ["Entregad al templo", { faith: 5, gold: -2 }]]),
  event("Pan adulterado", "Panaderos mezclan serrín para rendir harina.", [["Castigo ejemplar", { food: 5, people: -5, threat: -4 }], ["Subsidio de harina", { gold: -8, food: 7, people: 4 }], ["Mirar a otro lado", { food: -7, people: -7 }]])
];

let state;

function event(title, text, options) {
  return { title, text, options: options.map(([label, effects]) => ({ label, effects })) };
}

function newGame() {
  state = { day: 1, resources: { ...startingResources }, todaysEvents: pickEvents(), resolved: [], gameOver: false, outcome: null };
  save();
  render();
}

function pickEvents() {
  return [...events].sort(() => Math.random() - 0.5).slice(0, 2);
}

function clamp(value) { return Math.max(0, Math.min(100, value)); }

function applyChoice(eventIndex, optionIndex) {
  if (state.gameOver || state.resolved.includes(eventIndex)) return;
  const choice = state.todaysEvents[eventIndex].options[optionIndex];
  Object.entries(choice.effects).forEach(([key, value]) => {
    state.resources[key] = clamp(state.resources[key] + value);
  });
  state.resolved.push(eventIndex);
  checkOutcome();
  save();
  render();
}

function endDay() {
  if (state.resolved.length < 2 || state.gameOver) return;
  state.day += 1;
  if (state.day > MAX_DAYS) {
    state.gameOver = true;
    state.outcome = "win";
  } else {
    state.todaysEvents = pickEvents();
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
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return newGame();
  try {
    state = JSON.parse(saved);
  } catch {
    return newGame();
  }
  render();
}

function render() {
  document.getElementById("dayNumber").textContent = Math.min(state.day, MAX_DAYS);
  document.getElementById("dayProgress").style.width = `${(Math.min(state.day, MAX_DAYS) / MAX_DAYS) * 100}%`;
  renderResources();
  renderEvents();
  renderMessage();
  document.getElementById("endDayButton").disabled = state.gameOver || state.resolved.length < 2;
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
    const options = item.options.map((option, optionIndex) => `<button class="option-button" type="button" ${resolved ? "disabled" : ""} data-event="${eventIndex}" data-option="${optionIndex}">${option.label}<span class="effects">${formatEffects(option.effects)}</span></button>`).join("");
    return `<article class="event-card ${resolved ? "resolved" : ""}"><h3 class="event-title">${item.title}</h3><p class="event-text">${item.text}</p><div class="options">${options}</div></article>`;
  }).join("");

  document.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => applyChoice(Number(button.dataset.event), Number(button.dataset.option)));
  });
}

function renderMessage() {
  const box = document.getElementById("message");
  if (!state.gameOver) {
    box.className = "message hidden";
    box.textContent = "";
    return;
  }
  box.className = `message ${state.outcome}`;
  box.innerHTML = state.outcome === "win"
    ? "<strong>Victoria.</strong> Tu dinastía sobrevive los 30 días. El reino canta tu nombre."
    : "<strong>Derrota.</strong> El reino cae por hambre, bancarrota, rebelión, cisma o invasión.";
}

function formatEffects(effects) {
  return Object.entries(effects).map(([key, value]) => `${resourceMeta[key][1]} ${value > 0 ? "+" : ""}${value}`).join(" · ");
}

document.getElementById("newGameButton").addEventListener("click", newGame);
document.getElementById("endDayButton").addEventListener("click", endDay);
load();

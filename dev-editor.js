const DEV_EVENTS_DRAFT_KEY = "su-majestad-dev-events-draft-v1";
const RESOURCE_KEYS = new Set(Object.keys(resourceMeta));
const developerState = { events: [], selectedId: null, search: "", family: "", kind: "", special: "", jsonError: "" };

function cloneEvent(item) { return JSON.parse(JSON.stringify(item)); }
function bootDeveloperEditor() {
  developerState.events = cloneEvent(window.eventsDatabase || events || []);
  developerState.selectedId = developerState.events[0]?.id || null;
  bindDeveloperControls();
}
function bindDeveloperControls() {
  const byId = (id) => document.getElementById(id);
  byId("developerModeButton")?.addEventListener("click", () => setScreen("developer"));
  byId("developerBackButton")?.addEventListener("click", () => setScreen("menu"));
  byId("developerSearch")?.addEventListener("input", (e) => { developerState.search = e.target.value; renderDeveloperEditor(); });
  byId("developerFamilyFilter")?.addEventListener("change", (e) => { developerState.family = e.target.value; renderDeveloperEditor(); });
  byId("developerKindFilter")?.addEventListener("change", (e) => { developerState.kind = e.target.value; renderDeveloperEditor(); });
  byId("developerSpecialFilter")?.addEventListener("change", (e) => { developerState.special = e.target.value; renderDeveloperEditor(); });
  byId("developerNewButton")?.addEventListener("click", createDeveloperEvent);
  byId("developerDuplicateButton")?.addEventListener("click", duplicateDeveloperEvent);
  byId("developerDeleteButton")?.addEventListener("click", deleteDeveloperEvent);
  byId("developerExportButton")?.addEventListener("click", exportDeveloperEvents);
  byId("developerDraftButton")?.addEventListener("click", () => { localStorage.setItem(DEV_EVENTS_DRAFT_KEY, JSON.stringify(developerState.events, null, 2)); renderDeveloperEditor("Borrador guardado en este navegador."); });
  byId("developerLoadDraftButton")?.addEventListener("click", loadDeveloperDraft);
  byId("developerImportInput")?.addEventListener("change", importDeveloperEvents);
}
function renderDeveloperEditor(message = "") {
  if (currentScreen !== "developer") return;
  renderDeveloperFilters();
  renderDeveloperValidation(message);
  renderDeveloperList();
  renderDeveloperForm();
}
function renderDeveloperFilters() {
  const familySelect = document.getElementById("developerFamilyFilter");
  const kindSelect = document.getElementById("developerKindFilter");
  if (!familySelect || !kindSelect) return;
  const familyValues = [...new Set(developerState.events.flatMap((item) => [item.family, ...(item.families || [])]).filter(Boolean))].sort();
  const kindValues = [...new Set(developerState.events.map((item) => item.kind || "normal"))].sort();
  familySelect.innerHTML = `<option value="">Todas las familias</option>${familyValues.map((value) => `<option value="${escapeHtml(value)}" ${developerState.family === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  kindSelect.innerHTML = `<option value="">Todos los tipos</option>${kindValues.map((value) => `<option value="${escapeHtml(value)}" ${developerState.kind === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
}
function filteredDeveloperEvents() {
  const query = developerState.search.trim().toLowerCase();
  return developerState.events.filter((item) => {
    const haystack = JSON.stringify([item.id, item.title, item.text, item.family, item.families, item.requiresTags, item.forbiddenTags, item.options]).toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (developerState.family && item.family !== developerState.family && !(item.families || []).includes(developerState.family)) return false;
    const kind = item.kind || "normal";
    if (developerState.kind && kind !== developerState.kind) return false;
    if (developerState.special === "normal" && kind === "consequence") return false;
    if (developerState.special === "consequence" && kind !== "consequence") return false;
    if (developerState.special === "issue" && !item.issue && !(item.options || []).some((option) => option.issues)) return false;
    if (developerState.special === "defer" && !eventHasDefer(item)) return false;
    return true;
  });
}
function renderDeveloperList() {
  const list = document.getElementById("developerEventList");
  const items = filteredDeveloperEvents();
  list.innerHTML = `<p class="developer-count">${items.length} / ${developerState.events.length} eventos</p>` + items.map((item) => `<button class="developer-list-item ${item.id === developerState.selectedId ? "selected" : ""}" type="button" data-dev-event="${escapeHtml(item.id)}"><strong>${escapeHtml(item.id || "sin-id")}</strong><span>${escapeHtml(item.title || "Sin título")}</span><small>${escapeHtml(item.kind || "normal")} · ${escapeHtml(item.family || "sin familia")}</small></button>`).join("");
  list.querySelectorAll("[data-dev-event]").forEach((button) => button.addEventListener("click", () => { developerState.selectedId = button.dataset.devEvent; renderDeveloperEditor(); }));
}
function selectedDeveloperEvent() { return developerState.events.find((item) => item.id === developerState.selectedId) || developerState.events[0]; }
function renderDeveloperForm() {
  const form = document.getElementById("developerForm");
  const item = selectedDeveloperEvent();
  if (!item) { form.innerHTML = "<p>No hay eventos. Crea uno para empezar.</p>"; return; }
  developerState.selectedId = item.id;
  form.innerHTML = `<h3>${escapeHtml(item.title || item.id)}</h3><div class="developer-form-grid">
    ${textInput("id", "ID", item.id)}${textInput("title", "Título", item.title)}${textareaInput("text", "Texto", item.text)}${textInput("kind", "Kind", item.kind || "")}${textInput("family", "Family", item.family || "")}${textInput("families", "Families CSV", (item.families || []).join(", "))}${numberInput("weight", "Weight", item.weight)}${numberInput("minDay", "Min day", item.minDay)}${numberInput("maxDay", "Max day", item.maxDay)}${textInput("requiresTags", "Requires tags CSV", (item.requiresTags || []).join(", "))}${textInput("forbiddenTags", "Forbidden tags CSV", (item.forbiddenTags || []).join(", "))}${textInput("issue", "Issue", item.issue || "")}
  </div><h4>Opciones</h4><div class="developer-options">${(item.options || []).map((option, index) => renderDeveloperOption(option, index)).join("")}</div><button id="developerAddOption" class="secondary-button" type="button">Añadir opción</button><details class="developer-json"><summary>JSON avanzado</summary><textarea id="developerAdvancedJson" spellcheck="false">${escapeHtml(JSON.stringify(item, null, 2))}</textarea><button id="developerApplyJson" class="primary-button" type="button">Aplicar JSON</button>${developerState.jsonError ? `<p class="validation-error">${escapeHtml(developerState.jsonError)}</p>` : ""}</details>`;
  form.querySelectorAll("[data-field]").forEach((field) => field.addEventListener("input", updateDeveloperField));
  form.querySelectorAll("[data-option-field]").forEach((field) => field.addEventListener("input", updateDeveloperOption));
  form.querySelectorAll("[data-delete-option]").forEach((button) => button.addEventListener("click", () => { item.options.splice(Number(button.dataset.deleteOption), 1); renderDeveloperEditor(); }));
  document.getElementById("developerAddOption").addEventListener("click", () => { item.options = [...(item.options || []), { label: "Nueva opción", immediate: {}, addTags: [], characters: [], issues: [], outcomes: [], resultText: "" }]; renderDeveloperEditor(); });
  document.getElementById("developerApplyJson").addEventListener("click", applyDeveloperAdvancedJson);
}
function renderDeveloperOption(option, index) { return `<article class="developer-option"><label>Label<input data-option-field="label" data-option-index="${index}" value="${escapeHtml(option.label || "")}"></label><label>Immediate JSON<textarea data-option-field="immediate" data-option-index="${index}">${escapeHtml(JSON.stringify(option.immediate || {}, null, 2))}</textarea></label><label>Add tags CSV<input data-option-field="addTags" data-option-index="${index}" value="${escapeHtml((option.addTags || []).join(", "))}"></label><label>Characters JSON<textarea data-option-field="characters" data-option-index="${index}">${escapeHtml(JSON.stringify(option.characters || [], null, 2))}</textarea></label><label>Issues JSON<textarea data-option-field="issues" data-option-index="${index}">${escapeHtml(JSON.stringify(option.issues || [], null, 2))}</textarea></label><label>Defer JSON<textarea data-option-field="defer" data-option-index="${index}">${escapeHtml(JSON.stringify(option.defer || [], null, 2))}</textarea></label><label>Outcomes JSON<textarea data-option-field="outcomes" data-option-index="${index}">${escapeHtml(JSON.stringify(option.outcomes || [], null, 2))}</textarea></label><label>Result text<textarea data-option-field="resultText" data-option-index="${index}">${escapeHtml(option.resultText || "")}</textarea></label><button class="danger-button" type="button" data-delete-option="${index}">Borrar opción</button></article>`; }
function textInput(field, label, value="") { return `<label>${label}<input data-field="${field}" value="${escapeHtml(value ?? "")}"></label>`; }
function numberInput(field, label, value) { return `<label>${label}<input type="number" data-field="${field}" value="${Number.isFinite(value) ? value : ""}"></label>`; }
function textareaInput(field, label, value="") { return `<label class="wide">${label}<textarea data-field="${field}">${escapeHtml(value ?? "")}</textarea></label>`; }
function updateDeveloperField(e) { const item = selectedDeveloperEvent(); const field = e.target.dataset.field; const value = e.target.value; if (["families", "requiresTags", "forbiddenTags"].includes(field)) item[field] = csv(value); else if (["weight", "minDay", "maxDay"].includes(field)) { if (value === "") delete item[field]; else item[field] = Number(value); } else { if (value === "" && ["kind", "family", "issue"].includes(field)) delete item[field]; else item[field] = value; } if (field === "id") developerState.selectedId = value; renderDeveloperValidation(); }
function updateDeveloperOption(e) { const item = selectedDeveloperEvent(); const option = item.options[Number(e.target.dataset.optionIndex)]; const field = e.target.dataset.optionField; try { if (["immediate", "characters", "issues", "defer", "outcomes"].includes(field)) option[field] = JSON.parse(e.target.value || (field === "immediate" ? "{}" : "[]")); else if (field === "addTags") option[field] = csv(e.target.value); else option[field] = e.target.value; e.target.classList.remove("invalid"); renderDeveloperValidation(); } catch { e.target.classList.add("invalid"); } }
function applyDeveloperAdvancedJson() { const item = selectedDeveloperEvent(); try { const next = JSON.parse(document.getElementById("developerAdvancedJson").value); developerState.events[developerState.events.indexOf(item)] = next; developerState.selectedId = next.id; developerState.jsonError = ""; renderDeveloperEditor(); } catch (error) { developerState.jsonError = error.message; renderDeveloperForm(); } }
function createDeveloperEvent() { const id = uniqueDeveloperId("nuevo_evento"); developerState.events.unshift({ id, title: "Nuevo evento", text: "Describe el asunto del consejo.", family: "", families: [], options: [{ label: "Aceptar", immediate: {}, resultText: "" }] }); developerState.selectedId = id; renderDeveloperEditor(); }
function duplicateDeveloperEvent() { const item = selectedDeveloperEvent(); if (!item) return; const copy = cloneEvent(item); copy.id = uniqueDeveloperId(`${item.id || "evento"}_copia`); copy.title = `${copy.title || "Evento"} (copia)`; developerState.events.splice(developerState.events.indexOf(item) + 1, 0, copy); developerState.selectedId = copy.id; renderDeveloperEditor(); }
function deleteDeveloperEvent() { const item = selectedDeveloperEvent(); if (!item || !confirm(`¿Borrar ${item.id}?`)) return; developerState.events.splice(developerState.events.indexOf(item), 1); developerState.selectedId = developerState.events[0]?.id || null; renderDeveloperEditor(); }
function uniqueDeveloperId(base) { const ids = new Set(developerState.events.map((item) => item.id)); let id = base.replace(/[^a-z0-9_]+/gi, "_").toLowerCase(); let index = 2; while (ids.has(id)) id = `${base}_${index++}`; return id; }
function exportDeveloperEvents() { const blob = new Blob([JSON.stringify(developerState.events, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "events-database-export.json"; link.click(); URL.revokeObjectURL(link.href); }
function importDeveloperEvents(e) { const file = e.target.files?.[0]; if (!file) return; file.text().then((text) => { const parsed = JSON.parse(text); if (!Array.isArray(parsed)) throw new Error("El JSON debe ser un array de eventos."); developerState.events = parsed; developerState.selectedId = parsed[0]?.id || null; renderDeveloperEditor("JSON importado en memoria. Exporta para conservarlo en el proyecto."); }).catch((error) => alert(`No se pudo importar: ${error.message}`)); e.target.value = ""; }
function loadDeveloperDraft() { const text = localStorage.getItem(DEV_EVENTS_DRAFT_KEY); if (!text) return renderDeveloperEditor("No hay borrador guardado."); developerState.events = JSON.parse(text); developerState.selectedId = developerState.events[0]?.id || null; renderDeveloperEditor("Borrador cargado en memoria."); }
function renderDeveloperValidation(message = "") { const box = document.getElementById("developerValidation"); if (!box) return; const results = validateDeveloperEvents(developerState.events); box.innerHTML = `${message ? `<p class="validation-info">${escapeHtml(message)}</p>` : ""}<strong>Validación: ${results.errors.length} errores · ${results.warnings.length} avisos</strong><ul>${results.errors.map((msg) => `<li class="validation-error">${escapeHtml(msg)}</li>`).join("")}${results.warnings.map((msg) => `<li class="validation-warning">${escapeHtml(msg)}</li>`).join("")}</ul>`; }
function validateDeveloperEvents(items) { const errors = [], warnings = [], ids = new Set(), duplicateIds = new Set(); const actorIds = new Set((actors || []).map((actor) => actor.id)); const familyIds = new Set((families || []).map((family) => family.id)); items.forEach((item) => { if (!item.id) return; if (ids.has(item.id)) duplicateIds.add(item.id); else ids.add(item.id); }); items.forEach((item, index) => { if (!item.id) errors.push(`#${index}: evento sin id.`); if (!item.title) errors.push(`${item.id || index}: evento sin title.`); if (!item.text) errors.push(`${item.id || index}: evento sin text.`); if (!Array.isArray(item.options) || !item.options.length) errors.push(`${item.id || index}: evento sin options.`); if (item.requiresTags && !Array.isArray(item.requiresTags)) errors.push(`${item.id}: requiresTags debe ser array.`); if (item.forbiddenTags && !Array.isArray(item.forbiddenTags)) errors.push(`${item.id}: forbiddenTags debe ser array.`); if (item.family && !familyIds.has(item.family)) warnings.push(`${item.id}: family '${item.family}' no existe en families.`); (item.options || []).forEach((option, optionIndex) => validateDeveloperOption(item, option, optionIndex, ids, actorIds, errors, warnings)); }); duplicateIds.forEach((id) => errors.push(`ID duplicado: ${id}.`)); return { errors, warnings }; }
function validateDeveloperOption(item, option, optionIndex, ids, actorIds, errors, warnings) { if (!option.label) errors.push(`${item.id}: opción ${optionIndex + 1} sin label.`); [option.immediate, option.effects, ...(option.outcomes || []).map((outcome) => outcome.immediate)].filter(Boolean).forEach((effects) => Object.keys(effects).forEach((key) => { if (!RESOURCE_KEYS.has(key)) errors.push(`${item.id}: recurso inválido '${key}'.`); })); (option.characters || []).forEach((character) => { if (character.id && !actorIds.has(character.id)) warnings.push(`${item.id}: actor '${character.id}' no existe.`); }); normalizeDeferList(option.defer).forEach((defer) => { if (defer.eventId && !ids.has(defer.eventId)) errors.push(`${item.id}: defer.eventId inexistente '${defer.eventId}'.`); (defer.branches || []).forEach((branch) => { if (branch.eventId && !ids.has(branch.eventId)) errors.push(`${item.id}: defer.branches.eventId inexistente '${branch.eventId}'.`); }); }); }
function normalizeDeferList(value) { if (!value) return []; return Array.isArray(value) ? value : [value]; }
function eventHasDefer(item) { return (item.options || []).some((option) => normalizeDeferList(option.defer).length); }
function csv(value) { return value.split(",").map((item) => item.trim()).filter(Boolean); }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }

bootDeveloperEditor();

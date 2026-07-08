class EventManager {
  constructor(catalog, options = {}) {
    this.random = options.random || Math.random;
    this.familyAliases = this.createFamilyAliases(options.families || []);
    this.actorsById = new Map((options.actors || []).map((actor) => [actor.id, this.normalizeActor(actor)]));
    this.familiesById = new Map((options.families || []).map((family) => [family.id, family]));
    this.catalog = catalog.map((item) => this.normalizeCatalogItem(item));
    this.eventsById = new Map(this.catalog.map((item) => [item.id, item]));
    this.recentRepeatDays = options.recentRepeatDays || 8;
  }


  createFamilyAliases(families = []) {
    const aliases = new Map();
    families.forEach((family) => {
      aliases.set(family.id, family.id);
      (family.legacyIds || []).forEach((legacyId) => aliases.set(legacyId, family.id));
    });
    return aliases;
  }

  normalizeFamily(family) {
    return family ? (this.familyAliases.get(family) || family) : family;
  }

  normalizeFamilyList(items = []) {
    return [...new Set((Array.isArray(items) ? items : []).map((family) => this.normalizeFamily(family)).filter(Boolean))];
  }

  normalizeActor(actor) {
    return actor ? { ...actor, family: this.normalizeFamily(actor.family) } : actor;
  }

  normalizeCatalogItem(item) {
    return {
      ...item,
      family: this.normalizeFamily(item.family),
      incompatibleFamilies: this.normalizeFamilyList(item.incompatibleFamilies)
    };
  }

  createInitialMemory() {
    return { tags: [], history: [], pendingEvents: [], characters: {}, issues: [], news: [] };
  }

  normalizeState(state) {
    state.tags = Array.isArray(state.tags) ? state.tags : [];
    state.history = Array.isArray(state.history) ? state.history : [];
    state.pendingEvents = Array.isArray(state.pendingEvents) ? state.pendingEvents : [];
    state.characters = state.characters && typeof state.characters === "object" ? state.characters : {};
    state.issues = Array.isArray(state.issues) ? state.issues.map((issue) => this.normalizeIssue(issue)).filter(Boolean) : [];
    state.news = Array.isArray(state.news) ? state.news.map((item) => this.normalizeNews(item)).filter(Boolean) : [];
    return state;
  }

  normalizeIssue(issue) {
    if (!issue || !issue.id) return null;
    return {
      id: issue.id,
      actorId: issue.actorId || "realm",
      type: issue.type || "generic",
      stage: Math.max(0, Number(issue.stage || 0)),
      tension: clamp(Number(issue.tension || 0)),
      trust: clamp(Number(issue.trust ?? 50)),
      tags: Array.isArray(issue.tags) ? issue.tags : [],
      daysActive: Math.max(0, Number(issue.daysActive || 0)),
      lastEventDay: Number(issue.lastEventDay || 0),
      reward: issue.reward || null,
      unresolvedProblem: issue.unresolvedProblem || null,
      trustProblem: issue.trustProblem || null
    };
  }

  normalizeNews(item) {
    if (!item || !item.id || !item.title) return null;
    const duration = Math.max(1, Number(item.duration || item.remainingDays || 1));
    return {
      id: String(item.id),
      title: item.title,
      text: item.text || item.description || "Noticia del reino.",
      type: item.type || "aftermath",
      source: item.source || "event",
      sourceId: item.sourceId || null,
      duration,
      remainingDays: Math.max(0, Number(item.remainingDays ?? duration)),
      daily: item.daily && typeof item.daily === "object" ? item.daily : {},
      every: item.every || null,
      cost: item.cost || null,
      families: this.normalizeFamilyList(item.families),
      stacking: item.stacking || "refresh"
    };
  }

  addNews(state, newsItems = [], source = "event", sourceId = null) {
    state.news = Array.isArray(state.news) ? state.news : [];
    newsItems.map((item) => this.normalizeNews({ source, sourceId, ...item })).filter(Boolean).forEach((news) => {
      const existingIndex = state.news.findIndex((item) => item.id === news.id);
      const stacking = news.stacking || "refresh";
      if (existingIndex >= 0 && stacking === "ignore") return;
      if (existingIndex >= 0 && stacking === "refresh") { state.news[existingIndex] = { ...state.news[existingIndex], ...news, remainingDays: news.duration }; return; }
      if (existingIndex >= 0 && stacking === "replace") { state.news[existingIndex] = news; return; }
      if (existingIndex >= 0 && stacking === "stack") news.id = `${news.id}-${state.day}-${state.news.length}-${Math.floor(this.random() * 100000)}`;
      state.news.push(news);
    });
  }

  tickIssues(state) {
    state.issues = (state.issues || []).map((issue) => ({ ...issue, daysActive: issue.daysActive + 1 }));
  }

  getAvailableEvents(state, limit = 2, excludeIds = []) {
    const excluded = new Set(excludeIds);
    const candidates = this.catalog.filter((item) => {
      if (item.kind === "consequence" || excluded.has(item.id)) return false;
      return this.isCompatible(item, state);
    });
    return this.weightedSample(candidates, limit, state).map((item) => this.materializeEvent(item, state));
  }

  dueEventsForDay(state, day) {
    const due = [];
    const waiting = [];
    state.pendingEvents.forEach((pending) => {
      if (pending.day <= day) due.push(pending);
      else waiting.push(pending);
    });
    state.pendingEvents = waiting;
    return due
      .map((pending) => this.resolvePendingEvent(pending, state))
      .filter(Boolean)
      .map((item) => this.materializeEvent(item, state));
  }

  resolvePendingEvent(pending, state) {
    const branch = pending.branches ? this.pickBranch(pending.branches) : null;
    const eventId = branch?.eventId || pending.eventId;
    const event = this.eventsById.get(eventId);
    if (!event || !this.isCompatible(event, state)) return null;
    return event;
  }

  applyChoice(state, eventItem, choice) {
    const resolution = this.resolveChoice(eventItem, choice);
    const result = resolution.result;
    const immediate = result.immediate || result.effects || {};
    this.applyEffects(state, immediate);
    this.addTags(state, result.addTags || []);
    this.addNews(state, result.addNews || [], eventItem.kind === "consequence" ? "consequence" : "event", eventItem.id);
    this.rememberCharacters(state, result.characters || []);
    this.applyIssueActions(state, result.issues || [], eventItem);
    this.scheduleDeferred(state, result.defer || [], eventItem.id);
    this.recordHistory(state, eventItem, choice, resolution, immediate);
  }

  resolveChoice(eventItem, choice) {
    if (!eventItem.probabilistic) return { success: true, result: choice, resultText: choice.resultText || null };
    const successChance = this.normalizeSuccessChance(choice.successChance);
    if (successChance >= 100 || this.random() * 100 < successChance) {
      return { success: true, successChance, result: choice, resultText: choice.resultText || null };
    }
    const failureResult = eventItem.failureResult || eventItem.failure || {};
    return {
      success: false,
      successChance,
      result: failureResult,
      resultText: failureResult.resultText || failureResult.text || "La opción fracasa y la corte sufre el resultado común de fallo."
    };
  }

  normalizeSuccessChance(value) {
    if (value === undefined || value === null || value === "") return 100;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 100;
    return Math.max(0, Math.min(100, numeric));
  }

  applyEffects(state, effects) {
    Object.entries(effects).forEach(([key, value]) => {
      if (state.resources[key] === undefined) return;
      state.resources[key] = clamp(state.resources[key] + value);
    });
  }

  applyIssueActions(state, actions, eventItem) {
    actions.forEach((action) => {
      if (action.action === "create") return this.createIssue(state, action.issue, eventItem);
      const issue = this.findIssue(state, action.issueId, action);
      if (!issue) return;
      if (action.action === "modify") this.modifyIssue(issue, action);
      if (action.action === "escalate") this.escalateIssue(issue, action);
      if (action.action === "resolve") this.resolveIssue(state, issue.id, action.addTags || [], action);
      if (action.touch !== false && action.action !== "resolve") issue.lastEventDay = state.day;
    });
  }

  createIssue(state, issueConfig = {}, eventItem) {
    const id = issueConfig.id || `${issueConfig.type || eventItem.family || "issue"}-${issueConfig.actorId || "realm"}`;
    if (state.issues.some((issue) => issue.id === id)) return;
    state.issues.push(this.normalizeIssue({
      id,
      actorId: issueConfig.actorId || "realm",
      type: issueConfig.type || eventItem.family || "generic",
      stage: issueConfig.stage || 0,
      tension: issueConfig.tension ?? 35,
      trust: issueConfig.trust ?? 50,
      tags: issueConfig.tags || eventItem.issueTags || [],
      reward: issueConfig.reward || null,
      unresolvedProblem: issueConfig.unresolvedProblem || null,
      trustProblem: issueConfig.trustProblem || null,
      daysActive: 0,
      lastEventDay: state.day
    }));
  }

  findIssue(state, issueId, action = {}) {
    if (issueId) return state.issues.find((issue) => issue.id === issueId);
    return state.issues.find((issue) => (!action.type || issue.type === action.type) && (!action.actorId || issue.actorId === action.actorId));
  }

  modifyIssue(issue, action) {
    issue.tension = clamp(issue.tension + (action.tension || 0));
    issue.trust = clamp(issue.trust + (action.trust || 0));
    if (Array.isArray(action.addTags)) issue.tags = [...new Set([...issue.tags, ...action.addTags])];
    if (Array.isArray(action.removeTags)) issue.tags = issue.tags.filter((tag) => !action.removeTags.includes(tag));
  }

  escalateIssue(issue, action) {
    this.modifyIssue(issue, action);
    issue.stage = Math.min(action.maxStage || 2, issue.stage + (action.stage || 1));
    issue.tension = clamp(issue.tension + (action.extraTension ?? 12));
  }

  resolveIssue(state, issueId, tags = [], action = {}) {
    const issue = state.issues.find((item) => item.id === issueId);
    const before = state.issues.length;
    state.issues = state.issues.filter((issue) => issue.id !== issueId);
    if (state.issues.length < before) state.completedObjectives = { ...(state.completedObjectives || {}), issuesResolved: (state.completedObjectives?.issuesResolved || 0) + 1 };
    this.addTags(state, tags);
    if (issue?.reward?.addTags) this.addTags(state, issue.reward.addTags);
    if (issue?.reward?.addNews) this.addNews(state, issue.reward.addNews, "crisis", issue.id);
    if (action.addNews) this.addNews(state, action.addNews, "crisis", issueId);
  }

  scheduleDeferred(state, deferredItems, sourceEventId) {
    deferredItems.forEach((item) => {
      state.pendingEvents.push({
        id: `${sourceEventId}-${state.day}-${state.pendingEvents.length}-${Math.floor(this.random() * 100000)}`,
        sourceEventId,
        day: state.day + item.delay,
        eventId: item.eventId,
        branches: item.branches || null
      });
    });
  }

  recordHistory(state, eventItem, choice, resolution = null, immediate = {}) {
    const resultText = resolution?.resultText || resolution?.result?.text || choice.resultText || "La corte toma nota de tu decisión.";
    const entry = {
      day: state.day,
      eventId: eventItem.id,
      eventTitle: eventItem.title,
      family: this.normalizeFamily(eventItem.family) || null,
      choice: choice.label,
      tags: resolution?.result?.addTags || [],
      resultText,
      success: resolution?.success ?? true,
      successChance: resolution?.successChance ?? null,
      effects: { ...immediate }
    };
    state.history.push(entry);
    state.lastResult = entry;
  }

  addTags(state, tags) {
    const known = new Set(state.tags);
    tags.forEach((tag) => known.add(tag));
    state.tags = [...known];
  }

  rememberCharacters(state, characters) {
    characters.forEach((character) => {
      const actor = this.actorsById.get(character.id) || {};
      const current = state.characters[character.id] || {};
      state.characters[character.id] = { ...actor, ...current, ...character, appearances: (current.appearances || 0) + 1 };
    });
  }

  isCompatible(eventItem, state) {
    if (!this.meetsRequirements(eventItem, state)) return false;
    if (eventItem.issue) return this.hasMatchingIssue(eventItem.issue, state);
    if (eventItem.incompatibleIssueTypes?.some((type) => state.issues.some((issue) => issue.type === type))) return false;
    return true;
  }

  meetsRequirements(eventItem, state) {
    const tags = new Set(state.tags || []);
    const required = eventItem.requiresTags || [];
    const forbidden = eventItem.forbiddenTags || [];
    const minDay = eventItem.minDay || 1;
    const maxDay = eventItem.maxDay || Infinity;
    return state.day >= minDay
      && state.day <= maxDay
      && required.every((tag) => tags.has(tag))
      && forbidden.every((tag) => !tags.has(tag))
      && this.meetsResourceConditions(eventItem.resourceConditions, state);
  }

  meetsResourceConditions(conditions, state) {
    if (!conditions || typeof conditions !== "object") return true;
    return Object.entries(conditions).every(([resource, rule]) => this.matchesResourceRule(resource, rule, state));
  }

  matchesResourceRule(resource, rule = {}, state) {
    const value = state.resources?.[resource];
    if (value === undefined) return false;
    if (rule.min !== undefined && value < rule.min) return false;
    if (rule.max !== undefined && value > rule.max) return false;
    return true;
  }

  hasMatchingIssue(rule, state) {
    return state.issues.some((issue) => {
      if (rule.id && issue.id !== rule.id) return false;
      if (rule.type && issue.type !== rule.type) return false;
      if (rule.actorId && issue.actorId !== rule.actorId) return false;
      if (rule.minStage !== undefined && issue.stage < rule.minStage) return false;
      if (rule.maxStage !== undefined && issue.stage > rule.maxStage) return false;
      if (rule.minTension !== undefined && issue.tension < rule.minTension) return false;
      if (rule.maxTension !== undefined && issue.tension > rule.maxTension) return false;
      if (rule.tags && !rule.tags.every((tag) => issue.tags.includes(tag))) return false;
      return true;
    });
  }

  materializeEvent(eventItem, state) {
    const context = { characters: state.characters || {} };
    return { ...eventItem, title: this.interpolate(eventItem.title, context), text: this.interpolate(eventItem.text, context), options: eventItem.options.map((option) => ({ ...option, label: this.interpolate(option.label, context) })) };
  }

  interpolate(text, context) {
    return String(text).replace(/\{character:([^}.]+)\.([^}]+)}/g, (_, id, field) => context.characters[id]?.[field] || "alguien conocido");
  }

  pickOutcome(outcomes) {
    if (!Array.isArray(outcomes) || !outcomes.length) return null;
    return this.pickBranch(outcomes);
  }

  pickBranch(branches) {
    const roll = this.random();
    let cursor = 0;
    for (const branch of branches) { cursor += branch.probability; if (roll <= cursor) return branch; }
    return branches[branches.length - 1];
  }

  weightedSample(items, limit, state) {
    const pool = [...items];
    const selected = [];
    while (pool.length && selected.length < limit) {
      const weights = pool.map((item) => this.weightFor(item, state));
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      if (total <= 0) break;
      let roll = this.random() * total;
      const index = weights.findIndex((weight) => { roll -= weight; return roll <= 0; });
      selected.push(pool.splice(index < 0 ? 0 : index, 1)[0]);
    }
    return selected;
  }

  weightFor(item, state) {
    const tags = new Set(state.tags || []);
    const affinity = (item.affinityTags || []).filter((tag) => tags.has(tag)).length;
    const issueBonus = this.issueWeightBonus(item, state);
    const crisisBonus = this.crisisWeightBonus(item, state);
    const recencyPenalty = this.recentPenalty(item, state);
    const resourceMultiplier = this.resourceWeightMultiplier(item.resourceWeights, state);
    return Math.max(0.05, ((item.weight || 1) + affinity * 2 + issueBonus + crisisBonus) * resourceMultiplier * recencyPenalty);
  }

  resourceWeightMultiplier(resourceWeights, state) {
    if (!Array.isArray(resourceWeights)) return 1;
    return resourceWeights.reduce((multiplier, rule) => {
      if (!rule || !rule.resource || rule.multiplier === undefined) return multiplier;
      if (!this.matchesResourceRule(rule.resource, rule, state)) return multiplier;
      const ruleMultiplier = Number(rule.multiplier);
      if (!Number.isFinite(ruleMultiplier)) return multiplier;
      return multiplier * Math.max(0, ruleMultiplier);
    }, 1);
  }

  crisisWeightBonus(item, state) {
    const seasonal = (state.news || []).filter((news) => news.type === "seasonal" && news.families?.length && news.remainingDays > 0);
    if (!seasonal.length) return 0;
    const eventFamily = this.normalizeFamily(item.family);
    if (!eventFamily) return 0;
    return seasonal.reduce((sum, news) => sum + (this.normalizeFamilyList(news.families).includes(eventFamily) ? (news.weightBonus || 2.5) : 0), 0);
  }

  issueWeightBonus(item, state) {
    if (!state.issues?.length) return 0;
    const familyBonus = state.issues.filter((issue) => this.normalizeFamily(item.family) === this.normalizeFamily(issue.type)).length * 2;
    const directBonus = item.issue && this.hasMatchingIssue(item.issue, state) ? 5 : 0;
    return familyBonus + directBonus;
  }

  recentPenalty(item, state) {
    const itemFamily = this.normalizeFamily(item.family);
    const recent = [...(state.history || [])].reverse().find((entry) => entry.eventId === item.id || (itemFamily && this.normalizeFamily(entry.family) === itemFamily));
    if (!recent) return 1;
    const age = state.day - recent.day;
    if (age <= 2) return 0.2;
    if (age <= this.recentRepeatDays) return 0.5;
    return 1;
  }
}

class EventManager {
  constructor(catalog, options = {}) {
    this.catalog = catalog;
    this.eventsById = new Map(catalog.map((item) => [item.id, item]));
    this.random = options.random || Math.random;
    this.actorsById = new Map((options.actors || []).map((actor) => [actor.id, actor]));
    this.familiesById = new Map((options.families || []).map((family) => [family.id, family]));
    this.recentRepeatDays = options.recentRepeatDays || 8;
  }

  createInitialMemory() {
    return { tags: [], history: [], pendingEvents: [], characters: {}, issues: [] };
  }

  normalizeState(state) {
    state.tags = Array.isArray(state.tags) ? state.tags : [];
    state.history = Array.isArray(state.history) ? state.history : [];
    state.pendingEvents = Array.isArray(state.pendingEvents) ? state.pendingEvents : [];
    state.characters = state.characters && typeof state.characters === "object" ? state.characters : {};
    state.issues = Array.isArray(state.issues) ? state.issues.map((issue) => this.normalizeIssue(issue)).filter(Boolean) : [];
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
      lastEventDay: Number(issue.lastEventDay || 0)
    };
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
    const outcome = this.pickOutcome(choice.outcomes || []);
    const immediate = outcome ? (outcome.immediate || outcome.effects || {}) : (choice.immediate || choice.effects || {});
    this.applyEffects(state, immediate);
    this.addTags(state, choice.addTags || []);
    this.rememberCharacters(state, choice.characters || []);
    this.applyIssueActions(state, choice.issues || [], eventItem);
    this.scheduleDeferred(state, choice.defer || [], eventItem.id);
    this.recordHistory(state, eventItem, choice, outcome, immediate);
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
      if (action.action === "resolve") this.resolveIssue(state, issue.id, action.addTags || []);
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

  resolveIssue(state, issueId, tags = []) {
    const before = state.issues.length;
    state.issues = state.issues.filter((issue) => issue.id !== issueId);
    if (state.issues.length < before) state.completedObjectives = { ...(state.completedObjectives || {}), issuesResolved: (state.completedObjectives?.issuesResolved || 0) + 1 };
    this.addTags(state, tags);
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

  recordHistory(state, eventItem, choice, outcome = null, immediate = {}) {
    const resultText = outcome?.text || choice.resultText || "La corte toma nota de tu decisión.";
    const entry = {
      day: state.day,
      eventId: eventItem.id,
      eventTitle: eventItem.title,
      family: eventItem.family || null,
      choice: choice.label,
      tags: choice.addTags || [],
      resultText,
      outcomeText: outcome?.text || null,
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
    return state.day >= minDay && state.day <= maxDay && required.every((tag) => tags.has(tag)) && forbidden.every((tag) => !tags.has(tag));
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
    return Math.max(0.05, ((item.weight || 1) + affinity * 2 + issueBonus + crisisBonus) * recencyPenalty);
  }

  crisisWeightBonus(item, state) {
    const crisis = state.activeCrisis;
    if (!crisis?.families?.length || (crisis.remainingDays || 0) <= 0) return 0;
    const eventFamilies = new Set([item.family, ...(item.families || [])].filter(Boolean));
    return crisis.families.filter((family) => eventFamilies.has(family)).length * (crisis.weightBonus || 2.5);
  }

  issueWeightBonus(item, state) {
    if (!state.issues?.length) return 0;
    const familyBonus = state.issues.filter((issue) => item.families?.includes(issue.type) || item.family === issue.type).length * 2;
    const directBonus = item.issue && this.hasMatchingIssue(item.issue, state) ? 5 : 0;
    return familyBonus + directBonus;
  }

  recentPenalty(item, state) {
    const recent = [...(state.history || [])].reverse().find((entry) => entry.eventId === item.id || (item.family && entry.family === item.family));
    if (!recent) return 1;
    const age = state.day - recent.day;
    if (age <= 2) return 0.2;
    if (age <= this.recentRepeatDays) return 0.5;
    return 1;
  }
}

function event(id, title, text, options, extra = {}) {
  return { id, title, text, options: options.map(normalizeOption), ...extra };
}

function normalizeOption(option) {
  const [label, effectsOrConfig, config = {}] = option;
  if (effectsOrConfig && (effectsOrConfig.immediate || effectsOrConfig.effects || effectsOrConfig.outcomes || effectsOrConfig.defer || effectsOrConfig.addTags || effectsOrConfig.characters || effectsOrConfig.issues)) {
    return { label, immediate: {}, ...effectsOrConfig };
  }
  return { label, immediate: effectsOrConfig || {}, ...config };
}

const events = [];

function registerEvents(items) {
  events.push(...items);
}

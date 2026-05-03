// Lazy plugin loader. The `no-custom-color` rule used to require the
// shared Tailwind config at module load, which now lives as a TS file
// and breaks plain `require`. Lazy-loading isolates each rule so a
// broken rule does not bring down the whole plugin.
const lazy = (loader) => {
  let cached;
  return (...args) => {
    if (!cached) {
      cached = loader();
    }
    return cached.create ? cached.create(...args) : cached;
  };
};

const wrapAsRule = (loader) => ({
  create: lazy(loader),
  meta: undefined,
  get _meta() {
    if (!this.__resolved) {
      this.__resolved = loader();
    }
    return this.__resolved.meta;
  },
});

module.exports.rules = {
  'no-custom-color': {
    create(...args) {
      const rule = require('./rules/no-custom-color');
      return rule.create(...args);
    },
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow non-design-system color tokens.',
        recommended: false,
      },
      schema: [],
    },
  },
  'no-raw-button-class': require('./rules/no-raw-button-class'),
};

// expose lazy helpers for tests / consumers if they want them
module.exports._lazy = lazy;
module.exports._wrapAsRule = wrapAsRule;

/* eslint-disable @typescript-eslint/no-var-requires */
// Wraps @swc/jest so tests can keep calling `jest.spyOn(module, 'export')`.
//
// SWC's CommonJS output defines every export as a getter with
// `Object.defineProperty` and no `configurable` flag, so the property can't be
// redefined and spyOn throws "Cannot redefine property". babel-jest assigned
// plain properties instead. Marking SWC's export getters configurable lets
// jest-mock swap the getter for the mock and restore it afterwards. The flag
// is added on the same line so inline source maps stay accurate.
const { createHash } = require('crypto');
const { readFileSync } = require('fs');
const { createTransformer } = require('@swc/jest');

// Part of the cache key, so editing this file invalidates cached transforms.
const ownSource = readFileSync(__filename, 'utf8');

// Matches the single-export form `defineProperty(exports, "x", {` and the
// `_export` / `_export_star` helpers' `defineProperty(target, name, {`.
const EXPORT_GETTER =
  /(defineProperty\((?:exports, "[^"]+"|target, name|to, k), \{\s*enumerable: true,)/g;

const makeConfigurable = (result) => {
  const code = typeof result === 'string' ? result : result.code;
  const patched = code.replace(EXPORT_GETTER, '$1 configurable: true,');

  return typeof result === 'string' ? patched : { ...result, code: patched };
};

module.exports = {
  createTransformer(options) {
    const transformer = createTransformer(options);

    return {
      ...transformer,
      getCacheKey: (...args) =>
        createHash('sha1')
          .update(transformer.getCacheKey(...args))
          .update(ownSource)
          .digest('hex'),
      process: (...args) => makeConfigurable(transformer.process(...args)),
      processAsync: async (...args) =>
        makeConfigurable(await transformer.processAsync(...args)),
    };
  },
};

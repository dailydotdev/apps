export /**
 * Dummy polyfill using JSON methods to deep clone object
 *
 * Since we target modern browsers nad with support of structuredClone being high
 * this just makes us by so that the app does not break.
 *
 * We also use structuredClone mostly for data objects (dto's) so this kind of polyfill works
 * for those kind of objects
 *
 * @return {*}  {void}
 */
const structuredCloneJsonPolyfill = (): void => {
  if (typeof globalThis.structuredClone === 'function') {
    return;
  }

  globalThis.structuredClone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value));
  };
};

// Jest transform shared by the shared, webapp and extension packages.
//
// SWC compiles TS/JSX to CommonJS several times faster than babel-jest, and
// @swc/jest hoists `jest.mock` calls above imports the way babel-jest does.
// See jest.swcTransformer.js for the one change made to SWC's output.
const transformer = require.resolve('./jest.swcTransformer');

const options = (parser) => [
  transformer,
  {
    jsc: {
      parser,
      transform: { react: { runtime: 'automatic' } },
      target: 'es2022',
    },
    module: { type: 'commonjs' },
    sourceMaps: 'inline',
  },
];

module.exports = {
  '^.+\\.(ts|tsx)$': options({ syntax: 'typescript', tsx: true }),
  '^.+\\.(js|jsx|mjs|cjs)$': options({ syntax: 'ecmascript', jsx: true }),
};

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const sharedPackage = require('../shared/package.json');

module.exports = {
  presets: ['next/babel'],
  plugins: [
    'macros',
    '@emotion',
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['.'],
        alias: {
          // Required to remove duplicate dependencies from the build
          ...Object.keys(sharedPackage.peerDependencies).reduce((acc, dep) => {
            if (['react', 'react-dom'].find((name) => name === dep)) {
              return {
                ...acc,
                [dep]: path.resolve('./node_modules/preact/compat'),
              };
            }
            return { ...acc, [dep]: path.resolve(`./node_modules/${dep}`) };
          }, {}),
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: [
        [
          'react-remove-properties',
          {
            properties: ['data-testid'],
          },
        ],
      ],
    },
    test: {
      plugins: ['dynamic-import-node'],
    },
  },
};

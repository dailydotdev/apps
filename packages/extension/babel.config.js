/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const sharedPackage = require('../shared/package.json');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: false,
        // Do not transform modules to CJS
        modules: false,
        targets: {
          chrome: '49',
          firefox: '52',
          opera: '36',
          edge: '79',
        },
      },
    ],
    '@babel/typescript',
    '@babel/react',
  ],
  plugins: [
    [
      // Polyfills the runtime needed for async/await and generators
      '@babel/plugin-transform-runtime',
      {
        helpers: false,
        regenerator: true,
      },
    ],
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
      presets: ['@babel/preset-env', '@babel/typescript', '@babel/react'],
    },
  },
};

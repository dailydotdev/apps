/* eslint-disable @typescript-eslint/no-var-requires */

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

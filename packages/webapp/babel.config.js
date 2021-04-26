module.exports = {
  presets: ['next/babel'],
  plugins: ['macros', '@emotion'],
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

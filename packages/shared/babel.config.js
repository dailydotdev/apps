module.exports = {
  presets: ['next/babel'],
  plugins: ['macros', '@emotion'],
  env: {
    test: {
      plugins: ['dynamic-import-node'],
    },
  },
};

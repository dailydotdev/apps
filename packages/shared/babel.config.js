module.exports = {
  presets: ['next/babel'],
  plugins: ['macros'],
  env: {
    test: {
      plugins: ['dynamic-import-node'],
    },
  },
};

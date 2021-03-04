module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    'postcss-focus-visible': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false,
        'nesting-rules': true,
      },
    },
  },
};

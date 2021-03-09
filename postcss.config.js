module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-simple-vars': {
      variables: {
        pageMaxWidth: '40rem',
        headerHeight: '3rem',
        navBarHeight: '3.063rem',
      },
    },
    tailwindcss: {},
    'postcss-focus-visible': {},
    'postcss-preset-env': {
      stage: 1,
      features: {
        'custom-properties': false,
        'nesting-rules': true,
        'custom-media-queries': true,
      },
    },
  },
};

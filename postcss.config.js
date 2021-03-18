module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-simple-vars': {
      variables: {
        pageMaxWidth: '40rem',
        headerHeight: '3rem',
        navBarHeight: '3rem',
      },
    },
    [process.env.NODE_ENV === 'production'
      ? 'tailwindcss'
      : '@tailwindcss/jit']: {},
    'postcss-focus-visible': {},
    autoprefixer: {},
    'postcss-nesting': {},
    'postcss-custom-media': {},
  },
};

module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-simple-vars': {
      variables: {
        pageMaxWidth: '40rem',
        headerHeight: '3rem',
        headerRankHeight: '4.5rem',
        navBarHeight: '3rem',
        promotionWidth: '9rem',
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

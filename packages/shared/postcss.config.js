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
        shareBarWidth: '1.75rem',
      },
    },
    'tailwindcss/nesting': {},
    tailwindcss: {},
    'postcss-focus-visible': {},
    autoprefixer: {},
    'postcss-custom-media': {},
    'postcss-mixins': {},
  },
};

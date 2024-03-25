module.exports = ({ env }) => ({
  plugins: [
    require('postcss-import')(),
    require('postcss-simple-vars')({
      variables: {
        pageMaxWidth: '42.5rem',
        headerHeight: '3rem',
        headerRankHeight: '4.5rem',
        navBarHeight: '3rem',
        promotionWidth: '9rem',
        shareBarWidth: '1.75rem',
      },
    }),
    require('tailwindcss/nesting')(),
    require('postcss-focus-visible')(),
    require('postcss-custom-media')(),
    require('postcss-mixins')(),
    require('postcss-100vh-fix')(),
    require('tailwindcss')(),
    require('autoprefixer')(),
  ],
});

/* eslint-disable global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

module.exports = {
  plugins: [
    'postcss-import',
    [
      'postcss-simple-vars',
      {
        variables: {
          pageMaxWidth: '42.5rem',
          headerHeight: '3rem',
          headerRankHeight: '4.5rem',
          navBarHeight: '3rem',
          promotionWidth: '9rem',
          shareBarWidth: '1.75rem',
        },
      },
    ],
    process.env.TARGET_BROWSER
      ? require('tailwindcss/nesting')(require('postcss-nesting'))
      : 'tailwindcss/nesting',
    'tailwindcss',
    'postcss-focus-visible',
    'postcss-custom-media',
    'postcss-mixins',
    'postcss-100vh-fix',
    process.env.TARGET_BROWSER
      ? require('postcss-rem-to-responsive-pixel')({
          rootValue: 16,
          propList: ['*'],
        })
      : ['postcss-rem-to-responsive-pixel', { rootValue: 16, propList: ['*'] }],
    'autoprefixer',
  ],
};

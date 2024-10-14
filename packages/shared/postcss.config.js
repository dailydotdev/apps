/* eslint-disable global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

const cssnano = [
  'cssnano',
  {
    preset: 'advanced',
    discardComments: { removeAll: true },
  },
];

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
    ...(process.env.NODE_ENV === 'production' ? [cssnano] : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          '@fullhuman/postcss-purgecss',
          {
            content: [
              './pages/**/*.{js,jsx,ts,tsx}',
              './components/**/*.{js,jsx,ts,tsx}',
            ],
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: ['html', 'body'],
          },
        ]
      : []),
  ],
};

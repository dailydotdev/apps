/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('@dailydotdev/shared/tailwind.config');

module.exports = {
  ...config,
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern: /^(.*?)/,
    },
  ]
};

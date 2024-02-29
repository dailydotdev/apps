/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('packages/shared/tailwind.config');

module.exports = {
  ...config,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
};

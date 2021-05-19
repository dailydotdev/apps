/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('@dailydotdev/shared/tailwind.config.js');

module.exports = {
  ...config,
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
};

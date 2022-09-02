/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('@dailydotdev/shared/tailwind.config');
const fs = require('fs');
const path = require('path');

module.exports = {
  ...config,
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    path.join(
      fs.realpathSync('./node_modules/@dailydotdev/shared/src'),
      '**/*.{js,ts,jsx,tsx}',
    ),
  ],
};

/* eslint-disable @typescript-eslint/no-var-requires */

const colors = require('./tailwind/colors');
const overlay = require('./tailwind/overlay');
const boxShadow = require('./tailwind/boxShadow');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      ...colors,
      overlay,
    },
    boxShadow,
    fontFamily: {
      sans: [
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Roboto',
        'Helvetica',
        'Ubuntu',
        'Segoe UI',
        'Arial',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
      ],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('./tailwind/typography'), require('./tailwind/buttons')],
};

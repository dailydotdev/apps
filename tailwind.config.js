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
    screens: {
      mobileL: '420px',
      tablet: '656px',
      laptop: '1020px',
      laptopL: '1360px',
      laptopXL: '1668px',
      desktop: '1976px',
      desktopL: '2156px',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('./tailwind/typography'), require('./tailwind/buttons')],
};

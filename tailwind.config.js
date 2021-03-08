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
      theme: {
        active: 'var(--theme-active)',
        focus: 'var(--theme-focus)',
        float: 'var(--theme-float)',
        hover: 'var(--theme-hover)',
        bg: {
          primary: 'var(--theme-background-primary)',
          secondary: 'var(--theme-background-secondary)',
          tertiary: 'var(--theme-background-tertiary)',
        },
        label: {
          primary: 'var(--theme-label-primary)',
          secondary: 'var(--theme-label-secondary)',
          tertiary: 'var(--theme-label-tertiary)',
          quaternary: 'var(--theme-label-quaternary)',
          disabled: 'var(--theme-label-disabled)',
          link: 'var(--theme-label-link)',
          invert: 'var(--theme-label-invert)',
        },
        divider: {
          primary: 'var(--theme-divider-primary)',
          secondary: 'var(--theme-divider-secondary)',
          tertiary: 'var(--theme-divider-tertiary)',
          quaternary: 'var(--theme-divider-quaternary)',
        },
        status: {
          error: 'var(--theme-status-error)',
          help: 'var(--theme-status-help)',
          success: 'var(--theme-status-success)',
        },
        'post-disabled': 'var(--theme-post-disabled)',
      },
    },
    boxShadow,
    opacity: {
      0: '0',
      40: '0.4',
      50: '0.5',
      64: '0.64',
      100: '1',
    },
    zIndex: {
      0: '0',
      1: '1',
      '-1': '-1',
    },
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

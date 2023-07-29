/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('./tailwind/colors');
const overlay = require('./tailwind/overlay');
const boxShadow = require('./tailwind/boxShadow');
const caret = require('./tailwind/caret');
const typography = require('./tailwind/typography');
const buttons = require('./tailwind/buttons');

module.exports = {
  theme: {
    colors: {
      ...colors,
      overlay,
      theme: {
        active: 'var(--theme-active)',
        focus: 'var(--theme-focus)',
        float: 'var(--theme-float)',
        hover: 'var(--theme-hover)',
        rank: 'var(--rank-color)',
        bg: {
          inherit: 'inherit',
          transparent: 'transparent',
          whatsapp: '#30B944',
          twitter: '#1D9BF0',
          facebook: '#4363B6',
          reddit: '#FF4500',
          linkedin: '#0077B5',
          telegram: '#24A2E0',
          email: 'var(--theme-color-email)',
          primary: 'var(--theme-background-primary)',
          reverse: 'var(--theme-background-reverse)',
          secondary: 'var(--theme-background-secondary)',
          tertiary: 'var(--theme-background-tertiary)',
          notification: 'var(--theme-background-notification)',
          'cabbage-blur': 'var(--theme-background-cabbage-blur)',
          bun: 'var(--theme-background-bun)',
          onion: 'var(--theme-background-onion)',
          pepper: 'var(--theme-background-pepper)',
          pepper40: 'var(--theme-background-pepper-40)',
          mention: {
            primary: 'var(--theme-mention)',
            hover: 'var(--theme-mention-hover)',
          },
          'cabbage-opacity-24': 'var(--theme-background-cabbage-opacity-24)',
          'overlay-cabbage-opacity': 'var(--theme-overlay-cabbage-opacity)',
          'overlay-onion-opacity': 'var(--theme-overlay-onion-opacity)',
        },
        label: {
          primary: 'var(--theme-label-primary)',
          secondary: 'var(--theme-label-secondary)',
          tertiary: 'var(--theme-label-tertiary)',
          quaternary: 'var(--theme-label-quaternary)',
          disabled: 'var(--theme-label-disabled)',
          link: 'var(--theme-label-link)',
          invert: 'var(--theme-label-invert)',
          bacon: 'var(--theme-label-bacon)',
        },
        divider: {
          primary: 'var(--theme-divider-primary)',
          secondary: 'var(--theme-divider-secondary)',
          tertiary: 'var(--theme-divider-tertiary)',
          quaternary: 'var(--theme-divider-quaternary)',
        },
        overlay: {
          quaternary: 'var(--theme-overlay-quaternary)',
          water: 'var(--theme-overlay-water)',
          cabbage: 'var(--theme-overlay-cabbage)',
          from: 'var(--theme-overlay-from)',
          to: 'var(--theme-overlay-to)',
          float: {
            cabbage: 'var(--theme-overlay-float-cabbage)',
            avocado: 'var(--theme-overlay-float-avocado)',
            ketchup: 'var(--theme-overlay-float-ketchup)',
          },
        },
        gradient: {
          cabbage: 'var(--theme-gradient-cabbage)',
          onion: 'var(--theme-gradient-onion)',
        },
        status: {
          error: 'var(--theme-status-error)',
          help: 'var(--theme-status-help)',
          fill: 'var(--theme-status-fill)',
          success: 'var(--theme-status-success)',
          warning: 'var(--theme-status-warning)',
          cabbage: 'var(--theme-status-cabbage)',
          invert: { cabbage: 'var(--theme-status-cabbage-invert)' },
        },
        color: {
          burger: 'var(--theme-color-burger)',
          blueCheese: 'var(--theme-color-blueCheese)',
          avocado: 'var(--theme-color-avocado)',
          lettuce: 'var(--theme-color-lettuce)',
          cheese: 'var(--theme-color-cheese)',
          bun: 'var(--theme-color-bun)',
          ketchup: 'var(--theme-color-ketchup)',
          bacon: 'var(--theme-color-bacon)',
          cabbage: 'var(--theme-color-cabbage)',
          onion: 'var(--theme-color-onion)',
          water: 'var(--theme-color-water)',
          salt: 'var(--theme-color-salt)',
        },
        'post-disabled': 'var(--theme-post-disabled)',
        highlight: {
          comment: 'var(--theme-highlight-comment)',
          red: 'var(--theme-highlight-red)',
          orange: 'var(--theme-highlight-orange)',
          yellow: 'var(--theme-highlight-yellow)',
          green: 'var(--theme-highlight-green)',
          aqua: 'var(--theme-highlight-aqua)',
          blue: 'var(--theme-highlight-blue)',
          purple: 'var(--theme-highlight-purple)',
          label: 'var(--theme-highlight-label)',
        },
        squads: {
          avocado: 'var(--theme-squads-avocado)',
          bacon: 'var(--theme-squads-bacon)',
          cabbage: 'var(--theme-squads-cabbage)',
          onion: 'var(--theme-squads-onion)',
          pepper: 'var(--theme-squads-pepper)',
        },
      },
      white: '#ffffff',
      transparent: 'transparent',
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
      2: '2',
      3: '3',
      rank: '3',
      modal: '10',
      max: '100',
      '-1': '-1',
    },
    maxHeight: {
      'img-desktop': '400px',
      'img-mobile': '280px',
      'rank-modal': 'calc(100vh - 5rem)',
      page: 'calc(100vh - 3.5rem)',
      commentBox: '18.25rem',
    },
    minHeight: {
      page: 'calc(100vh - 3.5rem)',
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
      mouse: { raw: '(pointer: fine)' },
      responsiveModalBreakpoint: '420px',
    },
    extend: {
      gap: {
        unset: 'unset',
      },
      borderRadius: {
        2: '0.125rem',
        3: '0.1875rem',
        6: '0.375rem',
        8: '0.5rem',
        10: '0.625rem',
        12: '0.75rem',
        14: '0.875rem',
        16: '1rem',
        24: '1.5rem',
        26: '1.625rem',
      },
      opacity: {
        24: '0.24',
        32: '0.32',
      },
      inset: {
        'screen-20': '20vh',
        'screen-40': '40vh',
        'screen-60': '60vh',
        'screen-80': '80vh',
        screen: '100vh',
      },
      spacing: {
        22: '5.5rem',
        70: '17.5rem',
      },
      width: {
        70: '17.5rem',
      },
      height: {
        logo: '1.125rem',
        'logo-big': '2.0625rem',
      },
    },
    lineClamp: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
    },
  },
  // eslint-disable-next-line global-require
  plugins: [caret, typography, buttons, require('@tailwindcss/line-clamp')],
  corePlugins: {
    invert: false,
  },
};

import type { Config } from 'tailwindcss';
import colors from './tailwind/colors';
import boxShadow from './tailwind/boxShadow';
import caret from './tailwind/caret';
import typography from './tailwind/typography';
import buttons from './tailwind/buttons';
import background from './tailwind/colors/background';
import accent from './tailwind/colors/accent';
import brand from './tailwind/colors/brand';
import surface from './tailwind/colors/surface';
import action from './tailwind/colors/action';
import overlayColors from './tailwind/colors/overlay';
import border from './tailwind/colors/border';
import status from './tailwind/colors/status';
import text from './tailwind/colors/text';
import blur from './tailwind/colors/blur';
import shadow from './tailwind/colors/shadow';
import overlay from './tailwind/overlay';

export default {
  content: [],
  theme: {
    colors: {
      raw: {
        /* Raw colors should not be used directly for styling */
        ...colors,
      },
      accent,
      background,
      blur,
      brand,
      surface,
      action,
      overlay: {
        // Temporary fix to allow the old overlay colors to work
        ...overlay,
        ...overlayColors,
      },
      border,
      status,
      text,
      shadow,
      black: '#000000',
      white: '#ffffff',
      transparent: 'transparent',
      inherit: 'inherit',
      // Old stuff
      theme: {
        active: 'var(--theme-active)',
        rank: 'var(--rank-color)',
        overlay: {
          quaternary: 'var(--theme-overlay-quaternary)',
          water: 'var(--theme-overlay-water)',
          cabbage: 'var(--theme-overlay-cabbage)',
          from: 'var(--theme-overlay-from)',
          to: 'var(--theme-overlay-to)',
          float: {
            bun: 'var(--theme-overlay-float-bun)',
            blueCheese: 'var(--theme-overlay-float-blueCheese)',
            cabbage: 'var(--theme-overlay-float-cabbage)',
            avocado: 'var(--theme-overlay-float-avocado)',
            ketchup: 'var(--theme-overlay-float-ketchup)',
          },
          active: {
            cabbage: 'var(--theme-overlay-active-cabbage)',
            onion: 'var(--theme-overlay-active-onion)',
          },
        },
        gradient: {
          cabbage: 'var(--theme-gradient-cabbage)',
          onion: 'var(--theme-gradient-onion)',
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
      },
    },
    boxShadow,
    opacity: {
      0: '0',
      16: '0.16',
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
      rank: '30',
      header: '75',
      postNavigation: '76',
      sidebar: '70',
      sidebarOverlay: '77',
      tooltip: '80',
      popup: '90',
      modal: '100',
      max: '1000',
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
      mobileXL: '500px',
      mobileXXL: '550px',
      tablet: '656px',
      laptop: '1020px',
      laptopL: '1360px',
      laptopXL: '1668px',
      desktop: '1976px',
      desktopL: '2156px',
      mouse: { raw: '(pointer: fine)' },
      responsiveModalBreakpoint: '420px',
    },
    borderRadius: {
      none: '0',
      full: '100%',
      '1/2': '50%',
      2: '0.125rem',
      3: '0.1875rem',
      4: '0.25rem',
      6: '0.375rem',
      8: '0.5rem',
      10: '0.625rem',
      12: '0.75rem',
      14: '0.875rem',
      16: '1rem',
      18: '1.125rem',
      22: '1.375rem',
      24: '1.5rem',
      26: '1.625rem',
      32: '2rem',
      40: '2.5rem',
      48: '3rem',
      50: '3.125rem',
    },
    extend: {
      maxHeight: {
        'img-desktop': '400px',
        'img-mobile': '280px',
        'rank-modal': 'calc(100vh - 5rem)',
        page: 'calc(100vh - 4rem)',
        commentBox: '18.25rem',
        card: '24rem',
        cardLarge: '27rem',
      },
      minHeight: {
        page: 'calc(100vh - 4rem)',
        card: '24rem',
      },
      gap: {
        unset: 'unset',
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
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        70: '17.5rem',
      },
      maxWidth: {
        widget: '19.25rem',
      },
      width: {
        70: '17.5rem',
      },
      height: {
        logo: '1.125rem',
        'logo-big': '2.0625rem',
        50: '12.5rem',
      },
      blur: {
        20: '1.25rem',
      },
      keyframes: {
        'scale-down-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.7)', opacity: '0.5' },
        },
      },
      animation: {
        'scale-down-pulse':
          'scale-down-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
  plugins: [caret, typography, buttons],
  corePlugins: {
    invert: false,
  },
  // eslint-disable-next-line
} satisfies Config;

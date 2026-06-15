// eslint-disable-next-line import/no-extraneous-dependencies
import { type Config } from 'tailwindcss';
// eslint-disable-next-line import/no-extraneous-dependencies
import safeArea from 'tailwindcss-safe-area';
// eslint-disable-next-line import/no-extraneous-dependencies
import containerQueries from '@tailwindcss/container-queries';
import colors from './tailwind/colors';
import boxShadow from './tailwind/boxShadow';
import caret from './tailwind/caret';
import typography from './tailwind/typography';
import buttons from './tailwind/buttons';
import buttonsV2 from './tailwind/buttons-v2';
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
        'Helvetica Neue',
        'Helvetica',
        'Inter',
        'Arial',
        'Segoe UI',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif',
      ],
      serif: [
        'Source Serif Pro',
        'Georgia',
        'Cambria',
        'apple-system-ui-serif',
        'ui-serif',
        'Times New Roman',
        'Times',
        'serif',
      ],
      mono: [
        'Fira Code',
        'SF Mono',
        'Consolas',
        'Menlo',
        'Courier New',
        'monospace',
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
      max: '9999px',
      '1/2': '50%',
      2: '0.125rem',
      3: '0.1875rem',
      4: '0.25rem',
      6: '0.375rem',
      8: '0.5rem',
      10: '0.625rem',
      11: '0.6875rem',
      12: '0.75rem',
      14: '0.875rem',
      16: '1rem',
      18: '1.125rem',
      20: '1.25rem',
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
        76: '18.75rem',
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
        'fade-slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'highlight-fade': {
          '0%': {
            boxShadow: '0 0 0 3px var(--status-warning)',
            backgroundColor:
              'color-mix(in srgb, var(--status-warning) 15%, transparent)',
          },
          '100%': {
            boxShadow: '0 0 0 0px transparent',
            backgroundColor: 'transparent',
          },
        },
        'reaction-burst': {
          '0%': {
            transform: 'translate(0, 0) scale(0.4)',
            opacity: '0',
          },
          '15%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translate(var(--burst-tx), var(--burst-ty)) scale(1)',
            opacity: '0',
          },
        },
        'raise-hand-pop': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'raise-hand-wave': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-18deg)' },
          '40%': { transform: 'rotate(14deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '80%': { transform: 'rotate(6deg)' },
        },
        'queue-attention': {
          '0%': { boxShadow: '0 0 0 0 var(--status-warning)' },
          '70%': { boxShadow: '0 0 0 8px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
        'queue-attention-wave': {
          '0%, 60%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-18deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '45%': { transform: 'rotate(-8deg)' },
        },
        'nudge-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-4px) rotate(-3deg)' },
          '30%': { transform: 'translateX(4px) rotate(3deg)' },
          '45%': { transform: 'translateX(-3px) rotate(-2deg)' },
          '60%': { transform: 'translateX(3px) rotate(2deg)' },
          '75%': { transform: 'translateX(-2px) rotate(-1deg)' },
        },
        'meter-shine': {
          '0%': { transform: 'translateX(-120%)' },
          '60%, 100%': { transform: 'translateX(320%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.08)' },
        },
        'reward-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '55%': { transform: 'scale(1.18)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'mascot-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'streak-fade': {
          '0%, 100%': { opacity: '0.24' },
          '50%': { opacity: '0.08' },
        },
      },
      animation: {
        'scale-down-pulse':
          'scale-down-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-slide-up': 'fade-slide-up 0.5s ease-out 1s both',
        'composer-in': 'fade-slide-up 0.2s ease-out both',
        'highlight-fade': 'highlight-fade 2.5s ease-out forwards',
        'reaction-burst':
          'reaction-burst 720ms cubic-bezier(0.2, 0.7, 0.4, 1) forwards',
        'raise-hand-pop':
          'raise-hand-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'raise-hand-wave': 'raise-hand-wave 700ms ease-in-out 240ms both',
        'queue-attention':
          'queue-attention 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'queue-attention-wave':
          'queue-attention-wave 1.6s ease-in-out infinite',
        'nudge-shake': 'nudge-shake 600ms ease-in-out',
        'meter-shine': 'meter-shine 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'reward-pop': 'reward-pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'streak-fade': 'streak-fade 2.6s ease-in-out infinite',
        'streak-fade-fast': 'streak-fade 1.5s ease-in-out infinite',
        'mascot-bob': 'mascot-bob 4s ease-in-out infinite',
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
  plugins: [caret, typography, buttons, buttonsV2, safeArea, containerQueries],
  corePlugins: {
    invert: false,
  },
  // eslint-disable-next-line
} satisfies Config;

import React from 'react';
import { Preview, ReactRenderer } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import '@dailydotdev/shared/src/styles/globals.css';
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize({
  onUnhandledRequest: 'warn',
});

/**
 * The product's own breakpoints, so the toolbar's device picker lands exactly
 * on the widths the Tailwind config switches at. Each pair brackets a boundary:
 * the "-" width is the last one before a breakpoint applies, which is where
 * layouts actually break.
 */
const viewports = {
  mobile: { name: 'Mobile (360)', styles: { width: '360px', height: '780px' } },
  mobileL: {
    name: 'mobileL (420)',
    styles: { width: '420px', height: '860px' },
  },
  mobileXL: {
    name: 'mobileXL (500)',
    styles: { width: '500px', height: '900px' },
  },
  tabletBelow: {
    name: 'tablet - (655)',
    styles: { width: '655px', height: '900px' },
  },
  tablet: { name: 'tablet (656)', styles: { width: '656px', height: '900px' } },
  laptopBelow: {
    name: 'laptop - (1019)',
    styles: { width: '1019px', height: '860px' },
  },
  laptop: {
    name: 'laptop (1020)',
    styles: { width: '1020px', height: '860px' },
  },
  laptopLBelow: {
    name: 'laptopL - (1359)',
    styles: { width: '1359px', height: '900px' },
  },
  laptopL: {
    name: 'laptopL (1360)',
    styles: { width: '1360px', height: '900px' },
  },
  laptopXL: {
    name: 'laptopXL (1668)',
    styles: { width: '1668px', height: '950px' },
  },
  desktop: {
    name: 'desktop (1976)',
    styles: { width: '1976px', height: '1000px' },
  },
};

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    viewport: { options: viewports },
    options: {
      storySort: {
        order: [
          'Tokens',
          'Atoms',
          'Components',
          'Pages',
          'Open Graph',
          'Experiments',
          'Extension',
        ],
      },
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  loaders: [mswLoader],
};

export default preview;

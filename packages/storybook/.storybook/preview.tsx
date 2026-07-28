import React from 'react';
import { Preview, ReactRenderer } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import '@dailydotdev/shared/src/styles/globals.css';
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize({
  onUnhandledRequest: 'warn',
});

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        /**
         * Components that branch on `useViewSize(ViewSize.Laptop)` read the
         * story iframe's width, and that iframe is the window minus the
         * sidebar and the addons panel — often under the 1020px laptop
         * breakpoint. A story that needs the desktop path has to pin its own
         * frame rather than hope the reviewer's panel layout is wide enough.
         */
        laptop: {
          name: 'Laptop (desktop path)',
          type: 'desktop',
          styles: { width: '1280px', height: '900px' },
        },
      },
    },
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

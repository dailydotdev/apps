import React from 'react';
import { Preview, ReactRenderer } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import '@dailydotdev/shared/src/styles/globals.css';
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize({
  onUnhandledRequest: 'warn',
});

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
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
          'Squad Page',
          [
            '1. Direction',
            '2. Use cases',
            [
              'Overview',
              'Viewers',
              'Posting',
              'Content source',
              'States',
              'Manage',
              'Breakpoints',
              'Production parity',
            ],
            '3. Verified badge',
            '4. Research',
            'Archive',
          ],
          'Verified Squads (parked)',
          [
            'Read me first',
            '1. Welcome pop-up',
            ['Spec', 'Pop-up', 'Manage page', 'Responsive'],
            '2. Audience insights',
            ['Spec', 'Manage analytics', 'Responsive'],
            '3. Jobs',
            ['Spec', 'Jobs tab', 'Role page', 'Manage page', 'Responsive'],
            '4. Member perks',
            ['Spec', 'Perks tab', 'Perk page', 'Manage page', 'Responsive'],
          ],
          'Squads Discover',
          [
            '1. Research & conclusions',
            '2. Layouts',
            '3. Details',
            '4. All states',
          ],
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

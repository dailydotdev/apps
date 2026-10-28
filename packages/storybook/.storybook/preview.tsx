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
          'History',
          [
            'Redesign',
            [
              '1. Overview',
              '2. Responsive',
              '3. States · laptop',
              '4. States · phone and tablet',
              '5. Flows',
              '6. Old and new navigation',
            ],
          ],
          'Landing Hero',
          [
            '0. Start here',
            ['Production today', 'Brief & recommendation'],
            '1. Signup conversion',
            ['All ten'],
            '2. Extension awareness',
            ['All ten'],
          ],
          'Hero Cover',
          [
            'Final',
            [
              '0. Decisions',
              '1. Home layout',
              '2. Rail behavior',
              '3. Widget gallery',
              '4. Widget library',
              '5. Widgets',
              [
                'Top story',
                'Weather',
                'Shortcuts',
                'Getting started',
                'To-do',
                'Happening now',
                'Notifications',
                'Messages',
                'Squad updates',
                'Reading list',
                'Topical digest',
                'Streak',
                'Presidential briefing',
                'Sponsored',
                'Tips',
              ],
            ],
            'Archive',
            [
              'First cover',
              'Widget exploration',
              [
                '0. Brief & research',
                '1. Sizes & catalog',
                '2. Directions',
                '3. Overflow',
                '4. Ads & promotion',
                '5. Playground',
                '6. Phone',
                '7. Your briefing',
                '8. Launch candidates',
              ],
              'Finals (V2 direction)',
              'Customize options',
              'Header options',
              'Promo film stage',
              'Not launching',
              'Tips exploration',
            ],
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

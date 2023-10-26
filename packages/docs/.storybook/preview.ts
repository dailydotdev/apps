import { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

import '@dailydotdev/shared/src/styles/globals.css';

export const parameters = {
  themes: {
    default: 'dark',
    list: [
      { name: 'light', class: 'light' },
      { name: 'dark', class: 'dark' }
    ],
  },
};

const preview: Preview = {
  parameters,
};

export default preview;

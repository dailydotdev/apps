import { Preview, ReactRenderer } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import '@dailydotdev/shared/src/styles/globals.css';

import { initialize, mswLoader } from 'msw-storybook-addon';

initialize();

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    nextjs: {
      appDirectory: false,
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
  // loaders: [mswLoader],
};

export default preview;

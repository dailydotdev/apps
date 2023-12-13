import { Preview, ReactRenderer } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';

import '@dailydotdev/shared/src/styles/globals.css';

const preview: Preview = {
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;

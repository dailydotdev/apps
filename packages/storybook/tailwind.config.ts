import type { Config } from 'tailwindcss'
import config from '@dailydotdev/shared/tailwind.config';

export default {
  ...config,
  content: [
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{ts,tsx}',
    // Stories that render webapp- or extension-only components need their
    // classes generated too, otherwise the preview silently drops whatever
    // shared happens not to use, and reviews a layout we never ship.
    '../webapp/components/**/*.{ts,tsx}',
    '../extension/src/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern: /^(.*?)/,
    },
  ]
} satisfies Config;

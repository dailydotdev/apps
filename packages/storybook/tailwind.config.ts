import type { Config } from 'tailwindcss'
import config from '@dailydotdev/shared/tailwind.config';

export default {
  ...config,
  content: [
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{ts,tsx}',
    // Stories import extension components directly (see stories/extension).
    // Without this, utilities used only there — anything with a breakpoint
    // variant especially — are silently never generated, and the story
    // renders a layout the app would not.
    '../extension/src/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern: /^(.*?)/,
    },
  ]
} satisfies Config;

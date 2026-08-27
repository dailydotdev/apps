import type { Config } from 'tailwindcss'
import config from '@dailydotdev/shared/tailwind.config';

export default {
  ...config,
  content: [
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{ts,tsx}',
    // Stories that render webapp-only components need their classes generated
    // too, otherwise the preview silently drops whatever shared never uses.
    '../webapp/components/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern: /^(.*?)/,
    },
  ]
} satisfies Config;

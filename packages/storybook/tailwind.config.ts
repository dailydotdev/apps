import type { Config } from 'tailwindcss'
import config from '@dailydotdev/shared/tailwind.config';

export default {
  ...config,
  content: [
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{ts,tsx}',
    // Without this, extension stories silently drop any utility the shared
    // package happens not to use, and review a layout we never ship.
    '../extension/src/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern: /^(.*?)/,
    },
  ]
} satisfies Config;

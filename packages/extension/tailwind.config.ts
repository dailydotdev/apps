import type { Config } from 'tailwindcss';
import config from '@dailydotdev/shared/tailwind.config';

module.exports = {
  ...config,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  // eslint-disable-next-line
} satisfies Config;

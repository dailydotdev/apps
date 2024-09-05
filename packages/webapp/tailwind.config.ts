import config from '@dailydotdev/shared/tailwind.config';
import * as fs from 'fs';
import path from 'path';
import type { Config } from 'tailwindcss';

export default {
  ...config,
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    path.join(
      fs.realpathSync('./node_modules/@dailydotdev/shared/src'),
      '**/*.{js,ts,jsx,tsx}',
    ),
  ],
  // eslint-disable-next-line
} satisfies Config;

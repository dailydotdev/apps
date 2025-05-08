// eslint-disable-next-line import/no-extraneous-dependencies
import { type Config } from 'tailwindcss';
import config from '@dailydotdev/shared/tailwind.config';
import path from 'path';
import * as fs from 'fs';

export default {
  ...config,
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    path.join(
      fs.realpathSync('./node_modules/@dailydotdev/shared/src'),
      '**/*.{js,ts,jsx,tsx}',
    ),
  ],
  // eslint-disable-next-line
} satisfies Config;

// eslint-disable-next-line import/no-extraneous-dependencies
import { type Config } from 'tailwindcss';
import config from '@dailydotdev/shared/tailwind.config';
import path from 'path';
import * as fs from 'fs';

const sharedSrcPath = fs.realpathSync('./node_modules/@dailydotdev/shared/src');

export default {
  ...config,
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    path.join(sharedSrcPath, '**/*.{js,ts,jsx,tsx}'),
    `!${path.join(sharedSrcPath, '**/*.spec.{js,ts,jsx,tsx}')}`,
    `!${path.join(sharedSrcPath, '**/*.test.{js,ts,jsx,tsx}')}`,
    `!${path.join(sharedSrcPath, '**/__tests__/**/*.{js,ts,jsx,tsx}')}`,
  ],
  // eslint-disable-next-line
} satisfies Config;

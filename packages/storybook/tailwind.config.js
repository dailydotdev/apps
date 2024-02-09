/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('@dailydotdev/shared/tailwind.config');

module.exports = {
  ...config,
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@dailydotdev/shared/src/**/*.{ts,tsx}',
  ],
  safelist: [
    'typo-mega1',
    'typo-giga2',
    'typo-giga1',
    'bg-background-default',
    'bg-background-subtle',
    'bg-background-popover',
    'bg-background-post-post',
    'bg-background-post-disabled',
    'bg-accent-burger-subtlest',
    'bg-accent-burger-subtler',
    'bg-accent-burger-subtle',
    'bg-accent-burger-default',
    'bg-accent-burger-bolder',
  ]
};

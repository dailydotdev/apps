import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import browser from '../mock/webextension-polyfill';
import * as path from 'node:path';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-designs',
    'msw-storybook-addon'
  ],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  staticDirs: ['../public'],
  async viteFinal(config, { configType }) {
    const GrowthBookMockPath = path.resolve(
      __dirname,
      '../mock/GrowthBookProvider.tsx',
    );

    return mergeConfig(config, {
      core: {
        disableTelemetry: true,
      },
      server: {
        fs: {
          strict: false,
        },
      },
      resolve: {
        alias: {
          '@growthbook/growthbook': path.resolve(__dirname, '../mock/gb.ts'),
          'node-fetch': path.resolve(__dirname, '../mock/node-fetch.ts'),
          'webextension-polyfill': path.resolve(
            __dirname,
            '../mock/webextension-polyfill.ts',
          ),
          'next/router': path.resolve(__dirname, '../mock/next-router.ts'),
          './GrowthBookProvider': GrowthBookMockPath,
          '../../GrowthBookProvider': GrowthBookMockPath,
          '@dailydotdev/shared/src/lib/boot': path.resolve(
            __dirname,
            '../mock/boot.ts',
          ),
          '../lib/boot': path.resolve(__dirname, '../mock/boot.ts'),
          'next/navigation': path.resolve(__dirname, '../mock/next-router.ts'),
        },
      },
      define: {
        'process.env': {
          NEXT_PUBLIC_WEBAPP_URL: 'https://app.daily.dev',
        },
        browser,
      },
      plugins: [
        svgrPlugin({
          include: '**/*.svg',
          svgrOptions: {
            icon: true,
            svgo: true,
            plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
            replaceAttrValues: {
              '#fff': 'currentcolor',
              '#FFF': 'currentcolor',
              '#FFFFFF': 'currentcolor',
            },
            svgProps: {
              className: 'icon',
            },
          },
        }),
      ],
      env: {
        NEXT_PUBLIC_PADDLE_ENVIRONMENT: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
        NEXT_PUBLIC_PADDLE_TOKEN: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      },
    });
  },
};

export default config;

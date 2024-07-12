import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import browser from '../mock/webextension-polyfill';
import * as path from 'node:path';

const GrowthBookMockPath = path.resolve(
  __dirname,
  '../mock/GrowthBookProvider.tsx',
);

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-themes',
    '@storybook/addon-interactions',
    '@storybook/addon-designs',
    'msw-storybook-addon',
  ],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  staticDirs: ['../public'],
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
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
          '../../../../hooks': path.resolve(__dirname, '../mock/hooks.ts'),
        },
      },
      define: {
        'process.env': {},
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
    });
  },
};

export default config;

import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import browser from '../mock/webextension-polyfill';
import svgrPlugin from 'vite-plugin-svgr';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.@(md|mdx)',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      assetsInclude: ['**/*.mdx'],
      server: {
        fs: {
          strict: false,
        },
      },
      resolve: {
        alias: {
          '@growthbook/growthbook': 'mock/gb.ts',
          'node-fetch': 'mock/node-fetch.ts',
          'webextension-polyfill': 'mock/webextension-polyfill.ts',
        },
      },
      define: {
        'process.env': {},
        browser: browser,
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

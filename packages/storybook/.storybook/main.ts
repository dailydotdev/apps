import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import browser from '../mock/webextension-polyfill';

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
    '@storybook/addon-designs',
    '@storybook/addon-mdx-gfm'
  ],
  docs: {
    autodocs: 'tag',
  },
  framework: '@storybook/react-vite',

  async viteFinal(config) {
    return mergeConfig(config, {
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

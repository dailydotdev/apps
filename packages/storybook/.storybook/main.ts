import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';

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
    '@storybook/addon-designs'
  ],
  framework: '@storybook/react-vite',
  docs: {
    autodocs: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      server: {
        fs: {
          strict: false,
        },
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

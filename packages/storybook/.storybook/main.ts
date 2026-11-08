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
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-designs',
    'msw-storybook-addon',
  ],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // Webapp pages render in page layouts but have no docs. On a default
      // export with getLayout (404.tsx), docgen writes invalid code.
      exclude: ['**/**.stories.tsx', '**/webapp/pages/**'],
    },
  },
  staticDirs: [
    '../public',
    // Webapp-hosted assets that shared components load through `fromCDN`.
    { from: '../../webapp/public/app/assets', to: '/app/assets' },
  ],
  async viteFinal(config, { configType }) {
    const GrowthBookMockPath = path.resolve(
      __dirname,
      '../mock/GrowthBookProvider.tsx',
    );
    const ConditionalFeatureMockPath = path.resolve(
      __dirname,
      '../mock/hooks/useConditionalFeature.ts',
    );

    return mergeConfig(config, {
      core: {
        disableTelemetry: true,
      },
      server: {
        fs: {
          strict: false,
        },
        // Page layouts render production pages on live, logged-out data;
        // the API only answers its own origins, so the dev server asks it.
        proxy: {
          '/__daily-api': {
            target: 'https://api.daily.dev',
            changeOrigin: true,
            rewrite: (url: string) => url.replace(/^\/__daily-api/, ''),
          },
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
          '../GrowthBookProvider': GrowthBookMockPath,
          '../../GrowthBookProvider': GrowthBookMockPath,
          '../../../GrowthBookProvider': GrowthBookMockPath,
          '../components/GrowthBookProvider': GrowthBookMockPath,
          '../../components/GrowthBookProvider': GrowthBookMockPath,
          '../../../components/GrowthBookProvider': GrowthBookMockPath,
          './useConditionalFeature': ConditionalFeatureMockPath,
          '../useConditionalFeature': ConditionalFeatureMockPath,
          '../hooks/useConditionalFeature': ConditionalFeatureMockPath,
          '../../hooks/useConditionalFeature': ConditionalFeatureMockPath,
          '../../../hooks/useConditionalFeature': ConditionalFeatureMockPath,
          '../../../../hooks/useConditionalFeature': ConditionalFeatureMockPath,
          '@dailydotdev/shared/src/lib/boot': path.resolve(
            __dirname,
            '../mock/boot.ts',
          ),
          '../lib/boot': path.resolve(__dirname, '../mock/boot.ts'),
          'next/navigation': path.resolve(__dirname, '../mock/next-router.ts'),
          'next/dynamic': path.resolve(__dirname, '../mock/next-dynamic.tsx'),
          '../../../hooks/auth': path.resolve(
            __dirname,
            '../mock/hooks/useOnboardingActions.ts',
          ),
          '@dailydotdev/shared/src/hooks/useToastNotification': path.resolve(
            __dirname,
            '../mock/hooks/useToastNotification.ts',
          ),
          '@dailydotdev/shared/src/hooks/useActions': path.resolve(
            __dirname,
            '../mock/hooks/useActions.ts',
          ),
        },
      },
      define: {
        'process.env': {
          NEXT_PUBLIC_WEBAPP_URL: 'https://app.daily.dev',
          // Webapp pages build share-image URLs on it; MSW still answers
          // GraphQL by operation, whatever the URL.
          NEXT_PUBLIC_API_URL: 'https://api.daily.dev',
          // The webapp's offline chat, so messages can render; it stays
          // behind the direct_messages flag, which is off unless a story
          // pins it.
          NEXT_PUBLIC_CHAT_MOCK: 'true',
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
        NEXT_PUBLIC_PADDLE_ENVIRONMENT:
          process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
        NEXT_PUBLIC_PADDLE_TOKEN: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      },
    });
  },
};

export default config;

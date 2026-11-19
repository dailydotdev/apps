import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import browser from '../mock/webextension-polyfill';
import * as path from 'node:path';
import type { Plugin } from 'vite';

/*
 * Production modules a story set swaps for its own version, keyed by the
 * shared file they replace. Each override renders production's module
 * untouched until its story turns a flag on, so every other story keeps
 * production. The override itself still imports the real module.
 */
const productionOverrides: Record<string, string> = {
  'shared/src/components/streak/popup/StreakMonthCalendar.tsx': path.resolve(
    __dirname,
    '../stories/streak/production/StreakMonthCalendar.tsx',
  ),
  'shared/src/components/streak/popup/DayStreak.tsx': path.resolve(
    __dirname,
    '../stories/streak/production/DayStreak.tsx',
  ),
};

const productionOverridesPlugin = (): Plugin => ({
  name: 'storybook-production-overrides',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    const overrideFiles = Object.values(productionOverrides);
    if (
      !importer ||
      overrideFiles.includes(importer.split('?')[0]) ||
      !/(StreakMonthCalendar|DayStreak)$/.test(source)
    ) {
      return null;
    }
    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    });
    const id = resolved?.id.split('?')[0];
    const key = Object.keys(productionOverrides).find((file) =>
      id?.endsWith(file),
    );
    return key ? productionOverrides[key] : null;
  },
});

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
        },
        browser,
      },
      plugins: [
        productionOverridesPlugin(),
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

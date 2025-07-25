import withSerwistInit from '@serwist/next';
// eslint-disable-next-line import/no-extraneous-dependencies
import withBundleAnalyzerInit from '@next/bundle-analyzer';
import { readFileSync } from 'fs';
import type { NextConfig } from 'next';
import type { Rewrite } from 'next/dist/lib/load-custom-routes';

const { version } = JSON.parse(
  readFileSync('../extension/package.json', 'utf8'),
);

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
];

const withSerwist = withSerwistInit({
  swSrc: './sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  exclude: [/syntax/i],
  register: false,
  maximumFileSizeToCacheInBytes: 1024 * 1024,
});

const nextConfig: NextConfig = {
  transpilePackages: ['@dailydotdev/shared'],
  ...withSerwist({
    ...withBundleAnalyzer({
      i18n: {
        locales: ['en'],
        defaultLocale: 'en',
      },
      compiler: {
        reactRemoveProperties: { properties: ['^data-testid$'] },
      },
      webpack: (config) => {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) =>
          rule.test?.test?.('.svg'),
        );

        config.module.rules.push(
          // Reapply the existing rule, but only for svg imports ending in ?url
          {
            ...fileLoaderRule,
            test: /\.svg$/i,
            resourceQuery: /url/, // *.svg?url
          },
          // Convert all other *.svg imports to React components
          {
            test: /\.svg$/i,
            issuer: fileLoaderRule.issuer,
            resourceQuery: {
              not: [...fileLoaderRule.resourceQuery.not, /url/],
            }, // exclude if *.svg?url
            use: [
              {
                loader: '@svgr/webpack',
                options: {
                  icon: true,
                  svgo: true,
                  replaceAttrValues: {
                    '#fff': 'currentcolor',
                    '#FFF': 'currentcolor',
                    '#FFFFFF': 'currentcolor',
                  },
                  svgProps: {
                    className: 'icon',
                  },
                },
              },
            ],
          },
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;
        config.module.rules.push({
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        });

        // we don't need cross-fetch in our bundle since we are using the native fetch
        // cross-fetch is here due to graphql-request dependency
        // it was removedi n graphql-request@7.x but due to a lot of breaking changes
        // for now we apply https://github.com/graffle-js/graffle/pull/296
        // as patch graphql-request manually through pnpm
        // eslint-disable-next-line no-param-reassign
        config.resolve.alias['cross-fetch'] = false;

        return config;
      },
      env: {
        CURRENT_VERSION: version,
      },
      assetPrefix: process.env.NEXT_PUBLIC_CDN_ASSET_PREFIX,
      rewrites: async () => {
        const rewrites: Rewrite[] = [
          {
            source: '/api/sitemaps/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/sitemaps/:path*`,
          },
          {
            source: '/search',
            destination: '/search/posts',
          },
          {
            source: '/posts/:id',
            destination: '/posts/:id/share',
            has: [
              {
                type: 'query',
                key: 'userid',
              },
            ],
          },
        ];

        // to support GitPod environment and avoid CORS issues, we need to proxy the API requests
        if (process.env.NEXT_PUBLIC_DOMAIN === 'localhost') {
          rewrites.unshift({
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
          });
        }

        return {
          beforeFiles: [
            {
              source: '/.well-known/security.txt',
              destination: '/api/files/security',
            },
            {
              source: '/plus',
              destination: '/plus/gift',
              has: [
                {
                  type: 'query',
                  key: 'gift',
                },
              ],
            },
          ],
          // regular rewrites
          afterFiles: rewrites,
          fallback: [],
        };
      },
      redirects: async () => {
        const oldPublicAssets = [
          'dailydev.svg',
          'google.svg',
          'maskable_icon.png',
          'mstile-150x150.png',
        ];

        return [
          ...oldPublicAssets.map((asset) => ({
            source: `/${asset}`,
            destination: `${
              process.env.NEXT_PUBLIC_CDN_ASSET_PREFIX || ''
            }/assets/${asset}`,
            permanent: true,
          })),
          {
            source: '/posts/finder',
            destination: '/search?provider=posts',
            permanent: false,
          },
          {
            source: '/signup',
            destination: '/onboarding',
            permanent: false,
          },
          // so we can't access /share route directly
          {
            source: '/posts/:id/share',
            destination: '/posts/:id',
            permanent: false,
          },
          // so we can't access /plus/gift route directly
          {
            source: '/plus/gift',
            destination: '/plus',
            permanent: false,
          },
          // well-known redirect for change password
          {
            source: '/.well-known/change-password',
            destination: '/settings/security',
            permanent: false,
          },
          {
            source: '/devcard',
            destination: '/settings/customization/devcard',
            permanent: true,
          },
          {
            source: '/account/:path*',
            destination: '/settings/:path*',
            permanent: true,
          },
          {
            source: '/sources/briefing',
            destination: '/briefing',
            permanent: false,
          },
        ];
      },
      headers: async () => {
        return [
          {
            source: '/:path*',
            headers: [
              ...securityHeaders,
              {
                key: 'X-Recruiting',
                value:
                  'We are hiring! Check https://daily.dev/careers for more info!',
              },
            ],
          },
          {
            source: '/.well-known/apple-app-site-association',
            headers: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Cache-Control', value: 'no-cache' },
            ],
          },
        ];
      },
      poweredByHeader: false,
      reactStrictMode: false,
      productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',
    }),
  }),
};

export default nextConfig;

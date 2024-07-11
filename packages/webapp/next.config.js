/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules')(['@dailydotdev/shared']);
const { version } = require('../extension/package.json');
const runtimeCaching = require('./cache');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
]

module.exports = withTM(
  withPWA({
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
      runtimeCaching,
      buildExcludes: [/react-syntax-highlighter|reactSyntaxHighlighter/]
    },
    ...withBundleAnalyzer({
      i18n: {
        locales: ['en'],
        defaultLocale: 'en',
      },
      compiler: {
        reactRemoveProperties: { properties: ['^data-testid$'] },
      },
      webpack5: true,
      webpack: (config, { dev, isServer }) => {
        config.module.rules.push({
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
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
        });
        config.module.rules.push({
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        });

        return config;
      },
      env: {
        CURRENT_VERSION: version,
      },
      rewrites: () => [
        {
          source: '/search',
          destination: '/search/:provider',
          has: [
            {
              type: 'query',
              key: 'provider'
            }
          ]
        },
        {
          source: '/search',
          destination: '/search/posts'
        }
      ],
      redirects: () => {
        return [
          {
            source: '/posts/finder',
            destination: '/search?provider=posts',
            permanent: false
          },
          {
            source: '/signup',
            destination: '/onboarding',
            permanent: false
          }
        ]
      },
      headers: async () => {
        return [
          {
            source: '/:path*',
            headers: [
              ...securityHeaders,
              {
                key: 'X-Recruiting',
                value: 'We are hiring! Check https://daily.dev/careers for more info!'
              },
            ]
          }
        ]
      },
      poweredByHeader: false,
      reactStrictMode: false,
      productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',
    }),
  }),
);

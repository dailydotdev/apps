/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require('next-pwa');
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

module.exports = {
  transpilePackages: ['@dailydotdev/shared'],
  ...withPWA({
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
      webpack: (config, { dev, isServer }) => {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) =>
          rule.test?.test?.('.svg'),
        )

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
            resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
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
        )

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i
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
      rewrites: () => {
        const rewrites = [
          {
            source: '/api/sitemaps/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/sitemaps/:path*`,
          },
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
        ];

        // to support GitPod environment and avoid CORS issues, we need to proxy the API requests
        if (process.env.NEXT_PUBLIC_DOMAIN === 'localhost') {
          rewrites.unshift({
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
          });
        }

        return rewrites;
      },
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
  })
};

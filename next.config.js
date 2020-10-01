module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /icons\/.*\.svg$/,
      exclude: /node_modules/,
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
              '#ffffff': 'currentcolor',
            },
            svgProps: {
              className: 'icon',
            },
          },
        },
      ],
    });

    return config;
  },

  rewrites: () => [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
    },
  ],

  poweredByHeader: false,
  reactStrictMode: false,
};

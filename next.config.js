module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
            svgo: true,
            replaceAttrValues: {
              '#fff': 'currentcolor',
              '#FFF': 'currentcolor',
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
};

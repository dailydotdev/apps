const config = {
  stories: ["../stories/*.stories.tsx", "../stories/**/*.stories.tsx"],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  core: {},

  docs: {
    autodocs: true
  }
};

export default config;

// Serves storybook-static with the dev server's API proxy. The page layouts'
// production frames load several times faster bundled than through the dev
// server, which hands each frame thousands of modules.
export default {
  build: { outDir: 'storybook-static' },
  preview: {
    port: 6007,
    proxy: {
      '/__daily-api': {
        target: 'https://api.daily.dev',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/__daily-api/, ''),
      },
    },
  },
};

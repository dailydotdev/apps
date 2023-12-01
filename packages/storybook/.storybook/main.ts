import type { StorybookConfig } from "@storybook/react-vite";
import type { InlineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-themes",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {},
  docs: {
    autodocs: true,
  },
  async viteFinal(config, options): Promise<InlineConfig> {
    return {
      ...config,
      plugins: [
        ...(config?.plugins ?? []),
        svgrPlugin({
          svgrOptions: {
            icon: true,
            svgo: true,
            replaceAttrValues: {
              "#fff": "currentcolor",
              "#FFF": "currentcolor",
              "#FFFFFF": "currentcolor",
            },
            svgProps: {
              className: "icon",
            },
          },
        }),
      ],
    };
  },
};
export default config;

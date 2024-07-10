import type { Meta, StoryObj } from "@storybook/react";
import { Pill, PillSize } from '@dailydotdev/shared/src/components/Pill';


const meta: Meta<typeof Pill> = {
  title: "Atoms/Pill",
  component: Pill,
  argTypes: {
    label: {
      control: { type: "text" },
    },
    size: {
      control: { type: "radio" },
      options: PillSize,
    }
  },
};

export default meta;

type Story = StoryObj<typeof Pill>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => (
    <Pill
      {...props}
    >
      Hello
    </Pill>
  ),
  name: "Pill",
  args: {
    label: "Hello World",
  },
};

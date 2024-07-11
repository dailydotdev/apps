import type { Meta, StoryObj } from "@storybook/react";
import { TimeFormatType } from '@dailydotdev/shared/src/lib/dateFormat';
import { DateFormat } from '@dailydotdev/shared/src/components/utilities';

const meta: Meta<typeof DateFormat> = {
  title: "Atoms/Date Format",
  component: DateFormat,
  argTypes: {
    date: {
      control: {
        type: "date",
      },
    },
    type: {
      control: {
        type: "select",
        options: Object.values(TimeFormatType),
      },
    },
    className: {
      control: {
        type: "text",
      },
    },
    prefix: {
      control: {
        type: "text",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DateFormat>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => (
    <DateFormat
      {...props}
    />
  ),
  name: "Date Format",
  args: {
    date: "2021-08-01T00:00:00Z",
    type: TimeFormatType.Post
  },
};

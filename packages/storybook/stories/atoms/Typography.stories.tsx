import type { Meta, StoryObj } from "@storybook/react";
import {
  Typography, TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import React from 'react';

const meta: Meta<typeof Typography> = {
  title: "Atoms/Typography",
  component: Typography,
  argTypes: {
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

type Story = StoryObj<typeof Typography>;

export const All: Story = {
  render: () => {
    return (
      <table>
        <tbody>
        <tr className="border">
          <th className="border text-left p-4 w-1/6">Classname</th>
          <th className="text-left p-4">Example</th>
        </tr>
        {Object.values(TypographyType).map((type) => (
          <tr className="border">
            <td className="border w-1/6 p-4">{type}</td>
            <td className='p-4'><Typography className={type}>The quick brown fox jumps over the lazy dog.</Typography></td>
          </tr>
        ))}
        </tbody>
      </table>
    )
  },

  name: 'All',
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => (
    <Typography
      {...props}
    >Hello world</Typography>
  ),
  name: "Typography",
  args: {
  },
};

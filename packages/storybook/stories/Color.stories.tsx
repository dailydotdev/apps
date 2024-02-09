import React from 'react';
import type { Meta } from '@storybook/react';
import { StoryObj } from '@storybook/react';

const colors = [
  'bg-background-default',
  'bg-background-subtle',
  'bg-background-popover',
  'bg-background-post-post',
  'bg-background-post-disabled',
  'bg-accent-burger-subtlest',
  'bg-accent-burger-subtler',
  'bg-accent-burger-subtle',
  'bg-accent-burger-default',
  'bg-accent-burger-bolder',
]

const meta: Meta = {
  title: 'Color',
  args: {
    className: 'bg-white'
  },
  argTypes: {
    className: { control: "select", options: colors, description: 'Color classnames' },
  },
};

export default meta;

type Story = StoryObj<typeof HTMLDivElement>;

export const Interactive: Story = {
  render: ({ ...props}) => {
    return <div {...props}>{props.className}</div>
  },
  name: 'Interactive',
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/C7n8EiXBwV1sYIEHkQHS8R/daily.dev---Design-System?type=design&node-id=450-2&mode=dev",
    },
  }
}

export const All: Story = {
  render: () => {
    return (
      <div className='grid gap-2'>
        {colors.map((color) => (
          <div key={color} className={`${color} p-4 rounded`}>
            {color}
          </div>
        ))}
      </div>
    )
  },
  args: {
    className: null
  },
  name: 'All',
}

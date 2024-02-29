import React from 'react';
import type { Meta } from '@storybook/react';
import { StoryObj } from '@storybook/react';

import config from '../tailwind.config';
const {theme: {colors}} = config;

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

const RenderColor = ({ color, prefix, value }) => {
  if (typeof color === 'string') return <div
    className={`w-24 h-24 ${prefix}${value}`}>{prefix + value}</div>
  return (
    <>
    <h1 className='col-span-3'>{prefix + value}</h1>
  {Object.keys(color).map((s) => {
    return <RenderColor key={s} color={color[s]} value={s} prefix={prefix+value+'-'} />
  })}
    </>
  );
}

export const All: Story = {
  render: () => {
    return (
      <div className='grid grid-cols-3 grid-auto-flow-column gap-2'>
        {Object.keys(colors).map((color) => (
          <RenderColor key={color} color={colors[color]} value={color} prefix='bg-' />
        ))}
      </div>
    )
  },
  args: {
    className: null
  },
  name: 'All',
}

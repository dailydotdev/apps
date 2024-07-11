import React from 'react';
import type { Meta } from '@storybook/react';
import { StoryObj } from '@storybook/react';

import config from '../../tailwind.config';

const {
  theme: { colors },
} = config;
// Raw colors are not meant to be used for styling
delete colors.raw;
// Current theme colors, here for legacy reasons
delete colors.theme;
// Current overlay colors, here for legacy reasons
const { base, dark } = colors.overlay;
colors.overlay = { base, dark };

const flattenColorArr = (data: any, prefix: string): string[] => {
  return Object.keys(data).reduce((acc: string[], el) => {
    const item = data[el];
    if (typeof item === 'string') {
      acc.push(prefix + el);
      return acc;
    }
    return acc.concat(flattenColorArr(item, prefix + el + '-'));
  }, []);
};
const flatColorArr = flattenColorArr(colors, 'bg-');

const meta: Meta = {
  title: 'Tokens/Color',
  args: {
    className: 'bg-white',
  },
  argTypes: {
    className: {
      control: 'select',
      options: flatColorArr,
      description: 'Color classnames',
    },
  },
};

export default meta;

type Story = StoryObj<typeof HTMLDivElement>;

export const Interactive: Story = {
  render: ({ ...props }) => {
    return <div {...props}>{props.className}</div>;
  },
  name: 'Interactive',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/C7n8EiXBwV1sYIEHkQHS8R/daily.dev---Design-System?type=design&node-id=450-2&mode=dev',
    },
  },
};

const RenderColor = ({
  color,
  prefix,
  value,
}: {
  color: any;
  prefix: string;
  value: string;
}) => {
  if (typeof color === 'string')
    return (
      <div
        className={`flex items-center justify-center w-full h-24 ${prefix}${value}`}
      >
        {prefix + value}
      </div>
    );

  if (Object.values(color).every((ss) => typeof ss === 'string')) {
    return (
      <div>
        <h1 className="typo-title3 font-bold">{prefix + value}</h1>
        {Object.keys(color).map((s) => {
          return (
            <RenderColor
              key={s}
              color={color[s]}
              value={s}
              prefix={prefix + value + '-'}
            />
          );
        })}
      </div>
    );
  }

  return (
    <>
      <h1 className="col-span-3 typo-title3 font-bold">{prefix + value}</h1>
      {Object.keys(color).map((s) => {
        return (
          <RenderColor
            key={s}
            color={color[s]}
            value={s}
            prefix={prefix + value + '-'}
          />
        );
      })}
      <div className="col-span-3" />
    </>
  );
};

export const All: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-3 grid-auto-flow-column gap-2">
        {Object.keys(colors).map((color) => (
          <RenderColor
            key={color}
            color={colors[color]}
            value={color}
            prefix="bg-"
          />
        ))}
      </div>
    );
  },
  args: {
    className: null,
  },
  name: 'All',
};

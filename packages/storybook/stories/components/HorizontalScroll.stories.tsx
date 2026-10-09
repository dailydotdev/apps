import type { Meta, StoryObj } from '@storybook/react-vite';
import HorizontalScroll from '@dailydotdev/shared/src/components/HorizontalScroll/HorizontalScroll';
import React, { ReactElement } from 'react';

const ScrollableElement = ({
  item,
  index,
  ...props
}: {
  item: { value: string };
  index: number;
}): ReactElement => (
  <div {...props} className="w-full max-w-40 border p-4">
    {item.value} <br />
    {index}
  </div>
);

const meta: Meta<typeof HorizontalScroll> = {
  title: 'Components/HorizontalScroll',
  component: HorizontalScroll,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    scrollProps: {
      control: { type: 'object' },
      description: 'Additional props to be passed to the scroll container',
    },
  },
};

export default meta;

type Story = StoryObj<typeof HorizontalScroll>;

export const HorizontalScrollStory: Story = {
  render: ({ scrollProps, ...props }) => {
    return (
      <HorizontalScroll
        scrollProps={scrollProps}
        className={{ scroll: 'gap-4' }}
      >
        {new Array(30).fill({ value: 'this is an item' }).map((item, i) => (
          /* eslint-disable react/no-array-index-key */
          <ScrollableElement
            {...props}
            item={item}
            index={i}
            key={`horizontal scroll item ${i}`}
          />
        ))}
      </HorizontalScroll>
    );
  },
  name: 'HorizontalScroll',
  args: { scrollProps: { title: { copy: 'Horizontal Scroll' } } },
};

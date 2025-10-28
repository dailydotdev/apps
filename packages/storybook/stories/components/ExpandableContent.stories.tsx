import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ExpandableContent } from '@dailydotdev/shared/src/components/ExpandableContent';

const meta: Meta<typeof ExpandableContent> = {
  title: 'Components/ExpandableContent',
  component: ExpandableContent,
  tags: ['autodocs'],
  argTypes: {
    maxHeight: {
      control: { type: 'number', min: 100, max: 800, step: 10 },
      description: 'Maximum height in pixels before showing "See More" button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ExpandableContent>;

const ContentWithImages = () => (
  <div>
    <h2 className="mb-4 text-2xl font-bold">Content with Images</h2>
    <p className="mb-4">
      This content includes images that should be properly handled by the
      component's height detection.
    </p>
    <img
      src="https://picsum.photos/400/300"
      alt="Random placeholder"
      className="mb-4 w-full rounded-lg"
    />
    <p className="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. The image above
      should be included in the height calculation to properly show or hide the
      "See More" button.
    </p>
    <img
      src="https://picsum.photos/400/200"
      alt="Another placeholder"
      className="mb-4 w-full rounded-lg"
    />
    <p className="mb-4">
      More content below the second image to ensure the total height exceeds the
      maximum and triggers the expandable behavior.
    </p>
  </div>
);

export const WithImages: Story = {
  args: {
    maxHeight: 320,
  },
  render: (args) => (
    <ExpandableContent {...args}>
      <ContentWithImages />
    </ExpandableContent>
  ),
};
